import React, { useEffect, useState } from "react";
import { useAppStore } from "../../stores/appStore";
import { useTranslation } from "../../i18n/I18nContext";
import { getCurrentWindow } from "@tauri-apps/api/window";

const appWindow = getCurrentWindow();

export const TitleBar: React.FC = () => {
  const { setSettingsOpen, sidebarOpen, setSidebarOpen } = useAppStore();
  const { t } = useTranslation();
  const [isMaximized, setIsMaximized] = useState(false);
  const [platform, setPlatform] = useState<string>("");

  useEffect(() => {
    // Detect platform
    const ua = navigator.userAgent.toLowerCase();
    if (ua.includes("win")) setPlatform("windows");
    else if (ua.includes("mac")) setPlatform("macos");
    else setPlatform("linux");

    // Listen for maximize events
    const unlisten = appWindow.onResized(async () => {
      const maximized = await appWindow.isMaximized();
      setIsMaximized(maximized);
    });

    return () => {
      unlisten.then((u) => u());
    };
  }, []);

  const handleMinimize = () => appWindow.minimize();
  const handleMaximize = async () => {
    await appWindow.toggleMaximize();
    const maximized = await appWindow.isMaximized();
    setIsMaximized(maximized);
  };
  const handleClose = () => appWindow.close();

  return (
    <div
      className="title-bar"
      data-tauri-drag-region
    >
      <div className="title-bar-left" data-tauri-drag-region>
        <button
          className="title-bar-toggle"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          title={sidebarOpen ? t.titleBar.collapseSidebar : t.titleBar.expandSidebar}
        >
          {sidebarOpen ? "◀" : "▶"}
        </button>
        <span className="title-bar-name" data-tauri-drag-region>
          Ai ThoughtFlow Pro
        </span>
      </div>
      <div className="title-bar-center" data-tauri-drag-region />
      <div className="title-bar-actions">
        <button
          className="title-bar-btn"
          onClick={() => setSettingsOpen(true)}
          title={t.titleBar.settings}
        >
          ⚙️
        </button>

        {/* ── Windows Window Controls ── */}
        {platform !== "macos" && (
          <div className="window-controls">
            <button className="window-control-btn" onClick={handleMinimize} title="Minimize">
              <svg width="12" height="12" viewBox="0 0 12 12"><rect fill="currentColor" x="1" y="5.5" width="10" height="1"/></svg>
            </button>
            <button className="window-control-btn" onClick={handleMaximize} title={isMaximized ? "Restore" : "Maximize"}>
              {isMaximized ? (
                <svg width="12" height="12" viewBox="0 0 12 12"><path fill="none" stroke="currentColor" d="M3.5,3.5 L3.5,8.5 L8.5,8.5 L8.5,3.5 L3.5,3.5 Z M5.5,3.5 L5.5,1.5 L10.5,1.5 L10.5,6.5 L8.5,6.5" /></svg>
              ) : (
                <svg width="12" height="12" viewBox="0 0 12 12"><rect fill="none" stroke="currentColor" x="2.5" y="2.5" width="7" height="7"/></svg>
              )}
            </button>
            <button className="window-control-btn close" onClick={handleClose} title="Close">
              <svg width="12" height="12" viewBox="0 0 12 12"><path fill="currentColor" d="M10.5,2.1 L9.9,1.5 L6,5.4 L2.1,1.5 L1.5,2.1 L5.4,6 L1.5,9.9 L2.1,10.5 L6,6.6 L9.9,10.5 L10.5,9.9 L6.6,6 Z"/></svg>
            </button>
          </div>
        )}
      </div>
      <style>{`
        .title-bar {
          height: 44px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 16px;
          background: #18181f;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
          user-select: none;
          flex-shrink: 0;
          position: relative;
          z-index: 100;
          border-radius: 12px 12px 0 0;
        }
        .title-bar-left {
          display: flex;
          align-items: center;
          gap: 12px;
          flex-shrink: 0;
        }
        .title-bar-center {
          flex: 1;
          height: 100%;
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
        }
        .title-bar-toggle:hover {
          background: rgba(255, 255, 255, 0.12);
        }
        .title-bar-actions {
          display: flex;
          align-items: center;
          gap: 4px;
          flex-shrink: 0;
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
          margin-right: 8px;
        }
        .title-bar-btn:hover {
          background: rgba(255, 255, 255, 0.12);
        }

        /* Window Controls */
        .window-controls {
          display: flex;
          align-items: center;
          height: 100%;
          margin-right: -16px; /* Offset title-bar padding */
        }
        .window-control-btn {
          width: 46px;
          height: 44px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: transparent;
          border: none;
          color: rgba(255, 255, 255, 0.6);
          cursor: pointer;
          transition: background 0.2s, color 0.2s;
        }
        .window-control-btn:hover {
          background: rgba(255, 255, 255, 0.1);
          color: white;
        }
        .window-control-btn.close:hover {
          background: #e81123;
          color: white;
        }
      `}</style>
    </div>
  );
};
