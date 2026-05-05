import React from "react";
import { useAppStore } from "../../stores/appStore";

export const CodeEditor: React.FC = () => {
  const { mermaidCode, setMermaidCode } = useAppStore();

  return (
    <div className="code-editor">
      <div className="code-header">
        <span className="code-title">Mermaid 代码</span>
      </div>
      <textarea
        className="code-textarea"
        value={mermaidCode}
        onChange={(e) => setMermaidCode(e.target.value)}
        placeholder="AI 生成的 Mermaid 代码将显示在这里，您也可以手动编辑..."
        spellCheck={false}
      />
    </div>
  );
};
