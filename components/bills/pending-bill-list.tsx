"use client";

import { Check, SkipForward } from "lucide-react";
import { useLocalBillStatuses } from "@/components/bills/use-local-bill-statuses";
import { setLocalBillStatus } from "@/lib/finance/local-bill-statuses";

type PendingBill = {
  id: string;
  name: string;
  fee: string;
};

export function PendingBillList({
  initialBills,
  mutedBills,
  period,
}: {
  initialBills: PendingBill[];
  mutedBills: PendingBill[];
  period: string;
}) {
  const statuses = useLocalBillStatuses();
  const bills = initialBills.filter((bill) => !statuses[`${period}:${bill.id}`]);
  const confirmedBills = initialBills.filter((bill) => statuses[`${period}:${bill.id}`] === "confirmed");

  function resolve(id: string, action: "confirmed" | "skipped") {
    setLocalBillStatus(period, id, action);
  }

  return (
    <main className="page-stack">
      <header className="page-header">
        <div>
          <p className="eyebrow">逐条处理</p>
          <h1>待确认账单</h1>
        </div>
        <span className="count-badge">{bills.length} 条</span>
      </header>

      <section className="surface bills-primary-surface">
        {bills.length === 0 ? (
          <div className="empty-state">
            <Check aria-hidden="true" size={28} />
            <h2>本月待确认账单已处理完</h2>
            <p>月份结束后可以生成确切月报。</p>
          </div>
        ) : (
          <div className="bill-list">
            {bills.map((bill) => (
              <article className="bill-row" key={bill.id}>
                <div>
                  <strong>{bill.name}</strong>
                </div>
                <span className="bill-amount">{bill.fee}</span>
                <div className="bill-actions">
                  <button className="secondary-button" type="button" onClick={() => resolve(bill.id, "skipped")}>
                    <SkipForward aria-hidden="true" size={16} />跳过
                  </button>
                  <button className="primary-button" type="button" onClick={() => resolve(bill.id, "confirmed")}>
                    <Check aria-hidden="true" size={16} />确认
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}

        {confirmedBills.length > 0 ? (
          <div className="confirmed-bill-list" aria-label="已确认的账单">
            {confirmedBills.map((bill) => (
              <article className="bill-row bill-row-muted bill-row-confirmed" key={bill.id}>
                <div>
                  <strong>{bill.name}</strong>
                </div>
                <span className="bill-amount">{bill.fee}</span>
                <span className="status-confirmed"><Check aria-hidden="true" size={21} strokeWidth={2.2} />已确认</span>
              </article>
            ))}
          </div>
        ) : null}
      </section>

      {mutedBills.length > 0 ? (
        <section className="surface bracketed-bill-surface" aria-label="无需确认的账单">
          <div className="muted-bill-list">
            {mutedBills.map((bill) => (
              <article className="bill-row bill-row-muted" key={bill.id}>
                <div>
                  <strong>{bill.name}</strong>
                </div>
                <span className="bill-amount">{bill.fee}</span>
              </article>
            ))}
          </div>
        </section>
      ) : null}
    </main>
  );
}
