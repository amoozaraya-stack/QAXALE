import React from "react";
import {
  MessageSquare,
  GraduationCap,
  Languages,
  Terminal,
  Sparkles,
  ArrowRight,
  BookOpen,
  Zap,
  Code2,
  BrainCircuit,
  Compass,
  CheckCircle2,
  Download,
  Smartphone,
} from "lucide-react";
import { useApp } from "../context/AppContext";
import { TECH_DICTIONARY } from "../data/dictionaryData";
import { COURSES_DATA } from "../data/learningContent";
import { CODING_CURRICULUM } from "../data/codingCurriculum";

export const HomeView: React.FC = () => {
  const {
    language,
    setActiveTab,
    progress,
    setShowDictionaryModal,
    createConversation,
    addMessageToActiveConversation,
    setShowInstallModal,
    handleInstallApp,
    isAppInstalled,
  } = useApp();

  // Pick a featured word of the day
  const wordOfTheDay = TECH_DICTIONARY[0];
  const featuredCourse = COURSES_DATA[0];
  const featuredCode = CODING_CURRICULUM[0];

  const quickPrompts = [
    {
      om: "Python akkamittiin baradha?",
      en: "How do I start learning Python?",
      mode: "step-by-step" as const,
    },
    {
      om: "Hubannoon Nam-tolchee (AI) akkamitti hojjeta?",
      en: "How does Artificial Intelligence work?",
      mode: "step-by-step" as const,
    },
    {
      om: "Algorizimii fi Koodingii naaf ibsi",
      en: "Explain Algorithms and Coding simply",
      mode: "standard" as const,
    },
    {
      om: "Kalaqa app mobaayilaa haaraa yaadi",
      en: "Brainstorm a mobile app idea for Afaan Oromoo",
      mode: "brainstorm" as const,
    },
  ];

  const handleLaunchChatWithPrompt = (promptText: string, mode: "standard" | "step-by-step" | "summary" | "brainstorm") => {
    createConversation(promptText.slice(0, 30));
    addMessageToActiveConversation({
      role: "user",
      content: promptText,
      mode,
    });
    setActiveTab("chat");
  };

  return (
    <div className="space-y-5 pb-24 animate-in fade-in duration-300">
      {/* Hero Welcome Card with subtle African/Oromo solar aura & modern dark tech */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900 to-amber-950/40 border border-amber-500/20 p-5 shadow-lg">
        {/* Background glow circle */}
        <div className="absolute -top-12 -right-12 w-44 h-44 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>QAXALE AI • Afaan Oromoo Tech</span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight leading-snug">
            {language === "om" ? "Baga Nagaan Dhuftan!" : "Welcome to QAXALE!"}
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1.5 leading-relaxed max-w-sm">
            {language === "om"
              ? "Hubannoo Nam-tolchee (AI), Saganteessuu fi Saayinsii Kompiitaraa Afaan Oromootiin baradhaa."
              : "Learn Artificial Intelligence, Programming, and Digital Science in Afaan Oromoo & English."}
          </p>

          {/* Quick Ask AI Input Button */}
          <div
            onClick={() => setActiveTab("chat")}
            className="mt-4 flex items-center justify-between bg-slate-950/80 hover:bg-slate-950 border border-slate-700/80 hover:border-amber-500/50 rounded-xl px-3.5 py-2.5 text-xs text-slate-400 cursor-pointer transition-all shadow-inner group"
          >
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
              <span>
                {language === "om"
                  ? "Wanta tokko Qaxalee AI gaafadhaa..."
                  : "Ask QAXALE AI any question..."}
              </span>
            </div>
            <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
              {language === "om" ? "Bani" : "Start"}
            </span>
          </div>
        </div>
      </div>

      {/* PWA / Homescreen Install Card */}
      <div className="bg-gradient-to-r from-amber-500/15 via-slate-900 to-slate-900 border border-amber-500/30 rounded-2xl p-3.5 flex items-center justify-between gap-3 shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
            <Smartphone className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h4 className="font-bold text-xs text-white">
                {language === "om" ? "Fuula Duraa Bilbilaatti Fe'i" : "Add to Phone Homescreen"}
              </h4>
              <span className="text-[9px] font-extrabold bg-amber-500 text-slate-950 px-1.5 py-0.2 rounded-full">
                PWA
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {language === "om"
                ? "Saffisa ol'aanaa, offline fi akka appii qulqulluutti fayyadamaa."
                : "Fast access, offline cache, and fullscreen native app experience."}
            </p>
          </div>
        </div>

        <button
          id="home-install-trigger-btn"
          onClick={() => setShowInstallModal(true)}
          className="px-3 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shrink-0 transition-all active:scale-95 shadow-sm"
        >
          <Download className="w-3.5 h-3.5" />
          <span>{language === "om" ? "Fe'i" : "Install"}</span>
        </button>
      </div>

      {/* Main Feature Shortcuts Grid */}
      <div>
        <div className="flex items-center justify-between mb-2.5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            {language === "om" ? "Tajaajiloota Ijoo" : "Core Features"}
          </h3>
          <span className="text-[11px] text-amber-400 font-medium">QAXALE Suite</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {/* AI Chat Shortcut */}
          <button
            id="home-shortcut-chat"
            onClick={() => setActiveTab("chat")}
            className="flex flex-col items-start p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-amber-500/40 text-left transition-all active:scale-95 group"
          >
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 mb-2 group-hover:scale-110 transition-transform">
              <MessageSquare className="w-4 h-4" />
            </div>
            <h4 className="text-xs font-bold text-white">Qaxale AI</h4>
            <p className="text-[10px] text-slate-400 mt-0.5 leading-tight">
              {language === "om" ? "Gaaffii & Deebii AI" : "Intelligent Assistant"}
            </p>
          </button>

          {/* Learn Shortcut */}
          <button
            id="home-shortcut-learn"
            onClick={() => setActiveTab("learn")}
            className="flex flex-col items-start p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-emerald-500/40 text-left transition-all active:scale-95 group"
          >
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 mb-2 group-hover:scale-110 transition-transform">
              <GraduationCap className="w-4 h-4" />
            </div>
            <h4 className="text-xs font-bold text-white">
              {language === "om" ? "Barumsa" : "Learn"}
            </h4>
            <p className="text-[10px] text-slate-400 mt-0.5 leading-tight">
              {language === "om" ? "Koorsoota & Qorumsa" : "Interactive Courses"}
            </p>
          </button>

          {/* Translate Shortcut */}
          <button
            id="home-shortcut-translate"
            onClick={() => setActiveTab("translate")}
            className="flex flex-col items-start p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-indigo-500/40 text-left transition-all active:scale-95 group"
          >
            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 mb-2 group-hover:scale-110 transition-transform">
              <Languages className="w-4 h-4" />
            </div>
            <h4 className="text-xs font-bold text-white">
              {language === "om" ? "Hiika" : "Translate"}
            </h4>
            <p className="text-[10px] text-slate-400 mt-0.5 leading-tight">
              {language === "om" ? "Afaan Oromoo ↔ EN" : "Oromo ↔ English"}
            </p>
          </button>

          {/* Code Lab Shortcut */}
          <button
            id="home-shortcut-code"
            onClick={() => setActiveTab("code")}
            className="flex flex-col items-start p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-rose-500/40 text-left transition-all active:scale-95 group"
          >
            <div className="p-2 rounded-lg bg-rose-500/10 text-rose-400 mb-2 group-hover:scale-110 transition-transform">
              <Terminal className="w-4 h-4" />
            </div>
            <h4 className="text-xs font-bold text-white">
              {language === "om" ? "Koodii Lab" : "Code Lab"}
            </h4>
            <p className="text-[10px] text-slate-400 mt-0.5 leading-tight">
              {language === "om" ? "Python, JS & HTML" : "Interactive Coding"}
            </p>
          </button>
        </div>
      </div>

      {/* Word of the Day: Jechoota Teeknolojii */}
      <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-4 relative overflow-hidden">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400">
            <BookOpen className="w-4 h-4" />
            <span>{language === "om" ? "Jecha Teeknolojii Guyyaa" : "Tech Term of the Day"}</span>
          </div>
          <button
            onClick={() => setShowDictionaryModal(true)}
            className="text-[11px] font-semibold text-slate-400 hover:text-white flex items-center gap-1"
          >
            <span>{language === "om" ? "Hunda Ilaali" : "View All"}</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        <div className="bg-slate-950/60 rounded-xl p-3 border border-slate-800/80">
          <div className="flex items-baseline justify-between">
            <h4 className="text-sm font-bold text-white">{wordOfTheDay.termOromo}</h4>
            <span className="text-xs font-mono text-amber-400">{wordOfTheDay.termEnglish}</span>
          </div>
          <p className="text-xs text-slate-300 mt-1 leading-relaxed">
            {language === "om" ? wordOfTheDay.definitionOromo : wordOfTheDay.definitionEnglish}
          </p>
          <div className="mt-2 text-[11px] text-slate-400 italic">
            "{language === "om" ? wordOfTheDay.exampleSentenceOromo : wordOfTheDay.exampleSentenceEnglish}"
          </div>
        </div>
      </div>

      {/* Suggested Quick AI Prompts */}
      <div>
        <div className="flex items-center justify-between mb-2.5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>{language === "om" ? "Gaaffilee Filataman" : "Suggested AI Prompts"}</span>
          </h3>
        </div>

        <div className="space-y-2">
          {quickPrompts.map((p, idx) => (
            <div
              key={idx}
              onClick={() => handleLaunchChatWithPrompt(p[language], p.mode)}
              className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 hover:bg-slate-900 border border-slate-800/80 hover:border-amber-500/40 text-xs text-slate-200 cursor-pointer transition-all active:scale-[0.99] group"
            >
              <div className="flex items-center gap-2.5">
                <span className="w-5 h-5 rounded-full bg-slate-800 text-amber-400 text-[10px] font-bold flex items-center justify-center">
                  {idx + 1}
                </span>
                <span className="font-medium group-hover:text-amber-300 transition-colors">
                  {p[language]}
                </span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-amber-400 transition-colors" />
            </div>
          ))}
        </div>
      </div>

      {/* Learning Progression Snapshot */}
      <div className="rounded-2xl bg-gradient-to-r from-emerald-950/40 to-slate-900 border border-emerald-500/20 p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
              <GraduationCap className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white">
                {language === "om" ? "Adeemsa Barumsa Kee" : "Your Learning Progress"}
              </h4>
              <p className="text-[10px] text-slate-400">
                {progress.completedLessonIds.length} {language === "om" ? "Kutaa xumurame" : "Lessons completed"} • {progress.totalXP} XP
              </p>
            </div>
          </div>
          <button
            onClick={() => setActiveTab("learn")}
            className="px-3 py-1 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold rounded-lg transition-all"
          >
            {language === "om" ? "Itti Fufi" : "Continue"}
          </button>
        </div>

        <div className="mt-3 bg-slate-950/60 rounded-xl p-3 border border-slate-800/80 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-semibold text-emerald-400 uppercase">
              {featuredCourse.level}
            </span>
            <h5 className="text-xs font-bold text-white mt-0.5">
              {featuredCourse.title[language]}
            </h5>
          </div>
          <div className="flex items-center gap-1 text-emerald-400 text-xs font-bold">
            <CheckCircle2 className="w-4 h-4" />
            <span>Active</span>
          </div>
        </div>
      </div>
    </div>
  );
};
