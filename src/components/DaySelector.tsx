import React from "react";
import type { WorkoutDay } from "../types/workout";
import { WORKOUT_DAYS_CONFIG } from "../constants/workoutConfig";

interface DaySelectorProps {
  activeDay: WorkoutDay;
  onSelectDay: (day: WorkoutDay) => void;
}

export const DaySelector: React.FC<DaySelectorProps> = ({
  activeDay,
  onSelectDay,
}) => {
  const days: WorkoutDay[] = ["mon_thu", "tue_fri", "wed"];

  return (
    <div className="p-1 bg-[#0e0e12]/95 border border-white/[0.07] rounded-xl grid grid-cols-3 gap-1 shadow-inner w-full">
      {days.map((dayKey) => {
        const isActive = activeDay === dayKey;
        const config = WORKOUT_DAYS_CONFIG[dayKey];

        return (
          <button
            key={dayKey}
            type="button"
            onClick={() => onSelectDay(dayKey)}
            className={`py-2 sm:py-2.5 px-1 sm:px-3 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 text-center cursor-pointer select-none border ${
              isActive
                ? "bg-zinc-800/90 border-white/[0.1] text-white shadow-xs"
                : "bg-transparent border-transparent text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04] active:scale-[0.98]"
            }`}
          >
            {config.label}
          </button>
        );
      })}
    </div>
  );
};
