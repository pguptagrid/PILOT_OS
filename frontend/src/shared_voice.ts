/**
 * Globally Shared Microphone Client wrapper for PILOT.
 * Maintains a single, continuous microphone stream and audio event websocket
 * across page transitions (Dashboard, PPT Copilot, Customer Care).
 */


// main voice server manager.
import { useAppStore } from "./store/SessionStore";
import { PilotWSClient } from "./ws_client";
import { AudioCapture } from "./audio_capture";

//audiocapture : captures microphone audio
// pilotweclient : manages websockets.
// zustand store/ session store : global app state


// User speaks
//      │
//      ▼
// AudioCapture
//      │
//      ▼
// PilotWSClient (/ws/audio)
//      │
//      ▼
// Backend STT + Agent
//      │
//      ▼
// PilotWSClient (/ws/events)
//      │
//      ▼
// SharedVoiceService
//      │
//  ┌───┼───────────────────┐
//  │   │                   │
//  ▼   ▼                   ▼
// UI  Transcript       Tool Cards

//This service is created only once
// Dashboard
// Customer Care
// PPT Copilot

// all share the same microphone and websocket session.

class SharedVoiceService {
  private sessionId: string | null = null;  // stores backend session
  private wsClient: PilotWSClient | null = null; // web socket client
  private capture: AudioCapture | null = null; //audio capture data
  
  // Callbacks
  // instead of a single callback.
  // many components can subscribe. 
  // all receive updates at the same time. 
  private onLevelCallbacks: Set<(lvl: number) => void> = new Set();
  private onStatusCallbacks: Set<(status: string) => void> = new Set();
  private onTranscriptCallbacks: Set<(entry: any) => void> = new Set();
  private onSlideCallbacks: Set<(cmd: any) => void> = new Set();
  private onChatCallbacks: Set<(msg: any) => void> = new Set();
  private onProfileCallbacks: Set<(data: any) => void> = new Set();

  private isListening = false;
  private level = 0;
  private status = "Speak or type a command...";
  
  // Audio playback queue
  // audioQ: Stores TTS responses.
  //Response 1
  // Response 2
  // Response 3

  //Audio1 finishes
// ↓
// Audio2 starts
// ↓
// Audio3 starts
// no overlap.

  private audioQ: { buf: ArrayBuffer; mime: string }[] = [];
  private activeAudioSource: AudioBufferSourceNode | null = null;
  private activeAudioElement: HTMLAudioElement | null = null;
  private playing = false;
  private audioCtx: AudioContext | null = null;

  constructor() {
    // Unlock AudioContext on first user interaction
    const unlock = () => {
      
      if (!this.audioCtx) {
        this.audioCtx = new AudioContext();
        if (this.audioCtx.state === "suspended") this.audioCtx.resume();
      }
    };
    //Browsers block audio until user interaction
    window.addEventListener("click", unlock, { once: true });
    window.addEventListener("keydown", unlock, { once: true });
  }

  registerLevel(cb: (lvl: number) => void) {
    this.onLevelCallbacks.add(cb);
    cb(this.level);
    return () => this.onLevelCallbacks.delete(cb);
  }

  registerStatus(cb: (status: string) => void) {
    this.onStatusCallbacks.add(cb);
    cb(this.status);
    return () => this.onStatusCallbacks.delete(cb);
  }
//"Speak or type a command..."
//"Listening...":
//"Mic error: [error message]
//[Speaker Name]: [transcribed text snippet]...
//⚠ Low confidence (35%) — speak clearly
//Processing speech...
//"PILOT responding..."
//"Running [Tool Name]..."
//"PILOT speaking..."
//"Session ended"


  registerTranscript(cb: (entry: any) => void) {
    this.onTranscriptCallbacks.add(cb);
    return () => this.onTranscriptCallbacks.delete(cb);
  }

  registerSlide(cb: (cmd: any) => void) {
    this.onSlideCallbacks.add(cb);
    return () => this.onSlideCallbacks.delete(cb);
  }

  registerChat(cb: (msg: any) => void) {
    this.onChatCallbacks.add(cb);
    return () => this.onChatCallbacks.delete(cb);
  }

  registerProfile(cb: (data: any) => void) {
    this.onProfileCallbacks.add(cb);
    return () => this.onProfileCallbacks.delete(cb);
  }

  getListening() {
    return this.isListening;
  }

  getSessionId() {
    return this.sessionId;
  }

  sendPayload(payload: object) {
    if (this.wsClient) {
      this.wsClient.sendPayload(payload);
    }
  }


   

  private setStatus(status: string) {
    this.status = status;
    this.onStatusCallbacks.forEach(cb => cb(status));
  }

  private setLevel(lvl: number) {
    this.level = lvl;
    this.onLevelCallbacks.forEach(cb => cb(lvl));
  }

  ensureConnected() {
    if (this.wsClient) return;
    const store = useAppStore.getState();
    const token = store.token;
    if (!token) return;
    const user = store.user;
    
    // Generate a deterministic UUID from the user's email to avoid showing plain text email in URL
    const getDeterministicUUID = (email: string): string => {
      let hash = 0;
      for (let i = 0; i < email.length; i++) {
        hash = (hash << 5) - hash + email.charCodeAt(i);
        hash |= 0;
      }
      let hex = "";
      for (let i = 0; i < 8; i++) {
        const val = (hash ^ (i * 0x1f1f1f1f)) >>> 0;
        hex += val.toString(16).padStart(8, '0');
      }
      hex = hex.slice(0, 32);
      return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20, 32)}`;
    };

    const isChatPage = store.page === "chat";
    const chatSessionId = (isChatPage ? null : store.sessionId) || (user?.email ? getDeterministicUUID(user.email) : "guest_session_uuid");
    this.sessionId = chatSessionId;
    store.setSession(chatSessionId);
    
    this.wsClient = new PilotWSClient(chatSessionId, token, {
      onOpen: () => this.setStatus("Connected"),
      barge_in: () => {
        console.log("[PILOT] Barge-in event received. Stopping audio playback.");
        this.stopAudio();
      },
      transcript: (p: any) => {
        this.onTranscriptCallbacks.forEach(cb => cb(p));
        if (p.job_id) store.upsertToolCard({ job_id: p.job_id, status: "ok" });
        if (p.role === "user" && p.text) {
          const cleanText = p.text.toLowerCase().trim().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g,"");
          if (["stop", "cancel", "shut up", "be quiet", "stop speaking"].includes(cleanText)) {
            this.stopAudio();
          }
        }
      },
      tts_audio: (p: any) => {
        const ttsEnabled = localStorage.getItem("pilot_tts_enabled") !== "false";
        if (ttsEnabled && p.b64) this.enqueueB64Audio(p.b64, p.mime || "audio/mp3");
      },
      tool_start: (p: any) => {
        store.upsertToolCard({ ...p, status: "running" });
      },
      tool_end: (p: any) => {
        store.upsertToolCard({ ...p, status: "running" });
      },
      ppt_command: (p: any) => {
        this.onSlideCallbacks.forEach(cb => cb(p));
      },
      chat_message: (p: any) => {
        this.onChatCallbacks.forEach(cb => cb(p));
      },
      profile_updated: (p: any) => {
        this.onProfileCallbacks.forEach(cb => cb(p));
      }
    });
    this.wsClient.connectEvents();
  }

  // starts entire voice assistant.
  async start(usecase = "general") {
    // mic opened twice. avoids it. 
    if (this.isListening) return;

    // Close background chat connection if any
    if (this.wsClient) {
      this.wsClient.close();
      this.wsClient = null;
    }

    try {
      const store = useAppStore.getState();
      const token = store.token!;
      const r = await fetch("/api/v1/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({ usecase })
      });
      if (!r.ok) throw new Error(`Server returned ${r.status}`);
      const res = await r.json();
      if (!res.session_id) throw new Error("No session_id in response");
      
      this.sessionId = res.session_id;

      this.wsClient = new PilotWSClient(this.sessionId??"", token, {
        onOpen: () => {
          this.setStatus("Listening...");
          // Instantly synchronize any manually filled inputs to the backend session right after connection opens
          const currentPage = useAppStore.getState().page;
          console.log("[PILOT_DEBUG] onOpen fired, currentPage =", currentPage);
          if (currentPage === "email") {
            this.sendPayload({
              type: "typed_email_context",
              to: useAppStore.getState().typedEmailTo || "",
              subject: useAppStore.getState().typedEmailSubject || ""
            });
          } else if (currentPage === "care") {
            const origin = useAppStore.getState().typedFlightOrigin || "";
            const destination = useAppStore.getState().typedFlightDestination || "";
            const date = useAppStore.getState().typedFlightDate || "";
            console.log("[PILOT_DEBUG] Sending typed_flight_context:", { origin, destination, date });
            this.sendPayload({
              type: "typed_flight_context",
              origin,
              destination,
              date
            });
          }
        },
        barge_in: () => {
          console.log("[PILOT] Barge-in event received. Stopping audio playback.");
          this.stopAudio();
        },
        transcript: (p: any) => {
          //handler that updates the UI. 
          this.onTranscriptCallbacks.forEach(cb => cb(p));
          
          // Complete the tool card status ONLY when the final results print on screen
          if (p.job_id) {
            store.upsertToolCard({ job_id: p.job_id, status: "ok" });
          }

          // If the user said "stop" or "cancel", immediately stop playing speech audio locally
          if (p.role === "user" && p.text) {
            const cleanText = p.text.toLowerCase().trim().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g,"");
            if (["stop", "cancel", "shut up", "be quiet", "stop speaking"].includes(cleanText)) {
              this.stopAudio();
            }
          }

          const conf = p.confidence || 0;
          if (p.speaker === "PILOT") {
            this.setStatus("PILOT responded");
          } else if (conf < 0.4 && p.speaker !== "PILOT") {
            this.setStatus(`⚠ Low confidence (${Math.round(conf * 100)}%) — speak clearly`);
            const lowConfEntry = {
              text: `Please Speak clearly.`,
              speaker: "PILOT", role: "system", confidence: 1.0, timestamp: p.timestamp
            };
            this.onTranscriptCallbacks.forEach(cb => cb(lowConfEntry));
          } else if (p.speaker && p.speaker !== "spk-unknown") {
            this.setStatus(`${p.speaker}: ${p.text.substring(0, 55)}…`);
          }
        },
        tts_audio: (p: any) => {
          // Adds audio to playback queue only if voice responses are enabled in settings
          const ttsEnabled = localStorage.getItem("pilot_tts_enabled") !== "false";
          if (ttsEnabled && p.b64) this.enqueueB64Audio(p.b64, p.mime || "audio/mp3");
        },
        tool_start: (p: any) => {
          store.upsertToolCard({ ...p, status: "running" });
          this.setStatus(`Running ${p.tool}...`);
          const startEntry = {
            text: `⚙ Starting: ${p.tool}`, speaker: "PILOT", role: "PILOT",
            confidence: 1, timestamp: Date.now() / 1000
          };
          this.onTranscriptCallbacks.forEach(cb => cb(startEntry));
        },
        tool_end: (p: any) => {
          // Keep the status as "running" - do not set to complete/ok yet until transcript output prints on screen
          store.upsertToolCard({ ...p, status: "running" });
          const r = p.result;
          let msg = `✓ ${p.tool} complete`;
          if (r?.ticket_ref) msg = `✓ Ticket created: ${r.ticket_ref}`;
          if (r?.booking_ref) msg = `✓ Flight booked: ${r.booking_ref}`;
          if (r?.results?.length) msg = `✓ Found ${r.results.length} results`;
          const endEntry = {
            text: msg, speaker: "PILOT", role: "PILOT", confidence: 1, timestamp: Date.now() / 1000
          };
          this.onTranscriptCallbacks.forEach(cb => cb(endEntry));
        },
        job_queued: (p: any) => {
          store.addJob({ ...p, status: "pending" });
          // Register the queued/pending task immediately into the visual Tool Cards registry
          store.upsertToolCard({ job_id: p.job_id, tool: p.tool, status: "pending", speaker: p.requester });
        },
        confirm_prompt: (p: any) => store.setConfirm(p),
        route_decision: (p: any) => {
          if (p.action === "delegate") this.setStatus(`On it — ${p.tool}...`);
          if (p.action === "respond_now") this.setStatus("PILOT responding...");
        },
        session_state: (p: any) => {
          const labels: Record<string, string> = {
            IDLE: "Idle", LISTENING: "Listening...", PROCESSING: "Processing speech...",
            DELEGATING: "Running task...", SPEAKING: "PILOT speaking...",
            INTERRUPTED: "Interrupted", ENDED: "Session ended"
          };
          this.setStatus(labels[p.state] || p.state);
        },
        ppt_command: (p: any) => {
          window.dispatchEvent(new CustomEvent("ppt_command", { detail: p }));
          this.onSlideCallbacks.forEach(cb => cb(p));
        },
        chat_message: (p: any) => {
          this.onChatCallbacks.forEach(cb => cb(p));
        },
        profile_updated: (p: any) => {
          this.onProfileCallbacks.forEach(cb => cb(p));
        },
      });

      store.setSession(this.sessionId??"");
      store.setIsListeningGlobal(true);
      this.isListening = true;

      this.wsClient.connectEvents();
      this.wsClient.connectAudio();

      // Handshake handles context sync in onOpen now.

      this.capture = new AudioCapture(
        (buf) => this.wsClient?.sendAudio(buf),
        (lvl) => this.setLevel(lvl)
      );
      await this.capture.start();
      this.setStatus("Listening...");
    } catch (e: any) {
      this.setStatus("Mic error: " + e.message);
      this.stop();
    }
  }

  stop() {
    const store = useAppStore.getState();
    this.capture?.stop();
    this.capture = null;
    this.wsClient?.close();
    this.wsClient = null;
    this.isListening = false;
    store.setIsListeningGlobal(false);
    this.setStatus("Session ended");
    store.setSession("");
    this.sessionId = null;
  }

  toggle(usecase = "general") {
    if (this.isListening) this.stop(); else this.start(usecase);
  }

  private async playQueue() {
    // if the one task is already running or queue length is 0.
    if (this.playing || this.audioQ.length === 0) return;
    // set playing true and change status.
    this.playing = true;
    this.setStatus("PILOT speaking...");
    // plays all the audios in the queue.
    while (this.audioQ.length > 0) {
      const { buf, mime } = this.audioQ.shift()!;
      // new Promise(...) + await: This is a crucial design detail. It freezes the while loop until the audio clip finishes playing.
      try {
        if (!this.audioCtx) this.audioCtx = new AudioContext();
        if (this.audioCtx.state === "suspended") await this.audioCtx.resume();
        const decoded = await this.audioCtx.decodeAudioData(buf.slice(0));
        await new Promise<void>(res => {
          const src = this.audioCtx!.createBufferSource();
          src.buffer = decoded;
          src.connect(this.audioCtx!.destination);
          src.onended = () => {
            if (this.activeAudioSource === src) this.activeAudioSource = null;
            res();
          };
          this.activeAudioSource = src;
          src.start(0);
        });
      } catch {
        // fallback for Web Audio API issues or unusual formats
        await new Promise<void>(res => {
          const blob = new Blob([buf], { type: mime });
          const url = URL.createObjectURL(blob);
          const a = new Audio(url);
          a.onended = () => {
            URL.revokeObjectURL(url);
            if (this.activeAudioElement === a) this.activeAudioElement = null;
            res();
          };
          a.onerror = () => {
            URL.revokeObjectURL(url);
            if (this.activeAudioElement === a) this.activeAudioElement = null;
            res();
          };
          this.activeAudioElement = a;
          a.play().catch(() => res());
        });
      }
    }
    this.playing = false;
    this.setStatus("Listening...");
  }

  stopAudio() {
    this.audioQ = [];
    if (this.activeAudioSource) {
      try {
        this.activeAudioSource.stop();
      } catch (e) { /* ignore */ }
      this.activeAudioSource = null;
    }
    if (this.activeAudioElement) {
      try {
        this.activeAudioElement.pause();
      } catch (e) { /* ignore */ }
      this.activeAudioElement = null;
    }
    this.playing = false;
    this.setStatus("Listening...");
  }

  private enqueueB64Audio(b64: string, mime = "audio/mp3") {
    try {
      const binary = atob(b64); // Converts a base64-encoded string back into raw binary data.
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i); // Converts each character in the binary string to its byte value and stores it in a Uint8Array.
      this.audioQ.push({ buf: bytes.buffer, mime }); // Adds the audio data and its media  type to the queue.
      this.playQueue(); // Starts playing the audio queue.
    } catch (e) {
      console.error("audio decode error", e);
    }
  }
}

export const sharedVoiceService = new SharedVoiceService();
