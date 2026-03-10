"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

const apiBaseUrl = "/api";

type StoredProfile = {
  mainGoal?: string;
  age?: string;
  heightValue?: string;
  heightUnit?: string;
  gender?: string;
  weightValue?: string;
  weightUnit?: string;
  budgetAmount?: string;
  budgetCadence?: string;
  activityLevel?: string;
  dietaryRestrictions?: string;
  additionalNote?: string;
  calculatedIntake?: number | null;
  expectedCalorieIntake?: number | null;
  [key: string]: unknown;
};

export default function RenderPlanPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<StoredProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRendering, setIsRendering] = useState(false);
  const [error, setError] = useState("");
  const [mealPlan, setMealPlan] = useState("");

  useEffect(() => {
    async function loadContext() {
      try {
        const meResponse = await fetch(`${apiBaseUrl}/auth/me`, {
          method: "GET",
          credentials: "include",
        });

        if (!meResponse.ok) {
          router.replace("/login");
          return;
        }

        const raw = typeof window !== "undefined" ? sessionStorage.getItem("wesupply_profile_payload") : null;

        if (!raw) {
          setError("No profile data found. Please complete the setup first.");
          return;
        }

        setProfile(JSON.parse(raw));
      } catch (_error) {
        setError("Unable to load profile context.");
      } finally {
        setIsLoading(false);
      }
    }

    loadContext();
  }, [router]);

  const orbitItems = useMemo(() => {
    if (!profile) {
      return [];
    }

    const candidates = [
      ["Goal", profile.mainGoal],
      ["Age", profile.age],
      ["Height", profile.heightValue && profile.heightUnit ? `${profile.heightValue} ${profile.heightUnit}` : ""],
      ["Weight", profile.weightValue && profile.weightUnit ? `${profile.weightValue} ${profile.weightUnit}` : ""],
      ["Gender", profile.gender],
      ["Activity", profile.activityLevel],
      ["Budget", profile.budgetAmount && profile.budgetCadence ? `${profile.budgetAmount} / ${profile.budgetCadence}` : ""],
      ["Restrictions", profile.dietaryRestrictions],
      ["Intake", profile.calculatedIntake ? `${profile.calculatedIntake} kcal/day` : ""],
      ["Expected", profile.expectedCalorieIntake ? `${profile.expectedCalorieIntake} kcal/day` : ""],
    ] as Array<[string, unknown]>;

    return candidates
      .filter(([, value]) => Boolean(value))
      .slice(0, 10)
      .map(([label, value]) => `${label}: ${String(value)}`);
  }, [profile]);

  async function handleRenderMealPlan() {
    if (!profile) {
      setError("Missing profile data.");
      return;
    }

    setIsRendering(true);
    setError("");

    try {
      const response = await fetch(`${apiBaseUrl}/meal-plan/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ profile }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to render meal plan.");
        return;
      }

      setMealPlan(data.mealPlan || "No meal plan returned.");
    } catch (_error) {
      setError("Unable to reach the server.");
    } finally {
      setIsRendering(false);
    }
  }

  if (isLoading) {
    return <main className="grid min-h-screen place-items-center bg-white text-gray-700">Loading renderer...</main>;
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-white px-6 py-10 text-gray-900">
      <section className="mx-auto flex w-full max-w-6xl flex-col items-center gap-8">
        <h1 className="text-center text-4xl font-black tracking-tight">Render Your Personalized Meal Plan</h1>

        {error ? <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p> : null}

        <div className="relative grid h-[560px] w-full place-items-center overflow-hidden rounded-[2rem] border border-emerald-100 bg-gradient-to-b from-white to-emerald-50/40">
          {orbitItems.map((item, index) => {
            const angle = (360 / Math.max(orbitItems.length, 1)) * index;
            return (
              <div
                key={item}
                className="orbit-item"
                style={{
                  transform: `translate(-50%, -50%) rotate(${angle}deg)`,
                  animationDelay: `${index * -1.3}s`,
                }}
              >
                <div className="orbit-chip">{item}</div>
              </div>
            );
          })}

          <button
            type="button"
            onClick={handleRenderMealPlan}
            disabled={isRendering || !profile}
            className="z-20 rounded-2xl border border-gray-900 bg-gray-900 px-8 py-5 text-lg font-bold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isRendering ? "Rendering..." : "Render Your Personalized Meal Plan"}
          </button>
        </div>

        {mealPlan ? (
          <article className="w-full rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-2xl font-bold">Your Meal Plan</h2>
            <pre className="whitespace-pre-wrap text-sm leading-7 text-gray-700">{mealPlan}</pre>
          </article>
        ) : null}
      </section>

      <style jsx global>{`
        .orbit-item {
          position: absolute;
          left: 50%;
          top: 50%;
          transform-origin: center;
          animation: orbit-spin 16s linear infinite;
        }

        .orbit-chip {
          transform: translateY(-215px);
          max-width: 210px;
          border-radius: 9999px;
          border: 1px solid rgba(16, 185, 129, 0.35);
          background: rgba(255, 255, 255, 0.92);
          padding: 0.5rem 0.8rem;
          font-size: 0.78rem;
          font-weight: 600;
          color: rgb(31 41 55);
          box-shadow: 0 6px 18px rgba(15, 23, 42, 0.08);
          animation: orbit-spin 16s linear infinite reverse;
        }

        @keyframes orbit-spin {
          from {
            transform: translate(-50%, -50%) rotate(0deg);
          }

          to {
            transform: translate(-50%, -50%) rotate(360deg);
          }
        }
      `}</style>
    </main>
  );
}
