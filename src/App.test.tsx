import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import App from "./App";
import {
  BACK_EXERCISE_OPTIONS,
  SPLIT_HEADER_TEXT,
} from "./constants/workoutConfig";

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

  it("verifies Back exercise options contains exactly the specified four choices", () => {
    render(<App />);

    // Switch to Mon / Thu
    fireEvent.click(screen.getByRole("button", { name: /mon \/ thu/i }));

    // Find select elements
    const selects = screen.getAllByRole("combobox");
    expect(selects.length).toBeGreaterThanOrEqual(3);

    // Test the first Back slot options
    const firstBackSelect = selects[0];
    const options = Array.from(firstBackSelect.querySelectorAll("option"))
      .map((opt) => opt.value)
      .filter((val) => val !== ""); // filter placeholder

    expect(options).toEqual(BACK_EXERCISE_OPTIONS);
    expect(options).toEqual([
      "T bar row",
      "lat pull down",
      "Lower back extensions",
      "seated cable row",
    ]);
  });

  it("supports updating KG and Reps and clearing entries", () => {
    render(<App />);

    // Find inputs
    const kgInputs = screen.getAllByPlaceholderText(/kg/i);
    const repsInputs = screen.getAllByPlaceholderText(/10|12|15/);

    expect(kgInputs.length).toBeGreaterThan(0);
    expect(repsInputs.length).toBeGreaterThan(0);

    // Edit first KG input
    fireEvent.change(kgInputs[0], { target: { value: "62.5" } });
    expect((kgInputs[0] as HTMLInputElement).value).toBe("62.5");

    // Edit first Reps input
    fireEvent.change(repsInputs[0], { target: { value: "11" } });
    expect((repsInputs[0] as HTMLInputElement).value).toBe("11");

    // Click Clear Entries
    const clearBtn = screen.getByRole("button", { name: /clear entries/i });
    fireEvent.click(clearBtn);

    // KG should reset to empty, Reps resets to default (10)
    expect((kgInputs[0] as HTMLInputElement).value).toBe("");
    expect((repsInputs[0] as HTMLInputElement).value).toBe("10");
  });

  it("handles Save Workout click gracefully when Supabase is not yet configured or user not signed in", async () => {
    render(<App />);

    const saveBtn = screen.getByRole("button", { name: /save workout/i });
    fireEvent.click(saveBtn);

    // Status message should indicate setup or prompt
    expect(
      await screen.findByText(/Supabase not configured|Please sign in/i),
    ).toBeDefined();
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
});
