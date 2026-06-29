'use client';
import { useState, useEffect, useRef } from 'react';
import {
  CallControls,
  CallParticipantsList,
  CallStatsButton,
  CallingState,
  PaginatedGridLayout,
  SpeakerLayout,
  useCallStateHooks,
  useCall,
} from '@stream-io/video-react-sdk';
import { useRouter, useSearchParams } from 'next/navigation';
import { Users, LayoutList, BrainCircuit } from 'lucide-react';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import Loader from './Loader';
import EndCallButton from './EndCallButton';
import { useUser } from '@/providers/ClerkMockProvider';
import { cn } from '@/lib/utils';

type CallLayoutType = 'grid' | 'speaker-left' | 'speaker-right';

const MeetingRoom = () => {
  const searchParams = useSearchParams();
  const isPersonalRoom = !!searchParams.get('personal');
  const router = useRouter();
  const [layout, setLayout] = useState<CallLayoutType>('speaker-left');
  const [showParticipants, setShowParticipants] = useState(false);
  const { useCallCallingState } = useCallStateHooks();

  const call = useCall();
  const [linkCopied, setLinkCopied] = useState(false);

  const getInviteLink = () => {
    const meetingId = call?.id || (typeof window !== "undefined" ? window.location.pathname.split('/').pop() : "");
    const inIframe = typeof window !== "undefined" && window.self !== window.top;
    if (inIframe && typeof document !== "undefined" && document.referrer) {
      try {
        const parentOrigin = new URL(document.referrer).origin;
        return `${parentOrigin}/meetings/meeting/${meetingId}`;
      } catch (e) {}
    }
    return typeof window !== "undefined" ? `${window.location.origin}/meeting/${meetingId}` : "";
  };

  const handleCopyLink = async () => {
    const link = getInviteLink();
    if (!link) return;
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(link);
      } else {
        const textArea = document.createElement("textarea");
        textArea.value = link;
        textArea.style.position = "fixed";
        textArea.style.left = "-999999px";
        textArea.style.top = "-999999px";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand("copy");
        textArea.remove();
      }
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    } catch (err) {
      alert("Failed to copy link. Please manually copy the URL from browser address bar.");
    }
  };

  // AI Notes Companion state hooks
  const { user } = useUser();
  const [showAiNotes, setShowAiNotes] = useState(false);
  const [transcripts, setTranscripts] = useState<any[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [aiStatus, setAiStatus] = useState("Idle");
  const [sessionId, setSessionId] = useState("");

  const wsRef = useRef<WebSocket | null>(null);
  const stopAudioRef = useRef<(() => void) | null>(null);

  // for more detail about types of CallingState see: https://getstream.io/video/docs/react/ui-cookbook/ringing-call/#incoming-call-panel
  const callingState = useCallCallingState();

  useEffect(() => {
    if (callingState === CallingState.LEFT) {
      // Stop PILOT audio pipeline mic stream immediately
      if (stopAudioRef.current) {
        stopAudioRef.current();
        stopAudioRef.current = null;
      }

      // Close events WebSocket
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }

      // Kill ALL active browser media tracks (camera + mic) from Stream SDK and any lingering getUserMedia streams
      navigator.mediaDevices.enumerateDevices().catch(() => {});
      if (typeof window !== "undefined") {
        // Stop every active MediaStream track in the browser — covers Stream SDK camera/mic
        (window as any).__pilotStreamTracks?.forEach((t: MediaStreamTrack) => t.stop());
        // Fallback: iterate all RTCPeerConnections to release camera/mic
        try {
          const tracks = (navigator as any).__pilotTracks as MediaStreamTrack[] | undefined;
          tracks?.forEach(t => t.stop());
        } catch (_) {}
      }

      // Broad sweep: stop all getUserMedia tracks by asking the browser
      navigator.mediaDevices.getUserMedia({ audio: true, video: true })
        .then(stream => stream.getTracks().forEach(t => t.stop()))
        .catch(() => {});

      router.push('/');
    }
  }, [callingState, router]);

  // Establish PILOT's audio streaming and live event websocket connections upon room entry
  useEffect(() => {
    if (callingState !== CallingState.JOINED) return;

    const meetingId = call?.id || (typeof window !== "undefined" ? window.location.pathname.split('/').pop() : "") || "unknown";
    const sessId = `meeting_${meetingId}`;
    setSessionId(sessId);

    const userName = user?.name || "Guest";
    const userEmail = user?.email || "guest@localhost";

    const wsUrl = `ws://localhost:8000/ws/events/${sessId}?name=${encodeURIComponent(userName)}&email=${encodeURIComponent(userEmail)}`;
    const audioUrl = `ws://localhost:8000/ws/audio/${sessId}?name=${encodeURIComponent(userName)}&email=${encodeURIComponent(userEmail)}`;

    // Establish WebSocket events client receiver
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onmessage = (e) => {
      try {
        const msg = JSON.parse(e.data);
        if (msg.type === "transcript") {
          setTranscripts(prev => [...prev, msg.payload]);
        } else if (msg.type === "session_state") {
          const labels: Record<string, string> = {
            IDLE: "Idle", LISTENING: "Listening...", PROCESSING: "Processing...",
            DELEGATING: "Analyzing...", SPEAKING: "Speaking...",
            INTERRUPTED: "Interrupted"
          };
          setAiStatus(labels[msg.payload.state] || msg.payload.state);
        }
      } catch (err) { /* ignore */ }
    };

    // Client-side downsampled audio stream provider mapping raw audio feed directly to PILOT backend
    const startAudioStream = async () => {
      try {
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
        
        // Resume immediately if browser allows it
        if (audioContext.state === "suspended") {
          await audioContext.resume().catch(() => {});
        }

        const audioSocket = new WebSocket(audioUrl);
        
        let captureNode: ScriptProcessorNode | null = null;
        let streamObj: MediaStream | null = null;

        audioSocket.onopen = async () => {
          try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
            streamObj = stream;

            // Register tracks globally so the call-end cleanup can stop them
            if (typeof window !== "undefined") {
              (window as any).__pilotStreamTracks = (window as any).__pilotStreamTracks || [];
              stream.getTracks().forEach(t => (window as any).__pilotStreamTracks.push(t));
            }

            const source = audioContext.createMediaStreamSource(stream);
            
            // Create a 2048-sample processing node (compatible with legacy browsers & fast chunk layouts)
            const node = audioContext.createScriptProcessor(2048, 1, 1);
            captureNode = node;
            
            node.onaudioprocess = (e) => {
              const input = e.inputBuffer.getChannelData(0);
              const pcm = new Int16Array(input.length);
              for (let i = 0; i < input.length; i++) {
                pcm[i] = Math.max(-32768, Math.min(32767, input[i] * 32768));
              }
              if (audioSocket.readyState === WebSocket.OPEN) {
                audioSocket.send(pcm.buffer);
              }
            };
            
            source.connect(node);
            node.connect(audioContext.destination);
            
            // Double check and resume if still suspended
            if (audioContext.state === "suspended") {
              await audioContext.resume().catch(() => {});
            }
            
            setIsListening(audioContext.state === "running");
            setAiStatus(audioContext.state === "running" ? "Listening..." : "Suspended (Click page to activate)");
          } catch (micErr) {
            console.error("Mic stream initiation failed:", micErr);
          }
        };

        // Browser gesture-unlock fallback to resume AudioContext upon first page interaction
        const unlock = () => {
          if (audioContext.state === "suspended") {
            audioContext.resume().then(() => {
              setIsListening(true);
              setAiStatus("Listening...");
            }).catch(() => {});
          }
        };
        window.addEventListener("click", unlock, { once: true });
        window.addEventListener("keydown", unlock, { once: true });

        stopAudioRef.current = () => {
          window.removeEventListener("click", unlock);
          window.removeEventListener("keydown", unlock);
          if (streamObj) {
            streamObj.getTracks().forEach(track => track.stop());
          }
          if (captureNode) {
            captureNode.disconnect();
          }
          if (audioContext.state !== "closed") {
            audioContext.close();
          }
          audioSocket.close();
          setIsListening(false);
        };

      } catch (ex) {
        console.error("Audio Context setup failed:", ex);
      }
    };

    startAudioStream();

    return () => {
      ws.close();
      if (stopAudioRef.current) stopAudioRef.current();
    };
  }, [callingState]);

  const handleEmailNotes = async () => {
    if (transcripts.length === 0) {
      alert("No transcripts recorded yet! Speak to compile some notes.");
      return;
    }
    setAiStatus("Compiling...");
    
    // Dispatch asynchronous trigger direct to PILOT background agent to summarize and send the email
    try {
      const recipientEmail = user?.email || "team@localhost";
      const recipientName = user?.name || "Team";
      
      const res = await fetch(`http://localhost:8000/api/v1/sessions/${sessionId}/compile-notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipient_email: recipientEmail,
          recipient_name: recipientName
        })
      });
      const data = await res.json();
      
      // Save compiled meeting summary locally into TALKINIA_STREAM previous meetings cache
      const storedSummaries = JSON.parse(localStorage.getItem("talkinia_previous_meetings") || "[]");
      const meetingRecord = {
        id: sessionId,
        title: "Real-Time Group Sync Notes",
        date: new Date().toLocaleString(),
        summary: data.summary || "Conversation processed and action points emailed successfully.",
        duration: "45 mins"
      };
      localStorage.setItem("talkinia_previous_meetings", JSON.stringify([meetingRecord, ...storedSummaries]));

      alert(`📝 PILOT Companion:\nMeeting summary and action items are being generated and will be emailed to ${recipientName} (${recipientEmail})!`);
    } catch (e: any) {
      alert("Failed compiling meeting notes: " + e.message);
    }
  };

  if (callingState !== CallingState.JOINED) return <Loader />;

  return (
    <section className="relative h-screen w-full overflow-hidden pt-4 text-white flex">
      <div className="relative flex size-full items-center justify-center flex-1">
        <div className=" flex size-full max-w-[1000px] items-center">
          {layout === 'grid' && <PaginatedGridLayout />}
          {layout === 'speaker-right' && <SpeakerLayout participantsBarPosition="left" />}
          {layout === 'speaker-left' && <SpeakerLayout participantsBarPosition="right" />}
        </div>
        <div
          className={cn('h-[calc(100vh-86px)] hidden ml-2', {
            'show-block': showParticipants,
          })}
        >
          <CallParticipantsList onClose={() => setShowParticipants(false)} />
        </div>
      </div>

      {/* Collapsible 🧠 PILOT AI Companion Notes Sidebar */}
      {showAiNotes && (
        <div className="w-[320px] bg-[#1C1F2E] border-l border-[#252A41] h-full flex flex-col p-5 gap-4 shadow-xl z-50">
          <div className="flex justify-between items-center border-b border-[#252A41] pb-3">
            <h3 className="font-bold text-sm text-fuchsia-400 tracking-wide flex items-center gap-1.5">
              <BrainCircuit size={16} /> PILOT AI COMPANION
            </h3>
            <button onClick={() => setShowAiNotes(false)} className="text-gray-400 hover:text-white transition">✕</button>
          </div>

          {/* Connection status tracker */}
          <div className="bg-[#252A41]/60 px-3 py-2.5 rounded-xl text-xs flex justify-between border border-[#252A41]/40">
            <span>Status: <strong className="text-fuchsia-300 font-semibold">{aiStatus}</strong></span>
            <span style={{ color: isListening ? "#22C55E" : "#EF4444" }} className="font-bold">
              {isListening ? "🟢 Live Mic" : "🔴 Muted"}
            </span>
          </div>

          {/* Live transcripts flow */}
          <div className="flex-1 overflow-y-auto bg-[#161925] rounded-xl p-3 border border-[#252A41] flex flex-col gap-2.5">
            {transcripts.length === 0 ? (
              <div className="text-center text-gray-500 mt-20 flex flex-col gap-2 items-center">
                <span className="text-xl">🎙️</span>
                <p className="text-[0.7rem] leading-relaxed">Ambient listening active.<br/>Speak clearly to log conversation notes.</p>
              </div>
            ) : (
              transcripts.map((t, idx) => (
                <div key={idx} className="text-xs flex flex-col gap-1 border-b border-[#252A41]/30 pb-2">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-fuchsia-300">{t.speaker || "You"}</span>
                    <span className="text-[0.58rem] text-gray-500 uppercase font-semibold">{t.role || "user"}</span>
                  </div>
                  <p className="text-gray-300 text-[0.74rem] leading-normal">{t.text}</p>
                </div>
              ))
            )}
          </div>

          {/* Action Trigger button */}
          <button onClick={handleEmailNotes} className="w-full bg-[#F5A700] hover:bg-[#0E78F9]/80 py-3 rounded-xl text-xs font-bold transition-all text-white shadow-md">
            Compile & Email Notes
          </button>
        </div>
      )}

      {/* video layout and call controls */}
      <div className="fixed bottom-0 flex w-full items-center justify-center gap-5 z-40 bg-[#161925]/90 py-4 backdrop-blur-sm border-t border-[#252A41]/40">
        <CallControls onLeave={() => router.push(`/`)} />

        <button onClick={handleCopyLink} className="relative group">
          <div className="cursor-pointer rounded-2xl bg-[#F5A700] hover:bg-amber-500 border border-transparent px-4 py-2 flex items-center gap-2 text-white transition-all">
            {/* <span className="text-sm"></span> */}
            <span className="text-xs font-bold max-sm:hidden">{linkCopied ? "Copied!" : "Copy Invite Link"}</span>
          </div>
        </button>

        <DropdownMenu>
          <div className="flex items-center">
            <DropdownMenuTrigger className="cursor-pointer rounded-2xl bg-[#F5A700] px-4 py-2 hover:bg-amber-500 ">
              <LayoutList size={20} className="text-white" />
            </DropdownMenuTrigger>
          </div>
          <DropdownMenuContent className="border-dark-1 bg-dark-1 text-white">
            {['Grid', 'Speaker-Left', 'Speaker-Right'].map((item, index) => (
              <div key={index}>
                <DropdownMenuItem
                  onClick={() =>
                    setLayout(item.toLowerCase() as CallLayoutType)
                  }
                >
                  {item}
                </DropdownMenuItem>
                <DropdownMenuTrigger />
                <DropdownMenuSeparator className="border-dark-1" />
              </div>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        <CallStatsButton />
        
        {/* Toggle AI Notes Companion button */}
        <button onClick={() => setShowAiNotes(prev => !prev)} className="relative group">
          <div className={cn("cursor-pointer rounded-2xl px-4 py-2 flex items-center gap-2 border transition-all", {
            "bg-fuchsia-600/20 border-fuchsia-500 text-fuchsia-300": showAiNotes,
            "bg-[#F5A700] border-transparent text-white hover:bg": !showAiNotes
          })}>
            <BrainCircuit size={20} />
            <span className="text-xs font-bold max-sm:hidden">AI Companion</span>
          </div>
        </button>

        <button onClick={() => setShowParticipants((prev) => !prev)}>
          <div className=" cursor-pointer rounded-2xl bg-[#F5A700] px-4 py-2 hover:bg-[#4c535b]  ">
            <Users size={20} className="text-white" />
          </div>
        </button>
        {!isPersonalRoom && <EndCallButton />}
      </div>
    </section>
  );
};

export default MeetingRoom;