// Hardcoded demo data for Sprint 1 / Demo 1. Will be replaced by Clerk + Neon data in Sprint 2.

export const ROLES = ["SuperAdmin", "Admin", "GeneralUser"] as const;
export type Role = (typeof ROLES)[number];

export const ROLE_BADGE_STYLES: Record<Role, string> = {
  SuperAdmin: "bg-purple-50 text-purple-700 ring-purple-200",
  Admin: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  GeneralUser: "bg-slate-100 text-slate-700 ring-slate-200",
};

export const DEPARTMENTS = [
  "Engineering",
  "Facilities",
  "Finance",
  "Human Resources",
  "Marketing",
  "Operations",
] as const;

export type Badge = {
  name: string;
  description: string;
  earnedAt: string;
};

export type Activity = {
  id: string;
  action: string;
  category: "Transport" | "Water" | "Energy" | "Recycling" | "Food";
  points: number;
  date: string;
};

export type MockUser = {
  id: string;
  name: string;
  email: string;
  department: string;
  role: Role;
  streak: number;
  actionsLogged: number;
  points: number;
  joinedAt: string;
  badges: Badge[];
  recentActivity: Activity[];
};

export const MOCK_USERS: MockUser[] = [
  {
    id: "u1",
    name: "Jordan Reyes",
    email: "jordan.reyes@greenstep.org",
    department: "Operations",
    role: "SuperAdmin",
    streak: 21,
    actionsLogged: 64,
    points: 1280,
    joinedAt: "2026-08-04",
    badges: [
      { name: "First Step", description: "Logged a first action", earnedAt: "2026-08-04" },
      { name: "3-Week Streak", description: "Logged actions 21 days in a row", earnedAt: "2026-10-10" },
      { name: "Pedal Power", description: "10 bike commutes", earnedAt: "2026-09-02" },
    ],
    recentActivity: [
      { id: "a1", action: "Biked to work", category: "Transport", points: 25, date: "2026-10-13" },
      { id: "a2", action: "Brought a reusable lunch container", category: "Recycling", points: 10, date: "2026-10-12" },
      { id: "a3", action: "Turned off office lights at end of day", category: "Energy", points: 10, date: "2026-10-11" },
      { id: "a4", action: "Ate a plant-based lunch", category: "Food", points: 15, date: "2026-10-10" },
    ],
  },
  {
    id: "u2",
    name: "Marcus Lee",
    email: "marcus.lee@greenstep.org",
    department: "Engineering",
    role: "Admin",
    streak: 9,
    actionsLogged: 37,
    points: 740,
    joinedAt: "2026-08-12",
    badges: [
      { name: "First Step", description: "Logged a first action", earnedAt: "2026-08-12" },
      { name: "Energy Saver", description: "15 energy actions", earnedAt: "2026-09-28" },
    ],
    recentActivity: [
      { id: "a1", action: "Unplugged idle electronics", category: "Energy", points: 10, date: "2026-10-13" },
      { id: "a2", action: "Took the bus", category: "Transport", points: 20, date: "2026-10-12" },
      { id: "a3", action: "Took a 5-minute shower", category: "Water", points: 10, date: "2026-10-11" },
    ],
  },
  {
    id: "u3",
    name: "Priya Shah",
    email: "priya.shah@greenstep.org",
    department: "Marketing",
    role: "GeneralUser",
    streak: 14,
    actionsLogged: 42,
    points: 860,
    joinedAt: "2026-08-20",
    badges: [
      { name: "First Step", description: "Logged a first action", earnedAt: "2026-08-20" },
      { name: "2-Week Streak", description: "Logged actions 14 days in a row", earnedAt: "2026-10-12" },
      { name: "Zero Waste Hero", description: "20 recycling actions", earnedAt: "2026-10-01" },
    ],
    recentActivity: [
      { id: "a1", action: "Composted food scraps", category: "Recycling", points: 15, date: "2026-10-13" },
      { id: "a2", action: "Used a refillable water bottle", category: "Recycling", points: 5, date: "2026-10-12" },
      { id: "a3", action: "Carpooled to the office", category: "Transport", points: 20, date: "2026-10-11" },
    ],
  },
  {
    id: "u4",
    name: "Daniel Okafor",
    email: "daniel.okafor@greenstep.org",
    department: "Finance",
    role: "GeneralUser",
    streak: 3,
    actionsLogged: 12,
    points: 210,
    joinedAt: "2026-09-15",
    badges: [
      { name: "First Step", description: "Logged a first action", earnedAt: "2026-09-15" },
    ],
    recentActivity: [
      { id: "a1", action: "Fixed a leaky faucet", category: "Water", points: 20, date: "2026-10-13" },
      { id: "a2", action: "Printed double-sided", category: "Recycling", points: 5, date: "2026-10-12" },
    ],
  },
  {
    id: "u5",
    name: "Sofia Alvarez",
    email: "sofia.alvarez@greenstep.org",
    department: "Human Resources",
    role: "GeneralUser",
    streak: 0,
    actionsLogged: 5,
    points: 85,
    joinedAt: "2026-10-01",
    badges: [],
    recentActivity: [
      { id: "a1", action: "Walked to a meeting", category: "Transport", points: 10, date: "2026-10-06" },
    ],
  },
];

export function getMockUser(id: string) {
  return MOCK_USERS.find((user) => user.id === id);
}

export function formatDate(date: string) {
  return new Date(`${date}T00:00:00`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
