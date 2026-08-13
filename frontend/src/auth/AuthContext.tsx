import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import {
  getCurrentUser,
  fetchAuthSession,
  signIn as amplifySignIn,
  signUp as amplifySignUp,
  signOut as amplifySignOut,
} from "aws-amplify/auth";

type AuthState = {
  userId: string | null;
  email: string | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  refresh: () => Promise<void>;
};

const AuthContext = createContext<AuthState | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [userId, setUserId] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      await getCurrentUser();

      const session = await fetchAuthSession();
      const claims = session.tokens?.idToken?.payload;

      setUserId((claims?.sub as string) ?? null);
      setEmail((claims?.email as string) ?? null);
    } catch {
      setUserId(null);
      setEmail(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const signIn = useCallback(
    async (email: string, password: string) => {
      await amplifySignIn({
        username: email,
        password,
      });

      await refresh();
    },
    [refresh],
  );

  const signUp = useCallback(async (email: string, password: string) => {
    await amplifySignUp({
      username: email,
      password,
      options: {
        userAttributes: {
          email,
        },
      },
    });
  }, []);

  const signOut = useCallback(async () => {
    await amplifySignOut();
    setUserId(null);
    setEmail(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        userId,
        email,
        loading,
        signIn,
        signUp,
        signOut,
        refresh,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthState {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside <AuthProvider>");
  }

  return context;
}