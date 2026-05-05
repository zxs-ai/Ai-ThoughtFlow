import React from "react";
import { useAppStore, type DiagramType } from "../../stores/appStore";

const types: { key: DiagramType; label: string; icon: string }[] = [
  { key: "architecture", label: "🏗️ 架构图", icon: "🏗️" },
  { key: "flowchart", label: "📊 流程图", icon: "📊" },
  { key: "mindmap", label: "🗺️ 思维导图", icon: "🗺️" },
  { key: "sequence", label: "🔄 时序图", icon: "🔄" },
  { key: "er", label: "📋 ER 图", icon: "📋" },
  { key: "usecase", label: "🎯 用例图", icon: "🎯" },
  { key: "free", label: "📝 自由绘制", icon: "📝" },
];

export const DiagramTypeSelector: React.FC = () => {
  const { diagramType, setDiagramType } = useAppStore();

  const handleChange = (type: DiagramType) => {
    if (type === diagramType) return;
    const hasMessages = useAppStore.getState().messages.length > 0;
    if (hasMessages) {
      const ok = window.confirm("切换图表类型将清空当前对话，是否继续？");
      if (!ok) return;
    }
    setDiagramType(type);
  };

  return (
    <div className="diagram-type-selector">
      <label className="selector-label">图表类型</label>
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
