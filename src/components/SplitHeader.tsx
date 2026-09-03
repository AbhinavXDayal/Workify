import React from "react";
import { SPLIT_HEADER_TEXT } from "../constants/workoutConfig";

export const SplitHeader: React.FC = () => {
  return (
    <div className="w-full bg-[#15221D]/90 backdrop-blur-md border border-[#253930] rounded-2xl p-4.5 sm:p-6 shadow-[0_8px_32px_rgba(0,0,0,0.45)] transition-all duration-200">
      {/* Exactly one heading - matching portfolio typography */}
      <h1 className="text-center text-[#EAF1EC] text-base sm:text-lg font-bold tracking-wider mb-3 select-none">
        {SPLIT_HEADER_TEXT.title}
      </h1>

      {/* Dynamic warmup flow */}
      <p className="text-[#8FA898] text-xs sm:text-[13px] mb-4 leading-normal text-center select-none font-normal">
        {SPLIT_HEADER_TEXT.overview}
      </p>

      {/* Days split */}
      <div className="space-y-2 text-[#C8DACF] text-xs sm:text-[13px] mb-4">
        {SPLIT_HEADER_TEXT.days.map((dayText, idx) => (
          <p key={idx} className="leading-relaxed">
            {dayText}
          </p>
        ))}
      </div>

      {/* Thin dark sage separator line */}
      <hr className="border-[#253930] my-4" />

      {/* Sets and reps guidelines */}
      <p className="text-[#EAF1EC] text-xs sm:text-[13px] font-medium tracking-tight mb-3">
        {SPLIT_HEADER_TEXT.guidelines}
      </p>

      {/* Merged short instruction */}
      <p className="text-[#8FA898] text-xs sm:text-[12.5px] leading-relaxed">
        {SPLIT_HEADER_TEXT.instruction}
      </p>
    </div>
  );
};
