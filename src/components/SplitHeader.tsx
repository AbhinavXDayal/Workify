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
    <div className="w-full max-w-full overflow-hidden liquid-glass-card rounded-xl sm:rounded-3xl p-2 sm:p-3.5 md:p-4 transition-all duration-200 shrink-0">
      {/* Header Bar: Title on left, Account pill embedded on right */}
      <div className="flex items-center justify-between gap-2 pb-1.5 sm:pb-2 border-b border-[#382C24]/12 min-w-0">
        <h1 className="text-[#382C24] text-sm sm:text-lg font-bold tracking-wide select-none shrink-0">
          {SPLIT_HEADER_TEXT.title}
        </h1>

        {/* User Account / Sign In embedded inside Workify section */}
        <div className="flex items-center">
          {!authLoading && (
            <>
              {user ? (
                <div className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full liquid-glass-pill transition-colors">
                  <span className="text-[#382C24] text-xs sm:text-sm font-mono font-semibold tracking-tight max-w-[130px] sm:max-w-[200px] truncate">
                    {user.email}
                  </span>
                  {onSignOut && (
                    <button
                      type="button"
                      onClick={onSignOut}
                      title="Sign Out"
                      className="p-0.5 rounded-full text-[#7C6A5D] hover:text-[#382C24] hover:bg-white/60 transition-colors cursor-pointer active:scale-95"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ) : (
                onOpenAuth && (
                  <button
                    type="button"
                    onClick={onOpenAuth}
                    className="inline-flex items-center gap-1.5 text-[#382C24] hover:text-[#1F1713] text-xs sm:text-sm font-semibold liquid-glass-pill px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full transition-all duration-150 cursor-pointer active:scale-95"
                  >
                    <UserIcon className="w-3.5 h-3.5 text-[#7C583F]" />
                    <span>Sign In</span>
                  </button>
                )
              )}
            </>
          )}
        </div>
      </div>

      {/* Routine Content: Permanently visible with darkish dullish brown typography */}
      <div className="mt-1.5 sm:mt-2 pt-0.5 sm:pt-1">
        {/* Warmup flow */}
        <p className="text-[#564539] text-xs sm:text-sm mb-1 sm:mb-1.5 leading-snug text-center select-none font-semibold">
          {SPLIT_HEADER_TEXT.overview}
        </p>

        {/* Days split - 3 columns on desktop, clean compact glass rows on mobile */}
        <div className="space-y-1 md:space-y-0 md:grid md:grid-cols-3 md:gap-2 text-[#44352B] text-xs sm:text-sm mb-1 sm:mb-1.5 font-medium">
          {SPLIT_HEADER_TEXT.days.map((dayText, idx) => (
            <div
              key={idx}
              className="liquid-glass-pill px-2.5 py-1 md:p-2 rounded-lg md:rounded-xl flex items-center shadow-xs"
            >
              <p className="leading-snug sm:leading-normal">{dayText}</p>
            </div>
          ))}
        </div>

        {/* Thin separator line */}
        <hr className="border-[#382C24]/12 my-1 sm:my-1.5" />

        {/* Sets and reps guidelines */}
        <p className="text-[#382C24] text-xs sm:text-sm font-bold tracking-tight mb-0.5 sm:mb-1 text-center">
          {SPLIT_HEADER_TEXT.guidelines}
        </p>

        {/* Short instruction */}
        <p className="text-[#5C4B3F] text-[11px] sm:text-[12.5px] leading-snug sm:leading-relaxed text-center max-w-4xl mx-auto font-medium">
          {SPLIT_HEADER_TEXT.instruction}
        </p>
      </div>
    </div>
  );
};
