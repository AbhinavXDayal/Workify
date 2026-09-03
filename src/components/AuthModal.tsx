import React, { useState } from "react";
import { X, Lock, Mail, AlertCircle, CheckCircle2 } from "lucide-react";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  isConfigured: boolean;
  onSignIn: (
    email: string,
    pass: string,
  ) => Promise<{ success: boolean; error?: string }>;
  onSignUp: (
    email: string,
    pass: string,
  ) => Promise<{ success: boolean; error?: string }>;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  isConfigured,
  onSignIn,
  onSignUp,
}) => {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!isConfigured) {
      setErrorMsg(
        "Supabase credentials not found. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to .env.",
      );
      return;
    }

    if (!email || !password) {
      setErrorMsg("Please enter both email and password.");
      return;
    }

    if (password.length < 6) {
      setErrorMsg("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    try {
      if (mode === "signin") {
        const res = await onSignIn(email, password);
        if (!res.success) {
          setErrorMsg(res.error || "Failed to sign in");
        } else {
          onClose();
        }
      } else {
        const res = await onSignUp(email, password);
        if (!res.success) {
          setErrorMsg(res.error || "Failed to sign up");
        } else {
          setSuccessMsg(
            "Account created! If email confirmation is enabled, please check your inbox, or sign in now.",
          );
          setMode("signin");
        }
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="bg-[#F6F3EC] border border-[#DDD7CB] rounded-3xl w-full max-w-sm p-6 sm:p-7 shadow-2xl relative transition-all duration-200">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full text-[#7A7266] hover:text-[#221E1B] hover:bg-[#EFEBE3] transition-colors active:scale-95 cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="text-center mb-6">
          <h2 className="text-base font-semibold text-[#221E1B] tracking-tight">
            {mode === "signin" ? "Sign In" : "Create Account"}
          </h2>
          <p className="text-xs text-[#6A6359] mt-1">
            Sync your workouts across phone and laptop
          </p>
        </div>

        {!isConfigured && (
          <div className="mb-4 p-3.5 bg-amber-500/10 border border-amber-500/30 rounded-2xl text-amber-800 text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
            <span>
              Supabase is not configured yet. Please add your credentials to{" "}
              <code>.env</code> to enable cloud authentication.
            </span>
          </div>
        )}

        {errorMsg && (
          <div className="mb-4 p-3.5 bg-red-500/10 border border-red-500/30 rounded-2xl text-red-700 text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-4 p-3.5 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-emerald-800 text-xs flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs text-[#6A6359] font-medium block">
              Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#466A51] absolute left-3.5 top-3.5" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="w-full bg-[#FFFFFF] border border-[#D8D2C5] hover:border-[#B3AC9D] focus:border-[#466A51] focus:ring-2 focus:ring-[#466A51]/20 rounded-2xl pl-10 pr-3.5 py-2.5 sm:py-3 text-sm text-[#221E1B] placeholder-[#9E968A] focus:outline-none transition-all duration-150"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs text-[#6A6359] font-medium block">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#466A51] absolute left-3.5 top-3.5" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#FFFFFF] border border-[#D8D2C5] hover:border-[#B3AC9D] focus:border-[#466A51] focus:ring-2 focus:ring-[#466A51]/20 rounded-2xl pl-10 pr-3.5 py-2.5 sm:py-3 text-sm text-[#221E1B] placeholder-[#9E968A] focus:outline-none transition-all duration-150"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-[#221E1B] hover:bg-[#3A3430] active:scale-[0.985] text-[#FAF7F2] text-sm font-semibold rounded-2xl transition-all duration-150 cursor-pointer disabled:opacity-50 mt-2 shadow-sm"
          >
            {loading
              ? "Processing..."
              : mode === "signin"
                ? "Sign In"
                : "Sign Up"}
          </button>
        </form>

        <div className="mt-5 text-center text-xs text-[#6A6359]">
          {mode === "signin" ? (
            <span>
              Don't have an account?{" "}
              <button
                type="button"
                onClick={() => {
                  setMode("signup");
                  setErrorMsg(null);
                }}
                className="text-[#221E1B] hover:text-[#466A51] hover:underline font-medium cursor-pointer"
              >
                Sign up
              </button>
            </span>
          ) : (
            <span>
              Already have an account?{" "}
              <button
                type="button"
                onClick={() => {
                  setMode("signin");
                  setErrorMsg(null);
                }}
                className="text-[#221E1B] hover:text-[#466A51] hover:underline font-medium cursor-pointer"
              >
                Sign in
              </button>
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
