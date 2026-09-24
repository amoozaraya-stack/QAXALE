import React, { createContext, useContext, useEffect, useState, useRef } from "react";
import confetti from "canvas-confetti";
import {
  AppLanguage,
  NavTab,
  Conversation,
  ChatMessage,
  TranslationHistoryItem,
  UserProgress,
  ArchitecturePlan,
  AutonomousMission,
  AutonomousDomain,
  AutonomousStepLog,
  UserMemoryProfile,
} from "../types";
import {
  syncUserProgressToFirestore,
  loadUserProgressFromFirestore,
  saveConversationToFirestore,
  loadConversationsFromFirestore,
  deleteConversationFromFirestore,
  saveAutonomousMissionToFirestore,
  loadAutonomousMissionsFromFirestore,
  deleteAutonomousMissionFromFirestore,
} from "../services/firestoreSync";
import { summarizeConversation } from "../services/api";

interface AppContextType {
  language: AppLanguage;
  setLanguage: (lang: AppLanguage) => void;
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  conversations: Conversation[];
  activeConversationId: string | null;
  setActiveConversationId: (id: string | null) => void;
  createConversation: (title?: string) => string;
  addMessageToActiveConversation: (message: Omit<ChatMessage, "id" | "timestamp">) => void;
  updateMessageInActiveConversation: (messageId: string, updates: Partial<ChatMessage>) => void;
  deleteConversation: (id: string) => void;
  translationHistory: TranslationHistoryItem[];
  addTranslationToHistory: (item: Omit<TranslationHistoryItem, "id" | "timestamp">) => void;
  clearTranslationHistory: () => void;
  progress: UserProgress;
  completeLesson: (lessonId: string, xp?: number) => void;
  completeChallenge: (challengeId: string, xp?: number) => void;
  toggleBookmark: (termId: string) => void;
  triggerConfetti: () => void;
  showDictionaryModal: boolean;
  setShowDictionaryModal: (show: boolean) => void;
  showInstallModal: boolean;
  setShowInstallModal: (show: boolean) => void;
  showDataFlowModal: boolean;
  setShowDataFlowModal: (show: boolean) => void;
  architecturePlans: ArchitecturePlan[];
  addArchitecturePlan: (plan: Omit<ArchitecturePlan, "id" | "createdAt">) => void;
  deleteArchitecturePlan: (id: string) => void;
  deferredPrompt: any;
  handleInstallApp: () => Promise<void>;
  isAppInstalled: boolean;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  isFirestoreSynced: boolean;
  // User Profile & Cognitive Memory
  userMemory: UserMemoryProfile;
  updateUserMemory: (updates: Partial<UserMemoryProfile>) => void;
  addRememberedFact: (fact: string) => void;
  removeRememberedFact: (index: number) => void;
  clearRememberedFacts: () => void;
  summarizeActiveConversation: () => Promise<string | null>;
  updateConversationSummary: (convId: string, summary: string, keyTakeaways?: string[]) => void;
  // Autonomous Agent Platform
  autonomousMissions: AutonomousMission[];
  activeMission: AutonomousMission | null;
  setActiveMission: (mission: AutonomousMission | null) => void;
  isAgentRunning: boolean;
  agentStatusText: string;
  executeAutonomousMission: (params: {
    objective: string;
    domain?: AutonomousDomain;
    autonomyMode?: "full" | "human-in-the-loop";
  }) => Promise<AutonomousMission | null>;
  abortAutonomousMission: () => void;
  deleteAutonomousMission: (id: string) => Promise<void>;
}

const DEFAULT_USER_MEMORY: UserMemoryProfile = {
  knowledgeLevel: "intermediate",
  focusInterests: [
    "Sports Odds & Probability",
    "STEM & Computing",
    "Responsible Decision Theory",
    "Afaan Oromoo Linguistics",
  ],
  riskTolerance: "conservative",
  bankrollLimitPct: 2.0,
  preferredTone: "concise-scientific",
  rememberedFacts: [
    "Applies Half-Kelly capital allocation (max 1-2.5% stake) to prevent ruin",
    "Prefers modern Afaan Oromoo explanations with English technical terms in parentheses",
    "Emphasizes that probability is never certainty and forbids chasing losses",
  ],
  updatedAt: Date.now(),
};

const DEFAULT_PROGRESS: UserProgress = {
  completedLessonIds: ["les-prog-1"],
  completedChallengeIds: [],
  totalXP: 140,
  streakDays: 4,
  lastActiveDate: new Date().toISOString().split("T")[0],
  bookmarkedTerms: ["dict-1", "dict-2", "dict-4"],
  solvedQuizzesCount: 3,
};

const AppContext = createContext<AppContextType | undefined>(undefined);

const INITIAL_CONVERSATION: Conversation = {
  id: "conv-welcome",
  title: "Simannaa Qaxale AI",
  createdAt: Date.now() - 3600000,
  updatedAt: Date.now() - 3600000,
  language: "om",
  messages: [
    {
      id: "msg-welcome-1",
      role: "assistant",
      content: `Akkam jirtu! Ani **QAXALE** (Qaxalee) dha — Gargaaraa fi Barsiisaa keessan kan Hubannoo Nam-tolchee (AI), Saganteessuu fi Teeknolojii Dijitaalaa Afaan Oromootiin.

Afaan Oromoo ykn Ingiliffaan waan barbaaddan na gaafachuu dandeessu:
- 💡 **Barnoota**: "Koodingii akkamittiin jalqaba?"
- 🤖 **AI**: "Hubannoon Nam-tolchee akkamitti hojjeta?"
- 💻 **Saganteessuu**: "Python keessatti 'for loop' maali?"
- 🌐 **Hiika**: Jechoota teeknolojii fi barruu hiikuu

Maal irraa jalqabnu har'a?`,
      timestamp: Date.now() - 3600000,
    },
  ],
};

const INITIAL_AUTONOMOUS_MISSION: AutonomousMission = {
  id: "mission-init-knowledge-simplification",
  userId: "local-user",
  title: "Transformer Neural Networks: World Knowledge Deconstructed for Local Learners",
  goal: "Deconstruct the foundational mathematical mechanics of Transformer self-attention into intuitive first-principles Afaan Oromoo cognitive models with verified empirical citations and practical code for local learners.",
  domain: "knowledge",
  autonomyMode: "full",
  status: "completed",
  confidenceScore: 96,
  createdAt: Date.now() - 3600000,
  completedAt: Date.now() - 3550000,
  steps: [
    {
      id: "step-init-1",
      stepIndex: 1,
      title: { om: "Hubannoo & Qoodiinsa Kaayyoo Beekumsaa", en: "Knowledge Perception & First-Principles Decomposition" },
      tool: "system_architect",
      status: "success",
      durationMs: 420,
      thoughtReasoning: "Deconstructed seminal research (Vaswani et al., 2017) into 4 core cognitive foundations: Query-Key-Value vector dot products, Softmax probability distribution, scaled matrix scaling (1/√d_k), and multi-head parallel representations.",
      inputParameters: { domain: "knowledge", targetAudience: "Major Local Learners & Students", paper: "Attention Is All You Need" },
      outputSummary: "Deconstructed abstract tensor equations into tangible everyday mental models and discrete logical components.",
      timestamp: Date.now() - 3600000,
    },
    {
      id: "step-init-2",
      stepIndex: 2,
      title: { om: "Qorannoo Ragaa Qabatamaa & Saayinsii", en: "Empirical World Knowledge & Research Grounding" },
      tool: "web_grounding",
      status: "success",
      durationMs: 890,
      thoughtReasoning: "Retrieved verified foundational benchmarks from NeurIPS, Google Research, and Stanford CS224N regarding quadratic time complexity O(N^2) and scaling laws.",
      inputParameters: { query: "Transformer scaled dot-product attention mechanics Vaswani et al arxiv 1706.03762" },
      outputSummary: "Verified seminal citations, dimensional parameters (d_model=512, h=8 heads), and proven computational mechanics.",
      timestamp: Date.now() - 3590000,
    },
    {
      id: "step-init-3",
      stepIndex: 3,
      title: { om: "Siimuleeshinii Lakkoofsaa fi Vektaraa (Matrix Sim)", en: "Mathematical Tensor & Dot-Product Simulation" },
      tool: "monte_carlo",
      status: "success",
      durationMs: 610,
      thoughtReasoning: "Executed 10,000 synthetic vector alignment passes to demonstrate how Query-Key inner product computes semantic similarity scores before softmax normalization.",
      inputParameters: { trials: 10000, dimensionDk: 64, temperatureScale: 8 },
      outputSummary: "Proved scaling factor 1/√64 prevents softmax vanishing gradient. Numerically stable attention weights generated.",
      dataPayload: {
        trials: 10000,
        scalingFactor: 0.125,
        vectorDimension: 64,
        softmaxEntropy: 2.14,
        computationalEfficiencyGain: "8x parallel heads",
      },
      timestamp: Date.now() - 3580000,
    },
    {
      id: "step-init-4",
      stepIndex: 4,
      title: { om: "Ijaarsa Jechoota Teeknikaa Afaan Oromoo", en: "Afaan Oromoo Terminology & Cognitive Bridge" },
      tool: "afaan_oromoo_bridge",
      status: "success",
      durationMs: 510,
      thoughtReasoning: "Constructed precise, natural Afaan Oromoo terminology so local learners understand self-attention instinctively without rote English memorization.",
      inputParameters: { concepts: ["Self-Attention", "Dot-Product Similarity", "Positional Encoding"] },
      outputSummary: "Synthesized 'Xiyyeeffannoo Qaxale (Self-Attention)', 'Madallii Vektaraa (Dot-Product Alignment)', and 'Qoodiinsa Qubeeffannoo (Positional Encoding)'.",
      timestamp: Date.now() - 3570000,
    },
    {
      id: "step-init-5",
      stepIndex: 5,
      title: { om: "Qorannoo Of-Duubaa & Qulqullina Hubannoo", en: "Adversarial Epistemic Audit & Local Pedagogy" },
      tool: "risk_evaluator",
      status: "success",
      durationMs: 740,
      thoughtReasoning: "Audited explanations against jargon overload: Ensured students can implement the core Attention equation in 10 lines of pure Python without external dependencies.",
      inputParameters: { criteria: "Zero AI Slop, First-Principles Pedagogical Clarity, Verified Code" },
      outputSummary: "Passed pedagogical audit: Zero hand-waving. Provided pure mathematical derivation with clear local analogies.",
      timestamp: Date.now() - 3560000,
    },
  ],
  synthesis: {
    executiveSummary: {
      om: "QAXALE V3 beekumsa addunyaa olaanaa kan caasaa 'Transformer Neural Networks' qoratee, barattoota fi ogeeyyii naannoof karaa salphaa fi ifa ta'een dhiyeesseera. Bu'uurri 'Self-Attention' akkuma nama dubbisaa jiru tokkoo jecha tokko hubachuuf jechoota birootti xiyyeeffannoo kennuuti. Herregni isaa Vektara Gaaffii (Query), Furtuu (Key), fi Gatii (Value) walitti baay'isuun Softmax fayyadama.",
      en: "QAXALE V3 deconstructed seminal world knowledge on Transformer Neural Networks into intuitive, accessible first-principles models for major local learners. Self-Attention operates like a focused reader weighing surrounding context words to interpret meaning. The mathematical mechanism computes scaled dot products between Query, Key, and Value tensors normalized through Softmax.",
    },
    confidenceRating: 96,
    knownFacts: [
      "Waraqaan qorannoo bu'uuraa 'Attention Is All You Need' bara 2017 Google Research fi Toronto University'n maxxanfame.",
      "Transformer caasaa duraanii kan akka RNN fi LSTM caalaa koodii hedduu walduraa duubaan osoo hin taane wal-bira qabee (parallel) saffisaan leenjisa.",
    ],
    verifiedData: [
      "Vektara diimeshinii d_k=64 ta'e keessatti 1/√64 = 0.125 fayyadamuun gradient hir'achuu (vanishing gradient) dhowwa.",
      "Multi-Head Attention (mataa 8) walqixxummaa fi xiyyeeffannoo bakka adda addaa akka wal-bira qabee ilaalu taasisa.",
    ],
    probabilisticEstimates: [
      "Barattoonni bu'uura herregaa kana hubatan koodingii fi leenjii AI keessatti dandeettii isaanii dhibbeentaa 70% oliin dabalu.",
      "Caasaan kun teeknolojii LLM ammayyaa hundaaf bu'uura hundee ta'ee itti fufa.",
    ],
    identifiedUncertainties: [
      "Baasii fi dandeettii kompiitaraa guddaa (Hardware GPU constraints for full training in local environments).",
      "Walxaxiinsa baay'ina jechootaa dheeraa irratti herregni O(N^2) saffisa hir'isuu danda'a.",
    ],
    actionableDirectives: [
      {
        title: "Master the Q-K-V Mental Model",
        desc: "Query = What I am searching for; Key = The index label of each token; Value = The actual informational content.",
        priority: "high",
      },
      {
        title: "Write Pure Python Attention",
        desc: "Implement softmax(Q @ K.T / sqrt(d_k)) @ V using basic NumPy to solidify physical and mathematical understanding.",
        priority: "high",
      },
      {
        title: "Build Local Language Applications",
        desc: "Apply this understanding to fine-tune lightweight multilingual models on Afaan Oromoo literature.",
        priority: "medium",
      },
    ],
    terminologyBridge: [
      {
        termOm: "Xiyyeeffannoo Qaxale (Self-Attention)",
        termEn: "Self-Attention Mechanism",
        phonetic: "self ah-TEN-shun",
        explanation: "Malli tokko ergaa jecha tokkoo hubachuuf jechoota biroo hima sana keessa jiraniif gatii xiyyeeffannoo kennuu.",
      },
      {
        termOm: "Madallii Vektaraa (Dot Product)",
        termEn: "Dot-Product Alignment",
        phonetic: "DOT PROD-ukt",
        explanation: "Herrega vektaroota lama walitti baay'isuun hagam akka wal-fakkaatan fi walitti hidhata qaban safaru.",
      },
      {
        termOm: "Qoodiinsa Qubeeffannoo (Positional Encoding)",
        termEn: "Positional Encoding",
        phonetic: "poh-ZISH-un-al en-KOH-ding",
        explanation: "Jechi kam jalqaba, kam gidduu fi kam dhuma akka dhufe kompiitaraaf herregaan ibsuu.",
      },
    ],
    riskGuardrails: [
      "Yaada bu'uuraa (First-Principles) osoo hin hubatin koodii AI callisanii garagalchuun (copy-pasting) hubannoo hin fidu.",
      "Teeknolojii addunyaa kanatti fayyadamuun rakkoolee qabatamaa naannoo keenyaa furuuf ooluu qaba.",
      "Hubannoon dhugaa qorannoo fi shaakala irraa madda malee tilmaama lafaa ka'ee miti.",
    ],
    exportableMarkdown: "# QAXALE Autonomous Mission Report: Deconstructing Transformer Neural Networks for Local Learners",
    triadConsensus: {
      consensusScore: 96,
      councilRecommendation: "Deploy foundational self-attention mental model directly into the curriculum for local STEM learners.",
      agents: [
        {
          name: "Epistemic Educator",
          role: "Pedagogy & Knowledge Simplification",
          verdict: "Deconstruction breaks down complex academic tensor equations into intuitive first-principles models.",
          alignment: 98,
        },
        {
          name: "Mathematical Actuary",
          role: "Matrix Rigor & Computational Verification",
          verdict: "Vector scaling 1/√d_k verified against vanishing gradient instability; simulation confirmed.",
          alignment: 95,
        },
        {
          name: "Local Capability Catalyst",
          role: "Application to Local Reality & Youth Empowerment",
          verdict: "Afaan Oromoo technical bridge unlocks deep comprehension for Ethiopian and African students.",
          alignment: 96,
        },
      ],
    },
    suggestedNextMissions: [
      {
        title: "Quantum Entanglement & Superposition Simplified",
        domain: "knowledge",
        objective: "Deconstruct quantum physics principles into first-principles models for high school and university students.",
        rationale: "Broadens local scientific literacy in next-generation physics and quantum computing.",
      },
      {
        title: "Modern Macroeconomics: Monetary Systems & Inflation",
        domain: "knowledge",
        objective: "Explain central banking, fiat currency mechanics, and currency inflation for everyday economic agency.",
        rationale: "Empowers local entrepreneurs and thinkers with financial and economic sovereignty.",
      },
    ],
  },
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<AppLanguage>(() => {
    const saved = localStorage.getItem("qaxale_lang");
    return (saved === "en" ? "en" : "om") as AppLanguage;
  });

  const [activeTab, setActiveTab] = useState<NavTab>("home");
  const [showDictionaryModal, setShowDictionaryModal] = useState(false);
  const [showInstallModal, setShowInstallModal] = useState(false);
  const [showDataFlowModal, setShowDataFlowModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isAppInstalled, setIsAppInstalled] = useState(false);
  const [isFirestoreSynced, setIsFirestoreSynced] = useState(false);
  const initialLoadRef = useRef(false);

  const [architecturePlans, setArchitecturePlans] = useState<ArchitecturePlan[]>(() => {
    const saved = localStorage.getItem("qaxale_arch_plans");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return [
      {
        id: "plan-sample-1",
        featureName: "Afaan Oromoo Agricultural Market Price Advisor",
        userProvides: "Crop name (e.g. 'Bishingaa/Boqqolloo'), location ('Ambo/Jimma')",
        whereItEnters: "Mobile React Input form in QAXALE App",
        whereItTravels: "Frontend -> HTTP POST /api/chat -> Cloudflare Worker Control Center -> Gemini 3.7",
        whatTransformsIt: "Worker attaches secret API key, sanitizes input, Gemini reasons over local yield data",
        whereItIsStored: "Local state for instant cache, cloud database for history",
        whatComesBack: "JSON with market price estimate, buyer contacts, storage tips",
        whatUserSees: "High-contrast breakdown card with actionable selling steps",
        createdAt: Date.now() - 172800000,
      },
    ];
  });

  useEffect(() => {
    localStorage.setItem("qaxale_arch_plans", JSON.stringify(architecturePlans));
  }, [architecturePlans]);

  const addArchitecturePlan = (planData: Omit<ArchitecturePlan, "id" | "createdAt">) => {
    const newPlan: ArchitecturePlan = {
      ...planData,
      id: `arch-${Date.now()}`,
      createdAt: Date.now(),
    };
    setArchitecturePlans((prev) => [newPlan, ...prev]);
    triggerConfetti();
  };

  const deleteArchitecturePlan = (id: string) => {
    setArchitecturePlans((prev) => prev.filter((p) => p.id !== id));
  };

  useEffect(() => {
    // Check if running in standalone PWA mode
    if (
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone === true
    ) {
      setIsAppInstalled(true);
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    const handleAppInstalled = () => {
      setIsAppInstalled(true);
      setDeferredPrompt(null);
      setShowInstallModal(false);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const handleInstallApp = async () => {
    if (deferredPrompt) {
      try {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === "accepted") {
          setIsAppInstalled(true);
          setShowInstallModal(false);
        }
        setDeferredPrompt(null);
      } catch (err) {
        console.error("Install prompt error:", err);
      }
    } else {
      setShowInstallModal(true);
    }
  };

  const [conversations, setConversations] = useState<Conversation[]>(() => {
    const saved = localStorage.getItem("qaxale_conversations");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {
        console.error(e);
      }
    }
    return [INITIAL_CONVERSATION];
  });

  const [activeConversationId, setActiveConversationId] = useState<string | null>(
    () => conversations[0]?.id || "conv-welcome"
  );

  const [translationHistory, setTranslationHistory] = useState<TranslationHistoryItem[]>(() => {
    const saved = localStorage.getItem("qaxale_translations");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return [
      {
        id: "tr-sample-1",
        sourceText: "Artificial intelligence is changing the future of African youth.",
        translatedText: "Hubannoon nam-tolchee (AI) fuuldura dargaggoota Afrikaa jijjiiraa jira.",
        sourceLang: "en",
        targetLang: "om",
        timestamp: Date.now() - 86400000,
        culturalOrGrammarNotes: "Jechi 'Hubannoo nam-tolchee' jecha AI bakka bu'u kan Afaan Oromoo uumamaati.",
      },
    ];
  });

  const [progress, setProgress] = useState<UserProgress>(() => {
    const saved = localStorage.getItem("qaxale_progress");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return DEFAULT_PROGRESS;
  });

  const [userMemory, setUserMemory] = useState<UserMemoryProfile>(() => {
    const saved = localStorage.getItem("qaxale_user_memory");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === "object") {
          return {
            ...DEFAULT_USER_MEMORY,
            ...parsed,
          };
        }
      } catch (e) {
        console.error(e);
      }
    }
    return DEFAULT_USER_MEMORY;
  });

  useEffect(() => {
    localStorage.setItem("qaxale_user_memory", JSON.stringify(userMemory));
  }, [userMemory]);

  const [autonomousMissions, setAutonomousMissions] = useState<AutonomousMission[]>(() => {
    const saved = localStorage.getItem("qaxale_autonomous_missions");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {
        console.error(e);
      }
    }
    return [INITIAL_AUTONOMOUS_MISSION];
  });

  const [activeMission, setActiveMission] = useState<AutonomousMission | null>(
    () => autonomousMissions[0] || INITIAL_AUTONOMOUS_MISSION
  );
  const [isAgentRunning, setIsAgentRunning] = useState(false);
  const [agentStatusText, setAgentStatusText] = useState("");

  useEffect(() => {
    localStorage.setItem("qaxale_autonomous_missions", JSON.stringify(autonomousMissions));
  }, [autonomousMissions]);

  // Initial Firestore Cloud Hydration
  useEffect(() => {
    if (initialLoadRef.current) return;
    initialLoadRef.current = true;

    async function hydrateFromFirestore() {
      try {
        const [cloudProgress, cloudConvs, cloudMissions] = await Promise.all([
          loadUserProgressFromFirestore(),
          loadConversationsFromFirestore(),
          loadAutonomousMissionsFromFirestore(),
        ]);

        if (cloudProgress) {
          if (cloudProgress.progress) {
            setProgress((prev) => ({
              ...prev,
              ...cloudProgress.progress,
              totalXP: Math.max(prev.totalXP, cloudProgress.progress.totalXP || 0),
              streakDays: Math.max(prev.streakDays, cloudProgress.progress.streakDays || 1),
              completedLessonIds: Array.from(
                new Set([...prev.completedLessonIds, ...(cloudProgress.progress.completedLessonIds || [])])
              ),
              completedChallengeIds: Array.from(
                new Set([...prev.completedChallengeIds, ...(cloudProgress.progress.completedChallengeIds || [])])
              ),
              bookmarkedTerms: Array.from(
                new Set([...prev.bookmarkedTerms, ...(cloudProgress.progress.bookmarkedTerms || [])])
              ),
            }));
          }

          if (cloudProgress.userMemory) {
            setUserMemory((prev) => ({
              ...prev,
              ...cloudProgress.userMemory,
              rememberedFacts: Array.from(
                new Set([...prev.rememberedFacts, ...(cloudProgress.userMemory?.rememberedFacts || [])])
              ),
            }));
          }
        }

        if (cloudConvs && cloudConvs.length > 0) {
          setConversations((localConvs) => {
            const map = new Map<string, Conversation>();
            // Add cloud first
            cloudConvs.forEach((c) => map.set(c.id, c));
            // Merge local on top if newer
            localConvs.forEach((c) => {
              const existing = map.get(c.id);
              if (!existing || c.updatedAt > existing.updatedAt) {
                map.set(c.id, c);
              }
            });
            const merged = Array.from(map.values()).sort((a, b) => b.updatedAt - a.updatedAt);
            return merged.length > 0 ? merged : localConvs;
          });
        }

        if (cloudMissions && cloudMissions.length > 0) {
          setAutonomousMissions((localMissions) => {
            const map = new Map<string, AutonomousMission>();
            cloudMissions.forEach((m) => map.set(m.id, m));
            localMissions.forEach((m) => {
              if (!map.has(m.id)) {
                map.set(m.id, m);
              }
            });
            const merged = Array.from(map.values()).sort((a, b) => b.createdAt - a.createdAt);
            return merged.length > 0 ? merged : localMissions;
          });
        }

        setIsFirestoreSynced(true);
      } catch (err) {
        console.warn("Hydration from Firestore deferred:", err);
      }
    }

    hydrateFromFirestore();
  }, []);

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem("qaxale_lang", language);
  }, [language]);

  useEffect(() => {
    localStorage.setItem("qaxale_conversations", JSON.stringify(conversations));
  }, [conversations]);

  useEffect(() => {
    localStorage.setItem("qaxale_translations", JSON.stringify(translationHistory));
  }, [translationHistory]);

  useEffect(() => {
    localStorage.setItem("qaxale_progress", JSON.stringify(progress));
    // Background sync to Firestore with user memory profile
    syncUserProgressToFirestore(progress, language, userMemory).catch(() => {});
  }, [progress, language, userMemory]);

  const setLanguage = (lang: AppLanguage) => {
    setLanguageState(lang);
  };

  const triggerConfetti = () => {
    try {
      confetti({
        particleCount: 75,
        spread: 60,
        origin: { y: 0.7 },
        colors: ["#E5A93B", "#10B981", "#6366F1", "#EC4899"],
      });
    } catch (e) {
      console.log("Confetti trigger:", e);
    }
  };

  const createConversation = (title?: string): string => {
    const newId = `conv-${Date.now()}`;
    const newTitle =
      title ||
      (language === "om" ? `Waliin-haasaa Haaraa` : `New Conversation`);
    const newConv: Conversation = {
      id: newId,
      title: newTitle,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      language,
      messages: [],
    };
    setConversations((prev) => [newConv, ...prev]);
    setActiveConversationId(newId);
    saveConversationToFirestore(newConv).catch(() => {});
    return newId;
  };

  const addMessageToActiveConversation = (messageData: Omit<ChatMessage, "id" | "timestamp">) => {
    const msg: ChatMessage = {
      ...messageData,
      id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      timestamp: Date.now(),
    };

    setConversations((prev) => {
      let targetId = activeConversationId;
      if (!targetId || !prev.find((c) => c.id === targetId)) {
        // Create if needed
        const newId = `conv-${Date.now()}`;
        const newConv: Conversation = {
          id: newId,
          title: messageData.content.slice(0, 30) || "Waliin-haasaa",
          createdAt: Date.now(),
          updatedAt: Date.now(),
          language,
          messages: [msg],
        };
        setActiveConversationId(newId);
        saveConversationToFirestore(newConv).catch(() => {});
        return [newConv, ...prev];
      }

      const updated = prev.map((conv) => {
        if (conv.id === targetId) {
          const updatedMessages = [...conv.messages, msg];
          let updatedTitle = conv.title;
          if (conv.messages.length === 0 && messageData.role === "user") {
            updatedTitle = messageData.content.slice(0, 35) || conv.title;
          }
          const updatedConv: Conversation = {
            ...conv,
            title: updatedTitle,
            messages: updatedMessages,
            updatedAt: Date.now(),
          };
          saveConversationToFirestore(updatedConv).catch(() => {});
          return updatedConv;
        }
        return conv;
      });

      return updated;
    });
  };

  const deleteConversation = (id: string) => {
    setConversations((prev) => {
      const filtered = prev.filter((c) => c.id !== id);
      if (activeConversationId === id) {
        setActiveConversationId(filtered[0]?.id || null);
      }
      return filtered;
    });
    deleteConversationFromFirestore(id).catch(() => {});
  };

  const updateUserMemory = (updates: Partial<UserMemoryProfile>) => {
    setUserMemory((prev) => {
      const updated = {
        ...prev,
        ...updates,
        updatedAt: Date.now(),
      };
      syncUserProgressToFirestore(progress, language, updated).catch(() => {});
      return updated;
    });
  };

  const addRememberedFact = (fact: string) => {
    if (!fact.trim()) return;
    setUserMemory((prev) => {
      const trimmed = fact.trim();
      if (prev.rememberedFacts.includes(trimmed)) return prev;
      const updated = {
        ...prev,
        rememberedFacts: [trimmed, ...prev.rememberedFacts],
        updatedAt: Date.now(),
      };
      syncUserProgressToFirestore(progress, language, updated).catch(() => {});
      return updated;
    });
  };

  const removeRememberedFact = (index: number) => {
    setUserMemory((prev) => {
      const updated = {
        ...prev,
        rememberedFacts: prev.rememberedFacts.filter((_, i) => i !== index),
        updatedAt: Date.now(),
      };
      syncUserProgressToFirestore(progress, language, updated).catch(() => {});
      return updated;
    });
  };

  const clearRememberedFacts = () => {
    setUserMemory((prev) => {
      const updated = {
        ...prev,
        rememberedFacts: [],
        updatedAt: Date.now(),
      };
      syncUserProgressToFirestore(progress, language, updated).catch(() => {});
      return updated;
    });
  };

  const updateConversationSummary = (convId: string, summary: string, keyTakeaways?: string[]) => {
    setConversations((prev) =>
      prev.map((c) => {
        if (c.id === convId) {
          const updated = { ...c, summary, keyTakeaways, updatedAt: Date.now() };
          saveConversationToFirestore(updated).catch(() => {});
          return updated;
        }
        return c;
      })
    );
  };

  const summarizeActiveConversation = async (): Promise<string | null> => {
    const conv = conversations.find((c) => c.id === activeConversationId);
    if (!conv || conv.messages.length < 2) return null;

    const formattedMessages = conv.messages.map((m) => ({
      role: m.role,
      content: m.content,
    }));

    try {
      const result = await summarizeConversation(formattedMessages, language);
      if (result.summary) {
        updateConversationSummary(conv.id, result.summary, result.keyTakeaways);
        return result.summary;
      }
    } catch (err) {
      console.warn("Failed to summarize active conversation:", err);
    }
    return null;
  };

  const addTranslationToHistory = (item: Omit<TranslationHistoryItem, "id" | "timestamp">) => {
    const newItem: TranslationHistoryItem = {
      ...item,
      id: `tr-${Date.now()}`,
      timestamp: Date.now(),
    };
    setTranslationHistory((prev) => [newItem, ...prev.slice(0, 29)]);
  };

  const clearTranslationHistory = () => {
    setTranslationHistory([]);
  };

  const completeLesson = (lessonId: string, xp = 50) => {
    if (!progress.completedLessonIds.includes(lessonId)) {
      setProgress((prev) => ({
        ...prev,
        completedLessonIds: [...prev.completedLessonIds, lessonId],
        totalXP: prev.totalXP + xp,
        solvedQuizzesCount: prev.solvedQuizzesCount + 1,
      }));
      triggerConfetti();
    }
  };

  const completeChallenge = (challengeId: string, xp = 80) => {
    if (!progress.completedChallengeIds.includes(challengeId)) {
      setProgress((prev) => ({
        ...prev,
        completedChallengeIds: [...prev.completedChallengeIds, challengeId],
        totalXP: prev.totalXP + xp,
      }));
      triggerConfetti();
    }
  };

  const toggleBookmark = (termId: string) => {
    setProgress((prev) => {
      const exists = prev.bookmarkedTerms.includes(termId);
      return {
        ...prev,
        bookmarkedTerms: exists
          ? prev.bookmarkedTerms.filter((id) => id !== termId)
          : [...prev.bookmarkedTerms, termId],
      };
    });
  };

  const abortControllerRef = useRef<AbortController | null>(null);

  const abortAutonomousMission = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsAgentRunning(false);
    setAgentStatusText(
      language === "om"
        ? "Ajentiin otoonoomasii dhaabameera (Disarmed)."
        : "Autonomous mission disarmed & halted."
    );
    setActiveMission((prev) => (prev ? { ...prev, status: "paused" } : prev));
  };

  const executeAutonomousMission = async (params: {
    objective: string;
    domain?: AutonomousDomain;
    autonomyMode?: "full" | "human-in-the-loop";
  }): Promise<AutonomousMission | null> => {
    const { objective, domain = "knowledge", autonomyMode = "full" } = params;
    setIsAgentRunning(true);
    setAgentStatusText(language === "om" ? "Kaayyoo xiinxalaa jira..." : "Decomposing objective...");

    const controller = new AbortController();
    abortControllerRef.current = controller;

    const missionId = `mission_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const newMission: AutonomousMission = {
      id: missionId,
      userId: "local-user",
      title: objective.slice(0, 45),
      goal: objective,
      domain,
      autonomyMode,
      status: "perceiving",
      confidenceScore: 10,
      steps: [
        {
          id: `step-${Date.now()}-1`,
          stepIndex: 1,
          title: {
            om: "Hubannoo & Qoodiinsa Kaayyoo",
            en: "Goal Perception & Task Decomposition",
          },
          tool: "system_architect",
          status: "running",
          durationMs: 0,
          thoughtReasoning: "Initializing cognitive perception loop...",
          inputParameters: { objective, domain },
          outputSummary: "Decomposing goal into operational pipeline...",
          timestamp: Date.now(),
        },
      ],
      createdAt: Date.now(),
    };

    setActiveMission(newMission);
    setAutonomousMissions((prev) => [newMission, ...prev.filter((m) => m.id !== missionId)]);

    try {
      setAgentStatusText(
        language === "om"
          ? "Ragaa qabatamaa & herrega Monte Carlo hojjetaa jira..."
          : "Executing real-time streaming agent pipeline..."
      );

      // Attempt high-speed real-time streaming endpoint first
      let completedMission: AutonomousMission | null = null;
      let streamedAnyEvent = false;

      try {
        const streamResponse = await fetch("/api/autonomous/stream", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          signal: controller.signal,
          body: JSON.stringify({
            missionId,
            objective,
            domain,
            autonomyMode,
            targetLanguage: language,
          }),
        });

        if (streamResponse.ok && streamResponse.body) {
          const reader = streamResponse.body.getReader();
          const decoder = new TextDecoder();
          let buffer = "";

          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            buffer += decoder.decode(value, { stream: true });

            const eventChunks = buffer.split("\n\n");
            buffer = eventChunks.pop() || "";

            for (const chunk of eventChunks) {
              const lines = chunk.split("\n");
              let eventType = "message";
              let dataStr = "";

              for (const line of lines) {
                if (line.startsWith("event: ")) {
                  eventType = line.slice(7).trim();
                } else if (line.startsWith("data: ")) {
                  dataStr = line.slice(6).trim();
                }
              }

              if (dataStr) {
                try {
                  const payload = JSON.parse(dataStr);
                  streamedAnyEvent = true;

                  if (eventType === "step" && payload.step) {
                    const stepItem = payload.step;
                    setActiveMission((prev) => {
                      if (!prev) return prev;
                      const existingIndex = prev.steps.findIndex(
                        (s) => s.stepIndex === stepItem.stepIndex
                      );
                      const updatedSteps = [...prev.steps];
                      if (existingIndex >= 0) {
                        updatedSteps[existingIndex] = stepItem;
                      } else {
                        updatedSteps.push(stepItem);
                      }
                      updatedSteps.sort((a, b) => a.stepIndex - b.stepIndex);
                      return {
                        ...prev,
                        steps: updatedSteps,
                        confidenceScore: Math.min(
                          95,
                          prev.confidenceScore + (stepItem.confidenceDelta || 10)
                        ),
                      };
                    });
                  } else if (eventType === "complete" && payload.mission) {
                    completedMission = payload.mission;
                  }
                } catch {
                  // Ignore JSON parse errors in partial stream lines
                }
              }
            }
          }
        }
      } catch (streamErr: any) {
        if (controller.signal.aborted || streamErr?.name === "AbortError") {
          throw streamErr;
        }
        console.warn("[AUTONOMOUS STREAM FALLBACK] Switching to execute endpoint:", streamErr);
      }

      // If streaming didn't complete, run legacy POST fallback
      if (!completedMission && !controller.signal.aborted) {
        const response = await fetch("/api/autonomous/execute", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          signal: controller.signal,
          body: JSON.stringify({
            missionId,
            objective,
            domain,
            autonomyMode,
            targetLanguage: language,
          }),
        });

        if (!response.ok) {
          throw new Error(`Server returned status ${response.status}`);
        }

        const data = await response.json();
        if (data.success && data.mission) {
          completedMission = data.mission;
        } else {
          throw new Error(data.error || "Autonomous execution failed.");
        }
      }

      if (completedMission) {
        setActiveMission(completedMission);
        setAutonomousMissions((prev) => [
          completedMission!,
          ...prev.filter((m) => m.id !== completedMission!.id),
        ]);
        saveAutonomousMissionToFirestore(completedMission).catch(() => {});
        triggerConfetti();
        setIsAgentRunning(false);
        setAgentStatusText("");
        return completedMission;
      }

      throw new Error("Autonomous mission terminated without completed dossier.");
    } catch (err: any) {
      if (controller.signal.aborted || err?.name === "AbortError") {
        console.info("[Autonomous Mission Disarmed by User]");
        setIsAgentRunning(false);
        setAgentStatusText(
          language === "om"
            ? "Ajentiin otoonoomasii dhaabameera (Disarmed)."
            : "Autonomous mission disarmed & halted."
        );
        setActiveMission((prev) => (prev ? { ...prev, status: "paused" } : prev));
        return null;
      }

      console.error("[Autonomous execution error]:", err);
      const failedMission: AutonomousMission = {
        ...newMission,
        status: "failed",
        steps: [
          ...newMission.steps,
          {
            id: `step-err-${Date.now()}`,
            stepIndex: 2,
            title: { om: "Dogoggora Raawwii", en: "Execution Error" },
            tool: "system_architect",
            status: "error",
            durationMs: 0,
            thoughtReasoning: err?.message || "Failed to reach agent execution service.",
            inputParameters: {},
            outputSummary: "Autonomous loop encountered an error.",
            timestamp: Date.now(),
          },
        ],
      };
      setActiveMission(failedMission);
      setAutonomousMissions((prev) => [
        failedMission,
        ...prev.filter((m) => m.id !== failedMission.id),
      ]);
      setIsAgentRunning(false);
      setAgentStatusText("");
      return null;
    } finally {
      abortControllerRef.current = null;
    }
  };

  const deleteAutonomousMission = async (id: string) => {
    setAutonomousMissions((prev) => prev.filter((m) => m.id !== id));
    if (activeMission?.id === id) {
      const remaining = autonomousMissions.filter((m) => m.id !== id);
      setActiveMission(remaining[0] || null);
    }
    deleteAutonomousMissionFromFirestore(id).catch(() => {});
  };

  return (
    <AppContext.Provider
      value={{
        language,
        setLanguage,
        activeTab,
        setActiveTab,
        conversations,
        activeConversationId,
        setActiveConversationId,
        createConversation,
        addMessageToActiveConversation,
        deleteConversation,
        translationHistory,
        addTranslationToHistory,
        clearTranslationHistory,
        progress,
        completeLesson,
        completeChallenge,
        toggleBookmark,
        triggerConfetti,
        showDictionaryModal,
        setShowDictionaryModal,
        showInstallModal,
        setShowInstallModal,
        showDataFlowModal,
        setShowDataFlowModal,
        architecturePlans,
        addArchitecturePlan,
        deleteArchitecturePlan,
        deferredPrompt,
        handleInstallApp,
        isAppInstalled,
        searchQuery,
        setSearchQuery,
        isFirestoreSynced,
        userMemory,
        updateUserMemory,
        addRememberedFact,
        removeRememberedFact,
        clearRememberedFacts,
        summarizeActiveConversation,
        updateConversationSummary,
        autonomousMissions,
        activeMission,
        setActiveMission,
        isAgentRunning,
        agentStatusText,
        executeAutonomousMission,
        abortAutonomousMission,
        deleteAutonomousMission,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
};
