import React from "react";
import { useAppStore, type DiagramType } from "../../stores/appStore";
import { useTranslation } from "../../i18n/I18nContext";

export const DiagramTypeSelector: React.FC = () => {
  const { diagramType, setDiagramType } = useAppStore();
  const { t } = useTranslation();

  const types: { key: DiagramType; label: string; icon: string }[] = [
    { key: "architecture", label: t.diagramTypes.architecture, icon: "🏗️" },
    { key: "flowchart", label: t.diagramTypes.flowchart, icon: "📊" },
    { key: "mindmap", label: t.diagramTypes.mindmap, icon: "🗺️" },
    { key: "sequence", label: t.diagramTypes.sequence, icon: "🔄" },
    { key: "er", label: t.diagramTypes.er, icon: "📋" },
    { key: "usecase", label: t.diagramTypes.usecase, icon: "🎯" },
    { key: "free", label: t.diagramTypes.free, icon: "📝" },
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

  return (
    <div className="diagram-type-selector">
      <label className="selector-label">{t.sidebar.diagramType}</label>
      <select
        className="glass-select"
        value={diagramType}
        onChange={(e) => handleChange(e.target.value as DiagramType)}
      >
        {types.map((t) => (
          <option key={t.key} value={t.key}>
            {t.label}
          </option>
        ))}
      </select>
    </div>
  );
};
