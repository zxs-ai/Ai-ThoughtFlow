import React, { useRef, useEffect, useCallback } from "react";
import { useAppStore } from "../../stores/appStore";
import { useTranslation } from "../../i18n/I18nContext";

export const CodeEditor: React.FC = () => {
  const { mermaidCode, setMermaidCode } = useAppStore();
  const { t } = useTranslation();

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const gutterRef = useRef<HTMLDivElement>(null);

  // Sync gutter scroll with textarea scroll
  const syncScroll = useCallback(() => {
    if (gutterRef.current && textareaRef.current) {
      gutterRef.current.scrollTop = textareaRef.current.scrollTop;
    }
  }, []);

  // Compute line numbers
  const lines = mermaidCode ? mermaidCode.split("\n") : [""];
  const lineCount = Math.max(lines.length, 1);

  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.addEventListener("scroll", syncScroll);
    return () => ta.removeEventListener("scroll", syncScroll);
  }, [syncScroll]);

  return (
    <div className="code-editor">
      <div className="code-header">
        <span className="code-title">{t.codeEditor.title}</span>
      </div>
      <div className="code-editor-body">
        {/* Line number gutter */}
        <div className="code-gutter" ref={gutterRef} aria-hidden="true">
          {Array.from({ length: lineCount }, (_, i) => (
            <div key={i} className="code-gutter-line">
              {i + 1}
            </div>
          ))}
        </div>
        {/* Editable textarea */}
        <textarea
          ref={textareaRef}
          className="code-textarea"
          value={mermaidCode}
          onChange={(e) => setMermaidCode(e.target.value)}
          onScroll={syncScroll}
          placeholder={t.codeEditor.placeholder}
          spellCheck={false}
        />
      </div>
    </div>
  );
};
