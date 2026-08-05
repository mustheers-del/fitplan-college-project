import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "./useAuth";

/**
 * OWNER: [E], Sprint 2.
 * Blocks unauthenticated users. Once profiles exist (Sprint 3), also
 * redirect a logged-in user with no profile straight into /onboarding.
 */
export default function ProtectedRoute() {
  const { user, loading } = useAuth();

  if (loading) return <div style={{ padding: 40 }}>Loading…</div>;
  if (!user) return <Navigate to="/login" replace />;
  return <Outlet />;
}
