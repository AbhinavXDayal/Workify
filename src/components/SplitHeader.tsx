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
    <div className="w-full max-w-full overflow-hidden bg-[#F6F3EC] border border-[#DDD7CB] rounded-xl sm:rounded-3xl p-2 sm:p-3.5 md:p-4 shadow-[0_4px_24px_rgba(0,0,0,0.28)] transition-all duration-200">
      {/* Header Bar: Title on left, Account pill embedded on right */}
      <div className="flex items-center justify-between gap-2 pb-1.5 sm:pb-2 border-b border-[#E3DDD1] min-w-0">
        <h1 className="text-[#221E1B] text-sm sm:text-lg font-bold tracking-wide select-none shrink-0">
          {SPLIT_HEADER_TEXT.title}
        </h1>

        {/* User Account / Sign In embedded inside Workify section */}
        <div className="flex items-center">
          {!authLoading && (
            <>
              {user ? (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFFFFF] border border-[#D8D2C5] hover:border-[#466A51]/60 shadow-xs transition-colors">
                  <span className="text-[#342E29] text-xs sm:text-sm font-mono tracking-tight max-w-[130px] sm:max-w-[200px] truncate">
                    {user.email}
                  </span>
                  {onSignOut && (
                    <button
                      type="button"
                      onClick={onSignOut}
                      title="Sign Out"
                      className="p-0.5 rounded-full text-[#7A7266] hover:text-[#221E1B] hover:bg-[#EFEBE3] transition-colors cursor-pointer active:scale-95"
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
                    className="inline-flex items-center gap-1.5 text-[#221E1B] hover:text-black text-xs sm:text-sm font-medium bg-[#FFFFFF] hover:bg-[#FAF7F2] border border-[#D8D2C5] hover:border-[#466A51]/60 px-3 py-1 rounded-full transition-all duration-150 cursor-pointer shadow-xs active:scale-95"
                  >
                    <UserIcon className="w-3.5 h-3.5 text-[#466A51]" />
                    <span>Sign In</span>
                  </button>
                )
              )}
            </>
          )}
        </div>
      </div>

      {/* Routine Content: Permanently visible with increased overall typography */}
      <div className="mt-2 pt-1">
        {/* Warmup flow */}
        <p className="text-[#554E46] text-xs sm:text-sm mb-1.5 leading-snug text-center select-none font-medium">
          {SPLIT_HEADER_TEXT.overview}
        </p>

        {/* Days split - 3 columns on desktop, clean rows on mobile */}
        <div className="space-y-1 md:space-y-0 md:grid md:grid-cols-3 md:gap-2 text-[#2E2824] text-xs sm:text-sm mb-1.5 font-normal">
          {SPLIT_HEADER_TEXT.days.map((dayText, idx) => (
            <div
              key={idx}
              className="bg-[#EDE8DE]/70 md:bg-[#EDE8DE] border border-[#DDD7CB]/70 md:border-[#DDD7CB] px-2.5 py-1.5 md:p-2 rounded-lg md:rounded-xl flex items-center"
            >
              <p className="leading-snug sm:leading-normal">{dayText}</p>
            </div>
          ))}
        </div>

        {/* Thin separator line */}
        <hr className="border-[#E3DDD1] my-1 sm:my-1.5" />

        {/* Sets and reps guidelines */}
        <p className="text-[#221E1B] text-xs sm:text-sm font-bold tracking-tight mb-1 text-center">
          {SPLIT_HEADER_TEXT.guidelines}
        </p>

        {/* Short instruction */}
        <p className="text-[#554E46] text-[11px] sm:text-[12.5px] leading-relaxed text-center max-w-4xl mx-auto font-normal">
          {SPLIT_HEADER_TEXT.instruction}
        </p>
      </div>
    </div>
  );
};
