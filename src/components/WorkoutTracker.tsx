import React from "react";
import { Check, Loader2, AlertCircle } from "lucide-react";
import { DaySelector } from "./DaySelector";
import { AestheticSelect } from "./AestheticSelect";
import { HistoryDrawer } from "./HistoryDrawer";
import { WORKOUT_DAYS_CONFIG } from "../constants/workoutConfig";
import type {
  WorkoutDay,
  ExerciseSlotState,
  WorkoutLogHistoryItem,
} from "../types/workout";
import type { SaveStatus } from "../hooks/useWorkoutLogger";

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
  status: SaveStatus;
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
  status,
  statusMessage,
  history = [],
  showHistory = false,
  onToggleHistory,
  isWorkifyCollapsed = false,
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
    <div
      className={`w-full bg-[#15221D] border border-[#253930] rounded-2xl sm:rounded-3xl p-2 sm:p-5 md:p-6 shadow-[0_8px_32px_rgba(0,0,0,0.45)] transition-all duration-300 flex flex-col justify-between overflow-hidden ${
        isWorkifyCollapsed ? "flex-1 h-full min-h-0" : "flex-shrink-0"
      }`}
    >
      {/* 1. Day Selector Tabs with soft rounded corners */}
      <div className="shrink-0 mb-1">
        <DaySelector activeDay={activeDay} onSelectDay={onSelectDay} />
      </div>

      {/* 2. Muscle Groups & Exercise Rows with smooth day-switch transition */}
      <div
        key={activeDay}
        className={`w-full overflow-y-auto sm:overflow-visible day-transition ${
          isWorkifyCollapsed
            ? "flex-1 flex flex-col justify-around py-1 min-h-0"
            : "space-y-1.5 sm:space-y-4"
        }`}
      >
        {groupedSlots.map((group, groupIdx) => (
          <div key={group.name} className="space-y-1 sm:space-y-2">
            {/* Muscle Group Title with soft accent indicator */}
            <div className="flex items-center gap-1 px-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#7EA984]/80" />
              <h3 className="text-[10px] sm:text-xs font-semibold text-[#EAF1EC] tracking-wider uppercase select-none">
                {group.name}
              </h3>
            </div>

            {/* Exercise Slots */}
            <div className="space-y-1 sm:space-y-1.5">
              {group.slots.map(({ slot, globalIndex }) => (
                <div
                  key={`${slot.muscleGroup}-${slot.slotNumber}`}
                  className="group flex items-center gap-1.5 sm:gap-3"
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
                  <div className="w-13 sm:w-28 md:w-36 shrink-0">
                    <input
                      type="text"
                      inputMode="decimal"
                      pattern="[0-9]*[.]?[0-9]*"
                      value={slot.weightKg}
                      onFocus={(e) => e.target.select()}
                      onChange={(e) =>
                        onUpdateSlot(globalIndex, "weightKg", e.target.value)
                      }
                      placeholder="kg"
                      className="w-full bg-[#1A2922] border border-[#253930] hover:border-[#3E6349] focus:border-[#7EA984] focus:ring-2 focus:ring-[#7EA984]/20 rounded-xl sm:rounded-2xl px-1.5 sm:px-3 py-1.5 sm:py-2 text-center text-xs sm:text-sm text-[#EAF1EC] placeholder-[#5A7465] focus:outline-none transition-all duration-150 font-mono shadow-xs h-8 sm:h-9"
                    />
                  </div>

                  {/* Reps Input with soft rounded corners and instant tap selection */}
                  <div className="w-13 sm:w-28 md:w-36 shrink-0">
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
                      className="w-full bg-[#1A2922] border border-[#253930] hover:border-[#3E6349] focus:border-[#7EA984] focus:ring-2 focus:ring-[#7EA984]/20 rounded-xl sm:rounded-2xl px-1.5 sm:px-3 py-1.5 sm:py-2 text-center text-xs sm:text-sm text-[#EAF1EC] placeholder-[#5A7465] focus:outline-none transition-all duration-150 font-mono shadow-xs h-8 sm:h-9"
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Subtle sage separator between muscle groups */}
            {groupIdx < groupedSlots.length - 1 && (
              <div className="h-[1px] bg-[#253930]/70 my-1 sm:my-2" />
            )}
          </div>
        ))}
      </div>

      {/* 4. Elegant Minimalist Auto-Save Status Bar */}
      <div className="pt-1 flex items-center justify-between border-t border-[#253930]/30 text-xs select-none">
        <div className="flex items-center gap-1.5">
          {status === "saving" ? (
            <span className="flex items-center gap-1.5 text-[#8FA898] text-[10.5px]">
              <Loader2 className="w-3 h-3 animate-spin text-[#7EA984]" />
              <span>Saving changes...</span>
            </span>
          ) : status === "error" ? (
            <span className="flex items-center gap-1.5 text-amber-400 text-[10.5px]">
              <AlertCircle className="w-3 h-3 text-amber-400" />
              <span>{statusMessage || "Auto-saved locally"}</span>
            </span>
          ) : (
            <span className="flex items-center gap-1.5 text-[#7EA984] text-[10.5px] font-medium">
              <Check className="w-3 h-3 text-[#7EA984]" />
              <span>Auto-saved</span>
            </span>
          )}
        </div>

        <span className="text-[10px] text-[#5A7465] font-mono">
          cloud auto-sync
        </span>
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
