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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 p-4 backdrop-blur-lg">
      <div className="liquid-glass-card rounded-3xl w-full max-w-lg max-h-[85vh] flex flex-col shadow-2xl overflow-hidden border border-white/70">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#4A3222]/12">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[#8A5633]" />
            <h2 className="text-sm font-bold text-[#2E1C12]">
              History — {dayLabel}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full text-[#7A6253] hover:text-[#2E1C12] hover:bg-white/50 transition-colors active:scale-95 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-4 custom-glass-scrollbar">
          {history.length === 0 ? (
            <p className="text-[#7A6253] text-xs text-center py-8">
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
                  className="liquid-glass-pill rounded-2xl p-4 space-y-3 shadow-xs"
                >
                  <div className="flex justify-between items-center text-xs pb-2 border-b border-[#4A3222]/10">
                    <span className="font-semibold text-[#2E1C12]">
                      {formattedDate}
                    </span>
                    <span className="text-[11px] text-[#8A7262]">
                      2 Sets per exercise
                    </span>
                  </div>

                  <div className="space-y-2">
                    {log.exercises.map((ex) => (
                      <div
                        key={ex.id}
                        className="flex justify-between items-center text-xs text-[#422F22]"
                      >
                        <span className="truncate pr-2 text-[#2E1C12] font-medium">
                          {ex.exercise_name || "Exercise"}
                        </span>
                        <div className="flex gap-3 text-[#8A5633] shrink-0 font-mono text-[11px] font-semibold">
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
