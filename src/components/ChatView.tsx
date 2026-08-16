import React, { useState, useRef, useEffect } from "react";
import {
  Send,
  Sparkles,
  Plus,
  Trash2,
  Copy,
  Check,
  ListOrdered,
  FileText,
  Lightbulb,
  Code,
  Bot,
  User,
  RotateCcw,
  MessageSquare,
  Volume2,
} from "lucide-react";
import { useApp } from "../context/AppContext";
import { ChatMode, ChatMessage } from "../types";
import { sendChatMessage } from "../services/api";

export const ChatView: React.FC = () => {
  const {
    language,
    conversations,
    activeConversationId,
    setActiveConversationId,
    createConversation,
    addMessageToActiveConversation,
    deleteConversation,
  } = useApp();

  const [inputMessage, setInputMessage] = useState("");
  const [selectedMode, setSelectedMode] = useState<ChatMode>("standard");
  const [isLoading, setIsLoading] = useState(false);
  const [copiedMsgId, setCopiedMsgId] = useState<string | null>(null);
  const [showHistoryDrawer, setShowHistoryDrawer] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const activeConv = conversations.find((c) => c.id === activeConversationId) || conversations[0];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [activeConv?.messages, isLoading]);

  const modes: Array<{
    id: ChatMode;
    label: { om: string; en: string };
    icon: React.ComponentType<{ className?: string }>;
    desc: { om: string; en: string };
  }> = [
    {
      id: "standard",
      label: { om: "Waliigala", en: "Standard" },
      icon: Sparkles,
      desc: { om: "Deebii guutuu", en: "General answers" },
    },
    {
      id: "step-by-step",
      label: { om: "Tarkaanfiidhaan", en: "Step-by-Step" },
      icon: ListOrdered,
      desc: { om: "Tartiibaan ibsuu", en: "Numbered steps" },
    },
    {
      id: "summary",
      label: { om: "Gabaabsi", en: "Summary" },
      icon: FileText,
      desc: { om: "Qabxii ijoo", en: "Key takeaways" },
    },
    {
      id: "brainstorm",
      label: { om: "Kalaqa", en: "Brainstorm" },
      icon: Lightbulb,
      desc: { om: "Yaada haaraa", en: "Creative ideas" },
    },
    {
      id: "code-explain",
      label: { om: "Koodii Ibsi", en: "Code Explain" },
      icon: Code,
      desc: { om: "Koodii qorachuu", en: "Deep code logic" },
    },
  ];

  const promptSuggestions = [
    {
      om: "Algorizimii fi Saayinsii Kompiitaraa maali?",
      en: "What is an Algorithm and Computer Science?",
    },
    {
      om: "Python keessatti 'Variable' fi 'Loop' tarkaanfiidhaan naaf ibsi",
      en: "Explain Variables and Loops step-by-step",
    },
    {
      om: "Kalaqa app mobaayilaa Oromiyaa keessatti barbaachisu 3 naaf barreessi",
      en: "Suggest 3 innovative mobile app ideas for local impact",
    },
    {
      om: "Hubannoon Nam-tolchee (AI) akkamitti hojjeta?",
      en: "How does Artificial Intelligence train on data?",
    },
  ];

  const handleSendMessage = async (customText?: string) => {
    const textToSend = (customText || inputMessage).trim();
    if (!textToSend || isLoading) return;

    setInputMessage("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }

    // Add user message
    addMessageToActiveConversation({
      role: "user",
      content: textToSend,
      mode: selectedMode,
    });

    setIsLoading(true);

    try {
      // Build conversation payload for the server
      const currentHistory = activeConv ? activeConv.messages : [];
      const messagesPayload = [
        ...currentHistory.map((m) => ({
          role: m.role,
          content: m.content,
        })),
        {
          role: "user" as const,
          content: textToSend,
        },
      ];

      const res = await sendChatMessage(messagesPayload, language, selectedMode);

      addMessageToActiveConversation({
        role: "assistant",
        content: res.reply || "Deebiin hin argamne.",
        mode: selectedMode,
      });
    } catch (err) {
      console.error(err);
      addMessageToActiveConversation({
        role: "assistant",
        content:
          language === "om"
            ? "Rakkoon neetwoorkii uumameera. Maaloo irra deebi'aa yaalaa."
            : "A network error occurred. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedMsgId(id);
    setTimeout(() => setCopiedMsgId(null), 2000);
  };

  const handleNewChat = () => {
    createConversation();
    setShowHistoryDrawer(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleTextareaInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputMessage(e.target.value);
    e.target.style.height = "auto";
    e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
  };

  return (
    <div className="flex flex-col h-[calc(100vh-125px)] pb-1 relative">
      {/* Top Chat Bar: History toggle, active title, new chat button */}
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800/80 px-1">
        <button
          onClick={() => setShowHistoryDrawer(!showHistoryDrawer)}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-300 hover:text-white"
        >
          <MessageSquare className="w-3.5 h-3.5 text-amber-400" />
          <span className="truncate max-w-[140px]">
            {activeConv?.title || (language === "om" ? "Waliin-haasaa" : "Chat")}
          </span>
        </button>

        <div className="flex items-center gap-1.5">
          <button
            onClick={handleNewChat}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-all active:scale-95 shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{language === "om" ? "Haaraa" : "New Chat"}</span>
          </button>
        </div>
      </div>

      {/* History Drawer Modal / Popup */}
      {showHistoryDrawer && (
        <div className="absolute top-10 left-0 right-0 z-30 bg-slate-900 border border-slate-800 rounded-2xl p-3 shadow-2xl space-y-2 max-h-72 overflow-y-auto">
          <div className="flex items-center justify-between pb-1 border-b border-slate-800 text-xs font-bold text-slate-400">
            <span>{language === "om" ? "Waliin-haasaa Duraanii" : "Conversation History"}</span>
            <button
              onClick={() => setShowHistoryDrawer(false)}
              className="text-[11px] text-amber-400 hover:underline"
            >
              {language === "om" ? "Cufi" : "Close"}
            </button>
          </div>

          <div className="space-y-1">
            {conversations.map((c) => (
              <div
                key={c.id}
                onClick={() => {
                  setActiveConversationId(c.id);
                  setShowHistoryDrawer(false);
                }}
                className={`flex items-center justify-between p-2 rounded-xl text-xs cursor-pointer transition-all ${
                  c.id === activeConversationId
                    ? "bg-amber-500/10 border border-amber-500/30 text-amber-400 font-bold"
                    : "hover:bg-slate-800/80 text-slate-300"
                }`}
              >
                <span className="truncate max-w-[220px]">{c.title}</span>
                {conversations.length > 1 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteConversation(c.id);
                    }}
                    className="p-1 text-slate-500 hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Mode Selector Chips */}
      <div className="flex gap-1.5 overflow-x-auto pb-2 mb-1 no-scrollbar shrink-0">
        {modes.map((m) => {
          const Icon = m.icon;
          const isSelected = selectedMode === m.id;
          return (
            <button
              key={m.id}
              onClick={() => setSelectedMode(m.id)}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                isSelected
                  ? "bg-amber-500 text-slate-950 font-bold shadow-sm"
                  : "bg-slate-900 border border-slate-800 text-slate-300 hover:border-slate-700"
              }`}
            >
              <Icon className="w-3 h-3" />
              <span>{m.label[language]}</span>
            </button>
          );
        })}
      </div>

      {/* Messages List Area */}
      <div className="flex-1 overflow-y-auto space-y-3.5 pr-1 text-sm">
        {activeConv?.messages.length === 0 && (
          <div className="text-center py-6 px-4 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mx-auto">
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">
                {language === "om" ? "QAXALE AI Waliin Haasa'aa" : "Chat with QAXALE AI"}
              </h3>
              <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                {language === "om"
                  ? "Gaaffii saayinsii, koodingii, hiika jechootaa, fi barnootaa dhiyeessaa."
                  : "Ask questions about programming, AI, digital technology, or general knowledge."}
              </p>
            </div>

            {/* Starter Suggestion Chips */}
            <div className="grid grid-cols-1 gap-2 max-w-sm mx-auto text-left">
              {promptSuggestions.map((ps, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(ps[language])}
                  className="p-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-900 border border-slate-800 hover:border-amber-500/40 text-xs text-slate-200 transition-all flex items-center gap-2 active:scale-[0.99]"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span className="truncate">{ps[language]}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {activeConv?.messages.map((msg) => {
          const isUser = msg.role === "user";
          return (
            <div
              key={msg.id}
              className={`flex items-start gap-2.5 ${isUser ? "flex-row-reverse" : "flex-row"}`}
            >
              {/* Avatar Icon */}
              <div
                className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold ${
                  isUser
                    ? "bg-emerald-500/20 border border-emerald-500/30 text-emerald-400"
                    : "bg-amber-500/20 border border-amber-500/30 text-amber-400"
                }`}
              >
                {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              {/* Message Bubble */}
              <div
                className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 shadow-sm text-xs sm:text-sm leading-relaxed ${
                  isUser
                    ? "bg-amber-500 text-slate-950 font-medium rounded-tr-none"
                    : "bg-slate-900 border border-slate-800 text-slate-100 rounded-tl-none"
                }`}
              >
                <div className="whitespace-pre-wrap font-sans break-words">{msg.content}</div>

                {/* Footer details: timestamp, copy, mode */}
                <div
                  className={`mt-1.5 flex items-center justify-between text-[10px] ${
                    isUser ? "text-slate-900/70" : "text-slate-400"
                  }`}
                >
                  <span>
                    {new Date(msg.timestamp).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                  {!isUser && (
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleCopy(msg.content, msg.id)}
                        className="p-1 hover:text-white transition-colors"
                        title="Waraabi / Copy"
                      >
                        {copiedMsgId === msg.id ? (
                          <Check className="w-3 h-3 text-emerald-400" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {isLoading && (
          <div className="flex items-start gap-2.5">
            <div className="w-7 h-7 rounded-xl bg-amber-500/20 border border-amber-500/30 text-amber-400 flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4 animate-bounce" />
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-2xl rounded-tl-none px-4 py-3 text-xs text-amber-400 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
              <span>
                {language === "om" ? "Qaxaleen yaadaa jira..." : "QAXALE is thinking..."}
              </span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Mobile Input Field Bar */}
      <div className="pt-2 border-t border-slate-800/80 bg-slate-950 shrink-0">
        <div className="relative flex items-end bg-slate-900 border border-slate-700/80 focus-within:border-amber-400 rounded-2xl p-1.5 transition-colors shadow-lg">
          <textarea
            ref={textareaRef}
            id="chat-textarea-input"
            value={inputMessage}
            onChange={handleTextareaInput}
            onKeyDown={handleKeyDown}
            rows={1}
            placeholder={
              language === "om"
                ? "Gaaffii Afaan Oromoo ykn Ingiliffaan barreessi..."
                : "Ask anything in Afaan Oromoo or English..."
            }
            className="flex-1 bg-transparent text-slate-100 placeholder-slate-500 px-2.5 py-1.5 text-xs sm:text-sm resize-none focus:outline-none max-h-28"
          />

          <button
            id="chat-send-btn"
            onClick={() => handleSendMessage()}
            disabled={!inputMessage.trim() || isLoading}
            className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all shrink-0 ${
              inputMessage.trim() && !isLoading
                ? "bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold active:scale-95 shadow-md"
                : "bg-slate-800 text-slate-500 cursor-not-allowed"
            }`}
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
