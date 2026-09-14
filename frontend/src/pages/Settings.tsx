import { useAuth } from "../auth/AuthContext";
import { AppShell, Card, Button, PageHeader } from "../components";
import { useNavigate } from "react-router-dom";

export default function Settings() {
  const navigate = useNavigate();
  const { email, signOut } = useAuth();

  async function handleSignOut() {
    await signOut();
    navigate("/login", { replace: true });
  }

  return (
    <AppShell active="/settings">
      <PageHeader
        title="Settings"
        subtitle="Manage your FitPlan account and security"
      />

      <Card title="Account">
        <div style={{ display: "grid", gap: "var(--space-4)" }}>
          <div>
            <p
              style={{
                margin: 0,
                color: "var(--c-text-muted)",
                fontSize: "14px",
              }}
            >
              Email
            </p>

            <p style={{ marginTop: "var(--space-1)", fontWeight: 600 }}>
              {email || "No email available"}
            </p>
          </div>
        </div>
      </Card>

      <Card title="Security">
        <div style={{ display: "grid", gap: "var(--space-3)" }}>
          <p style={{ margin: 0 }}>
            Forgot your password or want to set a new one?
          </p>

          <div>
            <Button
              variant="secondary"
              onClick={() => navigate("/forgot-password")}
            >
              Change Password
            </Button>
          </div>
        </div>
      </Card>

      <Card title="Session">
        <div>
          <Button variant="danger" onClick={handleSignOut}>
            Sign Out
          </Button>
        </div>
      </Card>
    </AppShell>
  );
}
