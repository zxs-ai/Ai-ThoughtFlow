/**
 * 统一数据模型 — AI 输出的结构化图表 JSON Schema
 * 所有布局引擎共享此数据结构
 */

/** 支持的卡通图表类型（9种思维导图形式） */
export type CartoonDiagramType =
  | "mindmap"        // 头脑图 (放射状)
  | "bubble"         // 气泡图
  | "double_bubble"  // 双气泡图
  | "tree"           // 树形图
  | "flow"           // 流程图
  | "multi_flow"     // 复流程图
  | "brace"          // 括号图
  | "bridge"         // 桥形图
  | "circle";        // 圆圈图

/** 图表节点 */
export interface DiagramNode {
  id: string;
  label: string;
  level: number;       // 0=中心, 1=一级, 2=二级...
  parent?: string;     // 父节点ID
  group?: string;      // 分组标记（双气泡图用: "left" | "right" | "shared"）
  side?: "left" | "right" | "shared";  // 双气泡图/复流程图用
  emoji?: string;      // 可选 emoji 装饰
}

/** 图表边（连线） */
export interface DiagramEdge {
  from: string;
  to: string;
  label?: string;
}

/** AI 输出的完整图表数据 */
export interface DiagramData {
  type: CartoonDiagramType;
  title: string;
  nodes: DiagramNode[];
  edges?: DiagramEdge[];
  metadata?: {
    context_a?: string;  // 双气泡图: 左侧主题
    context_b?: string;  // 双气泡图: 右侧主题
    direction?: "TD" | "LR";  // 流程图方向
  };
}

/** 布局引擎输出：带位置信息的节点 */
export interface PositionedNode extends DiagramNode {
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;         // 分支颜色（描边）
  fillColor: string;     // 填充色
  shape: "ellipse" | "rectangle" | "diamond" | "cloud" | "roundedRect";
}

/** 布局引擎输出：带路径信息的连线 */
export interface PositionedEdge extends DiagramEdge {
  points: [number, number][];  // 控制点（直线或贝塞尔）
  color: string;
  strokeWidth: number;
}

/** 布局引擎统一输出 */
export interface LayoutResult {
  nodes: PositionedNode[];
  edges: PositionedEdge[];
  /** 整体画布尺寸参考 */
  bounds: { width: number; height: number };
}
