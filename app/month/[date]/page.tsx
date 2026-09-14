import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { DayTransactionDetails } from "@/components/month/day-transaction-details";

function isValidDateKey(value: string): boolean {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) {
    return false;
  }

  const [, year, month, day] = match;
  const date = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)));
  return date.toISOString().slice(0, 10) === value;
}

export default async function DayDetailsPage({ params }: { params: Promise<{ date: string }> }) {
  const { date } = await params;
  if (!isValidDateKey(date)) {
    notFound();
  }

  const [, month, day] = date.split("-").map(Number);

  return (
    <main className="page-stack">
      <header className="page-header day-page-header">
        <div>
          <Link className="back-link" href="/month">
            <ArrowLeft aria-hidden="true" size={17} />
            返回本月
          </Link>
          <h1>
            {month}月{day}日
          </h1>
        </div>
      </header>

      <DayTransactionDetails date={date} />
    </main>
  );
}
