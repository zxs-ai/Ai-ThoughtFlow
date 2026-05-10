/**
 * 双气泡图布局引擎 v2
 *
 * 参考图：两个粗描边大圆（蓝/棕），中间粉色小圆（共有），旁侧彩色小圆（独有）
 */
import type { DiagramData } from "../types";
import { getSolidBubbleColor } from "../colorPalettes";
import { createEllipse, createLine, createText } from "../helpers/excalidrawFactory";

const MAIN_R = 90;
const SHARED_R = 48;
const UNIQUE_R = 58;
const MAIN_GAP = 350;
const UNIQUE_ORBIT = 210;

export function layoutDoubleBubble(data: DiagramData): any[] {
  const elements: any[] = [];

  const mainNodes = data.nodes.filter((n) => n.level === 0);
  const leftMain = mainNodes[0];
  const rightMain = mainNodes[1] || mainNodes[0];

  const leftX = -MAIN_GAP / 2, rightX = MAIN_GAP / 2, cy = 0;

  // 左主圆（蓝色描边，白填充）
  elements.push(
    createEllipse({
      x: leftX - MAIN_R, y: cy - MAIN_R,
      width: MAIN_R * 2, height: MAIN_R * 2,
      strokeColor: "#3F51B5", fillColor: "#ffffff", strokeWidth: 5,
    })
  );
  elements.push(
    createText({
      x: leftX - MAIN_R, y: cy - 14,
      text: leftMain?.label ?? "", fontSize: 20, color: "#3F51B5",
      width: MAIN_R * 2, textAlign: "center",
    })
  );

  // 右主圆（棕色描边，白填充）
  elements.push(
    createEllipse({
      x: rightX - MAIN_R, y: cy - MAIN_R,
      width: MAIN_R * 2, height: MAIN_R * 2,
      strokeColor: "#795548", fillColor: "#ffffff", strokeWidth: 5,
    })
  );
  elements.push(
    createText({
      x: rightX - MAIN_R, y: cy - 14,
      text: rightMain?.label ?? "", fontSize: 20, color: "#795548",
      width: MAIN_R * 2, textAlign: "center",
    })
  );

  // 共有节点（粉色实心小圆，居中排列）
  const sharedNodes = data.nodes.filter((n) => n.side === "shared" || n.group === "shared");
  const sharedTotalH = sharedNodes.length * (SHARED_R * 2 + 20) - 20;
  const sharedStartY = cy - sharedTotalH / 2;

  sharedNodes.forEach((node, i) => {
    const sx = 0;
    const sy = sharedStartY + i * (SHARED_R * 2 + 20) + SHARED_R;

    elements.push(
      createLine({ points: [[leftX + MAIN_R, cy], [sx - SHARED_R, sy]], strokeColor: "#E91E63", strokeWidth: 2 })
    );
    elements.push(
      createLine({ points: [[rightX - MAIN_R, cy], [sx + SHARED_R, sy]], strokeColor: "#E91E63", strokeWidth: 2 })
    );
    elements.push(
      createEllipse({
        x: sx - SHARED_R, y: sy - SHARED_R,
        width: SHARED_R * 2, height: SHARED_R * 2,
        strokeColor: "#E91E63", fillColor: "#FF6B9D", strokeWidth: 3,
      })
    );
    elements.push(
      createText({
        x: sx - SHARED_R, y: sy - 11,
        text: node.label, fontSize: 14, color: "#ffffff",
        width: SHARED_R * 2, textAlign: "center",
      })
    );
  });

  // 左侧独有节点
  const leftUniqueNodes = data.nodes.filter(
    (n) => (n.side === "left" || n.parent === leftMain?.id) && n.level >= 1 && n.side !== "shared"
  );
  const lStep = Math.PI / Math.max(leftUniqueNodes.length + 1, 2);
  leftUniqueNodes.forEach((node, i) => {
    const angle = Math.PI / 2 + lStep * (i + 1);
    const nx = leftX + Math.cos(angle) * UNIQUE_ORBIT;
    const ny = cy + Math.sin(angle) * UNIQUE_ORBIT;
    const color = getSolidBubbleColor(i);

    elements.push(createLine({ points: [[leftX, cy], [nx, ny]], strokeColor: color, strokeWidth: 3 }));
    elements.push(
      createEllipse({
        x: nx - UNIQUE_R, y: ny - UNIQUE_R,
        width: UNIQUE_R * 2, height: UNIQUE_R * 2,
        strokeColor: color, fillColor: color, strokeWidth: 3,
      })
    );
    elements.push(
      createText({
        x: nx - UNIQUE_R, y: ny - 11,
        text: node.label, fontSize: 14, color: "#ffffff",
        width: UNIQUE_R * 2, textAlign: "center",
      })
    );
  });

  // 右侧独有节点
  const rightUniqueNodes = data.nodes.filter(
    (n) => (n.side === "right" || n.parent === rightMain?.id) && n.level >= 1 && n.side !== "shared"
  );
  const rStep = Math.PI / Math.max(rightUniqueNodes.length + 1, 2);
  rightUniqueNodes.forEach((node, i) => {
    const angle = -Math.PI / 2 + rStep * (i + 1);
    const nx = rightX + Math.cos(angle) * UNIQUE_ORBIT;
    const ny = cy + Math.sin(angle) * UNIQUE_ORBIT;
    const color = getSolidBubbleColor(i + 5);

    elements.push(createLine({ points: [[rightX, cy], [nx, ny]], strokeColor: color, strokeWidth: 3 }));
    elements.push(
      createEllipse({
        x: nx - UNIQUE_R, y: ny - UNIQUE_R,
        width: UNIQUE_R * 2, height: UNIQUE_R * 2,
        strokeColor: color, fillColor: color, strokeWidth: 3,
      })
    );
    elements.push(
      createText({
        x: nx - UNIQUE_R, y: ny - 11,
        text: node.label, fontSize: 14, color: "#ffffff",
        width: UNIQUE_R * 2, textAlign: "center",
      })
    );
  });

  return elements;
}
