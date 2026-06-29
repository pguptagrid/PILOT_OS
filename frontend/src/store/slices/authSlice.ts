import { StateCreator } from "zustand";
import { AppState } from "../types";
import { syncUrlFromState } from "../urlSync";
import { sharedVoiceService } from "../../shared_voice";

export interface AuthSlice {
  user: AppState["user"];
  token: string | null;
  pendingEmail: string;
  setUser: (u: AppState["user"], token: string) => void;
  setPendingEmail: (e: string) => void;
  logout: () => void;
}

export const createAuthSlice: StateCreator<
  AppState,
  [],
  [],
  AuthSlice
> = (set, get) => ({
  user: (() => {
    try {
      return JSON.parse(localStorage.getItem("pilot_user") || "null");
    } catch {
      return null;
    }
  })(),
  token: localStorage.getItem("pilot_token"),
  pendingEmail: localStorage.getItem("pilot_pending_email") || "",

  setUser: (u, t) => {
    localStorage.setItem("pilot_token", t);
    localStorage.setItem("pilot_user", JSON.stringify(u));
    localStorage.setItem("pilot_login_time", Date.now().toString());
    set({ user: u, token: t });
  },

  setPendingEmail: (e) => {
    localStorage.setItem("pilot_pending_email", e);
    set({ pendingEmail: e });
  },

  logout: () => {
    sharedVoiceService.stop();

    const token = localStorage.getItem("pilot_token") || get().token;
    if (token) {
      fetch("/api/v1/auth/logout", {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` }
      }).catch(err => console.error("Logout request failed:", err));
    }

    localStorage.removeItem("pilot_token");
    localStorage.removeItem("pilot_user");
    localStorage.removeItem("pilot_page");
    localStorage.removeItem("pilot_pending_email");
    localStorage.removeItem("pilot_login_time");
    set({
      user: null,
      token: null,
      sessionId: null,
      page: "landing",
      transcripts: [],
      toolCards: [],
      jobQueue: []
    });
    syncUrlFromState("landing", null, undefined);
  }
});
