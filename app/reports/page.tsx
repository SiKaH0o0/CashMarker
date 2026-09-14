import { formatFen } from "@/lib/finance/money";

const report = {
  month: "2026 年 8 月",
  openingFundsFen: 100000,
  livingAllowanceFen: 200000,
  otherIncomeFen: 20000,
  totalExpenseFen: 210000,
  savingsFen: 10000,
  closingFundsFen: 110000,
};

export default function ReportsPage() {
  return (
    <main className="page-stack">
      <header className="page-header">
        <div>
          <p className="eyebrow">已完成结算</p>
          <h1>{report.month}月报</h1>
        </div>
        <span className="positive-value">{formatFen(report.savingsFen, { sign: true })}</span>
      </header>

      <section className="surface report-sheet">
        <ReportRow label="月初剩余资金" value={report.openingFundsFen} />
        <ReportRow label="本月生活费" value={report.livingAllowanceFen} />
        <ReportRow label="其他收入" value={report.otherIncomeFen} />
        <ReportRow label="本月总支出" value={report.totalExpenseFen} negative />
        <div className="report-divider" />
        <ReportRow label="本月确切积蓄" value={report.savingsFen} signed emphasis />
        <ReportRow label="月末剩余资金" value={report.closingFundsFen} emphasis />
      </section>

      <section className="surface unsettled-note">
        <div>
          <h2>2026 年 9 月</h2>
          <p>当前月份尚未结束，本月积蓄将在所有固定账单处理完成后生成。</p>
        </div>
        <span className="status-pending">未结算</span>
      </section>
    </main>
  );
}

function ReportRow({
  label,
  value,
  negative = false,
  signed = false,
  emphasis = false,
}: {
  label: string;
  value: number;
  negative?: boolean;
  signed?: boolean;
  emphasis?: boolean;
}) {
  return (
    <div className={emphasis ? "report-row report-row-emphasis" : "report-row"}>
      <span>{label}</span>
      <strong>{negative ? `-${formatFen(value)}` : formatFen(value, { sign: signed })}</strong>
    </div>
  );
}
