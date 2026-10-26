import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Calendar, Tag, Users, Layers, ChevronRight } from "lucide-react";
import { getMockChallenge, BADGE_STYLES } from "../mock-data";

// In Next.js 15, params is a Promise and must be awaited.
type ChallengeDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function ChallengeDetailPage(props: ChallengeDetailPageProps) {
  const urlParams = await props.params;
  const id = urlParams.id;

  const challenge = getMockChallenge(id);

  // Unknown id (e.g. /challenges/99) → 404 page.
  if (!challenge) {
    notFound();
  }

  const badgeColor = BADGE_STYLES[challenge.status];
  const badgeClass = "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset " + badgeColor;
  const dateRange = challenge.startDate + " - " + challenge.endDate;
  const participantCountText = String(challenge.participantCount);
  const hasLeaderboard = challenge.leaderboard.length > 0;
  const actionsCount = challenge.actions?.length || 0;

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

      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">{challenge.title}</h1>
            <p className="font-mono text-sm text-slate-500 mt-1">{challenge.code}</p>
          </div>
          <span className={badgeClass}>{challenge.status}</span>
        </div>
        <p className="mt-4 text-sm text-slate-600">{challenge.description}</p>
        <dl className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
          <Stat icon={Calendar} label="Dates" value={dateRange} />
          <Stat icon={Tag} label="Category" value={challenge.category} />
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
            <p className="text-sm text-slate-500">Leaderboard opens when the challenge starts.</p>
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
                  <tr key={row.rank}>
                    <td className="py-2 pr-3 w-12 font-semibold text-slate-400">#{row.rank}</td>
                    <td className="py-2 font-medium text-slate-900">{row.name}</td>
                    <td className="py-2 text-slate-500">{row.team}</td>
                    <td className="py-2 text-right font-semibold text-emerald-700">{row.points}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Section>

        <Section title="Participant Roster">
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
              {/* Keyed by name: mock emails are all identical, and keys must be unique. */}
              {challenge.participants.map((person) => (
                <tr key={person.name}>
                  <td className="py-2 pr-3 text-slate-900 whitespace-nowrap">{person.name}</td>
                  <td className="py-2 pr-3 text-slate-500">{person.email}</td>
                  <td className="py-2 pr-3 text-slate-500 whitespace-nowrap">{person.team}</td>
                  <td className="py-2 text-slate-500 whitespace-nowrap">{person.joined}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Section>
      </div>
    </div>
  );
}

type SectionProps = {
  title: string;
  children: React.ReactNode;
};

// Card with a heading, used for the Leaderboard and Roster.
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
