import type { ReactNode } from "react";
import { NavLink, Outlet } from "react-router-dom";

const NAV = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/workout", label: "Workout" },
  { to: "/meals", label: "Meal Plan" },
  { to: "/logs", label: "Daily Logs" },
  { to: "/progress", label: "Progress" },
  { to: "/calendar", label: "Calendar" },
  { to: "/achievements", label: "Achievements" },
  { to: "/profile", label: "Profile" },
  { to: "/settings", label: "Settings" },
];

interface AppShellProps {
  children?: ReactNode;
  active?: string;
  userName?: string;
}

export function AppShell({ children }: AppShellProps) {
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

        <nav
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "var(--sp-1)",
          }}
        >
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              style={({ isActive }) => ({
                padding: "var(--sp-3)",
                borderRadius: "var(--r-md)",
                fontSize: "var(--fs-sm)",
                fontWeight: isActive
                  ? "var(--fw-semibold)"
                  : "var(--fw-medium)",
                background: isActive ? "var(--c-primary)" : "transparent",
                color: isActive ? "#fff" : "var(--c-text-secondary)",
              })}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <header
          style={{
            height: "var(--topbar-h)",
            background: "var(--c-surface)",
            borderBottom: "1px solid var(--c-border)",
          }}
        />

        <main
          style={{
            flex: 1,
            padding: "var(--sp-8)",
            maxWidth: "var(--content-max)",
          }}
        >
          {children ?? <Outlet />}
        </main>
      </div>
    </div>
  );
}

export default AppShell;
