/**
 * @deprecated Challenges list, detail, and creation now read and write the live DB through
 * app/actions/admin-challenges.ts (#33). This file remains only for pages not yet connected:
 * in-challenge action CRUD, the global action catalog, and templates.
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

export type ChallengeActionItem = {
  id: string;
  challengeId: string;
  title: string;
  description: string;
  category: string;
  points: number;
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
  actions: ChallengeActionItem[];
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
  "Water",
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
    actions: [
      {
        id: "act-101",
        challengeId: "1",
        title: "Bike / Walk to Campus",
        description: "Complete daily round-trip commute via bicycle, scooter, or walking.",
        category: "Transportation",
        points: 50,
      },
      {
        id: "act-102",
        challengeId: "1",
        title: "Ride Metro Transit Bus / Light Rail",
        description: "Take public transit for work or class commute.",
        category: "Transportation",
        points: 35,
      },
      {
        id: "act-103",
        challengeId: "1",
        title: "Carpool with Colleague or Classmate",
        description: "Share a ride with 2 or more campus commuters.",
        category: "Transportation",
        points: 25,
      },
      {
        id: "act-104",
        challengeId: "1",
        title: "Log Remote Study / Work Day",
        description: "Avoid vehicle emissions by working remotely for the day.",
        category: "Transportation",
        points: 20,
      },
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
    actions: [
      {
        id: "act-201",
        challengeId: "2",
        title: "Turn Off Unused Room Lights",
        description: "Switch off classroom or office lighting when unoccupied.",
        category: "Energy",
        points: 10,
      },
      {
        id: "act-202",
        challengeId: "2",
        title: "Unplug Phantom Chargers",
        description: "Unplug laptop and phone chargers when devices are not charging.",
        category: "Energy",
        points: 15,
      },
      {
        id: "act-203",
        challengeId: "2",
        title: "Cold Water Laundry Wash",
        description: "Wash clothing load in cold water instead of warm/hot.",
        category: "Energy",
        points: 25,
      },
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
    actions: [
      {
        id: "act-301",
        challengeId: "3",
        title: "Pack Zero-Waste Lunch",
        description: "Use reusable containers and cloth napkins with no single-use plastics.",
        category: "Waste",
        points: 25,
      },
      {
        id: "act-302",
        challengeId: "3",
        title: "Compost Organic Food Scraps",
        description: "Dispose of food scraps and coffee grounds into campus compost bins.",
        category: "Waste",
        points: 20,
      },
      {
        id: "act-303",
        challengeId: "3",
        title: "Accurate Recycling Sort",
        description: "Sort clean paper, plastic, and aluminum into designated recycling stream.",
        category: "Waste",
        points: 15,
      },
    ],
  },
];

const CHALLENGES_STORAGE_KEY = "greenstep_challenges_store_v2";

let mockChallengesStore: Challenge[] = INITIAL_MOCK_CHALLENGES.map((c) => ({
  ...c,
  actions: [...(c.actions || [])],
}));

function syncChallengesFromStorage() {
  if (typeof window === "undefined") return;
  try {
    const raw = window.localStorage.getItem(CHALLENGES_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        mockChallengesStore = parsed;
        return;
      }
    }
    window.localStorage.setItem(CHALLENGES_STORAGE_KEY, JSON.stringify(mockChallengesStore));
  } catch {
    // Ignore storage access errors
  }
}

function persistChallengesToStorage() {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(CHALLENGES_STORAGE_KEY, JSON.stringify(mockChallengesStore));
  } catch {
    // Ignore storage access errors
  }
}

if (typeof window !== "undefined") {
  syncChallengesFromStorage();
}

export function getMockChallenges(): Challenge[] {
  syncChallengesFromStorage();
  return [...mockChallengesStore];
}

export function getMockChallenge(id: string): Challenge | undefined {
  syncChallengesFromStorage();
  return mockChallengesStore.find((c) => c.id === id);
}

export function getChallengeActions(challengeId: string): ChallengeActionItem[] {
  const challenge = getMockChallenge(challengeId);
  return challenge?.actions ? [...challenge.actions] : [];
}

export function addChallengeAction(
  challengeId: string,
  action: { title: string; description: string; category: string; points: number }
): ChallengeActionItem {
  syncChallengesFromStorage();
  const challenge = mockChallengesStore.find((c) => c.id === challengeId);
  const newAction: ChallengeActionItem = {
    id: `act-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    challengeId,
    title: action.title,
    description: action.description,
    category: action.category,
    points: action.points,
  };

  if (challenge) {
    if (!challenge.actions) challenge.actions = [];
    challenge.actions.push(newAction);
    persistChallengesToStorage();
  }
  return newAction;
}

export function updateChallengeAction(
  id: string,
  updates: Partial<{ title: string; description: string; category: string; points: number }>
): ChallengeActionItem | null {
  syncChallengesFromStorage();
  for (const challenge of mockChallengesStore) {
    if (!challenge.actions) continue;
    const idx = challenge.actions.findIndex((a) => a.id === id);
    if (idx !== -1) {
      challenge.actions[idx] = {
        ...challenge.actions[idx],
        ...updates,
      };
      persistChallengesToStorage();
      return challenge.actions[idx];
    }
  }
  return null;
}

export function deleteChallengeAction(id: string): boolean {
  syncChallengesFromStorage();
  for (const challenge of mockChallengesStore) {
    if (!challenge.actions) continue;
    const idx = challenge.actions.findIndex((a) => a.id === id);
    if (idx !== -1) {
      challenge.actions.splice(idx, 1);
      persistChallengesToStorage();
      return true;
    }
  }
  return false;
}

export function createMockChallenge(data: {
  name: string;
  code: string;
  category: string;
  startDate: string;
  endDate: string;
  description: string;
  actions?: Array<{ title: string; description: string; category: string; points: number }>;
}): Challenge {
  syncChallengesFromStorage();
  const today = new Date().toISOString().slice(0, 10);
  let status: Status = "Upcoming";
  if (data.startDate <= today && data.endDate >= today) {
    status = "Active";
  } else if (data.endDate < today) {
    status = "Completed";
  }

  let maxId = 0;
  for (const c of mockChallengesStore) {
    const num = parseInt(c.id, 10);
    if (!isNaN(num) && num > maxId) maxId = num;
  }
  const id = String(maxId + 1);

  const challengeActions: ChallengeActionItem[] = (data.actions || []).map((a, i) => ({
    id: `act-${id}-${i + 1}`,
    challengeId: id,
    title: a.title,
    description: a.description,
    category: a.category,
    points: a.points,
  }));

  const newChallenge: Challenge = {
    id,
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
    actions: challengeActions,
  };

  mockChallengesStore.push(newChallenge);
  persistChallengesToStorage();
  return newChallenge;
}

export type TemplatePreset = {
  id: string;
  name: string;
  code: string;
  category: string;
  duration: string;
  days: number;
  description: string;
  themeColor: string;
  actions: {
    title: string;
    description: string;
    category: string;
    points: number;
  }[];
};

export const TEMPLATE_PRESETS: Record<string, TemplatePreset> = {
  commuter: {
    id: "commuter",
    name: "Sustainable Commute Week",
    code: "SCW-26",
    category: "Transportation",
    duration: "1 week",
    days: 7,
    description: "Encourage biking, walking, public transit, and carpooling instead of driving solo to campus.",
    themeColor: "#3B82F6",
    actions: [
      {
        title: "Bike or Walk to Campus",
        description: "Choose active human-powered transit for your daily commute.",
        category: "Transportation",
        points: 50,
      },
      {
        title: "Ride Metro Transit Bus or Light Rail",
        description: "Take public transit instead of a personal vehicle.",
        category: "Transportation",
        points: 35,
      },
      {
        title: "Carpool with Colleagues or Classmates",
        description: "Share your ride with 2 or more campus commuters.",
        category: "Transportation",
        points: 25,
      },
      {
        title: "Log a Telework / Remote Day",
        description: "Eliminate commuter carbon emissions entirely by working remotely.",
        category: "Transportation",
        points: 20,
      },
    ],
  },
  "h2o-hero": {
    id: "h2o-hero",
    name: "H2O Hero Week",
    code: "H2O-26",
    category: "Water",
    duration: "1 week",
    days: 7,
    description: "A focused week-long campaign targeting office and campus water conservation habits.",
    themeColor: "#06B6D4",
    actions: [
      {
        title: "Turn Off Tap While Brushing Teeth or Washing Hands",
        description: "Keep the faucet closed when water is not actively rinsing.",
        category: "Water",
        points: 10,
      },
      {
        title: "Under-5-Minute Shower",
        description: "Time and complete your shower in under 5 minutes to conserve hot water.",
        category: "Water",
        points: 25,
      },
      {
        title: "Report Campus Water Leak",
        description: "Report a dripping faucet, running toilet, or irrigation leak to facilities.",
        category: "Water",
        points: 30,
      },
      {
        title: "Use Reusable Water Bottle",
        description: "Refill at campus hydration stations instead of single-use plastic bottles.",
        category: "Water",
        points: 15,
      },
    ],
  },
  "power-down": {
    id: "power-down",
    name: "Power Down Challenge",
    code: "PDC-26",
    category: "Energy",
    duration: "1 week",
    days: 7,
    description: "Compete to see who can reduce electricity consumption through lights-off and phantom power habits.",
    themeColor: "#F59E0B",
    actions: [
      {
        title: "Turn Off Unoccupied Room Lights",
        description: "Switch off overhead lights when leaving an empty office or conference space.",
        category: "Energy",
        points: 10,
      },
      {
        title: "Unplug Phantom Chargers & Electronics",
        description: "Unplug vampire power loads at power strips before leaving for the weekend.",
        category: "Energy",
        points: 20,
      },
      {
        title: "Wash Laundry Load in Cold Water",
        description: "Run washing machines on the cold setting to cut heating energy.",
        category: "Energy",
        points: 25,
      },
      {
        title: "Take Stairs Instead of Elevator",
        description: "Opt for the stairwell for 1-3 floor journeys across buildings.",
        category: "Energy",
        points: 15,
      },
    ],
  },
  "zero-waste": {
    id: "zero-waste",
    name: "Zero Waste Week",
    code: "ZWW-26",
    category: "Waste",
    duration: "1 week",
    days: 7,
    description: "Minimize landfill waste across campus dining, offices, and student living through reusables.",
    themeColor: "#10B981",
    actions: [
      {
        title: "Pack a Litterless / Zero-Waste Lunch",
        description: "Bring meals in reusable food containers with washable utensils.",
        category: "Waste",
        points: 25,
      },
      {
        title: "Compost Organic Food Scraps",
        description: "Divert food waste to campus green organics bins.",
        category: "Waste",
        points: 20,
      },
      {
        title: "Accurately Sort Mixed Recycling",
        description: "Ensure cardboard, aluminum, and clean plastics are placed in blue recycling bins.",
        category: "Waste",
        points: 15,
      },
      {
        title: "Refuse Single-Use Plastic Bags / Cups",
        description: "Bring a reusable tote bag or travel mug for coffee runs.",
        category: "Waste",
        points: 20,
      },
    ],
  },
  "food-based": {
    id: "food-based",
    name: "Sustainable Food Challenge",
    code: "SFC-26",
    category: "Food",
    duration: "10 days",
    days: 10,
    description: "Encourage sustainable dining with plant-rich meals, locally sourced ingredients, and clean plates.",
    themeColor: "#8B5CF6",
    actions: [
      {
        title: "Eat a 100% Plant-Based Meal",
        description: "Choose a vegetarian or vegan entree with no animal meat.",
        category: "Food",
        points: 30,
      },
      {
        title: "Choose Locally Grown Ingredients",
        description: "Select Minnesota or regional farm produce at dining halls or farmers markets.",
        category: "Food",
        points: 25,
      },
      {
        title: "Clean Plate Club (Zero Food Waste)",
        description: "Portion responsibly and finish all food on your tray without landfill disposal.",
        category: "Food",
        points: 20,
      },
      {
        title: "Drink Tap Water Over Bottled Soda",
        description: "Skip canned or bottled beverages in favor of tap water.",
        category: "Food",
        points: 10,
      },
    ],
  },
};

// ============================================================
// Global Action Catalog Store
// ============================================================

export type GlobalAction = {
  id: string;
  title: string;
  description: string;
  category: string;
  points: number;
  createdAt: string;
};

export const INITIAL_GLOBAL_ACTIONS: GlobalAction[] = [
  // Transportation
  {
    id: "act-glob-1",
    title: "Bike or Walk to Campus",
    description: "Choose active human-powered transit for your daily commute instead of a personal vehicle.",
    category: "Transportation",
    points: 50,
    createdAt: "2026-01-15",
  },
  {
    id: "act-glob-2",
    title: "Ride Metro Transit Bus or Light Rail",
    description: "Take Metro Transit bus or light rail to class or work.",
    category: "Transportation",
    points: 35,
    createdAt: "2026-01-15",
  },
  {
    id: "act-glob-3",
    title: "Carpool with Colleagues or Classmates",
    description: "Share a ride with two or more campus commuters to reduce single-occupancy trips.",
    category: "Transportation",
    points: 25,
    createdAt: "2026-01-16",
  },
  {
    id: "act-glob-4",
    title: "Log a Telework / Remote Day",
    description: "Eliminate commute carbon emissions entirely by completing work or coursework remotely.",
    category: "Transportation",
    points: 20,
    createdAt: "2026-01-18",
  },
  {
    id: "act-glob-5",
    title: "Plan Errands to Minimize Miles",
    description: "Combine multiple grocery, clinic, or supply trips into a single trip chain.",
    category: "Transportation",
    points: 15,
    createdAt: "2026-01-20",
  },

  // Water
  {
    id: "act-glob-6",
    title: "Turn Off Tap While Brushing Teeth or Washing Hands",
    description: "Keep faucet closed when water is not actively rinsing.",
    category: "Water",
    points: 10,
    createdAt: "2026-01-15",
  },
  {
    id: "act-glob-7",
    title: "Under-5-Minute Shower",
    description: "Time and complete your shower in under 5 minutes to conserve hot water.",
    category: "Water",
    points: 25,
    createdAt: "2026-01-16",
  },
  {
    id: "act-glob-8",
    title: "Report Campus Water Leak",
    description: "Report a dripping faucet, running toilet, or irrigation leak to facilities.",
    category: "Water",
    points: 30,
    createdAt: "2026-01-18",
  },
  {
    id: "act-glob-9",
    title: "Use Reusable Water Bottle",
    description: "Refill at campus hydration stations instead of purchasing single-use bottles.",
    category: "Water",
    points: 15,
    createdAt: "2026-01-19",
  },
  {
    id: "act-glob-10",
    title: "Run Washing Machine on Full Load Only",
    description: "Conserve wash water by waiting for a full laundry or dishwasher load.",
    category: "Water",
    points: 20,
    createdAt: "2026-01-22",
  },

  // Energy
  {
    id: "act-glob-11",
    title: "Turn Off Unoccupied Room Lights",
    description: "Switch off overhead lights when leaving an empty office, conference room, or lounge.",
    category: "Energy",
    points: 10,
    createdAt: "2026-01-15",
  },
  {
    id: "act-glob-12",
    title: "Unplug Phantom Chargers & Electronics",
    description: "Unplug standby laptop docks, phone chargers, and appliances before leaving for the weekend.",
    category: "Energy",
    points: 20,
    createdAt: "2026-01-16",
  },
  {
    id: "act-glob-13",
    title: "Wash Laundry Load in Cold Water",
    description: "Run washing machines on the cold setting to cut water heating electricity.",
    category: "Energy",
    points: 25,
    createdAt: "2026-01-17",
  },
  {
    id: "act-glob-14",
    title: "Take Stairs Instead of Elevator",
    description: "Opt for the stairwell for 1-3 floor journeys between classrooms and offices.",
    category: "Energy",
    points: 15,
    createdAt: "2026-01-19",
  },
  {
    id: "act-glob-15",
    title: "Power Down Workstation at Day's End",
    description: "Completely shut down external monitors, desktop towers, and docking stations overnight.",
    category: "Energy",
    points: 15,
    createdAt: "2026-01-21",
  },

  // Waste
  {
    id: "act-glob-16",
    title: "Pack a Litterless / Zero-Waste Lunch",
    description: "Bring meals in reusable food containers with washable utensils and cloth napkins.",
    category: "Waste",
    points: 25,
    createdAt: "2026-01-15",
  },
  {
    id: "act-glob-17",
    title: "Compost Organic Food Scraps",
    description: "Divert banana peels, apple cores, and coffee grounds into green organics bins.",
    category: "Waste",
    points: 20,
    createdAt: "2026-01-16",
  },
  {
    id: "act-glob-18",
    title: "Accurately Sort Mixed Recycling",
    description: "Ensure clean paper, aluminum, and rigid plastics are placed in blue bins without food grease.",
    category: "Waste",
    points: 15,
    createdAt: "2026-01-18",
  },
  {
    id: "act-glob-19",
    title: "Refuse Single-Use Plastic Bags / Cups",
    description: "Bring a reusable tote bag or travel mug for campus dining and coffee runs.",
    category: "Waste",
    points: 20,
    createdAt: "2026-01-20",
  },
  {
    id: "act-glob-20",
    title: "Avoid Printing Digital Documents",
    description: "Review documents digitally, annotate via PDF, and avoid hard-copy printouts.",
    category: "Waste",
    points: 10,
    createdAt: "2026-01-21",
  },

  // Food
  {
    id: "act-glob-21",
    title: "Eat a 100% Plant-Based Meal",
    description: "Choose a vegetarian or vegan entree with no animal meat or poultry.",
    category: "Food",
    points: 30,
    createdAt: "2026-01-15",
  },
  {
    id: "act-glob-22",
    title: "Choose Locally Grown Ingredients",
    description: "Select Minnesota or Midwest farm produce at campus dining or local markets.",
    category: "Food",
    points: 25,
    createdAt: "2026-01-17",
  },
  {
    id: "act-glob-23",
    title: "Clean Plate Club (Zero Food Waste)",
    description: "Portion responsibly and finish all food on your tray without landfill disposal.",
    category: "Food",
    points: 20,
    createdAt: "2026-01-19",
  },
  {
    id: "act-glob-24",
    title: "Drink Tap Water Over Bottled Soda",
    description: "Skip single-use cans or bottles in favor of campus chilled tap water.",
    category: "Food",
    points: 10,
    createdAt: "2026-01-20",
  },
];

const GLOBAL_ACTIONS_STORAGE_KEY = "greenstep_global_actions_store_v2";

let globalActionsStore: GlobalAction[] = [...INITIAL_GLOBAL_ACTIONS];

function syncGlobalActionsFromStorage() {
  if (typeof window === "undefined") return;
  try {
    const raw = window.localStorage.getItem(GLOBAL_ACTIONS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        globalActionsStore = parsed;
        return;
      }
    }
    window.localStorage.setItem(GLOBAL_ACTIONS_STORAGE_KEY, JSON.stringify(globalActionsStore));
  } catch {
    // Ignore storage errors
  }
}

function persistGlobalActionsToStorage() {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(GLOBAL_ACTIONS_STORAGE_KEY, JSON.stringify(globalActionsStore));
  } catch {
    // Ignore storage errors
  }
}

if (typeof window !== "undefined") {
  syncGlobalActionsFromStorage();
}

export function getGlobalActions(): GlobalAction[] {
  syncGlobalActionsFromStorage();
  return [...globalActionsStore];
}

export function getGlobalAction(id: string): GlobalAction | undefined {
  syncGlobalActionsFromStorage();
  return globalActionsStore.find((a) => a.id === id);
}

export function createGlobalAction(data: {
  title: string;
  description: string;
  category: string;
  points: number;
}): GlobalAction {
  syncGlobalActionsFromStorage();
  const newAction: GlobalAction = {
    id: `act-glob-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    title: data.title.trim(),
    description: data.description.trim(),
    category: data.category,
    points: data.points,
    createdAt: new Date().toISOString().slice(0, 10),
  };
  globalActionsStore.unshift(newAction);
  persistGlobalActionsToStorage();
  return newAction;
}

export function updateGlobalAction(
  id: string,
  data: Partial<{ title: string; description: string; category: string; points: number }>
): GlobalAction | null {
  syncGlobalActionsFromStorage();
  const idx = globalActionsStore.findIndex((a) => a.id === id);
  if (idx === -1) return null;
  globalActionsStore[idx] = {
    ...globalActionsStore[idx],
    ...data,
  };
  persistGlobalActionsToStorage();
  return globalActionsStore[idx];
}

export function deleteGlobalAction(id: string): boolean {
  syncGlobalActionsFromStorage();
  const idx = globalActionsStore.findIndex((a) => a.id === id);
  if (idx === -1) return false;
  globalActionsStore.splice(idx, 1);
  persistGlobalActionsToStorage();
  return true;
}

// ============================================================
// Dynamic Challenge Templates Store
// ============================================================

const TEMPLATES_STORAGE_KEY = "greenstep_templates_store_v2";

let dynamicTemplatesStore: TemplatePreset[] = Object.values(TEMPLATE_PRESETS).map((t) => ({
  ...t,
  actions: [...t.actions],
}));

function syncTemplatesFromStorage() {
  if (typeof window === "undefined") return;
  try {
    const raw = window.localStorage.getItem(TEMPLATES_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        dynamicTemplatesStore = parsed;
        for (const t of dynamicTemplatesStore) {
          TEMPLATE_PRESETS[t.id] = t;
        }
        return;
      }
    }
    window.localStorage.setItem(TEMPLATES_STORAGE_KEY, JSON.stringify(dynamicTemplatesStore));
  } catch {
    // Ignore storage errors
  }
}

function persistTemplatesToStorage() {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(TEMPLATES_STORAGE_KEY, JSON.stringify(dynamicTemplatesStore));
  } catch {
    // Ignore storage errors
  }
}

if (typeof window !== "undefined") {
  syncTemplatesFromStorage();
}

export function getTemplatesList(): TemplatePreset[] {
  syncTemplatesFromStorage();
  return [...dynamicTemplatesStore];
}

export function getTemplateById(id: string): TemplatePreset | undefined {
  syncTemplatesFromStorage();
  return dynamicTemplatesStore.find((t) => t.id === id);
}

export function createTemplate(data: {
  name: string;
  code: string;
  category: string;
  duration?: string;
  days?: number;
  description: string;
  themeColor?: string;
  actions: Array<{ title: string; description: string; category: string; points: number }>;
}): TemplatePreset {
  syncTemplatesFromStorage();
  const trimmedCode = data.code.trim().toUpperCase();
  const baseId = trimmedCode.toLowerCase().replace(/[^a-z0-9]/g, "-") || `tmpl-${Date.now()}`;
  let id = baseId;
  let counter = 1;
  while (dynamicTemplatesStore.some((t) => t.id === id)) {
    id = `${baseId}-${counter}`;
    counter++;
  }

  const newTemplate: TemplatePreset = {
    id,
    name: data.name.trim(),
    code: trimmedCode,
    category: data.category,
    duration: data.duration || "1 week",
    days: data.days || 7,
    description: data.description.trim(),
    themeColor: data.themeColor || "#10B981",
    actions: [...data.actions],
  };

  dynamicTemplatesStore.unshift(newTemplate);
  // Also register in TEMPLATE_PRESETS for backwards compatibility
  TEMPLATE_PRESETS[id] = newTemplate;
  persistTemplatesToStorage();
  return newTemplate;
}

export function updateTemplate(
  id: string,
  updates: Partial<TemplatePreset>
): TemplatePreset | null {
  syncTemplatesFromStorage();
  const idx = dynamicTemplatesStore.findIndex((t) => t.id === id);
  if (idx === -1) return null;
  dynamicTemplatesStore[idx] = {
    ...dynamicTemplatesStore[idx],
    ...updates,
  };
  TEMPLATE_PRESETS[id] = dynamicTemplatesStore[idx];
  persistTemplatesToStorage();
  return dynamicTemplatesStore[idx];
}

export function deleteTemplate(id: string): boolean {
  syncTemplatesFromStorage();
  const idx = dynamicTemplatesStore.findIndex((t) => t.id === id);
  if (idx === -1) return false;
  dynamicTemplatesStore.splice(idx, 1);
  delete TEMPLATE_PRESETS[id];
  persistTemplatesToStorage();
  return true;
}

