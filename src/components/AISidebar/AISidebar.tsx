import React, { useRef, useCallback } from "react";
import { useAppStore } from "../../stores/appStore";
import { useTranslation } from "../../i18n/I18nContext";
import { DiagramTypeSelector } from "./DiagramTypeSelector";
import { ChatArea } from "./ChatArea";
import { CodeEditor } from "./CodeEditor";
import "./AISidebar.css";

export const AISidebar: React.FC = () => {
  const {
    sidebarOpen,
    sidebarWidth,
    chatHeightFraction,
    setSidebarOpen,
    setSidebarWidth,
    setChatHeightFraction,
    mermaidCode,
    importMode,
    setImportMode,
    setMermaidCode,
  } = useAppStore();
  const { t } = useTranslation();

  /* ── Horizontal (sidebar width) resize ── */
  const isResizingH = useRef(false);

  const handleMouseDownH = useCallback(() => {
    isResizingH.current = true;
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
  }, []);

  const handleMouseMoveH = useCallback(
    (e: MouseEvent) => {
      if (!isResizingH.current) return;
      setSidebarWidth(e.clientX);
    },
    [setSidebarWidth]
  );

  const handleMouseUpH = useCallback(() => {
    if (isResizingH.current) {
      isResizingH.current = false;
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    }
  }, []);

  /* ── Vertical (chat vs code) resize ── */
  const isResizingV = useRef(false);
  const sidebarInnerRef = useRef<HTMLDivElement>(null);

  const handleMouseDownV = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    isResizingV.current = true;
    document.body.style.cursor = "row-resize";
    document.body.style.userSelect = "none";
  }, []);

  const handleMouseMoveV = useCallback(
    (e: MouseEvent) => {
      if (!isResizingV.current || !sidebarInnerRef.current) return;
      const rect = sidebarInnerRef.current.getBoundingClientRect();
      // Fraction = distance from top / total inner height
      const fraction = (e.clientY - rect.top) / rect.height;
      setChatHeightFraction(fraction);
    },
    [setChatHeightFraction]
  );

  const handleMouseUpV = useCallback(() => {
    if (isResizingV.current) {
      isResizingV.current = false;
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    }
  }, []);

  React.useEffect(() => {
    document.addEventListener("mousemove", handleMouseMoveH);
    document.addEventListener("mouseup", handleMouseUpH);
    document.addEventListener("mousemove", handleMouseMoveV);
    document.addEventListener("mouseup", handleMouseUpV);
    return () => {
      document.removeEventListener("mousemove", handleMouseMoveH);
      document.removeEventListener("mouseup", handleMouseUpH);
      document.removeEventListener("mousemove", handleMouseMoveV);
      document.removeEventListener("mouseup", handleMouseUpV);
    };
  }, [handleMouseMoveH, handleMouseUpH, handleMouseMoveV, handleMouseUpV]);

  return (
    <div
      className={`ai-sidebar ${sidebarOpen ? "" : "collapsed"}`}
      style={{ width: sidebarOpen ? sidebarWidth : 44 }}
    >
      {!sidebarOpen && (
        <button
          className="sidebar-toggle-btn"
          onClick={() => setSidebarOpen(true)}
          title={t.sidebar.expandSidebar}
        >
          ▶
        </button>
      )}

      {sidebarOpen && (
        <>
          <div
            className="ai-sidebar-inner"
            ref={sidebarInnerRef}
            onKeyDown={(e) => e.stopPropagation()}
            onKeyUp={(e) => e.stopPropagation()}
          >
            {/* Top fixed: diagram type selector */}
            <DiagramTypeSelector />

            {/* AI Chat area — height controlled by fraction */}
            <div
              className="chat-section"
              style={{ flex: `0 0 calc(${chatHeightFraction * 100}% - 40px)` }}
            >
              <ChatArea />
            </div>

            {/* Vertical drag handle */}
            <div className="vertical-resize-handle" onMouseDown={handleMouseDownV}>
              <span className="vertical-resize-dots" />
            </div>

            {/* Code editor — fills remaining space */}
            <div className="code-section">
              <CodeEditor />
            </div>

            {/* Import actions */}
            <div className="import-actions">
              <div className="import-mode">
                <label>
                  <input
                    type="radio"
                    name="importMode"
                    checked={importMode === "replace"}
                    onChange={() => setImportMode("replace")}
                  />
                  {t.sidebar.replace}
                </label>
                <label>
                  <input
                    type="radio"
                    name="importMode"
                    checked={importMode === "append"}
                    onChange={() => setImportMode("append")}
                  />
                  {t.sidebar.append}
                </label>
              </div>
              <button
                className="glass-button primary import-btn"
                onClick={() => {
                  const code = mermaidCode.trim();
                  if (!code) {
                    alert(t.sidebar.enterCodeFirst);
                    return;
                  }
                  setMermaidCode("");
                  setTimeout(() => setMermaidCode(code), 10);
                }}
              >
                {t.sidebar.importGenerate}
              </button>
            </div>
          </div>
          <div className="sidebar-resize-handle" onMouseDown={handleMouseDownH} />
        </>
      )}
    </div>
  );
};
