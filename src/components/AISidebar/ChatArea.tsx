import React, { useRef, useEffect, useState } from "react";
import { useAppStore } from "../../stores/appStore";
import { streamChat } from "../../services/llm";
import { diagramPrompts } from "../../prompts/diagramPrompts";
import { useTranslation } from "../../i18n/I18nContext";

export const ChatArea: React.FC = () => {
  const {
    messages,
    addMessage,
    clearMessages,
    modelConfig,
    diagramType,
    setIsGenerating,
    setMermaidCode,
    isGenerating,
    setSettingsOpen,
  } = useAppStore();

  const { t } = useTranslation();
  const [input, setInput] = useState("");
  const [errorHint, setErrorHint] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (!isGenerating && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isGenerating]);

  useEffect(() => {
    if (errorHint) {
      const timer = setTimeout(() => setErrorHint(""), 5000);
      return () => clearTimeout(timer);
    }
  }, [errorHint]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || isGenerating) return;
    if (!modelConfig.apiKey) {
      setErrorHint(t.chat.noApiKey);
      setSettingsOpen(true);
      return;
    }

    setErrorHint("");
    setInput("");
    addMessage({ role: "user", content: text });
    setIsGenerating(true);

    const systemPrompt = diagramPrompts[diagramType];
    const chatMessages = [
      { role: "system" as const, content: systemPrompt },
      ...messages.map((m) => ({ role: m.role as "user" | "assistant", content: m.content })),
      { role: "user" as const, content: text },
    ];

    let assistantContent = "";
    addMessage({ role: "assistant", content: "" });

    try {
      for await (const chunk of streamChat(modelConfig, chatMessages)) {
        assistantContent += chunk;
        const msgs = useAppStore.getState().messages;
        const updated = [...msgs];
        updated[updated.length - 1] = { role: "assistant", content: assistantContent };
        useAppStore.setState({ messages: updated });
      }

      // Try to extract mermaid code from AI response — flexible matching
      const codeMatch =
        assistantContent.match(/```mermaid\s*\n([\s\S]*?)```/) ||  // standard
        assistantContent.match(/```\s*\n((?:graph|flowchart|sequenceDiagram|classDiagram|erDiagram|mindmap|gantt|pie|gitGraph)[\s\S]*?)```/); // untagged code block with mermaid content
      if (codeMatch) {
        setMermaidCode(codeMatch[1].trim());
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : t.chat.requestFailed;
      const msgs = useAppStore.getState().messages;
      const updated = [...msgs];
      updated[updated.length - 1] = { role: "assistant", content: `${t.chat.error}: ${errorMsg}` };
      useAppStore.setState({ messages: updated });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Ignore if IME is composing (e.g., Chinese input)
    if (e.nativeEvent.isComposing) return;
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      e.stopPropagation();
      handleSend();
    }
  };

  return (
    <div className="chat-area">
      <div className="chat-header">
        <span className="chat-title">{t.chat.title}</span>
        <button className="chat-clear" onClick={clearMessages} title={t.chat.clearChat}>
          🗑️
        </button>
      </div>

      <div className="chat-messages">
        {messages.length === 0 && (
          <div className="chat-empty">{t.chat.emptyHint}</div>
        )}
        {messages.map((msg, i) => (
          <div key={i} className={`chat-bubble ${msg.role}`}>
            <div className="chat-avatar">{msg.role === "user" ? "👤" : "🤖"}</div>
            <div className="chat-content">
              <pre style={{ whiteSpace: "pre-wrap", wordBreak: "break-word", userSelect: "text" }}>
                {msg.content || "..."}
              </pre>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="chat-input-area">
        {errorHint && (
          <div className="chat-error-hint">{errorHint}</div>
        )}
        <textarea
          ref={inputRef}
          className="chat-input glass-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={t.chat.placeholder}
          rows={3}
          disabled={isGenerating}
          style={{ userSelect: "text" }}
        />
        <button
          className="chat-send glass-button primary"
          onClick={(e) => {
            e.stopPropagation();
            handleSend();
          }}
          disabled={isGenerating || !input.trim()}
        >
          {isGenerating ? t.chat.generating : t.chat.send}
        </button>
      </div>
    </div>
  );
};
