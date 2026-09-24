import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
} from "firebase/firestore";
import { db, getOrCreateUserId } from "./firebase";
import { Conversation, UserProgress, AutonomousMission, UserMemoryProfile } from "../types";

/**
 * Persist or update user progress & memory profile in Firestore
 */
export async function syncUserProgressToFirestore(
  progress: UserProgress,
  language: string,
  userMemory?: UserMemoryProfile
): Promise<void> {
  try {
    const userId = await getOrCreateUserId();
    const userDocRef = doc(db, "users", userId);
    const payload: Record<string, any> = {
      userId,
      language,
      completedLessonIds: progress.completedLessonIds || [],
      completedChallengeIds: progress.completedChallengeIds || [],
      totalXP: progress.totalXP || 0,
      streakDays: progress.streakDays || 1,
      lastActiveDate: progress.lastActiveDate || new Date().toISOString().split("T")[0],
      bookmarkedTerms: progress.bookmarkedTerms || [],
      solvedQuizzesCount: progress.solvedQuizzesCount || 0,
      interpretedConceptsCount: progress.interpretedConceptsCount || 0,
      projectsCreatedCount: progress.projectsCreatedCount || 0,
      updatedAt: serverTimestamp(),
    };

    if (userMemory) {
      payload.userMemory = userMemory;
    }

    await setDoc(userDocRef, payload, { merge: true });
  } catch (err) {
    console.warn("Firestore user progress sync skipped or delayed:", err);
  }
}

/**
 * Load user progress & memory profile from Firestore
 */
export async function loadUserProgressFromFirestore(): Promise<{
  progress: UserProgress;
  userMemory?: UserMemoryProfile;
} | null> {
  try {
    const userId = await getOrCreateUserId();
    const userDocRef = doc(db, "users", userId);
    const docSnap = await getDoc(userDocRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      const progress: UserProgress = {
        completedLessonIds: Array.isArray(data.completedLessonIds) ? data.completedLessonIds : [],
        completedChallengeIds: Array.isArray(data.completedChallengeIds) ? data.completedChallengeIds : [],
        totalXP: typeof data.totalXP === "number" ? data.totalXP : 100,
        streakDays: typeof data.streakDays === "number" ? data.streakDays : 1,
        lastActiveDate: data.lastActiveDate || new Date().toISOString().split("T")[0],
        bookmarkedTerms: Array.isArray(data.bookmarkedTerms) ? data.bookmarkedTerms : [],
        solvedQuizzesCount: typeof data.solvedQuizzesCount === "number" ? data.solvedQuizzesCount : 0,
        interpretedConceptsCount: typeof data.interpretedConceptsCount === "number" ? data.interpretedConceptsCount : 0,
        projectsCreatedCount: typeof data.projectsCreatedCount === "number" ? data.projectsCreatedCount : 0,
      };

      const userMemory: UserMemoryProfile | undefined = data.userMemory
        ? {
            knowledgeLevel: data.userMemory.knowledgeLevel || "intermediate",
            focusInterests: Array.isArray(data.userMemory.focusInterests) ? data.userMemory.focusInterests : [],
            riskTolerance: data.userMemory.riskTolerance || "conservative",
            bankrollLimitPct: typeof data.userMemory.bankrollLimitPct === "number" ? data.userMemory.bankrollLimitPct : 2,
            preferredTone: data.userMemory.preferredTone || "concise-scientific",
            rememberedFacts: Array.isArray(data.userMemory.rememberedFacts) ? data.userMemory.rememberedFacts : [],
            updatedAt: data.userMemory.updatedAt || Date.now(),
          }
        : undefined;

      return { progress, userMemory };
    }
  } catch (err) {
    console.warn("Firestore load user progress error:", err);
  }
  return null;
}

/**
 * Save or update a conversation session in Firestore
 */
export async function saveConversationToFirestore(conv: Conversation): Promise<void> {
  try {
    const userId = await getOrCreateUserId();
    const convDocRef = doc(db, "conversations", conv.id);
    await setDoc(
      convDocRef,
      {
        id: conv.id,
        userId,
        title: conv.title,
        language: conv.language,
        messages: conv.messages,
        summary: conv.summary || null,
        keyTakeaways: conv.keyTakeaways || [],
        createdAt: conv.createdAt,
        updatedAt: conv.updatedAt || Date.now(),
        syncedAt: serverTimestamp(),
      },
      { merge: true }
    );
  } catch (err) {
    console.warn("Firestore conversation save warning:", err);
  }
}

/**
 * Load all conversations belonging to the current user
 */
export async function loadConversationsFromFirestore(): Promise<Conversation[] | null> {
  try {
    const userId = await getOrCreateUserId();
    const convsRef = collection(db, "conversations");
    const q = query(
      convsRef,
      where("userId", "==", userId),
      orderBy("updatedAt", "desc"),
      limit(50)
    );

    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      const results: Conversation[] = [];
      querySnapshot.forEach((doc) => {
        const d = doc.data();
        results.push({
          id: d.id || doc.id,
          title: d.title || "Qaxale Session",
          messages: Array.isArray(d.messages) ? d.messages : [],
          createdAt: typeof d.createdAt === "number" ? d.createdAt : Date.now(),
          updatedAt: typeof d.updatedAt === "number" ? d.updatedAt : Date.now(),
          language: d.language === "en" ? "en" : "om",
          summary: typeof d.summary === "string" ? d.summary : undefined,
          keyTakeaways: Array.isArray(d.keyTakeaways) ? d.keyTakeaways : undefined,
        });
      });
      return results;
    }
  } catch (err) {
    console.warn("Firestore load conversations warning:", err);
  }
  return null;
}

/**
 * Delete a conversation document from Firestore
 */
export async function deleteConversationFromFirestore(convId: string): Promise<void> {
  try {
    const convDocRef = doc(db, "conversations", convId);
    await deleteDoc(convDocRef);
  } catch (err) {
    console.warn("Firestore delete conversation warning:", err);
  }
}

/**
 * Persist an Autonomous Mission to Firestore
 */
export async function saveAutonomousMissionToFirestore(mission: AutonomousMission): Promise<void> {
  try {
    const userId = await getOrCreateUserId();
    const taskDocRef = doc(db, "autonomous_tasks", mission.id);
    await setDoc(
      taskDocRef,
      {
        id: mission.id,
        userId: mission.userId || userId,
        title: mission.title,
        goal: mission.goal,
        domain: mission.domain,
        autonomyMode: mission.autonomyMode,
        status: mission.status,
        confidenceScore: mission.confidenceScore || 0,
        steps: mission.steps || [],
        synthesis: mission.synthesis || null,
        createdAt: mission.createdAt || Date.now(),
        completedAt: mission.completedAt || null,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
  } catch (err) {
    console.warn("Firestore save autonomous mission warning:", err);
  }
}

/**
 * Load Autonomous Missions for current user from Firestore
 */
export async function loadAutonomousMissionsFromFirestore(): Promise<AutonomousMission[] | null> {
  try {
    const userId = await getOrCreateUserId();
    const tasksColl = collection(db, "autonomous_tasks");
    const q = query(
      tasksColl,
      where("userId", "==", userId),
      limit(25)
    );
    const snap = await getDocs(q);
    if (!snap.empty) {
      const results: AutonomousMission[] = [];
      snap.forEach((docSnap) => {
        const d = docSnap.data();
        results.push({
          id: d.id || docSnap.id,
          userId: d.userId || userId,
          title: d.title || "Autonomous Mission",
          goal: d.goal || "",
          domain: d.domain || "custom",
          autonomyMode: d.autonomyMode || "full",
          status: d.status || "completed",
          confidenceScore: typeof d.confidenceScore === "number" ? d.confidenceScore : 85,
          steps: Array.isArray(d.steps) ? d.steps : [],
          synthesis: d.synthesis || undefined,
          createdAt: typeof d.createdAt === "number" ? d.createdAt : Date.now(),
          completedAt: typeof d.completedAt === "number" ? d.completedAt : undefined,
        });
      });
      // Sort client-side by createdAt descending
      results.sort((a, b) => b.createdAt - a.createdAt);
      return results;
    }
  } catch (err) {
    console.warn("Firestore load autonomous missions warning:", err);
  }
  return null;
}

/**
 * Delete an Autonomous Mission document from Firestore
 */
export async function deleteAutonomousMissionFromFirestore(missionId: string): Promise<void> {
  try {
    const docRef = doc(db, "autonomous_tasks", missionId);
    await deleteDoc(docRef);
  } catch (err) {
    console.warn("Firestore delete autonomous mission warning:", err);
  }
}

