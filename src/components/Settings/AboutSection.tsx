import React from "react";
import { useTranslation } from "../../i18n/I18nContext";

export const AboutSection: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="settings-section">
      <h3>{t.settings.about}</h3>
      <div className="about-content">
        <h2>Ai ThoughtFlow Pro v1.0.0</h2>
        <p>{t.settings.mitLicense}</p>
        <p>{t.settings.developer}: applexyz</p>
        <div className="about-deps">
          <p>{t.settings.basedOn}</p>
          <ul>
            <li>Excalidraw (MIT)</li>
            <li>Tauri (MIT/Apache-2.0)</li>
            <li>React (MIT)</li>
          </ul>
        </div>
        <a
          className="about-star"
          href="https://gitee.com/applexyz/ai-thought-flow"
          target="_blank"
          rel="noopener noreferrer"
          style={{ display: "block", cursor: "pointer", textDecoration: "none" }}
        >
          {t.settings.starHint}
        </a>
      </div>
    </div>
  );
};
