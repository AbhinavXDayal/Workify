import React, { useState, useRef } from "react";
import { Check, Loader2, AlertCircle, RotateCcw, Trash2 } from "lucide-react";
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

  // Accidental Clear Protection: Store backup of slots for undo
  const [backupSlots, setBackupSlots] = useState<ExerciseSlotState[] | null>(
    null,
  );
  const [showUndoBanner, setShowUndoBanner] = useState<boolean>(false);
  const undoTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleClearWithSafety = () => {
    // Preserve current filled values before wiping
    const hasEnteredData = slots.some(
      (s) =>
        (s.weightKg && s.weightKg.trim().length > 0) ||
        s.reps !== String(s.defaultReps),
    );

    if (hasEnteredData) {
      setBackupSlots(slots.map((s) => ({ ...s })));
      setShowUndoBanner(true);
      if (undoTimerRef.current) clearTimeout(undoTimerRef.current);
      undoTimerRef.current = setTimeout(() => {
        setShowUndoBanner(false);
        setBackupSlots(null);
      }, 10000); // 10-second undo window
    }

    onClearEntries();
  };

  const handleUndo = () => {
    if (backupSlots) {
      backupSlots.forEach((savedSlot, idx) => {
        if (savedSlot.weightKg !== slots[idx]?.weightKg) {
          onUpdateSlot(idx, "weightKg", savedSlot.weightKg);
        }
        if (savedSlot.reps !== slots[idx]?.reps) {
          onUpdateSlot(idx, "reps", savedSlot.reps);
        }
      });
      setBackupSlots(null);
      setShowUndoBanner(false);
    }
  };

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
    <div className="w-full bg-[#15221D] border border-[#253930] rounded-2xl sm:rounded-3xl p-2 sm:p-5 md:p-6 shadow-[0_8px_32px_rgba(0,0,0,0.45)] space-y-1.5 sm:space-y-4 transition-all duration-200">
      {/* 1. Day Selector Tabs with soft rounded corners */}
      <DaySelector activeDay={activeDay} onSelectDay={onSelectDay} />

      {/* 2. Column Headers: Exercise | KG | Reps with portfolio sage green accent */}
      <div className="flex items-center justify-between text-[10px] sm:text-[11px] text-[#7EA984] font-semibold px-2 tracking-wider uppercase select-none">
        <span className="flex-1">Exercise</span>
        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
          <span className="w-13 sm:w-28 md:w-36 text-center">KG</span>
          <span className="w-13 sm:w-28 md:w-36 text-center">Reps</span>
        </div>
      </div>

      {/* 3. Muscle Groups & Exercise Rows with smooth day-switch transition */}
      <div key={activeDay} className="space-y-1.5 sm:space-y-4 day-transition">
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

      {/* 4. Small Status Indicator */}
      {status !== "idle" && (
        <div className="flex items-center justify-center gap-2 py-0.5 text-xs">
          {status === "saving" && (
            <span className="flex items-center gap-1.5 text-[#8FA898]">
              <Loader2 className="w-3 h-3 animate-spin text-[#7EA984]" />
              {statusMessage || "Saving..."}
            </span>
          )}
          {status === "saved" && (
            <span className="flex items-center gap-1.5 text-[#7EA984] font-medium">
              <Check className="w-3 h-3 text-[#7EA984]" />
              {statusMessage || "Saved"}
            </span>
          )}
          {status === "error" && (
            <span className="flex items-center gap-1.5 text-red-400">
              <AlertCircle className="w-3 h-3 text-red-400" />
              {statusMessage || "Unable to save"}
            </span>
          )}
        </div>
      )}

      {/* 5. Safe, Ergonomic Action Area */}
      <div className="pt-1 space-y-1.5">
        {/* Primary Hero Action: Full-width Save Workout button */}
        <button
          type="button"
          onClick={onSaveWorkout}
          disabled={status === "saving"}
          className={`w-full py-2.5 sm:py-3.5 text-xs sm:text-sm font-semibold rounded-xl sm:rounded-2xl transition-all duration-150 cursor-pointer shadow-sm active:scale-[0.985] disabled:opacity-50 flex items-center justify-center gap-2 select-none ${
            status === "saved"
              ? "bg-[#7EA984] text-[#0E1613] shadow-[#7EA984]/25"
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

        {/* Secondary Safety Row: Separated from Save Workout to prevent accidental clearing */}
        <div className="pt-2 border-t border-[#253930]/40 flex items-center justify-between min-h-[38px]">
          <div>
            {showUndoBanner ? (
              <div className="inline-flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs animate-in fade-in duration-200">
                <span>Entries cleared</span>
                <button
                  type="button"
                  onClick={handleUndo}
                  className="inline-flex items-center gap-1 font-semibold text-white hover:text-amber-200 underline decoration-amber-400/60 underline-offset-2 cursor-pointer active:scale-95"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Undo</span>
                </button>
              </div>
            ) : (
              <span className="text-[11px] text-[#5A7465] select-none">
                Session data auto-preserved
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={handleClearWithSafety}
            className="inline-flex items-center gap-1.5 text-xs text-[#8FA898] hover:text-red-400 hover:bg-red-500/10 px-3 py-1.5 rounded-xl border border-transparent hover:border-red-500/20 transition-all duration-150 cursor-pointer select-none active:scale-95"
            title="Reset all input fields for today"
          >
            <Trash2 className="w-3.5 h-3.5 opacity-60" />
            <span>Clear Entries</span>
          </button>
        </div>
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
