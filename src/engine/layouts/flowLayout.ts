/**
 * 流程图布局引擎 v2
 *
 * 参考图：彩色粗描边圆角矩形 + 蓝色实心箭头
 * 每个节点用不同颜色，粗描边（4px），内部白色填充
 */
import type { DiagramData } from "../types";
import { BRANCH_COLORS, ARROW_COLOR } from "../colorPalettes";
import { createRoundedRect, createArrow, createText } from "../helpers/excalidrawFactory";

const NODE_W = 180;
const NODE_H = 68;
const GAP_X = 100;
const GAP_Y = 110;

export function layoutFlow(data: DiagramData): any[] {
  const elements: any[] = [];
  const direction = data.metadata?.direction || "TD";
  const isLR = direction === "LR";

  const orderedNodes = data.nodes.filter((n) => n.level >= 0);
  const positions = new Map<string, { x: number; y: number }>();

  orderedNodes.forEach((node, i) => {
    if (isLR) {
      positions.set(node.id, { x: i * (NODE_W + GAP_X), y: 0 });
    } else {
      positions.set(node.id, { x: 0, y: i * (NODE_H + GAP_Y) });
    }
  });

  // 节点
  orderedNodes.forEach((node, i) => {
    const pos = positions.get(node.id)!;
    const color = BRANCH_COLORS[i % BRANCH_COLORS.length];
    const label = node.emoji ? `${node.emoji} ${node.label}` : node.label;

    // 白底彩色描边圆角矩形
    elements.push(
      createRoundedRect({
        x: pos.x - NODE_W / 2, y: pos.y - NODE_H / 2,
        width: NODE_W, height: NODE_H,
        strokeColor: color,
        fillColor: "#ffffff",
        strokeWidth: 4,
      })
    );
    elements.push(
      createText({
        x: pos.x - NODE_W / 2, y: pos.y - 14,
        text: label,
        fontSize: 16,
        color: color,
        width: NODE_W,
        textAlign: "center",
      })
    );
  });

  // 箭头连线
  const edges = data.edges || [];
  const effectiveEdges = edges.length > 0
    ? edges
    : orderedNodes.slice(0, -1).map((n, i) => ({
        from: n.id, to: orderedNodes[i + 1].id, label: undefined,
      }));

  effectiveEdges.forEach((edge) => {
    const fp = positions.get(edge.from);
    const tp = positions.get(edge.to);
    if (!fp || !tp) return;

    let sx: number, sy: number, ex: number, ey: number;
    if (isLR) {
      sx = fp.x + NODE_W / 2; sy = fp.y;
      ex = tp.x - NODE_W / 2; ey = tp.y;
    } else {
      sx = fp.x; sy = fp.y + NODE_H / 2;
      ex = tp.x; ey = tp.y - NODE_H / 2;
    }

    elements.push(
      createArrow({
        points: [[sx, sy], [ex, ey]],
        strokeColor: ARROW_COLOR,
        strokeWidth: 4,
        endArrowhead: "arrow",
      })
    );

    // 箭头标签
    if (edge.label) {
      elements.push(
        createText({
          x: (sx + ex) / 2 - 40, y: (sy + ey) / 2 - 12,
          text: edge.label, fontSize: 13, color: ARROW_COLOR, width: 80,
          textAlign: "center",
        })
      );
    }
  });

  return elements;
}
