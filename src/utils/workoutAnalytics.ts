import type { WorkoutLogHistoryItem, ExerciseSlotState, WorkoutDay } from '../types/workout';
import { getExerciseStats } from './customExercises';

export interface RadarAxisData {
  id: string;
  name: string;
  score: number; // 15 to 98
  weightKg: number;
  reps: number;
  volume: number;
  lastTrainedDaysAgo: number | null;
  exerciseCount: number;
  topExercise: string;
}

export interface OverloadRecommendation {
  type: 'overload' | 'overdue' | 'lagging';
  title: string;
  targetArea: string;
  message: string;
  actionableStep: string;
}

export interface WorkoutAnalyticsResult {
  axes: RadarAxisData[];
  recommendations: {
    progressiveOverload: OverloadRecommendation;
    overdueArea: OverloadRecommendation;
    laggingArea: OverloadRecommendation;
  };
}

export const RADAR_CATEGORIES = [
  { id: 'back', name: 'Back', match: (g?: string) => (g || '').toLowerCase().includes('back') },
  { id: 'chest', name: 'Chest', match: (g?: string) => (g || '').toLowerCase().includes('chest') },
  { id: 'legs', name: 'Legs', match: (g?: string) => (g || '').toLowerCase().includes('leg') },
  { id: 'shoulders', name: 'Shoulders', match: (g?: string) => (g || '').toLowerCase().includes('shoulder') },
  { id: 'arms', name: 'Arms', match: (g?: string) => (g || '').toLowerCase().includes('arm') || (g || '').toLowerCase().includes('bicep') || (g || '').toLowerCase().includes('tricep') },
  { id: 'core', name: 'Core & Abs', match: (g?: string) => (g || '').toLowerCase().includes('ab') || (g || '').toLowerCase().includes('neck') },
  { id: 'calisthenics', name: 'Calisthenics', match: (g?: string) => (g || '').toLowerCase().includes('calisthenic') || (g || '').toLowerCase().includes('tool') || (g || '').toLowerCase().includes('defence') },
  { id: 'cardio', name: 'Cardio & MMA', match: (g?: string) => (g || '').toLowerCase().includes('cardio') || (g || '').toLowerCase().includes('run') || (g || '').toLowerCase().includes('mma') },
];

// Target benchmark weight (kg) for normalized 100% intensity calculation
const BENCHMARK_WEIGHTS: Record<string, number> = {
  back: 75,
  chest: 70,
  legs: 90,
  shoulders: 35,
  arms: 28,
  core: 25,
  calisthenics: 30,
  cardio: 20,
};

// Helper to gather all slot states across mon_thu, tue_fri, and wed
export function getAllSavedSlots(): ExerciseSlotState[] {
  if (typeof window === 'undefined') return [];
  const days: WorkoutDay[] = ['mon_thu', 'tue_fri', 'wed'];
  const allSlots: ExerciseSlotState[] = [];

  days.forEach((d) => {
    try {
      const raw = localStorage.getItem(`workify_slots_${d}`);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          allSlots.push(...parsed);
        }
      }
    } catch {
      // ignore JSON parse errors
    }
  });

  return allSlots;
}

export function calculateWorkoutAnalytics(
  currentSlots: ExerciseSlotState[] = [],
  history: WorkoutLogHistoryItem[] = []
): WorkoutAnalyticsResult {
  // Combine all slot sources: active slots + stored slots from other days
  const storedSlots = getAllSavedSlots();
  const slotMap = new Map<string, ExerciseSlotState>();

  storedSlots.forEach((s) => {
    const key = `${s.muscleGroup}-${s.slotNumber}`;
    slotMap.set(key, s);
  });

  // Current slots override stored slots for active day
  currentSlots.forEach((s) => {
    const key = `${s.muscleGroup}-${s.slotNumber}`;
    slotMap.set(key, s);
  });

  const allActiveSlots = Array.from(slotMap.values());

  // 1. Process metrics per category
  const axes: RadarAxisData[] = RADAR_CATEGORIES.map((cat) => {
    const matchingSlots = allActiveSlots.filter((s) => cat.match(s.muscleGroup));

    let maxWeight = 0;
    let maxReps = 0;
    let totalVolume = 0;
    let validExercisesCount = 0;
    let topExercise = '';

    matchingSlots.forEach((slot) => {
      const exName = slot.exerciseName ? slot.exerciseName.trim() : '';
      let weightNum = slot.weightKg ? parseFloat(slot.weightKg) : 0;
      let repsNum = slot.reps ? parseInt(slot.reps, 10) : slot.defaultReps;

      // Also check cached stats for exercise if slot is blank
      if (exName && (!weightNum || !slot.weightKg)) {
        const cached = getExerciseStats(exName);
        if (cached?.weightKg) {
          weightNum = parseFloat(cached.weightKg) || weightNum;
        }
      }

      if (exName) {
        validExercisesCount++;
        if (weightNum >= maxWeight) {
          maxWeight = weightNum;
          topExercise = exName;
        }
        if (repsNum > maxReps) {
          maxReps = repsNum;
        }
        totalVolume += 2 * (weightNum || 12) * (repsNum || 10);
      }
    });

    // Check history for recent activity & recency
    let daysAgo: number | null = null;
    if (history && history.length > 0) {
      const now = new Date();
      for (const log of history) {
        const found = log.exercises?.some((e) => cat.match(e.muscle_group));
        if (found) {
          const logDate = new Date(log.workout_date);
          const diffMs = now.getTime() - logDate.getTime();
          daysAgo = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
          break;
        }
      }
    }

    // Baseline minimum score for visibility on radar
    let score = 25;

    if (validExercisesCount > 0) {
      const benchmark = BENCHMARK_WEIGHTS[cat.id] || 50;
      const weightFactor = Math.min(1.2, maxWeight / benchmark);
      const exerciseCoverage = Math.min(1.0, validExercisesCount / Math.max(1, matchingSlots.length));
      
      // Score calculation combining intensity and slot completion
      score = Math.round(35 + (weightFactor * 35) + (exerciseCoverage * 22));

      // Recency modifier: penalty if stagnant or inactive > 7 days
      if (daysAgo !== null && daysAgo > 6) {
        score = Math.max(22, score - Math.min(25, (daysAgo - 6) * 3));
      }
    }

    score = Math.min(98, Math.max(18, score));

    return {
      id: cat.id,
      name: cat.name,
      score,
      weightKg: maxWeight,
      reps: maxReps,
      volume: totalVolume,
      lastTrainedDaysAgo: daysAgo,
      exerciseCount: validExercisesCount,
      topExercise: topExercise || matchingSlots[0]?.exerciseName || 'Exercise',
    };
  });

  // 2. Compute Progressive Overload Recommendation
  const activeAxesWithWeight = axes.filter((a) => a.weightKg > 0);
  let overloadAxis = activeAxesWithWeight[0] || axes[0];
  
  if (activeAxesWithWeight.length > 1) {
    overloadAxis = activeAxesWithWeight.reduce((prev, curr) =>
      curr.score >= prev.score ? curr : prev
    );
  }

  const currentKg = overloadAxis.weightKg;
  const overloadIncrease = currentKg >= 40 ? 2.5 : currentKg >= 15 ? 1.5 : 1.0;
  const targetOverloadKg = (currentKg + overloadIncrease).toFixed(1).replace(/\.0$/, '');

  const progressiveOverload: OverloadRecommendation = {
    type: 'overload',
    title: 'Progressive Overload Target',
    targetArea: overloadAxis.name,
    message: currentKg > 0
      ? `${overloadAxis.topExercise || overloadAxis.name} is currently logged at ${currentKg} kg.`
      : `${overloadAxis.name} has active rep targets.`,
    actionableStep: currentKg > 0
      ? `Progress to ${targetOverloadKg} kg (+${overloadIncrease} kg) or push for +1 rep to absolute failure.`
      : `Add weight to working sets and target 1 rep in reserve (1 RIR).`,
  };

  // 3. Compute Longest Untrained / Overdue Area
  let overdueAxis = axes[0];
  let maxDays = -1;

  axes.forEach((a) => {
    if (a.lastTrainedDaysAgo !== null && a.lastTrainedDaysAgo > maxDays) {
      maxDays = a.lastTrainedDaysAgo;
      overdueAxis = a;
    }
  });

  if (maxDays === -1) {
    overdueAxis = [...axes].sort((a, b) => a.exerciseCount - b.exerciseCount)[0] || axes[0];
  }

  const overdueArea: OverloadRecommendation = {
    type: 'overdue',
    title: 'Overdue for Progression',
    targetArea: overdueAxis.name,
    message: maxDays >= 0
      ? `It has been ${maxDays} days since you progressed this muscle group.`
      : `Less activity has been recorded for this area recently.`,
    actionableStep: `Prioritize ${overdueAxis.name} first in your next routine with 2 intense sets to absolute failure.`,
  };

  // 4. Compute Lowest Metric / Lagging Area
  const laggingAxis = [...axes].sort((a, b) => a.score - b.score)[0] || axes[0];

  const laggingArea: OverloadRecommendation = {
    type: 'lagging',
    title: 'Development Priority',
    targetArea: laggingAxis.name,
    message: `Lowest developed metric across your routine (${laggingAxis.score}% development score).`,
    actionableStep: `Focus on ${laggingAxis.name} with controlled tempo and full ROM to balance symmetry.`,
  };

  return {
    axes,
    recommendations: {
      progressiveOverload,
      overdueArea,
      laggingArea,
    },
  };
}
