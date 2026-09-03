import { useState } from "react";
import { Info } from "lucide-react";
import { SplitHeader } from "./components/SplitHeader";
import { WorkoutTracker } from "./components/WorkoutTracker";
import { AuthModal } from "./components/AuthModal";
import { AmbientBackground } from "./components/AmbientBackground";
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
    <div className="relative min-h-screen bg-[#0E1613] text-[#EAF1EC] flex flex-col items-center py-2 sm:py-4 px-2.5 sm:px-4 md:px-6 lg:px-8 selection:bg-[#3E6349] selection:text-[#F2F7F4]">
      {/* 1. Dynamic Ambient Background: small leaves, dot matrix, and connected moving graph */}
      <AmbientBackground />

      {/* Main Full-Width Content Container */}
      <div className="relative z-10 w-full max-w-6xl mx-auto space-y-2.5 sm:space-y-3">
        {/* Informative notice if Supabase credentials are missing */}
        {!isConfigured && (
          <div className="bg-[#15221D]/90 backdrop-blur-md border border-amber-500/30 rounded-2xl p-3 text-xs text-amber-300/90 flex items-start gap-2.5 shadow-sm">
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

        {/* Section 1: TOP SECTION (Workify Routine Card with embedded user account pill & toggle) */}
        <SplitHeader
          user={user}
          authLoading={authLoading}
          onSignOut={signOut}
          onOpenAuth={() => setIsAuthModalOpen(true)}
        />

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

        {/* Bottom Spacer */}
        <footer className="pb-3" />
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
