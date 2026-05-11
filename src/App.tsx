import React, { useEffect, useCallback } from "react";
import { useAppStore } from "./stores/appStore";
import { loadConfig, saveConfig } from "./services/storage";
import { TitleBar } from "./components/TitleBar/TitleBar";
import { AISidebar } from "./components/AISidebar/AISidebar";
import { ExcalidrawCanvas } from "./components/Canvas/ExcalidrawCanvas";
import { StatusBar } from "./components/StatusBar/StatusBar";
import { SettingsModal } from "./components/Settings/SettingsModal";
import { LibraryBrowserPanel } from "./components/Canvas/LibraryBrowserPanel";
import type { LibraryItems } from "@excalidraw/excalidraw/types";
import { saveLibraryItems } from "./components/Canvas/libraryStorage";
import { getCurrentWindow } from "@tauri-apps/api/window";

const appWindow = getCurrentWindow();

const App: React.FC = () => {
  const {
    sidebarOpen,
    setSidebarOpen,
    modelConfig,
    setModelConfig,
    libraryPanelOpen,
    setLibraryPanelOpen,
  } = useAppStore();

  // Load config on mount
  useEffect(() => {
    loadConfig().then((config) => {
      if (config) setModelConfig(config);
    });
  }, [setModelConfig]);

  // Save config whenever it changes (debounced 300ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      // 无论 apiKey 是否为空都存储（用户清空也需要持久化）
      saveConfig(modelConfig).catch(() => {});
    }, 300);
    return () => clearTimeout(timer);
  }, [modelConfig]);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey) {
        if (e.key === "b") {
          e.preventDefault();
          setSidebarOpen(!sidebarOpen);
        } else if (e.key === ",") {
          e.preventDefault();
          const { settingsOpen, setSettingsOpen } = useAppStore.getState();
          setSettingsOpen(!settingsOpen);
        } else if (e.key.toLowerCase() === "m") {
          e.preventDefault();
          if (e.shiftKey) {
            appWindow.toggleMaximize();
          } else {
            appWindow.minimize();
          }
        } else if (e.key.toLowerCase() === "w") {
          e.preventDefault();
          appWindow.close();
        }
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [sidebarOpen, setSidebarOpen]);

  // Handle library import from the panel — merge into Excalidraw via global excalidrawAPI ref
  const handleLibraryImport = useCallback((newItems: LibraryItems) => {
    const api = (window as any).__excalidrawAPI;
    if (api) {
      const existingItems: LibraryItems = api.getLibraryItems?.() ?? [];
      const existingIds = new Set(existingItems.map((i: any) => i.id));
      const merged = [...existingItems, ...newItems.filter((i: any) => !existingIds.has(i.id))];
      if (api.updateLibrary) {
        api.updateLibrary({ libraryItems: merged, openLibraryMenu: true });
      }
      saveLibraryItems(merged);
    }
    setLibraryPanelOpen(false);
  }, [setLibraryPanelOpen]);

  return (
    <div className="app-container">
      <TitleBar />
      <div className="app-main">
        <AISidebar />
        <ExcalidrawCanvas />
      </div>
      <StatusBar />
      <SettingsModal />
      {/* Library browser panel — rendered at root to escape overflow:hidden */}
      <LibraryBrowserPanel
        open={libraryPanelOpen}
        onClose={() => setLibraryPanelOpen(false)}
        onImport={handleLibraryImport}
      />
      <style>{`
        .app-container {
          width: 100vw;
          height: 100vh;
          display: flex;
          flex-direction: column;
          background: var(--bg-primary);
          border-radius: 12px;
          overflow: hidden;
          /* Window border so edges are clearly defined */
          border: 1px solid rgba(255, 255, 255, 0.1);
          box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.3);
        }
        .app-main {
          flex: 1;
          display: flex;
          flex-direction: row;
          min-height: 0;
          min-width: 0;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
};

export default App;

