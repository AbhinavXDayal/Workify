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
    <div className="grid grid-cols-3 gap-2 sm:gap-3 w-full">
      {days.map((dayKey) => {
        const isActive = activeDay === dayKey;
        const config = WORKOUT_DAYS_CONFIG[dayKey];

        return (
          <button
            key={dayKey}
            type="button"
            onClick={() => onSelectDay(dayKey)}
            className={`py-2.5 sm:py-3 px-1 sm:px-4 rounded-xl text-xs sm:text-sm font-medium transition-colors text-center cursor-pointer border ${
              isActive
                ? "bg-[#27272a] border-zinc-500/80 text-white shadow-sm"
                : "bg-[#18181b] border-[#27272a] text-zinc-400 hover:text-zinc-200 hover:bg-[#202024]"
            }`}
          >
            {config.label}
          </button>
        );
      })}
    </div>
  );
};
