/**
 * 头脑图/放射状布局引擎 v2
 *
 * 完全对标参考图风格：
 * - 中心：实心鲜艳大圆
 * - 分支线：超粗有机曲线（8px+），每支独立颜色
 * - 一级节点：实心椭圆，白色文字
 * - 二级节点：较小实心圆角矩形
 * - 整体放射状，间距宽裕
 */
import type { DiagramData } from "../types";
import { getBranchColor, getSolidBubbleColor, CENTER_COLORS } from "../colorPalettes";
import {
  createEllipse,
  createRoundedRect,
  createLine,
  createText,
} from "../helpers/excalidrawFactory";

// ── 布局常量 v2 ──────────────────────────────────────────────
const CENTER_RX = 90;
const CENTER_RY = 65;
const BRANCH_RADIUS = 340;     // 一级节点到中心距离（更宽裕）
const LEAF_RADIUS = 190;       // 二级节点到一级距离
const L1_W = 160;
const L1_H = 65;
const L2_W = 140;
const L2_H = 48;
const MIN_LEAF_ANGLE = 0.42;

// ── 主入口 ──────────────────────────────────────────────────
export function layoutMindmap(data: DiagramData): any[] {
  const elements: any[] = [];

  const root = data.nodes.find((n) => n.level === 0);
  if (!root) return elements;

  const branches = data.nodes.filter((n) => n.level === 1);
  const leaves = data.nodes.filter((n) => n.level === 2);
  const cx = 0, cy = 0;

  // ── 1. 中心节点（实心椭圆）──────────────────────────────
  elements.push(
    createEllipse({
      x: cx - CENTER_RX,
      y: cy - CENTER_RY,
      width: CENTER_RX * 2,
      height: CENTER_RY * 2,
      strokeColor: CENTER_COLORS.stroke,
      fillColor: CENTER_COLORS.fill,
      strokeWidth: 5,
    })
  );
  elements.push(
    createText({
      x: cx - CENTER_RX,
      y: cy - 14,
      text: root.emoji ? `${root.emoji} ${root.label}` : root.label,
      fontSize: 22,
      color: "#ffffff",
      width: CENTER_RX * 2,
      textAlign: "center",
    })
  );

  if (branches.length === 0) return elements;

  const angleStep = (2 * Math.PI) / branches.length;
  const startAngle = -Math.PI / 2;

  branches.forEach((branch, i) => {
    const angle = startAngle + i * angleStep;
    const color = getBranchColor(i);
    const satColor = getSolidBubbleColor(i);

    // 一级节点位置
    const bx = cx + Math.cos(angle) * BRANCH_RADIUS;
    const by = cy + Math.sin(angle) * BRANCH_RADIUS;

    // ── 2a. 粗曲线分支（3控制点贝塞尔，9px）──────────────
    // 中间控制点：向法线方向偏移，产生有机弯曲感
    const midDist = BRANCH_RADIUS * 0.5;
    const midX = cx + Math.cos(angle) * midDist;
    const midY = cy + Math.sin(angle) * midDist;
    const perpAngle = angle + Math.PI / 2;
    const curve = 35 + (i % 2 === 0 ? 1 : -1) * 20;
    const ctrlX = midX + Math.cos(perpAngle) * curve;
    const ctrlY = midY + Math.sin(perpAngle) * curve;

    elements.push(
      createLine({
        points: [
          [cx + Math.cos(angle) * CENTER_RX * 0.9, cy + Math.sin(angle) * CENTER_RY * 0.9],
          [ctrlX, ctrlY],
          [bx - Math.cos(angle) * L1_W * 0.5, by - Math.sin(angle) * L1_H * 0.5],
        ],
        strokeColor: color,
        strokeWidth: 9,
      })
    );

    // ── 2b. 一级节点（实心椭圆）─────────────────────────
    elements.push(
      createEllipse({
        x: bx - L1_W / 2,
        y: by - L1_H / 2,
        width: L1_W,
        height: L1_H,
        strokeColor: color,
        fillColor: satColor,
        strokeWidth: 4,
      })
    );
    elements.push(
      createText({
        x: bx - L1_W / 2,
        y: by - 13,
        text: branch.emoji ? `${branch.emoji} ${branch.label}` : branch.label,
        fontSize: 17,
        color: "#ffffff",
        width: L1_W,
        textAlign: "center",
      })
    );

    // ── 2c. 二级子节点 ─────────────────────────────────
    const branchLeaves = leaves.filter((l) => l.parent === branch.id);
    if (branchLeaves.length === 0) return;

    const leafSpread = Math.min(
      Math.PI * 0.65,
      branchLeaves.length * MIN_LEAF_ANGLE
    );
    const leafStart = angle - leafSpread / 2;
    const leafStep = branchLeaves.length > 1 ? leafSpread / (branchLeaves.length - 1) : 0;

    branchLeaves.forEach((leaf, j) => {
      const lAngle = branchLeaves.length === 1 ? angle : leafStart + j * leafStep;
      const lx = bx + Math.cos(lAngle) * LEAF_RADIUS;
      const ly = by + Math.sin(lAngle) * LEAF_RADIUS;

      // 细曲线连接
      elements.push(
        createLine({
          points: [
            [bx + Math.cos(lAngle) * L1_W * 0.5, by + Math.sin(lAngle) * L1_H * 0.5],
            [lx - Math.cos(lAngle) * L2_W * 0.5, ly - Math.sin(lAngle) * L2_H * 0.5],
          ],
          strokeColor: color,
          strokeWidth: 4,
        })
      );

      // 二级节点（圆角矩形，颜色稍淡）
      elements.push(
        createRoundedRect({
          x: lx - L2_W / 2,
          y: ly - L2_H / 2,
          width: L2_W,
          height: L2_H,
          strokeColor: color,
          fillColor: satColor,
          strokeWidth: 3,
        })
      );
      elements.push(
        createText({
          x: lx - L2_W / 2,
          y: ly - 11,
          text: leaf.label,
          fontSize: 14,
          color: "#ffffff",
          width: L2_W,
          textAlign: "center",
        })
      );
    });
  });

  return elements;
}
