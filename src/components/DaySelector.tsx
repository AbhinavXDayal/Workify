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
    <div className="p-0.5 sm:p-1 liquid-glass-pill rounded-xl sm:rounded-2xl grid grid-cols-3 gap-0.5 w-full">
      {days.map((dayKey) => {
        const isActive = activeDay === dayKey;
        const config = WORKOUT_DAYS_CONFIG[dayKey];

        return (
          <button
            key={dayKey}
            type="button"
            onClick={() => onSelectDay(dayKey)}
            className={`py-1 sm:py-1.5 px-1 sm:px-3 rounded-lg sm:rounded-xl text-[11px] sm:text-xs transition-all duration-150 text-center cursor-pointer select-none border ${
              isActive
                ? "bg-white/95 border-white text-[#382C24] shadow-[0_2px_8px_rgba(0,0,0,0.1),inset_0_1px_1px_rgba(255,255,255,1)] font-bold"
                : "bg-transparent border-transparent text-[#726053] hover:text-[#382C24] hover:bg-white/35 active:scale-[0.98] font-medium"
            }`}
          >
            {config.label}
          </button>
        );
      })}
    </div>
  );
};
