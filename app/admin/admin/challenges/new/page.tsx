// Runs in the browser: needed for form state and the submit handler.
"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle2,
  Sparkles,
  Layers,
  X,
  Copy,
} from "lucide-react";
import {
  CHALLENGE_CATEGORIES,
  TEMPLATE_PRESETS,
  createMockChallenge,
  getMockChallenges,
} from "../mock-data";

const categories = CHALLENGE_CATEGORIES;

type FormErrors = {
  name?: string;
  code?: string;
  category?: string;
  startDate?: string;
  endDate?: string;
  description?: string;
};

const inputBaseClass =
  "mt-1 block w-full rounded-lg border px-3 py-2 text-sm text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500";

function formatDateOffset(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

export default function NewChallengePage() {
  const router = useRouter();

  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("");
  const [selectedCloneId, setSelectedCloneId] = useState<string>("");
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [category, setCategory] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [description, setDescription] = useState("");
  const [stagedActions, setStagedActions] = useState<
    Array<{ title: string; description: string; category: string; points: number }>
  >([]);

  const [createdChallenge, setCreatedChallenge] = useState<{
    name: string;
    code: string;
    actionCount: number;
  } | null>(null);
  const [errors, setErrors] = useState<FormErrors>({});

  const challengesList = getMockChallenges();

  const applyTemplate = (templateId: string) => {
    setSelectedCloneId("");
    setSelectedTemplateId(templateId);
    if (!templateId || !TEMPLATE_PRESETS[templateId]) {
      setStagedActions([]);
      return;
    }

    const preset = TEMPLATE_PRESETS[templateId];
    setName(preset.name);
    setCode(preset.code);
    setCategory(preset.category);
    setDescription(preset.description);

    const todayStr = new Date().toISOString().slice(0, 10);
    setStartDate(todayStr);
    setEndDate(formatDateOffset(preset.days || 7));
    setStagedActions([...preset.actions]);
  };

  const applyClone = (challengeId: string) => {
    setSelectedTemplateId("");
    setSelectedCloneId(challengeId);
    if (!challengeId) {
      setStagedActions([]);
      return;
    }

    const pastChallenge = challengesList.find((c) => c.id === challengeId);
    if (!pastChallenge) return;

    setName(`${pastChallenge.title} (Clone)`);
    setCode(`${pastChallenge.code}-C`);
    setCategory(pastChallenge.category);
    setDescription(pastChallenge.description);

    const todayStr = new Date().toISOString().slice(0, 10);
    setStartDate(todayStr);
    setEndDate(formatDateOffset(7));

    setStagedActions(
      (pastChallenge.actions || []).map((a) => ({
        title: a.title,
        description: a.description,
        category: a.category,
        points: a.points,
      }))
    );
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const templateId = params.get("template");
      if (templateId && TEMPLATE_PRESETS[templateId]) {
        applyTemplate(templateId);
      }
    }
  }, []);

  function validate(): FormErrors {
    const found: FormErrors = {};

    if (name.trim() === "") {
      found.name = "Challenge name is required.";
    }

    const codePattern = /^[A-Z0-9-]{3,14}$/;
    if (!codePattern.test(code)) {
      found.code = "Use 3–14 capital letters, numbers, or dashes (e.g. CC-F26-C).";
    }

    if (category === "") {
      found.category = "Pick a category.";
    }

    if (startDate === "") {
      found.startDate = "Start date is required.";
    }

    if (endDate === "") {
      found.endDate = "End date is required.";
    } else if (startDate !== "" && endDate < startDate) {
      found.endDate = "End date must be on or after the start date.";
    }

    if (description.trim().length < 10) {
      found.description = "Add a short description (at least 10 characters).";
    }

    return found;
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    const found = validate();
    setErrors(found);

    if (Object.keys(found).length > 0) {
      return;
    }

    const created = createMockChallenge({
      name,
      code,
      category,
      startDate,
      endDate,
      description,
      actions: stagedActions,
    });

    setCreatedChallenge({
      name: created.title,
      code: created.code,
      actionCount: stagedActions.length,
    });
  }

  function inputClass(error: string | undefined) {
    if (error) {
      return inputBaseClass + " border-red-400";
    }
    return inputBaseClass + " border-slate-300";
  }

  const presetList = Object.values(TEMPLATE_PRESETS);

  return (
    <div className="space-y-6 max-w-3xl">
      <Link
        href="/admin/admin/challenges"
        className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-900 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to challenges
      </Link>

      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">New Challenge</h1>
        <p className="text-sm text-slate-500 mt-1">
          Set up a new sustainability sprint from scratch, clone a past challenge, or fast-track with an MPCA template.
        </p>
      </div>

      {/* Quick Start Card: Both Templates and Clone past challenge */}
      <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-emerald-700" />
                <h2 className="text-sm font-bold text-emerald-950">
                  Quick Start: Apply Template or Clone Challenge
                </h2>
              </div>
              {(selectedTemplateId || selectedCloneId) && (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedTemplateId("");
                    setSelectedCloneId("");
                    setName("");
                    setCode("");
                    setCategory("");
                    setStartDate("");
                    setEndDate("");
                    setDescription("");
                    setStagedActions([]);
                  }}
                  className="text-xs font-semibold text-emerald-800 hover:text-emerald-950 inline-flex items-center gap-1"
                >
                  <X className="w-3.5 h-3.5" />
                  Reset Form
                </button>
              )}
            </div>

            <p className="text-xs text-emerald-800 leading-relaxed">
              Auto-fill parameters and pre-stage action items from a pre-configured template or previous campus challenge.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              {/* Template dropdown */}
              <div>
                <label className="block text-[11px] font-bold text-emerald-900 uppercase tracking-wider mb-1">
                  From Template:
                </label>
                <select
                  value={selectedTemplateId}
                  onChange={(e) => applyTemplate(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-emerald-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-xs font-medium"
                >
                  <option value="">Select a template...</option>
                  {presetList.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.category})
                    </option>
                  ))}
                </select>
              </div>

              {/* Clone Past Challenge dropdown */}
              <div>
                <label className="block text-[11px] font-bold text-emerald-900 uppercase tracking-wider mb-1 flex items-center gap-1">
                  <Copy className="w-3 h-3" />
                  Clone Past Challenge:
                </label>
                <select
                  value={selectedCloneId}
                  onChange={(e) => applyClone(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-emerald-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-xs font-medium"
                >
                  <option value="">Select a past challenge...</option>
                  {challengesList.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.title} ({c.status})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <span className="text-[11px] text-emerald-700">
                {stagedActions.length > 0
                  ? `${stagedActions.length} action items will be cloned and attached.`
                  : "Or fill out the form manually below."}
              </span>
              <Link
                href="/admin/admin/templates"
                className="text-xs font-semibold text-emerald-700 hover:text-emerald-900 underline"
              >
                Manage Templates &rarr;
              </Link>
            </div>
          </div>

          {/* Main Creation Form */}
          <form
            onSubmit={handleSubmit}
            noValidate
            className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-5"
          >
            <Field label="Challenge Name" error={errors.name}>
              <input
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="e.g. Spring 2026 Energy Saver"
                className={inputClass(errors.name)}
              />
            </Field>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <Field label="Challenge Code" error={errors.code}>
                <input
                  value={code}
                  onChange={(event) => setCode(event.target.value.toUpperCase())}
                  placeholder="CC-F26"
                  className={inputClass(errors.code) + " font-mono"}
                />
              </Field>

              <Field label="Category" error={errors.category}>
                <select
                  value={category}
                  onChange={(event) => setCategory(event.target.value)}
                  className={inputClass(errors.category) + " bg-white"}
                >
                  <option value="">Select a category…</option>
                  {categories.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Start Date" error={errors.startDate}>
                <input
                  type="date"
                  value={startDate}
                  onChange={(event) => setStartDate(event.target.value)}
                  className={inputClass(errors.startDate)}
                />
              </Field>

              <Field label="End Date" error={errors.endDate}>
                <input
                  type="date"
                  value={endDate}
                  onChange={(event) => setEndDate(event.target.value)}
                  className={inputClass(errors.endDate)}
                />
              </Field>
            </div>

            <Field label="Description" error={errors.description}>
              <textarea
                rows={4}
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="Describe the rules, motivations, and impact goals of this challenge..."
                className={inputClass(errors.description)}
              />
            </Field>

            {/* Staged Actions Preview when Template or Clone Applied */}
            {stagedActions.length > 0 && (
              <div className="pt-4 border-t border-slate-100 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Layers className="w-4 h-4 text-emerald-600" />
                    <h3 className="text-sm font-bold text-slate-900">
                      Bundled Actions to Attach ({stagedActions.length})
                    </h3>
                  </div>
                  <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full ring-1 ring-emerald-200">
                    +{stagedActions.reduce((sum, a) => sum + (Number(a.points) || 0), 0)} total pts
                  </span>
                </div>

                <p className="text-xs text-slate-500">
                  These actions will be created and automatically attached to the new challenge upon submission.
                </p>

                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {stagedActions.map((action, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-lg border border-slate-100 bg-slate-50 flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="font-semibold text-slate-900 truncate">{action.title}</div>
                        <p className="text-slate-500 truncate mt-0.5">{action.description}</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="px-2 py-0.5 rounded bg-white text-slate-600 border border-slate-200 text-[10px] font-semibold">
                          {action.category}
                        </span>
                        <span className="font-bold text-emerald-700">+{action.points} pts</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
              <Link
                href="/admin/admin/challenges"
                className="px-4 py-2 rounded-lg border border-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-100 transition-colors"
              >
                Cancel
              </Link>
              <button
                type="submit"
                className="px-5 py-2 bg-emerald-600 text-white rounded-lg text-sm font-semibold hover:bg-emerald-700 transition-colors shadow-sm"
              >
                Create Challenge
              </button>
            </div>
          </form>

      {/* Confirmation Modal */}
      {createdChallenge && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="challenge-confirm-title"
        >
          <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-6 text-center animate-in fade-in zoom-in-95">
            <div className="mx-auto w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6 text-emerald-600" />
            </div>
            <h2 id="challenge-confirm-title" className="mt-4 text-lg font-bold text-slate-900">
              Challenge Created Successfully!
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              <span className="font-bold text-slate-900">{createdChallenge.name}</span> (
              {createdChallenge.code}) was created.
            </p>
            {createdChallenge.actionCount > 0 ? (
              <p className="mt-1 text-xs text-emerald-700 font-medium">
                {createdChallenge.actionCount} custom actions attached to this challenge.
              </p>
            ) : (
              <p className="mt-1 text-xs text-slate-400">
                You can add custom logging actions from the Challenge Detail page.
              </p>
            )}

            <div className="mt-6 flex gap-3 justify-center">
              <button
                type="button"
                onClick={() => {
                  setSelectedTemplateId("");
                  setSelectedCloneId("");
                  setName("");
                  setCode("");
                  setCategory("");
                  setStartDate("");
                  setEndDate("");
                  setDescription("");
                  setStagedActions([]);
                  setCreatedChallenge(null);
                }}
                className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors"
              >
                Create Another
              </button>
              <button
                type="button"
                onClick={() => router.push("/admin/admin/challenges")}
                className="px-5 py-2 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors"
              >
                View Challenges
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

type FieldProps = {
  label: string;
  error: string | undefined;
  children: React.ReactNode;
};

function Field(props: FieldProps) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-slate-700">{props.label}</span>
      {props.children}
      {props.error && <span className="mt-1 block text-xs text-red-600">{props.error}</span>}
    </label>
  );
}
