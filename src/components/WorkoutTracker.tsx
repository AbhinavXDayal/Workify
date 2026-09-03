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
            exerciseName: "",
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
    <div className="w-full max-w-full liquid-glass-card rounded-2xl sm:rounded-3xl p-2.5 pb-5 sm:p-5 sm:pb-8 md:p-6 flex flex-col flex-1 min-h-0 transition-all duration-200">
      {/* 1. Day Selector Tabs with soft rounded corners */}
      <div className="shrink-0 mb-1.5 sm:mb-2">
        <DaySelector activeDay={activeDay} onSelectDay={onSelectDay} />
      </div>

      {/* 2. Muscle Groups & Exercise Rows: cohesive, smooth scrollable on mobile, natural on desktop */}
      <div
        key={activeDay}
        className="flex-1 min-h-0 overflow-y-auto sm:overflow-visible overscroll-contain pr-0.5 pb-2 sm:pb-4 space-y-1.5 sm:space-y-3.5 day-transition custom-glass-scrollbar"
      >
        {groupedSlots.map((group, groupIdx) => (
          <div key={group.name} className="space-y-1 sm:space-y-1.5">
            {/* Muscle Group Title with warm brown accent indicator */}
            <div className="flex items-center gap-1.5 px-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#85583D] shadow-[0_0_6px_rgba(133,88,61,0.5)]" />
              <h3 className="text-[10px] sm:text-xs font-bold text-[#382C24] tracking-wider uppercase select-none">
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
                    groupName={group.name}
                  />

                  {/* KG Input with inline 'kg' unit badge inside the same box */}
                  <div className="relative w-[56px] sm:w-24 md:w-28 h-8 sm:h-9 liquid-glass-input rounded-xl sm:rounded-2xl flex items-center justify-between px-1.5 sm:px-2 font-mono shrink-0 cursor-text">
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
                      className="w-0 flex-1 min-w-0 bg-transparent text-right text-[11px] sm:text-sm text-[#382C24] font-semibold placeholder-[#998677] focus:outline-none font-mono pr-0.5"
                    />
                    <span className="text-[9.5px] sm:text-xs text-[#7C583F] font-bold select-none shrink-0 pointer-events-none ml-0.5">
                      kg
                    </span>
                  </div>

                  {/* Reps Input with inline 'reps' unit badge inside the same box */}
                  <div className="relative w-[62px] sm:w-24 md:w-28 h-8 sm:h-9 liquid-glass-input rounded-xl sm:rounded-2xl flex items-center justify-between px-1.5 sm:px-2 font-mono shrink-0 cursor-text">
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
                      className="w-0 flex-1 min-w-0 bg-transparent text-right text-[11px] sm:text-sm text-[#382C24] font-semibold placeholder-[#998677] focus:outline-none font-mono pr-0.5"
                    />
                    <span className="text-[9.5px] sm:text-xs text-[#7C583F] font-bold select-none shrink-0 pointer-events-none ml-0.5">
                      reps
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Subtle separator between muscle groups */}
            {groupIdx < groupedSlots.length - 1 && (
              <div className="h-[1px] bg-[#382C24]/10 my-0.5 sm:my-2" />
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
