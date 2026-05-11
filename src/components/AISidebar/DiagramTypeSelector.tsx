import React from "react";
import { useAppStore, type DiagramType } from "../../stores/appStore";
import { useTranslation } from "../../i18n/I18nContext";

export const DiagramTypeSelector: React.FC = () => {
  const { diagramType, setDiagramType } = useAppStore();
  const { t } = useTranslation();

  // ── 智能自动模式放最前面（独立高亮显示）
  const autoType: { key: DiagramType; label: string; desc: string } = {
    key: "free",
    label: t.diagramTypes.free,
    desc: "根据描述自动选最优图型",
  };

  // ── 其他具体图表类型
  const specificTypes: { key: DiagramType; label: string }[] = [
    { key: "mindmap",      label: t.diagramTypes.mindmap },
    { key: "flowchart",    label: t.diagramTypes.flowchart },
    { key: "architecture", label: t.diagramTypes.architecture },
    { key: "sequence",     label: t.diagramTypes.sequence },
    { key: "er",           label: t.diagramTypes.er },
    { key: "usecase",      label: t.diagramTypes.usecase },
  ];

  const handleChange = (type: DiagramType) => {
    if (type === diagramType) return;
    const hasMessages = useAppStore.getState().messages.length > 0;
    if (hasMessages) {
      const ok = window.confirm(t.sidebar.switchTypeConfirm);
      if (!ok) return;
    }
    setDiagramType(type);
  };

  const isAuto = diagramType === "free";

  return (
    <div className="diagram-type-selector">
      <label className="selector-label">{t.sidebar.diagramType}</label>

      {/* 智能自动按钮 — 独立突出显示 */}
      <button
        className={`auto-mode-btn ${isAuto ? "auto-mode-btn--active" : ""}`}
        onClick={() => handleChange("free")}
        title={autoType.desc}
      >
        <span className="auto-mode-btn__icon">✨</span>
        <span className="auto-mode-btn__text">
          智能自动
          {isAuto && <span className="auto-mode-btn__badge">当前</span>}
        </span>
        <span className="auto-mode-btn__hint">AI 智选最优图型</span>
      </button>

      {/* 分隔线 */}
      <div className="type-divider">
        <span>或手动指定</span>
      </div>

      {/* 具体类型选择 */}
      <select
        className={`glass-select ${!isAuto ? "glass-select--active" : ""}`}
        value={isAuto ? "" : diagramType}
        onChange={(e) => {
          if (e.target.value) handleChange(e.target.value as DiagramType);
        }}
      >
        <option value="" disabled>选择具体类型...</option>
        {specificTypes.map((type) => (
          <option key={type.key} value={type.key}>
            {type.label}
          </option>
        ))}
      </select>
    </div>
  );
};
