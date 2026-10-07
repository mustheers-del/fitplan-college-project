import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { Card, Button, PageHeader } from "../components";
import "./Settings.css";

export default function Settings() {
  const navigate = useNavigate();
  const { email, signOut } = useAuth();

  async function handleSignOut() {
    await signOut();
    navigate("/login", { replace: true });
  }

  return (
    <>
      <PageHeader
        title="Settings"
        subtitle="Manage your FitPlan account and security"
      />

      <div className="fp-settings-page">
        <section className="fp-settings-overview">
          <Card>
            <div className="fp-settings-overview-content">
              <div className="fp-settings-overview-icon" aria-hidden="true">
                S
              </div>

              <div>
                <span className="fp-settings-eyebrow">
                  ACCOUNT SETTINGS
                </span>
                <h2>Your FitPlan account</h2>
                <p>
                  Review your account details, password options,
                  and active session.
                </p>
              </div>
            </div>
          </Card>
        </section>

        <div className="fp-settings-grid">
          <Card title="Account">
            <div className="fp-settings-card-content">
              <div className="fp-settings-row">
                <div className="fp-settings-row-icon" aria-hidden="true">
                  @
                </div>

                <div className="fp-settings-row-copy">
                  <span className="fp-settings-label">Email address</span>
                  <strong>
                    {email || "No email available"}
                  </strong>
                  <p>
                    This email is associated with your FitPlan account.
                  </p>
                </div>
              </div>
            </div>
          </Card>

          <Card title="Security">
            <div className="fp-settings-card-content">
              <div className="fp-settings-row">
                <div
                  className="fp-settings-row-icon fp-settings-row-icon--security"
                  aria-hidden="true"
                >
                  ?
                </div>

                <div className="fp-settings-row-copy">
                  <span className="fp-settings-label">
                    Password
                  </span>
                  <strong>Manage your password</strong>
                  <p>
                    Forgot your password or want to set a new one?
                  </p>
                </div>
              </div>

              <div className="fp-settings-action">
                <Button
                  variant="secondary"
                  onClick={() => navigate("/forgot-password")}
                >
                  Change Password
                </Button>
              </div>
            </div>
          </Card>
        </div>

        <Card title="Session">
          <div className="fp-settings-session">
            <div>
              <strong>Sign out of FitPlan</strong>
              <p>
                End your current session on this device.
              </p>
            </div>

            <Button
              variant="danger"
              onClick={handleSignOut}
            >
              Sign Out
            </Button>
          </div>
        </Card>
      </div>
    </>
  );
}
