import React from "react";
import { useAppStore } from "./store/SessionStore";
import { LandingPage } from "./components/SessionHeader";
import { Dashboard }   from "./components/TranscriptOverlay";
import "./global.css";

export default function App() {
  const page = useAppStore((s) => s.page);
  const logout = useAppStore((s) => s.logout);

  React.useEffect(() => {
    const token = localStorage.getItem("pilot_token");
    const user  = localStorage.getItem("pilot_user");
    const loginTimeStr = localStorage.getItem("pilot_login_time");
    
    if (token && user) {
      const now = Date.now();
      const loginTime = loginTimeStr ? parseInt(loginTimeStr, 10) : now;
      const twentyFourHours = 24 * 60 * 60 * 1000;
      
      if (now - loginTime > twentyFourHours) {
        // Session expired (24h limit reached)
        logout();
      } else {
        try {
          useAppStore.getState().setUser(JSON.parse(user), token);
          // Stay on landing — don't auto-redirect
        } catch { /* ignore */ }
      }
    }
  }, [logout]);

  const dashPages = ["dashboard","ppt","care","email","jira","profile","settings","guideline"];
  if (dashPages.includes(page)) return <Dashboard />;
  return <LandingPage />;
}
