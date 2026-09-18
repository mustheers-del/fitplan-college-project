import { FormEvent, useState } from "react";
import { useAuth } from "../auth/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import "./Auth.css";

export default function Login() {
  const navigate = useNavigate();
  const { signIn, signOut, userId, loading: authLoading } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  if (!authLoading && userId) {
    return (
      <main className="auth-page"><section className="auth-visual"><Link className="auth-brand" to="/"><span className="auth-brand-mark">F</span><span>FitPlan</span></Link><div className="auth-visual-copy"><span className="auth-kicker">SESSION ACTIVE</span><h2>You’re already in.</h2><p>Sign out below if you’d like to switch to another FitPlan account.</p></div></section><section className="auth-panel"><div className="auth-card"><h1>Already signed in</h1><p>Your FitPlan session is active on this device.</p><button className="auth-submit" type="button" onClick={async () => { await signOut(); window.location.reload(); }}>Sign out</button><p className="auth-foot"><Link className="auth-link" to="/dashboard">Return to dashboard</Link></p></div></section></main>
    );
  }
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      await signIn(email, password);
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
      <section className="auth-visual">
        <Link className="auth-brand" to="/"><span className="auth-brand-mark">F</span><span>FitPlan</span></Link>
        <div className="auth-visual-copy"><span className="auth-kicker">YOUR PLAN, IN FOCUS</span><h2>Make consistency feel simple.</h2><p>A clear, adaptive routine for the days you have — with guidance that meets you where you are.</p><div className="auth-metrics"><div className="auth-metric"><strong>01</strong><span>Personal plan</span></div><div className="auth-metric"><strong>24/7</strong><span>Coach access</span></div></div></div>
      </section>
      <section className="auth-panel"><div className="auth-card">
        <Link className="auth-back" to="/">← Back to FitPlan</Link>
        <h1>Welcome back</h1><p>Sign in to continue your fitness journey.</p>
        <form className="auth-form" onSubmit={handleSubmit}>
           <div className="auth-field"><label htmlFor="email">Email address</label><input id="email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required /></div>
           <div className="auth-field"><label htmlFor="password">Password</label><input id="password" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter your password" required /><div style={{textAlign:"right",marginTop:2}}><Link className="auth-link" to="/forgot-password">Forgot password?</Link></div></div>
          {error && <p className="auth-error">{error}</p>}
          <button className="auth-submit" type="submit" disabled={loading}>{loading ? "Signing in..." : "Sign in"}</button>
        </form>
        <p className="auth-foot">New to FitPlan? <Link className="auth-link" to="/signup">Create an account</Link></p>
      </div></section>
    </main>
  );
}