"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Bike, Zap, Recycle, Utensils, Droplet, ChevronRight, ChevronLeft, Sparkles } from "lucide-react";

// ── Onboarding action data ──────────────────────────────────────────────────

const STEPS = [
  {
    key: "TRANSPORT",
    label: "Transport",
    title: "Transportation",
    subtitle: "How you get around",
    color: "bg-blue-500",
    icon: <Bike className="h-5 w-5 text-white" />,
    actions: [
      { actionType: "Biked to work", points: 50 },
      { actionType: "Used public transit", points: 30 },
      { actionType: "Carpooled", points: 25 },
      { actionType: "Walked to work", points: 40 },
      { actionType: "Electric vehicle", points: 35 },
    ],
  },
  {
    key: "ENERGY",
    label: "Energy",
    title: "Energy",
    subtitle: "Conserving power",
    color: "bg-yellow-500",
    icon: <Zap className="h-5 w-5 text-white" />,
    actions: [
      { actionType: "Turned off unused lights", points: 10 },
      { actionType: "Used natural lighting", points: 15 },
      { actionType: "Unplugged devices", points: 12 },
      { actionType: "Adjusted thermostat", points: 20 },
      { actionType: "Used energy-efficient equipment", points: 18 },
    ],
  },
  {
    key: "RECYCLING",
    label: "Waste",
    title: "Waste & Recycling",
    subtitle: "Reducing waste",
    color: "bg-[#0b5d1e]",
    icon: <Recycle className="h-5 w-5 text-white" />,
    actions: [
      { actionType: "Recycled paper", points: 15 },
      { actionType: "Recycled plastic", points: 15 },
      { actionType: "Composted food waste", points: 20 },
      { actionType: "Brought reusable mug", points: 20 },
      { actionType: "Used reusable containers", points: 15 },
    ],
  },
  {
    key: "FOOD",
    label: "Food",
    title: "Food",
    subtitle: "Sustainable eating",
    color: "bg-orange-500",
    icon: <Utensils className="h-5 w-5 text-white" />,
    actions: [
      { actionType: "Ate plant-based meal", points: 30 },
      { actionType: "Bought local produce", points: 22 },
      { actionType: "Avoided food waste", points: 25 },
      { actionType: "Packed lunch from home", points: 18 },
      { actionType: "Used reusable utensils", points: 12 },
    ],
  },
  {
    key: "WATER",
    label: "Water",
    title: "Water",
    subtitle: "Conserving water",
    color: "bg-cyan-500",
    icon: <Droplet className="h-5 w-5 text-white" />,
    actions: [
      { actionType: "Took shorter shower", points: 20 },
      { actionType: "Fixed a leak", points: 40 },
      { actionType: "Used low-flow fixtures", points: 25 },
      { actionType: "Used refillable bottle", points: 15 },
      { actionType: "Turned off tap while washing", points: 18 },
    ],
  },
];

// Total steps = 1 (welcome) + 5 (categories) + 1 (summary) = 7
const TOTAL_STEPS = 7;

// ── Component ───────────────────────────────────────────────────────────────

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0); // 0=welcome, 1-5=categories, 6=summary
  const [name, setName] = useState("");
  const [department, setDepartment] = useState("");
  const [selected, setSelected] = useState<Record<string, Set<string>>>({
    TRANSPORT: new Set(),
    ENERGY: new Set(),
    RECYCLING: new Set(),
    FOOD: new Set(),
    WATER: new Set(),
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const progressPercent = Math.round(((step + 1) / TOTAL_STEPS) * 100);

  function toggleAction(category: string, actionType: string) {
    setSelected((prev) => {
      const next = new Set(prev[category]);
      if (next.has(actionType)) { next.delete(actionType); } else { next.add(actionType); }
      return { ...prev, [category]: next };
    });
  }

  function totalSelected() {
    return Object.values(selected).reduce((sum, s) => sum + s.size, 0);
  }

  async function handleFinish() {
    setSubmitting(true);
    setError("");
    try {
      const actions = STEPS.flatMap((step) =>
        step.actions
          .filter((a) => selected[step.key].has(a.actionType))
          .map((a) => ({ actionType: a.actionType, category: step.key, points: a.points }))
      );

      const res = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ department, actions }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Something went wrong.");
        return;
      }

      router.push("/dashboard");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  // ── Step labels for header ──
  const stepLabel = step === 0 ? "Welcome" : step === 6 ? "Summary" : STEPS[step - 1].label;

  return (
    <div className="min-h-screen bg-[#f0f0ee] flex items-center justify-center px-4 py-8">
      <div className="flex max-h-[calc(100vh-2rem)] min-h-[620px] w-full max-w-[390px] flex-col overflow-hidden rounded-[36px] bg-white shadow-2xl sm:min-h-[700px]">

        {/* ── Dark green header ── */}
        <div className="bg-[#1c3a28] px-5 pt-5 pb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[13px] font-medium text-white/80">Step {step + 1} of {TOTAL_STEPS}</span>
            <span className="text-[13px] font-semibold text-white">{progressPercent}%</span>
          </div>
          <div className="h-1.5 rounded-full bg-white/20 mb-3">
            <div
              className="h-1.5 rounded-full bg-white transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <h1 className="text-[17px] font-semibold text-white text-center">{stepLabel}</h1>
        </div>

        {/* ── Body ── */}
        <div className="flex-1 px-5 pt-6 pb-4 overflow-y-auto">

          {/* ── STEP 0: Welcome ── */}
          {step === 0 && (
            <div className="flex flex-col items-center">
              <Link
                href="/dashboard"
                className="mb-3 rounded-2xl transition-opacity hover:opacity-80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
              >
                <Image
                  src="/icons/logo.png"
                  alt="GreenStep Cities"
                  width={64}
                  height={64}
                  className="rounded-2xl"
                />
              </Link>
              <p className="text-[11px] font-semibold text-[#6b7280] uppercase tracking-widest mb-4">GreenStep Cities</p>
              <h2 className="text-[22px] font-bold text-[#111827] text-center mb-2">
                Welcome to EcoChallenge!
              </h2>
              <p className="text-[14px] text-[#6b7280] text-center mb-8">
                Join your colleagues in making a positive environmental impact. Let&apos;s get you started with a quick setup.
              </p>

              <div className="w-full space-y-4">
                <div>
                  <label className="block text-[13px] font-medium text-[#374151] mb-1.5">Your Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Maria Lopez"
                    className="w-full h-12 rounded-xl border border-[#e5e7eb] px-4 text-[14px] text-[#111827] outline-none focus:border-[#0b5d1e] bg-[#f9fafb]"
                  />
                </div>
                <div>
                  <label className="block text-[13px] font-medium text-[#374151] mb-1.5">Department</label>
                  <input
                    type="text"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    placeholder="e.g. Engineering"
                    className="w-full h-12 rounded-xl border border-[#e5e7eb] px-4 text-[14px] text-[#111827] outline-none focus:border-[#0b5d1e] bg-[#f9fafb]"
                  />
                </div>
              </div>
            </div>
          )}

          {/* ── STEPS 1-5: Category checklists ── */}
          {step >= 1 && step <= 5 && (() => {
            const cat = STEPS[step - 1];
            return (
              <div>
                {/* Category header */}
                <div className="flex items-center gap-3 mb-4">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-full ${cat.color} shrink-0`}>
                    {cat.icon}
                  </div>
                  <div>
                    <p className="text-[15px] font-semibold text-[#111827]">{cat.title}</p>
                    <p className="text-[12px] text-[#6b7280]">{cat.subtitle}</p>
                  </div>
                </div>

                <p className="text-[13px] text-[#6b7280] mb-4">
                  Select any activities you&apos;ve done in the past month:
                </p>

                <div className="space-y-2.5 mb-5">
                  {cat.actions.map((action) => {
                    const isSelected = selected[cat.key].has(action.actionType);
                    return (
                      <button
                        key={action.actionType}
                        type="button"
                        onClick={() => toggleAction(cat.key, action.actionType)}
                        className={`w-full flex items-center justify-between rounded-xl border px-4 py-3.5 text-left transition ${
                          isSelected
                            ? "border-[#0b5d1e] bg-[#f0fdf4]"
                            : "border-[#e5e7eb] bg-white"
                        }`}
                      >
                        <span className={`text-[14px] font-medium ${isSelected ? "text-[#0b5d1e]" : "text-[#111827]"}`}>
                          {action.actionType}
                        </span>
                        <div className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition ${
                          isSelected ? "border-[#0b5d1e] bg-[#0b5d1e]" : "border-[#d1d5db]"
                        }`}>
                          {isSelected && (
                            <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Why we ask */}
                <div className="rounded-xl bg-[#f8f9fa] border border-[#e5e7eb] px-4 py-3">
                  <p className="text-[12px] text-[#6b7280]">
                    <span className="font-semibold text-[#374151]">💡 Why we ask: </span>
                    Knowing what you&apos;ve already done helps us suggest new actions tailored to your habits and maximize your impact.
                  </p>
                </div>
              </div>
            );
          })()}

          {/* ── STEP 6: Summary ── */}
          {step === 6 && (
            <div className="flex flex-col items-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#0b5d1e] mb-4">
                <Sparkles className="h-7 w-7 text-white" />
              </div>
              <h2 className="text-[20px] font-bold text-[#111827] mb-1">You&apos;re All Set!</h2>
              <p className="text-[14px] text-[#6b7280] mb-6 text-center">
                Great job! You&apos;ve logged {totalSelected()} past {totalSelected() === 1 ? "activity" : "activities"}.
              </p>

              <div className="w-full rounded-2xl border border-[#e5e7eb] bg-[#f9fafb] px-4 py-4 mb-5">
                <p className="text-[13px] font-semibold text-[#374151] mb-3 text-center">Your Sustainability Profile</p>
                <div className="space-y-3">
                  {STEPS.map((cat) => (
                    <div key={cat.key} className="flex items-center gap-3">
                      <div className={`flex h-8 w-8 items-center justify-center rounded-full ${cat.color} shrink-0`}>
                        <span className="scale-75">{cat.icon}</span>
                      </div>
                      <span className="flex-1 text-[14px] font-medium text-[#111827]">{cat.label}</span>
                      <span className="text-[13px] text-[#6b7280]">
                        {selected[cat.key].size} {selected[cat.key].size === 1 ? "action" : "actions"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {department && (
                <div className="w-full rounded-xl bg-[#f0fdf4] border border-[#bbf7d0] px-4 py-3 mb-4">
                  <p className="text-[13px] text-[#166534]">
                    <span className="font-semibold">Department:</span> {department}
                  </p>
                </div>
              )}

              {error && <p className="text-[13px] text-red-600 mb-3 text-center">{error}</p>}
            </div>
          )}
        </div>

        {/* ── Footer buttons ── */}
        <div className="px-5 pb-6 pt-2 flex gap-3">
          {step > 0 && (
            <button
              type="button"
              onClick={() => setStep((s) => s - 1)}
              disabled={submitting}
              className="flex min-h-14 items-center gap-2 rounded-full border border-[#e5e7eb] px-6 text-[15px] font-semibold text-[#374151] disabled:opacity-50"
            >
              <ChevronLeft className="h-4 w-4" />
              Back
            </button>
          )}

          {step < 6 ? (
            <button
              type="button"
              onClick={() => setStep((s) => s + 1)}
              className="flex min-h-14 flex-1 items-center justify-center gap-2 rounded-full bg-[#0b5d1e] px-6 text-[15px] font-semibold text-white"
            >
              Continue
              <ChevronRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleFinish}
              disabled={submitting}
              className="flex min-h-14 flex-1 items-center justify-center gap-2 rounded-full bg-[#0b5d1e] px-6 text-[15px] font-semibold text-white disabled:opacity-60"
            >
              {submitting ? "Saving..." : "Get Started"}
              {!submitting && <Sparkles className="h-4 w-4" />}
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
