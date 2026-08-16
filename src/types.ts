export type AppLanguage = "om" | "en";

export type NavTab = "home" | "chat" | "learn" | "translate" | "code" | "profile";

export type ChatMode = "standard" | "step-by-step" | "summary" | "brainstorm" | "code-explain";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: number;
  mode?: ChatMode;
}

export interface Conversation {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: number;
  updatedAt: number;
  language: AppLanguage;
}

export interface TranslationHistoryItem {
  id: string;
  sourceText: string;
  translatedText: string;
  sourceLang: AppLanguage;
  targetLang: AppLanguage;
  timestamp: number;
  keyVocabulary?: Array<{ term: string; meaning: string; partOfSpeech?: string }>;
  culturalOrGrammarNotes?: string;
}

export interface QuizQuestion {
  id: string;
  question: {
    om: string;
    en: string;
  };
  options: {
    om: string[];
    en: string[];
  };
  correctIndex: number;
  explanation: {
    om: string;
    en: string;
  };
}

export interface Lesson {
  id: string;
  title: {
    om: string;
    en: string;
  };
  durationMin: number;
  summary: {
    om: string;
    en: string;
  };
  content: {
    om: string;
    en: string;
  };
  keyTakeaways: {
    om: string[];
    en: string[];
  };
  quiz?: QuizQuestion[];
  codeExample?: {
    language: string;
    code: string;
    explanation: {
      om: string;
      en: string;
    };
  };
}

export interface Course {
  id: string;
  title: {
    om: string;
    en: string;
  };
  description: {
    om: string;
    en: string;
  };
  category: "programming" | "ai" | "cs" | "digital-tech" | "business" | "knowledge";
  iconName: string;
  color: string;
  level: "Beginner / Jalqabaa" | "Intermediate / Giddu-galeessa" | "Advanced / Olaanaa";
  lessons: Lesson[];
}

export interface CodeChallenge {
  id: string;
  title: {
    om: string;
    en: string;
  };
  language: "python" | "javascript" | "html";
  difficulty: "Salphaa (Easy)" | "Giddu-galeessa (Medium)" | "Cimaa (Hard)";
  description: {
    om: string;
    en: string;
  };
  starterCode: string;
  solutionCode: string;
  expectedOutput: string;
  explanation: {
    om: string;
    en: string;
  };
  conceptTag: string;
}

export interface DictionaryEntry {
  id: string;
  termOromo: string;
  termEnglish: string;
  category: "AI" | "Programming" | "CS" | "Hardware" | "Internet" | "Data" | "General Tech";
  definitionOromo: string;
  definitionEnglish: string;
  exampleSentenceOromo: string;
  exampleSentenceEnglish: string;
}

export interface UserProgress {
  completedLessonIds: string[];
  completedChallengeIds: string[];
  totalXP: number;
  streakDays: number;
  lastActiveDate: string;
  bookmarkedTerms: string[];
  solvedQuizzesCount: number;
}
