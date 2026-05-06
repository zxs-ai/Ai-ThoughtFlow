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
        <p>{t.settings.developer}: zxs-ai</p>
        <div className="about-links">
          <p>
            GitHub:{" "}
            <a
              href="https://github.com/zxs-ai/Ai-ThoughtFlow"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "var(--accent)", textDecoration: "none" }}
            >
              github.com/zxs-ai/Ai-ThoughtFlow
            </a>
          </p>
        </div>
        <div className="about-deps">
          <p>{t.settings.basedOn}</p>
          <ul>
            <li>Excalidraw (MIT) - excalidraw.com</li>
            <li>Tauri (MIT/Apache-2.0) - tauri.app</li>
            <li>React (MIT) - react.dev</li>
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
