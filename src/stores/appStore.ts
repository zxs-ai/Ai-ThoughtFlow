import { create } from "zustand";

export type DiagramType =
  | "architecture"
  | "flowchart"
  | "mindmap"
  | "sequence"
  | "er"
  | "usecase"
  | "free";

export interface Message {
  role: "user" | "assistant";
  content: string;
}

export interface ModelConfig {
  provider: string;
  apiKey: string;
  baseUrl: string;
  modelName: string;
}

/** A saved conversation session stored in localStorage */
export interface ConversationSession {
  id: string;
  title: string;          // first user message (truncated)
  diagramType: DiagramType;
  messages: Message[];
  createdAt: number;      // timestamp ms
}

const HISTORY_KEY = "ai-excalidraw-history";
const ONE_MONTH_MS = 30 * 24 * 60 * 60 * 1000;

export function loadHistory(): ConversationSession[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    const all: ConversationSession[] = JSON.parse(raw);
    const cutoff = Date.now() - ONE_MONTH_MS;
    return all.filter((s) => s.createdAt >= cutoff);
  } catch {
    return [];
  }
}

export function saveHistory(sessions: ConversationSession[]) {
  try {
    const cutoff = Date.now() - ONE_MONTH_MS;
    const filtered = sessions.filter((s) => s.createdAt >= cutoff);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(filtered));
  } catch {
    // storage full or unavailable
  }
}

export function deleteSessionFromHistory(id: string) {
  const sessions = loadHistory().filter((s) => s.id !== id);
  saveHistory(sessions);
}

export function appendSessionToHistory(session: ConversationSession) {
  const sessions = loadHistory().filter((s) => s.id !== session.id);
  sessions.unshift(session);
  saveHistory(sessions);
}

export interface AppState {
  sidebarOpen: boolean;
  sidebarWidth: number;
  /** Fraction (0–1) of the sidebar height allocated to the AI chat area */
  chatHeightFraction: number;
  diagramType: DiagramType;
  messages: Message[];
  mermaidCode: string;
  settingsOpen: boolean;
  modelConfig: ModelConfig;
  isGenerating: boolean;
  importMode: "replace" | "append";
  elementCount: number;
  canvasTheme: "dark" | "light";
  currentSessionId: string;
  libraryPanelOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  setSidebarWidth: (width: number) => void;
  setChatHeightFraction: (fraction: number) => void;
  setDiagramType: (type: DiagramType) => void;
  addMessage: (message: Message) => void;
  clearMessages: () => void;
  setMermaidCode: (code: string) => void;
  setSettingsOpen: (open: boolean) => void;
  setModelConfig: (config: Partial<ModelConfig>) => void;
  setIsGenerating: (generating: boolean) => void;
  setImportMode: (mode: "replace" | "append") => void;
  setElementCount: (count: number) => void;
  setCanvasTheme: (theme: "dark" | "light") => void;
  startNewSession: () => void;
  setLibraryPanelOpen: (open: boolean) => void;
}

function newSessionId() {
  return `sess-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

const defaultModelConfig: ModelConfig = {
  provider: "deepseek",
  apiKey: "",
  baseUrl: "https://api.deepseek.com/v1",
  modelName: "deepseek-chat",
};

export const useAppStore = create<AppState>((set, get) => ({
  sidebarOpen: true,
  sidebarWidth: 320,
  chatHeightFraction: 0.38,   // AI chat takes ~38% by default, code editor ~62%
  diagramType: "architecture",
  messages: [],
  mermaidCode: "",
  settingsOpen: false,
  modelConfig: defaultModelConfig,
  isGenerating: false,
  importMode: "replace",
  elementCount: 0,
  canvasTheme: "dark",
  currentSessionId: newSessionId(),
  libraryPanelOpen: false,
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  setSidebarWidth: (width) => set({ sidebarWidth: Math.min(Math.max(width, 240), 520) }),
  setChatHeightFraction: (fraction) =>
    set({ chatHeightFraction: Math.min(Math.max(fraction, 0.15), 0.75) }),
  setDiagramType: (type) => set({ diagramType: type, messages: [] }),
  addMessage: (message) => set((state) => ({ messages: [...state.messages, message] })),
  clearMessages: () => set({ messages: [] }),
  setMermaidCode: (code) => set({ mermaidCode: code }),
  setSettingsOpen: (open) => set({ settingsOpen: open }),
  setModelConfig: (config) =>
    set((state) => ({ modelConfig: { ...state.modelConfig, ...config } })),
  setIsGenerating: (generating) => set({ isGenerating: generating }),
  setImportMode: (mode) => set({ importMode: mode }),
  setElementCount: (count) => set({ elementCount: count }),
  setCanvasTheme: (theme) => set({ canvasTheme: theme }),
  setLibraryPanelOpen: (open) => set({ libraryPanelOpen: open }),
  startNewSession: () => {
    const { messages, diagramType, currentSessionId } = get();
    if (messages.length > 0) {
      const firstUserMsg = messages.find((m) => m.role === "user")?.content ?? "对话";
      const session: ConversationSession = {
        id: currentSessionId,
        title: firstUserMsg.slice(0, 40),
        diagramType,
        messages,
        createdAt: Date.now(),
      };
      appendSessionToHistory(session);
    }
    set({ messages: [], currentSessionId: newSessionId() });
  },
}));

// Auto-save on page unload
if (typeof window !== "undefined") {
  window.addEventListener("beforeunload", () => {
    const { messages, diagramType, currentSessionId } = useAppStore.getState();
    if (messages.length > 0) {
      const firstUserMsg = messages.find((m) => m.role === "user")?.content ?? "对话";
      const session: ConversationSession = {
        id: currentSessionId,
        title: firstUserMsg.slice(0, 40),
        diagramType,
        messages,
        createdAt: Date.now(),
      };
      appendSessionToHistory(session);
    }
  });
}
