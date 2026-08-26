import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, signInAnonymously } from "firebase/auth";
import firebaseConfig from "../../firebase-applet-config.json";

// Initialize Firebase App
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Initialize Firestore with custom database ID if present in config
export const db = firebaseConfig.firestoreDatabaseId
  ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
  : getFirestore(app);

export const auth = getAuth(app);

// Helper to ensure anonymous auth or user session for local identity
export async function getOrCreateUserId(): Promise<string> {
  const localKey = "qaxale_local_uid";
  let stored = localStorage.getItem(localKey);
  if (!stored) {
    stored = `user_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    localStorage.setItem(localKey, stored);
  }

  // Attempt anonymous Firebase sign in if available
  try {
    if (!auth.currentUser) {
      const userCred = await signInAnonymously(auth);
      if (userCred?.user?.uid) {
        return userCred.user.uid;
      }
    } else {
      return auth.currentUser.uid;
    }
  } catch (err) {
    // Non-blocking fallback to local persistent UID
    console.warn("Anonymous auth skipped, using client persistent UID:", err);
  }

  return stored;
}

export default app;
