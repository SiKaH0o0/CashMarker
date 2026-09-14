import { Navigation } from "@/components/navigation";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="app-frame">
      <aside className="desktop-sidebar">
        <div className="brand-mark" aria-label="CashMarker">
          <span className="brand-symbol">C</span>
          <span>CashMarker</span>
        </div>
        <Navigation variant="desktop" />
        <p className="sidebar-note">个人账本 · 框架预览</p>
      </aside>

      <div className="app-content">{children}</div>

      <nav className="mobile-navigation" aria-label="主导航">
        <Navigation variant="mobile" />
      </nav>
    </div>
  );
}
