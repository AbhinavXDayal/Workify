import React, { useMemo, useState } from "react";
import { X, TrendingUp, Clock, AlertTriangle, Sparkles } from "lucide-react";
import {
  calculateWorkoutAnalytics,
  type RadarAxisData,
} from "../utils/workoutAnalytics";
import type { ExerciseSlotState, WorkoutLogHistoryItem } from "../types/workout";

interface ProgressRadarModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentSlots?: ExerciseSlotState[];
  history?: WorkoutLogHistoryItem[];
}

export const ProgressRadarModal: React.FC<ProgressRadarModalProps> = ({
  isOpen,
  onClose,
  currentSlots = [],
  history = [],
}) => {
  const [selectedAxis, setSelectedAxis] = useState<RadarAxisData | null>(null);

  const analytics = useMemo(() => {
    return calculateWorkoutAnalytics(currentSlots, history);
  }, [currentSlots, history]);

  if (!isOpen) return null;

  // SVG Radar Dimensions
  const size = 320;
  const center = size / 2;
  const radius = 100;
  const numAxes = analytics.axes.length;

  // Compute (x, y) coordinates for a given index and normalized value (0 to 1)
  const getCoordinates = (index: number, value: number) => {
    const angle = (Math.PI * 2 * index) / numAxes - Math.PI / 2;
    const x = center + radius * value * Math.cos(angle);
    const y = center + radius * value * Math.sin(angle);
    return { x, y, angle };
  };

  // Concentric polygon grid levels (20%, 40%, 60%, 80%, 100%)
  const levels = [0.2, 0.4, 0.6, 0.8, 1.0];

  // Generate SVG polygon points for the data
  const dataPolygonPoints = analytics.axes
    .map((axis, i) => {
      const { x, y } = getCoordinates(i, axis.score / 100);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-3 sm:p-4 backdrop-blur-lg animate-in fade-in duration-200">
      <div className="liquid-glass-card rounded-3xl w-full max-w-xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden border border-white/25">
        {/* Header */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-white/15 shrink-0">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-xl bg-white/15 border border-white/25 shadow-xs">
              <Sparkles className="w-4 h-4 text-[#FFAE6B]" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-[#FFFDF8] tracking-tight">
                Workout Progress Radar
              </h2>
              <p className="text-[11px] text-[#DDCBB8]">
                Spider web overview & progressive overload balance
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full text-[#D4BEA8] hover:text-[#FFFFFF] hover:bg-white/15 transition-colors active:scale-95 cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Scrollable Content */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 sm:space-y-5 custom-glass-scrollbar">
          {/* 1. Interactive Spider Web (Radar) Chart */}
          <div className="flex flex-col items-center justify-center relative select-none">
            <svg
              viewBox={`0 0 ${size} ${size}`}
              className="w-full max-w-[290px] sm:max-w-[320px] aspect-square overflow-visible"
            >
              <defs>
                {/* Luminous amber/cognac gradient for the filled spider web */}
                <radialGradient
                  id="radarGradient"
                  cx="50%"
                  cy="50%"
                  r="50%"
                  fx="50%"
                  fy="50%"
                >
                  <stop offset="0%" stopColor="#FFAE6B" stopOpacity="0.55" />
                  <stop offset="70%" stopColor="#D48E58" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="#8C5228" stopOpacity="0.18" />
                </radialGradient>
                <filter
                  id="glow"
                  x="-20%"
                  y="-20%"
                  width="140%"
                  height="140%"
                >
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>

              {/* Concentric Spider Web Rings */}
              {levels.map((level, lvlIdx) => {
                const ringPoints = analytics.axes
                  .map((_, i) => {
                    const { x, y } = getCoordinates(i, level);
                    return `${x.toFixed(1)},${y.toFixed(1)}`;
                  })
                  .join(" ");

                return (
                  <polygon
                    key={lvlIdx}
                    points={ringPoints}
                    fill="none"
                    stroke="rgba(255, 240, 225, 0.16)"
                    strokeWidth="1"
                    strokeDasharray={lvlIdx < 4 ? "2,2" : undefined}
                  />
                );
              })}

              {/* Radial Spokes connecting Center to Vertices */}
              {analytics.axes.map((_, i) => {
                const { x, y } = getCoordinates(i, 1.0);
                return (
                  <line
                    key={i}
                    x1={center}
                    y1={center}
                    x2={x}
                    y2={y}
                    stroke="rgba(255, 240, 225, 0.2)"
                    strokeWidth="1"
                  />
                );
              })}

              {/* The Glowing Spider Web Data Polygon */}
              <polygon
                points={dataPolygonPoints}
                fill="url(#radarGradient)"
                stroke="#FFAE6B"
                strokeWidth="2.5"
                filter="url(#glow)"
                className="transition-all duration-300"
              />

              {/* Center Dot */}
              <circle
                cx={center}
                cy={center}
                r="3"
                fill="#FFAE6B"
                opacity="0.8"
              />

              {/* Interactive Vertices & Outer Labels */}
              {analytics.axes.map((axis, i) => {
                const dataCoord = getCoordinates(i, axis.score / 100);
                const labelCoord = getCoordinates(i, 1.25);
                const isSelected = selectedAxis?.id === axis.id;

                return (
                  <g key={axis.id}>
                    {/* Glowing Vertex Node */}
                    <circle
                      cx={dataCoord.x}
                      cy={dataCoord.y}
                      r={isSelected ? 6 : 4}
                      fill={isSelected ? "#FFFFFF" : "#FFFDF8"}
                      stroke="#FFAE6B"
                      strokeWidth={isSelected ? 2.5 : 1.5}
                      className="cursor-pointer transition-all duration-150"
                      onClick={() => setSelectedAxis(axis)}
                    />

                    {/* Outer Label text: Name & Score */}
                    <text
                      x={labelCoord.x}
                      y={labelCoord.y}
                      textAnchor="middle"
                      dominantBaseline="central"
                      onClick={() => setSelectedAxis(axis)}
                      className={`text-[10px] sm:text-[11px] font-semibold cursor-pointer transition-colors ${
                        isSelected
                          ? "fill-[#FFAE6B] font-bold"
                          : "fill-[#FAF5EE] hover:fill-[#FFAE6B]"
                      }`}
                    >
                      <tspan x={labelCoord.x} dy="-0.4em">
                        {axis.name}
                      </tspan>
                      <tspan
                        x={labelCoord.x}
                        dy="1.2em"
                        className="text-[9px] font-bold fill-[#F0B888]"
                      >
                        {axis.score}%
                      </tspan>
                    </text>
                  </g>
                );
              })}
            </svg>

            {/* Tap/Selected Details Bar */}
            {selectedAxis && (
              <div className="mt-2 text-center text-xs px-3 py-1.5 rounded-xl bg-white/10 border border-white/20 animate-in fade-in duration-150">
                <span className="font-bold text-[#FFFDF8]">
                  {selectedAxis.name}
                </span>
                <span className="text-[#DDCBB8] ml-2">
                  {selectedAxis.weightKg > 0
                    ? `Max: ${selectedAxis.weightKg} kg`
                    : "Bodyweight"}
                  {selectedAxis.lastTrainedDaysAgo !== null
                    ? ` · Last trained: ${selectedAxis.lastTrainedDaysAgo}d ago`
                    : ""}
                </span>
              </div>
            )}
          </div>

          {/* 2. Intelligent Growth & Progressive Overload Recommendations */}
          <div className="space-y-2.5 pt-1">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#F0DEC8] px-1 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#FFAE6B] shadow-[0_0_8px_rgba(255,174,107,0.7)]" />
              Actionable Progression Guidance
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-2.5">
              {/* Card 1: Progressive Overload Target */}
              <div className="liquid-glass-pill rounded-2xl p-3 sm:p-3.5 space-y-1.5 border border-white/25 shadow-xs">
                <div className="flex items-center gap-1.5 text-[#FFAE6B]">
                  <TrendingUp className="w-3.5 h-3.5 shrink-0" />
                  <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider">
                    Progressive Overload
                  </span>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-bold text-[#FFFDF8]">
                    {analytics.recommendations.progressiveOverload.targetArea}
                  </p>
                  <p className="text-[11px] text-[#DDCBB8] leading-tight">
                    {analytics.recommendations.progressiveOverload.message}
                  </p>
                  <p className="text-[11px] text-[#F0B888] font-semibold leading-tight pt-0.5">
                    ⚡{" "}
                    {
                      analytics.recommendations.progressiveOverload
                        .actionableStep
                    }
                  </p>
                </div>
              </div>

              {/* Card 2: Overdue / Longest Stagnant Area */}
              <div className="liquid-glass-pill rounded-2xl p-3 sm:p-3.5 space-y-1.5 border border-white/25 shadow-xs">
                <div className="flex items-center gap-1.5 text-[#F0B888]">
                  <Clock className="w-3.5 h-3.5 shrink-0" />
                  <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider">
                    Overdue Focus
                  </span>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-bold text-[#FFFDF8]">
                    {analytics.recommendations.overdueArea.targetArea}
                  </p>
                  <p className="text-[11px] text-[#DDCBB8] leading-tight">
                    {analytics.recommendations.overdueArea.message}
                  </p>
                  <p className="text-[11px] text-[#F0B888] font-semibold leading-tight pt-0.5">
                    ⏳ {analytics.recommendations.overdueArea.actionableStep}
                  </p>
                </div>
              </div>

              {/* Card 3: Lagging Metric / Development Priority */}
              <div className="liquid-glass-pill rounded-2xl p-3 sm:p-3.5 space-y-1.5 border border-white/25 shadow-xs">
                <div className="flex items-center gap-1.5 text-[#FFAE6B]">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                  <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider">
                    Needs More Work
                  </span>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-bold text-[#FFFDF8]">
                    {analytics.recommendations.laggingArea.targetArea}
                  </p>
                  <p className="text-[11px] text-[#DDCBB8] leading-tight">
                    {analytics.recommendations.laggingArea.message}
                  </p>
                  <p className="text-[11px] text-[#F0B888] font-semibold leading-tight pt-0.5">
                    🎯 {analytics.recommendations.laggingArea.actionableStep}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
