import React from "react";
import { useAppStore } from "./store/SessionStore";
import { LandingPage } from "./components/SessionHeader";
import { Dashboard }   from "./components/transcript";
import "./global.css";

export default function App() {
  const page = useAppStore((s) => s.page);
  const logout = useAppStore((s) => s.logout);

  React.useEffect(() => {
    // 1. Authenticate user from localStorage if present
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
        } catch { /* ignore */ }
      }
    }

    // 2. Parse URL path and sync initial route
    const parseUrlAndSyncState = () => {
      if (typeof window === "undefined") return;
      const path = window.location.pathname;
      const parts = path.split("/").filter(Boolean);
      const store = useAppStore.getState();
      const token = localStorage.getItem("pilot_token");
      
      if (parts.length === 0) {
        // If authenticated, go to dashboard, else landing
        store.setPage(token ? "dashboard" : "landing");
        store.setSession("");
        return;
      }
      
      const firstPart = parts[0];
      const protectedPaths = ["profile", "settings", "meetings", "chat", "guideline", "ppt", "care", "email", "dashboard"];
      if (protectedPaths.includes(firstPart) && !token) {
        store.setPage("landing");
        store.setSession("");
        if (typeof window !== "undefined") {
          window.history.replaceState(null, "", "/");
        }
        return;
      }
      if (firstPart === "profile") {
        store.setPage("profile");
        store.setSession("");
      } else if (firstPart === "settings") {
        store.setPage("settings");
        store.setSession("");
      } else if (firstPart === "meetings") {
        store.setPage("meetings");
        // Extract meetings sub-path, e.g. /meetings/personal-room -> /personal-room
        const subRoute = parts.slice(1).length > 0 ? "/" + parts.slice(1).join("/") : "/";
        store.setTalkiniaSubRoute(subRoute);
        store.setSession("");
      } else if (firstPart === "chat") {
        store.setPage("chat");
        store.setSession("");
      } else if (firstPart === "guideline") {
        store.setPage("guideline");
        store.setSession("");
      } else if (["ppt", "care", "email", "dashboard"].includes(firstPart)) {
        store.setPage(firstPart);
        if (parts[1]) {
          store.setSession(parts[1]);
        } else {
          store.setSession("");
        }
      } else {
        store.setPage(firstPart);
        store.setSession("");
      }
    };

    parseUrlAndSyncState();

    // 3. Listen to browser back/forward buttons (popstate event)
    const handlePopstate = () => {
      parseUrlAndSyncState();
    };
    window.addEventListener("popstate", handlePopstate);

    // 4. Listen to route updates from the Talkinia iframe
    const handleIframeMessage = (event: MessageEvent) => {
      // Security check: restrict to Talkinia's dev origin
      if (event.origin !== "http://localhost:3000") return;
      
      if (event.data?.type === "talkinia_route") {
        const subRoute = event.data.path || "/";
        const store = useAppStore.getState();
        
        // Report the path to update both talkiniaSubRoute and lastReportedTalkiniaPath
        store.reportTalkiniaPath(subRoute);
        
        // Sync the browser URL address bar dynamically only if the user is on the meetings page
        if (store.page === "meetings") {
          const fullPath = `/meetings${subRoute === "/" ? "" : subRoute}`;
          if (window.location.pathname !== fullPath) {
            window.history.pushState(null, "", fullPath);
          }
        }
      }
    };
    window.addEventListener("message", handleIframeMessage);

    return () => {
      window.removeEventListener("popstate", handlePopstate);
      window.removeEventListener("message", handleIframeMessage);
    };
  }, [logout]);

  const dashPages = ["dashboard","ppt","care","email","profile","settings","guideline","meetings","chat"];
  if (dashPages.includes(page)) return <Dashboard />;
  return <LandingPage />;
}



// i am storing all info into a sessionstore.tsx so would it bbe good to store all sessions in a one session or should i create seperate sesions for separate features . 