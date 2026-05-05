import React from "react";

export const AboutSection: React.FC = () => {
  return (
    <div className="settings-section">
      <h3>关于</h3>
      <div className="about-content">
        <h2>ExcaliDraw AI v1.0.0</h2>
        <p>MIT License</p>
        <p>作者: zz</p>
        <div className="about-links">
          <p>GitHub: github.com/zz/excalidraw-ai</p>
          <p>Gitee: gitee.com/zz/excalidraw-ai</p>
        </div>
        <div className="about-deps">
          <p>本项目使用了以下开源组件:</p>
          <ul>
            <li>Excalidraw (MIT) - excalidraw.com</li>
            <li>Tauri (MIT/Apache-2.0)</li>
            <li>React (MIT)</li>
          </ul>
        </div>
        <p className="about-star">⭐ 如果觉得有用，请给个 Star！</p>
      </div>
    </div>
  );
};
