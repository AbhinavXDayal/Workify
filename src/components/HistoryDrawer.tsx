import React from "react";
import { X, Calendar } from "lucide-react";
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="bg-[#F6F3EC] border border-[#DDD7CB] rounded-3xl w-full max-w-lg max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#E3DDD1]">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[#466A51]" />
            <h2 className="text-sm font-semibold text-[#221E1B]">
              History — {dayLabel}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full text-[#7A7266] hover:text-[#221E1B] hover:bg-[#EFEBE3] transition-colors active:scale-95 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-4">
          {history.length === 0 ? (
            <p className="text-[#7A7266] text-xs text-center py-8">
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
                  className="bg-[#FFFFFF] border border-[#DDD7CB] rounded-2xl p-4 space-y-3 shadow-xs"
                >
                  <div className="flex justify-between items-center text-xs text-[#7A7266] pb-2 border-b border-[#E3DDD1]">
                    <span className="font-semibold text-[#221E1B]">
                      {formattedDate}
                    </span>
                    <span className="text-[11px] text-[#8E867A]">
                      2 Sets per exercise
                    </span>
                  </div>

                  <div className="space-y-2">
                    {log.exercises.map((ex) => (
                      <div
                        key={ex.id}
                        className="flex justify-between items-center text-xs text-[#342E29]"
                      >
                        <span className="truncate pr-2 text-[#221E1B] font-medium">
                          {ex.exercise_name || "Exercise"}
                        </span>
                        <div className="flex gap-3 text-[#466A51] shrink-0 font-mono text-[11px] font-medium">
                          <span>
                            {ex.weight_kg !== null
                              ? `${ex.weight_kg} kg`
                              : "— kg"}
                          </span>
                          <span>
                            {ex.reps !== null ? `${ex.reps} reps` : "—"}
                          </span>
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
