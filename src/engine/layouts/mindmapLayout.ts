/**
 * 头脑图/放射状布局引擎 v3
 *
 * 修复：支持多层级（level 0/1/2，以及3+的深层节点）
 * - level 0: 中心节点
 * - level 1: 一级分支（放射状椭圆）
 * - level 2: 二级叶子（圆角矩形）
 * - level 3+: 更深层叶子（小圆角矩形，追加在 level 2 之后）
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
const BRANCH_RADIUS = 340;     // 一级节点到中心距离
const LEAF_RADIUS = 190;       // 二级节点到一级距离
const L1_W = 160;
const L1_H = 65;
const L2_W = 140;
const L2_H = 48;
const L3_W = 120;
const L3_H = 40;
const LEAF_RADIUS_3 = 170;     // 三级节点到二级距离
const MIN_LEAF_ANGLE = 0.42;

// ── 辅助：根据父节点 id 获取直接子节点 ───────────────────────
function childrenOf(nodes: DiagramNode[], parentId: string): DiagramNode[] {
  return nodes.filter((n) => n.parent === parentId);
}

// ── 主入口 ──────────────────────────────────────────────────
export function layoutMindmap(data: DiagramData): any[] {
  const elements: any[] = [];
  const allNodes = data.nodes;

  const root = allNodes.find((n) => n.level === 0);
  if (!root) return elements;

  // 容错：如果 AI 没给 level，用 parent 关系推断
  // 找一级分支（直接 parent = root.id 的节点，或者 level=1 的节点）
  const branches = allNodes.filter(
    (n) => n.level === 1 || (n.parent === root.id && n.level !== 0)
  );

  const cx = 0, cy = 0;

  // ── 1. 中心节点 ────────────────────────────────────────
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

    // ── 2a. 粗曲线分支（9px）─────────────────────────────
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

    // ── 2c. 二级子节点 ────────────────────────────────────
    // 支持用 parent=branch.id 或 level=2 找到叶子
    const level2Leaves = childrenOf(allNodes, branch.id);
    if (level2Leaves.length === 0) return;

    const leafSpread = Math.min(
      Math.PI * 0.65,
      level2Leaves.length * MIN_LEAF_ANGLE
    );
    const leafStart = angle - leafSpread / 2;
    const leafStep = level2Leaves.length > 1 ? leafSpread / (level2Leaves.length - 1) : 0;

    level2Leaves.forEach((leaf, j) => {
      const lAngle = level2Leaves.length === 1 ? angle : leafStart + j * leafStep;
      const lx = bx + Math.cos(lAngle) * LEAF_RADIUS;
      const ly = by + Math.sin(lAngle) * LEAF_RADIUS;

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

      // ── 2d. 三级子节点（level 3+）──────────────────────
      const level3Leaves = childrenOf(allNodes, leaf.id);
      if (level3Leaves.length === 0) return;

      const l3Spread = Math.min(Math.PI * 0.4, level3Leaves.length * 0.35);
      const l3Start = lAngle - l3Spread / 2;
      const l3Step = level3Leaves.length > 1 ? l3Spread / (level3Leaves.length - 1) : 0;

      level3Leaves.forEach((l3node, k) => {
        const l3Angle = level3Leaves.length === 1 ? lAngle : l3Start + k * l3Step;
        const l3x = lx + Math.cos(l3Angle) * LEAF_RADIUS_3;
        const l3y = ly + Math.sin(l3Angle) * LEAF_RADIUS_3;

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
