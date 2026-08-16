import { AppLanguage, ChatMode } from "../types";

export interface TranslateApiResponse {
  translatedText: string;
  alternativeTranslations?: string[];
  culturalOrGrammarNotes?: string;
  keyVocabulary?: Array<{ term: string; meaning: string; partOfSpeech?: string }>;
}

export interface CodeExplainApiResponse {
  title?: string;
  summary?: string;
  lineByLine?: Array<{ line: string; explanation: string }>;
  conceptLearned?: string;
  outputSimulation?: string;
  tips?: string[];
}

export async function sendChatMessage(
  messages: Array<{ role: "user" | "assistant"; content: string }>,
  language: AppLanguage = "om",
  mode: ChatMode = "standard"
): Promise<{ reply: string; fallback?: boolean }> {
  try {
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages, language, mode }),
    });

    if (!res.ok) {
      throw new Error(`Server returned status ${res.status}`);
    }

    const data = await res.json();
    return data;
  } catch (err: any) {
    console.error("Chat API call failed:", err);
    // Graceful offline/error fallback
    return {
      reply:
        language === "om"
          ? "Nagaa! Rakkoo neetwoorkii ykn sababa biraatiin deebiin yeroof hin milkoofne. Maaloo intarneetii keessan mirkaneessaa irra deebi'aa yaalaa."
          : "Hello! Due to a network or server issue, the response could not be loaded. Please check your connection and try again.",
      fallback: true,
    };
  }
}

export async function translateText(
  text: string,
  sourceLang: AppLanguage,
  targetLang: AppLanguage
): Promise<TranslateApiResponse> {
  try {
    const res = await fetch("/api/translate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, sourceLang, targetLang }),
    });

    if (!res.ok) {
      throw new Error(`Translate API error ${res.status}`);
    }

    const data = await res.json();
    return data;
  } catch (err: any) {
    console.error("Translation API call failed:", err);
    return {
      translatedText:
        targetLang === "om"
          ? `[Hiika]: ${text}`
          : `[Translation]: ${text}`,
      culturalOrGrammarNotes: "Error connecting to live AI translation server.",
    };
  }
}

export async function explainCode(
  code: string,
  language: string,
  targetLanguage: AppLanguage = "om"
): Promise<CodeExplainApiResponse> {
  try {
    const res = await fetch("/api/code-explain", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code, language, targetLanguage }),
    });

    if (!res.ok) {
      throw new Error(`Code Explain API error ${res.status}`);
    }

    return await res.json();
  } catch (err: any) {
    console.error("Code explain API call failed:", err);
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
    };
  }
}

export async function lookupDictionaryTerm(term: string) {
  try {
    const res = await fetch("/api/dictionary", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ term }),
    });

    if (!res.ok) throw new Error("Dictionary lookup failed");
    return await res.json();
  } catch (err) {
    console.error("Dictionary lookup error:", err);
    return null;
  }
}
