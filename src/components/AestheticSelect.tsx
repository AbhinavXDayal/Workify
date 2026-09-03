import React, { useState, useRef, useEffect, useMemo } from "react";
import { ChevronDown, Check, Plus, X } from "lucide-react";

interface AestheticSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: string[];
  placeholder?: string;
  groupName?: string;
  onAddCustomOption?: (newExercise: string) => void;
}

const getCustomOptionsFromStorage = (group?: string): string[] => {
  if (typeof window === "undefined") return [];
  const key = group || "general";
  try {
    const raw = localStorage.getItem("workify_custom_exercises");
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (parsed && Array.isArray(parsed[key])) {
      return parsed[key];
    }
  } catch {
    // Ignore storage errors
  }
  return [];
};

const saveCustomOptionToStorage = (group: string | undefined, newOption: string) => {
  if (typeof window === "undefined") return;
  const key = group || "general";
  try {
    const raw = localStorage.getItem("workify_custom_exercises");
    const parsed = raw ? JSON.parse(raw) : {};
    const existing: string[] = Array.isArray(parsed[key]) ? parsed[key] : [];
    if (!existing.includes(newOption)) {
      parsed[key] = [...existing, newOption];
      localStorage.setItem("workify_custom_exercises", JSON.stringify(parsed));
    }
  } catch {
    // Ignore storage errors
  }
};

const removeCustomOptionFromStorage = (
  group: string | undefined,
  optionToRemove: string,
) => {
  if (typeof window === "undefined") return;
  const key = group || "general";
  try {
    const raw = localStorage.getItem("workify_custom_exercises");
    if (!raw) return;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed[key])) {
      parsed[key] = parsed[key].filter(
        (opt: string) => opt !== optionToRemove,
      );
      localStorage.setItem("workify_custom_exercises", JSON.stringify(parsed));
    }
  } catch {
    // Ignore storage errors
  }
};

export const AestheticSelect: React.FC<AestheticSelectProps> = ({
  value,
  onChange,
  options,
  placeholder = "Select exercise",
  groupName,
  onAddCustomOption,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [newExerciseInput, setNewExerciseInput] = useState("");
  const [customList, setCustomList] = useState<string[]>(() =>
    getCustomOptionsFromStorage(groupName),
  );

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync customList if groupName changes
  useEffect(() => {
    setCustomList(getCustomOptionsFromStorage(groupName));
  }, [groupName]);

  // Combined options: predefined + user custom options + current value if custom
  const allOptions = useMemo(() => {
    const combined = [...options];
    for (const c of customList) {
      if (!combined.includes(c)) {
        combined.push(c);
      }
    }
    if (value && !combined.includes(value)) {
      combined.push(value);
    }
    return combined;
  }, [options, customList, value]);

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

    if (groupName) {
      saveCustomOptionToStorage(groupName, trimmed);
    }
    setCustomList((prev) =>
      prev.includes(trimmed) ? prev : [...prev, trimmed],
    );
    onChange(trimmed);
    onAddCustomOption?.(trimmed);
    setNewExerciseInput("");
    setIsAdding(false);
    setIsOpen(false);
  };

  const handleRemoveCustom = (e: React.MouseEvent, opt: string) => {
    e.stopPropagation();
    if (groupName) {
      removeCustomOptionFromStorage(groupName, opt);
    }
    setCustomList((prev) => prev.filter((o) => o !== opt));
    if (value === opt) {
      onChange("");
    }
  };


  const handleToggleOpen = () => {
    setIsOpen((prev) => {
      const next = !prev;
      if (next && allOptions.length === 0) {
        setIsAdding(true);
        setTimeout(() => inputRef.current?.focus(), 50);
      }
      return next;
    });
  };

  return (
    <div ref={containerRef} className="relative flex-1 min-w-0">
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
        className="w-full min-w-0 flex items-center justify-between liquid-glass-input rounded-xl sm:rounded-2xl px-2.5 py-1.5 sm:py-2 text-xs sm:text-sm text-[#221E1B] transition-all duration-150 cursor-pointer text-left group active:scale-[0.99] min-h-[32px] sm:min-h-[38px]"
      >
        <span
          className={`truncate min-w-0 ${!value ? "text-[#7E766A]" : "text-[#221E1B] font-semibold"}`}
        >
          {value || placeholder}
        </span>
        <ChevronDown
          className={`w-4 h-4 text-[#466A51] transition-transform duration-200 shrink-0 ml-2 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Custom aesthetic dropdown popover with liquid glass */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-1.5 z-50 liquid-glass-card rounded-2xl p-1.5 shadow-2xl max-h-64 overflow-y-auto space-y-0.5 animate-in fade-in zoom-in-95 duration-150">
          <button
            type="button"
            onClick={() => {
              onChange("");
              setIsOpen(false);
            }}
            className={`w-full flex items-center justify-between px-3.5 py-2 rounded-xl text-xs sm:text-sm text-left transition-colors cursor-pointer ${
              !value
                ? "bg-white/90 text-[#466A51] font-bold shadow-xs"
                : "text-[#5A5248] hover:bg-white/40 hover:text-[#221E1B]"
            }`}
          >
            <span>{placeholder}</span>
            {!value && <Check className="w-3.5 h-3.5 text-[#466A51]" />}
          </button>

          {allOptions.length === 0 && !isAdding && (
            <div className="px-3.5 py-2 text-center text-xs text-[#6A6256] font-medium">
              No exercises added yet
            </div>
          )}

          {allOptions.map((opt) => {
            const isSelected = value === opt;
            const isCustom = customList.includes(opt);
            return (
              <div
                key={opt}
                onClick={() => {
                  onChange(opt);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-sm text-left transition-colors cursor-pointer group/opt ${
                  isSelected
                    ? "bg-white/95 text-[#221E1B] font-bold shadow-xs border border-white/60"
                    : "text-[#2E2824] hover:bg-white/50 hover:text-[#221E1B]"
                }`}
              >
                <div className="flex items-center gap-1.5 min-w-0 flex-1">
                  <span className="truncate">{opt}</span>
                  {isCustom && (
                    <span className="text-[9.5px] px-1.5 py-0.5 rounded-full liquid-glass-pill text-[#466A51] shrink-0 font-semibold">
                      custom
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1 shrink-0 ml-2">
                  {isCustom && (
                    <button
                      type="button"
                      onClick={(e) => handleRemoveCustom(e, opt)}
                      title="Remove custom exercise"
                      className="p-1 rounded-md text-[#7A7266] hover:text-red-600 hover:bg-red-100 transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                  {isSelected && (
                    <Check className="w-3.5 h-3.5 text-[#466A51]" />
                  )}
                </div>
              </div>
            );
          })}

          {/* Divider & Option to Add Custom Exercise */}
          <div className="pt-1 mt-1 border-t border-[#221E1B]/10">
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
                  className="flex-1 bg-transparent px-2 py-1 text-xs sm:text-sm text-[#221E1B] placeholder-[#9E968A] focus:outline-none min-w-0 font-medium"
                />
                <button
                  type="submit"
                  disabled={!newExerciseInput.trim()}
                  className="px-2.5 py-1 bg-[#466A51] hover:bg-[#385541] text-white disabled:opacity-40 disabled:cursor-not-allowed rounded-lg text-xs font-semibold transition-colors cursor-pointer shrink-0 shadow-xs"
                >
                  Add
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsAdding(false);
                    setNewExerciseInput("");
                  }}
                  className="p-1 text-[#6E6659] hover:text-[#221E1B] transition-colors cursor-pointer shrink-0"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </form>
            ) : (
              <button
                type="button"
                onClick={handleStartAdding}
                className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-[#466A51] hover:text-[#385541] hover:bg-white/40 transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add custom exercise</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
