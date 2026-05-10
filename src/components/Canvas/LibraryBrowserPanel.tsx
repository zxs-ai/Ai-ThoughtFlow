import React, { useEffect, useRef, useState } from "react";
import type { LibraryItems } from "@excalidraw/excalidraw/types";

const LIBRARY_URL =
  "https://libraries.excalidraw.com/?target=_excalidraw&referrer=https%3A%2F%2Fexcalidraw.com%2F&useHash=true&token=9d98Atc-V4NkT6P4liPbP&theme=light&version=2&sort=default";

interface LibraryBrowserPanelProps {
  open: boolean;
  onClose: () => void;
  onImport: (items: LibraryItems) => void;
}

export const LibraryBrowserPanel: React.FC<LibraryBrowserPanelProps> = ({
  open,
  onClose,
  onImport,
}) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [loading, setLoading] = useState(true);

  // Listen for postMessage from the Excalidraw library website
  useEffect(() => {
    const handler = (event: MessageEvent) => {
      // Libraries site sends: { type: "@@excalidraw-library", libraryItems: [...] }
      if (
        event.origin === "https://libraries.excalidraw.com" &&
        event.data?.type === "@@excalidraw-library"
      ) {
        const items: LibraryItems = event.data.libraryItems ?? [];
        if (items.length > 0) {
          onImport(items);
          onClose();
        }
      }
    };
    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, [onImport, onClose]);

  // Reset loading state when panel opens
  useEffect(() => {
    if (open) setLoading(true);
  }, [open]);

  if (!open) return null;

  return (
    <>
      {/* Dim overlay */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.4)",
          zIndex: 900,
          backdropFilter: "blur(2px)",
        }}
        onClick={onClose}
      />

      {/* Slide-in panel */}
      <div
        style={{
          position: "fixed",
          top: 0,
          right: 0,
          bottom: 0,
          width: "min(520px, 90vw)",
          background: "#fff",
          zIndex: 901,
          display: "flex",
          flexDirection: "column",
          boxShadow: "-8px 0 40px rgba(0,0,0,0.35)",
          animation: "slideInRight 0.25s cubic-bezier(0.34,1.2,0.64,1)",
          borderRadius: "16px 0 0 16px",
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "12px 16px",
            background: "#6965db",
            color: "white",
            flexShrink: 0,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
            </svg>
            <span style={{ fontWeight: 700, fontSize: 15 }}>素材库</span>
            <span
              style={{
                fontSize: 11,
                background: "rgba(255,255,255,0.2)",
                padding: "2px 8px",
                borderRadius: 10,
              }}
            >
              Excalidraw Libraries
            </span>
          </div>
          <button
            onClick={onClose}
            style={{
              width: 28,
              height: 28,
              borderRadius: 8,
              border: "none",
              background: "rgba(255,255,255,0.15)",
              color: "white",
              fontSize: 16,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            ✕
          </button>
        </div>

        {/* Info tip */}
        <div
          style={{
            padding: "8px 16px",
            background: "#f0f0ff",
            fontSize: 12,
            color: "#6965db",
            borderBottom: "1px solid #e0e0ff",
            flexShrink: 0,
          }}
        >
          💡 选择素材后点击「Add to Excalidraw」，素材将自动加入画布左侧库面板
        </div>

        {/* Loading state */}
        {loading && (
          <div
            style={{
              position: "absolute",
              top: 84,
              left: 0,
              right: 0,
              bottom: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "#fff",
              zIndex: 1,
              flexDirection: "column",
              gap: 12,
              color: "#888",
            }}
          >
            <div
              style={{
                width: 32,
                height: 32,
                border: "3px solid #e0e0ff",
                borderTopColor: "#6965db",
                borderRadius: "50%",
                animation: "spin 0.8s linear infinite",
              }}
            />
            <span style={{ fontSize: 13 }}>加载素材库...</span>
          </div>
        )}

        {/* iframe */}
        <iframe
          ref={iframeRef}
          src={LIBRARY_URL}
          style={{
            flex: 1,
            border: "none",
            width: "100%",
          }}
          allow="clipboard-read; clipboard-write"
          onLoad={() => setLoading(false)}
          title="Excalidraw Libraries"
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox"
        />
      </div>

      <style>{`
        @keyframes slideInRight {
          from { transform: translateX(100%); opacity: 0; }
          to   { transform: translateX(0);    opacity: 1; }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </>
  );
};
