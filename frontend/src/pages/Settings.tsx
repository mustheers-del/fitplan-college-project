import { AppShell, Card, PageHeader } from "../components";

export default function Settings() {
  return (
    <AppShell active="/settings">
      <PageHeader
        title="Settings"
        subtitle="Manage your FitPlan preferences"
      />

      <Card title="Account">
        <p>Account settings are available here.</p>
      </Card>
    </AppShell>
  );
}

