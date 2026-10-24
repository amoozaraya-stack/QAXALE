import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import {
  getAuth,
  signInAnonymously,
  signInWithPopup,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
} from "firebase/auth";
import firebaseConfig from "../../firebase-applet-config.json";

// Initialize Firebase App
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Initialize Firestore with custom database ID if present in config
export const db = firebaseConfig.firestoreDatabaseId
  ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
  : getFirestore(app);

export const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: "select_account" });

/**
 * Sign in with Google Popup
 */
export async function loginWithGoogle(): Promise<FirebaseUser> {
  const result = await signInWithPopup(auth, googleProvider);
  return result.user;
}

/**
 * Sign in with Email and Password
 */
export async function loginWithEmail(email: string, pass: string): Promise<FirebaseUser> {
  const result = await signInWithEmailAndPassword(auth, email.trim(), pass);
  return result.user;
}

/**
 * Register a new user with Email, Password, and optional Display Name
 */
export async function registerWithEmail(
  email: string,
  pass: string,
  displayName?: string
): Promise<FirebaseUser> {
  const result = await createUserWithEmailAndPassword(auth, email.trim(), pass);
  if (displayName && displayName.trim()) {
    await updateProfile(result.user, { displayName: displayName.trim() });
  }
  return result.user;
}

/**
 * Sign in as anonymous guest
 */
export async function loginAsGuest(): Promise<FirebaseUser> {
  const result = await signInAnonymously(auth);
  return result.user;
}

/**
 * Sign out the currently active user
 */
export async function logoutUser(): Promise<void> {
  await signOut(auth);
}

/**
 * Subscribe to auth state changes
 */
export function subscribeToAuthState(callback: (user: FirebaseUser | null) => void) {
  return onAuthStateChanged(auth, callback);
}

/**
 * Helper to ensure a valid authenticated UID for Firestore security rules
 */
export async function getOrCreateUserId(): Promise<string | null> {
  if (auth.currentUser?.uid) {
    return auth.currentUser.uid;
  }

  // Attempt anonymous Firebase sign in if available
  try {
    const userCred = await signInAnonymously(auth);
    if (userCred?.user?.uid) {
      return userCred.user.uid;
    }
  } catch (err) {
    // anonymous auth may not be enabled
  }

  return null;
}

export type { FirebaseUser };
export default app;
