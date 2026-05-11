/**
 * 头脑图/放射状布局引擎 v4
 *
 * 核心修复：末端节点防重叠
 * - 动态计算最小不重叠半径：当叶子数量增多时，自动扩大 LEAF_RADIUS
 * - 三级节点同样做防重叠处理
 * - 一级分支过多时，自动扩大 BRANCH_RADIUS
 */
import type { DiagramData, DiagramNode } from "../types";
import { getBranchColor, getSolidBubbleColor, CENTER_COLORS } from "../colorPalettes";
import {
  createEllipse,
  createRoundedRect,
  createLine,
  createText,
} from "../helpers/excalidrawFactory";

// ── 布局常量 ──────────────────────────────────────────────────
const CENTER_RX = 90;
const CENTER_RY = 65;
const BASE_BRANCH_RADIUS = 340;  // 一级节点基础半径
const BASE_LEAF_RADIUS   = 200;  // 二级节点基础半径
const BASE_LEAF_RADIUS_3 = 170;  // 三级节点基础半径
const L1_W = 160;
const L1_H = 65;
const L2_W = 140;
const L2_H = 48;
const L3_W = 120;
const L3_H = 40;
const NODE_GAP = 24;             // 节点之间最小间距（px）

// ── 辅助：根据父节点 id 获取直接子节点 ─────────────────────
function childrenOf(nodes: DiagramNode[], parentId: string): DiagramNode[] {
  return nodes.filter((n) => n.parent === parentId);
}

/**
 * 核心防重叠函数：计算 N 个节点在放射状布局下，不重叠所需的最小半径
 *
 * 原理：N 个节点均匀分布在 totalSpread 弧度范围内，
 * 相邻两节点的弦长必须 >= nodeSize + GAP
 * 弦长 = 2R * sin(angleStep/2) ≈ R * angleStep（小角近似）
 * 所以 minR = (nodeSize + GAP) / angleStep
 */
function calcSafeRadius(
  count: number,
  totalSpreadRad: number,
  nodeSize: number,  // 节点宽度（或节点在该方向的投影尺寸）
  baseRadius: number,
  gap: number = NODE_GAP
): number {
  if (count <= 1) return baseRadius;
  const angleStep = totalSpreadRad / (count - 1);
  const minRadius = (nodeSize + gap) / Math.max(angleStep, 0.01);
  return Math.max(baseRadius, Math.ceil(minRadius));
}

// ── 主入口 ──────────────────────────────────────────────────
export function layoutMindmap(data: DiagramData): any[] {
  const elements: any[] = [];
  const allNodes = data.nodes;

  const root = allNodes.find((n) => n.level === 0);
  if (!root) return elements;

  const branches = allNodes.filter(
    (n) => n.level === 1 || (n.parent === root.id && n.level !== 0)
  );

  const cx = 0, cy = 0;

  // ── 一级分支防重叠：分支太多时扩大 BRANCH_RADIUS ──────────
  // 相邻分支间距至少要放下 L1_W + GAP
  const branchAngleStep = branches.length > 0 ? (2 * Math.PI) / branches.length : Math.PI;
  const branchRadius = calcSafeRadius(
    branches.length,
    2 * Math.PI,  // 360° 全圆
    L1_W,
    BASE_BRANCH_RADIUS
  );

  // ── 1. 中心节点 ──────────────────────────────────────────
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

  const startAngle = -Math.PI / 2;

  branches.forEach((branch, i) => {
    const angle = startAngle + i * branchAngleStep;
    const color = getBranchColor(i);
    const satColor = getSolidBubbleColor(i);

    // 一级节点位置
    const bx = cx + Math.cos(angle) * branchRadius;
    const by = cy + Math.sin(angle) * branchRadius;

    // ── 2a. 粗曲线分支（9px）─────────────────────────────
    const midDist = branchRadius * 0.5;
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

    // ── 2c. 二级子节点（防重叠版）────────────────────────
    const level2Leaves = childrenOf(allNodes, branch.id);
    if (level2Leaves.length === 0) return;

    // 可用扩散角度（不超过相邻分支间夹角的 70%，避免跑到别的分支方向上）
    const maxSpread = Math.min(Math.PI * 0.7, branchAngleStep * 0.7);
    const targetSpread = Math.min(maxSpread, level2Leaves.length * 0.42);

    // 防重叠：动态计算二级节点不重叠所需最小半径
    const leafRadius = calcSafeRadius(
      level2Leaves.length,
      targetSpread,
      L2_W,
      BASE_LEAF_RADIUS
    );

    const leafStart = angle - targetSpread / 2;
    const leafStep = level2Leaves.length > 1 ? targetSpread / (level2Leaves.length - 1) : 0;

    level2Leaves.forEach((leaf, j) => {
      const lAngle = level2Leaves.length === 1 ? angle : leafStart + j * leafStep;
      const lx = bx + Math.cos(lAngle) * leafRadius;
      const ly = by + Math.sin(lAngle) * leafRadius;

      // 连线
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

      // 二级节点（圆角矩形）
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

      // ── 2d. 三级子节点（防重叠版）──────────────────────
      const level3Leaves = childrenOf(allNodes, leaf.id);
      if (level3Leaves.length === 0) return;

      const l3MaxSpread = Math.min(Math.PI * 0.45, targetSpread * 0.6);
      const l3TargetSpread = Math.min(l3MaxSpread, level3Leaves.length * 0.35);

      // 三级节点防重叠半径
      const l3Radius = calcSafeRadius(
        level3Leaves.length,
        l3TargetSpread,
        L3_W,
        BASE_LEAF_RADIUS_3
      );

      const l3Start = lAngle - l3TargetSpread / 2;
      const l3Step = level3Leaves.length > 1 ? l3TargetSpread / (level3Leaves.length - 1) : 0;

      level3Leaves.forEach((l3node, k) => {
        const l3Angle = level3Leaves.length === 1 ? lAngle : l3Start + k * l3Step;
        const l3x = lx + Math.cos(l3Angle) * l3Radius;
        const l3y = ly + Math.sin(l3Angle) * l3Radius;

        elements.push(
          createLine({
            points: [
              [lx + Math.cos(l3Angle) * L2_W * 0.5, ly + Math.sin(l3Angle) * L2_H * 0.5],
              [l3x - Math.cos(l3Angle) * L3_W * 0.5, l3y - Math.sin(l3Angle) * L3_H * 0.5],
            ],
            strokeColor: color,
            strokeWidth: 3,
          })
        );
        elements.push(
          createRoundedRect({
            x: l3x - L3_W / 2,
            y: l3y - L3_H / 2,
            width: L3_W,
            height: L3_H,
            strokeColor: color,
            fillColor: "#ffffff",
            strokeWidth: 2,
          })
        );
        elements.push(
          createText({
            x: l3x - L3_W / 2,
            y: l3y - 10,
            text: l3node.label,
            fontSize: 12,
            color: color,
            width: L3_W,
            textAlign: "center",
          })
        );
      });
    });
  });

  return elements;
}
