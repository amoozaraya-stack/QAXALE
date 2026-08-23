import React, { useState } from "react";
import {
  Layers,
  Sparkles,
  ArrowRight,
  BookOpen,
  HelpCircle,
  Lightbulb,
  Compass,
  CheckCircle2,
  Share2,
  RefreshCw,
  Cpu,
  Hammer,
  Workflow,
  GraduationCap,
} from "lucide-react";
import { useApp } from "../context/AppContext";
import { sendChatMessage } from "../services/api";

interface InterpretResult {
  concept: string;
  originalDefinition: string;
  plainLanguage: string;
  feynmanAnalogy: string;
  coreMechanism: string;
  technicalTerms: Array<{ term: string; meaning: string }>;
  practicalApplication: string;
  practiceTask: string;
  understandingCheck: string;
  nextThreshold: string;
}

export const InterpretView: React.FC = () => {
  const { language, setActiveTab, createConversation, addMessageToActiveConversation } = useApp();

  const [inputConcept, setInputConcept] = useState("");
  const [selectedLayer, setSelectedLayer] = useState<
    | "all"
    | "plain"
    | "feynman"
    | "mechanism"
    | "application"
    | "practice"
    | "check"
  >("all");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<InterpretResult | null>(null);

  const sampleConcepts = [
    {
      om: "Artificial Intelligence (AI)",
      en: "Artificial Intelligence",
      sub: "Hubannoo Nam-tolchee",
    },
    {
      om: "First-Principles Thinking",
      en: "First-Principles Thinking",
      sub: "Yaada Bu'uuraa",
    },
    {
      om: "Distributed Consensus / Blockchain",
      en: "Distributed Consensus",
      sub: "Waliigaltee Raabsamaa",
    },
    {
      om: "Recursion in Programming",
      en: "Recursion in Programming",
      sub: "Koodii Of-Waamu (Recursion)",
    },
  ];

  const handleInterpret = async (conceptToAnalyze?: string) => {
    const target = conceptToAnalyze || inputConcept;
    if (!target.trim() || isLoading) return;

    setIsLoading(true);
    setInputConcept(target);

    try {
      const prompt = `You are QAXALE V3's Multi-Layer Interpretive Intelligence Engine.
Deconstruct this concept: "${target}".
Provide a structured JSON output with:
- "concept": "${target}",
- "originalDefinition": "Accurate formal/scientific definition",
- "plainLanguage": "Intuitive explanation in clear language without jargon",
- "feynmanAnalogy": "A tangible, relatable analogy connecting it to everyday reality",
- "coreMechanism": "The fundamental engine/rule of how it operates step-by-step",
- "technicalTerms": Array of { "term": string, "meaning": string } for 2-3 essential terms,
- "practicalApplication": "Where and how someone can actually build or use this in the real world",
- "practiceTask": "A mini-exercise for the user to try right now",
- "understandingCheck": "A deep thought question to test if they truly grasp it",
- "nextThreshold": "The next advanced concept to learn after this"

Language: Respond in ${language === "om" ? "authentic, modern Afaan Oromoo (with English technical terms in parentheses)" : "clear English"}.`;

      const response = await sendChatMessage(
        [{ role: "user", content: prompt }],
        language,
        "interpret-layers"
      );

      let parsed: any;
      try {
        const text = response.reply;
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          parsed = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error("No JSON found");
        }
      } catch {
        parsed = {
          concept: target,
          originalDefinition: response.reply,
          plainLanguage: response.reply,
          feynmanAnalogy: "Yaada hubannoo uumuuf fakkeenya guyyaa guyyaa fayyadami.",
          coreMechanism: "Adeemsa bu'uuraa fi seera isaatiin hojjeta.",
          technicalTerms: [{ term: target, meaning: "Yaada teeknooloojii fi saayinsii" }],
          practicalApplication: "Pirojektii fi sagantaa keessatti hojiirra oola.",
          practiceTask: "Yaada kana jecha keetiin namatti himi.",
          understandingCheck: "Maaliif akka hojjetu ibsi?",
          nextThreshold: "Sadarkaa itti aanutti ce'i.",
        };
      }

      setResult(parsed);
    } catch (e) {
      console.error("Interpret error:", e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeepDiveChat = () => {
    if (!result) return;
    const promptText =
      language === "om"
        ? `Waa'ee "${result.concept}" irratti gadi fageenyaan na barsiisi. Sadarkaa itti aanu akkamittiin baradha?`
        : `Let's deep dive into "${result.concept}". How do I advance from here?`;

    createConversation(result.concept);
    addMessageToActiveConversation({
      role: "user",
      content: promptText,
      mode: "agency-loop",
    });
    setActiveTab("chat");
  };

  return (
    <div className="space-y-4 pb-20 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="rounded-2xl bg-gradient-to-br from-indigo-950/70 via-slate-900 to-slate-900 border border-indigo-500/30 p-4 shadow-lg">
        <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold uppercase tracking-wider mb-1">
          <Layers className="w-4 h-4" />
          <span>QAXALE V3 • Interpretive Engine</span>
        </div>
        <h2 className="text-lg font-black text-white">
          {language === "om" ? "Hubannoo & Hiika Beekumsaa" : "Interpretive Intelligence"}
        </h2>
        <p className="text-xs text-slate-300 mt-1 leading-relaxed">
          {language === "om"
            ? "Beekumsa fi teeknooloojii walxaxaa gara hubannoo salphaa, fakkii, seera bu'uuraa, fi dandeettii hojiitti jijjiiraa."
            : "Convert complex ideas into multi-layer pathways of understanding, analogies, and practical capability."}
        </p>

        {/* Search / Input Box */}
        <div className="mt-3.5 flex gap-2">
          <input
            id="interpret-input-concept"
            type="text"
            value={inputConcept}
            onChange={(e) => setInputConcept(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleInterpret()}
            placeholder={
              language === "om"
                ? "Yaada ykn teeknolojii walxaxaa galchaa (fkn: AI, Algorithm)..."
                : "Enter any complex concept (e.g. Neural Networks, Consensus)..."
            }
            className="flex-1 bg-slate-950/90 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
          />
          <button
            id="interpret-submit-btn"
            onClick={() => handleInterpret()}
            disabled={isLoading || !inputConcept.trim()}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all shadow-md active:scale-95"
          >
            {isLoading ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Sparkles className="w-3.5 h-3.5" />
            )}
            <span>{language === "om" ? "Hiiki" : "Interpret"}</span>
          </button>
        </div>
      </div>

      {/* Suggested Quick Concepts */}
      {!result && !isLoading && (
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
            {language === "om" ? "Fakkeenyaaf Filadhaa" : "Sample Concepts to Deconstruct"}
          </h3>
          <div className="grid grid-cols-2 gap-2">
            {sampleConcepts.map((item, idx) => (
              <button
                key={idx}
                onClick={() => handleInterpret(item.en)}
                className="p-3 rounded-xl bg-slate-900/80 hover:bg-slate-900 border border-slate-800 hover:border-indigo-500/40 text-left transition-all group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white group-hover:text-indigo-300">
                    {item.en}
                  </span>
                  <ArrowRight className="w-3 h-3 text-slate-500 group-hover:text-indigo-400" />
                </div>
                <p className="text-[10px] text-slate-400 mt-1">{item.sub}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Loading state */}
      {isLoading && (
        <div className="p-8 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col items-center justify-center text-center space-y-3">
          <div className="w-10 h-10 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
          <div className="space-y-1">
            <h4 className="text-xs font-bold text-white">
              {language === "om" ? "Beekumsicha Sadarkaadhaan Hiikaa Jira..." : "Deconstructing Concept Into Layers..."}
            </h4>
            <p className="text-[11px] text-slate-400">
              {language === "om"
                ? "Salphaatti hiikuu → Fakkeenya Guyyaa → Seera Bu'uuraa → Hojiirra Oolmaa"
                : "Simplifying → Everyday Analogy → Core Mechanism → Real Application"}
            </p>
          </div>
        </div>
      )}

      {/* Deconstructed Representation Layers Result */}
      {result && !isLoading && (
        <div className="space-y-3">
          {/* Layer Selector Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-[11px]">
            {[
              { id: "all", label: language === "om" ? "Hunda (All)" : "Full Breakdown" },
              { id: "plain", label: language === "om" ? "Afaan Salphaa" : "Plain Language" },
              { id: "feynman", label: language === "om" ? "Fakkeenya Feynman" : "Feynman Analogy" },
              { id: "mechanism", label: language === "om" ? "Seera Bu'uuraa" : "Mechanism" },
              { id: "application", label: language === "om" ? "Hojiirra Oolmaa" : "Application" },
              { id: "check", label: language === "om" ? "Qormaata Hubannoo" : "Self-Check" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedLayer(tab.id as any)}
                className={`px-2.5 py-1 rounded-lg font-medium whitespace-nowrap transition-all ${
                  selectedLayer === tab.id
                    ? "bg-indigo-600 text-white font-bold"
                    : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Layer 1 & 2: Core Concept & Plain Language */}
          {(selectedLayer === "all" || selectedLayer === "plain") && (
            <div className="rounded-xl bg-slate-900 border border-slate-800 p-3.5 space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-400">
                <BookOpen className="w-4 h-4" />
                <span>1. {language === "om" ? "Hiika Salphaa (Plain Language)" : "Plain Language Representation"}</span>
              </div>
              <h3 className="text-sm font-bold text-white">{result.concept}</h3>
              <p className="text-xs text-slate-300 leading-relaxed">{result.plainLanguage}</p>
            </div>
          )}

          {/* Layer 3: Feynman Analogy */}
          {(selectedLayer === "all" || selectedLayer === "feynman") && (
            <div className="rounded-xl bg-gradient-to-r from-amber-950/30 to-slate-900 border border-amber-500/30 p-3.5 space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400">
                <Lightbulb className="w-4 h-4" />
                <span>2. {language === "om" ? "Fakkeenya Feynman (Everyday Analogy)" : "Feynman Everyday Analogy"}</span>
              </div>
              <p className="text-xs text-slate-200 leading-relaxed italic">
                "{result.feynmanAnalogy}"
              </p>
            </div>
          )}

          {/* Layer 4: Core Mechanism */}
          {(selectedLayer === "all" || selectedLayer === "mechanism") && (
            <div className="rounded-xl bg-slate-900 border border-slate-800 p-3.5 space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400">
                <Cpu className="w-4 h-4" />
                <span>3. {language === "om" ? "Seera Bu'uuraa (Core Mechanism)" : "Core Mechanism & Mechanics"}</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">{result.coreMechanism}</p>

              {result.technicalTerms?.length > 0 && (
                <div className="pt-2 border-t border-slate-800/80 space-y-1.5">
                  <span className="text-[10px] uppercase font-bold text-slate-400">
                    {language === "om" ? "Jechoota Teeknikaa Ijoo" : "Key Technical Terms"}
                  </span>
                  <div className="grid grid-cols-1 gap-1.5">
                    {result.technicalTerms.map((t, i) => (
                      <div key={i} className="bg-slate-950/70 p-2 rounded-lg text-xs">
                        <span className="font-mono font-bold text-emerald-400">{t.term}</span>:{" "}
                        <span className="text-slate-300">{t.meaning}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Layer 5: Real Application & Practice */}
          {(selectedLayer === "all" || selectedLayer === "application") && (
            <div className="rounded-xl bg-slate-900 border border-slate-800 p-3.5 space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-rose-400">
                <Hammer className="w-4 h-4" />
                <span>4. {language === "om" ? "Hojiirra Oolmaa & Dandeettii (Application)" : "Real-World Application & Practice"}</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">{result.practicalApplication}</p>

              {result.practiceTask && (
                <div className="bg-rose-950/30 border border-rose-500/20 p-2.5 rounded-lg text-xs text-rose-200">
                  <span className="font-bold block mb-1">
                    🎯 {language === "om" ? "Shaakala Guyyaa:" : "Quick Practice Task:"}
                  </span>
                  {result.practiceTask}
                </div>
              )}
            </div>
          )}

          {/* Layer 6: Self-Check & Next Threshold */}
          {(selectedLayer === "all" || selectedLayer === "check") && (
            <div className="rounded-xl bg-slate-900 border border-slate-800 p-3.5 space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-cyan-400">
                <Compass className="w-4 h-4" />
                <span>5. {language === "om" ? "Qormaata Hubannoo & Sadarkaa Itti Aanu" : "Understanding Check & Next Threshold"}</span>
              </div>
              <div className="bg-cyan-950/30 border border-cyan-500/20 p-2.5 rounded-lg text-xs text-cyan-200">
                <span className="font-bold block mb-0.5">
                  ❓ {language === "om" ? "Gaaffii Of-Qoruuf:" : "Self-Assessment Question:"}
                </span>
                {result.understandingCheck}
              </div>

              {result.nextThreshold && (
                <p className="text-xs text-slate-400 pt-1">
                  <span className="text-slate-300 font-bold">
                    {language === "om" ? "Sadarkaa Itti Aanu: " : "Next Threshold: "}
                  </span>
                  {result.nextThreshold}
                </p>
              )}
            </div>
          )}

          {/* Action: Deep Dive into Agency Loop */}
          <div className="pt-1 flex gap-2">
            <button
              onClick={handleDeepDiveChat}
              className="flex-1 py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-md transition-all active:scale-95"
            >
              <Workflow className="w-4 h-4" />
              <span>
                {language === "om"
                  ? "Waliin-haasaa Qaxaleetti Ce'i (Agency Loop)"
                  : "Launch QAXALE Agency Loop"}
              </span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
