import React, { useState } from "react";
import { SPLIT_HEADER_TEXT } from "../constants/workoutConfig";

export const SplitHeader: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="w-full bg-[#15221D]/90 backdrop-blur-md border border-[#253930] rounded-2xl sm:rounded-3xl p-3 sm:p-5 md:p-6 shadow-[0_4px_20px_rgba(0,0,0,0.35)] transition-all duration-200">
      {/* Title - compact with subtle tracking */}
      <h1 className="text-center text-[#EAF1EC] text-sm sm:text-base md:text-lg font-bold tracking-wider mb-1 select-none">
        {SPLIT_HEADER_TEXT.title}
      </h1>

      {/* Warmup flow */}
      <p className="text-[#8FA898] text-[11px] sm:text-xs mb-2 sm:mb-2.5 leading-snug text-center select-none font-normal">
        {SPLIT_HEADER_TEXT.overview}
      </p>

      {/* Days split - ultra-compact on mobile, 3 columns on tablet/desktop */}
      <div className="space-y-1 md:space-y-0 md:grid md:grid-cols-3 md:gap-2.5 text-[#C8DACF] text-[11px] sm:text-xs mb-2 sm:mb-2.5">
        {SPLIT_HEADER_TEXT.days.map((dayText, idx) => (
          <div
            key={idx}
            className="md:bg-[#1A2922]/50 md:border md:border-[#253930]/60 md:p-2.5 md:rounded-xl flex items-center"
          >
            <p className="leading-tight sm:leading-normal">{dayText}</p>
          </div>
        ))}
      </div>

      {/* Thin dark sage separator line */}
      <hr className="border-[#253930]/60 my-1.5 sm:my-2" />

      {/* Sets and reps guidelines */}
      <p className="text-[#EAF1EC] text-[11px] sm:text-xs font-medium tracking-tight mb-1 text-center">
        {SPLIT_HEADER_TEXT.guidelines}
      </p>

      {/* Short instruction - tap to toggle full text on mobile, compact by default */}
      <div
        onClick={() => setIsExpanded((prev) => !prev)}
        className="cursor-pointer"
        title="Tap to expand/collapse full instructions"
      >
        <p
          className={`text-[#8FA898] text-[10.5px] sm:text-xs leading-relaxed text-center max-w-4xl mx-auto transition-all duration-200 ${
            isExpanded ? "" : "line-clamp-2 sm:line-clamp-none"
          }`}
        >
          {SPLIT_HEADER_TEXT.instruction}
        </p>
      </div>
    </div>
  );
};
