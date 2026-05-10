/**
 * 气泡图布局引擎
 *
 * 复刻参考图片风格：中心大圆 + 周围卫星小圆，每个一不同颜色
 */
import type { DiagramData } from "../types";
import { getBranchColor, getNodeFill, CENTER_COLORS } from "../colorPalettes";
import { createLabeledEllipse, createLine } from "../helpers/excalidrawFactory";

const CENTER_R = 90;
const SAT_R = 60;
const ORBIT_RADIUS = 220;

export function layoutBubble(data: DiagramData): any[] {
  const elements: any[] = [];
  const root = data.nodes.find((n) => n.level === 0);
  if (!root) return elements;

  const satellites = data.nodes.filter((n) => n.level === 1);
  const cx = 0, cy = 0;

  // Center bubble
  elements.push(
    ...createLabeledEllipse({
      x: cx - CENTER_R,
      y: cy - CENTER_R,
      width: CENTER_R * 2,
      height: CENTER_R * 2,
      label: root.emoji ? `${root.emoji} ${root.label}` : root.label,
      strokeColor: CENTER_COLORS.stroke,
      fillColor: CENTER_COLORS.fill,
      fontSize: 24,
      textColor: CENTER_COLORS.text,
      strokeWidth: 4,
    })
  );

  // Satellite bubbles
  const count = satellites.length;
  if (count === 0) return elements;

  const angleStep = (2 * Math.PI) / count;
  satellites.forEach((sat, i) => {
    const angle = -Math.PI / 2 + i * angleStep;
    const sx = cx + Math.cos(angle) * ORBIT_RADIUS;
    const sy = cy + Math.sin(angle) * ORBIT_RADIUS;
    const color = getBranchColor(i);
    const fill = getNodeFill(i);

    // Connection line
    elements.push(
      createLine({
        points: [[cx, cy], [sx, sy]],
        strokeColor: color,
        strokeWidth: 3,
      })
    );

    // Satellite circle
    elements.push(
      ...createLabeledEllipse({
        x: sx - SAT_R,
        y: sy - SAT_R,
        width: SAT_R * 2,
        height: SAT_R * 2,
        label: sat.emoji ? `${sat.emoji} ${sat.label}` : sat.label,
        strokeColor: color,
        fillColor: fill,
        fontSize: 18,
        strokeWidth: 3,
      })
    );
  });

  return elements;
}
