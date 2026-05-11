/**
 * 上下文记忆系统
 *
 * 为 AI 提供当前图表结构的上下文，支持自然语言增量修改
 */
import type { DiagramData } from "../engine/types";

/** 上下文记忆状态 */
export interface ContextMemoryState {
  /** 当前画布上的图表结构（最近一次 AI 生成的） */
  currentDiagram: DiagramData | null;
  /** 上次修改时间 */
  lastModifiedAt: number;
}

// 内存级存储（不持久化，跟随 Session 生命周期）
let memoryState: ContextMemoryState = {
  currentDiagram: null,
  lastModifiedAt: 0,
};

/** 更新当前图表记忆 */
export function updateDiagramMemory(diagram: DiagramData): void {
  memoryState.currentDiagram = diagram;
  memoryState.lastModifiedAt = Date.now();
}

/** 获取当前记忆 */
export function getDiagramMemory(): ContextMemoryState {
  return memoryState;
}

/** 清除记忆（新对话时） */
export function clearDiagramMemory(): void {
  memoryState = {
    currentDiagram: null,
    lastModifiedAt: 0,
  };
}

/**
 * 判断用户输入是"新建图表"还是"修改现有图表"
 *
 * 策略：
 * - 如果有现有图表，默认倾向于"修改"（AI 会根据上下文判断）
 * - 只有明确新建关键词时才视为新建
 */
export function isModificationRequest(userInput: string, hasExistingDiagram: boolean): boolean {
  if (!hasExistingDiagram) return false;

  // 明确新建关键词 → 不注入上下文
  const newCreateKeywords = [
    "重新来", "重新画", "重新生成", "新建一个", "重画", "换一个主题",
    "全部清空", "清空图表", "从头开始",
  ];
  const isExplicitNew = new RegExp(newCreateKeywords.join("|"), "i").test(userInput);
  if (isExplicitNew) return false;

  // 其他情况：有现有图，都可能是修改意图 → 注入上下文让 AI 自行判断
  return true;
}

/**
 * 构建带上下文记忆的 system prompt 片段
 */
export function buildContextPrompt(): string {
  const { currentDiagram } = memoryState;
  if (!currentDiagram) return "";

  return `

【当前画布上已有图表】
用户画布上已有以下图表结构：
\`\`\`json
${JSON.stringify(currentDiagram, null, 2)}
\`\`\`

请根据用户的新输入判断：
- 如果用户要修改/调整/扩展该图表 → 在上述结构基础上修改，输出**完整的修改后 JSON**（不要只输出变化部分）
- 如果用户描述了全新的主题或明确要重新画 → 生成全新 JSON
- 保持未涉及的节点不变，仅修改用户要求的部分
`;
}

