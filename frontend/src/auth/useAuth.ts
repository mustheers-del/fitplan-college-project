import { useEffect, useState } from "react";
import { getCurrentUser, signOut as amplifySignOut } from "aws-amplify/auth";

export interface AuthUser {
  userId: string;
  username: string;
}

/**
 * OWNER: [E], Sprint 2.
 *
 * TODO [E]: lift this into a context provider so it isn't re-fetched by
 * every component that needs the user. Fine as a hook for Sprint 2.
 */
export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCurrentUser()
      .then((u) => setUser({ userId: u.userId, username: u.username }))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  const signOut = async () => {
    await amplifySignOut();
    setUser(null);
  };

  return { user, loading, signOut };
}
