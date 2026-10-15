// Hardcoded demo data and state helpers for Users Management (mirrored from old admin app).
// Will be replaced by Clerk + Neon data in Sprint 2.

export const ROLES = ["SuperAdmin", "Admin", "GeneralUser"] as const;
export type Role = (typeof ROLES)[number];

export const USER_STATUSES = ["Active", "Deactivated"] as const;
export type UserStatus = (typeof USER_STATUSES)[number];

export const ROLE_BADGE_STYLES: Record<Role, string> = {
  SuperAdmin: "bg-purple-50 text-purple-700 ring-purple-200",
  Admin: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  GeneralUser: "bg-slate-100 text-slate-700 ring-slate-200",
};

export const STATUS_BADGE_STYLES: Record<UserStatus, string> = {
  Active: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  Deactivated: "bg-rose-50 text-rose-700 ring-rose-200",
};

export const DEPARTMENTS = [
  "Engineering",
  "Facilities",
  "Finance",
  "Human Resources",
  "Marketing",
  "Operations",
] as const;

export type MockGroup = {
  id: string;
  name: string;
  description: string;
};

export const MOCK_GROUPS: MockGroup[] = [
  { id: "g1", name: "Team Alpha", description: "Cross-functional sustainability champions" },
  { id: "g2", name: "Team Beta", description: "Product & Engineering eco-innovators" },
  { id: "g3", name: "UST Operations", description: "Campus facilities & environmental initiatives" },
  { id: "g4", name: "Green Campus Committee", description: "Student & staff leadership group" },
];

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

export type ParticipationRecord = {
  id: string;
  challengeId: string;
  challengeName: string;
  action: string;
  category: "Transport" | "Water" | "Energy" | "Recycling" | "Food";
  points: number;
  completedAt: string;
  notes?: string;
};

export type ChallengePoints = {
  challengeId: string;
  challengeName: string;
  points: number;
  target: number;
};

export type AdminAuditLog = {
  id: string;
  action: string;
  details: string;
  timestamp: string;
};

export type MockUser = {
  id: string;
  name: string;
  email: string;
  department: string;
  role: Role;
  status: UserStatus;
  groupId: string | null;
  groupName: string | null;
  streak: number;
  actionsLogged: number;
  points: number;
  joinedAt: string;
  lastActive: string;
  badges: Badge[];
  recentActivity: Activity[];
  participation: ParticipationRecord[];
  pointsBreakdown: ChallengePoints[];
  activityLogs: AdminAuditLog[];
};

export const INITIAL_MOCK_USERS: MockUser[] = [
  {
    id: "u1",
    name: "Jordan Reyes",
    email: "jordan.reyes@greenstep.org",
    department: "Operations",
    role: "SuperAdmin",
    status: "Active",
    groupId: "g1",
    groupName: "Team Alpha",
    streak: 21,
    actionsLogged: 64,
    points: 1280,
    joinedAt: "2026-08-04",
    lastActive: "2026-10-14 16:32",
    badges: [
      { name: "First Step", description: "Logged a first action", earnedAt: "2026-08-04" },
      { name: "3-Week Streak", description: "Logged actions 21 days in a row", earnedAt: "2026-10-10" },
      { name: "Pedal Power", description: "10 bike commutes", earnedAt: "2026-09-02" },
    ],
    recentActivity: [
      { id: "a1", action: "Biked to work", category: "Transport", points: 25, date: "2026-10-14" },
      { id: "a2", action: "Brought a reusable lunch container", category: "Recycling", points: 10, date: "2026-10-13" },
      { id: "a3", action: "Turned off office lights at end of day", category: "Energy", points: 10, date: "2026-10-12" },
      { id: "a4", action: "Ate a plant-based lunch", category: "Food", points: 15, date: "2026-10-11" },
    ],
    participation: [
      { id: "p1", challengeId: "c1", challengeName: "Earth Month 2026", action: "Biked to work", category: "Transport", points: 25, completedAt: "2026-10-14 08:30", notes: "Commuted 8 miles on bicycle" },
      { id: "p2", challengeId: "c1", challengeName: "Earth Month 2026", action: "Brought reusable lunch box", category: "Recycling", points: 10, completedAt: "2026-10-13 12:15", notes: "Zero single-use plastics" },
      { id: "p3", challengeId: "c2", challengeName: "Energy Conservation Sprint", action: "Turned off office lights", category: "Energy", points: 10, completedAt: "2026-10-12 17:45", notes: "All floor lights switched off" },
      { id: "p4", challengeId: "c1", challengeName: "Earth Month 2026", action: "Ate plant-based lunch", category: "Food", points: 15, completedAt: "2026-10-11 12:30", notes: "Lentil soup and salad" },
      { id: "p5", challengeId: "c3", challengeName: "Campus Clean Water Drive", action: "Used refillable bottle", category: "Water", points: 10, completedAt: "2026-10-10 10:00", notes: "Refilled 3 times" },
      { id: "p6", challengeId: "c1", challengeName: "Earth Month 2026", action: "Carpool to campus", category: "Transport", points: 20, completedAt: "2026-10-09 08:20", notes: "3 colleagues carpooled" },
    ],
    pointsBreakdown: [
      { challengeId: "c1", challengeName: "Earth Month 2026", points: 820, target: 1000 },
      { challengeId: "c2", challengeName: "Energy Conservation Sprint", points: 310, target: 400 },
      { challengeId: "c3", challengeName: "Campus Clean Water Drive", points: 150, target: 200 },
    ],
    activityLogs: [
      { id: "l1", action: "Created challenge", details: "Created 'Campus Clean Water Drive'", timestamp: "2026-10-01 10:00" },
      { id: "l2", action: "Exported CSV", details: "Exported all participant activity", timestamp: "2026-10-08 14:15" },
      { id: "l3", action: "Updated team assignment", details: "Assigned Marcus Lee to Team Beta", timestamp: "2026-10-12 11:20" },
    ],
  },
  {
    id: "u2",
    name: "Marcus Lee",
    email: "marcus.lee@greenstep.org",
    department: "Engineering",
    role: "Admin",
    status: "Active",
    groupId: "g2",
    groupName: "Team Beta",
    streak: 9,
    actionsLogged: 37,
    points: 740,
    joinedAt: "2026-08-12",
    lastActive: "2026-10-14 11:10",
    badges: [
      { name: "First Step", description: "Logged a first action", earnedAt: "2026-08-12" },
      { name: "Energy Saver", description: "15 energy actions", earnedAt: "2026-09-28" },
    ],
    recentActivity: [
      { id: "a1", action: "Unplugged idle electronics", category: "Energy", points: 10, date: "2026-10-14" },
      { id: "a2", action: "Took public transit", category: "Transport", points: 20, date: "2026-10-13" },
      { id: "a3", action: "Took a 5-minute shower", category: "Water", points: 10, date: "2026-10-12" },
    ],
    participation: [
      { id: "p1", challengeId: "c1", challengeName: "Earth Month 2026", action: "Unplugged idle electronics", category: "Energy", points: 10, completedAt: "2026-10-14 11:10", notes: "Lab bench equipment" },
      { id: "p2", challengeId: "c1", challengeName: "Earth Month 2026", action: "Took public transit", category: "Transport", points: 20, completedAt: "2026-10-13 08:45", notes: "Green Line LRT" },
      { id: "p3", challengeId: "c3", challengeName: "Campus Clean Water Drive", action: "5-min shower", category: "Water", points: 10, completedAt: "2026-10-12 07:15", notes: "Timed with shower timer" },
      { id: "p4", challengeId: "c2", challengeName: "Energy Conservation Sprint", action: "Adjusted thermostat", category: "Energy", points: 20, completedAt: "2026-10-10 18:00", notes: "Set to 68 degrees" },
    ],
    pointsBreakdown: [
      { challengeId: "c1", challengeName: "Earth Month 2026", points: 460, target: 800 },
      { challengeId: "c2", challengeName: "Energy Conservation Sprint", points: 280, target: 400 },
    ],
    activityLogs: [
      { id: "l1", action: "Approved team request", details: "Approved creation of 'Team Beta'", timestamp: "2026-09-10 09:30" },
      { id: "l2", action: "Exported user report", details: "Exported engineering department summary", timestamp: "2026-10-05 16:40" },
    ],
  },
  {
    id: "u3",
    name: "Priya Shah",
    email: "priya.shah@greenstep.org",
    department: "Marketing",
    role: "GeneralUser",
    status: "Active",
    groupId: "g1",
    groupName: "Team Alpha",
    streak: 14,
    actionsLogged: 42,
    points: 860,
    joinedAt: "2026-08-20",
    lastActive: "2026-10-13 15:45",
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
    participation: [
      { id: "p1", challengeId: "c1", challengeName: "Earth Month 2026", action: "Composted food scraps", category: "Recycling", points: 15, completedAt: "2026-10-13 13:00", notes: "Cafeteria organic waste bin" },
      { id: "p2", challengeId: "c1", challengeName: "Earth Month 2026", action: "Refillable bottle", category: "Recycling", points: 5, completedAt: "2026-10-12 09:30", notes: "Hydro flask" },
      { id: "p3", challengeId: "c1", challengeName: "Earth Month 2026", action: "Carpooled", category: "Transport", points: 20, completedAt: "2026-10-11 08:30", notes: "With Marketing peers" },
    ],
    pointsBreakdown: [
      { challengeId: "c1", challengeName: "Earth Month 2026", points: 860, target: 1000 },
    ],
    activityLogs: [],
  },
  {
    id: "u4",
    name: "Daniel Okafor",
    email: "daniel.okafor@greenstep.org",
    department: "Finance",
    role: "GeneralUser",
    status: "Active",
    groupId: "g3",
    groupName: "UST Operations",
    streak: 3,
    actionsLogged: 12,
    points: 210,
    joinedAt: "2026-09-15",
    lastActive: "2026-10-12 14:20",
    badges: [
      { name: "First Step", description: "Logged a first action", earnedAt: "2026-09-15" },
    ],
    recentActivity: [
      { id: "a1", action: "Fixed a leaky faucet", category: "Water", points: 20, date: "2026-10-12" },
      { id: "a2", action: "Printed double-sided", category: "Recycling", points: 5, date: "2026-10-11" },
    ],
    participation: [
      { id: "p1", challengeId: "c3", challengeName: "Campus Clean Water Drive", action: "Fixed leaky faucet", category: "Water", points: 20, completedAt: "2026-10-12 14:20", notes: "Breakroom sink" },
      { id: "p2", challengeId: "c1", challengeName: "Earth Month 2026", action: "Printed double-sided", category: "Recycling", points: 5, completedAt: "2026-10-11 11:00", notes: "Monthly budget report" },
    ],
    pointsBreakdown: [
      { challengeId: "c1", challengeName: "Earth Month 2026", points: 150, target: 500 },
      { challengeId: "c3", challengeName: "Campus Clean Water Drive", points: 60, target: 200 },
    ],
    activityLogs: [],
  },
  {
    id: "u5",
    name: "Sofia Alvarez",
    email: "sofia.alvarez@greenstep.org",
    department: "Human Resources",
    role: "GeneralUser",
    status: "Deactivated",
    groupId: null,
    groupName: null,
    streak: 0,
    actionsLogged: 5,
    points: 85,
    joinedAt: "2026-10-01",
    lastActive: "2026-10-06 09:15",
    badges: [],
    recentActivity: [
      { id: "a1", action: "Walked to a meeting", category: "Transport", points: 10, date: "2026-10-06" },
    ],
    participation: [
      { id: "p1", challengeId: "c1", challengeName: "Earth Month 2026", action: "Walked to meeting", category: "Transport", points: 10, completedAt: "2026-10-06 09:15", notes: "Avoided driving campus shuttle" },
    ],
    pointsBreakdown: [
      { challengeId: "c1", challengeName: "Earth Month 2026", points: 85, target: 500 },
    ],
    activityLogs: [
      { id: "l1", action: "User Deactivated", details: "Deactivated by SuperAdmin Jordan Reyes", timestamp: "2026-10-07 10:00" },
    ],
  },
];

// In-memory / storage sync for interactive mock demo
const STORAGE_KEY = "greenstep_mock_users_v1";

function loadStorageUsers(): MockUser[] {
  if (typeof window === "undefined") return INITIAL_MOCK_USERS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_MOCK_USERS));
      return INITIAL_MOCK_USERS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_MOCK_USERS;
  }
}

function saveStorageUsers(users: MockUser[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
  } catch (err) {
    console.error("Failed to persist mock users:", err);
  }
}

// Global exported array for backward compatibility
export let MOCK_USERS: MockUser[] = INITIAL_MOCK_USERS;

export function getMockUsers(): MockUser[] {
  MOCK_USERS = loadStorageUsers();
  return MOCK_USERS;
}

export function getMockUser(id: string): MockUser | undefined {
  return getMockUsers().find((user) => user.id === id);
}

export function getMockUserByEmail(email: string): MockUser | undefined {
  const clean = email.trim().toLowerCase();
  return getMockUsers().find((u) => u.email.toLowerCase() === clean);
}

export function updateMockUser(id: string, updates: Partial<MockUser>): MockUser | undefined {
  const users = getMockUsers();
  const index = users.findIndex((u) => u.id === id);
  if (index === -1) return undefined;

  let groupName = users[index].groupName;
  if ("groupId" in updates) {
    const grp = MOCK_GROUPS.find((g) => g.id === updates.groupId);
    groupName = grp ? grp.name : null;
  }

  const updated: MockUser = {
    ...users[index],
    ...updates,
    groupName: updates.groupName !== undefined ? updates.groupName : groupName,
  };
  users[index] = updated;
  saveStorageUsers(users);
  MOCK_USERS = users;
  return updated;
}

export function toggleMockUserStatus(id: string): MockUser | undefined {
  const user = getMockUser(id);
  if (!user) return undefined;
  const newStatus: UserStatus = user.status === "Active" ? "Deactivated" : "Active";
  const newLog: AdminAuditLog = {
    id: `l_${Date.now()}`,
    action: newStatus === "Active" ? "Reactivated user" : "Deactivated user",
    details: `${newStatus === "Active" ? "Reactivated" : "Deactivated"} by Admin`,
    timestamp: new Date().toISOString().replace("T", " ").slice(0, 16),
  };
  return updateMockUser(id, {
    status: newStatus,
    activityLogs: [newLog, ...(user.activityLogs || [])],
  });
}

export function deleteMockUser(id: string): boolean {
  const users = getMockUsers().filter((u) => u.id !== id);
  saveStorageUsers(users);
  MOCK_USERS = users;
  return true;
}

export function createMockUser(data: {
  name: string;
  email: string;
  department: string;
  role: Role;
  groupId?: string | null;
}): MockUser {
  const users = getMockUsers();
  const id = `u_${Date.now()}`;
  const group = MOCK_GROUPS.find((g) => g.id === data.groupId);
  const now = new Date().toISOString().slice(0, 10);
  const newUser: MockUser = {
    id,
    name: data.name,
    email: data.email,
    department: data.department,
    role: data.role,
    status: "Active",
    groupId: data.groupId || null,
    groupName: group ? group.name : null,
    streak: 0,
    actionsLogged: 0,
    points: 0,
    joinedAt: now,
    lastActive: "Just now",
    badges: [],
    recentActivity: [],
    participation: [],
    pointsBreakdown: [],
    activityLogs: [
      {
        id: `l_${Date.now()}`,
        action: "Invited user",
        details: `Invited as ${data.role} to ${data.department}`,
        timestamp: new Date().toISOString().replace("T", " ").slice(0, 16),
      },
    ],
  };
  const updated = [newUser, ...users];
  saveStorageUsers(updated);
  MOCK_USERS = updated;
  return newUser;
}

export function formatDate(date: string) {
  if (!date) return "—";
  if (date.includes(" ")) return date;
  return new Date(`${date}T00:00:00`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/**
 * Client-side CSV download utility matching old CSVExport component.
 */
export function downloadCsv(filename: string, rows: Record<string, unknown>[]) {
  if (typeof window === "undefined" || rows.length === 0) return;
  const headers = Object.keys(rows[0]);
  const csvContent = [
    headers.join(","),
    ...rows.map((row) =>
      headers
        .map((header) => {
          const val = row[header] ?? "";
          const escaped = String(val).replace(/"/g, '""');
          return `"${escaped}"`;
        })
        .join(",")
    ),
  ].join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
