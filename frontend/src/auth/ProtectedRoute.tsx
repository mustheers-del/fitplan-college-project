import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "./AuthContext";
import { api, ApiRequestError } from "../api/client";

/**
 * Protects authenticated routes and sends users who have not
 * completed onboarding to /onboarding.
 */
export default function ProtectedRoute() {
  const { userId, loading: authLoading } = useAuth();
  const location = useLocation();

  const [profileChecked, setProfileChecked] = useState(false);
  const [hasProfile, setHasProfile] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function checkProfile() {
      if (!userId) {
        setProfileChecked(true);
        setHasProfile(false);
        return;
      }

      // We are already on onboarding, so don't need to redirect there.
      if (location.pathname === "/onboarding") {
        setProfileChecked(true);
        return;
      }

      try {
        await api.getProfile();

        if (!cancelled) {
          setHasProfile(true);
        }
      } catch (err) {
        if (!cancelled) {
          if (err instanceof ApiRequestError && err.status === 404) {
            setHasProfile(false);
          } else {
            console.error("Failed to check profile:", err);
            setHasProfile(false);
          }
        }
      } finally {
        if (!cancelled) {
          setProfileChecked(true);
        }
      }
    }

    setProfileChecked(false);
    void checkProfile();

    return () => {
      cancelled = true;
    };
  }, [userId, location.pathname]);

  if (authLoading || !profileChecked) {
    return <div style={{ padding: 40 }}>Loading…</div>;
  }

  if (!userId) {
    return <Navigate to="/login" replace />;
  }

  if (!hasProfile && location.pathname !== "/onboarding") {
    return <Navigate to="/onboarding" replace />;
  }

  return <Outlet />;
}
