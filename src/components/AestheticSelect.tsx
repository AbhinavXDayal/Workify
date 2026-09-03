import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";

interface AestheticSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: string[];
  placeholder?: string;
}

export const AestheticSelect: React.FC<AestheticSelectProps> = ({
  value,
  onChange,
  options,
  placeholder = "Select exercise",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close on outside click or Escape key
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  return (
    <div ref={containerRef} className="relative flex-1 min-w-0">
      {/* Underlying standard select to preserve accessibility and automated testing */}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="sr-only"
      >
        <option value="">{placeholder}</option>
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>

      {/* Visible aesthetic trigger button with soft rounded corners */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="w-full flex items-center justify-between bg-[#1A2922] border border-[#253930] hover:border-[#3E6349] focus:border-[#7EA984] focus:ring-2 focus:ring-[#7EA984]/20 rounded-2xl px-3 py-2 sm:py-2.5 text-xs sm:text-sm text-[#EAF1EC] transition-all duration-150 cursor-pointer shadow-xs text-left group active:scale-[0.99]"
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
        <div className="absolute left-0 right-0 top-full mt-1.5 z-50 bg-[#15221D]/98 backdrop-blur-xl border border-[#253930] rounded-2xl p-1.5 shadow-2xl shadow-black/80 max-h-60 overflow-y-auto space-y-0.5 animate-in fade-in zoom-in-95 duration-150">
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
          {options.map((opt) => {
            const isSelected = value === opt;
            return (
              <button
                key={opt}
                type="button"
                onClick={() => {
                  onChange(opt);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-sm text-left transition-colors cursor-pointer ${
                  isSelected
                    ? "bg-[#23372E] text-[#EAF1EC] font-medium"
                    : "text-[#C8DACF] hover:bg-[#1F3229] hover:text-[#EAF1EC]"
                }`}
              >
                <span className="truncate">{opt}</span>
                {isSelected && (
                  <Check className="w-3.5 h-3.5 text-[#7EA984] shrink-0 ml-2" />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
