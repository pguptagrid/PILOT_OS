/**
 * WebSocket client — /ws/events + /ws/audio.
 * FSE-B owns this.
 */

//r esponsible to maintaining 2 websockets with the backend 
import type { WSEvent, WSEventType } from "../../contracts/ws_events";
// event websocket 
// audio web socket. // streams raw PCM audio from the microphone. 


//           ┌─────────────────────┐
//           │   Browser Frontend  │
//           └──────────┬──────────┘
//                      │
//          ┌───────────┴───────────┐
//          │                       │
//          ▼                       ▼

// /ws/events                /ws/audio
// JSON Messages             PCM Audio

//          ▼                       ▼

//   Backend Agent       Speech Recognition

type Handlers = Partial<Record<WSEventType, (payload: unknown) => void>>;
// web socket manager.
export class PilotWSClient {
  private eventsWs: WebSocket | null = null;  // handles JSON data. 
  private audioWs: WebSocket | null = null;// handles only microphone audio.
  private _closed = false;  // prevent autoreconnect after user intentionally disconnects. 

  constructor(
    private sessionId: string,
    private token: string,
    private handlers: Handlers & { onOpen?: () => void }
  ) { }

  connectEvents() {
    if (this._closed) return;
    const proto = location.protocol === "https:" ? "wss" : "ws";
    this.eventsWs = new WebSocket(
      `${proto}://${location.host}/ws/events/${this.sessionId}?token=${this.token}`
    );
    //Runs when connection succeeds.
    this.eventsWs.onopen = () => {
      console.log(`[PILOT] events WS open — session ${this.sessionId.slice(0, 8)}`);
      if (this.handlers.onOpen)
        this.handlers.onOpen();
    };
    // Runs whenever the server sends a JSON message.
    this.eventsWs.onmessage = (e) => {
      try {
        const msg: WSEvent = JSON.parse(e.data);
        //just to keep the connection alive.
        if (msg.type !== "ping") {
          console.log(`[PILOT] WS event: ${msg.type}`, msg.payload);
          //handlers = {
          //transcript: updateTranscript,
          //tool_result: showToolOutput
          //}
          //           {
          //            "type":"transcript",
          //            "payload":{"text":"hello"}
          // }
          //           {
          //    "type": "tool_result",
          //    "payload": {
          //      "success": true,
          //      "observation": {
          //        "email_draft": [
          //          {
          //            "role": "recipient",
          //            "email": "[EMAIL_ADDRESS]"
          //          },
          //          {
          //            "role": "subject",
          //            "text": "Regarding Team Lunch"
          //          },
          //          {
          //            "role": "body",
          //            "text": "Hi all, the team lunch will be held tomorrow at 1 PM at 'The Golden Spoon'. Please confirm your attendance by replying to this email. Thanks!"
          //          }
          //        ]
          //      }
          //    }
          // }

          //{
          //   "type":"transcript",
          //   "payload":{"text":"hello"}
          // }

          // above becomes :
          //handlers["transcript"](payload);
          //updateTranscript(payload);

          (this.handlers as Record<string, (p: unknown) => void>)[msg.type]?.(msg.payload);
        }
      } catch { /* ignore parse errors */ }
    };
    this.eventsWs.onclose = () => {
      console.log(`[PILOT] events WS closed — session ${this.sessionId.slice(0, 8)}`);
      // Network drop
      //     ↓
      // Socket closes
      //     ↓
      // Wait 2 sec
      //     ↓
      // Reconnect
      if (!this._closed) setTimeout(() => this.connectEvents(), 2000);
    };
    this.eventsWs.onerror = (e) => {
      console.error(`[PILOT] events WS error — session ${this.sessionId.slice(0, 8)}`, e);
    };
  }

  connectAudio() {
    if (this._closed) return;
    const proto = location.protocol === "https:" ? "wss" : "ws";
    this.audioWs = new WebSocket(`${proto}://${location.host}/ws/audio/${this.sessionId}`);
    this.audioWs.onclose = () => {
      if (!this._closed) setTimeout(() => this.connectAudio(), 2000);
    };
  }

  sendAudio(pcm: ArrayBuffer) {
    if (this.audioWs?.readyState === WebSocket.OPEN) {
      this.audioWs.send(pcm);
    }
  }

  sendPayload(payload: object) {
    if (this.eventsWs?.readyState === WebSocket.OPEN) {
      this.eventsWs.send(JSON.stringify(payload));
    }
  }

  close() {
    this._closed = true;
    this.eventsWs?.close();
    this.audioWs?.close();
  }
}
