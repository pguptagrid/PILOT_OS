// /**
//  * Landing · Login · Signup (4-step) · OTP · VoiceCalibration
//  * Feature 1: voice enrollment with real embedding
//  * Feature 5: audio file upload in enrollment
//  * Feature 6: PDF-accurate design
//  */
// import React, { useState, useRef, useEffect } from "react";
// import { useAppStore } from "../store/SessionStore";
// import { PILOTLogo } from "./PILOTLogo";

// const C = {
//   amber:"#F5A700", amberDark:"#7C5E00", amberBg:"#FFF8E7",
//   bg:"#F7F6F3", surface:"#FFFFFF", border:"#E5E2DA",
//   text1:"#1A1A1A", text2:"#555555", text3:"#888888",
//   green:"#22C55E",
// };

// const api = async (method:string, path:string, body?:unknown) => {
//   const token = localStorage.getItem("pilot_token");
//   const h: Record<string,string> = {"Content-Type":"application/json"};
//   if (token) h["Authorization"] = `Bearer ${token}`;
//   const opts: RequestInit = {method:method.toUpperCase(), headers:h};
//   if (body !== undefined) opts.body = JSON.stringify(body);
//   const res = await fetch("/api/v1"+path, opts);
//   if (!res.ok) { const e=await res.json().catch(()=>({})); throw new Error((e as any).detail??res.statusText); }
//   return res.json();
// };

// const inp: React.CSSProperties = {
//   width:"100%", padding:"0.7rem 1rem", borderRadius:10,
//   border:`1.5px solid ${C.border}`, fontSize:"0.9rem",
//   background:"#fff", color:C.text1, outline:"none",
// };

// /* ── LANDING ── */
// export function LandingPage() {
//   const store = useAppStore();
//   const p = store.page;

//   if (p==="login")   return <LoginPage/>;
//   if (p==="signup")  return <SignupPage/>;
//   if (p==="verify")  return <OTPPage/>;
//   if (p==="enroll")  return <VoiceCalibration/>;
//   if (p==="forgot")  return <ForgotPasswordPage/>;
//   if (p==="forgot-verify") return <ForgotOTPPage/>;

//   return (
//     <div style={{ minHeight:"100vh", fontFamily:"Inter, sans-serif",
//                   background:"radial-gradient(circle at top left, #FAF9F5 0%, #EFECE0 100%)", color: "#1A1A1A" }}>
//       {/* nav */}
//       <nav style={{ display:"flex", alignItems:"center", justifyContent:"space-between",
//                     padding:"1rem 3rem", background:"rgba(255,255,255,0.85)", backdropFilter: "blur(12px)",
//                     borderBottom:`1.5px solid ${C.border}`, position: "sticky", top: 0, zIndex: 100 }}>
//         <div style={{ display:"flex", alignItems:"center", gap:"0.6rem" }}>
//           <PILOTLogo size={36} />
//           <div>
//             <span style={{ fontWeight:900, fontSize:"1.25rem", letterSpacing:"-0.02em", color:"#1A1A1A" }}>PILOT</span>
//             <div style={{ fontSize: "0.55rem", color: C.amberDark, fontWeight: 700, letterSpacing: "0.1em", marginTop: -2 }}>VOICE AI OS</div>
//           </div>
//         </div>
//         <div style={{ display:"flex", gap:"0.75rem", alignItems: "center" }}>
//           {/* <span style={{ fontSize: "0.8rem", color: C.text3, fontWeight: 500, marginRight: "1rem" }}>v2.1 Stable Edition</span> */}
//           {store.token ? (
//             <button onClick={()=>store.setPage("dashboard")}
//               style={{ padding:"0.5rem 1.5rem", borderRadius:8, border:"none",
//                        background:C.amber, color:"#fff", fontWeight:700, fontSize:"0.83rem", cursor:"pointer",
//                        boxShadow: "0 4px 12px rgba(245,167,0,0.25)" }}>
//               Go to Dashboard
//             </button>
//           ) : (
//             <>
//               <button onClick={()=>store.setPage("login")}
//                 style={{ padding:"0.5rem 1.25rem", borderRadius:8,
//                          border:`1.5px solid ${C.border}`, background:"#fff",
//                          fontWeight:600, fontSize:"0.83rem", cursor:"pointer", transition: "all 0.15s ease" }}>Sign In</button>
//               <button onClick={()=>store.setPage("signup")}
//                 style={{ padding:"0.5rem 1.25rem", borderRadius:8, border:"none",
//                          background:C.amber, color:"#fff", fontWeight:700, fontSize:"0.83rem", cursor:"pointer",
//                          boxShadow: "0 4px 12px rgba(245,167,0,0.25)" }}>
//                 Get Started Free
//               </button>
//             </>
//           )}
//         </div>
//       </nav>

//       {/* hero */}
//       <div style={{ maxWidth: 900, margin: "0 auto", padding: "6.5rem 2rem 5.5rem",
//                     display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
//         <div style={{ display:"inline-flex", alignItems:"center", gap:"0.4rem",
//                       padding:"0.3rem 0.8rem", borderRadius:20, background:C.amberBg,
//                       color:C.amberDark, fontSize:"0.72rem", fontWeight:800, marginBottom:"1.5rem" }}>
//           <span style={{ width:6,height:6,borderRadius:"50%",background:C.amber,display:"inline-block" }}/>
//           🟢 BIOMETRIC ENGINE ACTIVE
//         </div>
//         <h1 style={{ fontSize:"3.8rem", fontWeight:900, lineHeight:1.1,
//                      letterSpacing:"-0.035em", marginBottom:"1.5rem" }}>
//           A Voice-First<br/>
//           <span style={{ color:C.amberDark }}>AI Operating System.</span>
//         </h1>
//         <p style={{ fontSize:"1.05rem", color:C.text2, lineHeight:1.75,
//                     maxWidth:600, marginBottom:"2.5rem" }}>
//           Experience continuous, zero-latency computing designed entirely around natural language, continuous voice recognition, real-time biometrics, and autonomous background orchestration.
//         </p>
//         <div style={{ display:"flex", justifyContent:"center", gap:"1rem", marginBottom: "3.5rem" }}>
//           <button onClick={()=>store.setPage(store.token ? "dashboard" : "signup")}
//             style={{ padding:"1rem 2.2rem", borderRadius:10, background:C.amber,
//                      color:"#fff", fontWeight:800, fontSize:"1rem", border:"none", cursor:"pointer",
//                      boxShadow: "0 6px 20px rgba(245,167,0,0.3)" }}>
//             {store.token ? "Go to Dashboard" : "Launch Virtual Terminal"}
//           </button>
//         </div>
        
//         {/* <div style={{ borderTop: `1px dashed ${C.border}`, paddingTop: "2rem", display: "flex", justifyContent: "center", gap: "3.5rem", width: "100%", maxWidth: 650 }}>
//           <div>
//             <div style={{ fontWeight: 800, fontSize: "1.3rem", color: C.amberDark }}>&lt; 100ms</div>
//             <div style={{ fontSize: "0.72rem", color: C.text3, fontWeight: 600 }}>Acoustic Latency</div>
//           </div>
//           <div>
//             <div style={{ fontWeight: 800, fontSize: "1.3rem", color: C.amberDark }}>Level 2</div>
//             <div style={{ fontSize: "0.72rem", color: C.text3, fontWeight: 600 }}>Voice Authorized MFA</div>
//           </div>
//           <div>
//             <div style={{ fontWeight: 800, fontSize: "1.3rem", color: C.amberDark }}>99.2%</div>
//             <div style={{ fontSize: "0.72rem", color: C.text3, fontWeight: 600 }}>Diarization Accuracy</div>
//           </div>
//         </div> */}
//       </div>

//       {/* Premium Feature Showcase Section */}
//       <div style={{ background: "#FFFDF9", padding: "6rem 3rem", borderTop: `1px solid ${C.border}`, borderBottom: `1px solid ${C.border}` }}>
//         <div style={{ maxWidth: 1100, margin: "0 auto" }}>
//           <h2 style={{ textAlign: "center", fontSize: "2.4rem", fontWeight: 900, marginBottom: "0.8rem", letterSpacing: "-0.02em" }}>
//             The PILOT Workstation Suite
//           </h2>
//           <p style={{ textAlign: "center", color: C.text2, marginBottom: "4rem", fontSize: "1.05rem", maxWidth: 700, margin: "0 auto", lineHeight: 1.6 }}>
//             A suite of high-fidelity, voice-first applications built directly into the operating system. Streamline your workflow, manage correspondence, and generate presentations entirely through natural speech.
//           </p>

//           <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "2rem" }}>
            
//             {/* 1. Dashboard */}
//             <div style={{ background: "#FFFFFF", border: `1.5px solid ${C.border}`, borderRadius: 18, padding: "2rem", display: "flex", flexDirection: "column", gap: "1.2rem", boxShadow: "0 4px 20px rgba(0,0,0,0.02)" }}>
//               <div style={{ fontSize: "2rem" }}>🚀</div>
//               <div>
//                 <h3 style={{ fontSize: "1.2rem", fontWeight: 800, margin: "0 0 0.5rem 0", color: C.text1 }}>Real-Time OS Dashboard</h3>
//                 <p style={{ fontSize: "0.88rem", color: C.text2, lineHeight: 1.6, margin: 0 }}>
//                   The central command center of the voice operating system. Monitor audio signal frequencies, view continuous real-time transcriptions, and verify active speaker biometrics.
//                 </p>
//               </div>
//               <ul style={{ paddingLeft: "1.2rem", margin: 0, fontSize: "0.82rem", color: C.text2, display: "flex", flexDirection: "column", gap: "0.4rem" }}>
//                 <li>Continuous 16kHz microphone stream monitor</li>
//                 <li>Live transcript visualization with zero-latency updates</li>
//                 <li>Biometric voiceprint verification for secure system access</li>
//               </ul>
//             </div>

//             {/* 2. PPT Copilot */}
//             <div style={{ background: "#FFFFFF", border: `1.5px solid ${C.border}`, borderRadius: 18, padding: "2rem", display: "flex", flexDirection: "column", gap: "1.2rem", boxShadow: "0 4px 20px rgba(0,0,0,0.02)" }}>
//               <div style={{ fontSize: "2rem" }}>🖥️</div>
//               <div>
//                 <h3 style={{ fontSize: "1.2rem", fontWeight: 800, margin: "0 0 0.5rem 0", color: C.text1 }}>Widescreen PPT Copilot</h3>
//                 <p style={{ fontSize: "0.88rem", color: C.text2, lineHeight: 1.6, margin: 0 }}>
//                   A widescreen presentation workstation. Generate slides instantly via text prompts or hands-free voice dictation, and edit layout elements in real-time.
//                 </p>
//               </div>
//               <ul style={{ paddingLeft: "1.2rem", margin: 0, fontSize: "0.82rem", color: C.text2, display: "flex", flexDirection: "column", gap: "0.4rem" }}>
//                 <li>One-click direct voice slide generation</li>
//                 <li>Interactive sidebar editor for slide titles, bullets, and notes</li>
//                 <li>Dedicated AI Slide Agent for instant rewriting and optimization</li>
//               </ul>
//             </div>

//             {/* 3. Email Center */}
//             <div style={{ background: "#FFFFFF", border: `1.5px solid ${C.border}`, borderRadius: 18, padding: "2rem", display: "flex", flexDirection: "column", gap: "1.2rem", boxShadow: "0 4px 20px rgba(0,0,0,0.02)" }}>
//               <div style={{ fontSize: "2rem" }}>✉️</div>
//               <div>
//                 <h3 style={{ fontSize: "1.2rem", fontWeight: 800, margin: "0 0 0.5rem 0", color: C.text1 }}>Voice-First Email Center</h3>
//                 <p style={{ fontSize: "0.88rem", color: C.text2, lineHeight: 1.6, margin: 0 }}>
//                   Draft, refine, and dispatch professional correspondence entirely using natural speech. Organize communication queues and manage outboxes hands-free.
//                 </p>
//               </div>
//               <ul style={{ paddingLeft: "1.2rem", margin: 0, fontSize: "0.82rem", color: C.text2, display: "flex", flexDirection: "column", gap: "0.4rem" }}>
//                 <li>Continuous dictation for writing complex email drafts</li>
//                 <li>Automated recipient matching and subject line generation</li>
//                 <li>Background queue scheduling for reliable outbox delivery</li>
//               </ul>
//             </div>

//             {/* 4. Customer Care */}
//             <div style={{ background: "#FFFFFF", border: `1.5px solid ${C.border}`, borderRadius: 18, padding: "2rem", display: "flex", flexDirection: "column", gap: "1.2rem", boxShadow: "0 4px 20px rgba(0,0,0,0.02)" }}>
//               <div style={{ fontSize: "2rem" }}>✈️</div>
//               <div>
//                 <h3 style={{ fontSize: "1.2rem", fontWeight: 800, margin: "0 0 0.5rem 0", color: C.text1 }}>Real-Time Flight Tracker</h3>
//                 <p style={{ fontSize: "0.88rem", color: C.text2, lineHeight: 1.6, margin: 0 }}>
//                   A voice-driven customer service search utility. Query airline flight listings, sort tickets by price, and verify real-time seating slots.
//                 </p>
//               </div>
//               <ul style={{ paddingLeft: "1.2rem", margin: 0, fontSize: "0.82rem", color: C.text2, display: "flex", flexDirection: "column", gap: "0.4rem" }}>
//                 <li>Vocal flight searches (e.g., "Find flights to Delhi on Friday")</li>
//                 <li>Automatic price-sorted results with clear slot highlights</li>
//                 <li>Direct links to external search engines for booking validation</li>
//               </ul>
//             </div>

//             {/* 5. Meetings Room */}
//             <div style={{ background: "#FFFFFF", border: `1.5px solid ${C.border}`, borderRadius: 18, padding: "2rem", display: "flex", flexDirection: "column", gap: "1.2rem", boxShadow: "0 4px 20px rgba(0,0,0,0.02)" }}>
//               <div style={{ fontSize: "2rem" }}>📞</div>
//               <div>
//                 <h3 style={{ fontSize: "1.2rem", fontWeight: 800, margin: "0 0 0.5rem 0", color: C.text1 }}>Talkinia Meetings Room</h3>
//                 <p style={{ fontSize: "0.88rem", color: C.text2, lineHeight: 1.6, margin: 0 }}>
//                   A collaborative stream room for remote discussions. Synchronizes multi-party meeting sessions with automatic speaker diarization and audio transcriptions.
//                 </p>
//               </div>
//               <ul style={{ paddingLeft: "1.2rem", margin: 0, fontSize: "0.82rem", color: C.text2, display: "flex", flexDirection: "column", gap: "0.4rem" }}>
//                 <li>Multi-speaker session audio streaming</li>
//                 <li>Real-time diarization attributing dialogue to specific speakers</li>
//                 <li>Synchronized navigation state between parent and child stream apps</li>
//               </ul>
//             </div>

//           </div>
//         </div>
//       </div>

//       {/* features grid */}
//       <div style={{ background:"#FAF9F5", padding:"4rem 3rem" }}>
//         <h2 style={{ textAlign:"center", fontSize:"2rem", fontWeight:900, marginBottom:"0.6rem", fontFamily: "Inter, sans-serif" }}>
//           Intelligence at the edge.
//         </h2>
//         <p style={{ textAlign:"center", color:C.text3, marginBottom:"3rem", fontSize:"0.95rem" }}>
//           Built from the ground up to process voice seamlessly, securely, and instantly across your entire workflow.
//         </p>
//         <div style={{ maxWidth:1100, margin:"0 auto", display:"grid",
//                       gridTemplateColumns:"repeat(3,1fr)", gap:"1.25rem" }}>
//           {[{icon:"🎙",t:"Continuous Listening",d:"Always on, zero latency wake words. Understands context before you finish your sentence."},
//             {icon:"👥",t:"Speaker Recognition",d:"Advanced biometrics instantly identify who is speaking, attributing transcripts to the correct member."},
//             {icon:"🔐",t:"Voice Authorization",d:"Secure high-stakes actions with voice-print verification without touching a keyboard."},
//             {icon:"🤖",t:"Background Agents",d:"Deploy autonomous agents that listen to meetings, draft emails, and update CRM records invisibly."},
//             {icon:"⚡",t:"Realtime Transcription",d:"Sub-100ms latency transcription locally processed on device with high accuracy."}
//           ].map((f,i)=>(
//             <div key={i} style={{ background:C.surface, border:`1.5px solid ${C.border}`,
//                                    borderRadius:14, padding:"1.4rem", boxShadow: "0 4px 12px rgba(0,0,0,0.02)" }}>
//               <div style={{ fontSize:"1.4rem", marginBottom:"0.65rem" }}>{f.icon}</div>
//               <div style={{ fontWeight:800, fontSize:"1rem", marginBottom:"0.4rem", fontFamily: "Inter, sans-serif" }}>{f.t}</div>
//               <div style={{ fontSize:"0.84rem", color:C.text2, lineHeight:1.6 }}>{f.d}</div>
//             </div>
//           ))}
//         </div>
//       </div>
//     </div>
//   );
// }

// /* ── LOGIN ── */
// function LoginPage() {
//   const store = useAppStore();
//   const [email,setEmail]=useState(""); const [pw,setPw]=useState("");
//   const [err,setErr]=useState(""); const [loading,setLoading]=useState(false);
//   async function submit() {
//     setErr(""); setLoading(true);
//     try {
//       const r=await api("POST","/auth/login",{email,password:pw});
//       store.setUser(r.user,r.access_token);
//       store.setPage("dashboard");
//     }
//     catch(e:any){ setErr(e.message); } finally { setLoading(false); }
//   }
//   return (
//     <div style={{ minHeight:"100vh", background:"linear-gradient(135deg,#f8f6f0,#ede8e0)",
//                   display:"flex", alignItems:"center", justifyContent:"center" }}>
//       <div style={{ background:"#fff", borderRadius:20, padding:"2.5rem", width:400,
//                     boxShadow:"0 8px 48px rgba(0,0,0,0.08)", position:"relative" }}>
//         <button onClick={()=>store.setPage("landing")}
//           style={{ position:"absolute",top:"1rem",left:"1rem",background:"none",border:"none",
//                    color:C.text3,cursor:"pointer",fontSize:"0.85rem",display:"flex",
//                    alignItems:"center",gap:"0.3rem" }}>← Back</button>
//         <div style={{ textAlign:"center", marginBottom:"1.75rem" }}>
//           <div style={{ width:50,height:50,borderRadius:14,background:"#111111",
//                         display:"flex",alignItems:"center",justifyContent:"center",
//                         margin:"0 auto 1rem", boxShadow: "0 4px 12px rgba(245,167,0,0.2)" }}>
//             <PILOTLogo size={36} />
//           </div>
//           <h2 style={{ fontSize:"1.6rem", fontWeight:800 }}>Welcome back</h2>
//           <p style={{ color:C.text3, fontSize:"0.88rem" }}>Log in to your PILOT OS account to continue.</p>
//         </div>
//         <label style={{ fontSize:"0.8rem",fontWeight:500,display:"block",marginBottom:"0.3rem" }}>Email address</label>
//         <input style={{...inp,marginBottom:"0.85rem"}} type="email" value={email}
//           onChange={e=>setEmail(e.target.value)} placeholder="name@company.com"/>
//         <div style={{ display:"flex",justifyContent:"space-between",marginBottom:"0.3rem" }}>
//           <label style={{ fontSize:"0.8rem",fontWeight:500 }}>Password</label>
//           <span onClick={()=>store.setPage("forgot")} style={{ fontSize:"0.78rem",color:C.amberDark,cursor:"pointer" }}>Forgot password?</span>
//         </div>
//         <input style={{...inp}} type="password" value={pw}
//           onChange={e=>setPw(e.target.value)} placeholder="••••••••"
//           onKeyDown={e=>e.key==="Enter"&&submit()}/>
//         {err&&<div style={{ color:"#EF4444",fontSize:"0.78rem",marginTop:"0.4rem" }}>{err}</div>}
//         <button onClick={submit} disabled={loading}
//           style={{ width:"100%",padding:"0.85rem",borderRadius:30,background:"#6B5100",
//                    color:"#fff",fontWeight:700,border:"none",marginTop:"1rem",fontSize:"0.92rem",cursor:"pointer" }}>
//           {loading?"Logging in…":"Log In →"}
//         </button>
//         <p style={{ textAlign:"center",fontSize:"0.83rem",color:C.text3,marginTop:"1.1rem" }}>
//           Don't have an account?{" "}
//           <span style={{ color:C.amberDark,cursor:"pointer",fontWeight:600 }} onClick={()=>store.setPage("signup")}>Sign up</span>
//         </p>
//       </div>
//     </div>
//   );
// }

// /* ── SIGNUP ── */
// function SignupPage() {
//   const store = useAppStore();
//   const [name, setName] = useState("");
//   const [email, setEmail] = useState("");
//   const [role, setRole] = useState("developer");
//   const [pw, setPw] = useState("");
//   const [pw2, setPw2] = useState("");
//   const [err, setErr] = useState("");
//   const [loading, setLoading] = useState(false);

//   // Voice Calibration States
//   const [phase, setPhase] = useState<"idle" | "recording" | "done">("idle");
//   const [round, setRound] = useState(1);
//   const [clarity, setClarity] = useState(0);
//   const [bars, setBars] = useState<number[]>(new Array(9).fill(3));
//   const [audioBlobs, setAudioBlobs] = useState<Blob[]>([]);

//   const mrRef = useRef<MediaRecorder | null>(null);
//   const roundChunks = useRef<Blob[]>([]);
//   const animRef = useRef<number>(0);
//   const streamRef = useRef<MediaStream | null>(null);

//   // Automatically release resources on unmount
//   useEffect(() => {
//     return () => {
//       cancelAnimationFrame(animRef.current);
//       if (streamRef.current) {
//         streamRef.current.getTracks().forEach(t => t.stop());
//       }
//     };
//   }, []);

//   async function startRec() {
//     setErr("");
//     try {
//       if (!navigator.mediaDevices) {
//         throw new Error("Microphone access is unavailable. Please ensure you are using a secure context (HTTPS or localhost) and have granted microphone permissions.");
//       }
//       // Stop previous stream if any
//       if (streamRef.current) {
//         streamRef.current.getTracks().forEach(t => t.stop());
//       }
//       const stream = await navigator.mediaDevices.getUserMedia({
//         audio: {
//           echoCancellation: true,
//           noiseSuppression: true,
//           autoGainControl:  true,
//           sampleRate:       16000,
//           channelCount:     1,
//         },
//       });
//       streamRef.current = stream;

//       const ctx = new AudioContext();
//       const src = ctx.createMediaStreamSource(stream);
//       const an = ctx.createAnalyser();
//       an.fftSize = 128;
//       src.connect(an);

//       const tick = () => {
//         const d = new Uint8Array(an.frequencyBinCount);
//         an.getByteFrequencyData(d);
        
//         // Map current frequency data to bars
//         const currentBars = Array.from(d.slice(0, 9)).map(v => 3 + Math.floor(v / 255 * 22));
//         setBars(currentBars);
        
//         // Calculate raw real-time volume/rms energy from the FFT bins
//         const sum = d.reduce((acc, val) => acc + val, 0);
//         const avgVolume = sum / d.length;
        
//         // Determine clarity dynamically based on the vocal characteristics of active speaking:
//         // Human voice typically centers around specific frequency bands (FFT bins 2-12).
//         // If there's active voice energy, clarity dynamically modulates between 80% - 98%.
//         // If there's low energy, clarity settles down representing ambient room noise clarity.
//         if (avgVolume > 15) {
//           // Speak active: compute stable, realistic clarity with vocal resonance variation
//           const vocalResonance = d.slice(2, 12).reduce((acc, val) => acc + val, 0) / 10;
//           const dynamicClarity = Math.min(98, Math.max(78, Math.floor(75 + (vocalResonance / 255) * 23)));
//           setClarity(dynamicClarity);
//         } else {
//           // Silence or ambient room noise: low clarity
//           setClarity(c => Math.max(0, Math.floor(c * 0.9)));
//         }

//         animRef.current = requestAnimationFrame(tick);
//       };
//       tick();

//       const mr = new MediaRecorder(stream, { mimeType: "audio/webm" });
//       mrRef.current = mr;
//       roundChunks.current = [];
//       mr.ondataavailable = e => {
//         if (e.data.size > 0) roundChunks.current.push(e.data);
//       };
//       mr.start(500);
//       setPhase("recording");
//     } catch (e: any) {
//       setErr(e.message || "Microphone access denied. Please allow microphone permissions.");
//     }
//   }

//   function stopRec() {
//     cancelAnimationFrame(animRef.current);
//     return new Promise<void>(resolve => {
//       const mr = mrRef.current;
//       if (mr && mr.state !== "inactive") {
//         mr.onstop = () => { resolve(); };
//         mr.stop();
//       } else {
//         resolve();
//       }
//     });
//   }

//   async function handleStop() {
//     await stopRec();
//     if (streamRef.current) {
//       streamRef.current.getTracks().forEach(t => t.stop());
//     }
//     setPhase("done");
//   }

//   async function saveRound() {
//     await stopRec();
//     if (streamRef.current) {
//       streamRef.current.getTracks().forEach(t => t.stop());
//     }

//     if (roundChunks.current.length === 0) {
//       setErr("No audio captured. Please complete the recording first.");
//       return;
//     }

//     const blob = new Blob(roundChunks.current, { type: "audio/webm" });
//     const newBlobs = [...audioBlobs, blob];
//     setAudioBlobs(newBlobs);

//     if (round < 3) {
//       setRound(r => r + 1);
//       setPhase("idle");
//       setClarity(0);
//       setBars(new Array(9).fill(3));
//       roundChunks.current = [];
//     } else {
//       setPhase("done");
//     }
//   }

//   function resetVoice() {
//     setAudioBlobs([]);
//     setRound(1);
//     setPhase("idle");
//     setClarity(0);
//     setBars(new Array(9).fill(3));
//     roundChunks.current = [];
//   }

//   function validateCredentials() {
//     if (!name.trim() || !email.trim()) {
//       setErr("Please fill in your Full Name and Email Address.");
//       return false;
//     }
//     if (pw.length < 8) {
//       setErr("Password must be at least 8 characters.");
//       return false;
//     }
//     if (pw !== pw2) {
//       setErr("Passwords do not match.");
//       return false;
//     }
//     return true;
//   }

//   async function submit() {
//     setErr("");
//     if (!validateCredentials()) return;
//     if (audioBlobs.length < 3) {
//       setErr("Please complete all 3 rounds of voice calibration.");
//       return;
//     }

//     setLoading(true);
//     try {
//       const fd = new FormData();
//       fd.append("name", name);
//       fd.append("email", email);
//       fd.append("password", pw);
//       fd.append("role", role);
//       audioBlobs.forEach((blob, idx) => {
//         fd.append("audio", blob, `round_${idx + 1}.webm`);
//       });

//       const res = await fetch("/api/v1/auth/signup", {
//         method: "POST",
//         headers: {
//           // Remove manually set headers or use correct API format
//         },
//         body: fd,
//       });

//       if (!res.ok) {
//         const e = await res.json().catch(() => ({}));
//         throw new Error(e.detail ?? res.statusText);
//       }

//       await res.json();
//       store.setPendingEmail(email);
//       store.setPage("verify"); // Move to OTP verification page!
//     } catch (e: any) {
//       setErr(e.message || "Signup failed. Please try again.");
//     } finally {
//       setLoading(false);
//     }
//   }

//   const steps = [
//     { n: 1, l: "Register" },
//     { n: 2, l: "Verify" }
//   ];

//   return (
//     <div style={{ minHeight:"100vh", background:"linear-gradient(135deg,#f8f6f0,#ede8e0)",
//                   display:"flex", alignItems:"center", justifyContent:"center", padding: "2rem" }}>
//       <div style={{ background:"#fff", borderRadius:20, padding:"2.5rem", width: 760,
//                     boxShadow:"0 8px 48px rgba(0,0,0,0.08)", position:"relative" }}>
//         <button onClick={()=>store.setPage("landing")}
//           style={{ position:"absolute",top:"1rem",left:"1rem",background:"none",border:"none",
//                    color:C.text3,cursor:"pointer",fontSize:"0.85rem",display:"flex",
//                    alignItems:"center",gap:"0.3rem" }}>← Back</button>
        
//         {/* steps */}
//         <div style={{ display:"flex", alignItems:"center", marginBottom:"1.75rem", justifyContent: "center" }}>
//           <div style={{ display: "flex", gap: "1rem", alignItems: "center", width: "100%", maxWidth: 180 }}>
//             {steps.map((s,i)=>(
//               <React.Fragment key={s.n}>
//                 <div style={{ display:"flex",flexDirection:"column",alignItems:"center",gap:"0.2rem" }}>
//                   <div style={{ width:30,height:30,borderRadius:"50%",display:"flex",
//                                 alignItems:"center",justifyContent:"center",fontSize:"0.78rem",fontWeight:700,
//                                 background:s.n===1?C.amber:"#F0EDE8",
//                                 color:s.n===1?"#fff":"#999" }}>
//                     {s.n}
//                   </div>
//                   <span style={{ fontSize:"0.6rem",color:s.n===1?C.amberDark:"#AAA",fontWeight:500 }}>{s.l}</span>
//                 </div>
//                 {i<steps.length-1&&<div style={{ flex:1,height:2,background:C.border,marginBottom:"10px" }}/>}
//               </React.Fragment>
//             ))}
//           </div>
//         </div>

//         <h2 style={{ fontSize:"1.5rem",fontWeight:800,marginBottom:"0.2rem", textAlign: "center" }}>
//           Create your account & Enroll Voice
//         </h2>
//         <p style={{ color:C.text3,fontSize:"0.83rem",marginBottom:"1.8rem", textAlign: "center" }}>
//           Provide your details and complete the 3 calibration rounds side-by-side to register.
//         </p>

//         <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2.5rem" }}>
//           {/* Left Column: Credentials */}
//           <div style={{ display: "flex", flexDirection: "column", gap: "0.8rem" }}>
//             <h3 style={{ fontSize: "1rem", fontWeight: 700, color: C.amberDark, margin: "0 0 0.2rem" }}>
//               1. Profile Details
//             </h3>
            
//             <div>
//               <label style={{ fontSize:"0.8rem",fontWeight:500,display:"block",marginBottom:"0.3rem" }}>Full Name</label>
//               <input style={inp} value={name} onChange={e=>setName(e.target.value)} placeholder="Ada Lovelace"/>
//             </div>

//             <div>
//               <label style={{ fontSize:"0.8rem",fontWeight:500,display:"block",marginBottom:"0.3rem" }}>Email</label>
//               <input style={inp} type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="name@company.com"/>
//             </div>

//             <div>
//               <label style={{ fontSize:"0.8rem",fontWeight:500,display:"block",marginBottom:"0.3rem" }}>Role</label>
//               <select style={inp} value={role} onChange={e=>setRole(e.target.value)}>
//                 <option value="developer">Developer</option>
//                 <option value="manager">Manager</option>
//                 <option value="csr">Customer Service Rep</option>
//                 <option value="operator">Operator</option>
//                 <option value="admin">Admin</option>
//               </select>
//             </div>

//             <div>
//               <label style={{ fontSize:"0.8rem",fontWeight:500,display:"block",marginBottom:"0.3rem" }}>Password</label>
//               <input style={inp} type="password" value={pw} onChange={e=>setPw(e.target.value)} placeholder="min 8 characters"/>
//             </div>

//             <div>
//               <label style={{ fontSize:"0.8rem",fontWeight:500,display:"block",marginBottom:"0.3rem" }}>Confirm Password</label>
//               <input style={inp} type="password" value={pw2} onChange={e=>setPw2(e.target.value)} placeholder="repeat password"/>
//             </div>
//           </div>

//           {/* Right Column: Voice Calibration */}
//           <div style={{ display: "flex", flexDirection: "column", borderLeft: `1.5px solid ${C.border}`, paddingLeft: "2.5rem" }}>
//             <h3 style={{ fontSize: "1rem", fontWeight: 700, color: C.amberDark, margin: "0 0 0.2rem" }}>
//               2. Voice Calibration
//             </h3>

//             {audioBlobs.length === 3 ? (
//               <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flex: 1, textAlign: "center", gap: "1rem" }}>
//                 <div style={{ fontSize: "3rem", color: C.green }}>✓</div>
//                 <div style={{ fontWeight: 700, color: C.text1 }}>Voice Registered Successfully!</div>
//                 <div style={{ fontSize: "0.83rem", color: C.text3 }}>All 3 calibration rounds have been captured.</div>
//                 <button onClick={resetVoice}
//                   style={{ padding: "0.45rem 1rem", borderRadius: 8, border: `1.5px solid ${C.border}`,
//                            background: "#fff", fontWeight: 600, fontSize: "0.8rem", color: C.text2, cursor: "pointer" }}>
//                   🔄 Re-record Voice
//                 </button>
//               </div>
//             ) : (
//               <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
//                 {/* Round progress */}
//                 <div style={{ display:"flex",alignItems:"center",gap:"0.4rem",marginBottom:"1rem", marginTop: "0.5rem" }}>
//                   {[1,2,3].map(r=>(
//                     <div key={r} style={{ flex:1,height:5,borderRadius:3,transition:"background 0.3s",
//                                           background:audioBlobs.length >= r ? C.green : round === r ? C.amber : C.border }}/>
//                   ))}
//                   <span style={{ fontSize:"0.72rem",color:C.text3,whiteSpace:"nowrap" }}>Round {round}/3</span>
//                 </div>

//                 {/* Calibration text */}
//                 <div style={{ marginBottom:"1rem" }}>
//                   <div style={{ display:"inline-block",padding:"0.2rem 0.65rem",borderRadius:20,
//                                 background:C.amber,color:"#fff",fontSize:"0.65rem",
//                                 fontWeight:700,letterSpacing:"0.08em",marginBottom:"0.5rem" }}>
//                     READ ALOUD PASSAGE
//                   </div>
//                   <div style={{ background:"#F9F8F6",border:`1.5px solid ${C.border}`,borderRadius:10,
//                                 padding:"0.8rem",fontSize:"0.83rem",fontWeight:500,lineHeight:1.55,
//                                 color:C.text1 }}>
//                     {round === 1 && `"I am securely enrolling my voice into the PILOT system. This unique vocal signature will verify my identity."`}
//                     {round === 2 && `"I authorize PILOT to act on my commands and confirm that I am the registered user of this system."`}
//                     {round === 3 && `"My voice is my password. It is unique, secure, and personal to me in every operation."`}
//                   </div>
//                 </div>

//                 {/* Mic button + bars */}
//                 <div style={{ display:"flex",flexDirection:"column",alignItems:"center",gap:"0.5rem", flex: 1, justifyContent: "center" }}>
//                   <button onClick={phase==="recording"?handleStop:startRec}
//                     style={{ width:54,height:54,borderRadius:"50%",
//                              background:phase==="recording"?"#EF4444":C.amberDark,
//                              border:"none",fontSize:"1.2rem",color:"#fff",cursor:"pointer",
//                              boxShadow:phase==="recording"?"0 0 0 8px rgba(239,68,68,0.15)":"none",
//                              transition:"all 0.2s" }}>
//                     {phase==="recording"?"⏹":"🎤"}
//                   </button>
//                   <div style={{ display:"flex",alignItems:"flex-end",gap:"3px",height:20 }}>
//                     {bars.map((h,i)=>(
//                       <div key={i} style={{ width:4,borderRadius:2,background:C.amberDark,
//                                             height:phase==="recording"?h:3,transition:"height 0.1s" }}/>
//                     ))}
//                   </div>
//                   <div style={{ fontSize:"0.75rem",color:C.text3,textAlign:"center" }}>
//                     {phase==="idle"?`Tap mic to start Round ${round}`:
//                      phase==="recording"?"Recording… read passage above":
//                      `Round ${round} captured ✓`}
//                   </div>
//                   {phase!=="idle"&&(
//                     <div style={{ width:"100%",marginTop:"0.2rem" }}>
//                       <div style={{ display:"flex",justifyContent:"space-between",
//                                     fontSize:"0.68rem",fontWeight:700,color:C.text3,marginBottom:"0.2rem" }}>
//                         <span>CLARITY SCORE</span><span style={{ color:C.green }}>{clarity}%</span>
//                       </div>
//                       <div style={{ height:6,background:C.border,borderRadius:3,overflow:"hidden" }}>
//                         <div style={{ height:"100%",background:C.green,borderRadius:3,
//                                       width:`${clarity}%`,transition:"width 0.3s" }}/>
//                       </div>
//                     </div>
//                   )}

//                   {phase==="done" && (
//                     <button onClick={saveRound}
//                       style={{ padding:"0.55rem 1.2rem",borderRadius:10,background:C.amber,
//                                border:"none",color:"#fff",fontWeight:600,fontSize:"0.8rem",cursor:"pointer", marginTop: "0.5rem" }}>
//                       Save Round {round} {round < 3 ? `& Go to Round ${round + 1} →` : `& Complete`}
//                     </button>
//                   )}
//                 </div>
//               </div>
//             )}
//           </div>
//         </div>

//         {err&&<div style={{ color:"#EF4444",fontSize:"0.78rem",marginTop:"1.2rem",textAlign:"center" }}>{err}</div>}

//         <button onClick={submit} disabled={loading || audioBlobs.length < 3}
//           style={{ width:"100%",padding:"0.85rem",borderRadius:30,
//                    background:audioBlobs.length === 3 ? "#6B5100" : "#E5E2DA",
//                    color:audioBlobs.length === 3 ? "#fff" : "#AAA",
//                    fontWeight:700,border:"none",marginTop:"1.8rem",cursor:audioBlobs.length === 3 ? "pointer" : "not-allowed" }}>
//           {loading ? "Registering profile…" : audioBlobs.length < 3 ? "Complete Voice Calibration to Sign Up" : "Create Account & Enroll Voice →"}
//         </button>

//         <p style={{ textAlign:"center",fontSize:"0.83rem",color:C.text3,marginTop:"1rem" }}>
//           Already have an account?{" "}
//           <span style={{ color:C.amberDark,cursor:"pointer",fontWeight:600 }} onClick={()=>store.setPage("login")}>Sign in</span>
//         </p>
//       </div>
//     </div>
//   );
// }

// /* ── OTP ── */
// function OTPPage() {
//   const store = useAppStore();
//   const [digits,setDigits]=useState(["","","","","",""]);
//   const [err,setErr]=useState(""); const [loading,setLoading]=useState(false);
//   const refs=Array.from({length:6},()=>useRef<HTMLInputElement>(null));
//   function upd(i:number,v:string){ if(!/^\d?$/.test(v))return; const d=[...digits];d[i]=v;setDigits(d); if(v&&i<5)refs[i+1].current?.focus(); }
//   function kd(i:number,e:React.KeyboardEvent){ if(e.key==="Backspace"&&!digits[i]&&i>0)refs[i-1].current?.focus(); }
//   async function verify(){
//     const otp=digits.join("");
//     if(otp.length!==6){setErr("Enter all 6 digits");return;}
//     setErr("");setLoading(true);
//     try{
//       const r=await api("POST","/auth/verify-otp",{email:store.pendingEmail,otp});
//       store.setUser(r.user,r.access_token);
//       store.setPage("dashboard");
//     }
//     catch(e:any){setErr(e.message);}
//     finally{setLoading(false);}
//   }
//   return (
//     <div style={{ minHeight:"100vh", background:"linear-gradient(135deg,#f8f6f0,#ede8e0)",
//                   display:"flex", alignItems:"center", justifyContent:"center" }}>
//       <div style={{ background:"#fff",borderRadius:20,padding:"2.5rem",width:420,
//                     boxShadow:"0 8px 48px rgba(0,0,0,0.08)",textAlign:"center" }}>
//         <div style={{ width:50,height:50,borderRadius:14,background:"#111111",
//                       display:"flex",alignItems:"center",justifyContent:"center",
//                       margin:"0 auto 1rem", boxShadow: "0 4px 12px rgba(245,167,0,0.2)" }}>
//           <PILOTLogo size={36} />
//         </div>
//         <h2 style={{ fontSize:"1.5rem",fontWeight:800,marginBottom:"0.25rem" }}>Check your email</h2>
//         <p style={{ color:C.text3,fontSize:"0.85rem",marginBottom:"1.5rem" }}>
//           We sent a 6-digit code to <strong>{store.pendingEmail}</strong>
//         </p>
//         <div style={{ display:"flex",gap:"0.55rem",justifyContent:"center",marginBottom:"1.4rem" }}>
//           {digits.map((d,i)=>(
//             <input key={i} ref={refs[i]} value={d} maxLength={1} inputMode="numeric"
//               onChange={e=>upd(i,e.target.value)} onKeyDown={e=>kd(i,e)}
//               style={{ width:50,height:58,borderRadius:12,border:`2px solid ${C.border}`,
//                        textAlign:"center",fontSize:"1.5rem",fontWeight:700,
//                        background:"#F9F8F6",outline:"none",color:C.text1 }}/>
//           ))}
//         </div>
//         {err&&<div style={{ color:"#EF4444",fontSize:"0.78rem",marginBottom:"0.6rem" }}>{err}</div>}
//         <button onClick={verify} disabled={loading}
//           style={{ width:"100%",padding:"0.85rem",borderRadius:30,background:"#6B5100",
//                    color:"#fff",fontWeight:700,border:"none",cursor:"pointer" }}>
//           {loading?"Verifying…":"Verify & Continue →"}
//         </button>
//         <p style={{ fontSize:"0.8rem",color:C.text3,marginTop:"1rem" }}>
//           Didn't receive it?{" "}
//           <span style={{ color:C.amberDark,cursor:"pointer" }}
//             onClick={()=>api("POST","/auth/send-otp",{email:store.pendingEmail})}>Resend</span>
//         </p>
//       </div>
//     </div>
//   );
// }

// /* ── VOICE CALIBRATION — 3 rounds, all chunks accumulated ── */
// function VoiceCalibration() {
//   const store = useAppStore();
//   const [phase,   setPhase]   = useState<"idle"|"recording"|"done">("idle");
//   const [round,   setRound]   = useState(1);
//   const [clarity, setClarity] = useState(0);
//   const [bars,    setBars]    = useState<number[]>(new Array(9).fill(3));
//   const [voiceId, setVoiceId] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [err,     setErr]     = useState("");
//   const mrRef       = useRef<MediaRecorder|null>(null);
//   const allChunks   = useRef<Blob[]>([]);   // accumulates ALL rounds — never cleared between rounds
//   const animRef     = useRef<number>(0);
//   const streamRef   = useRef<MediaStream|null>(null);

//   async function startRec() {
//     setErr("");
//     if (!navigator.mediaDevices) {
//       setErr("Microphone access is unavailable. Please ensure you are using a secure context (HTTPS or localhost) and have granted microphone permissions.");
//       return;
//     }
//     // Stop previous stream if any
//     streamRef.current?.getTracks().forEach(t=>t.stop());
//     const stream = await navigator.mediaDevices.getUserMedia({
//       audio: {
//         echoCancellation: true,
//         noiseSuppression: true,
//         autoGainControl:  true,
//         sampleRate:       16000,
//         channelCount:     1,
//       },
//     });
//     streamRef.current = stream;
//     const ctx = new AudioContext();
//     const src = ctx.createMediaStreamSource(stream);
//     const an  = ctx.createAnalyser(); an.fftSize=128; src.connect(an);
//     const tick = () => {
//       const d = new Uint8Array(an.frequencyBinCount); an.getByteFrequencyData(d);
//       setBars(Array.from(d.slice(0,9)).map(v=>3+Math.floor(v/255*22)));
//       setClarity(c=>Math.min(97,c+2));
//       animRef.current = requestAnimationFrame(tick);
//     }; tick();
//     const mr = new MediaRecorder(stream, {mimeType:"audio/webm"});
//     mrRef.current = mr;
//     // IMPORTANT: append to allChunks — don't reset between rounds
//     mr.ondataavailable = e => { if(e.data.size>0) allChunks.current.push(e.data); };
//     mr.start(500);   // collect chunks every 500ms for reliability
//     setPhase("recording");
//   }

//   function stopRec() {
//     cancelAnimationFrame(animRef.current);
//     return new Promise<void>(resolve => {
//       const mr = mrRef.current;
//       if (mr && mr.state !== "inactive") {
//         mr.onstop = () => { resolve(); };
//         mr.stop();
//       } else {
//         resolve();
//       }
//     });
//   }

//   async function handleStop() {
//     await stopRec();
//     streamRef.current?.getTracks().forEach(t=>t.stop());
//     setPhase("done");
//   }

//   async function nextRound() {
//     await stopRec();   // ensure recording is fully stopped and chunks flushed
//     streamRef.current?.getTracks().forEach(t=>t.stop());
//     if (round < 3) {
//       setRound(r=>r+1);
//       setPhase("idle");
//       setClarity(0);
//       setBars(new Array(9).fill(3));
//       // DO NOT clear allChunks — we accumulate all 3 rounds
//     } else {
//       setPhase("done");
//       await submit();
//     }
//   }

//   async function submit() {
//     if (allChunks.current.length === 0) {
//       setErr("No audio recorded. Please record at least one round.");
//       return;
//     }
//     setLoading(true); setErr("");
//     try {
//       const token = localStorage.getItem("pilot_token")!;
//       const role  = store.user?.role || "developer";
//       const enroll = await api("POST","/enrollment/start",{name:store.user?.name||"User",role});
//       // Combine ALL chunks from all 3 rounds into one blob
//       const blob = new Blob(allChunks.current, {type:"audio/webm"});
//       if (blob.size < 1000) { setErr("Recording too short. Please try again."); return; }
//       const fd = new FormData();
//       fd.append("speaker_id", String(enroll.speaker_id));
//       fd.append("audio", blob, "enrollment.webm");
//       const res = await fetch("/api/v1/enrollment/audio",{
//         method:"POST", headers:{Authorization:`Bearer ${token}`}, body:fd
//       }).then(r=>r.json());
//       setVoiceId(res.voice_id || `#${String(enroll.speaker_id).padStart(6,"0")}`);
//       setTimeout(()=>store.setPage("dashboard"), 1500);
//     } catch(e:any) {
//       setErr(e.message||"Enrollment failed. Please try again.");
//     } finally {
//       setLoading(false);
//     }
//   }

//   const phaseDots=[
//     {l:"Reading\nStarted", done:phase!=="idle"},
//     {l:"Voice\nCaptured",  done:phase==="done"},
//     {l:"Embedding\nGenerated", done:!!voiceId},
//   ];

//   return (
//     <div style={{ minHeight:"100vh", background:C.bg, display:"flex",
//                   flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"2rem" }}>
//       <div style={{ color:C.amberDark,fontSize:"0.78rem",fontWeight:700,
//                     letterSpacing:"0.06em",marginBottom:"0.4rem" }}>⚡ STEP 4 OF 4</div>
//       <h2 style={{ fontSize:"1.9rem",fontWeight:900,marginBottom:"0.4rem" }}>Voice Calibration</h2>
//       <p style={{ color:C.text3,textAlign:"center",maxWidth:480,marginBottom:"1.75rem",fontSize:"0.88rem" }}>
//         Please read the following text naturally. This allows PILOT to build a secure biometric model of your voice.
//       </p>

//       <div style={{ background:"#fff",borderRadius:20,padding:"2rem",width:"100%",maxWidth:600,
//                     boxShadow:"0 4px 24px rgba(0,0,0,0.06)" }}>
//         {/* Role badge — read-only, fixed at signup */}
//         <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",
//                       paddingBottom:"1rem",borderBottom:`1px solid ${C.border}`,marginBottom:"1rem" }}>
//           <div>
//             <div style={{ fontWeight:600,fontSize:"0.88rem" }}>Voice Profile Role</div>
//             <div style={{ fontSize:"0.75rem",color:C.text3 }}>Fixed to your account role — assigned at signup.</div>
//           </div>
//           <div style={{ padding:"0.4rem 1rem",borderRadius:20,background:C.amberBg,
//                        border:`1.5px solid ${C.amber}`,fontSize:"0.82rem",
//                        fontWeight:700,color:C.amberDark }}>
//             {(store.user?.role||"developer").toUpperCase()}
//           </div>
//         </div>

//         {/* Round progress */}
//         <div style={{ display:"flex",alignItems:"center",gap:"0.4rem",marginBottom:"0.9rem" }}>
//           {[1,2,3].map(r=>(
//             <div key={r} style={{ flex:1,height:5,borderRadius:3,transition:"background 0.3s",
//                                   background:round>r?C.green:round===r?C.amber:C.border }}/>
//           ))}
//           <span style={{ fontSize:"0.72rem",color:C.text3,whiteSpace:"nowrap" }}>Round {round}/3</span>
//         </div>

//         {/* Two calibration phrases — flaw 5 */}
//         <div style={{ marginBottom:"1.1rem" }}>
//           <div style={{ display:"inline-block",padding:"0.2rem 0.65rem",borderRadius:20,
//                         background:C.amber,color:"#fff",fontSize:"0.65rem",
//                         fontWeight:700,letterSpacing:"0.08em",marginBottom:"0.55rem" }}>
//             CALIBRATION TEXT — ROUND {round}
//           </div>
//           {/* Phrase 1 */}
//           <div style={{ background:"#F9F8F6",border:`1.5px solid ${C.border}`,borderRadius:10,
//                         padding:"0.9rem 1rem",fontSize:"0.95rem",fontWeight:500,lineHeight:1.65,
//                         color:C.text1,marginBottom:"0.5rem" }}>
//             "I am securely enrolling my voice into the PILOT system.
//             This unique vocal signature will verify my identity."
//           </div>
//           {/* Phrase 2 */}
//           <div style={{ background:"#F9F8F6",border:`1.5px solid ${C.border}`,borderRadius:10,
//                         padding:"0.9rem 1rem",fontSize:"0.95rem",fontWeight:500,lineHeight:1.65,
//                         color:C.text1 }}>
//             "I authorize PILOT to act on my commands and confirm
//             that I am the registered user of this system."
//           </div>
//         </div>

//         {/* Mic button + bars */}
//         <div style={{ display:"flex",flexDirection:"column",alignItems:"center",gap:"0.6rem" }}>
//           <button onClick={phase==="recording"?handleStop:startRec}
//             style={{ width:58,height:58,borderRadius:"50%",
//                      background:phase==="recording"?"#EF4444":C.amberDark,
//                      border:"none",fontSize:"1.3rem",color:"#fff",cursor:"pointer",
//                      boxShadow:phase==="recording"?"0 0 0 8px rgba(239,68,68,0.15)":"none",
//                      transition:"all 0.2s" }}>
//             {phase==="recording"?"⏹":"🎤"}
//           </button>
//           <div style={{ display:"flex",alignItems:"flex-end",gap:"3px",height:24 }}>
//             {bars.map((h,i)=>(
//               <div key={i} style={{ width:4,borderRadius:2,background:C.amberDark,
//                                     height:phase==="recording"?h:3,transition:"height 0.1s" }}/>
//             ))}
//           </div>
//           <div style={{ fontSize:"0.78rem",color:C.text3 }}>
//             {phase==="idle"?`Tap mic to start Round ${round}`:
//              phase==="recording"?"Recording… read both passages above":
//              `Round ${round} captured ✓`}
//           </div>
//           {phase!=="idle"&&(
//             <div style={{ width:"100%",marginTop:"0.2rem" }}>
//               <div style={{ display:"flex",justifyContent:"space-between",
//                             fontSize:"0.7rem",fontWeight:700,color:C.text3,marginBottom:"0.25rem" }}>
//                 <span>CLARITY SCORE</span><span style={{ color:C.green }}>{clarity}%</span>
//               </div>
//               <div style={{ height:8,background:C.border,borderRadius:4,overflow:"hidden" }}>
//                 <div style={{ height:"100%",background:C.green,borderRadius:4,
//                               width:`${clarity}%`,transition:"width 0.3s" }}/>
//               </div>
//             </div>
//           )}
//           {err&&<div style={{color:"#EF4444",fontSize:"0.78rem",marginTop:"0.25rem"}}>{err}</div>}
//           {phase==="done"&&(
//             <button onClick={nextRound}
//               style={{ padding:"0.55rem 1.4rem",borderRadius:10,background:C.amber,
//                        border:"none",color:"#fff",fontWeight:600,fontSize:"0.85rem",cursor:"pointer" }}>
//               {loading?"Saving…":(round<3?`Continue to Round ${round+1} →`:"Complete Enrollment →")}
//             </button>
//           )}
//         </div>

//         {/* phase dots */}
//         <div style={{ display:"flex",alignItems:"center",marginTop:"1.25rem" }}>
//           {phaseDots.map((ph,i)=>(
//             <React.Fragment key={i}>
//               <div style={{ display:"flex",flexDirection:"column",alignItems:"center",gap:"0.25rem" }}>
//                 <div style={{ width:30,height:30,borderRadius:"50%",display:"flex",
//                               alignItems:"center",justifyContent:"center",fontSize:"0.8rem",
//                               background:ph.done?C.green:"#E5E2DA",
//                               color:ph.done?"#fff":"#AAA" }}>
//                   {ph.done?"✓":"···"}
//                 </div>
//                 <div style={{ fontSize:"0.62rem",textAlign:"center",whiteSpace:"pre-line",
//                               color:ph.done?C.text1:"#AAA",fontWeight:500 }}>{ph.l}</div>
//               </div>
//               {i<phaseDots.length-1&&<div style={{ flex:1,height:2,background:ph.done?C.green:C.border,margin:"0 4px 16px" }}/>}
//             </React.Fragment>
//           ))}
//         </div>
//       </div>

//       {/* footer buttons */}
//       <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",
//                     width:"100%",maxWidth:600,marginTop:"1.25rem" }}>
//         <button onClick={()=>store.setPage("dashboard")}
//           style={{ background:"none",border:"none",color:C.text3,fontSize:"0.88rem",cursor:"pointer" }}>
//           Cancel
//         </button>
//         {voiceId&&(
//           <div style={{ display:"flex",alignItems:"center",gap:"0.35rem",
//                         padding:"0.35rem 0.9rem",background:"#F0EDE8",borderRadius:20,
//                         fontSize:"0.75rem",color:C.text2 }}>
//             🔒 ID: {voiceId}
//           </div>
//         )}
//         <button onClick={submit} disabled={loading}
//           style={{ padding:"0.6rem 1.5rem",borderRadius:10,border:"none",
//                    background:phase==="done"?C.amberDark:"#E5E2DA",
//                    color:phase==="done"?"#fff":"#AAA",
//                    fontWeight:600,fontSize:"0.88rem",cursor:"pointer" }}>
//           {loading?"Saving…":voiceId?"Done ✓":"Finish"}
//         </button>
//       </div>
//     </div>
//   );
// }

// /* ── FORGOT PASSWORD ── */
// export function ForgotPasswordPage() {
//   const store = useAppStore();
//   const [email, setEmail] = useState("");
//   const [err, setErr] = useState("");
//   const [loading, setLoading] = useState(false);

//   async function sendOtp() {
//     if (!email.trim()) {
//       setErr("Please enter your email address.");
//       return;
//     }
//     setErr("");
//     setLoading(true);
//     try {
//       await api("POST", "/auth/forgot-password", { email });
//       store.setPendingEmail(email);
//       store.setPage("forgot-verify");
//     } catch (e: any) {
//       setErr(e.message || "Failed to send OTP. Please check your email and try again.");
//     } finally {
//       setLoading(false);
//     }
//   }

//   return (
//     <div style={{ minHeight:"100vh", background:"linear-gradient(135deg,#f8f6f0,#ede8e0)",
//                   display:"flex", alignItems:"center", justifyContent:"center" }}>
//       <div style={{ background:"#fff", borderRadius:20, padding:"2.5rem", width:400,
//                     boxShadow:"0 8px 48px rgba(0,0,0,0.08)", position:"relative" }}>
//         <button onClick={()=>store.setPage("login")}
//           style={{ position:"absolute",top:"1rem",left:"1rem",background:"none",border:"none",
//                    color:C.text3,cursor:"pointer",fontSize:"0.85rem",display:"flex",
//                    alignItems:"center",gap:"0.3rem" }}>← Back to Login</button>
//         <div style={{ textAlign:"center", marginBottom:"1.75rem", marginTop: "1rem" }}>
//           <div style={{ width:50,height:50,borderRadius:14,background:"#111111",
//                         display:"flex",alignItems:"center",justifyContent:"center",
//                         margin:"0 auto 1rem", boxShadow: "0 4px 12px rgba(245,167,0,0.2)" }}>
//             <PILOTLogo size={36} />
//           </div>
//           <h2 style={{ fontSize:"1.6rem", fontWeight:800 }}>Forgot Password</h2>
//           <p style={{ color:C.text3, fontSize:"0.88rem" }}>Enter your email to receive a 6-digit verification code.</p>
//         </div>
        
//         <label style={{ fontSize:"0.8rem",fontWeight:500,display:"block",marginBottom:"0.3rem" }}>Email address</label>
//         <input style={{...inp,marginBottom:"0.85rem"}} type="email" value={email}
//           onChange={e=>setEmail(e.target.value)} placeholder="name@company.com"
//           onKeyDown={e=>e.key==="Enter"&&sendOtp()}/>
          
//         {err&&<div style={{ color:"#EF4444",fontSize:"0.78rem",marginTop:"0.4rem",marginBottom:"0.4rem" }}>{err}</div>}
        
//         <button onClick={sendOtp} disabled={loading}
//           style={{ width:"100%",padding:"0.85rem",borderRadius:30,background:"#6B5100",
//                    color:"#fff",fontWeight:700,border:"none",marginTop:"1rem",fontSize:"0.92rem",cursor:"pointer" }}>
//           {loading?"Sending OTP…":"Send OTP →"}
//         </button>
//       </div>
//     </div>
//   );
// }

// /* ── FORGOT OTP PAGE ── */
// export function ForgotOTPPage() {
//   const store = useAppStore();
//   const [digits,setDigits]=useState(["","","","","",""]);
//   const [err,setErr]=useState(""); const [loading,setLoading]=useState(false);
//   const refs=Array.from({length:6},()=>useRef<HTMLInputElement>(null));
  
//   function upd(i:number,v:string){ 
//     if(!/^\d?$/.test(v))return; 
//     const d=[...digits];d[i]=v;setDigits(d); 
//     if(v&&i<5)refs[i+1].current?.focus(); 
//   }
  
//   function kd(i:number,e:React.KeyboardEvent){ 
//     if(e.key==="Backspace"&&!digits[i]&&i>0)refs[i-1].current?.focus(); 
//   }
  
//   async function verify(){
//     const otp=digits.join("");
//     if(otp.length!==6){setErr("Enter all 6 digits");return;}
//     setErr("");setLoading(true);
//     try{
//       const r=await api("POST","/auth/verify-forgot-otp",{email:store.pendingEmail,otp});
//       store.setUser(r.user,r.access_token);
//       store.setPage("dashboard");
//     }
//     catch(e:any){setErr(e.message);}
//     finally{setLoading(false);}
//   }
  
//   async function resend() {
//     setErr("");
//     try {
//       await api("POST", "/auth/forgot-password", { email: store.pendingEmail });
//     } catch(e:any) {
//       setErr(e.message);
//     }
//   }

//   return (
//     <div style={{ minHeight:"100vh", background:"linear-gradient(135deg,#f8f6f0,#ede8e0)",
//                   display:"flex", alignItems:"center", justifyContent:"center" }}>
//       <div style={{ background:"#fff",borderRadius:20,padding:"2.5rem",width:420,
//                     boxShadow:"0 8px 48px rgba(0,0,0,0.08)",textAlign:"center" }}>
//         <div style={{ width:50,height:50,borderRadius:14,background:"#111111",
//                       display:"flex",alignItems:"center",justifyContent:"center",
//                       margin:"0 auto 1rem", boxShadow: "0 4px 12px rgba(245,167,0,0.2)" }}>
//           <PILOTLogo size={36} />
//         </div>
//         <h2 style={{ fontSize:"1.5rem",fontWeight:800,marginBottom:"0.25rem" }}>Verify OTP</h2>
//         <p style={{ color:C.text3,fontSize:"0.85rem",marginBottom:"1.5rem" }}>
//           We sent a 6-digit password recovery code to <strong>{store.pendingEmail}</strong>
//         </p>
//         <div style={{ display:"flex",gap:"0.55rem",justifyContent:"center",marginBottom:"1.4rem" }}>
//           {digits.map((d,i)=>(
//             <input key={i} ref={refs[i]} value={d} maxLength={1} inputMode="numeric"
//               onChange={e=>upd(i,e.target.value)} onKeyDown={e=>kd(i,e)}
//               style={{ width:50,height:58,borderRadius:12,border:`2px solid ${C.border}`,
//                        textAlign:"center",fontSize:"1.5rem",fontWeight:700,
//                        background:"#F9F8F6",outline:"none",color:C.text1 }}/>
//           ))}
//         </div>
//         {err&&<div style={{ color:"#EF4444",fontSize:"0.78rem",marginBottom:"0.6rem" }}>{err}</div>}
//         <button onClick={verify} disabled={loading}
//           style={{ width:"100%",padding:"0.85rem",borderRadius:30,background:"#6B5100",
//                    color:"#fff",fontWeight:700,border:"none",cursor:"pointer" }}>
//           {loading?"Verifying…":"Verify & Continue →"}
//         </button>
//         <p style={{ fontSize:"0.8rem",color:C.text3,marginTop:"1rem" }}>
//           Didn't receive it?{" "}
//           <span style={{ color:C.amberDark,cursor:"pointer" }}
//             onClick={resend}>Resend</span>
//         </p>
//       </div>
//     </div>
//   );
// }



/**
 * Landing · Login · Signup (4-step) · OTP · VoiceCalibration
 * Feature 1: voice enrollment with real embedding
 * Feature 5: audio file upload in enrollment
 * Feature 6: PDF-accurate design
 *
 * Refactor notes (logic-only — visuals unchanged):
 * - useVoiceRecorder: single source of truth for mic capture + FFT clarity scoring,
 *   used by both SignupPage and VoiceCalibration. Fixes an AudioContext leak that
 *   existed in both original copies (every startRec() call created a new
 *   AudioContext that was never closed).
 * - OTPInput: shared 6-digit input used by OTPPage and ForgotOTPPage.
 * - Field: shared labeled input with a visible keyboard focus ring (the old
 *   inputs had outline:"none" with nothing replacing it — invisible focus state
 *   for keyboard users). Same border/background colors as before, just adds an
 *   amber focus ring on :focus.
 * - isValidEmail: minimal email shape check before hitting the API.
 */
import React, { useState, useRef, useEffect, useCallback } from "react";
import { useAppStore } from "../store/SessionStore";
import { PILOTLogo } from "./PILOTLogo";

const C = {
  amber: "#F5A700", amberDark: "#7C5E00", amberBg: "#FFF8E7",
  bg: "#F7F6F3", surface: "#FFFFFF", border: "#E5E2DA",
  text1: "#1A1A1A", text2: "#555555", text3: "#888888",
  green: "#22C55E", red: "#EF4444",
};

const api = async (method: string, path: string, body?: unknown) => {
  const token = localStorage.getItem("pilot_token");
  const h: Record<string, string> = { "Content-Type": "application/json" };
  if (token) h["Authorization"] = `Bearer ${token}`;
  const opts: RequestInit = { method: method.toUpperCase(), headers: h };
  if (body !== undefined) opts.body = JSON.stringify(body);
  const res = await fetch("/api/v1" + path, opts);
  if (!res.ok) { const e = await res.json().catch(() => ({})); throw new Error((e as any).detail ?? res.statusText); }
  return res.json();
};

const isValidEmail = (s: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s.trim());

const inp: React.CSSProperties = {
  width: "100%", padding: "0.7rem 1rem", borderRadius: 10,
  border: `1.5px solid ${C.border}`, fontSize: "0.9rem",
  background: "#fff", color: C.text1, outline: "none",
  transition: "border-color 0.15s ease, box-shadow 0.15s ease",
};

/* ── Shared: labeled input with a real focus ring ── */
function Field({
  label, style, onFocus, onBlur, ...rest
}: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  const [focused, setFocused] = useState(false);
  return (
    <div>
      <label style={{ fontSize: "0.8rem", fontWeight: 500, display: "block", marginBottom: "0.3rem" }}>{label}</label>
      <input
        {...rest}
        onFocus={(e) => { setFocused(true); onFocus?.(e); }}
        onBlur={(e) => { setFocused(false); onBlur?.(e); }}
        style={{
          ...inp,
          borderColor: focused ? C.amber : C.border,
          boxShadow: focused ? `0 0 0 3px ${C.amberBg}` : "none",
          ...style,
        }}
      />
    </div>
  );
}

/* ── Shared: 6-digit OTP input ── */
function OTPInput({ value, onChange, disabled }: { value: string[]; onChange: (digits: string[]) => void; disabled?: boolean }) {
  const refs = useRef<Array<HTMLInputElement | null>>([]);
  function upd(i: number, v: string) {
    if (!/^\d?$/.test(v)) return;
    const d = [...value]; d[i] = v; onChange(d);
    if (v && i < value.length - 1) refs.current[i + 1]?.focus();
  }
  function kd(i: number, e: React.KeyboardEvent) {
    if (e.key === "Backspace" && !value[i] && i > 0) refs.current[i - 1]?.focus();
  }
  return (
    <div style={{ display: "flex", gap: "0.55rem", justifyContent: "center", marginBottom: "1.4rem" }}>
      {value.map((d, i) => (
        <input
          key={i}
          ref={(el) => { refs.current[i] = el; }}
          value={d}
          maxLength={1}
          inputMode="numeric"
          disabled={disabled}
          aria-label={`Digit ${i + 1} of 6-digit verification code`}
          onChange={(e) => upd(i, e.target.value)}
          onKeyDown={(e) => kd(i, e)}
          style={{
            width: 50, height: 58, borderRadius: 12, border: `2px solid ${C.border}`,
            textAlign: "center", fontSize: "1.5rem", fontWeight: 700,
            background: "#F9F8F6", outline: "none", color: C.text1,
          }}
        />
      ))}
    </div>
  );
}

/* ── Shared: mic capture + live clarity scoring ──
 * One round = one MediaRecorder session. Call start(false) instead of start()
 * to keep accumulating into the same chunk buffer across multiple rounds
 * (used by VoiceCalibration). Always closes its own AudioContext/stream on
 * stop/finish/unmount — this is the leak fix.
 */
function useVoiceRecorder() {
  const [phase, setPhase] = useState<"idle" | "recording" | "done">("idle");
  const [clarity, setClarity] = useState(0);
  const [bars, setBars] = useState<number[]>(new Array(9).fill(3));
  const [err, setErr] = useState("");

  const mrRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const animRef = useRef<number>(0);
  const streamRef = useRef<MediaStream | null>(null);
  const ctxRef = useRef<AudioContext | null>(null);

  const cleanupAudioGraph = useCallback(() => {
    cancelAnimationFrame(animRef.current);
    if (ctxRef.current) {
      ctxRef.current.close().catch(() => {});
      ctxRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
  }, []);

  useEffect(() => () => cleanupAudioGraph(), [cleanupAudioGraph]);

  async function start(resetChunks: boolean = true) {
    setErr("");
    if (!navigator.mediaDevices) {
      setErr("Microphone access is unavailable. Please ensure you are using a secure context (HTTPS or localhost) and have granted microphone permissions.");
      return;
    }
    cleanupAudioGraph(); // make sure nothing from a previous round is left running
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true, sampleRate: 16000, channelCount: 1 },
      });
      streamRef.current = stream;

      const ctx = new AudioContext();
      ctxRef.current = ctx;
      const src = ctx.createMediaStreamSource(stream);
      const an = ctx.createAnalyser();
      an.fftSize = 128;
      src.connect(an);

      const tick = () => {
        const d = new Uint8Array(an.frequencyBinCount);
        an.getByteFrequencyData(d);

        setBars(Array.from(d.slice(0, 9)).map((v) => 3 + Math.floor((v / 255) * 22)));

        const avgVolume = d.reduce((acc, v) => acc + v, 0) / d.length;
        if (avgVolume > 15) {
          // Active speech: clarity derived from energy in the vocal-resonance bins
          const vocalResonance = d.slice(2, 12).reduce((acc, v) => acc + v, 0) / 10;
          setClarity(Math.min(98, Math.max(78, Math.floor(75 + (vocalResonance / 255) * 23))));
        } else {
          setClarity((c) => Math.max(0, Math.floor(c * 0.9)));
        }
        animRef.current = requestAnimationFrame(tick);
      };
      tick();

      if (resetChunks) chunksRef.current = [];
      const mr = new MediaRecorder(stream, { mimeType: "audio/webm" });
      mrRef.current = mr;
      mr.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      mr.start(500); // flush every 500ms for reliability
      setPhase("recording");
    } catch (e: any) {
      setErr(e.message || "Microphone access denied. Please allow microphone permissions.");
    }
  }

  function stop(): Promise<void> {
    cancelAnimationFrame(animRef.current);
    return new Promise((resolve) => {
      const mr = mrRef.current;
      if (mr && mr.state !== "inactive") {
        mr.onstop = () => resolve();
        mr.stop();
      } else {
        resolve();
      }
    });
  }

  async function finish() {
    await stop();
    cleanupAudioGraph();
    setPhase("done");
  }

  function resetRound() {
    setPhase("idle");
    setClarity(0);
    setBars(new Array(9).fill(3));
  }

  function getBlob(type: string = "audio/webm") {
    return new Blob(chunksRef.current, { type });
  }

  return { phase, clarity, bars, err, setErr, start, stop, finish, resetRound, getBlob, hasChunks: () => chunksRef.current.length > 0 };
}

/* ── LANDING ── */
export function LandingPage() {
  const store = useAppStore();
  const p = store.page;

  if (p === "login") return <LoginPage />;
  if (p === "signup") return <SignupPage />;
  if (p === "verify") return <OTPPage />;
  if (p === "enroll") return <VoiceCalibration />;
  if (p === "forgot") return <ForgotPasswordPage />;
  if (p === "forgot-verify") return <ForgotOTPPage />;

  return (
    <div style={{ minHeight: "100vh", fontFamily: "Inter, sans-serif",
                  background: "radial-gradient(circle at top left, #FAF9F5 0%, #EFECE0 100%)", color: "#1A1A1A" }}>
      {/* nav */}
      <nav style={{ display: "flex", alignItems: "center", justifyContent: "space-between",
                    padding: "1rem 3rem", background: "rgba(255,255,255,0.85)", backdropFilter: "blur(12px)",
                    borderBottom: `1.5px solid ${C.border}`, position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
          <PILOTLogo size={36} />
          <div>
            <span style={{ fontWeight: 900, fontSize: "1.25rem", letterSpacing: "-0.02em", color: "#1A1A1A" }}>PILOT</span>
            <div style={{ fontSize: "0.55rem", color: C.amberDark, fontWeight: 700, letterSpacing: "0.1em", marginTop: -2 }}>VOICE AI OS</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
          <span style={{ fontSize: "0.8rem", color: C.text3, fontWeight: 500, marginRight: "1rem" }}>v2.1 Stable Edition</span>
          {store.token ? (
            <button onClick={() => store.setPage("dashboard")}
              style={{ padding: "0.5rem 1.5rem", borderRadius: 8, border: "none",
                       background: C.amber, color: "#fff", fontWeight: 700, fontSize: "0.83rem", cursor: "pointer",
                       boxShadow: "0 4px 12px rgba(245,167,0,0.25)" }}>
              Go to Dashboard
            </button>
          ) : (
            <>
              <button onClick={() => store.setPage("login")}
                style={{ padding: "0.5rem 1.25rem", borderRadius: 8,
                         border: `1.5px solid ${C.border}`, background: "#fff",
                         fontWeight: 600, fontSize: "0.83rem", cursor: "pointer", transition: "all 0.15s ease" }}>Sign In</button>
              <button onClick={() => store.setPage("signup")}
                style={{ padding: "0.5rem 1.25rem", borderRadius: 8, border: "none",
                         background: C.amber, color: "#fff", fontWeight: 700, fontSize: "0.83rem", cursor: "pointer",
                         boxShadow: "0 4px 12px rgba(245,167,0,0.25)" }}>
                Get Started Free
              </button>
            </>
          )}
        </div>
      </nav>

      {/* hero */}
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "6.5rem 2rem 5.5rem",
                    display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem",
                      padding: "0.3rem 0.8rem", borderRadius: 20, background: C.amberBg,
                      color: C.amberDark, fontSize: "0.72rem", fontWeight: 800, marginBottom: "1.5rem" }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: C.amber, display: "inline-block" }} />
          🟢 BIOMETRIC ENGINE ACTIVE
        </div>
        <h1 style={{ fontSize: "3.8rem", fontWeight: 900, lineHeight: 1.1,
                     letterSpacing: "-0.035em", marginBottom: "1.5rem" }}>
          A Voice-First<br />
          <span style={{ color: C.amberDark }}>AI Operating System.</span>
        </h1>
        <p style={{ fontSize: "1.05rem", color: C.text2, lineHeight: 1.75,
                    maxWidth: 600, marginBottom: "2.5rem" }}>
          Experience continuous, zero-latency computing designed entirely around natural language, continuous voice recognition, real-time biometrics, and autonomous background orchestration.
        </p>
        <div style={{ display: "flex", justifyContent: "center", gap: "1rem", marginBottom: "3.5rem" }}>
          <button onClick={() => store.setPage(store.token ? "dashboard" : "signup")}
            style={{ padding: "1rem 2.2rem", borderRadius: 10, background: C.amber,
                     color: "#fff", fontWeight: 800, fontSize: "1rem", border: "none", cursor: "pointer",
                     boxShadow: "0 6px 20px rgba(245,167,0,0.3)" }}>
            {store.token ? "Go to Dashboard" : "Launch Virtual Terminal"}
          </button>
        </div>
      </div>

      {/* Premium Feature Showcase Section */}
      <div style={{ background: "#FFFDF9", padding: "6rem 3rem", borderTop: `1px solid ${C.border}`, borderBottom: `1px solid ${C.border}` }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <h2 style={{ textAlign: "center", fontSize: "2.4rem", fontWeight: 900, marginBottom: "0.8rem", letterSpacing: "-0.02em" }}>
            The PILOT Workstation Suite
          </h2>
          <p style={{ textAlign: "center", color: C.text2, marginBottom: "4rem", fontSize: "1.05rem", maxWidth: 700, margin: "0 auto", lineHeight: 1.6 }}>
            A suite of high-fidelity, voice-first applications built directly into the operating system. Streamline your workflow, manage correspondence, and generate presentations entirely through natural speech.
          </p>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "2rem" }}>

            {/* 1. Dashboard */}
            <div style={{ background: "#FFFFFF", border: `1.5px solid ${C.border}`, borderRadius: 18, padding: "2rem", display: "flex", flexDirection: "column", gap: "1.2rem", boxShadow: "0 4px 20px rgba(0,0,0,0.02)" }}>
              <div style={{ fontSize: "2rem" }}>🚀</div>
              <div>
                <h3 style={{ fontSize: "1.2rem", fontWeight: 800, margin: "0 0 0.5rem 0", color: C.text1 }}>Real-Time OS Dashboard</h3>
                <p style={{ fontSize: "0.88rem", color: C.text2, lineHeight: 1.6, margin: 0 }}>
                  The central command center of the voice operating system. Monitor audio signal frequencies, view continuous real-time transcriptions, and verify active speaker biometrics.
                </p>
              </div>
              <ul style={{ paddingLeft: "1.2rem", margin: 0, fontSize: "0.82rem", color: C.text2, display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                <li>Continuous 16kHz microphone stream monitor</li>
                <li>Live transcript visualization with zero-latency updates</li>
                <li>Biometric voiceprint verification for secure system access</li>
              </ul>
            </div>

            {/* 2. PPT Copilot */}
            <div style={{ background: "#FFFFFF", border: `1.5px solid ${C.border}`, borderRadius: 18, padding: "2rem", display: "flex", flexDirection: "column", gap: "1.2rem", boxShadow: "0 4px 20px rgba(0,0,0,0.02)" }}>
              <div style={{ fontSize: "2rem" }}>🖥️</div>
              <div>
                <h3 style={{ fontSize: "1.2rem", fontWeight: 800, margin: "0 0 0.5rem 0", color: C.text1 }}>Widescreen PPT Copilot</h3>
                <p style={{ fontSize: "0.88rem", color: C.text2, lineHeight: 1.6, margin: 0 }}>
                  A widescreen presentation workstation. Generate slides instantly via text prompts or hands-free voice dictation, and edit layout elements in real-time.
                </p>
              </div>
              <ul style={{ paddingLeft: "1.2rem", margin: 0, fontSize: "0.82rem", color: C.text2, display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                <li>One-click direct voice slide generation</li>
                <li>Interactive sidebar editor for slide titles, bullets, and notes</li>
                <li>Dedicated AI Slide Agent for instant rewriting and optimization</li>
              </ul>
            </div>

            {/* 3. Email Center */}
            <div style={{ background: "#FFFFFF", border: `1.5px solid ${C.border}`, borderRadius: 18, padding: "2rem", display: "flex", flexDirection: "column", gap: "1.2rem", boxShadow: "0 4px 20px rgba(0,0,0,0.02)" }}>
              <div style={{ fontSize: "2rem" }}>✉️</div>
              <div>
                <h3 style={{ fontSize: "1.2rem", fontWeight: 800, margin: "0 0 0.5rem 0", color: C.text1 }}>Voice-First Email Center</h3>
                <p style={{ fontSize: "0.88rem", color: C.text2, lineHeight: 1.6, margin: 0 }}>
                  Draft, refine, and dispatch professional correspondence entirely using natural speech. Organize communication queues and manage outboxes hands-free.
                </p>
              </div>
              <ul style={{ paddingLeft: "1.2rem", margin: 0, fontSize: "0.82rem", color: C.text2, display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                <li>Continuous dictation for writing complex email drafts</li>
                <li>Automated recipient matching and subject line generation</li>
                <li>Background queue scheduling for reliable outbox delivery</li>
              </ul>
            </div>

            {/* 4. Customer Care */}
            <div style={{ background: "#FFFFFF", border: `1.5px solid ${C.border}`, borderRadius: 18, padding: "2rem", display: "flex", flexDirection: "column", gap: "1.2rem", boxShadow: "0 4px 20px rgba(0,0,0,0.02)" }}>
              <div style={{ fontSize: "2rem" }}>✈️</div>
              <div>
                <h3 style={{ fontSize: "1.2rem", fontWeight: 800, margin: "0 0 0.5rem 0", color: C.text1 }}>Real-Time Flight Tracker</h3>
                <p style={{ fontSize: "0.88rem", color: C.text2, lineHeight: 1.6, margin: 0 }}>
                  A voice-driven customer service search utility. Query airline flight listings, sort tickets by price, and verify real-time seating slots.
                </p>
              </div>
              <ul style={{ paddingLeft: "1.2rem", margin: 0, fontSize: "0.82rem", color: C.text2, display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                <li>Vocal flight searches (e.g., "Find flights to Delhi on Friday")</li>
                <li>Automatic price-sorted results with clear slot highlights</li>
                <li>Direct links to external search engines for booking validation</li>
              </ul>
            </div>

            {/* 5. Meetings Room */}
            <div style={{ background: "#FFFFFF", border: `1.5px solid ${C.border}`, borderRadius: 18, padding: "2rem", display: "flex", flexDirection: "column", gap: "1.2rem", boxShadow: "0 4px 20px rgba(0,0,0,0.02)" }}>
              <div style={{ fontSize: "2rem" }}>📞</div>
              <div>
                <h3 style={{ fontSize: "1.2rem", fontWeight: 800, margin: "0 0 0.5rem 0", color: C.text1 }}>Talkinia Meetings Room</h3>
                <p style={{ fontSize: "0.88rem", color: C.text2, lineHeight: 1.6, margin: 0 }}>
                  A collaborative stream room for remote discussions. Synchronizes multi-party meeting sessions with automatic speaker diarization and audio transcriptions.
                </p>
              </div>
              <ul style={{ paddingLeft: "1.2rem", margin: 0, fontSize: "0.82rem", color: C.text2, display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                <li>Multi-speaker session audio streaming</li>
                <li>Real-time diarization attributing dialogue to specific speakers</li>
                <li>Synchronized navigation state between parent and child stream apps</li>
              </ul>
            </div>

          </div>
        </div>
      </div>

      {/* features grid */}
      <div style={{ background: "#FAF9F5", padding: "4rem 3rem" }}>
        <h2 style={{ textAlign: "center", fontSize: "2rem", fontWeight: 900, marginBottom: "0.6rem", fontFamily: "Inter, sans-serif" }}>
          Intelligence at the edge.
        </h2>
        <p style={{ textAlign: "center", color: C.text3, marginBottom: "3rem", fontSize: "0.95rem" }}>
          Built from the ground up to process voice seamlessly, securely, and instantly across your entire workflow.
        </p>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "grid",
                      gridTemplateColumns: "repeat(3,1fr)", gap: "1.25rem" }}>
          {[{ icon: "🎙", t: "Continuous Listening", d: "Always on, zero latency wake words. Understands context before you finish your sentence." },
            { icon: "👥", t: "Speaker Recognition", d: "Advanced biometrics instantly identify who is speaking, attributing transcripts to the correct member." },
            { icon: "🔐", t: "Voice Authorization", d: "Secure high-stakes actions with voice-print verification without touching a keyboard." },
            { icon: "🤖", t: "Background Agents", d: "Deploy autonomous agents that listen to meetings, draft emails, and update CRM records invisibly." },
            { icon: "⚡", t: "Realtime Transcription", d: "Sub-100ms latency transcription locally processed on device with high accuracy." },
          ].map((f, i) => (
            <div key={i} style={{ background: C.surface, border: `1.5px solid ${C.border}`,
                                   borderRadius: 14, padding: "1.4rem", boxShadow: "0 4px 12px rgba(0,0,0,0.02)" }}>
              <div style={{ fontSize: "1.4rem", marginBottom: "0.65rem" }}>{f.icon}</div>
              <div style={{ fontWeight: 800, fontSize: "1rem", marginBottom: "0.4rem", fontFamily: "Inter, sans-serif" }}>{f.t}</div>
              <div style={{ fontSize: "0.84rem", color: C.text2, lineHeight: 1.6 }}>{f.d}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── LOGIN ── */
function LoginPage() {
  const store = useAppStore();
  const [email, setEmail] = useState(""); const [pw, setPw] = useState("");
  const [err, setErr] = useState(""); const [loading, setLoading] = useState(false);

  async function submit() {
    setErr("");
    if (!email.trim() || !pw) { setErr("Please enter your email and password."); return; }
    if (!isValidEmail(email)) { setErr("Please enter a valid email address."); return; }
    setLoading(true);
    try {
      const r = await api("POST", "/auth/login", { email, password: pw });
      store.setUser(r.user, r.access_token);
      store.setPage("dashboard");
    } catch (e: any) { setErr(e.message); } finally { setLoading(false); }
  }

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg,#f8f6f0,#ede8e0)",
                  display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ background: "#fff", borderRadius: 20, padding: "2.5rem", width: 400,
                    boxShadow: "0 8px 48px rgba(0,0,0,0.08)", position: "relative" }}>
        <button onClick={() => store.setPage("landing")} aria-label="Back to landing page"
          style={{ position: "absolute", top: "1rem", left: "1rem", background: "none", border: "none",
                   color: C.text3, cursor: "pointer", fontSize: "0.85rem", display: "flex",
                   alignItems: "center", gap: "0.3rem" }}>← Back</button>
        <div style={{ textAlign: "center", marginBottom: "1.75rem" }}>
          <div style={{ width: 50, height: 50, borderRadius: 14, background: "#111111",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        margin: "0 auto 1rem", boxShadow: "0 4px 12px rgba(245,167,0,0.2)" }}>
            <PILOTLogo size={36} />
          </div>
          <h2 style={{ fontSize: "1.6rem", fontWeight: 800 }}>Welcome back</h2>
          <p style={{ color: C.text3, fontSize: "0.88rem" }}>Log in to your PILOT OS account to continue.</p>
        </div>
        <div style={{ marginBottom: "0.85rem" }}>
          <Field label="Email address" type="email" value={email} disabled={loading}
            onChange={(e) => setEmail(e.target.value)} placeholder="name@company.com" autoComplete="email" />
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.3rem" }}>
          <label style={{ fontSize: "0.8rem", fontWeight: 500 }}>Password</label>
          <span onClick={() => store.setPage("forgot")} style={{ fontSize: "0.78rem", color: C.amberDark, cursor: "pointer" }}>Forgot password?</span>
        </div>
        <Field label="" type="password" value={pw} disabled={loading}
          onChange={(e) => setPw(e.target.value)} placeholder="••••••••" autoComplete="current-password"
          onKeyDown={(e) => e.key === "Enter" && submit()} />
        {err && <div style={{ color: C.red, fontSize: "0.78rem", marginTop: "0.4rem" }}>{err}</div>}
        <button onClick={submit} disabled={loading}
          style={{ width: "100%", padding: "0.85rem", borderRadius: 30, background: "#6B5100",
                   color: "#fff", fontWeight: 700, border: "none", marginTop: "1rem", fontSize: "0.92rem",
                   cursor: loading ? "default" : "pointer", opacity: loading ? 0.8 : 1 }}>
          {loading ? "Logging in…" : "Log In →"}
        </button>
        <p style={{ textAlign: "center", fontSize: "0.83rem", color: C.text3, marginTop: "1.1rem" }}>
          Don't have an account?{" "}
          <span style={{ color: C.amberDark, cursor: "pointer", fontWeight: 600 }} onClick={() => store.setPage("signup")}>Sign up</span>
        </p>
      </div>
    </div>
  );
}

/* ── SIGNUP ── */
function SignupPage() {
  const store = useAppStore();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("developer");
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const [round, setRound] = useState(1);
  const [audioBlobs, setAudioBlobs] = useState<Blob[]>([]);
  const rec = useVoiceRecorder();

  function validateCredentials() {
    if (!name.trim() || !email.trim()) { setErr("Please fill in your Full Name and Email Address."); return false; }
    if (!isValidEmail(email)) { setErr("Please enter a valid email address."); return false; }
    if (pw.length < 8) { setErr("Password must be at least 8 characters."); return false; }
    if (pw !== pw2) { setErr("Passwords do not match."); return false; }
    return true;
  }

  async function saveRound() {
    await rec.stop();
    if (!rec.hasChunks()) { setErr("No audio captured. Please complete the recording first."); return; }
    const blob = rec.getBlob();
    const newBlobs = [...audioBlobs, blob];
    setAudioBlobs(newBlobs);

    if (round < 3) {
      setRound((r) => r + 1);
      rec.resetRound();
    } else {
      rec.finish();
    }
  }

  function resetVoice() {
    setAudioBlobs([]);
    setRound(1);
    rec.resetRound();
  }

  async function submit() {
    setErr("");
    if (!validateCredentials()) return;
    if (audioBlobs.length < 3) { setErr("Please complete all 3 rounds of voice calibration."); return; }

    setLoading(true);
    try {
      const fd = new FormData();
      fd.append("name", name);
      fd.append("email", email);
      fd.append("password", pw);
      fd.append("role", role);
      audioBlobs.forEach((blob, idx) => fd.append("audio", blob, `round_${idx + 1}.webm`));

      const res = await fetch("/api/v1/auth/signup", { method: "POST", body: fd });
      if (!res.ok) {
        const e = await res.json().catch(() => ({}));
        throw new Error(e.detail ?? res.statusText);
      }
      await res.json();
      store.setPendingEmail(email);
      store.setPage("verify");
    } catch (e: any) {
      setErr(e.message || "Signup failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const steps = [{ n: 1, l: "Register" }, { n: 2, l: "Verify" }];

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg,#f8f6f0,#ede8e0)",
                  display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem" }}>
      <div style={{ background: "#fff", borderRadius: 20, padding: "2.5rem", width: 760,
                    boxShadow: "0 8px 48px rgba(0,0,0,0.08)", position: "relative" }}>
        <button onClick={() => store.setPage("landing")} aria-label="Back to landing page"
          style={{ position: "absolute", top: "1rem", left: "1rem", background: "none", border: "none",
                   color: C.text3, cursor: "pointer", fontSize: "0.85rem", display: "flex",
                   alignItems: "center", gap: "0.3rem" }}>← Back</button>

        <div style={{ display: "flex", alignItems: "center", marginBottom: "1.75rem", justifyContent: "center" }}>
          <div style={{ display: "flex", gap: "1rem", alignItems: "center", width: "100%", maxWidth: 180 }}>
            {steps.map((s, i) => (
              <React.Fragment key={s.n}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.2rem" }}>
                  <div style={{ width: 30, height: 30, borderRadius: "50%", display: "flex",
                                alignItems: "center", justifyContent: "center", fontSize: "0.78rem", fontWeight: 700,
                                background: s.n === 1 ? C.amber : "#F0EDE8",
                                color: s.n === 1 ? "#fff" : "#999" }}>
                    {s.n}
                  </div>
                  <span style={{ fontSize: "0.6rem", color: s.n === 1 ? C.amberDark : "#AAA", fontWeight: 500 }}>{s.l}</span>
                </div>
                {i < steps.length - 1 && <div style={{ flex: 1, height: 2, background: C.border, marginBottom: "10px" }} />}
              </React.Fragment>
            ))}
          </div>
        </div>

        <h2 style={{ fontSize: "1.5rem", fontWeight: 800, marginBottom: "0.2rem", textAlign: "center" }}>
          Create your account & Enroll Voice
        </h2>
        <p style={{ color: C.text3, fontSize: "0.83rem", marginBottom: "1.8rem", textAlign: "center" }}>
          Provide your details and complete the 3 calibration rounds side-by-side to register.
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2.5rem" }}>
          {/* Left Column: Credentials */}
          <div style={{ display: "flex", flexDirection: "column", gap: "0.8rem" }}>
            <h3 style={{ fontSize: "1rem", fontWeight: 700, color: C.amberDark, margin: "0 0 0.2rem" }}>
              1. Profile Details
            </h3>

            <Field label="Full Name" value={name} disabled={loading}
              onChange={(e) => setName(e.target.value)} placeholder="Ada Lovelace" autoComplete="name" />

            <Field label="Email" type="email" value={email} disabled={loading}
              onChange={(e) => setEmail(e.target.value)} placeholder="name@company.com" autoComplete="email" />

            <div>
              <label style={{ fontSize: "0.8rem", fontWeight: 500, display: "block", marginBottom: "0.3rem" }}>Role</label>
              <select style={inp} value={role} disabled={loading} onChange={(e) => setRole(e.target.value)}>
                <option value="developer">Developer</option>
                <option value="manager">Manager</option>
                <option value="csr">Customer Service Rep</option>
                <option value="operator">Operator</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            <Field label="Password" type="password" value={pw} disabled={loading}
              onChange={(e) => setPw(e.target.value)} placeholder="min 8 characters" autoComplete="new-password" />

            <Field label="Confirm Password" type="password" value={pw2} disabled={loading}
              onChange={(e) => setPw2(e.target.value)} placeholder="repeat password" autoComplete="new-password" />
          </div>

          {/* Right Column: Voice Calibration */}
          <div style={{ display: "flex", flexDirection: "column", borderLeft: `1.5px solid ${C.border}`, paddingLeft: "2.5rem" }}>
            <h3 style={{ fontSize: "1rem", fontWeight: 700, color: C.amberDark, margin: "0 0 0.2rem" }}>
              2. Voice Calibration
            </h3>

            {audioBlobs.length === 3 ? (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flex: 1, textAlign: "center", gap: "1rem" }}>
                <div style={{ fontSize: "3rem", color: C.green }}>✓</div>
                <div style={{ fontWeight: 700, color: C.text1 }}>Voice Registered Successfully!</div>
                <div style={{ fontSize: "0.83rem", color: C.text3 }}>All 3 calibration rounds have been captured.</div>
                <button onClick={resetVoice}
                  style={{ padding: "0.45rem 1rem", borderRadius: 8, border: `1.5px solid ${C.border}`,
                           background: "#fff", fontWeight: 600, fontSize: "0.8rem", color: C.text2, cursor: "pointer" }}>
                  🔄 Re-record Voice
                </button>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", marginBottom: "1rem", marginTop: "0.5rem" }}>
                  {[1, 2, 3].map((r) => (
                    <div key={r} style={{ flex: 1, height: 5, borderRadius: 3, transition: "background 0.3s",
                                          background: audioBlobs.length >= r ? C.green : round === r ? C.amber : C.border }} />
                  ))}
                  <span style={{ fontSize: "0.72rem", color: C.text3, whiteSpace: "nowrap" }}>Round {round}/3</span>
                </div>

                <div style={{ marginBottom: "1rem" }}>
                  <div style={{ display: "inline-block", padding: "0.2rem 0.65rem", borderRadius: 20,
                                background: C.amber, color: "#fff", fontSize: "0.65rem",
                                fontWeight: 700, letterSpacing: "0.08em", marginBottom: "0.5rem" }}>
                    READ ALOUD PASSAGE
                  </div>
                  <div style={{ background: "#F9F8F6", border: `1.5px solid ${C.border}`, borderRadius: 10,
                                padding: "0.8rem", fontSize: "0.83rem", fontWeight: 500, lineHeight: 1.55,
                                color: C.text1 }}>
                    {round === 1 && `"I am securely enrolling my voice into the PILOT system. This unique vocal signature will verify my identity."`}
                    {round === 2 && `"I authorize PILOT to act on my commands and confirm that I am the registered user of this system."`}
                    {round === 3 && `"My voice is my password. It is unique, secure, and personal to me in every operation."`}
                  </div>
                </div>

                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem", flex: 1, justifyContent: "center" }}>
                  <button onClick={rec.phase === "recording" ? rec.finish : () => rec.start()}
                    aria-label={rec.phase === "recording" ? "Stop recording" : `Start recording round ${round}`}
                    style={{ width: 54, height: 54, borderRadius: "50%",
                             background: rec.phase === "recording" ? "#EF4444" : C.amberDark,
                             border: "none", fontSize: "1.2rem", color: "#fff", cursor: "pointer",
                             boxShadow: rec.phase === "recording" ? "0 0 0 8px rgba(239,68,68,0.15)" : "none",
                             transition: "all 0.2s" }}>
                    {rec.phase === "recording" ? "⏹" : "🎤"}
                  </button>
                  <div style={{ display: "flex", alignItems: "flex-end", gap: "3px", height: 20 }}>
                    {rec.bars.map((h, i) => (
                      <div key={i} style={{ width: 4, borderRadius: 2, background: C.amberDark,
                                            height: rec.phase === "recording" ? h : 3, transition: "height 0.1s" }} />
                    ))}
                  </div>
                  <div style={{ fontSize: "0.75rem", color: C.text3, textAlign: "center" }}>
                    {rec.phase === "idle" ? `Tap mic to start Round ${round}` :
                     rec.phase === "recording" ? "Recording… read passage above" :
                     `Round ${round} captured ✓`}
                  </div>
                  {rec.err && <div style={{ color: C.red, fontSize: "0.78rem" }}>{rec.err}</div>}
                  {rec.phase !== "idle" && (
                    <div style={{ width: "100%", marginTop: "0.2rem" }}>
                      <div style={{ display: "flex", justifyContent: "space-between",
                                    fontSize: "0.68rem", fontWeight: 700, color: C.text3, marginBottom: "0.2rem" }}>
                        <span>CLARITY SCORE</span><span style={{ color: C.green }}>{rec.clarity}%</span>
                      </div>
                      <div style={{ height: 6, background: C.border, borderRadius: 3, overflow: "hidden" }}>
                        <div style={{ height: "100%", background: C.green, borderRadius: 3,
                                      width: `${rec.clarity}%`, transition: "width 0.3s" }} />
                      </div>
                    </div>
                  )}

                  {rec.phase === "done" && (
                    <button onClick={saveRound}
                      style={{ padding: "0.55rem 1.2rem", borderRadius: 10, background: C.amber,
                               border: "none", color: "#fff", fontWeight: 600, fontSize: "0.8rem", cursor: "pointer", marginTop: "0.5rem" }}>
                      Save Round {round} {round < 3 ? `& Go to Round ${round + 1} →` : `& Complete`}
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {err && <div style={{ color: C.red, fontSize: "0.78rem", marginTop: "1.2rem", textAlign: "center" }}>{err}</div>}

        <button onClick={submit} disabled={loading || audioBlobs.length < 3}
          style={{ width: "100%", padding: "0.85rem", borderRadius: 30,
                   background: audioBlobs.length === 3 ? "#6B5100" : "#E5E2DA",
                   color: audioBlobs.length === 3 ? "#fff" : "#AAA",
                   fontWeight: 700, border: "none", marginTop: "1.8rem", cursor: audioBlobs.length === 3 ? "pointer" : "not-allowed" }}>
          {loading ? "Registering profile…" : audioBlobs.length < 3 ? "Complete Voice Calibration to Sign Up" : "Create Account & Enroll Voice →"}
        </button>

        <p style={{ textAlign: "center", fontSize: "0.83rem", color: C.text3, marginTop: "1rem" }}>
          Already have an account?{" "}
          <span style={{ color: C.amberDark, cursor: "pointer", fontWeight: 600 }} onClick={() => store.setPage("login")}>Sign in</span>
        </p>
      </div>
    </div>
  );
}

/* ── OTP ── */
function OTPPage() {
  const store = useAppStore();
  const [digits, setDigits] = useState(["", "", "", "", "", ""]);
  const [err, setErr] = useState(""); const [loading, setLoading] = useState(false);

  async function verify() {
    const otp = digits.join("");
    if (otp.length !== 6) { setErr("Enter all 6 digits"); return; }
    setErr(""); setLoading(true);
    try {
      const r = await api("POST", "/auth/verify-otp", { email: store.pendingEmail, otp });
      store.setUser(r.user, r.access_token);
      store.setPage("dashboard");
    } catch (e: any) { setErr(e.message); } finally { setLoading(false); }
  }

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg,#f8f6f0,#ede8e0)",
                  display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ background: "#fff", borderRadius: 20, padding: "2.5rem", width: 420,
                    boxShadow: "0 8px 48px rgba(0,0,0,0.08)", textAlign: "center" }}>
        <div style={{ width: 50, height: 50, borderRadius: 14, background: "#111111",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      margin: "0 auto 1rem", boxShadow: "0 4px 12px rgba(245,167,0,0.2)" }}>
          <PILOTLogo size={36} />
        </div>
        <h2 style={{ fontSize: "1.5rem", fontWeight: 800, marginBottom: "0.25rem" }}>Check your email</h2>
        <p style={{ color: C.text3, fontSize: "0.85rem", marginBottom: "1.5rem" }}>
          We sent a 6-digit code to <strong>{store.pendingEmail}</strong>
        </p>
        <OTPInput value={digits} onChange={setDigits} disabled={loading} />
        {err && <div style={{ color: C.red, fontSize: "0.78rem", marginBottom: "0.6rem" }}>{err}</div>}
        <button onClick={verify} disabled={loading}
          style={{ width: "100%", padding: "0.85rem", borderRadius: 30, background: "#6B5100",
                   color: "#fff", fontWeight: 700, border: "none", cursor: "pointer" }}>
          {loading ? "Verifying…" : "Verify & Continue →"}
        </button>
        <p style={{ fontSize: "0.8rem", color: C.text3, marginTop: "1rem" }}>
          Didn't receive it?{" "}
          <span style={{ color: C.amberDark, cursor: "pointer" }}
            onClick={() => api("POST", "/auth/send-otp", { email: store.pendingEmail })}>Resend</span>
        </p>
      </div>
    </div>
  );
}

/* ── VOICE CALIBRATION — 3 rounds, all chunks accumulated ── */
function VoiceCalibration() {
  const store = useAppStore();
  const [round, setRound] = useState(1);
  const [voiceId, setVoiceId] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitErr, setSubmitErr] = useState("");
  const rec = useVoiceRecorder();

  async function nextRound() {
    await rec.stop();
    if (round < 3) {
      setRound((r) => r + 1);
      rec.resetRound();
      // resetRound() only clears UI state — chunks keep accumulating across
      // rounds because we call rec.start(false) on the next round, below.
    } else {
      await rec.finish();
      await submit();
    }
  }

  async function startThisRound() {
    // round 1 starts a fresh buffer; rounds 2+ keep appending to it
    await rec.start(round === 1);
  }

  async function submit() {
    if (!rec.hasChunks()) {
      setSubmitErr("No audio recorded. Please record at least one round.");
      return;
    }
    setLoading(true); setSubmitErr("");
    try {
      const token = localStorage.getItem("pilot_token")!;
      const role = store.user?.role || "developer";
      const enroll = await api("POST", "/enrollment/start", { name: store.user?.name || "User", role });
      const blob = rec.getBlob();
      if (blob.size < 1000) { setSubmitErr("Recording too short. Please try again."); return; }
      const fd = new FormData();
      fd.append("speaker_id", String(enroll.speaker_id));
      fd.append("audio", blob, "enrollment.webm");
      const res = await fetch("/api/v1/enrollment/audio", {
        method: "POST", headers: { Authorization: `Bearer ${token}` }, body: fd,
      }).then((r) => r.json());
      setVoiceId(res.voice_id || `#${String(enroll.speaker_id).padStart(6, "0")}`);
      setTimeout(() => store.setPage("dashboard"), 1500);
    } catch (e: any) {
      setSubmitErr(e.message || "Enrollment failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const phaseDots = [
    { l: "Reading\nStarted", done: rec.phase !== "idle" },
    { l: "Voice\nCaptured", done: rec.phase === "done" },
    { l: "Embedding\nGenerated", done: !!voiceId },
  ];

  return (
    <div style={{ minHeight: "100vh", background: C.bg, display: "flex",
                  flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "2rem" }}>
      <div style={{ color: C.amberDark, fontSize: "0.78rem", fontWeight: 700,
                    letterSpacing: "0.06em", marginBottom: "0.4rem" }}>⚡ STEP 4 OF 4</div>
      <h2 style={{ fontSize: "1.9rem", fontWeight: 900, marginBottom: "0.4rem" }}>Voice Calibration</h2>
      <p style={{ color: C.text3, textAlign: "center", maxWidth: 480, marginBottom: "1.75rem", fontSize: "0.88rem" }}>
        Please read the following text naturally. This allows PILOT to build a secure biometric model of your voice.
      </p>

      <div style={{ background: "#fff", borderRadius: 20, padding: "2rem", width: "100%", maxWidth: 600,
                    boxShadow: "0 4px 24px rgba(0,0,0,0.06)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center",
                      paddingBottom: "1rem", borderBottom: `1px solid ${C.border}`, marginBottom: "1rem" }}>
          <div>
            <div style={{ fontWeight: 600, fontSize: "0.88rem" }}>Voice Profile Role</div>
            <div style={{ fontSize: "0.75rem", color: C.text3 }}>Fixed to your account role — assigned at signup.</div>
          </div>
          <div style={{ padding: "0.4rem 1rem", borderRadius: 20, background: C.amberBg,
                       border: `1.5px solid ${C.amber}`, fontSize: "0.82rem",
                       fontWeight: 700, color: C.amberDark }}>
            {(store.user?.role || "developer").toUpperCase()}
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", marginBottom: "0.9rem" }}>
          {[1, 2, 3].map((r) => (
            <div key={r} style={{ flex: 1, height: 5, borderRadius: 3, transition: "background 0.3s",
                                  background: round > r ? C.green : round === r ? C.amber : C.border }} />
          ))}
          <span style={{ fontSize: "0.72rem", color: C.text3, whiteSpace: "nowrap" }}>Round {round}/3</span>
        </div>

        <div style={{ marginBottom: "1.1rem" }}>
          <div style={{ display: "inline-block", padding: "0.2rem 0.65rem", borderRadius: 20,
                        background: C.amber, color: "#fff", fontSize: "0.65rem",
                        fontWeight: 700, letterSpacing: "0.08em", marginBottom: "0.55rem" }}>
            CALIBRATION TEXT — ROUND {round}
          </div>
          <div style={{ background: "#F9F8F6", border: `1.5px solid ${C.border}`, borderRadius: 10,
                        padding: "0.9rem 1rem", fontSize: "0.95rem", fontWeight: 500, lineHeight: 1.65,
                        color: C.text1, marginBottom: "0.5rem" }}>
            "I am securely enrolling my voice into the PILOT system.
            This unique vocal signature will verify my identity."
          </div>
          <div style={{ background: "#F9F8F6", border: `1.5px solid ${C.border}`, borderRadius: 10,
                        padding: "0.9rem 1rem", fontSize: "0.95rem", fontWeight: 500, lineHeight: 1.65,
                        color: C.text1 }}>
            "I authorize PILOT to act on my commands and confirm
            that I am the registered user of this system."
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.6rem" }}>
          <button onClick={rec.phase === "recording" ? rec.finish : startThisRound}
            aria-label={rec.phase === "recording" ? "Stop recording" : `Start recording round ${round}`}
            style={{ width: 58, height: 58, borderRadius: "50%",
                     background: rec.phase === "recording" ? "#EF4444" : C.amberDark,
                     border: "none", fontSize: "1.3rem", color: "#fff", cursor: "pointer",
                     boxShadow: rec.phase === "recording" ? "0 0 0 8px rgba(239,68,68,0.15)" : "none",
                     transition: "all 0.2s" }}>
            {rec.phase === "recording" ? "⏹" : "🎤"}
          </button>
          <div style={{ display: "flex", alignItems: "flex-end", gap: "3px", height: 24 }}>
            {rec.bars.map((h, i) => (
              <div key={i} style={{ width: 4, borderRadius: 2, background: C.amberDark,
                                    height: rec.phase === "recording" ? h : 3, transition: "height 0.1s" }} />
            ))}
          </div>
          <div style={{ fontSize: "0.78rem", color: C.text3 }}>
            {rec.phase === "idle" ? `Tap mic to start Round ${round}` :
             rec.phase === "recording" ? "Recording… read both passages above" :
             `Round ${round} captured ✓`}
          </div>
          {rec.err && <div style={{ color: C.red, fontSize: "0.78rem", marginTop: "0.25rem" }}>{rec.err}</div>}
          {rec.phase !== "idle" && (
            <div style={{ width: "100%", marginTop: "0.2rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between",
                            fontSize: "0.7rem", fontWeight: 700, color: C.text3, marginBottom: "0.25rem" }}>
                <span>CLARITY SCORE</span><span style={{ color: C.green }}>{rec.clarity}%</span>
              </div>
              <div style={{ height: 8, background: C.border, borderRadius: 4, overflow: "hidden" }}>
                <div style={{ height: "100%", background: C.green, borderRadius: 4,
                              width: `${rec.clarity}%`, transition: "width 0.3s" }} />
              </div>
            </div>
          )}
          {submitErr && <div style={{ color: C.red, fontSize: "0.78rem", marginTop: "0.25rem" }}>{submitErr}</div>}
          {rec.phase === "done" && (
            <button onClick={nextRound} disabled={loading}
              style={{ padding: "0.55rem 1.4rem", borderRadius: 10, background: C.amber,
                       border: "none", color: "#fff", fontWeight: 600, fontSize: "0.85rem",
                       cursor: loading ? "default" : "pointer", opacity: loading ? 0.8 : 1 }}>
              {loading ? "Saving…" : (round < 3 ? `Continue to Round ${round + 1} →` : "Complete Enrollment →")}
            </button>
          )}
        </div>

        <div style={{ display: "flex", alignItems: "center", marginTop: "1.25rem" }}>
          {phaseDots.map((ph, i) => (
            <React.Fragment key={i}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.25rem" }}>
                <div style={{ width: 30, height: 30, borderRadius: "50%", display: "flex",
                              alignItems: "center", justifyContent: "center", fontSize: "0.8rem",
                              background: ph.done ? C.green : "#E5E2DA",
                              color: ph.done ? "#fff" : "#AAA" }}>
                  {ph.done ? "✓" : "···"}
                </div>
                <div style={{ fontSize: "0.62rem", textAlign: "center", whiteSpace: "pre-line",
                              color: ph.done ? C.text1 : "#AAA", fontWeight: 500 }}>{ph.l}</div>
              </div>
              {i < phaseDots.length - 1 && <div style={{ flex: 1, height: 2, background: ph.done ? C.green : C.border, margin: "0 4px 16px" }} />}
            </React.Fragment>
          ))}
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center",
                    width: "100%", maxWidth: 600, marginTop: "1.25rem" }}>
        <button onClick={() => store.setPage("dashboard")}
          style={{ background: "none", border: "none", color: C.text3, fontSize: "0.88rem", cursor: "pointer" }}>
          Cancel
        </button>
        {voiceId && (
          <div style={{ display: "flex", alignItems: "center", gap: "0.35rem",
                        padding: "0.35rem 0.9rem", background: "#F0EDE8", borderRadius: 20,
                        fontSize: "0.75rem", color: C.text2 }}>
            🔒 ID: {voiceId}
          </div>
        )}
        <button onClick={submit} disabled={loading}
          style={{ padding: "0.6rem 1.5rem", borderRadius: 10, border: "none",
                   background: rec.phase === "done" ? C.amberDark : "#E5E2DA",
                   color: rec.phase === "done" ? "#fff" : "#AAA",
                   fontWeight: 600, fontSize: "0.88rem", cursor: "pointer" }}>
          {loading ? "Saving…" : voiceId ? "Done ✓" : "Finish"}
        </button>
      </div>
    </div>
  );
}

/* ── FORGOT PASSWORD ── */
export function ForgotPasswordPage() {
  const store = useAppStore();
  const [email, setEmail] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  async function sendOtp() {
    if (!email.trim()) { setErr("Please enter your email address."); return; }
    if (!isValidEmail(email)) { setErr("Please enter a valid email address."); return; }
    setErr("");
    setLoading(true);
    try {
      await api("POST", "/auth/forgot-password", { email });
      store.setPendingEmail(email);
      store.setPage("forgot-verify");
    } catch (e: any) {
      setErr(e.message || "Failed to send OTP. Please check your email and try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg,#f8f6f0,#ede8e0)",
                  display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ background: "#fff", borderRadius: 20, padding: "2.5rem", width: 400,
                    boxShadow: "0 8px 48px rgba(0,0,0,0.08)", position: "relative" }}>
        <button onClick={() => store.setPage("login")} aria-label="Back to login"
          style={{ position: "absolute", top: "1rem", left: "1rem", background: "none", border: "none",
                   color: C.text3, cursor: "pointer", fontSize: "0.85rem", display: "flex",
                   alignItems: "center", gap: "0.3rem" }}>← Back to Login</button>
        <div style={{ textAlign: "center", marginBottom: "1.75rem", marginTop: "1rem" }}>
          <div style={{ width: 50, height: 50, borderRadius: 14, background: "#111111",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        margin: "0 auto 1rem", boxShadow: "0 4px 12px rgba(245,167,0,0.2)" }}>
            <PILOTLogo size={36} />
          </div>
          <h2 style={{ fontSize: "1.6rem", fontWeight: 800 }}>Forgot Password</h2>
          <p style={{ color: C.text3, fontSize: "0.88rem" }}>Enter your email to receive a 6-digit verification code.</p>
        </div>

        <Field label="Email address" type="email" value={email} disabled={loading}
          onChange={(e) => setEmail(e.target.value)} placeholder="name@company.com" autoComplete="email"
          onKeyDown={(e) => e.key === "Enter" && sendOtp()} />

        {err && <div style={{ color: C.red, fontSize: "0.78rem", marginTop: "0.4rem", marginBottom: "0.4rem" }}>{err}</div>}

        <button onClick={sendOtp} disabled={loading}
          style={{ width: "100%", padding: "0.85rem", borderRadius: 30, background: "#6B5100",
                   color: "#fff", fontWeight: 700, border: "none", marginTop: "1rem", fontSize: "0.92rem", cursor: "pointer" }}>
          {loading ? "Sending OTP…" : "Send OTP →"}
        </button>
      </div>
    </div>
  );
}

/* ── FORGOT OTP PAGE ── */
export function ForgotOTPPage() {
  const store = useAppStore();
  const [digits, setDigits] = useState(["", "", "", "", "", ""]);
  const [err, setErr] = useState(""); const [loading, setLoading] = useState(false);

  async function verify() {
    const otp = digits.join("");
    if (otp.length !== 6) { setErr("Enter all 6 digits"); return; }
    setErr(""); setLoading(true);
    try {
      const r = await api("POST", "/auth/verify-forgot-otp", { email: store.pendingEmail, otp });
      store.setUser(r.user, r.access_token);
      store.setPage("dashboard");
    } catch (e: any) { setErr(e.message); } finally { setLoading(false); }
  }

  async function resend() {
    setErr("");
    try { await api("POST", "/auth/forgot-password", { email: store.pendingEmail }); }
    catch (e: any) { setErr(e.message); }
  }

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg,#f8f6f0,#ede8e0)",
                  display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ background: "#fff", borderRadius: 20, padding: "2.5rem", width: 420,
                    boxShadow: "0 8px 48px rgba(0,0,0,0.08)", textAlign: "center" }}>
        <div style={{ width: 50, height: 50, borderRadius: 14, background: "#111111",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      margin: "0 auto 1rem", boxShadow: "0 4px 12px rgba(245,167,0,0.2)" }}>
          <PILOTLogo size={36} />
        </div>
        <h2 style={{ fontSize: "1.5rem", fontWeight: 800, marginBottom: "0.25rem" }}>Verify OTP</h2>
        <p style={{ color: C.text3, fontSize: "0.85rem", marginBottom: "1.5rem" }}>
          We sent a 6-digit password recovery code to <strong>{store.pendingEmail}</strong>
        </p>
        <OTPInput value={digits} onChange={setDigits} disabled={loading} />
        {err && <div style={{ color: C.red, fontSize: "0.78rem", marginBottom: "0.6rem" }}>{err}</div>}
        <button onClick={verify} disabled={loading}
          style={{ width: "100%", padding: "0.85rem", borderRadius: 30, background: "#6B5100",
                   color: "#fff", fontWeight: 700, border: "none", cursor: "pointer" }}>
          {loading ? "Verifying…" : "Verify & Continue →"}
        </button>
        <p style={{ fontSize: "0.8rem", color: C.text3, marginTop: "1rem" }}>
          Didn't receive it?{" "}
          <span style={{ color: C.amberDark, cursor: "pointer" }} onClick={resend}>Resend</span>
        </p>
      </div>
    </div>
  );
}