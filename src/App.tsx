import React, { useEffect } from "react";
import { useAppStore } from "./stores/appStore";
import { loadConfig, saveConfig } from "./services/storage";
import { TitleBar } from "./components/TitleBar/TitleBar";
import { AISidebar } from "./components/AISidebar/AISidebar";
import { ExcalidrawCanvas } from "./components/Canvas/ExcalidrawCanvas";
import { StatusBar } from "./components/StatusBar/StatusBar";
import { SettingsModal } from "./components/Settings/SettingsModal";

const App: React.FC = () => {
  const { sidebarOpen, setSidebarOpen, modelConfig, setModelConfig } = useAppStore();

  // Load config on mount
  useEffect(() => {
    loadConfig().then((config) => {
      if (config) setModelConfig(config);
    });
  }, [setModelConfig]);

  // Save config when it changes
  useEffect(() => {
    const timer = setTimeout(() => {
      if (modelConfig.apiKey) {
        saveConfig(modelConfig).catch(() => {});
      }
    }, 1000);
    return () => clearTimeout(timer);
  }, [modelConfig]);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "b") {
        e.preventDefault();
        setSidebarOpen(!sidebarOpen);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [sidebarOpen, setSidebarOpen]);

  return (
    <div className="app-container">
      <TitleBar />
      <div className="app-main">
        <AISidebar />
        <ExcalidrawCanvas />
      </div>
      <StatusBar />
      <SettingsModal />
      <style>{`
        .app-container {
          width: 100vw;
          height: 100vh;
          display: flex;
          flex-direction: column;
          background: var(--bg-primary);
          border-radius: 12px;
          overflow: hidden;
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
