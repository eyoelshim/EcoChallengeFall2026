// Mock participation and reporting dataset for Cross-Challenge Reports & Analytics.
// Mirrors data structures from the original admin app (Fork_Greenstepchallenge_admin-main/src/admin-app/src/features/reports)

export interface ParticipationRecord {
  id: string;
  userId: string;
  userName: string;
  challengeId: string;
  challengeName: string;
  action: string;
  category: "Transportation" | "Waste & Recycling" | "Energy Conservation" | "Water Conservation" | "Food";
  points: number;
  completedAt: string;
  notes: string;
}

export interface ReportChallengeOption {
  id: string;
  name: string;
}

export const REPORT_CHALLENGES: ReportChallengeOption[] = [
  { id: "1", name: "Commuter Challenge" },
  { id: "2", name: "Energy Saver Sprint" },
  { id: "3", name: "Zero Waste Week" },
  { id: "c1", name: "Earth Month 2026" },
  { id: "c2", name: "Energy Conservation Sprint" },
  { id: "c3", name: "Campus Clean Water Drive" },
];

export const INITIAL_PARTICIPATION_RECORDS: ParticipationRecord[] = [
  {
    id: "p1",
    userId: "u1",
    userName: "Jordan Reyes",
    challengeId: "1",
    challengeName: "Commuter Challenge",
    action: "Biked to work",
    category: "Transportation",
    points: 25,
    completedAt: "2026-10-14",
    notes: "Commuted 8 miles on bicycle",
  },
  {
    id: "p2",
    userId: "u2",
    userName: "Marcus Lee",
    challengeId: "2",
    challengeName: "Energy Saver Sprint",
    action: "Unplugged idle lab electronics",
    category: "Energy Conservation",
    points: 10,
    completedAt: "2026-10-14",
    notes: "Lab bench equipment powered down",
  },
  {
    id: "p3",
    userId: "u3",
    userName: "Priya Shah",
    challengeId: "3",
    challengeName: "Zero Waste Week",
    action: "Composted food scraps",
    category: "Waste & Recycling",
    points: 15,
    completedAt: "2026-10-13",
    notes: "Cafeteria organic waste bin",
  },
  {
    id: "p4",
    userId: "u1",
    userName: "Jordan Reyes",
    challengeId: "3",
    challengeName: "Zero Waste Week",
    action: "Brought reusable lunch box",
    category: "Waste & Recycling",
    points: 10,
    completedAt: "2026-10-13",
    notes: "Zero single-use plastics",
  },
  {
    id: "p5",
    userId: "u2",
    userName: "Marcus Lee",
    challengeId: "1",
    challengeName: "Commuter Challenge",
    action: "Took public transit",
    category: "Transportation",
    points: 20,
    completedAt: "2026-10-13",
    notes: "Green Line LRT to campus",
  },
  {
    id: "p6",
    userId: "u4",
    userName: "Daniel Okafor",
    challengeId: "c3",
    challengeName: "Campus Clean Water Drive",
    action: "Fixed leaky faucet",
    category: "Water Conservation",
    points: 20,
    completedAt: "2026-10-12",
    notes: "Breakroom sink aerator replacement",
  },
  {
    id: "p7",
    userId: "u1",
    userName: "Jordan Reyes",
    challengeId: "c2",
    challengeName: "Energy Conservation Sprint",
    action: "Turned off office lights",
    category: "Energy Conservation",
    points: 10,
    completedAt: "2026-10-12",
    notes: "All floor lights switched off at 5 PM",
  },
  {
    id: "p8",
    userId: "u2",
    userName: "Marcus Lee",
    challengeId: "c3",
    challengeName: "Campus Clean Water Drive",
    action: "5-minute shower challenge",
    category: "Water Conservation",
    points: 10,
    completedAt: "2026-10-12",
    notes: "Timed with shower timer app",
  },
  {
    id: "p9",
    userId: "u3",
    userName: "Priya Shah",
    challengeId: "3",
    challengeName: "Zero Waste Week",
    action: "Used refillable water bottle",
    category: "Waste & Recycling",
    points: 5,
    completedAt: "2026-10-12",
    notes: "Refilled at campus station",
  },
  {
    id: "p10",
    userId: "u1",
    userName: "Jordan Reyes",
    challengeId: "c1",
    challengeName: "Earth Month 2026",
    action: "Ate plant-based lunch",
    category: "Food",
    points: 15,
    completedAt: "2026-10-11",
    notes: "Lentil soup and locally sourced salad",
  },
  {
    id: "p11",
    userId: "u3",
    userName: "Priya Shah",
    challengeId: "1",
    challengeName: "Commuter Challenge",
    action: "Carpooled to campus",
    category: "Transportation",
    points: 20,
    completedAt: "2026-10-11",
    notes: "Shared ride with 3 department colleagues",
  },
  {
    id: "p12",
    userId: "u4",
    userName: "Daniel Okafor",
    challengeId: "3",
    challengeName: "Zero Waste Week",
    action: "Printed double-sided",
    category: "Waste & Recycling",
    points: 5,
    completedAt: "2026-10-11",
    notes: "Monthly department budget report",
  },
  {
    id: "p13",
    userId: "u2",
    userName: "Marcus Lee",
    challengeId: "c2",
    challengeName: "Energy Conservation Sprint",
    action: "Adjusted thermostat",
    category: "Energy Conservation",
    points: 20,
    completedAt: "2026-10-10",
    notes: "Set thermostat to eco 68 degrees",
  },
  {
    id: "p14",
    userId: "u1",
    userName: "Jordan Reyes",
    challengeId: "c3",
    challengeName: "Campus Clean Water Drive",
    action: "Used refillable bottle",
    category: "Water Conservation",
    points: 10,
    completedAt: "2026-10-10",
    notes: "Refilled 3 times throughout day",
  },
  {
    id: "p15",
    userId: "u1",
    userName: "Jordan Reyes",
    challengeId: "1",
    challengeName: "Commuter Challenge",
    action: "Carpool to campus",
    category: "Transportation",
    points: 20,
    completedAt: "2026-10-09",
    notes: "Carpool vanpool participation",
  },
  {
    id: "p16",
    userId: "u5",
    userName: "Sofia Alvarez",
    challengeId: "1",
    challengeName: "Commuter Challenge",
    action: "Walked to meeting",
    category: "Transportation",
    points: 10,
    completedAt: "2026-10-06",
    notes: "Walked across campus instead of shuttle",
  },
];

export const CATEGORY_COLORS: Record<string, string> = {
  Transportation: "#10B981", // emerald-500
  "Waste & Recycling": "#3B82F6", // blue-500
  "Energy Conservation": "#F59E0B", // amber-500
  "Water Conservation": "#06B6D4", // cyan-500
  Food: "#8B5CF6", // purple-500
};

export const CATEGORY_BADGES: Record<string, string> = {
  Transportation: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  "Waste & Recycling": "bg-blue-50 text-blue-700 ring-blue-200",
  "Energy Conservation": "bg-amber-50 text-amber-700 ring-amber-200",
  "Water Conservation": "bg-cyan-50 text-cyan-700 ring-cyan-200",
  Food: "bg-purple-50 text-purple-700 ring-purple-200",
};
