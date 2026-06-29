import React from "react";
import { useAppStore } from "../../store/SessionStore";
import { C } from "./helpers";

export function ConfirmOverlay() {
  const store = useAppStore();
  if (!store.confirmPrompt) return null;
  
  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.35)",
      display: "flex", alignItems: "center",
      justifyContent: "center", zIndex: 200
    }}>
      <div style={{
        background: "#fff", borderRadius: 16, padding: "1.75rem",
        maxWidth: 380, width: "90%", boxShadow: "0 8px 40px rgba(0,0,0,0.12)"
      }}>
        <div style={{ fontSize: "1rem", fontWeight: 700, marginBottom: "0.4rem" }}>⚠ Confirm Action</div>
        <p style={{ color: C.text2, fontSize: "0.88rem", marginBottom: "1.25rem" }}>
          {store.confirmPrompt.message}
        </p>
        <div style={{ display: "flex", gap: "0.75rem", justifyContent: "flex-end" }}>
          <button onClick={() => store.setConfirm(null)}
            style={{
              padding: "0.55rem 1.1rem", borderRadius: 8, border: `1.5px solid ${C.border}`,
              background: "#fff", cursor: "pointer", fontSize: "0.85rem"
            }}>
            Cancel
          </button>
          <button onClick={() => store.setConfirm(null)}
            style={{
              padding: "0.55rem 1.1rem", borderRadius: 8, border: "none",
              background: C.amberDark, color: "#fff", fontWeight: 600,
              fontSize: "0.85rem", cursor: "pointer"
            }}>
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}
