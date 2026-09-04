import { describe, it, expect } from "vitest";
import { calculateWorkoutAnalytics } from "./utils/workoutAnalytics";
import type { ExerciseSlotState, WorkoutLogHistoryItem } from "./types/workout";

describe("Workout Analytics & Spider Web Calculation", () => {
  it("calculates default 8-axis radar data with baseline suggestions when history is empty", () => {
    const slots: ExerciseSlotState[] = [];
    const history: WorkoutLogHistoryItem[] = [];

    const analytics = calculateWorkoutAnalytics(slots, history);

    expect(analytics.axes).toHaveLength(8);
    expect(analytics.axes.map((a) => a.name)).toEqual([
      "Back",
      "Chest",
      "Legs",
      "Shoulders",
      "Arms",
      "Core & Abs",
      "Calisthenics",
      "Cardio & MMA",
    ]);

    // Progressive overload recommendation should provide a valid message
    expect(analytics.recommendations.progressiveOverload).toBeDefined();
    expect(analytics.recommendations.progressiveOverload.title).toBeDefined();
    expect(analytics.recommendations.progressiveOverload.actionableStep).toBeDefined();

    // Overdue focus should be present
    expect(analytics.recommendations.overdueArea).toBeDefined();
    expect(analytics.recommendations.overdueArea.title).toBeDefined();

    // Lagging area should identify an area with low activity
    expect(analytics.recommendations.laggingArea).toBeDefined();
    expect(analytics.recommendations.laggingArea.targetArea).toBeDefined();
  });

  it("increases dimension score when exercises with weight and reps are present", () => {
    const activeSlots: ExerciseSlotState[] = [
      {
        slotNumber: 0,
        muscleGroup: "Back",
        exerciseName: "Pull Ups",
        defaultReps: 10,
        weightKg: "20",
        reps: "10",
      },
      {
        slotNumber: 1,
        muscleGroup: "Arms",
        exerciseName: "Barbell Curls",
        defaultReps: 12,
        weightKg: "15",
        reps: "12",
      },
    ];

    const analytics = calculateWorkoutAnalytics(activeSlots, []);
    const backAxis = analytics.axes.find((a) => a.name === "Back");
    const armsAxis = analytics.axes.find((a) => a.name === "Arms");
    const chestAxis = analytics.axes.find((a) => a.name === "Chest");

    expect(backAxis).toBeDefined();
    expect(armsAxis).toBeDefined();
    expect(chestAxis).toBeDefined();

    // Back and Arms should have higher score than untrained Chest
    expect(backAxis!.score).toBeGreaterThan(chestAxis!.score);
    expect(armsAxis!.score).toBeGreaterThan(chestAxis!.score);
  });

  it("detects stagnant lift and recommends progressive overload bump", () => {
    const history: WorkoutLogHistoryItem[] = [
      {
        id: "log-1",
        workout_day: "mon_thu",
        workout_date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(),
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(),
        exercises: [
          {
            id: "rec-1",
            workout_log_id: "log-1",
            muscle_group: "Back",
            slot_number: 0,
            exercise_name: "Lat Pulldown",
            weight_kg: 50,
            reps: 10,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ],
      },
      {
        id: "log-2",
        workout_day: "mon_thu",
        workout_date: new Date().toISOString(),
        created_at: new Date().toISOString(),
        exercises: [
          {
            id: "rec-2",
            workout_log_id: "log-2",
            muscle_group: "Back",
            slot_number: 0,
            exercise_name: "Lat Pulldown",
            weight_kg: 50,
            reps: 10,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ],
      },
    ];

    const slots: ExerciseSlotState[] = [
      {
        slotNumber: 0,
        muscleGroup: "Back",
        exerciseName: "Lat Pulldown",
        defaultReps: 10,
        weightKg: "50",
        reps: "10",
      },
    ];

    const analytics = calculateWorkoutAnalytics(slots, history);

    expect(analytics.recommendations.progressiveOverload.targetArea).toBe("Back");
    expect(analytics.recommendations.progressiveOverload.message).toContain("50 kg");
    // Should suggest a bump e.g. 52.5 kg or +1 rep
    expect(analytics.recommendations.progressiveOverload.actionableStep).toMatch(/52\.5|\+2\.5|\+1/);
  });

  it("highlights overdue area when a muscle group has not been trained recently", () => {
    const history: WorkoutLogHistoryItem[] = [
      {
        id: "log-legs",
        workout_day: "tue_fri",
        workout_date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 14).toISOString(), // 14 days ago
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 14).toISOString(),
        exercises: [
          {
            id: "rec-legs",
            workout_log_id: "log-legs",
            muscle_group: "Legs",
            slot_number: 0,
            exercise_name: "Squats",
            weight_kg: 80,
            reps: 8,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ],
      },
      {
        id: "log-chest",
        workout_day: "tue_fri",
        workout_date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1).toISOString(), // 1 day ago
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1).toISOString(),
        exercises: [
          {
            id: "rec-chest",
            workout_log_id: "log-chest",
            muscle_group: "Chest",
            slot_number: 0,
            exercise_name: "Bench Press",
            weight_kg: 70,
            reps: 8,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ],
      },
    ];

    const analytics = calculateWorkoutAnalytics([], history);
    expect(analytics.recommendations.overdueArea.targetArea).toBe("Legs");
    expect(analytics.recommendations.overdueArea.actionableStep).toContain("Legs");
  });
});

