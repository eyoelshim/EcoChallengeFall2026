"use client";

import React, { use, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, CheckCircle2 } from "lucide-react";
import {
  DEPARTMENTS,
  MOCK_GROUPS,
  ROLES,
  USER_STATUSES,
  type Role,
  type UserStatus,
  getMockUser,
  updateMockUser,
} from "../../mock-data";

export default function EditUserPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [notFoundUser, setNotFoundUser] = useState(false);
  const [success, setSuccess] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    department: "",
    role: "GeneralUser" as Role,
    status: "Active" as UserStatus,
    groupId: "",
  });

  useEffect(() => {
    const user = getMockUser(id);
    if (!user) {
      setNotFoundUser(true);
      setLoading(false);
      return;
    }
    setForm({
      name: user.name,
      email: user.email,
      department: user.department,
      role: user.role,
      status: user.status,
      groupId: user.groupId || "",
    });
    setLoading(false);
  }, [id]);

  const update =
    (field: string) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMockUser(id, {
      name: form.name.trim(),
      email: form.email.trim(),
      department: form.department,
      role: form.role,
      status: form.status,
      groupId: form.groupId || null,
    });
    setSuccess(true);
    setTimeout(() => {
      router.push(`/admin/admin/users/${id}`);
    }, 900);
  };

  const inputClass =
    "w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500";

  if (loading) {
    return (
      <div className="p-8 text-center text-sm text-slate-500">
        Loading participant profile...
      </div>
    );
  }

  if (notFoundUser) {
    return (
      <div className="space-y-4">
        <Link
          href="/admin/admin/users"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-900"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Users
        </Link>
        <div className="bg-white border border-slate-200 rounded-xl p-8 text-center">
          <p className="text-slate-600 font-medium">Participant not found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Link
        href={`/admin/admin/users/${id}`}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-900"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Participant Profile
      </Link>

      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Edit User Profile</h1>
        <p className="text-sm text-slate-500 mt-1">
          Update account details, role permissions, group assignments, and access status.
        </p>
      </div>

      {success && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl p-4 flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <p className="text-sm font-medium">Changes saved successfully! Redirecting...</p>
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm max-w-2xl space-y-5"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {/* Full Name */}
          <label className="block sm:col-span-2">
            <span className="block text-sm font-medium text-slate-700 mb-1.5">Full Name</span>
            <input
              type="text"
              required
              value={form.name}
              onChange={update("name")}
              placeholder="Full name"
              className={inputClass}
            />
          </label>

          {/* Email */}
          <label className="block sm:col-span-2">
            <span className="block text-sm font-medium text-slate-700 mb-1.5">Email</span>
            <input
              type="email"
              required
              value={form.email}
              onChange={update("email")}
              placeholder="Email address"
              className={inputClass}
            />
          </label>

          {/* Department */}
          <label className="block">
            <span className="block text-sm font-medium text-slate-700 mb-1.5">Department</span>
            <select
              required
              value={form.department}
              onChange={update("department")}
              className={inputClass}
            >
              <option value="" disabled>Select department</option>
              {DEPARTMENTS.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
          </label>

          {/* Role */}
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

          {/* Group / Team */}
          <label className="block">
            <span className="block text-sm font-medium text-slate-700 mb-1.5">Group / Team</span>
            <select value={form.groupId} onChange={update("groupId")} className={inputClass}>
              <option value="">No Group Assigned</option>
              {MOCK_GROUPS.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name}
                </option>
              ))}
            </select>
          </label>

          {/* Status */}
          <label className="block">
            <span className="block text-sm font-medium text-slate-700 mb-1.5">Account Status</span>
            <select value={form.status} onChange={update("status")} className={inputClass}>
              {USER_STATUSES.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="flex gap-3 pt-3 border-t border-slate-100">
          <button
            type="submit"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors shadow-sm"
          >
            <Save className="w-4 h-4" />
            Save Changes
          </button>
          <Link
            href={`/admin/admin/users/${id}`}
            className="px-4 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
