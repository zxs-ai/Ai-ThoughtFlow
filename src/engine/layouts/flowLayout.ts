/**
 * 流程图布局引擎
 *
 * 支持 TD（上下）和 LR（左右）两种方向
 * 彩色圆角矩形节点 + 粗箭头连线
 */
import type { DiagramData } from "../types";
import { getBranchColor, getNodeFill, ARROW_COLOR } from "../colorPalettes";
import { createLabeledRect, createArrow } from "../helpers/excalidrawFactory";

const NODE_W = 170;
const NODE_H = 65;
const GAP_X = 80;
const GAP_Y = 100;

export function layoutFlow(data: DiagramData): any[] {
  const elements: any[] = [];
  const direction = data.metadata?.direction || "TD";
  const isLR = direction === "LR";

  // Build adjacency from edges; if no edges, use node order
  const orderedNodes = data.nodes.filter((n) => n.level >= 0);

  // Position nodes in a grid / sequence
  const positions = new Map<string, { x: number; y: number }>();

  orderedNodes.forEach((node, i) => {
    if (isLR) {
      positions.set(node.id, {
        x: i * (NODE_W + GAP_X),
        y: 0,
      });
    } else {
      positions.set(node.id, {
        x: 0,
        y: i * (NODE_H + GAP_Y),
      });
    }
  });

  // Create nodes
  const elementIdMap = new Map<string, string>();

  orderedNodes.forEach((node, i) => {
    const pos = positions.get(node.id)!;
    const color = getBranchColor(i);
    const fill = getNodeFill(i);

    const nodeElements = createLabeledRect({
      x: pos.x - NODE_W / 2,
      y: pos.y - NODE_H / 2,
      width: NODE_W,
      height: NODE_H,
      label: node.emoji ? `${node.emoji} ${node.label}` : node.label,
      strokeColor: color,
      fillColor: fill,
      fontSize: 18,
      strokeWidth: 3,
    });

    elementIdMap.set(node.id, nodeElements[0].id);
    elements.push(...nodeElements);
  });

  // Create arrows
  const edges = data.edges || [];
  // If no explicit edges, connect nodes sequentially
  const effectiveEdges = edges.length > 0
    ? edges
    : orderedNodes.slice(0, -1).map((n, i) => ({
        from: n.id,
        to: orderedNodes[i + 1].id,
        label: undefined,
      }));

  effectiveEdges.forEach((edge) => {
    const fromPos = positions.get(edge.from);
    const toPos = positions.get(edge.to);
    if (!fromPos || !toPos) return;

    let startX: number, startY: number, endX: number, endY: number;
    if (isLR) {
      startX = fromPos.x + NODE_W / 2;
      startY = fromPos.y;
      endX = toPos.x - NODE_W / 2;
      endY = toPos.y;
    } else {
      startX = fromPos.x;
      startY = fromPos.y + NODE_H / 2;
      endX = toPos.x;
      endY = toPos.y - NODE_H / 2;
    }

    elements.push(
      createArrow({
        points: [[startX, startY], [endX, endY]],
        strokeColor: ARROW_COLOR,
        strokeWidth: 3,
        endArrowhead: "arrow",
      })
    );
  });

  return elements;
}
