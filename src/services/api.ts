import { AppLanguage, ChatMode, HttpTelemetryEvent } from "../types";
export type { HttpTelemetryEvent };

export interface TranslateApiResponse {
  translatedText: string;
  alternativeTranslations?: string[];
  culturalOrGrammarNotes?: string;
  keyVocabulary?: Array<{ term: string; meaning: string; partOfSpeech?: string }>;
  success?: boolean;
}

export interface CodeExplainApiResponse {
  title?: string;
  summary?: string;
  lineByLine?: Array<{ line: string; explanation: string }>;
  conceptLearned?: string;
  outputSimulation?: string;
  tips?: string[];
  explanation?: string;
  success?: boolean;
}

export interface DictionaryApiResponse {
  term: string;
  oromooTerm?: string;
  englishTerm?: string;
  partOfSpeech?: string;
  definitionOromo?: string;
  definitionEnglish?: string;
  exampleOromo?: string;
  exampleEnglish?: string;
  relatedTerms?: string[];
  definition?: string;
  success?: boolean;
}

// Global in-memory telemetry log buffer & event subscribers
const telemetryHistory: HttpTelemetryEvent[] = [];
type TelemetryListener = (event: HttpTelemetryEvent) => void;
const telemetryListeners: Set<TelemetryListener> = new Set();

export function subscribeToTelemetry(listener: TelemetryListener): () => void {
  telemetryListeners.add(listener);
  return () => telemetryListeners.delete(listener);
}

export function getTelemetryHistory(): HttpTelemetryEvent[] {
  return [...telemetryHistory];
}

export function clearTelemetryHistory(): void {
  telemetryHistory.length = 0;
}

function recordTelemetry(event: HttpTelemetryEvent) {
  telemetryHistory.unshift(event);
  if (telemetryHistory.length > 50) {
    telemetryHistory.pop();
  }
  telemetryListeners.forEach((l) => {
    try {
      l(event);
    } catch (e) {
      console.error("Telemetry listener error:", e);
    }
  });
}

export async function sendChatMessage(
  messages: Array<{ role: "user" | "assistant"; content: string }>,
  language: AppLanguage = "om",
  mode: ChatMode = "standard"
): Promise<{ reply: string; fallback?: boolean }> {
  const startTime = Date.now();
  const payload = { messages, language, mode };

  try {
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const durationMs = Date.now() - startTime;

    let data: any;
    try {
      data = await response.json();
    } catch {
      recordTelemetry({
        id: `chat-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        timestamp: Date.now(),
        endpoint: "/api/chat",
        method: "POST",
        status: response.status,
        durationMs,
        requestPayload: payload,
        responsePayload: { error: "Invalid JSON response" },
        step: 6,
        stageName: "Response Parsing Error",
        success: false,
        error: `Server returned invalid JSON (${response.status})`,
      });
      throw new Error(`Server returned invalid JSON (${response.status}).`);
    }

    if (!response.ok) {
      const errorMessage =
        data && typeof data === "object" && typeof data.error === "string"
          ? data.error
          : `Request failed with status ${response.status}`;

      recordTelemetry({
        id: `chat-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        timestamp: Date.now(),
        endpoint: "/api/chat",
        method: "POST",
        status: response.status,
        durationMs,
        requestPayload: payload,
        responsePayload: data,
        step: 4,
        stageName: "Server Error",
        success: false,
        error: errorMessage,
      });

      throw new Error(errorMessage);
    }

    recordTelemetry({
      id: `chat-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      timestamp: Date.now(),
      endpoint: "/api/chat",
      method: "POST",
      status: response.status,
      durationMs,
      requestPayload: payload,
      responsePayload: data,
      step: 7,
      stageName: "Returned to User Display",
      success: true,
    });

    const reply = data?.message || data?.reply || "";
    return {
      reply: reply || (language === "om" ? "Deebiin argame." : "Response received."),
      fallback: data?.fallback,
    };
  } catch (err: any) {
    console.error("Chat API call failed:", err?.message || err);
    return {
      reply:
        language === "om"
          ? "Nagaa! Rakkoo neetwoorkii ykn sababa biraatiin deebiin yeroof hin milkoofne. Maaloo intarneetii keessan mirkaneessaa irra deebi'aa yaalaa."
          : "Hello! Due to a temporary network or server issue, the response could not be loaded. Please check your connection and try again.",
      fallback: true,
    };
  }
}

export async function translateText(
  text: string,
  sourceLang: AppLanguage,
  targetLang: AppLanguage
): Promise<TranslateApiResponse> {
  const startTime = Date.now();
  const payload = {
    text,
    sourceLanguage: sourceLang,
    targetLanguage: targetLang,
    sourceLang,
    targetLang,
  };

  try {
    const response = await fetch("/api/translate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const durationMs = Date.now() - startTime;

    let data: any;
    try {
      data = await response.json();
    } catch {
      throw new Error(`Server returned invalid JSON (${response.status}).`);
    }

    if (!response.ok) {
      const errorMessage =
        data && typeof data === "object" && typeof data.error === "string"
          ? data.error
          : `Request failed with status ${response.status}`;

      recordTelemetry({
        id: `translate-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        timestamp: Date.now(),
        endpoint: "/api/translate",
        method: "POST",
        status: response.status,
        durationMs,
        requestPayload: payload,
        responsePayload: data,
        step: 4,
        stageName: "Server Translation Error",
        success: false,
        error: errorMessage,
      });

      throw new Error(errorMessage);
    }

    recordTelemetry({
      id: `translate-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      timestamp: Date.now(),
      endpoint: "/api/translate",
      method: "POST",
      status: response.status,
      durationMs,
      requestPayload: payload,
      responsePayload: data,
      step: 7,
      stageName: "Returned Translation to User",
      success: true,
    });

    return {
      translatedText: data?.translation || data?.translatedText || `[${targetLang}]: ${text}`,
      alternativeTranslations: data?.alternativeTranslations || [],
      culturalOrGrammarNotes: data?.culturalOrGrammarNotes || "",
      keyVocabulary: data?.keyVocabulary || [],
      success: data?.success ?? true,
    };
  } catch (err: any) {
    console.error("Translation API call failed:", err?.message || err);
    return {
      translatedText: targetLang === "om" ? `[Hiika]: ${text}` : `[Translation]: ${text}`,
      culturalOrGrammarNotes: "Ibsa hiikaa yeroof argachuu hin dandeenye.",
      success: false,
    };
  }
}

export interface CodeRunResult {
  success: boolean;
  stdout: string;
  stderr?: string;
  exitCode: number;
  executionTimeMs?: number;
  language: string;
}

export async function executeCode(
  code: string,
  language: string
): Promise<CodeRunResult> {
  const startTime = Date.now();
  const payload = { code, language };

  try {
    const response = await fetch("/api/code-run", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const durationMs = Date.now() - startTime;
    const data = await response.json();

    recordTelemetry({
      id: `coderun-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      timestamp: Date.now(),
      endpoint: "/api/code-run",
      method: "POST",
      status: response.status,
      durationMs,
      requestPayload: payload,
      responsePayload: data,
      step: 5,
      stageName: "Code Execution Runtime",
      success: data.success ?? true,
    });

    return {
      success: data.success ?? true,
      stdout: data.stdout ?? "",
      stderr: data.stderr,
      exitCode: data.exitCode ?? 0,
      executionTimeMs: data.executionTimeMs || durationMs,
      language: data.language || language,
    };
  } catch (err: any) {
    console.error("Code run error:", err);
    return {
      success: false,
      stdout: "",
      stderr: err.message || "Failed to execute code",
      exitCode: 1,
      language,
    };
  }
}

export async function explainCode(
  code: string,
  language: string,
  targetLanguage: AppLanguage = "om"
): Promise<CodeExplainApiResponse> {
  const startTime = Date.now();
  const payload = { code, language, targetLanguage };

  try {
    const response = await fetch("/api/code-explain", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const durationMs = Date.now() - startTime;

    let data: any;
    try {
      data = await response.json();
    } catch {
      throw new Error(`Server returned invalid JSON (${response.status}).`);
    }

    if (!response.ok) {
      const errorMessage =
        data && typeof data === "object" && typeof data.error === "string"
          ? data.error
          : `Request failed with status ${response.status}`;

      recordTelemetry({
        id: `code-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        timestamp: Date.now(),
        endpoint: "/api/code-explain",
        method: "POST",
        status: response.status,
        durationMs,
        requestPayload: payload,
        responsePayload: data,
        step: 4,
        stageName: "Code Explain Failure",
        success: false,
        error: errorMessage,
      });

      throw new Error(errorMessage);
    }

    recordTelemetry({
      id: `code-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      timestamp: Date.now(),
      endpoint: "/api/code-explain",
      method: "POST",
      status: response.status,
      durationMs,
      requestPayload: payload,
      responsePayload: data,
      step: 7,
      stageName: "Code Deconstruction Returned",
      success: true,
    });

    return {
      title: data?.title || "Ibsa Koodii",
      summary: data?.explanation || data?.summary || "Koodiin kun hojii qulqulluu qaba.",
      lineByLine: data?.lineByLine || [
        {
          line: code.split("\n")[0] || "code",
          explanation: targetLanguage === "om" ? "Tarkaanfii jalqabaa" : "Starting line",
        },
      ],
      conceptLearned: data?.conceptLearned || "Programming Flow",
      outputSimulation: data?.outputSimulation || "",
      tips: data?.tips || [],
      explanation: data?.explanation,
      success: data?.success ?? true,
    };
  } catch (err: any) {
    console.error("Code explain API call failed:", err?.message || err);
    return {
      title: "Ibsa Koodii (Code Explanation)",
      summary:
        targetLanguage === "om"
          ? "Koodiin kun hojii saganteessuu raawwata. Qaxalee AI irra deebi'ii yaali."
          : "This code performs a programming sequence.",
      lineByLine: [
        {
          line: code.split("\n")[0] || "code",
          explanation: targetLanguage === "om" ? "Tarkaanfii jalqabaa koodichaa" : "Initial step of code",
        },
      ],
      conceptLearned: "Programming Logic",
      success: false,
    };
  }
}

export async function lookupDictionaryTerm(term: string): Promise<DictionaryApiResponse | null> {
  const startTime = Date.now();
  const payload = { word: term, term };

  try {
    const response = await fetch("/api/dictionary", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const durationMs = Date.now() - startTime;

    let data: any;
    try {
      data = await response.json();
    } catch {
      throw new Error(`Server returned invalid JSON (${response.status}).`);
    }

    if (!response.ok) {
      const errorMessage =
        data && typeof data === "object" && typeof data.error === "string"
          ? data.error
          : `Dictionary lookup error ${response.status}`;

      recordTelemetry({
        id: `dict-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        timestamp: Date.now(),
        endpoint: "/api/dictionary",
        method: "POST",
        status: response.status,
        durationMs,
        requestPayload: payload,
        responsePayload: data,
        step: 4,
        stageName: "Dictionary Error",
        success: false,
        error: errorMessage,
      });

      throw new Error(errorMessage);
    }

    recordTelemetry({
      id: `dict-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      timestamp: Date.now(),
      endpoint: "/api/dictionary",
      method: "POST",
      status: response.status,
      durationMs,
      requestPayload: payload,
      responsePayload: data,
      step: 7,
      stageName: "Dictionary Entry Received",
      success: true,
    });

    return data;
  } catch (err: any) {
    console.error("Dictionary lookup error:", err?.message || err);
    return null;
  }
}

// -------------------------------------------------------------------------
// Generative AI Tool Suite Client Helpers
// -------------------------------------------------------------------------

export interface DeepResearchResult {
  success: boolean;
  title: string;
  executiveSummary: string;
  firstPrinciples: Array<{ concept: string; explanation: string }>;
  verifiedFacts: string[];
  criticalCounterarguments: string[];
  actionPlan: Array<{ phase: number; title: string; action: string; deliverable: string }>;
  keySources: string[];
}

export async function performDeepResearch(
  topic: string,
  language: AppLanguage,
  depth: "standard" | "comprehensive" = "comprehensive"
): Promise<DeepResearchResult> {
  const startTime = Date.now();
  const payload = { topic, language, depth };

  try {
    const response = await fetch("/api/deep-research", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    recordTelemetry({
      id: `research-${Date.now()}`,
      timestamp: Date.now(),
      endpoint: "/api/deep-research",
      method: "POST",
      status: response.status,
      durationMs: Date.now() - startTime,
      requestPayload: payload,
      responsePayload: data,
      step: 6,
      stageName: "Deep Research Execution",
      success: data.success ?? true,
    });

    return data;
  } catch (err: any) {
    console.error("Deep research client error:", err);
    return {
      success: false,
      title: `Research: ${topic}`,
      executiveSummary: "Unable to complete deep research at this time.",
      firstPrinciples: [],
      verifiedFacts: [],
      criticalCounterarguments: [],
      actionPlan: [],
      keySources: [],
    };
  }
}

export interface DiagramResult {
  success: boolean;
  title: string;
  description: string;
  mermaidSyntax?: string;
  svgSnippet?: string;
  nodes?: Array<{ id: string; label: string; type: string; detail: string }>;
  connections?: Array<{ from: string; to: string; label: string }>;
}

export async function generateDiagram(
  prompt: string,
  type: string,
  language: AppLanguage
): Promise<DiagramResult> {
  const startTime = Date.now();
  const payload = { prompt, type, language };

  try {
    const response = await fetch("/api/diagram-generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    recordTelemetry({
      id: `diagram-${Date.now()}`,
      timestamp: Date.now(),
      endpoint: "/api/diagram-generate",
      method: "POST",
      status: response.status,
      durationMs: Date.now() - startTime,
      requestPayload: payload,
      responsePayload: data,
      step: 6,
      stageName: "Visual Diagram Generation",
      success: data.success ?? true,
    });

    return data;
  } catch (err: any) {
    console.error("Diagram client error:", err);
    return {
      success: false,
      title: prompt,
      description: "Failed to generate diagram.",
    };
  }
}

export interface DocumentAnalysisResult {
  success: boolean;
  title: string;
  summary: string;
  wordCount: number;
  readingTimeMin: number;
  keyTakeaways: string[];
  actionItems: string[];
  risksOrCaveats: string[];
  glossary?: Array<{ term: string; definition: string }>;
}

export async function analyzeDocument(
  text: string,
  fileName: string,
  language: AppLanguage
): Promise<DocumentAnalysisResult> {
  const startTime = Date.now();
  const payload = { text, fileName, language };

  try {
    const response = await fetch("/api/document-analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    recordTelemetry({
      id: `doc-${Date.now()}`,
      timestamp: Date.now(),
      endpoint: "/api/document-analyze",
      method: "POST",
      status: response.status,
      durationMs: Date.now() - startTime,
      requestPayload: payload,
      responsePayload: data,
      step: 6,
      stageName: "Document Intelligence Extraction",
      success: data.success ?? true,
    });

    return data;
  } catch (err: any) {
    console.error("Document analysis client error:", err);
    return {
      success: false,
      title: fileName,
      summary: "Failed to analyze document.",
      wordCount: 0,
      readingTimeMin: 0,
      keyTakeaways: [],
      actionItems: [],
      risksOrCaveats: [],
    };
  }
}

export interface MathProbabilityResult {
  success: boolean;
  problemTitle: string;
  finalAnswer: string;
  stepByStepProof: Array<{ step: number; explanation: string; formula: string }>;
  impliedProbabilityPercent?: number;
  expectedValue?: string;
  responsibleAdvice?: string;
}

export async function solveMathProbability(
  problem: string,
  language: AppLanguage
): Promise<MathProbabilityResult> {
  const startTime = Date.now();
  const payload = { problem, language };

  try {
    const response = await fetch("/api/math-probability", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    recordTelemetry({
      id: `math-${Date.now()}`,
      timestamp: Date.now(),
      endpoint: "/api/math-probability",
      method: "POST",
      status: response.status,
      durationMs: Date.now() - startTime,
      requestPayload: payload,
      responsePayload: data,
      step: 6,
      stageName: "Mathematical & Probability Solver",
      success: data.success ?? true,
    });

    return data;
  } catch (err: any) {
    console.error("Math solver client error:", err);
    return {
      success: false,
      problemTitle: problem,
      finalAnswer: "Error solving mathematical equation.",
      stepByStepProof: [],
    };
  }
}

// Browser Web Speech & Audio Synthesizer
export function speakText(text: string, language: AppLanguage): boolean {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    return false;
  }

  window.speechSynthesis.cancel();

  // Strip Markdown characters for clean speech
  const cleanText = text.replace(/[*#`_~[\]()<>]/g, " ").trim();
  if (!cleanText) return false;

  const utterance = new SpeechSynthesisUtterance(cleanText);
  utterance.lang = language === "om" ? "om-ET" : "en-US";
  utterance.rate = 0.95;
  utterance.pitch = 1.0;

  window.speechSynthesis.speak(utterance);
  return true;
}

// -------------------------------------------------------------------------
// Google Grounding & Extended Connectors Suite
// -------------------------------------------------------------------------

export interface GoogleGroundingResult {
  success: boolean;
  query: string;
  text: string;
  searchQueries: string[];
  sources: Array<{ title: string; url: string }>;
  provider?: string;
  timestamp?: number;
  fallback?: boolean;
}

export async function performGoogleSearchGrounding(
  query: string,
  language: AppLanguage
): Promise<GoogleGroundingResult> {
  const startTime = Date.now();
  const payload = { query, language };

  try {
    const response = await fetch("/api/google-search-grounding", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    recordTelemetry({
      id: `grounding-${Date.now()}`,
      timestamp: Date.now(),
      endpoint: "/api/google-search-grounding",
      method: "POST",
      status: response.status,
      durationMs: Date.now() - startTime,
      requestPayload: payload,
      responsePayload: data,
      step: 6,
      stageName: "Google Real-Time Search Grounding",
      success: data.success ?? true,
    });

    return data;
  } catch (err: any) {
    console.error("Google grounding client error:", err);
    return {
      success: false,
      query,
      text: "Unable to retrieve real-time Google grounded data at this moment.",
      searchQueries: [query],
      sources: [],
    };
  }
}

export interface WebhookConnectorResult {
  success: boolean;
  status?: number;
  statusText?: string;
  durationMs: number;
  headers?: Record<string, string>;
  data?: any;
  error?: string;
  url: string;
  method: string;
}

export async function dispatchWebhookConnector(
  url: string,
  method: string = "GET",
  headers: Record<string, string> = {},
  body?: any
): Promise<WebhookConnectorResult> {
  const startTime = Date.now();
  const payload = { url, method, headers, body };

  try {
    const response = await fetch("/api/connectors/webhook", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    recordTelemetry({
      id: `webhook-${Date.now()}`,
      timestamp: Date.now(),
      endpoint: "/api/connectors/webhook",
      method: "POST",
      status: response.status,
      durationMs: Date.now() - startTime,
      requestPayload: payload,
      responsePayload: data,
      step: 6,
      stageName: "External Webhook / API Dispatch",
      success: data.success ?? true,
    });

    return data;
  } catch (err: any) {
    console.error("Webhook connector error:", err);
    return {
      success: false,
      durationMs: Date.now() - startTime,
      error: err?.message || "Failed to dispatch request",
      url,
      method,
    };
  }
}

export interface ExportConnectorResult {
  success: boolean;
  fileName: string;
  mimeType: string;
  format: string;
  content: string;
  byteSize: number;
}

export async function exportDocumentData(
  title: string,
  content: string,
  format: "markdown" | "gdoc" | "json" | "html" = "markdown",
  metadata: Record<string, any> = {}
): Promise<ExportConnectorResult | null> {
  try {
    const response = await fetch("/api/connectors/export", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, content, format, metadata }),
    });
    return await response.json();
  } catch (err) {
    console.error("Export connector error:", err);
    return null;
  }
}

export interface SystemHealthData {
  success: boolean;
  status: string;
  uptimeSec: number;
  timestamp: number;
  version: string;
  environment: string;
  models: Array<{ model: string; available: boolean; cooldownUntil: number | null }>;
  cache: { totalEntries: number; maxEntries: number; ttlMs: number };
  memory: { rssMb: number; heapUsedMb: number; heapTotalMb: number };
  firestoreConfigured: boolean;
  firestoreDb: string;
  activeEndpoints: string[];
}

export async function fetchSystemHealth(): Promise<SystemHealthData | null> {
  try {
    const response = await fetch("/api/connectors/system-health");
    return await response.json();
  } catch (err) {
    console.error("Health check error:", err);
    return null;
  }
}

// Client Cloud Sync / Snapshot Manager
export interface CloudSyncSnapshot {
  timestamp: number;
  device: string;
  conversationsCount: number;
  savedNotesCount: number;
  dbRef: string;
}

export function saveCloudSyncSnapshot(snapshot: CloudSyncSnapshot) {
  try {
    const history = getCloudSyncHistory();
    history.unshift(snapshot);
    localStorage.setItem("qaxale_cloud_sync_history", JSON.stringify(history.slice(0, 20)));
  } catch (e) {
    console.error("Error storing sync snapshot:", e);
  }
}

export function getCloudSyncHistory(): CloudSyncSnapshot[] {
  try {
    const data = localStorage.getItem("qaxale_cloud_sync_history");
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export async function testRawEndpoint(
  endpoint: string,
  payload: Record<string, any>
): Promise<{ status: number; durationMs: number; data: any; ok: boolean }> {
  const startTime = Date.now();
  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const durationMs = Date.now() - startTime;
    let data: any;
    try {
      data = await response.json();
    } catch {
      data = { rawText: await response.text() };
    }

    recordTelemetry({
      id: `raw-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      timestamp: Date.now(),
      endpoint,
      method: "POST",
      status: response.status,
      durationMs,
      requestPayload: payload,
      responsePayload: data,
      step: response.ok ? 7 : 4,
      stageName: response.ok ? "Custom Test Request Succeeded" : "Custom Test Request Failed",
      success: response.ok,
    });

    return {
      status: response.status,
      durationMs,
      data,
      ok: response.ok,
    };
  } catch (e: any) {
    const durationMs = Date.now() - startTime;
    const errorData = { error: e.message || "Network request failed" };

    recordTelemetry({
      id: `raw-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      timestamp: Date.now(),
      endpoint,
      method: "POST",
      status: 0,
      durationMs,
      requestPayload: payload,
      responsePayload: errorData,
      step: 3,
      stageName: "Network Transport Failure",
      success: false,
      error: e.message,
    });

    return {
      status: 0,
      durationMs,
      data: errorData,
      ok: false,
    };
  }
}
