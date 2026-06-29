import { create } from "zustand";
import { AppState } from "./types";

// Import slice creators
import { createAuthSlice } from "./slices/authSlice";
import { createUiSlice } from "./slices/uiSlice";
import { createSessionSlice } from "./slices/sessionSlice";
import { createPptSlice } from "./slices/pptSlice";
import { createContextSlice } from "./slices/contextSlice";

// Re-export all common types for backward compatibility
export * from "./types";
export { syncUrlFromState } from "./urlSync";

// Combine slices into the global Zustand store
export const useAppStore = create<AppState>((set, get, store) => ({
  ...createAuthSlice(set, get, store),
  ...createUiSlice(set, get, store),
  ...createSessionSlice(set, get, store),
  ...createPptSlice(set, get, store),
  ...createContextSlice(set, get, store),
}));
