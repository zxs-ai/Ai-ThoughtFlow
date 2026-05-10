# Ai ThoughtFlow

> AI-powered diagram generation tool — describe your ideas in natural language and generate professional diagrams instantly.

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Platform](https://img.shields.io/badge/platform-macOS%20|%20Windows-lightgrey.svg)]()
[![Tauri](https://img.shields.io/badge/Tauri-2.x-8B5CF6.svg)](https://tauri.app)
[![React](https://img.shields.io/badge/React-18-61DAFB.svg)](https://react.dev)

English | [简体中文](README.md)

---

## What is Ai ThoughtFlow?

Ai ThoughtFlow is a **cross-platform desktop AI diagram generation tool**. Simply describe your ideas in natural language, and AI will automatically generate architecture diagrams, flowcharts, mind maps, sequence diagrams, and more. No manual drag-and-drop — everything is AI-powered.

## Core Features

### 🤖 AI-Powered Generation
- **Natural language input** with automatic diagram type detection
- **7 built-in diagram types**: Architecture, Flowchart, Mind Map, Sequence, ER, Use Case, Free Draw
- AI generates **Mermaid code** with real-time preview and canvas import
- **Continuous conversation** for iterative diagram refinement

### 🎨 Full-Featured Canvas
- Complete **Excalidraw** hand-drawn style canvas
- **Manual editing** after AI import for unlimited adjustments
- **Replace/Append** dual import modes
- **Auto-save** canvas content

### 🔌 Multi-Provider Support
| Provider | Model | Notes |
|----------|-------|-------|
| DeepSeek | deepseek-chat | Cost-effective, strong Chinese |
| Qwen | qwen-max | Alibaba Cloud, enterprise-grade |
| GLM | glm-4 | Premium Chinese LLM |
| OpenAI | gpt-4o | World-class performance |
| Kimi | moonshot-v1-8k | Long context |
| Custom | Any compatible API | Full flexibility |

### 🌍 Internationalization
- **Simplified Chinese / English** bilingual support
- Default Chinese interface, optimized for Chinese users
- One-click language switch in Settings

### 🔒 Privacy & Security
- **API keys stored locally only**, never uploaded
- All data saved on local filesystem
- No telemetry, no tracking

### 🎨 Liquid Glass Design
- macOS-style **glassmorphism** interface
- Dark theme, eye-friendly
- Resizable sidebar

## Installation

### macOS
Download the latest `.dmg` from the [Releases](../../releases) page and drag to Applications.

> Supports both Intel and Apple Silicon (M-series) chips.

### Windows
Download the latest `.exe` installer from the [Releases](../../releases) page.

## Development

### Prerequisites
- Node.js 22+
- Rust toolchain
- pnpm / npm

### Quick Start
```bash
# Clone
git clone https://gitee.com/applexyz/ai-thought-flow.git
cd Ai-ThoughtFlow

# Install
npm install

# Dev mode
npm run tauri dev
```

### Build
```bash
# macOS
npm run tauri build -- --target universal-apple-darwin

# Windows
npm run tauri build -- --target x86_64-pc-windows-msvc
```

## Architecture

```
┌─────────────────────────────────────────┐
│              Ai ThoughtFlow              │
├─────────────────────────────────────────┤
│  React 18 + TypeScript (UI Layer)       │
│  Zustand (State Management)              │
│  Excalidraw (Canvas Engine)             │
│  Mermaid (Diagram Compiler)              │
├─────────────────────────────────────────┤
│  Tauri 2.x (Desktop Bridge)             │
│  Rust (Native Layer)                     │
├─────────────────────────────────────────┤
│  macOS Universal  |  Windows x64        │
└─────────────────────────────────────────┘
```

## Shortcuts

| Shortcut | Action |
|----------|--------|
| `Cmd/Ctrl + B` | Toggle Sidebar |
| `Cmd/Ctrl + ,` | Open Settings |
| `Enter` | Send Message |
| `Shift + Enter` | New Line |

## 💖 Support the Project

If Ai ThoughtFlow has helped you, please consider supporting its development! Your support helps us:

- 🛠 Continue improving and fixing bugs
- ✨ Develop more AI-powered features
- 🔐 Purchase Apple Developer Certificate for signed versions (less security warnings)
- 📚 Improve documentation and guides

### Donation Methods

- ☕ **Buy Me a Coffee**
- 💰 **Local Payment** (Alipay/WeChat)

## 📜 License

This project is licensed under the [MIT License](LICENSE).

Core dependencies:
- [Excalidraw](https://excalidraw.com) (MIT)
- [Tauri](https://tauri.app) (MIT/Apache-2.0)
- [React](https://react.dev) (MIT)

## 🙏 Acknowledgments

- Inspired by the [Excalidraw](https://excalidraw.com) community
- Designed with Apple Liquid Glass aesthetics
- Thanks to all beta testers and users for their feedback

## 📞 Support

- **Bug Reports**: [Gitee Issues](https://gitee.com/applexyz/ai-thought-flow/issues)
- **Feature Requests**: [Gitee Issues](https://gitee.com/applexyz/ai-thought-flow/issues)
- **Project Home**: [https://gitee.com/applexyz/ai-thought-flow](https://gitee.com/applexyz/ai-thought-flow)

---

<p align="center">
  <b>⭐ Star this project if you find it useful!</b>
</p>
