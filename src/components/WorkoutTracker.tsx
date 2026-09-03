import React from "react";
import { DaySelector } from "./DaySelector";
import { AestheticSelect } from "./AestheticSelect";
import { HistoryDrawer } from "./HistoryDrawer";
import { WORKOUT_DAYS_CONFIG } from "../constants/workoutConfig";
import type {
  WorkoutDay,
  ExerciseSlotState,
  WorkoutLogHistoryItem,
} from "../types/workout";

interface WorkoutTrackerProps {
  activeDay: WorkoutDay;
  onSelectDay: (day: WorkoutDay) => void;
  slots: ExerciseSlotState[];
  onUpdateSlot: (
    index: number,
    field: "exerciseName" | "weightKg" | "reps",
    value: string,
  ) => void;
  onSaveWorkout?: () => void;
  onClearEntries?: () => void;
  status?: string;
  statusMessage?: string;
  history?: WorkoutLogHistoryItem[];
  showHistory?: boolean;
  onToggleHistory?: (show: boolean) => void;
  isWorkifyCollapsed?: boolean;
}

export const WorkoutTracker: React.FC<WorkoutTrackerProps> = ({
  activeDay,
  onSelectDay,
  slots,
  onUpdateSlot,
  history = [],
  showHistory = false,
  onToggleHistory,
}) => {
  const dayConfig = WORKOUT_DAYS_CONFIG[activeDay];

  // Group slots by muscle group according to configuration
  const groupedSlots = dayConfig.groups.map((group) => {
    const groupSlotsWithIndex: {
      slot: ExerciseSlotState;
      globalIndex: number;
    }[] = [];

    for (let i = 0; i < group.slotsCount; i++) {
      const globalIdx = slots.findIndex(
        (s) => s.muscleGroup === group.name && s.slotNumber === i,
      );

      if (globalIdx !== -1) {
        groupSlotsWithIndex.push({
          slot: slots[globalIdx],
          globalIndex: globalIdx,
        });
      } else {
        groupSlotsWithIndex.push({
          slot: {
            muscleGroup: group.name,
            slotNumber: i,
            exerciseName:
              group.name === "Back" && group.options[i] ? group.options[i] : "",
            weightKg: "",
            reps: String(group.defaultReps),
            defaultReps: group.defaultReps,
          },
          globalIndex: -1,
        });
      }
    }
    return {
      name: group.name,
      options: group.options,
      slots: groupSlotsWithIndex,
    };
  });

  return (
    <div className="w-full max-w-full overflow-hidden bg-[#F6F3EC] border border-[#DDD7CB] rounded-2xl sm:rounded-3xl p-2.5 pb-6 sm:p-5 sm:pb-8 md:p-6 shadow-[0_8px_32px_rgba(0,0,0,0.3)] space-y-2 sm:space-y-4 transition-all duration-200">
      {/* 1. Day Selector Tabs with soft rounded corners */}
      <div className="shrink-0 mb-1">
        <DaySelector activeDay={activeDay} onSelectDay={onSelectDay} />
      </div>

      {/* 2. Muscle Groups & Exercise Rows: cohesive, compact spacing with fixed bottom */}
      <div key={activeDay} className="space-y-2 sm:space-y-3.5 day-transition">
        {groupedSlots.map((group, groupIdx) => (
          <div key={group.name} className="space-y-1 sm:space-y-1.5">
            {/* Muscle Group Title with soft accent indicator */}
            <div className="flex items-center gap-1 px-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#466A51]" />
              <h3 className="text-[10px] sm:text-xs font-bold text-[#221E1B] tracking-wider uppercase select-none">
                {group.name}
              </h3>
            </div>

            {/* Exercise Slots */}
            <div className="space-y-1 sm:space-y-1.5">
              {group.slots.map(({ slot, globalIndex }) => (
                <div
                  key={`${slot.muscleGroup}-${slot.slotNumber}`}
                  className="group flex items-center gap-1.5 sm:gap-3 w-full min-w-0"
                >
                  {/* Custom Aesthetic Dropdown with Soft Rounded Corners */}
                  <AestheticSelect
                    value={slot.exerciseName}
                    onChange={(val) =>
                      onUpdateSlot(globalIndex, "exerciseName", val)
                    }
                    options={group.options}
                    placeholder="Select exercise"
                  />

                  {/* KG Input with soft rounded corners and instant tap selection */}
                  {/* KG Input with inline 'kg' unit badge inside the same box */}
                  <div className="relative w-[56px] sm:w-24 md:w-28 h-8 sm:h-9 bg-[#FFFFFF] border border-[#D8D2C5] hover:border-[#B3AC9D] focus-within:border-[#466A51] focus-within:ring-2 focus-within:ring-[#466A51]/20 rounded-xl sm:rounded-2xl flex items-center justify-between px-1.5 sm:px-2 transition-all duration-150 font-mono shadow-xs shrink-0 cursor-text">
                    <input
                      type="text"
                      inputMode="decimal"
                      pattern="[0-9]*[.]?[0-9]*"
                      value={slot.weightKg}
                      onFocus={(e) => e.target.select()}
                      onChange={(e) =>
                        onUpdateSlot(globalIndex, "weightKg", e.target.value)
                      }
                      placeholder="0"
                      aria-label="Weight (kg)"
                      className="w-0 flex-1 min-w-0 bg-transparent text-right text-[11px] sm:text-sm text-[#221E1B] placeholder-[#9E968A] focus:outline-none font-mono pr-0.5"
                    />
                    <span className="text-[9.5px] sm:text-xs text-[#466A51] font-semibold select-none shrink-0 pointer-events-none ml-0.5">
                      kg
                    </span>
                  </div>

                  {/* Reps Input with inline 'reps' unit badge inside the same box */}
                  <div className="relative w-[62px] sm:w-24 md:w-28 h-8 sm:h-9 bg-[#FFFFFF] border border-[#D8D2C5] hover:border-[#B3AC9D] focus-within:border-[#466A51] focus-within:ring-2 focus-within:ring-[#466A51]/20 rounded-xl sm:rounded-2xl flex items-center justify-between px-1.5 sm:px-2 transition-all duration-150 font-mono shadow-xs shrink-0 cursor-text">
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      value={slot.reps}
                      onFocus={(e) => e.target.select()}
                      onChange={(e) =>
                        onUpdateSlot(globalIndex, "reps", e.target.value)
                      }
                      placeholder={String(slot.defaultReps)}
                      aria-label="Reps"
                      className="w-0 flex-1 min-w-0 bg-transparent text-right text-[11px] sm:text-sm text-[#221E1B] placeholder-[#9E968A] focus:outline-none font-mono pr-0.5"
                    />
                    <span className="text-[9.5px] sm:text-xs text-[#466A51] font-semibold select-none shrink-0 pointer-events-none ml-0.5">
                      reps
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Subtle separator between muscle groups */}
            {groupIdx < groupedSlots.length - 1 && (
              <div className="h-[1px] bg-[#E3DDD1] my-1 sm:my-2" />
            )}
          </div>
        ))}
      </div>

      {/* History Drawer Modal */}
      {onToggleHistory && (
        <HistoryDrawer
          isOpen={showHistory}
          onClose={() => onToggleHistory(false)}
          dayLabel={dayConfig.label}
          history={history}
        />
      )}
    </div>
  );
};
