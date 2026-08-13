import { Routes, Route, Navigate } from "react-router-dom";
import AppShell from "./components/AppShell";
import ProtectedRoute from "./auth/ProtectedRoute";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Onboarding from "./pages/Onboarding";
import Dashboard from "./pages/Dashboard";
import WorkoutDetails from "./pages/WorkoutDetails";
import MealPlan from "./pages/MealPlan";
import DailyLogs from "./pages/DailyLogs";
import Progress from "./pages/Progress";

/**
 * Route map. OWNER: [D]
 * Pages themselves are split between [D] (dashboard, workout, progress)
 * and [E] (login, signup, onboarding, logs).
 */
export default function App() {
  return (
    <Routes>
      {/* public */}
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      {/* authenticated */}
      <Route element={<ProtectedRoute />}>
        <Route path="/onboarding" element={<Onboarding />} />

        <Route element={<AppShell />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/workout" element={<WorkoutDetails />} />
          <Route path="/meals" element={<MealPlan />} />
          <Route path="/logs" element={<DailyLogs />} />
          <Route path="/progress" element={<Progress />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
