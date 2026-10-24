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

export type MemoryCategory =
  | "personalization"
  | "goals"
  | "interests"
  | "projects"
  | "learning"
  | "communication"
  | "facts";

export interface SemanticMemoryItem {
  id: string;
  userId: string;
  category: MemoryCategory;
  content: string;
  confidence: number; // 0.0 to 1.0
  source: "user-stated" | "ai-inferred" | "system" | "manual";
  tags?: string[];
  supersedesId?: string;
  isActive: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface EpisodicMemory {
  id: string;
  userId: string;
  conversationId: string;
  title: string;
  summary: string;
  keyTakeaways: string[];
  topics: string[];
  timestamp: number;
}

export interface ContextPackage {
  workingMemorySnippet: string;
  episodicSummaries: EpisodicMemory[];
  semanticMemories: SemanticMemoryItem[];
  formattedDirective: string;
}

export interface UserMemoryProfile {
  knowledgeLevel: "beginner" | "intermediate" | "advanced";
  focusInterests: string[];
  riskTolerance: "conservative" | "moderate" | "educational-only";
  bankrollLimitPct: number;
  preferredTone: "concise-scientific" | "encouraging-teacher" | "first-principles";
  rememberedFacts: string[];
  updatedAt: number;
  semanticMemories?: SemanticMemoryItem[];
  episodicMemories?: EpisodicMemory[];
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

export type ToolRiskLevel = "low" | "moderate" | "high" | "critical";

export type ToolExecutionStatus =
  | "success"
  | "failure"
  | "timeout"
  | "cancelled"
  | "denied"
  | "partial";

export interface ToolError {
  code: string;
  message: string;
  retryable: boolean;
  details?: Record<string, any>;
}

export interface ToolExecutionMetadata {
  durationMs: number;
  truncated: boolean;
  source?: string;
  timestamp: number;
  fingerprint?: string;
  retriesAttempted?: number;
}

export interface NormalizedToolResult<TData = any> {
  toolName: string;
  callId: string;
  status: ToolExecutionStatus;
  data?: TData;
  error?: ToolError;
  metadata: ToolExecutionMetadata;
}

export interface ToolDefinition<TInput = any, TOutput = any> {
  name: string;
  version: string;
  description: {
    om: string;
    en: string;
  };
  category: "math-probability" | "research-grounding" | "document-data" | "connectors-export" | "system-diagnostics" | "cognitive-memory";
  riskLevel: ToolRiskLevel;
  requiresApproval: boolean;
  supportsCancellation: boolean;
  supportsIdempotency: boolean;
  timeoutMs: number;
  maxRetries: number;
  inputSchema: Record<string, any>;
  outputSchema?: Record<string, any>;
  execute?: (input: TInput, context?: any) => Promise<NormalizedToolResult<TOutput>>;
}

export type AgentExecutionPhase =
  | "RECEIVED"
  | "AUTHENTICATING"
  | "UNDERSTANDING"
  | "PLANNING"
  | "VALIDATING_PLAN"
  | "SELECTING_ACTION"
  | "VALIDATING_ACTION"
  | "AWAITING_APPROVAL"
  | "EXECUTING_TOOL"
  | "VALIDATING_RESULT"
  | "OBSERVING"
  | "EVALUATING_PROGRESS"
  | "REPLAN"
  | "RETRY"
  | "WAITING_FOR_USER"
  | "FINAL_VERIFICATION"
  | "COMPLETED"
  | "FAILED"
  | "CANCELLED"
  | "TIMEOUT";

export interface ExecutionBudget {
  maxToolCalls: number;
  maxDurationMs: number;
  maxReplans: number;
  maxRetriesPerTool: number;
  toolCallsExecuted: number;
  replansExecuted: number;
  startedAt: number;
}

export interface AgentDecision {
  decision:
    | "call_tool"
    | "continue"
    | "replan"
    | "request_user_input"
    | "request_approval"
    | "finish"
    | "abort";
  summary: string;
  selectedTool?: string;
  arguments?: Record<string, any>;
  expectedOutcome?: string;
  reasonCode?: string;
  confidence?: number;
}

export type AutonomousMissionStatus =
  | "idle"
  | "perceiving"
  | "planning"
  | "executing"
  | "critiquing"
  | "completed"
  | "paused"
  | "failed"
  | "awaiting_approval";

export type AutonomousTool =
  | "web_grounding"
  | "monte_carlo"
  | "odds_probability"
  | "afaan_oromoo_bridge"
  | "data_extractor"
  | "document_analyzer"
  | "risk_evaluator"
  | "system_architect"
  | "multi_agent_council"
  | "autonomous_planner"
  | "auto_chain"
  | "proactive_watchdog"
  | "connectors_webhook"
  | "system_diagnostics"
  | "memory_context";

export interface AutonomousStepLog {
  id: string;
  stepIndex: number;
  title: {
    om: string;
    en: string;
  };
  tool: AutonomousTool;
  status: "running" | "success" | "warning" | "error" | "awaiting_approval";
  durationMs: number;
  thoughtReasoning: string;
  inputParameters: Record<string, any>;
  outputSummary: string;
  dataPayload?: any;
  confidenceDelta?: number;
  timestamp: number;
  riskLevel?: ToolRiskLevel;
  fingerprint?: string;
  error?: ToolError;
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
  executionPhase?: AgentExecutionPhase;
  confidenceScore: number;
  steps: AutonomousStepLog[];
  synthesis?: AutonomousMissionSynthesis;
  isWatchdogMission?: boolean;
  budget?: ExecutionBudget;
  pendingApprovalStep?: AutonomousStepLog;
  fingerprints?: string[];
  totalDurationMs?: number;
  createdAt: number;
  completedAt?: number;
}

export interface AuthUserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  isAnonymous: boolean;
  providerId?: string;
}

// ============================================================================
// QAXALE Cognitive Architecture: Planning, Reflection & Multi-Agent Types
// ============================================================================

export type AgentRole =
  | "orchestrator"
  | "planner"
  | "executor"
  | "critic"
  | "researcher";

export type TaskCategory =
  | "conversational"
  | "single_tool"
  | "multi_step"
  | "research_intensive"
  | "document_analysis"
  | "consequential_action"
  | "ambiguous";

export type ExecutionStrategy =
  | "direct"
  | "lightweight"
  | "hierarchical";

export type PlanStepStatus =
  | "pending"
  | "ready"
  | "running"
  | "completed"
  | "failed"
  | "blocked"
  | "skipped";

export interface PlanStep {
  id: string;
  stepIndex: number;
  objective: string;
  dependencies: string[];
  requiredCapabilities: string[];
  assignedAgent: AgentRole;
  expectedOutput: string;
  completionCriteria: string[];
  riskLevel: ToolRiskLevel;
  requiresApproval: boolean;
  status: PlanStepStatus;
  outputSummary?: string;
  outputData?: any;
  error?: string;
  evidenceReferences?: string[];
  durationMs?: number;
}

export interface ExecutionPlan {
  id: string;
  version: number;
  taskId: string;
  objective: string;
  strategy: ExecutionStrategy;
  successCriteria: string[];
  steps: PlanStep[];
  createdAt: number;
  updatedAt: number;
  status:
    | "draft"
    | "approved"
    | "executing"
    | "replanning"
    | "completed"
    | "failed"
    | "cancelled";
}

export type CritiqueSeverity = "info" | "minor" | "major" | "critical";

export type CritiqueCategory =
  | "factual"
  | "logical"
  | "completeness"
  | "evidence"
  | "consistency"
  | "instruction"
  | "safety"
  | "formatting";

export interface CritiqueFinding {
  id: string;
  category: CritiqueCategory;
  severity: CritiqueSeverity;
  description: string;
  affectedStepIds: string[];
  evidenceReferences: string[];
  recommendedAction:
    | "accept"
    | "correct"
    | "research"
    | "replan"
    | "request_input"
    | "abort";
  isResolved?: boolean;
}

export interface CritiqueReport {
  id: string;
  status: "pass" | "needs_revision" | "blocked";
  overallQualityScore: number; // 0 - 100
  evaluatedAt: number;
  findings: CritiqueFinding[];
  unresolvedUncertainties: string[];
  requiredCorrections: string[];
  dimensionScores: {
    correctness: number;
    completeness: number;
    evidence: number;
    consistency: number;
    instructionCompliance: number;
    contextRelevance: number;
    safety: number;
  };
}

export interface SelfCorrectionRecord {
  id: string;
  iteration: number;
  targetFindingId: string;
  targetStepId: string;
  defectDescription: string;
  appliedCorrection: string;
  revalidationPassed: boolean;
  evidenceProvenance: string[];
  timestamp: number;
}

export interface AgentHandoff<TPayload = any> {
  handoffId: string;
  executionId: string;
  taskId: string;
  fromRole: AgentRole;
  toRole: AgentRole;
  payload: TPayload;
  expectedOutputSchema: string;
  constraints: string[];
  createdAt: number;
}

export interface CognitiveExecutionBudget {
  maxToolCalls: number;
  maxReplans: number;
  maxCritiquePasses: number;
  maxCorrectionAttempts: number;
  maxDurationMs: number;
  toolCallsExecuted: number;
  replansExecuted: number;
  critiquePassesExecuted: number;
  correctionsExecuted: number;
  startedAt: number;
}

export interface SharedTaskState {
  executionId: string;
  ownerUid: string;
  objective: string;
  category: TaskCategory;
  strategy: ExecutionStrategy;
  plan: ExecutionPlan;
  evidenceStore: Array<{
    id: string;
    source: string;
    title: string;
    snippet: string;
    verified: boolean;
    timestamp: number;
  }>;
  critiqueReports: CritiqueReport[];
  correctionHistory: SelfCorrectionRecord[];
  budget: CognitiveExecutionBudget;
  phase: AgentExecutionPhase;
  status: "running" | "completed" | "failed" | "awaiting_approval" | "cancelled";
  finalAnswer?: {
    summary: string;
    verifiedClaims: string[];
    caveatsAndLimitations: string[];
    directives: Array<{ title: string; priority: "high" | "medium" | "low" }>;
  };
}


