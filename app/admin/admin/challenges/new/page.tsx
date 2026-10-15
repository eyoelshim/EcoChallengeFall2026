// Runs in the browser: needed for form state and the submit handler.
"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import {
  CHALLENGE_CATEGORIES,
  TEMPLATE_PRESETS,
  createMockChallenge,
} from "../mock-data";

const categories = CHALLENGE_CATEGORIES;

// Error message per field; a missing key means the field is valid.
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

export default function NewChallengePage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [category, setCategory] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [description, setDescription] = useState("");

  const [createdChallenge, setCreatedChallenge] = useState<{ name: string; code: string } | null>(null);
  const [errors, setErrors] = useState<FormErrors>({});

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const templateId = params.get("template");
      if (templateId && TEMPLATE_PRESETS[templateId]) {
        const preset = TEMPLATE_PRESETS[templateId];
        setName(preset.name);
        setCode(preset.code);
        setCategory(preset.category);
        setDescription(preset.description);
      }
    }
  }, []);

  // Returns an error message for each invalid field.
  function validate(): FormErrors {
    const found: FormErrors = {};

    if (name.trim() === "") {
      found.name = "Challenge name is required.";
    }

    // 3–12 capital letters, numbers, or dashes.
    const codePattern = /^[A-Z0-9-]{3,12}$/;
    if (!codePattern.test(code)) {
      found.code = "Use 3–12 capital letters, numbers, or dashes (e.g. CC-F26).";
    }

    if (category === "") {
      found.category = "Pick a category.";
    }

    if (startDate === "") {
      found.startDate = "Start date is required.";
    }

    // Date inputs give "YYYY-MM-DD" strings, so string comparison orders them correctly.
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
    event.preventDefault(); // stop the browser's default full-page reload

    const found = validate();
    setErrors(found);

    const errorCount = Object.keys(found).length;
    if (errorCount > 0) {
      return;
    }

    // Demo 1 mock feedback: persist to mock store and trigger confirmation modal
    const created = createMockChallenge({
      name,
      code,
      category,
      startDate,
      endDate,
      description,
    });
    setCreatedChallenge({ name: created.title, code: created.code });
  }

  // Red border on invalid fields.
  function inputClass(error: string | undefined) {
    if (error) {
      return inputBaseClass + " border-red-400";
    }
    return inputBaseClass + " border-slate-300";
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <Link
        href="/admin/admin/challenges"
        className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-900 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to challenges
      </Link>

      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">New Challenge</h1>
        <p className="text-sm text-slate-500 mt-1">Set up a new sustainability challenge.</p>
      </div>

      {/* noValidate: use our error messages instead of the browser's pop-ups. */}
      <form
        onSubmit={handleSubmit}
        noValidate
        className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-5"
      >
        <Field label="Challenge Name" error={errors.name}>
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            className={inputClass(errors.name)}
          />
        </Field>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <Field label="Code" error={errors.code}>
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
              className={inputClass(errors.category)}
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
            className={inputClass(errors.description)}
          />
        </Field>

        <div className="flex justify-end gap-3 pt-2">
          <Link
            href="/admin/admin/challenges"
            className="px-4 py-2 rounded-lg border border-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-100 transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors shadow-sm"
          >
            Create Challenge
          </button>
        </div>
      </form>

      {createdChallenge && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="challenge-confirm-title"
        >
          <div className="w-full max-w-md bg-white rounded-xl shadow-xl p-6 text-center">
            <div className="mx-auto w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6 text-emerald-600" />
            </div>
            <h2 id="challenge-confirm-title" className="mt-4 text-lg font-semibold text-slate-900">
              Challenge created
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              <span className="font-medium text-slate-900">{createdChallenge.name}</span> ({createdChallenge.code}) was created.
            </p>
            <p className="mt-2 text-xs text-slate-400">
              Demo 1: Challenge preview generated successfully.
            </p>
            <div className="mt-6 flex gap-3 justify-center">
              <button
                type="button"
                onClick={() => {
                  setName("");
                  setCode("");
                  setCategory("");
                  setStartDate("");
                  setEndDate("");
                  setDescription("");
                  setCreatedChallenge(null);
                }}
                className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors"
              >
                Create another
              </button>
              <button
                type="button"
                onClick={() => router.push("/admin/admin/challenges")}
                className="px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors"
              >
                Done
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

// Label above an input, error message (if any) below it.
function Field(props: FieldProps) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-slate-700">{props.label}</span>
      {props.children}
      {props.error && <span className="mt-1 block text-xs text-red-600">{props.error}</span>}
    </label>
  );
}
