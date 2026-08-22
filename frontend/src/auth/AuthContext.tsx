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
  confirmSignUp as amplifyConfirmSignUp,
  autoSignIn as amplifyAutoSignIn,
  signOut as amplifySignOut,
  resetPassword as amplifyResetPassword,
  confirmResetPassword as amplifyConfirmResetPassword,
} from "aws-amplify/auth";

type AuthState = {
  userId: string | null;
  email: string | null;
  loading: boolean;

  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  confirmSignUp: (email: string, code: string) => Promise<void>;

  resetPassword: (email: string) => Promise<void>;
  confirmResetPassword: (
    email: string,
    code: string,
    newPassword: string,
  ) => Promise<void>;

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

  const signUp = useCallback(
    async (email: string, password: string) => {
      const result = await amplifySignUp({
        username: email,
        password,
        options: {
          userAttributes: {
            email,
          },
          autoSignIn: {
            enabled: true,
          },
        },
      });

      if (result.isSignUpComplete) {
        await refresh();
      }
    },
    [refresh],
  );

  const confirmSignUp = useCallback(
    async (email: string, code: string) => {
      const result = await amplifyConfirmSignUp({
        username: email,
        confirmationCode: code,
      });

      if (result.isSignUpComplete) {
        try {
          const autoSignInResult = await amplifyAutoSignIn();

          if (autoSignInResult.isSignedIn) {
            await refresh();
          }
        } catch {
          // Account is confirmed.
        }
      }
    },
    [refresh],
  );

  // -----------------------------------------
  // Forgot password
  // -----------------------------------------

  const resetPassword = useCallback(async (email: string) => {
    await amplifyResetPassword({
      username: email,
    });
  }, []);

  const confirmResetPassword = useCallback(
    async (email: string, code: string, newPassword: string) => {
      await amplifyConfirmResetPassword({
        username: email,
        confirmationCode: code,
        newPassword,
      });
    },
    [],
  );

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
        confirmSignUp,
        resetPassword,
        confirmResetPassword,
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