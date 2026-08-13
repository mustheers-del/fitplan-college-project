import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "./AuthContext";

/**
 * OWNER: [E], Sprint 2.
 * Blocks unauthenticated users. Once profiles exist (Sprint 3), also
 * redirect a logged-in user with no profile straight into /onboarding.
 */
export default function ProtectedRoute() {
  const { userId, loading } = useAuth();

  if (loading) return <div style={{ padding: 40 }}>Loading…</div>;
  if (!userId) return <Navigate to="/login" replace />;
  return <Outlet />;
}
