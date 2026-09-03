import { useState, useEffect, useRef } from "react";
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
  const [isWorkifyOpen, setIsWorkifyOpen] = useState<boolean>(true);
  const workifyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    // Auto-toggle / collapse Workify card after 30 seconds of initial viewing
    workifyTimerRef.current = setTimeout(() => {
      setIsWorkifyOpen(false);
    }, 30000);

    return () => {
      if (workifyTimerRef.current) {
        clearTimeout(workifyTimerRef.current);
      }
    };
  }, []);

  const handleToggleWorkify = () => {
    if (workifyTimerRef.current) {
      clearTimeout(workifyTimerRef.current);
      workifyTimerRef.current = null;
    }
    setIsWorkifyOpen((prev) => !prev);
  };

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
    <div className="relative min-h-[100dvh] h-[100dvh] bg-[#0E1613] text-[#EAF1EC] flex flex-col items-center py-1 sm:py-3 px-1.5 sm:px-4 md:px-6 lg:px-8 selection:bg-[#3E6349] selection:text-[#F2F7F4] overflow-hidden">
      {/* 1. Dynamic Ambient Background: small leaves, dot matrix, and connected moving graph */}
      <AmbientBackground />

      {/* Main Full-Width Content Container */}
      <div className="relative z-10 w-full max-w-6xl mx-auto flex-1 flex flex-col gap-1 sm:gap-2.5 h-full min-h-0 overflow-hidden">
        {/* Informative notice if Supabase credentials are missing */}
        {!isConfigured && (
          <div className="bg-[#15221D]/90 backdrop-blur-md border border-amber-500/30 rounded-2xl p-2.5 text-xs text-amber-300/90 flex items-start gap-2 shadow-sm shrink-0">
            <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <p className="font-semibold text-amber-300">
                Supabase Credentials Needed
              </p>
              <p className="text-[#8FA898] text-[11px] leading-relaxed">
                Add <code className="text-amber-200">VITE_SUPABASE_URL</code> and{" "}
                <code className="text-amber-200">VITE_SUPABASE_ANON_KEY</code> to your .env file to enable cross-device cloud sync.
              </p>
            </div>
          </div>
        )}

        {/* Section 1: TOP SECTION (Workify Routine Card with embedded user account pill & toggle) */}
        <div className="shrink-0">
          <SplitHeader
            user={user}
            authLoading={authLoading}
            onSignOut={signOut}
            onOpenAuth={() => setIsAuthModalOpen(true)}
            isOpen={isWorkifyOpen}
            onToggle={handleToggleWorkify}
          />
        </div>

        {/* Section 2: MAIN TRACKER - Expands to take full space vertically when Workify is collapsed */}
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
          isWorkifyCollapsed={!isWorkifyOpen}
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
