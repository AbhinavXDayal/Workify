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
    <div className="w-full bg-[#121215]/85 backdrop-blur-md border border-white/[0.07] rounded-2xl p-3.5 sm:p-6 shadow-[0_6px_28px_rgba(0,0,0,0.45)] space-y-4.5 transition-all duration-200">
      {/* 1. Day Selector Tabs */}
      <DaySelector activeDay={activeDay} onSelectDay={onSelectDay} />

      {/* 2. Column Headers: Exercise | KG | Reps */}
      <div className="flex items-center justify-between text-[11px] text-zinc-400/90 font-medium px-1 pt-1 tracking-wider uppercase select-none">
        <span className="flex-1">Exercise</span>
        <div className="flex items-center gap-2 sm:gap-3 w-[120px] sm:w-44 shrink-0">
          <span className="w-14 sm:w-20 text-center">KG</span>
          <span className="w-14 sm:w-20 text-center">Reps</span>
        </div>
      </div>

      {/* 3. Muscle Groups & Exercise Rows with smooth day-switch transition */}
      <div key={activeDay} className="space-y-4.5 day-transition">
        {groupedSlots.map((group, groupIdx) => (
          <div key={group.name} className="space-y-2">
            {/* Muscle Group Title */}
            <h3 className="text-xs font-semibold text-zinc-300 tracking-tight select-none">
              {group.name}
            </h3>

            {/* Exercise Slots */}
            <div className="space-y-2">
              {group.slots.map(({ slot, globalIndex }) => (
                <div
                  key={`${slot.muscleGroup}-${slot.slotNumber}`}
                  className="group flex items-center gap-2 sm:gap-3"
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
                      className="w-full min-w-0 max-w-full bg-[#16161b] border border-white/[0.07] hover:border-white/[0.14] focus:border-zinc-400 focus:ring-1 focus:ring-zinc-400/30 rounded-xl px-2.5 sm:px-3 py-2.5 pr-7 sm:pr-8 text-xs sm:text-sm text-zinc-200 truncate focus:outline-none transition-all duration-150 cursor-pointer appearance-none shadow-xs"
                    >
                      <option value="" className="bg-[#16161b] text-zinc-500">
                        Select exercise
                      </option>
                      {group.options.map((option) => (
                        <option
                          key={option}
                          value={option}
                          className="bg-[#16161b] text-zinc-200"
                        >
                          {option}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-zinc-500 group-hover:text-zinc-400 absolute right-2 sm:right-2.5 top-1/2 -translate-y-1/2 pointer-events-none transition-colors duration-150" />
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
                      className="w-full bg-[#16161b] border border-white/[0.07] hover:border-white/[0.14] focus:border-zinc-400 focus:ring-1 focus:ring-zinc-400/30 rounded-xl px-1 sm:px-2 py-2.5 text-center text-xs sm:text-sm text-zinc-200 placeholder-zinc-500 focus:outline-none transition-all duration-150 font-mono shadow-xs"
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
                      className="w-full bg-[#16161b] border border-white/[0.07] hover:border-white/[0.14] focus:border-zinc-400 focus:ring-1 focus:ring-zinc-400/30 rounded-xl px-1 sm:px-2 py-2.5 text-center text-xs sm:text-sm text-zinc-200 placeholder-zinc-500 focus:outline-none transition-all duration-150 font-mono shadow-xs"
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Subtle separator between muscle groups, except after the last group */}
            {groupIdx < groupedSlots.length - 1 && (
              <div className="h-[1px] bg-white/[0.05] my-2.5" />
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

      {/* 5. Action Buttons with tactile hover/press feedback */}
      <div className="pt-2 space-y-2.5">
        <button
          type="button"
          onClick={onSaveWorkout}
          disabled={status === "saving"}
          className={`w-full py-3.5 text-sm font-semibold rounded-xl transition-all duration-150 cursor-pointer shadow-sm active:scale-[0.985] disabled:opacity-50 flex items-center justify-center gap-2 select-none ${
            status === "saved"
              ? "bg-emerald-500 text-zinc-950 shadow-emerald-500/20"
              : "bg-zinc-100 hover:bg-white text-zinc-950 hover:shadow-md"
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
          className="w-full py-2.5 sm:py-3 bg-[#16161b] hover:bg-[#1e1e24] active:scale-[0.985] text-zinc-400 hover:text-zinc-200 text-xs sm:text-sm font-medium rounded-xl border border-white/[0.06] hover:border-white/[0.12] transition-all duration-150 cursor-pointer select-none"
        >
          Clear Entries
        </button>

        {/* Discreet history link */}
        {history.length > 0 && (
          <div className="pt-1 text-center">
            <button
              type="button"
              onClick={() => onToggleHistory(true)}
              className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer py-1 px-2.5 rounded-lg hover:bg-white/[0.04] active:scale-95"
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
