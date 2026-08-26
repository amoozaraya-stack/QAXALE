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
import { Conversation, UserProgress } from "../types";

/**
 * Persist or update user progress in Firestore
 */
export async function syncUserProgressToFirestore(progress: UserProgress, language: string): Promise<void> {
  try {
    const userId = await getOrCreateUserId();
    const userDocRef = doc(db, "users", userId);
    await setDoc(
      userDocRef,
      {
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
      },
      { merge: true }
    );
  } catch (err) {
    console.warn("Firestore user progress sync skipped or delayed:", err);
  }
}

/**
 * Load user progress from Firestore
 */
export async function loadUserProgressFromFirestore(): Promise<UserProgress | null> {
  try {
    const userId = await getOrCreateUserId();
    const userDocRef = doc(db, "users", userId);
    const docSnap = await getDoc(userDocRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
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
