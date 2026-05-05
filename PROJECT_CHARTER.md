# ExcaliDraw AI — 项目章程

## 1. 项目背景
一款 macOS 桌面端 AI 智能绘图工具。用户通过自然语言描述需求，AI 大模型解析后生成结构化数据，一键导入 Excalidraw 画布生成专业图表。同时保留 Excalidraw 全部原生手绘能力。

## 2. 核心目标
- 目标 1：AI 自然语言 → 图表（架构图/流程图/思维导图/时序图/ER 图/用例图）
- 目标 2：完整保留 Excalidraw 原生画布全部功能
- 目标 3：支持 6 种以上大模型服务商（含国内主流）
- 目标 4：数据完全本地化，API Key 不离开用户电脑
- 目标 5：Apple Liquid Glass 毛玻璃 UI 风格

## 3. 约束条件
- 技术栈：Tauri 2.x + React 18 + TypeScript + Vite 5
- 所有依赖 MIT/Apache-2.0 协议，禁止付费组件
- 包体 <15MB
- macOS 专属桌面应用
- API Key 仅存本地 Tauri fs

## 4. 关键决策记录

| 日期 | 决策 | 原因 | 替代方案 |
|------|------|------|----------|
| 2026-05-05 | Tauri 2.x 非 Electron | 包体小、性能好、macOS 原生 | Electron（包体过大） |
| 2026-05-05 | 开源兼容 HTTP API 格式 | 一套代码支持所有国内模型 | 每个厂商单独适配 |
| 2026-05-05 | Mermaid 中间格式 | `@excalidraw/mermaid-to-excalidraw` 官方免费包 | 自写布局算法 |
| 2026-05-05 | Vite dedupe React | 解决 Excalidraw 包与 App 的 React 实例冲突 | npm overrides |
