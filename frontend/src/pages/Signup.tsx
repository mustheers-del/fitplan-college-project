import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import "./Auth.css";

export default function Signup() {
  const navigate = useNavigate();
  const { signUp, confirmSignUp } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");

  const [step, setStep] = useState<"signup" | "confirm">("signup");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e: FormEvent) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      await signUp(email.trim(), password);
      setStep("confirm");
    } catch (err) {
      console.error(err);
      setError("Could not create the account. Please check your details.");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async (e: FormEvent) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      await confirmSignUp(email.trim(), code.trim());

      navigate("/onboarding");
    } catch (err) {
      console.error(err);
      setError("Invalid verification code. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (step === "confirm") {
    return (
      <main className="auth-page"><section className="auth-visual"><Link className="auth-brand" to="/"><span className="auth-brand-mark">F</span><span>FitPlan</span></Link><div className="auth-visual-copy"><span className="auth-kicker">ONE LAST STEP</span><h2>Your routine starts here.</h2><p>Confirm your email and we’ll help you build a plan that fits your life.</p></div></section><section className="auth-panel"><div className="auth-card"><Link className="auth-back" to="/signup">← Back</Link><h1>Verify your email</h1><p>We sent a verification code to <strong>{email}</strong>.</p><form className="auth-form" onSubmit={handleConfirm}><div className="auth-field"><label htmlFor="code">Verification code</label><input className="auth-check" id="code" type="text" value={code} onChange={(e) => setCode(e.target.value)} placeholder="Enter code" required /></div>{error && <p className="auth-error">{error}</p>}<button className="auth-submit" type="submit" disabled={loading}>{loading ? "Verifying..." : "Verify email"}</button></form><p className="auth-foot">Already verified? <Link className="auth-link" to="/login">Go to login</Link></p></div></section></main>
    );
  }

  return (
    <main className="auth-page"><section className="auth-visual"><Link className="auth-brand" to="/"><span className="auth-brand-mark">F</span><span>FitPlan</span></Link><div className="auth-visual-copy"><span className="auth-kicker">A BETTER WEEK AHEAD</span><h2>Start with where you are.</h2><p>Tell us what matters to you. FitPlan turns it into a thoughtful, achievable rhythm.</p><div className="auth-metrics"><div className="auth-metric"><strong>3 min</strong><span>To get started</span></div><div className="auth-metric"><strong>1:1</strong><span>Personal guidance</span></div></div></div></section><section className="auth-panel"><div className="auth-card"><Link className="auth-back" to="/">← Back to FitPlan</Link><h1>Create your account</h1><p>Set up your FitPlan profile and build momentum.</p><form className="auth-form" onSubmit={handleSignup}><div className="auth-field"><label htmlFor="email">Email address</label><input id="email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required /></div><div className="auth-field"><label htmlFor="password">Password</label><input id="password" type="password" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 8 characters" minLength={8} required /></div>{error && <p className="auth-error">{error}</p>}<button className="auth-submit" type="submit" disabled={loading}>{loading ? "Creating account..." : "Create account"}</button></form><p className="auth-foot">Already have an account? <Link className="auth-link" to="/login">Sign in</Link></p></div></section></main>
  );
}
