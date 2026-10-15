"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, Users, Building2, ChevronRight, Award } from "lucide-react";
import { getMockGroups, type DepartmentGroup } from "./mock-data";

export default function GroupsPage() {
  const [groups, setGroups] = useState<DepartmentGroup[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setGroups(getMockGroups());
    setMounted(true);
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Departments & Groups</h1>
          <p className="text-sm text-slate-500 mt-1">
            View, manage, and create campus departments and participant groups.
          </p>
        </div>

        <Link
          href="/admin/admin/groups/new"
          className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Create Group
        </Link>
      </div>

      {/* Grid of groups */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {(mounted ? groups : []).map((group) => (
          <div
            key={group.id}
            className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group"
          >
            <div>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 ring-1 ring-emerald-100">
                  <Building2 className="w-5 h-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="text-base font-bold text-slate-900 truncate group-hover:text-emerald-700 transition-colors">
                    {group.name}
                  </h2>
                  <span className="inline-block mt-1 text-xs text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-medium ring-1 ring-emerald-200 truncate max-w-full">
                    {group.activeChallenge}
                  </span>
                </div>
              </div>

              <p className="mt-3 text-sm text-slate-600 line-clamp-2">
                {group.description}
              </p>
            </div>

            <div className="mt-5 pt-4 border-t border-slate-100 space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span className="inline-flex items-center gap-1.5 font-medium text-slate-600">
                  <Users className="w-3.5 h-3.5 text-slate-400" />
                  {group.membersCount} {group.membersCount === 1 ? "member" : "members"}
                </span>
                <span className="inline-flex items-center gap-1 font-semibold text-slate-700">
                  <Award className="w-3.5 h-3.5 text-amber-500" />
                  {group.totalPoints.toLocaleString()} pts
                </span>
              </div>

              <Link
                href={`/admin/admin/groups/${group.id}`}
                className="w-full inline-flex items-center justify-between text-sm font-semibold text-emerald-600 hover:text-emerald-700 pt-1 group-hover:underline"
              >
                <span>Manage Department</span>
                <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}