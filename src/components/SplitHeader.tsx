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
      {/* Header Bar: Title on left, Account pill embedded on right */}
      <div className="flex items-center justify-between gap-2 pb-1 sm:pb-1.5 border-b border-[#4A3222]/12 min-w-0">
        <a
          href="https://github.com/AbhinavXDayal/Workify"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 sm:gap-2 text-[#2E1C12] text-sm sm:text-lg font-extrabold tracking-wide select-none shrink-0 hover:text-[#9C663D] transition-colors duration-200 cursor-pointer no-underline group"
        >
          <img
            src="/workify-logo.jpg"
            alt="Workify Logo"
            className="w-5 h-5 sm:w-7 sm:h-7 rounded-md object-cover shadow-xs"
          />
          <h1 className="inline">{SPLIT_HEADER_TEXT.title}</h1>
          <svg
            className="w-3.5 h-3.5 sm:w-4 sm:h-4 opacity-60 group-hover:opacity-100 transition-opacity fill-current"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
          </svg>
        </a>

        {/* User Account / Sign In embedded inside Workify section */}
        <div className="flex items-center">
          {!authLoading && (
            <>
              {user ? (
                <div className="inline-flex items-center gap-1.5 px-2 py-0.5 sm:px-2.5 sm:py-0.5 rounded-full liquid-glass-pill transition-colors">
                  <span className="text-[#2E1C12] text-[11px] sm:text-xs font-mono font-semibold tracking-tight max-w-[130px] sm:max-w-[200px] truncate">
                    {user.email}
                  </span>
                  {onSignOut && (
                    <button
                      type="button"
                      onClick={onSignOut}
                      title="Sign Out"
                      className="p-0.5 rounded-full text-[#7A6253] hover:text-[#2E1C12] hover:bg-white/60 transition-colors cursor-pointer active:scale-95"
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
                    className="inline-flex items-center gap-1.5 text-[#2E1C12] hover:text-[#1A0E08] text-[11px] sm:text-xs font-semibold liquid-glass-pill px-2 py-0.5 sm:px-2.5 sm:py-0.5 rounded-full transition-all duration-150 cursor-pointer active:scale-95"
                  >
                    <UserIcon className="w-3 h-3 text-[#8A5633]" />
                    <span>Sign In</span>
                  </button>
                )
              )}
            </>
          )}
        </div>
      </div>

      {/* Routine Content: Permanently visible with warm hazy brown typography */}
      <div className="mt-1 sm:mt-1.5">
        {/* Warmup flow */}
        <p className="text-[#543E30] text-[10.5px] sm:text-xs mb-0.5 sm:mb-1 leading-tight text-center select-none font-semibold">
          {SPLIT_HEADER_TEXT.overview}
        </p>

        {/* Days split - 3 columns on desktop, clean compact glass rows on mobile */}
        <div className="space-y-0.5 md:space-y-0 md:grid md:grid-cols-3 md:gap-1.5 text-[#422F22] text-[10.5px] sm:text-xs mb-0.5 sm:mb-1 font-medium">
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
        <hr className="border-[#4A3222]/12 my-0.5 sm:my-1" />

        {/* Sets and reps guidelines */}
        <p className="text-[#2E1C12] text-[10.5px] sm:text-xs font-bold tracking-tight mb-0.5 text-center">
          {SPLIT_HEADER_TEXT.guidelines}
        </p>

        {/* Short instruction */}
        <p className="text-[#5A4333] text-[9.5px] sm:text-[11.5px] leading-tight sm:leading-snug text-center max-w-4xl mx-auto font-medium">
          {SPLIT_HEADER_TEXT.instruction}
        </p>
      </div>
    </div>
  );
};
