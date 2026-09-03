import React, { useState, useEffect, useRef } from "react";
import { ChevronDown } from "lucide-react";
import { SPLIT_HEADER_TEXT } from "../constants/workoutConfig";

export const SplitHeader: React.FC = () => {
  const [isOpen, setIsOpen] = useState<boolean>(true);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    // Visible for 30 seconds, then auto-toggles closed
    timerRef.current = setTimeout(() => {
      setIsOpen(false);
    }, 30000);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  const handleToggle = () => {
    // Cancel the timer on manual toggle
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setIsOpen((prev) => !prev);
  };

  return (
    <div className="w-full bg-[#15221D]/90 backdrop-blur-md border border-[#253930] rounded-2xl sm:rounded-3xl p-3 sm:p-4 md:p-5 shadow-[0_4px_20px_rgba(0,0,0,0.35)] transition-all duration-300">
      {/* Clean Header Bar: Pure title + toggle chevron */}
      <div
        onClick={handleToggle}
        className="flex items-center justify-between cursor-pointer select-none"
        title={isOpen ? "Click to collapse" : "Click to expand"}
      >
        <h1 className="text-[#EAF1EC] text-sm sm:text-base md:text-lg font-bold tracking-wider">
          {SPLIT_HEADER_TEXT.title}
        </h1>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            handleToggle();
          }}
          className="p-1 rounded-full text-[#8FA898] hover:text-[#EAF1EC] hover:bg-[#1A2922] transition-colors cursor-pointer active:scale-95"
          aria-label={isOpen ? "Collapse" : "Expand"}
        >
          <ChevronDown
            className={`w-4 h-4 text-[#7EA984] transition-transform duration-300 ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </button>
      </div>

      {/* Routine Content: Visible for 30 seconds initially, togglable anytime */}
      <div
        className={`transition-all duration-300 ease-in-out overflow-hidden ${
          isOpen
            ? "max-h-[800px] opacity-100 mt-2.5 pt-2 border-t border-[#253930]/60"
            : "max-h-0 opacity-0 pointer-events-none"
        }`}
      >
        {/* Warmup flow */}
        <p className="text-[#8FA898] text-[11px] sm:text-xs mb-2 sm:mb-2.5 leading-snug text-center select-none font-normal">
          {SPLIT_HEADER_TEXT.overview}
        </p>

        {/* Days split - 3 columns on desktop, stacked on mobile */}
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

        {/* Short instruction */}
        <p className="text-[#8FA898] text-[10.5px] sm:text-xs leading-relaxed text-center max-w-4xl mx-auto">
          {SPLIT_HEADER_TEXT.instruction}
        </p>
      </div>
    </div>
  );
};
