import React, { useState, useEffect } from "react";
import {
  X,
  Layers,
  Send,
  Cpu,
  Server,
  ArrowRight,
  Database,
  Key,
  ShieldCheck,
  Zap,
  Activity,
  Code2,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Clock,
  Play,
  RotateCcw,
  Sparkles,
  Plus,
  Trash2,
  Copy,
  Check,
} from "lucide-react";
import { useApp } from "../context/AppContext";
import {
  HttpTelemetryEvent,
  subscribeToTelemetry,
  getTelemetryHistory,
  clearTelemetryHistory,
  testRawEndpoint,
} from "../services/api";

export const DataFlowInspectorModal: React.FC = () => {
  const {
    language,
    showDataFlowModal,
    setShowDataFlowModal,
    architecturePlans,
    addArchitecturePlan,
    deleteArchitecturePlan,
  } = useApp();

  const [activeSubTab, setActiveSubTab] = useState<
    "diagram" | "telemetry" | "sandbox" | "planner" | "vocabulary"
  >("diagram");

  const [telemetryEvents, setTelemetryEvents] = useState<HttpTelemetryEvent[]>(() =>
    getTelemetryHistory()
  );
  const [selectedEvent, setSelectedEvent] = useState<HttpTelemetryEvent | null>(null);
  const [copiedText, setCopiedText] = useState<string | null>(null);

  // Sandbox state
  const [sandboxEndpoint, setSandboxEndpoint] = useState<string>("/api/chat");
  const [sandboxPayload, setSandboxPayload] = useState<string>(
    JSON.stringify(
      {
        message: "Explain photosynthesis in Afaan Oromoo",
        language: "om",
        mode: "agency-loop",
      },
      null,
      2
    )
  );
  const [sandboxLoading, setSandboxLoading] = useState<boolean>(false);
  const [sandboxActiveStep, setSandboxActiveStep] = useState<number>(0);
  const [sandboxResult, setSandboxResult] = useState<any>(null);

  // Architecture Planner form
  const [planForm, setPlanForm] = useState({
    featureName: "",
    userProvides: "",
    whereItEnters: "",
    whereItTravels: "",
    whatTransformsIt: "",
    whereItIsStored: "",
    whatComesBack: "",
    whatUserSees: "",
  });

  // Subscribe to live network events
  useEffect(() => {
    const unsubscribe = subscribeToTelemetry((event) => {
      setTelemetryEvents((prev) => [event, ...prev.slice(0, 49)]);
    });
    return () => unsubscribe();
  }, []);

  if (!showDataFlowModal) return null;

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const handleRunSandboxTest = async () => {
    setSandboxLoading(true);
    setSandboxResult(null);
    setSandboxActiveStep(1); // 1. User Input

    let parsed: any = {};
    try {
      parsed = JSON.parse(sandboxPayload);
    } catch (e: any) {
      setSandboxResult({ error: "Invalid JSON in sandbox payload: " + e.message });
      setSandboxLoading(false);
      setSandboxActiveStep(0);
      return;
    }

    // Visual step sequence
    const stepInterval = setInterval(() => {
      setSandboxActiveStep((prev) => (prev < 5 ? prev + 1 : prev));
    }, 280);

    try {
      const res = await testRawEndpoint(sandboxEndpoint, parsed);
      clearInterval(stepInterval);
      setSandboxActiveStep(7); // Finished
      setSandboxResult(res);
    } catch (err: any) {
      clearInterval(stepInterval);
      setSandboxActiveStep(4);
      setSandboxResult({ error: err.message });
    } finally {
      setSandboxLoading(false);
    }
  };

  const handlePresetChange = (type: string) => {
    if (type === "chat") {
      setSandboxEndpoint("/api/chat");
      setSandboxPayload(
        JSON.stringify(
          {
            message: "What is an API endpoint in simple terms?",
            language: language,
            mode: "feynman",
          },
          null,
          2
        )
      );
    } else if (type === "translate") {
      setSandboxEndpoint("/api/translate");
      setSandboxPayload(
        JSON.stringify(
          {
            text: "Artificial intelligence transforms human productivity and agency.",
            sourceLanguage: "en",
            targetLanguage: "om",
          },
          null,
          2
        )
      );
    } else if (type === "code") {
      setSandboxEndpoint("/api/code-explain");
      setSandboxPayload(
        JSON.stringify(
          {
            code: "def calculate_energy(mass):\n    c = 300000000\n    return mass * (c ** 2)",
            language: "python",
            targetLanguage: "om",
          },
          null,
          2
        )
      );
    } else if (type === "dict") {
      setSandboxEndpoint("/api/dictionary");
      setSandboxPayload(
        JSON.stringify(
          {
            word: "Endpoint",
            term: "Endpoint",
          },
          null,
          2
        )
      );
    } else if (type === "404test") {
      setSandboxEndpoint("/api/non-existent-door");
      setSandboxPayload(
        JSON.stringify(
          {
            test: "Triggering a 404 to see what happens when an endpoint does not exist",
          },
          null,
          2
        )
      );
    }
  };

  const handleSavePlan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!planForm.featureName.trim()) return;
    addArchitecturePlan(planForm);
    setPlanForm({
      featureName: "",
      userProvides: "",
      whereItEnters: "",
      whereItTravels: "",
      whatTransformsIt: "",
      whereItIsStored: "",
      whatComesBack: "",
      whatUserSees: "",
    });
  };

  const stages = [
    {
      num: 1,
      titleOm: "1. Fayyadamaa (User / Data Source)",
      titleEn: "1. User (Data Source)",
      descOm: "Fayyadamaan gaaffii ykn ragaa jalqabaa kenna (fakkeenyaaf: 'Explain photosynthesis').",
      descEn: "Where the process begins. The user provides raw text, voice, or file data.",
      icon: <HelpCircle className="w-4 h-4 text-sky-400" />,
      color: "border-sky-500/40 bg-sky-500/10 text-sky-300",
    },
    {
      num: 2,
      titleOm: "2. Fuula Appii (Frontend / Input-Output Machine)",
      titleEn: "2. Frontend (Input/Output Machine)",
      descOm: "Appiin teekstii fudhatee gara boca JSON qinda'aatti jijjiira: `{\"message\": \"...\"}`.",
      descEn: "Takes input from user, packages it into JSON format, and prepares for transport.",
      icon: <Layers className="w-4 h-4 text-emerald-400" />,
      color: "border-emerald-500/40 bg-emerald-500/10 text-emerald-300",
    },
    {
      num: 3,
      titleOm: "3. Ergama HTTP (HTTP Request Vehicle)",
      titleEn: "3. HTTP Request (Delivery Vehicle)",
      descOm: "Karaa `POST /api/chat` ragaan gara giddu-gala to'annootti ergaa qabatee deema.",
      descEn: "The delivery mechanism across the internet using HTTP POST + Headers.",
      icon: <Send className="w-4 h-4 text-amber-400" />,
      color: "border-amber-500/40 bg-amber-500/10 text-amber-300",
    },
    {
      num: 4,
      titleOm: "4. Giddu-gala To'annoo (Worker / Backend Control Center)",
      titleEn: "4. Backend Control Center (Worker / Server)",
      descOm: "Ergama qorata, nageenya mirkaneessa, seera qopheessa, iccitii eega.",
      descEn: "Receives request, validates, authenticates, loads user context, and secures keys.",
      icon: <Server className="w-4 h-4 text-indigo-400" />,
      color: "border-indigo-500/40 bg-indigo-500/10 text-indigo-300",
    },
    {
      num: 5,
      titleOm: "5. Iccitii & Waamicha AI (Secret API Key + AI API)",
      titleEn: "5. Secret API Key + AI API Call",
      descOm: "Iccitiin `GEMINI_API_KEY` server irraa qabamee gara Gemini AI ergaama.",
      descEn: "Server attaches private credential to authenticate with the AI service.",
      icon: <Key className="w-4 h-4 text-pink-400" />,
      color: "border-pink-500/40 bg-pink-500/10 text-pink-300",
    },
    {
      num: 6,
      titleOm: "6. Motora AI & Yaada (AI Model Reasoning Engine)",
      titleEn: "6. AI Model (Processing & Reasoning)",
      descOm: "Gemini 3.7 ragaa qoratee, seera Afaan Oromootiin deebii uumamaa qopheessa.",
      descEn: "The model runs reasoning over prompt tokens and outputs synthesized intelligence.",
      icon: <Cpu className="w-4 h-4 text-purple-400" />,
      color: "border-purple-500/40 bg-purple-500/10 text-purple-300",
    },
    {
      num: 7,
      titleOm: "7. Deebii JSON & Mul'ina Fuulaa (JSON Response -> User Display)",
      titleEn: "7. JSON Response & Output Display",
      descOm: "Worker deebii JSON erga $\\rightarrow$ Appiin simatee qulqullinaan fayyadamaatti agarsiisa.",
      descEn: "Backend returns JSON to frontend, which renders clean UI instantly for the user.",
      icon: <CheckCircle2 className="w-4 h-4 text-emerald-400" />,
      color: "border-emerald-500/40 bg-emerald-500/10 text-emerald-300",
    },
  ];

  const vocabItems = [
    {
      term: "Frontend",
      om: "Fuula fi qaama appii fayyadamaan ijaan argu fi tuqu (React / Mobile UI).",
      en: "What the user interacts with directly on screen.",
    },
    {
      term: "Backend",
      om: "Sammuu fi seera to'annoo server keessatti hojjetu (Cloudflare Worker / Express server.ts).",
      en: "Your server-side control logic and orchestration center.",
    },
    {
      term: "HTTP Request",
      om: "Konkolaataa ergaa — Karaa appiin ragaa gara serveritti ergu fi deebii ittiin fudhatu.",
      en: "The communication delivery vehicle between client and server.",
    },
    {
      term: "Endpoint",
      om: "Balbala addaa backend qabu (fakkeenyaaf: `/api/chat`, `/api/translate`). Balballi hin jirre 404 kenna.",
      en: "A specific door/route into your backend. Non-existent door = 404 Not Found.",
    },
    {
      term: "JSON",
      om: "Boca ragaan qindaayee afaan kompiitara hundaan dubbifamu (fakkeenyaaf: `{\"name\": \"Qaxale\"}`).",
      en: "Structured text data format used everywhere in software systems.",
    },
    {
      term: "API Key / Secret",
      om: "Furtuu iccitii hayyama AI agarsiisu. Appii bilbilaa keessa osoo hin taane backend keessa dhokata.",
      en: "Secret credential that authorizes your account. Stored securely on the server.",
    },
    {
      term: "AI Model",
      om: "Motora sammuu ragaa xiinxalee deebii uumu (fakkeenyaaf: Gemini 3.7 Flash).",
      en: "The intelligence engine doing the actual generation and reasoning.",
    },
    {
      term: "Database & RAG",
      om: "Kuusaa ragaa yeroo dheeraa (Storage) fi duraan ragaa barbaadanii AI'tti kennuu (Retrieval-Augmented Generation).",
      en: "Persistent storage and retrieving relevant knowledge before prompting the AI.",
    },
    {
      term: "404 vs 500",
      om: "404 = Balballi (Endpoint) hin jiru; 500 = Seerri server keessatti dogoggore.",
      en: "404 = Requested route not found; 500 = Server-side logic exception.",
    },
  ];

  return (
    <div
      id="dataflow-modal-backdrop"
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200"
    >
      <div
        id="dataflow-modal-card"
        className="w-full max-w-2xl bg-slate-950 border border-slate-800 sm:rounded-2xl rounded-t-2xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden"
      >
        {/* Modal Header */}
        <div className="p-3.5 sm:p-4 bg-slate-900/90 border-b border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-bold text-sm sm:text-base text-slate-100 font-mono tracking-tight">
                  QAXALE DATA-FLOW MACHINE
                </h2>
                <span className="text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-1.5 py-0.5 rounded">
                  Live System
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                {language === "om"
                  ? "Akkaataa Ragaan Itti Yaau, To'atamu & Hojjetu"
                  : "Physical / Operational System Architecture & Telemetry"}
              </p>
            </div>
          </div>

          <button
            id="close-dataflow-modal"
            onClick={() => setShowDataFlowModal(false)}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg bg-slate-800/50 hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Sub-Navigation Tabs */}
        <div className="flex border-b border-slate-800/80 bg-slate-900/40 px-2 pt-1 gap-1 overflow-x-auto no-scrollbar">
          {[
            { id: "diagram", labelOm: "Motora Ya'iinsaa (7 Stages)", labelEn: "7-Stage Flow", icon: <Layers className="w-3.5 h-3.5" /> },
            { id: "telemetry", labelOm: "Network Telemetry (Live)", labelEn: "Live Telemetry", icon: <Activity className="w-3.5 h-3.5" /> },
            { id: "sandbox", labelOm: "Pakkeettii Ergi (Sandbox)", labelEn: "Packet Sandbox", icon: <Send className="w-3.5 h-3.5" /> },
            { id: "planner", labelOm: "Gaaffilee 7n (Architect)", labelEn: "7 Questions Architect", icon: <Code2 className="w-3.5 h-3.5" /> },
            { id: "vocabulary", labelOm: "Jechaalee Hojii (Vocab)", labelEn: "System Vocab", icon: <Sparkles className="w-3.5 h-3.5" /> },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id as any)}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-t-lg transition-all border-b-2 whitespace-nowrap ${
                activeSubTab === tab.id
                  ? "border-amber-400 text-amber-400 bg-slate-800/60"
                  : "border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-850"
              }`}
            >
              {tab.icon}
              <span>{language === "om" ? tab.labelOm : tab.labelEn}</span>
            </button>
          ))}
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* TAB 1: 7-STAGE ARCHITECTURE DIAGRAM */}
          {activeSubTab === "diagram" && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 text-xs text-amber-200 flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <p>
                  <strong>Mental Model:</strong> QAXALE is a <em>Data-Flow Machine</em>. Stop seeing software as magic; see it as data packets travelling through endpoints, authenticated by secrets, reasoned over by AI, and returned as JSON.
                </p>
              </div>

              {/* Interactive 7 Stages */}
              <div className="space-y-2.5">
                {stages.map((st) => (
                  <div
                    key={st.num}
                    className={`border rounded-xl p-3 transition-all ${st.color} bg-slate-900/60`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-md bg-slate-950 flex items-center justify-center font-bold text-xs">
                          {st.num}
                        </div>
                        <h4 className="font-bold text-xs sm:text-sm">
                          {language === "om" ? st.titleOm : st.titleEn}
                        </h4>
                      </div>
                      {st.icon}
                    </div>
                    <p className="text-xs text-slate-300 pl-8 leading-relaxed">
                      {language === "om" ? st.descOm : st.descEn}
                    </p>
                  </div>
                ))}
              </div>

              {/* Summary Pipeline Box */}
              <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl font-mono text-[11px] text-slate-300 space-y-1">
                <div className="text-amber-400 font-bold mb-1">DATA TRAVEL PIPELINE:</div>
                <div className="text-slate-400">
                  USER ➔ FRONTEND ➔ HTTP POST [JSON] ➔ WORKER/SERVER ➔ SECRET KEY + GEMINI ➔ AI REASONING ➔ JSON RESPONSE ➔ FRONTEND ➔ USER
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: LIVE NETWORK TELEMETRY */}
          {activeSubTab === "telemetry" && (
            <div className="space-y-3 animate-in fade-in duration-150">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-slate-300">
                  <Activity className="w-4 h-4 text-emerald-400 animate-pulse" />
                  <span>Real-Time HTTP Network Events ({telemetryEvents.length})</span>
                </div>
                {telemetryEvents.length > 0 && (
                  <button
                    onClick={() => {
                      clearTelemetryHistory();
                      setTelemetryEvents([]);
                      setSelectedEvent(null);
                    }}
                    className="text-[11px] text-rose-400 hover:text-rose-300 flex items-center gap-1"
                  >
                    <Trash2 className="w-3 h-3" /> Clear History
                  </button>
                )}
              </div>

              {telemetryEvents.length === 0 ? (
                <div className="p-8 text-center bg-slate-900/40 border border-slate-800 rounded-xl space-y-2">
                  <Activity className="w-8 h-8 text-slate-600 mx-auto" />
                  <p className="text-xs text-slate-400">
                    {language === "om"
                      ? "Ergamni HTTP ammatti hin galmoofne. Gaaffii chat keessatti gaafadhu ykn Sandbox irraa pakkeettii ergi!"
                      : "No live network events recorded yet. Send a message in Chat or transmit a packet from the Sandbox!"}
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {telemetryEvents.map((evt) => (
                    <div
                      key={evt.id}
                      onClick={() => setSelectedEvent(evt)}
                      className={`p-3 rounded-xl border cursor-pointer transition-all ${
                        selectedEvent?.id === evt.id
                          ? "bg-slate-850 border-amber-500/60"
                          : "bg-slate-900/70 border-slate-800 hover:border-slate-700"
                      }`}
                    >
                      <div className="flex items-center justify-between text-xs mb-1.5">
                        <div className="flex items-center gap-2">
                          <span
                            className={`font-mono font-bold px-1.5 py-0.5 rounded text-[10px] ${
                              evt.status === 200
                                ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                                : "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                            }`}
                          >
                            {evt.method} {evt.status || "ERR"}
                          </span>
                          <span className="font-mono font-semibold text-slate-200">
                            {evt.endpoint}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-[11px] text-slate-400">
                          <Clock className="w-3 h-3 text-amber-400" />
                          <span>{evt.durationMs}ms</span>
                        </div>
                      </div>

                      <div className="text-[11px] text-slate-400 truncate">
                        Stage: <span className="text-amber-300 font-medium">{evt.stageName}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Event Inspector Drawer */}
              {selectedEvent && (
                <div className="mt-4 p-3.5 bg-slate-900 border border-slate-700 rounded-xl space-y-3 font-mono text-xs">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <div className="font-bold text-amber-400">
                      HTTP PAYLOAD INSPECTION ({selectedEvent.endpoint})
                    </div>
                    <button
                      onClick={() => setSelectedEvent(null)}
                      className="text-slate-400 hover:text-white"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Request JSON */}
                  <div>
                    <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                      <span>Request Payload (Body JSON):</span>
                      <button
                        onClick={() =>
                          copyToClipboard(
                            JSON.stringify(selectedEvent.requestPayload, null, 2),
                            "req"
                          )
                        }
                        className="text-amber-400 flex items-center gap-1 hover:underline"
                      >
                        {copiedText === "req" ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                        Copy
                      </button>
                    </div>
                    <pre className="bg-slate-950 p-2.5 rounded-lg text-emerald-400 text-[11px] overflow-x-auto max-h-40">
                      {JSON.stringify(selectedEvent.requestPayload, null, 2)}
                    </pre>
                  </div>

                  {/* Response JSON */}
                  <div>
                    <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                      <span>Response Payload (Body JSON):</span>
                      <button
                        onClick={() =>
                          copyToClipboard(
                            JSON.stringify(selectedEvent.responsePayload, null, 2),
                            "res"
                          )
                        }
                        className="text-amber-400 flex items-center gap-1 hover:underline"
                      >
                        {copiedText === "res" ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                        Copy
                      </button>
                    </div>
                    <pre className="bg-slate-950 p-2.5 rounded-lg text-sky-300 text-[11px] overflow-x-auto max-h-48">
                      {JSON.stringify(selectedEvent.responsePayload, null, 2)}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: PACKET SANDBOX TESTER */}
          {activeSubTab === "sandbox" && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="text-xs text-slate-300">
                Transmit real live HTTP JSON packets to any endpoint and watch the 7-stage data pipeline process it in real time:
              </div>

              {/* Endpoint Presets */}
              <div className="flex flex-wrap gap-1.5">
                <span className="text-[11px] text-slate-400 self-center mr-1">Presets:</span>
                {[
                  { id: "chat", label: "POST /api/chat" },
                  { id: "translate", label: "POST /api/translate" },
                  { id: "code", label: "POST /api/code-explain" },
                  { id: "dict", label: "POST /api/dictionary" },
                  { id: "404test", label: "Trigger 404 (Non-Existent)" },
                ].map((p) => (
                  <button
                    key={p.id}
                    onClick={() => handlePresetChange(p.id)}
                    className="px-2 py-1 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded text-[11px] font-mono text-amber-300 transition-colors"
                  >
                    {p.label}
                  </button>
                ))}
              </div>

              {/* Endpoint Input */}
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-300 font-mono">
                  Target Endpoint URL:
                </label>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-1.5 bg-amber-500/20 text-amber-400 font-mono font-bold text-xs rounded-lg border border-amber-500/30">
                    POST
                  </span>
                  <input
                    type="text"
                    value={sandboxEndpoint}
                    onChange={(e) => setSandboxEndpoint(e.target.value)}
                    className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 font-mono focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Payload JSON Editor */}
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-300 font-mono flex items-center justify-between">
                  <span>Request JSON Body:</span>
                  <span className="text-slate-500">Content-Type: application/json</span>
                </label>
                <textarea
                  rows={6}
                  value={sandboxPayload}
                  onChange={(e) => setSandboxPayload(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-emerald-400 font-mono focus:border-amber-500 focus:outline-none"
                />
              </div>

              {/* Transmit Button */}
              <button
                onClick={handleRunSandboxTest}
                disabled={sandboxLoading}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition-all active:scale-98 disabled:opacity-50"
              >
                {sandboxLoading ? (
                  <>
                    <RotateCcw className="w-4 h-4 animate-spin" />
                    <span>Transmitting Packet through 7 Stages...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-slate-950" />
                    <span>Send Packet & Trace Machine Pipeline</span>
                  </>
                )}
              </button>

              {/* Live Flow Trace Indicator */}
              {sandboxActiveStep > 0 && (
                <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-xl space-y-2 font-mono text-xs">
                  <div className="text-[11px] text-amber-400 font-bold">PIPELINE TRACE STATE:</div>
                  <div className="grid grid-cols-7 gap-1">
                    {[1, 2, 3, 4, 5, 6, 7].map((s) => (
                      <div
                        key={s}
                        className={`text-center py-1.5 rounded text-[10px] font-bold transition-all ${
                          sandboxActiveStep >= s
                            ? "bg-amber-500 text-slate-950 shadow-sm"
                            : "bg-slate-950 text-slate-600 border border-slate-800"
                        }`}
                      >
                        S{s}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Sandbox Result Output */}
              {sandboxResult && (
                <div className="p-3 bg-slate-900 border border-slate-700 rounded-xl space-y-2 font-mono text-xs">
                  <div className="flex items-center justify-between text-[11px] border-b border-slate-800 pb-1.5">
                    <span className="font-bold text-emerald-400">
                      HTTP RESPONSE ({sandboxResult.status || "FAIL"} • {sandboxResult.durationMs}ms)
                    </span>
                    <button
                      onClick={() =>
                        copyToClipboard(JSON.stringify(sandboxResult.data, null, 2), "res-sand")
                      }
                      className="text-amber-400 flex items-center gap-1 hover:underline"
                    >
                      {copiedText === "res-sand" ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      Copy JSON
                    </button>
                  </div>
                  <pre className="bg-slate-950 p-2.5 rounded-lg text-sky-300 text-[11px] overflow-x-auto max-h-56">
                    {JSON.stringify(sandboxResult.data || sandboxResult, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: THE 7 ARCHITECTURE QUESTIONS */}
          {activeSubTab === "planner" && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-3 text-xs text-indigo-200 space-y-1">
                <div className="font-bold text-indigo-300 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4" />
                  The 7 Questions of an AI Product Builder
                </div>
                <p>
                  Before writing random code, map out your feature through these 7 operational questions. You will never get stuck or confused about where a bug is.
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleSavePlan} className="space-y-3 bg-slate-900/60 p-3.5 border border-slate-800 rounded-xl">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-amber-400">
                    Feature Name (Maqaa Hojichaa):
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Afaan Oromoo Legal Contract Simplifier"
                    value={planForm.featureName}
                    onChange={(e) => setPlanForm({ ...planForm, featureName: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-100 focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div className="space-y-2 text-xs">
                  <div>
                    <label className="font-semibold text-slate-300">① What does the user provide?</label>
                    <input
                      type="text"
                      placeholder="e.g. 5-page PDF document or pasted text paragraph"
                      value={planForm.userProvides}
                      onChange={(e) => setPlanForm({ ...planForm, userProvides: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1 text-xs text-slate-200 mt-0.5"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-slate-300">② Where does it enter?</label>
                    <input
                      type="text"
                      placeholder="e.g. Mobile File Uploader / Textarea in App"
                      value={planForm.whereItEnters}
                      onChange={(e) => setPlanForm({ ...planForm, whereItEnters: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1 text-xs text-slate-200 mt-0.5"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-slate-300">③ Where does it travel?</label>
                    <input
                      type="text"
                      placeholder="e.g. Frontend -> HTTP POST /api/simplify -> Cloudflare Worker"
                      value={planForm.whereItTravels}
                      onChange={(e) => setPlanForm({ ...planForm, whereItTravels: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1 text-xs text-slate-200 mt-0.5"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-slate-300">④ What transforms it?</label>
                    <input
                      type="text"
                      placeholder="e.g. Worker validates size + Gemini 3.7 simplifies legal jargon to Afaan Oromoo"
                      value={planForm.whatTransformsIt}
                      onChange={(e) => setPlanForm({ ...planForm, whatTransformsIt: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1 text-xs text-slate-200 mt-0.5"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-slate-300">⑤ Where is information stored?</label>
                    <input
                      type="text"
                      placeholder="e.g. Local device cache for instant retrieval, cloud database for history"
                      value={planForm.whereItIsStored}
                      onChange={(e) => setPlanForm({ ...planForm, whereItIsStored: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1 text-xs text-slate-200 mt-0.5"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-slate-300">⑥ What comes back?</label>
                    <input
                      type="text"
                      placeholder="e.g. JSON object { summary: '...', risks: [...], actionItems: [...] }"
                      value={planForm.whatComesBack}
                      onChange={(e) => setPlanForm({ ...planForm, whatComesBack: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1 text-xs text-slate-200 mt-0.5"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-slate-300">⑦ What does the user finally see?</label>
                    <input
                      type="text"
                      placeholder="e.g. Clean card with 3 risk badges, 1-paragraph summary, and copy button"
                      value={planForm.whatUserSees}
                      onChange={(e) => setPlanForm({ ...planForm, whatUserSees: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1 text-xs text-slate-200 mt-0.5"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-lg flex items-center justify-center gap-1.5 transition-all"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Save Architecture Blueprint</span>
                </button>
              </form>

              {/* Saved Blueprints */}
              <div className="space-y-2">
                <div className="text-xs font-bold text-slate-300">
                  Saved System Architecture Blueprints ({architecturePlans.length}):
                </div>
                {architecturePlans.map((plan) => (
                  <div
                    key={plan.id}
                    className="p-3 bg-slate-900 border border-slate-800 rounded-xl space-y-1.5 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-amber-400 text-sm">{plan.featureName}</h4>
                      <button
                        onClick={() => deleteArchitecturePlan(plan.id)}
                        className="text-slate-500 hover:text-rose-400 p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-slate-300 pt-1">
                      <div><strong className="text-slate-400">1. User Provides:</strong> {plan.userProvides}</div>
                      <div><strong className="text-slate-400">2. Enters At:</strong> {plan.whereItEnters}</div>
                      <div><strong className="text-slate-400">3. Travels Via:</strong> {plan.whereItTravels}</div>
                      <div><strong className="text-slate-400">4. Transforms:</strong> {plan.whatTransformsIt}</div>
                      <div><strong className="text-slate-400">5. Stored In:</strong> {plan.whereItIsStored}</div>
                      <div><strong className="text-slate-400">6. Returns:</strong> {plan.whatComesBack}</div>
                    </div>
                    <div className="text-[11px] text-emerald-300 pt-1 border-t border-slate-800">
                      <strong>7. User Sees:</strong> {plan.whatUserSees}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: SYSTEM VOCABULARY */}
          {activeSubTab === "vocabulary" && (
            <div className="space-y-3 animate-in fade-in duration-150">
              <div className="text-xs text-slate-300">
                {language === "om"
                  ? "Jechoota teeknikaa akka waan qabatamaatti hubadhu — hiika barumsaa qofaan hin daangeffamin:"
                  : "Operational definitions of real software engineering terminology:"}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {vocabItems.map((v, i) => (
                  <div
                    key={i}
                    className="p-3 bg-slate-900 border border-slate-800 rounded-xl space-y-1"
                  >
                    <span className="font-bold text-amber-400 text-xs font-mono">
                      {v.term}
                    </span>
                    <p className="text-xs text-slate-200 leading-relaxed">
                      {language === "om" ? v.om : v.en}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-3 bg-slate-900/90 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>QAXALE Architecture Engine</span>
          </div>
          <button
            onClick={() => setShowDataFlowModal(false)}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold"
          >
            {language === "om" ? "Cufi" : "Close"}
          </button>
        </div>
      </div>
    </div>
  );
};
