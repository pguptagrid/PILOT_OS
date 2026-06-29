import React, { useState, useEffect, useRef } from "react";
import { useAppStore } from "../../store/SessionStore";
import { useSession } from "./useSession";
import { sharedVoiceService } from "../../shared_voice";
import {
  C,
  LiveTaskStatus,
  parseFlightsFromText,
  parseHotelsFromText,
  renderTranscriptText,
  isFlightRelated
} from "./helpers";
import { WaveBars, LiveTranscriptBar } from "./LiveTranscriptBar";

export function CustomerCareView() {
  const sess    = useSession();
  const store   = useAppStore();
  const ts      = sess.transcripts;
  const [input, setInput] = useState("");
  const [elapsed, setElapsed] = useState(0);
  const [from, setFrom]   = useState("");
  const [to, setTo]       = useState("");
  const [date, setDate]   = useState(""); // used in flight search hint text
  const endRef = useRef<HTMLDivElement>(null);

  const flightTranscripts = ts.filter(t => isFlightRelated(t.text));

  useEffect(() => {
    const t = setInterval(() => setElapsed(e => e + 1), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [flightTranscripts.length]);

  const mm = String(Math.floor(elapsed / 60)).padStart(2, "0");
  const ss = String(elapsed % 60).padStart(2, "0");

  // Update form inputs dynamically when a voice search is executed in the background
  const lastFlightCall = store.toolCards.slice().reverse().find(c => c.tool === "flight_search");
  useEffect(() => {
    if (lastFlightCall?.result) {
      const res = lastFlightCall.result as any;
      if (res.origin) setFrom(res.origin);
      if (res.destination) setTo(res.destination);
      if (res.date) setDate(res.date);
    }
  }, [lastFlightCall]);

  // Sync manually typed inputs to Zustand global state and server socket so the voice assistant can access them dynamically
  useEffect(() => {
    useAppStore.getState().setTypedFlightContext(from, to, date);
    sharedVoiceService.sendPayload({
      type: "typed_flight_context",
      origin: from,
      destination: to,
      date: date
    });
  }, [from, to, date]);

  // Real-time flights from last flight_search tool result
  const flightCard = store.toolCards.slice().reverse().find(c => c.tool === "flight_search");
  const rawFlights = flightCard?.result ? ((flightCard.result as any).flights || (flightCard.result as any).results || []) : [];
  
  const flights: { airline: string; price: string; dep: string; arr: string; from: string; to: string; id: string }[] =
    rawFlights.map((f: any, i: number) => {
      let priceVal = f.price || "₹4200";
      if (typeof priceVal === "number") {
        priceVal = `₹${priceVal}`;
      }
      return {
        id: f.id || f.flight || `FL${i}`,
        airline: f.airline || f.operator || "Airline",
        price: priceVal,
        dep: f.departure || f.dep || "09:00",
        arr: f.arrival || f.arr || "11:30",
        from: f.origin || from || "BOM",
        to: f.destination || to || "DEL",
      };
    });

  // Sort flights in ascending order by price
  const sortedFlights = [...flights].sort((a, b) => {
    const numA = parseInt(a.price.replace(/[^\d]/g, "")) || 0;
    const numB = parseInt(b.price.replace(/[^\d]/g, "")) || 0;
    return numA - numB;
  });

  // Real-time task queue from store.toolCards (care tools only)
  const careTools = [/* "crm_lookup", */ "kb_search", "ticket_create", "ticket_update", "ticket_close", "flight_search", "flight_book"];
  const liveTasks = store.toolCards.filter(c => careTools.includes(c.tool));

  const toolLabel: Record<string, string> = {
    /* crm_lookup: "Verify Customer Identity", */ kb_search: "Search Knowledge Base",
    ticket_create: "Create Support Ticket", ticket_update: "Update Ticket",
    ticket_close: "Close Ticket", flight_search: "Search Flights",
    flight_book: "Book & Issue Ticket",
  };

  // Status timeline derived from live tool activity
  const now = new Date();
  const fmt = (d: Date) => d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  const timeline = [
    { l: "Session Connected", t: fmt(new Date(now.getTime() - elapsed * 1000)), done: true, active: false },
    ...liveTasks.map(c => ({
      l: toolLabel[c.tool] || c.tool,
      t: c.status === "ok" ? "Done" : c.status === "running" ? "In progress…" : "Pending",
      done: c.status === "ok",
      active: c.status === "running",
    })),
  ];

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", position: "relative", overflow: "hidden" }}>
      {/* header */}
      <div style={{
        padding: "0.85rem 1.5rem", background: C.surface,
        borderBottom: `1.5px solid ${C.border}`, flexShrink: 0
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h2 style={{ fontWeight: 800, fontSize: "1rem" }}>Active Session: Flight Booking</h2>
            <p style={{ fontSize: "0.75rem", color: C.text3 }}>Connecting with user ID: 894-3B-ZULU</p>
          </div>
          <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
            <button onClick={() => sess.toggle("customercare")}
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
        {/* flight search sidebar */}
        <div style={{
          width: 330, background: "#F9F8F6", borderRight: `1.5px solid ${C.border}`,
          padding: "0.85rem 0.85rem 3rem 0.85rem", overflowY: "auto", flexShrink: 0, display: "flex",
          flexDirection: "column", gap: "0.35rem"
        }}>
          <div style={{
            fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.08em",
            color: C.text3, marginBottom: "0.25rem"
          }}>FLIGHT SEARCH</div>
          {[
            { icon: "🛫", placeholder: "From (e.g. JFK)", val: from, set: setFrom },
            { icon: "🛬", placeholder: "To (e.g. LAX)", val: to, set: setTo },
            { icon: "📅", placeholder: "Date (e.g. 2026-07-01)", val: date, set: setDate },
          ].map(f => (
            <div key={f.placeholder} style={{
              display: "flex", alignItems: "center", gap: "0.35rem",
              background: "#fff", borderRadius: 8,
              border: `1.5px solid ${C.border}`, padding: "0.3rem 0.5rem"
            }}>
              <span style={{ fontSize: "0.85rem" }}>{f.icon}</span>
              <input value={f.val} onChange={e => f.set(e.target.value)}
                placeholder={f.placeholder}
                style={{
                  flex: 1, border: "none", outline: "none", fontSize: "0.72rem",
                  background: "transparent", color: C.text1
                }} />
            </div>
          ))}
          <div style={{ fontSize: "0.66rem", color: C.text3, marginTop: "0.1rem" }}>
            Say "search flights from {from || "…"} to {to || "…"}" or type above
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
              💡 FLIGHT ASSISTANT GUIDE
            </span>
            <div style={{ fontSize: "0.78rem", color: C.text1, lineHeight: 1.55, display: "flex", flexDirection: "column", gap: "0.55rem", fontFamily: "Inter, sans-serif" }}>
              <div>• <strong>Route Search:</strong> Type origin and destination details in the sidebar forms, or let PILOT fill them automatically from your speech.</div>
              <div>• <strong>Voice Lookup:</strong> Speak naturally: "Search flights from Mumbai to Delhi on July 1st" to pull active flight schedules immediately.</div>
              <div>• <strong>Interactive Flight Cards:</strong> Review prices, departure times, and carrier details from the generated flight options, and click to view details.</div>
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
              <div style={{ fontWeight: 600, fontSize: "0.85rem" }}>Customer Care Agent</div>
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
            {flightTranscripts.length === 0 && (
              <div style={{ textAlign: "center", color: C.text3, fontSize: "0.82rem", marginTop: "2rem" }}>
                Start your sentence by speaking : Hey , Pilot....
              </div>
            )}
            {flightTranscripts.map((t, i) => {
              const isAgent = t.speaker === "PILOT" || t.role === "PILOT";
              const flightsData = isAgent ? parseFlightsFromText(t.text) : null;
              
              if (flightsData) {
                return (
                  <div key={i} style={{ display: "flex", flexDirection: "column", gap: "0.85rem", marginBottom: "1.25rem", animation: "fadeIn 0.3s ease" }}>
                    <div style={{ fontSize: "0.72rem", fontWeight: 700, color: C.text3, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                      ✈️ Real-time Search: Found {flightsData.length} Flight Tickets
                    </div>
                    {flightsData.map((f, idx) => (
                      <div key={idx} style={{
                        background: "#FFFFFF",
                        border: `1.5px solid ${idx === 0 ? C.amber : C.border}`,
                        borderRadius: 14,
                        padding: "1.25rem",
                        boxShadow: "0 4px 16px rgba(0,0,0,0.02)",
                        display: "flex",
                        flexDirection: "column",
                        gap: "0.65rem",
                        position: "relative",
                        maxWidth: "92%"
                      }}>
                        {idx === 0 && (
                          <div style={{
                            position: "absolute",
                            top: -10,
                            right: 14,
                            background: C.amber,
                            color: "#fff",
                            fontSize: "0.62rem",
                            fontWeight: 800,
                            padding: "2px 8px",
                            borderRadius: 6,
                            textTransform: "uppercase",
                            letterSpacing: "0.03em"
                          }}>
                            Best Value Option
                          </div>
                        )}
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: `1px dashed ${C.border}`, paddingBottom: "0.5rem" }}>
                          <span style={{ fontSize: "0.88rem", fontWeight: 800, color: C.amberDark }}>
                            CARD {idx + 1} &bull; {f.airline}
                          </span>
                          <span style={{ fontSize: "1.1rem", fontWeight: 900, color: C.amberDark }}>{f.price}</span>
                        </div>

                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem", fontSize: "0.78rem" }}>
                          <div>
                            <div style={{ color: C.text3, fontSize: "0.68rem", textTransform: "uppercase", fontWeight: 700 }}>Route Path</div>
                            <div style={{ fontWeight: 700, color: C.text1, marginTop: 2 }}>{f.from} &rarr; {f.to}</div>
                          </div>
                          <div>
                            <div style={{ color: C.text3, fontSize: "0.68rem", textTransform: "uppercase", fontWeight: 700 }}>Departure & Code</div>
                            <div style={{ fontWeight: 700, color: C.text1, marginTop: 2 }}>
                              {f.departure} {f.flightCode && <span style={{ marginLeft: 6, fontSize: "0.68rem", background: "#FAF9F5", border: `1px solid ${C.border}`, padding: "1px 5px", borderRadius: 4, fontFamily: "monospace" }}>{f.flightCode}</span>}
                            </div>
                          </div>
                          <div>
                            <div style={{ color: C.text3, fontSize: "0.68rem", textTransform: "uppercase", fontWeight: 700 }}>Travel Date</div>
                            <div style={{ fontWeight: 600, color: C.text2, marginTop: 2 }}>{f.date || "2026-06-21"}</div>
                          </div>
                          <div>
                            <div style={{ color: C.text3, fontSize: "0.68rem", textTransform: "uppercase", fontWeight: 700 }}>Class / Platform</div>
                            <div style={{ fontWeight: 600, color: C.text2, marginTop: 2 }}>Economy Class &bull; Web verified</div>
                          </div>
                        </div>

                        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "0.25rem", borderTop: `1px solid ${C.border}`, paddingTop: "0.65rem" }}>
                          <a 
                            href={`https://www.google.com/travel/flights?q=Flights%20from%20${f.from}%20to%20${f.to}%20on%20${f.date || "2026-06-21"}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              padding: "0.45rem 1rem",
                              background: "#FAF9F5",
                              border: `1px solid ${C.border}`,
                              color: C.amberDark,
                              textDecoration: "none",
                              borderRadius: 8,
                              fontSize: "0.74rem",
                              fontWeight: 700,
                              cursor: "pointer",
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "0.35rem",
                              transition: "all 0.15s ease",
                              boxShadow: "0 2px 6px rgba(0,0,0,0.01)"
                            }}
                            onMouseEnter={e => {
                              e.currentTarget.style.background = C.amberBg;
                              e.currentTarget.style.borderColor = C.amber;
                            }}
                            onMouseLeave={e => {
                              e.currentTarget.style.background = "#FAF9F5";
                              e.currentTarget.style.borderColor = C.border;
                            }}
                          >
                            <span>View on Google Flights ↗</span>
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                );
              }

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
        transcripts={flightTranscripts} agentStatus={sess.agentStatus}
        isListening={sess.isListening} level={sess.level}
        onToggle={() => sess.toggle("customercare")}
      />
    </div>
  );
}
