import React from "react";
import { useAppStore } from "../../stores/appStore";
import { useTranslation } from "../../i18n/I18nContext";
import { ModelConfig } from "./ModelConfig";
import { AboutSection } from "./AboutSection";
import "./Settings.css";

export const SettingsModal: React.FC = () => {
  const { settingsOpen, setSettingsOpen } = useAppStore();
  const { t } = useTranslation();

  if (!settingsOpen) return null;

  return (
    <div className="settings-overlay" onClick={() => setSettingsOpen(false)}>
      <div className="settings-modal" onClick={(e) => e.stopPropagation()}>
        <div className="settings-header">
          <h2>{t.settings.title}</h2>
          <button className="settings-close" onClick={() => setSettingsOpen(false)}>
            ✕
          </button>
        </div>
        <div className="settings-body">
          <ModelConfig />
          <AboutSection />
        </div>
      </div>
    </div>
  );
};
