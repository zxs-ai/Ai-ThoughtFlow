/**
 * Excalidraw 元素工厂 — 生成卡通手绘风格的原生 Excalidraw 元素
 *
 * 所有元素默认 roughness=1（手绘风）、粗描边、圆润拐角
 */
import { randomId } from "./randomId";

// ── 通用卡通风格默认值 ─────────────────────────────────────────────

const CARTOON_DEFAULTS = {
  roughness: 1,             // 手绘质感
  strokeWidth: 3,           // 粗描边
  fontFamily: 3,            // Virgil 手绘字体
  fontSize: 22,             // 大号字
  textAlign: "center" as const,
  verticalAlign: "middle" as const,
  roundness: { type: 3 },   // 圆润拐角
  opacity: 100,
} as const;

// ── 辅助 ────────────────────────────────────────────────────────────

function baseElement(overrides: Record<string, any>) {
  return {
    id: randomId(),
    angle: 0,             // ← 必须，缺失会导致元素无法渲染
    fillStyle: "solid",
    strokeStyle: "solid",
    roughness: CARTOON_DEFAULTS.roughness,
    opacity: CARTOON_DEFAULTS.opacity,
    groupIds: [],
    frameId: null,
    index: null,
    roundness: CARTOON_DEFAULTS.roundness,
    seed: Math.floor(Math.random() * 2_000_000_000),
    version: 1,
    versionNonce: Math.floor(Math.random() * 2_000_000_000),
    isDeleted: false,
    boundElements: null,
    updated: Date.now(),
    link: null,
    locked: false,
    ...overrides,
  };
}

// ── 椭圆（气泡/圆形节点） ──────────────────────────────────────────

export function createEllipse(opts: {
  x: number; y: number; width: number; height: number;
  strokeColor: string; fillColor: string;
  strokeWidth?: number; groupIds?: string[];
}) {
  return baseElement({
    type: "ellipse",
    x: opts.x,
    y: opts.y,
    width: opts.width,
    height: opts.height,
    strokeColor: opts.strokeColor,
    backgroundColor: opts.fillColor,
    strokeWidth: opts.strokeWidth ?? CARTOON_DEFAULTS.strokeWidth,
    groupIds: opts.groupIds ?? [],
  });
}

// ── 圆角矩形 ────────────────────────────────────────────────────────

export function createRoundedRect(opts: {
  x: number; y: number; width: number; height: number;
  strokeColor: string; fillColor: string;
  strokeWidth?: number; groupIds?: string[];
}) {
  return baseElement({
    type: "rectangle",
    x: opts.x,
    y: opts.y,
    width: opts.width,
    height: opts.height,
    strokeColor: opts.strokeColor,
    backgroundColor: opts.fillColor,
    strokeWidth: opts.strokeWidth ?? CARTOON_DEFAULTS.strokeWidth,
    roundness: { type: 3 },
    groupIds: opts.groupIds ?? [],
  });
}

// ── 菱形 ─────────────────────────────────────────────────────────────

export function createDiamond(opts: {
  x: number; y: number; width: number; height: number;
  strokeColor: string; fillColor: string;
  groupIds?: string[];
}) {
  return baseElement({
    type: "diamond",
    x: opts.x,
    y: opts.y,
    width: opts.width,
    height: opts.height,
    strokeColor: opts.strokeColor,
    backgroundColor: opts.fillColor,
    strokeWidth: CARTOON_DEFAULTS.strokeWidth,
    groupIds: opts.groupIds ?? [],
  });
}

// ── 文本 ─────────────────────────────────────────────────────────────

export function createText(opts: {
  x: number; y: number;
  text: string;
  fontSize?: number;
  color?: string;
  width?: number;
  height?: number;
  textAlign?: "left" | "center" | "right";
  groupIds?: string[];
  containerId?: string | null;
}) {
  const fontSize = opts.fontSize ?? CARTOON_DEFAULTS.fontSize;
  // Rough estimation of text dimensions
  const charWidth = fontSize * 0.6;
  const lineHeight = fontSize * 1.35;
  const lines = opts.text.split("\n");
  const maxLineLen = Math.max(...lines.map((l) => l.length));
  const estWidth = opts.width ?? Math.max(maxLineLen * charWidth, 40);
  const estHeight = opts.height ?? lines.length * lineHeight;

  return baseElement({
    type: "text",
    x: opts.x,
    y: opts.y,
    width: estWidth,
    height: estHeight,
    text: opts.text,
    originalText: opts.text,
    autoResize: true,
    fontSize,
    fontFamily: CARTOON_DEFAULTS.fontFamily,
    textAlign: opts.textAlign ?? CARTOON_DEFAULTS.textAlign,
    verticalAlign: CARTOON_DEFAULTS.verticalAlign,
    strokeColor: opts.color ?? "#1e1e1e",
    backgroundColor: "transparent",
    fillStyle: "solid",
    strokeWidth: 0,
    roughness: 0,
    containerId: opts.containerId ?? null,
    groupIds: opts.groupIds ?? [],
    lineHeight: 1.35,
  });
}

// ── 箭头 ─────────────────────────────────────────────────────────────

export function createArrow(opts: {
  points: [number, number][];
  strokeColor: string;
  strokeWidth?: number;
  startArrowhead?: string | null;
  endArrowhead?: string | null;
  groupIds?: string[];
  startBinding?: { elementId: string; focus: number; gap: number } | null;
  endBinding?: { elementId: string; focus: number; gap: number } | null;
}) {
  const [x, y] = opts.points[0];
  // Normalize points relative to first point
  const normalizedPoints = opts.points.map(([px, py]) => [px - x, py - y]);

  return baseElement({
    type: "arrow",
    x,
    y,
    width: Math.abs(normalizedPoints[normalizedPoints.length - 1][0]),
    height: Math.abs(normalizedPoints[normalizedPoints.length - 1][1]),
    points: normalizedPoints,
    strokeColor: opts.strokeColor,
    backgroundColor: "transparent",
    strokeWidth: opts.strokeWidth ?? 3,
    fillStyle: "solid",
    startArrowhead: opts.startArrowhead ?? null,
    endArrowhead: opts.endArrowhead ?? "arrow",
    roundness: { type: 2 },
    groupIds: opts.groupIds ?? [],
    startBinding: opts.startBinding ?? null,
    endBinding: opts.endBinding ?? null,
  });
}

// ── 线条（无箭头） ──────────────────────────────────────────────────

export function createLine(opts: {
  points: [number, number][];
  strokeColor: string;
  strokeWidth?: number;
  groupIds?: string[];
}) {
  const [x, y] = opts.points[0];
  const normalizedPoints = opts.points.map(([px, py]) => [px - x, py - y]);

  return baseElement({
    type: "line",
    x,
    y,
    // 确保 width/height 不为 0（水平线/垂直线会有一维为 0）
    width: Math.max(Math.abs(normalizedPoints[normalizedPoints.length - 1][0]), 1),
    height: Math.max(Math.abs(normalizedPoints[normalizedPoints.length - 1][1]), 1),
    points: normalizedPoints,
    strokeColor: opts.strokeColor,
    backgroundColor: "transparent",
    strokeWidth: opts.strokeWidth ?? CARTOON_DEFAULTS.strokeWidth,
    fillStyle: "solid",
    roundness: { type: 2 },
    groupIds: opts.groupIds ?? [],
    startArrowhead: null,
    endArrowhead: null,
  });
}

// ── 带文本的形状（容器+绑定文本）─────────────────────────────────────

export function createLabeledEllipse(opts: {
  x: number; y: number; width: number; height: number;
  label: string;
  strokeColor: string; fillColor: string;
  fontSize?: number; textColor?: string;
  strokeWidth?: number;
  groupIds?: string[];
}): any[] {
  const groupIds = opts.groupIds ?? [];
  const ellipse = createEllipse({
    x: opts.x,
    y: opts.y,
    width: opts.width,
    height: opts.height,
    strokeColor: opts.strokeColor,
    fillColor: opts.fillColor,
    strokeWidth: opts.strokeWidth,
    groupIds,
  });

  const fontSize = opts.fontSize ?? CARTOON_DEFAULTS.fontSize;
  const text = createText({
    x: opts.x + opts.width / 2,
    y: opts.y + opts.height / 2,
    text: opts.label,
    fontSize,
    color: opts.textColor ?? "#1e1e1e",
    containerId: ellipse.id,
    groupIds,
  });

  // Bind text to ellipse
  (ellipse as any).boundElements = [{ id: text.id, type: "text" }];

  return [ellipse, text];
}

export function createLabeledRect(opts: {
  x: number; y: number; width: number; height: number;
  label: string;
  strokeColor: string; fillColor: string;
  fontSize?: number; textColor?: string;
  strokeWidth?: number;
  groupIds?: string[];
}): any[] {
  const groupIds = opts.groupIds ?? [];
  const rect = createRoundedRect({
    x: opts.x,
    y: opts.y,
    width: opts.width,
    height: opts.height,
    strokeColor: opts.strokeColor,
    fillColor: opts.fillColor,
    strokeWidth: opts.strokeWidth,
    groupIds,
  });

  const fontSize = opts.fontSize ?? CARTOON_DEFAULTS.fontSize;
  const text = createText({
    x: opts.x + opts.width / 2,
    y: opts.y + opts.height / 2,
    text: opts.label,
    fontSize,
    color: opts.textColor ?? "#1e1e1e",
    containerId: rect.id,
    groupIds,
  });

  (rect as any).boundElements = [{ id: text.id, type: "text" }];

  return [rect, text];
}
