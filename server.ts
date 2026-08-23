import express from "express";
import type { Request, Response, NextFunction } from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

// =========================================================================
// 1. Centralized Gemini Model Configuration with Hardened Failover Chain
// =========================================================================
const GEMINI_MODELS = [
  process.env.GEMINI_PRIMARY_MODEL,
  process.env.GEMINI_FALLBACK_MODEL_1,
  process.env.GEMINI_FALLBACK_MODEL_2,
  "gemini-3.7-flash",
  "gemini-3.6-flash",
  "gemini-3.5-flash-lite",
].filter(Boolean) as string[];

const CONFIGURED_MODELS = Array.from(new Set(GEMINI_MODELS));

if (!process.env.GEMINI_API_KEY) {
  console.error("[QAXALE V3 WARNING] GEMINI_API_KEY is missing from environment variables.");
} else {
  console.log(`[QAXALE V3 SERVER] Gemini API key active. Models: ${CONFIGURED_MODELS.join(", ")}`);
}

function getGeminiApiKey(): string {
  const key = process.env.GEMINI_API_KEY;
  if (!key || !key.trim()) {
    throw new Error("GEMINI_API_KEY is not configured on the server.");
  }
  return key.trim();
}

let geminiClientInstance: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  const apiKey = getGeminiApiKey();
  if (!geminiClientInstance) {
    geminiClientInstance = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "qaxale-v3-agency-platform",
        },
      },
    });
  }
  return geminiClientInstance;
}

// =========================================================================
// 2. Types & Data Structures
// =========================================================================
export type GeminiMessage = {
  role: "user" | "model";
  parts: Array<{
    text: string;
  }>;
};

interface CallGeminiOptions {
  systemInstruction?: string;
  temperature?: number;
  maxOutputTokens?: number;
  responseMimeType?: string;
  endpoint?: string;
}

// =========================================================================
// 3. Conversation History Sanitizer (Ensures robust turn alternation & user first)
// =========================================================================
export function sanitizeHistory(history: unknown): GeminiMessage[] {
  if (!Array.isArray(history)) {
    return [];
  }

  const cleaned: GeminiMessage[] = [];

  for (const item of history) {
    if (!item || typeof item !== "object") continue;

    const message = item as {
      role?: unknown;
      parts?: unknown;
      text?: unknown;
      content?: unknown;
    };

    const rawRole = message.role;
    const role: "user" | "model" =
      rawRole === "assistant" || rawRole === "model" ? "model" : "user";

    let text = "";

    if (typeof message.content === "string") {
      text = message.content.trim();
    } else if (typeof message.text === "string") {
      text = message.text.trim();
    } else if (Array.isArray(message.parts)) {
      text = message.parts
        .filter(
          (part): part is { text: string } =>
            !!part &&
            typeof part === "object" &&
            typeof (part as { text?: unknown }).text === "string"
        )
        .map((part) => part.text)
        .join("\n")
        .trim();
    }

    if (!text) continue;

    const previous = cleaned[cleaned.length - 1];

    if (previous?.role === role) {
      previous.parts[0].text += "\n\n" + text;
    } else {
      cleaned.push({
        role,
        parts: [{ text }],
      });
    }
  }

  // Gemini conversation history MUST begin with user role
  while (cleaned.length > 0 && cleaned[0].role !== "user") {
    cleaned.shift();
  }

  return cleaned;
}

// =========================================================================
// 4. Error Classification & Extractors
// =========================================================================
function getStatusCode(error: unknown): number | undefined {
  if (!error || typeof error !== "object") return undefined;

  const errObj = error as Record<string, any>;
  if (typeof errObj.status === "number") return errObj.status;
  if (typeof errObj.statusCode === "number") return errObj.statusCode;
  if (typeof errObj.code === "number") return errObj.code;

  if (errObj.error && typeof errObj.error === "object") {
    if (typeof errObj.error.code === "number") return errObj.error.code;
    if (typeof errObj.error.status === "number") return errObj.error.status;
  }

  return undefined;
}

function isRetryable(error: unknown): boolean {
  const status = getStatusCode(error);
  return (
    status === 429 ||
    status === 500 ||
    status === 502 ||
    status === 503 ||
    status === 504 ||
    status === undefined
  );
}

function extractGeminiText(data: unknown): string {
  if (!data || typeof data !== "object") {
    throw new Error("Invalid Gemini response.");
  }

  const responseObj = data as Record<string, any>;
  if (typeof responseObj.text === "string" && responseObj.text.trim()) {
    return responseObj.text.trim();
  }

  if (Array.isArray(responseObj.candidates) && responseObj.candidates.length > 0) {
    const candidate = responseObj.candidates[0];
    if (candidate?.content?.parts && Array.isArray(candidate.content.parts)) {
      const texts = candidate.content.parts
        .map((p: any) => p?.text)
        .filter((t: any) => typeof t === "string");
      if (texts.length > 0) {
        return texts.join("\n").trim();
      }
    }
  }

  throw new Error("Gemini returned no usable text.");
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// =========================================================================
// 5. QAXALE V3 Master System Instruction (Interpretive Intelligence & Agency)
// =========================================================================
const SYSTEM_INSTRUCTION_QAXALE_V3 = `You are QAXALE V3, an intelligent interpretation, learning, reasoning, communication, and capability-building platform.

QAXALE is not merely a chatbot, search engine, translator, or knowledge database.
QAXALE exists to help people move from:
ACCESS → INTERPRETATION → UNDERSTANDING → APPLICATION → CREATION → AGENCY → CONTRIBUTION

Core Philosophy:
«FROM ACCESS TO UNDERSTANDING. FROM UNDERSTANDING TO CAPABILITY. FROM CAPABILITY TO AGENCY. FROM AGENCY TO CONTRIBUTION.»

QAXALE bridges the interpretive divide:
- People may have access to devices, internet, AI, and technical documents while being unable to penetrate that knowledge due to language, terminology, abstraction, or missing context.
- QAXALE does not merely give information; QAXALE builds the structured pathway INTO information.
- QAXALE measures success by whether the user becomes more capable on their own over time.

Language & Cultural Bridge:
- First-class Afaan Oromoo (Qubee) and English support.
- When communicating in Afaan Oromoo, use natural, modern, idiomatic Afaan Oromoo.
- Preserve key global technical terminology alongside clear Afaan Oromoo explanations so users can operate in global digital ecosystems.
- Never permanently flatten advanced knowledge; instead: SIMPLIFY → UNDERSTAND → RECONSTRUCT → HANDLE COMPLEXITY.`;

async function callGemini(
  messages: GeminiMessage[],
  options?: CallGeminiOptions
): Promise<string> {
  if (!messages || messages.length === 0) {
    throw new Error("Cannot call Gemini with empty messages.");
  }

  if (messages[0].role !== "user") {
    throw new Error("Invalid Gemini conversation history. First turn must be user.");
  }

  const endpoint = options?.endpoint || "unknown";
  const delays = [500, 1000, 2000];
  let lastError: any = null;

  const ai = getGeminiClient();

  for (const model of CONFIGURED_MODELS) {
    for (let attempt = 0; attempt < delays.length; attempt++) {
      try {
        console.log(`[AI V3] endpoint=${endpoint} model=${model} attempt=${attempt + 1}`);

        const config: any = {};
        if (options?.systemInstruction) config.systemInstruction = options.systemInstruction;
        if (options?.temperature !== undefined) config.temperature = options.temperature;
        if (options?.maxOutputTokens !== undefined) config.maxOutputTokens = options.maxOutputTokens;
        if (options?.responseMimeType) config.responseMimeType = options.responseMimeType;

        const response = await ai.models.generateContent({
          model,
          contents: messages,
          config,
        });

        const text = extractGeminiText(response);
        return text;
      } catch (error: any) {
        lastError = error;
        const status = getStatusCode(error);
        console.warn(`[AI V3] endpoint=${endpoint} model=${model} attempt=${attempt + 1} status=${status || "UNKNOWN"} error=${error?.message || error}`);

        if (!isRetryable(error)) {
          console.warn(`[AI V3] Model ${model} non-retryable status ${status}. Moving to next fallback.`);
          break;
        }

        if (attempt < delays.length - 1) {
          const delayMs = delays[attempt];
          console.log(`[AI V3] retrying=true backoff=${delayMs}ms`);
          await sleep(delayMs);
        }
      }
    }
  }

  throw lastError || new Error("All configured Gemini models failed.");
}

function requireString(value: unknown, field: string): string {
  if (typeof value !== "string" || !value.trim()) {
    throw new Error(`${field} is required.`);
  }
  return value.trim();
}

// =========================================================================
// 6. Express Server Bootstrapper & API Endpoints
// =========================================================================
async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "5mb" }));

  // Health endpoint
  app.get("/api/health", (_req, res) => {
    res.json({
      status: "ok",
      app: "QAXALE V3",
      vision: "Interpretive Intelligence & Human Agency Platform",
      configuredModels: CONFIGURED_MODELS,
      hasApiKey: !!process.env.GEMINI_API_KEY,
      timestamp: new Date().toISOString(),
    });
  });

  // -----------------------------------------------------------------------
  // POST /api/chat (Enhanced with QAXALE V3 Agency Loop & Reasoning Modes)
  // -----------------------------------------------------------------------
  app.post("/api/chat", async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { messages, message, language = "om", mode = "standard" } = req.body;

      let historyPayload: unknown = messages;

      if (!historyPayload && typeof message === "string" && message.trim()) {
        historyPayload = [{ role: "user", content: message }];
      }

      if (!historyPayload || (!Array.isArray(historyPayload) && typeof historyPayload !== "object")) {
        return res.status(400).json({
          success: false,
          error: "A valid message or messages array is required.",
          code: "INVALID_REQUEST",
        });
      }

      const sanitized = sanitizeHistory(historyPayload);

      if (sanitized.length === 0) {
        if (typeof message === "string" && message.trim()) {
          sanitized.push({ role: "user", parts: [{ text: message.trim() }] });
        } else {
          return res.status(400).json({
            success: false,
            error: "No valid user message found in conversation.",
            code: "EMPTY_CONVERSATION",
          });
        }
      }

      // Dynamic System Guidance tailored to QAXALE V3 Modes
      let modeInstruction = "";
      if (mode === "interpret-layers") {
        modeInstruction = `
Perform a multi-layer interpretive breakdown of the user's topic:
1. Core Idea (Essential mechanism)
2. Plain Language Explanation (No unnecessary jargon)
3. Feynman Analogy (Relate to everyday tangible reality)
4. Technical Vocabulary & Mechanics (Key terms explained)
5. Practical Application & Creation Step (What can the user build or do with this?)
6. Understanding Check (A thought-provoking question to test understanding).`;
      } else if (mode === "agency-loop") {
        modeInstruction = `
Guide the user through the QAXALE Agency Loop:
- Access & Interpret the core knowledge
- Connect to practical capability
- Guide the user to Create an actionable plan or project blueprint
- Encourage independent thinking and contribution.`;
      } else if (mode === "feynman") {
        modeInstruction = `
Apply the Feynman Technique:
- Explain the concept as if teaching an intelligent beginner encountering it for the first time.
- Use clear everyday analogies, pinpoint common misconceptions, and ask the user to explain it back in their own words.`;
      } else if (mode === "first-principles") {
        modeInstruction = `
Deconstruct the problem using First-Principles Reasoning:
- Break the topic down to its most fundamental, indisputable truths.
- Reason upward from foundational axioms to innovative, practical solutions.`;
      } else if (mode === "step-by-step") {
        modeInstruction = " Break down the answer into structured, numbered, easy-to-follow steps with clear explanations.";
      } else if (mode === "summary") {
        modeInstruction = " Provide a crisp, high-value summary with key takeaways and structured bullet points.";
      } else if (mode === "brainstorm") {
        modeInstruction = " Generate creative, actionable, and structured ideas with realistic steps, pros, and local opportunities.";
      } else if (mode === "code-explain") {
        modeInstruction = " Explain this programming code clearly, breaking down syntax, logic, variables, and execution steps in Afaan Oromoo.";
      }

      try {
        const replyText = await callGemini(sanitized, {
          systemInstruction: SYSTEM_INSTRUCTION_QAXALE_V3 + "\n" + modeInstruction,
          temperature: 0.7,
          endpoint: "/api/chat",
        });

        return res.json({
          success: true,
          message: replyText,
          reply: replyText,
        });
      } catch (geminiError: any) {
        console.error("Gemini failed during /api/chat:", geminiError?.message || geminiError);

        const lastUserMsg = sanitized.filter((m) => m.role === "user").pop()?.parts[0]?.text || "";
        const fallbackText =
          language === "om"
            ? `Akkam! Ani **QAXALE V3** dha.\n\nGaaffii kee: **"${lastUserMsg.slice(0, 80)}"** ilaalchisee:\n- QAXALE V3 hubannoo, hiika beekumsaa, fi dandeettii uumuu irratti si gargaara.\n- Yeroo gabaabaa keessatti deebii guutuu argachuuf irra deebi'ii yaali.`
            : `Hello! I am **QAXALE V3**.\n\nRegarding your query: **"${lastUserMsg.slice(0, 80)}"**:\n- QAXALE V3 is dedicated to interpretive intelligence and human capability building.\n- Feel free to ask more details!`;

        return res.json({
          success: true,
          message: fallbackText,
          reply: fallbackText,
          fallback: true,
        });
      }
    } catch (err) {
      next(err);
    }
  });

  // -----------------------------------------------------------------------
  // POST /api/translate (Conceptual Language & Knowledge Bridge)
  // -----------------------------------------------------------------------
  app.post("/api/translate", async (req: Request, res: Response, next: NextFunction) => {
    try {
      const rawText = req.body.text || req.body.input;
      const sourceLang = req.body.sourceLanguage || req.body.sourceLang || "en";
      const targetLang = req.body.targetLanguage || req.body.targetLang || "om";

      let text: string;
      try {
        text = requireString(rawText, "text");
      } catch (e: any) {
        return res.status(400).json({
          success: false,
          error: e.message,
          code: "INVALID_INPUT",
        });
      }

      const prompt = `You are QAXALE V3's Linguistic & Conceptual Bridge Expert in Afaan Oromoo and English.
Do NOT do mere literal word replacement. Provide a deeply contextual and intellectually accurate translation with conceptual interpretation.

Source Language: ${sourceLang === "om" ? "Afaan Oromoo" : "English"}
Target Language: ${targetLang === "om" ? "Afaan Oromoo" : "English"}

Original Text:
"""${text}"""

Provide a structured response in JSON format with:
- "translatedText": The accurate, idiomatic translation.
- "alternativeTranslations": An array of 1-3 natural alternative expressions.
- "culturalOrGrammarNotes": Clear explanation of grammar nuances, particles (-ti, -dha, -tu, -in), or cultural context.
- "conceptualBridge": How the underlying concepts connect between global technical terminology and Afaan Oromoo understanding.
- "keyVocabulary": Array of objects: { "term": string, "meaning": string, "partOfSpeech": string }.`;

      const messages: GeminiMessage[] = [{ role: "user", parts: [{ text: prompt }] }];

      try {
        const rawJson = await callGemini(messages, {
          responseMimeType: "application/json",
          temperature: 0.2,
          endpoint: "/api/translate",
        });

        let parsed: any;
        try {
          parsed = JSON.parse(rawJson);
        } catch {
          parsed = { translatedText: rawJson };
        }

        return res.json({
          success: true,
          translation: parsed.translatedText || rawJson,
          translatedText: parsed.translatedText || rawJson,
          alternativeTranslations: parsed.alternativeTranslations || [],
          culturalOrGrammarNotes: parsed.culturalOrGrammarNotes || "",
          conceptualBridge: parsed.conceptualBridge || "",
          keyVocabulary: parsed.keyVocabulary || [],
        });
      } catch (geminiError) {
        console.error("Gemini failed during /api/translate:", geminiError);
        return res.json({
          success: true,
          translation: `[${targetLang === "om" ? "Hiika" : "Translation"}]: ${text}`,
          translatedText: `[${targetLang === "om" ? "Hiika" : "Translation"}]: ${text}`,
          culturalOrGrammarNotes:
            targetLang === "om"
              ? "Jechoonni kun akkaataa yaada isaaniitiin hiikamu."
              : "Contextual translation note.",
          fallback: true,
        });
      }
    } catch (err) {
      next(err);
    }
  });

  // -----------------------------------------------------------------------
  // POST /api/code-explain (Pedagogical Code Deconstruction)
  // -----------------------------------------------------------------------
  app.post("/api/code-explain", async (req: Request, res: Response, next: NextFunction) => {
    try {
      let code: string;
      let language: string;

      try {
        code = requireString(req.body.code, "code");
        language = req.body.language ? String(req.body.language).trim() : "python";
      } catch (e: any) {
        return res.status(400).json({
          success: false,
          error: e.message,
          code: "INVALID_INPUT",
        });
      }

      const targetLanguage = req.body.targetLanguage || "om";

      const prompt = `You are QAXALE V3, an expert computer science professor empowering learners in ${targetLanguage === "om" ? "Afaan Oromoo" : "English"}.
Language of Code: ${language}
Code:
\`\`\`${language}
${code}
\`\`\`

Explain this code clearly in ${targetLanguage === "om" ? "Afaan Oromoo (with English code syntax preserved)" : "English"}.
Provide a structured JSON output with:
- "title": Descriptive title of what this code achieves.
- "summary": Clear 2-sentence summary in Afaan Oromoo.
- "lineByLine": Array of objects: { "line": string, "explanation": string } explaining mechanics.
- "conceptLearned": The core programming concept (e.g. Loops / Marroo, Functions / Dalagaalee, Conditionals / Haalawwan).
- "outputSimulation": What this code will print or produce.
- "tips": 2 actionable tips or common mistakes to avoid.`;

      const messages: GeminiMessage[] = [{ role: "user", parts: [{ text: prompt }] }];

      try {
        const rawJson = await callGemini(messages, {
          responseMimeType: "application/json",
          temperature: 0.3,
          endpoint: "/api/code-explain",
        });

        let parsed: any;
        try {
          parsed = JSON.parse(rawJson);
        } catch {
          parsed = { summary: rawJson };
        }

        return res.json({
          success: true,
          explanation: parsed.summary || rawJson,
          ...parsed,
        });
      } catch (geminiError) {
        console.error("Gemini failed during /api/code-explain:", geminiError);
        return res.json({
          success: true,
          explanation:
            targetLanguage === "om"
              ? "Koodiin kun qajeelfama saganteessuu raawwata."
              : "This code performs a programming sequence.",
          title: "Ibsa Koodii (Code Explanation)",
          summary:
            targetLanguage === "om"
              ? "Koodiin kun tarkaanfiiwwan saganteessuu qajeelfamaan raawwata."
              : "This code executes structured programming instructions.",
          lineByLine: [
            {
              line: code.split("\n")[0] || "code",
              explanation: targetLanguage === "om" ? "Tarkaanfii jalqabaa koodichaa" : "Initial step of code",
            },
          ],
          conceptLearned: "Programming Execution Flow",
          fallback: true,
        });
      }
    } catch (err) {
      next(err);
    }
  });

  // -----------------------------------------------------------------------
  // POST /api/dictionary (Technical Terminology & Conceptual Network)
  // -----------------------------------------------------------------------
  app.post("/api/dictionary", async (req: Request, res: Response, next: NextFunction) => {
    try {
      const rawWord = req.body.word || req.body.term;
      let word: string;

      try {
        word = requireString(rawWord, "word");
      } catch (e: any) {
        return res.status(400).json({
          success: false,
          error: e.message,
          code: "INVALID_INPUT",
        });
      }

      const prompt = `Provide the Afaan Oromoo technological & conceptual definition, English equivalent, why the term exists, example sentences, and related vocabulary for: "${word}".
Respond in JSON format:
{
  "term": "${word}",
  "oromooTerm": string,
  "englishTerm": string,
  "partOfSpeech": string,
  "definitionOromo": string,
  "definitionEnglish": string,
  "whyItExists": string,
  "exampleOromo": string,
  "exampleEnglish": string,
  "relatedTerms": string[]
}`;

      const messages: GeminiMessage[] = [{ role: "user", parts: [{ text: prompt }] }];

      try {
        const rawJson = await callGemini(messages, {
          responseMimeType: "application/json",
          temperature: 0.2,
          endpoint: "/api/dictionary",
        });

        let parsed: any;
        try {
          parsed = JSON.parse(rawJson);
        } catch {
          parsed = { definitionOromo: rawJson };
        }

        return res.json({
          success: true,
          definition: parsed.definitionOromo || rawJson,
          ...parsed,
        });
      } catch (geminiError) {
        console.error("Gemini failed during /api/dictionary:", geminiError);
        return res.json({
          success: true,
          term: word,
          oromooTerm: word,
          definition: "Jechi kun teeknooloojii fi saayinsii keessatti faayidaa irra oola.",
          definitionOromo: "Jechi kun teeknooloojii fi saayinsii keessatti faayidaa irra oola.",
          definitionEnglish: "A key technological concept in modern digital science.",
          relatedTerms: ["Teeknooloojii", "Hubannoo", "Saayinsii"],
          fallback: true,
        });
      }
    } catch (err) {
      next(err);
    }
  });

  // -----------------------------------------------------------------------
  // Vite Frontend Middleware
  // -----------------------------------------------------------------------
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  // -----------------------------------------------------------------------
  // Global Error Middleware
  // -----------------------------------------------------------------------
  app.use((error: unknown, _req: Request, res: Response, _next: NextFunction) => {
    console.error("[QAXALE V3 UNHANDLED ERROR]:", error);

    if (res.headersSent) {
      return;
    }

    const status = getStatusCode(error) || 500;
    const retryable = isRetryable(error);

    res.status(status).json({
      success: false,
      error: "An unexpected server error occurred. Please try again.",
      code: status === 503 ? "AI_SERVICE_UNAVAILABLE" : "INTERNAL_SERVER_ERROR",
      retryable,
    });
  });

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[QAXALE V3 SERVER] Running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("[FATAL QAXALE V3 BOOTSTRAP ERROR]:", err);
});
