import { describe, expect, it } from "vitest";
import { getMonthlyChartScale } from "../lib/finance/monthly-chart";

describe("getMonthlyChartScale", () => {
  it("keeps one hundred yuan as the minimum ceiling", () => {
    expect(getMonthlyChartScale(0)).toEqual({ maxFen: 10_000, stepFen: 2_500 });
    expect(getMonthlyChartScale(9_900)).toEqual({ maxFen: 10_000, stepFen: 2_500 });
  });

  it("raises the ceiling to one hundred and fifty yuan when needed", () => {
    expect(getMonthlyChartScale(11_800)).toEqual({ maxFen: 15_000, stepFen: 5_000 });
  });

  it("continues growing for larger daily totals", () => {
    expect(getMonthlyChartScale(17_600)).toEqual({ maxFen: 20_000, stepFen: 5_000 });
    expect(getMonthlyChartScale(46_000)).toEqual({ maxFen: 50_000, stepFen: 10_000 });
  });
});
