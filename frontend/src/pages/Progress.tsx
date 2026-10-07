import { useEffect, useMemo, useState } from "react";
import {
  Card,
  PageHeader,
  LoadingSkeleton,
  EmptyState,
} from "../components";
import { api } from "../api/client";
import type { DailyLog } from "../types/api";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import "./Progress.css";

export default function Progress() {
  const [logs, setLogs] = useState<DailyLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .getLogs("30d")
      .then((r) => setLogs(r.logs ?? []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const workouts = useMemo(
    () => logs.filter((x) => x.workoutText?.trim()).length,
    [logs],
  );

  const meals = useMemo(
    () => logs.filter((x) => x.mealsText?.trim()).length,
    [logs],
  );

  const totalLogs = logs.length;
  const consistencyRate = Math.min(100, Math.round((totalLogs / 30) * 100));
  const fullLogCount = useMemo(
    () => logs.filter((x) => x.workoutText?.trim() && x.mealsText?.trim()).length,
    [logs],
  );

  const chartData = useMemo(() => {
    // Show logs in chronological order (oldest to newest)
    return [...logs].reverse().map((log) => ({
      date: log.date.length >= 10 ? log.date.slice(5) : log.date,
      Workout: log.workoutText?.trim() ? 1 : 0,
      Nutrition: log.mealsText?.trim() ? 1 : 0,
    }));
  }, [logs]);

  const header = (
    <PageHeader
      title="Progress Analytics"
      subtitle="Track your consistency and fitness milestones"
    />
  );

  if (loading) {
    return (
      <div className="fp-progress-page">
        {header}
        <Card>
          <LoadingSkeleton lines={8} />
        </Card>
      </div>
    );
  }

  return (
    <div className="fp-progress-page">
      {header}

      {/* KPI Stats Bar */}
      <section className="fp-progress-stats">
        <article className="fp-progress-stat-card">
          <div className="fp-progress-stat-icon blue">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M12 8v4l3 3m6-3a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" />
            </svg>
          </div>
          <div className="fp-progress-stat-info">
            <span>Check-ins</span>
            <strong>{totalLogs}</strong>
            <small>Last 30 days</small>
          </div>
        </article>

        <article className="fp-progress-stat-card">
          <div className="fp-progress-stat-icon purple">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M6 18h12M6 6h12M9 12h6M3 9v6M21 9v6" />
            </svg>
          </div>
          <div className="fp-progress-stat-info">
            <span>Workouts</span>
            <strong>{workouts}</strong>
            <small>Completed sessions</small>
          </div>
        </article>

        <article className="fp-progress-stat-card">
          <div className="fp-progress-stat-icon orange">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M7 3v8M4 3v5a3 3 0 0 0 6 0V3M7 11v10M17 3v18M14 3v7h6" />
            </svg>
          </div>
          <div className="fp-progress-stat-info">
            <span>Nutrition</span>
            <strong>{meals}</strong>
            <small>Days logged</small>
          </div>
        </article>

        <article className="fp-progress-stat-card">
          <div className="fp-progress-stat-icon green">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          </div>
          <div className="fp-progress-stat-info">
            <span>Consistency</span>
            <strong>{consistencyRate}%</strong>
            <small>30-day rate</small>
          </div>
        </article>
      </section>

      {/* Main Grid: Chart & Breakdown */}
      <div className="fp-progress-grid">
        <section className="fp-progress-card">
          <div className="fp-progress-card-header">
            <div className="fp-progress-card-title">
              <h2>Activity Trend</h2>
            </div>
            <span className="fp-progress-pill">30-Day Activity</span>
          </div>

          {logs.length === 0 ? (
            <EmptyState
              title="No activity recorded"
              message="Start logging your daily activity to visualize your progress."
            />
          ) : (
            <div className="fp-chart-wrapper">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <XAxis
                    dataKey="date"
                    stroke="var(--c-text-muted)"
                    fontSize={10}
                    tickLine={false}
                    axisLine={{ stroke: "var(--c-border-light)" }}
                  />
                  <YAxis
                    stroke="var(--c-text-muted)"
                    fontSize={10}
                    domain={[0, 1]}
                    ticks={[0, 1]}
                    tickLine={false}
                    axisLine={{ stroke: "var(--c-border-light)" }}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "var(--c-surface)",
                      border: "1px solid var(--c-border)",
                      borderRadius: "8px",
                      fontSize: "12px",
                      color: "var(--c-heading)",
                      boxShadow: "var(--shadow-sm)",
                    }}
                  />
                  <Bar dataKey="Workout" fill="var(--c-primary)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Nutrition" fill="var(--c-warning)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </section>

        <section className="fp-progress-card">
          <div className="fp-progress-card-header">
            <div className="fp-progress-card-title">
              <h2>Goal Progress</h2>
            </div>
            <span className="fp-progress-pill">Overview</span>
          </div>

          <div className="fp-progress-breakdown-list">
            <div className="fp-breakdown-item">
              <div className="fp-breakdown-label-row">
                <span>Workout Completion</span>
                <strong>{workouts} / 30 days</strong>
              </div>
              <div className="fp-progress-bar-track">
                <div
                  className="fp-progress-bar-fill blue"
                  style={{ width: `${Math.min(100, (workouts / 30) * 100)}%` }}
                />
              </div>
            </div>

            <div className="fp-breakdown-item">
              <div className="fp-breakdown-label-row">
                <span>Nutrition Logged</span>
                <strong>{meals} / 30 days</strong>
              </div>
              <div className="fp-progress-bar-track">
                <div
                  className="fp-progress-bar-fill orange"
                  style={{ width: `${Math.min(100, (meals / 30) * 100)}%` }}
                />
              </div>
            </div>

            <div className="fp-breakdown-item">
              <div className="fp-breakdown-label-row">
                <span>Full Day Check-ins (Both)</span>
                <strong>{fullLogCount} days</strong>
              </div>
              <div className="fp-progress-bar-track">
                <div
                  className="fp-progress-bar-fill green"
                  style={{ width: `${Math.min(100, (fullLogCount / 30) * 100)}%` }}
                />
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* History Cards */}
      <section className="fp-progress-card">
        <div className="fp-progress-card-header">
          <div className="fp-progress-card-title">
            <h2>Activity History</h2>
          </div>
          <span className="fp-progress-pill">{totalLogs} Check-ins</span>
        </div>

        {logs.length === 0 ? (
          <EmptyState
            title="No progress yet"
            message="Start logging your daily activity."
          />
        ) : (
          <div className="fp-history-grid">
            {logs.map((log) => {
              const hasWorkout = Boolean(log.workoutText?.trim());
              const hasMeals = Boolean(log.mealsText?.trim());

              return (
                <div key={log.date} className="fp-history-item">
                  <div className="fp-history-item-top">
                    <span className="fp-history-date">{log.date}</span>
                    <div className="fp-history-badges">
                      {hasWorkout && <span className="fp-badge-tag workout">Workout</span>}
                      {hasMeals && <span className="fp-badge-tag meals">Meals</span>}
                      {!hasWorkout && !hasMeals && (
                        <span className="fp-badge-tag none">No entries</span>
                      )}
                    </div>
                  </div>

                  <p>
                    {hasWorkout ? "Workout logged" : "No workout logged"} •{" "}
                    {hasMeals ? "Meals logged" : "No meals logged"}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
