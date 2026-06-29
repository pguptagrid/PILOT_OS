import React, { useEffect, useRef, useState } from "react";
import { useAppStore } from "../../store/SessionStore";
import { C } from "./helpers";

export function MeetingsPageView() {
  const store = useAppStore();
  const u = store.user;
  const iframeRef = useRef<HTMLIFrameElement>(null);
  
  const userId = u?.id || "usr_pilot_guest";
  const userName = u?.name || "PILOT User";
  const userEmail = u?.email || "";
  const userRole = u?.role || "developer";

  // Build the initial URL once on mount, reflecting the store's current talkiniaSubRoute
  const [initialUrl] = useState(() => {
    const sub = store.talkiniaSubRoute || "/";
    return `http://localhost:3000${sub}?user_id=${userId}&user_name=${userName}&user_email=${userEmail}&user_role=${userRole}`;
  });

  // Listen for parent-initiated route changes (like browser back/forward buttons) to update the iframe src
  useEffect(() => {
    if (!iframeRef.current) return;
    const sub = store.talkiniaSubRoute || "/";
    const lastReported = store.lastReportedTalkiniaPath || "/";
    
    // If the active sub-route in the store is different from the last reported path by the iframe,
    // it means this change was initiated by the parent. We must reload the iframe to the new route.
    if (sub !== lastReported) {
      const newUrl = `http://localhost:3000${sub}?user_id=${userId}&user_name=${userName}&user_email=${userEmail}&user_role=${userRole}`;
      iframeRef.current.src = newUrl;
    }
  }, [store.talkiniaSubRoute, userId, userName, userEmail, userRole]);

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", height: "100%", width: "100%", background: C.bg, overflow: "hidden" }}>
      <iframe
        ref={iframeRef}
        src={initialUrl}
        title="TALKINIA Real-Time Meeting Space"
        allow="camera; microphone; display-capture; autoplay; encrypted-media; clipboard-write; clipboard-read"
        style={{
          width: "100%",
          height: "100%",
          border: "none",
          flex: 1,
          background: C.bg
        }}
      />
    </div>
  );
}
