/**
 * Mock Data Engine for Challenges Management (Sprint 1 Demo 1).
 * Single source of truth shared across challenges list, challenge detail,
 * challenge creation, in-challenge action CRUD, and templates.
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

const mockChallengesStore: Challenge[] = INITIAL_MOCK_CHALLENGES.map((c) => ({
  ...c,
  actions: [...(c.actions || [])],
}));

export function getMockChallenges(): Challenge[] {
  return [...mockChallengesStore];
}

export function getMockChallenge(id: string): Challenge | undefined {
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
  const challenge = getMockChallenge(challengeId);
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
  }
  return newAction;
}

export function updateChallengeAction(
  id: string,
  updates: Partial<{ title: string; description: string; category: string; points: number }>
): ChallengeActionItem | null {
  for (const challenge of mockChallengesStore) {
    if (!challenge.actions) continue;
    const idx = challenge.actions.findIndex((a) => a.id === id);
    if (idx !== -1) {
      challenge.actions[idx] = {
        ...challenge.actions[idx],
        ...updates,
      };
      return challenge.actions[idx];
    }
  }
  return null;
}

export function deleteChallengeAction(id: string): boolean {
  for (const challenge of mockChallengesStore) {
    if (!challenge.actions) continue;
    const idx = challenge.actions.findIndex((a) => a.id === id);
    if (idx !== -1) {
      challenge.actions.splice(idx, 1);
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
  const today = new Date().toISOString().slice(0, 10);
  let status: Status = "Upcoming";
  if (data.startDate <= today && data.endDate >= today) {
    status = "Active";
  } else if (data.endDate < today) {
    status = "Completed";
  }

  const id = String(mockChallengesStore.length + 1);
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
