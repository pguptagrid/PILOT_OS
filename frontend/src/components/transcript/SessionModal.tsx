import React, { useState, useEffect } from "react";
import { C, renderTranscriptText } from "./helpers";

interface SessionHistoryModalProps {
  sessionId: string;
  onClose: () => void;
  token: string;
}

export function SessionHistoryModal({ sessionId, onClose, token }: SessionHistoryModalProps) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/v1/sessions/${sessionId}/history`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => r.json())
      .then(d => {
        setData(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [sessionId, token]);

  const ucIcon: Record<string, string> = { ppt: "🖥", customercare: "🎧", general: "⊞" };

  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)",
      display: "flex", alignItems: "center", justifyContent: "center", zIndex: 300
    }}
      onClick={onClose}>
      <div style={{
        background: "#fff", borderRadius: 16, padding: "1.5rem",
        width: 560, maxHeight: "80vh", display: "flex", flexDirection: "column",
        boxShadow: "0 12px 48px rgba(0,0,0,0.18)", overflow: "hidden"
      }}
        onClick={e => e.stopPropagation()}>
        
        {/* header */}
        <div style={{
          display: "flex", justifyContent: "space-between", alignItems: "center",
          marginBottom: "1rem"
        }}>
          <div>
            <div style={{ fontWeight: 800, fontSize: "1rem" }}>
              {ucIcon[data?.session?.usecase || "general"]} Session History
            </div>
            <div style={{ fontSize: "0.72rem", color: C.text3, marginTop: "0.1rem" }}>
              #{data?.session?.display_id || sessionId.slice(0, 8)} ·{" "}
              {data?.session?.usecase || "—"} ·{" "}
              <span style={{
                padding: "0.15rem 0.45rem", borderRadius: 4,
                background: data?.session?.state === "ENDED" ? "#F0FFF4" : C.amberBg,
                color: data?.session?.state === "ENDED" ? C.green : C.amberDark,
                fontSize: "0.68rem", fontWeight: 600
              }}>
                {data?.session?.state || "—"}
              </span>
            </div>
          </div>
          <button onClick={onClose}
            style={{ background: "none", border: "none", fontSize: "1.3rem", cursor: "pointer", color: C.text3 }}>
            ✕
          </button>
        </div>

        {loading ? (
          <div style={{ color: C.text3, fontSize: "0.85rem", textAlign: "center", padding: "2rem" }}>
            Loading…
          </div>
        ) : (
          <div style={{ overflowY: "auto", flex: 1 }}>
            {/* AI Session Summary Card */}
            {data?.session?.summary && (
              <div style={{ background: "#FDFBF7", border: `1px solid ${C.amber}`, borderRadius: 10, padding: "0.85rem", marginBottom: "1rem" }}>
                <div style={{ fontSize: "0.75rem", fontWeight: 800, color: C.amberDark, letterSpacing: "0.05em", marginBottom: "0.25rem" }}>
                  🎙 AI SUMMARY
                </div>
                <div style={{ fontSize: "0.8rem", color: C.text1, lineHeight: 1.5 }}>
                  {renderTranscriptText(data.session.summary)}
                </div>
                {data.session.bullets && (() => {
                  try {
                    const blist = JSON.parse(data.session.bullets);
                    if (blist && blist.length > 0) {
                      return (
                        <div style={{ marginTop: "0.6rem", borderTop: `1px dashed ${C.border}`, paddingTop: "0.5rem" }}>
                          <div style={{ fontSize: "0.7rem", fontWeight: 700, color: C.text2, marginBottom: "0.3rem" }}>Action Items:</div>
                          <ul style={{ margin: 0, paddingLeft: "1rem", fontSize: "0.78rem", color: C.text2, lineHeight: 1.45 }}>
                            {blist.map((b: string, idx: number) => (
                              <li key={idx}>{b}</li>
                            ))}
                          </ul>
                        </div>
                      );
                    }
                  } catch { /* ignore */ }
                  return null;
                })()}
              </div>
            )}

            {/* Actions summary */}
            {data?.actions?.length > 0 && (
              <div style={{ marginBottom: "1rem" }}>
                <div style={{
                  fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.08em",
                  color: C.text3, marginBottom: "0.5rem"
                }}>AGENT ACTIONS</div>
                {data.actions.map((a: any, i: number) => (
                  <div key={i} style={{
                    display: "flex", alignItems: "center", gap: "0.5rem",
                    padding: "0.35rem 0.6rem", borderRadius: 8,
                    background: "#F9F8F6", marginBottom: "0.25rem"
                  }}>
                    <span style={{
                      fontSize: "0.7rem", fontWeight: 600, color: C.amberDark,
                      minWidth: 110
                    }}>{a.tool}</span>
                    <span style={{
                      fontSize: "0.68rem", padding: "0.1rem 0.4rem", borderRadius: 4,
                      background: a.decision === "ok" || a.decision === "allowed" ? "#F0FFF4" : "#FFF5F5",
                      color: a.decision === "ok" || a.decision === "allowed" ? C.green : C.red
                    }}>
                      {a.decision}
                    </span>
                    {a.latency_ms && (
                      <span style={{ fontSize: "0.68rem", color: C.text3, marginLeft: "auto" }}>
                        {Math.round(a.latency_ms)}ms
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Transcript */}
            <div style={{
              fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.08em",
              color: C.text3, marginBottom: "0.5rem"
            }}>TRANSCRIPT</div>
            {data?.transcripts?.length === 0 && (
              <div style={{ color: C.text3, fontSize: "0.82rem" }}>No transcript recorded.</div>
            )}
            {(data?.transcripts || []).map((t: any, i: number) => {
              const isPilot = t.speaker === "PILOT" || t.role === "assistant";
              return (
                <div key={i} style={{
                  display: "flex", gap: "0.5rem", marginBottom: "0.55rem",
                  justifyContent: isPilot ? "flex-start" : "flex-end"
                }}>
                  <div style={{
                    maxWidth: "80%", padding: "0.5rem 0.75rem", borderRadius: 10,
                    background: isPilot ? C.amberBg : "#F0F4FF",
                    fontSize: "0.82rem", lineHeight: 1.5,
                    color: isPilot ? C.amberDark : C.text1,
                    border: `1px solid ${isPilot ? C.amber : "#C7D7FF"}`
                  }}>
                    <div style={{
                      fontSize: "0.62rem", fontWeight: 700, marginBottom: "0.15rem",
                      color: isPilot ? C.amberDark : C.blue
                    }}>
                      {t.speaker || "You"}
                    </div>
                    {renderTranscriptText(t.text)}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

interface SessionsListProps {
  token: string;
}

export function SessionsList({ token }: SessionsListProps) {
  const [sessions, setSessions] = useState<any[]>([]);
  const [selected, setSelected] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/v1/sessions/list", { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(d => setSessions(d.sessions || []))
      .catch(() => { });
  }, [token]);

  const ucIcon: Record<string, string> = { ppt: "🖥", customercare: "🎧", general: "⊞" };

  if (sessions.length === 0) return null;

  return (
    <>
      <div>
        <div style={{
          display: "flex", justifyContent: "space-between", alignItems: "center",
          marginBottom: "0.85rem"
        }}>
          <h2 style={{ fontSize: "1.1rem", fontWeight: 700, display: "flex", alignItems: "center", gap: "0.4rem" }}>
            <span>🕒</span> Recent sessions
          </h2>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "0.65rem" }}>
          {sessions.slice(0, 9).map(s => (
            <div key={s.session_id} onClick={() => setSelected(s.session_id)}
              style={{
                background: C.surface, borderRadius: 12, padding: "0.9rem",
                border: `1.5px solid ${C.border}`, cursor: "pointer",
                transition: "box-shadow 0.15s"
              }}
              onMouseEnter={e => (e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.07)")}
              onMouseLeave={e => (e.currentTarget.style.boxShadow = "none")}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.45rem", marginBottom: "0.45rem" }}>
                <span style={{ fontSize: "1rem" }}>{ucIcon[s.usecase] || "📌"}</span>
                <span style={{ fontSize: "0.72rem", fontWeight: 700, color: C.text1 }}>
                  #{s.display_id}
                </span>
                <span style={{
                  marginLeft: "auto", fontSize: "0.62rem", padding: "0.1rem 0.4rem",
                  borderRadius: 4, fontWeight: 600,
                  background: s.state === "ENDED" ? "#F0FFF4" : C.amberBg,
                  color: s.state === "ENDED" ? C.green : C.amberDark
                }}>
                  {s.state}
                </span>
              </div>
              <div style={{ fontSize: "0.72rem", color: C.text2, marginBottom: "0.2rem" }}>
                {s.usecase}
              </div>
              <div style={{ fontSize: "0.65rem", color: C.text3 }}>
                {new Date(s.created_at).toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      </div>

      {selected && (
        <SessionHistoryModal
          sessionId={selected}
          token={token}
          onClose={() => setSelected(null)}
        />
      )}
    </>
  );
}
