"use client";

import { ReceiptText } from "lucide-react";
import { useLocalTransactions } from "@/components/transactions/use-local-transactions";
import { getDailyExpenseBreakdown } from "@/lib/finance/daily-breakdown";
import { formatFen } from "@/lib/finance/money";

const timeFormatter = new Intl.DateTimeFormat("zh-CN", {
  hour: "2-digit",
  minute: "2-digit",
});

const PIE_COLORS = ["#d94b45", "#e88943", "#e3b341", "#4f8c78", "#6687b8", "#916faa", "#8f7663"];
const PIE_CENTER = 120;
const PIE_RADIUS = 92;

function polarPoint(angle: number) {
  const radians = ((angle - 90) * Math.PI) / 180;

  return {
    x: PIE_CENTER + PIE_RADIUS * Math.cos(radians),
    y: PIE_CENTER + PIE_RADIUS * Math.sin(radians),
  };
}

function slicePath(startAngle: number, endAngle: number) {
  const start = polarPoint(startAngle);
  const end = polarPoint(endAngle);
  const largeArc = endAngle - startAngle > 180 ? 1 : 0;

  return `M ${PIE_CENTER} ${PIE_CENTER} L ${start.x} ${start.y} A ${PIE_RADIUS} ${PIE_RADIUS} 0 ${largeArc} 1 ${end.x} ${end.y} Z`;
}

function formatPercentage(amountFen: number, totalFen: number) {
  const percentage = (amountFen / totalFen) * 100;
  return `${percentage === 100 ? "100" : percentage.toFixed(1)}%`;
}

export function DayTransactionDetails({ date }: { date: string }) {
  const allTransactions = useLocalTransactions();
  const transactions = allTransactions
    .filter((transaction) => transaction.occurredOn === date)
    .sort((left, right) => right.createdAt.localeCompare(left.createdAt));
  const totalFen = transactions.reduce((sum, transaction) => sum + transaction.amountFen, 0);
  const breakdown = getDailyExpenseBreakdown(allTransactions, date);

  if (transactions.length === 0) {
    return (
      <section className="surface empty-state">
        <ReceiptText aria-hidden="true" size={28} />
        <h2>这天没有账单</h2>
        <p>当天没有录入任何支出。</p>
      </section>
    );
  }

  const cumulativeFen = breakdown.reduce<number[]>(
    (totals, item) => [...totals, (totals.at(-1) ?? 0) + item.amountFen],
    [],
  );
  const slices = breakdown.map((item, index) => {
    const startAngle = ((cumulativeFen[index - 1] ?? 0) / totalFen) * 360;
    const endAngle = (cumulativeFen[index] / totalFen) * 360;

    return { ...item, startAngle, endAngle, color: PIE_COLORS[index % PIE_COLORS.length] };
  });

  return (
    <div className="day-details-stack">
      <section className="surface day-details" aria-labelledby="day-details-title">
        <div className="section-heading day-details-heading">
          <div>
            <h2 id="day-details-title">账单明细</h2>
            <p>共 {transactions.length} 笔</p>
          </div>
          <strong>{formatFen(totalFen)}</strong>
        </div>
        <div className="day-transaction-list">
          {transactions.map((transaction) => (
            <div className="day-transaction-row" key={transaction.id}>
              <span className="tag-dot" aria-hidden="true" />
              <div>
                <strong>{transaction.tagName}</strong>
                <time dateTime={transaction.createdAt}>{timeFormatter.format(new Date(transaction.createdAt))}</time>
              </div>
              <span>{formatFen(transaction.amountFen)}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="surface day-pie-section" aria-labelledby="day-pie-title">
        <div className="section-heading">
          <div>
            <h2 id="day-pie-title">支出构成</h2>
            <p>按标签汇总当天开销</p>
          </div>
        </div>
        {slices.length === 0 ? (
          <div className="day-pie-empty">
            <strong>当天支出为 ¥0</strong>
            <span>零元账目已保存，暂无可展示的支出比例。</span>
          </div>
        ) : (
          <div className="day-pie-layout">
            <svg
              className="day-pie-chart"
              viewBox="0 0 240 240"
              role="img"
              aria-label={`当天支出构成，共 ${formatFen(totalFen)}`}
            >
              {slices.length === 1 ? (
                <circle cx={PIE_CENTER} cy={PIE_CENTER} r={PIE_RADIUS} fill={slices[0].color} />
              ) : (
                slices.map((slice) => (
                  <path
                    className="day-pie-slice"
                    d={slicePath(slice.startAngle, slice.endAngle)}
                    fill={slice.color}
                    key={slice.tagId}
                  >
                    <title>{`${slice.tagName}：${formatFen(slice.amountFen)}`}</title>
                  </path>
                ))
              )}
            </svg>

            <div className="day-pie-legend" aria-label="支出构成图例">
              {slices.map((slice) => (
                <div className="day-pie-legend-row" key={slice.tagId}>
                  <span className="day-pie-swatch" style={{ backgroundColor: slice.color }} aria-hidden="true" />
                  <strong>{slice.tagName}</strong>
                  <span>{formatFen(slice.amountFen)}</span>
                  <small>{formatPercentage(slice.amountFen, totalFen)}</small>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
