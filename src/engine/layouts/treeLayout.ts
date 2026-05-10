/**
 * 树形图布局引擎
 *
 * 复刻参考图片风格：底部树干 → 向上分叉 → 云朵形叶子节点
 * 使用椭圆模拟云朵效果
 */
import type { DiagramData } from "../types";
import { getBranchColor, getNodeFill } from "../colorPalettes";
import { createLabeledEllipse, createLabeledRect, createLine } from "../helpers/excalidrawFactory";

const TRUNK_COLOR = "#795548";  // 棕色树干
const TRUNK_WIDTH = 6;
const ROOT_W = 160;
const ROOT_H = 80;
const BRANCH_W = 140;
const BRANCH_H = 55;
const LEAF_W = 120;
const LEAF_H = 45;

export function layoutTree(data: DiagramData): any[] {
  const elements: any[] = [];
  const root = data.nodes.find((n) => n.level === 0);
  if (!root) return elements;

  const branches = data.nodes.filter((n) => n.level === 1);
  const leaves = data.nodes.filter((n) => n.level === 2);

  // Root at bottom center
  const rootX = 0, rootY = 300;

  // Root node (trunk base)
  elements.push(
    ...createLabeledRect({
      x: rootX - ROOT_W / 2, y: rootY - ROOT_H / 2,
      width: ROOT_W, height: ROOT_H,
      label: root.emoji ? `${root.emoji} ${root.label}` : `🌳 ${root.label}`,
      strokeColor: TRUNK_COLOR, fillColor: "#efebe9",
      fontSize: 22, strokeWidth: 4,
    })
  );

  if (branches.length === 0) return elements;

  // Spread branches evenly across the top
  const totalWidth = Math.max(branches.length * 200, 400);
  const startX = -totalWidth / 2;
  const branchY = rootY - 250;  // Branches above root

  branches.forEach((branch, i) => {
    const bx = startX + (i + 0.5) * (totalWidth / branches.length);
    const by = branchY;
    const color = getBranchColor(i);
    const fill = getNodeFill(i);

    // Trunk line (root → branch)
    elements.push(
      createLine({
        points: [[rootX, rootY - ROOT_H / 2], [bx, by + BRANCH_H / 2]],
        strokeColor: TRUNK_COLOR,
        strokeWidth: TRUNK_WIDTH - i * 0.5,
      })
    );

    // Branch node (ellipse = cloud-like)
    elements.push(
      ...createLabeledEllipse({
        x: bx - BRANCH_W / 2, y: by - BRANCH_H / 2,
        width: BRANCH_W, height: BRANCH_H,
        label: branch.label,
        strokeColor: color, fillColor: fill,
        fontSize: 18, strokeWidth: 3,
      })
    );

    // Leaves for this branch
    const branchLeaves = leaves.filter((l) => l.parent === branch.id);
    if (branchLeaves.length === 0) return;

    const leafSpread = Math.max(branchLeaves.length * 140, 200);
    const leafStartX = bx - leafSpread / 2;
    const leafY = by - 180;

    branchLeaves.forEach((leaf, j) => {
      const lx = leafStartX + (j + 0.5) * (leafSpread / branchLeaves.length);
      const ly = leafY;

      // Branch → leaf line
      elements.push(
        createLine({
          points: [[bx, by - BRANCH_H / 2], [lx, ly + LEAF_H / 2]],
          strokeColor: color,
          strokeWidth: 2,
        })
      );

      // Leaf node
      elements.push(
        ...createLabeledEllipse({
          x: lx - LEAF_W / 2, y: ly - LEAF_H / 2,
          width: LEAF_W, height: LEAF_H,
          label: leaf.label,
          strokeColor: color, fillColor: fill,
          fontSize: 14, strokeWidth: 2,
        })
      );
    });
  });

  return elements;
}
