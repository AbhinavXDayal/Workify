import type { DayWorkoutConfig, WorkoutDay } from '../types/workout';

export const SPLIT_HEADER_TEXT = {
  title: 'Split',
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

// Exactly the 4 options required for Back
export const BACK_EXERCISE_OPTIONS = [
  'T bar row',
  'lat pull down',
  'Lower back extensions',
  'seated cable row',
];

export const WORKOUT_DAYS_CONFIG: Record<WorkoutDay, DayWorkoutConfig> = {
  mon_thu: {
    id: 'mon_thu',
    label: 'Mon / Thu',
    groups: [
      {
        name: 'Back',
        slotsCount: 3,
        defaultReps: 10, // Big muscles = 10
        options: BACK_EXERCISE_OPTIONS,
      },
      {
        name: 'Arms',
        slotsCount: 2,
        defaultReps: 15, // Small muscles = 15
        options: [
          'Bicep dumbbell curl',
          'Incline dumbbell curl',
          'Hammer curl',
          'Barbell curl',
          'Preacher curl',
          'Cable tricep pushdown',
          'Overhead dumbbell extension',
          'Skull crusher',
          'Dips',
        ],
      },
      {
        name: 'Shoulders',
        slotsCount: 1,
        defaultReps: 15, // Small muscles = 15
        options: [
          'Dumbbell lateral raise',
          'Overhead barbell press',
          'Dumbbell shoulder press',
          'Cable lateral raise',
          'Face pull',
          'Rear delt fly',
        ],
      },
      {
        name: 'Cardio sports / MMA',
        slotsCount: 1,
        defaultReps: 15,
        options: [
          'MMA sparring / drills',
          'Boxing bag / pads',
          'BJJ / Grappling roll',
          'Muay Thai / Kickboxing',
          'High intensity intervals / sprint',
          'Jump rope session',
        ],
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
        options: [
          'Barbell back squat',
          'Leg press',
          'Romanian deadlift',
          'Hamstring leg curl',
          'Leg extension',
          'Bulgarian split squat',
          'Standing calf raise',
          'Hack squat',
        ],
      },
      {
        name: 'Chest',
        slotsCount: 2,
        defaultReps: 12, // Mid muscles = 12
        options: [
          'Incline dumbbell press',
          'Flat barbell bench press',
          'Flat dumbbell bench press',
          'Incline machine press',
          'Cable chest fly',
          'Chest dips',
          'Pushups',
        ],
      },
      {
        name: 'Abs',
        slotsCount: 1,
        defaultReps: 15, // Small muscles = 15
        options: [
          'Hanging leg raise',
          'Cable woodchopper / crunch',
          'Ab wheel rollout',
          'Decline bench crunch',
          'Plank holds',
        ],
      },
      {
        name: 'Cardio sports / MMA',
        slotsCount: 1,
        defaultReps: 15,
        options: [
          'MMA sparring / drills',
          'Boxing bag / pads',
          'BJJ / Grappling roll',
          'Muay Thai / Kickboxing',
          'High intensity intervals / sprint',
          'Jump rope session',
        ],
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
        options: [
          'Pull-ups',
          'Parallel bar dips',
          'Push-ups',
          'Chin-ups',
          'Muscle-ups',
          'Pike push-ups',
          'Inverted rows',
        ],
      },
      {
        name: 'Self defence w tools',
        slotsCount: 2,
        defaultReps: 12, // Mid muscles = 12
        options: [
          'Stick / Kali drills',
          'Knife defense drills',
          'Baton / Impact tool work',
          'Tool grappling & retention',
          'Footwork & evasive striking',
        ],
      },
      {
        name: 'Neck',
        slotsCount: 2,
        defaultReps: 15, // Small muscles = 15
        options: [
          'Neck flexion (curl)',
          'Neck extension',
          'Lateral neck flexion',
          'Neck harness extension',
          'Isometric neck holds',
        ],
      },
      {
        name: 'Long run',
        slotsCount: 1,
        defaultReps: 10,
        options: [
          'Zone 2 steady run (5-10km)',
          '5km tempo run',
          '10km endurance run',
          'Interval track run',
          'Trail run',
        ],
      },
    ],
  },
};

