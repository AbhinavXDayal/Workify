import React from "react";
import { SPLIT_HEADER_TEXT } from "../constants/workoutConfig";

export const SplitHeader: React.FC = () => {
  return (
    <div className="w-full bg-[#121215]/85 backdrop-blur-md border border-white/[0.07] rounded-2xl p-4.5 sm:p-6 shadow-[0_6px_28px_rgba(0,0,0,0.45)] transition-all duration-200">
      {/* Exactly one heading - slightly more prominent with clean tracking */}
      <h1 className="text-center text-white text-base sm:text-lg font-bold tracking-wider mb-3 select-none">
        {SPLIT_HEADER_TEXT.title}
      </h1>

      {/* Dynamic warmup flow */}
      <p className="text-zinc-400 text-xs sm:text-[13px] mb-4 leading-normal text-center select-none font-normal">
        {SPLIT_HEADER_TEXT.overview}
      </p>

      {/* Days split */}
      <div className="space-y-2 text-zinc-300 text-xs sm:text-[13px] mb-4">
        {SPLIT_HEADER_TEXT.days.map((dayText, idx) => (
          <p key={idx} className="leading-relaxed">
            {dayText}
          </p>
        ))}
      </div>

      {/* Thin dark separator line */}
      <hr className="border-white/[0.07] my-4" />

      {/* Sets and reps guidelines */}
      <p className="text-zinc-200 text-xs sm:text-[13px] font-medium tracking-tight mb-3">
        {SPLIT_HEADER_TEXT.guidelines}
      </p>

      {/* Merged short instruction */}
      <p className="text-zinc-400 text-xs sm:text-[12.5px] leading-relaxed">
        {SPLIT_HEADER_TEXT.instruction}
      </p>
    </div>
  );
};
