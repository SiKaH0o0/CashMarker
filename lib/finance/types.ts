export type TransactionKind = "income" | "expense";
export type TransactionSource = "manual" | "fixed_bill" | "import" | "adjustment";
export type BillStatus = "pending" | "confirmed" | "skipped";

export type WidgetId =
  | "current-funds"
  | "budget-remaining"
  | "pending-bills"
  | "monthly-expense"
  | "projected-savings"
  | "top-expenses"
  | "recent-transactions";

export type WidgetPreference = {
  id: WidgetId;
  visible: boolean;
  order: number;
};

export type DashboardCalculationInput = {
  initialFundsFen: number;
  allConfirmedIncomeFen: number;
  allConfirmedExpenseFen: number;
  currentMonthLivingAllowanceFen: number;
  currentMonthConfirmedExpenseFen: number;
  pendingBillsFen: number;
  pendingBillCount: number;
};

export type DashboardSnapshot = {
  currentFundsFen: number;
  budgetRemainingFen: number;
  currentMonthExpenseFen: number;
  pendingBillsFen: number;
  pendingBillCount: number;
};

export type MonthClosingInput = {
  livingAllowanceFen: number;
  otherIncomeFen: number;
  confirmedExpenseFen: number;
  unresolvedBillCount: number;
};

export type MonthClosingResult =
  | { status: "pending"; unresolvedBillCount: number }
  | { status: "finalized"; savingsFen: number };
