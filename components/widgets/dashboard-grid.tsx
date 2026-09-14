import { CircleAlert, Landmark, ReceiptText, WalletCards } from "lucide-react";
import type { DashboardSnapshot, WidgetId } from "@/lib/finance/types";
import { formatFen } from "@/lib/finance/money";
import { defaultWidgetPreferences, widgetRegistry } from "./widget-registry";

export function DashboardGrid({ snapshot }: { snapshot: DashboardSnapshot }) {
  const visibleWidgets = defaultWidgetPreferences
    .filter((preference) => preference.visible)
    .sort((left, right) => left.order - right.order);

  return (
    <section className="metric-grid" aria-label="资金模块">
      {visibleWidgets.map((preference) => {
        const definition = widgetRegistry.find((widget) => widget.id === preference.id);
        return <WidgetCard key={preference.id} id={preference.id} title={definition?.title ?? preference.id} snapshot={snapshot} />;
      })}
    </section>
  );
}

function WidgetCard({ id, title, snapshot }: { id: WidgetId; title: string; snapshot: DashboardSnapshot }) {
  const widget = widgetValue(id, snapshot);
  const Icon = widget.icon;

  return (
    <article className="metric-card">
      <div className="metric-card-heading">
        <span className="metric-icon"><Icon aria-hidden="true" size={18} /></span>
        <span>{title}</span>
      </div>
      <strong className={widget.tone === "warning" ? "metric-value metric-value-warning" : "metric-value"}>{widget.value}</strong>
      <p>{widget.note}</p>
    </article>
  );
}

function widgetValue(id: WidgetId, snapshot: DashboardSnapshot) {
  switch (id) {
    case "current-funds":
      return { value: formatFen(snapshot.currentFundsFen), note: "跨月份累计后的真实账本余额", icon: WalletCards, tone: "default" } as const;
    case "budget-remaining":
      return { value: formatFen(snapshot.budgetRemainingFen), note: "只计算本月已经确认的支出", icon: Landmark, tone: "default" } as const;
    case "pending-bills":
      return { value: formatFen(snapshot.pendingBillsFen), note: `${snapshot.pendingBillCount} 条等待逐项确认`, icon: CircleAlert, tone: "warning" } as const;
    case "monthly-expense":
      return { value: formatFen(snapshot.currentMonthExpenseFen), note: "待确认账单尚未计入", icon: ReceiptText, tone: "default" } as const;
    default:
      return { value: "暂未启用", note: "可以在设置中开启", icon: ReceiptText, tone: "default" } as const;
  }
}
