import { useState, useEffect, useCallback, useRef } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { WORKOUT_DAYS_CONFIG } from '../constants/workoutConfig';
import {
  saveCustomExercise,
  getExerciseStats,
  saveExerciseStats,
} from '../utils/customExercises';
import type {
  WorkoutDay,
  ExerciseSlotState,
  WorkoutLogHistoryItem,
} from '../types/workout';

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

// Helper to load cached slots from localStorage
function getLocalSlots(day: WorkoutDay): ExerciseSlotState[] | null {
  try {
    const raw = localStorage.getItem(`workify_slots_${day}`);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        const defaults = createDefaultSlots(day);
        // Ensure every slot is present and user-added exercises are never cleared
        return defaults.map((d) => {
          const found = parsed.find(
            (p) => p.muscleGroup === d.muscleGroup && p.slotNumber === d.slotNumber
          );
          if (found) {
            let repsVal = found.reps || String(d.defaultReps);
            // If defaultReps is set (>0) and cached reps exceeds it (e.g. Arms was 15, now 12)
            if (d.defaultReps > 0 && parseInt(repsVal, 10) > d.defaultReps) {
              repsVal = String(d.defaultReps);
            }
            const ratingVal =
              found.rating !== undefined && found.rating !== null
                ? Number(found.rating)
                : (found.reps ? parseInt(found.reps, 10) : 0);

            return {
              ...d,
              exerciseName: found.exerciseName || '',
              weightKg: found.weightKg || '',
              reps: repsVal,
              rating: Number.isFinite(ratingVal) ? ratingVal : 0,
            };
          }
          return d;
        });
      }
    }
  } catch {
    // ignore json parse errors
  }
  return null;
}

// Helper to persist slots to localStorage
function setLocalSlots(day: WorkoutDay, slots: ExerciseSlotState[]) {
  try {
    localStorage.setItem(`workify_slots_${day}`, JSON.stringify(slots));
  } catch {
    // ignore quota/storage errors
  }
}

// Generate blank template slots based on active day config
export function createDefaultSlots(day: WorkoutDay): ExerciseSlotState[] {
  const config = WORKOUT_DAYS_CONFIG[day];
  const initialSlots: ExerciseSlotState[] = [];

  config.groups.forEach((group) => {
    for (let i = 0; i < group.slotsCount; i++) {
      initialSlots.push({
        muscleGroup: group.name,
        slotNumber: i,
        exerciseName: '',
        weightKg: '',
        reps: String(group.defaultReps),
        defaultReps: group.defaultReps,
        rating: 0,
      });
    }
  });

  return initialSlots;
}

export function useWorkoutLogger(activeDay: WorkoutDay, user: User | null) {
  // Store all 3 days in memory so switching days is 100% instantaneous with 0ms latency
  const [slotsByDay, setSlotsByDay] = useState<Record<WorkoutDay, ExerciseSlotState[]>>(() => ({
    mon_thu: getLocalSlots('mon_thu') || createDefaultSlots('mon_thu'),
    tue_fri: getLocalSlots('tue_fri') || createDefaultSlots('tue_fri'),
    wed: getLocalSlots('wed') || createDefaultSlots('wed'),
  }));

  const slots = slotsByDay[activeDay] || [];

  const [status, setStatus] = useState<SaveStatus>('saved');
  const [statusMessage, setStatusMessage] = useState<string>('Auto-saved');
  const [loadingInitialData, setLoadingInitialData] = useState<boolean>(false);
  const [history, setHistory] = useState<WorkoutLogHistoryItem[]>([]);
  const [showHistory, setShowHistory] = useState<boolean>(false);

  // Status timer ref to clear message
  const statusTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isSwitchingDayRef = useRef<boolean>(false);

  // Seed custom exercises once on mount across all saved days
  useEffect(() => {
    const days: WorkoutDay[] = ['mon_thu', 'tue_fri', 'wed'];
    days.forEach((d) => {
      const saved = getLocalSlots(d);
      if (saved) {
        saved.forEach((s) => {
          if (s.exerciseName && s.exerciseName.trim()) {
            saveCustomExercise(s.exerciseName.trim(), s.muscleGroup);
          }
        });
      }
    });
  }, []);

  // Auto-save routine to Supabase and LocalStorage
  const saveWorkout = useCallback(
    async (currentSlots: ExerciseSlotState[]) => {
      // 1. Instant local persistence
      setLocalSlots(activeDay, currentSlots);

      if (!isSupabaseConfigured() || !user) {
        setStatus('saved');
        setStatusMessage('Auto-saved locally');
        return;
      }

      // 2. Check if at least one exercise is selected
      const activeEntries = currentSlots.filter(
        (s) => s.exerciseName && s.exerciseName.trim().length > 0
      );

      if (activeEntries.length === 0) {
        setStatus('saved');
        setStatusMessage('Auto-saved');
        return;
      }

      setStatus('saving');
      setStatusMessage('Saving...');

      try {
        const today = new Date().toISOString().slice(0, 10);
        let logId: string | null = null;

        // Find existing log for today if available
        const { data: existingLog } = await supabase
          .from('workout_logs')
          .select('id')
          .eq('user_id', user.id)
          .eq('workout_day', activeDay)
          .eq('workout_date', today)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (existingLog?.id) {
          logId = existingLog.id;
        } else {
          const { data: newLog, error: createError } = await supabase
            .from('workout_logs')
            .insert({
              user_id: user.id,
              workout_day: activeDay,
              workout_date: today,
            })
            .select()
            .single();

          if (createError || !newLog) {
            throw createError || new Error('Failed to create workout log');
          }
          logId = newLog.id;
        }

        // Delete old slot exercises for this log and insert the updated set
        await supabase
          .from('workout_exercises')
          .delete()
          .eq('workout_log_id', logId);

        const exercisesPayload = currentSlots
          .filter((s) => s.exerciseName && s.exerciseName.trim().length > 0)
          .map((s) => {
            const parsedKg = s.weightKg !== '' ? parseFloat(s.weightKg) : null;
            const parsedReps = s.reps !== '' ? parseInt(s.reps, 10) : (s.rating || null);

            return {
              workout_log_id: logId,
              muscle_group: s.muscleGroup,
              slot_number: s.slotNumber,
              exercise_name: s.exerciseName.trim(),
              weight_kg: Number.isFinite(parsedKg) ? parsedKg : null,
              reps: Number.isFinite(parsedReps) ? parsedReps : null,
            };
          });

        if (exercisesPayload.length > 0) {
          const { error: exercisesError } = await supabase
            .from('workout_exercises')
            .insert(exercisesPayload);

          if (exercisesError) throw exercisesError;
        }

        setStatus('saved');
        setStatusMessage('Auto-saved');

        if (statusTimerRef.current) clearTimeout(statusTimerRef.current);
        statusTimerRef.current = setTimeout(() => {
          setStatus('idle');
          setStatusMessage('');
        }, 3000);
      } catch (err: unknown) {
        console.error('Error auto-saving workout:', err);
        setStatus('saved');
        setStatusMessage('Auto-saved locally');
      }
    },
    [activeDay, user]
  );

  // Fetch the latest workout log and history for active day
  const loadDayData = useCallback(async () => {
    isSwitchingDayRef.current = true;
    const local = getLocalSlots(activeDay);

    if (!isSupabaseConfigured() || !user) {
      setSlotsByDay((prev) => ({
        ...prev,
        [activeDay]: local || createDefaultSlots(activeDay),
      }));
      setHistory([]);
      setTimeout(() => {
        isSwitchingDayRef.current = false;
      }, 100);
      return;
    }

    setLoadingInitialData(true);
    try {
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
        setSlotsByDay((prev) => ({
          ...prev,
          [activeDay]: local || createDefaultSlots(activeDay),
        }));
        return;
      }

      if (logsData && logsData.length > 0) {
        const formattedHistory: WorkoutLogHistoryItem[] = logsData.map((log) => ({
          id: log.id,
          workout_day: log.workout_day,
          workout_date: log.workout_date,
          created_at: log.created_at,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          exercises: (log.workout_exercises as any[]) || [],
        }));
        setHistory(formattedHistory);

        // If local data exists and is newer, prefer local; otherwise use latest cloud log
        if (local) {
          setSlotsByDay((prev) => ({
            ...prev,
            [activeDay]: local,
          }));
        } else {
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

          setSlotsByDay((prev) => ({
            ...prev,
            [activeDay]: mergedSlots,
          }));
          setLocalSlots(activeDay, mergedSlots);
        }
      } else {
        setSlotsByDay((prev) => ({
          ...prev,
          [activeDay]: local || createDefaultSlots(activeDay),
        }));
        setHistory([]);
      }
    } catch (err) {
      console.error('Error in loadDayData:', err);
      setSlotsByDay((prev) => ({
        ...prev,
        [activeDay]: local || createDefaultSlots(activeDay),
      }));
    } finally {
      setLoadingInitialData(false);
      setTimeout(() => {
        isSwitchingDayRef.current = false;
      }, 100);
    }
  }, [activeDay, user]);

  // Load when activeDay or user changes
  useEffect(() => {
    loadDayData();
  }, [loadDayData]);

  // Update a specific slot's field and auto-save
  const updateSlot = (
    index: number,
    field: 'exerciseName' | 'weightKg' | 'reps' | 'rating',
    value: string
  ) => {
    setSlotsByDay((prev) => {
      const currentDaySlots = prev[activeDay] || createDefaultSlots(activeDay);
      const next = [...currentDaySlots];
      if (!next[index]) return prev;

      if (field === 'weightKg') {
        const cleanVal = value.replace(/[^0-9.]/g, '');
        const parts = cleanVal.split('.');
        const safeVal = parts.length > 2 ? `${parts[0]}.${parts.slice(1).join('')}` : cleanVal;
        next[index] = { ...next[index], weightKg: safeVal };

        // Save weight to this exercise's memory cache
        if (next[index].exerciseName) {
          saveExerciseStats(next[index].exerciseName, safeVal, next[index].reps);
        }
      } else if (field === 'reps') {
        const cleanVal = value.replace(/[^0-9]/g, '');
        next[index] = { ...next[index], reps: cleanVal };

        // Save reps to this exercise's memory cache
        if (next[index].exerciseName) {
          saveExerciseStats(next[index].exerciseName, next[index].weightKg, cleanVal);
        }
      } else if (field === 'rating') {
        const cleanRating = parseInt(value, 10) || 0;
        next[index] = {
          ...next[index],
          rating: cleanRating,
          reps: value,
        };

        // Save rating to this exercise's memory cache
        if (next[index].exerciseName) {
          saveExerciseStats(next[index].exerciseName, next[index].weightKg, value);
        }
      } else {
        // Field is 'exerciseName': switching exercise in this box
        const oldExercise = next[index].exerciseName;
        // 1. Remember the outgoing exercise's weight and reps so switching back restores them
        if (oldExercise && (next[index].weightKg || next[index].reps)) {
          saveExerciseStats(oldExercise, next[index].weightKg, next[index].reps);
        }

        // 2. Determine weight and reps for the newly selected exercise
        let newWeight = '';
        let newReps = String(next[index].defaultReps);
        let newRating = 0;

        if (value && value.trim()) {
          const cached = getExerciseStats(value.trim());
          if (cached) {
            newWeight = cached.weightKg || '';
            newReps = cached.reps || String(next[index].defaultReps);
            newRating = parseInt(cached.reps, 10) || 0;
          } else if (history.length > 0) {
            for (const session of history) {
              const prior = session.exercises.find(
                (e) => e.exercise_name?.toLowerCase() === value.trim().toLowerCase()
              );
              if (prior) {
                if (prior.weight_kg !== null && prior.weight_kg !== undefined) {
                  newWeight = String(prior.weight_kg);
                }
                if (prior.reps !== null && prior.reps !== undefined) {
                  newReps = String(prior.reps);
                  newRating = prior.reps;
                }
                break;
              }
            }
          }
        }

        next[index] = {
          ...next[index],
          exerciseName: value,
          weightKg: newWeight,
          reps: newReps,
          rating: newRating,
        };
      }

      // Immediately persist to localStorage
      setLocalSlots(activeDay, next);

      // Trigger debounced cloud auto-save
      if (!isSwitchingDayRef.current) {
        setStatus('saving');
        setStatusMessage('Saving...');

        if (debounceTimerRef.current) {
          clearTimeout(debounceTimerRef.current);
        }
        debounceTimerRef.current = setTimeout(() => {
          saveWorkout(next);
        }, 500);
      }

      return {
        ...prev,
        [activeDay]: next,
      };
    });
  };

  // Clear current input fields (maintained as a helper)
  const clearEntries = () => {
    const blank = createDefaultSlots(activeDay);
    setSlotsByDay((prev) => ({
      ...prev,
      [activeDay]: blank,
    }));
    setLocalSlots(activeDay, blank);
    saveWorkout(blank);
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
    saveWorkout: () => saveWorkout(slots),
    refreshData: loadDayData,
  };
}
