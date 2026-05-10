import React, { useRef, useEffect, useCallback, useState } from "react";
import { useAppStore } from "../../stores/appStore";
import { useTranslation } from "../../i18n/I18nContext";

export const CodeEditor: React.FC = () => {
  const { mermaidCode, setMermaidCode } = useAppStore();
  const { t } = useTranslation();

  // Local draft — only push to store (which triggers canvas re-render) on confirm
  const [draft, setDraft] = useState(mermaidCode);
  const isDirty = draft !== mermaidCode;

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const gutterRef = useRef<HTMLDivElement>(null);

  // When the store code changes externally (AI generates new code), sync draft
  useEffect(() => {
    setDraft(mermaidCode);
  }, [mermaidCode]);

  // Sync gutter scroll with textarea scroll
  const syncScroll = useCallback(() => {
    if (gutterRef.current && textareaRef.current) {
      gutterRef.current.scrollTop = textareaRef.current.scrollTop;
    }
  }, []);

  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.addEventListener("scroll", syncScroll);
    return () => ta.removeEventListener("scroll", syncScroll);
  }, [syncScroll]);

  // Compute line numbers from draft
  const lines = draft ? draft.split("\n") : [""];
  const lineCount = Math.max(lines.length, 1);

  // Confirm: push draft to store → triggers canvas conversion
  const handleConfirm = useCallback(() => {
    setMermaidCode(draft);
  }, [draft, setMermaidCode]);

  // Cancel: revert draft to last applied code
  const handleCancel = useCallback(() => {
    setDraft(mermaidCode);
  }, [mermaidCode]);

  return (
    <div className="code-editor">
      <div className="code-header">
        <span className="code-title">
          {t.codeEditor.title}
          {isDirty && <span className="code-dirty-dot" title="有未保存的修改" />}
        </span>
        {isDirty && (
          <div className="code-action-btns">
            <button
              className="code-action-btn code-action-cancel"
              onClick={handleCancel}
              title={t.codeEditor.cancel ?? "取消"}
            >
              {t.codeEditor.cancel ?? "取消"}
            </button>
            <button
              className="code-action-btn code-action-confirm"
              onClick={handleConfirm}
              title={t.codeEditor.confirm ?? "确认更新"}
            >
              ✓ {t.codeEditor.confirm ?? "确认"}
            </button>
          </div>
        )}
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
        {/* Editable textarea — writes to draft only */}
        <textarea
          ref={textareaRef}
          className="code-textarea"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onScroll={syncScroll}
          placeholder={t.codeEditor.placeholder}
          spellCheck={false}
        />
      </div>
    </div>
  );
};
