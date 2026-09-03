import React from "react";
import { SPLIT_HEADER_TEXT } from "../constants/workoutConfig";

export const SplitHeader: React.FC = () => {
  return (
    <div className="w-full bg-[#121214] border border-[#27272a] rounded-2xl p-5 md:p-6 shadow-2xl">
      {/* Exactly one heading */}
      <h1 className="text-center text-white text-base md:text-lg font-bold tracking-tight mb-3">
        {SPLIT_HEADER_TEXT.title}
      </h1>

      {/* Dynamic warmup flow */}
      <p className="text-zinc-400 text-xs md:text-sm mb-4 leading-normal">
        {SPLIT_HEADER_TEXT.overview}
      </p>

      {/* Days split */}
      <div className="space-y-2 text-zinc-300 text-xs md:text-sm mb-4">
        {SPLIT_HEADER_TEXT.days.map((dayText, idx) => (
          <p key={idx} className="leading-relaxed">
            {dayText}
          </p>
        ))}
      </div>

      {/* Thin dark separator line */}
      <hr className="border-[#27272a] my-4" />

      {/* Sets and reps guidelines */}
      <p className="text-zinc-300 text-xs md:text-sm mb-3">
        {SPLIT_HEADER_TEXT.guidelines}
      </p>

      {/* Merged short instruction */}
      <p className="text-zinc-400 text-xs md:text-sm leading-relaxed">
        {SPLIT_HEADER_TEXT.instruction}
      </p>
    </div>
  );
};
