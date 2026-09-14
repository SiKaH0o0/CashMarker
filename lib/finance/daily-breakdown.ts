import type { LocalTransaction } from "@/lib/finance/local-transactions";

export type DailyExpenseBreakdownItem = {
  tagId: string;
  tagName: string;
  amountFen: number;
};

export function getDailyExpenseBreakdown(
  transactions: LocalTransaction[],
  date: string,
): DailyExpenseBreakdownItem[] {
  const totals = new Map<string, DailyExpenseBreakdownItem>();

  for (const transaction of transactions) {
    if (transaction.occurredOn !== date || transaction.kind !== "expense") {
      continue;
    }

    const existing = totals.get(transaction.tagId);
    if (existing) {
      existing.amountFen += transaction.amountFen;
      continue;
    }

    totals.set(transaction.tagId, {
      tagId: transaction.tagId,
      tagName: transaction.tagName,
      amountFen: transaction.amountFen,
    });
  }

  return [...totals.values()]
    .filter((item) => item.amountFen > 0)
    .sort((left, right) => right.amountFen - left.amountFen);
}
