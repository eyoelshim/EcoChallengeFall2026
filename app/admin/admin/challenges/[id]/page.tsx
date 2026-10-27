import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Calendar, Tag, Users, Layers, ChevronRight, Building2 } from "lucide-react";
import type { ChallengeStatus } from "@prisma/client";

import { getAdminChallengeById } from "@/app/actions/admin-challenges";

export const dynamic = "force-dynamic";

const BADGE_STYLES: Record<ChallengeStatus, string> = {
  ACTIVE: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  UPCOMING: "bg-blue-50 text-blue-700 ring-blue-600/20",
  COMPLETED: "bg-slate-100 text-slate-600 ring-slate-500/20",
  ARCHIVED: "bg-amber-50 text-amber-700 ring-amber-600/20",
};

const STATUS_LABELS: Record<ChallengeStatus, string> = {
  ACTIVE: "Active",
  UPCOMING: "Upcoming",
  COMPLETED: "Completed",
  ARCHIVED: "Archived",
};

// Challenge dates are stored as UTC midnight, so format in UTC to avoid showing the previous day
function formatDate(date: Date | null) {
  if (!date) return "—";
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" });
}

// In Next.js 15, params is a Promise and must be awaited.
type ChallengeDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function ChallengeDetailPage(props: ChallengeDetailPageProps) {
  const urlParams = await props.params;
  const id = urlParams.id;

  const challenge = await getAdminChallengeById(id);

  // Unknown id (e.g. /challenges/99) → 404 page.
  if (!challenge) {
    notFound();
  }

  const badgeColor = BADGE_STYLES[challenge.status];
  const badgeClass = "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset " + badgeColor;
  const dateRange = formatDate(challenge.startDate) + " - " + formatDate(challenge.endDate);
  const participantCountText = String(challenge.participantCount);
  const hasLeaderboard = challenge.leaderboard.length > 0;
  const actionsCount = challenge.actions.length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Link
          href="/admin/admin/challenges"
          className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to challenges
        </Link>
        <Link
          href={`/admin/admin/challenges/${id}/actions`}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 ring-1 ring-emerald-200 rounded-lg text-xs font-semibold transition-colors"
        >
          <Layers className="w-3.5 h-3.5" />
          Manage Challenge Actions ({actionsCount}) &rarr;
        </Link>
      </div>

      <div
        className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm border-t-4"
        style={{ borderTopColor: challenge.themeColor ?? undefined }}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">{challenge.name}</h1>
            <p className="font-mono text-sm text-slate-500 mt-1">{challenge.code}</p>
          </div>
          <span className={badgeClass}>{STATUS_LABELS[challenge.status]}</span>
        </div>
        <p className="mt-4 text-sm text-slate-600">{challenge.description}</p>
        <dl className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
          <Stat icon={Calendar} label="Dates" value={dateRange} />
          <Stat icon={Tag} label="Category" value={challenge.category ?? "—"} />
          <Stat icon={Building2} label="Department" value={challenge.department ?? "—"} />
          <Stat icon={Users} label="Participant Count" value={participantCountText} />
        </dl>
      </div>

      {/* Associated Actions Section */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
          <div>
            <h2 className="text-base font-semibold text-slate-900">
              Configured Challenge Actions ({actionsCount})
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Specific sustainability tasks participants can complete to earn points in this challenge.
            </p>
          </div>
          <Link
            href={`/admin/admin/challenges/${id}/actions`}
            className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 inline-flex items-center gap-1"
          >
            <span>Edit Actions</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {actionsCount === 0 ? (
          <p className="text-sm text-slate-500 py-2">
            No custom actions configured yet.{" "}
            <Link
              href={`/admin/admin/challenges/${id}/actions`}
              className="text-emerald-600 font-medium hover:underline"
            >
              Add actions
            </Link>{" "}
            to allow participant logging.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {challenge.actions.map((act) => (
              <div
                key={act.id}
                className="p-3 rounded-lg border border-slate-100 bg-slate-50 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded bg-white text-slate-600 border border-slate-200">
                      {act.category}
                    </span>
                    <span className="text-xs font-bold text-emerald-700">+{act.points} pts</span>
                  </div>
                  <h3 className="text-xs font-bold text-slate-900 mt-1 line-clamp-1">{act.title}</h3>
                  <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-2 leading-relaxed">
                    {act.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Section title="Leaderboard">
          {!hasLeaderboard && (
            <p className="text-sm text-slate-500">No points logged in this challenge yet.</p>
          )}

          {hasLeaderboard && (
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-slate-500">
                  <th className="pb-2 font-medium">Rank</th>
                  <th className="pb-2 font-medium">Name</th>
                  <th className="pb-2 font-medium">Team</th>
                  <th className="pb-2 font-medium text-right">Points</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {challenge.leaderboard.map((row) => (
                  <tr key={row.userId}>
                    <td className="py-2 pr-3 w-12 font-semibold text-slate-400">#{row.rank}</td>
                    <td className="py-2 font-medium text-slate-900">{row.name}</td>
                    <td className="py-2 text-slate-500">{row.team ?? "—"}</td>
                    <td className="py-2 text-right font-semibold text-emerald-700">{row.points}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Section>

        <Section title="Participant Roster">
          {challenge.participants.length === 0 ? (
            <p className="text-sm text-slate-500">No one has joined this challenge yet.</p>
          ) : (
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-slate-500">
                  <th className="pb-2 font-medium">Name</th>
                  <th className="pb-2 font-medium">Email</th>
                  <th className="pb-2 font-medium">Team</th>
                  <th className="pb-2 font-medium whitespace-nowrap">Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {challenge.participants.map((person) => (
                  <tr key={person.id}>
                    <td className="py-2 pr-3 text-slate-900 whitespace-nowrap">{person.name}</td>
                    <td className="py-2 pr-3 text-slate-500">{person.email}</td>
                    <td className="py-2 pr-3 text-slate-500 whitespace-nowrap">{person.team ?? "—"}</td>
                    <td className="py-2 text-slate-500 whitespace-nowrap">{formatDate(person.joinedAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Section>
      </div>

      <Section title="Recent Action Logs">
        {challenge.recentActions.length === 0 ? (
          <p className="text-sm text-slate-500">No actions logged in this challenge yet.</p>
        ) : (
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left text-slate-500">
                <th className="pb-2 font-medium">Participant</th>
                <th className="pb-2 font-medium">Action</th>
                <th className="pb-2 font-medium">Category</th>
                <th className="pb-2 font-medium whitespace-nowrap">Date</th>
                <th className="pb-2 font-medium text-right">Points</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {challenge.recentActions.map((action) => (
                <tr key={action.id}>
                  <td className="py-2 pr-3 text-slate-900 whitespace-nowrap">{action.userName}</td>
                  <td className="py-2 pr-3 text-slate-700">{action.actionType}</td>
                  <td className="py-2 pr-3 text-slate-500">{action.category}</td>
                  <td className="py-2 pr-3 text-slate-500 whitespace-nowrap">{formatDate(action.date)}</td>
                  <td className="py-2 text-right font-semibold text-emerald-700">+{action.points}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Section>
    </div>
  );
}

type SectionProps = {
  title: string;
  children: React.ReactNode;
};

// Card with a heading, used for the Leaderboard, Roster, and Action Logs.
function Section(props: SectionProps) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm overflow-x-auto">
      <h2 className="text-base font-semibold text-slate-900 mb-4">{props.title}</h2>
      {props.children}
    </div>
  );
}

type StatProps = {
  icon: React.ElementType; // a lucide-react icon
  label: string;
  value: string;
};

// Icon + label + value box in the overview card.
function Stat(props: StatProps) {
  const Icon = props.icon;

  return (
    <div className="flex items-center gap-3 rounded-lg bg-slate-50 p-3">
      <Icon className="w-5 h-5 text-emerald-600" />
      <div>
        <dt className="text-slate-500">{props.label}</dt>
        <dd className="font-medium text-slate-900">{props.value}</dd>
      </div>
    </div>
  );
}
