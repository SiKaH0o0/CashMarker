import type {
  DashboardCalculationInput,
  DashboardSnapshot,
  MonthClosingInput,
  MonthClosingResult,
} from "./types";

export function calculateDashboardSnapshot(input: DashboardCalculationInput): DashboardSnapshot {
  return {
    currentFundsFen: input.initialFundsFen + input.allConfirmedIncomeFen - input.allConfirmedExpenseFen,
    budgetRemainingFen: input.currentMonthLivingAllowanceFen - input.currentMonthConfirmedExpenseFen,
    currentMonthExpenseFen: input.currentMonthConfirmedExpenseFen,
    pendingBillsFen: input.pendingBillsFen,
    pendingBillCount: input.pendingBillCount,
  };
}

export function closeMonth(input: MonthClosingInput): MonthClosingResult {
  if (input.unresolvedBillCount > 0) {
    return { status: "pending", unresolvedBillCount: input.unresolvedBillCount };
  }

  return {
    status: "finalized",
    savingsFen: input.livingAllowanceFen + input.otherIncomeFen - input.confirmedExpenseFen,
  };
}
