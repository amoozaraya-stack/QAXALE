export type AppLanguage = "om" | "en";

export type NavTab = "home" | "chat" | "interpret" | "learn" | "translate" | "code" | "tools" | "profile";

export type ChatMode =
  | "standard"
  | "step-by-step"
  | "summary"
  | "brainstorm"
  | "code-explain"
  | "interpret-layers"
  | "feynman"
  | "agency-loop"
  | "socratic"
  | "first-principles"
  | "project-creation";

export interface RepresentationLayer {
  id: string;
  name: {
    om: string;
    en: string;
  };
  description: {
    om: string;
    en: string;
  };
  content?: string;
}

export interface ChatAttachment {
  name: string;
  type: string; // "image" | "text" | "pdf" | "code" | "file"
  size: number;
  dataUrl?: string; // base64 preview or content
  textSnippet?: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: number;
  mode?: ChatMode;
  attachments?: ChatAttachment[];
  layers?: Record<string, string>;
  agencyStage?: "access" | "interpret" | "understand" | "apply" | "create" | "agency" | "contribute";
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
  conceptualBridge?: string;
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
  complexityLevel?: "accessible" | "foundation" | "intermediate" | "advanced" | "expert";
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
  category: "programming" | "ai" | "cs" | "digital-tech" | "business" | "knowledge" | "reasoning";
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
  category: "AI" | "Programming" | "CS" | "Hardware" | "Internet" | "Data" | "General Tech" | "Reasoning";
  definitionOromo: string;
  definitionEnglish: string;
  exampleSentenceOromo: string;
  exampleSentenceEnglish: string;
  whyItExists?: string;
  relatedTerms?: string[];
}

export interface ProjectBlueprint {
  id: string;
  title: string;
  domain: string;
  problemSolved: string;
  targetAudience: string;
  coreMechanism: string;
  implementationSteps: string[];
  localApplication: string;
}

export interface UserProgress {
  completedLessonIds: string[];
  completedChallengeIds: string[];
  totalXP: number;
  streakDays: number;
  lastActiveDate: string;
  bookmarkedTerms: string[];
  solvedQuizzesCount: number;
  interpretedConceptsCount?: number;
  projectsCreatedCount?: number;
}

export interface HttpTelemetryEvent {
  id: string;
  timestamp: number;
  endpoint: string;
  method: "POST" | "GET";
  status: number;
  durationMs: number;
  requestPayload: Record<string, any>;
  responsePayload: Record<string, any>;
  step: number;
  stageName: string;
  success: boolean;
  error?: string;
}

export interface ArchitecturePlan {
  id: string;
  featureName: string;
  userProvides: string;
  whereItEnters: string;
  whereItTravels: string;
  whatTransformsIt: string;
  whereItIsStored: string;
  whatComesBack: string;
  whatUserSees: string;
  createdAt: number;
}
