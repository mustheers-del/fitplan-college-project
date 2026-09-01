import { useEffect, useState } from "react";
import { Card, PageHeader, LoadingSkeleton, EmptyState } from "../components";
import { api } from "../api/client";
import type { WeeklyPlan } from "../types/api";

export default function MealPlan() {
  const [plan, setPlan] = useState<WeeklyPlan | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getPlan().then(r => setPlan(r.plan)).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return <><PageHeader title="Meal Plan" subtitle="Your personalised nutrition plan" /><Card><LoadingSkeleton lines={8}/></Card></>;

  if (!plan?.mealPlan?.length) return <><PageHeader title="Meal Plan" subtitle="Your personalised nutrition plan"/><Card><EmptyState title="No meal plan yet" message="Generate your plan from Dashboard first."/></Card></>;

  return <>
    <PageHeader title="Meal Plan" subtitle="Your personalised nutrition plan"/>

    <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:"var(--space-4)",marginBottom:"var(--space-6)"}}>
      <Card title="Daily Calories"><h2>{plan.mealPlan[0]?.totalCalories ?? 0}</h2><p>kcal</p></Card>
      <Card title="Daily Protein"><h2>{plan.mealPlan[0]?.totalProteinG ?? 0}g</h2><p>protein</p></Card>
      <Card title="Meals"><h2>{plan.mealPlan[0]?.meals?.length ?? 0}</h2><p>per day</p></Card>
    </div>

    <div style={{display:"grid",gap:"var(--space-5)"}}>
      {plan.mealPlan.map(day => (
        <Card key={day.day} title={`Day ${day.day}`}>
          <p style={{color:"var(--color-text-muted)",marginBottom:"var(--space-4)"}}>
            {day.totalCalories} kcal · {day.totalProteinG}g protein
          </p>

          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:"var(--space-4)"}}>
            {(day.meals ?? []).map((meal,i) => (
              <div key={i} style={{padding:"var(--space-4)",border:"1px solid var(--color-border)",borderRadius:"var(--r-md)"}}>
                <small style={{color:"var(--color-text-muted)",textTransform:"capitalize"}}>{meal.slot}</small>
                <h3 style={{margin:"8px 0"}}>{meal.name}</h3>
                <p style={{color:"var(--color-text-muted)"}}>{meal.calories} kcal · {meal.proteinG}g protein</p>
              </div>
            ))}
          </div>
        </Card>
      ))}
    </div>
  </>;
}
