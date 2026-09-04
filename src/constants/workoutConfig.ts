import type { DayWorkoutConfig, WorkoutDay } from '../types/workout';

export const SPLIT_HEADER_TEXT = {
  title: 'Workify',
  overview: 'Dynamic warmup → weightlifting ( machines & free weights ) → cardio → self defence',
  days: [
    'Mon, thu - back ( 3 ), arms ( 2 ), shoulders ( 1 ) + cardio sports / mma',
    'Tue, fri - legs ( 3 ), chest ( 2 ), abs ( 1 ) + cardio sports / mma',
    'Wed - calisthenics ( 3 ) + self defence w tools ( 2 ) + neck ( 2 ) + long run ( 1 )',
  ],
  guidelines: 'Sets - 2 | Reps - big muscles ( 10 ), mid muscles ( 12 ), small muscles ( 15 )',
  instruction:
    'Choose a weight where the Zth rep feels very hard & close to failure, use controlled reps with natural full ROM, proper form & 1 RIR, never ego lift. Warm up properly & use backups and supporting gear when needed, such as spotters, safety bars, knee sleeves or lifting straps. Listen to your body & if something feels unsafe or uncomfortable, stop or be cautious',
};

// User-defined exercise configuration: all exercises are added and managed by the user
export const BACK_EXERCISE_OPTIONS: string[] = [];

export const WORKOUT_DAYS_CONFIG: Record<WorkoutDay, DayWorkoutConfig> = {
  mon_thu: {
    id: 'mon_thu',
    label: 'Mon / Thu',
    groups: [
      {
        name: 'Back',
        slotsCount: 3,
        defaultReps: 10, // Big muscles = 10
        options: [],
      },
      {
        name: 'Arms',
        slotsCount: 2,
        defaultReps: 12, // Mid muscles = 12
        options: [],
      },
      {
        name: 'Shoulders',
        slotsCount: 1,
        defaultReps: 15, // Small muscles = 15
        options: [],
      },
      {
        name: 'Cardio sports / MMA',
        slotsCount: 1,
        defaultReps: 0,
        trackingType: 'stars',
        options: [],
      },
    ],
  },
  tue_fri: {
    id: 'tue_fri',
    label: 'Tue / Fri',
    groups: [
      {
        name: 'Legs',
        slotsCount: 3,
        defaultReps: 10, // Big muscles = 10
        options: [],
      },
      {
        name: 'Chest',
        slotsCount: 2,
        defaultReps: 12, // Mid muscles = 12
        options: [],
      },
      {
        name: 'Abs',
        slotsCount: 1,
        defaultReps: 15, // Small muscles = 15
        options: [],
      },
      {
        name: 'Cardio sports / MMA',
        slotsCount: 1,
        defaultReps: 0,
        trackingType: 'stars',
        options: [],
      },
    ],
  },
  wed: {
    id: 'wed',
    label: 'Wed',
    groups: [
      {
        name: 'Calisthenics',
        slotsCount: 3,
        defaultReps: 10, // Big muscles = 10
        options: [],
      },
      {
        name: 'Self defence w tools',
        slotsCount: 2,
        defaultReps: 0,
        trackingType: 'stars',
        options: [],
      },
      {
        name: 'Neck',
        slotsCount: 2,
        defaultReps: 15, // Small muscles = 15
        options: [],
      },
      {
        name: 'Long run',
        slotsCount: 1,
        defaultReps: 0,
        trackingType: 'stars',
        options: [],
      },
    ],
  },
};

/**
 * Checks if a workout group uses a star rating rather than KG and Reps
 */
export function isRatingGroup(groupName: string): boolean {
  const normalized = groupName.toLowerCase();
  return (
    normalized.includes('cardio') ||
    normalized.includes('mma') ||
    normalized.includes('run') ||
    normalized.includes('self defence')
  );
}


