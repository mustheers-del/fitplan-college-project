import { Outlet, NavLink, useNavigate } from "react-router-dom";
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

export function AppShell({
  children,
  active,
  userName,
}: AppShellProps) {
  const navigate = useNavigate();
  const { email, signOut } = useAuth();

  async function handleLogout() {
    await signOut();
    navigate("/login", { replace: true });
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        background: "var(--c-bg, #f7f8fa)",
      }}
    >
      <aside
        style={{
          width: "250px",
          flexShrink: 0,
          minHeight: "100vh",
          background: "#111827",
          color: "#fff",
          padding: "24px 16px",
          boxSizing: "border-box",
          position: "sticky",
          top: 0,
          alignSelf: "flex-start",
        }}
      >
        <div
          style={{
            fontSize: "22px",
            fontWeight: 700,
            padding: "0 12px 28px",
          }}
        >
          FitPlan
        </div>

        <nav style={{ display: "grid", gap: "6px" }}>
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.href}
              to={item.href}
              style={({ isActive }) => ({
                display: "block",
                padding: "11px 12px",
                borderRadius: "8px",
                color: "#fff",
                textDecoration: "none",
                background:
                  isActive || active === item.href
                    ? "rgba(255,255,255,0.14)"
                    : "transparent",
                fontWeight:
                  isActive || active === item.href ? 600 : 400,
              })}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <button
          type="button"
          onClick={handleLogout}
          style={{
            width: "100%",
            marginTop: "24px",
            padding: "11px 12px",
            border: "1px solid rgba(255,255,255,0.18)",
            borderRadius: "8px",
            background: "transparent",
            color: "#fff",
            cursor: "pointer",
            textAlign: "left",
          }}
        >
          Logout
        </button>

        <div
          style={{
            marginTop: "20px",
            padding: "0 12px",
            color: "rgba(255,255,255,0.65)",
            fontSize: "13px",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {userName || email || "FitPlan User"}
        </div>

        <div
          style={{
            margin: "14px 12px 0",
            width: "36px",
            height: "36px",
            borderRadius: "50%",
            background: "#374151",
            display: "grid",
            placeItems: "center",
            fontWeight: 700,
          }}
        >
          {(userName || email || "U").charAt(0).toUpperCase()}
        </div>
      </aside>

      <main
        style={{
          flex: 1,
          minWidth: 0,
          padding: "32px",
          boxSizing: "border-box",
        }}
      >
        {children ?? <Outlet />}
      </main>
    </div>
  );
}

export default AppShell;
