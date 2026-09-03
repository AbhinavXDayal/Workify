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
  if (typeof window === "undefined" || !group) return [];
  try {
    const raw = localStorage.getItem("workify_custom_exercises");
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (parsed && Array.isArray(parsed[group])) {
      return parsed[group];
    }
  } catch {
    // Ignore storage errors
  }
  return [];
};

const saveCustomOptionToStorage = (group: string, newOption: string) => {
  if (typeof window === "undefined" || !group) return;
  try {
    const raw = localStorage.getItem("workify_custom_exercises");
    const parsed = raw ? JSON.parse(raw) : {};
    const existing: string[] = Array.isArray(parsed[group]) ? parsed[group] : [];
    if (!existing.includes(newOption)) {
      parsed[group] = [...existing, newOption];
      localStorage.setItem("workify_custom_exercises", JSON.stringify(parsed));
    }
  } catch {
    // Ignore storage errors
  }
};

const removeCustomOptionFromStorage = (group: string, optionToRemove: string) => {
  if (typeof window === "undefined" || !group) return;
  try {
    const raw = localStorage.getItem("workify_custom_exercises");
    if (!raw) return;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed[group])) {
      parsed[group] = parsed[group].filter((opt: string) => opt !== optionToRemove);
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
    setCustomList((prev) => (prev.includes(trimmed) ? prev : [...prev, trimmed]));
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

      {/* Visible aesthetic trigger button with soft rounded corners */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="w-full flex items-center justify-between bg-[#1A2922] border border-[#253930] hover:border-[#3E6349] focus:border-[#7EA984] focus:ring-2 focus:ring-[#7EA984]/20 rounded-xl sm:rounded-2xl px-2.5 py-1.5 sm:py-2.5 text-xs sm:text-sm text-[#EAF1EC] transition-all duration-150 cursor-pointer shadow-xs text-left group active:scale-[0.99] min-h-[32px] sm:min-h-[38px]"
      >
        <span
          className={`truncate ${!value ? "text-[#5A7465]" : "text-[#EAF1EC] font-medium"}`}
        >
          {value || placeholder}
        </span>
        <ChevronDown
          className={`w-4 h-4 text-[#7EA984]/80 transition-transform duration-200 shrink-0 ml-2 ${
            isOpen ? "rotate-180 text-[#7EA984]" : "group-hover:text-[#7EA984]"
          }`}
        />
      </button>

      {/* Custom aesthetic dropdown popover with soft rounded corners */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-1.5 z-50 bg-[#15221D]/98 backdrop-blur-xl border border-[#253930] rounded-2xl p-1.5 shadow-2xl shadow-black/80 max-h-64 overflow-y-auto space-y-0.5 animate-in fade-in zoom-in-95 duration-150">
          <button
            type="button"
            onClick={() => {
              onChange("");
              setIsOpen(false);
            }}
            className={`w-full flex items-center justify-between px-3.5 py-2 rounded-xl text-xs sm:text-sm text-left transition-colors cursor-pointer ${
              !value
                ? "bg-[#23372E] text-[#7EA984] font-medium"
                : "text-[#5A7465] hover:bg-[#1F3229] hover:text-[#8FA898]"
            }`}
          >
            <span>{placeholder}</span>
            {!value && <Check className="w-3.5 h-3.5 text-[#7EA984]" />}
          </button>

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
                    ? "bg-[#23372E] text-[#EAF1EC] font-medium"
                    : "text-[#C8DACF] hover:bg-[#1F3229] hover:text-[#EAF1EC]"
                }`}
              >
                <div className="flex items-center gap-1.5 min-w-0 flex-1">
                  <span className="truncate">{opt}</span>
                  {isCustom && (
                    <span className="text-[9px] px-1 py-0.2 rounded bg-[#101B16] text-[#7EA984] border border-[#3E6349]/40 shrink-0">
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
                      className="p-1 rounded-md text-[#5A7465] hover:text-red-400 hover:bg-red-950/30 transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                  {isSelected && (
                    <Check className="w-3.5 h-3.5 text-[#7EA984]" />
                  )}
                </div>
              </div>
            );
          })}

          {/* Divider & Option to Add Custom Exercise */}
          <div className="pt-1 mt-1 border-t border-[#253930]/70">
            {isAdding ? (
              <form
                onSubmit={handleSaveCustom}
                className="flex items-center gap-1 p-1 bg-[#101B16] border border-[#3E6349] rounded-xl"
              >
                <input
                  ref={inputRef}
                  type="text"
                  value={newExerciseInput}
                  onChange={(e) => setNewExerciseInput(e.target.value)}
                  placeholder="Enter exercise name..."
                  className="flex-1 bg-transparent px-2 py-1 text-xs sm:text-sm text-[#EAF1EC] placeholder-[#5A7465] focus:outline-none min-w-0"
                />
                <button
                  type="submit"
                  disabled={!newExerciseInput.trim()}
                  className="px-2.5 py-1 bg-[#23372E] hover:bg-[#304B3E] text-[#7EA984] hover:text-[#EAF1EC] disabled:opacity-40 disabled:cursor-not-allowed rounded-lg text-xs font-semibold transition-colors cursor-pointer shrink-0"
                >
                  Add
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsAdding(false);
                    setNewExerciseInput("");
                  }}
                  className="p-1 text-[#8FA898] hover:text-[#EAF1EC] transition-colors cursor-pointer shrink-0"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </form>
            ) : (
              <button
                type="button"
                onClick={handleStartAdding}
                className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-[#7EA984] hover:text-[#A1C9A7] hover:bg-[#1A2922] transition-colors cursor-pointer"
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
