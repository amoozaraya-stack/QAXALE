import React, { createContext, useContext, useEffect, useState } from "react";
import confetti from "canvas-confetti";
import {
  AppLanguage,
  NavTab,
  Conversation,
  ChatMessage,
  TranslationHistoryItem,
  UserProgress,
} from "../types";

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
  deferredPrompt: any;
  handleInstallApp: () => Promise<void>;
  isAppInstalled: boolean;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

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

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<AppLanguage>(() => {
    const saved = localStorage.getItem("qaxale_lang");
    return (saved === "en" ? "en" : "om") as AppLanguage;
  });

  const [activeTab, setActiveTab] = useState<NavTab>("home");
  const [showDictionaryModal, setShowDictionaryModal] = useState(false);
  const [showInstallModal, setShowInstallModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isAppInstalled, setIsAppInstalled] = useState(false);

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
  }, [progress]);

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
        return [newConv, ...prev];
      }

      return prev.map((conv) => {
        if (conv.id === targetId) {
          const updatedMessages = [...conv.messages, msg];
          let updatedTitle = conv.title;
          if (conv.messages.length === 0 && messageData.role === "user") {
            updatedTitle = messageData.content.slice(0, 35) || conv.title;
          }
          return {
            ...conv,
            title: updatedTitle,
            messages: updatedMessages,
            updatedAt: Date.now(),
          };
        }
        return conv;
      });
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
        deferredPrompt,
        handleInstallApp,
        isAppInstalled,
        searchQuery,
        setSearchQuery,
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
