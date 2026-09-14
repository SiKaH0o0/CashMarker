import { QuickEntryList } from "@/components/transactions/quick-entry-list";
import { todayInShanghai } from "@/lib/date/today";
import { connection } from "next/server";

const manualTags = [
  { id: "breakfast", name: "早餐" },
  { id: "lunch", name: "午饭" },
  { id: "dinner", name: "晚饭" },
  { id: "snack", name: "零食" },
  { id: "laundry", name: "洗衣" },
];

export default async function TodayPage() {
  await connection();
  const today = todayInShanghai();

  return (
    <main className="page-stack">
      <header className="page-header">
        <div>
          <p className="eyebrow">{today}</p>
          <h1>今日</h1>
        </div>
      </header>

      <section className="surface quick-entry-surface" aria-labelledby="quick-entry-title">
        <div className="section-heading">
          <div>
            <h2 id="quick-entry-title">快速记账</h2>
          </div>
        </div>
        <QuickEntryList date={today} tags={manualTags} />
      </section>
    </main>
  );
}
