/**
 * 圆圈图布局引擎 v2
 *
 * 参考图：两个同心圆，内圆实心橙色，外圈黄色，文字内/外区分
 */
import type { DiagramData } from "../types";
import { createEllipse, createText } from "../helpers/excalidrawFactory";

export function layoutCircle(data: DiagramData): any[] {
  const elements: any[] = [];
  const root = data.nodes.find((n) => n.level === 0);
  if (!root) return elements;

  const innerNodes = data.nodes.filter((n) => n.level === 1);
  const outerNodes = data.nodes.filter((n) => n.level === 2);
  const cx = 0, cy = 0;

  // 外圈（黄色实心大圆）
  const outerR = 260;
  elements.push(
    createEllipse({
      x: cx - outerR, y: cy - outerR,
      width: outerR * 2, height: outerR * 2,
      strokeColor: "#F39C12",
      fillColor: "#FFD93D",
      strokeWidth: 5,
    })
  );

  // 中圈（白色，分隔区域）
  const midR = 155;
  elements.push(
    createEllipse({
      x: cx - midR, y: cy - midR,
      width: midR * 2, height: midR * 2,
      strokeColor: "#F39C12",
      fillColor: "#ffffff",
      strokeWidth: 4,
    })
  );

  // 内核（橙色实心圆）
  const innerR = 70;
  elements.push(
    createEllipse({
      x: cx - innerR, y: cy - innerR,
      width: innerR * 2, height: innerR * 2,
      strokeColor: "#E74C3C",
      fillColor: "#FF6B35",
      strokeWidth: 4,
    })
  );
  elements.push(
    createText({
      x: cx - innerR, y: cy - 13,
      text: root.label,
      fontSize: 18,
      color: "#ffffff",
      width: innerR * 2,
      textAlign: "center",
    })
  );

  // 中间圆环文字（一级：定义/特征）
  if (innerNodes.length > 0) {
    const step = (2 * Math.PI) / innerNodes.length;
    innerNodes.forEach((node, i) => {
      const angle = -Math.PI / 2 + i * step;
      const r = (innerR + midR) / 2;
      const tx = cx + Math.cos(angle) * r;
      const ty = cy + Math.sin(angle) * r;
      elements.push(
        createText({
          x: tx - 55, y: ty - 12,
          text: node.label,
          fontSize: 15,
          color: "#7B3F00",
          width: 110,
          textAlign: "center",
        })
      );
    });
  }

  // 外圈文字（二级：示例）
  if (outerNodes.length > 0) {
    const step = (2 * Math.PI) / outerNodes.length;
    outerNodes.forEach((node, i) => {
      const angle = -Math.PI / 2 + (i + 0.5) * step;
      const r = (midR + outerR) / 2;
      const tx = cx + Math.cos(angle) * r;
      const ty = cy + Math.sin(angle) * r;
      elements.push(
        createText({
          x: tx - 55, y: ty - 12,
          text: node.label,
          fontSize: 14,
          color: "#5D4037",
          width: 110,
          textAlign: "center",
        })
      );
    });
  }

  return elements;
}
