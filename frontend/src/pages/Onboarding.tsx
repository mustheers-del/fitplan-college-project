import { FormEvent, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { api, ApiRequestError } from "../api/client";
import { Button } from "../components";
import "./Onboarding.css";

export default function Onboarding() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    age: "",
    sex: "male",
    heightCm: "",
    weightKg: "",
    goal: "stay_fit",
    activityLevel: "moderate",
    experience: "beginner",
    daysPerWeek: "3",
    equipment: "bodyweight",
    mealPref: "omnivore",
    injuries: [] as string[],
  });

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const update = (field: string, value: string) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const toggleInjury = (injury: string) => {
    setForm((current) => ({
      ...current,
      injuries: current.injuries.includes(injury)
        ? current.injuries.filter((item) => item !== injury)
        : [...current.injuries, injury],
    }));
  };

  const toggleEquipmentItem = (item: string) => {
    const currentItems = form.equipment
      .split(",")
      .map((i) => i.trim())
      .filter(Boolean);

    let nextItems: string[];
    if (currentItems.includes(item)) {
      nextItems = currentItems.filter((i) => i !== item);
    } else {
      nextItems = [...currentItems, item];
    }
    update("equipment", nextItems.join(", "));
  };

  const validateStep = (currentStep: number): boolean => {
    setError("");
    if (currentStep === 1) {
      if (!form.age || Number(form.age) < 13 || Number(form.age) > 100) {
        setError("Please enter a valid age between 13 and 100.");
        return false;
      }
      if (!form.heightCm || Number(form.heightCm) < 100 || Number(form.heightCm) > 250) {
        setError("Please enter a valid height in cm (100 - 250).");
        return false;
      }
      if (!form.weightKg || Number(form.weightKg) < 30 || Number(form.weightKg) > 300) {
        setError("Please enter a valid weight in kg (30 - 300).");
        return false;
      }
    }
    return true;
  };

  const handleNextStep = (e: React.MouseEvent) => {
    e.preventDefault();
    if (validateStep(step)) {
      setStep((prev) => Math.min(prev + 1, 4));
    }
  };

  const handlePrevStep = () => {
    setError("");
    setStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (step < 4) {
      if (validateStep(step)) {
        setStep(step + 1);
      }
      return;
    }

    setError("");
    setLoading(true);

    try {
      await api.onboard({
        age: Number(form.age),
        sex: form.sex as "male" | "female" | "other",
        heightCm: Number(form.heightCm),
        weightKg: Number(form.weightKg),
        goal: form.goal as
          | "lose_weight"
          | "build_muscle"
          | "stay_fit"
          | "gain_strength",
        activityLevel: form.activityLevel as
          | "sedentary"
          | "light"
          | "moderate"
          | "active"
          | "very_active",
        experience: form.experience as "beginner" | "intermediate" | "advanced",
        daysPerWeek: Number(form.daysPerWeek),
        equipment: form.equipment
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),
        mealPref: form.mealPref as
          | "omnivore"
          | "vegetarian"
          | "vegan"
          | "eggetarian"
          | "pescatarian",
        injuries: form.injuries,
      });

      navigate("/dashboard");
    } catch (err) {
      console.error(err);

      if (err instanceof ApiRequestError) {
        setError(err.payload.error ?? `Onboarding failed (${err.status})`);
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Could not save your profile.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Preset options metadata
  const goals = [
    {
      id: "lose_weight",
      label: "Lose Weight",
      desc: "Burn fat & stay lean",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
        </svg>
      ),
    },
    {
      id: "build_muscle",
      label: "Build Muscle",
      desc: "Gain mass & definition",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M6 18h12M6 6h12M9 12h6M3 9v6M21 9v6" />
        </svg>
      ),
    },
    {
      id: "gain_strength",
      label: "Gain Strength",
      desc: "Lift heavier & power up",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
        </svg>
      ),
    },
    {
      id: "stay_fit",
      label: "Stay Fit",
      desc: "Maintain health & stamina",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
        </svg>
      ),
    },
  ];

  const activityLevels = [
    { id: "sedentary", label: "Sedentary", desc: "Desk job, little movement" },
    { id: "light", label: "Light Active", desc: "1-2 light sessions/wk" },
    { id: "moderate", label: "Moderate", desc: "3-4 active workouts/wk" },
    { id: "active", label: "Active", desc: "5+ intense sessions/wk" },
    { id: "very_active", label: "Very Active", desc: "Daily physical labor/training" },
  ];

  const experienceLevels = [
    {
      id: "beginner",
      label: "Beginner",
      desc: "New to structured training (< 6 mos)",
    },
    {
      id: "intermediate",
      label: "Intermediate",
      desc: "Consistent lifter (6 mos - 2 yrs)",
    },
    {
      id: "advanced",
      label: "Advanced",
      desc: "Experienced athlete (2+ yrs)",
    },
  ];

  const mealPrefs = [
    { id: "omnivore", label: "Omnivore", desc: "All food groups & meats" },
    { id: "vegetarian", label: "Vegetarian", desc: "Plant-based + dairy & honey" },
    { id: "vegan", label: "Vegan", desc: "100% plant-based diet" },
    { id: "eggetarian", label: "Eggetarian", desc: "Vegetarian + eggs" },
    { id: "pescatarian", label: "Pescatarian", desc: "Vegetarian + fish & seafood" },
  ];

  const commonEquipment = ["bodyweight", "dumbbells", "barbell", "kettlebell", "bands", "gym_machines"];

  return (
    <main className="onboarding-page">
      <div className="onboarding-container">
        {/* Top Header */}
        <header className="onboarding-header">
          <Link to="/" className="onboarding-brand">
            <span className="onboarding-brand-mark">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M6 18h12M6 6h12M9 12h6M3 9v6M21 9v6" />
              </svg>
            </span>
            <span>FitPlan</span>
          </Link>
          <span className="onboarding-step-counter">STEP {step} OF 4</span>
        </header>

        {/* 4-Step Progress Indicator */}
        <nav className="onboarding-stepper" aria-label="Onboarding Progress">
          <div
            className={`onboarding-step-item ${step === 1 ? "active" : ""} ${
              step > 1 ? "completed" : ""
            }`}
          >
            <span className="onboarding-step-num">
              {step > 1 ? "✓" : "1"}
            </span>
            <span className="onboarding-step-label">Personal</span>
          </div>

          <div
            className={`onboarding-step-item ${step === 2 ? "active" : ""} ${
              step > 2 ? "completed" : ""
            }`}
          >
            <span className="onboarding-step-num">
              {step > 2 ? "✓" : "2"}
            </span>
            <span className="onboarding-step-label">Goal</span>
          </div>

          <div
            className={`onboarding-step-item ${step === 3 ? "active" : ""} ${
              step > 3 ? "completed" : ""
            }`}
          >
            <span className="onboarding-step-num">
              {step > 3 ? "✓" : "3"}
            </span>
            <span className="onboarding-step-label">Experience</span>
          </div>

          <div
            className={`onboarding-step-item ${step === 4 ? "active" : ""} ${
              step > 4 ? "completed" : ""
            }`}
          >
            <span className="onboarding-step-num">4</span>
            <span className="onboarding-step-label">Nutrition</span>
          </div>
        </nav>

        {/* Form Card */}
        <section className="onboarding-card">
          <form className="onboarding-form" onSubmit={handleSubmit}>
            {/* STEP 1: PERSONAL INFO */}
            {step === 1 && (
              <>
                <div className="onboarding-intro">
                  <span className="onboarding-kicker">STEP 1 · PERSONAL METRICS</span>
                  <h1>Tell us about yourself</h1>
                  <p>
                    Your age, height, and weight allow our AI engine to calculate accurate daily caloric burn and base metrics.
                  </p>
                </div>

                <div className="onboarding-grid-2">
                  <div className="onboarding-field">
                    <label htmlFor="ob-age">Age</label>
                    <div className="onboarding-input-wrap">
                      <input
                        id="ob-age"
                        type="number"
                        min="13"
                        max="100"
                        placeholder="e.g. 25"
                        value={form.age}
                        onChange={(e) => update("age", e.target.value)}
                        required
                      />
                      <span className="onboarding-input-unit">yrs</span>
                    </div>
                  </div>

                  <div className="onboarding-field">
                    <label>Sex</label>
                    <div className="onboarding-choice-grid--3" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "6px" }}>
                      {["male", "female", "other"].map((sexVal) => (
                        <div
                          key={sexVal}
                          className={`onboarding-choice-card ${
                            form.sex === sexVal ? "selected" : ""
                          }`}
                          style={{ padding: "8px", minHeight: "44px", justifyContent: "center" }}
                          onClick={() => update("sex", sexVal)}
                        >
                          <strong style={{ textTransform: "capitalize", fontSize: "12px" }}>
                            {sexVal}
                          </strong>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="onboarding-grid-2">
                  <div className="onboarding-field">
                    <label htmlFor="ob-height">Height</label>
                    <div className="onboarding-input-wrap">
                      <input
                        id="ob-height"
                        type="number"
                        min="100"
                        max="250"
                        placeholder="e.g. 175"
                        value={form.heightCm}
                        onChange={(e) => update("heightCm", e.target.value)}
                        required
                      />
                      <span className="onboarding-input-unit">cm</span>
                    </div>
                  </div>

                  <div className="onboarding-field">
                    <label htmlFor="ob-weight">Weight</label>
                    <div className="onboarding-input-wrap">
                      <input
                        id="ob-weight"
                        type="number"
                        min="30"
                        max="300"
                        placeholder="e.g. 70"
                        value={form.weightKg}
                        onChange={(e) => update("weightKg", e.target.value)}
                        required
                      />
                      <span className="onboarding-input-unit">kg</span>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* STEP 2: FITNESS GOALS & FREQUENCY */}
            {step === 2 && (
              <>
                <div className="onboarding-intro">
                  <span className="onboarding-kicker">STEP 2 · GOALS & ROUTINE</span>
                  <h1>What is your main focus?</h1>
                  <p>
                    Select your primary objective and weekly availability so we can build an optimal workout split.
                  </p>
                </div>

                <div className="onboarding-field">
                  <label>Fitness Goal</label>
                  <div className="onboarding-choice-grid">
                    {goals.map((g) => (
                      <div
                        key={g.id}
                        className={`onboarding-choice-card ${
                          form.goal === g.id ? "selected" : ""
                        }`}
                        onClick={() => update("goal", g.id)}
                      >
                        <span className="onboarding-choice-icon">{g.icon}</span>
                        <div className="onboarding-choice-content">
                          <strong>{g.label}</strong>
                          <span>{g.desc}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="onboarding-grid-2">
                  <div className="onboarding-field">
                    <label htmlFor="ob-activity">Activity Level</label>
                    <select
                      id="ob-activity"
                      value={form.activityLevel}
                      onChange={(e) => update("activityLevel", e.target.value)}
                    >
                      {activityLevels.map((act) => (
                        <option key={act.id} value={act.id}>
                          {act.label} — {act.desc}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="onboarding-field">
                    <label>Training Days / Week</label>
                    <div className="onboarding-days-grid">
                      {[1, 2, 3, 4, 5, 6, 7].map((dayNum) => (
                        <button
                          key={dayNum}
                          type="button"
                          className={`onboarding-day-pill ${
                            String(form.daysPerWeek) === String(dayNum) ? "selected" : ""
                          }`}
                          onClick={() => update("daysPerWeek", String(dayNum))}
                        >
                          {dayNum}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* STEP 3: EXPERIENCE & EQUIPMENT */}
            {step === 3 && (
              <>
                <div className="onboarding-intro">
                  <span className="onboarding-kicker">STEP 3 · TRAINING BACKGROUND</span>
                  <h1>Experience & Equipment</h1>
                  <p>
                    We customize exercise selections, weight progressions, and rest intervals based on your background.
                  </p>
                </div>

                <div className="onboarding-field">
                  <label>Experience Level</label>
                  <div className="onboarding-choice-grid--3" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px" }}>
                    {experienceLevels.map((exp) => (
                      <div
                        key={exp.id}
                        className={`onboarding-choice-card ${
                          form.experience === exp.id ? "selected" : ""
                        }`}
                        style={{ flexDirection: "column", alignItems: "flex-start", padding: "12px 10px" }}
                        onClick={() => update("experience", exp.id)}
                      >
                        <strong style={{ fontSize: "13px" }}>{exp.label}</strong>
                        <span style={{ fontSize: "10px", marginTop: "3px" }}>{exp.desc}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="onboarding-field">
                  <label htmlFor="ob-equipment">Available Equipment</label>
                  <input
                    id="ob-equipment"
                    value={form.equipment}
                    onChange={(e) => update("equipment", e.target.value)}
                    placeholder="e.g. bodyweight, dumbbells"
                  />
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginTop: "6px" }}>
                    {commonEquipment.map((eq) => {
                      const isSelected = form.equipment.includes(eq);
                      return (
                        <button
                          key={eq}
                          type="button"
                          onClick={() => toggleEquipmentItem(eq)}
                          style={{
                            padding: "4px 9px",
                            fontSize: "11px",
                            borderRadius: "6px",
                            border: "1px solid",
                            cursor: "pointer",
                            borderColor: isSelected ? "var(--c-primary)" : "var(--c-border)",
                            background: isSelected ? "var(--c-primary-light)" : "var(--c-surface-muted)",
                            color: isSelected ? "var(--c-primary-dark)" : "var(--c-text)",
                            fontWeight: isSelected ? "700" : "500",
                          }}
                        >
                          {isSelected ? "✓ " : "+ "}{eq}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="onboarding-field">
                  <label>Injuries or Joint Concerns (Optional)</label>
                  <div className="onboarding-choice-grid--3" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px" }}>
                    {[
                      { id: "knee", label: "Knee" },
                      { id: "shoulder", label: "Shoulder" },
                      { id: "lower_back", label: "Lower Back" },
                    ].map((inj) => {
                      const isChecked = form.injuries.includes(inj.id);
                      return (
                        <div
                          key={inj.id}
                          className={`onboarding-choice-card ${
                            isChecked ? "selected" : ""
                          }`}
                          style={{ padding: "10px 12px", minHeight: "44px" }}
                          onClick={() => toggleInjury(inj.id)}
                        >
                          <span
                            style={{
                              width: "16px",
                              height: "16px",
                              borderRadius: "4px",
                              border: "1.5px solid",
                              borderColor: isChecked ? "var(--c-primary)" : "var(--c-border)",
                              background: isChecked ? "var(--c-primary)" : "transparent",
                              display: "grid",
                              placeItems: "center",
                              color: "#fff",
                              fontSize: "10px",
                              fontWeight: "bold",
                            }}
                          >
                            {isChecked ? "✓" : ""}
                          </span>
                          <strong>{inj.label}</strong>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </>
            )}

            {/* STEP 4: NUTRITION & FOOD PREFERENCE */}
            {step === 4 && (
              <>
                <div className="onboarding-intro">
                  <span className="onboarding-kicker">STEP 4 · NUTRITION & DIET</span>
                  <h1>Food Preferences</h1>
                  <p>
                    Select your diet style so your meal recommendations align with your lifestyle choices.
                  </p>
                </div>

                <div className="onboarding-field">
                  <label>Dietary Preference</label>
                  <div className="onboarding-choice-grid">
                    {mealPrefs.map((pref) => (
                      <div
                        key={pref.id}
                        className={`onboarding-choice-card ${
                          form.mealPref === pref.id ? "selected" : ""
                        }`}
                        onClick={() => update("mealPref", pref.id)}
                      >
                        <div className="onboarding-choice-content">
                          <strong>{pref.label}</strong>
                          <span>{pref.desc}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Error Display */}
            {error && (
              <div className="onboarding-error" role="alert">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                <span>{error}</span>
              </div>
            )}

            {/* Navigation Actions */}
            <div className="onboarding-actions">
              {step > 1 ? (
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handlePrevStep}
                  disabled={loading}
                >
                  ← Back
                </Button>
              ) : (
                <div />
              )}

              {step < 4 ? (
                <Button
                  type="button"
                  variant="primary"
                  onClick={handleNextStep}
                >
                  Continue →
                </Button>
              ) : (
                <Button
                  type="submit"
                  variant="primary"
                  loading={loading}
                >
                  {loading ? "Creating plan..." : "Complete Setup & Create Plan"}
                </Button>
              )}
            </div>
          </form>
        </section>
      </div>
    </main>
  );
}
