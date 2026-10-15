// Hardcoded demo data and state helpers for Groups & Departments.
// Mirrored for Sprint 1 demo and will connect to DB in Sprint 2.

export interface GroupMember {
  id: string;
  name: string;
  email: string;
  role: string;
  actionsLogged: number;
}

export interface DepartmentGroup {
  id: string;
  name: string;
  description: string;
  membersCount: number;
  totalPoints: number;
  activeChallenge: string;
  members: GroupMember[];
}

export const INITIAL_GROUPS: DepartmentGroup[] = [
  {
    id: "g1",
    name: "School of Engineering",
    description: "Collection of students and faculty from the School of Engineering",
    membersCount: 20,
    totalPoints: 1250,
    activeChallenge: "Water Challenge",
    members: [
      { id: "1", name: "Taylor Last", email: "taylor@gmail.com", role: "Faculty Lead", actionsLogged: 5 },
      { id: "2", name: "Kyle Smith", email: "ksmith@gmail.com", role: "Student Participant", actionsLogged: 9 },
      { id: "3", name: "Samantha Johnson", email: "samaJ@hotmail.com", role: "Student Participant", actionsLogged: 15 },
      { id: "4", name: "James Wilson", email: "jamesWilson@outlook.com", role: "Faculty Lead", actionsLogged: 12 },
      { id: "5", name: "Linda Jones", email: "liJones@outlook.com", role: "Student Participant", actionsLogged: 6 },
    ],
  },
  {
    id: "g2",
    name: "Campus Facilities",
    description: "Collection of facilities workers participating in challenges",
    membersCount: 12,
    totalPoints: 840,
    activeChallenge: "Clean Air Challenge",
    members: [
      { id: "6", name: "Robert Miller", email: "rmiller@stthomas.edu", role: "Facilities Lead", actionsLogged: 14 },
      { id: "7", name: "David Chen", email: "dchen@stthomas.edu", role: "Staff", actionsLogged: 8 },
      { id: "8", name: "Elena Rostova", email: "erostova@stthomas.edu", role: "Staff", actionsLogged: 11 },
    ],
  },
  {
    id: "g3",
    name: "Opus College of Business",
    description: "Collection of students and faculty from the College of Business",
    membersCount: 15,
    totalPoints: 920,
    activeChallenge: "Water Challenge",
    members: [
      { id: "9", name: "Michael Chang", email: "mchang@stthomas.edu", role: "Faculty Lead", actionsLogged: 10 },
      { id: "10", name: "Sarah Jenkins", email: "sjenkins@stthomas.edu", role: "Student Participant", actionsLogged: 7 },
    ],
  },
];

const STORAGE_KEY = "greenstep_mock_groups_v1";

let inMemoryGroups: DepartmentGroup[] = INITIAL_GROUPS;

function loadStorageGroups(): DepartmentGroup[] {
  if (typeof window === "undefined") return inMemoryGroups;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_GROUPS));
      return INITIAL_GROUPS;
    }
    return JSON.parse(raw);
  } catch {
    return inMemoryGroups;
  }
}

function saveStorageGroups(groups: DepartmentGroup[]): void {
  inMemoryGroups = groups;
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(groups));
  } catch (err) {
    console.error("Failed to persist mock groups:", err);
  }
}

export function getMockGroups(): DepartmentGroup[] {
  return loadStorageGroups();
}

export function getMockGroup(id: string): DepartmentGroup | undefined {
  return getMockGroups().find((g) => g.id === id);
}

export function createMockGroup(data: {
  name: string;
  description: string;
  activeChallenge?: string;
}): DepartmentGroup {
  const groups = getMockGroups();
  const newGroup: DepartmentGroup = {
    id: `g_${Date.now()}`,
    name: data.name,
    description: data.description,
    membersCount: 1,
    totalPoints: 0,
    activeChallenge: data.activeChallenge || "Campus Sustainability Challenge",
    members: [
      {
        id: `m_${Date.now()}`,
        name: "Current Admin",
        email: "admin@greenstep.org",
        role: "Department Lead",
        actionsLogged: 0,
      },
    ],
  };
  const updated = [newGroup, ...groups];
  saveStorageGroups(updated);
  return newGroup;
}
