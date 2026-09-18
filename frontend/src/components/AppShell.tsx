import { createContext, useContext, type ReactNode } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/auth/AuthContext";
import { Button } from "@/components/Button";

const AppShellContext = createContext(false);
const NAV_GROUPS = [
  { label: "Workspace", items: [{ label: "Dashboard", href: "/dashboard", icon: "⌂" }, { label: "AI Coach", href: "/coach", icon: "✦", badge: "NEW" }] },
  { label: "Plan", items: [{ label: "Workout", href: "/workout", icon: "◈" }, { label: "Meal Plan", href: "/meals", icon: "◌" }, { label: "Daily Logs", href: "/logs", icon: "✓" }] },
  { label: "Review", items: [{ label: "Progress", href: "/progress", icon: "↗" }, { label: "Calendar", href: "/calendar", icon: "□" }, { label: "Achievements", href: "/achievements", icon: "◇" }] },
];
interface AppShellProps { children?: ReactNode; active?: string; userName?: string; }

export function AppShell({ children, active, userName }: AppShellProps) {
  const alreadyInsideShell = useContext(AppShellContext);
  if (alreadyInsideShell) return <>{children}</>;
  return <AppShellContext.Provider value><AppShellLayout active={active} userName={userName}>{children}</AppShellLayout></AppShellContext.Provider>;
}
function AppShellLayout({ children, active, userName }: AppShellProps) {
  const location = useLocation(); const navigate = useNavigate(); const { email, signOut } = useAuth();
  const currentPath = active || location.pathname; const displayName = userName || email || "FitPlan User"; const initials = displayName.slice(0, 1).toUpperCase();
  async function handleLogout() { await signOut(); navigate("/login", { replace: true }); }
  return <div className="fp-shell">
    <aside className="fp-sidebar">
      <div className="fp-sidebar__brand"><span className="fp-sidebar__brand-mark"><span>F</span></span><span className="fp-sidebar__brand-name">FitPlan</span><span className="fp-sidebar__brand-dot" /></div>
      <div className="fp-sidebar__workspace"><span className="fp-sidebar__workspace-label">PERSONAL PLAN</span><span className="fp-sidebar__workspace-value">Your fitness journey <span>⌄</span></span></div>
      <div className="fp-sidebar__groups">{NAV_GROUPS.map((group) => <section key={group.label} className="fp-sidebar__group"><div className="fp-sidebar__section"><span>{group.label}</span><span className="fp-sidebar__section-line" /></div><nav aria-label={`${group.label} navigation`}>{group.items.map((item) => { const isActive = currentPath === item.href; return <button className={`fp-sidebar__link ${isActive ? "fp-sidebar__link--active" : ""}`} key={item.href} type="button" onClick={() => navigate(item.href)} aria-current={isActive ? "page" : undefined}><span className="fp-sidebar__icon" aria-hidden="true">{item.icon}</span><span>{item.label}</span>{item.badge && <span className="fp-sidebar__badge">{item.badge}</span>}</button>; })}</nav></section>)}</div>
      <div className="fp-sidebar__footer"><div className="fp-sidebar__user"><div className="fp-avatar" aria-hidden="true">{initials}</div><div className="fp-sidebar__user-copy"><div className="fp-sidebar__user-name">{displayName}</div><div className="fp-sidebar__user-label">Personal account</div></div><span className="fp-sidebar__user-menu" aria-hidden="true">•••</span></div><Button variant="ghost" block size="sm" onClick={handleLogout}><span aria-hidden="true">↪</span> Log out</Button></div>
    </aside>
    <div className="fp-main"><header className="fp-topbar"><div className="fp-topbar__context"><span className="fp-topbar__dot" /><span>Personal workspace</span><span className="fp-topbar__slash">/</span><strong>Overview</strong></div><div className="fp-topbar__actions"><button className="fp-icon-button" type="button" aria-label="Notifications">♧<span className="fp-notification-dot" /></button><div className="fp-topbar__user"><span className="fp-avatar" aria-hidden="true">{initials}</span><span className="fp-topbar__user-name">{displayName}</span><span className="fp-topbar__chevron" aria-hidden="true">⌄</span></div></div></header><main className="fp-content">{children ?? <Outlet />}</main></div>
  </div>;
}
export default AppShell;
