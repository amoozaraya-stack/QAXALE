import React, { useState, useEffect, useRef } from "react";
import {
  Send,
  Sparkles,
  Bot,
  User,
  Plus,
  Trash2,
  Copy,
  Check,
  Compass,
  Lightbulb,
  Workflow,
  HelpCircle,
  Cpu,
  Layers,
  Terminal,
  Zap,
} from "lucide-react";
import { useApp } from "../context/AppContext";
import { ChatMode } from "../types";
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
    triggerConfetti,
  } = useApp();

  const [inputMessage, setInputMessage] = useState("");
  const [selectedMode, setSelectedMode] = useState<ChatMode>("agency-loop");
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeConv =
    conversations.find((c) => c.id === activeConversationId) || conversations[0];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [activeConv?.messages, isLoading]);

  const modeOptions: Array<{
    id: ChatMode;
    label: { om: string; en: string };
    icon: React.ComponentType<{ className?: string }>;
    desc: { om: string; en: string };
  }> = [
    {
      id: "agency-loop",
      label: { om: "Agency Loop", en: "Agency Loop" },
      icon: Workflow,
      desc: {
        om: "Hubannoo → Hojiirra Oolmaa → Kalaqa Pirojektii",
        en: "Access → Interpret → Apply → Create",
      },
    },
    {
      id: "interpret-layers",
      label: { om: "Hiika Sadarkaa", en: "Interpret Layers" },
      icon: Layers,
      desc: {
        om: "Afaan Salphaa + Fakkeenya Feynman + Seera Bu'uuraa",
        en: "Plain Language + Feynman Analogy + Core Mechanism",
      },
    },
    {
      id: "feynman",
      label: { om: "Feynman Tech", en: "Feynman" },
      icon: Lightbulb,
      desc: {
        om: "Akka waan nama haaraati barsiiftuutti salphisi",
        en: "Explain simply using analogies & teach-back",
      },
    },
    {
      id: "first-principles",
      label: { om: "First Principles", en: "First Principles" },
      icon: Compass,
      desc: {
        om: "Yaada bu'uuraa irraa eegali",
        en: "Reason upward from fundamental truths",
      },
    },
    {
      id: "code-explain",
      label: { om: "Ibsa Koodii", en: "Code Explain" },
      icon: Terminal,
      desc: {
        om: "Koodii fi loojikii saganteessuu ibsi",
        en: "Deconstruct coding syntax & execution flow",
      },
    },
    {
      id: "standard",
      label: { om: "Idilee", en: "Standard" },
      icon: Zap,
      desc: {
        om: "Haasaa fi gaaffii idilee",
        en: "Natural helpful assistant conversation",
      },
    },
  ];

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputMessage.trim() || isLoading) return;

    const userText = inputMessage.trim();
    setInputMessage("");
    setIsLoading(true);

    addMessageToActiveConversation({
      role: "user",
      content: userText,
      mode: selectedMode,
    });

    try {
      const historyToSend = (activeConv?.messages || []).map((m) => ({
        role: m.role,
        content: m.content,
      }));

      historyToSend.push({
        role: "user",
        content: userText,
      });

      const response = await sendChatMessage(historyToSend, language, selectedMode);

      addMessageToActiveConversation({
        role: "assistant",
        content: response.reply,
        mode: selectedMode,
      });

      if (response.reply.length > 100 && Math.random() > 0.6) {
        triggerConfetti();
      }
    } catch (err) {
      console.error("Chat error:", err);
      addMessageToActiveConversation({
        role: "assistant",
        content:
          language === "om"
            ? "Dhiifama, yeroof deebii kennuu hin dandeenye. Maaloo irra deebi'aa yaalaa."
            : "Sorry, I couldn't complete the response at this time. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyText = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-130px)] space-y-3">
      {/* Top Controls: Conversations & Mode Picker */}
      <div className="space-y-2 shrink-0">
        {/* Mode Selector Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          {modeOptions.map((opt) => {
            const Icon = opt.icon;
            const isSelected = selectedMode === opt.id;
            return (
              <button
                key={opt.id}
                onClick={() => setSelectedMode(opt.id)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  isSelected
                    ? "bg-amber-500 text-slate-950 shadow-sm"
                    : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
                }`}
                title={opt.desc[language]}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{opt.label[language]}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Messages Feed */}
      <div className="flex-1 overflow-y-auto space-y-3.5 pr-1 no-scrollbar">
        {activeConv?.messages.map((msg) => {
          const isAssistant = msg.role === "assistant";
          return (
            <div
              key={msg.id}
              className={`flex gap-2.5 ${isAssistant ? "justify-start" : "justify-end"}`}
            >
              {isAssistant && (
                <div className="w-7 h-7 rounded-xl bg-amber-500/20 border border-amber-500/30 text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-[85%] rounded-2xl p-3.5 text-xs leading-relaxed shadow-sm relative group ${
                  isAssistant
                    ? "bg-slate-900/90 border border-slate-800 text-slate-200"
                    : "bg-amber-500 text-slate-950 font-medium"
                }`}
              >
                <div className="whitespace-pre-wrap">{msg.content}</div>

                {isAssistant && (
                  <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-500">
                    <span className="font-mono uppercase tracking-wider">QAXALE V3</span>
                    <button
                      onClick={() => handleCopyText(msg.id, msg.content)}
                      className="hover:text-slate-300 flex items-center gap-1 transition-colors"
                    >
                      {copiedId === msg.id ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-400" />
                          <span className="text-emerald-400">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>

              {!isAssistant && (
                <div className="w-7 h-7 rounded-xl bg-slate-800 text-slate-300 flex items-center justify-center shrink-0 mt-0.5">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          );
        })}

        {isLoading && (
          <div className="flex gap-2.5 justify-start">
            <div className="w-7 h-7 rounded-xl bg-amber-500/20 border border-amber-500/30 text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
              <Bot className="w-4 h-4" />
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3 text-xs text-slate-400 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              <span>
                {language === "om"
                  ? "Qaxale V3 yaada bu'uuraa qorachaa jira..."
                  : "QAXALE V3 is reasoning and deconstructing..."}
              </span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Field */}
      <form onSubmit={handleSendMessage} className="shrink-0 flex gap-2 pt-1">
        <input
          id="chat-user-input"
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          placeholder={
            language === "om"
              ? "Wanta tokko gaafadhaa ykn yaada uumaa..."
              : "Ask anything, deconstruct concepts, or create projects..."
          }
          className="flex-1 bg-slate-900/90 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/70 transition-colors shadow-inner"
        />
        <button
          id="chat-send-btn"
          type="submit"
          disabled={isLoading || !inputMessage.trim()}
          className="px-3.5 py-2.5 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-bold rounded-xl flex items-center justify-center transition-all shadow-md active:scale-95 shrink-0"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
