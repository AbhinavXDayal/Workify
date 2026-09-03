import React from "react";
import {
  ChevronDown,
  Check,
  Loader2,
  AlertCircle,
  History,
} from "lucide-react";
import { DaySelector } from "./DaySelector";
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
  onSaveWorkout: () => void;
  onClearEntries: () => void;
  status: SaveStatus;
  statusMessage: string;
  history: WorkoutLogHistoryItem[];
  showHistory: boolean;
  onToggleHistory: (show: boolean) => void;
}

export const WorkoutTracker: React.FC<WorkoutTrackerProps> = ({
  activeDay,
  onSelectDay,
  slots,
  onUpdateSlot,
  onSaveWorkout,
  onClearEntries,
  status,
  statusMessage,
  history,
  showHistory,
  onToggleHistory,
}) => {
  const dayConfig = WORKOUT_DAYS_CONFIG[activeDay];

  // Group slots by their muscleGroup
  const groupedSlots = dayConfig.groups.map((group) => {
    const groupSlotsWithIndex: {
      slot: ExerciseSlotState;
      globalIndex: number;
    }[] = [];
    for (let i = 0; i < group.slotsCount; i++) {
      const foundIndex = slots.findIndex(
        (s) => s.muscleGroup === group.name && s.slotNumber === i,
      );
      if (foundIndex >= 0) {
        groupSlotsWithIndex.push({
          slot: slots[foundIndex],
          globalIndex: foundIndex,
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
    <div className="w-full bg-[#15221D]/90 backdrop-blur-md border border-[#253930] rounded-2xl p-3.5 sm:p-6 md:p-8 shadow-[0_8px_32px_rgba(0,0,0,0.45)] space-y-5 transition-all duration-200">
      {/* 1. Day Selector Tabs */}
      <DaySelector activeDay={activeDay} onSelectDay={onSelectDay} />

      {/* 2. Column Headers: Exercise | KG | Reps with portfolio sage green accent */}
      <div className="flex items-center justify-between text-[11px] text-[#7EA984] font-semibold px-2 pt-1 tracking-wider uppercase select-none">
        <span className="flex-1">Exercise</span>
        <div className="flex items-center gap-2 sm:gap-3.5 shrink-0">
          <span className="w-16 sm:w-28 md:w-36 text-center">KG</span>
          <span className="w-16 sm:w-28 md:w-36 text-center">Reps</span>
        </div>
      </div>

      {/* 3. Muscle Groups & Exercise Rows with smooth day-switch transition */}
      <div key={activeDay} className="space-y-5 day-transition">
        {groupedSlots.map((group, groupIdx) => (
          <div key={group.name} className="space-y-2.5">
            {/* Muscle Group Title */}
            <h3 className="text-xs font-semibold text-[#C8DACF] tracking-tight select-none">
              {group.name}
            </h3>

            {/* Exercise Slots */}
            <div className="space-y-2.5">
              {group.slots.map(({ slot, globalIndex }) => (
                <div
                  key={`${slot.muscleGroup}-${slot.slotNumber}`}
                  className="group flex items-center gap-2 sm:gap-3.5"
                >
                  {/* Exercise Selector */}
                  <div className="relative flex-1 min-w-0">
                    <select
                      value={slot.exerciseName}
                      onChange={(e) =>
                        onUpdateSlot(
                          globalIndex,
                          "exerciseName",
                          e.target.value,
                        )
                      }
                      className="w-full min-w-0 max-w-full bg-[#1A2922] border border-[#253930] hover:border-[#3E6349] focus:border-[#7EA984] focus:ring-1 focus:ring-[#7EA984]/30 rounded-xl px-2.5 sm:px-3.5 py-2.5 sm:py-3 pr-7 sm:pr-8 text-xs sm:text-sm text-[#EAF1EC] truncate focus:outline-none transition-all duration-150 cursor-pointer appearance-none shadow-xs"
                    >
                      <option value="" className="bg-[#15221D] text-[#5A7465]">
                        Select exercise
                      </option>
                      {group.options.map((option) => (
                        <option
                          key={option}
                          value={option}
                          className="bg-[#15221D] text-[#EAF1EC]"
                        >
                          {option}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#7EA984]/70 group-hover:text-[#7EA984] absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 pointer-events-none transition-colors duration-150" />
                  </div>

                  {/* KG Input */}
                  <div className="w-16 sm:w-28 md:w-36 shrink-0">
                    <input
                      type="text"
                      inputMode="decimal"
                      pattern="[0-9]*[.]?[0-9]*"
                      value={slot.weightKg}
                      onChange={(e) =>
                        onUpdateSlot(globalIndex, "weightKg", e.target.value)
                      }
                      placeholder="kg"
                      className="w-full bg-[#1A2922] border border-[#253930] hover:border-[#3E6349] focus:border-[#7EA984] focus:ring-1 focus:ring-[#7EA984]/30 rounded-xl px-1 sm:px-2 py-2.5 sm:py-3 text-center text-xs sm:text-sm text-[#EAF1EC] placeholder-[#5A7465] focus:outline-none transition-all duration-150 font-mono shadow-xs"
                    />
                  </div>

                  {/* Reps Input */}
                  <div className="w-16 sm:w-28 md:w-36 shrink-0">
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      value={slot.reps}
                      onChange={(e) =>
                        onUpdateSlot(globalIndex, "reps", e.target.value)
                      }
                      placeholder={String(slot.defaultReps)}
                      className="w-full bg-[#1A2922] border border-[#253930] hover:border-[#3E6349] focus:border-[#7EA984] focus:ring-1 focus:ring-[#7EA984]/30 rounded-xl px-1 sm:px-2 py-2.5 sm:py-3 text-center text-xs sm:text-sm text-[#EAF1EC] placeholder-[#5A7465] focus:outline-none transition-all duration-150 font-mono shadow-xs"
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Subtle sage separator between muscle groups */}
            {groupIdx < groupedSlots.length - 1 && (
              <div className="h-[1px] bg-[#253930]/70 my-3" />
            )}
          </div>
        ))}
      </div>

      {/* 4. Small Status Indicator */}
      {status !== "idle" && (
        <div className="flex items-center justify-center gap-2 py-1 text-xs">
          {status === "saving" && (
            <span className="flex items-center gap-1.5 text-[#8FA898]">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-[#7EA984]" />
              {statusMessage || "Saving..."}
            </span>
          )}
          {status === "saved" && (
            <span className="flex items-center gap-1.5 text-[#7EA984] font-medium">
              <Check className="w-3.5 h-3.5 text-[#7EA984]" />
              {statusMessage || "Saved"}
            </span>
          )}
          {status === "error" && (
            <span className="flex items-center gap-1.5 text-red-400">
              <AlertCircle className="w-3.5 h-3.5 text-red-400" />
              {statusMessage || "Unable to save"}
            </span>
          )}
        </div>
      )}

      {/* 5. Action Buttons - responsive flex layout for full width */}
      <div className="pt-2 space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            type="button"
            onClick={onSaveWorkout}
            disabled={status === "saving"}
            className={`flex-1 py-3.5 text-sm font-semibold rounded-xl transition-all duration-150 cursor-pointer shadow-sm active:scale-[0.985] disabled:opacity-50 flex items-center justify-center gap-2 select-none ${
              status === "saved"
                ? "bg-[#7EA984] text-[#0E1613] shadow-[#7EA984]/20"
                : "bg-[#EAF1EC] hover:bg-[#A3CEB3] text-[#0E1613] hover:shadow-md"
            }`}
          >
            {status === "saving" ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Saving Workout...</span>
              </>
            ) : status === "saved" ? (
              <>
                <Check className="w-4 h-4" />
                <span>Workout Saved</span>
              </>
            ) : (
              <span>Save Workout</span>
            )}
          </button>

          <button
            type="button"
            onClick={onClearEntries}
            className="sm:w-48 py-3.5 bg-[#1A2922] hover:bg-[#23372E] active:scale-[0.985] text-[#8FA898] hover:text-[#EAF1EC] text-xs sm:text-sm font-medium rounded-xl border border-[#253930] hover:border-[#3E6349] transition-all duration-150 cursor-pointer select-none"
          >
            Clear Entries
          </button>
        </div>

        {/* Discreet history link */}
        {history.length > 0 && (
          <div className="pt-1 text-center">
            <button
              type="button"
              onClick={() => onToggleHistory(true)}
              className="inline-flex items-center gap-1.5 text-xs text-[#8FA898] hover:text-[#7EA984] transition-colors cursor-pointer py-1.5 px-3 rounded-lg hover:bg-[#1A2922] active:scale-95"
            >
              <History className="w-3.5 h-3.5" />
              <span>View Past History ({history.length})</span>
            </button>
          </div>
        )}
      </div>

      {/* History Drawer Modal */}
      <HistoryDrawer
        isOpen={showHistory}
        onClose={() => onToggleHistory(false)}
        dayLabel={dayConfig.label}
        history={history}
      />
    </div>
  );
};
