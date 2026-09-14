"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useLocalTransactions } from "@/components/transactions/use-local-transactions";
import { getMonthlyChartScale } from "@/lib/finance/monthly-chart";
import { formatFen } from "@/lib/finance/money";

type DailyTotal = {
  date: string;
  day: number;
  amountFen: number;
};

const CHART_HEIGHT = 510;
const PLOT_TOP = 30;
const PLOT_BOTTOM = 452;
const PLOT_LEFT = 64;
const PLOT_RIGHT = 28;
const TOOLTIP_WIDTH = 112;
const TOOLTIP_HEIGHT = 34;

export function MonthlySpendingChart({ today }: { today: string }) {
  const router = useRouter();
  const [hoveredDate, setHoveredDate] = useState<string | null>(null);
  const transactions = useLocalTransactions();
  const [year, month, todayOfMonth] = today.split("-").map(Number);

  const dailyTotals = useMemo<DailyTotal[]>(() => {
    const monthKey = today.slice(0, 7);
    const totals = new Map<number, number>();

    for (const transaction of transactions) {
      if (transaction.kind !== "expense" || !transaction.occurredOn.startsWith(`${monthKey}-`)) {
        continue;
      }

      const day = Number(transaction.occurredOn.slice(8, 10));
      totals.set(day, (totals.get(day) ?? 0) + transaction.amountFen);
    }

    return Array.from({ length: todayOfMonth }, (_, index) => {
      const day = index + 1;
      return {
        date: `${monthKey}-${String(day).padStart(2, "0")}`,
        day,
        amountFen: totals.get(day) ?? 0,
      };
    });
  }, [today, todayOfMonth, transactions]);

  const totalFen = dailyTotals.reduce((sum, item) => sum + item.amountFen, 0);
  const highestFen = Math.max(0, ...dailyTotals.map((item) => item.amountFen));
  const { maxFen: yMaxFen, stepFen: yStepFen } = getMonthlyChartScale(highestFen);
  const chartWidth = Math.max(720, PLOT_LEFT + PLOT_RIGHT + dailyTotals.length * 44);
  const plotWidth = chartWidth - PLOT_LEFT - PLOT_RIGHT;
  const plotHeight = PLOT_BOTTOM - PLOT_TOP;

  const points = dailyTotals.map((item, index) => {
    const x =
      dailyTotals.length === 1
        ? PLOT_LEFT + plotWidth / 2
        : PLOT_LEFT + (index / (dailyTotals.length - 1)) * plotWidth;
    const y = PLOT_BOTTOM - (item.amountFen / yMaxFen) * plotHeight;
    return { ...item, x, y };
  });

  const linePath = points.map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`).join(" ");
  const tickCount = yMaxFen / yStepFen;
  const ticks = Array.from({ length: tickCount + 1 }, (_, index) => {
    const amountFen = yMaxFen - index * yStepFen;
    const y = PLOT_TOP + (index / tickCount) * plotHeight;
    return { amountFen, y };
  });

  function openDay(date: string) {
    router.push(`/month/${date}`);
  }

  return (
    <section className="surface month-chart-surface" aria-label="本月每日开销">
      <div className="section-heading month-chart-heading">
        <div>
          <p>
            {year}年{month}月1日—{month}月{todayOfMonth}日
          </p>
        </div>
        <div className="month-total">
          <span>本月已支出</span>
          <strong>{formatFen(totalFen)}</strong>
        </div>
      </div>

      <div className="chart-scroll" tabIndex={0} aria-label="本月每日开销折线图，可横向滚动">
        <svg
          className="month-chart"
          role="img"
          aria-label="本月每日开销折线图"
          aria-describedby="daily-spending-description"
          viewBox={`0 0 ${chartWidth} ${CHART_HEIGHT}`}
          style={{ width: chartWidth }}
        >
          <desc id="daily-spending-description">每个圆点代表一天，点击圆点可以查看当天的账单明细。</desc>

          {ticks.map((tick) => (
            <g key={tick.y}>
              <line className="chart-grid-line" x1={PLOT_LEFT} x2={chartWidth - PLOT_RIGHT} y1={tick.y} y2={tick.y} />
              <text className="chart-axis-label" textAnchor="end" x={PLOT_LEFT - 12} y={tick.y + 4}>
                {formatFen(tick.amountFen)}
              </text>
            </g>
          ))}

          <path className="chart-line" d={linePath} />

          {points.map((point) => (
            <g
              className="chart-point"
              key={point.date}
              role="link"
              tabIndex={0}
              aria-label={`${month}月${point.day}日，支出${formatFen(point.amountFen)}，查看明细`}
              onMouseEnter={() => setHoveredDate(point.date)}
              onMouseLeave={() => setHoveredDate(null)}
              onFocus={() => setHoveredDate(point.date)}
              onBlur={() => setHoveredDate(null)}
              onClick={() => openDay(point.date)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  openDay(point.date);
                }
              }}
            >
              <circle className="chart-point-hitbox" cx={point.x} cy={point.y} r="15" />
              <circle className="chart-point-dot" cx={point.x} cy={point.y} r="5" />
              <text className="chart-day-label" textAnchor="middle" x={point.x} y={PLOT_BOTTOM + 27}>
                {point.day}日
              </text>
              {hoveredDate === point.date ? (
                <g
                  className="chart-tooltip"
                  transform={`translate(${Math.min(
                    Math.max(point.x - TOOLTIP_WIDTH / 2, PLOT_LEFT),
                    chartWidth - PLOT_RIGHT - TOOLTIP_WIDTH,
                  )}, ${point.y - TOOLTIP_HEIGHT - 14 < 4 ? point.y + 14 : point.y - TOOLTIP_HEIGHT - 14})`}
                  pointerEvents="none"
                >
                  <rect height={TOOLTIP_HEIGHT} rx="8" width={TOOLTIP_WIDTH} />
                  <text textAnchor="middle" x={TOOLTIP_WIDTH / 2} y="22">
                    {`${point.day}日  ${formatFen(point.amountFen)}`}
                  </text>
                </g>
              ) : null}
            </g>
          ))}
        </svg>
      </div>
    </section>
  );
}
