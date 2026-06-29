import React from "react";
import { C } from "./helpers";

/* ── Waveform bars ── */
export function WaveBars({ active, level, count = 8, color = C.amber }:
  { active: boolean; level: number; count?: number; color?: string }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: "2px" }}>
      {Array.from({ length: count }, (_, i) => {
        const seed = (i / count) * Math.PI * 2;
        const h = active ? Math.max(3, Math.floor(level * (14 + Math.sin(seed + Date.now() / 300) * 8))) : 3;
        return <div key={i} style={{
          width: 3, borderRadius: 2, background: color,
          height: h, transition: "height 0.12s"
        }} />;
      })}
    </div>
  );
}

/* ── Live transcript bar ── */
export function LiveTranscriptBar({ transcripts, agentStatus, isListening, level, onToggle }:
  {
    transcripts: any[]; agentStatus: string; isListening: boolean;
    level: number; onToggle: () => void
  }) {
  const show = localStorage.getItem("pilot_show_transcript") !== "false";
  if (!show) return null;

  const last = transcripts[transcripts.length - 1];

  // Clean up and truncate extremely long status/draft transcripts for the bottom bar
  let displayWordText = last ? last.text : "";
  if (displayWordText && displayWordText.length > 120) {
    displayWordText = displayWordText.split("```")[0].trim();
    if (displayWordText.length > 120 || displayWordText === "") {
      displayWordText = last.text.slice(0, 110) + "... [Full content displayed in transcript section]";
    }
  }

  return (
    <div style={{
      position: "absolute", bottom: 0, left: 0, right: 0,
      background: "rgba(255,255,255,0.97)",
      borderTop: `1.5px solid ${C.border}`,
      backdropFilter: "blur(8px)",
      padding: "0.75rem 1.25rem",
      display: "flex", alignItems: "center", gap: "1rem",
      boxShadow: "0 -4px 20px rgba(0,0,0,0.06)",
      zIndex: 100
    }}>
      <button onClick={onToggle}
        style={{
          width: 44, height: 44, borderRadius: "50%", flexShrink: 0,
          background: isListening ? C.amber : "#F0EDE8", border: "none",
          fontSize: "1.1rem", cursor: "pointer",
          boxShadow: isListening ? `0 0 0 6px rgba(245,167,0,0.2)` : "none",
          transition: "all 0.2s"
        }}>
        🎤
      </button>
      <div style={{ flex: 1, minWidth: 0 }}>
        {last ? (
          <div style={{ animation: "fadeIn 0.3s ease" }}>
            <span style={{
              fontSize: "0.7rem", fontWeight: 700,
              color: last.role === "PILOT" ? C.amber : C.amberDark,
              marginRight: "0.4rem"
            }}>
              {last.speaker || "You"}:
            </span>
            <span style={{ fontSize: "0.88rem", color: C.text1 }}>{displayWordText}</span>
          </div>
        ) : (
          <span style={{ fontSize: "0.88rem", color: C.text3 }}>{agentStatus}</span>
        )}
      </div>
      {isListening && <WaveBars active={isListening} level={level} />}
      {agentStatus.includes("speaking") || agentStatus.includes("Responding") ? (
        <div style={{
          display: "flex", alignItems: "center", gap: "0.4rem",
          padding: "0.3rem 0.75rem", borderRadius: 20,
          background: C.amberBg, fontSize: "0.75rem",
          color: C.amberDark, fontWeight: 600, flexShrink: 0
        }}>
          <WaveBars active={true} level={0.6} count={5} color={C.amberDark} />
          PILOT speaking
        </div>
      ) : isListening ? (
        <div style={{
          display: "flex", alignItems: "center", gap: "0.35rem", flexShrink: 0,
          fontSize: "0.72rem", color: C.green, fontWeight: 600
        }}>
          <span style={{
            width: 7, height: 7, borderRadius: "50%", background: C.green,
            display: "inline-block", animation: "pulse 1.2s infinite"
          }} />
          Listening
        </div>
      ) : null}
    </div>
  );
}
