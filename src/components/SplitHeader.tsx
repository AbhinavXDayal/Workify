import React from "react";
import { User as UserIcon, LogOut } from "lucide-react";
import type { User } from "@supabase/supabase-js";
import { SPLIT_HEADER_TEXT } from "../constants/workoutConfig";

interface SplitHeaderProps {
  user?: User | null;
  authLoading?: boolean;
  onSignOut?: () => void;
  onOpenAuth?: () => void;
}

export const SplitHeader: React.FC<SplitHeaderProps> = ({
  user,
  authLoading,
  onSignOut,
  onOpenAuth,
}) => {
  return (
    <div className="w-full max-w-full transition-all duration-200 shrink-0">
      {/* Header Bar: Ultra-thin title and account pill without GitHub link/icon */}
      <div className="flex items-center justify-between gap-1 pb-0.5 border-b border-[#4A5A4F]/20 min-w-0">
        <div className="flex items-center gap-1 text-[#FFFDF8] text-[11px] sm:text-xs font-bold tracking-wide select-none shrink-0 drop-shadow-xs">
          <img
            src="/workify-logo.jpg"
            alt="Workify Logo"
            className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded object-cover shadow-xs border border-[#4A5A4F]/25"
          />
          <h1 className="inline text-[11px] sm:text-xs font-bold">{SPLIT_HEADER_TEXT.title}</h1>
        </div>

        {/* Right Action Group: Compact Account Pill (Icon only) */}
        <div className="flex items-center gap-1 shrink-0">
          {!authLoading && (
            <>
              {user
                ? onSignOut && (
                    <button
                      type="button"
                      onClick={onSignOut}
                      title={`Signed in as ${user.email}. Click to sign out.`}
                      aria-label="Sign out"
                      className="inline-flex items-center justify-center text-[#E2E8E4] hover:text-[#859D8E] liquid-glass-pill p-1 rounded-full transition-all duration-150 cursor-pointer active:scale-95 border border-[#4A5A4F]/30 shadow-xs group"
                    >
                      <LogOut className="w-2.5 h-2.5 text-[#859D8E] group-hover:text-[#9BB5A5] transition-transform duration-200 group-hover:scale-110" />
                    </button>
                  )
                : onOpenAuth && (
                    <button
                      type="button"
                      onClick={onOpenAuth}
                      title="Sign In"
                      aria-label="Sign In"
                      className="inline-flex items-center justify-center text-[#E2E8E4] hover:text-white liquid-glass-pill p-1 rounded-full transition-all duration-150 cursor-pointer active:scale-95 border border-[#4A5A4F]/30"
                    >
                      <UserIcon className="w-2.5 h-2.5 text-[#859D8E]" />
                    </button>
                  )}
            </>
          )}
        </div>
      </div>

      {/* Routine Content: Permanently visible with elegant champagne typography */}
      <div className="mt-0.5 sm:mt-1">
        {/* Warmup flow */}
        <p className="text-[#CCD6CF] text-[10px] sm:text-xs mb-0.5 leading-tight text-center select-none font-semibold">
          {SPLIT_HEADER_TEXT.overview}
        </p>

        {/* Days split - 3 columns on desktop, clean compact glass rows on mobile */}
        <div className="space-y-0.5 md:space-y-0 md:grid md:grid-cols-3 md:gap-1.5 text-[#E2E8E4] text-[10px] sm:text-xs mb-0.5 font-medium">
          {SPLIT_HEADER_TEXT.days.map((dayText, idx) => (
            <div
              key={idx}
              className="liquid-glass-pill px-2 py-0.5 md:px-2.5 md:py-1 rounded-md md:rounded-lg flex items-center shadow-xs"
            >
              <p className="leading-tight sm:leading-snug">{dayText}</p>
            </div>
          ))}
        </div>

        {/* Thin separator line */}
        <hr className="border-[#4A5A4F]/20 my-0.5" />

        {/* Warmup guidelines */}
        <p className="text-[#FFFDF8] text-[10px] sm:text-xs font-bold tracking-tight mb-0.5 text-center">
          {SPLIT_HEADER_TEXT.pyramidWarmup}
        </p>

        {/* Sets and reps guidelines */}
        <p className="text-[#FFFDF8] text-[10px] sm:text-xs font-bold tracking-tight mb-0.5 text-center">
          {SPLIT_HEADER_TEXT.guidelines}
        </p>

        {/* Separator before Cardio guidelines */}
        <hr className="border-[#4A5A4F]/20 my-0.5" />

        {/* Cardio guidelines */}
        <div className="text-[#FFFDF8] text-[10px] sm:text-xs font-bold tracking-tight mb-0.5 text-center leading-tight">
          <p>Cardio - we are counting cardio via sports &amp; running, for sports we don't follow any metric</p>
          <p>For running, run X km in X mins/hrs</p>
        </div>

        {/* Short instruction */}
        <p className="text-[#8A968E] text-[9px] sm:text-[11px] leading-tight sm:leading-snug text-center max-w-4xl mx-auto font-medium">
          {SPLIT_HEADER_TEXT.instruction}
        </p>
      </div>
    </div>
  );
};
