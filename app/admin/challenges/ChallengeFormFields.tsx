// Form fields shared by the New Challenge and Edit Challenge pages.
// Rendered inside client components (both pages manage form state), so no "use client" needed here.
import React from "react";
import type { ChallengeFormField } from "@/app/actions/admin-challenges";

export const CHALLENGE_CATEGORIES = ["Campus-wide", "Transportation", "Energy", "Waste", "Food", "Water"];

export const DEFAULT_THEME_COLOR = "#10B981";

export type ChallengeFormErrors = Partial<Record<ChallengeFormField, string>>;

export type ChallengeFormValues = {
  name: string;
  category: string;
  departmentId: string;
  startDate: string;
  endDate: string;
  themeColor: string;
  description: string;
};

export const EMPTY_CHALLENGE_VALUES: ChallengeFormValues = {
  name: "",
  category: "",
  departmentId: "",
  startDate: "",
  endDate: "",
  themeColor: DEFAULT_THEME_COLOR,
  description: "",
};

const inputBaseClass =
  "mt-1 block w-full rounded-lg border px-3 py-2 text-sm text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500";

export function inputClass(error: string | undefined) {
  return inputBaseClass + (error ? " border-red-400" : " border-slate-300");
}

type ChallengeFormFieldsProps = {
  values: ChallengeFormValues;
  onChange: (field: keyof ChallengeFormValues, value: string) => void;
  errors: ChallengeFormErrors;
  departments: { id: string; name: string }[];
};

export function ChallengeFormFields({ values, onChange, errors, departments }: ChallengeFormFieldsProps) {
  // A cloned or older challenge may use a category outside the standard list; keep it selectable
  const categoryOptions =
    values.category && !CHALLENGE_CATEGORIES.includes(values.category)
      ? [...CHALLENGE_CATEGORIES, values.category]
      : CHALLENGE_CATEGORIES;

  return (
    <>
      <Field label="Challenge Name" error={errors.name}>
        <input
          name="name"
          value={values.name}
          onChange={(event) => onChange("name", event.target.value)}
          placeholder="e.g. Spring 2026 Energy Saver"
          className={inputClass(errors.name)}
        />
      </Field>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <Field label="Category" error={errors.category}>
          <select
            name="category"
            value={values.category}
            onChange={(event) => onChange("category", event.target.value)}
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
            value={values.departmentId}
            onChange={(event) => onChange("departmentId", event.target.value)}
            className={inputClass(errors.departmentId) + " bg-white"}
          >
            <option value="">All departments</option>
            {departments.map((dept) => (
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
            value={values.startDate}
            onChange={(event) => onChange("startDate", event.target.value)}
            className={inputClass(errors.startDate)}
          />
        </Field>

        <Field label="End Date" error={errors.endDate}>
          <input
            type="date"
            name="endDate"
            value={values.endDate}
            onChange={(event) => onChange("endDate", event.target.value)}
            className={inputClass(errors.endDate)}
          />
        </Field>

        <Field label="Theme Color" error={errors.themeColor}>
          <div className="mt-1 flex items-center gap-3">
            <input
              type="color"
              name="themeColor"
              value={values.themeColor}
              onChange={(event) => onChange("themeColor", event.target.value)}
              className="h-9 w-14 cursor-pointer rounded border border-slate-300 bg-white"
            />
            <span className="font-mono text-sm text-slate-500">{values.themeColor.toUpperCase()}</span>
          </div>
        </Field>
      </div>

      <Field label="Description" error={errors.description}>
        <textarea
          name="description"
          rows={4}
          value={values.description}
          onChange={(event) => onChange("description", event.target.value)}
          placeholder="Describe the rules, motivations, and impact goals of this challenge..."
          className={inputClass(errors.description)}
        />
      </Field>
    </>
  );
}

type FieldProps = {
  label: string;
  error: string | undefined;
  children: React.ReactNode;
};

export function Field(props: FieldProps) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-slate-700">{props.label}</span>
      {props.children}
      {props.error && <span className="mt-1 block text-xs text-red-600">{props.error}</span>}
    </label>
  );
}
