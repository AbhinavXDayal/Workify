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
  compact?: boolean;
}

export const AestheticSelect: React.FC<AestheticSelectProps> = ({
  value,
  onChange,
  options,
  placeholder = "Select exercise",
  groupName,
  onAddCustomOption,
  compact = false,
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
  const recentlyRemovedRef = useRef<string | null>(null);

  // Sync customData when groupName changes
  useEffect(() => {
    setCustomData(getCustomExercises(groupName));
  }, [groupName]);

  // Keep any existing exercise name in the options list for this muscle group
  useEffect(() => {
    if (value && value.trim()) {
      if (recentlyRemovedRef.current === value.trim()) {
        recentlyRemovedRef.current = null;
        return;
      }
      saveCustomExercise(value.trim(), groupName);
    }
  }, [value, groupName]);

  // Subscribe to real-time custom exercise updates across ALL dropdowns
  useEffect(() => {
    const unsubscribe = subscribeToCustomExercises(() => {
      setCustomData(getCustomExercises(groupName));
    });
    return unsubscribe;
  }, [groupName]);

  // Combined options: group custom exercises + predefined + current value
  const allOptions = useMemo(() => {
    const combinedSet = new Set<string>();

    // 1. Group custom exercises (strictly isolated to this group)
    customData.combined.forEach((e) => combinedSet.add(e));

    // 2. Predefined options (if any)
    options.forEach((e) => combinedSet.add(e));

    // 3. Current value (if set and not empty)
    if (value && value.trim()) {
      combinedSet.add(value.trim());
    }

    return Array.from(combinedSet);
  }, [options, customData.combined, value]);

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

    // Preserve previous exercise in options so adding another exercise doesn't delete it
    if (value && value.trim()) {
      saveCustomExercise(value.trim(), groupName);
    }

    saveCustomExercise(trimmed, groupName);
    onChange(trimmed);
    onAddCustomOption?.(trimmed);
    setNewExerciseInput("");
    setIsAdding(false);
    setIsOpen(false);
  };

  const handleRemoveCustom = (e: React.MouseEvent, opt: string) => {
    e.stopPropagation();
    recentlyRemovedRef.current = opt;
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
        className={`w-full min-w-0 flex items-center justify-between liquid-glass-input rounded-xl sm:rounded-2xl px-2.5 text-xs sm:text-sm text-[#E8F1EB] transition-all duration-150 cursor-pointer text-left group active:scale-[0.99] ${
          compact
            ? "min-h-[31px] sm:min-h-[38px] py-1 sm:py-2"
            : "min-h-[34px] sm:min-h-[38px] py-1 sm:py-2"
        }`}
      >
        <span
          className={`truncate min-w-0 ${!value ? "text-[#5E7A68]" : "text-[#FFFFFF] font-semibold"}`}
        >
          {value || placeholder}
        </span>
        <ChevronDown
          className={`w-4 h-4 text-[#5EA379] transition-transform duration-200 shrink-0 ml-2 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Custom aesthetic dropdown popover with liquid glass */}
      {isOpen && (
        <div
          style={{ position: "absolute" }}
          className={`left-0 right-0 z-50 liquid-glass-card rounded-2xl p-1.5 shadow-2xl max-h-56 sm:max-h-64 overflow-y-auto custom-glass-scrollbar space-y-0.5 animate-in fade-in duration-150 border border-[#437A56]/30 ${
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
                ? "bg-[#244230] text-[#FFFDF8] font-bold shadow-xs border border-[#437A56]/60"
                : "text-[#8FA898] hover:bg-white/8 hover:text-[#FFFFFF]"
            }`}
          >
            <span>{placeholder}</span>
            {!value && <Check className="w-3.5 h-3.5 text-[#48B87B]" />}
          </button>

          {allOptions.length === 0 && !isAdding && (
            <div className="px-3.5 py-2 text-center text-xs text-[#8FA898] font-medium">
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
                  if (value && value.trim()) {
                    saveCustomExercise(value.trim(), groupName);
                  }
                  onChange(opt);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-sm text-left transition-colors cursor-pointer group/opt ${
                  isSelected
                    ? "bg-[#244230] text-[#FFFFFF] font-bold shadow-xs border border-[#437A56]/90"
                    : "text-[#E8F1EB] hover:bg-white/8 hover:text-[#FFFFFF]"
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
                      className="p-1 rounded-md text-[#769683] hover:text-red-400 hover:bg-red-950/40 transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                  {isSelected && (
                    <Check className="w-3.5 h-3.5 text-[#48B87B]" />
                  )}
                </div>
              </div>
            );
          })}

          {/* Divider & Option to Add Exercise */}
          <div className="pt-1 mt-1 border-t border-[#437A56]/20">
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
                  className="flex-1 bg-transparent px-2 py-1 text-xs sm:text-sm text-[#FFFFFF] placeholder-[#5E7A68] focus:outline-none min-w-0 font-medium"
                />
                <button
                  type="submit"
                  disabled={!newExerciseInput.trim()}
                  className="px-2.5 py-1 bg-[#244230] hover:bg-[#2F593E] border border-[#437A56]/70 text-white disabled:opacity-40 disabled:cursor-not-allowed rounded-lg text-xs font-semibold transition-colors cursor-pointer shrink-0 shadow-xs"
                >
                  Add
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsAdding(false);
                    setNewExerciseInput("");
                  }}
                  className="p-1 text-[#769683] hover:text-[#FFFFFF] transition-colors cursor-pointer shrink-0"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </form>
            ) : (
              <button
                type="button"
                onClick={handleStartAdding}
                className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-[#5EA379] hover:text-[#FFFFFF] hover:bg-white/8 transition-colors cursor-pointer"
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
