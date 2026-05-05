import React, { useRef, useEffect, useCallback } from "react";
import { Excalidraw } from "@excalidraw/excalidraw";
import { useAppStore } from "../../stores/appStore";
import { loadAutosave, saveAutosave } from "../../services/storage";
import "./Canvas.css";

export const ExcalidrawCanvas: React.FC = () => {
  const excalidrawRef = useRef<any>(null);
  const {
    mermaidCode,
    importMode,
    setElementCount,
    canvasTheme,
  } = useAppStore();

  // Handle mermaid import
  useEffect(() => {
    if (!mermaidCode || !excalidrawRef.current) return;

    import("../../services/mermaidConverter")
      .then(({ convertMermaidToExcalidraw }) =>
        convertMermaidToExcalidraw(mermaidCode)
      )
      .then((result) => {
        if (result.success && excalidrawRef.current) {
          const api = excalidrawRef.current;
          if (importMode === "replace") {
            api.updateScene({ elements: result.elements });
          } else {
            const current = api.getSceneElements();
            api.updateScene({ elements: [...current, ...result.elements] });
          }
          api.scrollToContent();
        }
      })
      .catch((err) => {
        console.error("Import failed:", err);
        alert("导入失败: " + (err.message || "未知错误"));
      });
  }, [mermaidCode, importMode]);

  // Autosave every 30s
  useEffect(() => {
    const interval = setInterval(() => {
      if (excalidrawRef.current) {
        const elements = excalidrawRef.current.getSceneElements();
        const appState = excalidrawRef.current.getAppState();
        const data = JSON.stringify({ elements, appState });
        saveAutosave(data).catch(() => {});
      }
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  // Load autosave on mount
  useEffect(() => {
    loadAutosave().then((data) => {
      if (data && excalidrawRef.current) {
        try {
          const parsed = JSON.parse(data);
          if (parsed.elements) {
            excalidrawRef.current.updateScene({ elements: parsed.elements });
          }
        } catch {
          // ignore invalid autosave
        }
      }
    });
  }, []);

  const onChange = useCallback(
    (elements: readonly any[]) => {
      setElementCount(elements.length);
    },
    [setElementCount]
  );

  return (
    <div className="canvas-area">
      <div className="excalidraw-wrapper">
        <Excalidraw
          excalidrawAPI={(api) => { excalidrawRef.current = api; }}
          theme={canvasTheme}
          onChange={onChange}
          UIOptions={{
            canvasActions: {
              changeViewBackgroundColor: true,
              clearCanvas: true,
              loadScene: true,
              saveToActiveFile: true,
              toggleTheme: true,
              saveAsImage: true,
            },
          }}
        />
      </div>
    </div>
  );
};
