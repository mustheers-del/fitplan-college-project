import {
  createContext,
  useContext,
  useState,
} from "react";

import type { ReactNode } from "react";

import {
  NavLink,
  Outlet,
  useLocation,
  useNavigate,
} from "react-router-dom";

import { useAuth } from "@/auth/useAuth";

type AppShellContextValue = {
  closeMobileMenu: () => void;
};

const AppShellContext = createContext<AppShellContextValue | null>(null);

export function useAppShell() {
  return useContext(AppShellContext);
}

type IconName =
  | "dashboard"
  | "workout"
  | "meals"
  | "logs"
  | "progress"
  | "calendar"
  | "achievements"
  | "coach"
  | "profile"
  | "settings"
  | "logout"
  | "chevron";

function Icon({
  name,
  size = 20,
}: {
  name: IconName;
  size?: number;
}) {
  const common = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };

  switch (name) {
    case "dashboard":
      return (
        <svg {...common}>
          <rect x="4" y="4" width="6" height="6" rx="1.5" />
          <rect x="14" y="4" width="6" height="6" rx="1.5" />
          <rect x="4" y="14" width="6" height="6" rx="1.5" />
          <rect x="14" y="14" width="6" height="6" rx="1.5" />
        </svg>
      );

    case "workout":
      return (
        <svg {...common}>
          <path d="M7 8v8" />
          <path d="M17 8v8" />
          <path d="M4 10v4" />
          <path d="M20 10v4" />
          <path d="M7 12h10" />
          <path d="M5 9v6" />
          <path d="M19 9v6" />
        </svg>
      );

    case "meals":
      return (
        <svg {...common}>
          <path d="M7 3v7" />
          <path d="M4.5 3v5a2.5 2.5 0 0 0 5 0V3" />
          <path d="M7 10v11" />
          <path d="M17 3v18" />
          <path d="M14 3v7h6" />
        </svg>
      );

    case "logs":
      return (
        <svg {...common}>
          <rect x="5" y="4" width="14" height="17" rx="2" />
          <path d="M8 8h8" />
          <path d="M8 12h8" />
          <path d="M8 16h5" />
          <path d="M9 2v4" />
          <path d="M15 2v4" />
        </svg>
      );

    case "progress":
      return (
        <svg {...common}>
          <path d="M4 19V5" />
          <path d="M4 19h16" />
          <path d="m7 15 3-4 3 2 5-7" />
        </svg>
      );

    case "calendar":
      return (
        <svg {...common}>
          <rect x="4" y="5" width="16" height="16" rx="2" />
          <path d="M8 3v4" />
          <path d="M16 3v4" />
          <path d="M4 9h16" />
          <path d="M8 13h.01" />
          <path d="M12 13h.01" />
          <path d="M16 13h.01" />
          <path d="M8 17h.01" />
          <path d="M12 17h.01" />
        </svg>
      );

    case "achievements":
      return (
        <svg {...common}>
          <path d="M8 4h8v6a4 4 0 0 1-8 0V4Z" />
          <path d="M8 7H5a3 3 0 0 0 3 3" />
          <path d="M16 7h3a3 3 0 0 1-3 3" />
          <path d="M12 14v4" />
          <path d="M8 21h8" />
          <path d="M9 18h6" />
        </svg>
      );

    case "coach":
      return (
        <svg {...common}>
          <path d="M20 11.5a7 7 0 0 1-8 7 8.5 8.5 0 0 1-3-.6L5 20l1.4-3.3A7 7 0 1 1 20 11.5Z" />
          <path d="M9 12h.01" />
          <path d="M12 12h.01" />
          <path d="M15 12h.01" />
        </svg>
      );

    case "profile":
      return (
        <svg {...common}>
          <circle cx="12" cy="8" r="3.5" />
          <path d="M5 20a7 7 0 0 1 14 0" />
        </svg>
      );

    case "settings":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-1.8 1.8-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6v.2h-2.5V20a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1-1.8-1.8.1-.1A1.7 1.7 0 0 0 8 15a1.7 1.7 0 0 0-1.6-1H6v-2.5h.2A1.7 1.7 0 0 0 8 10a1.7 1.7 0 0 0-.3-1.9l-.1-.1 1.8-1.8.1.1a1.7 1.7 0 0 0 1.9.3 1.7 1.7 0 0 0 1-1.6v-.2h2.5V5a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1 1.8 1.8-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.6 1h.2V14h-.2a1.7 1.7 0 0 0-1.6 1Z" />
        </svg>
      );

    case "logout":
      return (
        <svg {...common}>
          <path d="M10 5H6a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h4" />
          <path d="M14 8l4 4-4 4" />
          <path d="M18 12H9" />
        </svg>
      );

    case "chevron":
      return (
        <svg {...common}>
          <path d="m9 18 6-6-6-6" />
        </svg>
      );

    default:
      return null;
  }
}

const mainNav = [
  {
    label: "Dashboard",
    path: "/dashboard",
    icon: "dashboard" as IconName,
  },
  {
    label: "Workout",
    path: "/workout",
    icon: "workout" as IconName,
  },
  {
    label: "Meal Plan",
    path: "/meals",
    icon: "meals" as IconName,
  },
  {
    label: "Daily Logs",
    path: "/logs",
    icon: "logs" as IconName,
  },
  {
    label: "Progress",
    path: "/progress",
    icon: "progress" as IconName,
  },
  {
    label: "Calendar",
    path: "/calendar",
    icon: "calendar" as IconName,
  },
  {
    label: "Achievements",
    path: "/achievements",
    icon: "achievements" as IconName,
  },
];

const accountNav = [
  {
    label: "Profile",
    path: "/profile",
    icon: "profile" as IconName,
  },
  {
    label: "Settings",
    path: "/settings",
    icon: "settings" as IconName,
  },
];

function getInitials(email?: string | null) {
  if (!email) {
    return "FP";
  }

  const name = email.split("@")[0];

  const parts = name
    .replace(/[._-]+/g, " ")
    .trim()
    .split(" ")
    .filter(Boolean);

  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }

  return name.slice(0, 2).toUpperCase();
}

function SidebarContent({
  email,
  onNavigate,
  onLogout,
}: {
  email?: string | null;
  onNavigate: () => void;
  onLogout: () => void;
}) {
  const location = useLocation();

  return (
    <div className="app-sidebar-inner">
      <div className="sidebar-brand">
        <NavLink
          to="/dashboard"
          className="sidebar-brand-link"
          onClick={onNavigate}
        >
          <div className="brand-mark">
            <svg viewBox="0 0 32 32" aria-hidden="true">
              <path d="M7 16h4M21 16h4M10 11v10M22 11v10" />
              <path d="M12 16h8" />
              <path d="M6 13v6M26 13v6" />
            </svg>
          </div>

          <div className="brand-copy">
            <strong>FitPlan</strong>
            <span>PERSONAL FITNESS</span>
          </div>
        </NavLink>
      </div>

      <div className="sidebar-scroll">
        <div className="sidebar-section">
          <div className="sidebar-section-label">
            OVERVIEW
          </div>

          <nav className="sidebar-nav">
            {mainNav.map((item) => {
              const isActive =
                location.pathname === item.path ||
                (item.path === "/workout" &&
                  location.pathname.startsWith("/workout/"));

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={onNavigate}
                  className={`sidebar-nav-item ${
                    isActive ? "active" : ""
                  }`}
                >
                  <span className="sidebar-nav-icon">
                    <Icon name={item.icon} />
                  </span>

                  <span className="sidebar-nav-label">
                    {item.label}
                  </span>

                  {isActive && (
                    <span className="sidebar-active-line" />
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>

        <div className="sidebar-coach-card">
          <div className="sidebar-coach-icon">
            <Icon name="coach" size={19} />
          </div>

          <div className="sidebar-coach-copy">
            <span>AI COACH</span>
            <strong>Need some guidance?</strong>
            <p>Ask anything about your plan.</p>
          </div>

          <NavLink
            to="/coach"
            className={`sidebar-coach-link ${
              location.pathname === "/coach" ? "active" : ""
            }`}
            onClick={onNavigate}
            aria-label="Open AI Coach"
          >
            <Icon name="chevron" size={16} />
          </NavLink>
        </div>

        <div className="sidebar-section sidebar-account-section">
          <div className="sidebar-section-label">
            ACCOUNT
          </div>

          <nav className="sidebar-nav">
            {accountNav.map((item) => {
              const isActive = location.pathname === item.path;

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={onNavigate}
                  className={`sidebar-nav-item ${
                    isActive ? "active" : ""
                  }`}
                >
                  <span className="sidebar-nav-icon">
                    <Icon name={item.icon} />
                  </span>

                  <span className="sidebar-nav-label">
                    {item.label}
                  </span>

                  {isActive && (
                    <span className="sidebar-active-line" />
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>
      </div>

      <div className="sidebar-user-area">
        <div className="sidebar-user">
          <div className="sidebar-avatar">
            {getInitials(email)}
          </div>

          <div className="sidebar-user-info">
            <strong>
              {email
                ? email.split("@")[0]
                : "FitPlan User"}
            </strong>

            <span>
              {email ?? "Personal account"}
            </span>
          </div>

          <NavLink
            to="/profile"
            className="sidebar-user-arrow"
            onClick={onNavigate}
            aria-label="Open profile"
          >
            <Icon name="chevron" size={17} />
          </NavLink>
        </div>

        <button
          type="button"
          className="sidebar-logout"
          onClick={onLogout}
        >
          <Icon name="logout" size={18} />
          <span>Sign out</span>
        </button>
      </div>
    </div>
  );
}

function AppShell({
  children,
  active: _active,
}: {
  children?: ReactNode;
  active?: string;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const navigate = useNavigate();

  const { user, signOut } = useAuth();

  const email = user?.username ?? null;

  async function handleLogout() {
    try {
      await signOut();
    } finally {
      setMobileOpen(false);
      navigate("/login", {
        replace: true,
      });
    }
  }

  function closeMobileMenu() {
    setMobileOpen(false);
  }

  return (
    <AppShellContext.Provider
      value={{
        closeMobileMenu,
      }}
    >
      <div className="app-shell">
        <button
          type="button"
          className={`mobile-menu-button ${
            mobileOpen ? "open" : ""
          }`}
          onClick={() =>
            setMobileOpen((current) => !current)
          }
          aria-label={
            mobileOpen
              ? "Close menu"
              : "Open menu"
          }
          aria-expanded={mobileOpen}
        >
          <span />
          <span />
          <span />
        </button>

        {mobileOpen && (
          <button
            type="button"
            className="sidebar-overlay"
            onClick={closeMobileMenu}
            aria-label="Close menu"
          />
        )}

        <aside
          className={`app-sidebar ${
            mobileOpen ? "mobile-open" : ""
          }`}
        >
          <SidebarContent
            email={email}
            onNavigate={closeMobileMenu}
            onLogout={() => void handleLogout()}
          />
        </aside>

        <main className="app-main">
          <div className="app-content">
            {children ?? <Outlet />}
          </div>
        </main>
      </div>
    </AppShellContext.Provider>
  );
}

export { AppShell };
export default AppShell;