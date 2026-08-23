import React from "react";
import {
  MessageSquare,
  Layers,
  GraduationCap,
  Languages,
  Terminal,
  Sparkles,
  ArrowRight,
  BookOpen,
  Smartphone,
  Download,
  Workflow,
  Cpu,
  Compass,
  Lightbulb,
} from "lucide-react";
import { useApp } from "../context/AppContext";
import { TECH_DICTIONARY } from "../data/dictionaryData";
import { COURSES_DATA } from "../data/learningContent";

export const HomeView: React.FC = () => {
  const {
    language,
    setActiveTab,
    progress,
    setShowDictionaryModal,
    createConversation,
    addMessageToActiveConversation,
    setShowInstallModal,
    setShowDataFlowModal,
  } = useApp();

  const wordOfTheDay = TECH_DICTIONARY[0];
  const featuredCourse = COURSES_DATA[0];

  const agencyPrompts = [
    {
      om: "Hubannoo Nam-tolchee (AI) sadarkaadhaan naaf hiiki",
      en: "Interpret Artificial Intelligence (AI) step-by-step",
      mode: "interpret-layers" as const,
      icon: Layers,
    },
    {
      om: "Yaada Bu'uuraa (First-Principles) fayyadamuun koodingii baradhu",
      en: "Learn coding using First-Principles reasoning",
      mode: "first-principles" as const,
      icon: Compass,
    },
    {
      om: "Kalaqa Pirojektii Dijitaalaa haaraa qopheessi (Agency Loop)",
      en: "Create a practical digital project plan (Agency Loop)",
      mode: "agency-loop" as const,
      icon: Workflow,
    },
    {
      om: "Fakkeenya Feynman fayyadamuun Algorizimii na barsiisi",
      en: "Teach me Algorithms using Feynman everyday analogies",
      mode: "feynman" as const,
      icon: Lightbulb,
    },
  ];

  const handleLaunchChatWithPrompt = (
    promptText: string,
    mode: "standard" | "step-by-step" | "summary" | "brainstorm" | "agency-loop" | "interpret-layers" | "feynman" | "first-principles"
  ) => {
    createConversation(promptText.slice(0, 30));
    addMessageToActiveConversation({
      role: "user",
      content: promptText,
      mode,
    });
    setActiveTab("chat");
  };

  return (
    <div className="space-y-4 pb-20 animate-in fade-in duration-300">
      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900 to-amber-950/40 border border-amber-500/20 p-4 sm:p-5 shadow-lg">
        <div className="absolute -top-12 -right-12 w-40 h-40 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[11px] font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>QAXALE V3 • Interpretive Intelligence</span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight leading-snug">
            {language === "om" ? "Beekumsa Hubadhu. Hojiitti Jijjiiri." : "From Access to Capability & Agency."}
          </h2>
          <p className="text-xs text-slate-300 mt-1 leading-relaxed max-w-sm">
            {language === "om"
              ? "QAXALE V3 walxaxiinsa beekumsaa gara hubannoo, kalaqa pirojektii, fi dandeettii dhuunfaatti ceesisa."
              : "Bridging the interpretive divide. Convert complex modern knowledge into deep understanding, projects, and human capability."}
          </p>

          {/* Quick AI Trigger */}
          <div
            onClick={() => setActiveTab("interpret")}
            className="mt-3.5 flex items-center justify-between bg-slate-950/80 hover:bg-slate-950 border border-slate-700/80 hover:border-amber-500/50 rounded-xl px-3.5 py-2.5 text-xs text-slate-300 cursor-pointer transition-all shadow-inner group"
          >
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
              <span>
                {language === "om"
                  ? "Yaada walxaxaa kamiyyuu sadarkaadhaan hiiki..."
                  : "Deconstruct any complex topic into layers..."}
              </span>
            </div>
            <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
              {language === "om" ? "Hiiki" : "Interpret"}
            </span>
          </div>
        </div>
      </div>

      {/* The QAXALE V3 Agency Progression Stepper */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-3.5">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Workflow className="w-3.5 h-3.5 text-amber-400" />
            <span>{language === "om" ? "Adeemsa QAXALE (Agency Loop)" : "The Agency Progression"}</span>
          </h3>
          <span className="text-[10px] font-mono text-amber-400 font-bold">V3 Standard</span>
        </div>

        {/* Visual Stepper */}
        <div className="grid grid-cols-4 gap-1.5 text-center">
          <div className="bg-slate-950/60 p-2 rounded-xl border border-slate-800/80">
            <span className="text-[10px] text-amber-400 font-bold block">1. ACCESS</span>
            <span className="text-[10px] text-slate-300 truncate block mt-0.5">
              {language === "om" ? "Dhaqqabuu" : "Discover"}
            </span>
          </div>
          <div className="bg-slate-950/60 p-2 rounded-xl border border-slate-800/80">
            <span className="text-[10px] text-indigo-400 font-bold block">2. INTERPRET</span>
            <span className="text-[10px] text-slate-300 truncate block mt-0.5">
              {language === "om" ? "Hubachuu" : "Understand"}
            </span>
          </div>
          <div className="bg-slate-950/60 p-2 rounded-xl border border-slate-800/80">
            <span className="text-[10px] text-emerald-400 font-bold block">3. APPLY</span>
            <span className="text-[10px] text-slate-300 truncate block mt-0.5">
              {language === "om" ? "Hojiirra Oolchuu" : "Practice"}
            </span>
          </div>
          <div className="bg-slate-950/60 p-2 rounded-xl border border-slate-800/80">
            <span className="text-[10px] text-rose-400 font-bold block">4. CREATE</span>
            <span className="text-[10px] text-slate-300 truncate block mt-0.5">
              {language === "om" ? "Kalaquu" : "Agency"}
            </span>
          </div>
        </div>
      </div>

      {/* Data-Flow Machine Architecture Banner */}
      <div
        id="home-dataflow-banner"
        onClick={() => setShowDataFlowModal(true)}
        className="cursor-pointer group relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-indigo-500/30 p-3.5 hover:border-amber-500/50 transition-all shadow-md active:scale-98"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-bold text-xs sm:text-sm text-slate-100 font-mono">
                  {language === "om" ? "Motora Ya'iinsa Ragaa (Data-Flow)" : "System Data-Flow Machine"}
                </h4>
                <span className="text-[10px] font-bold bg-amber-500/20 text-amber-300 px-1.5 py-0.2 rounded">
                  7 Stages
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {language === "om"
                  ? "HTTP, Endpoints, JSON, Secret Keys & AI Telemetry qoradhu"
                  : "Inspect live HTTP JSON packets, telemetry & the 7 architecture questions"}
              </p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-indigo-400 group-hover:text-amber-400 group-hover:translate-x-1 transition-all" />
        </div>
      </div>

      {/* Main Navigation Matrix */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            {language === "om" ? "Kutaa Hojii Ijoo" : "Core Capability Engines"}
          </h3>
          <span className="text-[11px] text-amber-400 font-medium">QAXALE Modules</span>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {/* Interpret Engine */}
          <button
            id="home-shortcut-interpret"
            onClick={() => setActiveTab("interpret")}
            className="flex flex-col items-start p-3 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-indigo-500/40 text-left transition-all active:scale-95 group"
          >
            <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 mb-1.5 group-hover:scale-110 transition-transform">
              <Layers className="w-4 h-4" />
            </div>
            <h4 className="text-xs font-bold text-white">
              {language === "om" ? "Hiika" : "Interpret"}
            </h4>
            <p className="text-[10px] text-slate-400 mt-0.5 leading-tight">
              {language === "om" ? "Sadarkaa 13" : "13 Layers"}
            </p>
          </button>

          {/* AI Chat */}
          <button
            id="home-shortcut-chat"
            onClick={() => setActiveTab("chat")}
            className="flex flex-col items-start p-3 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-amber-500/40 text-left transition-all active:scale-95 group"
          >
            <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 mb-1.5 group-hover:scale-110 transition-transform">
              <MessageSquare className="w-4 h-4" />
            </div>
            <h4 className="text-xs font-bold text-white">Qaxale AI</h4>
            <p className="text-[10px] text-slate-400 mt-0.5 leading-tight">
              {language === "om" ? "Agency Loop" : "Interactive"}
            </p>
          </button>

          {/* Learn Courses */}
          <button
            id="home-shortcut-learn"
            onClick={() => setActiveTab("learn")}
            className="flex flex-col items-start p-3 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-emerald-500/40 text-left transition-all active:scale-95 group"
          >
            <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 mb-1.5 group-hover:scale-110 transition-transform">
              <GraduationCap className="w-4 h-4" />
            </div>
            <h4 className="text-xs font-bold text-white">
              {language === "om" ? "Barumsa" : "Learn"}
            </h4>
            <p className="text-[10px] text-slate-400 mt-0.5 leading-tight">
              {language === "om" ? "Koorsoota" : "Curriculum"}
            </p>
          </button>

          {/* Conceptual Translate */}
          <button
            id="home-shortcut-translate"
            onClick={() => setActiveTab("translate")}
            className="flex flex-col items-start p-3 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-cyan-500/40 text-left transition-all active:scale-95 group"
          >
            <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400 mb-1.5 group-hover:scale-110 transition-transform">
              <Languages className="w-4 h-4" />
            </div>
            <h4 className="text-xs font-bold text-white">
              {language === "om" ? "Hiika Afaanii" : "Translate"}
            </h4>
            <p className="text-[10px] text-slate-400 mt-0.5 leading-tight">
              {language === "om" ? "Oromo ↔ EN" : "Bridge"}
            </p>
          </button>

          {/* Code Lab */}
          <button
            id="home-shortcut-code"
            onClick={() => setActiveTab("code")}
            className="flex flex-col items-start p-3 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-rose-500/40 text-left transition-all active:scale-95 group"
          >
            <div className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400 mb-1.5 group-hover:scale-110 transition-transform">
              <Terminal className="w-4 h-4" />
            </div>
            <h4 className="text-xs font-bold text-white">
              {language === "om" ? "Koodii Lab" : "Code Lab"}
            </h4>
            <p className="text-[10px] text-slate-400 mt-0.5 leading-tight">
              {language === "om" ? "Shaakala" : "Practice"}
            </p>
          </button>

          {/* Tech Dictionary */}
          <button
            id="home-shortcut-dict"
            onClick={() => setShowDictionaryModal(true)}
            className="flex flex-col items-start p-3 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-purple-500/40 text-left transition-all active:scale-95 group"
          >
            <div className="p-1.5 rounded-lg bg-purple-500/10 text-purple-400 mb-1.5 group-hover:scale-110 transition-transform">
              <BookOpen className="w-4 h-4" />
            </div>
            <h4 className="text-xs font-bold text-white">
              {language === "om" ? "Kuus-Jechaa" : "Dictionary"}
            </h4>
            <p className="text-[10px] text-slate-400 mt-0.5 leading-tight">
              {language === "om" ? "Jechoota Tech" : "Tech Terms"}
            </p>
          </button>
        </div>
      </div>

      {/* Suggested Reasoning & Agency Prompts */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>{language === "om" ? "Gaaffilee Hubannoo Qaxale V3" : "QAXALE V3 Agency Prompts"}</span>
          </h3>
        </div>

        <div className="space-y-1.5">
          {agencyPrompts.map((p, idx) => {
            const Icon = p.icon;
            return (
              <div
                key={idx}
                onClick={() => handleLaunchChatWithPrompt(p[language], p.mode)}
                className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/60 hover:bg-slate-900 border border-slate-800 hover:border-amber-500/40 text-xs text-slate-200 cursor-pointer transition-all active:scale-[0.99] group"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-6 h-6 rounded-lg bg-slate-800 text-amber-400 flex items-center justify-center shrink-0">
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <span className="font-medium group-hover:text-amber-300 transition-colors truncate">
                    {p[language]}
                  </span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-amber-400 transition-colors shrink-0 ml-2" />
              </div>
            );
          })}
        </div>
      </div>

      {/* Word of the Day */}
      <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-3.5 relative overflow-hidden">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400">
            <BookOpen className="w-4 h-4" />
            <span>{language === "om" ? "Jecha Teeknolojii Guyyaa" : "Tech Term of the Day"}</span>
          </div>
          <button
            onClick={() => setShowDictionaryModal(true)}
            className="text-[11px] font-semibold text-slate-400 hover:text-white flex items-center gap-1"
          >
            <span>{language === "om" ? "Hunda" : "All"}</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        <div className="bg-slate-950/60 rounded-xl p-3 border border-slate-800/80">
          <div className="flex items-baseline justify-between">
            <h4 className="text-xs font-bold text-white">{wordOfTheDay.termOromo}</h4>
            <span className="text-xs font-mono text-amber-400">{wordOfTheDay.termEnglish}</span>
          </div>
          <p className="text-xs text-slate-300 mt-1 leading-relaxed">
            {language === "om" ? wordOfTheDay.definitionOromo : wordOfTheDay.definitionEnglish}
          </p>
        </div>
      </div>

      {/* PWA / Homescreen Install Prompt */}
      <div className="bg-gradient-to-r from-amber-500/15 via-slate-900 to-slate-900 border border-amber-500/30 rounded-2xl p-3 flex items-center justify-between gap-3 shadow-md">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
            <Smartphone className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <h4 className="font-bold text-xs text-white truncate">
              {language === "om" ? "Bilbila Keessanitti Fe'aa" : "Add to Homescreen"}
            </h4>
            <p className="text-[10px] text-slate-400 truncate">
              {language === "om"
                ? "Saffisa ol'aanaa fi offline fayyadamaa."
                : "Fast access & offline caching."}
            </p>
          </div>
        </div>

        <button
          id="home-install-trigger-btn"
          onClick={() => setShowInstallModal(true)}
          className="px-2.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1 shrink-0 transition-all active:scale-95"
        >
          <Download className="w-3.5 h-3.5" />
          <span>{language === "om" ? "Fe'i" : "Install"}</span>
        </button>
      </div>
    </div>
  );
};
