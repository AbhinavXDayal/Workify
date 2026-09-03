import { useState, useEffect, useCallback, useRef } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { WORKOUT_DAYS_CONFIG } from '../constants/workoutConfig';
import type {
  WorkoutDay,
  ExerciseSlotState,
  WorkoutLogHistoryItem,
} from '../types/workout';

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

// Generate blank template slots based on active day config
export function createDefaultSlots(day: WorkoutDay): ExerciseSlotState[] {
  const config = WORKOUT_DAYS_CONFIG[day];
  const initialSlots: ExerciseSlotState[] = [];

  config.groups.forEach((group) => {
    for (let i = 0; i < group.slotsCount; i++) {
      let initialExercise = '';
      if (group.name === 'Back' && group.options[i]) {
        initialExercise = group.options[i];
      }

      initialSlots.push({
        muscleGroup: group.name,
        slotNumber: i,
        exerciseName: initialExercise,
        weightKg: '',
        reps: String(group.defaultReps),
        defaultReps: group.defaultReps,
      });
    }
  });

  return initialSlots;
}

export function useWorkoutLogger(activeDay: WorkoutDay, user: User | null) {
  const [slots, setSlots] = useState<ExerciseSlotState[]>(() =>
    createDefaultSlots(activeDay)
  );
  const [status, setStatus] = useState<SaveStatus>('idle');
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [loadingInitialData, setLoadingInitialData] = useState<boolean>(false);
  const [history, setHistory] = useState<WorkoutLogHistoryItem[]>([]);
  const [showHistory, setShowHistory] = useState<boolean>(false);

  // Status timer ref to clear message
  const statusTimerRef = useRef<number | null>(null);

  // Fetch the latest workout log and history for active day
  const loadDayData = useCallback(async () => {
    if (!isSupabaseConfigured() || !user) {
      setSlots(createDefaultSlots(activeDay));
      setHistory([]);
      return;
    }

    setLoadingInitialData(true);
    try {
      // 1. Fetch recent logs for history
      const { data: logsData, error: logsError } = await supabase
        .from('workout_logs')
        .select(`
          id,
          workout_day,
          workout_date,
          created_at,
          workout_exercises (
            id,
            workout_log_id,
            muscle_group,
            slot_number,
            exercise_name,
            weight_kg,
            reps,
            created_at,
            updated_at
          )
        `)
        .eq('workout_day', activeDay)
        .order('workout_date', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(10);

      if (logsError) {
        console.error('Failed to fetch workout logs:', logsError);
        setSlots(createDefaultSlots(activeDay));
        return;
      }

      if (logsData && logsData.length > 0) {
        // Format history
        const formattedHistory: WorkoutLogHistoryItem[] = logsData.map((log) => ({
          id: log.id,
          workout_day: log.workout_day,
          workout_date: log.workout_date,
          created_at: log.created_at,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          exercises: (log.workout_exercises as any[]) || [],
        }));
        setHistory(formattedHistory);

        // Populate slots with most recent session's exercises
        const latestLog = formattedHistory[0];
        const defaultSlots = createDefaultSlots(activeDay);

        const mergedSlots = defaultSlots.map((slot) => {
          const matchedExercise = latestLog.exercises.find(
            (e) =>
              e.muscle_group === slot.muscleGroup &&
              e.slot_number === slot.slotNumber
          );

          if (matchedExercise) {
            return {
              ...slot,
              exerciseName: matchedExercise.exercise_name || slot.exerciseName,
              weightKg:
                matchedExercise.weight_kg !== null && matchedExercise.weight_kg !== undefined
                  ? String(matchedExercise.weight_kg)
                  : '',
              reps:
                matchedExercise.reps !== null && matchedExercise.reps !== undefined
                  ? String(matchedExercise.reps)
                  : String(slot.defaultReps),
            };
          }
          return slot;
        });

        setSlots(mergedSlots);
      } else {
        // No logs yet for this day
        setSlots(createDefaultSlots(activeDay));
        setHistory([]);
      }
    } catch (err) {
      console.error('Error in loadDayData:', err);
      setSlots(createDefaultSlots(activeDay));
    } finally {
      setLoadingInitialData(false);
    }
  }, [activeDay, user]);

  // Load when activeDay or user changes
  useEffect(() => {
    loadDayData();
  }, [loadDayData]);

  // Update a specific slot's field
  const updateSlot = (
    index: number,
    field: 'exerciseName' | 'weightKg' | 'reps',
    value: string
  ) => {
    setSlots((prev) => {
      const next = [...prev];
      if (!next[index]) return prev;

      // Sanitize numerical inputs
      if (field === 'weightKg') {
        // Allow empty or positive decimal numbers
        const cleanVal = value.replace(/[^0-9.]/g, '');
        const parts = cleanVal.split('.');
        const safeVal = parts.length > 2 ? `${parts[0]}.${parts.slice(1).join('')}` : cleanVal;
        next[index] = { ...next[index], weightKg: safeVal };
      } else if (field === 'reps') {
        // Allow empty or positive integers
        const cleanVal = value.replace(/[^0-9]/g, '');
        next[index] = { ...next[index], reps: cleanVal };
      } else {
        // When user changes exercise, check if there's prior history for this specific exercise
        let defaultWeight = next[index].weightKg;
        let defaultReps = next[index].reps;

        if (value && history.length > 0) {
          for (const session of history) {
            const prior = session.exercises.find(
              (e) => e.exercise_name?.toLowerCase() === value.toLowerCase()
            );
            if (prior) {
              if (prior.weight_kg !== null && !defaultWeight) {
                defaultWeight = String(prior.weight_kg);
              }
              if (prior.reps !== null && (!defaultReps || defaultReps === String(next[index].defaultReps))) {
                defaultReps = String(prior.reps);
              }
              break;
            }
          }
        }

        next[index] = {
          ...next[index],
          exerciseName: value,
          weightKg: defaultWeight,
          reps: defaultReps || String(next[index].defaultReps),
        };
      }

      return next;
    });
  };

  // Clear current input fields
  const clearEntries = () => {
    setSlots((prev) =>
      prev.map((slot) => ({
        ...slot,
        weightKg: '',
        reps: String(slot.defaultReps),
      }))
    );
    setStatus('idle');
    setStatusMessage('');
  };

  // Save workout session to Supabase
  const saveWorkout = async () => {
    if (!isSupabaseConfigured()) {
      setStatus('error');
      setStatusMessage('Supabase not configured. Add credentials in .env');
      return;
    }

    if (!user) {
      setStatus('error');
      setStatusMessage('Please sign in to save workouts to the cloud');
      return;
    }

    // Check if at least one exercise is selected
    const activeEntries = slots.filter(
      (s) => s.exerciseName && s.exerciseName.trim().length > 0
    );

    if (activeEntries.length === 0) {
      setStatus('error');
      setStatusMessage('Select at least one exercise before saving');
      return;
    }

    setStatus('saving');
    setStatusMessage('Saving...');

    try {
      const today = new Date().toISOString().slice(0, 10);

      // 1. Create workout_log record
      const { data: logData, error: logError } = await supabase
        .from('workout_logs')
        .insert({
          user_id: user.id,
          workout_day: activeDay,
          workout_date: today,
        })
        .select()
        .single();

      if (logError || !logData) {
        throw new Error(logError?.message || 'Failed to create workout log');
      }

      // 2. Prepare workout_exercises payload
      const exercisesPayload = slots
        .filter((s) => s.exerciseName && s.exerciseName.trim().length > 0)
        .map((s) => {
          const parsedKg = s.weightKg !== '' ? parseFloat(s.weightKg) : null;
          const parsedReps = s.reps !== '' ? parseInt(s.reps, 10) : null;

          return {
            workout_log_id: logData.id,
            muscle_group: s.muscleGroup,
            slot_number: s.slotNumber,
            exercise_name: s.exerciseName.trim(),
            weight_kg: Number.isFinite(parsedKg) ? parsedKg : null,
            reps: Number.isFinite(parsedReps) ? parsedReps : null,
          };
        });

      // 3. Insert exercises
      const { error: exercisesError } = await supabase
        .from('workout_exercises')
        .insert(exercisesPayload);

      if (exercisesError) {
        throw new Error(exercisesError.message);
      }

      setStatus('saved');
      setStatusMessage('Saved');

      // Refresh history & sync data in background
      await loadDayData();

      // Clear success message after 3 seconds
      if (statusTimerRef.current) clearTimeout(statusTimerRef.current);
      statusTimerRef.current = window.setTimeout(() => {
        setStatus('idle');
        setStatusMessage('');
      }, 3000);
    } catch (err: unknown) {
      console.error('Error saving workout:', err);
      const message = err instanceof Error ? err.message : 'Unable to save';
      setStatus('error');
      setStatusMessage(message);
    }
  };

  return {
    slots,
    status,
    statusMessage,
    loadingInitialData,
    history,
    showHistory,
    setShowHistory,
    updateSlot,
    clearEntries,
    saveWorkout,
    refreshData: loadDayData,
  };
}

