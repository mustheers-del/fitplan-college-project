import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  Button,
  PageHeader,
  LoadingSkeleton,
} from "../components";
import { api } from "../api/client";
import type { UserProfile } from "../types/api";
import "./Profile.css";

const INJURY_OPTIONS = [
  { value: "knee", label: "Knee" },
  { value: "shoulder", label: "Shoulder" },
  { value: "lower_back", label: "Lower Back" },
];

function formatValue(value: string) {
  return value
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter: string) => letter.toUpperCase());
}

export default function Profile() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function loadProfile() {
      try {
        setIsLoading(true);
        const response = await api.getProfile();
        setProfile({
          ...response.profile,
          injuries: response.profile.injuries ?? [],
        });
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

      try {
        const response = await api.updateProfile(profile);
        setProfile(response.profile);
      } catch (err) {
        console.error("Profile update failed:", err);
        setMessage(
          `Profile update failed: ${
            err instanceof Error ? err.message : String(err)
          }`,
        );
        return;
      }

      setMessage("Profile saved.");
      navigate("/dashboard", { replace: true });
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

  function toggleInjury(injury: string) {
    setProfile((current) => {
      if (!current) return current;

      const injuries = current.injuries ?? [];

      return {
        ...current,
        injuries: injuries.includes(injury)
          ? injuries.filter((item) => item !== injury)
          : [...injuries, injury],
      };
    });
  }

  if (isLoading) {
    return (
      <>
        <PageHeader
          title="Profile"
          subtitle="View and update your fitness preferences"
        />
        <Card>
          <LoadingSkeleton lines={8} />
        </Card>
      </>
    );
  }

  if (!profile) {
    return (
      <>
        <PageHeader title="Profile" />
        <Card>
          <p className="fp-profile-error">
            {message || "Unable to load your profile."}
          </p>
        </Card>
      </>
    );
  }

  return (
    <>
      <PageHeader
        title="Profile"
        subtitle="Manage the details that shape your FitPlan experience"
      />

      <div className="fp-profile-page">
        <section className="fp-profile-overview">
          <Card>
            <div className="fp-profile-summary">
              <div className="fp-profile-avatar" aria-hidden="true">
                {String(profile.sex).charAt(0).toUpperCase()}
              </div>

              <div className="fp-profile-summary-copy">
                <span className="fp-profile-eyebrow">FITNESS PROFILE</span>
                <h2>{formatValue(profile.goal)}</h2>
                <p>
                  {formatValue(profile.experience)} ·{" "}
                  {profile.daysPerWeek} training days per week
                </p>
              </div>

              <div className="fp-profile-summary-tags">
                <span>{profile.age} yrs</span>
                <span>{profile.heightCm} cm</span>
                <span>{profile.weightKg} kg</span>
              </div>
            </div>
          </Card>
        </section>

        <div className="fp-profile-grid">
          <Card title="Personal Information">
            <div className="fp-profile-form-grid">
              <label className="fp-profile-field">
                <span>Age</span>
                <div className="fp-profile-input-wrap">
                  <input
                    type="number"
                    value={profile.age}
                    onChange={(e) =>
                      updateField("age", Number(e.target.value))
                    }
                  />
                  <span className="fp-profile-unit">yrs</span>
                </div>
              </label>

              <label className="fp-profile-field">
                <span>Sex</span>
                <select
                  value={profile.sex}
                  onChange={(e) =>
                    updateField(
                      "sex",
                      e.target.value as UserProfile["sex"],
                    )
                  }
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </label>

              <label className="fp-profile-field">
                <span>Height</span>
                <div className="fp-profile-input-wrap">
                  <input
                    type="number"
                    value={profile.heightCm}
                    onChange={(e) =>
                      updateField(
                        "heightCm",
                        Number(e.target.value),
                      )
                    }
                  />
                  <span className="fp-profile-unit">cm</span>
                </div>
              </label>

              <label className="fp-profile-field">
                <span>Weight</span>
                <div className="fp-profile-input-wrap">
                  <input
                    type="number"
                    value={profile.weightKg}
                    onChange={(e) =>
                      updateField(
                        "weightKg",
                        Number(e.target.value),
                      )
                    }
                  />
                  <span className="fp-profile-unit">kg</span>
                </div>
              </label>
            </div>
          </Card>

          <Card title="Fitness Preferences">
            <div className="fp-profile-form-grid">
              <label className="fp-profile-field">
                <span>Goal</span>
                <select
                  value={profile.goal}
                  onChange={(e) =>
                    updateField(
                      "goal",
                      e.target.value as UserProfile["goal"],
                    )
                  }
                >
                  <option value="lose_weight">Lose Weight</option>
                  <option value="build_muscle">Build Muscle</option>
                  <option value="stay_fit">Stay Fit</option>
                  <option value="gain_strength">Gain Strength</option>
                </select>
              </label>

              <label className="fp-profile-field">
                <span>Experience</span>
                <select
                  value={profile.experience}
                  onChange={(e) =>
                    updateField(
                      "experience",
                      e.target.value as UserProfile["experience"],
                    )
                  }
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </label>

              <label className="fp-profile-field">
                <span>Activity Level</span>
                <select
                  value={profile.activityLevel}
                  onChange={(e) =>
                    updateField(
                      "activityLevel",
                      e.target.value as UserProfile["activityLevel"],
                    )
                  }
                >
                  <option value="sedentary">Sedentary</option>
                  <option value="light">Light</option>
                  <option value="moderate">Moderate</option>
                  <option value="active">Active</option>
                  <option value="very_active">Very Active</option>
                </select>
              </label>

              <label className="fp-profile-field">
                <span>Days Per Week</span>
                <div className="fp-profile-input-wrap">
                  <input
                    type="number"
                    min="1"
                    max="7"
                    value={profile.daysPerWeek}
                    onChange={(e) =>
                      updateField(
                        "daysPerWeek",
                        Number(e.target.value),
                      )
                    }
                  />
                  <span className="fp-profile-unit">days</span>
                </div>
              </label>
            </div>
          </Card>
        </div>

        <Card title="Injury Considerations">
          <div className="fp-profile-injury-grid">
            {INJURY_OPTIONS.map((injury) => {
              const checked = (profile.injuries ?? []).includes(
                injury.value,
              );

              return (
                <label
                  key={injury.value}
                  className={`fp-profile-injury ${
                    checked ? "fp-profile-injury--active" : ""
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleInjury(injury.value)}
                  />

                  <span className="fp-profile-injury-check">
                    {checked ? "?" : ""}
                  </span>

                  <span>{injury.label}</span>
                </label>
              );
            })}
          </div>
        </Card>

        {message && (
          <div className="fp-profile-message" role="status">
            {message}
          </div>
        )}

        <div className="fp-profile-actions">
          <div>
            <strong>Keep your plan accurate</strong>
            <span>
              Changes are used to personalize your fitness plan.
            </span>
          </div>

          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>
    </>
  );
}

