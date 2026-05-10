/**
 * 复流程图（因果图）布局引擎 v2
 *
 * 参考图：中心实心粉红圆角矩形 + 左侧橙色 + 右侧绿色 + 粗蓝色箭头
 */
import type { DiagramData } from "../types";
import { ARROW_COLOR } from "../colorPalettes";
import { createRoundedRect, createArrow, createText } from "../helpers/excalidrawFactory";

const CENTER_W = 160;
const CENTER_H = 80;
const SIDE_W = 150;
const SIDE_H = 62;
const X_GAP = 310;
const Y_GAP = 100;

export function layoutMultiFlow(data: DiagramData): any[] {
  const elements: any[] = [];

  const center = data.nodes.find((n) => n.level === 0);
  if (!center) return elements;

  const leftNodes = data.nodes.filter((n) => n.side === "left");
  const rightNodes = data.nodes.filter((n) => n.side === "right");
  const cx = 0, cy = 0;

  // 中心（粉红实心圆角矩形）
  elements.push(
    createRoundedRect({
      x: cx - CENTER_W / 2, y: cy - CENTER_H / 2,
      width: CENTER_W, height: CENTER_H,
      strokeColor: "#E91E63",
      fillColor: "#FF6B9D",
      strokeWidth: 5,
    })
  );
  elements.push(
    createText({
      x: cx - CENTER_W / 2, y: cy - 15,
      text: center.emoji ? `${center.emoji} ${center.label}` : center.label,
      fontSize: 20, color: "#ffffff",
      width: CENTER_W, textAlign: "center",
    })
  );

  // 左侧（原因，橙色）
  const leftTotalH = leftNodes.length * (SIDE_H + Y_GAP) - Y_GAP;
  const leftStartY = cy - leftTotalH / 2;

  leftNodes.forEach((node, i) => {
    const nx = cx - X_GAP;
    const ny = leftStartY + i * (SIDE_H + Y_GAP);

    elements.push(
      createRoundedRect({
        x: nx - SIDE_W / 2, y: ny - SIDE_H / 2,
        width: SIDE_W, height: SIDE_H,
        strokeColor: "#FF9800",
        fillColor: "#FF9800",
        strokeWidth: 4,
      })
    );
    elements.push(
      createText({
        x: nx - SIDE_W / 2, y: ny - 13,
        text: node.label, fontSize: 16, color: "#ffffff",
        width: SIDE_W, textAlign: "center",
      })
    );
    elements.push(
      createArrow({
        points: [[nx + SIDE_W / 2, ny], [cx - CENTER_W / 2, cy]],
        strokeColor: ARROW_COLOR, strokeWidth: 5, endArrowhead: "arrow",
      })
    );
  });

  // 右侧（结果，绿色）
  const rightTotalH = rightNodes.length * (SIDE_H + Y_GAP) - Y_GAP;
  const rightStartY = cy - rightTotalH / 2;

  rightNodes.forEach((node, i) => {
    const nx = cx + X_GAP;
    const ny = rightStartY + i * (SIDE_H + Y_GAP);

    elements.push(
      createRoundedRect({
        x: nx - SIDE_W / 2, y: ny - SIDE_H / 2,
        width: SIDE_W, height: SIDE_H,
        strokeColor: "#27AE60",
        fillColor: "#2ECC71",
        strokeWidth: 4,
      })
    );
    elements.push(
      createText({
        x: nx - SIDE_W / 2, y: ny - 13,
        text: node.label, fontSize: 16, color: "#ffffff",
        width: SIDE_W, textAlign: "center",
      })
    );
    elements.push(
      createArrow({
        points: [[cx + CENTER_W / 2, cy], [nx - SIDE_W / 2, ny]],
        strokeColor: ARROW_COLOR, strokeWidth: 5, endArrowhead: "arrow",
      })
    );
  });

  return elements;
}
