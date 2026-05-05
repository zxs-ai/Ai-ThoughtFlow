import React, { useRef, useCallback } from "react";
import { useAppStore } from "../../stores/appStore";
import { DiagramTypeSelector } from "./DiagramTypeSelector";
import { ChatArea } from "./ChatArea";
import { CodeEditor } from "./CodeEditor";
import "./AISidebar.css";

export const AISidebar: React.FC = () => {
  const {
    sidebarOpen,
    sidebarWidth,
    setSidebarOpen,
    setSidebarWidth,
    mermaidCode,
    importMode,
    setImportMode,
    setMermaidCode,
  } = useAppStore();

  const isResizing = useRef(false);

  const handleMouseDown = useCallback(() => {
    isResizing.current = true;
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
  }, []);

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isResizing.current) return;
      const newWidth = e.clientX;
      setSidebarWidth(newWidth);
    },
    [setSidebarWidth]
  );

  const handleMouseUp = useCallback(() => {
    if (isResizing.current) {
      isResizing.current = false;
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    }
  }, []);

  React.useEffect(() => {
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);

  return (
    <div
      className={`ai-sidebar ${sidebarOpen ? "" : "collapsed"}`}
      style={{ width: sidebarOpen ? sidebarWidth : 44 }}
    >
      {!sidebarOpen && (
        <button
          className="sidebar-toggle-btn"
          onClick={() => setSidebarOpen(true)}
          title="展开侧边栏"
        >
          ▶
        </button>
      )}

      {sidebarOpen && (
        <>
          <div className="ai-sidebar-inner">
            <DiagramTypeSelector />
            <ChatArea />
            <CodeEditor />
            <div className="import-actions">
              <div className="import-mode">
                <label>
                  <input
                    type="radio"
                    name="importMode"
                    checked={importMode === "replace"}
                    onChange={() => setImportMode("replace")}
                  />
                  替换
                </label>
                <label>
                  <input
                    type="radio"
                    name="importMode"
                    checked={importMode === "append"}
                    onChange={() => setImportMode("append")}
                  />
                  追加
                </label>
              </div>
              <button
                className="glass-button primary import-btn"
                onClick={() => {
                  // Trigger import by updating mermaidCode timestamp or using a separate trigger
                  // We'll use a simple approach: force re-render by toggling a dummy state
                  // Actually, the ExcalidrawCanvas watches mermaidCode - if code hasn't changed,
                  // useEffect won't fire. Let's work around this.
                  const code = mermaidCode.trim();
                  if (!code) {
                    alert("请先输入 Mermaid 代码");
                    return;
                  }
                  // Temporarily clear then set to trigger effect
                  setMermaidCode("");
                  setTimeout(() => setMermaidCode(code), 10);
                }}
              >
                📥 导入生成
              </button>
            </div>
          </div>
          <div className="sidebar-resize-handle" onMouseDown={handleMouseDown} />
        </>
      )}
    </div>
  );
};
