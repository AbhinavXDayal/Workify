import React, { useState } from "react";
import { Star } from "lucide-react";

interface StarRatingBoxProps {
  rating: number; // 0 to 5
  onChange: (newRating: number) => void;
  ariaLabel?: string;
}

export const StarRatingBox: React.FC<StarRatingBoxProps> = ({
  rating,
  onChange,
  ariaLabel = "Rate session",
}) => {
  const [hoveredRating, setHoveredRating] = useState<number | null>(null);

  const displayRating = hoveredRating !== null ? hoveredRating : rating;

  return (
    <div
      role="radiogroup"
      aria-label={ariaLabel}
      className="relative w-[124px] sm:w-[204px] md:w-[236px] h-8 sm:h-9 hazy-input rounded-xl sm:rounded-2xl flex items-center justify-center gap-1 sm:gap-2 px-1.5 sm:px-2 shrink-0 select-none transition-all duration-150"
      onMouseLeave={() => setHoveredRating(null)}
    >
      {[1, 2, 3, 4, 5].map((starNum) => {
        const isFilled = starNum <= displayRating;
        return (
          <button
            key={starNum}
            type="button"
            role="radio"
            aria-checked={rating === starNum}
            aria-label={`${starNum} star${starNum > 1 ? "s" : ""}`}
            title={`${starNum} star${starNum > 1 ? "s" : ""}`}
            onMouseEnter={() => setHoveredRating(starNum)}
            onClick={() => {
              // Clicking the already active rating toggles it off (sets to 0)
              onChange(rating === starNum ? 0 : starNum);
            }}
            className="p-0.5 sm:p-1 rounded-md transition-transform duration-100 cursor-pointer active:scale-90 hover:scale-115 focus:outline-none"
          >
            <Star
              className={`w-3.5 h-3.5 sm:w-4 sm:h-4 transition-all duration-150 ${
                isFilled
                  ? "fill-[#BA9F7F] text-[#BA9F7F] drop-shadow-[0_0_3px_rgba(186,159,127,0.3)]"
                  : "fill-transparent text-[#6E6054]/50 hover:text-[#BA9F7F]/75"
              }`}
            />
          </button>
        );
      })}
    </div>
  );
};
