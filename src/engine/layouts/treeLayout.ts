/**
 * 树形图布局引擎 v2
 *
 * 参考图：棕色树干 + 绿色轮廓云朵叶（无填充或浅填充），
 * 整体轮廓感强，不同于气泡图的实心风格
 */
import type { DiagramData } from "../types";
import { getBranchColor, getSolidBubbleColor } from "../colorPalettes";
import { createEllipse, createRoundedRect, createLine, createText } from "../helpers/excalidrawFactory";

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

  const branches = data.nodes.filter((n) => n.level === 1);
  const leaves = data.nodes.filter((n) => n.level === 2);

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

  const totalWidth = Math.max(branches.length * 210, 420);
  const startX = -totalWidth / 2;
  const branchY = rootY - 260;

  branches.forEach((branch, i) => {
    const bx = startX + (i + 0.5) * (totalWidth / branches.length);
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

    // 叶子节点
    const branchLeaves = leaves.filter((l) => l.parent === branch.id);
    if (branchLeaves.length === 0) return;

    const leafSpread = Math.max(branchLeaves.length * 148, 200);
    const leafStartX = bx - leafSpread / 2;
    const leafY = by - 180;

    branchLeaves.forEach((leaf, j) => {
      const lx = leafStartX + (j + 0.5) * (leafSpread / branchLeaves.length);
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
