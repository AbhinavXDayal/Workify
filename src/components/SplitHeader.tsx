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
    <div className="w-full max-w-full overflow-hidden bg-[#F6F3EC] border border-[#DDD7CB] rounded-xl sm:rounded-3xl p-1.5 sm:p-3 md:p-4 shadow-[0_4px_24px_rgba(0,0,0,0.28)] transition-all duration-200">
      {/* Header Bar: Title on left, Account pill embedded on right */}
      <div className="flex items-center justify-between gap-2 pb-1.5 sm:pb-2 border-b border-[#E3DDD1] min-w-0">
        <h1 className="text-[#221E1B] text-xs sm:text-base font-bold tracking-wider select-none shrink-0">
          {SPLIT_HEADER_TEXT.title}
        </h1>

        {/* User Account / Sign In embedded inside Workify section */}
        <div className="flex items-center">
          {!authLoading && (
            <>
              {user ? (
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 sm:py-1 rounded-full bg-[#FFFFFF] border border-[#D8D2C5] hover:border-[#466A51]/60 shadow-xs transition-colors">
                  <span className="text-[#342E29] text-xs font-mono tracking-tight max-w-[130px] sm:max-w-[200px] truncate">
                    {user.email}
                  </span>
                  {onSignOut && (
                    <button
                      type="button"
                      onClick={onSignOut}
                      title="Sign Out"
                      className="p-0.5 rounded-full text-[#7A7266] hover:text-[#221E1B] hover:bg-[#EFEBE3] transition-colors cursor-pointer active:scale-95"
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
                    className="inline-flex items-center gap-1 text-[#221E1B] hover:text-black text-xs font-medium bg-[#FFFFFF] hover:bg-[#FAF7F2] border border-[#D8D2C5] hover:border-[#466A51]/60 px-2.5 py-0.5 sm:py-1 rounded-full transition-all duration-150 cursor-pointer shadow-xs active:scale-95"
                  >
                    <UserIcon className="w-3 h-3 text-[#466A51]" />
                    <span>Sign In</span>
                  </button>
                )
              )}
            </>
          )}
        </div>
      </div>

      {/* Routine Content: Permanently visible */}
      <div className="mt-1.5 pt-1">
        {/* Warmup flow */}
        <p className="text-[#6A6359] text-[10.5px] sm:text-xs mb-1.5 leading-snug text-center select-none font-normal">
          {SPLIT_HEADER_TEXT.overview}
        </p>

        {/* Days split - 3 columns on desktop, compact on mobile */}
        <div className="space-y-0.5 md:space-y-0 md:grid md:grid-cols-3 md:gap-2 text-[#342E29] text-[10.5px] sm:text-xs mb-1.5">
          {SPLIT_HEADER_TEXT.days.map((dayText, idx) => (
            <div
              key={idx}
              className="md:bg-[#EDE8DE] md:border md:border-[#DDD7CB] md:p-2 md:rounded-xl flex items-center"
            >
              <p className="leading-tight sm:leading-normal">{dayText}</p>
            </div>
          ))}
        </div>

        {/* Thin separator line */}
        <hr className="border-[#E3DDD1] my-1 sm:my-1.5" />

        {/* Sets and reps guidelines */}
        <p className="text-[#221E1B] text-[10.5px] sm:text-xs font-semibold tracking-tight mb-0.5 text-center">
          {SPLIT_HEADER_TEXT.guidelines}
        </p>

        {/* Short instruction */}
        <p className="text-[#6A6359] text-[10px] sm:text-[11px] leading-tight text-center max-w-4xl mx-auto">
          {SPLIT_HEADER_TEXT.instruction}
        </p>
      </div>
    </div>
  );
};
