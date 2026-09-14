import { connection } from "next/server";
import { MonthlySpendingChart } from "@/components/month/monthly-spending-chart";
import { todayInShanghai } from "@/lib/date/today";

export default async function MonthPage() {
  await connection();
  const today = todayInShanghai();

  return (
    <main className="page-stack">
      <header className="page-header">
        <div>
          <p className="eyebrow">{today.slice(0, 7)}</p>
          <h1>本月</h1>
        </div>
      </header>

      <MonthlySpendingChart today={today} />
    </main>
  );
}
