import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Lock, Mail } from "lucide-react";
import { useAuth } from "../auth/AuthContext";
import "./Auth.css";

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M21.35 12.27c0-.68-.06-1.34-.18-1.97H12v3.73h5.24a4.48 4.48 0 0 1-1.95 2.94v2.45h3.16c1.85-1.7 2.9-4.2 2.9-7.15Z"
      />
      <path
        fill="#34A853"
        d="M12 21.75c2.65 0 4.88-.88 6.5-2.38l-3.16-2.45c-.88.59-2 .94-3.34.94-2.56 0-4.73-1.73-5.51-4.05H3.22v2.53A9.82 9.82 0 0 0 12 21.75Z"
      />
      <path
        fill="#FBBC05"
        d="M6.49 13.81A5.9 5.9 0 0 1 6.18 12c0-.63.11-1.24.31-1.81V7.66H3.22A9.82 9.82 0 0 0 2.25 12c0 1.58.38 3.07.97 4.34l3.27-2.53Z"
      />
      <path
        fill="#EA4335"
        d="M12 6.14c1.44 0 2.74.5 3.76 1.48l2.82-2.82C16.88 3.23 14.65 2.25 12 2.25a9.82 9.82 0 0 0-8.78 5.41l3.27 2.53C7.27 7.87 9.44 6.14 12 6.14Z"
      />
    </svg>
  );
}

export default function Login() {
  const navigate = useNavigate();

  const { signIn, signOut, userId, loading: authLoading } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (!authLoading && userId) {
    return (
      <main className="auth-page">
        <section className="auth-visual">
          <Link className="auth-brand" to="/">
            <span className="auth-brand-mark">F</span>
            <span>FitPlan</span>
          </Link>

          <div className="auth-orb auth-orb-one" />
          <div className="auth-orb auth-orb-two" />
          <div className="auth-orb auth-orb-three" />

          <div className="auth-visual-copy">
            <span className="auth-kicker">SESSION ACTIVE</span>

            <h2>You&apos;re already in.</h2>

            <p>
              Your FitPlan session is active on this device. Sign out below if
              you&apos;d like to switch accounts.
            </p>
          </div>
        </section>

        <section className="auth-panel">
          <div className="auth-card">
            <Link className="auth-back" to="/">
              ← Back to FitPlan
            </Link>

            <div className="auth-heading">
              <h1>Already signed in</h1>
              <p>Your FitPlan session is active on this device.</p>
            </div>

            <button
              className="auth-submit"
              type="button"
              onClick={async () => {
                await signOut();
                window.location.reload();
              }}
            >
              Sign out
            </button>

            <p className="auth-foot">
              <Link className="auth-link" to="/dashboard">
                Return to dashboard
              </Link>
            </p>
          </div>
        </section>
      </main>
    );
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      await signIn(email.trim(), password);
      navigate("/dashboard");
    } catch (err: any) {
      console.error("LOGIN ERROR:", err);

      setError(
        err?.message ||
          err?.name ||
          "Login failed. Please check your email and password.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-page">
      {/* LEFT SIDE */}
      <section className="auth-visual">
        <Link className="auth-brand" to="/">
          <span className="auth-brand-mark">F</span>
          <span>FitPlan</span>
        </Link>

        <div className="auth-orb auth-orb-one" />
        <div className="auth-orb auth-orb-two" />
        <div className="auth-orb auth-orb-three" />

        <div className="auth-visual-copy">
          <span className="auth-kicker">YOUR PLAN, IN FOCUS</span>

          <h2>Make consistency feel simple.</h2>

          <p>
            A clear, adaptive routine for the days you have — with guidance that
            meets you where you are.
          </p>

          <div className="auth-metrics">
            <div className="auth-metric">
              <strong>01</strong>
              <span>Personal plan</span>
            </div>

            <div className="auth-metric">
              <strong>24/7</strong>
              <span>Coach access</span>
            </div>

            <div className="auth-metric">
              <strong>AI</strong>
              <span>Adaptive planning</span>
            </div>
          </div>
        </div>
      </section>

      {/* RIGHT SIDE */}
      <section className="auth-panel">
        <div className="auth-card">
          <Link className="auth-back" to="/">
            ← Back to FitPlan
          </Link>

          <div className="auth-heading">
            <h1>Welcome back</h1>
            <p>Log in to continue your fitness journey.</p>
          </div>

          <form className="auth-form" onSubmit={handleSubmit}>
            {/* EMAIL */}
            <div className="auth-field">
              <label htmlFor="email">Email address</label>

              <div className="auth-input-wrap">
                <Mail className="auth-input-icon" size={18} strokeWidth={1.8} />

                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                />
              </div>
            </div>

            {/* PASSWORD */}
            <div className="auth-field">
              <div className="auth-label-row">
                <label htmlFor="password">Password</label>

                <Link className="auth-link auth-forgot" to="/forgot-password">
                  Forgot password?
                </Link>
              </div>

              <div className="auth-input-wrap">
                <Lock className="auth-input-icon" size={18} strokeWidth={1.8} />

                <input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                />
              </div>
            </div>

            {error && <p className="auth-error">{error}</p>}

            <button className="auth-submit" type="submit" disabled={loading}>
              {loading ? "Logging in..." : "Log in"}
            </button>
          </form>

          {/* GOOGLE BELOW FORM */}
          <div className="auth-divider">
            <span>OR CONTINUE WITH</span>
          </div>

          <button
            className="auth-google-button"
            type="button"
            disabled
            title="Google authentication is not configured yet"
          >
            <GoogleIcon />
            <span>Continue with Google</span>
          </button>

          <p className="auth-foot">
            New to FitPlan?{" "}
            <Link className="auth-link" to="/signup">
              Create an account
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}
