// frontend/src/components/AppShell.tsx
import type { ReactNode } from "react";

/** Sidebar navigation. Order matches the client mockup — don't reorder. */
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
  children: ReactNode;
  /** href of the current page, used to highlight the sidebar link. */
  active?: string;
  /** Shown in the top bar. Comes from Cognito once auth lands in Sprint 2. */
  userName?: string;
}

export function AppShell({ children, active, userName }: AppShellProps) {
  const initials = userName
    ? userName
        .trim()
        .split(/\s+/)
        .map((w) => w[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "?";

  return (
    <div className="fp-shell">
      <aside className="fp-sidebar">
        <div className="fp-sidebar__brand">FitPlan</div>

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
      </aside>

      <div className="fp-main">
        <header className="fp-topbar">
          <div />
          <div className="fp-topbar__user">
            <span>{userName ?? "Not signed in"}</span>
            <div className="fp-avatar" aria-hidden="true">
              {initials}
            </div>
          </div>
        </header>

        <main className="fp-content">{children}</main>
      </div>
    </div>
  );
}
