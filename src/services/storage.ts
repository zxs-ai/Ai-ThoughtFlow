import type { ModelConfig } from "../stores/appStore";

const CONFIG_KEY = "ai-thought-flow-pro-config";
const AUTOSAVE_KEY = "ai-thought-flow-pro-autosave";

// Detect if running inside Tauri
function isTauri(): boolean {
  return typeof window !== "undefined" && !!(window as any).__TAURI_INTERNALS__;
}

// ── Tauri storage helpers ─────────────────────────────────────────────────────

async function tauriReadFile(filePath: string): Promise<string | null> {
  try {
    const { readTextFile, BaseDirectory } = await import("@tauri-apps/plugin-fs");
    return await readTextFile(filePath, { baseDir: BaseDirectory.Home });
  } catch {
    return null;
  }
}

async function tauriWriteFile(filePath: string, content: string): Promise<void> {
  const { writeTextFile, mkdir, BaseDirectory } = await import("@tauri-apps/plugin-fs");
  const dir = ".ai-thought-flow-pro";

  // 强制创建目录（recursive=true 保证幂等，即使已存在也不报错）
  try {
    await mkdir(dir, { baseDir: BaseDirectory.Home, recursive: true });
  } catch {
    // 目录可能已存在，忽略错误
  }

  await writeTextFile(filePath, content, { baseDir: BaseDirectory.Home });
}

// ── Public API ──────────────────────────────────────────────────────────────

export async function loadConfig(): Promise<ModelConfig | null> {
  // 优先 localStorage（Tauri WebView 的 localStorage 在重启间是持久的）
  // 双写策略：localStorage 作为快速缓存，文件作为备份
  try {
    const stored = localStorage.getItem(CONFIG_KEY);
    if (stored) {
      return JSON.parse(stored) as ModelConfig;
    }
  } catch {
    // ignore
  }

  // localStorage 没有时，从 Tauri 文件读取（迁移旧数据）
  if (isTauri()) {
    try {
      const content = await tauriReadFile(".ai-thought-flow-pro/config.json");
      if (content) {
        const config = JSON.parse(content) as ModelConfig;
        // 回写到 localStorage 加速下次读取
        try { localStorage.setItem(CONFIG_KEY, JSON.stringify(config)); } catch {}
        return config;
      }
    } catch {
      // ignore
    }
  }

  return null;
}

export async function saveConfig(config: ModelConfig): Promise<void> {
  const json = JSON.stringify(config, null, 2);

  // 1. 优先写 localStorage（同步可靠，Tauri WebView 重启后持久）
  try {
    localStorage.setItem(CONFIG_KEY, json);
  } catch {
    // ignore
  }

  // 2. 同时异步写入文件（备份）
  if (isTauri()) {
    tauriWriteFile(".ai-thought-flow-pro/config.json", json).catch((err) => {
      console.warn("[storage] 文件备份写入失败（不影响 localStorage 存储）:", err);
    });
  }
}

export async function loadAutosave(): Promise<string | null> {
  try {
    if (isTauri()) {
      return await tauriReadFile(".ai-thought-flow-pro/autosave.excalidraw");
    }
    return localStorage.getItem(AUTOSAVE_KEY);
  } catch {
    return null;
  }
}

export async function saveAutosave(data: string): Promise<void> {
  try {
    if (isTauri()) {
      await tauriWriteFile(".ai-thought-flow-pro/autosave.excalidraw", data);
      return;
    }
    localStorage.setItem(AUTOSAVE_KEY, data);
  } catch {
    // silently fail
  }
}
