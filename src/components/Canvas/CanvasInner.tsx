import React, { useEffect, useCallback, useState, useRef } from "react";
import { Excalidraw, MainMenu, serializeAsJSON, exportToBlob, loadFromBlob } from "@excalidraw/excalidraw";
import type { LibraryItems } from "@excalidraw/excalidraw/types";
import { useAppStore } from "../../stores/appStore";
import { useTranslation } from "../../i18n/I18nContext";
import { loadAutosave, saveAutosave } from "../../services/storage";
import { loadLibraryItems, saveLibraryItems } from "./libraryStorage";

// Detect if running inside Tauri
function isTauri(): boolean {
  return typeof window !== "undefined" && !!(window as any).__TAURI_INTERNALS__;
}

// Toast notification component for import status
function ImportToast({ message, type, onDismiss }: {
  message: string;
  type: "success" | "error" | "info";
  onDismiss: () => void;
}) {
  useEffect(() => {
    const timer = setTimeout(onDismiss, 5000);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  const colors = {
    success: { bg: "rgba(52, 199, 89, 0.15)", border: "rgba(52, 199, 89, 0.3)", text: "#34c759" },
    error: { bg: "rgba(255, 59, 48, 0.15)", border: "rgba(255, 59, 48, 0.3)", text: "#ff6b6b" },
    info: { bg: "rgba(0, 122, 255, 0.15)", border: "rgba(0, 122, 255, 0.3)", text: "#0a84ff" },
  };
  const c = colors[type];

  return (
    <div style={{
      position: "absolute", bottom: 16, left: "50%", transform: "translateX(-50%)",
      padding: "10px 20px", borderRadius: 10, zIndex: 50,
      background: c.bg, border: `1px solid ${c.border}`, color: c.text,
      fontSize: 13, fontFamily: "var(--font-system)", backdropFilter: "blur(12px)",
      animation: "fadeIn 0.2s ease",
    }}>
      {message}
    </div>
  );
}

// Icons for custom menu items
const linkIcon = (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
  </svg>
);

const saveIcon = (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
    <polyline points="17 21 17 13 7 13 7 21" />
    <polyline points="7 3 7 8 15 8" />
  </svg>
);

const imageIcon = (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
    <circle cx="8.5" cy="8.5" r="1.5" />
    <polyline points="21 15 16 10 5 21" />
  </svg>
);

const openIcon = (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
  </svg>
);

// ── Tauri file operations ───────────────────────────────────────────────────

async function tauriSaveScene(excalidrawAPI: any): Promise<string | null> {
  const { save } = await import("@tauri-apps/plugin-dialog");
  const { writeTextFile } = await import("@tauri-apps/plugin-fs");
  const { documentDir } = await import("@tauri-apps/api/path");

  const docDir = await documentDir();
  const filePath = await save({
    title: "保存 Excalidraw 文件",
    defaultPath: `${docDir}/untitled.excalidraw`,
    filters: [{ name: "Excalidraw", extensions: ["excalidraw"] }],
  });

  if (!filePath) return null;

  const elements = excalidrawAPI.getSceneElements();
  const appState = excalidrawAPI.getAppState();
  const files = excalidrawAPI.getFiles();
  const json = serializeAsJSON(elements, appState, files, "local");

  await writeTextFile(filePath, json);
  return filePath;
}

async function tauriSaveAsImage(excalidrawAPI: any, format: "png" | "svg" = "png"): Promise<string | null> {
  const { save } = await import("@tauri-apps/plugin-dialog");
  const { writeFile, writeTextFile } = await import("@tauri-apps/plugin-fs");
  const { documentDir } = await import("@tauri-apps/api/path");

  const ext = format;
  const docDir = await documentDir();
  const filePath = await save({
    title: "导出为图片",
    defaultPath: `${docDir}/untitled.${ext}`,
    filters: [{ name: format.toUpperCase(), extensions: [ext] }],
  });

  if (!filePath) return null;

  const elements = excalidrawAPI.getSceneElements();
  const appState = excalidrawAPI.getAppState();
  const files = excalidrawAPI.getFiles();

  if (format === "svg") {
    const { exportToSvg } = await import("@excalidraw/excalidraw");
    const svg = await exportToSvg({ elements, appState, files });
    await writeTextFile(filePath, svg.outerHTML);
  } else {
    const blob = await exportToBlob({
      elements,
      appState: {
        ...appState,
        exportBackground: true,
        exportWithDarkMode: false,
      },
      files,
      mimeType: "image/png",
      quality: 1,
      scale: 3, // 3x 超清分辨率（约 216 dpi）
    });
    const arrayBuffer = await blob.arrayBuffer();
    await writeFile(filePath, new Uint8Array(arrayBuffer));
  }

  return filePath;
}

async function tauriOpenScene(): Promise<{ elements: any[]; appState: any; files: any } | null> {
  const { open } = await import("@tauri-apps/plugin-dialog");
  const { readFile } = await import("@tauri-apps/plugin-fs");

  const filePath = await open({
    title: "打开 Excalidraw 文件",
    multiple: false,
    filters: [
      { name: "Excalidraw", extensions: ["excalidraw", "excalidraw.json", "json"] },
    ],
  });

  if (!filePath) return null;

  const fileData = await readFile(filePath as string);
  const blob = new Blob([fileData], { type: "application/json" });
  const result = await loadFromBlob(blob, null, null);
  return result;
}

// ────────────────────────────────────────────────────────────────────────────

function CanvasInner() {
  const excalidrawRef = React.useRef<any>(null);
  const prevCountRef = useRef<number>(-1);
  const [ready, setReady] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);
  const [libraryItems, setLibraryItems] = useState<LibraryItems>(loadLibraryItems);
  const {
    mermaidCode,
    importMode,
    setElementCount,
    canvasTheme,
    setLibraryPanelOpen,
    cartoonElements,
  } = useAppStore();
  const { t, lang } = useTranslation();

  // Persist library whenever user adds / removes items
  const handleLibraryChange = useCallback((items: LibraryItems) => {
    setLibraryItems(items);
    saveLibraryItems(items);
  }, []);

  // Toggle library browser panel via global store
  const handleBrowseLibraries = useCallback(() => {
    setLibraryPanelOpen(true);
  }, [setLibraryPanelOpen]);

  // Handle cartoon engine elements (new pipeline)
  useEffect(() => {
    if (!cartoonElements || cartoonElements.length === 0 || !excalidrawRef.current) return;

    const api = excalidrawRef.current;
    setToast({ message: t.canvas.converting, type: "info" });

    try {
      if (importMode === "replace") {
        api.updateScene({ elements: cartoonElements });
      } else {
        const current = api.getSceneElements();
        api.updateScene({ elements: [...current, ...cartoonElements] });
      }
      api.scrollToContent();
      setToast({ message: `🎨 ${t.canvas.generated} (${cartoonElements.length})`, type: "success" });
    } catch (err: any) {
      console.error("Cartoon render failed:", err);
      setToast({ message: `${t.canvas.importFailed}: ${err.message || t.canvas.unknownError}`, type: "error" });
    }

    // Clear the signal so it doesn't re-trigger
    useAppStore.setState({ cartoonElements: null });
  }, [cartoonElements, importMode, t]);

  // Handle mermaid import (fallback pipeline)
  useEffect(() => {
    if (!mermaidCode || !excalidrawRef.current) return;

    setToast({ message: t.canvas.converting, type: "info" });

    import("../../services/mermaidConverter")
      .then(({ convertMermaidToExcalidraw }) =>
        convertMermaidToExcalidraw(mermaidCode)
      )
      .then((result) => {
        if (result.success && excalidrawRef.current) {
          const api = excalidrawRef.current;

          if (result.files) {
            api.addFiles(
              Object.entries(result.files).map(([id, file]: [string, any]) => ({
                id,
                ...file,
              }))
            );
          }

          if (importMode === "replace") {
            api.updateScene({ elements: result.elements });
          } else {
            const current = api.getSceneElements();
            api.updateScene({ elements: [...current, ...result.elements] });
          }
          api.scrollToContent();
          setToast({ message: `${t.canvas.generated} (${result.elements.length})`, type: "success" });
        } else if (!result.success) {
          console.error("Mermaid conversion failed:", result.error);
          setToast({ message: `${t.canvas.conversionFailed}: ${result.error}`, type: "error" });
        }
      })
      .catch((err: Error) => {
        console.error("Import failed:", err);
        setToast({ message: `${t.canvas.importFailed}: ${err.message || t.canvas.unknownError}`, type: "error" });
      });
  }, [mermaidCode, importMode, t]);

  // Autosave every 30s
  useEffect(() => {
    const interval = setInterval(() => {
      if (excalidrawRef.current) {
        const elements = excalidrawRef.current.getSceneElements();
        const appState = excalidrawRef.current.getAppState();
        const data = JSON.stringify({ elements, appState });
        saveAutosave(data).catch(() => {});
      }
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  // Load autosave after Excalidraw is ready
  useEffect(() => {
    if (!ready || !excalidrawRef.current) return;
    loadAutosave().then((data) => {
      if (data && excalidrawRef.current) {
        try {
          const parsed = JSON.parse(data);
          if (parsed.elements) {
            excalidrawRef.current.updateScene({ elements: parsed.elements });
          }
        } catch {
          // ignore invalid
        }
      }
    });
  }, [ready]);

  const onChange = useCallback(
    (elements: readonly any[]) => {
      const count = elements.length;
      if (count !== prevCountRef.current) {
        prevCountRef.current = count;
        setElementCount(count);
      }
    },
    [setElementCount]
  );

  const handleExcalidrawAPI = useCallback((api: any) => {
    excalidrawRef.current = api;
    // Expose to window so App.tsx can call updateLibrary on import
    (window as any).__excalidrawAPI = api;
    setReady(true);
  }, []);

  // Custom save handler (Tauri native dialog)
  const handleSave = useCallback(async () => {
    if (!excalidrawRef.current) return;
    try {
      const path = await tauriSaveScene(excalidrawRef.current);
      if (path) {
        setToast({ message: lang === "zh-CN" ? `已保存: ${path}` : `Saved: ${path}`, type: "success" });
      }
    } catch (err: any) {
      console.error("Save failed:", err);
      setToast({ message: `${lang === "zh-CN" ? "保存失败" : "Save failed"}: ${err.message || ""}`, type: "error" });
    }
  }, [lang]);

  // Custom save-as-image handler (Tauri native dialog)
  const handleSaveAsImage = useCallback(async () => {
    if (!excalidrawRef.current) return;
    try {
      const path = await tauriSaveAsImage(excalidrawRef.current, "png");
      if (path) {
        setToast({ message: lang === "zh-CN" ? `已导出: ${path}` : `Exported: ${path}`, type: "success" });
      }
    } catch (err: any) {
      console.error("Export failed:", err);
      setToast({ message: `${lang === "zh-CN" ? "导出失败" : "Export failed"}: ${err.message || ""}`, type: "error" });
    }
  }, [lang]);

  // Browser save — serializes scene and triggers download
  const handleBrowserSave = useCallback(() => {
    if (!excalidrawRef.current) return;
    try {
      const elements = excalidrawRef.current.getSceneElements();
      const appState = excalidrawRef.current.getAppState();
      const files = excalidrawRef.current.getFiles();
      const json = serializeAsJSON(elements, appState, files, "local");
      const blob = new Blob([json], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "untitled.excalidraw";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setToast({ message: lang === "zh-CN" ? "浏览器下载已开始" : "Download started", type: "success" });
    } catch (err: any) {
      console.error("Browser save failed:", err);
      setToast({ message: `${lang === "zh-CN" ? "保存失败" : "Save failed"}: ${err.message || ""}`, type: "error" });
    }
  }, [lang]);

  // Browser export — exports scene as PNG and triggers download
  const handleBrowserSaveAsImage = useCallback(async () => {
    if (!excalidrawRef.current) return;
    try {
      const elements = excalidrawRef.current.getSceneElements();
      const appState = excalidrawRef.current.getAppState();
      const files = excalidrawRef.current.getFiles();
      const blob = await exportToBlob({
        elements,
        appState: {
          ...appState,
          exportBackground: true,
          exportWithDarkMode: false,
        },
        files,
        mimeType: "image/png",
        quality: 1,
        scale: 3, // 3x 超清分辨率
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "untitled.png";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setToast({ message: lang === "zh-CN" ? "浏览器下载已开始" : "Download started", type: "success" });
    } catch (err: any) {
      console.error("Browser export failed:", err);
      setToast({ message: `${lang === "zh-CN" ? "导出失败" : "Export failed"}: ${err.message || ""}`, type: "error" });
    }
  }, [lang]);

  // Custom open handler (Tauri native dialog)
  const handleOpen = useCallback(async () => {
    if (!excalidrawRef.current) return;
    try {
      const result = await tauriOpenScene();
      if (result && excalidrawRef.current) {
        excalidrawRef.current.updateScene({
          elements: result.elements,
        });
        if (result.files) {
          excalidrawRef.current.addFiles(
            Object.entries(result.files).map(([id, file]: [string, any]) => ({
              id,
              ...file,
            }))
          );
        }
        excalidrawRef.current.scrollToContent();
        setToast({
          message: lang === "zh-CN" ? "文件已打开" : "File opened",
          type: "success",
        });
      }
    } catch (err: any) {
      console.error("Open failed:", err);
      setToast({ message: `${lang === "zh-CN" ? "打开失败" : "Open failed"}: ${err.message || ""}`, type: "error" });
    }
  }, [lang]);

  const useTauriMenu = isTauri();

  // Icon for browse libraries menu item
  const libraryIcon = (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
    </svg>
  );

  return (
    <div className="canvas-area">
      <div className="excalidraw-wrapper">
        <Excalidraw
          excalidrawAPI={handleExcalidrawAPI}
          theme={canvasTheme}
          langCode={lang}
          onChange={onChange}
          initialData={{ libraryItems }}
          onLibraryChange={handleLibraryChange}
          libraryReturnUrl="https://gitee.com/applexyz/ai-thought-flow-pro"
          UIOptions={{
            canvasActions: {
              changeViewBackgroundColor: true,
              clearCanvas: true,
              loadScene: !useTauriMenu,
              saveToActiveFile: false,
              toggleTheme: true,
              saveAsImage: false,
            },
          }}
        >
          {/* Custom MainMenu: replaces Socials with own links, adds Tauri file ops */}
          <MainMenu>
            {useTauriMenu ? (
              <>
                <MainMenu.Item icon={openIcon} onSelect={handleOpen}>
                  {lang === "zh-CN" ? "打开文件..." : "Open File..."}
                </MainMenu.Item>
                <MainMenu.Item icon={saveIcon} onSelect={handleSave} shortcut="⌘S">
                  {lang === "zh-CN" ? "保存到文件..." : "Save to File..."}
                </MainMenu.Item>
                <MainMenu.Item icon={imageIcon} onSelect={handleSaveAsImage} shortcut="⇧⌘E">
                  {lang === "zh-CN" ? "导出为图片..." : "Export as Image..."}
                </MainMenu.Item>
                <MainMenu.Separator />
              </>
            ) : (
              <>
                <MainMenu.DefaultItems.LoadScene />
                <MainMenu.Item icon={saveIcon} onSelect={handleBrowserSave} shortcut="⌘S">
                  {lang === "zh-CN" ? "保存到文件..." : "Save to File..."}
                </MainMenu.Item>
                <MainMenu.Item icon={imageIcon} onSelect={handleBrowserSaveAsImage} shortcut="⇧⌘E">
                  {lang === "zh-CN" ? "导出为图片..." : "Export as Image..."}
                </MainMenu.Item>
              </>
            )}
            <MainMenu.DefaultItems.Export />
            <MainMenu.DefaultItems.CommandPalette />
            <MainMenu.DefaultItems.SearchMenu />
            <MainMenu.DefaultItems.Help />
            <MainMenu.ItemLink
              icon={linkIcon}
              href="https://gitee.com/applexyz/ai-thought-flow-pro"
            >
              {lang === "zh-CN" ? "项目主页" : "Project Home"}
            </MainMenu.ItemLink>
            <MainMenu.DefaultItems.ClearCanvas />
            <MainMenu.DefaultItems.ToggleTheme />
            <MainMenu.DefaultItems.ChangeCanvasBackground />
            <MainMenu.Item icon={libraryIcon} onSelect={handleBrowseLibraries}>
              {lang === "zh-CN" ? "浏览素材库" : "Browse Libraries"}
            </MainMenu.Item>
          </MainMenu>
        </Excalidraw>
      </div>
      {toast && (
        <ImportToast
          message={toast.message}
          type={toast.type}
          onDismiss={() => setToast(null)}
        />
      )}
    </div>
  );
}

export default CanvasInner;
