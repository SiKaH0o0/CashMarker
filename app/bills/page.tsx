import { PendingBillList } from "@/components/bills/pending-bill-list";
import { readBillsMarkdown } from "@/lib/bills/markdown-bills";
import { todayInShanghai } from "@/lib/date/today";
import { connection } from "next/server";

export default async function BillsPage() {
  await connection();
  const source = await readBillsMarkdown();
  const pendingBills = source.bills.filter((bill) => !bill.muted);
  const mutedBills = source.bills.filter((bill) => bill.muted);
  const period = todayInShanghai().slice(0, 7);

  if (source.error) {
    return (
    <main className="page-stack">
      <header className="page-header">
        <div>
          <p className="eyebrow">逐条处理</p>
          <h1>待确认账单</h1>
        </div>
        <span className="count-badge">0 条</span>
      </header>

      <section className="surface">
        <div className="bill-source-error">
          <h2>无法读取基础账单</h2>
          <p>{source.error}</p>
          <code>{source.sourcePath}</code>
        </div>
      </section>
    </main>
    );
  }

  return (
    <PendingBillList initialBills={pendingBills} mutedBills={mutedBills} period={period} />
  );
}
