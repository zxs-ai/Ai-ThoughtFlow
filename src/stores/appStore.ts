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

export interface AppState {
  sidebarOpen: boolean;
  sidebarWidth: number;
  diagramType: DiagramType;
  messages: Message[];
  mermaidCode: string;
  settingsOpen: boolean;
  modelConfig: ModelConfig;
  isGenerating: boolean;
  importMode: "replace" | "append";
  elementCount: number;
  canvasTheme: "dark" | "light";
  setSidebarOpen: (open: boolean) => void;
  setSidebarWidth: (width: number) => void;
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
}

const defaultModelConfig: ModelConfig = {
  provider: "deepseek",
  apiKey: "",
  baseUrl: "https://api.deepseek.com/v1",
  modelName: "deepseek-chat",
};

export const useAppStore = create<AppState>((set) => ({
  sidebarOpen: true,
  sidebarWidth: 320,
  diagramType: "architecture",
  messages: [],
  mermaidCode: "",
  settingsOpen: false,
  modelConfig: defaultModelConfig,
  isGenerating: false,
  importMode: "replace",
  elementCount: 0,
  canvasTheme: "dark",
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  setSidebarWidth: (width) => set({ sidebarWidth: Math.min(Math.max(width, 240), 480) }),
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
}));
