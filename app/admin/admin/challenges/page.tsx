import React from "react";
import Link from "next/link";
import { Plus, Eye } from "lucide-react";

type Status = "Active" | "Upcoming" | "Completed";

type Challenge = {
  id: string;
  title: string;
  code: string;
  startDate: string;
  endDate: string;
  category: string;
  status: Status;
  participantCount: number;
};

// Mock data for Demo 1. Keep in sync with challenges/[id]/page.tsx until the API is wired up.
const challenges: Challenge[] = [
  {
    id: "1",
    title: "Commuter Challenge",
    code: "CC-F26",
    startDate: "2026-10-01",
    endDate: "2026-10-31",
    category: "Transportation",
    status: "Active",
    participantCount: 84,
  },
  {
    id: "2",
    title: "Energy Saver Sprint",
    code: "ES-F26",
    startDate: "2026-11-02",
    endDate: "2026-11-09",
    category: "Energy",
    status: "Upcoming",
    participantCount: 26,
  },
  {
    id: "3",
    title: "Zero Waste Week",
    code: "ZW-S26",
    startDate: "2026-04-13",
    endDate: "2026-04-19",
    category: "Waste",
    status: "Completed",
    participantCount: 112,
  },
];

// Badge colors per status.
const badgeStyles: Record<Status, string> = {
  Active: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  Upcoming: "bg-blue-50 text-blue-700 ring-blue-600/20",
  Completed: "bg-slate-100 text-slate-600 ring-slate-500/20",
};

// Last heading is blank: that column holds the View button.
const columnHeadings = ["Title", "Code", "Dates", "Category", "Status", "Participant Count", ""];

export default function AdminChallengesPage() {
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
              const badgeColor = badgeStyles[challenge.status];
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