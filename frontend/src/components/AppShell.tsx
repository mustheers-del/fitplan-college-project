import { createContext, useContext, type ReactNode } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/auth/AuthContext";
import { Button } from "@/components/Button";
import { FiActivity, FiAward, FiBell, FiCalendar, FiChevronDown, FiClipboard, FiGrid, FiLogOut, FiMessageCircle, FiPieChart, FiTrendingUp } from "react-icons/fi";

const AppShellContext = createContext(false);
const NAV_GROUPS: { label: string; items: { label: string; href: string; icon: typeof FiGrid; badge?: string }[] }[] = [
  { label: "Workspace", items: [{ label: "Dashboard", href: "/dashboard", icon: FiGrid }, { label: "AI Coach", href: "/coach", icon: FiMessageCircle, badge: "NEW" }] },
  { label: "Plan", items: [{ label: "Workout", href: "/workout", icon: FiActivity }, { label: "Meal Plan", href: "/meals", icon: FiPieChart }, { label: "Daily Logs", href: "/logs", icon: FiClipboard }] },
  { label: "Review", items: [{ label: "Progress", href: "/progress", icon: FiTrendingUp }, { label: "Calendar", href: "/calendar", icon: FiCalendar }, { label: "Achievements", href: "/achievements", icon: FiAward }] },
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
      <div className="fp-sidebar__workspace"><span className="fp-sidebar__workspace-label">PERSONAL PLAN</span><span className="fp-sidebar__workspace-value">Your fitness journey <FiChevronDown aria-hidden="true" /></span></div>
      <div className="fp-sidebar__groups">{NAV_GROUPS.map((group) => <section key={group.label} className="fp-sidebar__group"><div className="fp-sidebar__section"><span>{group.label}</span><span className="fp-sidebar__section-line" /></div><nav aria-label={`${group.label} navigation`}>{group.items.map((item) => { const isActive = currentPath === item.href; return <button className={`fp-sidebar__link ${isActive ? "fp-sidebar__link--active" : ""}`} key={item.href} type="button" onClick={() => navigate(item.href)} aria-current={isActive ? "page" : undefined}><span className="fp-sidebar__icon" aria-hidden="true">{(() => { const Icon = item.icon; return <Icon />; })()}</span><span>{item.label}</span>{item.badge && <span className="fp-sidebar__badge">{item.badge}</span>}</button>; })}</nav></section>)}</div>
      <div className="fp-sidebar__footer"><div className="fp-sidebar__user"><div className="fp-avatar" aria-hidden="true">{initials}</div><div className="fp-sidebar__user-copy"><div className="fp-sidebar__user-name">{displayName}</div><div className="fp-sidebar__user-label">Personal account</div></div><span className="fp-sidebar__user-menu" aria-hidden="true">•••</span></div><Button variant="ghost" block size="sm" onClick={handleLogout}><FiLogOut aria-hidden="true" /> Log out</Button></div>
    </aside>
    <div className="fp-main"><header className="fp-topbar"><div className="fp-topbar__context"><span className="fp-topbar__dot" /><span>Personal workspace</span><span className="fp-topbar__slash">/</span><strong>Overview</strong></div><div className="fp-topbar__actions"><button className="fp-icon-button" type="button" aria-label="Notifications"><FiBell aria-hidden="true" /><span className="fp-notification-dot" /></button><div className="fp-topbar__user"><span className="fp-avatar" aria-hidden="true">{initials}</span><span className="fp-topbar__user-name">{displayName}</span><FiChevronDown className="fp-topbar__chevron" aria-hidden="true" /></div></div></header><main className="fp-content">{children ?? <Outlet />}</main></div>
  </div>;
}
export default AppShell;
