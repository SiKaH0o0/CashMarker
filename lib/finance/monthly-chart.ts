export type MonthlyChartScale = {
  maxFen: number;
  stepFen: number;
};

const BASE_MAX_FEN = 10_000;
const BASE_STEP_FEN = 2_500;

export function getMonthlyChartScale(highestFen: number): MonthlyChartScale {
  if (!Number.isFinite(highestFen) || highestFen <= BASE_MAX_FEN) {
    return { maxFen: BASE_MAX_FEN, stepFen: BASE_STEP_FEN };
  }

  if (highestFen <= 25_000) {
    return { maxFen: Math.ceil(highestFen / 5_000) * 5_000, stepFen: 5_000 };
  }

  if (highestFen <= 50_000) {
    return { maxFen: Math.ceil(highestFen / 10_000) * 10_000, stepFen: 10_000 };
  }

  if (highestFen <= 100_000) {
    return { maxFen: Math.ceil(highestFen / 20_000) * 20_000, stepFen: 20_000 };
  }

  const roughStepFen = highestFen / 4;
  const magnitude = 10 ** Math.floor(Math.log10(roughStepFen));
  const normalizedStep = roughStepFen / magnitude;
  const niceMultiplier = normalizedStep <= 1 ? 1 : normalizedStep <= 2 ? 2 : normalizedStep <= 5 ? 5 : 10;
  const stepFen = niceMultiplier * magnitude;
  const maxFen = Math.ceil(highestFen / stepFen) * stepFen;

  return { maxFen, stepFen };
}
