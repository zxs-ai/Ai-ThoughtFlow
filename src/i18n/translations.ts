export type Lang = "zh-CN" | "en";

export interface TranslationDict {
  // TitleBar
  titleBar: {
    collapseSidebar: string;
    expandSidebar: string;
    settings: string;
  };
  // Sidebar / DiagramTypeSelector
  sidebar: {
    expandSidebar: string;
    diagramType: string;
    replace: string;
    append: string;
    importGenerate: string;
    enterCodeFirst: string;
    switchTypeConfirm: string;
  };
  // ChatArea
  chat: {
    title: string;
    clearChat: string;
    emptyHint: string;
    noApiKey: string;
    placeholder: string;
    inputHint: string;
    generating: string;
    send: string;
    error: string;
    requestFailed: string;
    // History
    historyTitle: string;
    closeHistory: string;
    historyEmpty: string;
    untitled: string;
    messages: string;
    deleteSession: string;
    // Clear dialog
    clearTitle: string;
    clearDesc: string;
    clearSave: string;
    clearDelete: string;
    clearCancel: string;
  };
  // CodeEditor
  codeEditor: {
    title: string;
    placeholder: string;
    confirm: string;
    cancel: string;
  };
  // Settings
  settings: {
    title: string;
    modelConfig: string;
    apiProvider: string;
    apiKey: string;
    apiKeyPlaceholder: string;
    apiBaseUrl: string;
    modelName: string;
    modelNamePlaceholder: string;
    custom: string;
    testing: string;
    testConnection: string;
    connectionSuccess: string;
    connectionFailed: string;
    about: string;
    mitLicense: string;
    developer: string;
    basedOn: string;
    originalProject: string;
    starHint: string;
    language: string;
    languageLabel: string;
  };
  // StatusBar
  statusBar: {
    model: string;
    generating: string;
    elements: string;
    theme: string;
    dark: string;
    light: string;
  };
  // Canvas
  canvas: {
    loadFailed: string;
    unknownError: string;
    retry: string;
    loading: string;
    converting: string;
    generated: string;
    conversionFailed: string;
    importFailed: string;
  };
  // Diagram types
  diagramTypes: {
    architecture: string;
    flowchart: string;
    mindmap: string;
    sequence: string;
    er: string;
    usecase: string;
    free: string;
  };
}

const zhCN: TranslationDict = {
  titleBar: {
    collapseSidebar: "折叠侧边栏 (Cmd+B)",
    expandSidebar: "展开侧边栏 (Cmd+B)",
    settings: "设置",
  },
  sidebar: {
    expandSidebar: "展开侧边栏",
    diagramType: "图表类型",
    replace: "替换",
    append: "追加",
    importGenerate: "📥 导入生成",
    enterCodeFirst: "请先输入 Mermaid 代码",
    switchTypeConfirm: "切换图表类型将清空当前对话，是否继续？",
  },
  chat: {
    title: "对话",
    clearChat: "清空对话",
    emptyHint: "输入描述，AI 将生成图表代码",
    noApiKey: "请先在设置中配置 API Key ⚙️",
    placeholder: "描述图表... (Enter 发送，Option+Enter 换行)",
    inputHint: "Enter 发送 · Option+Enter 换行",
    generating: "生成中...",
    send: "发送",
    error: "错误",
    requestFailed: "请求失败",
    historyTitle: "历史对话",
    closeHistory: "关闭历史",
    historyEmpty: "近 1 个月内暂无历史对话",
    untitled: "无标题对话",
    messages: "条消息",
    deleteSession: "删除此对话",
    clearTitle: "清空对话",
    clearDesc: "是否将当前对话保存到历史记录？\n若选择不保存，当前对话将被彻底删除。",
    clearSave: "✅ 保存到历史并清空",
    clearDelete: "🗑️ 不保存，直接删除",
    clearCancel: "取消",
  },
  codeEditor: {
    title: "Mermaid 代码",
    placeholder: "AI 生成的 Mermaid 代码将显示在这里，您也可以手动编辑...",
    confirm: "确认",
    cancel: "取消",
  },
  settings: {
    title: "设置",
    modelConfig: "模型配置",
    apiProvider: "API 服务商",
    apiKey: "API Key",
    apiKeyPlaceholder: "输入您的 API Key",
    apiBaseUrl: "API Base URL",
    modelName: "模型名称",
    modelNamePlaceholder: "模型名称",
    custom: "自定义...",
    testing: "测试中...",
    testConnection: "🔍 测试连接",
    connectionSuccess: "✅ 连接成功",
    connectionFailed: "❌ 连接失败",
    about: "关于",
    mitLicense: "MIT License",
    developer: "开发者",
    basedOn: "本项目基于以下开源组件二次开发:",
    originalProject: "原始项目: ExcaliDraw AI by zz (MIT License)",
    starHint: "⭐ 如果觉得有用，请给个 Star！",
    language: "语言",
    languageLabel: "界面语言",
  },
  statusBar: {
    model: "模型",
    generating: "生成中...",
    elements: "元素",
    theme: "主题",
    dark: "暗色",
    light: "亮色",
  },
  canvas: {
    loadFailed: "画布加载失败",
    unknownError: "未知错误",
    retry: "重试",
    loading: "画布加载中...",
    converting: "⏳ 正在转换 Mermaid 图表...",
    generated: "✅ 图表已生成",
    conversionFailed: "❌ 图表转换失败",
    importFailed: "❌ 导入失败",
  },
  diagramTypes: {
    architecture: "🏗️ 架构图",
    flowchart: "📊 流程图",
    mindmap: "🗺️ 思维导图",
    sequence: "🔄 时序图",
    er: "📋 ER 图",
    usecase: "🎯 用例图",
    free: "✨ 智能自动",
  },
};

const en: TranslationDict = {
  titleBar: {
    collapseSidebar: "Collapse Sidebar (Cmd+B)",
    expandSidebar: "Expand Sidebar (Cmd+B)",
    settings: "Settings",
  },
  sidebar: {
    expandSidebar: "Expand Sidebar",
    diagramType: "Diagram Type",
    replace: "Replace",
    append: "Append",
    importGenerate: "📥 Import & Generate",
    enterCodeFirst: "Please enter Mermaid code first",
    switchTypeConfirm:
      "Switching diagram type will clear the current conversation. Continue?",
  },
  chat: {
    title: "Chat",
    clearChat: "Clear Chat",
    emptyHint: "Describe what you want, AI will generate diagram code",
    noApiKey: "Please configure API Key in Settings first ⚙️",
    placeholder: "Describe your diagram... (Enter to send, Option+Enter for newline)",
    inputHint: "Enter to send · Option+Enter for newline",
    generating: "Generating...",
    send: "Send",
    error: "Error",
    requestFailed: "Request failed",
    historyTitle: "History",
    closeHistory: "Close History",
    historyEmpty: "No conversations in the past month",
    untitled: "Untitled",
    messages: "messages",
    deleteSession: "Delete this session",
    clearTitle: "Clear Chat",
    clearDesc: "Save this conversation to history before clearing?\nIf not saved, it will be permanently deleted.",
    clearSave: "✅ Save to History & Clear",
    clearDelete: "🗑️ Delete Without Saving",
    clearCancel: "Cancel",
  },
  codeEditor: {
    title: "Mermaid Code",
    placeholder: "AI-generated Mermaid code will appear here, you can also edit manually...",
    confirm: "Confirm",
    cancel: "Cancel",
  },
  settings: {
    title: "Settings",
    modelConfig: "Model Configuration",
    apiProvider: "API Provider",
    apiKey: "API Key",
    apiKeyPlaceholder: "Enter your API Key",
    apiBaseUrl: "API Base URL",
    modelName: "Model Name",
    modelNamePlaceholder: "Model name",
    custom: "Custom...",
    testing: "Testing...",
    testConnection: "🔍 Test Connection",
    connectionSuccess: "✅ Connection Successful",
    connectionFailed: "❌ Connection Failed",
    about: "About",
    mitLicense: "MIT License",
    developer: "Developer",
    basedOn: "This project is based on the following open source components:",
    originalProject: "Original project: ExcaliDraw AI by zz (MIT License)",
    starHint: "⭐ Star this project if you find it useful!",
    language: "Language",
    languageLabel: "Interface Language",
  },
  statusBar: {
    model: "Model",
    generating: "Generating...",
    elements: "Elements",
    theme: "Theme",
    dark: "Dark",
    light: "Light",
  },
  canvas: {
    loadFailed: "Canvas Load Failed",
    unknownError: "Unknown error",
    retry: "Retry",
    loading: "Loading canvas...",
    converting: "⏳ Converting Mermaid diagram...",
    generated: "✅ Diagram generated",
    conversionFailed: "❌ Diagram conversion failed",
    importFailed: "❌ Import failed",
  },
  diagramTypes: {
    architecture: "🏗️ Architecture",
    flowchart: "📊 Flowchart",
    mindmap: "🗺️ Mind Map",
    sequence: "🔄 Sequence",
    er: "📋 ER Diagram",
    usecase: "🎯 Use Case",
    free: "✨ Auto (AI picks best)",
  },
};

export const translations: Record<Lang, TranslationDict> = { "zh-CN": zhCN, en };
