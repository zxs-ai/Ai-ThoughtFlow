/**
 * 双气泡图布局引擎
 *
 * 复刻参考图片风格：两个主题圆 + 中间共有属性 + 各自独有属性
 */
import type { DiagramData } from "../types";
import { getBranchColor, getNodeFill, SHARED_COLORS } from "../colorPalettes";
import { createLabeledEllipse, createLine } from "../helpers/excalidrawFactory";

const MAIN_R = 85;
const SHARED_R = 50;
const UNIQUE_R = 55;
const MAIN_GAP = 320;         // 两主圆间距
const SHARED_ORBIT = 140;     // 共有节点到中线距离
const UNIQUE_ORBIT = 200;     // 独有节点到主圆距离

export function layoutDoubleBubble(data: DiagramData): any[] {
  const elements: any[] = [];

  // Find the two main topics
  const mainNodes = data.nodes.filter((n) => n.level === 0);
  const leftMain = mainNodes[0];
  const rightMain = mainNodes[1] || mainNodes[0];

  const leftX = -MAIN_GAP / 2, leftY = 0;
  const rightX = MAIN_GAP / 2, rightY = 0;
  const midX = 0, midY = 0;

  // Left main circle
  elements.push(
    ...createLabeledEllipse({
      x: leftX - MAIN_R, y: leftY - MAIN_R,
      width: MAIN_R * 2, height: MAIN_R * 2,
      label: leftMain.label,
      strokeColor: "#3f51b5", fillColor: "#e8eaf6",
      fontSize: 22, strokeWidth: 4,
    })
  );

  // Right main circle
  elements.push(
    ...createLabeledEllipse({
      x: rightX - MAIN_R, y: rightY - MAIN_R,
      width: MAIN_R * 2, height: MAIN_R * 2,
      label: rightMain.label,
      strokeColor: "#795548", fillColor: "#efebe9",
      fontSize: 22, strokeWidth: 4,
    })
  );

  // Shared nodes (in the middle)
  const sharedNodes = data.nodes.filter((n) => n.side === "shared" || n.group === "shared");
  if (sharedNodes.length > 0) {
    const sharedAngleStep = Math.PI / Math.max(sharedNodes.length - 1, 1);
    const sharedStartAngle = -Math.PI / 2;

    sharedNodes.forEach((node, i) => {
      const angle = sharedNodes.length === 1
        ? -Math.PI / 2
        : sharedStartAngle + i * sharedAngleStep;
      const sx = midX + Math.cos(angle) * SHARED_ORBIT * 0.4;
      const sy = midY + Math.sin(angle) * SHARED_ORBIT - 30;

      // Lines to both main circles
      elements.push(
        createLine({ points: [[leftX, leftY], [sx, sy]], strokeColor: SHARED_COLORS.stroke, strokeWidth: 2 }),
        createLine({ points: [[rightX, rightY], [sx, sy]], strokeColor: SHARED_COLORS.stroke, strokeWidth: 2 }),
      );

      elements.push(
        ...createLabeledEllipse({
          x: sx - SHARED_R, y: sy - SHARED_R,
          width: SHARED_R * 2, height: SHARED_R * 2,
          label: node.label, strokeColor: SHARED_COLORS.stroke,
          fillColor: SHARED_COLORS.fill, fontSize: 16, strokeWidth: 2,
        })
      );
    });
  }

  // Left-unique nodes
  const leftNodes = data.nodes.filter((n) => n.side === "left" || n.parent === leftMain?.id);
  const leftUniqueNodes = leftNodes.filter((n) => n.level >= 1 && n.side !== "shared" && n.group !== "shared");
  if (leftUniqueNodes.length > 0) {
    const step = Math.PI / Math.max(leftUniqueNodes.length + 1, 2);
    leftUniqueNodes.forEach((node, i) => {
      const angle = Math.PI / 2 + step * (i + 1);
      const nx = leftX + Math.cos(angle) * UNIQUE_ORBIT;
      const ny = leftY + Math.sin(angle) * UNIQUE_ORBIT;
      const color = getBranchColor(i);
      const fill = getNodeFill(i);

      elements.push(
        createLine({ points: [[leftX, leftY], [nx, ny]], strokeColor: color, strokeWidth: 2 })
      );
      elements.push(
        ...createLabeledEllipse({
          x: nx - UNIQUE_R, y: ny - UNIQUE_R,
          width: UNIQUE_R * 2, height: UNIQUE_R * 2,
          label: node.label, strokeColor: color, fillColor: fill,
          fontSize: 16, strokeWidth: 2,
        })
      );
    });
  }

  // Right-unique nodes
  const rightNodes = data.nodes.filter((n) => n.side === "right" || n.parent === rightMain?.id);
  const rightUniqueNodes = rightNodes.filter((n) => n.level >= 1 && n.side !== "shared" && n.group !== "shared");
  if (rightUniqueNodes.length > 0) {
    const step = Math.PI / Math.max(rightUniqueNodes.length + 1, 2);
    rightUniqueNodes.forEach((node, i) => {
      const angle = -Math.PI / 2 + step * (i + 1);
      const nx = rightX + Math.cos(angle) * UNIQUE_ORBIT;
      const ny = rightY + Math.sin(angle) * UNIQUE_ORBIT;
      const color = getBranchColor(i + 5);
      const fill = getNodeFill(i + 5);

      elements.push(
        createLine({ points: [[rightX, rightY], [nx, ny]], strokeColor: color, strokeWidth: 2 })
      );
      elements.push(
        ...createLabeledEllipse({
          x: nx - UNIQUE_R, y: ny - UNIQUE_R,
          width: UNIQUE_R * 2, height: UNIQUE_R * 2,
          label: node.label, strokeColor: color, fillColor: fill,
          fontSize: 16, strokeWidth: 2,
        })
      );
    });
  }

  return elements;
}
