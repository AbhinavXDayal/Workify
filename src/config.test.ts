import { describe, it, expect } from 'vitest';
import { WORKOUT_DAYS_CONFIG, BACK_EXERCISE_OPTIONS } from './constants/workoutConfig';

describe('Workout Configuration & Reps Logic', () => {
  it('verifies exercises are user-defined with no default exercises pre-populated', () => {
    expect(BACK_EXERCISE_OPTIONS).toEqual([]);
    for (const day of Object.values(WORKOUT_DAYS_CONFIG)) {
      for (const group of day.groups) {
        expect(group.options).toEqual([]);
      }
    }
  });

  it('verifies Mon / Thu structure and muscle sizes', () => {
    const monThu = WORKOUT_DAYS_CONFIG.mon_thu;
    expect(monThu.groups).toHaveLength(4);

    const back = monThu.groups.find((g) => g.name === 'Back');
    expect(back?.slotsCount).toBe(3);
    expect(back?.defaultReps).toBe(10); // Big muscle = 10

    const arms = monThu.groups.find((g) => g.name === 'Arms');
    expect(arms?.slotsCount).toBe(2);
    expect(arms?.defaultReps).toBe(12); // Mid muscle = 12

    const shoulders = monThu.groups.find((g) => g.name === 'Shoulders');
    expect(shoulders?.slotsCount).toBe(1);
    expect(shoulders?.defaultReps).toBe(15); // Small muscle = 15

    const cardio = monThu.groups.find((g) => g.name === 'Cardio sports / MMA');
    expect(cardio?.slotsCount).toBe(1);
    expect(cardio?.hideKgReps).toBe(true);
  });

  it('verifies Tue / Fri structure and muscle sizes', () => {
    const tueFri = WORKOUT_DAYS_CONFIG.tue_fri;
    expect(tueFri.groups).toHaveLength(4);

    const legs = tueFri.groups.find((g) => g.name === 'Legs');
    expect(legs?.slotsCount).toBe(3);
    expect(legs?.defaultReps).toBe(10); // Big muscle = 10

    const chest = tueFri.groups.find((g) => g.name === 'Chest');
    expect(chest?.slotsCount).toBe(2);
    expect(chest?.defaultReps).toBe(12); // Mid muscle = 12

    const abs = tueFri.groups.find((g) => g.name === 'Abs');
    expect(abs?.slotsCount).toBe(1);
    expect(abs?.defaultReps).toBe(15); // Small muscle = 15

    const cardio = tueFri.groups.find((g) => g.name === 'Cardio sports / MMA');
    expect(cardio?.slotsCount).toBe(1);
    expect(cardio?.hideKgReps).toBe(true);
  });

  it('verifies Wed structure', () => {
    const wed = WORKOUT_DAYS_CONFIG.wed;
    expect(wed.groups).toHaveLength(4);

    const calisthenics = wed.groups.find((g) => g.name === 'Calisthenics');
    expect(calisthenics?.slotsCount).toBe(3);
    expect(calisthenics?.hideKgReps).toBe(true);

    const selfDefence = wed.groups.find((g) => g.name === 'Self defence w tools');
    expect(selfDefence?.slotsCount).toBe(2);
    expect(selfDefence?.hideKgReps).toBe(true);

    const neck = wed.groups.find((g) => g.name === 'Neck');
    expect(neck?.slotsCount).toBe(2);
    expect(neck?.defaultReps).toBe(15); // Small muscle = 15

    const run = wed.groups.find((g) => g.name === 'Long run');
    expect(run?.slotsCount).toBe(1);
    expect(run?.hideKgReps).toBe(true);
  });
});

