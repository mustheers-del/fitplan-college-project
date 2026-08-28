import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "./AuthContext";
import { api, ApiRequestError } from "../api/client";

export default function ProtectedRoute() {
  const { userId, loading: authLoading } = useAuth();
  const location = useLocation();

  const [profileChecked, setProfileChecked] = useState(false);
  const [hasProfile, setHasProfile] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function checkProfile() {
      if (!userId) {
        if (!cancelled) {
          setHasProfile(false);
          setProfileChecked(true);
        }
        return;
      }

      if (location.pathname === "/onboarding") {
        if (!cancelled) {
          setHasProfile(true);
          setProfileChecked(true);
        }
        return;
      }

      try {
        await api.getProfile();

        if (!cancelled) {
          setHasProfile(true);
          setProfileChecked(true);
        }
      } catch (err) {
        if (cancelled) return;

        if (err instanceof ApiRequestError && err.status === 404) {
          setHasProfile(false);
        } else {
          console.error("Failed to check profile:", err);
          setHasProfile(true);
        }

        setProfileChecked(true);
      }
    }

    setProfileChecked(false);
    void checkProfile();

    return () => {
      cancelled = true;
    };
  }, [userId, location.pathname]);

  if (authLoading || !profileChecked) {
    return <div style={{ padding: 40 }}>Loading...</div>;
  }

  if (!userId) {
    return <Navigate to="/login" replace />;
  }

  if (!hasProfile && location.pathname !== "/onboarding") {
    return <Navigate to="/onboarding" replace />;
  }

  return <Outlet />;
}
