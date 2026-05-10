/**
 * 教育卡通风格色板
 * 灵感来源：参考图片中的高饱和度、高对比多彩手绘风格
 */

/** 分支描边颜色 — 每条分支一个独立颜色，高饱和度 */
export const BRANCH_COLORS = [
  "#e74c3c",  // 活力红
  "#3498db",  // 天空蓝
  "#2ecc71",  // 翠绿
  "#f39c12",  // 向日葵橙
  "#9b59b6",  // 紫罗兰
  "#e91e63",  // 玫红
  "#00bcd4",  // 青蓝
  "#ff9800",  // 橘色
  "#8bc34a",  // 青草绿
  "#795548",  // 巧克力棕
] as const;

/** 节点填充色 — 淡雅半透明，与分支色搭配 */
export const NODE_FILLS = [
  "#fdecea",  // 淡红
  "#e3f2fd",  // 淡蓝
  "#e8f5e9",  // 薄荷绿
  "#fff3e0",  // 暖白橙
  "#f3e5f5",  // 淡紫
  "#fce4ec",  // 粉白
  "#e0f7fa",  // 冰蓝
  "#fff8e1",  // 奶油黄
  "#f1f8e9",  // 浅草绿
  "#efebe9",  // 暖灰棕
] as const;

/** 中心节点专用色 */
export const CENTER_COLORS = {
  stroke: "#1a73e8",   // 深蓝描边
  fill: "#e8f0fe",     // 浅蓝填充
  text: "#1a237e",     // 深蓝文字
} as const;

/** 共有节点色（双气泡图中间部分） */
export const SHARED_COLORS = {
  stroke: "#e91e63",   // 粉红描边
  fill: "#fce4ec",     // 淡粉填充
} as const;

/** 箭头/连线颜色 */
export const ARROW_COLOR = "#00bcd4";  // 青色（参考复流程图中的箭头色）

/** 获取分支颜色（循环取色） */
export function getBranchColor(index: number): string {
  return BRANCH_COLORS[index % BRANCH_COLORS.length];
}

/** 获取节点填充色（循环取色） */
export function getNodeFill(index: number): string {
  return NODE_FILLS[index % NODE_FILLS.length];
}

/**
 * 为指定分支索引生成配套的描边色+填充色
 */
export function getBranchPalette(index: number): { stroke: string; fill: string } {
  return {
    stroke: getBranchColor(index),
    fill: getNodeFill(index),
  };
}
