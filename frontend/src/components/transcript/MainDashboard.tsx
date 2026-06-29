import React from "react";
import { useAppStore } from "../../store/SessionStore";
import { useSession } from "./useSession";
import {
  C,
  LiveTaskStatus,
  parseFlightsFromText,
  parseHotelsFromText,
  renderTranscriptText,
  isFlightRelated,
  isPptRelated,
  isEmailRelated
} from "./helpers";
import { SessionsList } from "./SessionModal";
import { WaveBars, LiveTranscriptBar } from "./LiveTranscriptBar";

export function MainDashboard() {
  const store = useAppStore();
  const sess  = useSession();
  const ts    = sess.transcripts;
  const tc    = store.toolCards;

  const generalTranscripts = ts.filter(t => !isFlightRelated(t.text) && !isPptRelated(t.text) && !isEmailRelated(t.text));

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", position: "relative", overflow: "hidden" }}>
      <div style={{ flex: 1, overflow: "auto", padding: "2rem 2.5rem 6rem" }}>
        {/* header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.5rem" }}>
          <div>
            <h1 style={{ fontSize: "1.9rem", fontWeight: 800, letterSpacing: "-0.02em" }}>Welcome, {store.user?.name || "there"}</h1>
            <p style={{ color: C.text3, fontSize: "0.85rem" }}>Live voice processing and agent orchestration.</p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.65rem" }}>
            <div style={{
              display: "flex", alignItems: "center", gap: "0.4rem",
              padding: "0.45rem 0.9rem", background: "#F0FFF4", borderRadius: 10,
              border: `1.5px solid ${C.green}`, fontSize: "0.78rem",
              fontWeight: 700, color: C.green, cursor: "pointer",
              userSelect: "none" as const
            }}>
              🔐 ✓ Level 2 Access
            </div>
            <div style={{
              display: "flex", alignItems: "center", gap: "0.5rem",
              padding: "0.5rem 1rem", background: C.surface, borderRadius: 10,
              border: `1.5px solid ${C.border}`, fontSize: "0.8rem", fontWeight: 600
            }}>
              <span style={{
                width: 8, height: 8, borderRadius: "50%", display: "inline-block",
                background: sess.isListening ? C.green : C.border
              }} />
              {sess.isListening ? "Live Mode" : "Offline"}
              <WaveBars active={sess.isListening} level={sess.level} count={5} />
            </div>
          </div>
        </div>

        {/* Top Layout Grid: Left (Transcript Section) & Right (Tools & Queue Stacked) */}
        <div style={{ display: "grid", gridTemplateColumns: "1.8fr 1.2fr", gap: "1.25rem", marginBottom: "1.75rem", alignItems: "stretch", height: "auto", maxHeight: "460px" }}>
          {/* Transcript section */}
          <div style={{
            background: C.surface, borderRadius: 14, padding: "1.25rem",
            border: `1.5px solid ${C.border}`, overflow: "hidden", display: "flex", flexDirection: "column", height: "auto", maxHeight: "460px"
          }}>
            <div style={{ fontWeight: 700, fontSize: "0.95rem", marginBottom: "0.85rem", display: "flex", alignItems: "center", gap: "0.4rem" }}>
              <span>📋</span> Transcript section
            </div>
            <div style={{ overflowY: "auto", flex: 1 }}>
              {generalTranscripts.length === 0
                ? <div style={{ color: C.text3, fontSize: "0.78rem" }}>Speak first : Hey Pilot,</div>
                : generalTranscripts.slice(-8).map((t, i) => {
                  const isPilot = t.speaker === "PILOT";
                  const flightsData = isPilot ? parseFlightsFromText(t.text) : null;
                  const hotelsData = isPilot ? parseHotelsFromText(t.text) : null;
                  return (
                    <div key={i} style={{ marginBottom: "0.5rem", animation: "fadeIn 0.3s ease" }}>
                      <div style={{
                        fontSize: "0.68rem", fontWeight: 700,
                        color: isPilot ? C.amber : C.amberDark,
                        marginBottom: "0.1rem"
                      }}>
                        {t.speaker || "You"}
                      </div>
                      <div style={{
                        background: isPilot ? C.amberBg : "#F9F8F6",
                        borderRadius: 8, padding: "0.4rem 0.6rem",
                        fontSize: "0.8rem", lineHeight: 1.5,
                        color: isPilot ? C.amberDark : C.text1
                      }}>
                        {flightsData ? (
                          <div>
                            <div style={{ fontWeight: 600, marginBottom: "0.5rem" }}>
                              Found {flightsData.length} flights from {flightsData[0].from} to {flightsData[0].to}:
                            </div>
                            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", marginTop: "0.5rem" }}>
                              {flightsData.map((f, idx) => (
                                <div key={idx} style={{
                                  background: idx === 0 ? "#FFFDF5" : "#FDFDFD",
                                  border: idx === 0 ? `1px solid ${C.amber}` : `1px solid ${C.border}`,
                                  borderRadius: 8,
                                  padding: "0.5rem 0.6rem",
                                  boxShadow: "0 1px 2px rgba(0,0,0,0.02)",
                                  display: "flex",
                                  flexDirection: "column",
                                  gap: "0.3rem"
                                }}>
                                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}>
                                      <span style={{ fontSize: "0.8rem" }}>✈️</span>
                                      <span style={{ fontWeight: 700, color: C.text1, fontSize: "0.74rem" }}>{f.airline}</span>
                                    </div>
                                    <span style={{ fontSize: "0.78rem", fontWeight: 800, color: C.amberDark }}>{f.price}</span>
                                  </div>
                                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.68rem", color: C.text2 }}>
                                    <div>{f.from} → {f.to}</div>
                                    <div>{f.departure}</div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ) : hotelsData ? (
                          <div>
                            <div style={{ fontWeight: 600, marginBottom: "0.5rem" }}>
                              Found {hotelsData.length} hotels in {hotelsData[0].location}:
                            </div>
                            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", marginTop: "0.5rem" }}>
                              {hotelsData.map((h, idx) => (
                                <div key={idx} style={{
                                  background: idx === 0 ? "#FFFDF5" : "#FDFDFD",
                                  border: idx === 0 ? `1px solid ${C.amber}` : `1px solid ${C.border}`,
                                  borderRadius: 8,
                                  padding: "0.5rem 0.6rem",
                                  boxShadow: "0 1px 2px rgba(0,0,0,0.02)",
                                  display: "flex",
                                  flexDirection: "column",
                                  gap: "0.3rem"
                                }}>
                                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}>
                                      <span style={{ fontSize: "0.8rem" }}>🏨</span>
                                      <span style={{ fontWeight: 700, color: C.text1, fontSize: "0.74rem" }}>{h.hotel}</span>
                                    </div>
                                    <span style={{ fontSize: "0.78rem", fontWeight: 800, color: C.amberDark }}>{h.price}</span>
                                  </div>
                                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.68rem", color: C.text2 }}>
                                    <div>{h.location}</div>
                                    <div>Date: {h.date}</div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ) : (
                          renderTranscriptText(t.text)
                        )}
                      </div>
                    </div>
                  );
                })
              }
            </div>
          </div>

          {/* Right Stack: Tools & Queue stacked on top of each other */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem", height: "auto", maxHeight: "460px" }}>
            {/* Tools */}
            <div style={{ background: C.surface, borderRadius: 14, padding: "1.25rem", border: `1.5px solid ${C.border}`, display: "flex", flexDirection: "column", flex: "0 0 auto" }}>
              <div style={{ fontWeight: 700, fontSize: "0.95rem", marginBottom: "0.85rem", display: "flex", alignItems: "center", gap: "0.4rem" }}>
                <span>✦</span> Tools
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                {([
                  { name: "PPT Copilot", icon: "🖥", page: "ppt" },
                  { name: "Customer Care", icon: "🎧", page: "care" },
                  { name: "Email Center", icon: '✉️', page: 'email' },
                  { name: "Wanna Chat", icon: '💬', page: 'chat' },
                  {name:"Meeting TALKINIA",icon:'👥',page:'meetings'}
                ] as const).map(t => (
                  <div key={t.name}
                    onClick={() => store.setPage(t.page as any)}
                    style={{
                      display: "flex", alignItems: "center", gap: "0.5rem",
                      padding: "0.55rem 0.7rem", borderRadius: 10,
                      background: "#F9F8F6", border: `1.5px solid ${C.border}`,
                      cursor: "pointer", transition: "all 0.15s"
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = C.amberBg,
                      e.currentTarget.style.borderColor = C.amber)}
                    onMouseLeave={e => (e.currentTarget.style.background = "#F9F8F6",
                      e.currentTarget.style.borderColor = C.border)}>
                    <span style={{ fontSize: "1rem" }}>{t.icon}</span>
                    <span style={{ flex: 1, fontSize: "0.82rem", fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <span>{t.name}</span>
                      {t.page === "chat" && store.unreadChatCount > 0 && (
                        <span style={{
                          width: 8,
                          height: 8,
                          borderRadius: "50%",
                          background: C.amber,
                          display: "inline-block",
                          boxShadow: `0 0 8px ${C.amber}`,
                          marginRight: "0.5rem"
                        }} />
                      )}
                    </span>
                    <span style={{ fontSize: "0.7rem", color: C.text3 }}>→</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Queue */}
            <div style={{ background: C.surface, borderRadius: 14, padding: "1.25rem", border: `1.5px solid ${C.border}`, display: "flex", flexDirection: "column", flex: "1 1 auto", overflow: "hidden" }}>
              <div style={{ fontWeight: 700, fontSize: "0.95rem", marginBottom: "0.85rem", display: "flex", alignItems: "center", gap: "0.4rem" }}>
                <span>⊙</span> Queue
              </div>
              <div style={{ overflowY: "auto", flex: 1 }}>
                {tc.length === 0
                  ? <div style={{ color: C.text3, fontSize: "0.78rem" }}>No jobs yet</div>
                  : tc.map((c, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: "0.45rem", marginBottom: "0.55rem" }}>
                      <div style={{
                        width: 14, height: 14, borderRadius: "50%", flexShrink: 0, marginTop: 2,
                        background: (c.status === "ok" || c.status === "success") ? C.green : c.status === "running" ? C.amber : C.border,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: "0.5rem", color: "#fff"
                      }}>
                        {(c.status === "ok" || c.status === "success") ? "✓" : c.status === "running" ? "●" : "○"}
                      </div>
                      <div>
                        <div style={{ fontSize: "0.78rem", fontWeight: 600 }}>{c.tool}</div>
                        <LiveTaskStatus tool={c.tool} status={c.status} />
                      </div>
                    </div>
                  ))
                }
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Layout Grid: Left (Recent Sessions) & Right (Voice Control Reference Card) */}
        {store.token && (
          <div style={{ display: "grid", gridTemplateColumns: "1.8fr 1.2fr", gap: "1.25rem" }}>
            <div style={{ background: C.surface, borderRadius: 14, padding: "1.5rem", border: `1.5px solid ${C.border}`, display: "flex", flexDirection: "column", gap: "1rem" }}>
              <SessionsList token={store.token} />
            </div>

            {/* Voice Control Reference Card */}
            <div style={{ background: C.surface, borderRadius: 14, padding: "1.5rem", border: `1.5px solid ${C.border}`, display: "flex", flexDirection: "column", gap: "1rem" }}>
              <h2 style={{ fontSize: "1.1rem", fontWeight: 700, display: "flex", alignItems: "center", gap: "0.4rem" }}>
                <span>🗣️</span> Voice Control Center
              </h2>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem", height: "100%", justifyContent: "center" }}>
                <div style={{ background: "#FAF9F5", padding: "1rem", borderRadius: 10, border: `1.5px solid ${C.border}` }}>
                  <span style={{ fontSize: "0.85rem", fontWeight: 800, color: C.amberDark, display: "block", marginBottom: "0.35rem", letterSpacing: "0.03em" }}>
                    🎙️ WAKE-UP & SLEEP COMMANDS
                  </span>
                  <p style={{ fontSize: "0.78rem", color: C.text1, lineHeight: 1.5, margin: 0 }}>
                    • <strong>Wake-up:</strong> Say <strong>"Hey Pilot"</strong> or <strong>"Hello Pilot"</strong> to active-listen.<br />
                    • <strong>Sleep:</strong> Say <strong>"Go to sleep"</strong> or <strong>"Stop listening"</strong> to pause ambient detection.
                  </p>
                </div>

                <div style={{ background: "#FAF9F5", padding: "1rem", borderRadius: 10, border: `1.5px solid ${C.border}` }}>
                  <span style={{ fontSize: "0.85rem", fontWeight: 800, color: "#C2410C", display: "block", marginBottom: "0.35rem", letterSpacing: "0.03em" }}>
                    ⚡ TASK INTERRUPTION PHRASES
                  </span>
                  <p style={{ fontSize: "0.78rem", color: C.text1, lineHeight: 1.5, margin: 0 }}>
                    • Speak: <strong>"stop task"</strong>, <strong>"stop current task"</strong>, <strong>"stop process"</strong>, or <strong>"cancel background"</strong> to cleanly preempt any ongoing background operations and roll back current transactions safely.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <LiveTranscriptBar
        transcripts={generalTranscripts} agentStatus={sess.agentStatus}
        isListening={sess.isListening} level={sess.level}
        onToggle={() => sess.toggle("general")}
      />
    </div>
  );
}
