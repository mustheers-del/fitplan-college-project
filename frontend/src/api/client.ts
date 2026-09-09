/**
 * Typed API client. OWNER: [E]
 *
 * RULE: no component calls fetch() directly. Everything goes through here.
 * That's how auth headers, error shapes and the base URL stay in one place.
 * A raw fetch() in a component is a BLOCKING review comment.
 */

import { fetchAuthSession } from "aws-amplify/auth";
import type {
  ApiError,
  CoachMessageOut,
  RecipeGenerateOut,
  DailyLog,
  UserProfile,
  WeeklyPlan,
} from "@/types/api";

const BASE_URL = import.meta.env.VITE_API_URL as string;

export class ApiRequestError extends Error {
  constructor(
    public status: number,
    public payload: ApiError,
  ) {
    super(payload.error ?? `Request failed with ${status}`);
    this.name = "ApiRequestError";
  }
}

async function authHeader(): Promise<Record<string, string>> {
  try {
    const session = await fetchAuthSession();
    const token = session.tokens?.idToken?.toString();
    return token ? { Authorization: `Bearer ${token}` } : {};
  } catch {
    return {};
  }
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(await authHeader()),
      ...(init.headers ?? {}),
    },
  });

  if (!res.ok) {
    let payload: ApiError = { error: res.statusText };
    try {
      payload = await res.json();
    } catch {
      /* non-JSON error body — keep the statusText fallback */
    }
    throw new ApiRequestError(res.status, payload);
  }

  return res.status === 204 ? (undefined as T) : ((await res.json()) as T);
}

// ---------------------------------------------------------------- endpoints

export const api = {
  health: () => request<{ status: string; stage: string }>("/health"),

  // --- profile / onboarding  ([B] backend) ---
  onboard: (profile: Partial<UserProfile>) =>
    request<{ profile: UserProfile }>("/onboard", {
      method: "POST",
      body: JSON.stringify(profile),
    }),

  getProfile: () => request<{ profile: UserProfile }>("/profile"),

  updateProfile: (patch: Partial<UserProfile>) =>
    request<{ profile: UserProfile }>("/profile", {
      method: "PATCH",
      body: JSON.stringify(patch),
    }),

  // --- plans  ([B] read, [M] generate) ---
  getPlan: (week?: string) =>
    request<{ plan: WeeklyPlan }>(`/plan${week ? `?week=${week}` : ""}`),

  listPlanWeeks: () => request<{ weeks: string[] }>("/plans"),

  /** Takes ~10s. Always show the generating screen; never a bare spinner. */
  generatePlan: (opts: { force?: boolean; week?: string } = {}) =>
    request<{ plan: WeeklyPlan }>("/plan/generate", {
      method: "POST",
      body: JSON.stringify(opts),
    }),
    
  // --- AI Coach ---
  coachMessage: (message: string) =>
    request<CoachMessageOut>("/coach/message", {
      method: "POST",
      body: JSON.stringify({ message }),
    }),

  // --- Recipes ---
  generateRecipe: (mealName: string, ingredients: string[]) =>
    request<RecipeGenerateOut>("/recipes/generate", {
      method: "POST",
      body: JSON.stringify({ mealName, ingredients }),
    }),

  // --- daily logs  ([C] backend) ---
  logDaily: (entry: {
    date: string;
    workoutText?: string;
    mealsText?: string;
    tags?: string[];
  }) =>
    request<{ log: DailyLog }>("/logs/daily", {
      method: "POST",
      body: JSON.stringify(entry),
    }),

  getLogs: (range = "7d") =>
    request<{ logs: DailyLog[]; range: string }>(`/logs/daily?range=${range}`),
};




