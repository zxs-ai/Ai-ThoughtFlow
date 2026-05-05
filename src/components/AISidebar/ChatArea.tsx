import React, { useRef, useEffect, useState } from "react";
import { useAppStore } from "../../stores/appStore";
import { streamChat } from "../../services/llm";
import { diagramPrompts } from "../../prompts/diagramPrompts";

export const ChatArea: React.FC = () => {
  const {
    messages,
    addMessage,
    clearMessages,
    modelConfig,
    diagramType,
    setIsGenerating,
    setMermaidCode,
  } = useAppStore();

  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || !modelConfig.apiKey) {
      if (!modelConfig.apiKey) alert("请先配置 API Key");
      return;
    }

    const userMsg = input.trim();
    setInput("");
    addMessage({ role: "user", content: userMsg });
    setIsGenerating(true);

    const systemPrompt = diagramPrompts[diagramType];
    const chatMessages = [
      { role: "system" as const, content: systemPrompt },
      ...messages.map((m) => ({ role: m.role as "user" | "assistant", content: m.content })),
      { role: "user" as const, content: userMsg },
    ];

    let assistantContent = "";
    addMessage({ role: "assistant", content: "" });

    try {
      for await (const chunk of streamChat(modelConfig, chatMessages)) {
        assistantContent += chunk;
        const lastIndex = useAppStore.getState().messages.length - 1;
        const updatedMessages = [...useAppStore.getState().messages];
        updatedMessages[lastIndex] = { role: "assistant", content: assistantContent };
        useAppStore.setState({ messages: updatedMessages });
      }

      // Extract mermaid code from response
      const codeMatch = assistantContent.match(/```mermaid\n([\s\S]*?)```/);
      if (codeMatch) {
        setMermaidCode(codeMatch[1].trim());
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "请求失败";
      const lastIndex = useAppStore.getState().messages.length - 1;
      const updatedMessages = [...useAppStore.getState().messages];
      updatedMessages[lastIndex] = { role: "assistant", content: `❌ 错误: ${errorMsg}` };
      useAppStore.setState({ messages: updatedMessages });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="chat-area">
      <div className="chat-header">
        <span className="chat-title">对话</span>
        <button className="chat-clear" onClick={clearMessages} title="清空对话">
          🗑️
        </button>
      </div>

      <div className="chat-messages">
        {messages.length === 0 && (
          <div className="chat-empty">输入描述，AI 将生成图表代码</div>
        )}
        {messages.map((msg, i) => (
          <div key={i} className={`chat-bubble ${msg.role}`}>
            <div className="chat-avatar">{msg.role === "user" ? "👤" : "🤖"}</div>
            <div className="chat-content">
              <pre style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
                {msg.content || "..."}
              </pre>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="chat-input-area">
        <textarea
          className="chat-input glass-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="描述您想要的图表..."
          rows={3}
        />
        <button className="chat-send glass-button primary" onClick={handleSend}>
          发送
        </button>
      </div>
    </div>
  );
};
