import React from "react";
import { useTranslation } from "../../i18n/I18nContext";

export const AboutSection: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="settings-section">
      <h3>{t.settings.about}</h3>
      <div className="about-content">
        <h2>Ai ThoughtFlow v1.0.0</h2>
        <p>{t.settings.mitLicense}</p>
        <p>{t.settings.developer}: applexyz</p>
        <div className="about-deps">
          <p>{t.settings.basedOn}</p>
          <ul>
            <li>Excalidraw (MIT)</li>
            <li>Tauri (MIT/Apache-2.0)</li>
            <li>React (MIT)</li>
          </ul>
          <p style={{ fontSize: 11, opacity: 0.5, marginTop: 8 }}>
            {t.settings.originalProject}
          </p>
        </div>
        <p className="about-star">{t.settings.starHint}</p>
      </div>
    </div>
  );
};
