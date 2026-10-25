"use client";

import React, { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Search, Download, Eye, UserCheck, UserX, Building2 } from "lucide-react";
import type { UserRole, UserStatus } from "@prisma/client";
import { updateUserStatus, type getAdminUsers } from "@/app/actions/admin-users";
import { downloadCsv } from "@/lib/csv";
import {
  ROLE_OPTIONS,
  STATUS_OPTIONS,
  ROLE_LABELS,
  STATUS_LABELS,
  ROLE_BADGE_STYLES,
  STATUS_BADGE_STYLES,
  formatDate,
  initials,
} from "./user-display";

type AdminUsersData = Awaited<ReturnType<typeof getAdminUsers>>;
type AdminUserRow = AdminUsersData["users"][number];

type Filters = {
  role?: string;
  status?: string;
  department?: string;
  search?: string;
};

export default function UsersTable({ data, filters }: { data: AdminUsersData; filters: Filters }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [search, setSearch] = useState(filters.search ?? "");

  // Confirmation modal state
  const [statusModalUser, setStatusModalUser] = useState<AdminUserRow | null>(null);
  const [statusError, setStatusError] = useState<string | null>(null);
  const [isSaving, startSaving] = useTransition();

  const { users, departments, roleCounts, statusCounts, total } = data;

  const setParam = (key: keyof Filters, value: string | undefined) => {
    const next = new URLSearchParams(searchParams.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    const qs = next.toString();
    startTransition(() => router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false }));
  };

  // Debounce search so we don't query on every keystroke
  useEffect(() => {
    const trimmed = search.trim();
    if (trimmed === (filters.search ?? "")) return;
    const timer = setTimeout(() => setParam("search", trimmed || undefined), 300);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const handleExportCsv = () => {
    const exportRows = users.map((u) => ({
      ID: u.id,
      Name: u.name,
      Email: u.email,
      Department: u.department ?? "",
      Role: ROLE_LABELS[u.role],
      Status: STATUS_LABELS[u.status],
      TotalPoints: u.totalPoints,
      ActionsLogged: u.actionsLogged,
      Streak: `${u.streak} days`,
      JoinedAt: formatDate(u.joinedAt),
    }));
    downloadCsv("greenstep_users.csv", exportRows);
  };

  const confirmToggleStatus = () => {
    if (!statusModalUser) return;
    const nextStatus: UserStatus = statusModalUser.status === "ACTIVE" ? "DEACTIVATED" : "ACTIVE";
    setStatusError(null);
    startSaving(async () => {
      const result = await updateUserStatus(statusModalUser.id, nextStatus);
      if (result.error) {
        setStatusError(result.error);
        return;
      }
      setStatusModalUser(null);
      router.refresh();
    });
  };

  return (
    <div className="space-y-4">
      {/* Search, Filter Bar, and Actions */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
          {/* Search bar */}
          <div className="relative w-full lg:max-w-sm">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search name, email, department..."
              aria-label="Search users"
              className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
            />
          </div>

          {/* Department and CSV Export Controls */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Department Filter */}
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-slate-400 hidden sm:block" />
              <select
                value={filters.department ?? ""}
                onChange={(e) => setParam("department", e.target.value || undefined)}
                aria-label="Filter by department"
                className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
              >
                <option value="">All Departments</option>
                {departments.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>

            {/* CSV Export Button */}
            <button
              type="button"
              onClick={handleExportCsv}
              disabled={users.length === 0}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium border border-slate-200 text-slate-700 bg-white hover:bg-slate-50 transition-colors shadow-sm disabled:opacity-50"
            >
              <Download className="w-4 h-4 text-slate-500" />
              Export CSV
            </button>
          </div>
        </div>

        {/* Filters Tabs: Roles & Status */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-slate-100">
          {/* Role Filter Tabs */}
          <div className="flex flex-wrap items-center gap-1.5" role="tablist" aria-label="Filter by role">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider mr-1">Role:</span>
            {([undefined, ...ROLE_OPTIONS] as (UserRole | undefined)[]).map((role) => {
              const active = (filters.role ?? undefined) === role;
              return (
                <button
                  key={role ?? "all"}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setParam("role", role)}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors ${
                    active
                      ? "bg-slate-900 text-white border-slate-900 shadow-xs"
                      : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  {role ? ROLE_LABELS[role] : "All"}
                  <span className={`text-[11px] ${active ? "text-slate-300" : "text-slate-400"}`}>
                    {role ? roleCounts[role] : total}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Status Filter Tabs */}
          <div className="flex flex-wrap items-center gap-1.5" role="tablist" aria-label="Filter by status">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider mr-1">Status:</span>
            {([undefined, ...STATUS_OPTIONS] as (UserStatus | undefined)[]).map((st) => {
              const active = (filters.status ?? undefined) === st;
              return (
                <button
                  key={st ?? "all"}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setParam("status", st)}
                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors ${
                    active
                      ? st === "ACTIVE"
                        ? "bg-emerald-700 text-white border-emerald-700"
                        : st === "DEACTIVATED"
                        ? "bg-rose-700 text-white border-rose-700"
                        : "bg-slate-900 text-white border-slate-900"
                      : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  {st ? STATUS_LABELS[st] : "All"}
                  <span className={`text-[11px] ${active ? "text-white/80" : "text-slate-400"}`}>
                    {st ? statusCounts[st] : total}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Users Data Table */}
      <div
        className={`bg-white border border-slate-200 rounded-xl shadow-sm overflow-x-auto transition-opacity ${
          isPending ? "opacity-60" : ""
        }`}
      >
        <table className="w-full min-w-[960px] text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
              <th className="px-5 py-3">Name</th>
              <th className="px-5 py-3">Email</th>
              <th className="px-5 py-3">Department</th>
              <th className="px-5 py-3">Role</th>
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3 text-right">Total Points</th>
              <th className="px-5 py-3">Joined</th>
              <th className="px-5 py-3 text-center">Manage</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-slate-50/80 transition-colors">
                {/* Name */}
                <td className="px-5 py-3.5">
                  <Link
                    href={`/admin/admin/users/${user.id}`}
                    className="flex items-center gap-3 group focus:outline-none"
                  >
                    <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-semibold shrink-0 group-hover:ring-2 group-hover:ring-emerald-500/40">
                      {initials(user.name)}
                    </div>
                    <span className="font-medium text-slate-900 group-hover:text-emerald-700 transition-colors">
                      {user.name}
                    </span>
                  </Link>
                </td>

                {/* Email */}
                <td className="px-5 py-3.5 text-slate-600">{user.email}</td>

                {/* Department */}
                <td className="px-5 py-3.5 text-slate-600">
                  {user.department ?? <span className="text-slate-400 text-xs italic">— None —</span>}
                </td>

                {/* Role */}
                <td className="px-5 py-3.5">
                  <span
                    className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ring-1 ring-inset ${ROLE_BADGE_STYLES[user.role]}`}
                  >
                    {ROLE_LABELS[user.role]}
                  </span>
                </td>

                {/* Status */}
                <td className="px-5 py-3.5">
                  <span
                    className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ring-1 ring-inset ${STATUS_BADGE_STYLES[user.status]}`}
                  >
                    {STATUS_LABELS[user.status]}
                  </span>
                </td>

                {/* Total Points */}
                <td className="px-5 py-3.5 text-right font-medium text-slate-900">
                  {user.totalPoints.toLocaleString()}
                </td>

                {/* Join Date */}
                <td className="px-5 py-3.5 text-slate-600 whitespace-nowrap">{formatDate(user.joinedAt)}</td>

                {/* Row Action Buttons */}
                <td className="px-5 py-3.5 text-center">
                  <div className="inline-flex items-center justify-center gap-1">
                    {/* View Profile */}
                    <Link
                      href={`/admin/admin/users/${user.id}`}
                      title="View Profile"
                      className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                    </Link>

                    {/* Activate / Deactivate Toggle */}
                    <button
                      type="button"
                      title={user.status === "ACTIVE" ? "Deactivate User" : "Activate User"}
                      onClick={() => {
                        setStatusError(null);
                        setStatusModalUser(user);
                      }}
                      className={`p-1.5 rounded-lg transition-colors ${
                        user.status === "ACTIVE"
                          ? "text-slate-400 hover:text-amber-700 hover:bg-amber-50"
                          : "text-emerald-600 hover:text-emerald-800 hover:bg-emerald-50"
                      }`}
                    >
                      {user.status === "ACTIVE" ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                    </button>
                  </div>
                </td>
              </tr>
            ))}

            {users.length === 0 && (
              <tr>
                <td colSpan={8} className="px-5 py-12 text-center text-slate-500">
                  No participants match your search and filter criteria.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between text-xs text-slate-400 px-1">
        <p>
          Showing {users.length} of {total} participants
        </p>
        <p>Live data · Neon PostgreSQL</p>
      </div>

      {/* ── Status Confirmation Modal ── */}
      {statusModalUser && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs px-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                  statusModalUser.status === "ACTIVE"
                    ? "bg-amber-100 text-amber-600"
                    : "bg-emerald-100 text-emerald-600"
                }`}
              >
                {statusModalUser.status === "ACTIVE" ? (
                  <UserX className="w-5 h-5" />
                ) : (
                  <UserCheck className="w-5 h-5" />
                )}
              </div>
              <div>
                <h3 className="text-base font-semibold text-slate-900">
                  {statusModalUser.status === "ACTIVE" ? "Deactivate User" : "Activate User"}
                </h3>
                <p className="text-xs text-slate-500">
                  {statusModalUser.status === "ACTIVE"
                    ? "Mark this account as deactivated"
                    : "Restore this account to active"}
                </p>
              </div>
            </div>

            <p className="text-sm text-slate-600 leading-relaxed">
              Are you sure you want to{" "}
              <strong className="text-slate-900">
                {statusModalUser.status === "ACTIVE" ? "deactivate" : "activate"}
              </strong>{" "}
              <span className="font-medium text-slate-900">{statusModalUser.name}</span> ({statusModalUser.email})?
            </p>

            {statusError && (
              <p className="text-sm text-rose-700 bg-rose-50 border border-rose-200 rounded-lg px-3 py-2">
                {statusError}
              </p>
            )}

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setStatusModalUser(null)}
                disabled={isSaving}
                className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmToggleStatus}
                disabled={isSaving}
                className={`px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors shadow-sm disabled:opacity-60 ${
                  statusModalUser.status === "ACTIVE"
                    ? "bg-amber-600 hover:bg-amber-700"
                    : "bg-emerald-600 hover:bg-emerald-700"
                }`}
              >
                {isSaving ? "Saving..." : statusModalUser.status === "ACTIVE" ? "Deactivate" : "Activate"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
