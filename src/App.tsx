import { useState } from "react";
import { User as UserIcon, LogOut, Cloud, CloudOff, Info } from "lucide-react";
import { SplitHeader } from "./components/SplitHeader";
import { WorkoutTracker } from "./components/WorkoutTracker";
import { AuthModal } from "./components/AuthModal";
import { useAuth } from "./hooks/useAuth";
import { useWorkoutLogger } from "./hooks/useWorkoutLogger";
import type { WorkoutDay } from "./types/workout";

export function App() {
  const [activeDay, setActiveDay] = useState<WorkoutDay>("mon_thu");
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);

  const {
    user,
    loading: authLoading,
    isConfigured,
    signIn,
    signUp,
    signOut,
  } = useAuth();

  const {
    slots,
    status,
    statusMessage,
    history,
    showHistory,
    setShowHistory,
    updateSlot,
    clearEntries,
    saveWorkout,
  } = useWorkoutLogger(activeDay, user);

  return (
    <div className="relative min-h-screen bg-[#08080a] text-[#f4f4f5] flex flex-col items-center py-4 sm:py-7 px-3 sm:px-6 selection:bg-zinc-800 selection:text-white">
      {/* 1. Subtle, Slow Moving Ambient Background Elements */}
      <div
        className="pointer-events-none fixed inset-0 overflow-hidden z-0"
        aria-hidden="true"
      >
        {/* Soft atmospheric gradient top left */}
        <div className="absolute -top-32 -left-20 w-[420px] h-[340px] rounded-full bg-indigo-500/[0.04] blur-[120px] animate-ambient-1" />
        {/* Soft atmospheric gradient mid right */}
        <div className="absolute top-1/3 -right-24 w-[380px] h-[380px] rounded-full bg-sky-500/[0.03] blur-[130px] animate-ambient-2" />
        {/* Faint subtle vignette texture */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white/[0.015] via-transparent to-transparent opacity-80" />
      </div>

      {/* Main Centered Content Container */}
      <div className="relative z-10 w-full max-w-xl space-y-4">
        {/* Top Status & Auth Bar */}
        <header className="flex items-center justify-between px-1 py-1 text-xs text-zinc-400">
          {/* Refined Live System Status Indicator */}
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-[#121215]/80 border border-white/[0.06] backdrop-blur-md shadow-xs transition-all duration-200">
            {isConfigured ? (
              user ? (
                <>
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
                  </span>
                  <span className="text-[11px] font-medium text-zinc-300 flex items-center gap-1">
                    <Cloud className="w-3 h-3 text-emerald-400" />
                    <span>Cloud Synced</span>
                  </span>
                </>
              ) : (
                <>
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400/60 opacity-40"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400/90"></span>
                  </span>
                  <span className="text-[11px] font-medium text-zinc-300 flex items-center gap-1">
                    <Cloud className="w-3 h-3 text-emerald-400/90" />
                    <span>Cloud Ready</span>
                  </span>
                </>
              )
            ) : (
              <>
                <span className="relative flex h-2 w-2">
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-400"></span>
                </span>
                <span className="text-[11px] font-medium text-amber-300/90 flex items-center gap-1">
                  <CloudOff className="w-3 h-3 text-amber-400" />
                  <span>Supabase Setup Needed</span>
                </span>
              </>
            )}
          </div>

          {/* User Account / Auth Actions */}
          <div className="flex items-center gap-2">
            {!authLoading && (
              <>
                {user ? (
                  <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-[#121215]/80 border border-white/[0.06] backdrop-blur-md">
                    <span className="text-zinc-300 text-xs max-w-[130px] sm:max-w-[190px] truncate font-mono">
                      {user.email}
                    </span>
                    <button
                      type="button"
                      onClick={signOut}
                      title="Sign Out"
                      className="p-1 rounded-full text-zinc-400 hover:text-white hover:bg-white/[0.08] transition-colors cursor-pointer active:scale-95"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setIsAuthModalOpen(true)}
                    className="inline-flex items-center gap-1.5 text-zinc-300 hover:text-white text-xs font-medium bg-[#141418]/90 hover:bg-[#1a1a22] border border-white/[0.07] hover:border-white/[0.14] px-3 py-1.5 rounded-full transition-all duration-200 cursor-pointer shadow-xs active:scale-[0.97]"
                  >
                    <UserIcon className="w-3.5 h-3.5 text-zinc-400" />
                    <span>Sign In</span>
                  </button>
                )}
              </>
            )}
          </div>
        </header>

        {/* Informative notice if Supabase credentials are missing */}
        {!isConfigured && (
          <div className="bg-[#121215]/90 backdrop-blur-md border border-amber-500/25 rounded-2xl p-3.5 text-xs text-amber-300/90 flex items-start gap-2.5 shadow-sm">
            <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <p className="font-semibold text-amber-300">
                Supabase Credentials Needed
              </p>
              <p className="text-zinc-400 leading-relaxed">
                Add{" "}
                <code className="text-amber-200 bg-amber-950/40 px-1 py-0.5 rounded">
                  VITE_SUPABASE_URL
                </code>{" "}
                and{" "}
                <code className="text-amber-200 bg-amber-950/40 px-1 py-0.5 rounded">
                  VITE_SUPABASE_ANON_KEY
                </code>{" "}
                to your <code className="text-zinc-300">.env</code> file to
                enable cross-device sync and authentication.
              </p>
            </div>
          </div>
        )}

        {/* Section 1: TOP SECTION (Split) */}
        <SplitHeader />

        {/* Section 2: MAIN TRACKER */}
        <WorkoutTracker
          activeDay={activeDay}
          onSelectDay={setActiveDay}
          slots={slots}
          onUpdateSlot={updateSlot}
          onSaveWorkout={saveWorkout}
          onClearEntries={clearEntries}
          status={status}
          statusMessage={statusMessage}
          history={history}
          showHistory={showHistory}
          onToggleHistory={setShowHistory}
        />
      </div>

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        isConfigured={isConfigured}
        onSignIn={signIn}
        onSignUp={signUp}
      />
    </div>
  );
}

export default App;
