import React from "react";
import { useAppStore } from "../../store/SessionStore";
import { PILOTLogo } from "../PILOTLogo";
import { C } from "./helpers";

interface SidebarProps {
  active: string;
}

export function Sidebar({ active }: SidebarProps) {
  const store = useAppStore();
  const user = store.user;
  
  return (
    <div style={{
      width: 228, background: C.bg, borderRight: `1.5px solid ${C.border}`,
      display: "flex", flexDirection: "column", height: "100vh", flexShrink: 0
    }}>
      <div style={{
        padding: "1rem", borderBottom: `1.5px solid ${C.border}`,
        display: "flex", alignItems: "center", gap: "0.6rem"
      }}>
        <PILOTLogo size={36} />
        <div>
          <div style={{ fontWeight: 800, fontSize: "0.92rem" }}>PILOT</div>
          <div style={{ fontSize: "0.62rem", color: C.text3 }}>Voice AI OS</div>
        </div>
      </div>
      
      <nav style={{ flex: 1, padding: "0 0.5rem" }}>
        {[
          { id: "dashboard", icon: "⊞", label: "Main Dashboard" },
          { id: "ppt", icon: "🖥", label: "PPT Copilot" },
          { id: "care", icon: "🎧", label: "Customer Care" },
          { id: "email", icon: "✉️", label: "Email Center" },
          { id: "meetings", icon: "👥", label: "Meeting TALKINIA" },
          { id: "chat", icon: "💬", label: "Wanna Chat" },
          { id: "guideline", icon: "📖", label: "System Guidelines" }
        ].map(n => (
          <button key={n.id} onClick={() => store.setPage(n.id as any)}
            style={{
              width: "100%", display: "flex", alignItems: "center", gap: "0.6rem",
              padding: "0.6rem 0.75rem", borderRadius: 8, border: "none",
              background: active === n.id ? C.amber : "transparent",
              color: active === n.id ? "#fff" : C.text2,
              fontWeight: active === n.id ? 600 : 500, fontSize: "0.85rem",
              marginBottom: "0.1rem", cursor: "pointer", textAlign: "left"
            }}>
            <span>{n.icon}</span>
            <span style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span>{n.label}</span>
              {n.id === "chat" && store.unreadChatCount > 0 && (
                <span style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: active === n.id ? "#fff" : C.amber,
                  display: "inline-block",
                  boxShadow: active === n.id ? "none" : `0 0 8px ${C.amber}`,
                  marginLeft: "0.5rem"
                }} />
              )}
            </span>
          </button>
        ))}
      </nav>
      
      <div style={{ borderTop: `1.5px solid ${C.border}`, padding: "0.6rem" }}>
        <button onClick={() => store.setPage("settings" as any)}
          style={{
            width: "100%", display: "flex", alignItems: "center", gap: "0.6rem",
            padding: "0.5rem 0.75rem", borderRadius: 8, border: "none",
            background: "transparent", color: C.text3,
            fontSize: "0.82rem", cursor: "pointer", marginBottom: "0.1rem"
          }}>
          ⚙ Settings
        </button>
        <button onClick={() => store.logout()}
          style={{
            width: "100%", display: "flex", alignItems: "center", gap: "0.6rem",
            padding: "0.5rem 0.75rem", borderRadius: 8, border: "none",
            background: "transparent", color: "#EF4444",
            fontSize: "0.82rem", cursor: "pointer", marginBottom: "0.1rem"
          }}>
          ⎋ Sign Out
        </button>
        
        <div onClick={() => store.setPage("profile" as any)}
          style={{
            display: "flex", alignItems: "center", gap: "0.5rem",
            padding: "0.5rem 0.75rem", borderRadius: 8, cursor: "pointer"
          }}
          onMouseEnter={e => (e.currentTarget.style.background = C.amberBg)}
          onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
          <div style={{
            width: 28, height: 28, borderRadius: "50%", background: C.amberDark,
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "#fff", fontSize: "0.72rem", fontWeight: 700, flexShrink: 0
          }}>
            {(user?.name || "U").charAt(0).toUpperCase()}
          </div>
          <span style={{
            fontSize: "0.82rem", fontWeight: 500, color: C.text1,
            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap"
          }}>
            {user?.name || "User"}
          </span>
        </div>
      </div>
    </div>
  );
}
