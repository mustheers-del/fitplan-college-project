import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import "./Auth.css";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const { resetPassword, confirmResetPassword } = useAuth();

  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [codeSent, setCodeSent] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSendCode = async (e: FormEvent) => {
    e.preventDefault();

    setError("");
    setMessage("");
    setLoading(true);

    try {
      await resetPassword(email);

      setCodeSent(true);
      setMessage("A verification code has been sent to your email.");
    } catch (err) {
      console.error(err);
      setError("Could not send the verification code. Please check your email.");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: FormEvent) => {
    e.preventDefault();

    setError("");
    setMessage("");

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      await confirmResetPassword(email, code, newPassword);

      setMessage("Password changed successfully. Redirecting to login...");

      setTimeout(() => {
        navigate("/login");
      }, 1500);
    } catch (err) {
      console.error(err);
      setError(
        "Could not reset your password. Please check the code and password requirements.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-page"><section className="auth-visual"><Link className="auth-brand" to="/"><span className="auth-brand-mark">F</span><span>FitPlan</span></Link><div className="auth-visual-copy"><span className="auth-kicker">ACCOUNT ACCESS</span><h2>Back to your best rhythm.</h2><p>Reset your password securely, then pick up right where you left off.</p></div></section><section className="auth-panel"><div className="auth-card"><Link className="auth-back" to="/login">← Back to login</Link><h1>{codeSent ? "Choose a new password" : "Reset your password"}</h1><p>{codeSent ? <>Enter the code sent to <strong>{email}</strong>.</> : "Enter your email and we’ll send a verification code."}</p>{!codeSent ? <form className="auth-form" onSubmit={handleSendCode}><div className="auth-field"><label htmlFor="email">Email address</label><input id="email" type="email" value={email} onChange={(e)=>setEmail(e.target.value)} placeholder="you@example.com" required /></div>{error && <p className="auth-error">{error}</p>}{message && <p className="auth-message">{message}</p>}<button className="auth-submit" type="submit" disabled={loading}>{loading ? "Sending..." : "Send verification code"}</button></form> : <form className="auth-form" onSubmit={handleResetPassword}><div className="auth-field"><label htmlFor="code">Verification code</label><input className="auth-check" id="code" value={code} onChange={(e)=>setCode(e.target.value)} placeholder="Enter code" required /></div><div className="auth-field"><label htmlFor="newPassword">New password</label><input id="newPassword" type="password" value={newPassword} onChange={(e)=>setNewPassword(e.target.value)} placeholder="New password" required /></div><div className="auth-field"><label htmlFor="confirmPassword">Confirm password</label><input id="confirmPassword" type="password" value={confirmPassword} onChange={(e)=>setConfirmPassword(e.target.value)} placeholder="Confirm new password" required /></div>{error && <p className="auth-error">{error}</p>}{message && <p className="auth-message">{message}</p>}<button className="auth-submit" type="submit" disabled={loading}>{loading ? "Changing password..." : "Change password"}</button></form>}<p className="auth-foot">Remember your password? <Link className="auth-link" to="/login">Sign in</Link></p></div></section></main>
  );
}