import React from "react";
import { useAppStore } from "../../stores/appStore";
import { useTranslation } from "../../i18n/I18nContext";

export const TitleBar: React.FC = () => {
  const { setSettingsOpen, sidebarOpen, setSidebarOpen } = useAppStore();
  const { t } = useTranslation();

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
          Ai ThoughtFlow
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
          gap: 8px;
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
        }
        .title-bar-btn:hover {
          background: rgba(255, 255, 255, 0.12);
        }
      `}</style>
    </div>
  );
};
