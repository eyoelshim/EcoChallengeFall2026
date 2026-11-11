"use client";

import React, { useState, useTransition } from "react";
import { AlertCircle, CheckCircle2, MinusCircle, XCircle } from "lucide-react";
import { createAdminUserInvitations, type InvitationBatchResult } from "@/app/actions/admin-users";
import { MAX_INVITES_PER_BATCH, parseEmailList, type InviteStatus } from "@/lib/email-list";

const inputClass =
  "w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500";

const RESULT_STYLES: Record<InviteStatus, { label: string; className: string; icon: React.ElementType }> = {
  invited: { label: "Invitation sent", className: "text-emerald-700", icon: CheckCircle2 },
  already_member: { label: "Already a member", className: "text-slate-500", icon: MinusCircle },
  failed: { label: "Failed", className: "text-rose-700", icon: XCircle },
};

/**
 * Bulk invitation form: pasted emails plus an optional department for everyone in the batch.
 */
export function InviteUsersForm({ departments }: { departments: { id: string; name: string }[] }) {
  const [emails, setEmails] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [outcome, setOutcome] = useState<InvitationBatchResult | null>(null);
  const [isSending, startSending] = useTransition();

  // Live count so admins see how the paste was parsed before sending
  const { valid, invalid } = parseEmailList(emails);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setOutcome(null);
    startSending(async () => {
      const result = await createAdminUserInvitations({ emails, departmentId: departmentId || undefined });
      setOutcome(result);
      // Keep only the addresses that need another attempt
      if (result.results) {
        setEmails(result.results.filter((r) => r.status === "failed").map((r) => r.email).join("\n"));
      }
    });
  };

  const counts = outcome?.results?.reduce<Record<InviteStatus, number>>(
    (acc, r) => ({ ...acc, [r.status]: acc[r.status] + 1 }),
    { invited: 0, already_member: 0, failed: 0 }
  );

  return (
    <div className="space-y-6 max-w-2xl">
      <form onSubmit={submit} className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-5">
        <label className="block">
          <span className="block text-sm font-medium text-slate-700 mb-1.5">Email addresses</span>
          <textarea
            required
            rows={8}
            value={emails}
            onChange={(e) => setEmails(e.target.value)}
            placeholder={"jane.doe@city.gov\njohn.smith@city.gov, ana@city.gov"}
            className={`${inputClass} font-mono`}
          />
          <span className="block text-xs text-slate-500 mt-1.5">
            Separate with commas, spaces, or new lines. {valid.length} valid
            {invalid.length > 0 && (
              <span className="text-rose-600">
                {" "}
                · {invalid.length} not recognised: {invalid.slice(0, 3).join(", ")}
                {invalid.length > 3 && "…"}
              </span>
            )}
            {valid.length > MAX_INVITES_PER_BATCH && (
              <span className="text-rose-600"> · limit is {MAX_INVITES_PER_BATCH} per batch</span>
            )}
          </span>
        </label>

        <label className="block">
          <span className="block text-sm font-medium text-slate-700 mb-1.5">Department (optional)</span>
          <select value={departmentId} onChange={(e) => setDepartmentId(e.target.value)} className={inputClass}>
            <option value="">Let each person choose during onboarding</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
          <span className="block text-xs text-slate-500 mt-1.5">
            Applies to everyone in this batch. Invite each department separately to assign different ones.
          </span>
        </label>

        <button
          type="submit"
          disabled={isSending || valid.length === 0 || valid.length > MAX_INVITES_PER_BATCH}
          className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors shadow-sm disabled:opacity-50"
        >
          {isSending
            ? `Sending ${valid.length} invitation${valid.length === 1 ? "" : "s"}...`
            : `Send ${valid.length || ""} Invitation${valid.length === 1 ? "" : "s"}`}
        </button>
      </form>

      {outcome?.error && (
        <p className="flex items-center gap-2 text-sm text-rose-700 bg-rose-50 border border-rose-200 rounded-lg px-4 py-2.5">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {outcome.error}
        </p>
      )}

      {outcome?.results && counts && (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <div className="px-5 py-3 border-b border-slate-100 text-sm text-slate-700">
            <strong className="text-slate-900">{counts.invited}</strong> sent ·{" "}
            <strong className="text-slate-900">{counts.already_member}</strong> already members ·{" "}
            <strong className={counts.failed ? "text-rose-700" : "text-slate-900"}>{counts.failed}</strong> failed
            {counts.failed > 0 && <span className="text-slate-500"> (left in the box above to retry)</span>}
          </div>
          <ul className="divide-y divide-slate-100 max-h-80 overflow-y-auto">
            {outcome.results.map((r) => {
              const style = RESULT_STYLES[r.status];
              const Icon = style.icon;
              return (
                <li key={r.email} className="px-5 py-2.5 flex items-start justify-between gap-3 text-sm">
                  <span className="font-mono text-slate-800 break-all">{r.email}</span>
                  <span className={`flex items-center gap-1.5 shrink-0 ${style.className}`}>
                    <Icon className="w-4 h-4" />
                    {r.error ?? style.label}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
