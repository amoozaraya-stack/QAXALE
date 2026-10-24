import React, { useState } from "react";
import {
  X,
  Mail,
  Lock,
  User,
  LogIn,
  UserPlus,
  ShieldCheck,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  LogOut,
  ArrowRight,
  Fingerprint,
} from "lucide-react";
import { useApp } from "../context/AppContext";
import {
  loginWithGoogle,
  loginWithEmail,
  registerWithEmail,
  loginAsGuest,
  logoutUser,
} from "../services/firebase";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { language, currentUser } = useApp();
  const [activeTab, setActiveTab] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const isOm = language === "om";

  const formatAuthError = (err: any): string => {
    const code = err?.code || "";
    if (code === "auth/invalid-credential" || code === "auth/wrong-password" || code === "auth/user-not-found") {
      return isOm
        ? "Imeelii ykn jecha-icciitii dogoggoraadha. Maaloo irra deebi'ii yaali."
        : "Invalid email or password. Please verify and try again.";
    }
    if (code === "auth/email-already-in-use") {
      return isOm
        ? "Imeeliin kun kanaan dura galmaa'eera. Maaloo 'Galmaa'i' tuquun seeni."
        : "This email is already registered. Please sign in instead.";
    }
    if (code === "auth/weak-password") {
      return isOm
        ? "Jechi-icciitii yoo xiqqaate qubee/lakkoofsa 6 ta'uu qaba."
        : "Password must be at least 6 characters long.";
    }
    if (code === "auth/popup-closed-by-user") {
      return isOm
        ? "Foddaan Google dursee cufame. Irra deebi'ii yaali."
        : "Google sign-in popup was closed before finishing.";
    }
    return isOm
      ? "Dogoggorri uumameera. Maaloo irra deebi'ii yaali."
      : err?.message || "Authentication failed. Please try again.";
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!email.trim() || !password.trim()) {
      setErrorMsg(isOm ? "Maaloo imeelii fi jecha-icciitii guutaa." : "Please fill in email and password.");
      return;
    }

    setIsLoading(true);
    try {
      if (activeTab === "signin") {
        await loginWithEmail(email, password);
        setSuccessMsg(isOm ? "Milkaa'inaan seenteera!" : "Signed in successfully!");
      } else {
        await registerWithEmail(email, password, displayName);
        setSuccessMsg(isOm ? "Herregni haaraan milkaa'inaan baname!" : "Account created successfully!");
      }
      setTimeout(() => {
        onClose();
      }, 700);
    } catch (err: any) {
      setErrorMsg(formatAuthError(err));
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setErrorMsg(null);
    setSuccessMsg(null);
    setIsLoading(true);
    try {
      await loginWithGoogle();
      setSuccessMsg(isOm ? "Google dhaan milkaa'inaan seenteera!" : "Signed in with Google!");
      setTimeout(() => {
        onClose();
      }, 700);
    } catch (err: any) {
      setErrorMsg(formatAuthError(err));
    } finally {
      setIsLoading(false);
    }
  };

  const handleGuestAuth = async () => {
    setErrorMsg(null);
    setSuccessMsg(null);
    setIsLoading(true);
    try {
      await loginAsGuest();
      setSuccessMsg(isOm ? "Akka keessummaatti seenteera!" : "Continuing as guest user.");
      setTimeout(() => {
        onClose();
      }, 700);
    } catch (err: any) {
      if (
        err?.code === "auth/admin-restricted-operation" ||
        err?.code === "auth/operation-not-allowed"
      ) {
        setSuccessMsg(
          isOm
            ? "Akka keessummaatti itti fufaa jirtu. Tajaajila kuusaa guutuu argachuuf Google ykn Imeeliin seenaa."
            : "Continuing in local guest session. Sign in with Google or Email to unlock cloud sync."
        );
        setTimeout(() => {
          onClose();
        }, 1100);
      } else {
        setErrorMsg(formatAuthError(err));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    setIsLoading(true);
    try {
      await logoutUser();
      setSuccessMsg(isOm ? "Milkaa'inaan baateera." : "Signed out successfully.");
    } catch (err: any) {
      setErrorMsg(err?.message || "Failed to sign out.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl p-6 overflow-hidden">
        {/* Background glow accents */}
        <div className="absolute -top-16 -right-16 w-36 h-36 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-36 h-36 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-400 p-0.5 shadow-md shrink-0">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center text-amber-400 font-extrabold text-sm">
                Q
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h2 className="text-base font-bold text-white tracking-tight">QAXALE</h2>
                <span className="text-[10px] font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30 px-1.5 py-0.2 rounded-full">
                  Multi-User Auth
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {isOm ? "Eenyummaa & Herrega Fayyadamaa" : "Multi-User Identity & Security"}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current User State Badge (if already signed in) */}
        {currentUser && (
          <div className="mt-4 p-3 rounded-2xl bg-slate-950 border border-slate-800/80 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center shrink-0">
                <Fingerprint className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-slate-200 truncate">
                  {currentUser.displayName || currentUser.email || (currentUser.isAnonymous ? (isOm ? "Keessummaa (Guest)" : "Guest Session") : "Active Account")}
                </p>
                <p className="text-[10px] text-slate-500 font-mono truncate">
                  UID: {currentUser.uid.slice(0, 14)}...
                </p>
              </div>
            </div>

            <button
              onClick={handleSignOut}
              disabled={isLoading}
              className="px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 transition-colors flex items-center gap-1 shrink-0"
            >
              <LogOut className="w-3 h-3" />
              <span>{isOm ? "Ba'i" : "Sign Out"}</span>
            </button>
          </div>
        )}

        {/* Tabs: Sign In / Sign Up */}
        <div className="grid grid-cols-2 gap-1 p-1 mt-4 rounded-xl bg-slate-950 border border-slate-800">
          <button
            type="button"
            onClick={() => {
              setActiveTab("signin");
              setErrorMsg(null);
            }}
            className={`py-2 text-xs font-bold rounded-lg transition-all ${
              activeTab === "signin"
                ? "bg-amber-500 text-slate-950 shadow-sm"
                : "text-slate-400 hover:text-white"
            }`}
          >
            {isOm ? "Seeni (Sign In)" : "Sign In"}
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab("signup");
              setErrorMsg(null);
            }}
            className={`py-2 text-xs font-bold rounded-lg transition-all ${
              activeTab === "signup"
                ? "bg-amber-500 text-slate-950 shadow-sm"
                : "text-slate-400 hover:text-white"
            }`}
          >
            {isOm ? "Herrega Bani (Sign Up)" : "Create Account"}
          </button>
        </div>

        {/* Alert Messages */}
        {errorMsg && (
          <div className="mt-3 p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2 animate-in fade-in">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span className="leading-snug">{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="mt-3 p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            <span className="leading-snug">{successMsg}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleEmailAuth} className="mt-4 space-y-3">
          {activeTab === "signup" && (
            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                {isOm ? "Maqaa Keessan" : "Full Name / Display Name"}
              </label>
              <div className="relative">
                <User className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder={isOm ? "Fkn. Chala Gudina" : "e.g. Alex Morgan"}
                  className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/70"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-[11px] font-semibold text-slate-300 mb-1">
              {isOm ? "Teessoo Imeelii" : "Email Address"}
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="user@example.com"
                className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/70"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-300 mb-1">
              {isOm ? "Jecha-icciitii (Password)" : "Password"}
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/70"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 mt-2 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md active:scale-98"
          >
            {isLoading ? (
              <span className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
            ) : activeTab === "signin" ? (
              <>
                <LogIn className="w-4 h-4" />
                <span>{isOm ? "Seeni" : "Sign In"}</span>
              </>
            ) : (
              <>
                <UserPlus className="w-4 h-4" />
                <span>{isOm ? "Herrega Bani" : "Create Account"}</span>
              </>
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-800" />
          </div>
          <div className="relative flex justify-center text-[10px] uppercase">
            <span className="bg-slate-900 px-2 text-slate-500 font-bold">
              {isOm ? "Yookaan" : "Or continue with"}
            </span>
          </div>
        </div>

        {/* Social / Alternative Auth */}
        <div className="space-y-2">
          {/* Google Sign In */}
          <button
            type="button"
            onClick={handleGoogleAuth}
            disabled={isLoading}
            className="w-full py-2.5 px-3 bg-slate-950 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 text-slate-200 text-xs font-semibold rounded-xl flex items-center justify-center gap-2.5 transition-all active:scale-98"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>{isOm ? "Google dhaan Seeni" : "Continue with Google"}</span>
          </button>

          {/* Guest / Anonymous */}
          <button
            type="button"
            onClick={handleGuestAuth}
            disabled={isLoading}
            className="w-full py-2 px-3 bg-slate-950/60 hover:bg-slate-950 border border-slate-800/80 text-slate-400 hover:text-slate-200 text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all"
          >
            <span>{isOm ? "Akka Keessummaatti Itti Fufi (Guest)" : "Continue as Guest"}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Builder attribution footer */}
        <div className="mt-5 pt-3 border-t border-slate-800/60 text-center text-[10px] text-slate-500">
          <p>
            <span className="text-amber-400/80 font-semibold">QAXALE</span> • Engineered by{" "}
            <span className="text-slate-300 font-bold">HAMZA YASIN</span> by{" "}
            <span className="text-slate-300 font-semibold">ORONID TECH</span>
          </p>
        </div>
      </div>
    </div>
  );
};
