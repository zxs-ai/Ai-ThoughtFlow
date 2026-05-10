# Ai ThoughtFlow

> 基于 AI 的智能图表生成工具 — 用自然语言描述，一键生成专业图表。

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Platform](https://img.shields.io/badge/platform-macOS%20|%20Windows-lightgrey.svg)]()
[![Tauri](https://img.shields.io/badge/Tauri-2.x-8B5CF6.svg)](https://tauri.app)
[![React](https://img.shields.io/badge/React-18-61DAFB.svg)](https://react.dev)

[English](README_EN.md) | 简体中文

---

## 什么是 Ai ThoughtFlow？

Ai ThoughtFlow 是一款**跨平台桌面端 AI 图表生成工具**。你只需要用自然语言描述想法，AI 就能自动生成对应的架构图、流程图、思维导图、时序图等多种专业图表。无需手动拖拽，一切由 AI 驱动。

## 核心功能

### 🤖 AI 智能生成
- 支持**自然语言描述**，自动识别图表类型
- 内置 **7 种图表类型**：架构图、流程图、思维导图、时序图、ER 图、用例图、自由绘制
- AI 自动生成 **Mermaid 代码**，实时预览并导入画布
- 支持**连续对话**，逐步迭代优化图表

### 🎨 强大画布
- 基于 **Excalidraw** 的完整手绘风格画布
- 图表导入后可**手动二次编辑**，无限调整
- 支持**替换/追加**两种导入模式
- 画布内容**自动保存**，不怕丢失

### 🔌 多模型支持
| 服务商 | 模型 | 特点 |
|--------|------|------|
| DeepSeek | deepseek-chat | 高性价比，中文能力强 |
| 通义千问 | qwen-max | 阿里云，企业级 |
| 智谱 GLM | glm-4 | 国产旗舰 |
| OpenAI | gpt-4o | 全球顶尖 |
| 月之暗面 | moonshot-v1-8k | Kimi，长文本 |
| 自定义 | 任意兼容接口 | 完全自由 |

### 🌍 国际化
- 支持**简体中文 / English** 双语切换
- 默认中文界面，面向中国用户优化
- 设置中一键切换语言

### 🔒 隐私安全
- **API Key 仅存储在本地**，不上传任何服务器
- 所有数据保存在本地文件系统
- 无遥测、无追踪

### 🎨 Liquid Glass 设计
- macOS 风格的**液态玻璃拟态**界面
- 暗色主题，护眼专业
- 可拖拽调整侧边栏宽度

## 安装

### macOS
从 [Releases](../../releases) 页面下载最新的 `.dmg` 文件，拖入 Applications 即可。

> 支持 Intel 和 Apple Silicon (M系列) 芯片。

### Windows
从 [Releases](../../releases) 页面下载最新的 `.exe` 安装程序。

## 开发

### 环境要求
- Node.js 22+
- Rust toolchain
- pnpm / npm

### 快速开始
```bash
# 克隆仓库
git clone https://gitee.com/applexyz/ai-thought-flow.git
cd Ai-ThoughtFlow

# 安装依赖
npm install

# 启动开发模式
npm run tauri dev
```

### 构建
```bash
# macOS
npm run tauri build -- --target universal-apple-darwin

# Windows
npm run tauri build -- --target x86_64-pc-windows-msvc
```

## 技术架构

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

## 快捷键

| 快捷键 | 功能 |
|--------|------|
| `Cmd/Ctrl + B` | 切换侧边栏 |
| `Cmd/Ctrl + ,` | 打开设置 |
| `Enter` | 发送消息 |
| `Shift + Enter` | 消息换行 |

## 💖 支持项目

如果 Ai ThoughtFlow 对您有帮助，欢迎支持开源项目的发展！您的支持将帮助我们：

- 🛠 持续改进和修复 Bug
- ✨ 开发更多 AI 增强功能
- 🚀 提升 AI 生成速度与稳定性（购买更高级的模型 API）
- 📚 完善文档和教程

### 捐赠方式

| 支付宝 (Alipay) | 微信支付 (WeChat Pay) |
| :---: | :---: |
| ![Alipay](./public/assets/alipay_qr.jpg) | ![WeChat](./public/assets/wechat_qr.jpg) |

## 📜 许可证

本项目采用 [MIT License](LICENSE) 许可证。

核心依赖：
- [Excalidraw](https://excalidraw.com) (MIT)
- [Tauri](https://tauri.app) (MIT/Apache-2.0)
- [React](https://react.dev) (MIT)

## 🙏 致谢

- 受 [Excalidraw](https://excalidraw.com) 社区启发
- 使用 Apple Liquid Glass 风格设计
- 感谢所有提供反馈的测试用户

## 📞 支持

- **Bug 反馈**：[Gitee Issues](https://gitee.com/applexyz/ai-thought-flow/issues)
- **功能建议**：[Gitee Issues](https://gitee.com/applexyz/ai-thought-flow/issues)
- **项目主页**：[https://gitee.com/applexyz/ai-thought-flow](https://gitee.com/applexyz/ai-thought-flow)

---

<p align="center">
  <b>⭐ 如果觉得有用，请给个 Star！</b>
</p>
