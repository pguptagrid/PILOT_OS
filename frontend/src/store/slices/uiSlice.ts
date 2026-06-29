import { StateCreator } from "zustand";
import { AppState, AppPage, Theme } from "../types";
import { syncUrlFromState } from "../urlSync";

export interface UiSlice {
  page: AppPage;
  theme: Theme;
  isListeningGlobal: boolean;
  unreadChatCount: number;
  setPage: (p: AppPage | string) => void;
  setTheme: (t: Theme) => void;
  setIsListeningGlobal: (l: boolean) => void;
  setUnreadChatCount: (c: number) => void;
}

export const createUiSlice: StateCreator<
  AppState,
  [],
  [],
  UiSlice
> = (set, get) => ({
  page: (localStorage.getItem("pilot_page") || "landing") as AppPage,
  theme: (localStorage.getItem("pilot_theme") || "light") as Theme,
  isListeningGlobal: false,
  unreadChatCount: 0,

  setPage: (p) => {
    localStorage.setItem("pilot_page", p);
    set({ page: p as AppPage });
    const s = get();
    syncUrlFromState(p, s.sessionId, s.user?.id, s.talkiniaSubRoute);
  },

  setTheme: (t) => {
    localStorage.setItem("pilot_theme", t);
    set({ theme: t });
  },

  setIsListeningGlobal: (l) => {
    set({ isListeningGlobal: l });
  },

  setUnreadChatCount: (c) => {
    set({ unreadChatCount: c });
  }
});
