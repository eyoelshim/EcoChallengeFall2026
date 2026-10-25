"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  CalendarDays,
  Flame,
  Leaf,
  Star,
  Download,
  Trophy,
  UserCheck,
  UserX,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  History,
  Users as GroupIcon,
} from "lucide-react";
import type { UserRole } from "@prisma/client";
import { updateUserRole, updateUserStatus, type getAdminUserDetail } from "@/app/actions/admin-users";
import { downloadCsv } from "@/lib/csv";
import {
  ROLE_OPTIONS,
  ROLE_LABELS,
  STATUS_LABELS,
  ROLE_BADGE_STYLES,
  STATUS_BADGE_STYLES,
  CATEGORY_LABELS,
  formatDate,
  formatDateTime,
  initials,
} from "../user-display";

type AdminUserDetail = NonNullable<Awaited<ReturnType<typeof getAdminUserDetail>>>;

export default function UserDetail({ user, canChangeRole }: { user: AdminUserDetail; canChangeRole: boolean }) {
  const router = useRouter();
  const [expandedParticipation, setExpandedParticipation] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [roleSavedNotice, setRoleSavedNotice] = useState(false);
  const [isSaving, startSaving] = useTransition();

  const runMutation = (mutation: () => Promise<{ error?: string }>, onSuccess?: () => void) => {
    setError(null);
    startSaving(async () => {
      const result = await mutation();
      if (result.error) {
        setError(result.error);
        return;
      }
      onSuccess?.();
      router.refresh();
    });
  };

  const handleRoleChange = (role: UserRole) => {
    runMutation(
      () => updateUserRole(user.id, role),
      () => {
        setRoleSavedNotice(true);
        setTimeout(() => setRoleSavedNotice(false), 2000);
      }
    );
  };

  const handleToggleStatus = () => {
    runMutation(() => updateUserStatus(user.id, user.status === "ACTIVE" ? "DEACTIVATED" : "ACTIVE"));
  };

  const exportParticipationCsv = () => {
    const rows = user.actions.map((a) => ({
      Challenge: a.challengeName ?? "",
      Action: a.actionType,
      Category: CATEGORY_LABELS[a.category],
      Points: a.points,
      CompletedAt: formatDateTime(a.date),
      Notes: a.note ?? "",
    }));
    downloadCsv(`${user.name.replace(/\s+/g, "_")}_participation.csv`, rows);
  };

  const exportActivityLogsCsv = () => {
    const rows = user.activityLogs.map((l) => ({
      Action: l.action,
      Details: l.details ?? "",
      Timestamp: formatDateTime(l.timestamp),
    }));
    downloadCsv(`${user.name.replace(/\s+/g, "_")}_activity.csv`, rows);
  };

  const stats = [
    { title: "Lifetime Points", value: user.lifetimePoints.toLocaleString(), icon: Star, color: "text-purple-600 bg-purple-50" },
    { title: "Current Streak", value: `${user.streak} days`, icon: Flame, color: "text-orange-600 bg-orange-50" },
    { title: "Actions Logged", value: user.actions.length, icon: Leaf, color: "text-emerald-600 bg-emerald-50" },
    { title: "Joined Date", value: formatDate(user.joinedAt), icon: CalendarDays, color: "text-blue-600 bg-blue-50" },
  ];

  const visibleParticipation = expandedParticipation ? user.actions : user.actions.slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Back button */}
      <div className="flex items-center justify-between">
        <Link
          href="/admin/admin/users"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Users Directory
        </Link>
      </div>

      {error && (
        <p className="text-sm text-rose-700 bg-rose-50 border border-rose-200 rounded-lg px-4 py-2.5">{error}</p>
      )}

      {/* ── Summary Header Card ── */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center text-xl font-bold shrink-0">
              {initials(user.name)}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-bold tracking-tight text-slate-900">{user.name}</h1>
                <span
                  className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold ring-1 ring-inset ${ROLE_BADGE_STYLES[user.role]}`}
                >
                  {ROLE_LABELS[user.role]}
                </span>
                <span
                  className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold ring-1 ring-inset ${STATUS_BADGE_STYLES[user.status]}`}
                >
                  {STATUS_LABELS[user.status]}
                </span>
              </div>
              <p className="text-sm text-slate-500 mt-1">
                {user.email} · {user.department ?? "No department"} · Last action:{" "}
                {formatDate(user.lastActionDate)}
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleToggleStatus}
              disabled={isSaving}
              className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors shadow-xs disabled:opacity-60 ${
                user.status === "ACTIVE"
                  ? "bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100"
                  : "bg-emerald-600 text-white hover:bg-emerald-700"
              }`}
            >
              {user.status === "ACTIVE" ? (
                <>
                  <UserX className="w-4 h-4" />
                  Deactivate User
                </>
              ) : (
                <>
                  <UserCheck className="w-4 h-4" />
                  Activate User
                </>
              )}
            </button>
          </div>
        </div>

        {/* Four-up metadata, role selector and teams */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-slate-100">
          <div>
            <span className="block text-xs font-medium text-slate-400 uppercase tracking-wider">Email</span>
            <p className="text-sm font-medium text-slate-900 mt-0.5 break-all">{user.email}</p>
          </div>
          <div>
            <span className="block text-xs font-medium text-slate-400 uppercase tracking-wider">Department</span>
            <p className="text-sm font-medium text-slate-900 mt-0.5">{user.department ?? "—"}</p>
          </div>
          <div>
            <div className="flex items-center justify-between">
              <span className="block text-xs font-medium text-slate-400 uppercase tracking-wider">Role</span>
              {roleSavedNotice && <span className="text-[11px] font-medium text-emerald-600">Saved!</span>}
            </div>
            {canChangeRole && !user.roleManagedByEnv ? (
              <select
                value={user.role}
                onChange={(e) => handleRoleChange(e.target.value as UserRole)}
                disabled={isSaving}
                aria-label="Change role"
                className="mt-1 w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-md px-2 py-1 text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500 disabled:opacity-60"
              >
                {ROLE_OPTIONS.map((role) => (
                  <option key={role} value={role}>
                    {ROLE_LABELS[role]}
                  </option>
                ))}
              </select>
            ) : (
              <p className="text-sm font-medium text-slate-900 mt-0.5">
                {ROLE_LABELS[user.role]}
                {user.roleManagedByEnv && (
                  <span className="block text-[11px] font-normal text-slate-400">Set via SUPERADMIN_EMAILS</span>
                )}
              </p>
            )}
          </div>
          <div>
            <span className="block text-xs font-medium text-slate-400 uppercase tracking-wider">Teams</span>
            {user.teams.length === 0 ? (
              <p className="text-sm text-slate-400 mt-0.5">No team</p>
            ) : (
              <ul className="mt-1 space-y-1">
                {user.teams.map((team) => (
                  <li key={team.id} className="flex items-center gap-1.5 text-sm font-medium text-slate-900">
                    <GroupIcon className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    {team.name}
                    {team.challengeName && (
                      <span className="text-xs font-normal text-slate-400">· {team.challengeName}</span>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      {/* ── Key Stat Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.title} className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-500">{stat.title}</span>
                <div className={`p-2 rounded-lg ${stat.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-4 text-2xl font-bold text-slate-900">{stat.value}</div>
            </div>
          );
        })}
      </div>

      {/* ── Points by Challenge ── */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-500" />
            <h2 className="text-base font-semibold text-slate-900">Points by Challenge</h2>
          </div>
          <span className="text-xs font-medium text-slate-500">
            Lifetime Points: <strong className="text-slate-900 font-bold">{user.lifetimePoints}</strong>
          </span>
        </div>

        {user.challengePoints.length === 0 ? (
          <p className="text-sm text-slate-400 py-3">Not part of any challenge yet.</p>
        ) : (
          <div className="border border-slate-100 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-100 text-xs text-slate-500 uppercase tracking-wider text-left">
                <tr>
                  <th className="px-4 py-3">Challenge</th>
                  <th className="px-4 py-3 text-right">Points Earned</th>
                  <th className="px-4 py-3 w-1/3">Share of Lifetime Points</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {user.challengePoints.map((item) => {
                  // Challenges have no point targets yet, so progress is relative to the user's total
                  const pct = user.lifetimePoints > 0 ? Math.round((item.points / user.lifetimePoints) * 100) : 0;
                  return (
                    <tr key={item.challengeId}>
                      <td className="px-4 py-3 font-medium text-slate-900">{item.challengeName}</td>
                      <td className="px-4 py-3 text-right font-semibold text-emerald-700">{item.points} pts</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                            <div
                              className="bg-emerald-600 h-2 rounded-full transition-all"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <span className="text-xs font-semibold text-slate-600 w-10 text-right">{pct}%</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Action Timeline ── */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <History className="w-5 h-5 text-emerald-600" />
              <h2 className="text-base font-semibold text-slate-900">Participation Log ({user.actions.length})</h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">Sustainability actions logged, newest first.</p>
          </div>
          {user.actions.length > 0 && (
            <button
              type="button"
              onClick={exportParticipationCsv}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors shadow-xs"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              Export Participation CSV
            </button>
          )}
        </div>

        {user.actions.length === 0 ? (
          <p className="text-sm text-slate-400 py-3">No actions logged yet.</p>
        ) : (
          <div className="border border-slate-100 rounded-xl overflow-x-auto">
            <table className="w-full min-w-[650px] text-sm">
              <thead className="bg-slate-50 border-b border-slate-100 text-xs text-slate-500 uppercase tracking-wider text-left">
                <tr>
                  <th className="px-4 py-3">Challenge</th>
                  <th className="px-4 py-3">Action Completed</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Notes</th>
                  <th className="px-4 py-3 text-right">Points</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {visibleParticipation.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/60">
                    <td className="px-4 py-3 font-medium text-slate-900">{item.challengeName ?? "—"}</td>
                    <td className="px-4 py-3 text-slate-800">{item.actionType}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
                        {CATEGORY_LABELS[item.category]}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-500 whitespace-nowrap">{formatDateTime(item.date)}</td>
                    <td className="px-4 py-3 text-xs text-slate-500 max-w-xs truncate">{item.note || "—"}</td>
                    <td className="px-4 py-3 text-right font-semibold text-emerald-700">+{item.points} pts</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {user.actions.length > 5 && (
          <div className="text-center pt-1">
            <button
              type="button"
              onClick={() => setExpandedParticipation(!expandedParticipation)}
              className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 hover:text-emerald-800"
            >
              {expandedParticipation ? (
                <>
                  <ChevronUp className="w-4 h-4" /> Show Less
                </>
              ) : (
                <>
                  <ChevronDown className="w-4 h-4" /> Show All {user.actions.length} Actions
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* ── Admin Activity Log ── */}
      <section className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-purple-600" />
            <h2 className="text-base font-semibold text-slate-900">Admin Activity Log ({user.activityLogs.length})</h2>
          </div>
          {user.activityLogs.length > 0 && (
            <button
              type="button"
              onClick={exportActivityLogsCsv}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors shadow-xs"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              Export CSV
            </button>
          )}
        </div>
        <p className="text-xs text-slate-500">Role and status changes made to this account.</p>

        {user.activityLogs.length === 0 ? (
          <p className="text-sm text-slate-400 py-3">No admin activity recorded for this participant.</p>
        ) : (
          <div className="border border-slate-100 rounded-xl overflow-hidden">
            <table className="w-full text-xs">
              <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 uppercase tracking-wider text-left">
                <tr>
                  <th className="px-3 py-2.5">Action</th>
                  <th className="px-3 py-2.5">Details</th>
                  <th className="px-3 py-2.5">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {user.activityLogs.map((log) => (
                  <tr key={log.id}>
                    <td className="px-3 py-2.5 font-semibold text-slate-900">{log.action}</td>
                    <td className="px-3 py-2.5 text-slate-600">{log.details ?? "—"}</td>
                    <td className="px-3 py-2.5 text-slate-400 whitespace-nowrap">{formatDateTime(log.timestamp)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
