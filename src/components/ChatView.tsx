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
  Paperclip,
  X,
  FileText,
  Image as ImageIcon,
  MessageSquare,
  ChevronDown,
  History,
  Volume2,
  Wrench,
} from "lucide-react";
import { useApp } from "../context/AppContext";
import { ChatMode, ChatAttachment } from "../types";
import { sendChatMessage, speakText } from "../services/api";

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
  const [attachments, setAttachments] = useState<ChatAttachment[]>([]);
  const [showHistoryDrawer, setShowHistoryDrawer] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
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

  const handleFileUpload = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      const isImage = file.type.startsWith("image/");
      const isText = file.type.startsWith("text/") || file.name.endsWith(".json") || file.name.endsWith(".ts") || file.name.endsWith(".py") || file.name.endsWith(".js") || file.name.endsWith(".txt") || file.name.endsWith(".md");

      const reader = new FileReader();

      if (isImage) {
        reader.onload = (e) => {
          setAttachments((prev) => [
            ...prev,
            {
              name: file.name,
              type: "image",
              size: file.size,
              dataUrl: e.target?.result as string,
            },
          ]);
        };
        reader.readAsDataURL(file);
      } else if (isText) {
        reader.onload = (e) => {
          setAttachments((prev) => [
            ...prev,
            {
              name: file.name,
              type: "text",
              size: file.size,
              textSnippet: (e.target?.result as string).slice(0, 1000),
            },
          ]);
        };
        reader.readAsText(file);
      } else {
        setAttachments((prev) => [
          ...prev,
          {
            name: file.name,
            type: "file",
            size: file.size,
          },
        ]);
      }
    });
  };

  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const handleStartNewChat = () => {
    const id = createConversation();
    setActiveConversationId(id);
    setShowHistoryDrawer(false);
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if ((!inputMessage.trim() && attachments.length === 0) || isLoading) return;

    const userText = inputMessage.trim();
    const currentAttachments = [...attachments];

    setInputMessage("");
    setAttachments([]);
    setIsLoading(true);

    addMessageToActiveConversation({
      role: "user",
      content: userText || (language === "om" ? "[Faayilii Qabsiifame]" : "[Uploaded File]"),
      mode: selectedMode,
      attachments: currentAttachments.length > 0 ? currentAttachments : undefined,
    });

    try {
      // Build user message with file context if attached
      let combinedPrompt = userText;
      if (currentAttachments.length > 0) {
        const fileDescriptions = currentAttachments.map((f) => {
          if (f.textSnippet) {
            return `[File Attached: ${f.name}]\n\`\`\`\n${f.textSnippet}\n\`\`\``;
          }
          return `[Attached File: ${f.name} (${f.type}, ${Math.round(f.size / 1024)} KB)]`;
        }).join("\n\n");
        combinedPrompt = `${fileDescriptions}\n\n${userText || (language === "om" ? "Maaloo faayila kana qoradhuutii naaf ibsi." : "Please analyze and explain this attached file.")}`;
      }

      const historyToSend = (activeConv?.messages || []).map((m) => ({
        role: m.role,
        content: m.content,
      }));

      historyToSend.push({
        role: "user",
        content: combinedPrompt,
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
    <div className="flex flex-col h-[calc(100vh-130px)] space-y-2.5">
      {/* Top Header Controls: + New Chat & History Navigator */}
      <div className="flex items-center justify-between gap-2 bg-slate-900/90 border border-slate-800 p-2 rounded-2xl shadow-sm">
        {/* Active Conversation Pill & History Toggle */}
        <div className="relative flex-1 min-w-0">
          <button
            onClick={() => setShowHistoryDrawer(!showHistoryDrawer)}
            className="w-full flex items-center justify-between gap-2 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800/80 text-left hover:border-amber-500/40 transition-colors"
          >
            <div className="flex items-center gap-2 min-w-0">
              <MessageSquare className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span className="text-xs font-semibold text-slate-200 truncate">
                {activeConv?.title || (language === "om" ? "Haasaa Qaxale" : "Active Chat")}
              </span>
            </div>
            <div className="flex items-center gap-1 shrink-0 text-slate-400">
              <span className="text-[10px] font-mono bg-slate-800 px-1.5 py-0.5 rounded text-slate-300">
                {conversations.length}
              </span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showHistoryDrawer ? "rotate-180" : ""}`} />
            </div>
          </button>

          {/* History Dropdown / Drawer */}
          {showHistoryDrawer && (
            <div className="absolute left-0 right-0 top-full mt-1.5 z-30 bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl p-2 space-y-1.5 max-h-60 overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="flex items-center justify-between px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800/80">
                <span>{language === "om" ? "Seenaa Haasaa (History)" : "Chat History"}</span>
                <span>{conversations.length} items</span>
              </div>

              {conversations.map((conv) => {
                const isActive = conv.id === activeConversationId;
                return (
                  <div
                    key={conv.id}
                    className={`flex items-center justify-between p-2 rounded-xl text-xs transition-colors group ${
                      isActive
                        ? "bg-amber-500/15 border border-amber-500/40 text-amber-300 font-semibold"
                        : "hover:bg-slate-900 text-slate-300 border border-transparent"
                    }`}
                  >
                    <button
                      onClick={() => {
                        setActiveConversationId(conv.id);
                        setShowHistoryDrawer(false);
                      }}
                      className="flex items-center gap-2 flex-1 min-w-0 text-left"
                    >
                      <MessageSquare className={`w-3.5 h-3.5 shrink-0 ${isActive ? "text-amber-400" : "text-slate-500"}`} />
                      <span className="truncate">{conv.title}</span>
                    </button>

                    {conversations.length > 1 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteConversation(conv.id);
                        }}
                        className="opacity-0 group-hover:opacity-100 p-1 text-slate-500 hover:text-rose-400 transition-opacity"
                        title="Delete chat"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Prominent + New Chat Button */}
        <button
          id="new-chat-btn"
          onClick={handleStartNewChat}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md transition-all active:scale-95 shrink-0"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>{language === "om" ? "+ Haasaa Haaraa" : "+ New Chat"}</span>
        </button>
      </div>

      {/* Mode Selector Chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 no-scrollbar shrink-0">
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

      {/* Messages Feed */}
      <div className="flex-1 overflow-y-auto space-y-3 pr-1 no-scrollbar">
        {activeConv?.messages.length === 0 && (
          <div className="text-center py-12 px-4 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto border border-amber-500/30">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-white">
              {language === "om" ? "Haasaa Haaraa QAXALE V3" : "New QAXALE V3 Conversation"}
            </h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              {language === "om"
                ? "Gaaffii kee barreessi, faayila qabsiisi, ykn koodii fi yaada teeknolojii qoradhu."
                : "Ask questions, upload files or code snippets, and explore first-principles reasoning."}
            </p>
          </div>
        )}

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
                className={`max-w-[85%] rounded-2xl p-3.5 text-xs leading-relaxed shadow-sm relative group space-y-2 ${
                  isAssistant
                    ? "bg-slate-900/90 border border-slate-800 text-slate-200"
                    : "bg-amber-500 text-slate-950 font-medium"
                }`}
              >
                {/* Attachments preview if present */}
                {msg.attachments && msg.attachments.length > 0 && (
                  <div className="space-y-1.5 pb-1">
                    {msg.attachments.map((att, i) => (
                      <div
                        key={i}
                        className={`flex items-center gap-2 p-2 rounded-xl text-xs border ${
                          isAssistant
                            ? "bg-slate-950 border-slate-800 text-slate-200"
                            : "bg-amber-600/30 border-amber-600/40 text-slate-950"
                        }`}
                      >
                        {att.type === "image" && att.dataUrl ? (
                          <img
                            src={att.dataUrl}
                            alt={att.name}
                            className="w-10 h-10 object-cover rounded-lg border border-black/20"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <FileText className="w-4 h-4 shrink-0 text-amber-400" />
                        )}
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold truncate text-[11px]">{att.name}</p>
                          <p className="text-[9px] opacity-75">{Math.round(att.size / 1024)} KB</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="whitespace-pre-wrap">{msg.content}</div>

                {isAssistant && (
                  <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-500">
                    <span className="font-mono uppercase tracking-wider">QAXALE V3</span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => speakText(msg.content, language)}
                        className="hover:text-amber-400 flex items-center gap-1 transition-colors"
                        title="Read aloud"
                      >
                        <Volume2 className="w-3 h-3" />
                        <span>Speak</span>
                      </button>
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

      {/* Attachment Staging Area */}
      {attachments.length > 0 && (
        <div className="flex flex-wrap gap-2 p-2 bg-slate-900 border border-slate-800 rounded-xl">
          {attachments.map((file, idx) => (
            <div
              key={idx}
              className="flex items-center gap-1.5 bg-slate-950 border border-slate-800 text-slate-200 px-2.5 py-1 rounded-lg text-xs"
            >
              {file.type === "image" ? (
                <ImageIcon className="w-3.5 h-3.5 text-amber-400" />
              ) : (
                <FileText className="w-3.5 h-3.5 text-blue-400" />
              )}
              <span className="max-w-[120px] truncate">{file.name}</span>
              <button
                type="button"
                onClick={() => removeAttachment(idx)}
                className="text-slate-500 hover:text-rose-400 ml-1"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        className="hidden"
        onChange={(e) => handleFileUpload(e.target.files)}
      />

      {/* Input Field & File Upload Controls */}
      <form onSubmit={handleSendMessage} className="shrink-0 flex gap-2 pt-1">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="px-3 py-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-amber-500/50 text-slate-300 hover:text-amber-400 rounded-xl flex items-center justify-center transition-all shadow-sm shrink-0"
          title={language === "om" ? "Faayila qabsiisi (Upload File/Code)" : "Upload file, image or code"}
        >
          <Paperclip className="w-4 h-4" />
        </button>

        <input
          id="chat-user-input"
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          placeholder={
            language === "om"
              ? "Wanta tokko gaafadhaa, koodii ergaa ykn faayila qabsiisaa..."
              : "Ask questions, paste code, or upload files..."
          }
          className="flex-1 bg-slate-900/90 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/70 transition-colors shadow-inner"
        />

        <button
          id="chat-send-btn"
          type="submit"
          disabled={isLoading || (!inputMessage.trim() && attachments.length === 0)}
          className="px-3.5 py-2.5 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-bold rounded-xl flex items-center justify-center transition-all shadow-md active:scale-95 shrink-0"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
