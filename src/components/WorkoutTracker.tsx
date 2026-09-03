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
    <div className="w-full bg-[#121214] border border-[#27272a] rounded-2xl p-3.5 sm:p-6 shadow-2xl space-y-5">
      {/* 1. Day Selector Tabs */}
      <DaySelector activeDay={activeDay} onSelectDay={onSelectDay} />

      {/* 2. Column Headers: Exercise | KG | Reps */}
      <div className="flex items-center justify-between text-xs text-zinc-400 font-medium px-1 pt-1">
        <span className="flex-1">Exercise</span>
        <div className="flex items-center gap-2 sm:gap-3 w-[120px] sm:w-44 shrink-0">
          <span className="w-14 sm:w-20 text-center">KG</span>
          <span className="w-14 sm:w-20 text-center">Reps</span>
        </div>
      </div>

      {/* 3. Muscle Groups & Exercise Rows */}
      <div className="space-y-5">
        {groupedSlots.map((group, groupIdx) => (
          <div key={group.name} className="space-y-2">
            {/* Muscle Group Title */}
            <h3 className="text-xs font-semibold text-zinc-300 tracking-tight">
              {group.name}
            </h3>

            {/* Exercise Slots */}
            <div className="space-y-2">
              {group.slots.map(({ slot, globalIndex }) => (
                <div
                  key={`${slot.muscleGroup}-${slot.slotNumber}`}
                  className="flex items-center gap-2 sm:gap-3"
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
                      className="w-full min-w-0 max-w-full bg-[#18181b] border border-[#27272a] hover:border-zinc-700 focus:border-zinc-500 rounded-xl px-2.5 sm:px-3 py-2.5 pr-7 sm:pr-8 text-xs sm:text-sm text-zinc-200 truncate focus:outline-none transition-colors cursor-pointer appearance-none"
                    >
                      <option value="" className="bg-[#18181b] text-zinc-500">
                        Select exercise
                      </option>
                      {group.options.map((option) => (
                        <option
                          key={option}
                          value={option}
                          className="bg-[#18181b] text-zinc-200"
                        >
                          {option}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-zinc-500 absolute right-2 sm:right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>

                  {/* KG Input */}
                  <div className="w-14 sm:w-20 shrink-0">
                    <input
                      type="text"
                      inputMode="decimal"
                      pattern="[0-9]*[.]?[0-9]*"
                      value={slot.weightKg}
                      onChange={(e) =>
                        onUpdateSlot(globalIndex, "weightKg", e.target.value)
                      }
                      placeholder="kg"
                      className="w-full bg-[#18181b] border border-[#27272a] hover:border-zinc-700 focus:border-zinc-500 rounded-xl px-1 sm:px-2 py-2.5 text-center text-xs sm:text-sm text-zinc-200 placeholder-zinc-500 focus:outline-none transition-colors font-mono"
                    />
                  </div>

                  {/* Reps Input */}
                  <div className="w-14 sm:w-20 shrink-0">
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      value={slot.reps}
                      onChange={(e) =>
                        onUpdateSlot(globalIndex, "reps", e.target.value)
                      }
                      placeholder={String(slot.defaultReps)}
                      className="w-full bg-[#18181b] border border-[#27272a] hover:border-zinc-700 focus:border-zinc-500 rounded-xl px-1 sm:px-2 py-2.5 text-center text-xs sm:text-sm text-zinc-200 placeholder-zinc-500 focus:outline-none transition-colors font-mono"
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Subtle separator between muscle groups, except after the last group */}
            {groupIdx < groupedSlots.length - 1 && (
              <div className="h-[1px] bg-[#27272a]/50 my-3" />
            )}
          </div>
        ))}
      </div>

      {/* 4. Small Status Indicator */}
      {status !== "idle" && (
        <div className="flex items-center justify-center gap-2 py-1 text-xs">
          {status === "saving" && (
            <span className="flex items-center gap-1.5 text-zinc-400">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-zinc-400" />
              {statusMessage || "Saving..."}
            </span>
          )}
          {status === "saved" && (
            <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
              <Check className="w-3.5 h-3.5 text-emerald-400" />
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

      {/* 5. Action Buttons */}
      <div className="pt-2 space-y-2.5">
        <button
          type="button"
          onClick={onSaveWorkout}
          disabled={status === "saving"}
          className="w-full py-3.5 bg-zinc-100 hover:bg-white text-zinc-950 font-semibold text-sm rounded-xl transition-colors cursor-pointer shadow-sm disabled:opacity-50"
        >
          {status === "saving" ? "Saving Workout..." : "Save Workout"}
        </button>

        <button
          type="button"
          onClick={onClearEntries}
          className="w-full py-3 bg-[#18181b] hover:bg-[#202024] text-zinc-300 text-sm font-medium rounded-xl border border-[#27272a] transition-colors cursor-pointer"
        >
          Clear Entries
        </button>

        {/* Discreet history link */}
        {history.length > 0 && (
          <div className="pt-1 text-center">
            <button
              type="button"
              onClick={() => onToggleHistory(true)}
              className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer py-1 px-2 rounded-lg"
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
