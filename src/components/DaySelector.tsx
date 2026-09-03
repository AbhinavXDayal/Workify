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
    <div className="p-1 bg-[#101B16]/95 border border-[#253930] rounded-xl grid grid-cols-3 gap-1 shadow-inner w-full">
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
                ? "bg-[#1F3229] border-[#3E6349] text-[#EAF1EC] shadow-xs"
                : "bg-transparent border-transparent text-[#8FA898] hover:text-[#EAF1EC] hover:bg-[#15221D]/70 active:scale-[0.98]"
            }`}
          >
            {config.label}
          </button>
        );
      })}
    </div>
  );
};
