"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Bebas_Neue, Poppins } from "next/font/google";
import logo from "@/public/logo.png";

const apiBaseUrl = "/api";

const cardDisplayFont = Bebas_Neue({
  subsets: ["latin"],
  weight: "400",
});

const mainFont = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "900"],
});

type User = {
  id: number;
  name: string;
  email: string;
};

type FormData = {
  mainGoal: string;
  age: string;
  heightValue: string;
  heightUnit: "cm" | "feet";
  gender: string;
  weightValue: string;
  weightUnit: "kg" | "lbs";
  budgetAmount: string;
  budgetCadence: "weekly" | "monthly";
  activityLevel: string;
  weightLossTargetValue: string;
  weightLossTargetUnit: "kg" | "lbs";
  weightLossDurationValue: string;
  weightLossDurationUnit: "weeks" | "months";
  dietaryRestrictions: string;
  additionalNote: string;
  fullName: string;
  email: string;
};

type EquationKey = "mifflin" | "harris";

export default function PreferencesPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentStep, setCurrentStep] = useState(0);
  const [stepError, setStepError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  const [selectedEquation, setSelectedEquation] = useState<EquationKey>("mifflin");
  const [formData, setFormData] = useState<FormData>({
    mainGoal: "",
    age: "",
    heightValue: "",
    heightUnit: "cm",
    gender: "",
    weightValue: "",
    weightUnit: "kg",
    budgetAmount: "",
    budgetCadence: "weekly",
    activityLevel: "",
    weightLossTargetValue: "",
    weightLossTargetUnit: "kg",
    weightLossDurationValue: "",
    weightLossDurationUnit: "weeks",
    dietaryRestrictions: "",
    additionalNote: "",
    fullName: "",
    email: "",
  });

  const steps = useMemo(
    () => [
      "Start Journey",
      "Crew Info",
      "Activity Level",
      "Calorie Intake",
      "Nutrition Preferences",
      "Profile Review",
    ],
    []
  );

  const sideComments = useMemo(
    () => [
      {
        id: 1,
        author: "Sophie, 26",
        role: "Busy student",
        rating: "★★★★★",
        text: "This completely changed the way I plan my meals. It feels like the app already understands me.",
        side: "left",
      },
      {
        id: 2,
        author: "Ethan, 31",
        role: "Fitness coach",
        rating: "★★★★★",
        text: "Finally an onboarding flow that feels premium and genuinely helpful instead of overwhelming.",
        side: "right",
      },
      {
        id: 3,
        author: "Camille, 29",
        role: "Young professional",
        rating: "★★★★★",
        text: "I loved how simple it was. In less than two minutes I felt like everything was tailored to my goals.",
        side: "left",
      },
      {
        id: 4,
        author: "Lucas, 34",
        role: "Dad of two",
        rating: "★★★★★",
        text: "The best part is how calm and clear it feels. It gives you confidence right from the start.",
        side: "right",
      },
    ],
    []
  );

  const progress = ((currentStep + 1) / steps.length) * 100;

  const activityLevelOptions = useMemo(
    () => [
      "little to no exercise",
      "light exercise 1-3 times per week",
      "moderate exercise 3-5 times per week",
      "heavy physical exercise 5-6 times per week",
      "heavy physical exercise 6-7 times per week",
    ],
    []
  );

  const calorieData = useMemo(() => {
    const age = Number.parseFloat(formData.age);
    const heightInput = Number.parseFloat(formData.heightValue);
    const weightInput = Number.parseFloat(formData.weightValue);

    if (
      Number.isNaN(age) ||
      Number.isNaN(heightInput) ||
      Number.isNaN(weightInput) ||
      !formData.gender ||
      !formData.activityLevel
    ) {
      return null;
    }

    const heightCm = formData.heightUnit === "cm" ? heightInput : heightInput * 30.48;
    const weightKg = formData.weightUnit === "kg" ? weightInput : weightInput * 0.45359237;
    const activityMultiplierMap: Record<string, number> = {
      "little to no exercise": 1.2,
      "light exercise 1-3 times per week": 1.375,
      "moderate exercise 3-5 times per week": 1.55,
      "heavy physical exercise 5-6 times per week": 1.725,
      "heavy physical exercise 6-7 times per week": 1.9,
    };
    const activityMultiplier = activityMultiplierMap[formData.activityLevel] ?? 1.2;
    const normalizedGender = formData.gender.toLowerCase();

    const mifflinBmr =
      normalizedGender === "male"
        ? 10 * weightKg + 6.25 * heightCm - 5 * age + 5
        : normalizedGender === "female"
          ? 10 * weightKg + 6.25 * heightCm - 5 * age - 161
          : 10 * weightKg + 6.25 * heightCm - 5 * age - 78;

    const harrisBmr =
      normalizedGender === "male"
        ? 13.397 * weightKg + 4.799 * heightCm - 5.677 * age + 88.362
        : normalizedGender === "female"
          ? 9.247 * weightKg + 3.098 * heightCm - 4.33 * age + 447.593
          : 11.322 * weightKg + 3.9485 * heightCm - 5.0035 * age + 267.9775;

    return {
      equations: {
        mifflin: {
          label: "Mifflin-St Jeor",
          description: "Generally the most accurate BMR estimate for most people.",
          bmr: Math.round(mifflinBmr),
          intake: Math.round(mifflinBmr * activityMultiplier),
        },
        harris: {
          label: "Revised Harris-Benedict",
          description: "Best for: Very lean individuals or highly active athletes.",
          bmr: Math.round(harrisBmr),
          intake: Math.round(harrisBmr * activityMultiplier),
        },
      },
      katchNote: "Katch-McArdle needs body fat percentage, so it is not available yet in this step.",
      midpointGender: normalizedGender !== "male" && normalizedGender !== "female",
    };
  }, [formData]);

  const weightLossProjection = useMemo(() => {
    if (formData.mainGoal !== "Lose Weight" || !calorieData) {
      return null;
    }

    const targetValue = Number.parseFloat(formData.weightLossTargetValue);
    const durationValue = Number.parseFloat(formData.weightLossDurationValue);

    if (Number.isNaN(targetValue) || Number.isNaN(durationValue) || targetValue <= 0 || durationValue <= 0) {
      return null;
    }

    const targetKg = formData.weightLossTargetUnit === "kg" ? targetValue : targetValue * 0.45359237;
    const durationDays = formData.weightLossDurationUnit === "weeks" ? durationValue * 7 : durationValue * 30;

    if (durationDays <= 0) {
      return null;
    }

    const totalDeficit = targetKg * 7700;
    const dailyDeficit = totalDeficit / durationDays;
    const baselineIntake = calorieData.equations[selectedEquation].intake;
    const expectedIntake = Math.max(Math.round(baselineIntake - dailyDeficit), 1200);

    return {
      targetKg,
      durationDays,
      totalDeficit: Math.round(totalDeficit),
      dailyDeficit: Math.round(dailyDeficit),
      expectedIntake,
    };
  }, [calorieData, formData.mainGoal, formData.weightLossDurationUnit, formData.weightLossDurationValue, formData.weightLossTargetUnit, formData.weightLossTargetValue, selectedEquation]);

  const profilePayload = useMemo(
    () => ({
      ...formData,
      selectedEquation,
      calculatedIntake: calorieData ? calorieData.equations[selectedEquation].intake : null,
      expectedCalorieIntake: weightLossProjection ? weightLossProjection.expectedIntake : null,
      savedAt: new Date().toISOString(),
    }),
    [calorieData, formData, selectedEquation, weightLossProjection]
  );

  useEffect(() => {
    async function loadUser() {
      try {
        const response = await fetch(`${apiBaseUrl}/auth/me`, {
          method: "GET",
          credentials: "include",
        });

        if (!response.ok) {
          router.replace("/login");
          return;
        }

        const data = await response.json();
        setUser(data.user);
        setFormData((current) => ({
          ...current,
          fullName: data.user.name || "",
          email: data.user.email || "",
        }));
      } catch (_error) {
        setError("Unable to load user profile.");
      } finally {
        setIsLoading(false);
      }
    }

    loadUser();
  }, [router]);

  async function handleLogout() {
    await fetch(`${apiBaseUrl}/auth/logout`, {
      method: "POST",
      credentials: "include",
    });

    router.push("/login");
  }

  async function handleSavePreferences() {
    setIsSaving(true);
    setSaveMessage("");

    try {
      if (typeof window !== "undefined") {
        sessionStorage.setItem("wesupply_profile_payload", JSON.stringify(profilePayload));
      }

      setSaveMessage("Profile ready. Redirecting...");
      router.push("/preferences/render-plan");
    } finally {
      setIsSaving(false);
    }
  }

  function updateField<K extends keyof FormData>(field: K, value: FormData[K]) {
    setFormData((current) => ({ ...current, [field]: value }));
  }

  function handleNextStep() {
    setStepError("");

    if (currentStep === 0 && !formData.mainGoal) {
      setStepError("Please select your main goal to continue.");
      return;
    }

    if (
      currentStep === 1 &&
      (!formData.age ||
        !formData.heightValue ||
        !formData.gender ||
        !formData.weightValue ||
        !formData.budgetAmount)
    ) {
      setStepError("Please complete all crew member information fields to continue.");
      return;
    }

    if (currentStep === 2 && !formData.activityLevel) {
      setStepError("Please select your activity level to continue.");
      return;
    }

    if (
      currentStep === 4 &&
      formData.mainGoal === "Lose Weight" &&
      (!formData.weightLossTargetValue || !formData.weightLossDurationValue)
    ) {
      setStepError("Please enter how much weight you want to lose and in how much time.");
      return;
    }

    if (currentStep < steps.length - 1) {
      setCurrentStep((current) => current + 1);
    }
  }

  function handlePreviousStep() {
    setStepError("");

    if (currentStep > 0) {
      setCurrentStep((current) => current - 1);
    }
  }

  function renderStepContent() {
    if (currentStep === 0) {
      return (
        <div className="space-y-6">
          <div className="space-y-4 text-center text-gray-800">
            <p className="text-lg font-medium leading-8 text-gray-700">
             Welcome to the captain’s seat! This isn’t just a diet; it’s a custom-mapped expedition toward your best self. To ensure we chart the perfect course for your tastes and goals, let’s begin your data personalization.
            </p>
          </div>

          <div>
            <p className="mb-3 block text-center text-xl font-bold text-gray-900">First step: select your boat !</p>
            <div className="grid gap-3 sm:grid-cols-3">
              {[
                {
                  title: "Lose Weight",
                  subtitle: "Reduce body fat with balanced meals.",
                },
                {
                  title: "Maintain Weight",
                  subtitle: "Keep your current shape with consistency.",
                },
                {
                  title: "Build Muscle",
                  subtitle: "Increase protein focus and recovery.",
                },
              ].map((goal) => {
                const isSelected = formData.mainGoal === goal.title;

                return (
                  <button
                    key={goal.title}
                    type="button"
                    aria-pressed={isSelected}
                    onClick={() => updateField("mainGoal", goal.title)}
                    className={`goal-card rounded-xl px-4 py-4 text-left transition ${
                      isSelected
                        ? "goal-card-selected bg-white/85"
                        : "border border-white/70 bg-white/55 hover:bg-white/72"
                    }`}
                  >
                    <span className={`${cardDisplayFont.className} mb-1 block text-[1.45rem] leading-none tracking-[0.02em] text-gray-900`}>
                      {goal.title}
                    </span>
                    <span className={`${cardDisplayFont.className} block text-[0.95rem] tracking-[0.015em] text-gray-600`}>
                      {goal.subtitle}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      );
    }

    if (currentStep === 1) {
      return (
        <div className="space-y-5">
          <div className="rounded-2xl border border-white/70 bg-white/45 p-4 backdrop-blur-md">
            <h2 className="text-xl font-bold text-gray-900">Crew Member Information</h2>
            <p className="mt-1 text-sm text-gray-600">This information helps us build your personalized plan with better precision.</p>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700" htmlFor="age">
                Age
              </label>
              <input
                id="age"
                value={formData.age}
                onChange={(event) => updateField("age", event.target.value)}
                type="number"
                min="1"
                className="w-full rounded-xl border border-white/70 bg-white/55 px-4 py-3 text-gray-900 outline-none backdrop-blur-md transition focus:border-gray-400 focus:bg-white/72"
                placeholder="25"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700" htmlFor="gender">
                Gender
              </label>
              <select
                id="gender"
                value={formData.gender}
                onChange={(event) => updateField("gender", event.target.value)}
                className="w-full rounded-xl border border-white/70 bg-white/55 px-4 py-3 text-gray-900 outline-none backdrop-blur-md transition focus:border-gray-400 focus:bg-white/72"
              >
                <option value="">Select gender...</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Non-binary">Non-binary</option>
                <option value="Prefer not to say">Prefer not to say</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700" htmlFor="heightValue">
                Height
              </label>
              <div className="flex gap-2">
                <input
                  id="heightValue"
                  value={formData.heightValue}
                  onChange={(event) => updateField("heightValue", event.target.value)}
                  type="number"
                  min="1"
                  className="w-full rounded-xl border border-white/70 bg-white/55 px-4 py-3 text-gray-900 outline-none backdrop-blur-md transition focus:border-gray-400 focus:bg-white/72"
                  placeholder={formData.heightUnit === "cm" ? "175" : "5.9"}
                />
                <select
                  value={formData.heightUnit}
                  onChange={(event) => updateField("heightUnit", event.target.value as "cm" | "feet")}
                  className="rounded-xl border border-white/70 bg-white/55 px-3 py-3 text-gray-900 outline-none backdrop-blur-md transition focus:border-gray-400 focus:bg-white/72"
                >
                  <option value="cm">cm</option>
                  <option value="feet">feet</option>
                </select>
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700" htmlFor="weightValue">
                Weight
              </label>
              <div className="flex gap-2">
                <input
                  id="weightValue"
                  value={formData.weightValue}
                  onChange={(event) => updateField("weightValue", event.target.value)}
                  type="number"
                  min="1"
                  className="w-full rounded-xl border border-white/70 bg-white/55 px-4 py-3 text-gray-900 outline-none backdrop-blur-md transition focus:border-gray-400 focus:bg-white/72"
                  placeholder={formData.weightUnit === "kg" ? "72" : "158"}
                />
                <select
                  value={formData.weightUnit}
                  onChange={(event) => updateField("weightUnit", event.target.value as "kg" | "lbs")}
                  className="rounded-xl border border-white/70 bg-white/55 px-3 py-3 text-gray-900 outline-none backdrop-blur-md transition focus:border-gray-400 focus:bg-white/72"
                >
                  <option value="kg">kg</option>
                  <option value="lbs">lbs</option>
                </select>
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-medium text-gray-700" htmlFor="budgetAmount">
                Budget
              </label>
              <div className="flex gap-2">
                <input
                  id="budgetAmount"
                  value={formData.budgetAmount}
                  onChange={(event) => updateField("budgetAmount", event.target.value)}
                  type="number"
                  min="0"
                  className="w-full rounded-xl border border-white/70 bg-white/55 px-4 py-3 text-gray-900 outline-none backdrop-blur-md transition focus:border-gray-400 focus:bg-white/72"
                  placeholder="75"
                />
                <select
                  value={formData.budgetCadence}
                  onChange={(event) => updateField("budgetCadence", event.target.value as "weekly" | "monthly")}
                  className="rounded-xl border border-white/70 bg-white/55 px-3 py-3 text-gray-900 outline-none backdrop-blur-md transition focus:border-gray-400 focus:bg-white/72"
                >
                  <option value="weekly">weekly</option>
                  <option value="monthly">monthly</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (currentStep === 2) {
      return (
        <div className="space-y-5">
          <div className="rounded-2xl border border-white/70 bg-white/45 p-4 backdrop-blur-md">
            <h2 className="text-xl font-bold text-gray-900">Activity Level</h2>
            <p className="mt-1 text-sm text-gray-600">Choose the option that best matches your daily physical routine.</p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {activityLevelOptions.map((activityLevel) => {
              const isSelected = formData.activityLevel === activityLevel;

              return (
                <button
                  key={activityLevel}
                  type="button"
                  aria-pressed={isSelected}
                  onClick={() => updateField("activityLevel", activityLevel)}
                  className={`goal-card rounded-xl px-4 py-4 text-left transition ${
                    isSelected
                      ? "goal-card-selected bg-white/85"
                      : "border border-white/70 bg-white/55 hover:bg-white/72"
                  }`}
                >
                  <span className={`${cardDisplayFont.className} block text-[1.05rem] leading-tight tracking-[0.02em] text-gray-900`}>
                    {activityLevel}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      );
    }

    if (currentStep === 3) {
      return (
        <div className="space-y-5">
          <div className="rounded-2xl border border-white/70 bg-white/45 p-4 backdrop-blur-md">
            <h2 className="text-xl font-bold text-gray-900">Calculated Calorie Intake</h2>
            <p className="mt-1 text-sm leading-6 text-gray-600">
              We first calculate your basal metabolic rate (BMR), then adjust it using your selected daily activity level.
              For maintain, lose, or gain goals, we are only showing the activity-adjusted intake baseline for now.
            </p>
          </div>

          {calorieData ? (
            <>
              {calorieData.midpointGender ? (
                <div className="rounded-2xl border border-white/70 bg-white/45 p-4 text-sm text-gray-700 backdrop-blur-md">
                  <p className="text-xs leading-5 text-gray-500">
                    Non-binary and undisclosed gender entries use a midpoint estimate between the standard male and female equations.
                  </p>
                </div>
              ) : null}

              <div className="grid gap-4 md:grid-cols-2">
                {(["mifflin", "harris"] as EquationKey[]).map((equationKey) => {
                  const equation = calorieData.equations[equationKey];
                  const isSelected = selectedEquation === equationKey;

                  return (
                    <button
                      key={equationKey}
                      type="button"
                      onClick={() => setSelectedEquation(equationKey)}
                      className={`rounded-2xl border p-5 text-left transition ${
                        isSelected
                          ? "border-emerald-500 bg-emerald-50/80 shadow-[0_10px_30px_rgba(16,185,129,0.12)]"
                          : "border-white/70 bg-white/55 hover:bg-white/72"
                      }`}
                    >
                      <p className="text-lg font-bold text-gray-900">{equation.label}</p>
                      <p className="mt-1 text-sm leading-6 text-gray-600">{equation.description}</p>
                      <div className="mt-4 space-y-2 text-sm text-gray-700">
            
                        <p className="text-3xl font-black text-gray-900">{equation.intake} kcal/day</p>
                      
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50/80 p-4 text-sm text-gray-600">
                <p className="font-semibold text-gray-800">Katch-McArdle Formula</p>
                <p className="mt-1 leading-6">{calorieData.katchNote}</p>
              </div>
            </>
          ) : (
            <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50/80 p-4 text-sm leading-6 text-gray-600">
              Complete the previous crew member information step to unlock your calorie intake calculation.
            </div>
          )}
        </div>
      );
    }

    if (currentStep === 4) {
      return (
        <div className="space-y-5">
          <div className="rounded-2xl border border-white/70 bg-white/45 p-4 backdrop-blur-md">
            <h2 className="text-xl font-bold text-gray-900">Nutrition Preferences</h2>
          
          </div>

          {formData.mainGoal === "Lose Weight" ? (
            <div className="rounded-2xl border border-white/70 bg-white/45 p-4 backdrop-blur-md">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700" htmlFor="weightLossTargetValue">
                    How much do you want to lose?
                  </label>
                  <div className="flex gap-2">
                    <input
                      id="weightLossTargetValue"
                      value={formData.weightLossTargetValue}
                      onChange={(event) => updateField("weightLossTargetValue", event.target.value)}
                      type="number"
                      min="0"
                      className="w-full rounded-xl border border-white/70 bg-white/55 px-4 py-3 text-gray-900 outline-none backdrop-blur-md transition focus:border-gray-400 focus:bg-white/72"
                      placeholder="6"
                    />
                    <select
                      value={formData.weightLossTargetUnit}
                      onChange={(event) => updateField("weightLossTargetUnit", event.target.value as "kg" | "lbs")}
                      className="rounded-xl border border-white/70 bg-white/55 px-3 py-3 text-gray-900 outline-none backdrop-blur-md transition focus:border-gray-400 focus:bg-white/72"
                    >
                      <option value="kg">kg</option>
                      <option value="lbs">lbs</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700" htmlFor="weightLossDurationValue">
                    In how much time?
                  </label>
                  <div className="flex gap-2">
                    <input
                      id="weightLossDurationValue"
                      value={formData.weightLossDurationValue}
                      onChange={(event) => updateField("weightLossDurationValue", event.target.value)}
                      type="number"
                      min="1"
                      className="w-full rounded-xl border border-white/70 bg-white/55 px-4 py-3 text-gray-900 outline-none backdrop-blur-md transition focus:border-gray-400 focus:bg-white/72"
                      placeholder="8"
                    />
                    <select
                      value={formData.weightLossDurationUnit}
                      onChange={(event) => updateField("weightLossDurationUnit", event.target.value as "weeks" | "months")}
                      className="rounded-xl border border-white/70 bg-white/55 px-3 py-3 text-gray-900 outline-none backdrop-blur-md transition focus:border-gray-400 focus:bg-white/72"
                    >
                      <option value="weeks">weeks</option>
                      <option value="months">months</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          ) : null}

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700" htmlFor="dietaryRestrictions">
              Dietary restrictions
            </label>
            <input
              id="dietaryRestrictions"
              value={formData.dietaryRestrictions}
              onChange={(event) => updateField("dietaryRestrictions", event.target.value)}
              className="w-full rounded-xl border border-white/70 bg-white/55 px-4 py-3 text-gray-900 outline-none backdrop-blur-md transition focus:border-gray-400 focus:bg-white/72"
              placeholder="e.g. lactose-free, no pork, gluten-free"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700" htmlFor="additionalNote">
              Additional note (optional)
            </label>
            <textarea
              id="additionalNote"
              value={formData.additionalNote}
              onChange={(event) => updateField("additionalNote", event.target.value)}
              rows={4}
              className="w-full rounded-xl border border-white/70 bg-white/55 px-4 py-3 text-gray-900 outline-none backdrop-blur-md transition focus:border-gray-400 focus:bg-white/72"
              placeholder="Anything else we should know before building your plan (preferred meals, allergies)..."
            />
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-900">Review your profile</h2>
        <div className="grid gap-4 rounded-2xl border border-white/70 bg-white/52 p-5 text-sm text-gray-800 shadow-[inset_0_1px_0_rgba(255,255,255,0.65)] backdrop-blur-md md:grid-cols-2">
          <p>
            <span className="font-semibold">Main Goal:</span> {formData.mainGoal || "Not selected"}
          </p>
          <p>
            <span className="font-semibold">Age:</span> {formData.age || "-"}
          </p>
          <p>
            <span className="font-semibold">Gender:</span> {formData.gender || "-"}
          </p>
          <p>
            <span className="font-semibold">Height:</span> {formData.heightValue ? `${formData.heightValue} ${formData.heightUnit}` : "-"}
          </p>
          <p>
            <span className="font-semibold">Weight:</span> {formData.weightValue ? `${formData.weightValue} ${formData.weightUnit}` : "-"}
          </p>
          <p>
            <span className="font-semibold">Budget:</span> {formData.budgetAmount ? `${formData.budgetAmount} / ${formData.budgetCadence}` : "-"}
          </p>
          <p>
            <span className="font-semibold">Activity Level:</span> {formData.activityLevel || "-"}
          </p>
          <p>
            <span className="font-semibold">Equation:</span> {calorieData ? calorieData.equations[selectedEquation].label : "-"}
          </p>
          <p>
            <span className="font-semibold">Calculated Intake:</span> {calorieData ? `${calorieData.equations[selectedEquation].intake} kcal/day` : "-"}
          </p>
          <p>
            <span className="font-semibold">Dietary Restrictions:</span> {formData.dietaryRestrictions || "-"}
          </p>
          <p>
            <span className="font-semibold">Additional Note:</span> {formData.additionalNote || "-"}
          </p>
          {formData.mainGoal === "Lose Weight" ? (
            <p className="md:col-span-2">
              <span className="font-semibold">Weight Loss Target:</span>{" "}
              {formData.weightLossTargetValue && formData.weightLossDurationValue
                ? `${formData.weightLossTargetValue} ${formData.weightLossTargetUnit} in ${formData.weightLossDurationValue} ${formData.weightLossDurationUnit}`
                : "-"}
            </p>
          ) : null}
          {formData.mainGoal === "Lose Weight" ? (
            <>
              <p>
                <span className="font-semibold">Daily Deficit Needed:</span>{" "}
                {weightLossProjection ? `${weightLossProjection.dailyDeficit} kcal/day` : "-"}
              </p>
              <p>
                <span className="font-semibold">Expected Calorie Intake:</span>{" "}
                {weightLossProjection ? `${weightLossProjection.expectedIntake} kcal/day` : "-"}
              </p>
            </>
          ) : null}
          <p>
            <span className="font-semibold">Full Name:</span> {formData.fullName || "-"}
          </p>
          <p>
            <span className="font-semibold">Email:</span> {formData.email || "-"}
          </p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return <main className="grid min-h-screen place-items-center bg-white text-gray-700">Loading preferences...</main>;
  }

  if (error) {
    return <main className="grid min-h-screen place-items-center bg-white text-red-500">{error}</main>;
  }

  return (
    <main className={`${mainFont.className} relative h-screen overflow-hidden bg-white px-6 py-6 pb-24 text-gray-900`}>

      <header className="relative z-10 flex items-start justify-between">
        <Image src={logo} alt="WeSupply logo" width={94} priority className="h-auto w-auto" />
      </header>

      <section className="relative z-10 flex h-[calc(100%-58px)] items-center justify-center">
        <div className="pointer-events-none absolute inset-0 hidden xl:block">
          <div className="absolute left-10 top-1/2 flex w-72 -translate-y-1/2 flex-col gap-5">
            {sideComments
              .filter((comment) => comment.side === "left")
              .map((comment) => (
                <article
                  key={comment.id}
                  className="comment-card ml-0 rounded-[1.5rem] p-4 text-center text-sm text-gray-700 shadow-[0_18px_45px_rgba(15,23,42,0.08)] even:ml-10"
                  style={{ animationDelay: `${comment.id * 0.7}s` }}
                >
                  <p className="mb-2 text-[0.7rem] font-semibold tracking-[0.28em] text-yellow-500">{comment.rating}</p>
                  <p className="mb-3 text-base font-medium leading-7 text-gray-900">“{comment.text}”</p>
                  <p className="text-xs font-medium uppercase tracking-[0.22em] text-gray-500">{comment.author}</p>
                  <p className="mt-1 text-[0.68rem] uppercase tracking-[0.18em] text-gray-400">{comment.role}</p>
                </article>
              ))}
          </div>

          <div className="absolute right-10 top-1/2 flex w-72 -translate-y-1/2 flex-col gap-5">
            {sideComments
              .filter((comment) => comment.side === "right")
              .map((comment) => (
                <article
                  key={comment.id}
                  className="comment-card mr-0 rounded-[1.5rem] p-4 text-center text-sm text-gray-700 shadow-[0_18px_45px_rgba(15,23,42,0.08)] even:mr-10"
                  style={{ animationDelay: `${comment.id * 0.7}s` }}
                >
                  <p className="mb-2 text-[0.7rem] font-semibold tracking-[0.28em] text-yellow-500">{comment.rating}</p>
                  <p className="mb-3 text-base font-medium leading-7 text-gray-900">“{comment.text}”</p>
                  <p className="text-xs font-medium uppercase tracking-[0.22em] text-gray-500">{comment.author}</p>
                  <p className="mt-1 text-[0.68rem] uppercase tracking-[0.18em] text-gray-400">{comment.role}</p>
                </article>
              ))}
          </div>
        </div>

        <div className="glass-shell flex h-full max-h-[calc(100vh-96px)] w-full max-w-3xl rounded-[2rem] p-px shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
          <div className="glass-panel flex h-full w-full flex-col rounded-[2rem] p-7 md:p-8">
            <div className="mb-5 text-center">
              <h1 className="text-6xl font-black tracking-tight text-gray-900">Preference Setup</h1>
              <p className="mt-2 text-base font-medium text-gray-500">Build your personalized plan in a few guided steps.</p>
            </div>

            <div className="flex-1 overflow-y-auto pr-1">{renderStepContent()}</div>

            <div className="mt-5 flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handlePreviousStep}
                  disabled={currentStep === 0}
                  className="rounded-xl border border-white/70 bg-white/55 px-5 py-3 text-sm font-semibold text-gray-700 backdrop-blur-md transition hover:bg-white/75 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Back
                </button>

                {currentStep < steps.length - 1 ? (
                  <button
                    type="button"
                    onClick={handleNextStep}
                    className="rounded-xl border border-gray-900 bg-gray-900 px-6 py-3 font-semibold text-white transition hover:bg-gray-800"
                  >
                    Next Step
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleSavePreferences}
                    disabled={isSaving}
                    className="rounded-xl border border-gray-900 bg-gray-900 px-6 py-3 font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {isSaving ? "Saving..." : "Finish Setup"}
                  </button>
                )}
              </div>

              <p className="text-sm text-gray-600">Your progress is saved in this session.</p>
            </div>

            {stepError ? <p className="mt-3 text-sm font-medium text-red-600">{stepError}</p> : null}
            {saveMessage ? <p className="mt-4 text-sm font-medium text-gray-700">{saveMessage}</p> : null}

            <div className="mt-6">
              <div className="h-4 w-full overflow-hidden rounded-full border border-white/70 bg-white/45 backdrop-blur-md">
                <div
                  className="h-full rounded-full bg-gray-900 transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <button
        className="fixed bottom-6 right-6 z-20 cursor-pointer rounded-xl border border-white/70 bg-white/70 px-5 py-3 font-semibold text-gray-800 shadow-sm backdrop-blur-md transition hover:-translate-y-0.5 hover:bg-white"
        type="button"
        onClick={handleLogout}
      >
        Logout
      </button>

      <style jsx global>{`
        .glass-shell {
          background: linear-gradient(145deg, rgba(255, 255, 255, 0.95), rgba(226, 232, 240, 0.72));
          box-shadow:
            0 28px 90px rgba(15, 23, 42, 0.12),
            inset 0 1px 0 rgba(255, 255, 255, 0.95);
        }


        .comment-card {
          background: linear-gradient(180deg, rgba(255, 255, 255, 0.72), rgba(255, 255, 255, 0.5));
          backdrop-filter: blur(22px) saturate(135%);
          -webkit-backdrop-filter: blur(22px) saturate(135%);
          border: 1px solid rgba(16, 185, 129, 0.42);
          box-shadow:
            inset 0 1px 0 rgba(255, 255, 255, 0.95),
            0 16px 32px rgba(15, 23, 42, 0.08),
            0 0 0 1px rgba(16, 185, 129, 0.08);
          animation: commentFloat 6.5s ease-in-out infinite;
        }

        .goal-card {
          position: relative;
          overflow: hidden;
          min-height: 124px;
          padding: 1.1rem 1rem;
        }

        .goal-card-selected {
          border: 2px solid rgba(16, 185, 129, 0.55);
          box-shadow: 0 8px 22px rgba(16, 185, 129, 0.14);
        }

        @keyframes commentFloat {
          0% {
            transform: translateY(0px);
          }

          50% {
            transform: translateY(-12px);
          }

          100% {
            transform: translateY(0px);
          }
        }

        .glass-panel {
          background: linear-gradient(180deg, rgba(255, 255, 255, 0.68), rgba(255, 255, 255, 0.5));
          backdrop-filter: blur(26px) saturate(135%);
          -webkit-backdrop-filter: blur(26px) saturate(135%);
          border: 1px solid rgba(255, 255, 255, 0.8);
          box-shadow:
            inset 0 1px 0 rgba(255, 255, 255, 0.92),
            inset 0 -1px 0 rgba(255, 255, 255, 0.28);
        }
      `}</style>
    </main>
  );
}
