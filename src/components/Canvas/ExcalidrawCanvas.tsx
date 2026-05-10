import React, { Suspense, Component, type ReactNode } from "react";
import { useTranslation } from "../../i18n/I18nContext";
import { I18nContext } from "../../i18n/I18nContext";
import "./Canvas.css";

// Lazy load entire canvas inner component (includes Excalidraw + MainMenu)
const CanvasInnerLazy = React.lazy(() => import("./CanvasInner"));

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

export const ExcalidrawCanvas: React.FC = () => {
  return (
    <ErrorBoundary>
      <Suspense fallback={<CanvasLoading />}>
        <CanvasInnerLazy />
      </Suspense>
    </ErrorBoundary>
  );
};
