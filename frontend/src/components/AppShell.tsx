import { createContext, useContext, type ReactNode } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/auth/AuthContext";
import { Button } from "@/components/Button";

const AppShellContext = createContext(false);
const NAV_ITEMS = [
  { label: "Dashboard", href: "/dashboard", icon: "⌂" },
  { label: "AI Coach", href: "/coach", icon: "✦" },
  { label: "Workout", href: "/workout", icon: "◈" },
  { label: "Meal Plan", href: "/meals", icon: "◌" },
  { label: "Daily Logs", href: "/logs", icon: "✓" },
  { label: "Progress", href: "/progress", icon: "↗" },
  { label: "Calendar", href: "/calendar", icon: "□" },
  { label: "Achievements", href: "/achievements", icon: "◇" },
  { label: "Profile", href: "/profile", icon: "○" },
  { label: "Settings", href: "/settings", icon: "⚙" },
];

interface AppShellProps { children?: ReactNode; active?: string; userName?: string; }

export function AppShell({ children, active, userName }: AppShellProps) {
  const alreadyInsideShell = useContext(AppShellContext);
  if (alreadyInsideShell) return <>{children}</>;
  return <AppShellContext.Provider value>{<AppShellLayout active={active} userName={userName}>{children}</AppShellLayout>}</AppShellContext.Provider>;
}

function AppShellLayout({ children, active, userName }: AppShellProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { email, signOut } = useAuth();
  const currentPath = active || location.pathname;
  const displayName = userName || email || "FitPlan User";
  const initials = displayName.slice(0, 1).toUpperCase();

  async function handleLogout() { await signOut(); navigate("/login", { replace: true }); }

  return (
    <div className="fp-shell">
      <aside className="fp-sidebar">
        <div className="fp-sidebar__brand"><span className="fp-sidebar__mark">F</span><span>FitPlan</span></div>
        <div className="fp-sidebar__section">Workspace</div>
        <nav aria-label="Main navigation">
          {NAV_ITEMS.map((item) => {
            const isActive = currentPath === item.href;
            return <button className={`fp-sidebar__link ${isActive ? "fp-sidebar__link--active" : ""}`} key={item.href} type="button" onClick={() => navigate(item.href)} aria-current={isActive ? "page" : undefined}><span className="fp-sidebar__icon" aria-hidden="true">{item.icon}</span><span>{item.label}</span></button>;
          })}
        </nav>
        <div className="fp-sidebar__footer">
          <div className="fp-sidebar__user"><div className="fp-avatar" aria-hidden="true">{initials}</div><div><div className="fp-sidebar__user-name">{displayName}</div><div className="fp-sidebar__user-label">Personal plan</div></div></div>
          <Button variant="ghost" block size="sm" onClick={handleLogout}>Log out</Button>
        </div>
      </aside>
      <div className="fp-main">
        <header className="fp-topbar"><div className="fp-topbar__user"><span className="fp-avatar" aria-hidden="true">{initials}</span><span>{displayName}</span></div></header>
        <main className="fp-content">{children ?? <Outlet />}</main>
      </div>
    </div>
  );
}
export default AppShell;
