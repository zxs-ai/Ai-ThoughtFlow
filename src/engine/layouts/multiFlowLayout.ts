/**
 * 复流程图（因果图）布局引擎
 *
 * 复刻参考图片：左侧原因 → 中心事件 → 右侧结果
 * 使用粗青色箭头连接
 */
import type { DiagramData } from "../types";
import { ARROW_COLOR } from "../colorPalettes";
import { createLabeledRect, createArrow } from "../helpers/excalidrawFactory";

const CENTER_W = 160;
const CENTER_H = 80;
const SIDE_W = 140;
const SIDE_H = 60;
const X_GAP = 300;
const Y_GAP = 100;

export function layoutMultiFlow(data: DiagramData): any[] {
  const elements: any[] = [];

  const center = data.nodes.find((n) => n.level === 0);
  if (!center) return elements;

  const leftNodes = data.nodes.filter((n) => n.side === "left");
  const rightNodes = data.nodes.filter((n) => n.side === "right");

  const cx = 0, cy = 0;

  // Center node (large rounded rect)
  elements.push(
    ...createLabeledRect({
      x: cx - CENTER_W / 2, y: cy - CENTER_H / 2,
      width: CENTER_W, height: CENTER_H,
      label: center.emoji ? `${center.emoji} ${center.label}` : center.label,
      strokeColor: "#7c4dff", fillColor: "#ede7f6",
      fontSize: 22, strokeWidth: 4,
    })
  );

  // Left (causes) — stacked vertically
  const leftTotalH = leftNodes.length * (SIDE_H + Y_GAP) - Y_GAP;
  const leftStartY = cy - leftTotalH / 2;

  leftNodes.forEach((node, i) => {
    const nx = cx - X_GAP;
    const ny = leftStartY + i * (SIDE_H + Y_GAP);

    elements.push(
      ...createLabeledRect({
        x: nx - SIDE_W / 2, y: ny - SIDE_H / 2,
        width: SIDE_W, height: SIDE_H,
        label: node.label,
        strokeColor: "#ff9800", fillColor: "#fff3e0",
        fontSize: 16, strokeWidth: 3,
      })
    );

    // Arrow: cause → center
    elements.push(
      createArrow({
        points: [[nx + SIDE_W / 2, ny], [cx - CENTER_W / 2, cy]],
        strokeColor: ARROW_COLOR,
        strokeWidth: 4,
        endArrowhead: "arrow",
      })
    );
  });

  // Right (effects) — stacked vertically
  const rightTotalH = rightNodes.length * (SIDE_H + Y_GAP) - Y_GAP;
  const rightStartY = cy - rightTotalH / 2;

  rightNodes.forEach((node, i) => {
    const nx = cx + X_GAP;
    const ny = rightStartY + i * (SIDE_H + Y_GAP);

    elements.push(
      ...createLabeledRect({
        x: nx - SIDE_W / 2, y: ny - SIDE_H / 2,
        width: SIDE_W, height: SIDE_H,
        label: node.label,
        strokeColor: "#4caf50", fillColor: "#e8f5e9",
        fontSize: 16, strokeWidth: 3,
      })
    );

    // Arrow: center → effect
    elements.push(
      createArrow({
        points: [[cx + CENTER_W / 2, cy], [nx - SIDE_W / 2, ny]],
        strokeColor: ARROW_COLOR,
        strokeWidth: 4,
        endArrowhead: "arrow",
      })
    );
  });

  return elements;
}
