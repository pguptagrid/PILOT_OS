import { StateCreator } from "zustand";
import { AppState, TranscriptEntry, ToolCard, JobItem, Speaker } from "../types";
import { syncUrlFromState } from "../urlSync";

export interface SessionSlice {
  sessionId: string | null;
  usecase: string;
  transcripts: TranscriptEntry[];
  toolCards: ToolCard[];
  jobQueue: JobItem[];
  speakers: Speaker[];
  confirmPrompt: { tool: string; speaker: string; message: string } | null;
  setSession: (id: string) => void;
  addTranscript: (e: TranscriptEntry) => void;
  upsertToolCard: (c: Partial<ToolCard> & { job_id: string }) => void;
  addJob: (j: JobItem) => void;
  setSpeakers: (s: Speaker[]) => void;
  setConfirm: (p: AppState["confirmPrompt"]) => void;
}

export const createSessionSlice: StateCreator<
  AppState,
  [],
  [],
  SessionSlice
> = (set, get) => ({
  sessionId: null,
  usecase: "general",
  transcripts: [],
  toolCards: [],
  jobQueue: [],
  speakers: [],
  confirmPrompt: null,

  setSession: (id) => {
    set({ sessionId: id });
    const s = get();
    syncUrlFromState(s.page, id, s.user?.id, s.talkiniaSubRoute);
  },

  addTranscript: (e) =>
    set((s) => ({ transcripts: [...s.transcripts.slice(-299), e] })),

  upsertToolCard: (c) =>
    set((s) => {
      const idx = s.toolCards.findIndex((x) => x.job_id === c.job_id);
      if (idx >= 0) {
        const a = [...s.toolCards];
        a[idx] = { ...a[idx], ...c } as ToolCard;
        return { toolCards: a };
      }
      return { toolCards: [...s.toolCards, c as ToolCard] };
    }),

  addJob: (j) => set((s) => ({ jobQueue: [...s.jobQueue, j] })),

  setSpeakers: (sp) => set({ speakers: sp }),

  setConfirm: (p) => set({ confirmPrompt: p })
});
