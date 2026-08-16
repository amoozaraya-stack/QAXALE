import React from "react";
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
} from "lucide-react";
import { useApp } from "../context/AppContext";
import { TECH_DICTIONARY } from "../data/dictionaryData";

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
    isAppInstalled,
  } = useApp();

  const bookmarkedItems = TECH_DICTIONARY.filter((t) =>
    progress.bookmarkedTerms.includes(t.id)
  );

  return (
    <div className="space-y-4 pb-24 animate-in fade-in duration-300">
      {/* Profile Identity Card */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900 to-amber-950/30 border border-slate-800 p-4.5 shadow-lg">
        <div className="flex items-center gap-3.5">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-400 p-0.5 shadow-md">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center text-amber-400">
              <User className="w-7 h-7" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h2 className="text-base font-bold text-white">Barataa Qaxalee</h2>
              <span className="text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30 px-2 py-0.2 rounded-full">
                Level 2
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {language === "om" ? "Barataa Teeknolojii & AI" : "AI & Tech Explorer"}
            </p>
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

      {/* About QAXALE Mission Platform */}
      <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 text-xs text-slate-400 space-y-2">
        <div className="flex items-center gap-2 text-white font-bold">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>QAXALE (Qaxalee) — Afaan Oromoo Tech Platform</span>
        </div>
        <p className="leading-relaxed">
          {language === "om"
            ? "Qaxaleen piilaatfoormii Hubannoo Nam-tolchee (AI), Saayinsii Kompiitaraa, Koodingii fi Teeknolojii Dijitaalaa Afaan Oromootiin dhiyeessuudhaan dhaloota haaraa humneessudha."
            : "QAXALE is an Afaan Oromoo-first digital intelligence and computing platform designed to empower millions with programming, AI literacy, and modern technological skills."}
        </p>
        <div className="pt-1 flex items-center justify-between text-[11px] text-slate-500">
          <span>Version 1.0 • Mobile-First</span>
          <span>© 2026 QAXALE</span>
        </div>
      </div>
    </div>
  );
};
