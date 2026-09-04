import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  getCustomExercises,
  saveCustomExercise,
  removeCustomExercise,
  subscribeToCustomExercises,
  getExerciseStats,
  saveExerciseStats,
} from './utils/customExercises';

describe('Custom Exercises Synchronization & Persistence', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('initializes with empty lists when storage is empty', () => {
    const res = getCustomExercises('Back');
    expect(res.groupExercises).toEqual([]);
    expect(res.allExercises).toEqual([]);
    expect(res.combined).toEqual([]);
  });

  it('saves custom exercise for a group and isolates it so other groups do not see it in combined', () => {
    saveCustomExercise('Deadlift', 'Back');

    const backRes = getCustomExercises('Back');
    expect(backRes.groupExercises).toContain('Deadlift');
    expect(backRes.allExercises).toContain('Deadlift');
    expect(backRes.combined).toContain('Deadlift');

    // Not visible in another group's combined options
    const armsRes = getCustomExercises('Arms');
    expect(armsRes.groupExercises).not.toContain('Deadlift');
    expect(armsRes.allExercises).toContain('Deadlift');
    expect(armsRes.combined).not.toContain('Deadlift');
  });

  it('supports saving multiple exercises across groups with strict section isolation', () => {
    saveCustomExercise('Lat pull down', 'Back');
    saveCustomExercise('T bar row', 'Back');
    saveCustomExercise('Bicep curl', 'Arms');

    const backRes = getCustomExercises('Back');
    expect(backRes.groupExercises).toEqual(['Lat pull down', 'T bar row']);
    expect(backRes.combined).toEqual(['Lat pull down', 'T bar row']);
    expect(backRes.combined).not.toContain('Bicep curl');
    expect(backRes.allExercises).toContain('Lat pull down');
    expect(backRes.allExercises).toContain('T bar row');
    expect(backRes.allExercises).toContain('Bicep curl');

    const armsRes = getCustomExercises('Arms');
    expect(armsRes.groupExercises).toEqual(['Bicep curl']);
    expect(armsRes.combined).toEqual(['Bicep curl']);
    expect(armsRes.combined).not.toContain('Lat pull down');
    expect(armsRes.combined).not.toContain('T bar row');
  });

  it('notifies subscribers via window event when an exercise is added or removed', () => {
    const callback = vi.fn();
    const unsubscribe = subscribeToCustomExercises(callback);

    saveCustomExercise('Bench press', 'Chest');
    expect(callback).toHaveBeenCalled();

    callback.mockClear();
    removeCustomExercise('Bench press', 'Chest');
    expect(callback).toHaveBeenCalled();

    unsubscribe();
  });

  it('preserves existing exercises in group options when adding another exercise to the same group', () => {
    // 1. Add first exercise
    saveCustomExercise('Pull up', 'Back');
    let backRes = getCustomExercises('Back');
    expect(backRes.combined).toEqual(['Pull up']);

    // 2. Add second exercise in the same group/box
    saveCustomExercise('Barbell row', 'Back');
    backRes = getCustomExercises('Back');
    expect(backRes.combined).toContain('Pull up');
    expect(backRes.combined).toContain('Barbell row');
    expect(backRes.groupExercises).toEqual(['Pull up', 'Barbell row']);
  });

  it('maintains exercise-specific weight and reps memory and isolates between exercises', () => {
    saveExerciseStats('Bicep curls', '12', '10');
    expect(getExerciseStats('Bicep curls')).toEqual({ weightKg: '12', reps: '10' });

    // Different exercise does not have bicep curls' weight
    expect(getExerciseStats('Tricep')).toBeNull();

    // Saving stats for tricep keeps bicep curls intact
    saveExerciseStats('Tricep', '25', '12');
    expect(getExerciseStats('Tricep')).toEqual({ weightKg: '25', reps: '12' });
    expect(getExerciseStats('Bicep curls')).toEqual({ weightKg: '12', reps: '10' });
  });
});

