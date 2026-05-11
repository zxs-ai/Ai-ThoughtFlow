/**
 * 卡通风格核心渲染器
 *
 * 接收结构化 DiagramData JSON → 路由到对应布局引擎 → 输出 Excalidraw 元素数组
 */
import type { DiagramData, CartoonDiagramType } from "./types";
import { layoutMindmap } from "./layouts/mindmapLayout";
import { layoutBubble } from "./layouts/bubbleLayout";
import { layoutDoubleBubble } from "./layouts/doubleBubbleLayout";
import { layoutTree } from "./layouts/treeLayout";
import { layoutFlow } from "./layouts/flowLayout";
import { layoutMultiFlow } from "./layouts/multiFlowLayout";
import { layoutBrace } from "./layouts/braceLayout";
import { layoutBridge } from "./layouts/bridgeLayout";
import { layoutCircle } from "./layouts/circleLayout";

/** 布局引擎注册表 */
const layoutEngines: Record<CartoonDiagramType, (data: DiagramData) => any[]> = {
  mindmap: layoutMindmap,
  bubble: layoutBubble,
  double_bubble: layoutDoubleBubble,
  tree: layoutTree,
  flow: layoutFlow,
  multi_flow: layoutMultiFlow,
  brace: layoutBrace,
  bridge: layoutBridge,
  circle: layoutCircle,
};

/**
 * 渲染入口：将 DiagramData 转为 Excalidraw 元素
 * @param data AI 输出的结构化图表数据
 * @returns Excalidraw 原生元素数组
 */
export function renderCartoonDiagram(data: DiagramData): any[] {
  const engine = layoutEngines[data.type];
  if (!engine) {
    console.warn(`[CartoonRenderer] Unknown diagram type: ${data.type}, falling back to mindmap`);
    return layoutMindmap(data);
  }

  try {
    return engine(data);
  } catch (err) {
    console.error(`[CartoonRenderer] Layout failed for type ${data.type}:`, err);
    // Fallback: try mindmap layout
    return layoutMindmap(data);
  }
}

/**
 * 检测 AI 回复中是否包含结构化 JSON（而非 Mermaid 代码）
 */
export function extractDiagramJSON(aiResponse: string): DiagramData | null {
  // 1. Try to find all ```json blocks and pick the LAST one
  const jsonBlocks = [...aiResponse.matchAll(/```json\s*\n([\s\S]*?)```/g)];
  if (jsonBlocks.length > 0) {
    const lastBlock = jsonBlocks[jsonBlocks.length - 1][1];
    try {
      const parsed = JSON.parse(lastBlock.trim());
      if (parsed.type && parsed.nodes) return parsed as DiagramData;
    } catch {
      // Ignore invalid JSON in blocks
    }
  }

  // 2. Try to find the last occurrence of something that looks like our Diagram JSON
  // We search for the last "type" and "nodes" pattern
  const lastBrace = aiResponse.lastIndexOf("{");
  const lastEndBrace = aiResponse.lastIndexOf("}");
  
  if (lastBrace !== -1 && lastEndBrace !== -1 && lastEndBrace > lastBrace) {
    const candidate = aiResponse.substring(lastBrace, lastEndBrace + 1);
    try {
      const parsed = JSON.parse(candidate);
      if (parsed.type && parsed.nodes) return parsed as DiagramData;
    } catch {
      // Continue to full text scan
    }
  }

  // 3. Fallback: non-greedy scan for any JSON object containing type and nodes
  const rawBlocks = [...aiResponse.matchAll(/\{[\s\S]*?"type"\s*:\s*"[^"]+?"[\s\S]*?"nodes"\s*:[\s\S]*?\}/g)];
  if (rawBlocks.length > 0) {
    const lastRaw = rawBlocks[rawBlocks.length - 1][0];
    try {
      const parsed = JSON.parse(lastRaw);
      if (parsed.type && parsed.nodes) return parsed as DiagramData;
    } catch {
      // Fail
    }
  }

  return null;
}

/**
 * 检测 AI 回复中是否包含 Mermaid 代码（用于 fallback）
 */
export function extractMermaidCode(aiResponse: string): string | null {
  const codeMatch =
    aiResponse.match(/```mermaid\s*\n([\s\S]*?)```/) ||
    aiResponse.match(/```\s*\n((?:graph|flowchart|sequenceDiagram|classDiagram|erDiagram|mindmap|gantt|pie|gitGraph)[\s\S]*?)```/);
  return codeMatch ? codeMatch[1].trim() : null;
}
