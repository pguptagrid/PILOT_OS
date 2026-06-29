import React from "react";
import { PPTCopilotView } from "../PPTView";
import { useSession } from "./useSession";
import { isPptRelated } from "./helpers";
import { LiveTranscriptBar } from "./LiveTranscriptBar";

export function PPTPageView() {
  const sess = useSession();
  const pptTranscripts = sess.transcripts.filter(t => isPptRelated(t.text));

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", position: "relative", overflow: "hidden" }}>
      <PPTCopilotView
        sessionId={sess.sessionId}
        isListening={sess.isListening}
        agentStatus={sess.agentStatus}
        onToggleMic={() => sess.toggle("ppt")}
      />
      <LiveTranscriptBar
        transcripts={pptTranscripts} agentStatus={sess.agentStatus}
        isListening={sess.isListening} level={sess.level}
        onToggle={() => sess.toggle("ppt")}
      />
    </div>
  );
}
