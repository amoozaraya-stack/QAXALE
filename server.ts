import express from "express";
import type { Request, Response, NextFunction } from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

// ==========================================
// 1. Centralized Gemini Model Configuration
// ==========================================
const GEMINI_MODELS = [
  process.env.GEMINI_PRIMARY_MODEL,
  process.env.GEMINI_FALLBACK_MODEL_1,
  process.env.GEMINI_FALLBACK_MODEL_2,
  "gemini-3.7-flash",
  "gemini-3.6-flash",
  "gemini-3.5-flash-lite",
].filter(Boolean) as string[];

// Remove duplicate model IDs while preserving precedence order
const CONFIGURED_MODELS = Array.from(new Set(GEMINI_MODELS));

// Validate API Key on server startup
if (!process.env.GEMINI_API_KEY) {
  console.error("[QAXALE SERVER WARNING] GEMINI_API_KEY is missing from environment variables.");
} else {
  console.log(`[QAXALE SERVER] Gemini API key detected. Configured model chain: ${CONFIGURED_MODELS.join(", ")}`);
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
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return geminiClientInstance;
}

// ==========================================
// 2. Types & Request Interfaces
// ==========================================
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

// ==========================================
// 3. Conversation History Sanitization
// ==========================================
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
      content?: unknown; // Handle frontend { role, content } representation
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

// ==========================================
// 4. Error Classification & Helpers
// ==========================================
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

  // Statuses that are considered transient or rate-limited
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

// ==========================================
// 5. Centralized Reusable Gemini Calling Logic
// ==========================================
const SYSTEM_INSTRUCTION_QAXALE = `You are QAXALE (Qaxalee), an advanced, friendly, and culturally authentic AI assistant and educational companion designed specifically to empower Afaan Oromoo speakers and learners worldwide with artificial intelligence, programming, digital technology, computer science, and modern knowledge.

Key Responsibilities & Principles:
1. First-class Afaan Oromoo support:
   - When the user asks in Afaan Oromoo, respond in natural, grammatically sound, modern, and respectful Afaan Oromoo (Qubee Afaan Oromoo).
   - When the user asks in English, respond in clear English while offering relevant Afaan Oromoo technical term counterparts where helpful.
   - Use authentic tech vocabulary (e.g., 'Saayinsii Kompiitaraa', 'Saganteessuu / Koodingii', 'Hubannoo Nam-tolchee (AI)', 'Kuusaa Daataa', 'Algorizimii', 'Fayyadamaa', 'Mooraa Marraa / Marsariitii', 'Qorannoo').
2. Pedagogical Excellence:
   - Break down complex concepts step-by-step.
   - For coding questions, explain the logic, syntax, line-by-line function, and real-world execution flow.
3. Identity & Tone:
   - You are named "QAXALE". Always encourage learning, innovation, and digital empowerment.
   - Format answers cleanly with markdown headings, lists, and code blocks for easy reading on mobile screens.`;

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
        console.log(`[AI] endpoint=${endpoint} model=${model} attempt=${attempt + 1}`);

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
        console.warn(`[AI] endpoint=${endpoint} model=${model} attempt=${attempt + 1} status=${status || "UNKNOWN"} error=${error?.message || error}`);

        if (!isRetryable(error)) {
          // Non-retryable (400, 401, 403, 404), break loop for this model and test next model or throw
          console.warn(`[AI] Model ${model} returned non-retryable status ${status}. Skipping model.`);
          break;
        }

        if (attempt < delays.length - 1) {
          const delayMs = delays[attempt];
          console.log(`[AI] retrying=true backoff=${delayMs}ms`);
          await sleep(delayMs);
        }
      }
    }
  }

  throw lastError || new Error("All configured Gemini models failed.");
}

// Input validation helper
function requireString(value: unknown, field: string): string {
  if (typeof value !== "string" || !value.trim()) {
    throw new Error(`${field} is required.`);
  }
  return value.trim();
}

// ==========================================
// 6. Express App & Endpoint Handlers
// ==========================================
async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "5mb" }));

  // Health check endpoint
  app.get("/api/health", (_req, res) => {
    res.json({
      status: "ok",
      app: "QAXALE",
      configuredModels: CONFIGURED_MODELS,
      hasApiKey: !!process.env.GEMINI_API_KEY,
      timestamp: new Date().toISOString(),
    });
  });

  // ------------------------------------------
  // 10. POST /api/chat
  // ------------------------------------------
  app.post("/api/chat", async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { messages, message, language = "om", mode = "standard" } = req.body;

      let historyPayload: unknown = messages;

      // Handle single message payload format as well
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

      // If sanitation left nothing, but user provided a message string, add it
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

      let modeInstruction = "";
      if (mode === "step-by-step") {
        modeInstruction = " Break down the answer into structured, numbered, easy-to-follow steps with simple analogies.";
      } else if (mode === "summary") {
        modeInstruction = " Provide a crisp, high-value summary with key takeaways and bullet points.";
      } else if (mode === "brainstorm") {
        modeInstruction = " Generate creative, actionable, and structured ideas with pros, opportunities, and next steps.";
      } else if (mode === "code-explain") {
        modeInstruction = " Explain this code logic in clear Afaan Oromoo, breaking down what each block does and how it executes.";
      }

      try {
        const replyText = await callGemini(sanitized, {
          systemInstruction: SYSTEM_INSTRUCTION_QAXALE + modeInstruction,
          temperature: 0.7,
          endpoint: "/api/chat",
        });

        return res.json({
          success: true,
          message: replyText,
          reply: replyText, // backwards compatible for frontend
        });
      } catch (geminiError: any) {
        console.error("Gemini failed during /api/chat:", geminiError?.message || geminiError);

        // Check if API key is not configured or all models were unavailable
        const lastUserMsg = sanitized.filter((m) => m.role === "user").pop()?.parts[0]?.text || "";
        const fallbackText =
          language === "om"
            ? `Akkam! Ani **QAXALE** dha.\n\nGaaffii kee: **"${lastUserMsg.slice(0, 80)}"** ilaalchisee:\n- QAXALE AI teeknooloojii, saganteessuu (coding), fi hiika jechootaa irratti qophiidha.\n- Yaada ykn gaaffii dabalataa yoo qabaatte na gaafadhu!`
            : `Hello! I am **QAXALE**.\n\nRegarding your query: **"${lastUserMsg.slice(0, 80)}"**:\n- QAXALE is ready to assist you with tech learning and coding.\n- Feel free to ask more details!`;

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

  // ------------------------------------------
  // 11. POST /api/translate
  // ------------------------------------------
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

      const prompt = `You are the world's most capable linguistic expert in Afaan Oromoo (Oromo language) and English.
Translate the following text accurately, naturally, and contextually.

Source Language: ${sourceLang === "om" ? "Afaan Oromoo" : "English"}
Target Language: ${targetLang === "om" ? "Afaan Oromoo" : "English"}

Original Text:
"""${text}"""

Provide a structured response in JSON format with the following fields:
- "translatedText": The accurate, idiomatic translation in the target language.
- "alternativeTranslations": An array of 1-3 natural alternative ways to say this (if applicable).
- "culturalOrGrammarNotes": A short explanation of tricky words, grammar particles (e.g., -ti, -dha, -tu, -in), or tone.
- "keyVocabulary": An array of objects with { "term": string, "meaning": string, "partOfSpeech": string } for key words in the sentence.`;

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
              : "Contextual direct translation notes.",
          fallback: true,
        });
      }
    } catch (err) {
      next(err);
    }
  });

  // ------------------------------------------
  // 12. POST /api/code-explain
  // ------------------------------------------
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

      const prompt = `You are QAXALE, an expert computer science professor and mentor who explains programming concepts to students in ${targetLanguage === "om" ? "Afaan Oromoo" : "English"}.
Language of Code: ${language}
Code:
\`\`\`${language}
${code}
\`\`\`

Explain this code clearly in ${targetLanguage === "om" ? "Afaan Oromoo (with English code syntax retained)" : "English"}.
Provide a structured JSON output with:
- "title": A short descriptive title of what this code does.
- "summary": A 2-sentence summary in Afaan Oromoo.
- "lineByLine": An array of objects: { "line": string, "explanation": string } explaining important sections.
- "conceptLearned": The core programming concept (e.g. Loops / Marroo, Functions / Dalagaalee, Conditionals / Haalawwan).
- "outputSimulation": What this code will print or produce when executed.
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

  // ------------------------------------------
  // 13. POST /api/dictionary
  // ------------------------------------------
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

      const prompt = `Provide the Afaan Oromoo technological/scientific definition, English equivalent, etymology, and example sentences for the term: "${word}".
Respond in JSON format:
{
  "term": "${word}",
  "oromooTerm": string,
  "englishTerm": string,
  "partOfSpeech": string,
  "definitionOromo": string,
  "definitionEnglish": string,
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
          definition: "Jechi kun teeknooloojii fi saayinsii kompiitaraa keessatti bal'inaan faayidaa irra oola.",
          definitionOromo: "Jechi kun teeknooloojii fi saayinsii kompiitaraa keessatti bal'inaan faayidaa irra oola.",
          definitionEnglish: "A technological terminology used in computer science.",
          relatedTerms: ["Teeknooloojii", "Koodingii", "Saayinsii"],
          fallback: true,
        });
      }
    } catch (err) {
      next(err);
    }
  });

  // ------------------------------------------
  // Vite Frontend Middleware
  // ------------------------------------------
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

  // ------------------------------------------
  // 14. Global Error Middleware
  // ------------------------------------------
  app.use((error: unknown, _req: Request, res: Response, _next: NextFunction) => {
    console.error("[SERVER UNHANDLED ERROR]:", error);

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
    console.log(`[QAXALE SERVER] Listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("[FATAL SERVER BOOTSTRAP ERROR]:", err);
});
