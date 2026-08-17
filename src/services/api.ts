import { AppLanguage, ChatMode } from "../types";

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

export async function sendChatMessage(
  messages: Array<{ role: "user" | "assistant"; content: string }>,
  language: AppLanguage = "om",
  mode: ChatMode = "standard"
): Promise<{ reply: string; fallback?: boolean }> {
  try {
    const payload = { messages, language, mode };

    const response = await fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

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
      throw new Error(errorMessage);
    }

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
  try {
    const payload = {
      text,
      sourceLanguage: sourceLang,
      targetLanguage: targetLang,
      sourceLang,
      targetLang,
    };

    const response = await fetch("/api/translate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

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
      throw new Error(errorMessage);
    }

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
  try {
    const payload = { code, language, targetLanguage };

    const response = await fetch("/api/code-explain", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

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
      throw new Error(errorMessage);
    }

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
  try {
    const payload = { word: term, term };

    const response = await fetch("/api/dictionary", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

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
      throw new Error(errorMessage);
    }

    return data;
  } catch (err: any) {
    console.error("Dictionary lookup error:", err?.message || err);
    return null;
  }
}
