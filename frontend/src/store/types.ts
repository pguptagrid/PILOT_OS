export type AppPage =
  | "landing"
  | "login"
  | "signup"
  | "verify"
  | "enroll"
  | "dashboard"
  | "ppt"
  | "care"
  | "email"
  | "profile"
  | "settings"
  | "forgot"
  | "forgot-verify"
  | "guideline"
  | "meetings"
  | "chat";

export interface TranscriptEntry {
  text: string;
  speaker: string | null;
  role: string | null;
  confidence: number;
  timestamp: number;
}

export interface ToolCard {
  job_id: string;
  tool: string;
  status: string;
  speaker?: string;
  result?: unknown;
  latency_ms?: number;
}

export interface JobItem {
  job_id: string;
  tool: string;
  status: string;
  requester?: string;
  mode?: string;
}

export interface Speaker {
  id: number;
  name: string;
  role: string;
}

export interface SlideShape {
  text: string;
  color: string;
  size: number;
  bold: boolean;
  left?: number;
  top?: number;
  width?: number;
  align?: string;
}

export interface SlideInfo {
  index: number;
  title: string;
  notes: string;
  bg_color?: string;
  shapes?: SlideShape[];
}

export type Theme = "light" | "dark";

export interface AppState {
  // Auth state & actions
  page: AppPage;
  theme: Theme;
  user: { id: number; name: string; email: string; role: string } | null;
  token: string | null;
  sessionId: string | null;
  usecase: string;
  transcripts: TranscriptEntry[];
  toolCards: ToolCard[];
  jobQueue: JobItem[];
  speakers: Speaker[];
  confirmPrompt: { tool: string; speaker: string; message: string } | null;
  pendingEmail: string;
  pptSlides: SlideInfo[];
  pptUploaded: boolean;
  pptFileName: string;

  // Real-time typed flight inputs to sync with the background voice assistant
  typedFlightOrigin: string;
  typedFlightDestination: string;
  typedFlightDate: string;
  setTypedFlightContext: (origin: string, dest: string, date: string) => void;

  // Real-time typed email inputs to sync with the background voice assistant
  typedEmailTo: string;
  typedEmailSubject: string;
  setTypedEmailContext: (to: string, subject: string) => void;

  // Globally shared persistent listening state to prevent mic resets on page switch
  isListeningGlobal: boolean;
  setIsListeningGlobal: (l: boolean) => void;

  // Talkinia meeting sub-routing state for iframe synchronization
  talkiniaSubRoute: string;
  lastReportedTalkiniaPath: string;
  setTalkiniaSubRoute: (route: string) => void;
  reportTalkiniaPath: (route: string) => void;

  setPage: (p: AppPage | string) => void;
  setTheme: (t: Theme) => void;
  setUser: (u: AppState["user"], token: string) => void;
  setSession: (id: string) => void;
  addTranscript: (e: TranscriptEntry) => void;
  upsertToolCard: (c: Partial<ToolCard> & { job_id: string }) => void;
  addJob: (j: JobItem) => void;
  setSpeakers: (s: Speaker[]) => void;
  setConfirm: (p: AppState["confirmPrompt"]) => void;
  setPendingEmail: (e: string) => void;
  setPptSlides: (s: SlideInfo[]) => void;
  setPptFileName: (n: string) => void;
  logout: () => void;
  unreadChatCount: number;
  setUnreadChatCount: (c: number) => void;
}
