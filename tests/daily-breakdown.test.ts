import { describe, expect, it } from "vitest";
import { getDailyExpenseBreakdown } from "../lib/finance/daily-breakdown";
import type { LocalTransaction } from "../lib/finance/local-transactions";

function transaction(
  id: string,
  tagId: string,
  tagName: string,
  amountFen: number,
  occurredOn = "2026-09-13",
): LocalTransaction {
  return {
    id,
    tagId,
    tagName,
    amountFen,
    occurredOn,
    createdAt: `2026-09-13T08:00:0${id}.000Z`,
    kind: "expense",
    source: "manual",
  };
}

describe("getDailyExpenseBreakdown", () => {
  it("combines multiple entries with the same tag", () => {
    const result = getDailyExpenseBreakdown(
      [transaction("1", "food", "早餐", 800), transaction("2", "food", "早餐", 1_200)],
      "2026-09-13",
    );

    expect(result).toEqual([{ tagId: "food", tagName: "早餐", amountFen: 2_000 }]);
  });

  it("excludes other dates and sorts slices by amount", () => {
    const result = getDailyExpenseBreakdown(
      [
        transaction("1", "laundry", "洗衣服", 600),
        transaction("2", "food", "早餐", 1_500),
        transaction("3", "travel", "交通", 9_000, "2026-09-12"),
      ],
      "2026-09-13",
    );

    expect(result.map((item) => item.tagName)).toEqual(["早餐", "洗衣服"]);
  });

  it("keeps zero-yuan records out of the pie slices", () => {
    const result = getDailyExpenseBreakdown(
      [transaction("1", "food", "早餐", 0), transaction("2", "travel", "交通", 500)],
      "2026-09-13",
    );

    expect(result).toEqual([{ tagId: "travel", tagName: "交通", amountFen: 500 }]);
  });
});
