// Shared library item persistence
import type { LibraryItems } from "@excalidraw/excalidraw/types";

const LIBRARY_KEY = "ai-excalidraw-library-items";

export function loadLibraryItems(): LibraryItems {
  try {
    const raw = localStorage.getItem(LIBRARY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveLibraryItems(items: LibraryItems | readonly any[]) {
  try {
    localStorage.setItem(LIBRARY_KEY, JSON.stringify(items));
  } catch {}
}
