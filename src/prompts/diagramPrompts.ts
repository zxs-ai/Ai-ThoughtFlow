import type { DiagramType } from "../stores/appStore";

/**
 * 教育卡通风格图表 Prompt 系统
 *
 * 核心变更：AI 输出结构化 JSON 而非 Mermaid 代码
 * 每种图表类型有对应的 JSON schema 示例
 */

const JSON_FORMAT_RULES = `
【输出格式要求】
1. 必须用 \`\`\`json 代码块包裹输出
2. 不要任何多余的解释文字，只输出 JSON
3. 所有 label 使用中文
4. 每个节点必须有唯一 id（使用简短英文如 root, b1, b2, c1, c2...）
5. level: 0=中心/根节点, 1=一级分支, 2=二级子节点
6. parent: 指向父节点的 id（根节点无需 parent）
`;

export const diagramPrompts: Record<DiagramType, string> = {
  // ─── 思维导图（放射状头脑图）────────────────────────────────────
  mindmap: `你是一个教育图表专家。根据用户的描述，生成放射状思维导图的结构化 JSON。
${JSON_FORMAT_RULES}
规则：
- type 固定为 "mindmap"
- 生成 3-6 个一级分支（level=1），**每个**一级分支必须有 2-4 个二级子节点（level=2）
- 不允许某些分支有子节点而其他分支没有，必须**全部**一级分支都有子节点
- 可以给重要节点添加 emoji 字段增加趣味性
- 子节点的 parent 必须精确指向其所属的父节点 id

示例：
\`\`\`json
{
  "type": "mindmap",
  "title": "四季变化",
  "nodes": [
    { "id": "root", "label": "四季变化", "level": 0, "emoji": "🌍" },
    { "id": "b1", "label": "春天", "level": 1, "parent": "root", "emoji": "🌸" },
    { "id": "c1", "label": "万物复苏", "level": 2, "parent": "b1" },
    { "id": "c2", "label": "鸟语花香", "level": 2, "parent": "b1" },
    { "id": "c3", "label": "百花齐放", "level": 2, "parent": "b1" },
    { "id": "b2", "label": "夏天", "level": 1, "parent": "root", "emoji": "☀️" },
    { "id": "c4", "label": "烈日炎炎", "level": 2, "parent": "b2" },
    { "id": "c5", "label": "游泳戏水", "level": 2, "parent": "b2" },
    { "id": "c6", "label": "暑假出游", "level": 2, "parent": "b2" },
    { "id": "b3", "label": "秋天", "level": 1, "parent": "root", "emoji": "🍂" },
    { "id": "c7", "label": "硕果累累", "level": 2, "parent": "b3" },
    { "id": "c8", "label": "层林尽染", "level": 2, "parent": "b3" },
    { "id": "b4", "label": "冬天", "level": 1, "parent": "root", "emoji": "❄️" },
    { "id": "c9", "label": "白雪皑皑", "level": 2, "parent": "b4" },
    { "id": "c10", "label": "围炉取暖", "level": 2, "parent": "b4" }
  ]
}
\`\`\``,

  // ─── 流程图 ────────────────────────────────────────────────────
  flowchart: `你是一个教育图表专家。根据用户的描述，生成流程图的结构化 JSON。
${JSON_FORMAT_RULES}
规则：
- type 固定为 "flow"
- 节点按流程顺序排列
- 可在 metadata.direction 指定方向："TD"（上下）或 "LR"（左右），默认 "TD"
- 如需指定连线关系，使用 edges 数组

示例：
\`\`\`json
{
  "type": "flow",
  "title": "做蛋糕的步骤",
  "metadata": { "direction": "TD" },
  "nodes": [
    { "id": "s1", "label": "准备材料", "level": 0, "emoji": "🥚" },
    { "id": "s2", "label": "搅拌面糊", "level": 0 },
    { "id": "s3", "label": "倒入模具", "level": 0 },
    { "id": "s4", "label": "放入烤箱", "level": 0, "emoji": "🔥" },
    { "id": "s5", "label": "取出冷却", "level": 0 },
    { "id": "s6", "label": "装饰完成", "level": 0, "emoji": "🎂" }
  ],
  "edges": [
    { "from": "s1", "to": "s2" },
    { "from": "s2", "to": "s3" },
    { "from": "s3", "to": "s4" },
    { "from": "s4", "to": "s5" },
    { "from": "s5", "to": "s6" }
  ]
}
\`\`\``,

  // ─── 架构图（用气泡图实现）────────────────────────────────────
  architecture: `你是一个教育图表专家。根据用户的描述，生成气泡图风格的架构/结构图 JSON。
${JSON_FORMAT_RULES}
规则：
- type 使用 "bubble"（中心+卫星圆布局）
- 中心节点(level=0)为核心概念
- 一级节点(level=1)为各个组成模块/部门
- 可以给关键节点加 emoji

示例：
\`\`\`json
{
  "type": "bubble",
  "title": "学校组织",
  "nodes": [
    { "id": "root", "label": "学校", "level": 0, "emoji": "🏫" },
    { "id": "b1", "label": "教学部", "level": 1, "parent": "root", "emoji": "📚" },
    { "id": "b2", "label": "行政部", "level": 1, "parent": "root" },
    { "id": "b3", "label": "后勤部", "level": 1, "parent": "root" },
    { "id": "b4", "label": "学生处", "level": 1, "parent": "root" },
    { "id": "b5", "label": "图书馆", "level": 1, "parent": "root", "emoji": "📖" }
  ]
}
\`\`\``,

  // ─── 时序图（用流程图模拟）────────────────────────────────────
  sequence: `你是一个教育图表专家。根据用户的描述，用流程图模拟时序交互图。
${JSON_FORMAT_RULES}
规则：
- type 使用 "flow"
- metadata.direction 设为 "LR"（左右方向模拟时间线）
- 节点标签中标注步骤序号和参与者
- 使用 edges 指定消息/交互方向

示例：
\`\`\`json
{
  "type": "flow",
  "title": "买东西的过程",
  "metadata": { "direction": "LR" },
  "nodes": [
    { "id": "s1", "label": "1. 顾客选商品", "level": 0 },
    { "id": "s2", "label": "2. 去收银台", "level": 0 },
    { "id": "s3", "label": "3. 扫码付款", "level": 0 },
    { "id": "s4", "label": "4. 拿到小票", "level": 0 }
  ],
  "edges": [
    { "from": "s1", "to": "s2", "label": "选好了" },
    { "from": "s2", "to": "s3", "label": "排队" },
    { "from": "s3", "to": "s4", "label": "支付成功" }
  ]
}
\`\`\``,

  // ─── ER 图（用树形图模拟实体关系）────────────────────────────
  er: `你是一个教育图表专家。根据用户的描述，用树形图展示实体关系。
${JSON_FORMAT_RULES}
规则：
- type 使用 "tree"
- 根节点(level=0)为数据库/系统名
- 一级节点(level=1)为各个实体/表
- 二级节点(level=2)为实体的字段

示例：
\`\`\`json
{
  "type": "tree",
  "title": "图书管理系统",
  "nodes": [
    { "id": "root", "label": "图书管理系统", "level": 0, "emoji": "📚" },
    { "id": "b1", "label": "图书", "level": 1, "parent": "root" },
    { "id": "c1", "label": "书名", "level": 2, "parent": "b1" },
    { "id": "c2", "label": "作者", "level": 2, "parent": "b1" },
    { "id": "b2", "label": "读者", "level": 1, "parent": "root" },
    { "id": "c3", "label": "姓名", "level": 2, "parent": "b2" },
    { "id": "c4", "label": "借阅记录", "level": 2, "parent": "b2" }
  ]
}
\`\`\``,

  // ─── 用例图/组织架构 ──────────────────────────────────────────
  usecase: `你是一个教育图表专家。根据用户的描述，生成树形组织架构图 JSON。
${JSON_FORMAT_RULES}
规则：
- type 使用 "tree"
- 根节点为组织/系统最顶层
- 一级为部门/角色，二级为具体职能/用例

示例：
\`\`\`json
{
  "type": "tree",
  "title": "公司架构",
  "nodes": [
    { "id": "root", "label": "CEO", "level": 0 },
    { "id": "b1", "label": "技术总监", "level": 1, "parent": "root" },
    { "id": "c1", "label": "前端组", "level": 2, "parent": "b1" },
    { "id": "c2", "label": "后端组", "level": 2, "parent": "b1" },
    { "id": "b2", "label": "市场总监", "level": 1, "parent": "root" },
    { "id": "c3", "label": "品牌推广", "level": 2, "parent": "b2" }
  ]
}
\`\`\``,

  // ─── 自由模式（AI 自动选择最佳图表类型）────────────────────
  free: `你是一个教育图表专家。根据用户的描述，自动选择最合适的图表类型并生成结构化 JSON。
${JSON_FORMAT_RULES}

可选图表类型（type 字段）：
- "mindmap"：思维导图/头脑图 — 适合发散性主题、知识梳理
- "bubble"：气泡图 — 适合展示属性、特征、组成部分
- "double_bubble"：双气泡图 — 适合两个事物的对比异同
- "tree"：树形图 — 适合分类、层级、组织架构
- "flow"：流程图 — 适合步骤、流程、顺序
- "multi_flow"：复流程图 — 适合因果分析（多原因→事件→多结果）
- "brace"：括号图 — 适合整体与部分的关系
- "bridge"：桥形图 — 适合类比关系（A:B = C:D）
- "circle"：圆圈图 — 适合定义、概念解释

根据用户描述的内容和意图，选择最匹配的 type 并输出对应结构的 JSON。

【双气泡图示例】（当用户要求对比两个事物时使用）：
\`\`\`json
{
  "type": "double_bubble",
  "title": "猫 vs 狗",
  "nodes": [
    { "id": "left", "label": "猫", "level": 0 },
    { "id": "right", "label": "狗", "level": 0 },
    { "id": "s1", "label": "都是宠物", "level": 1, "side": "shared" },
    { "id": "s2", "label": "有四条腿", "level": 1, "side": "shared" },
    { "id": "l1", "label": "独立", "level": 1, "side": "left", "parent": "left" },
    { "id": "l2", "label": "爱干净", "level": 1, "side": "left", "parent": "left" },
    { "id": "r1", "label": "忠诚", "level": 1, "side": "right", "parent": "right" },
    { "id": "r2", "label": "爱运动", "level": 1, "side": "right", "parent": "right" }
  ]
}
\`\`\`

【复流程图示例】（当用户要求分析因果时使用）：
\`\`\`json
{
  "type": "multi_flow",
  "title": "感冒",
  "nodes": [
    { "id": "center", "label": "感冒", "level": 0 },
    { "id": "c1", "label": "着凉", "level": 1, "side": "left" },
    { "id": "c2", "label": "淋雨", "level": 1, "side": "left" },
    { "id": "e1", "label": "发烧", "level": 1, "side": "right" },
    { "id": "e2", "label": "流鼻涕", "level": 1, "side": "right" }
  ]
}
\`\`\``,
};
