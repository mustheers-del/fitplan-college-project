import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import "./ForgotPassword.css";

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
      setError(
        "Could not send the verification code. Please check your email.",
      );
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

      setMessage(
        "Password changed successfully. Redirecting to login...",
      );

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
    <main className="fp-forgot-page">
      <section className="fp-forgot-visual">
        <Link className="fp-forgot-brand" to="/">
          <span className="fp-forgot-brand-mark">F</span>
          <span>FitPlan</span>
        </Link>

        <div className="fp-forgot-visual-copy">
          <span className="fp-forgot-kicker">ACCOUNT RECOVERY</span>
          <h2>Get back to your plan.</h2>
          <p>
            Reset your password securely and continue your fitness journey
            without losing your progress.
          </p>
        </div>

        <div className="fp-forgot-visual-card">
          <span>SECURE ACCESS</span>
          <strong>Your account stays protected.</strong>
          <p>
            We use a verification code to confirm it’s really you before
            changing your password.
          </p>
        </div>
      </section>

      <section className="fp-forgot-panel">
        <div className="fp-forgot-card">
          <Link className="fp-forgot-back" to="/login">
            ? Back to login
          </Link>

          <div className="fp-forgot-step">
            <span>{codeSent ? "STEP 2 OF 2" : "STEP 1 OF 2"}</span>
          </div>

          <div className="fp-forgot-heading">
            <h1>
              {codeSent
                ? "Choose a new password"
                : "Reset your password"}
            </h1>

            <p>
              {codeSent ? (
                <>
                  Enter the verification code sent to{" "}
                  <strong>{email}</strong> and choose a new password.
                </>
              ) : (
                "Enter your email and we’ll send a verification code."
              )}
            </p>
          </div>

          {!codeSent ? (
            <form
              className="fp-forgot-form"
              onSubmit={handleSendCode}
            >
              <label className="fp-forgot-field">
                <span>Email address</span>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                />
              </label>

              {error && (
                <div className="fp-forgot-alert fp-forgot-alert--error">
                  {error}
                </div>
              )}

              {message && (
                <div className="fp-forgot-alert fp-forgot-alert--success">
                  {message}
                </div>
              )}

              <button
                className="fp-forgot-submit"
                type="submit"
                disabled={loading}
              >
                {loading ? "Sending..." : "Send verification code"}
              </button>
            </form>
          ) : (
            <form
              className="fp-forgot-form"
              onSubmit={handleResetPassword}
            >
              <label className="fp-forgot-field">
                <span>Verification code</span>
                <input
                  id="code"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="Enter code"
                  required
                />
              </label>

              <label className="fp-forgot-field">
                <span>New password</span>
                <input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="New password"
                  required
                />
              </label>

              <label className="fp-forgot-field">
                <span>Confirm password</span>
                <input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  required
                />
              </label>

              {error && (
                <div className="fp-forgot-alert fp-forgot-alert--error">
                  {error}
                </div>
              )}

              {message && (
                <div className="fp-forgot-alert fp-forgot-alert--success">
                  {message}
                </div>
              )}

              <button
                className="fp-forgot-submit"
                type="submit"
                disabled={loading}
              >
                {loading
                  ? "Changing password..."
                  : "Change password"}
              </button>
            </form>
          )}

          <div className="fp-forgot-security-note">
            <span className="fp-forgot-security-icon">?</span>
            <div>
              <strong>Secure password recovery</strong>
              <p>
                Your password is updated only after the verification
                code is confirmed.
              </p>
            </div>
          </div>

          <p className="fp-forgot-foot">
            Remember your password?{" "}
            <Link to="/login">Sign in</Link>
          </p>
        </div>
      </section>
    </main>
  );
}
