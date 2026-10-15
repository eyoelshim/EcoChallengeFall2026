/**
 * Mock Data Engine for Challenges Management (Sprint 1 Demo 1).
 * Single source of truth shared across challenges list, challenge detail,
 * challenge creation, and templates.
 */

export type Status = "Active" | "Upcoming" | "Completed";

export type LeaderboardRow = {
  rank: number;
  name: string;
  team: string;
  points: number;
};

export type Participant = {
  name: string;
  email: string;
  team: string;
  joined: string;
};

export type Challenge = {
  id: string;
  title: string;
  code: string;
  startDate: string;
  endDate: string;
  category: string;
  status: Status;
  participantCount: number;
  description: string;
  leaderboard: LeaderboardRow[];
  participants: Participant[];
};

export const BADGE_STYLES: Record<Status, string> = {
  Active: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  Upcoming: "bg-blue-50 text-blue-700 ring-blue-600/20",
  Completed: "bg-slate-100 text-slate-600 ring-slate-500/20",
};

export const CHALLENGE_CATEGORIES = [
  "Campus-wide",
  "Transportation",
  "Energy",
  "Waste",
  "Food",
] as const;

export type ChallengeCategory = (typeof CHALLENGE_CATEGORIES)[number];

export const INITIAL_MOCK_CHALLENGES: Challenge[] = [
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

const mockChallengesStore: Challenge[] = [...INITIAL_MOCK_CHALLENGES];

export function getMockChallenges(): Challenge[] {
  return [...mockChallengesStore];
}

export function getMockChallenge(id: string): Challenge | undefined {
  return mockChallengesStore.find((c) => c.id === id);
}

export function createMockChallenge(data: {
  name: string;
  code: string;
  category: string;
  startDate: string;
  endDate: string;
  description: string;
}): Challenge {
  const today = new Date().toISOString().slice(0, 10);
  let status: Status = "Upcoming";
  if (data.startDate <= today && data.endDate >= today) {
    status = "Active";
  } else if (data.endDate < today) {
    status = "Completed";
  }

  const newChallenge: Challenge = {
    id: String(mockChallengesStore.length + 1),
    title: data.name,
    code: data.code,
    startDate: data.startDate,
    endDate: data.endDate,
    category: data.category,
    status,
    participantCount: 0,
    description: data.description,
    leaderboard: [],
    participants: [],
  };

  mockChallengesStore.push(newChallenge);
  return newChallenge;
}

export const TEMPLATE_PRESETS: Record<
  string,
  { name: string; code: string; category: string; duration: string; description: string }
> = {
  commuter: {
    name: "Commuter Challenge",
    code: "CC-F26",
    category: "Transportation",
    duration: "2 weeks",
    description: "Encourage biking, walking, transit, and carpooling instead of driving solo.",
  },
  energy: {
    name: "Energy Saver Sprint",
    code: "ES-F26",
    category: "Energy",
    duration: "1 week",
    description: "Cut electricity use with lights-off, unplugging, and cold-wash habits.",
  },
  "zero-waste": {
    name: "Zero Waste Week",
    code: "ZW-S26",
    category: "Waste",
    duration: "1 week",
    description: "Minimize landfill waste through reusables, composting, and recycling.",
  },
  "food-based": {
    name: "Food-Based Challenge",
    code: "FB-F26",
    category: "Food",
    duration: "10 days",
    description: "Make greener food choices: less waste, more local, and fewer packaged meals.",
  },
};
