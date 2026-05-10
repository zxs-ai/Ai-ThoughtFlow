import React, { useRef, useEffect, useState, useCallback } from "react";
import { useAppStore } from "../../stores/appStore";
import { streamChat } from "../../services/llm";
import { diagramPrompts } from "../../prompts/diagramPrompts";
import { useTranslation } from "../../i18n/I18nContext";
import {
  loadHistory,
  deleteSessionFromHistory,
  appendSessionToHistory,
  ConversationSession,
} from "../../stores/appStore";

/* ─────────────────────────── History Panel ─────────────────────────── */
interface HistoryPanelProps {
  onClose: () => void;
  onRestore: (session: ConversationSession) => void;
}

const HistoryPanel: React.FC<HistoryPanelProps> = ({ onClose, onRestore }) => {
  const { t } = useTranslation();
  const [sessions, setSessions] = useState<ConversationSession[]>([]);

  useEffect(() => {
    setSessions(loadHistory());
  }, []);

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    deleteSessionFromHistory(id);
    setSessions((prev) => prev.filter((s) => s.id !== id));
  };

  const formatDate = (ts: number) => {
    const d = new Date(ts);
    return `${d.getMonth() + 1}/${d.getDate()} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
  };

  return (
    <div className="history-panel">
      <div className="history-panel-header">
        <span className="history-panel-title">{t.chat.historyTitle}</span>
        <button className="history-close-btn" onClick={onClose} title={t.chat.closeHistory}>
          ✕
        </button>
      </div>
      <div className="history-list">
        {sessions.length === 0 ? (
          <div className="history-empty">{t.chat.historyEmpty}</div>
        ) : (
          sessions.map((s) => (
            <div
              key={s.id}
              className="history-item"
              onClick={() => { onRestore(s); onClose(); }}
            >
              <div className="history-item-title">{s.title || t.chat.untitled}</div>
              <div className="history-item-meta">
                <span className="history-item-date">{formatDate(s.createdAt)}</span>
                <span className="history-item-count">{s.messages.length} {t.chat.messages}</span>
              </div>
              <button
                className="history-item-delete"
                onClick={(e) => handleDelete(s.id, e)}
                title={t.chat.deleteSession}
              >
                🗑
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

/* ─────────────────────────── Clear Dialog ───────────────────────────── */
interface ClearDialogProps {
  onSaveAndClear: () => void;   // 保存到历史后清除前端
  onDeleteAndClear: () => void; // 彻底删除，不保存
  onCancel: () => void;
}

const ClearDialog: React.FC<ClearDialogProps> = ({ onSaveAndClear, onDeleteAndClear, onCancel }) => {
  const { t } = useTranslation();
  return (
    <div className="clear-dialog-overlay" onClick={onCancel}>
      <div className="clear-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="clear-dialog-icon">🗑️</div>
        <div className="clear-dialog-title">{t.chat.clearTitle}</div>
        <div className="clear-dialog-desc">{t.chat.clearDesc}</div>
        <div className="clear-dialog-actions">
          <button className="clear-btn-save" onClick={onSaveAndClear}>
            {t.chat.clearSave}
          </button>
          <button className="clear-btn-delete" onClick={onDeleteAndClear}>
            {t.chat.clearDelete}
          </button>
          <button className="clear-btn-cancel" onClick={onCancel}>
            {t.chat.clearCancel}
          </button>
        </div>
      </div>
    </div>
  );
};

/* ─────────────────────────── Main ChatArea ──────────────────────────── */
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
    currentSessionId,
  } = useAppStore();

  const { t } = useTranslation();
  const [input, setInput] = useState("");
  const [errorHint, setErrorHint] = useState("");
  const [showHistory, setShowHistory] = useState(false);
  const [showClearDialog, setShowClearDialog] = useState(false);
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

  const handleSend = useCallback(async () => {
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

      const codeMatch =
        assistantContent.match(/```mermaid\s*\n([\s\S]*?)```/) ||
        assistantContent.match(/```\s*\n((?:graph|flowchart|sequenceDiagram|classDiagram|erDiagram|mindmap|gantt|pie|gitGraph)[\s\S]*?)```/);
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
  }, [input, isGenerating, modelConfig, diagramType, messages, addMessage, setIsGenerating, setMermaidCode, setSettingsOpen, t]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.nativeEvent.isComposing) return;
    // Option (Alt) + Enter = newline
    if (e.key === "Enter" && e.altKey) {
      e.preventDefault();
      const ta = e.currentTarget;
      const start = ta.selectionStart;
      const end = ta.selectionEnd;
      const newVal = input.slice(0, start) + "\n" + input.slice(end);
      setInput(newVal);
      // Restore cursor after state update
      requestAnimationFrame(() => {
        if (inputRef.current) {
          inputRef.current.selectionStart = start + 1;
          inputRef.current.selectionEnd = start + 1;
        }
      });
      return;
    }
    // Plain Enter = send
    if (e.key === "Enter" && !e.shiftKey && !e.altKey) {
      e.preventDefault();
      e.stopPropagation();
      handleSend();
    }
  };

  /* ── Clear handlers ── */
  const handleClearRequest = () => {
    if (messages.length === 0) return;
    setShowClearDialog(true);
  };

  // 保存到历史，清除前端显示
  const handleSaveAndClear = () => {
    const firstUserMsg = messages.find((m) => m.role === "user")?.content ?? "对话";
    const session: ConversationSession = {
      id: currentSessionId,
      title: firstUserMsg.slice(0, 40),
      diagramType,
      messages,
      createdAt: Date.now(),
    };
    appendSessionToHistory(session);
    clearMessages();
    setShowClearDialog(false);
  };

  // 不保存，彻底清除
  const handleDeleteAndClear = () => {
    clearMessages();
    setShowClearDialog(false);
  };

  /* ── Restore from history ── */
  const handleRestore = (session: ConversationSession) => {
    useAppStore.setState({
      messages: session.messages,
      diagramType: session.diagramType,
      currentSessionId: session.id,
    });
  };

  return (
    <div className="chat-area">
      {/* Header */}
      <div className="chat-header">
        <span className="chat-title">{t.chat.title}</span>
        <div className="chat-header-actions">
          <button
            className="chat-history-btn"
            onClick={() => setShowHistory((v) => !v)}
            title={t.chat.historyTitle}
          >
            🕐
          </button>
          <button
            className="chat-clear"
            onClick={handleClearRequest}
            title={t.chat.clearChat}
          >
            🗑️
          </button>
        </div>
      </div>

      {/* History overlay */}
      {showHistory && (
        <HistoryPanel
          onClose={() => setShowHistory(false)}
          onRestore={handleRestore}
        />
      )}

      {/* Messages */}
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

      {/* Input area */}
      <div className="chat-input-area">
        {errorHint && (
          <div className="chat-error-hint">{errorHint}</div>
        )}
        <div className="chat-input-wrapper">
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
            className={`chat-send-inline ${isGenerating ? "generating" : ""}`}
            onClick={(e) => { e.stopPropagation(); handleSend(); }}
            disabled={isGenerating || !input.trim()}
            title={t.chat.send}
          >
            {isGenerating ? (
              <span className="send-spinner" />
            ) : (
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="19" x2="12" y2="5" />
                <polyline points="5 12 12 5 19 12" />
              </svg>
            )}
          </button>
        </div>
        <div className="chat-input-hint">{t.chat.inputHint}</div>
      </div>

      {/* Clear confirmation dialog */}
      {showClearDialog && (
        <ClearDialog
          onSaveAndClear={handleSaveAndClear}
          onDeleteAndClear={handleDeleteAndClear}
          onCancel={() => setShowClearDialog(false)}
        />
      )}
    </div>
  );
};
