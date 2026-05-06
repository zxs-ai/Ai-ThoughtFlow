import React, { useEffect, useCallback, useState, Suspense, Component, type ReactNode } from "react";
import { useAppStore } from "../../stores/appStore";
import { useTranslation } from "../../i18n/I18nContext";
import { I18nContext } from "../../i18n/I18nContext";
import { loadAutosave, saveAutosave } from "../../services/storage";
import "./Canvas.css";

// Lazy load Excalidraw to prevent app from crashing on load error
const ExcalidrawLazy = React.lazy(() =>
  import("@excalidraw/excalidraw").then((m) => ({ default: m.Excalidraw }))
);

class ErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean; error?: Error }> {
  static contextType = I18nContext;
  declare context: React.ContextType<typeof I18nContext>;

  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }
  render() {
    if (this.state.hasError) {
      const t = this.context.t;
      return (
        <div className="canvas-area" style={{
          display: "flex", alignItems: "center", justifyContent: "center",
          height: "100%", background: "var(--bg-primary)",
        }}>
          <div style={{ textAlign: "center", color: "var(--text-secondary)", maxWidth: 400, padding: 20 }}>
            <p style={{ fontSize: 40, marginBottom: 12 }}>🎨</p>
            <p style={{ marginBottom: 8 }}>{t.canvas.loadFailed}</p>
            <p style={{ fontSize: 12, opacity: 0.6, marginBottom: 16 }}>
              {this.state.error?.message || t.canvas.unknownError}
            </p>
            <button
              className="glass-button primary"
              onClick={() => {
                this.setState({ hasError: false, error: undefined });
              }}
            >
              {t.canvas.retry}
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

function CanvasLoading() {
  const { t } = useTranslation();
  return (
    <div className="canvas-area" style={{
      display: "flex", alignItems: "center", justifyContent: "center",
      height: "100%", background: "var(--bg-primary)",
    }}>
      <div style={{ textAlign: "center", color: "var(--text-secondary)" }}>
        <p style={{ fontSize: 40, marginBottom: 12 }}>🎨</p>
        <p>{t.canvas.loading}</p>
      </div>
    </div>
  );
}

// Toast notification component for import status
function ImportToast({ message, type, onDismiss }: {
  message: string;
  type: "success" | "error" | "info";
  onDismiss: () => void;
}) {
  useEffect(() => {
    const timer = setTimeout(onDismiss, 5000);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  const colors = {
    success: { bg: "rgba(52, 199, 89, 0.15)", border: "rgba(52, 199, 89, 0.3)", text: "#34c759" },
    error: { bg: "rgba(255, 59, 48, 0.15)", border: "rgba(255, 59, 48, 0.3)", text: "#ff6b6b" },
    info: { bg: "rgba(0, 122, 255, 0.15)", border: "rgba(0, 122, 255, 0.3)", text: "#0a84ff" },
  };
  const c = colors[type];

  return (
    <div style={{
      position: "absolute", bottom: 16, left: "50%", transform: "translateX(-50%)",
      padding: "10px 20px", borderRadius: 10, zIndex: 50,
      background: c.bg, border: `1px solid ${c.border}`, color: c.text,
      fontSize: 13, fontFamily: "var(--font-system)", backdropFilter: "blur(12px)",
      animation: "fadeIn 0.2s ease",
    }}>
      {message}
    </div>
  );
}

function CanvasInner() {
  const excalidrawRef = React.useRef<any>(null);
  const [ready, setReady] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);
  const {
    mermaidCode,
    importMode,
    setElementCount,
    canvasTheme,
  } = useAppStore();
  const { t, lang } = useTranslation();

  // Handle mermaid import
  useEffect(() => {
    if (!mermaidCode || !excalidrawRef.current) return;

    setToast({ message: t.canvas.converting, type: "info" });

    import("../../services/mermaidConverter")
      .then(({ convertMermaidToExcalidraw }) =>
        convertMermaidToExcalidraw(mermaidCode)
      )
      .then((result) => {
        if (result.success && excalidrawRef.current) {
          const api = excalidrawRef.current;

          if (result.files) {
            api.addFiles(
              Object.entries(result.files).map(([id, file]: [string, any]) => ({
                id,
                ...file,
              }))
            );
          }

          if (importMode === "replace") {
            api.updateScene({ elements: result.elements });
          } else {
            const current = api.getSceneElements();
            api.updateScene({ elements: [...current, ...result.elements] });
          }
          api.scrollToContent();
          setToast({ message: `${t.canvas.generated} (${result.elements.length})`, type: "success" });
        } else if (!result.success) {
          console.error("Mermaid conversion failed:", result.error);
          setToast({ message: `${t.canvas.conversionFailed}: ${result.error}`, type: "error" });
        }
      })
      .catch((err: Error) => {
        console.error("Import failed:", err);
        setToast({ message: `${t.canvas.importFailed}: ${err.message || t.canvas.unknownError}`, type: "error" });
      });
  }, [mermaidCode, importMode, t]);

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

  // Load autosave after Excalidraw is ready
  useEffect(() => {
    if (!ready || !excalidrawRef.current) return;
    loadAutosave().then((data) => {
      if (data && excalidrawRef.current) {
        try {
          const parsed = JSON.parse(data);
          if (parsed.elements) {
            excalidrawRef.current.updateScene({ elements: parsed.elements });
          }
        } catch {
          // ignore invalid
        }
      }
    });
  }, [ready]);

  const onChange = useCallback(
    (elements: readonly any[]) => {
      setElementCount(elements.length);
    },
    [setElementCount]
  );

  const handleExcalidrawAPI = useCallback((api: any) => {
    excalidrawRef.current = api;
    setReady(true);
  }, []);

  return (
    <div className="canvas-area">
      <div className="excalidraw-wrapper">
        <ExcalidrawLazy
          excalidrawAPI={handleExcalidrawAPI}
          theme={canvasTheme}
          langCode={lang}
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
      {toast && (
        <ImportToast
          message={toast.message}
          type={toast.type}
          onDismiss={() => setToast(null)}
        />
      )}
    </div>
  );
}

export const ExcalidrawCanvas: React.FC = () => {
  return (
    <ErrorBoundary>
      <Suspense fallback={<CanvasLoading />}>
        <CanvasInner />
      </Suspense>
    </ErrorBoundary>
  );
};
