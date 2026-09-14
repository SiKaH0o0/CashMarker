import { DashboardGrid } from "@/components/widgets/dashboard-grid";
import { calculateDashboardSnapshot } from "@/lib/finance/calculations";
import { sampleDashboardInput } from "@/lib/finance/sample-data";

export default function DashboardPage() {
  const snapshot = calculateDashboardSnapshot(sampleDashboardInput);

  return (
    <main className="page-stack">
      <header className="page-header">
        <div>
          <p className="eyebrow">2026 年 9 月</p>
          <h1>资金概览</h1>
        </div>
      </header>
      <DashboardGrid snapshot={snapshot} />
    </main>
  );
}
