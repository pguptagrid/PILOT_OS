/**
 * Profile + Settings pages — matching PILOT design system.
 * Dark/light mode, user details, voice settings.
 */
import React, { useState } from "react";
import { useAppStore, Theme } from "../store/SessionStore";

function useC() {
  const theme = useAppStore(s => s.theme);
  return theme === "dark"
    ? { bg:"#0F0F0F", surface:"#1A1A1A", card:"#222", border:"#2A2A2A",
        text1:"#F0F0F0", text2:"#AAA", text3:"#666",
        amber:"#F5A700", amberDark:"#D4900F", amberBg:"rgba(245,167,0,0.12)", green: "#22C55E" }
    : { bg:"#F7F6F3", surface:"#FFFFFF", card:"#F9F8F6", border:"#E5E2DA",
        text1:"#1A1A1A", text2:"#555", text3:"#888",
        amber:"#F5A700", amberDark:"#7C5E00", amberBg:"#FFF8E7", green: "#22C55E" };
}

const inp = (C: ReturnType<typeof useC>): React.CSSProperties => ({
  width:"100%", padding:"0.65rem 0.9rem", borderRadius:8,
  border:`1.5px solid ${C.border}`, background:C.surface,
  color:C.text1, fontSize:"0.88rem", outline:"none",
});

function Toggle({ on, onChange, label }: { on:boolean; onChange:(v:boolean)=>void; label:string }) {
  const C = useC();
  return (
    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center",
                  padding:"0.75rem 0", borderBottom:`1px solid ${C.border}` }}>
      <span style={{ fontSize:"0.88rem", color:C.text1 }}>{label}</span>
      <div onClick={() => onChange(!on)}
        style={{ width:44, height:24, borderRadius:12, cursor:"pointer",
                 background: on ? C.amber : C.border,
                 position:"relative", transition:"background 0.2s" }}>
        <div style={{ position:"absolute", top:3, left: on ? 23 : 3,
                      width:18, height:18, borderRadius:"50%",
                      background:"#fff", transition:"left 0.2s",
                      boxShadow:"0 1px 3px rgba(0,0,0,0.2)" }}/>
      </div>
    </div>
  );
}

export function ProfilePage() {
  const store = useAppStore();
  const C     = useC();
  const user  = store.user;
  const [name,  setName]  = useState(user?.name  || "");
  const [email, setEmail] = useState(user?.email || "");
  const [saved, setSaved] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  function save() {
    if (!user) return;
    setErrorMsg("");
    setSaved(false);

    fetch("/api/v1/auth/profile", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${store.token}`
      },
      body: JSON.stringify({ name, email })
    })
      .then(async (res) => {
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.detail || "Failed to update profile");
        }
        return res.json();
      })
      .then((data) => {
        localStorage.setItem("pilot_user", JSON.stringify(data.user));
        localStorage.setItem("pilot_token", data.access_token);
        store.setUser(data.user, data.access_token);
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      })
      .catch((err) => {
        console.error("Error updating profile:", err);
        setErrorMsg(err.message || "Failed to update profile");
      });
  }

  const roleColors: Record<string,string> = {
    admin:"#EF4444", manager:"#F5A700", csr:"#3B82F6",
    developer:"#22C55E", operator:"#8B5CF6",
  };

  return (
    <div style={{ flex:1, overflow:"auto", background:C.bg, padding:"2rem 2.5rem" }}>
      <div style={{ maxWidth:680, margin:"0 auto" }}>
        {/* header */}
        <div style={{ display:"flex", alignItems:"center", gap:"0.75rem", marginBottom:"2rem" }}>
          <button onClick={() => store.setPage("dashboard")}
            style={{ background:"none", border:"none", color:C.text3,
                     cursor:"pointer", fontSize:"1.2rem", padding:"0.25rem" }}>←</button>
          <h1 style={{ fontSize:"1.6rem", fontWeight:800, color:C.text1 }}>Profile</h1>
        </div>

        {/* Avatar + identity */}
        <div style={{ background:C.surface, borderRadius:16, padding:"1.5rem",
                      border:`1.5px solid ${C.border}`, marginBottom:"1.25rem",
                      display:"flex", alignItems:"center", gap:"1.5rem" }}>
          <div style={{ width:72, height:72, borderRadius:"50%",
                        background:C.amber, display:"flex", alignItems:"center",
                        justifyContent:"center", color:"#fff",
                        fontWeight:800, fontSize:"1.6rem", flexShrink:0 }}>
            {(user?.name||"U").charAt(0).toUpperCase()}
          </div>
          <div style={{ flex:1 }}>
            <div style={{ fontSize:"1.1rem", fontWeight:700, color:C.text1 }}>{user?.name}</div>
            <div style={{ fontSize:"0.85rem", color:C.text2, margin:"0.2rem 0" }}>{user?.email}</div>
            <div style={{ display:"inline-flex", alignItems:"center", gap:"0.35rem",
                          padding:"0.2rem 0.65rem", borderRadius:20, marginTop:"0.3rem",
                          background: `${roleColors[user?.role||"developer"]}22`,
                          color: roleColors[user?.role||"developer"],
                          fontSize:"0.72rem", fontWeight:700 }}>
              {user?.role?.toUpperCase()}
            </div>
          </div>
          <div style={{ fontSize:"0.75rem", color:C.text3, fontFamily:"monospace" }}>
            ID #{user?.id || "—"}
          </div>
        </div>

        {/* Edit details */}
        <div style={{ background:C.surface, borderRadius:16, padding:"1.5rem",
                      border:`1.5px solid ${C.border}`, marginBottom:"1.25rem" }}>
          <h3 style={{ fontSize:"0.9rem", fontWeight:700, color:C.text1, marginBottom:"1rem" }}>
            Account Details
          </h3>
          <label style={{ fontSize:"0.78rem", fontWeight:500, color:C.text2, display:"block", marginBottom:"0.3rem" }}>
            Full Name
          </label>
          <input style={{...inp(C), marginBottom:"0.85rem"}} value={name} onChange={e=>setName(e.target.value)}/>
          <label style={{ fontSize:"0.78rem", fontWeight:500, color:C.text2, display:"block", marginBottom:"0.3rem" }}>
            Email
          </label>
          <input style={{...inp(C), marginBottom:"0.85rem"}} type="email" value={email} onChange={e=>setEmail(e.target.value)}/>
          <label style={{ fontSize:"0.78rem", fontWeight:500, color:C.text2, display:"block", marginBottom:"0.3rem" }}>
            Role
          </label>
          <input style={{...inp(C), background:C.card, cursor:"not-allowed"}}
            value={user?.role||""} readOnly/>
          <button onClick={save}
            style={{ marginTop:"1rem", padding:"0.65rem 1.5rem", borderRadius:10,
                     background: saved ? "#22C55E" : C.amber, border:"none",
                     color:"#fff", fontWeight:600, cursor:"pointer", fontSize:"0.88rem",
                     transition:"background 0.2s" }}>
            {saved ? "✓ Saved" : "Save Changes"}
          </button>
          {errorMsg && (
            <div style={{ color: "#EF4444", fontSize: "0.78rem", marginTop: "0.5rem", fontWeight: 600 }}>
              ⚠ {errorMsg}
            </div>
          )}
        </div>

        {/* Voice ID */}
        <div style={{ background:C.surface, borderRadius:16, padding:"1.5rem",
                      border:`1.5px solid ${C.border}`, marginBottom:"1.25rem" }}>
          <h3 style={{ fontSize:"0.9rem", fontWeight:700, color:C.text1, marginBottom:"1rem" }}>
            Voice Identity
          </h3>
          <div style={{ display:"flex", alignItems:"center", gap:"1rem",
                        padding:"0.85rem 1rem", background:C.card, borderRadius:10 }}>
            <div style={{ fontSize:"1.5rem" }}>🔒</div>
            <div>
              <div style={{ fontSize:"0.85rem", fontWeight:600, color:C.text1 }}>
                Voice Profile Active
              </div>
              <div style={{ fontSize:"0.75rem", color:C.text3 }}>
                Biometric voice model enrolled. Used for speaker identification and RBAC.
              </div>
            </div>
            <button onClick={() => store.setPage("enroll")}
              style={{ marginLeft:"auto", padding:"0.4rem 0.85rem", borderRadius:8,
                       background:C.amberBg, border:`1.5px solid ${C.amber}`,
                       color:C.amberDark, fontWeight:600, fontSize:"0.75rem", cursor:"pointer" }}>
              Re-enroll
            </button>
          </div>
        </div>

        {/* Danger zone */}
        <div style={{ background:C.surface, borderRadius:16, padding:"1.5rem",
                      border:"1.5px solid rgba(239,68,68,0.2)" }}>
          <h3 style={{ fontSize:"0.9rem", fontWeight:700, color:"#EF4444", marginBottom:"1rem" }}>
            Account Actions
          </h3>
          <button onClick={store.logout}
            style={{ padding:"0.6rem 1.25rem", borderRadius:8,
                     background:"rgba(239,68,68,0.1)", border:"1.5px solid rgba(239,68,68,0.3)",
                     color:"#EF4444", fontWeight:600, fontSize:"0.85rem", cursor:"pointer" }}>
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}

export function SettingsPage() {
  const store = useAppStore();
  const C = useC();

  // Load settings from localStorage with functional defaults
  const [theme, setThemeState] = useState<Theme>(store.theme);
  const [ttsEnabled, setTtsEnabled] = useState(() => localStorage.getItem("pilot_tts_enabled") !== "false");
  const [noiseSuppress, setNoiseSuppress] = useState(() => localStorage.getItem("pilot_noise_suppress") !== "false");
  const [autoListen, setAutoListen] = useState(() => localStorage.getItem("pilot_auto_listen") !== "false");
  const [showTranscript, setShowTranscript] = useState(() => localStorage.getItem("pilot_show_transcript") !== "false");
  const [diarizationEnabled, setDiarizationEnabled] = useState(() => localStorage.getItem("pilot_diarization_enabled") !== "false");
  const [micGain, setMicGain] = useState(() => parseFloat(localStorage.getItem("pilot_mic_gain") || "1.0"));
  const [agentVoice, setAgentVoice] = useState(() => localStorage.getItem("pilot_tts_voice") || "neural_female");

  // Synchronize changes directly with global state and localStorage to trigger immediate reactivity
  const handleThemeChange = (newTheme: Theme) => {
    setThemeState(newTheme);
    store.setTheme(newTheme);
  };

  const handleTtsChange = (val: boolean) => {
    setTtsEnabled(val);
    localStorage.setItem("pilot_tts_enabled", String(val));
  };

  const handleNoiseChange = (val: boolean) => {
    setNoiseSuppress(val);
    localStorage.setItem("pilot_noise_suppress", String(val));
  };

  const handleAutoListenChange = (val: boolean) => {
    setAutoListen(val);
    localStorage.setItem("pilot_auto_listen", String(val));
  };

  const handleShowTranscriptChange = (val: boolean) => {
    setShowTranscript(val);
    localStorage.setItem("pilot_show_transcript", String(val));
  };

  const handleDiarizationChange = (val: boolean) => {
    setDiarizationEnabled(val);
    localStorage.setItem("pilot_diarization_enabled", String(val));
  };

  const handleMicGainChange = (val: number) => {
    setMicGain(val);
    localStorage.setItem("pilot_mic_gain", String(val));
  };

  const handleVoiceChange = (val: string) => {
    setAgentVoice(val);
    localStorage.setItem("pilot_tts_voice", val);
  };

  return (
    <div style={{ flex: 1, overflow: "auto", background: C.bg, padding: "2rem 2.5rem" }}>
      <div style={{ maxWidth: 680, margin: "0 auto" }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "2rem" }}>
          <button onClick={() => store.setPage("dashboard")} aria-label="Back to dashboard"
            style={{ background: "none", border: "none", color: C.text3, cursor: "pointer", fontSize: "1.2rem" }}>←</button>
          <h1 style={{ fontSize: "1.6rem", fontWeight: 800, color: C.text1 }}>Settings</h1>
        </div>

        {/* 1. Interface Theme */}
        <div style={{ background: C.surface, borderRadius: 16, padding: "1.5rem",
                      border: `1.5px solid ${C.border}`, marginBottom: "1.25rem" }}>
          <h3 style={{ fontSize: "0.9rem", fontWeight: 700, color: C.text1, marginBottom: "0.75rem" }}>
            Interface Styling
          </h3>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.4rem 0" }}>
            <div>
              <div style={{ fontSize: "0.88rem", fontWeight: 600, color: C.text1 }}>Interface Theme</div>
              <div style={{ fontSize: "0.74rem", color: C.text3 }}>Toggle the workspace between light and dark visual profiles.</div>
            </div>
            <div style={{ display: "flex", gap: "0.5rem", background: C.card, padding: "3px", borderRadius: 8, border: `1px solid ${C.border}` }}>
              <button
                onClick={() => handleThemeChange("light")}
                style={{
                  padding: "0.35rem 0.85rem", borderRadius: 6, border: "none", fontSize: "0.75rem", fontWeight: 700, cursor: "pointer",
                  background: theme === "light" ? C.surface : "transparent",
                  color: theme === "light" ? C.amberDark : C.text3,
                  boxShadow: theme === "light" ? "0 2px 6px rgba(0,0,0,0.05)" : "none",
                  transition: "all 0.15s ease"
                }}
              >
                ☀ Light
              </button>
              <button
                onClick={() => handleThemeChange("dark")}
                style={{
                  padding: "0.35rem 0.85rem", borderRadius: 6, border: "none", fontSize: "0.75rem", fontWeight: 700, cursor: "pointer",
                  background: theme === "dark" ? C.surface : "transparent",
                  color: theme === "dark" ? C.amber : C.text3,
                  boxShadow: theme === "dark" ? "0 2px 6px rgba(0,0,0,0.15)" : "none",
                  transition: "all 0.15s ease"
                }}
              >
                ☾ Dark
              </button>
            </div>
          </div>
        </div>

        {/* 2. Voice & Audio */}
        <div style={{ background: C.surface, borderRadius: 16, padding: "1.5rem",
                      border: `1.5px solid ${C.border}`, marginBottom: "1.25rem" }}>
          <h3 style={{ fontSize: "0.9rem", fontWeight: 700, color: C.text1, marginBottom: "0.75rem" }}>
            Voice & Audio parameters
          </h3>
          <Toggle on={ttsEnabled} onChange={handleTtsChange} label="Enable spoken voice responses (TTS)" />
          <Toggle on={noiseSuppress} onChange={handleNoiseChange} label="Hardware Noise Suppression & Echo Cancellation" />
          <Toggle on={autoListen} onChange={handleAutoListenChange} label="Auto-resume microphone input after PILOT speaks" />
          <Toggle on={showTranscript} onChange={handleShowTranscriptChange} label="Display bottom live transcript bar globally" />
          
          {/* Audio Gain Boost Slider */}
          <div style={{ marginTop: "1.2rem", borderTop: `1px dashed ${C.border}`, paddingTop: "1.2rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", color: C.text1, marginBottom: "0.35rem", fontWeight: 600 }}>
              <span>Digital Microphone Gain Boost</span>
              <span style={{ fontWeight: 800, color: C.amberDark }}>{micGain.toFixed(1)}x</span>
            </div>
            <input
              type="range" min="0.5" max="2.5" step="0.1"
              value={micGain}
              onChange={(e) => handleMicGainChange(parseFloat(e.target.value))}
              style={{ width: "100%", accentColor: C.amber, height: 4, borderRadius: 2, background: C.border, cursor: "pointer", marginBottom: "0.4rem" }}
            />
            <span style={{ fontSize: "0.7rem", color: C.text3, display: "block" }}>
              Preamplification gain factor applied to raw edge audio PCM chunks before dispatching.
            </span>
          </div>

          {/* Voice Character Dropdown */}
          <div style={{ marginTop: "1.2rem", borderTop: `1px dashed ${C.border}`, paddingTop: "1.2rem" }}>
            <label style={{ fontSize: "0.82rem", fontWeight: 700, color: C.text1, display: "block", marginBottom: "0.4rem" }}>
              Voice Agent Accent & Persona
            </label>
            <select
              value={agentVoice}
              onChange={(e) => handleVoiceChange(e.target.value)}
              style={inp(C)}
            >
              <option value="neural_female">High-Clarity Neural Accent (Female)</option>
              <option value="neural_male">Deep Resonance Neural Accent (Male)</option>
              <option value="samantha_offline">Samantha Accent (Offline Fallback)</option>
            </select>
            <span style={{ fontSize: "0.7rem", color: C.text3, marginTop: "0.3rem", display: "block" }}>
              Configures the acoustic synthesizer profile for vocal responses.
            </span>
          </div>
        </div>

        {/* 3. OS Capabilities */}
        <div style={{ background: C.surface, borderRadius: 16, padding: "1.5rem",
                      border: `1.5px solid ${C.border}`, marginBottom: "1.25rem" }}>
          <h3 style={{ fontSize: "0.9rem", fontWeight: 700, color: C.text1, marginBottom: "0.75rem" }}>
            Cognitive OS Capabilities
          </h3>
          <Toggle on={diarizationEnabled} onChange={handleDiarizationChange} label="Real-Time Speaker Diarization & Biometrics" />
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.75rem 0 0 0" }}>
            <div>
              <div style={{ fontSize: "0.88rem", fontWeight: 600, color: C.text1 }}>Biometric Attestation</div>
              <div style={{ fontSize: "0.74rem", color: C.text3 }}>Restricts system execution to verified voiceprints.</div>
            </div>
            <span style={{ fontSize: "0.75rem", fontWeight: 700, color: C.amberDark, background: C.amberBg, padding: "3px 8px", borderRadius: 4 }}>Level 2 MFA</span>
          </div>
        </div>

        {/* 4. About Info */}
        <div style={{ background: C.surface, borderRadius: 16, padding: "1.5rem",
                      border: `1.5px solid ${C.border}` }}>
          <h3 style={{ fontSize: "0.9rem", fontWeight: 700, color: C.text1, marginBottom: "0.75rem" }}>About PILOT</h3>
          <div style={{ fontSize: "0.82rem", color: C.text2, lineHeight: 1.7 }}>
            <div>Version <strong>1.0.0</strong> · Grid Dynamics Capstone 2026</div>
            <div>Contact: [EMAIL_ADDRESS]</div>
          </div>
        </div>
      </div>
    </div>
  );
}
