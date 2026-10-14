import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Calendar, Tag, Users } from "lucide-react";

type Status = "Active" | "Upcoming" | "Completed";

type LeaderboardRow = {
  rank: number;
  name: string;
  team: string;
  points: number;
};

type Participant = {
  name: string;
  email: string;
  team: string;
  joined: string;
};

type Challenge = {
  id: string;
  title: string;
  code: string;
  startDate: string;
  endDate: string;
  category: string;
  status: Status;
  participantCount: number;
  description: string;
  leaderboard: LeaderboardRow[]; // empty until the challenge starts
  participants: Participant[];
};

// Mock data for Demo 1. Keep in sync with challenges/page.tsx until the API is wired up.
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
    description: "Encourage biking, walking, transit, and carpooling instead of driving solo to campus.",
    leaderboard: [
      { rank: 1, name: "Ebin Thomas", team: "Pedal Pushers", points: 1240 },
      { rank: 2, name: "Anna Mary", team: "Bus Buddies", points: 1105 },
      { rank: 3, name: "Uyen Thy", team: "Pedal Pushers", points: 990 },
      { rank: 4, name: "Eyoel Woldehawariat", team: "Carpool Crew", points: 870 },
    ],
    participants: [
      { name: "Ebin Thomas", email: "example@email.com", team: "Pedal Pushers", joined: "2026-09-28" },
      { name: "Anna Mary", email: "example@email.com", team: "Bus Buddies", joined: "2026-09-29" },
      { name: "Uyen Thy", email: "example@email.com", team: "Pedal Pushers", joined: "2026-09-30" },
      { name: "Eyoel Woldehawariat", email: "example@email.com", team: "Carpool Crew", joined: "2026-10-01" },
    ],
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
    description: "Cut electricity use with lights-off, unplugging, and cold-wash habits for one week.",
    leaderboard: [],
    participants: [
      { name: "Anna Mary", email: "example@email.com", team: "Watt Watchers", joined: "2026-10-08" },
      { name: "Eyoel Woldehawariat", email: "example@email.com", team: "Unplugged", joined: "2026-10-10" },
      { name: "Uyen Thy", email: "example@email.com", team: "Watt Watchers", joined: "2026-10-12" },
    ],
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
    description: "Minimize landfill waste through reusables, composting, and recycling.",
    leaderboard: [
      { rank: 1, name: "Uyen Thy", team: "Compost Kings", points: 1480 },
      { rank: 2, name: "Eyoel Woldehawariat", team: "Reuse Revolution", points: 1320 },
      { rank: 3, name: "Anna Mary", team: "Compost Kings", points: 1190 },
      { rank: 4, name: "Ebin Thomas", team: "Bin There", points: 1045 },
    ],
    participants: [
      { name: "Uyen Thy", email: "example@email.com", team: "Compost Kings", joined: "2026-04-06" },
      { name: "Eyoel Woldehawariat", email: "example@email.com", team: "Reuse Revolution", joined: "2026-04-07" },
      { name: "Anna Mary", email: "example@email.com", team: "Compost Kings", joined: "2026-04-08" },
      { name: "Ebin Thomas", email: "example@email.com", team: "Bin There", joined: "2026-04-10" },
    ],
  },
];

// Badge colors per status. Must match challenges/page.tsx.
const badgeStyles: Record<Status, string> = {
  Active: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  Upcoming: "bg-blue-50 text-blue-700 ring-blue-600/20",
  Completed: "bg-slate-100 text-slate-600 ring-slate-500/20",
};

// In Next.js 15, params is a Promise and must be awaited.
type ChallengeDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function ChallengeDetailPage(props: ChallengeDetailPageProps) {
  const urlParams = await props.params;
  const id = urlParams.id;

  const challenge = challenges.find((c) => {
    return c.id === id;
  });

  // Unknown id (e.g. /challenges/99) → 404 page.
  if (!challenge) {
    notFound();
  }

  const badgeColor = badgeStyles[challenge.status];
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
