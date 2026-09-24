import React, { useState } from "react";
import {
  Cpu,
  Sparkles,
  Play,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ChevronDown,
  ChevronUp,
  Copy,
  Check,
  Send,
  Download,
  Trash2,
  ShieldCheck,
  Globe2,
  TrendingUp,
  Layers,
  BookOpen,
  ArrowRight,
  Terminal,
  Activity,
  Compass,
  Square,
  Users,
  Flame,
  ShieldAlert,
} from "lucide-react";
import { useApp } from "../../context/AppContext";
import { AutonomousMission, AutonomousDomain } from "../../types";

const MISSION_TEMPLATES: Array<{
  title: string;
  domain: AutonomousDomain;
  objective: { om: string; en: string };
  tag: string;
}> = [
  {
    title: "Transformer Neural Networks: World Knowledge Deconstructed",
    domain: "knowledge",
    objective: {
      om: "Caasaa herregaa fi seera 'Transformer Neural Networks' sadarkaadhaan barattootaaf hiiki, qoodiinsa herregaa Vektara Gaaffii (Q), Furtuu (K), fi Gatii (V) fi fakkeenya koodii qabatamaa waliin.",
      en: "Deconstruct the foundational mathematical mechanics of Transformer self-attention into intuitive first-principles models for local students with pure Python code.",
    },
    tag: "World Knowledge",
  },
  {
    title: "Quantum Physics & Computing: Accessible First Principles",
    domain: "applied-science",
    objective: {
      om: "Seera bu'uuraa saayinsii Quantum kanneen akka Superposition fi Quantum Entanglement gara yaada salphaa fi fakkeenya qabatamaatti hiiki.",
      en: "Simplify advanced quantum computing principles (superposition, entanglement, qubit state vectors) into accessible mental models for local learners.",
    },
    tag: "Applied Science",
  },
  {
    title: "Modern Macroeconomics: Monetary Systems & Inflation Mechanics",
    domain: "knowledge",
    objective: {
      om: "Sirna maallaqaa addunyaa, baankii giddu-galeessaa, fi sababoota gatiin meeshaa itti dabalu (inflation) hubannoof salphisi.",
      en: "Demystify global macroeconomic engines, central bank fiat issuance, and inflation drivers for local entrepreneurs and emerging thinkers.",
    },
    tag: "Economics",
  },
  {
    title: "Decoupled Serverless Microservices Scalability Blueprint",
    domain: "tech",
    objective: {
      om: "Ijaarsa sirna dijitaalaa Cloud Run fi Firestore irratti bu'uureffame, kan tajaajilli daqiiqatti gaaffii 50,000 danda'u fi balaa kupha dhabu (fault tolerance) qabu qopheessi.",
      en: "Design an autonomous fault-tolerant microservices architecture leveraging Cloud Run and Firestore capable of 50k rpm with automated fallback circuits.",
    },
    tag: "Architecture",
  },
  {
    title: "Decision Science & Probability: 10,000 Monte Carlo Risk Audit",
    domain: "decision-science",
    objective: {
      om: "Herrega carraa fi variance xiinxali, siimuleeshinii Monte Carlo yaalii 10,000 gaggeessi, akkasumas balaa qabeenya dhabuu fi seera Half-Kelly qoradhu.",
      en: "Synthesize empirical probability distribution, execute 10,000-trial Monte Carlo stochastic simulation, and enforce Half-Kelly risk bounds.",
    },
    tag: "Decision Math",
  },
];

export const AutonomousAgentTool: React.FC = () => {
  const {
    language,
    autonomousMissions,
    activeMission,
    setActiveMission,
    isAgentRunning,
    agentStatusText,
    executeAutonomousMission,
    abortAutonomousMission,
    deleteAutonomousMission,
    setActiveTab,
    createConversation,
    addMessageToActiveConversation,
  } = useApp();

  const [objectiveInput, setObjectiveInput] = useState("");
  const [selectedDomain, setSelectedDomain] = useState<AutonomousDomain>("knowledge");
  const [autonomyMode, setAutonomyMode] = useState<"full" | "human-in-the-loop">("full");
  const [expandedStepIds, setExpandedStepIds] = useState<Record<string, boolean>>({});
  const [copiedDossier, setCopiedDossier] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [summaryLang, setSummaryLang] = useState<"om" | "en">(language);

  const toggleStepExpand = (stepId: string) => {
    setExpandedStepIds((prev) => ({ ...prev, [stepId]: !prev[stepId] }));
  };

  const handleLaunchMission = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!objectiveInput.trim() || isAgentRunning) return;

    await executeAutonomousMission({
      objective: objectiveInput.trim(),
      domain: selectedDomain,
      autonomyMode,
    });
  };

  const handleSelectTemplate = (template: typeof MISSION_TEMPLATES[0]) => {
    setObjectiveInput(template.objective[language]);
    setSelectedDomain(template.domain);
  };

  const handleCopyMarkdown = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedDossier(true);
    setTimeout(() => setCopiedDossier(false), 2200);
  };

  const handleSendDossierToChat = (mission: AutonomousMission) => {
    const title = mission.title || "Autonomous Mission Analysis";
    const convId = createConversation(`[Agent] ${title.slice(0, 20)}`);
    const summary = mission.synthesis?.executiveSummary[language] || mission.goal;
    const directives =
      mission.synthesis?.actionableDirectives
        .map((d) => `- **${d.title}** (${d.priority.toUpperCase()}): ${d.desc}`)
        .join("\n") || "";

    const messageContent = `### 🤖 QAXALE Autonomous Mission Dossier: ${title}

**Kaayyoo / Objective:** ${mission.goal}
**Confidence Index:** ${mission.synthesis?.confidenceRating || mission.confidenceScore || 85}%
**Domain:** ${mission.domain.toUpperCase()}

#### Executive Summary
${summary}

#### Directives & Risk Guardrails
${directives}

---
*Anatu bu'aa qorannoo kana irratti marii gaggeessuu barbaada. Gaaffii qabduu?*`;

    addMessageToActiveConversation({
      role: "assistant",
      content: messageContent,
      mode: "agency-loop",
    });
    setActiveTab("chat");
  };

  const handleDownloadArtifact = (mission: AutonomousMission) => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(mission, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `qaxale_autonomous_${mission.id}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* Platform Banner */}
      <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-500/15 via-slate-900 to-slate-900 border border-amber-500/30 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-44 h-44 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex items-start justify-between relative z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Cpu className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-amber-300 tracking-wide">
                  QAXALE AUTONOMOUS AI
                </span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  V3 ENGINE
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                {language === "om"
                  ? "Adeemsa of-danda'aa 6: Hubannoo → Ragaa Qabatamaa → Monte Carlo → Jechoota Afaan Oromoo → Qorannoo Of-Duubaa → Dossier"
                  : "Self-directed 6-step autonomous loop: Perception → Empirical Grounding → Monte Carlo → Terminology Bridge → Adversarial Audit → Synthesis"}
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowHistory(!showHistory)}
            className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 border border-slate-700 flex items-center gap-1.5 transition-colors"
          >
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span>{autonomousMissions.length}</span>
            <span className="hidden sm:inline">
              {language === "om" ? "Kuusaa" : "Missions"}
            </span>
          </button>
        </div>

        {/* Saved Missions Drawer */}
        {showHistory && (
          <div className="mt-4 pt-3 border-t border-slate-800/80 space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-400 px-1">
              <span>{language === "om" ? "Hojiilee Otoonoomasii Darban" : "Previous Autonomous Missions"}</span>
              <span className="text-[11px] text-amber-400">
                {language === "om" ? "Filadhu ilaali" : "Click to view"}
              </span>
            </div>
            <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1">
              {autonomousMissions.map((m) => (
                <div
                  key={m.id}
                  onClick={() => setActiveMission(m)}
                  className={`p-2.5 rounded-xl border text-xs flex items-center justify-between cursor-pointer transition-all ${
                    activeMission?.id === m.id
                      ? "bg-amber-500/15 border-amber-500/40 text-amber-200"
                      : "bg-slate-900/80 border-slate-800 hover:border-slate-700 text-slate-300"
                  }`}
                >
                  <div className="flex-1 min-w-0 pr-2">
                    <div className="font-semibold truncate">{m.title || m.goal}</div>
                    <div className="text-[10px] text-slate-400 flex items-center gap-2 mt-0.5">
                      <span className="uppercase text-[9px] px-1 py-0.2 bg-slate-800 rounded font-bold text-slate-300">
                        {m.domain}
                      </span>
                      <span>{new Date(m.createdAt).toLocaleDateString()}</span>
                      <span className="text-amber-400 font-semibold">
                        Score: {m.synthesis?.confidenceRating || m.confidenceScore || 85}%
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteAutonomousMission(m.id);
                    }}
                    className="p-1 rounded text-slate-500 hover:text-rose-400 transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Mission Objective Form */}
      <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-lg space-y-3.5">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
            <Compass className="w-4 h-4 text-amber-400" />
            <span>{language === "om" ? "Kaayyoo Otoonoomasii Ibsi" : "Define Autonomous Objective"}</span>
          </label>
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <span className="text-[11px] font-semibold text-slate-400">
              {language === "om" ? "Moodii:" : "Mode:"}
            </span>
            <button
              type="button"
              onClick={() => setAutonomyMode(autonomyMode === "full" ? "human-in-the-loop" : "full")}
              className={`px-2 py-0.5 rounded text-[11px] font-semibold border transition-colors ${
                autonomyMode === "full"
                  ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                  : "bg-slate-800 text-slate-300 border-slate-700"
              }`}
            >
              {autonomyMode === "full"
                ? language === "om"
                  ? "Otoonoomasii Guutuu"
                  : "Full Autonomous"
                : language === "om"
                ? "To'atamaa"
                : "Supervised"}
            </button>
          </div>
        </div>

        {/* Domain Selector Pills */}
        <div className="flex flex-wrap gap-1.5">
          {[
            { id: "knowledge" as AutonomousDomain, label: { om: "Beekumsa Addunyaa", en: "World Knowledge" } },
            { id: "applied-science" as AutonomousDomain, label: { om: "Saayinsii Qabatamaa", en: "Applied Science" } },
            { id: "tech" as AutonomousDomain, label: { om: "Teeknoolojii & Koodii", en: "Tech & Architecture" } },
            { id: "decision-science" as AutonomousDomain, label: { om: "Saayinsii Murtoo", en: "Decision Theory" } },
            { id: "sports" as AutonomousDomain, label: { om: "Ispoortii & Carraa", en: "Sports & Odds" } },
            { id: "custom" as AutonomousDomain, label: { om: "Kan Biroo", en: "Custom Goal" } },
          ].map((dom) => (
            <button
              key={dom.id}
              type="button"
              onClick={() => setSelectedDomain(dom.id)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                selectedDomain === dom.id
                  ? "bg-amber-500 text-slate-950 shadow-sm"
                  : "bg-slate-800/80 text-slate-400 hover:text-slate-200 border border-slate-700/60"
              }`}
            >
              {dom.label[language]}
            </button>
          ))}
        </div>

        {/* Input Field */}
        <form onSubmit={handleLaunchMission} className="space-y-3">
          <textarea
            value={objectiveInput}
            onChange={(e) => setObjectiveInput(e.target.value)}
            disabled={isAgentRunning}
            placeholder={
              language === "om"
                ? "Fkn: Caasaa herregaa fi seera 'Transformer Neural Networks' sadarkaadhaan barattootaaf hiiki, qoodiinsa herregaa fi fakkeenya koodii qabatamaa waliin..."
                : "E.g., Deconstruct the foundational mathematical mechanics of Transformer self-attention into intuitive first-principles models for local students..."
            }
            rows={3}
            className="w-full p-3 rounded-xl bg-slate-950 border border-slate-700/80 text-slate-100 placeholder-slate-500 text-xs focus:outline-none focus:border-amber-500 transition-colors disabled:opacity-60"
          />

          {/* Quick Mission Templates */}
          <div className="space-y-1.5">
            <div className="text-[11px] font-semibold text-slate-400 flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-amber-400" />
              <span>{language === "om" ? "Kaayyoo Qophaa'e Filadhu:" : "One-Click Mission Templates:"}</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
              {MISSION_TEMPLATES.map((tmpl, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectTemplate(tmpl)}
                  className="p-2 rounded-xl bg-slate-950/70 border border-slate-800/80 hover:border-amber-500/50 hover:bg-slate-800/40 text-left transition-all group"
                >
                  <div className="flex items-center justify-between text-[11px] font-semibold text-slate-200 group-hover:text-amber-300">
                    <span className="truncate">{tmpl.title}</span>
                    <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-slate-800 text-amber-400 border border-slate-700">
                      {tmpl.tag}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {isAgentRunning ? (
            <div className="flex items-center gap-2">
              <div className="flex-1 py-2.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 bg-amber-600/30 text-amber-200 border border-amber-500/40 cursor-wait">
                <Cpu className="w-4 h-4 animate-spin text-amber-400" />
                <span className="truncate">{agentStatusText || (language === "om" ? "AI Hojjetaa Jira..." : "Agent Executing Loop...")}</span>
              </div>
              <button
                type="button"
                onClick={abortAutonomousMission}
                className="py-2.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 transition-all shadow-md active:scale-[0.97]"
                title={language === "om" ? "Ajenticha yerooma kana dhaabi" : "Disarm & halt agent execution immediately"}
              >
                <Square className="w-3.5 h-3.5 fill-current" />
                <span>{language === "om" ? "Dhaabi (Disarm)" : "Disarm Agent"}</span>
              </button>
            </div>
          ) : (
            <button
              type="submit"
              disabled={!objectiveInput.trim()}
              className="w-full py-2.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>
                {language === "om" ? "Hojii Otoonoomasii Jalqabi" : "Launch Autonomous Agent"}
              </span>
            </button>
          )}
        </form>
      </div>

      {/* Active Mission Display */}
      {activeMission && (
        <div className="space-y-4">
          {/* Mission Header Card */}
          <div className="p-4 rounded-2xl bg-slate-900/95 border border-slate-800 space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide border ${
                      activeMission.status === "completed"
                        ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                        : activeMission.status === "failed"
                        ? "bg-rose-500/20 text-rose-300 border-rose-500/40"
                        : "bg-amber-500/20 text-amber-300 border-amber-500/40 animate-pulse"
                    }`}
                  >
                    {activeMission.status}
                  </span>
                  <span className="text-[10px] uppercase font-bold text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
                    {activeMission.domain}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {new Date(activeMission.createdAt).toLocaleTimeString()}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-slate-100 mt-1">
                  {activeMission.title || activeMission.goal}
                </h3>
              </div>

              {/* Confidence Index Gauge */}
              <div className="flex flex-col items-end">
                <div className="text-[10px] font-semibold text-slate-400">
                  {language === "om" ? "Sadarkaa Amanamummaa" : "Confidence Rating"}
                </div>
                <div className="text-xl font-black text-amber-400 flex items-baseline gap-0.5">
                  <span>{activeMission.synthesis?.confidenceRating || activeMission.confidenceScore || 88}</span>
                  <span className="text-xs text-amber-500/80">/100</span>
                </div>
                <div className="text-[9px] text-slate-400">
                  {language === "om" ? "Tilmaama herregaa" : "Epistemic probability"}
                </div>
              </div>
            </div>

            {/* Language Switch for Summary */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
              <span className="text-xs font-semibold text-slate-300">
                {language === "om" ? "Ibsa Bu'uuraa (Executive Summary):" : "Executive Dossier:"}
              </span>
              <div className="flex items-center gap-1 bg-slate-950 p-0.5 rounded-lg border border-slate-800">
                <button
                  type="button"
                  onClick={() => setSummaryLang("om")}
                  className={`px-2 py-0.5 rounded text-[10px] font-bold transition-colors ${
                    summaryLang === "om" ? "bg-amber-500 text-slate-950" : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  Afaan Oromoo
                </button>
                <button
                  type="button"
                  onClick={() => setSummaryLang("en")}
                  className={`px-2 py-0.5 rounded text-[10px] font-bold transition-colors ${
                    summaryLang === "en" ? "bg-amber-500 text-slate-950" : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  English
                </button>
              </div>
            </div>

            {/* Summary Text Box */}
            <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-200 leading-relaxed">
              {activeMission.synthesis?.executiveSummary ? (
                activeMission.synthesis.executiveSummary[summaryLang]
              ) : (
                <p className="text-slate-400 italic">
                  {language === "om" ? "Adeemsa hojii gaggeessaa jira..." : "Autonomous synthesis executing..."}
                </p>
              )}
            </div>
          </div>

          {/* Stochastic & Monte Carlo Insight Card (if available) */}
          {activeMission.steps.some((s) => s.dataPayload && s.dataPayload.trials) && (
            <div className="p-4 rounded-2xl bg-gradient-to-br from-violet-950/40 via-slate-900 to-slate-900 border border-violet-500/30 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-violet-500/20 border border-violet-500/40 flex items-center justify-center text-violet-400">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-violet-300">
                      {language === "om"
                        ? "Bu'aa Siimuleeshinii Monte Carlo (Yaalii 10,000)"
                        : "Monte Carlo Stochastic Risk Metrics (10k Trials)"}
                    </h4>
                    <p className="text-[10px] text-slate-400">
                      {language === "om" ? "Shallaggii herregaa fi balaa qabeenyaa" : "Deterministic capital preservation math"}
                    </p>
                  </div>
                </div>
              </div>

              {(() => {
                const mcStep = activeMission.steps.find((s) => s.dataPayload && s.dataPayload.trials);
                const data = mcStep?.dataPayload;
                if (!data) return null;

                return (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
                    <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800">
                      <div className="text-[10px] text-slate-400 font-medium">Half-Kelly Max</div>
                      <div className="text-base font-black text-emerald-400 mt-0.5">
                        {data.recommendedSafeFractionPct ?? 2.8}%
                      </div>
                      <div className="text-[9px] text-slate-400">Safe Capital %</div>
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800">
                      <div className="text-[10px] text-slate-400 font-medium">Ruin Risk</div>
                      <div className="text-base font-black text-rose-400 mt-0.5">
                        {data.ruinProbabilityPct ?? 2.4}%
                      </div>
                      <div className="text-[9px] text-slate-400">10k Run Bounds</div>
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800">
                      <div className="text-[10px] text-slate-400 font-medium">Value at Risk (5%)</div>
                      <div className="text-base font-black text-amber-400 mt-0.5">
                        ${data.valueAtRisk_p5 ?? 780}
                      </div>
                      <div className="text-[9px] text-slate-400">95% Conf. Floor</div>
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800">
                      <div className="text-[10px] text-slate-400 font-medium">Full Kelly f*</div>
                      <div className="text-base font-black text-indigo-300 mt-0.5">
                        {data.optimalKellyPct ?? 5.6}%
                      </div>
                      <div className="text-[9px] text-slate-400">Unbounded Opt.</div>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}

          {/* Multi-Agent Triad Council Consensus */}
          {activeMission.synthesis?.triadConsensus && (
            <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-900/95 via-indigo-950/30 to-slate-900/95 border border-indigo-500/30 shadow-xl space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-extrabold text-indigo-200 uppercase tracking-wider">
                  <Users className="w-4 h-4 text-indigo-400" />
                  <span>
                    {language === "om"
                      ? "Mana Maree Ajentootaa (Multi-Agent Triad Council)"
                      : "Multi-Agent Triad Council Consensus"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold text-slate-400">
                    {language === "om" ? "Waliigaltee:" : "Council Alignment:"}
                  </span>
                  <span className="text-xs font-black text-indigo-300 bg-indigo-500/20 px-2 py-0.5 rounded-full border border-indigo-500/40">
                    {activeMission.synthesis.triadConsensus.consensusScore}%
                  </span>
                </div>
              </div>

              {activeMission.synthesis.triadConsensus.councilRecommendation && (
                <div className="p-3 rounded-xl bg-slate-950/80 border border-indigo-500/30 text-xs font-semibold text-slate-200">
                  <div className="text-[10px] uppercase font-bold text-indigo-400 mb-0.5">
                    {language === "om" ? "Murtee Waliigalaa Ajentootaa:" : "Unified Council Recommendation:"}
                  </div>
                  {activeMission.synthesis.triadConsensus.councilRecommendation}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
                {activeMission.synthesis.triadConsensus.agents.map((agent, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2 flex flex-col justify-between"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-amber-300">{agent.name}</span>
                        <span className="text-[10px] font-mono text-emerald-400 font-semibold">
                          {agent.alignment}%
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                        {agent.role}
                      </div>
                      <p className="text-[11px] text-slate-300 leading-snug pt-1">{agent.verdict}</p>
                    </div>
                    <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mt-2">
                      <div
                        className="bg-gradient-to-r from-amber-500 to-emerald-400 h-full rounded-full"
                        style={{ width: `${agent.alignment}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Fact vs Assumption Matrix */}
          {activeMission.synthesis && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
              {/* Verified Facts */}
              <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1.5">
                <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{language === "om" ? "Ragaa Dhugaa (Verified)" : "Verified Empirical Facts"}</span>
                </div>
                <ul className="space-y-1 text-[11px] text-slate-300">
                  {(activeMission.synthesis.verifiedData || activeMission.synthesis.knownFacts || []).map(
                    (fact, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <span className="text-emerald-400 mt-0.5">•</span>
                        <span>{fact}</span>
                      </li>
                    )
                  )}
                </ul>
              </div>

              {/* Probabilistic Estimates */}
              <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1.5">
                <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400">
                  <Activity className="w-3.5 h-3.5" />
                  <span>{language === "om" ? "Tilmaama Carraa (Estimates)" : "Probabilistic Estimates"}</span>
                </div>
                <ul className="space-y-1 text-[11px] text-slate-300">
                  {(activeMission.synthesis.probabilisticEstimates || []).map((est, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <span className="text-amber-400 mt-0.5">•</span>
                      <span>{est}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Uncertainties & Risks */}
              <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1.5">
                <div className="flex items-center gap-1.5 text-xs font-bold text-rose-400">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>{language === "om" ? "Waan Hin Mirkanoofne (Risks)" : "Identified Uncertainties"}</span>
                </div>
                <ul className="space-y-1 text-[11px] text-slate-300">
                  {(activeMission.synthesis.identifiedUncertainties || []).map((unc, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <span className="text-rose-400 mt-0.5">•</span>
                      <span>{unc}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Actionable Directives & Risk Guardrails */}
          {activeMission.synthesis && (
            <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-200">
                <ShieldCheck className="w-4 h-4 text-amber-400" />
                <span>
                  {language === "om"
                    ? "Qajeelfamoota Murtoo & Daangaa Of-Eeggannoo"
                    : "Actionable Directives & Guardrails"}
                </span>
              </div>

              <div className="space-y-2">
                {(activeMission.synthesis.actionableDirectives || []).map((dir, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800/80 flex items-start justify-between gap-2"
                  >
                    <div className="space-y-0.5">
                      <div className="text-xs font-bold text-slate-200">{dir.title}</div>
                      <div className="text-[11px] text-slate-400">{dir.desc}</div>
                    </div>
                    <span
                      className={`text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded ${
                        dir.priority === "high"
                          ? "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                          : "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                      }`}
                    >
                      {dir.priority}
                    </span>
                  </div>
                ))}
              </div>

              {/* Responsible Guardrails reminder */}
              {activeMission.synthesis.riskGuardrails && (
                <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 space-y-1">
                  <div className="text-[11px] font-bold text-amber-300">
                    {language === "om" ? "Ulaagaalee Of-Eeggannoo QAXALE:" : "QAXALE Golden Rules Enforced:"}
                  </div>
                  <ul className="text-[10px] text-slate-300 space-y-0.5">
                    {activeMission.synthesis.riskGuardrails.map((gr, idx) => (
                      <li key={idx} className="flex items-center gap-1.5">
                        <span className="text-amber-400 font-bold">✓</span>
                        <span>{gr}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Afaan Oromoo Terminology Bridge Cards */}
          {activeMission.synthesis?.terminologyBridge && activeMission.synthesis.terminologyBridge.length > 0 && (
            <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2.5">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-300">
                <BookOpen className="w-4 h-4 text-amber-400" />
                <span>
                  {language === "om"
                    ? "Jechoota Teeknikaa Afaan Oromootiin Ijaaraman"
                    : "Afaan Oromoo Terminology Bridge"}
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {activeMission.synthesis.terminologyBridge.map((term, idx) => (
                  <div key={idx} className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                    <div className="flex items-baseline justify-between">
                      <span className="text-xs font-bold text-amber-300">{term.termOm}</span>
                      <span className="text-[10px] text-slate-400 italic">({term.termEn})</span>
                    </div>
                    {term.phonetic && (
                      <div className="text-[9px] text-slate-500 font-mono">[{term.phonetic}]</div>
                    )}
                    <p className="text-[11px] text-slate-300 leading-snug">{term.explanation}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Autonomous Goal Auto-Chaining (Suggested Next Missions) */}
          {activeMission.synthesis?.suggestedNextMissions && activeMission.synthesis.suggestedNextMissions.length > 0 && (
            <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                  <span>
                    {language === "om"
                      ? "Wal-Qabsiisa Kaayyoo Otoonoomasii (Goal Auto-Chaining)"
                      : "Autonomous Goal Auto-Chaining"}
                  </span>
                </div>
                <span className="text-[10px] text-slate-400">
                  {language === "om" ? "Qorannoo dabalataa yaadamu" : "Suggested follow-up missions"}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {activeMission.synthesis.suggestedNextMissions.map((nextM, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 hover:border-emerald-500/40 transition-all flex flex-col justify-between gap-2"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-200 truncate">{nextM.title}</span>
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 uppercase">
                          {nextM.domain}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-300 leading-snug">{nextM.objective}</p>
                      <div className="text-[10px] text-slate-400 italic">💡 {nextM.rationale}</div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setObjectiveInput(nextM.objective);
                        setSelectedDomain((nextM.domain as AutonomousDomain) || "custom");
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }}
                      className="w-full mt-1 py-1.5 px-2 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 text-xs font-semibold flex items-center justify-center gap-1.5 border border-emerald-500/30 transition-colors"
                    >
                      <span>{language === "om" ? "Kaayyoo kana jalqabi" : "Chain into Mission"}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step-by-Step Multi-Stage Reasoning Telemetry */}
          <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-200">
                <Terminal className="w-4 h-4 text-amber-400" />
                <span>
                  {language === "om" ? "Teelemeetirii Adeemsa Otoonoomasii" : "Autonomous Reasoning Telemetry"}
                </span>
              </div>
              <span className="text-[10px] font-semibold text-slate-400">
                {activeMission.steps.length} {language === "om" ? "Tarkaanfiiwwan" : "Operational Steps"}
              </span>
            </div>

            <div className="space-y-2">
              {activeMission.steps.map((step) => {
                const isExpanded = !!expandedStepIds[step.id];
                return (
                  <div
                    key={step.id}
                    className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 transition-colors"
                  >
                    <div
                      onClick={() => toggleStepExpand(step.id)}
                      className="flex items-center justify-between cursor-pointer"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span
                          className={`w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center ${
                            step.status === "success"
                              ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                              : step.status === "error"
                              ? "bg-rose-500/20 text-rose-400 border border-rose-500/40"
                              : "bg-amber-500/20 text-amber-400 border border-amber-500/40 animate-pulse"
                          }`}
                        >
                          {step.stepIndex}
                        </span>
                        <div className="min-w-0">
                          <div className="text-xs font-bold text-slate-200 truncate">
                            {step.title[language] || step.title.en}
                          </div>
                          <div className="text-[10px] text-slate-400 flex items-center gap-1.5">
                            <span className="font-mono text-amber-400">{step.tool}</span>
                            <span>•</span>
                            <span>{step.durationMs}ms</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 text-slate-400">
                        <span className="text-[10px] text-slate-400 hidden sm:inline">
                          {isExpanded ? (language === "om" ? "Dhoksi" : "Collapse") : language === "om" ? "Bal'isi" : "Inspect"}
                        </span>
                        {isExpanded ? (
                          <ChevronUp className="w-3.5 h-3.5" />
                        ) : (
                          <ChevronDown className="w-3.5 h-3.5" />
                        )}
                      </div>
                    </div>

                    {/* Collapsible Step Details */}
                    {isExpanded && (
                      <div className="mt-2.5 pt-2 border-t border-slate-800/80 space-y-2 text-[11px]">
                        <div>
                          <span className="text-amber-400 font-semibold">
                            {language === "om" ? "Yaada AI (Thought Reasoning):" : "Internal Thought Reasoning:"}
                          </span>
                          <p className="text-slate-300 mt-0.5 italic bg-slate-900 p-2 rounded-lg border border-slate-800">
                            {step.thoughtReasoning}
                          </p>
                        </div>
                        <div>
                          <span className="text-slate-400 font-semibold">
                            {language === "om" ? "Bu'aa Tarkaanfii (Output Summary):" : "Output Summary:"}
                          </span>
                          <p className="text-slate-200 mt-0.5">{step.outputSummary}</p>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Action Toolbar */}
          <div className="flex flex-wrap gap-2 pt-1">
            <button
              onClick={() =>
                handleCopyMarkdown(
                  activeMission.synthesis?.exportableMarkdown ||
                    JSON.stringify(activeMission.synthesis, null, 2)
                )
              }
              className="flex-1 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 border border-slate-700 transition-colors"
            >
              {copiedDossier ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{language === "om" ? "Waraabameera!" : "Copied Dossier!"}</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-slate-400" />
                  <span>{language === "om" ? "Dossier Waraabi" : "Copy Markdown"}</span>
                </>
              )}
            </button>

            <button
              onClick={() => handleSendDossierToChat(activeMission)}
              className="flex-1 py-2 px-3 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs font-semibold flex items-center justify-center gap-1.5 border border-amber-500/30 transition-colors"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{language === "om" ? "AI Chattti Ergi" : "Discuss in Chat"}</span>
            </button>

            <button
              onClick={() => handleDownloadArtifact(activeMission)}
              className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center justify-center gap-1.5 border border-slate-700 transition-colors"
              title="Download Artifact JSON"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">JSON</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
