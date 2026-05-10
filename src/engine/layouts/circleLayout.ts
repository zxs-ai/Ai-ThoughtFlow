/**
 * 圆圈图布局引擎
 *
 * 同心圆结构：中心小圆(核心概念) → 中圈(定义) → 外圈(示例/延伸)
 */
import type { DiagramData } from "../types";
import { CENTER_COLORS } from "../colorPalettes";
import { createEllipse, createLabeledEllipse, createText } from "../helpers/excalidrawFactory";

export function layoutCircle(data: DiagramData): any[] {
  const elements: any[] = [];
  const root = data.nodes.find((n) => n.level === 0);
  if (!root) return elements;

  const innerNodes = data.nodes.filter((n) => n.level === 1);
  const outerNodes = data.nodes.filter((n) => n.level === 2);
  const cx = 0, cy = 0;

  // Outer ring (large circle, light fill)
  const outerR = 250;
  elements.push(
    createEllipse({
      x: cx - outerR, y: cy - outerR,
      width: outerR * 2, height: outerR * 2,
      strokeColor: "#f39c12", fillColor: "#fffde7",
      strokeWidth: 3,
    })
  );

  // Middle ring
  const midR = 150;
  elements.push(
    createEllipse({
      x: cx - midR, y: cy - midR,
      width: midR * 2, height: midR * 2,
      strokeColor: "#e91e63", fillColor: "#fce4ec",
      strokeWidth: 3,
    })
  );

  // Center circle with label
  const innerR = 70;
  elements.push(
    ...createLabeledEllipse({
      x: cx - innerR, y: cy - innerR,
      width: innerR * 2, height: innerR * 2,
      label: root.label,
      strokeColor: CENTER_COLORS.stroke, fillColor: CENTER_COLORS.fill,
      fontSize: 24, strokeWidth: 4,
    })
  );

  // Place inner-level texts in the middle ring area
  if (innerNodes.length > 0) {
    const innerAngleStep = (2 * Math.PI) / innerNodes.length;
    innerNodes.forEach((node, i) => {
      const angle = -Math.PI / 2 + i * innerAngleStep;
      const tx = cx + Math.cos(angle) * (innerR + (midR - innerR) / 2);
      const ty = cy + Math.sin(angle) * (innerR + (midR - innerR) / 2);
      elements.push(
        createText({
          x: tx - 50, y: ty - 12,
          text: node.label,
          fontSize: 16,
          color: "#c2185b",
          width: 100,
        })
      );
    });
  }

  // Place outer-level texts in the outer ring area
  if (outerNodes.length > 0) {
    const outerAngleStep = (2 * Math.PI) / outerNodes.length;
    outerNodes.forEach((node, i) => {
      const angle = -Math.PI / 2 + i * outerAngleStep;
      const tx = cx + Math.cos(angle) * (midR + (outerR - midR) / 2);
      const ty = cy + Math.sin(angle) * (midR + (outerR - midR) / 2);
      elements.push(
        createText({
          x: tx - 50, y: ty - 12,
          text: node.label,
          fontSize: 14,
          color: "#e65100",
          width: 100,
        })
      );
    });
  }

  return elements;
}
