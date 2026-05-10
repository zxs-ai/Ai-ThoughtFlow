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
 * 修改型关键词：添加/删除/移动/改名/修改/更新/把XX改成YY/在XX下面加...
 * 新建型关键词：画一个/生成/创建/做一个...
 */
export function isModificationRequest(userInput: string, hasExistingDiagram: boolean): boolean {
  if (!hasExistingDiagram) return false;

  const modifyKeywords = [
    "添加", "加上", "加入", "新增", "增加",
    "删除", "删掉", "去掉", "移除",
    "修改", "更改", "改成", "改为", "换成",
    "移动", "移到", "放到",
    "在.+下面", "在.+上面", "在.+旁边",
    "把.+改", "把.+删", "把.+加", "把.+移",
    "颜色", "样式", "风格",
    "多加", "补充", "细化", "展开",
  ];

  const modifyPattern = new RegExp(modifyKeywords.join("|"), "i");
  return modifyPattern.test(userInput);
}

/**
 * 构建带上下文记忆的 system prompt 片段
 * 当存在现有图表时，将其结构注入 prompt 中
 */
export function buildContextPrompt(): string {
  const { currentDiagram } = memoryState;
  if (!currentDiagram) return "";

  return `

【当前画布上的图表结构】
用户画布上已有一个图表，其结构如下：
\`\`\`json
${JSON.stringify(currentDiagram, null, 2)}
\`\`\`

如果用户要求修改（如添加节点、删除节点、改名、调整结构等），
请在上述 JSON 基础上进行修改，输出完整的修改后 JSON。
保持未提及的节点不变，仅修改用户要求的部分。
`;
}
