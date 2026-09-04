import React, { useState, useRef, useEffect, useMemo } from "react";
import { ChevronDown, Check, Plus, X } from "lucide-react";
import {
  getCustomExercises,
  saveCustomExercise,
  removeCustomExercise,
  subscribeToCustomExercises,
} from "../utils/customExercises";

interface AestheticSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: string[];
  placeholder?: string;
  groupName?: string;
  onAddCustomOption?: (newExercise: string) => void;
}

export const AestheticSelect: React.FC<AestheticSelectProps> = ({
  value,
  onChange,
  options,
  placeholder = "Select exercise",
  groupName,
  onAddCustomOption,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [openDirection, setOpenDirection] = useState<"up" | "down">("down");
  const [isAdding, setIsAdding] = useState(false);
  const [newExerciseInput, setNewExerciseInput] = useState("");
  const [customData, setCustomData] = useState(() =>
    getCustomExercises(groupName),
  );

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync customData when groupName changes
  useEffect(() => {
    setCustomData(getCustomExercises(groupName));
  }, [groupName]);

  // Subscribe to real-time custom exercise updates across ALL dropdowns
  useEffect(() => {
    const unsubscribe = subscribeToCustomExercises(() => {
      setCustomData(getCustomExercises(groupName));
    });
    return unsubscribe;
  }, [groupName]);

  // Combined options: group custom exercises + predefined + other custom exercises + current value
  const allOptions = useMemo(() => {
    const combinedSet = new Set<string>();

    // 1. Group custom exercises first
    customData.groupExercises.forEach((e) => combinedSet.add(e));

    // 2. Predefined options (if any)
    options.forEach((e) => combinedSet.add(e));

    // 3. Other custom exercises added anywhere in the app
    customData.allExercises.forEach((e) => combinedSet.add(e));

    // 4. Current value (if set and not empty)
    if (value && value.trim()) {
      combinedSet.add(value.trim());
    }

    return Array.from(combinedSet);
  }, [options, customData, value]);

  // Close on outside click or Escape key
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
        setIsAdding(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
        setIsAdding(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const handleStartAdding = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsAdding(true);
    setTimeout(() => {
      inputRef.current?.focus();
    }, 50);
  };

  const handleSaveCustom = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = newExerciseInput.trim();
    if (!trimmed) return;

    saveCustomExercise(trimmed, groupName);
    onChange(trimmed);
    onAddCustomOption?.(trimmed);
    setNewExerciseInput("");
    setIsAdding(false);
    setIsOpen(false);
  };

  const handleRemoveCustom = (e: React.MouseEvent, opt: string) => {
    e.stopPropagation();
    removeCustomExercise(opt, groupName);
    if (value === opt) {
      onChange("");
    }
  };

  const handleToggleOpen = () => {
    // Refresh latest custom exercises from storage on every open
    const latest = getCustomExercises(groupName);
    setCustomData(latest);

    if (!isOpen && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const scrollParent =
        containerRef.current.closest(".overflow-y-auto") ||
        containerRef.current.closest(".liquid-glass-card");
      const parentRect = scrollParent?.getBoundingClientRect();
      const availableBelow = parentRect
        ? Math.min(
            parentRect.bottom - rect.bottom,
            window.innerHeight - rect.bottom,
          )
        : window.innerHeight - rect.bottom;
      const availableAbove = parentRect
        ? Math.min(rect.top - parentRect.top, rect.top)
        : rect.top;

      // If space below is constrained (< 240px) and there's more room above, or if space below is limited and above has room
      if (
        (availableBelow < 240 && availableAbove > availableBelow) ||
        (availableBelow < 240 && availableAbove > 180)
      ) {
        setOpenDirection("up");
      } else {
        setOpenDirection("down");
      }
    }

    setIsOpen((prev) => {
      const next = !prev;
      // If there are truly 0 options anywhere, start in adding mode
      if (
        next &&
        latest.combined.length === 0 &&
        options.length === 0 &&
        !value
      ) {
        setIsAdding(true);
        setTimeout(() => inputRef.current?.focus(), 50);
      }
      return next;
    });
  };

  return (
    <div
      ref={containerRef}
      className={`relative flex-1 min-w-0 ${isOpen ? "z-50" : "z-10"}`}
    >
      {/* Underlying standard select to preserve accessibility and automated testing */}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="sr-only"
      >
        <option value="">{placeholder}</option>
        {allOptions.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>

      {/* Visible aesthetic trigger button with soft rounded corners & liquid glass */}
      <button
        type="button"
        onClick={handleToggleOpen}
        className="w-full min-w-0 flex items-center justify-between liquid-glass-input rounded-xl sm:rounded-2xl px-2.5 py-1.5 sm:py-2 text-xs sm:text-sm text-[#382C24] transition-all duration-150 cursor-pointer text-left group active:scale-[0.99] min-h-[32px] sm:min-h-[38px]"
      >
        <span
          className={`truncate min-w-0 ${!value ? "text-[#8C7A6B]" : "text-[#382C24] font-semibold"}`}
        >
          {value || placeholder}
        </span>
        <ChevronDown
          className={`w-4 h-4 text-[#7C583F] transition-transform duration-200 shrink-0 ml-2 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Custom aesthetic dropdown popover with liquid glass */}
      {isOpen && (
        <div
          style={{ position: "absolute" }}
          className={`left-0 right-0 z-50 liquid-glass-card rounded-2xl p-1.5 shadow-2xl max-h-56 sm:max-h-64 overflow-y-auto custom-glass-scrollbar space-y-0.5 animate-in fade-in duration-150 ${
            openDirection === "up"
              ? "bottom-full mb-1.5 origin-bottom zoom-in-95"
              : "top-full mt-1.5 origin-top zoom-in-95"
          }`}
        >
          <button
            type="button"
            onClick={() => {
              onChange("");
              setIsOpen(false);
            }}
            className={`w-full flex items-center justify-between px-3.5 py-2 rounded-xl text-xs sm:text-sm text-left transition-colors cursor-pointer ${
              !value
                ? "bg-white/90 text-[#7C583F] font-bold shadow-xs"
                : "text-[#6E5C4E] hover:bg-white/40 hover:text-[#382C24]"
            }`}
          >
            <span>{placeholder}</span>
            {!value && <Check className="w-3.5 h-3.5 text-[#7C583F]" />}
          </button>

          {allOptions.length === 0 && !isAdding && (
            <div className="px-3.5 py-2 text-center text-xs text-[#7C6A5D] font-medium">
              No exercises added yet
            </div>
          )}

          {allOptions.map((opt) => {
            const isSelected = value === opt;
            const isCustom = customData.combined.includes(opt);
            return (
              <div
                key={opt}
                onClick={() => {
                  onChange(opt);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-sm text-left transition-colors cursor-pointer group/opt ${
                  isSelected
                    ? "bg-white/95 text-[#382C24] font-bold shadow-xs border border-white/60"
                    : "text-[#44352B] hover:bg-white/50 hover:text-[#2E231C]"
                }`}
              >
                <div className="flex items-center gap-1.5 min-w-0 flex-1">
                  <span className="truncate">{opt}</span>
                </div>

                <div className="flex items-center gap-1 shrink-0 ml-2">
                  {isCustom && (
                    <button
                      type="button"
                      onClick={(e) => handleRemoveCustom(e, opt)}
                      title="Remove exercise"
                      className="p-1 rounded-md text-[#8C7A6B] hover:text-red-700 hover:bg-red-100/70 transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                  {isSelected && (
                    <Check className="w-3.5 h-3.5 text-[#7C583F]" />
                  )}
                </div>
              </div>
            );
          })}

          {/* Divider & Option to Add Exercise */}
          <div className="pt-1 mt-1 border-t border-[#382C24]/12">
            {isAdding ? (
              <form
                onSubmit={handleSaveCustom}
                className="flex items-center gap-1 p-1 liquid-glass-input rounded-xl"
              >
                <input
                  ref={inputRef}
                  type="text"
                  value={newExerciseInput}
                  onChange={(e) => setNewExerciseInput(e.target.value)}
                  placeholder="Enter exercise name..."
                  className="flex-1 bg-transparent px-2 py-1 text-xs sm:text-sm text-[#382C24] placeholder-[#998677] focus:outline-none min-w-0 font-medium"
                />
                <button
                  type="submit"
                  disabled={!newExerciseInput.trim()}
                  className="px-2.5 py-1 bg-[#7C583F] hover:bg-[#664630] text-white disabled:opacity-40 disabled:cursor-not-allowed rounded-lg text-xs font-semibold transition-colors cursor-pointer shrink-0 shadow-xs"
                >
                  Add
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsAdding(false);
                    setNewExerciseInput("");
                  }}
                  className="p-1 text-[#7C6A5D] hover:text-[#382C24] transition-colors cursor-pointer shrink-0"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </form>
            ) : (
              <button
                type="button"
                onClick={handleStartAdding}
                className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-[#7C583F] hover:text-[#664630] hover:bg-white/40 transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add exercise</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
