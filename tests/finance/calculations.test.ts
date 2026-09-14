import { describe, expect, it } from "vitest";
import { calculateDashboardSnapshot, closeMonth } from "../../lib/finance/calculations";

describe("dashboard calculations", () => {
  it("calculates current funds without subtracting pending bills", () => {
    const result = calculateDashboardSnapshot({
      initialFundsFen: 100000,
      allConfirmedIncomeFen: 200000,
      allConfirmedExpenseFen: 190000,
      currentMonthLivingAllowanceFen: 200000,
      currentMonthConfirmedExpenseFen: 190000,
      pendingBillsFen: 25200,
      pendingBillCount: 2,
    });

    expect(result.currentFundsFen).toBe(110000);
    expect(result.budgetRemainingFen).toBe(10000);
    expect(result.pendingBillsFen).toBe(25200);
  });
});

describe("month closing", () => {
  it("does not finalize while a fixed bill is unresolved", () => {
    expect(closeMonth({
      livingAllowanceFen: 200000,
      otherIncomeFen: 20000,
      confirmedExpenseFen: 210000,
      unresolvedBillCount: 1,
    })).toEqual({ status: "pending", unresolvedBillCount: 1 });
  });

  it("returns exact savings after all bills are resolved", () => {
    expect(closeMonth({
      livingAllowanceFen: 200000,
      otherIncomeFen: 20000,
      confirmedExpenseFen: 210000,
      unresolvedBillCount: 0,
    })).toEqual({ status: "finalized", savingsFen: 10000 });
  });
});
