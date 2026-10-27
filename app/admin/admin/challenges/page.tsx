import React from "react";
import Link from "next/link";
import { Plus, Eye, Search } from "lucide-react";
import type { ChallengeStatus } from "@prisma/client";

import { getAdminChallenges } from "@/app/actions/admin-challenges";

export const dynamic = "force-dynamic";

// Last heading is blank: that column holds the View button.
const columnHeadings = ["Title", "Code", "Dates", "Category", "Department", "Status", "Participant Count", ""];

const STATUS_TABS: { label: string; status?: ChallengeStatus }[] = [
  { label: "All" },
  { label: "Active", status: "ACTIVE" },
  { label: "Upcoming", status: "UPCOMING" },
  { label: "Completed", status: "COMPLETED" },
  { label: "Archived", status: "ARCHIVED" },
];

const BADGE_STYLES: Record<ChallengeStatus, string> = {
  ACTIVE: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  UPCOMING: "bg-blue-50 text-blue-700 ring-blue-600/20",
  COMPLETED: "bg-slate-100 text-slate-600 ring-slate-500/20",
  ARCHIVED: "bg-amber-50 text-amber-700 ring-amber-600/20",
};

// Challenge dates are stored as UTC midnight, so format in UTC to avoid showing the previous day
function formatDate(date: Date | null) {
  if (!date) return "—";
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" });
}

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

function param(value: string | string[] | undefined) {
  return typeof value === "string" && value ? value : undefined;
}

export default async function AdminChallengesPage({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;
  const status = param(sp.status);
  const search = param(sp.search);
  const challenges = await getAdminChallenges({ status, search });

  function tabHref(tabStatus?: ChallengeStatus) {
    const next = new URLSearchParams();
    if (tabStatus) next.set("status", tabStatus);
    if (search) next.set("search", search);
    const qs = next.toString();
    return qs ? `/admin/admin/challenges?${qs}` : "/admin/admin/challenges";
  }

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

      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5" role="tablist" aria-label="Filter by status">
          {STATUS_TABS.map((tab) => {
            const active = status === tab.status;
            return (
              <Link
                key={tab.label}
                href={tabHref(tab.status)}
                role="tab"
                aria-selected={active}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors ${
                  active
                    ? "bg-slate-900 text-white border-slate-900"
                    : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                }`}
              >
                {tab.label}
              </Link>
            );
          })}
        </div>

        {/* Plain GET form: submitting reloads the page with ?search=, keeping the status tab */}
        <form method="get" action="/admin/admin/challenges" className="relative w-full lg:max-w-sm">
          {status && <input type="hidden" name="status" value={status} />}
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="search"
            name="search"
            defaultValue={search}
            placeholder="Search title, code, category..."
            aria-label="Search challenges"
            className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
          />
        </form>
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
            {challenges.length === 0 && (
              <tr>
                <td colSpan={columnHeadings.length} className="px-4 py-8 text-center text-slate-500">
                  No challenges match these filters.
                </td>
              </tr>
            )}
            {challenges.map((challenge) => {
              const dateRange = formatDate(challenge.startDate) + " - " + formatDate(challenge.endDate);
              const badgeColor = BADGE_STYLES[challenge.status];
              const badgeClass = "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset " + badgeColor;
              const statusLabel = STATUS_TABS.find((tab) => tab.status === challenge.status)?.label;
              const detailLink = "/admin/admin/challenges/" + challenge.id;

              return (
                <tr key={challenge.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3 font-medium text-slate-900">{challenge.name}</td>
                  <td className="px-4 py-3 font-mono text-slate-500">{challenge.code}</td>
                  <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{dateRange}</td>
                  <td className="px-4 py-3 text-slate-600">{challenge.category ?? "—"}</td>
                  <td className="px-4 py-3 text-slate-600">{challenge.department ?? "—"}</td>
                  <td className="px-4 py-3">
                    <span className={badgeClass}>{statusLabel}</span>
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
