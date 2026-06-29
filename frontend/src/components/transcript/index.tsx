import React from "react";
import { useAppStore } from "../../store/SessionStore";
import { Sidebar } from "./Sidebar";
import { ConfirmOverlay } from "./ConfirmOverlay";
import { ErrorBoundary } from "../ErrorBoundary";
import { ProfilePage, SettingsPage } from "../ProfilePage";
import { C } from "./helpers";

// Import modular page views
import { MainDashboard } from "./MainDashboard";
import { PPTPageView } from "./PPTPageView";
import { CustomerCareView } from "./CustomerCareView";
import { EmailPageView } from "./EmailPageView";
import { MeetingsPageView } from "./MeetingsPageView";
import { ChatPageView } from "./ChatPageView";
import { GuidelinePageView } from "./GuidelinePageView";

/* ── Dashboard shell — Keep-Alive Tab Router pattern to prevent session unmount resets ── */
export function Dashboard() {
  const page = useAppStore(s => s.page) as string;

  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden", background: C.bg }}>
      <Sidebar active={page === "ppt" ? "ppt" : page === "care" ? "care" : page === "email" ? "email" : page === "guideline" ? "guideline" : page === "meetings" ? "meetings" : page === "chat" ? "chat" : "dashboard"} />
      
      {/* PPT Copilot View */}
      <div style={{ display: page === "ppt" ? "flex" : "none", flex: 1, flexDirection: "column" }}>
        <ErrorBoundary fallbackTitle="PPT Copilot View">
          <PPTPageView />
        </ErrorBoundary>
      </div>
      
      {/* Customer Care View */}
      <div style={{ display: page === "care" ? "flex" : "none", flex: 1, flexDirection: "column" }}>
        <ErrorBoundary fallbackTitle="Customer Care View">
          <CustomerCareView />
        </ErrorBoundary>
      </div>

      {/* Email Center View */}
      <div style={{ display: page === "email" ? "flex" : "none", flex: 1, flexDirection: "column" }}>
        <ErrorBoundary fallbackTitle="Email Center View">
          <EmailPageView />
        </ErrorBoundary>
      </div>

      {/* Chat View */}
      <div style={{ display: page === "chat" ? "flex" : "none", flex: 1, flexDirection: "column" }}>
        <ErrorBoundary fallbackTitle="Chat Panel View">
          <ChatPageView />
        </ErrorBoundary>
      </div>

      {/* System Guidelines View */}
      <div style={{ display: page === "guideline" ? "flex" : "none", flex: 1, flexDirection: "column" }}>
        <ErrorBoundary fallbackTitle="System Guidelines View">
          <GuidelinePageView />
        </ErrorBoundary>
      </div>

      {/* Meetings Space View */}
      <div style={{ display: page === "meetings" ? "flex" : "none", flex: 1, flexDirection: "column" }}>
        <ErrorBoundary fallbackTitle="Meetings Space View">
          <MeetingsPageView />
        </ErrorBoundary>
      </div>
      
      {/* Profile page */}
      <div style={{ display: page === "profile" ? "flex" : "none", flex: 1, flexDirection: "column" }}>
        <ErrorBoundary fallbackTitle="Profile Settings View">
          <ProfilePage />
        </ErrorBoundary>
      </div>
      
      {/* Settings Page */}
      <div style={{ display: page === "settings" ? "flex" : "none", flex: 1, flexDirection: "column" }}>
        <ErrorBoundary fallbackTitle="Application Settings View">
          <SettingsPage />
        </ErrorBoundary>
      </div>
      
      {/* Main Dashboard View */}
      <div style={{ display: (!["ppt", "care", "email", "guideline", "profile", "settings", "meetings", "chat"].includes(page)) ? "flex" : "none", flex: 1, flexDirection: "column" }}>
        <ErrorBoundary fallbackTitle="Main Dashboard View">
          <MainDashboard />
        </ErrorBoundary>
      </div>
      
      <ConfirmOverlay />
    </div>
  );
}
