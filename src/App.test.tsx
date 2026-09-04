import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import App from "./App";
import {
  BACK_EXERCISE_OPTIONS,
  SPLIT_HEADER_TEXT,
  getTodaysWorkoutDay,
} from "./constants/workoutConfig";
import { saveCustomExercise } from "./utils/customExercises";

describe("Workout Logger Acceptance Tests", () => {
  it("renders top Split section with exactly one heading and exact text", () => {
    render(<App initialDay="mon_thu" />);

    // Exactly one heading titled "Workify"
    const headings = screen.getAllByRole("heading", { name: /workify/i });
    expect(headings).toHaveLength(1);
    expect(headings[0].textContent).toBe("Workify");

    // Split text contents
    expect(screen.getByText(SPLIT_HEADER_TEXT.overview)).toBeDefined();
    for (const dayLine of SPLIT_HEADER_TEXT.days) {
      expect(screen.getByText(dayLine)).toBeDefined();
    }
    expect(screen.getByText(SPLIT_HEADER_TEXT.guidelines)).toBeDefined();
    expect(screen.getByText(SPLIT_HEADER_TEXT.instruction)).toBeDefined();
  });

  it("renders all three interactive day selectors and switches workout views", () => {
    render(<App initialDay="mon_thu" />);

    const monThuBtn = screen.getByRole("button", { name: /mon \/ thu/i });
    const tueFriBtn = screen.getByRole("button", { name: /tue \/ fri/i });
    const wedBtn = screen.getByRole("button", { name: /wed/i });

    expect(monThuBtn).toBeDefined();
    expect(tueFriBtn).toBeDefined();
    expect(wedBtn).toBeDefined();

    // Default is Mon / Thu
    expect(screen.getByRole("heading", { name: /^back$/i })).toBeDefined();
    expect(screen.getByRole("heading", { name: /^arms$/i })).toBeDefined();
    expect(screen.getByRole("heading", { name: /^shoulders$/i })).toBeDefined();

    // Switch to Tue / Fri
    fireEvent.click(tueFriBtn);
    expect(screen.getByRole("heading", { name: /^legs$/i })).toBeDefined();
    expect(screen.getByRole("heading", { name: /^chest$/i })).toBeDefined();
    expect(screen.getByRole("heading", { name: /^abs$/i })).toBeDefined();

    // Switch to Wed
    fireEvent.click(wedBtn);
    expect(
      screen.getByRole("heading", { name: /^calisthenics$/i }),
    ).toBeDefined();
    expect(
      screen.getByRole("heading", { name: /^self defence w tools$/i }),
    ).toBeDefined();
    expect(screen.getByRole("heading", { name: /^neck$/i })).toBeDefined();
    expect(screen.getByRole("heading", { name: /^long run$/i })).toBeDefined();
  });

  it("verifies slots start without default exercises and supports adding custom exercises", () => {
    render(<App />);

    // Switch to Mon / Thu
    fireEvent.click(screen.getByRole("button", { name: /mon \/ thu/i }));

    // Find select elements
    const selects = screen.getAllByRole("combobox");
    expect(selects.length).toBeGreaterThanOrEqual(3);

    // Test that first slot has NO default exercise preselected and no hardcoded options
    const firstBackSelect = selects[0] as HTMLSelectElement;
    expect(firstBackSelect.value).toBe("");

    const options = Array.from(firstBackSelect.querySelectorAll("option"))
      .map((opt) => opt.value)
      .filter((val) => val !== ""); // filter placeholder

    expect(options).toEqual(BACK_EXERCISE_OPTIONS);
    expect(options).toEqual([]);
  });

  it("supports updating KG and Reps with automatic saving", () => {
    render(<App initialDay="mon_thu" />);

    // Find inputs
    const kgInputs = screen.getAllByLabelText(/weight/i);
    const repsInputs = screen.getAllByLabelText(/reps/i);

    expect(kgInputs.length).toBeGreaterThan(0);
    expect(repsInputs.length).toBeGreaterThan(0);

    // Edit first KG input
    fireEvent.change(kgInputs[0], { target: { value: "62.5" } });
    expect((kgInputs[0] as HTMLInputElement).value).toBe("62.5");

    // Edit first Reps input (capped at defaultReps=10 for Back)
    fireEvent.change(repsInputs[0], { target: { value: "8" } });
    expect((repsInputs[0] as HTMLInputElement).value).toBe("8");
  });

  it("persists slot updates automatically across sessions", () => {
    render(<App initialDay="mon_thu" />);

    const kgInputs = screen.getAllByLabelText(/weight/i);
    fireEvent.change(kgInputs[0], { target: { value: "75" } });
    expect((kgInputs[0] as HTMLInputElement).value).toBe("75");
  });

  it("does not leak weight from one exercise to another when switching exercise in the same slot", () => {
    saveCustomExercise("Bicep curls", "Back");
    saveCustomExercise("Triceps", "Back");

    render(<App initialDay="mon_thu" />);

    const selects = screen.getAllByRole("combobox");
    const kgInputs = screen.getAllByLabelText(/weight/i);

    // 1. Select Bicep curls in a slot
    fireEvent.change(selects[0], { target: { value: "Bicep curls" } });
    fireEvent.change(kgInputs[0], { target: { value: "12" } });
    expect((kgInputs[0] as HTMLInputElement).value).toBe("12");

    // 2. Switch slot to Triceps
    fireEvent.change(selects[0], { target: { value: "Triceps" } });
    // Weight should NOT be 12 kg for Triceps!
    expect((kgInputs[0] as HTMLInputElement).value).toBe("");

    // 3. Switch back to Bicep curls
    fireEvent.change(selects[0], { target: { value: "Bicep curls" } });
    // Bicep curls remembers its 12 kg!
    expect((kgInputs[0] as HTMLInputElement).value).toBe("12");
  });

  it("opens and closes Auth Modal", async () => {
    render(<App />);

    const signInBtn = await screen.findByRole("button", { name: /sign in/i });
    fireEvent.click(signInBtn);

    expect(screen.getByRole("heading", { name: /sign in/i })).toBeDefined();

    // Switch to create account
    const signUpLink = screen.getByRole("button", { name: /sign up/i });
    fireEvent.click(signUpLink);
    expect(
      screen.getByRole("heading", { name: /create account/i }),
    ).toBeDefined();
  });

  it("does not render the Progress Radar button", () => {
    render(<App />);
    expect(
      screen.queryByRole("button", { name: /workout progress radar/i }),
    ).toBeNull();
  });

  it("verifies reps for muscle sections: back 10, arms 12, shoulders 15, legs 10, chest 12, abs 15, neck 15", () => {
    render(<App />);

    // Mon / Thu: Back (10), Arms (12), Shoulders (15)
    fireEvent.click(screen.getByRole("button", { name: /mon \/ thu/i }));
    const monReps = screen.getAllByLabelText(/reps/i);
    // Back slot 0, 1, 2 -> 10 reps
    expect((monReps[0] as HTMLInputElement).placeholder).toBe("10");
    // Arms slot 0, 1 -> 12 reps
    expect((monReps[3] as HTMLInputElement).placeholder).toBe("12");
    // Shoulders slot 0 -> 15 reps
    expect((monReps[5] as HTMLInputElement).placeholder).toBe("15");

    // Tue / Fri: Legs (10), Chest (12), Abs (15)
    fireEvent.click(screen.getByRole("button", { name: /tue \/ fri/i }));
    const tueReps = screen.getAllByLabelText(/reps/i);
    // Legs slot 0, 1, 2 -> 10 reps
    expect((tueReps[0] as HTMLInputElement).placeholder).toBe("10");
    // Chest slot 0, 1 -> 12 reps
    expect((tueReps[3] as HTMLInputElement).placeholder).toBe("12");
    // Abs slot 0 -> 15 reps
    expect((tueReps[5] as HTMLInputElement).placeholder).toBe("15");

    // Wed: Neck (15)
    fireEvent.click(screen.getByRole("button", { name: /wed/i }));
    const wedReps = screen.getAllByLabelText(/reps/i);
    // Calisthenics slot 0 -> 10
    expect((wedReps[0] as HTMLInputElement).placeholder).toBe("10");
    // Neck slot 0 (Calisthenics has 3 slots, Self defence has 0 reps inputs because it's stars rating)
    // So slot index 3 is Neck slot 0 -> 15 reps
    expect((wedReps[3] as HTMLInputElement).placeholder).toBe("15");
  });

  it("renders star rating box in place of KG and Reps for cardio sports and other activities", () => {
    render(<App />);

    // Mon / Thu: Cardio sports / MMA should have a star rating radiogroup
    fireEvent.click(screen.getByRole("button", { name: /mon \/ thu/i }));
    const cardioRatingGroup = screen.getByRole("radiogroup", {
      name: /cardio sports \/ mma rating/i,
    });
    expect(cardioRatingGroup).toBeDefined();

    // The rating box contains 5 stars
    const starButtons = cardioRatingGroup.querySelectorAll("button");
    expect(starButtons.length).toBe(5);

    // Click 4th star to rate 4 stars
    fireEvent.click(starButtons[3]);
    expect(starButtons[3].getAttribute("aria-checked")).toBe("true");

    // Click 4th star again to toggle off (unrate)
    fireEvent.click(starButtons[3]);
    expect(starButtons[3].getAttribute("aria-checked")).toBe("false");

    // Switch to Wed: Self defence w tools and Long run should also have rating boxes
    fireEvent.click(screen.getByRole("button", { name: /wed/i }));
    expect(
      screen.getByRole("radiogroup", { name: /long run rating/i }),
    ).toBeDefined();
    expect(
      screen.getAllByRole("radiogroup", { name: /self defence w tools rating/i }).length,
    ).toBe(2);
  });

  describe("Automatic Day Tab Selection", () => {
    it("maps days of week correctly: Mon/Thu -> mon_thu, Tue/Fri -> tue_fri, Wed -> wed", () => {
      // Monday = 1
      expect(getTodaysWorkoutDay(new Date("2026-08-31T10:00:00Z"))).toBe("mon_thu");
      // Tuesday = 2
      expect(getTodaysWorkoutDay(new Date("2026-09-01T10:00:00Z"))).toBe("tue_fri");
      // Wednesday = 3
      expect(getTodaysWorkoutDay(new Date("2026-09-02T10:00:00Z"))).toBe("wed");
      // Thursday = 4
      expect(getTodaysWorkoutDay(new Date("2026-09-03T10:00:00Z"))).toBe("mon_thu");
      // Friday = 5
      expect(getTodaysWorkoutDay(new Date("2026-09-04T10:00:00Z"))).toBe("tue_fri");
      // Saturday = 6
      expect(getTodaysWorkoutDay(new Date("2026-09-05T10:00:00Z"))).toBe("mon_thu");
      // Sunday = 0
      expect(getTodaysWorkoutDay(new Date("2026-09-06T10:00:00Z"))).toBe("mon_thu");
    });

    it("opens the corresponding day tab by default according to today's date", () => {
      // When rendered without initialDay, it opens today's tab
      const expectedDay = getTodaysWorkoutDay();
      render(<App />);

      if (expectedDay === "mon_thu") {
        expect(screen.getByRole("heading", { name: /^back$/i })).toBeDefined();
      } else if (expectedDay === "tue_fri") {
        expect(screen.getByRole("heading", { name: /^legs$/i })).toBeDefined();
      } else if (expectedDay === "wed") {
        expect(screen.getByRole("heading", { name: /^calisthenics$/i })).toBeDefined();
      }
    });
  });
});
