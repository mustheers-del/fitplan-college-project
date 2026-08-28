import { Outlet, useNavigate } from "react-router-dom";
import type { ReactNode } from "react";
import { useAuth } from "@/auth/AuthContext";

const NAV_ITEMS = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Workout", href: "/workout" },
  { label: "Meal Plan", href: "/meals" },
  { label: "Daily Logs", href: "/logs" },
  { label: "Progress", href: "/progress" },
  { label: "Calendar", href: "/calendar" },
  { label: "Achievements", href: "/achievements" },
  { label: "Profile", href: "/profile" },
  { label: "Settings", href: "/settings" },
];

interface AppShellProps {
  children?: ReactNode;
  active?: string;
  userName?: string;
}

export function AppShell({ children, active, userName }: AppShellProps) {
  const { email, signOut } = useAuth();
  const navigate = useNavigate();

  const displayName = userName ?? email ?? "Not signed in";

  const initials =
    displayName !== "Not signed in"
      ? displayName
          .trim()
          .split(/\s+/)
          .map((word) => word[0])
          .slice(0, 2)
          .join("")
          .toUpperCase()
      : "?";

  async function handleLogout() {
    try {
      await signOut();
      navigate("/login", { replace: true });
    } catch (err) {
      console.error("Logout failed:", err);
    }
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <aside
        style={{
          width: "var(--sidebar-w)",
          background: "var(--c-surface)",
          borderRight: "1px solid var(--c-border)",
          padding: "var(--sp-6) var(--sp-4)",
        }}
      >
        <div
          style={{
            fontWeight: "var(--fw-bold)",
            fontSize: "var(--fs-xl)",
            color: "var(--c-primary)",
            marginBottom: "var(--sp-8)",
            paddingLeft: "var(--sp-3)",
          }}
        >
          FitPlan
        </div>

        <nav>
          {NAV_ITEMS.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className={
                "fp-sidebar__link" +
                (item.href === active ? " fp-sidebar__link--active" : "")
              }
              aria-current={item.href === active ? "page" : undefined}
            >
              {item.label}
            </a>
          ))}
        </nav>

        <button
          type="button"
          onClick={handleLogout}
          style={{
            width: "100%",
            marginTop: "var(--sp-6)",
            padding: "var(--sp-3)",
            border: "1px solid var(--c-border)",
            borderRadius: "var(--r-md)",
            background: "transparent",
            color: "var(--c-text)",
            cursor: "pointer",
            fontWeight: "var(--fw-semibold)",
          }}
        >
          Logout
        </button>
      </aside>

      <div className="fp-main">
        <header className="fp-topbar">
          <div />

          <div className="fp-topbar__user">
            <span>{displayName}</span>

            <div className="fp-avatar" aria-hidden="true">
              {initials}
            </div>
          </div>
        </header>

        <main className="fp-content">{children ?? <Outlet />}</main>
      </div>
    </div>
  );
}

export default AppShell;
