import React from "react";
import Link from "next/link";
import { Plus, Eye } from "lucide-react";

import { getMockChallenges, BADGE_STYLES } from "./mock-data";

// Last heading is blank: that column holds the View button.
const columnHeadings = ["Title", "Code", "Dates", "Category", "Status", "Participant Count", ""];

export default function AdminChallengesPage() {
  const challenges = getMockChallenges();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Challenges Management</h1>
          <p className="text-sm text-slate-500 mt-1">
            Create, update, and manage sustainability challenges for participating teams.
          </p>
        </div>
        <Link
          href="/admin/admin/challenges/new"
          className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          New Challenge
        </Link>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50">
            <tr>
              {columnHeadings.map((heading) => (
                <th key={heading} className="px-4 py-3 text-left font-semibold text-slate-600 whitespace-nowrap">
                  {heading}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {challenges.map((challenge) => {
              const dateRange = challenge.startDate + " - " + challenge.endDate;
              const badgeColor = BADGE_STYLES[challenge.status];
              const badgeClass = "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset " + badgeColor;
              const detailLink = "/admin/admin/challenges/" + challenge.id;

              return (
                <tr key={challenge.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3 font-medium text-slate-900">{challenge.title}</td>
                  <td className="px-4 py-3 font-mono text-slate-500">{challenge.code}</td>
                  <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{dateRange}</td>
                  <td className="px-4 py-3 text-slate-600">{challenge.category}</td>
                  <td className="px-4 py-3">
                    <span className={badgeClass}>{challenge.status}</span>
                  </td>
                  <td className="px-4 py-3 text-slate-900">{challenge.participantCount}</td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={detailLink}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      View
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}