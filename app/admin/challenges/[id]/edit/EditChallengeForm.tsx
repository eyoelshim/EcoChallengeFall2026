// Runs in the browser: needed for form state and the submit handler.
"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import { RotateCcw } from "lucide-react";
import type { ChallengeStatus } from "@prisma/client";

import { updateAdminChallenge, type getAdminChallengeForEdit } from "@/app/actions/admin-challenges";
import { isClosedStatus, isReopening } from "@/lib/challenge-lifecycle";
import {
  ChallengeFormFields,
  Field,
  inputClass,
  type ChallengeFormErrors,
  type ChallengeFormValues,
} from "../../ChallengeFormFields";

type EditableChallenge = NonNullable<Awaited<ReturnType<typeof getAdminChallengeForEdit>>>;

type EditChallengeFormProps = {
  challenge: EditableChallenge;
  departments: { id: string; name: string }[];
};

const STATUS_OPTIONS: { value: ChallengeStatus; label: string }[] = [
  { value: "UPCOMING", label: "Upcoming" },
  { value: "ACTIVE", label: "Active" },
  { value: "COMPLETED", label: "Completed" },
  { value: "ARCHIVED", label: "Archived" },
];

export default function EditChallengeForm({ challenge, departments }: EditChallengeFormProps) {
  const [values, setValues] = useState<ChallengeFormValues>({
    name: challenge.name,
    category: challenge.category,
    departmentId: challenge.departmentId,
    startDate: challenge.startDate,
    endDate: challenge.endDate,
    themeColor: challenge.themeColor,
    description: challenge.description,
  });
  const [status, setStatus] = useState<ChallengeStatus>(challenge.status);
  const [errors, setErrors] = useState<ChallengeFormErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isSaving, startSaving] = useTransition();

  const reopening = isReopening(challenge.status, status);
  const statusLabel = STATUS_OPTIONS.find((option) => option.value === challenge.status)?.label;

  const setField = (field: keyof ChallengeFormValues, value: string) =>
    setValues((current) => ({ ...current, [field]: value }));

  // The server validates everything (Zod + status rules); this quick check just saves a round trip.
  // On success the action redirects to the challenge detail page.
  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    setFormError(null);

    if (values.startDate && values.endDate && values.endDate <= values.startDate) {
      setErrors({ endDate: "End date must be after the start date." });
      return;
    }
    setErrors({});

    startSaving(async () => {
      const result = await updateAdminChallenge(challenge.id, formData);
      if (result?.fieldErrors) setErrors(result.fieldErrors);
      if (result?.error) setFormError(result.error);
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-5"
    >
      {formError && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{formError}</p>
      )}

      {isClosedStatus(challenge.status) && !reopening && (
        <p className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600">
          This challenge is {statusLabel?.toLowerCase()}. To run it again, set its status to Active or Upcoming
          and choose new dates.
        </p>
      )}

      <Field label="Status" error={errors.status}>
        <select
          name="status"
          value={status}
          onChange={(event) => setStatus(event.target.value as ChallengeStatus)}
          className={inputClass(errors.status) + " bg-white"}
        >
          {STATUS_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </Field>

      {reopening && (
        <div className="flex gap-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5 text-sm text-amber-900">
          <RotateCcw className="w-4 h-4 mt-0.5 shrink-0" />
          <p>
            <span className="font-semibold">You&apos;re reopening this challenge.</span> Update the start and end
            dates below for the new run. Participants who already joined will see it on their dashboard again.
          </p>
        </div>
      )}

      <ChallengeFormFields values={values} onChange={setField} errors={errors} departments={departments} />

      <div className="flex items-center justify-between gap-3 pt-3 border-t border-slate-100">
        <p className="text-xs text-slate-500">
          The join code stays the same. Manage actions from the challenge page.
        </p>
        <div className="flex gap-3">
          <Link
            href={`/admin/challenges/${challenge.id}`}
            className="px-4 py-2 rounded-lg border border-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-100 transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isSaving}
            className="px-5 py-2 bg-emerald-600 text-white rounded-lg text-sm font-semibold hover:bg-emerald-700 transition-colors shadow-sm disabled:opacity-50"
          >
            {isSaving ? "Saving…" : reopening ? "Reopen Challenge" : "Save Changes"}
          </button>
        </div>
      </div>
    </form>
  );
}
