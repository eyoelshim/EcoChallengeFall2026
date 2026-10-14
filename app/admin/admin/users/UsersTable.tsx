"use client";

import React, { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Flame } from "lucide-react";
import { MOCK_USERS, ROLES, ROLE_BADGE_STYLES, type Role } from "./mock-data";

type RoleFilter = "All" | Role;

export default function UsersTable() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<RoleFilter>("All");

  const roleCounts = useMemo(() => {
    const counts: Record<RoleFilter, number> = {
      All: MOCK_USERS.length,
      SuperAdmin: 0,
      Admin: 0,
      GeneralUser: 0,
    };
    for (const user of MOCK_USERS) counts[user.role] += 1;
    return counts;
  }, []);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return MOCK_USERS.filter((user) => {
      const matchesRole = roleFilter === "All" || user.role === roleFilter;
      const matchesSearch =
        !query ||
        user.name.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query) ||
        user.department.toLowerCase().includes(query);
      return matchesRole && matchesSearch;
    });
  }, [search, roleFilter]);

  const openUser = (id: string) => router.push(`/admin/admin/users/${id}`);

  return (
    <div className="space-y-4">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
        <div className="relative w-full lg:max-w-xs">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name, email, or department"
            aria-label="Search users"
            className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
          />
        </div>

        <div className="flex flex-wrap gap-2" role="tablist" aria-label="Filter by role">
          {(["All", ...ROLES] as RoleFilter[]).map((role) => {
            const active = roleFilter === role;
            return (
              <button
                key={role}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setRoleFilter(role)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
                  active
                    ? "bg-slate-900 text-white border-slate-900"
                    : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                }`}
              >
                {role}
                <span className={`text-xs ${active ? "text-slate-300" : "text-slate-400"}`}>
                  {roleCounts[role]}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-x-auto">
        <table className="w-full min-w-[760px] text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
              <th className="px-5 py-3">Name</th>
              <th className="px-5 py-3">Email</th>
              <th className="px-5 py-3">Department</th>
              <th className="px-5 py-3">Role</th>
              <th className="px-5 py-3 text-right">Streak</th>
              <th className="px-5 py-3 text-right">Actions Logged</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map((user) => (
              <tr
                key={user.id}
                tabIndex={0}
                onClick={() => openUser(user.id)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") openUser(user.id);
                }}
                className="cursor-pointer hover:bg-slate-50 focus:bg-slate-50 focus:outline-none transition-colors"
              >
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-semibold shrink-0">
                      {user.name
                        .split(" ")
                        .map((part) => part[0])
                        .join("")}
                    </div>
                    <span className="font-medium text-slate-900">{user.name}</span>
                  </div>
                </td>
                <td className="px-5 py-3.5 text-slate-600">{user.email}</td>
                <td className="px-5 py-3.5 text-slate-600">{user.department}</td>
                <td className="px-5 py-3.5">
                  <span
                    className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ring-1 ring-inset ${ROLE_BADGE_STYLES[user.role]}`}
                  >
                    {user.role}
                  </span>
                </td>
                <td className="px-5 py-3.5 text-right">
                  <span className="inline-flex items-center gap-1 text-slate-700">
                    <Flame className={`w-4 h-4 ${user.streak > 0 ? "text-orange-500" : "text-slate-300"}`} />
                    {user.streak}d
                  </span>
                </td>
                <td className="px-5 py-3.5 text-right font-medium text-slate-900">
                  {user.actionsLogged}
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="px-5 py-10 text-center text-slate-500">
                  No users match your search.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-slate-400">
        Showing {filtered.length} of {MOCK_USERS.length} users · Demo data
      </p>
    </div>
  );
}
