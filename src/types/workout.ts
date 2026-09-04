export type WorkoutDay = 'mon_thu' | 'tue_fri' | 'wed';

export interface ExerciseSlotConfig {
  muscleGroup: string;
  slotNumber: number;
  options: string[];
  defaultReps: number;
}

export interface DayWorkoutConfig {
  id: WorkoutDay;
  label: string;
  groups: {
    name: string;
    slotsCount: number;
    defaultReps: number;
    options: string[];
    hideKgReps?: boolean;
  }[];
}

export interface ExerciseSlotState {
  muscleGroup: string;
  slotNumber: number;
  exerciseName: string;
  weightKg: string; // string representation in input, can be parsed to number or empty
  reps: string;     // string representation in input, can be parsed to number or empty
  defaultReps: number;
  hideKgReps?: boolean;
}

export interface WorkoutLogRecord {
  id: string;
  user_id: string;
  workout_day: WorkoutDay;
  workout_date: string;
  created_at: string;
  updated_at: string;
}

export interface WorkoutExerciseRecord {
  id: string;
  workout_log_id: string;
  muscle_group: string;
  slot_number: number;
  exercise_name: string;
  weight_kg: number | null;
  reps: number | null;
  created_at: string;
  updated_at: string;
}

export interface WorkoutLogHistoryItem {
  id: string;
  workout_day: WorkoutDay;
  workout_date: string;
  created_at: string;
  exercises: WorkoutExerciseRecord[];
}

