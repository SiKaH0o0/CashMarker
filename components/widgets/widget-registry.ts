import type { WidgetId, WidgetPreference } from "@/lib/finance/types";

export type WidgetDefinition = {
  id: WidgetId;
  title: string;
  description: string;
  defaultVisible: boolean;
  defaultOrder: number;
};

export const widgetRegistry: WidgetDefinition[] = [
  { id: "current-funds", title: "当前剩余资金", description: "历史收入减去已确认支出", defaultVisible: true, defaultOrder: 1 },
  { id: "budget-remaining", title: "本月预算剩余", description: "生活费减去本月已确认支出", defaultVisible: true, defaultOrder: 2 },
  { id: "pending-bills", title: "待确认账单", description: "尚未计入真实支出的固定账单", defaultVisible: true, defaultOrder: 3 },
  { id: "monthly-expense", title: "本月已支出", description: "本月已确认支出的合计", defaultVisible: true, defaultOrder: 4 },
  { id: "projected-savings", title: "预计月底积蓄", description: "明确标记为预测的可选指标", defaultVisible: false, defaultOrder: 5 },
  { id: "top-expenses", title: "支出最多", description: "本月金额最高的标签", defaultVisible: false, defaultOrder: 6 },
  { id: "recent-transactions", title: "最近记录", description: "最近确认的收入和支出", defaultVisible: true, defaultOrder: 7 },
];

export const defaultWidgetPreferences: WidgetPreference[] = widgetRegistry.map((widget) => ({
  id: widget.id,
  visible: widget.defaultVisible,
  order: widget.defaultOrder,
}));
