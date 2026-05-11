/**
 * 树形图布局引擎 v2
 *
 * 参考图：棕色树干 + 绿色轮廓云朵叶（无填充或浅填充），
 * 整体轮廓感强，不同于气泡图的实心风格
 */
import type { DiagramData, DiagramNode } from "../types";
import { getBranchColor, getSolidBubbleColor } from "../colorPalettes";
import { createEllipse, createRoundedRect, createLine, createText } from "../helpers/excalidrawFactory";

function childrenOf(nodes: DiagramNode[], parentId: string): DiagramNode[] {
  return nodes.filter((n) => n.parent === parentId);
}

const TRUNK_COLOR = "#795548";
const ROOT_W = 170;
const ROOT_H = 72;
const BRANCH_W = 150;
const BRANCH_H = 58;
const LEAF_W = 128;
const LEAF_H = 46;

export function layoutTree(data: DiagramData): any[] {
  const elements: any[] = [];
  const root = data.nodes.find((n) => n.level === 0);
  if (!root) return elements;

  const branches = childrenOf(data.nodes, root.id);

  const rootX = 0, rootY = 320;

  // 根节点（棕色圆角矩形）
  elements.push(
    createRoundedRect({
      x: rootX - ROOT_W / 2, y: rootY - ROOT_H / 2,
      width: ROOT_W, height: ROOT_H,
      strokeColor: TRUNK_COLOR, fillColor: TRUNK_COLOR, strokeWidth: 4,
    })
  );
  elements.push(
    createText({
      x: rootX - ROOT_W / 2, y: rootY - 14,
      text: root.emoji ? `${root.emoji} ${root.label}` : `🌳 ${root.label}`,
      fontSize: 18, color: "#ffffff",
      width: ROOT_W, textAlign: "center",
    })
  );

  if (branches.length === 0) return elements;

  // ── 防重叠：先计算每个分支下叶子的最大宽度，确定列宽 ────────
  const LEAF_GAP = 20;   // 叶子节点间最小间距
  const BRANCH_GAP = 28; // 分支节点间最小间距

  // 每个分支列需要的最小宽度 = 叶子数 × (LEAF_W + LEAF_GAP)
  const columnWidths = branches.map((branch) => {
    const leaves = childrenOf(data.nodes, branch.id);
    if (leaves.length === 0) return BRANCH_W + BRANCH_GAP;
    return Math.max(leaves.length * (LEAF_W + LEAF_GAP), BRANCH_W + BRANCH_GAP);
  });

  const totalWidth = Math.max(columnWidths.reduce((a, b) => a + b, 0), branches.length * (BRANCH_W + BRANCH_GAP));
  const startX = -totalWidth / 2;
  const branchY = rootY - 260;

  // 每列的中心 X 坐标（按列宽累加）
  let xCursor = startX;
  const branchCenterXs = branches.map((_, i) => {
    const cx = xCursor + columnWidths[i] / 2;
    xCursor += columnWidths[i];
    return cx;
  });

  branches.forEach((branch, i) => {
    const bx = branchCenterXs[i];
    const by = branchY;
    const color = getBranchColor(i);
    const solid = getSolidBubbleColor(i);

    // 树干线（棕色粗线）
    elements.push(
      createLine({
        points: [[rootX, rootY - ROOT_H / 2], [bx, by + BRANCH_H / 2]],
        strokeColor: TRUNK_COLOR, strokeWidth: 6,
      })
    );

    // 分支节点（彩色实心椭圆）
    elements.push(
      createEllipse({
        x: bx - BRANCH_W / 2, y: by - BRANCH_H / 2,
        width: BRANCH_W, height: BRANCH_H,
        strokeColor: color, fillColor: solid, strokeWidth: 4,
      })
    );
    elements.push(
      createText({
        x: bx - BRANCH_W / 2, y: by - 13,
        text: branch.label, fontSize: 16, color: "#ffffff",
        width: BRANCH_W, textAlign: "center",
      })
    );

    // 叶子节点（防重叠：每列等分对齐）
    const branchLeaves = childrenOf(data.nodes, branch.id);
    if (branchLeaves.length === 0) return;

    // 叶子展开宽度 = 叶子数 × (LEAF_W + LEAF_GAP)，保证不重叠
    const leafSpread = Math.max(branchLeaves.length * (LEAF_W + LEAF_GAP), LEAF_W + LEAF_GAP);
    const leafStartX = bx - leafSpread / 2 + LEAF_W / 2;
    const leafY = by - 190;

    branchLeaves.forEach((leaf, j) => {
      const lx = leafStartX + j * (leafSpread / Math.max(branchLeaves.length, 1));
      const ly = leafY;

      elements.push(
        createLine({
          points: [[bx, by - BRANCH_H / 2], [lx, ly + LEAF_H / 2]],
          strokeColor: color, strokeWidth: 3,
        })
      );
      elements.push(
        createEllipse({
          x: lx - LEAF_W / 2, y: ly - LEAF_H / 2,
          width: LEAF_W, height: LEAF_H,
          strokeColor: color, fillColor: solid, strokeWidth: 3,
        })
      );
      elements.push(
        createText({
          x: lx - LEAF_W / 2, y: ly - 11,
          text: leaf.label, fontSize: 13, color: "#ffffff",
          width: LEAF_W, textAlign: "center",
        })
      );
    });
  });

  return elements;
}
