import React, { useState } from "react";
import {
  Wrench,
  Search,
  Cpu,
  Layers,
  Sparkles,
  Compass,
  FileText,
  Workflow,
  Calculator,
  Volume2,
  Copy,
  Check,
  ArrowRight,
  Send,
  Download,
  Share2,
  RefreshCw,
  AlertCircle,
  HelpCircle,
  Globe,
  Link2,
  Activity,
  Cloud,
} from "lucide-react";
import { useApp } from "../context/AppContext";
import {
  performDeepResearch,
  generateDiagram,
  analyzeDocument,
  solveMathProbability,
  speakText,
  DeepResearchResult,
  DiagramResult,
  DocumentAnalysisResult,
  MathProbabilityResult,
} from "../services/api";
import { GoogleGroundingTool } from "./tools/GoogleGroundingTool";
import { ConnectorsTool } from "./tools/ConnectorsTool";
import { SystemDiagnosticsTool } from "./tools/SystemDiagnosticsTool";

type ActiveTool =
  | "grounding"
  | "research"
  | "diagram"
  | "document"
  | "math"
  | "connectors"
  | "voice"
  | "diagnostics";

export const ToolsView: React.FC = () => {
  const { language, setActiveTab, createConversation, addMessageToActiveConversation } = useApp();
  const [activeTool, setActiveTool] = useState<ActiveTool>("grounding");

  // Research State
  const [researchTopic, setResearchTopic] = useState("");
  const [researchDepth, setResearchDepth] = useState<"standard" | "comprehensive">("comprehensive");
  const [researchLoading, setResearchLoading] = useState(false);
  const [researchResult, setResearchResult] = useState<DeepResearchResult | null>(null);

  // Diagram State
  const [diagramPrompt, setDiagramPrompt] = useState("");
  const [diagramType, setDiagramType] = useState("architecture");
  const [diagramLoading, setDiagramLoading] = useState(false);
  const [diagramResult, setDiagramResult] = useState<DiagramResult | null>(null);

  // Document State
  const [docText, setDocText] = useState("");
  const [docName, setDocName] = useState("Document.txt");
  const [docLoading, setDocLoading] = useState(false);
  const [docResult, setDocResult] = useState<DocumentAnalysisResult | null>(null);

  // Math State
  const [mathProblem, setMathProblem] = useState("");
  const [mathLoading, setMathLoading] = useState(false);
  const [mathResult, setMathResult] = useState<MathProbabilityResult | null>(null);

  // Voice State
  const [voiceText, setVoiceText] = useState("");
  const [isSpeaking, setIsSpeaking] = useState(false);

  // UI state
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  const handleCopy = (text: string, sectionId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(sectionId);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const handleSendToChat = (text: string, title: string) => {
    const convId = createConversation(title.slice(0, 28));
    addMessageToActiveConversation({
      role: "assistant",
      content: text,
      mode: "agency-loop",
    });
    setActiveTab("chat");
  };

  // Execution Handlers
  const handleExecuteResearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!researchTopic.trim() || researchLoading) return;
    setResearchLoading(true);
    setResearchResult(null);

    const res = await performDeepResearch(researchTopic, language, researchDepth);
    setResearchResult(res);
    setResearchLoading(false);
  };

  const handleExecuteDiagram = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!diagramPrompt.trim() || diagramLoading) return;
    setDiagramLoading(true);
    setDiagramResult(null);

    const res = await generateDiagram(diagramPrompt, diagramType, language);
    setDiagramResult(res);
    setDiagramLoading(false);
  };

  const handleExecuteDocAnalysis = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!docText.trim() || docLoading) return;
    setDocLoading(true);
    setDocResult(null);

    const res = await analyzeDocument(docText, docName, language);
    setDocResult(res);
    setDocLoading(false);
  };

  const handleExecuteMath = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!mathProblem.trim() || mathLoading) return;
    setMathLoading(true);
    setMathResult(null);

    const res = await solveMathProbability(mathProblem, language);
    setMathResult(res);
    setMathLoading(false);
  };

  const handleSpeak = (textToSpeak: string) => {
    setIsSpeaking(true);
    speakText(textToSpeak, language);
    setTimeout(() => setIsSpeaking(false), 2500);
  };

  const toolsList = [
    {
      id: "grounding" as ActiveTool,
      label: { om: "Google Grounding", en: "Google Grounding" },
      desc: { om: "Ragaa qabatamaa Google Search", en: "Real-time web verified intelligence" },
      icon: Globe,
      color: "text-emerald-400 border-emerald-500/30 bg-emerald-500/10",
    },
    {
      id: "connectors" as ActiveTool,
      label: { om: "Connectors & Google Docs", en: "Connectors & Exporter" },
      desc: { om: "Google Docs, Webhooks & Cloud Sync", en: "Export packages, APIs & Firestore" },
      icon: Link2,
      color: "text-cyan-400 border-cyan-500/30 bg-cyan-500/10",
    },
    {
      id: "research" as ActiveTool,
      label: { om: "Qorannoo Gad-fagoo", en: "Deep Research" },
      desc: { om: "Xiinxala bu'uuraa fi karoora tarkaanfii", en: "First-principles research & action roadmap" },
      icon: Compass,
      color: "text-amber-400 border-amber-500/30 bg-amber-500/10",
    },
    {
      id: "diagram" as ActiveTool,
      label: { om: "Caasaa & Fakkii", en: "Visual Diagrams" },
      desc: { om: "SVG & Caasaa sirnaa uumuu", en: "Generate architecture charts & flowcharts" },
      icon: Workflow,
      color: "text-blue-400 border-blue-500/30 bg-blue-500/10",
    },
    {
      id: "document" as ActiveTool,
      label: { om: "Xiinxala Galmee", en: "Doc Intelligence" },
      desc: { om: "Qabiyyee fi bu'aa ijoo baasuu", en: "Extract key takeaways, risks & action points" },
      icon: FileText,
      color: "text-emerald-400 border-emerald-500/30 bg-emerald-500/10",
    },
    {
      id: "math" as ActiveTool,
      label: { om: "Herrega & Carraa", en: "Math & Odds Solver" },
      desc: { om: "Herrega carraa fi shallaggii EV", en: "Probability, EV, and mathematical proofs" },
      icon: Calculator,
      color: "text-purple-400 border-purple-500/30 bg-purple-500/10",
    },
    {
      id: "diagnostics" as ActiveTool,
      label: { om: "Fayyaa Sirnaa", en: "System Diagnostics" },
      desc: { om: "Telemetry, Models & Cache", en: "Live latency, quota & endpoints" },
      icon: Activity,
      color: "text-sky-400 border-sky-500/30 bg-sky-500/10",
    },
    {
      id: "voice" as ActiveTool,
      label: { om: "Sagalee & Dubbii", en: "Voice & Speech" },
      desc: { om: "Sagaleen dubbisuu fi sagaleessuu", en: "Bilingual neural speech & pronunciation" },
      icon: Volume2,
      color: "text-rose-400 border-rose-500/30 bg-rose-500/10",
    },
  ];

  return (
    <div className="space-y-4 pb-20 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />
        <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider mb-1">
          <Wrench className="w-4 h-4" />
          <span>{language === "om" ? "Meeshaalee Qaxale AI" : "QAXALE AI Productivity Suite"}</span>
        </div>
        <h2 className="text-base font-bold text-white">
          {language === "om"
            ? "Meeshaalee Ogummaa & Hojiirra Oolmaa AI"
            : "Enterprise Generative AI & Autonomous Tools"}
        </h2>
        <p className="text-xs text-slate-400 mt-1 leading-relaxed">
          {language === "om"
            ? "Qorannoo gad-fagoo, fakkii caasaa, herrega carraa, xiinxala galmee fi sagalee meeshaa tokkoon raawwadhaa."
            : "Execute deep research, create architecture diagrams, solve mathematical odds, and analyze documents."}
        </p>
      </div>

      {/* Tool Navigation Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {toolsList.map((t) => {
          const Icon = t.icon;
          const isActive = activeTool === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTool(t.id)}
              className={`p-3 rounded-2xl text-left border transition-all duration-150 flex flex-col justify-between ${
                isActive
                  ? "bg-slate-900 border-amber-500/60 shadow-md ring-1 ring-amber-500/30"
                  : "bg-slate-950/80 border-slate-800/90 hover:border-slate-700 hover:bg-slate-900/60"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className={`p-2 rounded-xl border ${t.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
                {isActive && (
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                )}
              </div>
              <div>
                <p className={`text-xs font-bold ${isActive ? "text-amber-400" : "text-slate-200"}`}>
                  {t.label[language]}
                </p>
                <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">
                  {t.desc[language]}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {/* ACTIVE TOOL WORKBENCH */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-md space-y-4">
        {/* GOOGLE SEARCH GROUNDING */}
        {activeTool === "grounding" && <GoogleGroundingTool />}

        {/* CONNECTORS & EXPORTER */}
        {activeTool === "connectors" && <ConnectorsTool />}

        {/* SYSTEM DIAGNOSTICS */}
        {activeTool === "diagnostics" && <SystemDiagnosticsTool />}

        {/* 1. DEEP RESEARCH TOOL */}
        {activeTool === "research" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Compass className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-bold text-white">
                  {language === "om" ? "Qorannoo Gad-fagoo (Autonomous Deep Research)" : "Deep Research Engine"}
                </h3>
              </div>
              <div className="flex items-center gap-1 text-[10px]">
                <button
                  type="button"
                  onClick={() => setResearchDepth("standard")}
                  className={`px-2 py-0.5 rounded-lg font-semibold ${
                    researchDepth === "standard" ? "bg-amber-500 text-slate-950" : "bg-slate-800 text-slate-400"
                  }`}
                >
                  Standard
                </button>
                <button
                  type="button"
                  onClick={() => setResearchDepth("comprehensive")}
                  className={`px-2 py-0.5 rounded-lg font-semibold ${
                    researchDepth === "comprehensive" ? "bg-amber-500 text-slate-950" : "bg-slate-800 text-slate-400"
                  }`}
                >
                  Comprehensive
                </button>
              </div>
            </div>

            {/* Quick Starters */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
              {[
                { om: "Algorizimii fi Dandeettii LLM", en: "LLM Transformer Architecture" },
                { om: "Shallaggii Carraa EV fi Variance", en: "Expected Value & Probability in Sports" },
                { om: "Afaan Oromoo fi NLP Dijitaalaa", en: "Low-Resource NLP for Afaan Oromoo" },
              ].map((starter, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setResearchTopic(starter[language])}
                  className="px-2.5 py-1 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-lg text-[10px] text-slate-300 whitespace-nowrap transition-colors"
                >
                  + {starter[language]}
                </button>
              ))}
            </div>

            <form onSubmit={handleExecuteResearch} className="space-y-2">
              <textarea
                value={researchTopic}
                onChange={(e) => setResearchTopic(e.target.value)}
                placeholder={
                  language === "om"
                    ? "Mata-duree qorannoo barreessaa (fkn: Caasaa neetworkii odeeffannoo, teeknooloojii AI...)"
                    : "Enter research topic (e.g. Distributed Consensus, Transformer Attention Mechanisms...)"
                }
                rows={3}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors resize-none"
              />
              <button
                type="submit"
                disabled={researchLoading || !researchTopic.trim()}
                className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-md transition-all active:scale-[0.98]"
              >
                {researchLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>{language === "om" ? "Qorannoon Raawwatamaa Jira..." : "Generating Deep Research..."}</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>{language === "om" ? "Qorannoo Gad-fagoo Jalqabi" : "Execute Deep Research"}</span>
                  </>
                )}
              </button>
            </form>

            {/* Research Results */}
            {researchResult && (
              <div className="space-y-3 pt-2 animate-in fade-in duration-200">
                <div className="flex items-center justify-between bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <div>
                    <h4 className="text-xs font-bold text-amber-400">{researchResult.title}</h4>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      {language === "om" ? "Bu'aa Qorannoo Qaxale AI" : "QAXALE Deep Research Brief"}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleSpeak(researchResult.executiveSummary)}
                      className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs"
                      title="Read aloud"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() =>
                        handleCopy(
                          JSON.stringify(researchResult, null, 2),
                          "research"
                        )
                      }
                      className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs"
                    >
                      {copiedSection === "research" ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                    <button
                      onClick={() =>
                        handleSendToChat(
                          `# ${researchResult.title}\n\n${researchResult.executiveSummary}`,
                          researchResult.title
                        )
                      }
                      className="p-1.5 bg-amber-500/20 text-amber-400 hover:bg-amber-500/30 rounded-lg text-xs"
                      title="Send to chat"
                    >
                      <Send className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Executive Summary */}
                <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800 text-xs text-slate-200 leading-relaxed">
                  <p className="font-semibold text-white mb-1">
                    {language === "om" ? "Guduunfaa Qorannichaa (Executive Summary):" : "Executive Summary:"}
                  </p>
                  <p>{researchResult.executiveSummary}</p>
                </div>

                {/* First Principles */}
                {researchResult.firstPrinciples?.length > 0 && (
                  <div className="space-y-1.5">
                    <p className="text-[11px] font-bold text-amber-400 uppercase tracking-wider">
                      {language === "om" ? "Dhugaa Bu'uuraa (First-Principles Analysis):" : "First-Principles Breakdown:"}
                    </p>
                    <div className="grid gap-1.5">
                      {researchResult.firstPrinciples.map((fp, idx) => (
                        <div key={idx} className="bg-slate-950 p-2.5 rounded-xl border border-slate-800/80 text-xs">
                          <p className="font-semibold text-slate-100">{fp.concept}</p>
                          <p className="text-slate-400 text-[11px] mt-0.5">{fp.explanation}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Action Plan Roadmap */}
                {researchResult.actionPlan?.length > 0 && (
                  <div className="space-y-1.5">
                    <p className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider">
                      {language === "om" ? "Karoora Tarkaanfii (Actionable Roadmap):" : "Actionable Execution Roadmap:"}
                    </p>
                    <div className="space-y-1.5">
                      {researchResult.actionPlan.map((step, idx) => (
                        <div key={idx} className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-xs flex gap-2.5">
                          <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-[10px] flex items-center justify-center shrink-0">
                            {step.phase || idx + 1}
                          </span>
                          <div>
                            <p className="font-bold text-slate-200">{step.title}</p>
                            <p className="text-slate-400 text-[11px]">{step.action}</p>
                            {step.deliverable && (
                              <p className="text-[10px] text-amber-400 mt-1 font-mono">
                                📦 Deliverable: {step.deliverable}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* 2. DIAGRAM GENERATOR */}
        {activeTool === "diagram" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Workflow className="w-4 h-4 text-blue-400" />
                <h3 className="text-sm font-bold text-white">
                  {language === "om" ? "Kalaqa Fakkii & Caasaa (Visual Architecture)" : "Visual Architecture & Diagrams"}
                </h3>
              </div>
              <select
                value={diagramType}
                onChange={(e) => setDiagramType(e.target.value)}
                className="bg-slate-950 border border-slate-800 text-slate-300 text-[10px] rounded-lg px-2 py-1"
              >
                <option value="architecture">System Architecture</option>
                <option value="flowchart">Process Flowchart</option>
                <option value="probability-tree">Probability Tree / Decision Model</option>
                <option value="neural-network">Neural Network Pipeline</option>
              </select>
            </div>

            {/* Quick diagram starters */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
              {[
                "Client-Server API Gateway Flow",
                "Sports Odds Probability Tree",
                "Full-Stack LLM RAG Pipeline",
              ].map((starter, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setDiagramPrompt(starter)}
                  className="px-2.5 py-1 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-lg text-[10px] text-slate-300 whitespace-nowrap transition-colors"
                >
                  + {starter}
                </button>
              ))}
            </div>

            <form onSubmit={handleExecuteDiagram} className="space-y-2">
              <input
                type="text"
                value={diagramPrompt}
                onChange={(e) => setDiagramPrompt(e.target.value)}
                placeholder={
                  language === "om"
                    ? "Caasaa fakkii uumuu barbaaddu galchaa..."
                    : "Describe architecture or flow (e.g. Real-Time WebSocket Architecture)..."
                }
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
              />
              <button
                type="submit"
                disabled={diagramLoading || !diagramPrompt.trim()}
                className="w-full py-2.5 bg-blue-500 hover:bg-blue-400 disabled:opacity-50 text-slate-950 font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-md transition-all active:scale-[0.98]"
              >
                {diagramLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>{language === "om" ? "Fakkiin Qophaa'aa Jira..." : "Generating System Diagram..."}</span>
                  </>
                ) : (
                  <>
                    <Workflow className="w-4 h-4" />
                    <span>{language === "om" ? "Fakkii Caasaa Uumi" : "Generate Visual Diagram"}</span>
                  </>
                )}
              </button>
            </form>

            {diagramResult && (
              <div className="space-y-3 pt-2 animate-in fade-in duration-200">
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-blue-400">{diagramResult.title}</h4>
                    <p className="text-[10px] text-slate-400">{diagramResult.description}</p>
                  </div>
                  <button
                    onClick={() =>
                      handleCopy(
                        diagramResult.mermaidSyntax || diagramResult.svgSnippet || "",
                        "diagram"
                      )
                    }
                    className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs"
                  >
                    {copiedSection === "diagram" ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>

                {/* SVG Live Graphic Render */}
                {diagramResult.svgSnippet && (
                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 overflow-x-auto flex justify-center">
                    <div
                      className="w-full max-w-lg"
                      dangerouslySetInnerHTML={{ __html: diagramResult.svgSnippet }}
                    />
                  </div>
                )}

                {/* Structured Node Breakdown */}
                {diagramResult.nodes && diagramResult.nodes.length > 0 && (
                  <div className="grid grid-cols-2 gap-2">
                    {diagramResult.nodes.map((node, i) => (
                      <div key={i} className="bg-slate-950 p-2.5 rounded-xl border border-slate-800/80 text-xs">
                        <div className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-blue-400" />
                          <span className="font-bold text-slate-200">{node.label}</span>
                        </div>
                        <p className="text-[10px] text-slate-400 mt-1">{node.detail}</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Mermaid Syntax Preview */}
                {diagramResult.mermaidSyntax && (
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Mermaid.js Code:</p>
                    <pre className="bg-slate-950 p-3 rounded-xl font-mono text-[11px] text-emerald-300 border border-slate-800 overflow-x-auto">
                      {diagramResult.mermaidSyntax}
                    </pre>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* 3. DOCUMENT INTELLIGENCE TOOL */}
        {activeTool === "document" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-bold text-white">
                  {language === "om" ? "Xiinxala Galmee & Barreeffamaa" : "Document & Text Intelligence"}
                </h3>
              </div>
              <input
                type="text"
                value={docName}
                onChange={(e) => setDocName(e.target.value)}
                placeholder="File name"
                className="bg-slate-950 border border-slate-800 text-slate-300 text-[10px] rounded-lg px-2 py-1 max-w-[120px]"
              />
            </div>

            <form onSubmit={handleExecuteDocAnalysis} className="space-y-2">
              <textarea
                value={docText}
                onChange={(e) => setDocText(e.target.value)}
                placeholder={
                  language === "om"
                    ? "Barreeffama, waliigaltee, ykn qabiyyee xiinxaluu barbaaddan asitti garagalchaa..."
                    : "Paste document text, research paper abstract, or contract clauses here..."
                }
                rows={4}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors resize-none"
              />
              <button
                type="submit"
                disabled={docLoading || !docText.trim()}
                className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-md transition-all active:scale-[0.98]"
              >
                {docLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>{language === "om" ? "Galmeen Xiinxalamaa Jira..." : "Analyzing Document Intelligence..."}</span>
                  </>
                ) : (
                  <>
                    <FileText className="w-4 h-4" />
                    <span>{language === "om" ? "Galmee Xiinxali" : "Analyze Document"}</span>
                  </>
                )}
              </button>
            </form>

            {docResult && (
              <div className="space-y-3 pt-2 animate-in fade-in duration-200">
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-emerald-400">{docResult.title}</h4>
                    <p className="text-[10px] text-slate-400">
                      {docResult.wordCount} words • ~{docResult.readingTimeMin} min read
                    </p>
                  </div>
                  <button
                    onClick={() => handleSpeak(docResult.summary)}
                    className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800 text-xs text-slate-200 leading-relaxed">
                  <p className="font-semibold text-white mb-1">
                    {language === "om" ? "Guduunfaa Qabiyyee (Summary):" : "Core Summary:"}
                  </p>
                  <p>{docResult.summary}</p>
                </div>

                {/* Key Takeaways */}
                {docResult.keyTakeaways?.length > 0 && (
                  <div className="space-y-1.5">
                    <p className="text-[11px] font-bold text-amber-400 uppercase tracking-wider">
                      {language === "om" ? "Yaadolee Ijoo (Key Takeaways):" : "Key Takeaways:"}
                    </p>
                    <ul className="space-y-1">
                      {docResult.keyTakeaways.map((takeaway, idx) => (
                        <li key={idx} className="bg-slate-950 p-2 rounded-lg border border-slate-800 text-xs text-slate-300 flex items-start gap-2">
                          <Check className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                          <span>{takeaway}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Action Items */}
                {docResult.actionItems?.length > 0 && (
                  <div className="space-y-1.5">
                    <p className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider">
                      {language === "om" ? "Tarkaanfiiwwan Barbaachisoo (Action Items):" : "Action Items:"}
                    </p>
                    <ul className="space-y-1">
                      {docResult.actionItems.map((action, idx) => (
                        <li key={idx} className="bg-slate-950 p-2 rounded-lg border border-slate-800 text-xs text-slate-300 flex items-start gap-2">
                          <ArrowRight className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                          <span>{action}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* 4. MATH & PROBABILITY SOLVER */}
        {activeTool === "math" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calculator className="w-4 h-4 text-purple-400" />
                <h3 className="text-sm font-bold text-white">
                  {language === "om" ? "Herrega & Shallaggii Carraa (+EV)" : "Mathematical & Probability Engine"}
                </h3>
              </div>
            </div>

            {/* Quick Math Starters */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
              {[
                "Calculate EV for Decimal Odds 2.40 with 45% probability",
                "Implied probability of 1.75 decimal odds",
                "Poisson goal probability for 1.8 xG vs 1.2 xG",
              ].map((starter, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setMathProblem(starter)}
                  className="px-2.5 py-1 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-lg text-[10px] text-slate-300 whitespace-nowrap transition-colors"
                >
                  + {starter}
                </button>
              ))}
            </div>

            <form onSubmit={handleExecuteMath} className="space-y-2">
              <input
                type="text"
                value={mathProblem}
                onChange={(e) => setMathProblem(e.target.value)}
                placeholder={
                  language === "om"
                    ? "Gaaffii herregaa ykn carraa galchaa (fkn: Expected Value, Decimal Odds, Probability)..."
                    : "Enter formula or odds problem (e.g. Expected Value of 2.10 odds with 52% probability)..."
                }
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 transition-colors"
              />
              <button
                type="submit"
                disabled={mathLoading || !mathProblem.trim()}
                className="w-full py-2.5 bg-purple-500 hover:bg-purple-400 disabled:opacity-50 text-slate-950 font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-md transition-all active:scale-[0.98]"
              >
                {mathLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>{language === "om" ? "Shallaggiin Raawwatamaa Jira..." : "Solving Probability Models..."}</span>
                  </>
                ) : (
                  <>
                    <Calculator className="w-4 h-4" />
                    <span>{language === "om" ? "Herrega & Carraa Shallagi" : "Solve Math & Probability"}</span>
                  </>
                )}
              </button>
            </form>

            {mathResult && (
              <div className="space-y-3 pt-2 animate-in fade-in duration-200">
                <div className="bg-slate-950 p-3.5 rounded-xl border border-purple-500/30">
                  <p className="text-[10px] text-purple-400 font-bold uppercase tracking-wider">
                    {language === "om" ? "Bu'aa Xumuraa:" : "Calculated Result:"}
                  </p>
                  <p className="text-sm font-black text-white mt-1">{mathResult.finalAnswer}</p>
                  {mathResult.expectedValue && (
                    <p className="text-xs text-emerald-400 font-mono mt-1">
                      Expected Value (EV): {mathResult.expectedValue}
                    </p>
                  )}
                  {mathResult.impliedProbabilityPercent && (
                    <p className="text-xs text-amber-400 font-mono mt-0.5">
                      Implied Probability: {mathResult.impliedProbabilityPercent}%
                    </p>
                  )}
                </div>

                {/* Step by step proof */}
                {mathResult.stepByStepProof?.length > 0 && (
                  <div className="space-y-1.5">
                    <p className="text-[11px] font-bold text-slate-300 uppercase">
                      {language === "om" ? "Adeemsa Shallaggii (Step-by-Step Proof):" : "Mathematical Derivation Steps:"}
                    </p>
                    <div className="space-y-1.5">
                      {mathResult.stepByStepProof.map((step, idx) => (
                        <div key={idx} className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-xs">
                          <p className="text-slate-200 font-medium">{step.step}. {step.explanation}</p>
                          {step.formula && (
                            <p className="text-[11px] font-mono text-purple-300 bg-purple-950/30 px-2 py-1 rounded mt-1 border border-purple-800/30">
                              {step.formula}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Responsible gambling disclaimer */}
                {mathResult.responsibleAdvice && (
                  <div className="bg-amber-500/10 border border-amber-500/30 p-2.5 rounded-xl text-[11px] text-amber-300 flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <span>{mathResult.responsibleAdvice}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* 5. VOICE & PRONUNCIATION STATION */}
        {activeTool === "voice" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Volume2 className="w-4 h-4 text-rose-400" />
                <h3 className="text-sm font-bold text-white">
                  {language === "om" ? "Sagaleessaa fi Dubbii (Bilingual Speech Synthesizer)" : "Bilingual Voice Synthesizer"}
                </h3>
              </div>
            </div>

            {/* Quick pronunciation samples */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
              {[
                { om: "Qaxaleen dandeettii sammuu nam-tolchee uuma.", en: "Qaxale develops artificial cognitive agency." },
                { om: "Taphni carraa itti-gaafatamummaan raawwatamuu qaba.", en: "Probabilistic analysis requires disciplined risk management." },
                { om: "Beekumsa bu'uuraa gara hojiitti jijjiiri.", en: "Transform first-principles knowledge into execution." },
              ].map((sample, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setVoiceText(sample[language])}
                  className="px-2.5 py-1 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-lg text-[10px] text-slate-300 whitespace-nowrap transition-colors"
                >
                  + {sample[language].slice(0, 30)}...
                </button>
              ))}
            </div>

            <div className="space-y-2">
              <textarea
                value={voiceText}
                onChange={(e) => setVoiceText(e.target.value)}
                placeholder={
                  language === "om"
                    ? "Jecha ykn hima sagaleessuu barbaaddan asitti barreessaa..."
                    : "Enter text to synthesize into speech..."
                }
                rows={3}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500 transition-colors resize-none"
              />
              <button
                type="button"
                onClick={() => handleSpeak(voiceText)}
                disabled={!voiceText.trim() || isSpeaking}
                className="w-full py-2.5 bg-rose-500 hover:bg-rose-400 disabled:opacity-50 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-md transition-all active:scale-[0.98]"
              >
                <Volume2 className={`w-4 h-4 ${isSpeaking ? "animate-pulse" : ""}`} />
                <span>
                  {isSpeaking
                    ? (language === "om" ? "Dubbisaa Jira..." : "Playing Speech...")
                    : (language === "om" ? "Sagaleen Dhageeffadhu" : "Synthesize & Speak Aloud")}
                </span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
