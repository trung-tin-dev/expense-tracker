import { describe, expect, it } from "vitest";
import {
  calculateBudgetSummary,
  calculateCategoryUsage,
  sumCategoryBudgets,
} from "./budget";

describe("calculateBudgetSummary", () => {
  it("computes spent, remaining, and percent used", () => {
    const result = calculateBudgetSummary(1_000_000, {
      food: 300_000,
      rent: 200_000,
    });

    expect(result.totalSpent).toBe(500_000);
    expect(result.remaining).toBe(500_000);
    expect(result.percentUsed).toBe(50);
  });

  it("returns zero percent when budget is zero", () => {
    const result = calculateBudgetSummary(0, { food: 100_000 });

    expect(result.percentUsed).toBe(0);
    expect(result.remaining).toBe(-100_000);
  });
});

describe("calculateCategoryUsage", () => {
  it("flags categories over budget", () => {
    expect(calculateCategoryUsage(120_000, 100_000)).toEqual({
      percent: 120,
      isOver: true,
    });
  });

  it("handles zero budget without dividing by zero", () => {
    expect(calculateCategoryUsage(50_000, 0)).toEqual({
      percent: 0,
      isOver: false,
    });
  });
});

describe("sumCategoryBudgets", () => {
  it("sums numeric and string budget values", () => {
    const total = sumCategoryBudgets([
      { budget: 500_000 },
      { budget: "300000" },
      { budget: "" },
    ]);

    expect(total).toBe(800_000);
  });
});
