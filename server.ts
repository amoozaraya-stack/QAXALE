import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

const SYSTEM_INSTRUCTION_QAXALE = `You are QAXALE (Qaxalee), an advanced, friendly, and culturally authentic AI assistant and educational companion designed specifically to empower Afaan Oromoo speakers and learners worldwide with artificial intelligence, programming, digital technology, computer science, and modern knowledge.

Key Responsibilities & Principles:
1. First-class Afaan Oromoo support:
   - When the user asks in Afaan Oromoo, respond in natural, grammatically sound, modern, and respectful Afaan Oromoo (Qubee Afaan Oromoo).
   - When the user asks in English, respond in clear English while offering relevant Afaan Oromoo technical term counterparts where helpful.
   - Avoid robotic or awkward literal translations. Use authentic vocabulary (e.g., 'Saayinsii Kompiitaraa', 'Saganteessuu / Koodingii', 'Hubannoo Nam-tolchee (AI)', 'Kuusaa Daataa', 'Algorizimii', 'Fayyadamaa', 'Mooraa Marraa / Marsariitii', 'Qorannoo').
2. Pedagogical Excellence:
   - Break down complex concepts step-by-step ("Tarkaanfiidhaan").
   - For coding questions, explain the logic, syntax, line-by-line function, and real-world execution flow.
   - Support brainstorming, summarizing articles, debugging code, teaching science, math, and business.
3. Identity & Tone:
   - You are named "QAXALE" (meaning clever, sharp, capable, intelligent in Afaan Oromoo).
   - Always encourage learning, innovation, and digital empowerment.
   - Format answers cleanly with markdown headings, lists, and code blocks for easy reading on mobile screens.`;

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "5mb" }));

  // Health check endpoint
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", app: "QAXALE", timestamp: new Date().toISOString() });
  });

  // AI Chat endpoint
  app.post("/api/chat", async (req, res) => {
    try {
      const { messages, language = "om", mode = "standard" } = req.body;

      if (!messages || !Array.isArray(messages) || messages.length === 0) {
        return res.status(400).json({ error: "Messages array is required." });
      }

      const ai = getGeminiClient();
      if (!ai) {
        // Fallback realistic response if API key is not configured yet
        const lastMsg = messages[messages.length - 1]?.content || "";
        const fallbackText = language === "om"
          ? `Akkam jirtu! Ani Qaxalee dha. Gaaffii keessan: "${lastMsg.slice(0, 50)}..." irratti isin gargaaruuf qophiidha. (Hubachiisa: GEMINI_API_KEY saagi ykn qindeessi).`
          : `Hello! I am QAXALE. I am ready to assist you with: "${lastMsg.slice(0, 50)}...". (Note: Please configure GEMINI_API_KEY in settings).`;
        return res.json({ reply: fallbackText, fallback: true });
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

      // Convert conversation history into contents
      const conversationHistory = messages.map((m: { role: string; content: string }) => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.content }],
      }));

      const response = await ai.models.generateContent({
        model: "gemini-3.7-flash",
        contents: conversationHistory,
        config: {
          systemInstruction: SYSTEM_INSTRUCTION_QAXALE + modeInstruction,
          temperature: 0.7,
        },
      });

      const reply = response.text || "Deebiin hin argamne.";
      res.json({ reply });
    } catch (err: any) {
      console.error("Chat error:", err);
      res.status(500).json({
        error: "Rakkoon uumamee jira. Maaloo irra deebi'aa yaalaa.",
        details: err?.message || String(err),
      });
    }
  });

  // Translation endpoint (Afaan Oromoo <-> English)
  app.post("/api/translate", async (req, res) => {
    try {
      const { text, sourceLang = "en", targetLang = "om" } = req.body;

      if (!text || !text.trim()) {
        return res.status(400).json({ error: "Text to translate is required." });
      }

      const ai = getGeminiClient();
      if (!ai) {
        // Simple mock fallback if key is missing
        return res.json({
          translatedText: `[Hiika Qaxalee]: ${text}`,
          vocabulary: [],
          notes: "Please configure GEMINI_API_KEY for live AI translation.",
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

      const response = await ai.models.generateContent({
        model: "gemini-3.7-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          temperature: 0.2,
        },
      });

      let parsed: any;
      try {
        parsed = JSON.parse(response.text || "{}");
      } catch {
        parsed = { translatedText: response.text || "" };
      }

      res.json(parsed);
    } catch (err: any) {
      console.error("Translation error:", err);
      res.status(500).json({
        error: "Translation failed",
        details: err?.message || String(err),
      });
    }
  });

  // Code explanation endpoint
  app.post("/api/code-explain", async (req, res) => {
    try {
      const { code, language = "python", targetLanguage = "om" } = req.body;

      if (!code) {
        return res.status(400).json({ error: "Code snippet is required." });
      }

      const ai = getGeminiClient();
      if (!ai) {
        return res.json({
          summary: "Koodiin kun hojii qulqulluu qaba.",
          steps: ["Tarkaanfii 1: Koodii jalqabuu", "Tarkaanfii 2: Hojjechuu"],
          executionExplanation: "API Key configure gochuun bal'inaan ilaalaa.",
        });
      }

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

      const response = await ai.models.generateContent({
        model: "gemini-3.7-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          temperature: 0.3,
        },
      });

      let result: any;
      try {
        result = JSON.parse(response.text || "{}");
      } catch {
        result = { summary: response.text };
      }

      res.json(result);
    } catch (err: any) {
      console.error("Code explain error:", err);
      res.status(500).json({
        error: "Failed to explain code",
        details: err?.message || String(err),
      });
    }
  });

  // Dictionary / Tech Term Lookup endpoint
  app.post("/api/dictionary", async (req, res) => {
    try {
      const { term } = req.body;
      if (!term) return res.status(400).json({ error: "Term required" });

      const ai = getGeminiClient();
      if (!ai) {
        return res.json({
          term,
          oromooTerm: term,
          definition: "Ibsa dabalataa argachuuf API Key qindeessi.",
          examples: [],
        });
      }

      const prompt = `Provide the Afaan Oromoo technological/scientific definition, English equivalent, etymology, and example sentences for the term: "${term}".
Respond in JSON format:
{
  "term": "${term}",
  "oromooTerm": string,
  "englishTerm": string,
  "partOfSpeech": string,
  "definitionOromo": string,
  "definitionEnglish": string,
  "exampleOromo": string,
  "exampleEnglish": string,
  "relatedTerms": string[]
}`;

      const response = await ai.models.generateContent({
        model: "gemini-3.7-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          temperature: 0.2,
        },
      });

      res.json(JSON.parse(response.text || "{}"));
    } catch (err: any) {
      res.status(500).json({ error: "Dictionary lookup failed" });
    }
  });

  // Vite middleware setup
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`QAXALE Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
