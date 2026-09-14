import { WidgetSettings } from "@/components/settings/widget-settings";

export default function SettingsPage() {
  return (
    <main className="page-stack">
      <header className="page-header">
        <div>
          <p className="eyebrow">个性化</p>
          <h1>设置</h1>
        </div>
      </header>

      <section className="surface settings-section">
        <div className="section-heading">
          <div>
            <h2>首页模块</h2>
            <p>决定首页显示哪些内容。后续将同步到所有设备。</p>
          </div>
        </div>
        <WidgetSettings />
      </section>

      <section className="surface settings-section">
        <div className="section-heading">
          <div>
            <h2>资金设置</h2>
            <p>初始资金、每月生活费和时区将在接入数据库后配置。</p>
          </div>
        </div>
        <dl className="settings-summary">
          <div><dt>默认货币</dt><dd>人民币（CNY）</dd></div>
          <div><dt>记账日期</dt><dd>自动读取 Asia/Shanghai</dd></div>
          <div><dt>月报生成</dt><dd>次月处理完待确认账单后</dd></div>
        </dl>
      </section>
    </main>
  );
}
