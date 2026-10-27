import { config } from "dotenv";
config({ path: ".env.local" });
config(); // fallback to standard .env if .env.local is absent

import {
  ActionCategory,
  ChallengeStatus,
  PrismaClient,
  UserRole,
} from "@prisma/client";

const prisma = new PrismaClient();

// Every write is an upsert keyed on a unique field (or a fixed seed id where the
// model has no natural unique key), so re-running never creates duplicates.
// `update: {}` leaves rows alone that admins may have edited since seeding.

const DEPARTMENTS = [
  { name: "Executive Office", description: "Agency leadership and strategic sustainability initiatives." },
  { name: "Environmental Analysis", description: "Data, monitoring, and environmental outcomes reporting." },
  { name: "Operations", description: "Facilities, fleet, and day-to-day agency operations." },
  { name: "Water Quality Bureau", description: "Protection and restoration of Minnesota's lakes, rivers, and groundwater." },
  { name: "Resource Management", description: "Waste reduction, recycling, and materials management programs." },
] as const;

type DepartmentName = (typeof DEPARTMENTS)[number]["name"];

const ACTIONS = [
  { key: "bike-walk-commute", title: "Bike/Walk Commute", category: ActionCategory.TRANSPORT, points: 20, description: "Bike or walk to work instead of driving." },
  { key: "public-transit", title: "Take Public Transit", category: ActionCategory.TRANSPORT, points: 15, description: "Ride the bus or light rail for your commute." },
  { key: "carpool", title: "Carpool to Work", category: ActionCategory.TRANSPORT, points: 10, description: "Share a ride with a coworker." },
  { key: "cold-water-wash", title: "Cold Water Wash", category: ActionCategory.WATER, points: 10, description: "Wash a load of laundry in cold water." },
  { key: "shorter-shower", title: "Five-Minute Shower", category: ActionCategory.WATER, points: 10, description: "Keep your shower under five minutes." },
  { key: "fix-leak", title: "Fix a Leaky Faucet", category: ActionCategory.WATER, points: 15, description: "Repair or report a dripping faucet or running toilet." },
  { key: "led-swap", title: "LED Light Bulb Swap", category: ActionCategory.ENERGY, points: 15, description: "Replace an incandescent bulb with an LED." },
  { key: "unplug-electronics", title: "Unplug Idle Electronics", category: ActionCategory.ENERGY, points: 10, description: "Unplug chargers and devices that aren't in use." },
  { key: "lower-thermostat", title: "Lower the Thermostat", category: ActionCategory.ENERGY, points: 10, description: "Set your thermostat 2°F lower for the day." },
  { key: "zero-waste-lunch", title: "Zero-Waste Lunch", category: ActionCategory.RECYCLING, points: 15, description: "Pack a lunch with no disposable packaging." },
  { key: "sort-recycling", title: "Sort Recycling Correctly", category: ActionCategory.RECYCLING, points: 10, description: "Rinse and sort recyclables into the right bins." },
  { key: "reusable-bottle", title: "Use a Reusable Bottle", category: ActionCategory.RECYCLING, points: 5, description: "Skip single-use plastic bottles for the day." },
  { key: "meatless-monday", title: "Meatless Monday", category: ActionCategory.FOOD, points: 15, description: "Eat plant-based meals for the whole day." },
  { key: "buy-local", title: "Buy Local Produce", category: ActionCategory.FOOD, points: 10, description: "Shop at a farmers market or buy Minnesota-grown food." },
  { key: "compost-scraps", title: "Compost Food Scraps", category: ActionCategory.FOOD, points: 10, description: "Compost your food scraps instead of trashing them." },
] as const;

type ActionKey = (typeof ACTIONS)[number]["key"];

const CHALLENGES = [
  {
    key: "earth-month-2024",
    name: "2024 Earth Month Challenge",
    code: "EM-S24",
    status: ChallengeStatus.COMPLETED,
    category: "General Sustainability",
    department: "Executive Office",
    startDate: "2024-04-01",
    endDate: "2024-04-30",
    themeColor: "#10B981",
    description: "Agency-wide Earth Month push covering commuting, water, energy, waste, and food habits.",
    actions: ACTIONS.map((a) => a.key),
  },
  {
    key: "spring-waste-2026",
    name: "2026 Spring Waste Reduction",
    code: "WR-S26",
    status: ChallengeStatus.ACTIVE,
    category: "RECYCLING",
    department: "Resource Management",
    startDate: "2026-04-01",
    endDate: "2026-11-30",
    themeColor: "#F59E0B",
    description: "Cut landfill waste through reusables, better sorting, and composting.",
    actions: ["zero-waste-lunch", "sort-recycling", "reusable-bottle", "compost-scraps"],
  },
  {
    key: "fall-commute-2026",
    name: "2026 Minnesota Fall Commute Week",
    code: "CW-F26",
    status: ChallengeStatus.UPCOMING,
    category: "TRANSPORT",
    department: "Operations",
    startDate: "2026-11-09",
    endDate: "2026-11-13",
    themeColor: "#3B82F6",
    description: "One week of biking, walking, transit, and carpooling instead of driving solo.",
    actions: ["bike-walk-commute", "public-transit", "carpool"],
  },
] as const satisfies ReadonlyArray<
  Record<string, unknown> & { department: DepartmentName; actions: ReadonlyArray<ActionKey> }
>;

type ChallengeKey = (typeof CHALLENGES)[number]["key"];

type SeedUser = {
  key: string;
  name: string;
  email: string;
  role: UserRole;
  department: DepartmentName;
  streak: number;
  lastActionDate?: string;
  challenges?: ChallengeKey[];
  // Points come from Action rows, so each log here adds its catalog action's points
  logs?: Array<[ActionKey, ChallengeKey, string]>;
};

const USERS: SeedUser[] = [
  {
    key: "kristin-mroz",
    name: "Kristin Mroz",
    email: "kristin.mroz@mpca.mn.gov",
    role: UserRole.SUPERADMIN,
    department: "Executive Office",
    streak: 0,
  },
  {
    key: "daniel-okafor",
    name: "Daniel Okafor",
    email: "daniel.okafor@example.com",
    role: UserRole.ADMIN,
    department: "Water Quality Bureau",
    streak: 0,
  },
  {
    key: "priya-raman",
    name: "Priya Raman",
    email: "priya.raman@example.com",
    role: UserRole.ADMIN,
    department: "Resource Management",
    streak: 0,
  },
  {
    key: "marcus-lindqvist",
    name: "Marcus Lindqvist",
    email: "marcus.lindqvist@example.com",
    role: UserRole.GENERAL_USER,
    department: "Operations",
    streak: 12,
    lastActionDate: "2026-10-25",
    challenges: ["earth-month-2024", "spring-waste-2026", "fall-commute-2026"],
    logs: [
      ["bike-walk-commute", "earth-month-2024", "2024-04-08"],
      ["bike-walk-commute", "earth-month-2024", "2024-04-15"],
      ["meatless-monday", "earth-month-2024", "2024-04-22"],
      ["zero-waste-lunch", "spring-waste-2026", "2026-10-20"],
      ["sort-recycling", "spring-waste-2026", "2026-10-23"],
      ["compost-scraps", "spring-waste-2026", "2026-10-25"],
    ],
  },
  {
    key: "sofia-hernandez",
    name: "Sofia Hernandez",
    email: "sofia.hernandez@example.com",
    role: UserRole.GENERAL_USER,
    department: "Water Quality Bureau",
    streak: 5,
    lastActionDate: "2026-10-24",
    challenges: ["earth-month-2024", "spring-waste-2026"],
    logs: [
      ["cold-water-wash", "earth-month-2024", "2024-04-05"],
      ["shorter-shower", "earth-month-2024", "2024-04-12"],
      ["fix-leak", "earth-month-2024", "2024-04-19"],
      ["reusable-bottle", "spring-waste-2026", "2026-10-21"],
      ["zero-waste-lunch", "spring-waste-2026", "2026-10-24"],
    ],
  },
  {
    key: "tom-nguyen",
    name: "Tom Nguyen",
    email: "tom.nguyen@example.com",
    role: UserRole.GENERAL_USER,
    department: "Environmental Analysis",
    streak: 3,
    lastActionDate: "2026-10-25",
    challenges: ["spring-waste-2026", "fall-commute-2026"],
    logs: [
      ["sort-recycling", "spring-waste-2026", "2026-10-23"],
      ["compost-scraps", "spring-waste-2026", "2026-10-24"],
      ["reusable-bottle", "spring-waste-2026", "2026-10-25"],
    ],
  },
  {
    key: "grace-olson",
    name: "Grace Olson",
    email: "grace.olson@example.com",
    role: UserRole.GENERAL_USER,
    department: "Resource Management",
    streak: 21,
    lastActionDate: "2026-10-26",
    challenges: ["earth-month-2024", "spring-waste-2026"],
    logs: [
      ["led-swap", "earth-month-2024", "2024-04-03"],
      ["unplug-electronics", "earth-month-2024", "2024-04-10"],
      ["buy-local", "earth-month-2024", "2024-04-17"],
      ["compost-scraps", "earth-month-2024", "2024-04-24"],
      ["zero-waste-lunch", "spring-waste-2026", "2026-10-19"],
      ["zero-waste-lunch", "spring-waste-2026", "2026-10-22"],
      ["sort-recycling", "spring-waste-2026", "2026-10-26"],
    ],
  },
  {
    key: "ahmed-hassan",
    name: "Ahmed Hassan",
    email: "ahmed.hassan@example.com",
    role: UserRole.GENERAL_USER,
    department: "Executive Office",
    streak: 0,
    lastActionDate: "2026-10-12",
    challenges: ["earth-month-2024", "fall-commute-2026"],
    logs: [
      ["public-transit", "earth-month-2024", "2024-04-09"],
      ["lower-thermostat", "earth-month-2024", "2024-04-16"],
    ],
  },
];

const TEMPLATES = [
  {
    id: "seed-template-h2o-hero-week",
    name: "H2O Hero Week",
    description: "A one-week push to save water at home and at work.",
    themeColor: "#0EA5E9",
    actions: ["cold-water-wash", "shorter-shower", "fix-leak"],
  },
  {
    id: "seed-template-power-down",
    name: "Power Down Challenge",
    description: "Cut electricity use with lighting, unplugging, and thermostat habits.",
    themeColor: "#EAB308",
    actions: ["led-swap", "unplug-electronics", "lower-thermostat"],
  },
  {
    id: "seed-template-sustainable-commute-week",
    name: "Sustainable Commute Week",
    description: "Swap solo driving for biking, walking, transit, or carpooling.",
    themeColor: "#3B82F6",
    actions: ["bike-walk-commute", "public-transit", "carpool"],
  },
] as const satisfies ReadonlyArray<Record<string, unknown> & { actions: ReadonlyArray<ActionKey> }>;

const catalogId = (key: ActionKey) => `seed-action-${key}`;
const actionByKey = (key: ActionKey) => ACTIONS.find((a) => a.key === key)!;

async function main() {
  const departmentIds = new Map<DepartmentName, string>();
  for (const dept of DEPARTMENTS) {
    const row = await prisma.department.upsert({
      where: { name: dept.name },
      update: {},
      create: dept,
    });
    departmentIds.set(dept.name, row.id);
  }
  console.log(`Departments: ${departmentIds.size}`);

  for (const { key, ...action } of ACTIONS) {
    await prisma.actionCatalog.upsert({
      where: { id: catalogId(key) },
      update: {},
      create: { id: catalogId(key), ...action },
    });
  }
  console.log(`Catalog actions: ${ACTIONS.length}`);

  const challengeIds = new Map<ChallengeKey, string>();
  for (const c of CHALLENGES) {
    const row = await prisma.challenge.upsert({
      where: { code: c.code },
      update: {},
      create: {
        name: c.name,
        code: c.code,
        status: c.status,
        category: c.category,
        description: c.description,
        themeColor: c.themeColor,
        startDate: new Date(c.startDate),
        endDate: new Date(c.endDate),
        departmentId: departmentIds.get(c.department),
      },
    });
    challengeIds.set(c.key, row.id);

    for (const actionKey of c.actions) {
      await prisma.challengeAction.upsert({
        where: {
          challengeId_actionCatalogId: { challengeId: row.id, actionCatalogId: catalogId(actionKey) },
        },
        update: {},
        create: { challengeId: row.id, actionCatalogId: catalogId(actionKey) },
      });
    }
  }
  console.log(`Challenges: ${challengeIds.size}`);

  for (const u of USERS) {
    // Placeholder clerkId; a real sign-in with this email relinks the row to the Clerk account
    const user = await prisma.user.upsert({
      where: { email: u.email },
      update: {},
      create: {
        clerkId: `seed_${u.key}`,
        name: u.name,
        email: u.email,
        role: u.role,
        departmentId: departmentIds.get(u.department),
        departmentName: u.department,
        onboarded: true,
        streak: u.streak,
        lastActionDate: u.lastActionDate ? new Date(u.lastActionDate) : null,
      },
    });

    for (const challengeKey of u.challenges ?? []) {
      const challengeId = challengeIds.get(challengeKey)!;
      await prisma.userChallenge.upsert({
        where: { userId_challengeId: { userId: user.id, challengeId } },
        update: {},
        create: { userId: user.id, challengeId },
      });
    }

    for (const [i, [actionKey, challengeKey, date]] of (u.logs ?? []).entries()) {
      const action = actionByKey(actionKey);
      const id = `seed-log-${u.key}-${i + 1}`;
      await prisma.action.upsert({
        where: { id },
        update: {},
        create: {
          id,
          userId: user.id,
          challengeId: challengeIds.get(challengeKey),
          category: action.category,
          actionType: action.title,
          points: action.points,
          date: new Date(date),
          createdAt: new Date(date),
        },
      });
    }
  }
  console.log(`Users: ${USERS.length}`);

  for (const { actions, ...template } of TEMPLATES) {
    const items = actions.map(actionByKey);
    await prisma.challengeTemplate.upsert({
      where: { id: template.id },
      update: {},
      create: {
        ...template,
        categories: [...new Set(items.map((a) => a.category))],
        actions: items.map(({ title, category, points }) => ({ title, category, points })),
      },
    });
  }
  console.log(`Templates: ${TEMPLATES.length}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
