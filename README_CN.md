# ExcaliDraw AI

基于 Tauri 2.x 和 Excalidraw 构建的 macOS 桌面端 AI 智能绘图工具。

## 特性

- **AI 助手面板**: 自然语言生成图表，支持 Mermaid 代码
- **完整 Excalidraw 画布**: 保留全部原生手绘功能
- **多模型支持**: DeepSeek、通义千问、智谱 GLM、OpenAI、月之暗面
- **Liquid Glass 风格**: macOS 液态玻璃拟态设计
- **本地存储**: API Key 和设置仅保存在本地

## 技术栈

- Tauri 2.x
- React 18 + TypeScript
- Vite
- Zustand
- @excalidraw/excalidraw
- @excalidraw/mermaid-to-excalidraw

## 开发

```bash
npm install
npm run tauri dev
```

## 构建

```bash
npm run tauri build
```

## 许可证

MIT
