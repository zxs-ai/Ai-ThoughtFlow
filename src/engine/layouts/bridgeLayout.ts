/**
 * 桥形图布局引擎
 *
 * 用于展示类比关系：A:B = C:D = E:F
 * 上下两行对应项 + 桥形连接线
 */
import type { DiagramData } from "../types";
import { getBranchColor, getNodeFill } from "../colorPalettes";
import { createLabeledRect, createLine, createText } from "../helpers/excalidrawFactory";

const NODE_W = 130;
const NODE_H = 50;
const PAIR_GAP_X = 220;
const PAIR_GAP_Y = 160;
const BRIDGE_COLOR = "#7c4dff";

export function layoutBridge(data: DiagramData): any[] {
  const elements: any[] = [];

  // Expect nodes organized as pairs: level=1 top row, level=2 bottom row
  // paired by parent or sequential ordering
  const topNodes = data.nodes.filter((n) => n.level === 1 || n.side === "left");
  const bottomNodes = data.nodes.filter((n) => n.level === 2 || n.side === "right");
  const root = data.nodes.find((n) => n.level === 0);

  // Title
  if (root) {
    elements.push(
      createText({
        x: -100, y: -PAIR_GAP_Y - 60,
        text: `🌉 ${root.label}`,
        fontSize: 28,
        color: BRIDGE_COLOR,
        width: 200,
      })
    );
  }

  const pairCount = Math.max(topNodes.length, bottomNodes.length);
  const totalWidth = pairCount * PAIR_GAP_X;
  const startX = -totalWidth / 2;

  for (let i = 0; i < pairCount; i++) {
    const px = startX + i * PAIR_GAP_X + PAIR_GAP_X / 2;
    const topY = -PAIR_GAP_Y / 2;
    const bottomY = PAIR_GAP_Y / 2;
    const color = getBranchColor(i);
    const fill = getNodeFill(i);

    // Top node
    if (topNodes[i]) {
      elements.push(
        ...createLabeledRect({
          x: px - NODE_W / 2, y: topY - NODE_H / 2,
          width: NODE_W, height: NODE_H,
          label: topNodes[i].label,
          strokeColor: color, fillColor: fill,
          fontSize: 16, strokeWidth: 2,
        })
      );
    }

    // Bottom node
    if (bottomNodes[i]) {
      elements.push(
        ...createLabeledRect({
          x: px - NODE_W / 2, y: bottomY - NODE_H / 2,
          width: NODE_W, height: NODE_H,
          label: bottomNodes[i].label,
          strokeColor: color, fillColor: fill,
          fontSize: 16, strokeWidth: 2,
        })
      );
    }

    // Vertical bridge line
    elements.push(
      createLine({
        points: [[px, topY + NODE_H / 2], [px, bottomY - NODE_H / 2]],
        strokeColor: color,
        strokeWidth: 2,
      })
    );

    // Horizontal bridge to next pair
    if (i < pairCount - 1) {
      const nextPx = startX + (i + 1) * PAIR_GAP_X + PAIR_GAP_X / 2;
      elements.push(
        createLine({
          points: [[px + NODE_W / 2 + 10, 0], [nextPx - NODE_W / 2 - 10, 0]],
          strokeColor: BRIDGE_COLOR,
          strokeWidth: 3,
        })
      );

      // "=" sign between pairs
      elements.push(
        createText({
          x: (px + nextPx) / 2 - 10, y: -12,
          text: "=",
          fontSize: 24,
          color: BRIDGE_COLOR,
          width: 20,
        })
      );
    }
  }

  return elements;
}
