import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import App from "./App";
import {
  BACK_EXERCISE_OPTIONS,
  SPLIT_HEADER_TEXT,
} from "./constants/workoutConfig";
import { saveCustomExercise } from "./utils/customExercises";

describe("Workout Logger Acceptance Tests", () => {
  it("renders top Split section with exactly one heading and exact text", () => {
    render(<App />);

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
    render(<App />);

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
    render(<App />);

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
    render(<App />);

    const kgInputs = screen.getAllByLabelText(/weight/i);
    fireEvent.change(kgInputs[0], { target: { value: "75" } });
    expect((kgInputs[0] as HTMLInputElement).value).toBe("75");
  });

  it("does not leak weight from one exercise to another when switching exercise in the same slot", () => {
    saveCustomExercise("Bicep curls", "Back");
    saveCustomExercise("Triceps", "Back");

    render(<App />);

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

  it("applies correct default reps for muscle groups and hides kg/reps for cardio and other activities", () => {
    render(<App />);

    // Mon / Thu: 3 Back (10), 2 Arms (12), 1 Shoulders (15), 1 Cardio (no kg/reps)
    // Total comboboxes: 7. Total weight & reps inputs: 6 (Cardio does not have them)
    const comboboxes = screen.getAllByRole("combobox");
    expect(comboboxes).toHaveLength(7);

    const kgInputs = screen.getAllByLabelText(/weight/i);
    const repsInputs = screen.getAllByLabelText(/reps/i);
    expect(kgInputs).toHaveLength(6);
    expect(repsInputs).toHaveLength(6);

    // Back (slots 0, 1, 2) has 10 reps
    expect((repsInputs[0] as HTMLInputElement).value).toBe("10");
    expect((repsInputs[1] as HTMLInputElement).value).toBe("10");
    expect((repsInputs[2] as HTMLInputElement).value).toBe("10");

    // Arms (slots 3, 4) has 12 reps
    expect((repsInputs[3] as HTMLInputElement).value).toBe("12");
    expect((repsInputs[4] as HTMLInputElement).value).toBe("12");

    // Shoulders (slot 5) has 15 reps
    expect((repsInputs[5] as HTMLInputElement).value).toBe("15");

    // Switch to Wed: 3 Calisthenics (no kg/reps), 2 Self defence (no kg/reps), 2 Neck (15 reps), 1 Long run (no kg/reps)
    fireEvent.click(screen.getByRole("button", { name: /wed/i }));

    const wedComboboxes = screen.getAllByRole("combobox");
    expect(wedComboboxes).toHaveLength(8);

    // Only the 2 Neck slots have kg and reps!
    const wedKgInputs = screen.getAllByLabelText(/weight/i);
    const wedRepsInputs = screen.getAllByLabelText(/reps/i);
    expect(wedKgInputs).toHaveLength(2);
    expect(wedRepsInputs).toHaveLength(2);

    // Neck default reps is 15
    expect((wedRepsInputs[0] as HTMLInputElement).value).toBe("15");
    expect((wedRepsInputs[1] as HTMLInputElement).value).toBe("15");
  });
});
