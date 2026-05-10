/**
 * 括号图布局引擎
 *
 * 整体 → { 部分1, 部分2, 部分3 } → 各自子部分
 * 使用大括号视觉暗示 + 层级递进
 */
import type { DiagramData } from "../types";
import { getBranchColor, getNodeFill, CENTER_COLORS } from "../colorPalettes";
import { createLabeledEllipse, createLabeledRect, createLine } from "../helpers/excalidrawFactory";

const NODE_W = 150;
const NODE_H = 55;
const LEVEL_GAP = 250;
const V_GAP = 80;

export function layoutBrace(data: DiagramData): any[] {
  const elements: any[] = [];
  const root = data.nodes.find((n) => n.level === 0);
  if (!root) return elements;

  const parts = data.nodes.filter((n) => n.level === 1);
  const subparts = data.nodes.filter((n) => n.level === 2);

  const rx = 0, ry = 0;

  // Root node (left side)
  elements.push(
    ...createLabeledEllipse({
      x: rx - NODE_W / 2, y: ry - NODE_H / 2,
      width: NODE_W, height: NODE_H,
      label: root.label,
      strokeColor: CENTER_COLORS.stroke, fillColor: CENTER_COLORS.fill,
      fontSize: 22, strokeWidth: 4,
    })
  );

  if (parts.length === 0) return elements;

  // Parts (middle column)
  const partsTotalH = parts.length * (NODE_H + V_GAP) - V_GAP;
  const partsStartY = ry - partsTotalH / 2;
  const partsX = rx + LEVEL_GAP;

  // Brace lines from root to each part
  parts.forEach((part, i) => {
    const py = partsStartY + i * (NODE_H + V_GAP);
    const color = getBranchColor(i);
    const fill = getNodeFill(i);

    // Root → part connection
    elements.push(
      createLine({
        points: [[rx + NODE_W / 2, ry], [partsX - NODE_W / 2, py]],
        strokeColor: "#7c4dff",
        strokeWidth: 3,
      })
    );

    // Part node
    elements.push(
      ...createLabeledRect({
        x: partsX - NODE_W / 2, y: py - NODE_H / 2,
        width: NODE_W, height: NODE_H,
        label: part.label,
        strokeColor: color, fillColor: fill,
        fontSize: 18, strokeWidth: 3,
      })
    );

    // Sub-parts for this part
    const partSubs = subparts.filter((s) => s.parent === part.id);
    if (partSubs.length === 0) return;

    const subX = partsX + LEVEL_GAP;
    const subTotalH = partSubs.length * (NODE_H + V_GAP * 0.5) - V_GAP * 0.5;
    const subStartY = py - subTotalH / 2;

    partSubs.forEach((sub, j) => {
      const sy = subStartY + j * (NODE_H + V_GAP * 0.5);

      elements.push(
        createLine({
          points: [[partsX + NODE_W / 2, py], [subX - NODE_W / 2, sy]],
          strokeColor: color,
          strokeWidth: 2,
        })
      );

      elements.push(
        ...createLabeledRect({
          x: subX - NODE_W / 2, y: sy - NODE_H / 2,
          width: NODE_W * 0.85, height: NODE_H * 0.85,
          label: sub.label,
          strokeColor: color, fillColor: fill,
          fontSize: 14, strokeWidth: 2,
        })
      );
    });
  });

  return elements;
}
