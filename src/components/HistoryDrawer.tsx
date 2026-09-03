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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="bg-[#121215] border border-white/[0.08] rounded-2xl w-full max-w-lg max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-zinc-400" />
            <h2 className="text-sm font-semibold text-white">
              History — {dayLabel}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/[0.06] transition-colors active:scale-95 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-3.5">
          {history.length === 0 ? (
            <p className="text-zinc-500 text-xs text-center py-8">
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
                  className="bg-[#16161b] border border-white/[0.06] rounded-xl p-3.5 space-y-2.5 shadow-xs"
                >
                  <div className="flex justify-between items-center text-xs text-zinc-400 pb-1.5 border-b border-white/[0.05]">
                    <span className="font-medium text-zinc-200">
                      {formattedDate}
                    </span>
                    <span className="text-[11px] text-zinc-500">
                      2 Sets per exercise
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    {log.exercises.map((ex) => (
                      <div
                        key={ex.id}
                        className="flex justify-between items-center text-xs text-zinc-300"
                      >
                        <span className="truncate pr-2 text-zinc-200">
                          {ex.exercise_name || "Exercise"}
                        </span>
                        <div className="flex gap-3 text-zinc-400 shrink-0 font-mono text-[11px]">
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
