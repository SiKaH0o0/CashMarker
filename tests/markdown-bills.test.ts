import { describe, expect, it } from "vitest";
import { parseFirstBillsTable } from "../lib/bills/markdown-bills";

const markdown = `
| 名称 | 描述 | 费用 |
| --- | --- | --- |
| 中国移动 | 套餐 | 9元/月 |
| 快柠檬 | 节点 | 258元/年（22元/月） |
| （可选）Todolist | | 7$/月（约50元/月） |
| （已省）音乐 | | 15元/月 |
| 总共 | | 96元/月 |

| 名称 | 费用 |
| --- | --- |
| 饭费 | 40元/日 |
`;

describe("parseFirstBillsTable", () => {
  it("reads only names and fees from the first table", () => {
    expect(parseFirstBillsTable(markdown).map(({ name, fee }) => ({ name, fee }))).toEqual([
      { name: "中国移动", fee: "9元/月" },
      { name: "快柠檬", fee: "258元/年（22元/月）" },
      { name: "（可选）Todolist", fee: "7$/月（约50元/月）" },
      { name: "（已省）音乐", fee: "15元/月" },
    ]);
  });

  it("marks leading parenthesized entries as muted", () => {
    const bills = parseFirstBillsTable(markdown);
    expect(bills.filter((bill) => bill.muted).map((bill) => bill.name)).toEqual([
      "（可选）Todolist",
      "（已省）音乐",
    ]);
  });

  it("rejects a first table without the required columns", () => {
    expect(() => parseFirstBillsTable("| 项目 | 金额 |\n| --- | --- |\n| A | 1 |"))
      .toThrow("第一个表格缺少“名称”或“费用”栏目。");
  });
});
