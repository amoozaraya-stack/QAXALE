export type AppLanguage = "om" | "en";

export type NavTab = "home" | "autonomous" | "chat" | "interpret" | "learn" | "translate" | "code" | "tools" | "profile";

export type ResponseBrevity = "concise" | "balanced" | "in-depth";

export type ChatMode =
  | "standard"
  | "concise"
  | "step-by-step"
  | "summary"
  | "brainstorm"
  | "code-explain"
  | "interpret-layers"
  | "feynman"
  | "agency-loop"
  | "socratic"
  | "first-principles"
  | "project-creation"
  | "clarify"
  | "describe";

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
  brevity?: ResponseBrevity;
  autonomousToolsUsed?: string[];
  attachments?: ChatAttachment[];
  layers?: Record<string, string>;
  agencyStage?: "access" | "interpret" | "understand" | "apply" | "create" | "agency" | "contribute";
  isFallback?: boolean;
  isError?: boolean;
  isClarification?: boolean;
  clarificationLevel?: number;
  description?: string;
  example?: string;
  clarification?: string;
  activeExpansion?: "clarify" | "describe" | "example" | null;
}

export interface UserMemoryProfile {
  knowledgeLevel: "beginner" | "intermediate" | "advanced";
  focusInterests: string[];
  riskTolerance: "conservative" | "moderate" | "educational-only";
  bankrollLimitPct: number;
  preferredTone: "concise-scientific" | "encouraging-teacher" | "first-principles";
  rememberedFacts: string[];
  updatedAt: number;
}

export interface Conversation {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: number;
  updatedAt: number;
  language: AppLanguage;
  summary?: string;
  keyTakeaways?: string[];
  lastSummarizedIndex?: number;
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

export type AutonomousMissionStatus =
  | "idle"
  | "perceiving"
  | "planning"
  | "executing"
  | "critiquing"
  | "completed"
  | "paused"
  | "failed";

export type AutonomousTool =
  | "web_grounding"
  | "monte_carlo"
  | "afaan_oromoo_bridge"
  | "data_extractor"
  | "risk_evaluator"
  | "system_architect"
  | "multi_agent_council"
  | "autonomous_planner"
  | "auto_chain"
  | "proactive_watchdog";

export interface AutonomousStepLog {
  id: string;
  stepIndex: number;
  title: {
    om: string;
    en: string;
  };
  tool: AutonomousTool;
  status: "running" | "success" | "warning" | "error";
  durationMs: number;
  thoughtReasoning: string;
  inputParameters: Record<string, any>;
  outputSummary: string;
  dataPayload?: any;
  confidenceDelta?: number;
  timestamp: number;
}

export interface CouncilAgentVerdict {
  name: string;
  role: string;
  verdict: string;
  alignment: number; // 0 - 100
}

export interface TriadConsensus {
  consensusScore: number;
  councilRecommendation: string;
  agents: CouncilAgentVerdict[];
}

export interface SuggestedNextMission {
  title: string;
  domain: AutonomousDomain;
  objective: string;
  rationale: string;
}

export interface AutonomousMissionSynthesis {
  executiveSummary: {
    om: string;
    en: string;
  };
  confidenceRating: number; // 0 - 100
  knownFacts: string[];
  verifiedData: string[];
  probabilisticEstimates: string[];
  identifiedUncertainties: string[];
  actionableDirectives: Array<{
    title: string;
    desc: string;
    priority: "high" | "medium" | "low";
  }>;
  terminologyBridge: Array<{
    termOm: string;
    termEn: string;
    phonetic: string;
    explanation: string;
  }>;
  riskGuardrails: string[];
  exportableMarkdown: string;
  triadConsensus?: TriadConsensus;
  suggestedNextMissions?: SuggestedNextMission[];
}

export type AutonomousDomain = "knowledge" | "applied-science" | "tech" | "decision-science" | "sports" | "custom";

export interface AutonomousMission {
  id: string;
  userId: string;
  title: string;
  goal: string;
  domain: AutonomousDomain;
  autonomyMode: "full" | "human-in-the-loop";
  status: AutonomousMissionStatus;
  confidenceScore: number;
  steps: AutonomousStepLog[];
  synthesis?: AutonomousMissionSynthesis;
  isWatchdogMission?: boolean;
  createdAt: number;
  completedAt?: number;
}

