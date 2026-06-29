import React, { useState, useEffect, useRef } from "react";
import { useAppStore } from "../../store/SessionStore";
import { useSession } from "./useSession";
import { sharedVoiceService } from "../../shared_voice";
import {
  C,
  LiveTaskStatus,
  renderTranscriptText,
  isEmailRelated
} from "./helpers";
import { WaveBars, LiveTranscriptBar } from "./LiveTranscriptBar";

export function EmailPageView() {
  const sess    = useSession();
  const store   = useAppStore();
  const ts      = sess.transcripts;
  const [input, setInput] = useState("");
  const [elapsed, setElapsed] = useState(0);
  const endRef = useRef<HTMLDivElement>(null);

  // Form states for left composition form
  const [formFrom, setFormFrom] = useState(store.user?.email || "pagupta@griddynamics.com");
  const [formTo, setFormTo] = useState("");
  const [formCcBcc, setFormCcBcc] = useState("");
  const [formSubject, setFormSubject] = useState("");
  const [formBody, setFormBody] = useState("");
  const [isDrafting, setIsDrafting] = useState(false);

  useEffect(() => {
    const t = setInterval(() => setElapsed(e => e + 1), 1000);
    return () => clearInterval(t);
  }, []);

  // Sync manually typed inputs to Zustand global state / websocket so backend LLM can access them
  useEffect(() => {
    store.setTypedEmailContext(formTo, formSubject);
    sharedVoiceService.sendPayload({
      type: "typed_email_context",
      from: formFrom,
      to: formTo,
      cc_bcc: formCcBcc,
      subject: formSubject
    });
  }, [formFrom, formTo, formCcBcc, formSubject]);

  const emailTranscripts = ts.filter(t => isEmailRelated(t.text));

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [emailTranscripts.length]);

  const mm = String(Math.floor(elapsed / 60)).padStart(2, "0");
  const ss = String(elapsed % 60).padStart(2, "0");

  // Filter tool cards for email activities
  const emailTools = ["write_email", "send_email"];
  const liveTasks = store.toolCards.filter(c => emailTools.includes(c.tool));

  // Find the last completed draft card
  const lastDraftCard = store.toolCards.slice().reverse().find(c => c.tool === "write_email" && c.status === "ok");
  const lastDraftResult = lastDraftCard?.result as any;
  const currentDraft = lastDraftResult?.email_draft || "";
  const recipientName = lastDraftResult?.recipient_name || "";
  const recipientEmail = lastDraftResult?.recipient_email || "";

  // Auto pre-fill input form fields on the fly when the background voice assistant resolves the recipient or subject!
  useEffect(() => {
    if (lastDraftResult) {
      if (lastDraftResult.recipient_email && lastDraftResult.recipient_email !== "team@pilot.ai") {
        setFormTo(lastDraftResult.recipient_email);
      }
      if (lastDraftResult.subject && lastDraftResult.subject !== "Update from PILOT Voice OS") {
        setFormSubject(lastDraftResult.subject);
      } else if (lastDraftCard?.result && (lastDraftCard.result as any).subject) {
        setFormSubject((lastDraftCard.result as any).subject);
      }
      if (lastDraftResult.cc_bcc && lastDraftResult.cc_bcc !== "info@pilot.ai") {
        setFormCcBcc(lastDraftResult.cc_bcc);
      }
    }
  }, [lastDraftResult, lastDraftCard]);

  const toolLabel: Record<string, string> = {
    write_email: "Draft Email Template",
    send_email: "Send Email Real-time",
  };

  const now = new Date();
  const fmt = (d: Date) => d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  const timeline = [
    { l: "Email Client connected", t: fmt(new Date(now.getTime() - elapsed * 1000)), done: true, active: false },
    ...liveTasks.map(c => ({
      l: toolLabel[c.tool] || c.tool,
      t: c.status === "ok" ? "Done" : c.status === "running" ? "In progress…" : "Pending",
      done: c.status === "ok",
      active: c.status === "running",
    })),
  ];

  async function handleDraftEmail() {
    if (!formTo.trim() || !formSubject.trim() || !formBody.trim()) {
      alert("Please fill out To, Subject, and Body fields.");
      return;
    }
    setIsDrafting(true);
    try {
      const response = await fetch("/api/v1/sessions/draft-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${store.token}`
        },
        body: JSON.stringify({
          session_id: sess.sessionId || "default",
          from_email: formFrom,
          to_email: formTo,
          cc_bcc: formCcBcc,
          subject: formSubject,
          body: formBody
        })
      });
      const data = await response.json();
      if (data.status === "ok") {
        setFormBody(""); // Clear form body on success
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsDrafting(false);
    }
  }

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", position: "relative", overflow: "hidden" }}>
      {/* header */}
      <div style={{
        padding: "0.85rem 1.5rem", background: C.surface,
        borderBottom: `1.5px solid ${C.border}`, flexShrink: 0
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h2 style={{ fontWeight: 800, fontSize: "1rem" }}>Active Session: Email Center</h2>
            <p style={{ fontSize: "0.75rem", color: C.text3 }}>Draft and dispatch authorized SMTP messages via voice biometrics.</p>
          </div>
          <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
            <button onClick={() => sess.toggle("email")}
              style={{
                display: "flex", alignItems: "center", gap: "0.4rem",
                padding: "0.35rem 0.8rem", borderRadius: 20,
                background: sess.isListening ? C.amberBg : "#F0EDE8",
                border: `1.5px solid ${sess.isListening ? C.amber : C.border}`,
                fontSize: "0.75rem", color: C.amberDark, fontWeight: 600, cursor: "pointer"
              }}>
              <span style={{
                width: 7, height: 7, borderRadius: "50%", background: C.amber,
                display: "inline-block"
              }} />
              {sess.isListening ? "Live Call" : "Start Call"}
            </button>
            <span style={{ fontSize: "0.8rem", color: C.text2, fontFamily: "monospace" }}>{mm}:{ss}</span>
          </div>
        </div>
      </div>

      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
        {/* Left Side - Email Composition Form */}
        <div style={{
          width: 330, background: "#F9F8F6", borderRight: `1.5px solid ${C.border}`,
          padding: "1rem 1rem 3rem 1rem", overflowY: "auto", flexShrink: 0, display: "flex",
          flexDirection: "column", gap: "0.75rem"
        }}>
          <div style={{
            fontSize: "0.72rem", fontWeight: 800, letterSpacing: "0.08em",
            color: C.text2, marginBottom: "0.25rem", borderBottom: `1px solid ${C.border}`, paddingBottom: "0.35rem"
          }}>
            EMAIL COMPOSITION FORM
          </div>
          
          <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
            <div>
              <label style={{ fontSize: "0.68rem", fontWeight: 700, color: C.text2, display: "block", marginBottom: 3 }}>FROM:</label>
              <input value={formFrom} readOnly disabled
                style={{ width: "100%", padding: "0.4rem 0.6rem", borderRadius: 6, border: `1px solid ${C.border}`, background: "#EFECE8", color: C.text3, fontSize: "0.74rem", outline: "none", cursor: "not-allowed" }}/>
            </div>
            
            <div>
              <label style={{ fontSize: "0.68rem", fontWeight: 700, color: C.text2, display: "block", marginBottom: 3 }}>TO:</label>
              <input value={formTo} onChange={e => setFormTo(e.target.value)} placeholder="recipient@domain.com"
                style={{ width: "100%", padding: "0.4rem 0.6rem", borderRadius: 6, border: `1px solid ${C.border}`, background: "#fff", color: C.text1, fontSize: "0.74rem", outline: "none" }}/>
            </div>

            <div>
              <label style={{ fontSize: "0.68rem", fontWeight: 700, color: C.text2, display: "block", marginBottom: 3 }}>CC/BCC:</label>
              <input value={formCcBcc} onChange={e => setFormCcBcc(e.target.value)} placeholder="info@pilot.ai"
                style={{ width: "100%", padding: "0.4rem 0.6rem", borderRadius: 6, border: `1px solid ${C.border}`, background: "#fff", color: C.text1, fontSize: "0.74rem", outline: "none" }}/>
            </div>

            {/* <div>https://blue-kaitlyn-44.tiiny.site/#demos
              <label style={{ fontSize: "0.68rem", fontWeight: 700, color: C.text2, display: "block", marginBottom: 3 }}>SUBJECT:</label>
              <input value={formSubject} onChange={e => setFormSubject(e.target.value)} placeholder="Enter email subject"
                style={{ width: "100%", padding: "0.4rem 0.6rem", borderRadius: 6, border: `1px solid ${C.border}`, background: "#fff", color: C.text1, fontSize: "0.74rem", outline: "none" }}/>
            </div> */}
          </div>

          {/* Quick Guide */}
          <div style={{
            marginTop: "1.25rem",
            background: "#FAF9F5",
            border: `1.5px solid ${C.border}`,
            borderRadius: 12,
            padding: "1.25rem",
            display: "flex",
            flexDirection: "column",
            gap: "0.65rem",
            boxShadow: "0 4px 12px rgba(0,0,0,0.03)",
            fontFamily: "Inter, sans-serif"
          }}>
            <span style={{ fontSize: "0.85rem", fontWeight: 800, color: C.amberDark, letterSpacing: "0.05em", fontFamily: "Inter, sans-serif" }}>
              💡 EMAIL CENTER WORKFLOW GUIDE
            </span>
            <div style={{ fontSize: "0.78rem", color: C.text1, lineHeight: 1.55, display: "flex", flexDirection: "column", gap: "0.55rem", fontFamily: "Inter, sans-serif" }}>
              <div>• <strong>Configure Fields:</strong> Enter the recipient email, CC/BCC, and subject in the left panel, or let PILOT auto-fill them from your spoken instructions.</div>
              <div>• <strong>Voice Dictation:</strong> Simply speak: "write an email welcoming Ada to the team" to automatically create a complete message draft in the panel.</div>
              <div>• <strong>Send Message:</strong> Review your drafted email on the screen. Once you are ready, speak "send this email" or click the Send button to dispatch it.</div>
            </div>
          </div>
        </div>

        {/* chat */}
        <div style={{ flex: 1, display: "flex", overflow: "hidden", flexDirection: "column" }}>
          <div style={{
            display: "flex", alignItems: "center", gap: "0.65rem",
            padding: "0.65rem 1rem", background: "#fff",
            borderBottom: `1.5px solid ${C.border}`, flexShrink: 0
          }}>
            <div style={{
              width: 32, height: 32, borderRadius: "50%", background: "#E5E7EB",
              display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.9rem"
            }}>🧑</div>
            <div>
              <div style={{ fontWeight: 600, fontSize: "0.85rem" }}>Email Agent Specialist</div>
              <div style={{ fontSize: "0.68rem", color: C.text3 }}>
                {sess.isListening ? "Speaking..." : "Connected"}
              </div>
            </div>
            {sess.isListening && (
              <div style={{ marginLeft: "auto" }}>
                <WaveBars active={true} level={sess.level} count={5} />
              </div>
            )}
          </div>

          {/* messages */}
          <div style={{ flex: 1, overflowY: "auto", padding: "0.85rem" }}>
            {emailTranscripts.length === 0 && (
              <div style={{ textAlign: "center", color: C.text3, fontSize: "0.82rem", marginTop: "2rem" }}>
                Start your sentence by speaking : Hey , Pilot....
              </div>
            )}
            {emailTranscripts.map((t, i) => {
              const isAgent = t.speaker === "PILOT" || t.role === "PILOT";
              return (
                <div key={i} style={{
                  display: "flex", justifyContent: isAgent ? "flex-start" : "flex-end",
                  marginBottom: "0.7rem", animation: "fadeIn 0.3s ease"
                }}>
                  {isAgent && (
                    <div style={{
                      width: 28, height: 28, borderRadius: "50%", background: C.amber,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      marginRight: "0.4rem", flexShrink: 0, fontSize: "0.75rem"
                    }}>🤖</div>
                  )}
                  <div style={{
                    maxWidth: "68%", padding: "0.65rem 0.85rem",
                    background: isAgent ? "#fff" : C.blue,
                    color: isAgent ? C.text1 : "#fff",
                    borderRadius: isAgent ? "12px 12px 12px 3px" : "12px 12px 3px 12px",
                    fontSize: "0.85rem", lineHeight: 1.55,
                    border: isAgent ? `1.5px solid ${C.border}` : "none",
                    boxShadow: isAgent ? "0 2px 8px rgba(0,0,0,0.04)" : "none"
                  }}>
                    {renderTranscriptText(t.text)}
                  </div>
                  {!isAgent && (
                    <div style={{
                      width: 28, height: 28, borderRadius: "50%", background: C.amberDark,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      marginLeft: "0.4rem", flexShrink: 0, color: "#fff", fontSize: "0.68rem", fontWeight: 700
                    }}>
                      {(t.speaker || "U").charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
              );
            })}
            <div ref={endRef} />
          </div>

          {/* text input */}
          <div style={{
            display: "flex", gap: "0.6rem", padding: "0.65rem 0.85rem",
            background: "#fff", borderTop: `1.5px solid ${C.border}`, flexShrink: 0,
            alignItems: "flex-end"
          }}>
            <button style={{
              width: 28, height: 28, borderRadius: 7, background: "#F0EDE8",
              border: `1.5px solid ${C.border}`, fontSize: "0.9rem", flexShrink: 0
            }}>+</button>
            <input value={input} onChange={e => setInput(e.target.value)}
              onKeyDown={e => {
                if (e.key === "Enter" && input.trim()) {
                  setInput("");
                }
              }}
              style={{
                flex: 1, padding: "0.55rem 0.8rem", borderRadius: 10,
                border: `1.5px solid ${C.border}`, fontSize: "0.85rem",
                background: "#F9F8F6", outline: "none"
              }}
              placeholder="Type a message or command override..." />
            <button style={{ padding: "0.55rem 1rem", borderRadius: 10, background: C.amberDark,
                             border: "none", color: "#fff", fontWeight: 600, fontSize: "0.85rem" }}>
              ▶ Send
            </button>
          </div>
        </div>

        {/* task queue */}
        <div style={{
          width: 210, background: "#fff", borderLeft: `1.5px solid ${C.border}`,
          padding: "0.85rem", overflowY: "auto", flexShrink: 0
        }}>
          <div style={{ fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.08em",
                        color: C.text3, marginBottom: "0.6rem" }}>TASK QUEUE</div>
          {liveTasks.length === 0
            ? <div style={{ fontSize: "0.72rem", color: C.text3 }}>No tasks yet. Start a call.</div>
            : liveTasks.map((t, i) => (
              <div key={i} style={{
                display: "flex", flexDirection: "column", alignItems: "stretch",
                padding: "0.55rem", borderRadius: 8, marginBottom: "0.3rem",
                background: t.status === "running" ? C.amberBg : "transparent",
                border: `1.5px solid ${t.status === "running" ? C.amber : C.border}`
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.45rem" }}>
                  <div style={{
                    width: 16, height: 16, borderRadius: "50%", flexShrink: 0,
                    background: (t.status === "ok" || t.status === "success") ? C.green : t.status === "running" ? C.amber : "#F0EDE8",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "0.55rem", color: "#fff"
                  }}>
                    {(t.status === "ok" || t.status === "success") ? "✓" : t.status === "running" ? "●" : "○"}
                  </div>
                  <span style={{
                    fontSize: "0.74rem", fontWeight: 600,
                    textDecoration: (t.status === "ok" || t.status === "success") ? "line-through" : "none",
                    color: (t.status === "ok" || t.status === "success") ? "#AAA" : C.text1
                  }}>
                    {toolLabel[t.tool] || t.tool}
                  </span>
                </div>
                <div style={{ paddingLeft: 20 }}>
                  <LiveTaskStatus tool={t.tool} status={t.status} />
                </div>
              </div>
            ))
          }

          <div style={{ fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.08em",
                        color: C.text3, margin: "1rem 0 0.6rem" }}>STATUS TIMELINE</div>
          {timeline.map((s, i) => (
            <div key={i} style={{ display: "flex", gap: "0.45rem", marginBottom: "0.65rem" }}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                <div style={{
                  width: 11, height: 11, borderRadius: "50%", flexShrink: 0,
                  background: s.done ? C.green : s.active ? C.amber : C.border
                }} />
                {i < timeline.length - 1 && <div style={{ width: 2, height: 18, background: C.border }} />}
              </div>
              <div>
                <div style={{
                  fontSize: "0.75rem", fontWeight: 600,
                  color: s.active ? C.text1 : C.text3
                }}>{s.l}</div>
                <div style={{ fontSize: "0.65rem", color: s.active ? C.amber : "#AAA" }}>{s.t}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <LiveTranscriptBar
        transcripts={emailTranscripts} agentStatus={sess.agentStatus}
        isListening={sess.isListening} level={sess.level}
        onToggle={() => sess.toggle("email")}
      />
    </div>
  );
}
