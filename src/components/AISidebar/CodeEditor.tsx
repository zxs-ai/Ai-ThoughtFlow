import React from "react";
import { useAppStore } from "../../stores/appStore";
import { useTranslation } from "../../i18n/I18nContext";

export const CodeEditor: React.FC = () => {
  const { mermaidCode, setMermaidCode } = useAppStore();
  const { t } = useTranslation();

  return (
    <div className="code-editor">
      <div className="code-header">
        <span className="code-title">{t.codeEditor.title}</span>
      </div>
      <textarea
        className="code-textarea"
        value={mermaidCode}
        onChange={(e) => setMermaidCode(e.target.value)}
        placeholder={t.codeEditor.placeholder}
        spellCheck={false}
      />
    </div>
  );
};
