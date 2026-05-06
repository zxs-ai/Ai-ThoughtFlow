import type { ModelConfig } from "../stores/appStore";

const CONFIG_KEY = "ai-thoughtflow-config";
const AUTOSAVE_KEY = "ai-thoughtflow-autosave";

// Detect if running inside Tauri
function isTauri(): boolean {
  return typeof window !== "undefined" && !!(window as any).__TAURI_INTERNALS__;
}

// ── Tauri storage helpers (lazy-loaded) ─────────────────────────────────────

async function tauriReadFile(filePath: string): Promise<string | null> {
  try {
    const { readTextFile, BaseDirectory } = await import("@tauri-apps/plugin-fs");
    return await readTextFile(filePath, { baseDir: BaseDirectory.Home });
  } catch {
    return null;
  }
}

async function tauriWriteFile(filePath: string, content: string): Promise<void> {
  const { writeTextFile, mkdir, exists, BaseDirectory } = await import("@tauri-apps/plugin-fs");
  const dir = ".ai-thoughtflow";
  const dirExists = await exists(dir, { baseDir: BaseDirectory.Home });
  if (!dirExists) {
    await mkdir(dir, { baseDir: BaseDirectory.Home, recursive: true });
  }
  await writeTextFile(filePath, content, { baseDir: BaseDirectory.Home });
}

// ── Public API ──────────────────────────────────────────────────────────────

export async function loadConfig(): Promise<ModelConfig | null> {
  try {
    if (isTauri()) {
      const content = await tauriReadFile(".ai-thoughtflow/config.json");
      return content ? (JSON.parse(content) as ModelConfig) : null;
    }
    // Browser fallback: localStorage
    const stored = localStorage.getItem(CONFIG_KEY);
    return stored ? (JSON.parse(stored) as ModelConfig) : null;
  } catch {
    return null;
  }
}

export async function saveConfig(config: ModelConfig): Promise<void> {
  try {
    if (isTauri()) {
      await tauriWriteFile(
        ".ai-thoughtflow/config.json",
        JSON.stringify(config, null, 2)
      );
      return;
    }
    // Browser fallback
    localStorage.setItem(CONFIG_KEY, JSON.stringify(config));
  } catch {
    // silently fail
  }
}

export async function loadAutosave(): Promise<string | null> {
  try {
    if (isTauri()) {
      return await tauriReadFile(".ai-thoughtflow/autosave.excalidraw");
    }
    return localStorage.getItem(AUTOSAVE_KEY);
  } catch {
    return null;
  }
}

export async function saveAutosave(data: string): Promise<void> {
  try {
    if (isTauri()) {
      await tauriWriteFile(".ai-thoughtflow/autosave.excalidraw", data);
      return;
    }
    localStorage.setItem(AUTOSAVE_KEY, data);
  } catch {
    // silently fail
  }
}
