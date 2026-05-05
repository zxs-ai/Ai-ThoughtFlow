import React from "react";
import { useAppStore } from "../../stores/appStore";

export const TitleBar: React.FC = () => {
  const { setSettingsOpen, sidebarOpen, setSidebarOpen } = useAppStore();

  return (
    <div
      className="title-bar"
      data-tauri-drag-region
    >
      <div className="title-bar-left" data-tauri-drag-region>
        <button
          className="title-bar-toggle"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          title={sidebarOpen ? "折叠侧边栏 (Cmd+B)" : "展开侧边栏 (Cmd+B)"}
        >
          {sidebarOpen ? "◀" : "▶"}
        </button>
        <span className="title-bar-name" data-tauri-drag-region>
          ExcaliDraw AI
        </span>
      </div>
      <div className="title-bar-actions" data-tauri-drag-region>
        <button
          className="title-bar-btn"
          onClick={() => setSettingsOpen(true)}
          title="设置"
        >
          ⚙️
        </button>
      </div>
      <style>{`
        .title-bar {
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 16px;
          background: rgba(10, 10, 15, 0.6);
          backdrop-filter: blur(20px) saturate(180%);
          -webkit-backdrop-filter: blur(20px) saturate(180%);
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
          user-select: none;
          -webkit-app-region: drag;
          flex-shrink: 0;
        }
        .title-bar-left {
          display: flex;
          align-items: center;
          gap: 12px;
          -webkit-app-region: drag;
        }
        .title-bar-name {
          font-size: 14px;
          font-weight: 600;
          color: var(--text-primary);
          letter-spacing: 0.3px;
        }
        .title-bar-toggle {
          width: 28px;
          height: 28px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(255, 255, 255, 0.06);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 6px;
          color: var(--text-primary);
          font-size: 11px;
          cursor: pointer;
          transition: var(--transition-smooth);
          -webkit-app-region: no-drag;
        }
        .title-bar-toggle:hover {
          background: rgba(255, 255, 255, 0.12);
        }
        .title-bar-actions {
          display: flex;
          align-items: center;
          gap: 8px;
          -webkit-app-region: drag;
        }
        .title-bar-btn {
          width: 28px;
          height: 28px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: transparent;
          border: none;
          border-radius: 6px;
          color: var(--text-primary);
          font-size: 15px;
          cursor: pointer;
          transition: var(--transition-smooth);
          -webkit-app-region: no-drag;
        }
        .title-bar-btn:hover {
          background: rgba(255, 255, 255, 0.12);
        }
      `}</style>
    </div>
  );
};
