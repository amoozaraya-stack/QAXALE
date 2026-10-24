import React, { useState } from "react";
import {
  Brain,
  X,
  Plus,
  Trash2,
  ShieldCheck,
  Sparkles,
  Info,
  CheckCircle2,
  Lock,
  Layers,
  FileText,
  RefreshCw,
  Search,
  Filter,
  Tag,
  Target,
  Compass,
  Code2,
  GraduationCap,
  MessageSquare,
  AlertTriangle,
  Calendar,
} from "lucide-react";
import { useApp } from "../context/AppContext";
import { MemoryCategory, SemanticMemoryItem } from "../types";

interface MemoryInspectorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CATEGORY_META: Record<
  MemoryCategory,
  { labelOm: string; labelEn: string; icon: React.ElementType; color: string }
> = {
  personalization: {
    labelOm: "Dhuunfaa & Risk",
    labelEn: "Personalization & Risk",
    icon: ShieldCheck,
    color: "emerald",
  },
  goals: {
    labelOm: "Galma & Kaayyoo",
    labelEn: "Goals & Targets",
    icon: Target,
    color: "amber",
  },
  interests: {
    labelOm: "Fedhii & Xiyyeeffannoo",
    labelEn: "Domain Interests",
    icon: Compass,
    color: "blue",
  },
  projects: {
    labelOm: "Pirojektii & Koodii",
    labelEn: "Projects & Tech Stack",
    icon: Code2,
    color: "purple",
  },
  learning: {
    labelOm: "Barnoota & Sadarkaa",
    labelEn: "Learning Mastery",
    icon: GraduationCap,
    color: "indigo",
  },
  communication: {
    labelOm: "Afaan & Akkaataa",
    labelEn: "Language & Style",
    icon: MessageSquare,
    color: "pink",
  },
  facts: {
    labelOm: "Dhugaa & Qajeelfama",
    labelEn: "Verified Facts",
    icon: Layers,
    color: "cyan",
  },
};

export const MemoryInspectorModal: React.FC<MemoryInspectorModalProps> = ({
  isOpen,
  onClose,
}) => {
  const {
    language,
    userMemory,
    updateUserMemory,
    semanticMemories,
    episodicMemories,
    isMemoryExtracting,
    addSemanticMemory,
    updateSemanticMemory,
    deleteSemanticMemory,
    clearAllMemories,
    extractMemoriesFromCurrentConversation,
    generateCurrentEpisodeBrief,
    conversations,
    activeConversationId,
  } = useApp();

  const [activeTab, setActiveTab] = useState<"semantic" | "episodic" | "working">("semantic");
  const [selectedCategory, setSelectedCategory] = useState<MemoryCategory | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [newContent, setNewContent] = useState("");
  const [newCategory, setNewCategory] = useState<MemoryCategory>("personalization");
  const [newTags, setNewTags] = useState("");
  const [extractSuccessMsg, setExtractSuccessMsg] = useState<string | null>(null);
  const [isEpisodeGenerating, setIsEpisodeGenerating] = useState(false);
  const [confirmClearOpen, setConfirmClearOpen] = useState(false);

  if (!isOpen) return null;

  const isOm = language === "om";
  const activeConv = conversations.find((c) => c.id === activeConversationId);

  // Filter semantic memories
  const filteredMemories = semanticMemories.filter((m) => {
    if (selectedCategory !== "all" && m.category !== selectedCategory) return false;
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const inContent = m.content.toLowerCase().includes(q);
    const inTags = (m.tags || []).some((t) => t.toLowerCase().includes(q));
    return inContent || inTags;
  });

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContent.trim()) return;

    const tags = newTags
      .split(",")
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    await addSemanticMemory({
      category: newCategory,
      content: newContent.trim(),
      confidence: 1.0,
      source: "manual",
      tags,
      isActive: true,
    });

    setNewContent("");
    setNewTags("");
    setShowAddForm(false);
  };

  const handleTriggerExtract = async () => {
    setExtractSuccessMsg(null);
    try {
      const count = await extractMemoriesFromCurrentConversation();
      if (count > 0) {
        setExtractSuccessMsg(
          isOm
            ? `Hubannoon haaraa ${count} haasaa kana irraa milkaa'inaan kuufameera!`
            : `Extracted ${count} new durable knowledge fact(s) from active chat!`
        );
      } else {
        setExtractSuccessMsg(
          isOm
            ? "Ergaa haaraa kuufamu hin argamne ykn haasaan gahaa miti."
            : "No new durable facts detected in recent turns."
        );
      }
    } catch {
      setExtractSuccessMsg(isOm ? "Dogoggorri uumameera." : "Extraction failed.");
    }
  };

  const handleTriggerEpisode = async () => {
    setIsEpisodeGenerating(true);
    setExtractSuccessMsg(null);
    try {
      const ep = await generateCurrentEpisodeBrief();
      if (ep) {
        setExtractSuccessMsg(
          isOm
            ? `Cuunfaan session "${ep.title}" kuusaa Episodic keessatti qindaa'eera!`
            : `Episodic session brief "${ep.title}" generated successfully!`
        );
      } else {
        setExtractSuccessMsg(
          isOm ? "Ergaa gahaa hin qabu." : "Not enough messages to summarize."
        );
      }
    } finally {
      setIsEpisodeGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl max-h-[92vh] flex flex-col bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-gradient-to-r from-amber-500/10 via-slate-900 to-indigo-950/30">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 shadow-inner">
              <Brain className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white">
                  {isOm ? "Kuusaa Yaadaa & Context Intelligence" : "Advanced Memory & Context Intelligence"}
                </h3>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/30 font-mono">
                  3-Layer Active
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {isOm
                  ? "Yaadannoo yeroo dheeraa, cuunfaa haasaa, fi dhuunfeeffannaa to'adhu."
                  : "Inspect, manage, and audit 3-layer persistent memory across conversations."}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-800 bg-slate-950/50 px-3 pt-2 gap-2 text-xs">
          <button
            type="button"
            onClick={() => setActiveTab("semantic")}
            className={`pb-2.5 px-3 font-bold border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === "semantic"
                ? "border-amber-400 text-amber-300"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isOm ? "Layer 3: Dhugaa & Dhuunfaa" : "Layer 3: Semantic Memory"}</span>
            <span className="text-[10px] bg-slate-800 px-1.5 py-0.2 rounded-full">
              {semanticMemories.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("episodic")}
            className={`pb-2.5 px-3 font-bold border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === "episodic"
                ? "border-indigo-400 text-indigo-300"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>{isOm ? "Layer 2: Cuunfaa Session" : "Layer 2: Episodic Memory"}</span>
            <span className="text-[10px] bg-slate-800 px-1.5 py-0.2 rounded-full">
              {episodicMemories.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("working")}
            className={`pb-2.5 px-3 font-bold border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === "working"
                ? "border-emerald-400 text-emerald-300"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>{isOm ? "Layer 1 & Seera" : "Layer 1 & Risk Controls"}</span>
          </button>
        </div>

        {/* Feedback Alert if available */}
        {extractSuccessMsg && (
          <div className="mx-4 mt-3 p-2.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-200 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
              <span>{extractSuccessMsg}</span>
            </div>
            <button
              onClick={() => setExtractSuccessMsg(null)}
              className="text-amber-400 hover:text-white p-1"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        )}

        {/* Modal Content */}
        <div className="p-4 overflow-y-auto space-y-4 flex-1">
          {/* TAB 1: SEMANTIC MEMORY */}
          {activeTab === "semantic" && (
            <div className="space-y-3.5">
              {/* Actions & Search Header */}
              <div className="flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center justify-between">
                <div className="relative flex-1">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="text"
                    placeholder={isOm ? "Yaadannoowwan barbaadi..." : "Search persistent memories..."}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={handleTriggerExtract}
                    disabled={isMemoryExtracting || !activeConv || activeConv.messages.length < 2}
                    className="px-2.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 transition-all disabled:opacity-50 active:scale-95 shadow-sm"
                    title="Extract durable facts from active chat using AI"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isMemoryExtracting ? "animate-spin" : ""}`} />
                    <span>{isMemoryExtracting ? (isOm ? "Qorannoo..." : "Extracting...") : (isOm ? "Haasaa Irraa Qori" : "Extract from Chat")}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowAddForm(!showAddForm)}
                    className="px-2.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1 transition-all active:scale-95 shadow-sm"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{isOm ? "Dabali" : "Add Fact"}</span>
                  </button>
                </div>
              </div>

              {/* Category Filter Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px] no-scrollbar">
                <button
                  type="button"
                  onClick={() => setSelectedCategory("all")}
                  className={`px-2.5 py-1 rounded-full border transition-all shrink-0 ${
                    selectedCategory === "all"
                      ? "bg-amber-500/20 text-amber-300 border-amber-500/40 font-bold"
                      : "bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200"
                  }`}
                >
                  {isOm ? "Hunda" : "All"} ({semanticMemories.length})
                </button>
                {(Object.keys(CATEGORY_META) as MemoryCategory[]).map((cat) => {
                  const meta = CATEGORY_META[cat];
                  const count = semanticMemories.filter((m) => m.category === cat).length;
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-2.5 py-1 rounded-full border transition-all shrink-0 flex items-center gap-1 ${
                        selectedCategory === cat
                          ? "bg-slate-800 text-white border-amber-400 font-bold"
                          : "bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200"
                      }`}
                    >
                      <span>{isOm ? meta.labelOm : meta.labelEn}</span>
                      <span className="text-[10px] text-slate-500">({count})</span>
                    </button>
                  );
                })}
              </div>

              {/* Add Memory Form Dropdown */}
              {showAddForm && (
                <form
                  onSubmit={handleAddSubmit}
                  className="p-3.5 rounded-2xl bg-slate-950 border border-amber-500/30 space-y-2.5 animate-in fade-in"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                      <Plus className="w-3.5 h-3.5" />
                      <span>{isOm ? "Yaadannoo Haaraa Galchi" : "Add New Long-Term Memory"}</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowAddForm(false)}
                      className="text-slate-500 hover:text-slate-300 text-xs"
                    >
                      {isOm ? "Dhiisi" : "Cancel"}
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] text-slate-400 font-bold uppercase">
                        {isOm ? "Ramaddii (Category)" : "Category"}
                      </label>
                      <select
                        value={newCategory}
                        onChange={(e) => setNewCategory(e.target.value as MemoryCategory)}
                        className="w-full mt-1 bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-amber-400"
                      >
                        {(Object.keys(CATEGORY_META) as MemoryCategory[]).map((cat) => (
                          <option key={cat} value={cat}>
                            {isOm ? CATEGORY_META[cat].labelOm : CATEGORY_META[cat].labelEn}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] text-slate-400 font-bold uppercase">
                        {isOm ? "Asxaa (Tags - comaadhaan adda baasi)" : "Tags (comma separated)"}
                      </label>
                      <input
                        type="text"
                        placeholder="python, probability, risk"
                        value={newTags}
                        onChange={(e) => setNewTags(e.target.value)}
                        className="w-full mt-1 bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-amber-400"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-400 font-bold uppercase">
                      {isOm ? "Qabiyyee Yaadannoo (Content)" : "Memory Statement"}
                    </label>
                    <textarea
                      rows={2}
                      placeholder={
                        isOm
                          ? "Fkn: Koodii Python keessatti shallaggii carraa fi Kelly Criterion fayyadamuu barbaada..."
                          : "e.g. User applies Half-Kelly position sizing and studies Python probability engines..."
                      }
                      value={newContent}
                      onChange={(e) => setNewContent(e.target.value)}
                      className="w-full mt-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400 resize-none"
                    />
                  </div>

                  <div className="flex justify-end gap-2">
                    <button
                      type="submit"
                      className="px-4 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1 transition-all"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{isOm ? "Kuusi" : "Save Fact"}</span>
                    </button>
                  </div>
                </form>
              )}

              {/* Memory List */}
              <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
                {filteredMemories.length === 0 ? (
                  <div className="p-8 text-center bg-slate-950/60 rounded-2xl border border-slate-800/80">
                    <Brain className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                    <p className="text-xs text-slate-400 font-medium">
                      {isOm
                        ? "Yaadannoon ramaddii kana keessatti hin argamne."
                        : "No semantic memories match this filter."}
                    </p>
                    <p className="text-[11px] text-slate-500 mt-1">
                      {isOm
                        ? "'Dabali' tuquun dabaladhu ykn 'Haasaa Irraa Qori' jedhi."
                        : "Click 'Add Fact' or 'Extract from Chat' to add durable knowledge."}
                    </p>
                  </div>
                ) : (
                  filteredMemories.map((mem) => {
                    const meta = CATEGORY_META[mem.category] || CATEGORY_META.facts;
                    const Icon = meta.icon;
                    return (
                      <div
                        key={mem.id}
                        className={`p-3 rounded-2xl border transition-all ${
                          mem.isActive
                            ? "bg-slate-950 border-slate-800 hover:border-slate-700"
                            : "bg-slate-950/40 border-slate-800/50 opacity-60"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-start gap-2.5 min-w-0">
                            <div className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-amber-400 shrink-0 mt-0.5">
                              <Icon className="w-3.5 h-3.5" />
                            </div>
                            <div className="min-w-0 space-y-1">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="text-[10px] font-bold text-slate-300 uppercase tracking-wider bg-slate-900 px-2 py-0.5 rounded-md border border-slate-800">
                                  {isOm ? meta.labelOm : meta.labelEn}
                                </span>
                                <span className="text-[10px] text-emerald-400 font-mono bg-emerald-500/10 px-1.5 py-0.2 rounded border border-emerald-500/20">
                                  {Math.round(mem.confidence * 100)}% Conf
                                </span>
                                <span className="text-[10px] text-slate-500 font-mono">
                                  {mem.source}
                                </span>
                                {!mem.isActive && (
                                  <span className="text-[10px] text-rose-400 bg-rose-500/10 px-1.5 py-0.2 rounded border border-rose-500/20">
                                    Superseded
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-slate-200 leading-relaxed font-normal">
                                {mem.content}
                              </p>
                              {mem.tags && mem.tags.length > 0 && (
                                <div className="flex items-center gap-1 flex-wrap pt-0.5">
                                  {mem.tags.map((t, idx) => (
                                    <span
                                      key={idx}
                                      className="text-[10px] text-slate-400 bg-slate-900 px-1.5 py-0.2 rounded border border-slate-800/80"
                                    >
                                      #{t}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              type="button"
                              onClick={() => updateSemanticMemory(mem.id, { isActive: !mem.isActive })}
                              className={`text-[10px] font-bold px-2 py-1 rounded-lg border transition-all ${
                                mem.isActive
                                  ? "bg-slate-900 text-slate-400 border-slate-800 hover:text-white"
                                  : "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                              }`}
                              title={mem.isActive ? "Deactivate" : "Re-activate"}
                            >
                              {mem.isActive ? (isOm ? "Dhaabi" : "Pause") : (isOm ? "Jalqabi" : "Active")}
                            </button>
                            <button
                              type="button"
                              onClick={() => deleteSemanticMemory(mem.id)}
                              className="text-slate-500 hover:text-rose-400 p-1.5 rounded-lg hover:bg-slate-900 transition-colors"
                              title="Delete Memory"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* TAB 2: EPISODIC MEMORY */}
          {activeTab === "episodic" && (
            <div className="space-y-3.5">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-indigo-400" />
                    <span>{isOm ? "Cuunfaa Haasaawwan Darbanii" : "Episodic Session Briefs"}</span>
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {isOm
                      ? "QAXALE waliin-haasaawwan gurguddoo cuunfee akka context dabalataatti yeroo hunda fayyadama."
                      : "QAXALE retrieves past session summaries to maintain continuity across days."}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleTriggerEpisode}
                  disabled={isEpisodeGenerating || !activeConv || activeConv.messages.length < 2}
                  className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 transition-all disabled:opacity-50 active:scale-95 shadow-sm"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isEpisodeGenerating ? "animate-spin" : ""}`} />
                  <span>{isEpisodeGenerating ? (isOm ? "Cuunfaa..." : "Summarizing...") : (isOm ? "Session Ammaa Cuunfi" : "Brief Current Chat")}</span>
                </button>
              </div>

              {/* Episodic Items List */}
              <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
                {episodicMemories.length === 0 ? (
                  <div className="p-8 text-center bg-slate-950/60 rounded-2xl border border-slate-800/80">
                    <FileText className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                    <p className="text-xs text-slate-400 font-medium">
                      {isOm
                        ? "Ammaaf cuunfaan episodic hin jiru."
                        : "No episodic session briefs generated yet."}
                    </p>
                    <p className="text-[11px] text-slate-500 mt-1">
                      {isOm
                        ? "Haasaan yoo dheeratu QAXALE ofumaan cuunfa; ykn 'Session Ammaa Cuunfi' jedhi."
                        : "Click 'Brief Current Chat' to distill this session into an episodic memory."}
                    </p>
                  </div>
                ) : (
                  episodicMemories.map((ep) => (
                    <div
                      key={ep.id}
                      className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="p-1 rounded-md bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                            <Brain className="w-3.5 h-3.5" />
                          </span>
                          <h5 className="text-xs font-bold text-white truncate">{ep.title}</h5>
                        </div>
                        <span className="text-[10px] text-slate-500 flex items-center gap-1 font-mono">
                          <Calendar className="w-3 h-3" />
                          <span>{new Date(ep.timestamp).toLocaleDateString()}</span>
                        </span>
                      </div>

                      <p className="text-xs text-slate-300 leading-relaxed bg-slate-900/60 p-2.5 rounded-xl border border-slate-800/80">
                        {ep.summary}
                      </p>

                      {ep.keyTakeaways && ep.keyTakeaways.length > 0 && (
                        <div className="space-y-1 pt-1">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                            {isOm ? "Qabxiilee Murteessoo:" : "Key Takeaways & Decisions:"}
                          </span>
                          <ul className="space-y-0.5 text-[11px] text-slate-300 list-disc list-inside">
                            {ep.keyTakeaways.map((k, i) => (
                              <li key={i}>{k}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {ep.topics && ep.topics.length > 0 && (
                        <div className="flex items-center gap-1 flex-wrap pt-1">
                          {ep.topics.map((t, i) => (
                            <span
                              key={i}
                              className="text-[10px] text-indigo-300 bg-indigo-500/10 px-2 py-0.5 rounded-md border border-indigo-500/20"
                            >
                              {t}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 3: WORKING CONTEXT & POLICIES */}
          {activeTab === "working" && (
            <div className="space-y-4">
              {/* Knowledge Level Selector */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>{isOm ? "Sadarkaa Hubannoo (Knowledge Level)" : "Knowledge Level"}</span>
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(["beginner", "intermediate", "advanced"] as const).map((lvl) => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => updateUserMemory({ knowledgeLevel: lvl })}
                      className={`p-2.5 rounded-xl border text-xs font-bold capitalize transition-all ${
                        userMemory.knowledgeLevel === lvl
                          ? "bg-amber-500/20 border-amber-400 text-amber-300"
                          : "bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
              </div>

              {/* Risk Policy & Bankroll Limit */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{isOm ? "Seera Daangaa Balaa (Risk Policy)" : "Risk Policy & Capital Preserver"}</span>
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(
                    [
                      { id: "conservative", label: "Conservative (Half-Kelly)" },
                      { id: "moderate", label: "Moderate (Standard)" },
                      { id: "educational-only", label: "Strict Educational" },
                    ] as const
                  ).map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => updateUserMemory({ riskTolerance: p.id })}
                      className={`p-2.5 rounded-xl border text-[11px] font-bold transition-all text-center leading-tight ${
                        userMemory.riskTolerance === p.id
                          ? "bg-emerald-500/20 border-emerald-400 text-emerald-300"
                          : "bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Bankroll Max Stake Cap */}
              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-300 font-medium">
                    {isOm ? "Daangaa Qoodiinsa Qabeenyaa Ol'aanaa:" : "Max Capital Allocation Cap:"}
                  </span>
                  <span className="font-mono font-bold text-amber-400">{userMemory.bankrollLimitPct}% of bankroll</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="5.0"
                  step="0.5"
                  value={userMemory.bankrollLimitPct}
                  onChange={(e) => updateUserMemory({ bankrollLimitPct: parseFloat(e.target.value) })}
                  className="w-full accent-amber-400 cursor-pointer h-1.5 bg-slate-900 rounded-lg"
                />
                <p className="text-[10px] text-slate-500">
                  {isOm
                    ? "Balaa kasaaraa guutuu hir'isuuf qoodiinsi 1-2.5% gidduu ta'uu qaba."
                    : "Half-Kelly recommends capping exposure to 1-2.5% to protect against standard drawdowns."}
                </p>
              </div>

              {/* Privacy & Complete Purge Section */}
              <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-rose-400" />
                    <span className="text-xs font-bold text-rose-300">
                      {isOm ? "Qulqulleessa Kuusaa Guutuu (Data Purge)" : "Memory Purge & Zero-Knowledge Reset"}
                    </span>
                  </div>
                  {!confirmClearOpen ? (
                    <button
                      type="button"
                      onClick={() => setConfirmClearOpen(true)}
                      className="px-3 py-1.5 rounded-xl bg-rose-500 hover:bg-rose-400 text-white font-bold text-xs transition-all active:scale-95"
                    >
                      {isOm ? "Hunda Haqi" : "Clear All Memory"}
                    </button>
                  ) : (
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={async () => {
                          await clearAllMemories();
                          setConfirmClearOpen(false);
                        }}
                        className="px-3 py-1.5 rounded-xl bg-rose-600 text-white font-bold text-xs"
                      >
                        {isOm ? "Eeyyee, Haqi" : "Yes, Purge All"}
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmClearOpen(false)}
                        className="px-2.5 py-1.5 rounded-xl bg-slate-800 text-slate-300 font-bold text-xs"
                      >
                        {isOm ? "Dhiisi" : "Cancel"}
                      </button>
                    </div>
                  )}
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  {isOm
                    ? "Yaadannoowwan Semantic fi Episodic hunda haquun gara qulqullina bu'uuraatti deebisa. Daataan Firestore irraas guutummaatti ni haqama."
                    : "Permanently erases all semantic facts, episodic briefs, and remembered context from your device and isolated Firestore subcollections."}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-3.5 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between text-xs text-slate-400">
          <span className="flex items-center gap-1.5 text-[11px]">
            <Lock className="w-3.5 h-3.5 text-emerald-400" />
            <span>
              {isOm
                ? "Kuusaan kee seera Firestore ABAC tiin eegamaadha"
                : "Protected by Owner-Only Firestore Security Rules"}
            </span>
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition-colors"
          >
            {isOm ? "Cufi" : "Close"}
          </button>
        </div>
      </div>
    </div>
  );
};
