import { useState } from "react";
import { User as UserIcon, LogOut, Info } from "lucide-react";
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
    <div className="relative min-h-screen bg-[#0E1613] text-[#EAF1EC] flex flex-col items-center py-4 sm:py-7 px-3 sm:px-6 md:px-8 lg:px-12 selection:bg-[#3E6349] selection:text-[#F2F7F4]">
      {/* 1. Atmospheric Sage Background Elements */}
      <div
        className="pointer-events-none fixed inset-0 overflow-hidden z-0"
        aria-hidden="true"
      >
        {/* Soft emerald/sage ambient glow top left */}
        <div className="absolute -top-32 -left-20 w-[550px] h-[450px] rounded-full bg-[#5B8B67]/[0.08] blur-[150px] animate-ambient-1" />
        {/* Soft sage glow mid right */}
        <div className="absolute top-1/3 -right-24 w-[500px] h-[500px] rounded-full bg-[#7EA984]/[0.06] blur-[160px] animate-ambient-2" />
        {/* Gentle floating organic accents */}
        <div className="absolute top-1/4 left-12 w-3 h-2 rounded-[60%_40%] bg-[#7EA984]/20 blur-[0.5px] animate-leaf" />
        <div
          className="absolute top-2/3 right-16 w-2.5 h-1.5 rounded-[40%_60%] bg-[#7EA984]/15 blur-[0.5px] animate-leaf"
          style={{ animationDelay: "4s" }}
        />
        {/* Faint subtle vignette overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#7EA984]/[0.025] via-transparent to-transparent opacity-90" />
      </div>

      {/* Main Full-Width Content Container */}
      <div className="relative z-10 w-full max-w-6xl mx-auto space-y-4 sm:space-y-5">
        {/* Informative notice if Supabase credentials are missing */}
        {!isConfigured && (
          <div className="bg-[#15221D]/90 backdrop-blur-md border border-amber-500/30 rounded-2xl p-3.5 text-xs text-amber-300/90 flex items-start gap-2.5 shadow-sm">
            <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <p className="font-semibold text-amber-300">
                Supabase Credentials Needed
              </p>
              <p className="text-[#8FA898] leading-relaxed">
                Add{" "}
                <code className="text-amber-200 bg-amber-950/40 px-1 py-0.5 rounded">
                  VITE_SUPABASE_URL
                </code>{" "}
                and{" "}
                <code className="text-amber-200 bg-amber-950/40 px-1 py-0.5 rounded">
                  VITE_SUPABASE_ANON_KEY
                </code>{" "}
                to your <code className="text-[#C8DACF]">.env</code> file to
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

        {/* Bottom User Account / Gmail Pill */}
        <footer className="flex items-center justify-center pt-2 pb-6 text-xs">
          {!authLoading && (
            <>
              {user ? (
                <div className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-[#15221D]/90 border border-[#253930] hover:border-[#7EA984]/50 backdrop-blur-md shadow-xs transition-colors">
                  <span className="text-[#C8DACF] text-xs font-mono tracking-tight max-w-[220px] sm:max-w-none truncate">
                    {user.email}
                  </span>
                  <button
                    type="button"
                    onClick={signOut}
                    title="Sign Out"
                    className="p-1 rounded-full text-[#8FA898] hover:text-[#EAF1EC] hover:bg-white/[0.08] transition-colors cursor-pointer active:scale-95"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsAuthModalOpen(true)}
                  className="inline-flex items-center gap-1.5 text-[#C8DACF] hover:text-[#EAF1EC] text-xs font-medium bg-[#1A2922]/90 hover:bg-[#23372E] border border-[#253930] hover:border-[#7EA984]/50 px-3.5 py-1.5 rounded-full transition-all duration-200 cursor-pointer shadow-xs active:scale-[0.97]"
                >
                  <UserIcon className="w-3.5 h-3.5 text-[#7EA984]" />
                  <span>Sign In</span>
                </button>
              )}
            </>
          )}
        </footer>
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
