/**
 * 气泡图布局引擎 v2
 *
 * 完全对标参考图片风格：
 * - 中心：大粉红实心圆，白色文字
 * - 卫星：实心鲜艳纯色圆，白色文字
 * - 连线：粗线（5-6px），颜色与卫星一致
 * - 文字标注在圆圈 **外侧**（不塞进圆里）
 */
import type { DiagramData } from "../types";
import { getSolidBubbleColor, CENTER_COLORS } from "../colorPalettes";
import { createEllipse, createLine, createText } from "../helpers/excalidrawFactory";

// ── 尺寸参数（对标参考图比例）───────────────────────────────
const CENTER_R = 80;          // 中心圆半径（参考图约 80px）
const SAT_R = 55;             // 卫星圆半径
const ORBIT_RADIUS = 260;     // 中心到卫星圆心距离

export function layoutBubble(data: DiagramData): any[] {
  const elements: any[] = [];
  const root = data.nodes.find((n) => n.level === 0);
  if (!root) return elements;

  const satellites = data.nodes.filter((n) => n.level === 1);
  const cx = 0, cy = 0;

  // ── 1. 中心实心圆（大粉红圆，白色文字）────────────────────
  const centerEllipse = createEllipse({
    x: cx - CENTER_R,
    y: cy - CENTER_R,
    width: CENTER_R * 2,
    height: CENTER_R * 2,
    strokeColor: CENTER_COLORS.stroke,
    fillColor: CENTER_COLORS.fill,
    strokeWidth: 5,
  });
  elements.push(centerEllipse);

  // 中心文字（直接用 text，不用容器绑定）
  elements.push(createText({
    x: cx - CENTER_R,
    y: cy - 18,
    text: root.label,
    fontSize: 22,
    color: "#ffffff",
    width: CENTER_R * 2,
    textAlign: "center",
  }));

  // ── 2. 卫星圆 ─────────────────────────────────────────────
  const count = satellites.length;
  if (count === 0) return elements;

  const angleStep = (2 * Math.PI) / count;

  satellites.forEach((sat, i) => {
    // 起始角度从正上方开始，顺时针分布
    const angle = -Math.PI / 2 + i * angleStep;
    const sx = cx + Math.cos(angle) * ORBIT_RADIUS;
    const sy = cy + Math.sin(angle) * ORBIT_RADIUS;
    const color = getSolidBubbleColor(i);

    // 连线：从中心圆边缘到卫星圆边缘（不穿透圆内部）
    const lineStartX = cx + Math.cos(angle) * CENTER_R;
    const lineStartY = cy + Math.sin(angle) * CENTER_R;
    const lineEndX = sx - Math.cos(angle) * SAT_R;
    const lineEndY = sy - Math.sin(angle) * SAT_R;

    elements.push(
      createLine({
        points: [[lineStartX, lineStartY], [lineEndX, lineEndY]],
        strokeColor: color,
        strokeWidth: 5,
      })
    );

    // 卫星圆（实心纯色，无描边填充区分）
    elements.push(
      createEllipse({
        x: sx - SAT_R,
        y: sy - SAT_R,
        width: SAT_R * 2,
        height: SAT_R * 2,
        strokeColor: color,
        fillColor: color,
        strokeWidth: 4,
      })
    );

    // 文字：白色，放在圆圈中心
    const label = sat.emoji ? `${sat.emoji}\n${sat.label}` : sat.label;
    const fontSize = sat.label.length > 4 ? 14 : 16;
    elements.push(
      createText({
        x: sx - SAT_R,
        y: sy - fontSize - 4,
        text: label,
        fontSize,
        color: "#ffffff",
        width: SAT_R * 2,
        textAlign: "center",
      })
    );
  });

  return elements;
}
