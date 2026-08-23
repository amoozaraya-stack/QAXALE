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
