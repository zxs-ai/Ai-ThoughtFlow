import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// @ts-expect-error process is a nodejs global
const host = process.env.TAURI_DEV_HOST;

export default defineConfig(async () => ({
  plugins: [react()],

  clearScreen: false,
  server: {
    port: 1420,
    strictPort: true,
    host: host || false,
    hmr: host
      ? {
          protocol: "ws",
          host,
          port: 1421,
        }
      : undefined,
    watch: {
      ignored: ["**/src-tauri/**"],
    },
  },

  // Prevent duplicate React instances (fixes Excalidraw "Cannot call a class as a function")
  resolve: {
    dedupe: ["react", "react-dom"],
  },

  // Pre-bundle Excalidraw for compatibility
  optimizeDeps: {
    include: ["@excalidraw/excalidraw", "@excalidraw/mermaid-to-excalidraw"],
  },

  build: {
    // Excalidraw uses dynamic imports internally, ensure they work
    rollupOptions: {
      output: {
        manualChunks: {
          excalidraw: ["@excalidraw/excalidraw"],
          mermaid: ["@excalidraw/mermaid-to-excalidraw"],
        },
      },
    },
  },
}));
