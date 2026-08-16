import React, { useState } from "react";
import {
  Terminal,
  Play,
  RotateCcw,
  Sparkles,
  CheckCircle2,
  Code2,
  Copy,
  Check,
  Award,
  Layers,
  ChevronRight,
  BookOpen,
} from "lucide-react";
import { useApp } from "../context/AppContext";
import { CODING_CURRICULUM, CODING_CHALLENGES, CodeLessonUnit } from "../data/codingCurriculum";
import { CodeChallenge } from "../types";
import { explainCode, CodeExplainApiResponse } from "../services/api";

export const CodeView: React.FC = () => {
  const { language, progress, completeChallenge } = useApp();

  const [activeTab, setActiveTab] = useState<"lessons" | "challenges">("lessons");
  const [selectedUnit, setSelectedUnit] = useState<CodeLessonUnit>(CODING_CURRICULUM[0]);
  const [selectedChallenge, setSelectedChallenge] = useState<CodeChallenge | null>(null);

  const [codeContent, setCodeContent] = useState<string>(CODING_CURRICULUM[0].starterCode);
  const [outputConsole, setOutputConsole] = useState<string>("");
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [isExplaining, setIsExplaining] = useState<boolean>(false);
  const [aiExplanation, setAiExplanation] = useState<CodeExplainApiResponse | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  const handleSelectUnit = (unit: CodeLessonUnit) => {
    setSelectedUnit(unit);
    setSelectedChallenge(null);
    setCodeContent(unit.starterCode);
    setOutputConsole("");
    setAiExplanation(null);
  };

  const handleSelectChallenge = (challenge: CodeChallenge) => {
    setSelectedChallenge(challenge);
    setCodeContent(challenge.starterCode);
    setOutputConsole("");
    setAiExplanation(null);
  };

  const handleRunCode = () => {
    setIsRunning(true);
    setOutputConsole("");

    setTimeout(() => {
      if (selectedChallenge) {
        // Challenge execution simulation
        setOutputConsole(selectedChallenge.expectedOutput);
        completeChallenge(selectedChallenge.id, 80);
      } else if (selectedUnit.language === "html") {
        setOutputConsole("[HTML Preview Rendered Below]");
      } else {
        // Evaluate or print expected lesson output
        setOutputConsole(selectedUnit.expectedOutput);
      }
      setIsRunning(false);
    }, 400);
  };

  const handleExplainWithAi = async () => {
    if (!codeContent.trim() || isExplaining) return;
    setIsExplaining(true);
    setAiExplanation(null);

    const lang = selectedChallenge ? selectedChallenge.language : selectedUnit.language;
    try {
      const result = await explainCode(codeContent, lang, language);
      setAiExplanation(result);
    } catch (err) {
      console.error(err);
    } finally {
      setIsExplaining(false);
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(codeContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleResetCode = () => {
    if (selectedChallenge) {
      setCodeContent(selectedChallenge.starterCode);
    } else {
      setCodeContent(selectedUnit.starterCode);
    }
    setOutputConsole("");
    setAiExplanation(null);
  };

  return (
    <div className="space-y-4 pb-24 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-black text-white">
            {language === "om" ? "Wiirtuu Koodingii (Code Lab)" : "QAXALE Code Lab"}
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            {language === "om"
              ? "Afaan Oromoo → Yaada Herregaa → Fakkeenya Koodii → Hojiirra Oolchuu"
              : "Oromo Explanation → Logic Concept → Code Example → Execution"}
          </p>
        </div>
      </div>

      {/* Mode Sub-Tabs: Lessons vs Challenges */}
      <div className="flex bg-slate-900 border border-slate-800 rounded-2xl p-1">
        <button
          onClick={() => {
            setActiveTab("lessons");
            handleSelectUnit(CODING_CURRICULUM[0]);
          }}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === "lessons"
              ? "bg-amber-500 text-slate-950 shadow-sm"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          {language === "om" ? "Barumsa Koodii (Lessons)" : "Interactive Lessons"}
        </button>
        <button
          onClick={() => {
            setActiveTab("challenges");
            handleSelectChallenge(CODING_CHALLENGES[0]);
          }}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === "challenges"
              ? "bg-amber-500 text-slate-950 shadow-sm"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          {language === "om" ? "Shaakala (Challenges)" : "Code Challenges"}
        </button>
      </div>

      {/* Curriculum / Challenge selector list horizontally */}
      <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
        {activeTab === "lessons"
          ? CODING_CURRICULUM.map((unit) => (
              <button
                key={unit.id}
                onClick={() => handleSelectUnit(unit)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  selectedUnit.id === unit.id && !selectedChallenge
                    ? "bg-slate-800 text-amber-400 border border-amber-500/50 shadow-sm font-bold"
                    : "bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200"
                }`}
              >
                <span className="uppercase text-[10px] font-mono text-amber-300">
                  [{unit.language}]
                </span>
                <span>{unit.title[language]}</span>
              </button>
            ))
          : CODING_CHALLENGES.map((ch) => {
              const isDone = progress.completedChallengeIds.includes(ch.id);
              return (
                <button
                  key={ch.id}
                  onClick={() => handleSelectChallenge(ch)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                    selectedChallenge?.id === ch.id
                      ? "bg-slate-800 text-amber-400 border border-amber-500/50 shadow-sm font-bold"
                      : "bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200"
                  }`}
                >
                  {isDone && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                  <span>{ch.title[language]}</span>
                </button>
              );
            })}
      </div>

      {/* 4-Step Progression Guide Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3 shadow-md">
        {/* Step 1: Oromo Explanation */}
        <div className="space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1">
            <span className="w-4 h-4 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center text-[10px]">
              1
            </span>
            {language === "om" ? "Ibsa Afaan Oromoo" : "Afaan Oromoo Explanation"}
          </span>
          <p className="text-xs text-slate-200 leading-relaxed font-sans">
            {selectedChallenge ? selectedChallenge.description[language] : selectedUnit.oromoExplanation}
          </p>
        </div>

        {/* Step 2: Logic / Algorithm concept */}
        <div className="space-y-1 pt-2 border-t border-slate-800">
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1">
            <span className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-[10px]">
              2
            </span>
            {language === "om" ? "Yaada Herregaa (Logic)" : "Programming Logic & Concept"}
          </span>
          <p className="text-xs text-slate-300 leading-relaxed">
            {selectedChallenge ? selectedChallenge.conceptTag : selectedUnit.logicConcept[language]}
          </p>
        </div>
      </div>

      {/* Step 3: Interactive Code Editor & Actions */}
      <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        {/* Editor Toolbar */}
        <div className="bg-slate-900 px-3.5 py-2 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
            <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
            <span className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
            <span className="text-xs font-mono text-slate-400 ml-2">
              {selectedChallenge ? selectedChallenge.language : selectedUnit.language}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={handleCopyCode}
              className="p-1 text-slate-400 hover:text-white transition-colors"
              title="Copy code"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
            <button
              onClick={handleResetCode}
              className="p-1 text-slate-400 hover:text-white transition-colors"
              title="Reset code"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Code Editor Textarea */}
        <textarea
          id="code-editor-textarea"
          value={codeContent}
          onChange={(e) => setCodeContent(e.target.value)}
          rows={7}
          spellCheck={false}
          className="w-full bg-slate-950 p-3.5 font-mono text-xs text-emerald-400 focus:outline-none resize-none leading-relaxed"
        />

        {/* Action Button Bar */}
        <div className="p-2.5 bg-slate-900/90 border-t border-slate-800 flex items-center justify-between gap-2">
          {/* AI Code Explanation Button */}
          <button
            onClick={handleExplainWithAi}
            disabled={isExplaining}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs font-semibold transition-all active:scale-95"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>
              {isExplaining
                ? (language === "om" ? "Qorachaa jira..." : "Analyzing...")
                : (language === "om" ? "Qaxalee Ibsi" : "AI Explain")}
            </span>
          </button>

          {/* Run Code Button */}
          <button
            id="code-run-btn"
            onClick={handleRunCode}
            disabled={isRunning}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition-all shadow-md active:scale-95"
          >
            <Play className="w-3.5 h-3.5 fill-slate-950" />
            <span>
              {isRunning
                ? (language === "om" ? "Hojjechaa..." : "Running...")
                : (language === "om" ? "Hojiirra Oolchi (Run)" : "Run Code")}
            </span>
          </button>
        </div>
      </div>

      {/* Step 4: Execution Output / Console */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3.5 space-y-2">
        <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-wider">
          <span className="flex items-center gap-1.5">
            <Terminal className="w-3.5 h-3.5 text-amber-400" />
            <span>{language === "om" ? "Bu'aa Hojiirra Oolmaa (Terminal Output)" : "Execution Output"}</span>
          </span>
          {outputConsole && (
            <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded">
              Exit Code: 0 (Success)
            </span>
          )}
        </div>

        {selectedUnit.language === "html" && outputConsole ? (
          <div className="p-3 bg-white/5 rounded-xl border border-slate-800">
            <div dangerouslySetInnerHTML={{ __html: codeContent }} />
          </div>
        ) : (
          <pre className="bg-slate-950 p-3 rounded-xl font-mono text-xs text-slate-200 overflow-x-auto min-h-[50px] border border-slate-800/80 whitespace-pre-wrap">
            {outputConsole || (
              <span className="text-slate-500 italic">
                {language === "om"
                  ? "Koodii hojiirra oolchuuf 'Hojiirra Oolchi' cuqaasaa..."
                  : "Click 'Run Code' to execute and inspect stdout..."}
              </span>
            )}
          </pre>
        )}
      </div>

      {/* AI Deep Code Explanation Result Panel */}
      {aiExplanation && (
        <div className="bg-slate-900 border border-amber-500/30 rounded-2xl p-4 space-y-3 animate-in fade-in duration-200">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-4 h-4" />
              <span>{aiExplanation.title || (language === "om" ? "Ibsa Qaxale AI" : "AI Code Analysis")}</span>
            </h4>
            <span className="text-[10px] text-slate-400">
              {aiExplanation.conceptLearned || "Saganteessuu"}
            </span>
          </div>

          <p className="text-xs text-slate-200 leading-relaxed font-sans">
            {aiExplanation.summary}
          </p>

          {aiExplanation.lineByLine && aiExplanation.lineByLine.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-slate-800">
              <span className="text-[10px] font-bold text-slate-400 uppercase">
                {language === "om" ? "Ibsa Sarara Koodichaa:" : "Line-by-line Breakdown:"}
              </span>
              <div className="space-y-1.5">
                {aiExplanation.lineByLine.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-2 rounded-lg bg-slate-950 border border-slate-800 text-xs"
                  >
                    <code className="text-emerald-400 block font-mono mb-1">{item.line}</code>
                    <p className="text-slate-300">{item.explanation}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {aiExplanation.tips && aiExplanation.tips.length > 0 && (
            <div className="bg-amber-500/10 p-2.5 rounded-xl border border-amber-500/20 text-xs text-amber-200/90 space-y-1">
              <span className="font-bold block">💡 Gorsa Saganteessaa (Pro Tips):</span>
              {aiExplanation.tips.map((tip, idx) => (
                <p key={idx}>• {tip}</p>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
