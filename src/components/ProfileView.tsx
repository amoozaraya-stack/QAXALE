import React, { useState } from "react";
import {
  User,
  Award,
  Flame,
  Globe2,
  Bookmark,
  MessageSquare,
  Trash2,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  ExternalLink,
  ChevronRight,
  Download,
  Smartphone,
  Zap,
  Cpu,
  Database,
  Brain,
  LogIn,
  LogOut,
  Fingerprint,
} from "lucide-react";
import { useApp } from "../context/AppContext";
import { TECH_DICTIONARY } from "../data/dictionaryData";
import { MemoryInspectorModal } from "./MemoryInspectorModal";

export const ProfileView: React.FC = () => {
  const {
    language,
    setLanguage,
    progress,
    conversations,
    deleteConversation,
    toggleBookmark,
    setShowDictionaryModal,
    setShowInstallModal,
    setShowDataFlowModal,
    architecturePlans,
    isAppInstalled,
    isFirestoreSynced,
    userMemory,
    semanticMemories,
    episodicMemories,
    currentUser,
    setShowAuthModal,
    logout,
  } = useApp();

  const [showMemoryModal, setShowMemoryModal] = useState(false);

  const bookmarkedItems = TECH_DICTIONARY.filter((t) =>
    progress.bookmarkedTerms.includes(t.id)
  );

  const isOm = language === "om";

  return (
    <div className="space-y-4 pb-24 animate-in fade-in duration-300">
      {/* Profile Identity Card */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900 to-amber-950/30 border border-slate-800 p-4.5 shadow-lg">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-400 p-0.5 shadow-md shrink-0">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center text-amber-400 font-extrabold text-lg">
                {currentUser?.displayName ? currentUser.displayName.charAt(0).toUpperCase() : <User className="w-7 h-7" />}
              </div>
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <h2 className="text-base font-bold text-white truncate">
                  {currentUser?.displayName || (currentUser && !currentUser.isAnonymous ? currentUser.email : isOm ? "Keessummaa Qaxalee" : "QAXALE Explorer")}
                </h2>
                <span className="text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30 px-2 py-0.2 rounded-full">
                  Level {Math.floor(progress.totalXP / 100) + 1}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5 truncate">
                {currentUser?.email || (currentUser?.isAnonymous ? (isOm ? "Herrega Keessummaa (Guest)" : "Anonymous Guest Session") : "Multi-User AI Account")}
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              if (currentUser && !currentUser.isAnonymous) {
                logout();
              } else {
                setShowAuthModal(true);
              }
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 shrink-0 transition-all active:scale-95 border ${
              currentUser && !currentUser.isAnonymous
                ? "bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border-rose-500/30"
                : "bg-amber-500 hover:bg-amber-400 text-slate-950 border-amber-400 font-bold shadow-md"
            }`}
          >
            {currentUser && !currentUser.isAnonymous ? (
              <>
                <LogOut className="w-3.5 h-3.5" />
                <span>{isOm ? "Ba'i" : "Sign Out"}</span>
              </>
            ) : (
              <>
                <LogIn className="w-3.5 h-3.5" />
                <span>{isOm ? "Seeni" : "Sign In"}</span>
              </>
            )}
          </button>
        </div>

        {/* Cloud Firestore Storage Status */}
        <div className="mt-3.5 pt-3 border-t border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Database className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-xs text-slate-300">
              {language === "om" ? "Kuusaa Firestore (Multi-User)" : "Firestore Cloud (Per-User Isolated)"}
            </span>
          </div>
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[11px] font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>{isFirestoreSynced ? (language === "om" ? "Qindaa'eera" : "Synced") : (language === "om" ? "Hojjetaa Jira" : "Active")}</span>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-slate-800/80">
          <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80 text-center">
            <div className="flex items-center justify-center gap-1 text-amber-400 text-xs font-bold mb-0.5">
              <Award className="w-3.5 h-3.5" />
              <span>{progress.totalXP}</span>
            </div>
            <span className="text-[10px] text-slate-400">Total XP</span>
          </div>

          <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80 text-center">
            <div className="flex items-center justify-center gap-1 text-amber-400 text-xs font-bold mb-0.5">
              <Flame className="w-3.5 h-3.5 fill-amber-400" />
              <span>{progress.streakDays}</span>
            </div>
            <span className="text-[10px] text-slate-400">
              {language === "om" ? "Guyyoota" : "Streak"}
            </span>
          </div>

          <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80 text-center">
            <div className="flex items-center justify-center gap-1 text-emerald-400 text-xs font-bold mb-0.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{progress.completedLessonIds.length}</span>
            </div>
            <span className="text-[10px] text-slate-400">
              {language === "om" ? "Kutaa" : "Lessons"}
            </span>
          </div>
        </div>
      </div>

      {/* Cognitive Memory & Personalization Profile */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Brain className="w-4 h-4 text-amber-400" />
            <span>{language === "om" ? "Kuusaa Yaadaa & Profile AI" : "AI Cognitive Memory & Preferences"}</span>
          </h3>
          <span className="text-[10px] font-bold bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full font-mono capitalize">
            {userMemory.knowledgeLevel}
          </span>
        </div>

        <p className="text-xs text-slate-300">
          {language === "om"
            ? "QAXALE sadarkaa beekumsaa kee, daangaa eegumsa qabeenyaa (Half-Kelly), fi ragaalee si irratti qabate fayyadamee deebii siif kenne madaala."
            : "QAXALE uses your knowledge level, Half-Kelly risk bounds, and remembered traits to hyper-personalize explanations."}
        </p>

        <div className="grid grid-cols-3 gap-2 text-xs">
          <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
            <span className="text-[10px] text-slate-500 uppercase block font-medium">Risk Policy</span>
            <span className="font-mono font-bold text-emerald-400 text-xs capitalize">{userMemory.riskTolerance}</span>
            <span className="text-[10px] text-slate-400 block font-mono">Cap: {userMemory.bankrollLimitPct}%</span>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
            <span className="text-[10px] text-slate-500 uppercase block font-medium">Semantic (L3)</span>
            <span className="font-mono font-bold text-amber-400 text-xs">{semanticMemories.length} Facts</span>
            <span className="text-[10px] text-slate-400 block">7 Pillars</span>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
            <span className="text-[10px] text-slate-500 uppercase block font-medium">Episodic (L2)</span>
            <span className="font-mono font-bold text-indigo-400 text-xs">{episodicMemories.length} Briefs</span>
            <span className="text-[10px] text-slate-400 block">Across Days</span>
          </div>
        </div>

        <button
          onClick={() => setShowMemoryModal(true)}
          className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500/20 to-indigo-600/20 hover:from-amber-500/30 hover:to-indigo-600/30 border border-amber-500/40 text-amber-200 font-bold text-xs flex items-center justify-center gap-2 transition-all active:scale-95 shadow-md"
        >
          <Brain className="w-4 h-4 text-amber-400" />
          <span>
            {language === "om" ? "Kuusaa Yaadaa Qoradhu (Inspect Memory)" : "Open Memory & Profile Inspector"}
          </span>
        </button>
      </div>

      {/* Data-Flow & System Architecture Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Cpu className="w-4 h-4 text-amber-400" />
            <span>{language === "om" ? "Motora Ya'iinsa Ragaa & Telemetry" : "Data-Flow Machine & Telemetry"}</span>
          </h3>
          <span className="text-[10px] font-bold bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded-full font-mono">
            {architecturePlans.length} Plans
          </span>
        </div>

        <p className="text-xs text-slate-300">
          {language === "om"
            ? "Ergama HTTP, balbala (endpoints), iccitii fi qindaa'ina ragaa qoradhu; karoora teeknikaa gaaffilee 7n qopheessi."
            : "Inspect live HTTP JSON packets, endpoint routes, secrets, and test the 7 architecture questions."}
        </p>

        <button
          onClick={() => setShowDataFlowModal(true)}
          className="w-full py-2.5 rounded-xl bg-indigo-600/30 hover:bg-indigo-600/40 border border-indigo-500/40 text-indigo-200 font-bold text-xs flex items-center justify-center gap-2 transition-all active:scale-95 shadow-md"
        >
          <Zap className="w-4 h-4 text-amber-400" />
          <span>
            {language === "om" ? "Motora Ragaa Bani (Open Data-Flow Machine)" : "Open Data-Flow Machine & Inspector"}
          </span>
        </button>
      </div>

      {/* App Installation Tile */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Smartphone className="w-4 h-4 text-amber-400" />
            <span>{language === "om" ? "Fe'iinsa Appii (Homescreen)" : "App Installation (Homescreen)"}</span>
          </h3>
          <span className="text-[10px] font-bold bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full">
            PWA
          </span>
        </div>

        <p className="text-xs text-slate-300">
          {language === "om"
            ? "QAXALE akka appii of-dandeessetti bilbila ykn kompiitara keessan irratti fe'aa."
            : "Install QAXALE as a standalone app on your phone, tablet, or desktop home screen."}
        </p>

        <button
          onClick={() => setShowInstallModal(true)}
          className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition-all active:scale-95 shadow-md"
        >
          <Download className="w-4 h-4" />
          <span>
            {language === "om" ? "Gara Fuula Duraatti Fe'i (Add to Home Screen)" : "Add to Home Screen / Install"}
          </span>
        </button>
      </div>

      {/* Language Preference Setting */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
          <Globe2 className="w-4 h-4 text-amber-400" />
          <span>{language === "om" ? "Filannoo Afaanii" : "Language Preference"}</span>
        </h3>

        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => setLanguage("om")}
            className={`p-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-between ${
              language === "om"
                ? "bg-amber-500/10 border-amber-400 text-amber-300"
                : "bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200"
            }`}
          >
            <span>Afaan Oromoo</span>
            {language === "om" && <CheckCircle2 className="w-4 h-4 text-amber-400" />}
          </button>

          <button
            onClick={() => setLanguage("en")}
            className={`p-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-between ${
              language === "en"
                ? "bg-amber-500/10 border-amber-400 text-amber-300"
                : "bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200"
            }`}
          >
            <span>English</span>
            {language === "en" && <CheckCircle2 className="w-4 h-4 text-amber-400" />}
          </button>
        </div>
      </div>

      {/* Bookmarked Technical Terms */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Bookmark className="w-4 h-4 text-amber-400" />
            <span>
              {language === "om"
                ? `Jechoota Qabatte (${bookmarkedItems.length})`
                : `Saved Terms (${bookmarkedItems.length})`}
            </span>
          </h3>
          <button
            onClick={() => setShowDictionaryModal(true)}
            className="text-[11px] font-semibold text-amber-400 hover:underline"
          >
            {language === "om" ? "Kuusaa Bani" : "Open Dictionary"}
          </button>
        </div>

        {bookmarkedItems.length === 0 ? (
          <p className="text-xs text-slate-500 py-2">
            {language === "om"
              ? "Ammaaf jechi qabame hin jiru."
              : "No saved terms yet. Tap bookmark on terms to save here."}
          </p>
        ) : (
          <div className="space-y-2">
            {bookmarkedItems.map((item) => (
              <div
                key={item.id}
                className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs flex items-center justify-between"
              >
                <div>
                  <h4 className="font-bold text-white">{item.termOromo}</h4>
                  <p className="text-[11px] text-amber-400/90 font-mono">{item.termEnglish}</p>
                </div>
                <button
                  onClick={() => toggleBookmark(item.id)}
                  className="p-1 text-amber-400 hover:text-red-400 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Conversation History Manager */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
          <MessageSquare className="w-4 h-4 text-amber-400" />
          <span>{language === "om" ? "Seenaa Waliin-haasaa AI" : "AI Conversation History"}</span>
        </h3>

        <div className="space-y-1.5 max-h-44 overflow-y-auto">
          {conversations.map((c) => (
            <div
              key={c.id}
              className="p-2.5 rounded-xl bg-slate-950 border border-slate-800/80 text-xs flex items-center justify-between"
            >
              <div className="truncate mr-2">
                <span className="text-slate-200 font-medium truncate block">{c.title}</span>
                <span className="text-[10px] text-slate-500">
                  {c.messages.length} {language === "om" ? "ergaawwan" : "messages"}
                </span>
              </div>

              {conversations.length > 1 && (
                <button
                  onClick={() => deleteConversation(c.id)}
                  className="p-1 text-slate-500 hover:text-red-400 transition-colors shrink-0"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* About QAXALE Mission Platform & Builder Attribution */}
      <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 text-xs text-slate-400 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-white font-bold">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>QAXALE — Afaan Oromoo AI Intelligence Platform</span>
          </div>
          <span className="text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full">
            Production V3
          </span>
        </div>

        <p className="leading-relaxed">
          {language === "om"
            ? "Qaxaleen piilaatfoormii Hubannoo Nam-tolchee (AI), Saayinsii Kompiitaraa, Koodingii fi Teeknolojii Dijitaalaa Afaan Oromootiin dhiyeessuudhaan dhaloota haaraa humneessudha."
            : "QAXALE is an Afaan Oromoo-first digital intelligence and computing platform designed to empower millions with programming, AI literacy, and modern technological skills."}
        </p>

        {/* Builder & Company Signature */}
        <div className="p-3 rounded-xl bg-slate-900 border border-slate-800/80 space-y-1">
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-slate-400">{language === "om" ? "Ijaaraa & Architect:" : "Lead Architect & Builder:"}</span>
            <span className="font-bold text-amber-400">HAMZA YASIN</span>
          </div>
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-slate-400">{language === "om" ? "Dhaabbata (Company):" : "Company / Enterprise:"}</span>
            <span className="font-semibold text-slate-200">ORONID TECH</span>
          </div>
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-slate-400">{language === "om" ? "Caasaa Teeknolojii:" : "Core Architecture:"}</span>
            <span className="text-slate-300 font-mono text-[10px]">React 19 • Firebase Auth • Express • Gemini GenAI</span>
          </div>
        </div>

        <div className="pt-1 flex items-center justify-between text-[11px] text-slate-500">
          <span>Version 3.0 • Multi-User Production</span>
          <span>© 2026 QAXALE by ORONID TECH</span>
        </div>
      </div>

      {/* Memory Inspector Modal */}
      <MemoryInspectorModal
        isOpen={showMemoryModal}
        onClose={() => setShowMemoryModal(false)}
      />
    </div>
  );
};
