/**
 * 头脑图/放射状布局引擎
 *
 * 复刻参考图片风格：中心大节点 → 多色有机曲线分支 → 椭圆/云朵子节点
 * 布局算法：极坐标放射 + 自动间距计算
 */
import type { DiagramData } from "../types";
import { getBranchColor, getNodeFill, CENTER_COLORS } from "../colorPalettes";
import {
  createLabeledEllipse,
  createLabeledRect,
  createLine,
} from "../helpers/excalidrawFactory";

// ── 布局常量 ────────────────────────────────────────────────────────

const CENTER_RX = 100;          // 中心节点椭圆半径 X
const CENTER_RY = 70;           // 中心节点椭圆半径 Y
const BRANCH_RADIUS = 280;     // 一级分支到中心距离
const LEAF_RADIUS = 170;       // 二级节点到一级节点距离
const L1_NODE_W = 150;         // 一级节点宽
const L1_NODE_H = 60;          // 一级节点高
const L2_NODE_W = 130;         // 二级节点宽
const L2_NODE_H = 50;          // 二级节点高
const MIN_ANGLE_GAP = 0.35;    // 分支间最小角度间距(弧度)

// ── 主入口 ──────────────────────────────────────────────────────────

export function layoutMindmap(data: DiagramData): any[] {
  const elements: any[] = [];

  // 解析节点层级
  const root = data.nodes.find((n) => n.level === 0);
  if (!root) return elements;

  const branches = data.nodes.filter((n) => n.level === 1);
  const leaves = data.nodes.filter((n) => n.level === 2);

  // 中心坐标
  const cx = 0;
  const cy = 0;

  // ── 1. 绘制中心节点（大椭圆）──────────────────────────────────
  const centerW = CENTER_RX * 2;
  const centerH = CENTER_RY * 2;
  const centerLabel = root.emoji ? `${root.emoji} ${root.label}` : `📌 ${root.label}`;

  elements.push(
    ...createLabeledEllipse({
      x: cx - CENTER_RX,
      y: cy - CENTER_RY,
      width: centerW,
      height: centerH,
      label: centerLabel,
      strokeColor: CENTER_COLORS.stroke,
      fillColor: CENTER_COLORS.fill,
      fontSize: 26,
      textColor: CENTER_COLORS.text,
      strokeWidth: 4,
    })
  );

  // ── 2. 计算分支角度（均匀分布） ────────────────────────────────
  const branchCount = branches.length;
  if (branchCount === 0) return elements;

  const angleStep = (2 * Math.PI) / branchCount;
  // 起始角度偏移，让第一个分支在右上方
  const startAngle = -Math.PI / 2 - angleStep / 2;

  branches.forEach((branch, i) => {
    const angle = startAngle + i * angleStep;
    const branchColor = getBranchColor(i);
    const fillColor = getNodeFill(i);

    // 一级节点位置
    const bx = cx + Math.cos(angle) * BRANCH_RADIUS;
    const by = cy + Math.sin(angle) * BRANCH_RADIUS;

    // ── 2a. 中心 → 一级分支 连线（粗曲线）────────────────────
    // 用贝塞尔风格的两段线模拟有机曲线
    const midX = cx + Math.cos(angle) * (BRANCH_RADIUS * 0.5);
    const midY = cy + Math.sin(angle) * (BRANCH_RADIUS * 0.5);
    // 添加垂直偏移让曲线更有机
    const perpAngle = angle + Math.PI / 2;
    const curveOffset = 20 + Math.random() * 15;
    const ctrlX = midX + Math.cos(perpAngle) * curveOffset;
    const ctrlY = midY + Math.sin(perpAngle) * curveOffset;

    elements.push(
      createLine({
        points: [
          [cx, cy],
          [ctrlX, ctrlY],
          [bx, by],
        ],
        strokeColor: branchColor,
        strokeWidth: 5,
      })
    );

    // ── 2b. 一级节点（椭圆） ────────────────────────────────
    elements.push(
      ...createLabeledEllipse({
        x: bx - L1_NODE_W / 2,
        y: by - L1_NODE_H / 2,
        width: L1_NODE_W,
        height: L1_NODE_H,
        label: branch.emoji ? `${branch.emoji} ${branch.label}` : branch.label,
        strokeColor: branchColor,
        fillColor,
        fontSize: 20,
        strokeWidth: 3,
      })
    );

    // ── 2c. 该分支的二级子节点 ──────────────────────────────
    const branchLeaves = leaves.filter((l) => l.parent === branch.id);
    if (branchLeaves.length === 0) return;

    const leafAngleSpread = Math.min(
      Math.PI * 0.6,
      branchLeaves.length * MIN_ANGLE_GAP
    );
    const leafStartAngle = angle - leafAngleSpread / 2;
    const leafStep =
      branchLeaves.length > 1
        ? leafAngleSpread / (branchLeaves.length - 1)
        : 0;

    branchLeaves.forEach((leaf, j) => {
      const leafAngle =
        branchLeaves.length === 1
          ? angle
          : leafStartAngle + j * leafStep;

      const lx = bx + Math.cos(leafAngle) * LEAF_RADIUS;
      const ly = by + Math.sin(leafAngle) * LEAF_RADIUS;

      // 子节点连线
      elements.push(
        createLine({
          points: [
            [bx, by],
            [lx, ly],
          ],
          strokeColor: branchColor,
          strokeWidth: 2,
        })
      );

      // 子节点（圆角矩形）
      elements.push(
        ...createLabeledRect({
          x: lx - L2_NODE_W / 2,
          y: ly - L2_NODE_H / 2,
          width: L2_NODE_W,
          height: L2_NODE_H,
          label: leaf.emoji ? `${leaf.emoji} ${leaf.label}` : leaf.label,
          strokeColor: branchColor,
          fillColor,
          fontSize: 16,
          strokeWidth: 2,
        })
      );
    });
  });

  return elements;
}
