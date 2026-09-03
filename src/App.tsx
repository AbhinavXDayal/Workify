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
    <div className="min-h-screen bg-[#09090b] text-[#f4f4f5] flex flex-col items-center py-4 sm:py-6 px-2.5 sm:px-6">
      <div className="w-full max-w-xl space-y-4">
        {/* Subtle Top Bar: Sync status and Auth */}
        <header className="flex items-center justify-between px-2 py-1 text-xs text-zinc-400">
          <div className="flex items-center gap-1.5">
            {isConfigured ? (
              user ? (
                <span className="flex items-center gap-1 text-emerald-400 font-medium">
                  <Cloud className="w-3.5 h-3.5" />
                  <span>Cloud Synced</span>
                </span>
              ) : (
                <span className="flex items-center gap-1 text-zinc-400">
                  <Cloud className="w-3.5 h-3.5" />
                  <span>Cloud Ready</span>
                </span>
              )
            ) : (
              <span className="flex items-center gap-1 text-amber-400/80">
                <CloudOff className="w-3.5 h-3.5" />
                <span>Supabase Setup Needed</span>
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            {!authLoading && (
              <>
                {user ? (
                  <div className="flex items-center gap-2">
                    <span className="text-zinc-300 max-w-[140px] sm:max-w-[200px] truncate">
                      {user.email}
                    </span>
                    <button
                      type="button"
                      onClick={signOut}
                      title="Sign Out"
                      className="p-1 rounded-md text-zinc-400 hover:text-white hover:bg-[#18181b] transition-colors cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setIsAuthModalOpen(true)}
                    className="inline-flex items-center gap-1.5 text-zinc-300 hover:text-white font-medium bg-[#18181b] border border-[#27272a] hover:border-zinc-700 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                  >
                    <UserIcon className="w-3.5 h-3.5" />
                    <span>Sign In</span>
                  </button>
                )}
              </>
            )}
          </div>
        </header>

        {/* Informative notice if Supabase credentials are missing */}
        {!isConfigured && (
          <div className="bg-[#121214] border border-amber-500/30 rounded-xl p-3 text-xs text-amber-300/90 flex items-start gap-2.5">
            <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <p className="font-semibold text-amber-300">
                Supabase Credentials Needed
              </p>
              <p className="text-zinc-400">
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
