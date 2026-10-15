import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Calendar, Tag, Users } from "lucide-react";
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

  return (
    <div className="space-y-6">
      <Link
        href="/admin/admin/challenges"
        className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-900 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to challenges
      </Link>

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
