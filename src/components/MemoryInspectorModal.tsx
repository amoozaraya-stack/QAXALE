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
} from "lucide-react";
import { useApp } from "../context/AppContext";

interface MemoryInspectorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MemoryInspectorModal: React.FC<MemoryInspectorModalProps> = ({
  isOpen,
  onClose,
}) => {
  const {
    language,
    userMemory,
    updateUserMemory,
    addRememberedFact,
    removeRememberedFact,
    clearRememberedFacts,
    conversations,
    activeConversationId,
    summarizeActiveConversation,
  } = useApp();

  const [newFact, setNewFact] = useState("");
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [summaryMessage, setSummaryMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const isOm = language === "om";
  const activeConv = conversations.find((c) => c.id === activeConversationId);

  const handleAddFact = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFact.trim()) return;
    addRememberedFact(newFact.trim());
    setNewFact("");
  };

  const handleRunSummarize = async () => {
    setIsSummarizing(true);
    setSummaryMessage(null);
    try {
      const summary = await summarizeActiveConversation();
      if (summary) {
        setSummaryMessage(
          isOm ? "Cuunfaan yaada haasaa milkaa'inaan haaromeera!" : "Conversation Memory Brief updated successfully!"
        );
      } else {
        setSummaryMessage(
          isOm ? "Waliin-haasaan cuunfamuuf ergaawwan gahaa hin qabu." : "Not enough dialogue turns to summarize yet."
        );
      }
    } catch {
      setSummaryMessage(isOm ? "Dogoggorri uumameera." : "Summarization failed.");
    } finally {
      setIsSummarizing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg max-h-[90vh] flex flex-col bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-gradient-to-r from-amber-500/10 via-slate-900 to-indigo-950/30">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <Brain className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <span>{isOm ? "Kuusaa Yaadaa & Profile QAXALE" : "QAXALE Cognitive Memory Profile"}</span>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/30 font-mono">
                  Active
                </span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                {isOm
                  ? "Waan QAXALE si irratti yaaddatu qoradhu, jijjiiri, ykn haqi."
                  : "Inspect, manage, and audit what QAXALE remembers about your preferences."}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 space-y-4 overflow-y-auto max-h-[70vh]">
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
                  className={`p-2 rounded-xl border text-xs font-bold capitalize transition-all ${
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
                  className={`p-2 rounded-xl border text-[11px] font-bold transition-all text-center leading-tight ${
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
          <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 space-y-1.5">
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

          {/* Remembered User Facts */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-indigo-400" />
                <span>
                  {isOm
                    ? `Waan QAXALE Si Irratti Yaadatu (${userMemory.rememberedFacts.length})`
                    : `Remembered Facts (${userMemory.rememberedFacts.length})`}
                </span>
              </label>
              {userMemory.rememberedFacts.length > 0 && (
                <button
                  type="button"
                  onClick={clearRememberedFacts}
                  className="text-[10px] font-semibold text-rose-400 hover:underline"
                >
                  {isOm ? "Hunda Haqaa" : "Clear All"}
                </button>
              )}
            </div>

            {/* Add new fact */}
            <form onSubmit={handleAddFact} className="flex gap-2">
              <input
                type="text"
                placeholder={
                  isOm
                    ? "Fkn: Qorannoo herrega Premier League irratti xiyyeeffadha..."
                    : "e.g. Focuses on Premier League variance modeling..."
                }
                value={newFact}
                onChange={(e) => setNewFact(e.target.value)}
                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
              />
              <button
                type="submit"
                className="px-3 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1 shrink-0 transition-all active:scale-95"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{isOm ? "Dabali" : "Add"}</span>
              </button>
            </form>

            {/* List of remembered facts */}
            <div className="space-y-1.5 max-h-36 overflow-y-auto">
              {userMemory.rememberedFacts.length === 0 ? (
                <p className="text-xs text-slate-500 italic py-2">
                  {isOm
                    ? "Ammaaf yaadannoon addaa hin jiru. Yaada barbaadde oliitti dabali."
                    : "No specific remembered facts yet. Add facts above to personalize responses."}
                </p>
              ) : (
                userMemory.rememberedFacts.map((fact, index) => (
                  <div
                    key={index}
                    className="p-2 rounded-xl bg-slate-950 border border-slate-800 text-xs flex items-center justify-between text-slate-300"
                  >
                    <span className="truncate pr-2">{fact}</span>
                    <button
                      type="button"
                      onClick={() => removeRememberedFact(index)}
                      className="text-slate-500 hover:text-rose-400 p-1 shrink-0 transition-colors"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Active Conversation Memory Brief */}
          <div className="p-3 rounded-2xl bg-indigo-950/30 border border-indigo-500/30 space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-indigo-200 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-indigo-400" />
                <span>{isOm ? "Cuunfaa Haasaa Ammaa (Memory Brief)" : "Current Conversation Memory Brief"}</span>
              </h4>
              <button
                type="button"
                onClick={handleRunSummarize}
                disabled={isSummarizing || !activeConv || activeConv.messages.length < 2}
                className="px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-[10px] flex items-center gap-1 transition-all disabled:opacity-50"
              >
                <RefreshCw className={`w-3 h-3 ${isSummarizing ? "animate-spin" : ""}`} />
                <span>{isSummarizing ? (isOm ? "Cuunfaa..." : "Summarizing...") : (isOm ? "Haaromsi" : "Compress Memory")}</span>
              </button>
            </div>

            {summaryMessage && (
              <p className="text-[11px] text-amber-300 bg-amber-500/10 p-2 rounded-lg border border-amber-500/20">
                {summaryMessage}
              </p>
            )}

            {activeConv?.summary ? (
              <div className="space-y-1 text-xs text-slate-300 bg-slate-950/60 p-2.5 rounded-xl border border-indigo-900/50">
                <p className="leading-relaxed">{activeConv.summary}</p>
                {activeConv.keyTakeaways && activeConv.keyTakeaways.length > 0 && (
                  <ul className="mt-1 space-y-0.5 text-[11px] text-slate-400 list-disc list-inside">
                    {activeConv.keyTakeaways.map((k, i) => (
                      <li key={i}>{k}</li>
                    ))}
                  </ul>
                )}
              </div>
            ) : (
              <p className="text-[11px] text-slate-400">
                {isOm
                  ? "Haasaan kun hin cuunfamne. Ergaawwan yoo baay'atan QAXALE ofumaan cuunfee kuusaatti galcha."
                  : "No memory brief generated yet. Tap 'Compress Memory' to distill dialogue into an executive summary."}
              </p>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-3 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between text-xs text-slate-400">
          <span className="flex items-center gap-1 text-[11px]">
            <Lock className="w-3 h-3 text-emerald-400" />
            <span>{isOm ? "Kuusaan kee bilisummaa fi iccitii qaba" : "Stored securely & synced to your device"}</span>
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
