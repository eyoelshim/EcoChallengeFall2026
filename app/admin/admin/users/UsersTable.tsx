"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Search,
  Flame,
  Download,
  Eye,
  Pencil,
  UserCheck,
  UserX,
  Trash2,
  AlertTriangle,
  Users as UsersIcon,
} from "lucide-react";
import {
  MOCK_GROUPS,
  ROLE_BADGE_STYLES,
  STATUS_BADGE_STYLES,
  ROLES,
  USER_STATUSES,
  type Role,
  type UserStatus,
  type MockUser,
  getMockUsers,
  toggleMockUserStatus,
  deleteMockUser,
  downloadCsv,
} from "./mock-data";

type RoleFilter = "All" | Role;
type StatusFilter = "All" | UserStatus;

export default function UsersTable() {
  const [users, setUsers] = useState<MockUser[]>([]);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<RoleFilter>("All");
  const [groupFilter, setGroupFilter] = useState<string>("All");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("All");

  // Confirmation modal states
  const [statusModalUser, setStatusModalUser] = useState<MockUser | null>(null);
  const [deleteModalUser, setDeleteModalUser] = useState<MockUser | null>(null);

  // Sync users on mount
  useEffect(() => {
    setUsers(getMockUsers());
  }, []);

  const roleCounts = useMemo(() => {
    const counts: Record<RoleFilter, number> = {
      All: users.length,
      SuperAdmin: 0,
      Admin: 0,
      GeneralUser: 0,
    };
    for (const u of users) {
      if (counts[u.role] !== undefined) counts[u.role] += 1;
    }
    return counts;
  }, [users]);

  const statusCounts = useMemo(() => {
    const counts: Record<StatusFilter, number> = {
      All: users.length,
      Active: 0,
      Deactivated: 0,
    };
    for (const u of users) {
      if (counts[u.status] !== undefined) counts[u.status] += 1;
    }
    return counts;
  }, [users]);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return users.filter((user) => {
      const matchesRole = roleFilter === "All" || user.role === roleFilter;
      const matchesGroup =
        groupFilter === "All" ||
        (groupFilter === "none" && !user.groupId) ||
        user.groupId === groupFilter;
      const matchesStatus = statusFilter === "All" || user.status === statusFilter;
      const matchesSearch =
        !query ||
        user.name.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query) ||
        user.department.toLowerCase().includes(query) ||
        (user.groupName && user.groupName.toLowerCase().includes(query));
      return matchesRole && matchesGroup && matchesStatus && matchesSearch;
    });
  }, [users, search, roleFilter, groupFilter, statusFilter]);

  const handleExportCsv = () => {
    const exportRows = filtered.map((u) => ({
      ID: u.id,
      Name: u.name,
      Email: u.email,
      Department: u.department,
      Group: u.groupName || "None",
      Role: u.role,
      Status: u.status,
      Streak: `${u.streak} days`,
      ActionsLogged: u.actionsLogged,
      Points: u.points,
      JoinedAt: u.joinedAt,
      LastActive: u.lastActive,
    }));
    downloadCsv("greenstep_users.csv", exportRows);
  };

  const confirmToggleStatus = () => {
    if (!statusModalUser) return;
    const updated = toggleMockUserStatus(statusModalUser.id);
    if (updated) {
      setUsers(getMockUsers());
    }
    setStatusModalUser(null);
  };

  const confirmDeleteUser = () => {
    if (!deleteModalUser) return;
    deleteMockUser(deleteModalUser.id);
    setUsers(getMockUsers());
    setDeleteModalUser(null);
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
              placeholder="Search name, email, department, group..."
              aria-label="Search users"
              className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
            />
          </div>

          {/* Group and CSV Export Controls */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Group Filter */}
            <div className="flex items-center gap-2">
              <UsersIcon className="w-4 h-4 text-slate-400 hidden sm:block" />
              <select
                value={groupFilter}
                onChange={(e) => setGroupFilter(e.target.value)}
                aria-label="Filter by group"
                className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
              >
                <option value="All">All Groups / Teams</option>
                <option value="none">No Group Assigned</option>
                {MOCK_GROUPS.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.name}
                  </option>
                ))}
              </select>
            </div>

            {/* CSV Export Button */}
            <button
              type="button"
              onClick={handleExportCsv}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium border border-slate-200 text-slate-700 bg-white hover:bg-slate-50 transition-colors shadow-sm"
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
            {(["All", ...ROLES] as RoleFilter[]).map((role) => {
              const active = roleFilter === role;
              return (
                <button
                  key={role}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setRoleFilter(role)}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors ${
                    active
                      ? "bg-slate-900 text-white border-slate-900 shadow-xs"
                      : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  {role}
                  <span className={`text-[11px] ${active ? "text-slate-300" : "text-slate-400"}`}>
                    {roleCounts[role]}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Status Filter Tabs */}
          <div className="flex flex-wrap items-center gap-1.5" role="tablist" aria-label="Filter by status">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider mr-1">Status:</span>
            {(["All", ...USER_STATUSES] as StatusFilter[]).map((st) => {
              const active = statusFilter === st;
              return (
                <button
                  key={st}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setStatusFilter(st)}
                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors ${
                    active
                      ? st === "Active"
                        ? "bg-emerald-700 text-white border-emerald-700"
                        : st === "Deactivated"
                        ? "bg-rose-700 text-white border-rose-700"
                        : "bg-slate-900 text-white border-slate-900"
                      : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  {st}
                  <span className={`text-[11px] ${active ? "text-white/80" : "text-slate-400"}`}>
                    {statusCounts[st]}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Users Data Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-x-auto">
        <table className="w-full min-w-[960px] text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
              <th className="px-5 py-3">Name</th>
              <th className="px-5 py-3">Email</th>
              <th className="px-5 py-3">Department</th>
              <th className="px-5 py-3">Group / Team</th>
              <th className="px-5 py-3">Role</th>
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3 text-right">Streak</th>
              <th className="px-5 py-3 text-right">Actions</th>
              <th className="px-5 py-3 text-center">Manage</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map((user) => (
              <tr
                key={user.id}
                className="hover:bg-slate-50/80 transition-colors"
              >
                {/* Name */}
                <td className="px-5 py-3.5">
                  <Link
                    href={`/admin/admin/users/${user.id}`}
                    className="flex items-center gap-3 group focus:outline-none"
                  >
                    <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-semibold shrink-0 group-hover:ring-2 group-hover:ring-emerald-500/40">
                      {user.name
                        .split(" ")
                        .map((part) => part[0])
                        .join("")}
                    </div>
                    <span className="font-medium text-slate-900 group-hover:text-emerald-700 transition-colors">
                      {user.name}
                    </span>
                  </Link>
                </td>

                {/* Email */}
                <td className="px-5 py-3.5 text-slate-600">{user.email}</td>

                {/* Department */}
                <td className="px-5 py-3.5 text-slate-600">{user.department}</td>

                {/* Group / Team */}
                <td className="px-5 py-3.5">
                  {user.groupName ? (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
                      {user.groupName}
                    </span>
                  ) : (
                    <span className="text-slate-400 text-xs italic">— None —</span>
                  )}
                </td>

                {/* Role */}
                <td className="px-5 py-3.5">
                  <span
                    className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ring-1 ring-inset ${ROLE_BADGE_STYLES[user.role]}`}
                  >
                    {user.role}
                  </span>
                </td>

                {/* Status */}
                <td className="px-5 py-3.5">
                  <span
                    className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ring-1 ring-inset ${STATUS_BADGE_STYLES[user.status]}`}
                  >
                    {user.status}
                  </span>
                </td>

                {/* Streak */}
                <td className="px-5 py-3.5 text-right">
                  <span className="inline-flex items-center gap-1 text-slate-700">
                    <Flame className={`w-4 h-4 ${user.streak > 0 ? "text-orange-500" : "text-slate-300"}`} />
                    {user.streak}d
                  </span>
                </td>

                {/* Actions Logged */}
                <td className="px-5 py-3.5 text-right font-medium text-slate-900">
                  {user.actionsLogged}
                </td>

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

                    {/* Edit User */}
                    <Link
                      href={`/admin/admin/users/${user.id}/edit`}
                      title="Edit User"
                      className="p-1.5 text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors"
                    >
                      <Pencil className="w-4 h-4" />
                    </Link>

                    {/* Activate / Deactivate Toggle */}
                    <button
                      type="button"
                      title={user.status === "Active" ? "Deactivate User" : "Activate User"}
                      onClick={() => setStatusModalUser(user)}
                      className={`p-1.5 rounded-lg transition-colors ${
                        user.status === "Active"
                          ? "text-slate-400 hover:text-amber-700 hover:bg-amber-50"
                          : "text-emerald-600 hover:text-emerald-800 hover:bg-emerald-50"
                      }`}
                    >
                      {user.status === "Active" ? (
                        <UserX className="w-4 h-4" />
                      ) : (
                        <UserCheck className="w-4 h-4" />
                      )}
                    </button>

                    {/* Permanent Delete */}
                    <button
                      type="button"
                      title="Permanently Delete User"
                      onClick={() => setDeleteModalUser(user)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}

            {filtered.length === 0 && (
              <tr>
                <td colSpan={9} className="px-5 py-12 text-center text-slate-500">
                  No participants match your search and filter criteria.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between text-xs text-slate-400 px-1">
        <p>
          Showing {filtered.length} of {users.length} participants
        </p>
        <p>Interactive Mock Engine · Full Parity with Admin App</p>
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
                  statusModalUser.status === "Active"
                    ? "bg-amber-100 text-amber-600"
                    : "bg-emerald-100 text-emerald-600"
                }`}
              >
                {statusModalUser.status === "Active" ? (
                  <UserX className="w-5 h-5" />
                ) : (
                  <UserCheck className="w-5 h-5" />
                )}
              </div>
              <div>
                <h3 className="text-base font-semibold text-slate-900">
                  {statusModalUser.status === "Active" ? "Deactivate User" : "Activate User"}
                </h3>
                <p className="text-xs text-slate-500">
                  {statusModalUser.status === "Active"
                    ? "Temporarily revoke console and platform access"
                    : "Restore participant account access"}
                </p>
              </div>
            </div>

            <p className="text-sm text-slate-600 leading-relaxed">
              Are you sure you want to{" "}
              <strong className="text-slate-900">
                {statusModalUser.status === "Active" ? "deactivate" : "activate"}
              </strong>{" "}
              <span className="font-medium text-slate-900">{statusModalUser.name}</span> (
              {statusModalUser.email})?
              {statusModalUser.status === "Active" &&
                " They will no longer be able to log actions or participate until reactivated."}
            </p>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setStatusModalUser(null)}
                className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmToggleStatus}
                className={`px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors shadow-sm ${
                  statusModalUser.status === "Active"
                    ? "bg-amber-600 hover:bg-amber-700"
                    : "bg-emerald-600 hover:bg-emerald-700"
                }`}
              >
                {statusModalUser.status === "Active" ? "Deactivate" : "Activate"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Permanent Delete Modal ── */}
      {deleteModalUser && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs px-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-slate-900">Permanently delete user?</h3>
                <p className="text-xs text-rose-600 font-medium">This action cannot be undone</p>
              </div>
            </div>

            <p className="text-sm text-slate-600 leading-relaxed">
              This will permanently delete{" "}
              <strong className="text-slate-900">{deleteModalUser.name}</strong> (
              {deleteModalUser.email}), their credentials, all logged action completions, and their
              activity log. Prefer <em>Deactivate</em> if you only need to block sign-in.
            </p>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteModalUser(null)}
                className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDeleteUser}
                className="px-4 py-2 bg-rose-600 text-white rounded-lg text-sm font-medium hover:bg-rose-700 transition-colors shadow-sm"
              >
                Delete Permanently
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
