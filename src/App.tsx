import { useState } from "react";
import { Info } from "lucide-react";
import { SplitHeader } from "./components/SplitHeader";
import { WorkoutTracker } from "./components/WorkoutTracker";
import { AuthModal } from "./components/AuthModal";
import { AmbientBackground } from "./components/AmbientBackground";
import { useAuth } from "./hooks/useAuth";
import { useWorkoutLogger } from "./hooks/useWorkoutLogger";
import type { WorkoutDay } from "./types/workout";
import { getTodaysWorkoutDay } from "./constants/workoutConfig";

interface AppProps {
  initialDay?: WorkoutDay;
}

export function App({ initialDay }: AppProps = {}) {
  const [activeDay, setActiveDay] = useState<WorkoutDay>(
    () => initialDay || getTodaysWorkoutDay(),
  );
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
  } = useWorkoutLogger(activeDay, user);

  return (
    <div className="relative h-[100dvh] max-h-[100dvh] sm:h-auto sm:min-h-[100dvh] w-full max-w-full overflow-hidden sm:overflow-x-hidden sm:overflow-y-auto bg-[#0C100D] text-[#E8F1EB] flex flex-col items-center pt-1 pb-1 sm:py-4 px-1.5 sm:px-4 md:px-6 lg:px-8 selection:bg-[#244230] selection:text-[#E6F8EE]">
      {/* 1. Dynamic Ambient Background: small leaves, dot matrix, and connected moving graph */}
      <AmbientBackground />

      {/* Main Full-Width Content Container */}
      <div className="relative z-10 w-full max-w-6xl mx-auto flex-1 min-h-0 flex flex-col justify-start space-y-1 sm:space-y-3 overflow-hidden sm:overflow-visible overscroll-contain">
        {/* Informative notice if Supabase credentials are missing */}
        {!isConfigured && (
          <div className="liquid-glass-card border border-[#437A56]/30 rounded-2xl p-2.5 text-xs text-[#E8F1EB] flex items-start gap-2 shadow-sm shrink-0">
            <Info className="w-4 h-4 text-[#5EA379] shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <p className="font-bold text-[#FFFDF8]">
                Supabase Credentials Needed
              </p>
              <p className="text-[#8FA898] text-[11px] leading-relaxed">
                Add{" "}
                <code className="text-[#5EA379] font-mono bg-black/40 px-1 py-0.5 rounded">
                  VITE_SUPABASE_URL
                </code>{" "}
                and{" "}
                <code className="text-[#5EA379] font-mono bg-black/40 px-1 py-0.5 rounded">
                  VITE_SUPABASE_ANON_KEY
                </code>{" "}
                to your .env file to enable cross-device cloud sync.
              </p>
            </div>
          </div>
        )}

        {/* Unified Continuous Liquid-Glass Card: No middle section breaking the app in half */}
        <div className="w-full max-w-full liquid-glass-card rounded-2xl sm:rounded-3xl p-2.5 sm:p-5 md:p-6 pb-2.5 sm:pb-6 flex flex-col flex-1 min-h-0 transition-all duration-200">
          <SplitHeader
            user={user}
            authLoading={authLoading}
            onSignOut={signOut}
            onOpenAuth={() => setIsAuthModalOpen(true)}
          />

          {/* Seamless Subtle Divider connecting routine overview to tracker */}
          <div className="h-[1px] bg-[#437A56]/20 my-1 sm:my-2.5 shrink-0" />

          <WorkoutTracker
            activeDay={activeDay}
            onSelectDay={setActiveDay}
            slots={slots}
            onUpdateSlot={updateSlot}
            status={status}
            statusMessage={statusMessage}
            history={history}
            showHistory={showHistory}
            onToggleHistory={setShowHistory}
          />
        </div>

        {/* Compact bottom spacer: keeps bottom page fixed without any page scrolling */}
        <footer
          className="h-3 sm:h-5 shrink-0"
          aria-label="Website bottom space"
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
