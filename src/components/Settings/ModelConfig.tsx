import React, { useState } from "react";
import { useAppStore } from "../../stores/appStore";
import { testConnection } from "../../services/llm";

const providers = [
  { key: "deepseek", name: "DeepSeek", baseUrl: "https://api.deepseek.com/v1", defaultModel: "deepseek-chat" },
  { key: "qwen", name: "通义千问 (Qwen)", baseUrl: "https://dashscope.aliyuncs.com/compatible-mode/v1", defaultModel: "qwen-max" },
  { key: "glm", name: "智谱 GLM", baseUrl: "https://open.bigmodel.cn/api/paas/v4", defaultModel: "glm-4" },
  { key: "openai", name: "OpenAI", baseUrl: "https://api.openai.com/v1", defaultModel: "gpt-4o" },
  { key: "kimi", name: "月之暗面 (Kimi)", baseUrl: "https://api.moonshot.cn/v1", defaultModel: "moonshot-v1-8k" },
  { key: "custom", name: "自定义...", baseUrl: "", defaultModel: "" },
];

export const ModelConfig: React.FC = () => {
  const { modelConfig, setModelConfig } = useAppStore();
  const [showKey, setShowKey] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<boolean | null>(null);

  const handleProviderChange = (key: string) => {
    const p = providers.find((x) => x.key === key);
    if (p) {
      setModelConfig({
        provider: key,
        baseUrl: p.baseUrl,
        modelName: p.defaultModel,
      });
    }
  };

  const handleTest = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const ok = await testConnection(modelConfig);
      setTestResult(ok);
    } catch {
      setTestResult(false);
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="settings-section">
      <h3>模型配置</h3>
      <div className="settings-field">
        <label>API 服务商</label>
        <select
          className="glass-select"
          value={modelConfig.provider}
          onChange={(e) => handleProviderChange(e.target.value)}
        >
          {providers.map((p) => (
            <option key={p.key} value={p.key}>
              {p.name}
            </option>
          ))}
        </select>
      </div>

      <div className="settings-field">
        <label>API Key</label>
        <div className="settings-input-row">
          <input
            className="glass-input"
            type={showKey ? "text" : "password"}
            value={modelConfig.apiKey}
            onChange={(e) => setModelConfig({ apiKey: e.target.value })}
            placeholder="输入您的 API Key"
          />
          <button className="glass-button" onClick={() => setShowKey(!showKey)}>
            {showKey ? "🙈" : "👁️"}
          </button>
        </div>
      </div>

      <div className="settings-field">
        <label>API Base URL</label>
        <input
          className="glass-input"
          type="text"
          value={modelConfig.baseUrl}
          onChange={(e) => setModelConfig({ baseUrl: e.target.value })}
          placeholder="https://..."
        />
      </div>

      <div className="settings-field">
        <label>模型名称</label>
        <input
          className="glass-input"
          type="text"
          value={modelConfig.modelName}
          onChange={(e) => setModelConfig({ modelName: e.target.value })}
          placeholder="模型名称"
          list="model-suggestions"
        />
        <datalist id="model-suggestions">
          <option value="deepseek-chat" />
          <option value="qwen-max" />
          <option value="glm-4" />
          <option value="gpt-4o" />
          <option value="moonshot-v1-8k" />
        </datalist>
      </div>

      <div className="settings-field">
        <button
          className="glass-button primary"
          onClick={handleTest}
          disabled={testing || !modelConfig.apiKey}
        >
          {testing ? "测试中..." : "🔍 测试连接"}
        </button>
        {testResult === true && (
          <span className="test-result success">✅ 连接成功</span>
        )}
        {testResult === false && (
          <span className="test-result error">❌ 连接失败</span>
        )}
      </div>
    </div>
  );
};
