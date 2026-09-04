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
    <div className="w-full max-w-full overflow-hidden liquid-glass-card rounded-xl sm:rounded-2xl px-2.5 py-1.5 sm:px-4 sm:py-2.5 transition-all duration-200 shrink-0">
      {/* Header Bar: Title on left, Account pill embedded on right */}
      <div className="flex items-center justify-between gap-2 pb-1 sm:pb-1.5 border-b border-[#382C24]/12 min-w-0">
        <a
          href="https://github.com/AbhinavXDayal/Workify"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#382C24] text-sm sm:text-lg font-extrabold tracking-wide select-none shrink-0 hover:text-[#85583D] transition-colors duration-200 cursor-pointer no-underline"
        >
          <h1 className="inline">{SPLIT_HEADER_TEXT.title}</h1>
        </a>

        {/* User Account / Sign In embedded inside Workify section */}
        <div className="flex items-center">
          {!authLoading && (
            <>
              {user ? (
                <div className="inline-flex items-center gap-1.5 px-2 py-0.5 sm:px-2.5 sm:py-0.5 rounded-full liquid-glass-pill transition-colors">
                  <span className="text-[#382C24] text-[11px] sm:text-xs font-mono font-semibold tracking-tight max-w-[130px] sm:max-w-[200px] truncate">
                    {user.email}
                  </span>
                  {onSignOut && (
                    <button
                      type="button"
                      onClick={onSignOut}
                      title="Sign Out"
                      className="p-0.5 rounded-full text-[#7C6A5D] hover:text-[#382C24] hover:bg-white/60 transition-colors cursor-pointer active:scale-95"
                    >
                      <LogOut className="w-3 h-3" />
                    </button>
                  )}
                </div>
              ) : (
                onOpenAuth && (
                  <button
                    type="button"
                    onClick={onOpenAuth}
                    className="inline-flex items-center gap-1.5 text-[#382C24] hover:text-[#1F1713] text-[11px] sm:text-xs font-semibold liquid-glass-pill px-2 py-0.5 sm:px-2.5 sm:py-0.5 rounded-full transition-all duration-150 cursor-pointer active:scale-95"
                  >
                    <UserIcon className="w-3 h-3 text-[#7C583F]" />
                    <span>Sign In</span>
                  </button>
                )
              )}
            </>
          )}
        </div>
      </div>

      {/* Routine Content: Permanently visible with darkish dullish brown typography */}
      <div className="mt-1 sm:mt-1.5">
        {/* Warmup flow */}
        <p className="text-[#564539] text-[10.5px] sm:text-xs mb-0.5 sm:mb-1 leading-tight text-center select-none font-semibold">
          {SPLIT_HEADER_TEXT.overview}
        </p>

        {/* Days split - 3 columns on desktop, clean compact glass rows on mobile */}
        <div className="space-y-0.5 md:space-y-0 md:grid md:grid-cols-3 md:gap-1.5 text-[#44352B] text-[10.5px] sm:text-xs mb-0.5 sm:mb-1 font-medium">
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
        <hr className="border-[#382C24]/12 my-0.5 sm:my-1" />

        {/* Sets and reps guidelines */}
        <p className="text-[#382C24] text-[10.5px] sm:text-xs font-bold tracking-tight mb-0.5 text-center">
          {SPLIT_HEADER_TEXT.guidelines}
        </p>

        {/* Short instruction */}
        <p className="text-[#5C4B3F] text-[9.5px] sm:text-[11.5px] leading-tight sm:leading-snug text-center max-w-4xl mx-auto font-medium">
          {SPLIT_HEADER_TEXT.instruction}
        </p>
      </div>
    </div>
  );
};
