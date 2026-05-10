/**
 * 教育卡通风格色板 v2
 * 完全对标参考图片：高饱和、实心颜色、对比鲜明
 */

/**
 * 实心卫星颜色（气泡图、思维导图卫星节点）
 * 参考图：粉红、橙、蓝绿、蓝、绿、紫 纯色实心圆
 */
export const SOLID_BUBBLE_COLORS = [
  "#FF6B9D",  // 粉红
  "#FF9F43",  // 暖橙
  "#4FC3F7",  // 天蓝
  "#69DB7C",  // 草绿
  "#B39DDB",  // 薰衣草紫
  "#FFD43B",  // 向日葵黄
  "#26C6DA",  // 青蓝
  "#FF7043",  // 珊瑚橙
  "#A5D6A7",  // 薄荷绿
  "#CE93D8",  // 粉紫
] as const;

/**
 * 分支线描边颜色（思维导图线条）
 * 参考图：粗线条，每条分支一个鲜亮颜色
 */
export const BRANCH_COLORS = [
  "#E74C3C",  // 活力红
  "#2ECC71",  // 翠绿
  "#3498DB",  // 天空蓝
  "#F39C12",  // 向日葵橙
  "#9B59B6",  // 紫罗兰
  "#1ABC9C",  // 宝石绿
  "#E91E63",  // 玫红
  "#FF9800",  // 橘色
] as const;

/** 圆圈图外圈颜色 */
export const RING_COLORS = [
  { stroke: "#F39C12", fill: "#FFF9C4" },
  { stroke: "#E91E63", fill: "#FCE4EC" },
];

/** 中心节点专用色（气泡图用大粉红实心圆） */
export const CENTER_COLORS = {
  stroke: "#E91E63",
  fill: "#FF6B9D",
  text: "#ffffff",
} as const;

/** 共有节点色（双气泡图） */
export const SHARED_COLORS = {
  stroke: "#E91E63",
  fill: "#FF6B9D",
  text: "#ffffff",
} as const;

/** 箭头/连线颜色 */
export const ARROW_COLOR = "#5C6BC0";

/** 获取实心气泡颜色（循环取色） */
export function getSolidBubbleColor(index: number): string {
  return SOLID_BUBBLE_COLORS[index % SOLID_BUBBLE_COLORS.length];
}

/** 获取分支颜色 */
export function getBranchColor(index: number): string {
  return BRANCH_COLORS[index % BRANCH_COLORS.length];
}

/** 获取节点填充色（兼容旧接口，返回实心颜色） */
export function getNodeFill(index: number): string {
  return SOLID_BUBBLE_COLORS[index % SOLID_BUBBLE_COLORS.length];
}

/** 获取分支配色（描边+填充） */
export function getBranchPalette(index: number): { stroke: string; fill: string } {
  const color = SOLID_BUBBLE_COLORS[index % SOLID_BUBBLE_COLORS.length];
  return { stroke: color, fill: color };
}
