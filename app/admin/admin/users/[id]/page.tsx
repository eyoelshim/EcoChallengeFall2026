"use client";

import React, { use, useEffect, useState } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Award,
  CalendarDays,
  Flame,
  Leaf,
  Star,
  Download,
  Trophy,
  Pencil,
  UserCheck,
  UserX,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  History,
  Users as GroupIcon,
} from "lucide-react";
import {
  ROLE_BADGE_STYLES,
  STATUS_BADGE_STYLES,
  MOCK_GROUPS,
  type MockUser,
  getMockUser,
  updateMockUser,
  toggleMockUserStatus,
  formatDate,
  downloadCsv,
} from "../mock-data";

export default function UserProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [user, setUser] = useState<MockUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedParticipation, setExpandedParticipation] = useState(false);
  const [groupSavedNotice, setGroupSavedNotice] = useState(false);

  useEffect(() => {
    const found = getMockUser(id);
    setUser(found || null);
    setLoading(false);
  }, [id]);

  if (loading) {
    return (
      <div className="p-12 text-center text-sm text-slate-500">
        Loading participant profile...
      </div>
    );
  }

  if (!user) {
    notFound();
  }

  const handleGroupChange = (newGroupId: string) => {
    const updated = updateMockUser(user.id, {
      groupId: newGroupId || null,
    });
    if (updated) {
      setUser({ ...updated });
      setGroupSavedNotice(true);
      setTimeout(() => setGroupSavedNotice(false), 2000);
    }
  };

  const handleToggleStatus = () => {
    const updated = toggleMockUserStatus(user.id);
    if (updated) {
      setUser({ ...updated });
    }
  };

  const exportParticipationCsv = () => {
    const rows = user.participation.map((p) => ({
      Challenge: p.challengeName,
      Action: p.action,
      Category: p.category,
      Points: p.points,
      CompletedAt: p.completedAt,
      Notes: p.notes || "",
    }));
    downloadCsv(`${user.name.replace(/\s+/g, "_")}_participation.csv`, rows);
  };

  const exportActivityLogsCsv = () => {
    const rows = user.activityLogs.map((l) => ({
      Action: l.action,
      Details: l.details,
      Timestamp: l.timestamp,
    }));
    downloadCsv(`${user.name.replace(/\s+/g, "_")}_activity.csv`, rows);
  };

  const stats = [
    { title: "Total Points", value: user.points.toLocaleString(), icon: Star, color: "text-purple-600 bg-purple-50" },
    { title: "Current Streak", value: `${user.streak} days`, icon: Flame, color: "text-orange-600 bg-orange-50" },
    { title: "Actions Logged", value: user.actionsLogged, icon: Leaf, color: "text-emerald-600 bg-emerald-50" },
    { title: "Joined Date", value: formatDate(user.joinedAt), icon: CalendarDays, color: "text-blue-600 bg-blue-50" },
  ];

  const visibleParticipation = expandedParticipation
    ? user.participation
    : user.participation.slice(0, 5);

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

      {/* ── Summary Header Card (mirrored from UserSummaryCard) ── */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center text-xl font-bold shrink-0">
              {user.name
                .split(" ")
                .map((part) => part[0])
                .join("")}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-bold tracking-tight text-slate-900">{user.name}</h1>
                <span
                  className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold ring-1 ring-inset ${ROLE_BADGE_STYLES[user.role]}`}
                >
                  {user.role}
                </span>
                <span
                  className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold ring-1 ring-inset ${STATUS_BADGE_STYLES[user.status]}`}
                >
                  {user.status}
                </span>
              </div>
              <p className="text-sm text-slate-500 mt-1">
                {user.email} · {user.department} · Last active: {user.lastActive}
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href={`/admin/admin/users/${user.id}/edit`}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors shadow-xs"
            >
              <Pencil className="w-4 h-4 text-slate-500" />
              Edit Profile
            </Link>
            <button
              type="button"
              onClick={handleToggleStatus}
              className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors shadow-xs ${
                user.status === "Active"
                  ? "bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100"
                  : "bg-emerald-600 text-white hover:bg-emerald-700"
              }`}
            >
              {user.status === "Active" ? (
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

        {/* Four-up metadata & interactive Team/Group selector */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-slate-100">
          <div>
            <span className="block text-xs font-medium text-slate-400 uppercase tracking-wider">Email</span>
            <p className="text-sm font-medium text-slate-900 mt-0.5 break-all">{user.email}</p>
          </div>
          <div>
            <span className="block text-xs font-medium text-slate-400 uppercase tracking-wider">Department</span>
            <p className="text-sm font-medium text-slate-900 mt-0.5">{user.department}</p>
          </div>
          <div>
            <span className="block text-xs font-medium text-slate-400 uppercase tracking-wider">Role</span>
            <p className="text-sm font-medium text-slate-900 mt-0.5">{user.role}</p>
          </div>
          <div>
            <div className="flex items-center justify-between">
              <span className="block text-xs font-medium text-slate-400 uppercase tracking-wider">
                Group / Team
              </span>
              {groupSavedNotice && (
                <span className="text-[11px] font-medium text-emerald-600">Saved!</span>
              )}
            </div>
            <div className="mt-1 flex items-center gap-2">
              <GroupIcon className="w-4 h-4 text-slate-400 shrink-0" />
              <select
                value={user.groupId || ""}
                onChange={(e) => handleGroupChange(e.target.value)}
                className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-md px-2 py-1 text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              >
                <option value="">No Group Assigned</option>
                {MOCK_GROUPS.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.name}
                  </option>
                ))}
              </select>
            </div>
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

      {/* ── Points History & Challenge Breakdown (PointsHistoryTable) ── */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-500" />
            <h2 className="text-base font-semibold text-slate-900">Points History & Challenge Progress</h2>
          </div>
          <span className="text-xs font-medium text-slate-500">
            Total Points: <strong className="text-slate-900 font-bold">{user.points}</strong>
          </span>
        </div>

        {user.pointsBreakdown.length === 0 ? (
          <p className="text-sm text-slate-400 py-3">No active challenge points recorded yet.</p>
        ) : (
          <div className="border border-slate-100 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-100 text-xs text-slate-500 uppercase tracking-wider text-left">
                <tr>
                  <th className="px-4 py-3">Challenge</th>
                  <th className="px-4 py-3 text-right">Points Earned</th>
                  <th className="px-4 py-3 text-right">Target</th>
                  <th className="px-4 py-3 w-1/3">Progress</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {user.pointsBreakdown.map((item) => {
                  const pct = Math.min(100, Math.round((item.points / item.target) * 100));
                  return (
                    <tr key={item.challengeId}>
                      <td className="px-4 py-3 font-medium text-slate-900">{item.challengeName}</td>
                      <td className="px-4 py-3 text-right font-semibold text-emerald-700">{item.points} pts</td>
                      <td className="px-4 py-3 text-right text-slate-500">{item.target} pts</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                            <div
                              className="bg-emerald-600 h-2 rounded-full transition-all"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <span className="text-xs font-semibold text-slate-600 w-10 text-right">
                            {pct}%
                          </span>
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

      {/* ── Participation History Table (ParticipationHistoryTable) ── */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <History className="w-5 h-5 text-emerald-600" />
              <h2 className="text-base font-semibold text-slate-900">
                Participation Log ({user.participation.length})
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Verified sustainability actions logged across all challenges.
            </p>
          </div>
          {user.participation.length > 0 && (
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

        {user.participation.length === 0 ? (
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
                    <td className="px-4 py-3 font-medium text-slate-900">{item.challengeName}</td>
                    <td className="px-4 py-3 text-slate-800">{item.action}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
                        {item.category}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-500">{item.completedAt}</td>
                    <td className="px-4 py-3 text-xs text-slate-500 max-w-xs truncate">
                      {item.notes || "—"}
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-emerald-700">
                      +{item.points} pts
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {user.participation.length > 5 && (
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
                  <ChevronDown className="w-4 h-4" /> Show All {user.participation.length} Actions
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* ── Two Column: Badges Earned & Admin Activity Log ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Badges Earned */}
        <section className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-600" />
            <h2 className="text-base font-semibold text-slate-900">Badges Earned ({user.badges.length})</h2>
          </div>
          {user.badges.length === 0 ? (
            <p className="text-sm text-slate-400 py-2">No badges earned yet.</p>
          ) : (
            <ul className="space-y-3">
              {user.badges.map((badge) => (
                <li key={badge.name} className="flex items-start gap-3 rounded-xl border border-slate-100 p-3 bg-slate-50/50">
                  <div className="p-2 rounded-lg bg-amber-50 text-amber-600 shrink-0">
                    <Award className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-900">{badge.name}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{badge.description}</p>
                    <p className="text-xs text-slate-400 mt-1">Earned {formatDate(badge.earnedAt)}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Admin Activity Log (UserActivityLogList) */}
        <section className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-purple-600" />
              <h2 className="text-base font-semibold text-slate-900">
                Admin Activity Log ({user.activityLogs.length})
              </h2>
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
          <p className="text-xs text-slate-500">
            Audit history of administrative actions performed by or on this account.
          </p>

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
                      <td className="px-3 py-2.5 text-slate-600">{log.details}</td>
                      <td className="px-3 py-2.5 text-slate-400 whitespace-nowrap">{log.timestamp}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
