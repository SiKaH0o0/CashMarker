export function formatFen(amountFen: number, options: { sign?: boolean } = {}): string {
  const amount = amountFen / 100;
  const prefix = options.sign && amount > 0 ? "+" : "";
  return `${prefix}¥${amount.toLocaleString("zh-CN", {
    minimumFractionDigits: Number.isInteger(amount) ? 0 : 2,
    maximumFractionDigits: 2,
  })}`;
}
