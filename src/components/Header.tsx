import React from "react";
import { Sparkles, Flame, BookOpen, Globe2, BookA, Download } from "lucide-react";
import { useApp } from "../context/AppContext";

export const Header: React.FC = () => {
  const { language, setLanguage, progress, setShowDictionaryModal, setShowInstallModal, isAppInstalled } = useApp();

  return (
    <header className="sticky top-0 z-30 bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80 px-4 py-2.5 transition-colors">
      <div className="max-w-md mx-auto flex items-center justify-between">
        {/* Brand Logo & Name */}
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 via-amber-600 to-yellow-400 p-[1.5px] shadow-sm shadow-amber-500/20">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <span className="font-black text-lg tracking-wider text-amber-400">Q</span>
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="font-extrabold text-base tracking-tight text-white font-mono">
                QAXALE
              </h1>
              <span className="text-[10px] font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30 px-1.5 py-0.2 rounded-full">
                AI • Oromoo
              </span>
            </div>
            <p className="text-[10px] text-slate-400 leading-tight">
              {language === "om" ? "Hubannoo & Saganteessuu" : "AI & Tech Platform"}
            </p>
          </div>
        </div>

        {/* Right Actions: Install, Dictionary, Streak, Lang Switcher */}
        <div className="flex items-center gap-1.5">
          {/* Homescreen Install Button */}
          <button
            id="header-install-btn"
            onClick={() => setShowInstallModal(true)}
            className="flex items-center gap-1 px-2 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-400 text-xs font-semibold transition-all active:scale-95"
            title={language === "om" ? "Fuula Duraatti Fe'i" : "Add to Home Screen"}
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{language === "om" ? "Fe'i" : "Install"}</span>
          </button>

          {/* Tech Dictionary Modal Trigger */}
          <button
            id="header-dictionary-btn"
            onClick={() => setShowDictionaryModal(true)}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-amber-400 hover:border-slate-700 text-xs font-medium transition-all active:scale-95"
            title={language === "om" ? "Kuusaa Jechootaa" : "Tech Dictionary"}
          >
            <BookA className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">{language === "om" ? "Jechoota" : "Dictionary"}</span>
          </button>

          {/* Streak Badge */}
          <div
            className="flex items-center gap-1 px-2 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold"
            title={`${progress.streakDays} Days Streak`}
          >
            <Flame className="w-3.5 h-3.5 fill-amber-400 text-amber-400 animate-pulse" />
            <span>{progress.streakDays}</span>
          </div>

          {/* Language Toggle */}
          <button
            id="header-lang-toggle"
            onClick={() => setLanguage(language === "om" ? "en" : "om")}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-bold text-slate-200 transition-all active:scale-95"
            aria-label="Toggle language"
          >
            <Globe2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>{language === "om" ? "OM" : "EN"}</span>
          </button>
        </div>
      </div>
    </header>
  );
};

