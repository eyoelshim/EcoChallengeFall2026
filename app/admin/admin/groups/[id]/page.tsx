import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Users, Award, Building2, Flag } from "lucide-react";
import {
  getAdminDepartment,
  type DepartmentMemberItem,
} from "@/app/actions/admin-groups";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function GroupDetailPage({ params }: PageProps) {
  const { id } = await params;
  const group = await getAdminDepartment(id);

  if (!group) {
    notFound();
  }

  return (
    <div className="space-y-6">
      {/* Back button */}
      <div>
        <Link
          href="/admin/admin/groups"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Departments
        </Link>
      </div>

      {/* Group overview card */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 ring-1 ring-emerald-200">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl font-bold text-slate-900">{group.name}</h1>
                <span className="inline-flex items-center gap-1 text-xs text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full font-medium ring-1 ring-emerald-200">
                  <Flag className="w-3 h-3" />
                  {group.activeChallenge || "No active challenge"}
                </span>
              </div>
              <p className="text-sm text-slate-500 mt-1 max-w-2xl">
                {group.description || "No department description provided."}
              </p>
            </div>
          </div>
        </div>

        {/* Metric cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-6 pt-6 border-t border-slate-100">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/60 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-medium text-slate-500 block">Total Members</span>
              <span className="text-xl font-bold text-slate-900">{group.membersCount}</span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/60 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-medium text-slate-500 block">Total Points Earned</span>
              <span className="text-xl font-bold text-slate-900">
                {group.totalPoints.toLocaleString()} pts
              </span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/60 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
              <Flag className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-medium text-slate-500 block">Active Challenge</span>
              <span className="text-sm font-semibold text-slate-900 truncate block">
                {group.activeChallenge || "None currently active"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Members Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">Department Members</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              All faculty, staff, and students participating under this department.
            </p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 bg-slate-100 text-slate-700 rounded-full">
            {group.users.length} {group.users.length === 1 ? "Member" : "Members"} Listed
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500"
                >
                  Member Name
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500"
                >
                  Email
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500"
                >
                  Role
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500 text-right"
                >
                  Actions Logged
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {group.users.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-slate-400">
                    No members have joined this department yet.
                  </td>
                </tr>
              ) : (
                group.users.map((member: DepartmentMemberItem) => (
                  <tr
                    key={member.id}
                    className="hover:bg-slate-50/80 transition-colors"
                  >
                    <td className="px-6 py-4 font-medium text-slate-900 whitespace-nowrap">
                      <Link
                        href={`/admin/admin/users/${member.id}`}
                        className="text-emerald-700 font-semibold hover:underline inline-flex items-center gap-1"
                      >
                        {member.name || "Anonymous Member"}
                      </Link>
                    </td>
                    <td className="px-6 py-4 text-slate-500 whitespace-nowrap">
                      {member.email || "—"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ring-1 ${
                          member.role.toLowerCase().includes("admin")
                            ? "bg-purple-50 text-purple-700 ring-purple-200"
                            : "bg-slate-100 text-slate-700 ring-slate-200"
                        }`}
                      >
                        {member.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right font-medium text-slate-900 whitespace-nowrap">
                      {member.actionsLogged}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
