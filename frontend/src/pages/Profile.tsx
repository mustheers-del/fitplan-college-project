import { useEffect, useState } from "react";
import {
  AppShell,
  Card,
  Button,
  PageHeader,
  LoadingSkeleton,
} from "../components";
import { api } from "../api/client";
import type { UserProfile } from "../types/api";

export default function Profile() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function loadProfile() {
      try {
        setIsLoading(true);
        const response = await api.getProfile();
        setProfile(response.profile);
      } catch (err) {
        console.error("Failed to load profile:", err);
        setMessage("Unable to load your profile.");
      } finally {
        setIsLoading(false);
      }
    }

    loadProfile();
  }, []);

  async function handleSave() {
    if (!profile) return;

    try {
      setIsSaving(true);
      setMessage("");

      const response = await api.updateProfile(profile);
      setProfile(response.profile);
      setMessage("Profile updated successfully.");
    } catch (err) {
      console.error("Failed to update profile:", err);
      setMessage("Could not update your profile.");
    } finally {
      setIsSaving(false);
    }
  }

  function updateField<K extends keyof UserProfile>(
    field: K,
    value: UserProfile[K],
  ) {
    setProfile((current) =>
      current ? { ...current, [field]: value } : current,
    );
  }

  if (isLoading) {
    return (
      <AppShell active="/profile">
        <PageHeader
          title="Profile"
          subtitle="View and update your fitness preferences"
        />
        <Card>
          <LoadingSkeleton lines={8} />
        </Card>
      </AppShell>
    );
  }

  if (!profile) {
    return (
      <AppShell active="/profile">
        <PageHeader title="Profile" />
        <Card>
          <p style={{ color: "var(--c-danger)" }}>
            {message || "Unable to load your profile."}
          </p>
        </Card>
      </AppShell>
    );
  }

  return (
    <AppShell active="/profile">
      <PageHeader
        title="Profile"
        subtitle="View and update your fitness preferences"
      />

      <Card title="Personal Information">
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)",
            gap: "var(--space-4)",
          }}
        >
          <label>
            Age
            <input
              type="number"
              value={profile.age}
              onChange={(e) =>
                updateField("age", Number(e.target.value))
              }
              style={{ width: "100%", marginTop: "var(--space-2)" }}
            />
          </label>

          <label>
            Sex
            <select
              value={profile.sex}
              onChange={(e) =>
                updateField("sex", e.target.value as UserProfile["sex"])
              }
              style={{ width: "100%", marginTop: "var(--space-2)" }}
            >
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </label>

          <label>
            Height (cm)
            <input
              type="number"
              value={profile.heightCm}
              onChange={(e) =>
                updateField("heightCm", Number(e.target.value))
              }
              style={{ width: "100%", marginTop: "var(--space-2)" }}
            />
          </label>

          <label>
            Weight (kg)
            <input
              type="number"
              value={profile.weightKg}
              onChange={(e) =>
                updateField("weightKg", Number(e.target.value))
              }
              style={{ width: "100%", marginTop: "var(--space-2)" }}
            />
          </label>
        </div>
      </Card>

      <Card title="Fitness Preferences">
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)",
            gap: "var(--space-4)",
          }}
        >
          <label>
            Goal
            <select
              value={profile.goal}
              onChange={(e) =>
                updateField("goal", e.target.value as UserProfile["goal"])
              }
              style={{ width: "100%", marginTop: "var(--space-2)" }}
            >
              <option value="lose_weight">Lose Weight</option>
              <option value="build_muscle">Build Muscle</option>
              <option value="stay_fit">Stay Fit</option>
              <option value="gain_strength">Gain Strength</option>
            </select>
          </label>

          <label>
            Experience
            <select
              value={profile.experience}
              onChange={(e) =>
                updateField(
                  "experience",
                  e.target.value as UserProfile["experience"],
                )
              }
              style={{ width: "100%", marginTop: "var(--space-2)" }}
            >
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </label>

          <label>
            Activity Level
            <select
              value={profile.activityLevel}
              onChange={(e) =>
                updateField(
                  "activityLevel",
                  e.target.value as UserProfile["activityLevel"],
                )
              }
              style={{ width: "100%", marginTop: "var(--space-2)" }}
            >
              <option value="sedentary">Sedentary</option>
              <option value="light">Light</option>
              <option value="moderate">Moderate</option>
              <option value="active">Active</option>
              <option value="very_active">Very Active</option>
            </select>
          </label>

          <label>
            Days Per Week
            <input
              type="number"
              min="1"
              max="7"
              value={profile.daysPerWeek}
              onChange={(e) =>
                updateField("daysPerWeek", Number(e.target.value))
              }
              style={{ width: "100%", marginTop: "var(--space-2)" }}
            />
          </label>
        </div>

        {message && (
          <p
            style={{
              marginTop: "var(--space-4)",
              color: "var(--color-text-muted)",
            }}
          >
            {message}
          </p>
        )}

        <div style={{ marginTop: "var(--space-4)" }}>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </Card>
    </AppShell>
  );
}

