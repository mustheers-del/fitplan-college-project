import { createContext, useContext, type ReactNode } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/auth/AuthContext";

const AppShellContext = createContext(false);

const NAV_ITEMS = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "AI Coach", href: "/coach" },
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
  const alreadyInsideShell = useContext(AppShellContext);

  if (alreadyInsideShell) {
    return <>{children}</>;
  }

  return (
    <AppShellContext.Provider value={true}>
      <AppShellLayout active={active} userName={userName}>
        {children}
      </AppShellLayout>
    </AppShellContext.Provider>
  );
}

function AppShellLayout({
  children,
  active,
  userName,
}: AppShellProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { email, signOut } = useAuth();

  const currentPath = active || location.pathname;
  const displayName = userName || email || "FitPlan User";

  async function handleLogout() {
    await signOut();
    navigate("/login", { replace: true });
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        background: "var(--c-bg, #f8fafc)",
        color: "var(--c-text, #111827)",
      }}
    >
      <aside
        style={{
          width: "240px",
          minHeight: "100vh",
          padding: "24px 16px",
          borderRight: "1px solid var(--c-border, #e5e7eb)",
          background: "var(--c-surface, #ffffff)",
          boxSizing: "border-box",
          flexShrink: 0,
        }}
      >
        <div
          style={{
            fontSize: "22px",
            fontWeight: 700,
            marginBottom: "28px",
            padding: "0 12px",
          }}
        >
          FitPlan
        </div>

        <nav style={{ display: "grid", gap: "6px" }}>
          {NAV_ITEMS.map((item) => {
            const isActive = currentPath === item.href;

            return (
              <button
                key={item.href}
                type="button"
                onClick={() => navigate(item.href)}
                style={{
                  width: "100%",
                  textAlign: "left",
                  padding: "11px 12px",
                  border: "none",
                  borderRadius: "8px",
                  background: isActive
                    ? "var(--c-primary, #2563eb)"
                    : "transparent",
                  color: isActive
                    ? "#ffffff"
                    : "var(--c-text, #111827)",
                  cursor: "pointer",
                  fontSize: "14px",
                  fontWeight: isActive ? 600 : 500,
                }}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        <div
          style={{
            marginTop: "auto",
            paddingTop: "28px",
            paddingLeft: "12px",
            paddingRight: "12px",
          }}
        >
          <div
            style={{
              fontSize: "13px",
              color: "var(--c-text-secondary, #6b7280)",
              marginBottom: "12px",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {displayName}
          </div>

          <button
            type="button"
            onClick={handleLogout}
            style={{
              width: "100%",
              padding: "10px 12px",
              border: "1px solid var(--c-border, #e5e7eb)",
              borderRadius: "8px",
              background: "transparent",
              color: "var(--c-text, #111827)",
              cursor: "pointer",
              fontWeight: 600,
            }}
          >
            Logout
          </button>
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
