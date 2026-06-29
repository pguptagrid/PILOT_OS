// import React from "react";
// import { useAppStore } from "../../store/SessionStore";
// import { C } from "./helpers";

// export function GuidelinePageView() {
//   const sections = [
//     {
//       title: "🖥️ PPT COPILOT SYSTEM",
//       color: C.amberDark,
//       bg: "#FAF9F5",
//       desc: "Enables hands-free control, navigation, and summary of slide presentations directly from your browser workspace.",
//       commands: [
//         { spoken: "go to slide 5", action: "Instantly navigates the PowerPoint presentation viewer to slide 5." },
//         { spoken: "next slide / previous slide", action: "Steps forward or backward through the presentation deck." },
//         { spoken: "summarize this slide", action: "Generates a concise verbal and visual overview of the slide's core content." },
//         { spoken: "delete slide", action: "Removes the current slide from the active presentation deck." }
//       ],
//       details: "The PPT Copilot provides an interactive presentation experience, allowing you to run and review slides completely hands-free. You can navigate, read slide details, and query slide content using natural voice commands while PILOT handles the transitions and displays."
//     },
//     {
//       title: "🎧 CUSTOMER CARE & FLIGHT CENTER",
//       color: "#2563EB",
//       bg: "#F0F4FF",
//       desc: "Assists with flight search queries and schedules, presenting options directly in your workspace.",
//       commands: [
//         { spoken: "search flights from Mumbai to Delhi on 2026-07-01", action: "Finds flight options for the requested route and date." },
//         { spoken: "search flights from New York to London", action: "Pulls flight options for origin and destination parameters instantly." }
//       ],
//       details: "When flight options are found, PILOT displays clean, interactive summary cards directly in your chat view. These cards outline key flight schedules, carriers, and pricing, with convenient direct links to let you quickly proceed with booking."
//     },
//     {
//       title: "✉️ EMAIL WORKFLOW CENTER",
//       color: "#059669",
//       bg: "#ECFDF5",
//       desc: "Allows conversational drafting, editing, and dispatching of emails hands-free.",
//       commands: [
//         { spoken: "write email / draft email / create email / email template", action: "Creates a new email draft in the side editor panel based on your spoken instructions." },
//         { spoken: "send this email / send email / send mail / dispatch email / dispatch mail", action: "Dispatches your finalized draft to the recipient." }
//       ],
//       details: "You can speak to draft, refine, and review emails. The interface keeps the draft visible in a side composition panel so you can inspect the layout and text. Once satisfied, a simple voice confirmation or clicking the manual Send button dispatches the message."
//     },
//     {
//       title: "📹 TALKINIA MEETING SPACE",
//       color: "#7C3AED",
//       bg: "#F5F3FF",
//       desc: "A collaborative video conferencing workspace supporting instant meetings, scheduled calls, and real-time meeting summaries.",
//       commands: [
//         { spoken: "start meeting / join meeting", action: "Instantly opens the Talkinia Meeting space to begin or enter a video conference." },
//         { spoken: "summarize the meeting / compile actions / meeting minutes", action: "Compiles a clean summary of the discussion and emails the notes directly to the participants." }
//       ],
//       details: "The Talkinia Meeting Space allows teams to connect via high-quality video and audio directly inside the workspace. It supports standard meeting controls, real-time shared transcription, and post-meeting notes. When a meeting ends, a single command compiles a summary and emails the action items to everyone involved."
//     },
//     {
//       title: "🧠 VOICE CONTROL & TASK MANAGEMENT",
//       color: "#4F46E5",
//       bg: "#EEF2FF",
//       desc: "Manages the active listening state of your assistant, wake-up commands, and running tasks.",
//       commands: [
//         { spoken: "Hey Pilot / Hello Pilot", action: "Wake-up: Activates the voice listener to start receiving spoken commands." },
//         { spoken: "Go to sleep / Stop listening", action: "Sleep: Pauses the voice listener to prevent accidental triggers." },
//         { spoken: "stop task / stop current task / stop process / cancel background", action: "Cancel: Instantly stops the active background task or search process." }
//       ],
//       details: "PILOT features smart voice activity control designed to make interactions feel natural. It distinguishes between commands directed to the assistant and everyday conversations. The interface displays active background tasks in a sidebar, and you can pause, resume, or cancel any task instantly with simple voice prompts."
//     }
//   ];

//   return (
//     <div style={{ flex: 1, display: "flex", flexDirection: "column", background: C.bg, overflow: "hidden", fontFamily: "Inter, sans-serif" }}>
//       {/* Header */}
//       <div style={{ padding: "1.5rem 2.5rem", background: C.surface, borderBottom: `1.5px solid ${C.border}`, flexShrink: 0 }}>
//         <h1 style={{ fontWeight: 800, fontSize: "1.5rem", letterSpacing: "-0.02em", color: C.text1 }}>
//           📖 System Guidelines & Operator Manual
//         </h1>
//         <p style={{ fontSize: "0.85rem", color: C.text3, marginTop: 4 }}>
//           Comprehensive operational guide for running PILOT's Voice AI Copilot modules and active pipeline handlers.
//         </p>
//       </div>

//       {/* Main Content */}
//       <div style={{ flex: 1, overflowY: "auto", padding: "2rem 2.5rem 5rem", display: "flex", flexDirection: "column", gap: "2rem" }}>
        
//         {/* Intro */}
//         <div style={{ background: C.surface, borderRadius: 14, padding: "1.5rem", border: `1.5px solid ${C.border}`, boxShadow: "0 4px 12px rgba(0,0,0,0.01)" }}>
//           <h2 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "0.5rem" }}>System Overview</h2>
//           <p style={{ fontSize: "0.88rem", color: C.text2, lineHeight: 1.6, margin: 0 }}>
//             PILOT is an intelligent Voice AI Copilot designed to help you orchestrate your daily workflows hands-free. 
//             By combining natural language voice commands, real-time audio transcriptions, secure profile recognition, and a multi-featured workstation layout, 
//             PILOT acts as a seamless assistant for managing slides, searching travel options, drafting emails, and collaborating in video meetings.
//           </p>
//         </div>

//         {/* Quick Start Step-by-Step User Guide */}
//         <div style={{ background: C.surface, borderRadius: 14, padding: "2rem", border: `1.5px solid ${C.border}`, boxShadow: "0 4px 12px rgba(0,0,0,0.01)" }}>
//           <h2 style={{ fontSize: "1.2rem", fontWeight: 800, marginBottom: "0.5rem", color: C.text1 }}>
//             🚀 Quick Start: How to Use PILOT
//           </h2>
//           <p style={{ fontSize: "0.85rem", color: C.text3, marginBottom: "1.5rem" }}>
//             Follow these steps to experience the full power of a voice-first cognitive workspace.
//           </p>

//           <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1.5rem" }}>
//             <div style={{ display: "flex", gap: "1rem" }}>
//               <div style={{ width: 36, height: 36, borderRadius: "50%", background: C.amberBg, color: C.amberDark, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, flexShrink: 0 }}>1</div>
//               <div>
//                 <h4 style={{ fontSize: "0.9rem", fontWeight: 700, margin: "0 0 0.3rem 0", color: C.text1 }}>Enroll Your Voice Profile</h4>
//                 <p style={{ fontSize: "0.8rem", color: C.text2, lineHeight: 1.5, margin: 0 }}>
//                   Complete the short voice calibration during registration. This creates a secure profile to identify your voice and personalize your experience.
//                 </p>
//               </div>
//             </div>

//             <div style={{ display: "flex", gap: "1rem" }}>
//               <div style={{ width: 36, height: 36, borderRadius: "50%", background: C.amberBg, color: C.amberDark, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, flexShrink: 0 }}>2</div>
//               <div>
//                 <h4 style={{ fontSize: "0.9rem", fontWeight: 700, margin: "0 0 0.3rem 0", color: C.text1 }}>Start the Voice Session</h4>
//                 <p style={{ fontSize: "0.8rem", color: C.text2, lineHeight: 1.5, margin: 0 }}>
//                   Navigate to the Dashboard and tap the microphone icon at the bottom of the screen (or speak the wake word <em>"Hey Pilot"</em>) to activate listening.
//                 </p>
//               </div>
//             </div>

//             <div style={{ display: "flex", gap: "1rem" }}>
//               <div style={{ width: 36, height: 36, borderRadius: "50%", background: C.amberBg, color: C.amberDark, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, flexShrink: 0 }}>3</div>
//               <div>
//                 <h4 style={{ fontSize: "0.9rem", fontWeight: 700, margin: "0 0 0.3rem 0", color: C.text1 }}>Speak Natural Commands</h4>
//                 <p style={{ fontSize: "0.8rem", color: C.text2, lineHeight: 1.5, margin: 0 }}>
//                   Speak naturally. PILOT will automatically identify your profile, transcribe your speech, and perform the requested task.
//                 </p>
//               </div>
//             </div>

//             <div style={{ display: "flex", gap: "1rem" }}>
//               <div style={{ width: 36, height: 36, borderRadius: "50%", background: C.amberBg, color: C.amberDark, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, flexShrink: 0 }}>4</div>
//               <div>
//                 <h4 style={{ fontSize: "0.9rem", fontWeight: 700, margin: "0 0 0.3rem 0", color: C.text1 }}>Manage Slide Presentations</h4>
//                 <p style={{ fontSize: "0.8rem", color: C.text2, lineHeight: 1.5, margin: 0 }}>
//                   Go to PPT Copilot. Use voice to generate slides, edit bullet outlines on the sidebar, or resize layouts by dragging the split divider bar.
//                 </p>
//               </div>
//             </div>

//             <div style={{ display: "flex", gap: "1rem" }}>
//               <div style={{ width: 36, height: 36, borderRadius: "50%", background: C.amberBg, color: C.amberDark, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, flexShrink: 0 }}>5</div>
//               <div>
//                 <h4 style={{ fontSize: "0.9rem", fontWeight: 700, margin: "0 0 0.3rem 0", color: C.text1 }}>Draft Emails Hands-Free</h4>
//                 <p style={{ fontSize: "0.8rem", color: C.text2, lineHeight: 1.5, margin: 0 }}>
//                   Open the Email Center. Dictate drafts, refine templates, and say <em>"Send this email"</em> or click the Send button to dispatch it securely.
//                 </p>
//               </div>
//             </div>

//             <div style={{ display: "flex", gap: "1rem" }}>
//               <div style={{ width: 36, height: 36, borderRadius: "50%", background: C.amberBg, color: C.amberDark, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, flexShrink: 0 }}>6</div>
//               <div>
//                 <h4 style={{ fontSize: "0.9rem", fontWeight: 700, margin: "0 0 0.3rem 0", color: C.text1 }}>Search Flights & Meet</h4>
//                 <p style={{ fontSize: "0.8rem", color: C.text2, lineHeight: 1.5, margin: 0 }}>
//                   Search flight connections sorted by price, or join a Talkinia meeting room to collaborate with others with live speech transcription.
//                 </p>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Workspace Layout Map */}
//         <div style={{ background: C.surface, borderRadius: 14, padding: "2rem", border: `1.5px solid ${C.border}`, boxShadow: "0 4px 12px rgba(0,0,0,0.01)" }}>
//           <h2 style={{ fontSize: "1.2rem", fontWeight: 800, marginBottom: "0.5rem", color: C.text1 }}>
//             🗺️ Navigating the PILOT Workspace
//           </h2>
//           <p style={{ fontSize: "0.85rem", color: C.text3, marginBottom: "1.5rem" }}>
//             The interface is structured into four key functional zones to maximize voice-first productivity.
//           </p>

//           <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1.8fr", gap: "2.5rem" }}>
//             <div style={{ borderRight: `1px dashed ${C.border}`, paddingRight: "2.5rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
//               <div style={{ background: "#FAF9F5", border: `1px solid ${C.border}`, borderRadius: 10, padding: "1rem" }}>
//                 <h4 style={{ fontSize: "0.88rem", fontWeight: 700, margin: "0 0 0.25rem 0", color: C.text1 }}>1. Navigation Sidebar</h4>
//                 <p style={{ fontSize: "0.78rem", color: C.text2, margin: 0, lineHeight: 1.5 }}>
//                   Positioned on the far left. Allows instant tab transitions between the Dashboard, PPT Copilot, Email Center, Customer Care, Meetings Room, and Settings panels.
//                 </p>
//               </div>
//               <div style={{ background: "#FAF9F5", border: `1px solid ${C.border}`, borderRadius: 10, padding: "1rem" }}>
//                 <h4 style={{ fontSize: "0.88rem", fontWeight: 700, margin: "0 0 0.25rem 0", color: C.text1 }}>2. Main Workstation Area</h4>
//                 <p style={{ fontSize: "0.78rem", color: C.text2, margin: 0, lineHeight: 1.5 }}>
//                   The central canvas displaying the active module. When in PPT Copilot, this houses the resizable widescreen slide deck workspace.
//                 </p>
//               </div>
//             </div>

//             <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
//               <div style={{ background: "#FAF9F5", border: `1px solid ${C.border}`, borderRadius: 10, padding: "1rem" }}>
//                 <h4 style={{ fontSize: "0.88rem", fontWeight: 700, margin: "0 0 0.25rem 0", color: C.text1 }}>3. Active Task Tracker (Right Sidebar)</h4>
//                 <p style={{ fontSize: "0.78rem", color: C.text2, margin: 0, lineHeight: 1.5 }}>
//                   A sticky right-hand panel displaying active tasks. It updates in real-time as your requests are processed and completed.
//                 </p>
//               </div>
//               <div style={{ background: "#FAF9F5", border: `1px solid ${C.border}`, borderRadius: 10, padding: "1rem" }}>
//                 <h4 style={{ fontSize: "0.88rem", fontWeight: 700, margin: "0 0 0.25rem 0", color: C.text1 }}>4. Live Transcript & Mic Bar (Bottom Overlay)</h4>
//                 <p style={{ fontSize: "0.78rem", color: C.text2, margin: 0, lineHeight: 1.5 }}>
//                   The sticky bottom panel. Houses the global microphone toggle, live audio frequency bars, and real-time transcription status. Can be toggled on/off in the Settings page.
//                 </p>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Feature Sections */}
//         <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
//           {sections.map((sec, idx) => (
//             <div key={idx} style={{
//               background: C.surface,
//               borderRadius: 16,
//               border: `1.5px solid ${C.border}`,
//               overflow: "hidden",
//               boxShadow: "0 4px 16px rgba(0,0,0,0.02)"
//             }}>
//               <div style={{ background: sec.bg, padding: "1.25rem 1.5rem", borderBottom: `1.5px solid ${C.border}`, display: "flex", flexDirection: "column", gap: "0.35rem" }}>
//                 <span style={{ fontSize: "0.9rem", fontWeight: 800, color: sec.color, letterSpacing: "0.04em" }}>
//                   {sec.title}
//                 </span>
//                 <p style={{ fontSize: "0.82rem", color: C.text1, margin: 0, fontWeight: 500 }}>
//                   {sec.desc}
//                 </p>
//               </div>

//               <div style={{ padding: "1.5rem", display: "grid", gridTemplateColumns: "1.2fr 1.8fr", gap: "2rem" }}>
//                 <div style={{ borderRight: `1px dashed ${C.border}`, paddingRight: "1.5rem" }}>
//                   <h3 style={{ fontSize: "0.85rem", fontWeight: 700, textTransform: "uppercase", color: C.text3, marginBottom: "0.75rem", letterSpacing: "0.05em" }}>
//                     Core Functionality
//                   </h3>
//                   <p style={{ fontSize: "0.78rem", color: C.text2, lineHeight: 1.55, margin: 0 }}>
//                     {sec.details}
//                   </p>
//                 </div>

//                 <div>
//                   <h3 style={{ fontSize: "0.85rem", fontWeight: 700, textTransform: "uppercase", color: C.text3, marginBottom: "0.75rem", letterSpacing: "0.05em" }}>
//                     Standard Voice Triggers
//                   </h3>
//                   <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
//                     {sec.commands.map((cmd, cIdx) => (
//                       <div key={cIdx} style={{ background: "#FAF9F5", padding: "0.75rem 1rem", borderRadius: 8, border: `1px solid ${C.border}` }}>
//                         <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", marginBottom: "0.25rem" }}>
//                           <span style={{ fontSize: "0.7rem", color: C.amberDark }}>🗣️</span>
//                           <span style={{ fontSize: "0.78rem", fontWeight: 800, color: C.text1 }}>
//                             "{cmd.spoken}"
//                           </span>
//                         </div>
//                         <p style={{ fontSize: "0.74rem", color: C.text2, lineHeight: 1.45, margin: 0 }}>
//                           {cmd.action}
//                         </p>
//                       </div>
//                     ))}
//                   </div>
//                 </div>
//               </div>
//             </div>
//           ))}
//         </div>

//       </div>
//     </div>
//   );
// }

import React from "react";
import { useAppStore } from "../../store/SessionStore";
import { C } from "./helpers";

export function GuidelinePageView() {
  const sections = [
    {
      title: "🖥️ PPT COPILOT SYSTEM",
      color: C.amberDark,
      bg: "#FAF9F5",
      desc: "Controls, navigates, and analyzes presentations in real time, executing lightweight rendering locally on device.",
      commands: [
        { spoken: "go to slide 5", action: "Instantly navigates the PowerPoint presentation viewer to slide 5." },
        { spoken: "next slide / previous slide", action: "Steps forward or backward through the presentation deck." },
        { spoken: "summarize this slide", action: "Performs instant verbal summaries of bullet points and shapes on the current active slide." },
        { spoken: "delete slide", action: "Triggers a deletion prompt for the current slide (Admin-level voice authorization required)." }
      ],
      details: "The PPT Copilot renders your presentation instantly and keeps it in sync as you navigate, letting you control slides entirely hands-free using your voice."
    },
    {
      title: "🎧 CUSTOMER CARE & FLIGHT CENTER",
      color: "#2563EB",
      bg: "#F0F4FF",
      desc: "Performs dynamic, natural-language flight search lookups and builds customized inline schedules with booking links.",
      commands: [
        { spoken: "search flights from Mumbai to Delhi on 2026-07-01", action: "Looks up matching flights and auto-fills the sidebar route criteria." },
        { spoken: "search flights from New York to London", action: "Pulls flight options for origin and destination parameters instantly." }
      ],
      details: "When flight parameters match, instead of cluttering your dashboard screen, PILOT builds interactive, elegant cards directly in the conversation. These cards display airlines, fares, and departure timings, along with a direct link to complete your booking."
    },
    {
      title: "✉️ EMAIL WORKFLOW CENTER",
      color: "#059669",
      bg: "#ECFDF5",
      desc: "Enables conversational voice-drafting and secure authorized email sending using biometric confirmation gates.",
      commands: [
        { spoken: "write email / draft email / create email / email template", action: "Generates an intelligent, contextually styled draft structure inside the side composition panel." },
        { spoken: "send this email / send email / send mail / dispatch email / dispatch mail", action: "Securely sends your drafted email." }
      ],
      details: "You configure TO, CC/BCC, and SUBJECT parameters. Use your voice to draft and inspect. The email is securely locked and can only be sent using your voice-print biometrics (role-authorized) or via a manual Send button."
    },
    {
      title: "📹 TALKINIA MEETING SPACE",
      color: "#7C3AED",
      bg: "#F5F3FF",
      desc: "An integrated collaboration space for high-fidelity virtual video meetings with live multi-speaker transcription.",
      commands: [
        { spoken: "start meeting / join meeting", action: "Instantly navigates your workspace to the Talkinia Meeting space to create or enter a room." },
        { spoken: "summarize the meeting / compile actions / meeting minutes", action: "Compiles a comprehensive summary of dialogue, resolves all active speakers, and emails the minutes to all participants." }
      ],
      details: "Talkinia opens directly inside your PILOT workspace, carrying your identity over automatically so you're recognized the moment you join — no separate sign-in needed. During active meetings, PILOT shifts to a silent listening mode, performing continuous diarization and biometric voiceprint tracking to log who is speaking without conversational interruptions."
    },
    {
      title: "🧠 VOICE ACTIVITY & CONCURRENCY SYSTEMS",
      color: "#4F46E5",
      bg: "#EEF2FF",
      desc: "Controls ambient environment listener parameters, wake-up states, barge-in windows, and job concurrency handoffs.",
      commands: [
        { spoken: "Hey Pilot / Hello Pilot", action: "Wakes PILOT up and resumes active ambient listening." },
        { spoken: "Go to sleep / Stop listening", action: "Pauses ambient listening cleanly until you wake it again." },
        { spoken: "stop task / stop current task / stop process / cancel background", action: "Immediately cancels whatever PILOT is currently doing and safely discards any in-progress work." }
      ],
      details: "PILOT continuously listens for natural pauses in speech and gives you a short window to finish a full thought before responding, so it won't cut you off mid-sentence. When you ask it to stop, PILOT always knows whether you mean 'cancel what's running right now' or 'queue this for after the current task finishes' — there's never ambiguity about what gets interrupted. Current queue status is displayed directly in the visual UI queue backlog tracker."
    }
  ];

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", background: C.bg, overflow: "hidden", fontFamily: "Inter, sans-serif" }}>
      {/* Header */}
      <div style={{ padding: "1.5rem 2.5rem", background: C.surface, borderBottom: `1.5px solid ${C.border}`, flexShrink: 0 }}>
        <h1 style={{ fontWeight: 800, fontSize: "1.5rem", letterSpacing: "-0.02em", color: C.text1 }}>
          📖 System Guidelines & Operator Manual
        </h1>
        <p style={{ fontSize: "0.85rem", color: C.text3, marginTop: 4 }}>
          A comprehensive guide for using PILOT's Voice AI Copilot modules and everyday workflows.
        </p>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, overflowY: "auto", padding: "2rem 2.5rem 5rem", display: "flex", flexDirection: "column", gap: "2rem" }}>

        {/* Intro */}
        <div style={{ background: C.surface, borderRadius: 14, padding: "1.5rem", border: `1.5px solid ${C.border}`, boxShadow: "0 4px 12px rgba(0,0,0,0.01)" }}>
          <h2 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "0.5rem" }}>System Overview</h2>
          <p style={{ fontSize: "0.88rem", color: C.text2, lineHeight: 1.6, margin: 0 }}>
            PILOT is a voice-first AI workspace designed to orchestrate complex task workflows through natural speech.
            By combining continuous audio understanding, automatic speaker recognition, biometric access control, and real-time task execution,
            PILOT acts as a seamless extension of your desktop environment.
          </p>
        </div>

        {/* Quick Start Step-by-Step User Guide */}
        <div style={{ background: C.surface, borderRadius: 14, padding: "2rem", border: `1.5px solid ${C.border}`, boxShadow: "0 4px 12px rgba(0,0,0,0.01)" }}>
          <h2 style={{ fontSize: "1.2rem", fontWeight: 800, marginBottom: "0.5rem", color: C.text1 }}>
            🚀 Quick Start: How to Use PILOT
          </h2>
          <p style={{ fontSize: "0.85rem", color: C.text3, marginBottom: "1.5rem" }}>
            Follow these steps to experience the full power of a voice-first cognitive workspace.
          </p>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1.5rem" }}>
            <div style={{ display: "flex", gap: "1rem" }}>
              <div style={{ width: 36, height: 36, borderRadius: "50%", background: C.amberBg, color: C.amberDark, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, flexShrink: 0 }}>1</div>
              <div>
                <h4 style={{ fontSize: "0.9rem", fontWeight: 700, margin: "0 0 0.3rem 0", color: C.text1 }}>Enroll Your Voice Profile</h4>
                <p style={{ fontSize: "0.8rem", color: C.text2, lineHeight: 1.5, margin: 0 }}>
                  Complete the 3-round voice calibration during registration. This creates a secure, unique biometric signature used to verify your identity.
                </p>
              </div>
            </div>

            <div style={{ display: "flex", gap: "1rem" }}>
              <div style={{ width: 36, height: 36, borderRadius: "50%", background: C.amberBg, color: C.amberDark, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, flexShrink: 0 }}>2</div>
              <div>
                <h4 style={{ fontSize: "0.9rem", fontWeight: 700, margin: "0 0 0.3rem 0", color: C.text1 }}>Start the Voice Session</h4>
                <p style={{ fontSize: "0.8rem", color: C.text2, lineHeight: 1.5, margin: 0 }}>
                  Navigate to the Dashboard and tap the microphone icon at the bottom of the screen (or speak the wake word <em>"Hey Pilot"</em>) to activate listening.
                </p>
              </div>
            </div>

            <div style={{ display: "flex", gap: "1rem" }}>
              <div style={{ width: 36, height: 36, borderRadius: "50%", background: C.amberBg, color: C.amberDark, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, flexShrink: 0 }}>3</div>
              <div>
                <h4 style={{ fontSize: "0.9rem", fontWeight: 700, margin: "0 0 0.3rem 0", color: C.text1 }}>Speak Natural Commands</h4>
                <p style={{ fontSize: "0.8rem", color: C.text2, lineHeight: 1.5, margin: 0 }}>
                  Speak naturally. The biometrics engine automatically identifies your profile, attributes the transcript, and delegates the task.
                </p>
              </div>
            </div>

            <div style={{ display: "flex", gap: "1rem" }}>
              <div style={{ width: 36, height: 36, borderRadius: "50%", background: C.amberBg, color: C.amberDark, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, flexShrink: 0 }}>4</div>
              <div>
                <h4 style={{ fontSize: "0.9rem", fontWeight: 700, margin: "0 0 0.3rem 0", color: C.text1 }}>Manage Slide Presentations</h4>
                <p style={{ fontSize: "0.8rem", color: C.text2, lineHeight: 1.5, margin: 0 }}>
                  Go to PPT Copilot. Use voice to generate slides, edit bullet outlines on the sidebar, or resize layouts by dragging the split divider bar.
                </p>
              </div>
            </div>

            <div style={{ display: "flex", gap: "1rem" }}>
              <div style={{ width: 36, height: 36, borderRadius: "50%", background: C.amberBg, color: C.amberDark, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, flexShrink: 0 }}>5</div>
              <div>
                <h4 style={{ fontSize: "0.9rem", fontWeight: 700, margin: "0 0 0.3rem 0", color: C.text1 }}>Draft Emails Hands-Free</h4>
                <p style={{ fontSize: "0.8rem", color: C.text2, lineHeight: 1.5, margin: 0 }}>
                  Open the Email Center. Dictate drafts, refine templates, and say <em>"Send this email"</em> to send it securely via biometric authorization.
                </p>
              </div>
            </div>

            <div style={{ display: "flex", gap: "1rem" }}>
              <div style={{ width: 36, height: 36, borderRadius: "50%", background: C.amberBg, color: C.amberDark, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, flexShrink: 0 }}>6</div>
              <div>
                <h4 style={{ fontSize: "0.9rem", fontWeight: 700, margin: "0 0 0.3rem 0", color: C.text1 }}>Search Flights & Meet</h4>
                <p style={{ fontSize: "0.8rem", color: C.text2, lineHeight: 1.5, margin: 0 }}>
                  Search flight connections sorted by price, or join a Talkinia meeting room to see speech diarized in real-time.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Workspace Layout Map */}
        <div style={{ background: C.surface, borderRadius: 14, padding: "2rem", border: `1.5px solid ${C.border}`, boxShadow: "0 4px 12px rgba(0,0,0,0.01)" }}>
          <h2 style={{ fontSize: "1.2rem", fontWeight: 800, marginBottom: "0.5rem", color: C.text1 }}>
            🗺️ Navigating the PILOT Workspace
          </h2>
          <p style={{ fontSize: "0.85rem", color: C.text3, marginBottom: "1.5rem" }}>
            The interface is structured into four key functional zones to maximize voice-first productivity.
          </p>

          <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1.8fr", gap: "2.5rem" }}>
            <div style={{ borderRight: `1px dashed ${C.border}`, paddingRight: "2.5rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div style={{ background: "#FAF9F5", border: `1px solid ${C.border}`, borderRadius: 10, padding: "1rem" }}>
                <h4 style={{ fontSize: "0.88rem", fontWeight: 700, margin: "0 0 0.25rem 0", color: C.text1 }}>1. Navigation Sidebar</h4>
                <p style={{ fontSize: "0.78rem", color: C.text2, margin: 0, lineHeight: 1.5 }}>
                  Positioned on the far left. Allows instant tab transitions between the Dashboard, PPT Copilot, Email Center, Customer Care, Meetings Room, and Settings panels.
                </p>
              </div>
              <div style={{ background: "#FAF9F5", border: `1px solid ${C.border}`, borderRadius: 10, padding: "1rem" }}>
                <h4 style={{ fontSize: "0.88rem", fontWeight: 700, margin: "0 0 0.25rem 0", color: C.text1 }}>2. Main Workstation Area</h4>
                <p style={{ fontSize: "0.78rem", color: C.text2, margin: 0, lineHeight: 1.5 }}>
                  The central canvas displaying the active module. When in PPT Copilot, this houses the resizable widescreen slide deck workspace.
                </p>
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div style={{ background: "#FAF9F5", border: `1px solid ${C.border}`, borderRadius: 10, padding: "1rem" }}>
                <h4 style={{ fontSize: "0.88rem", fontWeight: 700, margin: "0 0 0.25rem 0", color: C.text1 }}>3. Agent Activity Backlog (Right Sidebar)</h4>
                <p style={{ fontSize: "0.78rem", color: C.text2, margin: 0, lineHeight: 1.5 }}>
                  A sticky right-hand panel displaying running background tasks. It updates in real-time as background jobs are queued, processed, and completed.
                </p>
              </div>
              <div style={{ background: "#FAF9F5", border: `1px solid ${C.border}`, borderRadius: 10, padding: "1rem" }}>
                <h4 style={{ fontSize: "0.88rem", fontWeight: 700, margin: "0 0 0.25rem 0", color: C.text1 }}>4. Live Transcript & Mic Bar (Bottom Overlay)</h4>
                <p style={{ fontSize: "0.78rem", color: C.text2, margin: 0, lineHeight: 1.5 }}>
                  The sticky bottom panel. Houses the global microphone toggle, live audio frequency bars, and real-time transcription status. Can be toggled on/off in the Settings page.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Feature Sections */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          {sections.map((sec, idx) => (
            <div key={idx} style={{
              background: C.surface,
              borderRadius: 16,
              border: `1.5px solid ${C.border}`,
              overflow: "hidden",
              boxShadow: "0 4px 16px rgba(0,0,0,0.02)"
            }}>
              <div style={{ background: sec.bg, padding: "1.25rem 1.5rem", borderBottom: `1.5px solid ${C.border}`, display: "flex", flexDirection: "column", gap: "0.35rem" }}>
                <span style={{ fontSize: "0.9rem", fontWeight: 800, color: sec.color, letterSpacing: "0.04em" }}>
                  {sec.title}
                </span>
                <p style={{ fontSize: "0.82rem", color: C.text1, margin: 0, fontWeight: 500 }}>
                  {sec.desc}
                </p>
              </div>

              <div style={{ padding: "1.5rem", display: "grid", gridTemplateColumns: "1.2fr 1.8fr", gap: "2rem" }}>
                <div style={{ borderRight: `1px dashed ${C.border}`, paddingRight: "1.5rem" }}>
                  <h3 style={{ fontSize: "0.85rem", fontWeight: 700, textTransform: "uppercase", color: C.text3, marginBottom: "0.75rem", letterSpacing: "0.05em" }}>
                    How It Works
                  </h3>
                  <p style={{ fontSize: "0.78rem", color: C.text2, lineHeight: 1.55, margin: 0 }}>
                    {sec.details}
                  </p>
                </div>

                <div>
                  <h3 style={{ fontSize: "0.85rem", fontWeight: 700, textTransform: "uppercase", color: C.text3, marginBottom: "0.75rem", letterSpacing: "0.05em" }}>
                    Standard Voice Triggers
                  </h3>
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
                    {sec.commands.map((cmd, cIdx) => (
                      <div key={cIdx} style={{ background: "#FAF9F5", padding: "0.75rem 1rem", borderRadius: 8, border: `1px solid ${C.border}` }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", marginBottom: "0.25rem" }}>
                          <span style={{ fontSize: "0.7rem", color: C.amberDark }}>🗣️</span>
                          <span style={{ fontSize: "0.78rem", fontWeight: 800, color: C.text1 }}>
                            "{cmd.spoken}"
                          </span>
                        </div>
                        <p style={{ fontSize: "0.74rem", color: C.text2, lineHeight: 1.45, margin: 0 }}>
                          {cmd.action}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}