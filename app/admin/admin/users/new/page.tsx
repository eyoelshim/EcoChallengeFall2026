"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, CheckCircle2, AlertCircle, RefreshCw } from "lucide-react";
import {
  DEPARTMENTS,
  MOCK_GROUPS,
  ROLES,
  type Role,
  type MockUser,
  getMockUserByEmail,
  toggleMockUserStatus,
  createMockUser,
} from "../mock-data";

const EMPTY_FORM = {
  name: "",
  email: "",
  department: "",
  role: "GeneralUser" as Role,
  groupId: "",
};

const inputClass =
  "w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500";

export default function InviteUserPage() {
  const router = useRouter();
  const [form, setForm] = useState(EMPTY_FORM);
  const [invited, setInvited] = useState<typeof EMPTY_FORM | null>(null);
  const [existingUser, setExistingUser] = useState<MockUser | null>(null);

  const update =
    (field: keyof typeof EMPTY_FORM) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      setExistingUser(null);
      setForm((prev) => ({ ...prev, [field]: e.target.value }));
    };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setExistingUser(null);

    // Duplicate email detection matching old UserForm.jsx
    const existing = getMockUserByEmail(form.email);
    if (existing) {
      setExistingUser(existing);
      return;
    }

    createMockUser({
      name: form.name.trim(),
      email: form.email.trim(),
      department: form.department,
      role: form.role,
      groupId: form.groupId || null,
    });

    setInvited(form);
  };

  const handleReactivate = () => {
    if (!existingUser) return;
    toggleMockUserStatus(existingUser.id);
    router.push(`/admin/admin/users/${existingUser.id}`);
  };

  const inviteAnother = () => {
    setForm(EMPTY_FORM);
    setInvited(null);
    setExistingUser(null);
  };

  return (
    <div className="space-y-6">
      <Link
        href="/admin/admin/users"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-900"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Users
      </Link>

      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Invite User</h1>
        <p className="text-sm text-slate-500 mt-1">
          Send a participant an invitation to join the GreenStep challenge and assign their team.
        </p>
      </div>

      {/* Duplicate email alert */}
      {existingUser && (
        <div
          className={`max-w-2xl rounded-xl p-4 border flex items-start gap-3 ${
            existingUser.status === "Deactivated"
              ? "bg-amber-50 border-amber-200 text-amber-900"
              : "bg-rose-50 border-rose-200 text-rose-900"
          }`}
        >
          <AlertCircle className="w-5 h-5 mt-0.5 shrink-0" />
          <div className="flex-1">
            <h4 className="font-semibold text-sm">
              {existingUser.status === "Deactivated"
                ? "Deactivated account found"
                : "Active user already exists"}
            </h4>
            <p className="text-sm mt-1">
              A participant with email <strong>{existingUser.email}</strong> already exists (
              {existingUser.name} · {existingUser.department} · {existingUser.role}).
            </p>
            {existingUser.status === "Deactivated" && (
              <div className="mt-3">
                <button
                  type="button"
                  onClick={handleReactivate}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-700 text-white rounded-lg text-xs font-semibold hover:bg-amber-800 transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Reactivate {existingUser.name}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm max-w-2xl space-y-5"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <label className="block sm:col-span-2">
            <span className="block text-sm font-medium text-slate-700 mb-1.5">Full Name</span>
            <input
              type="text"
              required
              value={form.name}
              onChange={update("name")}
              placeholder="Jane Doe"
              className={inputClass}
            />
          </label>

          <label className="block sm:col-span-2">
            <span className="block text-sm font-medium text-slate-700 mb-1.5">Email</span>
            <input
              type="email"
              required
              value={form.email}
              onChange={update("email")}
              placeholder="jane.doe@greenstep.org"
              className={inputClass}
            />
          </label>

          <label className="block">
            <span className="block text-sm font-medium text-slate-700 mb-1.5">Department</span>
            <select
              required
              value={form.department}
              onChange={update("department")}
              className={inputClass}
            >
              <option value="" disabled>
                Select a department
              </option>
              {DEPARTMENTS.map((department) => (
                <option key={department} value={department}>
                  {department}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="block text-sm font-medium text-slate-700 mb-1.5">Role</span>
            <select value={form.role} onChange={update("role")} className={inputClass}>
              {ROLES.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>
          </label>

          <label className="block sm:col-span-2">
            <span className="block text-sm font-medium text-slate-700 mb-1.5">
              Assign to Group / Team (Optional)
            </span>
            <select value={form.groupId} onChange={update("groupId")} className={inputClass}>
              <option value="">No Group Assigned</option>
              {MOCK_GROUPS.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name} — {g.description}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors shadow-sm"
          >
            Send Invite
          </button>
          <Link
            href="/admin/admin/users"
            className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors"
          >
            Cancel
          </Link>
        </div>
      </form>

      {invited && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="invite-confirm-title"
        >
          <div className="w-full max-w-md bg-white rounded-xl shadow-xl p-6 text-center">
            <div className="mx-auto w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6 text-emerald-600" />
            </div>
            <h2 id="invite-confirm-title" className="mt-4 text-lg font-semibold text-slate-900">
              Invite sent
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              <span className="font-medium text-slate-900">{invited.name}</span> ({invited.email})
              was added to {invited.department} as{" "}
              <span className="font-medium text-slate-900">{invited.role}</span>.
            </p>
            <p className="mt-2 text-xs text-slate-400">
              Mock Engine: New participant has been added to your local user directory.
            </p>
            <div className="mt-6 flex gap-3 justify-center">
              <button
                type="button"
                onClick={inviteAnother}
                className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors"
              >
                Invite another
              </button>
              <button
                type="button"
                onClick={() => router.push("/admin/admin/users")}
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
