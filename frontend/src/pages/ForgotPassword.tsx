import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

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
    <div
      style={{
        padding: "40px",
        maxWidth: "400px",
        margin: "0 auto",
      }}
    >
      <h1>Forgot Password</h1>

      {!codeSent ? (
        <form onSubmit={handleSendCode}>
          <p>
            Enter your email address and we'll send you a verification code.
          </p>

          <div style={{ marginBottom: "16px" }}>
            <label htmlFor="email">Email</label>

            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              style={{
                display: "block",
                width: "100%",
                padding: "10px",
                marginTop: "6px",
                color: "#111827",
                backgroundColor: "#ffffff",
              }}
            />
          </div>

          {error && (
            <p style={{ color: "red", marginBottom: "16px" }}>{error}</p>
          )}

          {message && (
            <p style={{ color: "green", marginBottom: "16px" }}>{message}</p>
          )}

          <button type="submit" disabled={loading}>
            {loading ? "Sending..." : "Send Verification Code"}
          </button>
        </form>
      ) : (
        <form onSubmit={handleResetPassword}>
          <p>
            Enter the verification code sent to <strong>{email}</strong>.
          </p>

          <div style={{ marginBottom: "16px" }}>
            <label htmlFor="code">Verification Code</label>

            <input
              id="code"
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Enter code"
              required
              style={{
                display: "block",
                width: "100%",
                padding: "10px",
                marginTop: "6px",
                color: "#111827",
                backgroundColor: "#ffffff",
              }}
            />
          </div>

          <div style={{ marginBottom: "16px" }}>
            <label htmlFor="newPassword">New Password</label>

            <input
              id="newPassword"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="New password"
              required
              style={{
                display: "block",
                width: "100%",
                padding: "10px",
                marginTop: "6px",
                color: "#111827",
                backgroundColor: "#ffffff",
              }}
            />
          </div>

          <div style={{ marginBottom: "16px" }}>
            <label htmlFor="confirmPassword">Confirm Password</label>

            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
              required
              style={{
                display: "block",
                width: "100%",
                padding: "10px",
                marginTop: "6px",
                color: "#111827",
                backgroundColor: "#ffffff",
              }}
            />
          </div>

          {error && (
            <p style={{ color: "red", marginBottom: "16px" }}>{error}</p>
          )}

          {message && (
            <p style={{ color: "green", marginBottom: "16px" }}>{message}</p>
          )}

          <button type="submit" disabled={loading}>
            {loading ? "Changing Password..." : "Change Password"}
          </button>
        </form>
      )}

      <p style={{ marginTop: "20px" }}>
        Remember your password? <Link to="/login">Back to Login</Link>
      </p>
    </div>
  );
}