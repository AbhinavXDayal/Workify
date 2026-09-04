import React from "react";
import { DaySelector } from "./DaySelector";
import { AestheticSelect } from "./AestheticSelect";
import { HistoryDrawer } from "./HistoryDrawer";
import { StarRatingBox } from "./StarRatingBox";
import { WORKOUT_DAYS_CONFIG, isRatingGroup } from "../constants/workoutConfig";
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
    field: "exerciseName" | "weightKg" | "reps" | "rating",
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
            rating: 0,
          },
          globalIndex: -1,
        });
      }
    }
    return {
      name: group.name,
      options: group.options,
      trackingType: group.trackingType,
      slots: groupSlotsWithIndex,
    };
  });

  const isWed = activeDay === "wed";

  return (
    <div className="w-full max-w-full flex flex-col flex-1 min-h-0 transition-all duration-200">
      {/* 1. Day Selector Tabs with soft rounded corners */}
      <div className="shrink-0 mb-1 sm:mb-2">
        <DaySelector activeDay={activeDay} onSelectDay={onSelectDay} />
      </div>

      {/* 2. Muscle Groups & Exercise Rows: cohesive, non-scrollable on mobile, natural on desktop */}
      <div
        className={`flex-1 min-h-0 overflow-y-auto sm:overflow-visible overscroll-contain pr-0.5 pb-0.5 sm:pb-3 custom-glass-scrollbar ${
          isWed ? "space-y-1 sm:space-y-3" : "space-y-1.5 sm:space-y-3"
        }`}
      >
        {groupedSlots.map((group, groupIdx) => (
          <div
            key={group.name}
            className={
              isWed ? "space-y-0.5 sm:space-y-1.5" : "space-y-1 sm:space-y-2"
            }
          >
            {/* Muscle Group Title with glowing amber accent indicator */}
            <div
              className={`flex items-center gap-1.5 px-1 ${
                isWed ? "pb-0 sm:pb-0.5" : "pb-0.5 sm:pb-0.5"
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#B0987F] shadow-[0_0_6px_rgba(176,152,127,0.4)]" />
              <h3 className="text-[9px] sm:text-[10.5px] font-semibold text-[#D0C0B0] tracking-wider uppercase select-none leading-none">
                {group.name}
              </h3>
            </div>

            {/* Exercise Slots */}
            <div
              className={
                isWed ? "space-y-0.5 sm:space-y-1.5" : "space-y-1 sm:space-y-2"
              }
            >
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
                    compact={isWed}
                  />

                  {/* Rating / Star Box for Cardio sports, MMA, Long run, and non-weight activities */}
                  {group.trackingType === "stars" ||
                  isRatingGroup(group.name) ? (
                    <StarRatingBox
                      rating={
                        slot.rating !== undefined && slot.rating > 0
                          ? slot.rating
                          : parseInt(slot.reps, 10) || 0
                      }
                      onChange={(newRating) =>
                        onUpdateSlot(globalIndex, "rating", String(newRating))
                      }
                      ariaLabel={`${slot.exerciseName || group.name} rating`}
                      compact={isWed}
                    />
                  ) : (
                    <>
                      {/* KG Input with inline 'kg' unit badge */}
                      <div
                        className={`relative w-[58px] sm:w-24 md:w-28 ${
                          isWed ? "h-[31px] sm:h-9" : "h-[34px] sm:h-9"
                        } liquid-glass-input rounded-xl sm:rounded-2xl flex items-center justify-between px-1.5 sm:px-2 font-mono shrink-0 cursor-text`}
                      >
                        <input
                          type="text"
                          inputMode="decimal"
                          pattern="[0-9]*[.]?[0-9]*"
                          value={slot.weightKg}
                          onFocus={(e) => e.target.select()}
                          onChange={(e) =>
                            onUpdateSlot(
                              globalIndex,
                              "weightKg",
                              e.target.value,
                            )
                          }
                          placeholder="0"
                          aria-label="Weight (kg)"
                          className="w-0 flex-1 min-w-0 bg-transparent text-right text-[11.5px] sm:text-sm text-[#FFFFFF] font-semibold placeholder-[#786B60] focus:outline-none font-mono pr-0.5"
                        />
                        <span className="text-[9.5px] sm:text-xs text-[#B0987F] font-bold select-none shrink-0 pointer-events-none ml-0.5">
                          kg
                        </span>
                      </div>

                      {/* Reps Input with inline 'reps' unit badge inside the same box */}
                      <div
                        className={`relative w-[64px] sm:w-24 md:w-28 ${
                          isWed ? "h-[31px] sm:h-9" : "h-[34px] sm:h-9"
                        } liquid-glass-input rounded-xl sm:rounded-2xl flex items-center justify-between px-1.5 sm:px-2 font-mono shrink-0 cursor-text`}
                      >
                        <input
                          type="text"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          value={slot.reps}
                          onFocus={(e) => e.target.select()}
                          onChange={(e) => {
                            const raw = e.target.value;
                            // Allow empty or partial typing
                            if (raw === "") {
                              onUpdateSlot(globalIndex, "reps", "");
                              return;
                            }
                            const num = parseInt(raw, 10);
                            if (isNaN(num)) return;
                            // Cap at defaultReps (10/12/15), allow lower
                            const capped = Math.min(num, slot.defaultReps);
                            onUpdateSlot(globalIndex, "reps", String(capped));
                          }}
                          placeholder={String(slot.defaultReps)}
                          aria-label="Reps"
                          className="w-0 flex-1 min-w-0 bg-transparent text-right text-[11.5px] sm:text-sm text-[#FFFFFF] font-semibold placeholder-[#786B60] focus:outline-none font-mono pr-0.5"
                        />
                        <span className="text-[9.5px] sm:text-xs text-[#B0987F] font-bold select-none shrink-0 pointer-events-none ml-0.5">
                          reps
                        </span>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>

            {/* Subtle separator between muscle groups */}
            {groupIdx < groupedSlots.length - 1 && (
              <div
                className={`h-[1px] bg-[#A89178]/15 ${
                  isWed ? "my-0.5 sm:my-2" : "my-1 sm:my-2"
                }`}
              />
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
