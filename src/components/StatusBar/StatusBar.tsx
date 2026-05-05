import React from "react";
import { useAppStore } from "../../stores/appStore";

export const StatusBar: React.FC = () => {
  const { modelConfig, isGenerating, elementCount, canvasTheme } = useAppStore();

  return (
    <div className="status-bar">
      <div className="status-left">
        <span className="status-item">
          模型: {modelConfig.provider} / {modelConfig.modelName}
        </span>
        {isGenerating && (
          <span className="status-item status-generating">● 生成中...</span>
        )}
      </div>
      <div className="status-right">
        <span className="status-item">元素: {elementCount}</span>
        <span className="status-item">主题: {canvasTheme === "dark" ? "暗色" : "亮色"}</span>
      </div>
      <style>{`
        .status-bar {
          height: 28px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 16px;
          background: rgba(10, 10, 15, 0.5);
          backdrop-filter: blur(12px) saturate(150%);
          -webkit-backdrop-filter: blur(12px) saturate(150%);
          border-top: 1px solid rgba(255, 255, 255, 0.06);
          font-size: 12px;
          color: var(--text-secondary);
          flex-shrink: 0;
          user-select: none;
        }
        .status-left, .status-right {
          display: flex;
          align-items: center;
          gap: 16px;
        }
        .status-generating {
          color: var(--accent);
          animation: pulse 1.5s ease-in-out infinite;
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>
    </div>
  );
};
