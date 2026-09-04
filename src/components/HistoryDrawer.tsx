import React from "react";
import { Calendar, X, Star } from "lucide-react";
import { isRatingGroup } from "../constants/workoutConfig";
import type { WorkoutLogHistoryItem } from "../types/workout";

interface HistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  dayLabel: string;
  history: WorkoutLogHistoryItem[];
}

export const HistoryDrawer: React.FC<HistoryDrawerProps> = ({
  isOpen,
  onClose,
  dayLabel,
  history,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-lg">
      <div className="liquid-glass-card rounded-3xl w-full max-w-lg max-h-[85vh] flex flex-col shadow-2xl overflow-hidden border border-[#A89178]/25">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#A89178]/15">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[#B0987F]" />
            <h2 className="text-sm font-bold text-[#FFFDF8]">
              History — {dayLabel}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full text-[#9E8C7F] hover:text-[#FFFFFF] hover:bg-white/10 transition-colors active:scale-95 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-4 custom-glass-scrollbar">
          {history.length === 0 ? (
            <p className="text-[#B8A696] text-xs text-center py-8">
              No saved workouts found for this day yet.
            </p>
          ) : (
            history.map((log) => {
              const formattedDate = new Date(
                log.workout_date,
              ).toLocaleDateString(undefined, {
                weekday: "short",
                year: "numeric",
                month: "short",
                day: "numeric",
              });

              return (
                <div
                  key={log.id}
                  className="liquid-glass-pill rounded-2xl p-4 space-y-3 shadow-xs border border-[#A89178]/20"
                >
                  <div className="flex justify-between items-center text-xs pb-2 border-b border-[#A89178]/15">
                    <span className="font-semibold text-[#FFFDF8]">
                      {formattedDate}
                    </span>
                    <span className="text-[11px] text-[#B8A696]">
                      2 Sets per exercise
                    </span>
                  </div>

                  <div className="space-y-2">
                    {log.exercises.map((ex) => (
                      <div
                        key={ex.id}
                        className="flex justify-between items-center text-xs text-[#FAF5EE]"
                      >
                        <span className="truncate pr-2 text-[#FAF5EE] font-medium">
                          {ex.exercise_name || "Exercise"}
                        </span>
                        <div className="flex gap-3 text-[#B0987F] shrink-0 font-mono text-[11px] font-semibold items-center">
                          {isRatingGroup(ex.muscle_group) ? (
                            <span className="flex items-center gap-1 text-[#BA9F7F]">
                              <Star className="w-3 h-3 fill-[#BA9F7F]" />
                              <span>{ex.reps !== null && ex.reps > 0 ? `${ex.reps}/5` : "Unrated"}</span>
                            </span>
                          ) : (
                            <>
                              <span>
                                {ex.weight_kg !== null
                                  ? `${ex.weight_kg} kg`
                                  : "— kg"}
                              </span>
                              <span>
                                {ex.reps !== null ? `${ex.reps} reps` : "—"}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
