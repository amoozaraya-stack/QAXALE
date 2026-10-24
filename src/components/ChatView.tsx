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
  Brain,
  ShieldCheck,
  RefreshCw,
  BookOpen,
  Download,
} from "lucide-react";
import { useApp } from "../context/AppContext";
import { ChatMode, ChatAttachment, ResponseBrevity, ChatMessage } from "../types";
import { sendChatMessage, speakText } from "../services/api";
import { buildContextPackage } from "../services/memoryService";
import { MemoryInspectorModal } from "./MemoryInspectorModal";

export const ChatView: React.FC = () => {
  const {
    language,
    conversations,
    activeConversationId,
    setActiveConversationId,
    createConversation,
    addMessageToActiveConversation,
    updateMessageInActiveConversation,
    deleteConversation,
    triggerConfetti,
    userMemory,
    summarizeActiveConversation,
    semanticMemories,
    episodicMemories,
    extractMemoriesFromCurrentConversation,
    generateCurrentEpisodeBrief,
    currentUser,
    setShowAuthModal,
  } = useApp();

  const [inputMessage, setInputMessage] = useState("");
  const [selectedMode, setSelectedMode] = useState<ChatMode>("agency-loop");
  const [brevity, setBrevity] = useState<ResponseBrevity>("concise");
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [attachments, setAttachments] = useState<ChatAttachment[]>([]);
  const [showHistoryDrawer, setShowHistoryDrawer] = useState(false);
  const [showMemoryModal, setShowMemoryModal] = useState(false);
  const [showBriefExpanded, setShowBriefExpanded] = useState(false);
  const [isCompressing, setIsCompressing] = useState(false);
  const [expandingState, setExpandingState] = useState<{
    messageId: string;
    type: "describe" | "example" | "clarify";
  } | null>(null);

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
      id: "clarify",
      label: { om: "Ifa Taasisi", en: "Clarify" },
      icon: HelpCircle,
      desc: {
        om: "Dogoggora beekamaa ifa baasuu fi daangaa adda baasuu",
        en: "Clear up confusion, misconceptions & distinguish what it is NOT",
      },
    },
    {
      id: "describe",
      label: { om: "Caasaa Ibsi", en: "Describe" },
      icon: BookOpen,
      desc: {
        om: "Caasaa gadi-fagoo, kutaalee fi adeemsa qabatamaa",
        en: "In-depth descriptive anatomy, components & walkthrough",
      },
    },
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

      // Build Context Intelligence Package (Working + Semantic + Episodic)
      const contextPackage = buildContextPackage(
        combinedPrompt,
        semanticMemories,
        episodicMemories,
        userMemory
      );

      const response = await sendChatMessage(
        historyToSend,
        language,
        selectedMode,
        brevity,
        true,
        userMemory,
        activeConv?.summary,
        contextPackage
      );

      addMessageToActiveConversation({
        role: "assistant",
        content: response.reply,
        mode: selectedMode,
        isFallback: response.fallback,
      });

      // Background Memory Intelligence Pipeline:
      // 1. Auto-extract semantic facts if dialogue has progressed (>= 3 messages)
      const totalMessagesNow = (activeConv?.messages.length || 0) + 2;
      if (totalMessagesNow >= 4 && totalMessagesNow % 2 === 0) {
        setTimeout(() => {
          extractMemoriesFromCurrentConversation().catch(() => {});
        }, 1200);
      }

      // 2. Auto-summarize & generate Episodic Memory if session gets long (>= 8 messages)
      if (activeConv && activeConv.messages.length >= 8 && !activeConv.summary) {
        generateCurrentEpisodeBrief().catch(() => {
          summarizeActiveConversation().catch(() => {});
        });
      }

      if (response.reply.length > 100 && Math.random() > 0.6) {
        triggerConfetti();
      }
    } catch (err) {
      console.error("Chat error, applying resilient fallback:", err);
      const isOm = language === "om";
      const fallbackContent = isOm
        ? `### 🔍 QAXALE: Ibsa Bu'uuraa & Qorannoo
- **Yaada Bu'uuraa:** Dhimma kana irratti ragaa qabatamaa fi seera bu'uuraa qorachuun murteessaadha.
- **Wanta Hin Taane:** Tilmaama qofa irratti hundaa'uun balaa kasaaraa fida; daangaa qabeenyaa eeggadhu.
- **Ibsa Bal'aa:** 'Ibsa Taasisi' ykn 'Bal'inaan Ibsi' tuquun dhimma kana caalaatti gadi fageenyaan qoradhu.`
        : `### 🔍 QAXALE: Core Clarification & Analysis
- **Foundational Concept:** Evaluate verified facts, isolate primary variables, and maintain bounded risk.
- **Misconception:** Predictions are never guarantees; stochastic variance is always present.
- **Continuous Clarification:** Click 'Clarify & Demystify' or 'Detailed Description' below to continue breaking this down.`;

      addMessageToActiveConversation({
        role: "assistant",
        content: fallbackContent,
        mode: selectedMode,
        isFallback: true,
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

  const handleDirectFollowUp = async (promptText: string, modeOverride: ChatMode) => {
    setSelectedMode(modeOverride);
    addMessageToActiveConversation({
      role: "user",
      content: promptText,
      mode: modeOverride,
    });
    setIsLoading(true);

    try {
      const historyToSend = (activeConv?.messages || []).map((m) => ({
        role: m.role,
        content: m.content,
      }));
      historyToSend.push({ role: "user", content: promptText });

      const response = await sendChatMessage(
        historyToSend,
        language,
        modeOverride,
        brevity,
        true,
        userMemory,
        activeConv?.summary
      );

      addMessageToActiveConversation({
        role: "assistant",
        content: response.reply,
        mode: modeOverride,
        isFallback: response.fallback,
      });
    } catch (err) {
      console.error("Follow-up error, generating resilient continuation:", err);
      const isOm = language === "om";
      const fallbackContent = isOm
        ? `### 🔍 QAXALE: Ibsa Dabalataa & Caasaa (Resilient Mode)
**1. Maal Inni:** Dhimmi kun seera amansiisaa fi saayintifikii irratti kan hundaa'eedha.
**2. Wanta Hin Taane:** Dogoggora ilaalchaa fi odeeffannoo mirkana hin qabne irraa of eeggadhu.
**3. Qajeelfama:** Yeroo hunda qabeenya kee keessaa 1-2.5% caalaa balaaf hin saaxilin.
- Deebii dabalataaf 'Ibsa Taasisi' tuquun itti fufi.`
        : `### 🔍 QAXALE: Continuous Clarification (Resilient Mode)
**1. Core Mechanism:** Grounded in first-principles analysis and empirical validation.
**2. Demystification:** Delineate verified facts from assumption or gambler's fallacy.
**3. Operational Rule:** Strictly cap single-event exposure to under 2.5%.
- Click 'Clarify Further' to continue expanding consecutively.`;

      addMessageToActiveConversation({
        role: "assistant",
        content: fallbackContent,
        mode: modeOverride,
        isFallback: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * In-Place Connected Expansion:
   * Connects directly to the target assistant message and its previous description.
   * Expands in-place without generating a redundant duplicate response bubble in the chat!
   */
  const handleToggleMessageExpansion = async (
    targetMessage: ChatMessage,
    type: "describe" | "example" | "clarify"
  ) => {
    // 1. If currently active, clicking again collapses the panel
    if (targetMessage.activeExpansion === type) {
      updateMessageInActiveConversation(targetMessage.id, { activeExpansion: null });
      return;
    }

    // 2. If this message already has the requested content cached, simply switch active tab
    if (
      (type === "describe" && targetMessage.description) ||
      (type === "example" && targetMessage.example) ||
      (type === "clarify" && targetMessage.clarification)
    ) {
      updateMessageInActiveConversation(targetMessage.id, { activeExpansion: type });
      return;
    }

    // 3. Otherwise, generate connected expansion in-place without creating a new message
    setExpandingState({ messageId: targetMessage.id, type });
    const isOm = language === "om";

    let expansionInstruction = "";
    if (type === "describe") {
      expansionInstruction = isOm
        ? `Ibsa duraa "${targetMessage.content.slice(0, 120)}" jedhu wajjin kallattiin wal-qabsiisuun, caasaa fi qooda teeknikaa (internal anatomy & structural components) isaa bal'inaan qindeessi. Haasaa haaraa hin eegalin, caasaa qofa tarreessi.`
        : `Connected directly to the previous response above ("${targetMessage.content.slice(0, 120)}"), provide an in-depth structural anatomy and component-by-component description. Do not create a separate conversation turn; output the detailed breakdown directly.`;
    } else if (type === "example") {
      expansionInstruction = isOm
        ? `Ibsa duraa "${targetMessage.content.slice(0, 120)}" jedhu wajjin kallattiin wal-qabsiisuun, fakkeenya qabatamaa (concrete real-world applied scenario) tarkaanfii-tarkaanfiin qindeessi. Haasaa haaraa hin uumin.`
        : `Connected directly to the previous response above and its components, provide a concrete real-world applied walkthrough scenario with realistic actions and operational data. Do not start a separate conversation turn; provide the applied example directly.`;
    } else {
      expansionInstruction = isOm
        ? `Ibsa duraa "${targetMessage.content.slice(0, 120)}" jedhu ifa baasi: wanta inni ta'ee fi wanta inni hin taane (what it is vs what it is not), fi daangaa isaa adda baasi.`
        : `Connected directly to the previous response above, clarify and demystify: delineate what it is versus what it is NOT, addressing core misconceptions and setting firm boundaries.`;
    }

    try {
      const historyContext = (activeConv?.messages || [])
        .map((m) => ({ role: m.role, content: m.content }));
      historyContext.push({ role: "user", content: expansionInstruction });

      const res = await sendChatMessage(
        historyContext,
        language,
        type === "describe" ? "describe" : type === "example" ? "interpret-layers" : "clarify",
        "in-depth",
        true,
        userMemory,
        activeConv?.summary
      );

      const generatedText = res.reply.trim();
      updateMessageInActiveConversation(targetMessage.id, {
        [type === "describe" ? "description" : type === "example" ? "example" : "clarification"]: generatedText,
        activeExpansion: type,
      });
    } catch (err) {
      console.warn("Using resilient in-place connected expansion:", err);
      let resilientText = "";
      if (type === "describe") {
        resilientText = isOm
          ? `### 📖 Caasaa fi Qooda Teeknikaa (Connected Anatomy)
- **1. Bu'uura Hojii:** Sirni kun qajeelfama ifaa fi qindoomina qabuun hojjeta.
- **2. Caasaa Keessoo:** Qaamolee wal-deeggaran fi adeemsa tarkaanfii-tarkaanfiin qaba.
- **3. Sirna To'annoo:** Ragaa qabatamaa fi madaallii yeroo yeroodhaan gaggeeffamu irratti hundaa'a.`
          : `### 📖 Detailed Architecture & Structural Anatomy
- **1. Core Architectural Engine:** Structured upon verifiable mechanisms and deterministic invariants.
- **2. Internal Subsystems:** Segmented into execution telemetry, workflow pipelines, and policy guardrails.
- **3. Telemetry & Governance:** Enforces live validation, feedback loops, and strict error containment.`;
      } else if (type === "example") {
        resilientText = isOm
          ? `### 💡 Fakkeenya Qabatamaa (Applied Walkthrough)
- **Haala (Scenario):** Gareen dhimma kana hojiirra oolchuuf karoora qabatamaa baase.
- **Tarkaanfii 1:** Ragaa bu'uuraa walitti qabuun qorannoo jalqabaa taasisuu.
- **Tarkaanfii 2:** Bu'aa argame herreguun sadarkaa balaa (risk) to'achuu.
- **Bu'aa (Outcome):** Murtoo amansiisaa fi qajeelfama itti-gaafatamummaa qabuun xumurame.`
          : `### 💡 Real-World Applied Scenario & Walkthrough
- **Context:** An organization executes this strategy during high-stakes operations.
- **Phase 1 (Preparation):** Calibrate baseline variables and verify boundary invariants.
- **Phase 2 (Action):** Apply operational logic step-by-step with zero speculation.
- **Outcome:** Measured empirical results with verified risk containment.`;
      } else {
        resilientText = isOm
          ? `### 🔍 Ibsa Bu'uuraa & Ifa Baasuu (Clarification)
- **Wanta Inni Ta'e:** Qajeelfama saayintifikii fi ragaa qabatamaa irratti kan hundaa'e.
- **Wanta Hin Taane:** Tilmaama abaaramaa, mirkaneessa sobaa (false guarantee), ykn balaa hin qoratamne miti.
- **Daangaa:** Yeroo hunda madaallii qabeenyaa fi itti-gaafatamummaan raawwadhu.`
          : `### 🔍 Clarification & Demystification
- **What It Is:** An empirically grounded framework designed for deterministic decision-making.
- **What It Is NOT:** Not an infallible guarantee, speculation shortcut, or emotional impulse.
- **Key Boundary:** Always evaluate operational constraints and protect fundamental capital.`;
      }

      updateMessageInActiveConversation(targetMessage.id, {
        [type === "describe" ? "description" : type === "example" ? "example" : "clarification"]: resilientText,
        activeExpansion: type,
      });
    } finally {
      setExpandingState(null);
    }
  };

  /**
   * Action trigger from bottom toolbar:
   * Connects directly to latest assistant message, toggling its in-place expansion
   */
  const handleBottomToolbarAction = (type: "describe" | "example" | "clarify") => {
    const latestAssistantMessage = [...(activeConv?.messages || [])]
      .reverse()
      .find((m) => m.role === "assistant");

    if (latestAssistantMessage) {
      handleToggleMessageExpansion(latestAssistantMessage, type);
    } else {
      // If no assistant message yet, set input prompt
      if (type === "describe") {
        setInputMessage(language === "om" ? "Caasaa fi adeemsa isaa bal'inaan naaf ibsi" : "Describe the components and architecture in detail");
      } else if (type === "example") {
        setInputMessage(language === "om" ? "Fakkeenya qabatamaa naaf kenni" : "Give me a concrete real-world example");
      } else {
        setInputMessage(language === "om" ? "Ibsa taasisi: wanta inni ta'ee fi hin taane naaf ibsi" : "Please clarify: what it is and what it is not");
      }
    }
  };

  /**
   * Quick Input Helper for "Ibsa Taasisi":
   */
  const handleClarifyChipClick = () => {
    const current = inputMessage.trim();

    if (current) {
      setSelectedMode("clarify");
      setTimeout(() => {
        handleSendMessage();
      }, 0);
    } else {
      const latestAssistantMessage = [...(activeConv?.messages || [])]
        .reverse()
        .find((m) => m.role === "assistant");
      if (latestAssistantMessage) {
        handleToggleMessageExpansion(latestAssistantMessage, "clarify");
      } else {
        setInputMessage(language === "om" ? "Ibsa taasisi: wanta inni ta'ee fi hin taane naaf ibsi" : "Please clarify: what it is and what it is not");
      }
    }
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

        {/* Download App ZIP & + New Chat Controls */}
        <div className="flex items-center gap-1.5 shrink-0">
          <a
            href="/api/download-zip"
            download="qaxale-v3-source.zip"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-amber-500/50 text-slate-300 hover:text-amber-400 font-semibold text-xs shadow-sm transition-all active:scale-95"
            title={language === "om" ? "Koodii Appii Baafadhu (.zip)" : "Download Full App Source (.zip)"}
          >
            <Download className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">ZIP</span>
          </a>

          <button
            id="new-chat-btn"
            onClick={handleStartNewChat}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md transition-all active:scale-95"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>{language === "om" ? "+ Haasaa Haaraa" : "+ New Chat"}</span>
          </button>
        </div>
      </div>

      {/* Guest Mode Cloud Sync Callout */}
      {(!currentUser || currentUser.isAnonymous) && (
        <div className="flex items-center justify-between gap-2 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/25 text-amber-300 text-xs shrink-0 animate-in fade-in">
          <div className="flex items-center gap-1.5 min-w-0">
            <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span className="text-[11px] truncate">
              {language === "om"
                ? "Akka keessummaatti seenteera. Haasaa kuusuuf galmaa'aa."
                : "Guest session. Sign in to sync your chats across devices."}
            </span>
          </div>
          <button
            onClick={() => setShowAuthModal(true)}
            className="px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-[10px] shrink-0 transition-all active:scale-95"
          >
            {language === "om" ? "Seeni" : "Sign In"}
          </button>
        </div>
      )}

      {/* Cognitive Memory & Memory Brief Bar */}
      <div className="flex items-center justify-between gap-2 px-3 py-1.5 rounded-xl bg-slate-900/60 border border-slate-800 text-xs">
        <button
          onClick={() => setShowMemoryModal(true)}
          className="flex items-center gap-1.5 text-slate-300 hover:text-amber-400 transition-colors truncate"
          title={language === "om" ? "Kuusaa Yaadaa fi Qindaa'ina Profile Bani" : "Open Memory & Profile Inspector"}
        >
          <Brain className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span className="font-semibold text-[11px] truncate">
            {language === "om" ? "Kuusaa Yaadaa:" : "Memory:"}
          </span>
          <span className="text-[10px] bg-amber-500/10 text-amber-300 px-1.5 py-0.2 rounded border border-amber-500/20 font-mono capitalize">
            {userMemory.knowledgeLevel}
          </span>
          <span className="text-[10px] bg-emerald-500/10 text-emerald-300 px-1.5 py-0.2 rounded border border-emerald-500/20 font-mono hidden sm:inline">
            {userMemory.bankrollLimitPct}% Cap
          </span>
          <span className="text-[10px] text-slate-400 font-mono hidden md:inline">
            ({userMemory.rememberedFacts.length} {language === "om" ? "ragaa" : "facts"})
          </span>
        </button>

        <div className="flex items-center gap-1.5 shrink-0">
          {activeConv?.summary && (
            <button
              onClick={() => setShowBriefExpanded(!showBriefExpanded)}
              className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 hover:bg-indigo-500/30 transition-colors"
            >
              {showBriefExpanded
                ? language === "om"
                  ? "Cuunfaa Dhoksi"
                  : "Hide Brief"
                : language === "om"
                ? "Cuunfaa Ilaali"
                : "View Brief"}
            </button>
          )}

          <button
            onClick={async () => {
              setIsCompressing(true);
              await summarizeActiveConversation();
              setIsCompressing(false);
            }}
            disabled={isCompressing || !activeConv || activeConv.messages.length < 2}
            className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors disabled:opacity-40 flex items-center gap-1"
            title={language === "om" ? "Haasaa cuunfuun kuusaa yaadaa haaromsi" : "Compress dialogue into Memory Brief"}
          >
            <RefreshCw className={`w-2.5 h-2.5 ${isCompressing ? "animate-spin" : ""}`} />
            <span>
              {isCompressing
                ? language === "om"
                  ? "Cuunfaa..."
                  : "Compressing..."
                : language === "om"
                ? "Cuunfi"
                : "Compress"}
            </span>
          </button>
        </div>
      </div>

      {/* Expandable Memory Brief Box */}
      {showBriefExpanded && activeConv?.summary && (
        <div className="p-3 rounded-2xl bg-gradient-to-r from-indigo-950/40 via-slate-900 to-slate-950 border border-indigo-500/30 text-xs text-slate-300 space-y-1.5 animate-in fade-in slide-in-from-top-1 duration-150">
          <div className="flex items-center justify-between text-[11px] font-bold text-indigo-300">
            <span className="flex items-center gap-1">
              <FileText className="w-3 h-3 text-indigo-400" />
              {language === "om"
                ? "Cuunfaa Yaada Haasaa (Distilled Memory Brief)"
                : "Distilled Conversation Memory Brief"}
            </span>
            <span className="text-[10px] font-mono text-slate-500">Injected into system prompt</span>
          </div>
          <p className="leading-relaxed text-[11px] text-slate-300">{activeConv.summary}</p>
          {activeConv.keyTakeaways && activeConv.keyTakeaways.length > 0 && (
            <div className="pt-1 border-t border-indigo-900/40">
              <ul className="text-[10px] text-slate-400 space-y-0.5 list-disc list-inside">
                {activeConv.keyTakeaways.map((t, idx) => (
                  <li key={idx}>{t}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

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

      {/* Brevity & Response Style Bar */}
      <div className="flex items-center justify-between gap-2 px-1 text-[11px] text-slate-400 shrink-0">
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
          {language === "om" ? "Bifa Deebii:" : "Response Style:"}
        </span>
        <div className="flex items-center gap-1 bg-slate-900/90 p-0.5 rounded-lg border border-slate-800">
          {[
            { id: "concise" as ResponseBrevity, label: { om: "Gabaabaa (Concise)", en: "Concise (Direct)" } },
            { id: "standard" as ResponseBrevity, label: { om: "Giddu-galeessa", en: "Standard" } },
            { id: "detailed" as ResponseBrevity, label: { om: "Bal'aa", en: "Detailed" } },
          ].map((b) => (
            <button
              key={b.id}
              type="button"
              onClick={() => setBrevity(b.id)}
              className={`px-2 py-0.5 rounded text-[10px] font-semibold transition-colors ${
                brevity === b.id
                  ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              {b.label[language]}
            </button>
          ))}
        </div>
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

                {/* Clarification & Description Action Chips */}
                {isAssistant && msg.content.length > 25 && (
                  <div className="pt-2 border-t border-slate-800/60 flex flex-wrap items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleToggleMessageExpansion(msg, "clarify")}
                      disabled={expandingState?.messageId === msg.id}
                      className={`px-2 py-0.5 rounded-lg text-[10px] font-medium flex items-center gap-1 transition-all active:scale-95 border ${
                        msg.activeExpansion === "clarify"
                          ? "bg-indigo-500/25 text-indigo-200 border-indigo-400 font-semibold shadow-sm"
                          : "bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border-indigo-500/20"
                      }`}
                      title={language === "om" ? "Dogoggora beekamaa ifa baasuu" : "Demystify common misconceptions"}
                    >
                      <HelpCircle className="w-2.5 h-2.5 text-indigo-400" />
                      <span>{language === "om" ? "🔍 Ibsa Taasisi" : "🔍 Clarify & Demystify"}</span>
                      {msg.activeExpansion === "clarify" && <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleToggleMessageExpansion(msg, "describe")}
                      disabled={expandingState?.messageId === msg.id}
                      className={`px-2 py-0.5 rounded-lg text-[10px] font-medium flex items-center gap-1 transition-all active:scale-95 border ${
                        msg.activeExpansion === "describe"
                          ? "bg-amber-500/25 text-amber-200 border-amber-400 font-semibold shadow-sm"
                          : "bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border-amber-500/20"
                      }`}
                      title={language === "om" ? "Caasaa fi adeemsa bal'inaan ibsuu" : "In-depth descriptive anatomy & scenario"}
                    >
                      <BookOpen className="w-2.5 h-2.5 text-amber-400" />
                      <span>{language === "om" ? "📖 Caasaa Ibsi" : "📖 Detailed Description"}</span>
                      {msg.activeExpansion === "describe" && <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleToggleMessageExpansion(msg, "example")}
                      disabled={expandingState?.messageId === msg.id}
                      className={`px-2 py-0.5 rounded-lg text-[10px] font-medium flex items-center gap-1 transition-all active:scale-95 border ${
                        msg.activeExpansion === "example"
                          ? "bg-emerald-500/25 text-emerald-200 border-emerald-400 font-semibold shadow-sm"
                          : "bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border-emerald-500/20"
                      }`}
                      title={language === "om" ? "Fakkeenya qabatamaa kenni" : "Provide concrete real-world example"}
                    >
                      <Lightbulb className="w-2.5 h-2.5 text-emerald-400" />
                      <span>{language === "om" ? "💡 Fakkeenya Qabatamaa" : "💡 Real Example"}</span>
                      {msg.activeExpansion === "example" && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />}
                    </button>

                    {msg.isFallback && (
                      <button
                        type="button"
                        onClick={() => handleToggleMessageExpansion(msg, "describe")}
                        className="px-2 py-0.5 rounded-lg bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/30 text-[10px] font-semibold flex items-center gap-1 transition-colors active:scale-95 animate-pulse"
                        title={language === "om" ? "Irra deebi'ii bal'inaan ibsi" : "Continuously clarify without failing"}
                      >
                        <RefreshCw className="w-2.5 h-2.5 text-rose-400" />
                        <span>{language === "om" ? "🔄 Irra Deebi'ii Ibsi" : "🔄 Retry & Deepen"}</span>
                      </button>
                    )}
                  </div>
                )}

                {/* In-place Expanding Progress Loader */}
                {expandingState?.messageId === msg.id && (
                  <div className="p-2.5 rounded-xl bg-slate-950/90 border border-amber-500/30 flex items-center gap-2 text-[11px] text-amber-300 animate-in fade-in duration-150">
                    <div className="w-3 h-3 border-2 border-amber-400 border-t-transparent rounded-full animate-spin shrink-0" />
                    <span>
                      {language === "om"
                        ? `Qaxale V3: ${
                            expandingState.type === "describe"
                              ? "Caasaa fi qooda teeknikaa duraan jiru wajjin qindeessaa jira..."
                              : expandingState.type === "example"
                              ? "Fakkeenya qabatamaa duraan jiru wajjin qindeessaa jira..."
                              : "Ibsa bu'uuraa duraan jiru wajjin qorachaa jira..."
                          }`
                        : `QAXALE V3: Connecting ${
                            expandingState.type === "describe"
                              ? "detailed description"
                              : expandingState.type === "example"
                              ? "real example"
                              : "clarification"
                          } to previous chat...`}
                    </span>
                  </div>
                )}

                {/* In-place Connected Expansion Accordion Panel */}
                {isAssistant && msg.activeExpansion && (
                  <div
                    className={`p-3 rounded-xl border text-xs leading-relaxed space-y-2 transition-all animate-in fade-in slide-in-from-top-1 duration-200 ${
                      msg.activeExpansion === "describe"
                        ? "bg-amber-950/20 border-amber-500/40 text-amber-100"
                        : msg.activeExpansion === "example"
                        ? "bg-emerald-950/20 border-emerald-500/40 text-emerald-100"
                        : "bg-indigo-950/20 border-indigo-500/40 text-indigo-100"
                    }`}
                  >
                    <div className="flex items-center justify-between pb-1.5 border-b border-white/10 text-[11px] font-bold">
                      <div className="flex items-center gap-1.5">
                        {msg.activeExpansion === "describe" && (
                          <>
                            <BookOpen className="w-3.5 h-3.5 text-amber-400" />
                            <span className="text-amber-300">
                              {language === "om" ? "📖 Caasaa fi Xiinxala Bal'aa" : "📖 Detailed Structural Breakdown"}
                            </span>
                          </>
                        )}
                        {msg.activeExpansion === "example" && (
                          <>
                            <Lightbulb className="w-3.5 h-3.5 text-emerald-400" />
                            <span className="text-emerald-300">
                              {language === "om" ? "💡 Fakkeenya Qabatamaa" : "💡 Real-World Applied Scenario"}
                            </span>
                          </>
                        )}
                        {msg.activeExpansion === "clarify" && (
                          <>
                            <HelpCircle className="w-3.5 h-3.5 text-indigo-400" />
                            <span className="text-indigo-300">
                              {language === "om" ? "🔍 Ibsa Bu'uuraa & Daangaa" : "🔍 Clarification & Demystification"}
                            </span>
                          </>
                        )}
                        <span className="text-[9px] font-normal opacity-60 ml-1">
                          ({language === "om" ? "Haasaa duraa wajjin wal-qabata" : "Connected to previous chat"})
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            const text =
                              msg.activeExpansion === "describe"
                                ? msg.description
                                : msg.activeExpansion === "example"
                                ? msg.example
                                : msg.clarification;
                            if (text) speakText(text, language);
                          }}
                          className="opacity-70 hover:opacity-100 transition-opacity p-0.5 rounded"
                          title="Speak"
                        >
                          <Volume2 className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const text =
                              msg.activeExpansion === "describe"
                                ? msg.description
                                : msg.activeExpansion === "example"
                                ? msg.example
                                : msg.clarification;
                            if (text) handleCopyText(`${msg.id}-expansion`, text);
                          }}
                          className="opacity-70 hover:opacity-100 transition-opacity p-0.5 rounded"
                          title="Copy"
                        >
                          {copiedId === `${msg.id}-expansion` ? (
                            <Check className="w-3 h-3 text-emerald-400" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            updateMessageInActiveConversation(msg.id, { activeExpansion: null })
                          }
                          className="opacity-60 hover:opacity-100 p-0.5 rounded transition-opacity"
                          title="Collapse"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="whitespace-pre-wrap text-[11.5px] leading-relaxed">
                      {msg.activeExpansion === "describe" && (msg.description || "No description yet.")}
                      {msg.activeExpansion === "example" && (msg.example || "No example yet.")}
                      {msg.activeExpansion === "clarify" && (msg.clarification || "No clarification yet.")}
                    </div>
                  </div>
                )}

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

      {/* Non-intrusive Quick Clarification & Continuation Shortcuts */}
      {activeConv && activeConv.messages.length > 0 && (
        <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 no-scrollbar text-[11px] shrink-0">
          <span className="text-[10px] font-semibold text-slate-500 shrink-0">
            {language === "om" ? "Ibsa & Itti Fufi:" : "Clarify & Continue:"}
          </span>
          <button
            type="button"
            onClick={() => handleBottomToolbarAction("clarify")}
            disabled={isLoading}
            className="px-2.5 py-1 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/20 text-[10px] font-medium flex items-center gap-1 whitespace-nowrap transition-colors active:scale-95 disabled:opacity-50"
            title={language === "om" ? "Dogoggora beekamaa ifa baasuu" : "Demystify common misconceptions"}
          >
            <HelpCircle className="w-2.5 h-2.5 text-indigo-400" />
            <span>{language === "om" ? "🔍 Ibsa Taasisi" : "🔍 Clarify & Demystify"}</span>
          </button>
          <button
            type="button"
            onClick={() => handleBottomToolbarAction("describe")}
            disabled={isLoading}
            className="px-2.5 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/20 text-[10px] font-medium flex items-center gap-1 whitespace-nowrap transition-colors active:scale-95 disabled:opacity-50"
            title={language === "om" ? "Caasaa fi adeemsa bal'inaan ibsuu" : "In-depth descriptive anatomy & scenario"}
          >
            <BookOpen className="w-2.5 h-2.5 text-amber-400" />
            <span>{language === "om" ? "📖 Bal'inaan Ibsi" : "📖 Detailed Description"}</span>
          </button>
          <button
            type="button"
            onClick={() => handleBottomToolbarAction("example")}
            disabled={isLoading}
            className="px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/20 text-[10px] font-medium flex items-center gap-1 whitespace-nowrap transition-colors active:scale-95 disabled:opacity-50"
            title={language === "om" ? "Fakkeenya qabatamaa kenni" : "Provide concrete real-world example"}
          >
            <Lightbulb className="w-2.5 h-2.5 text-emerald-400" />
            <span>{language === "om" ? "💡 Fakkeenya Qabatamaa" : "💡 Real Example"}</span>
          </button>
        </div>
      )}

      {/* Input Field & File Upload Controls */}
      <form onSubmit={handleSendMessage} className="shrink-0 flex items-center gap-2 pt-1">
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
              ? "Wanta tokko gaafadhaa, ykn 'Ibsa Taasisi' tuqaa..."
              : "Ask questions, paste code, or tap 'Clarify'..."
          }
          className="flex-1 bg-slate-900/90 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/70 transition-colors shadow-inner"
        />

        {/* Inline "Ibsa Taasisi" Clarify & Describe Button */}
        <button
          id="chat-clarify-btn"
          type="button"
          onClick={handleClarifyChipClick}
          disabled={isLoading}
          className="px-3 py-2.5 bg-indigo-950/80 hover:bg-indigo-900 border border-indigo-700/50 hover:border-indigo-500 text-indigo-300 font-semibold rounded-xl flex items-center gap-1.5 transition-all shadow-sm text-xs shrink-0 active:scale-95 disabled:opacity-50"
          title={
            language === "om"
              ? "Ibsa Taasisi: Gaaffii keessan bal'inaan deconstruct godhaa ykn yaada darbe qoradhaa"
              : "Clarify & Describe: Expand in-depth or deconstruct previous answer"
          }
        >
          <HelpCircle className="w-3.5 h-3.5 text-indigo-400" />
          <span className="hidden sm:inline">
            {language === "om" ? "Ibsa Taasisi" : "Clarify"}
          </span>
        </button>

        <button
          id="chat-send-btn"
          type="submit"
          disabled={isLoading || (!inputMessage.trim() && attachments.length === 0)}
          className="px-3.5 py-2.5 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-bold rounded-xl flex items-center justify-center transition-all shadow-md active:scale-95 shrink-0"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>

      {/* Memory & Profile Inspector Modal */}
      <MemoryInspectorModal
        isOpen={showMemoryModal}
        onClose={() => setShowMemoryModal(false)}
      />
    </div>
  );
};
