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
import { createAdminChallenge, getChallengeFormOptions } from "@/app/actions/admin-challenges";
import {
  ChallengeFormFields,
  DEFAULT_THEME_COLOR,
  EMPTY_CHALLENGE_VALUES,
  type ChallengeFormErrors,
  type ChallengeFormValues,
} from "../ChallengeFormFields";

type FormOptions = Awaited<ReturnType<typeof getChallengeFormOptions>>;

type StagedAction = {
  catalogId?: string;
  title: string;
  description: string;
  category: string;
  points: number;
};

function formatDateOffset(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

// Form values and staged actions from a template; shared by the dropdown and the ?template= link from the gallery
function fromTemplate(preset: AdminTemplateItem) {
  return {
    values: {
      name: preset.name,
      category: preset.category,
      description: preset.description,
      themeColor: preset.themeColor || DEFAULT_THEME_COLOR,
      startDate: new Date().toISOString().slice(0, 10),
      endDate: formatDateOffset(preset.days || 7),
    },
    actions: preset.actions.map((act) => ({
      catalogId: act.catalogId,
      title: act.title,
      description: act.description,
      category: normalizeActionCategory(act.category),
      points: act.points,
    })),
  };
}

export default function NewChallengePage() {
  const [options, setOptions] = useState<FormOptions>({ departments: [], challenges: [] });
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("");
  const [selectedCloneId, setSelectedCloneId] = useState<string>("");
  const [values, setValues] = useState<ChallengeFormValues>(EMPTY_CHALLENGE_VALUES);
  const [stagedActions, setStagedActions] = useState<StagedAction[]>([]);

  const [presetList, setPresetList] = useState<AdminTemplateItem[]>([]);
  const [errors, setErrors] = useState<ChallengeFormErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isSaving, startSaving] = useTransition();

  const challengesList = options.challenges;

  const setField = (field: keyof ChallengeFormValues, value: string) =>
    setValues((current) => ({ ...current, [field]: value }));

  // Templates don't set a department, so keep whatever the admin already picked
  const applyTemplateValues = (preset: AdminTemplateItem) => {
    const { values: templateValues, actions } = fromTemplate(preset);
    setValues((current) => ({ ...current, ...templateValues }));
    setStagedActions(actions);
  };

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
              const { values: templateValues, actions } = fromTemplate(found);
              setValues((current) => ({ ...current, ...templateValues }));
              setStagedActions(actions);
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
    setValues(EMPTY_CHALLENGE_VALUES);
    setStagedActions([]);
  };

  const applyTemplate = (templateId: string) => {
    setSelectedCloneId("");
    setSelectedTemplateId(templateId);
    const preset = templateId ? presetList.find((p) => p.id === templateId) : undefined;
    if (!preset) {
      setStagedActions([]);
      return;
    }
    applyTemplateValues(preset);
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

    setValues({
      name: `${pastChallenge.name} (Clone)`,
      category: pastChallenge.category ?? "",
      departmentId: pastChallenge.departmentId ?? "",
      themeColor: pastChallenge.themeColor || DEFAULT_THEME_COLOR,
      description: pastChallenge.description ?? "",
      startDate: new Date().toISOString().slice(0, 10),
      endDate: formatDateOffset(7),
    });

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

  return (
    <div className="space-y-6 max-w-3xl">
      <Link
        href="/admin/challenges"
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
                href="/admin/templates"
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

            <ChallengeFormFields
              values={values}
              onChange={setField}
              errors={errors}
              departments={options.departments}
            />

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
                  href="/admin/challenges"
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
