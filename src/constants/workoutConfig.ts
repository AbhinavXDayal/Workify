import type { DayWorkoutConfig, WorkoutDay } from '../types/workout';

export const SPLIT_HEADER_TEXT = {
  title: 'Workify',
  overview: 'Dynamic warmup → weightlifting ( free weights ) → sports / cardio → self defence',
  priority: 'Weightlifting & sports are high priority, ( for cardio sports is enough, however to track cardio we are using running ), then running & mma',
  days: [
    'Mon, thu - back ( 3 ), arms ( 2 ), shoulders ( 1 ) + sports / running',
    'Tue, fri - legs ( 3 ), chest ( 2 ), abs ( 1 ) + sports / mma',
    'Wed - calisthenics ( 3 ) + self defence ( 2 ) + neck ( 2 ) + long run ( 1 )',
  ],
  pyramidWarmup:
    'Pyramid warmup - sets 2 | reps - mid weight ( 10 ), heavy weight ( 5 )',
  guidelines:
    'Target weight - sets 2 | reps - big muscles ( 10 ), mid muscles ( 12 ), small muscles ( 15 )',
  cardioGuideline:
    "Cardio - we are tracking cardio via sports & running, sports is for fun & enough for cardio, but we don't use it as a metric\nFor running, run X km in X mins/hrs",
  instruction:
    'Choose a weight where the Zth rep feels very hard & close to failure, safely progressive overload, use controlled reps with natural full ROM, proper form & 1 RIR, never ego lift. Warm up properly & use backups and supporting gear when needed, such as spotters, safety bars, knee sleeves or lifting straps. Listen to your body & if something feels unsafe or uncomfortable, stop or be cautious',
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
        name: 'Sports / running',
        slotsCount: 1,
        defaultReps: 0,
        trackingType: 'km_time',
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
        name: 'Sports / MMA',
        slotsCount: 1,
        defaultReps: 0,
        trackingType: 'km_time',
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
        defaultReps: 0,
        trackingType: 'hold',
        options: [],
      },
      {
        name: 'Self defence',
        slotsCount: 2,
        defaultReps: 0,
        trackingType: 'km_time',
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
        trackingType: 'km_time',
        options: [],
      },
    ],
  },
};

/**
 * Returns true if today is Saturday (6) or Sunday (0)
 */
export function isWeekendRestDay(date: Date = new Date()): boolean {
  const day = date.getDay();
  return day === 0 || day === 6;
}

/**
 * Automatically determines which workout tab to open based on the day of the week:
 * - Monday (1) or Thursday (4) -> 'mon_thu'
 * - Tuesday (2) or Friday (5) -> 'tue_fri'
 * - Wednesday (3) -> 'wed'
 * - Saturday (6) or Sunday (0) -> 'mon_thu' (start of next cycle)
 */
export function getTodaysWorkoutDay(date: Date = new Date()): WorkoutDay {
  const day = date.getDay();
  switch (day) {
    case 1: // Monday
    case 4: // Thursday
      return 'mon_thu';
    case 2: // Tuesday
    case 5: // Friday
      return 'tue_fri';
    case 3: // Wednesday
      return 'wed';
    case 6: // Saturday
    case 0: // Sunday
    default:
      return 'mon_thu';
  }
}

/**
 * Checks if a specific exercise or activity is running
 */
export function isRunningExercise(exerciseName?: string): boolean {
  if (!exerciseName) return false;
  const normalized = exerciseName.trim().toLowerCase();
  return normalized === 'running' || normalized.includes('run');
}

/**
 * Formats time unit based on distance (km) input:
 * 1-5 km => mins, > 5 km => hrs, default => time
 */
export function getTimeUnit(kmValue?: string, _timeValue?: string): string {
  const kmNum = kmValue !== undefined && kmValue !== '' ? parseFloat(kmValue) : null;

  if (kmNum !== null && !isNaN(kmNum)) {
    if (kmNum >= 1 && kmNum <= 5) {
      return 'mins';
    }
    if (kmNum > 5) {
      return 'hrs';
    }
  }
  return 'time';
}

/**
 * Checks if a workout group uses km and time rather than KG and Reps or Stars
 */
export function isKmTimeGroup(groupName: string): boolean {
  const normalized = groupName.toLowerCase();
  return normalized.includes('running');
}

/**
 * Checks if a workout group uses a star rating rather than KG and Reps
 */
export function isRatingGroup(_groupName?: string): boolean {
  return false;
}
