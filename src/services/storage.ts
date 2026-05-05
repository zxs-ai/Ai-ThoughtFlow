import {
  BaseDirectory,
  readTextFile,
  writeTextFile,
  mkdir,
  exists,
} from "@tauri-apps/plugin-fs";
import { appDataDir, join } from "@tauri-apps/api/path";
import type { ModelConfig } from "../stores/appStore";

const CONFIG_DIR = ".excalidraw-ai";
const CONFIG_FILE = "config.json";
const AUTOSAVE_FILE = "autosave.excalidraw";

async function ensureConfigDir(): Promise<void> {
  const appData = await appDataDir();
  const configPath = await join(appData, CONFIG_DIR);
  const dirExists = await exists(configPath);
  if (!dirExists) {
    await mkdir(configPath, { recursive: true });
  }
}

export async function loadConfig(): Promise<ModelConfig | null> {
  try {
    await ensureConfigDir();
    const content = await readTextFile(`${CONFIG_DIR}/${CONFIG_FILE}`, {
      baseDir: BaseDirectory.AppData,
    });
    return JSON.parse(content) as ModelConfig;
  } catch {
    return null;
  }
}

export async function saveConfig(config: ModelConfig): Promise<void> {
  await ensureConfigDir();
  await writeTextFile(
    `${CONFIG_DIR}/${CONFIG_FILE}`,
    JSON.stringify(config, null, 2),
    { baseDir: BaseDirectory.AppData }
  );
}

export async function loadAutosave(): Promise<string | null> {
  try {
    const content = await readTextFile(`${CONFIG_DIR}/${AUTOSAVE_FILE}`, {
      baseDir: BaseDirectory.AppData,
    });
    return content;
  } catch {
    return null;
  }
}

export async function saveAutosave(data: string): Promise<void> {
  await ensureConfigDir();
  await writeTextFile(
    `${CONFIG_DIR}/${AUTOSAVE_FILE}`,
    data,
    { baseDir: BaseDirectory.AppData }
  );
}
