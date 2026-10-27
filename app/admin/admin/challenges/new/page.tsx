// Runs in the browser: needed for form state and the submit handler.
"use client";

import React, { useState, useEffect, useTransition } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Sparkles,
  Layers,
  X,
  Copy,
} from "lucide-react";
import { getAdminTemplates, type AdminTemplateItem } from "@/app/actions/admin-templates";
import { normalizeActionCategory } from "@/lib/categories";
import {
  createAdminChallenge,
  getChallengeFormOptions,
  type CreateChallengeField,
} from "@/app/actions/admin-challenges";

const categories = ["Campus-wide", "Transportation", "Energy", "Waste", "Food", "Water"];

const DEFAULT_THEME_COLOR = "#10B981";

type FormErrors = Partial<Record<CreateChallengeField, string>>;

type FormOptions = Awaited<ReturnType<typeof getChallengeFormOptions>>;

type StagedAction = {
  catalogId?: string;
  title: string;
  description: string;
  category: string;
  points: number;
};

const inputBaseClass =
  "mt-1 block w-full rounded-lg border px-3 py-2 text-sm text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500";

function formatDateOffset(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

export default function NewChallengePage() {
  const [options, setOptions] = useState<FormOptions>({ departments: [], challenges: [] });
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("");
  const [selectedCloneId, setSelectedCloneId] = useState<string>("");
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [themeColor, setThemeColor] = useState(DEFAULT_THEME_COLOR);
  const [description, setDescription] = useState("");
  const [stagedActions, setStagedActions] = useState<StagedAction[]>([]);

  const [presetList, setPresetList] = useState<AdminTemplateItem[]>([]);
  const [errors, setErrors] = useState<FormErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isSaving, startSaving] = useTransition();

  const challengesList = options.challenges;

  useEffect(() => {
    getAdminTemplates()
      .then((templates) => {
        setPresetList(templates);
        if (typeof window !== "undefined") {
          const params = new URLSearchParams(window.location.search);
          const templateId = params.get("template");
          if (templateId) {
            const found = templates.find((p) => p.id === templateId);
            if (found) {
              setSelectedTemplateId(found.id);
              setName(found.name);
              setCategory(found.category);
              setDescription(found.description);
              setThemeColor(found.themeColor || DEFAULT_THEME_COLOR);

              const todayStr = new Date().toISOString().slice(0, 10);
              setStartDate(todayStr);
              setEndDate(formatDateOffset(found.days || 7));
              setStagedActions(
                found.actions.map((act) => ({
                  catalogId: act.catalogId,
                  title: act.title,
                  description: act.description,
                  category: normalizeActionCategory(act.category),
                  points: act.points,
                }))
              );
            }
          }
        }
      })
      .catch((err) => console.error("Failed to load templates:", err));
  }, []);

  useEffect(() => {
    getChallengeFormOptions()
      .then(setOptions)
      .catch(() => setFormError("Couldn't load departments and past challenges. Refresh to try again."));
  }, []);

  const resetForm = () => {
    setSelectedTemplateId("");
    setSelectedCloneId("");
    setName("");
    setCategory("");
    setDepartmentId("");
    setStartDate("");
    setEndDate("");
    setThemeColor(DEFAULT_THEME_COLOR);
    setDescription("");
    setStagedActions([]);
  };

  const applyTemplate = (templateId: string) => {
    setSelectedCloneId("");
    setSelectedTemplateId(templateId);
    if (!templateId) {
      setStagedActions([]);
      return;
    }

    const preset = presetList.find((p) => p.id === templateId);
    if (!preset) {
      setStagedActions([]);
      return;
    }

    setName(preset.name);
    setCategory(preset.category);
    setDescription(preset.description);
    setThemeColor(preset.themeColor || DEFAULT_THEME_COLOR);

    const todayStr = new Date().toISOString().slice(0, 10);
    setStartDate(todayStr);
    setEndDate(formatDateOffset(preset.days || 7));
    setStagedActions(
      preset.actions.map((act) => ({
        catalogId: act.catalogId,
        title: act.title,
        description: act.description,
        category: normalizeActionCategory(act.category),
        points: act.points,
      }))
    );
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

    setName(`${pastChallenge.name} (Clone)`);
    setCategory(pastChallenge.category ?? "");
    setDepartmentId(pastChallenge.departmentId ?? "");
    setThemeColor(pastChallenge.themeColor || DEFAULT_THEME_COLOR);
    setDescription(pastChallenge.description ?? "");

    const todayStr = new Date().toISOString().slice(0, 10);
    setStartDate(todayStr);
    setEndDate(formatDateOffset(7));

    setStagedActions(
      pastChallenge.actions.map((act) => ({
        catalogId: act.catalogId,
        title: act.title,
        description: act.description ?? "",
        category: normalizeActionCategory(act.category),
        points: act.points,
      }))
    );
  };

  // Validation runs on the server (Zod); on success the action redirects to the challenges list
  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    setErrors({});
    setFormError(null);

    startSaving(async () => {
      const result = await createAdminChallenge(formData);
      if (result?.fieldErrors) setErrors(result.fieldErrors);
      if (result?.error) setFormError(result.error);
    });
  }

  function inputClass(error: string | undefined) {
    if (error) {
      return inputBaseClass + " border-red-400";
    }
    return inputBaseClass + " border-slate-300";
  }

  // A cloned challenge may use a category outside the standard list; keep it selectable
  const categoryOptions = category && !categories.includes(category) ? [...categories, category] : categories;

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
                  onClick={resetForm}
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
                      {c.name} ({c.status})
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
            <input type="hidden" name="actions" value={JSON.stringify(stagedActions)} />

            {formError && (
              <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{formError}</p>
            )}

            <Field label="Challenge Name" error={errors.name}>
              <input
                name="name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="e.g. Spring 2026 Energy Saver"
                className={inputClass(errors.name)}
              />
            </Field>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <Field label="Category" error={errors.category}>
                <select
                  name="category"
                  value={category}
                  onChange={(event) => setCategory(event.target.value)}
                  className={inputClass(errors.category) + " bg-white"}
                >
                  <option value="">Select a category…</option>
                  {categoryOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Department" error={errors.departmentId}>
                <select
                  name="departmentId"
                  value={departmentId}
                  onChange={(event) => setDepartmentId(event.target.value)}
                  className={inputClass(errors.departmentId) + " bg-white"}
                >
                  <option value="">All departments</option>
                  {options.departments.map((dept) => (
                    <option key={dept.id} value={dept.id}>
                      {dept.name}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Start Date" error={errors.startDate}>
                <input
                  type="date"
                  name="startDate"
                  value={startDate}
                  onChange={(event) => setStartDate(event.target.value)}
                  className={inputClass(errors.startDate)}
                />
              </Field>

              <Field label="End Date" error={errors.endDate}>
                <input
                  type="date"
                  name="endDate"
                  value={endDate}
                  onChange={(event) => setEndDate(event.target.value)}
                  className={inputClass(errors.endDate)}
                />
              </Field>

              <Field label="Theme Color" error={errors.themeColor}>
                <div className="mt-1 flex items-center gap-3">
                  <input
                    type="color"
                    name="themeColor"
                    value={themeColor}
                    onChange={(event) => setThemeColor(event.target.value)}
                    className="h-9 w-14 cursor-pointer rounded border border-slate-300 bg-white"
                  />
                  <span className="font-mono text-sm text-slate-500">{themeColor.toUpperCase()}</span>
                </div>
              </Field>
            </div>

            <Field label="Description" error={errors.description}>
              <textarea
                name="description"
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
                {errors.actions && <p className="text-xs text-red-600">{errors.actions}</p>}

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

            <div className="flex items-center justify-between gap-3 pt-3 border-t border-slate-100">
              <p className="text-xs text-slate-500">A unique 6-character join code is generated automatically.</p>
              <div className="flex gap-3">
                <Link
                  href="/admin/admin/challenges"
                  className="px-4 py-2 rounded-lg border border-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-100 transition-colors"
                >
                  Cancel
                </Link>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 bg-emerald-600 text-white rounded-lg text-sm font-semibold hover:bg-emerald-700 transition-colors shadow-sm disabled:opacity-50"
                >
                  {isSaving ? "Creating…" : "Create Challenge"}
                </button>
              </div>
            </div>
          </form>
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
