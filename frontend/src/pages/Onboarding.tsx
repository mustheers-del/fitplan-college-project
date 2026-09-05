import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api, ApiRequestError } from "../api/client";

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

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
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

  return (
    <div style={{ padding: "40px", maxWidth: "600px", margin: "0 auto" }}>
      <h1>Tell us about yourself</h1>
      <p>We'll use this information to create your fitness plan.</p>

      <form onSubmit={handleSubmit}>
        <div>
          <label>Age</label>
          <input
            type="number"
            min="13"
            max="100"
            value={form.age}
            onChange={(e) => update("age", e.target.value)}
            required
          />
        </div>

        <div>
          <label>Sex</label>
          <select
            value={form.sex}
            onChange={(e) => update("sex", e.target.value)}
          >
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div>
          <label>Height (cm)</label>
          <input
            type="number"
            min="100"
            max="250"
            value={form.heightCm}
            onChange={(e) => update("heightCm", e.target.value)}
            required
          />
        </div>

        <div>
          <label>Weight (kg)</label>
          <input
            type="number"
            min="30"
            max="300"
            value={form.weightKg}
            onChange={(e) => update("weightKg", e.target.value)}
            required
          />
        </div>

        <div>
          <label>Fitness goal</label>
          <select
            value={form.goal}
            onChange={(e) => update("goal", e.target.value)}
          >
            <option value="lose_weight">Lose weight</option>
            <option value="build_muscle">Build muscle</option>
            <option value="gain_strength">Gain strength</option>
            <option value="stay_fit">Stay fit</option>
          </select>
        </div>

        <div>
          <label>Activity level</label>
          <select
            value={form.activityLevel}
            onChange={(e) => update("activityLevel", e.target.value)}
          >
            <option value="sedentary">Sedentary</option>
            <option value="light">Light</option>
            <option value="moderate">Moderate</option>
            <option value="active">Active</option>
            <option value="very_active">Very active</option>
          </select>
        </div>

        <div>
          <label>Experience</label>
          <select
            value={form.experience}
            onChange={(e) => update("experience", e.target.value)}
          >
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
        </div>

        <div>
          <label>Days per week</label>
          <select
            value={form.daysPerWeek}
            onChange={(e) => update("daysPerWeek", e.target.value)}
          >
            {[1, 2, 3, 4, 5, 6, 7].map((day) => (
              <option key={day} value={day}>
                {day}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label>Equipment</label>
          <input
            value={form.equipment}
            onChange={(e) => update("equipment", e.target.value)}
            placeholder="bodyweight, dumbbells"
          />
          <small>Separate multiple items with commas.</small>
        </div>

        <div>
          <label>Injuries</label>

          <div>
            <label>
              <input
                type="checkbox"
                checked={form.injuries.includes("knee")}
                onChange={() => toggleInjury("knee")}
              />
              Knee
            </label>
          </div>

          <div>
            <label>
              <input
                type="checkbox"
                checked={form.injuries.includes("shoulder")}
                onChange={() => toggleInjury("shoulder")}
              />
              Shoulder
            </label>
          </div>

          <div>
            <label>
              <input
                type="checkbox"
                checked={form.injuries.includes("lower_back")}
                onChange={() => toggleInjury("lower_back")}
              />
              Lower back
            </label>
          </div>
        </div>

        <div>
          <label>Food preference</label>
          <select
            value={form.mealPref}
            onChange={(e) => update("mealPref", e.target.value)}
          >
            <option value="omnivore">Omnivore</option>
            <option value="vegetarian">Vegetarian</option>
            <option value="vegan">Vegan</option>
            <option value="eggetarian">Eggetarian</option>
            <option value="pescatarian">Pescatarian</option>
          </select>
        </div>

        {error && <p style={{ color: "red" }}>{error}</p>}

        <button type="submit" disabled={loading}>
          {loading ? "Saving profile..." : "Save & Continue"}
        </button>
      </form>
    </div>
  );
}
