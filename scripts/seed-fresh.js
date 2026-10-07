/**
 * Fresh seed: wipe ALL user data and repopulate with rich, diverse mock data.
 * Run with: node scripts/seed-fresh.js
 *
 * What it does:
 *  1. Deletes all actions, team members, user-challenge enrollments
 *  2. Re-enrolls all users in global + Earth Month 2026
 *  3. Assigns users to teams
 *  4. Generates 40-80 actions per user across 60 days (both global + challenge)
 *  5. Adds notes to ~30% of actions, simulates streaks
 */

require("dotenv").config({ path: ".env.local" });
const { PrismaClient } = require("@prisma/client");
const db = new PrismaClient();

const GLOBAL_ID = "global";

// ── Full action catalogue (mirrors lib/actions-data.ts) ────────────────────
const ACTIONS = {
  TRANSPORT: [
    { actionType: "Biked to work",         points: 50 },
    { actionType: "Used public transit",   points: 30 },
    { actionType: "Carpooled",             points: 25 },
    { actionType: "Walked to work",        points: 40 },
    { actionType: "Electric vehicle",      points: 35 },
    { actionType: "Skateboarded",          points: 45 },
    { actionType: "Scootered to work",     points: 35 },
  ],
  ENERGY: [
    { actionType: "Turned off unused lights",         points: 10 },
    { actionType: "Used natural lighting",            points: 15 },
    { actionType: "Unplugged devices",                points: 12 },
    { actionType: "Adjusted thermostat",              points: 20 },
    { actionType: "Used energy-efficient equipment",  points: 18 },
    { actionType: "Closed blinds for insulation",     points: 14 },
    { actionType: "Used laptop instead of desktop",   points: 16 },
  ],
  RECYCLING: [
    { actionType: "Recycled paper",          points: 15 },
    { actionType: "Recycled plastic",        points: 15 },
    { actionType: "Composted food waste",    points: 20 },
    { actionType: "E-waste disposal",        points: 30 },
    { actionType: "Reused materials",        points: 25 },
    { actionType: "Recycled cardboard",      points: 12 },
    { actionType: "Donated old items",       points: 28 },
  ],
  FOOD: [
    { actionType: "Brought reusable mug",    points: 20 },
    { actionType: "Ate plant-based meal",    points: 30 },
    { actionType: "Used reusable containers",points: 15 },
    { actionType: "Avoided food waste",      points: 25 },
    { actionType: "Bought local produce",    points: 22 },
    { actionType: "Packed lunch from home",  points: 18 },
    { actionType: "Used reusable utensils",  points: 12 },
  ],
  WATER: [
    { actionType: "Used refillable bottle",       points: 15 },
    { actionType: "Took shorter shower",          points: 20 },
    { actionType: "Fixed a leak",                 points: 40 },
    { actionType: "Used low-flow fixtures",       points: 25 },
    { actionType: "Collected rainwater",          points: 35 },
    { actionType: "Turned off tap while washing", points: 18 },
    { actionType: "Watered plants efficiently",   points: 22 },
  ],
};
const CATEGORIES = Object.keys(ACTIONS);

// ── Sample notes for ~30% of actions ──────────────────────────────────────
const NOTES = [
  "Felt great doing this today!",
  "Small steps make a big difference.",
  "My team is really getting into this.",
  "Third day in a row doing this one.",
  "Inspired by a coworker to try this.",
  "Easier than I expected honestly.",
  "Trying to make this a daily habit.",
  "Saved about 2 gallons of water.",
  "The weather was perfect for this.",
  "Challenge is pushing me to be better.",
  "Kids loved seeing me do this.",
  "Wish I started sooner.",
  "Barely made it but still counts!",
  "Sharing this tip with the whole office.",
  "My manager noticed and praised the effort.",
  "Combined this with another green action.",
  "Listening to a podcast while doing this.",
  "It was raining so I got creative.",
  "Zero cost, massive impact.",
  "This is becoming second nature now.",
];

const DEPARTMENTS = ["Engineering", "Marketing", "Operations", "HR", "Finance"];

function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function rand(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }

/** Return a Date N days ago at a realistic time */
function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(6 + Math.floor(Math.random() * 14), Math.floor(Math.random() * 60), rand(0, 59), 0);
  return d;
}

/**
 * Generate a batch of actions with realistic diversity.
 * - weightedCategories biases certain categories for personality
 * - consecutive runs create streak patterns
 */
function generateActions(userId, challengeId, totalTarget, daySpread, weights) {
  const actions = [];
  // Generate a set of "active days" — some consecutive for streaks
  const activeDays = new Set();

  // Create 2-3 streak clusters
  const clusterCount = rand(2, 4);
  for (let c = 0; c < clusterCount; c++) {
    const start = rand(0, daySpread - 7);
    const len = rand(3, 10); // 3-10 consecutive days
    for (let d = 0; d < len && (start + d) < daySpread; d++) {
      activeDays.add(start + d);
    }
  }
  // Add some scattered single days
  for (let i = 0; i < rand(5, 15); i++) {
    activeDays.add(rand(0, daySpread));
  }

  const dayList = [...activeDays].sort((a, b) => a - b);

  // Distribute actions across active days
  let generated = 0;
  for (const day of dayList) {
    if (generated >= totalTarget) break;
    const actionsThisDay = rand(1, 3); // 1-3 actions per active day
    for (let i = 0; i < actionsThisDay && generated < totalTarget; i++) {
      // Weight category selection by personality
      const catRoll = Math.random();
      let cumulative = 0;
      let cat = CATEGORIES[0];
      for (const [c, w] of Object.entries(weights)) {
        cumulative += w;
        if (catRoll <= cumulative) { cat = c; break; }
      }
      const item = pick(ACTIONS[cat]);

      // ~30% get a note, ~15% get bonus points as if they had a note+image
      const hasNote = Math.random() < 0.30;
      const hasImage = hasNote && Math.random() < 0.50; // ~15% overall
      const noteBonus = hasNote ? 10 : 0;
      const imageBonus = hasImage ? 15 : 0;

      const ts = daysAgo(day);
      actions.push({
        userId,
        challengeId,
        category: cat,
        actionType: item.actionType,
        points: item.points + noteBonus + imageBonus,
        note: hasNote ? pick(NOTES) : null,
        imageUrl: null, // no actual images in mock data
        date: ts,
        createdAt: ts,
      });
      generated++;
    }
  }
  return actions;
}

async function main() {
  console.log("=== FRESH SEED: Clearing all user data ===\n");

  // ── 1. Wipe transactional data ────────────────────────────────────────────
  const delActions = await db.action.deleteMany({});
  const delMembers = await db.teamMember.deleteMany({});
  const delEnrollments = await db.userChallenge.deleteMany({});
  console.log(`Deleted: ${delActions.count} actions, ${delMembers.count} team members, ${delEnrollments.count} enrollments`);

  // ── 2. Load existing records ──────────────────────────────────────────────
  const users = await db.user.findMany();
  const earthMonth = await db.challenge.findFirst({ where: { code: "TEST26" } });
  const globalChallenge = await db.challenge.findUnique({ where: { id: GLOBAL_ID } });
  const teams = await db.team.findMany();

  if (!earthMonth) { console.error("Challenge TEST26 not found!"); process.exit(1); }
  if (!globalChallenge) { console.error("Global challenge not found! Run seed-global-challenge.js first."); process.exit(1); }

  const teamAlpha = teams.find(t => t.name === "Team Alpha");
  const teamBeta  = teams.find(t => t.name === "Team Beta");
  const teamUST   = teams.find(t => t.name === "UST");

  console.log(`\nUsers: ${users.map(u => u.name).join(", ")}`);
  console.log(`Challenges: ${globalChallenge.name}, ${earthMonth.name}`);
  console.log(`Teams: ${teams.map(t => t.name).join(", ")}\n`);

  // ── 3. Enroll everyone in global + Earth Month ────────────────────────────
  for (const user of users) {
    await db.userChallenge.create({ data: { userId: user.id, challengeId: GLOBAL_ID } });
    await db.userChallenge.create({ data: { userId: user.id, challengeId: earthMonth.id } });
  }
  console.log("All users enrolled in Global + Earth Month 2026");

  // ── 4. Assign users to teams (for Earth Month) ───────────────────────────
  const teamAssignments = [
    { email: "oligurmessa@gmail.com",    team: teamAlpha },
    { email: "itshadi.sh@gmail.com",     team: teamAlpha },
    { email: "appreviewtrial@gmail.com", team: teamBeta  },
    { email: "nate.agbemadon@gmail.com", team: teamBeta  },
    { email: "issolly2457@gmail.com",    team: teamUST   },
  ];

  for (const { email, team } of teamAssignments) {
    const user = users.find(u => u.email === email);
    if (!user || !team) continue;
    await db.teamMember.create({ data: { userId: user.id, teamId: team.id } });
    console.log(`  ${user.name} (${email}) → ${team.name}`);
  }

  // ── 5. User personality profiles ──────────────────────────────────────────
  // Each user has a different activity pattern and category preference
  const profiles = [
    {
      email: "oligurmessa@gmail.com",
      // Power user: lots of actions, heavy on transport + energy
      globalActions: 30, globalSpread: 55,
      challengeActions: 45, challengeSpread: 28,
      weights: { TRANSPORT: 0.35, ENERGY: 0.25, RECYCLING: 0.15, FOOD: 0.15, WATER: 0.10 },
      department: "Engineering",
    },
    {
      email: "itshadi.sh@gmail.com",
      // Balanced and consistent
      globalActions: 25, globalSpread: 50,
      challengeActions: 35, challengeSpread: 25,
      weights: { TRANSPORT: 0.20, ENERGY: 0.20, RECYCLING: 0.20, FOOD: 0.20, WATER: 0.20 },
      department: "Engineering",
    },
    {
      email: "appreviewtrial@gmail.com",
      // Food and recycling enthusiast
      globalActions: 20, globalSpread: 45,
      challengeActions: 28, challengeSpread: 22,
      weights: { TRANSPORT: 0.10, ENERGY: 0.10, RECYCLING: 0.30, FOOD: 0.35, WATER: 0.15 },
      department: "Marketing",
    },
    {
      email: "nate.agbemadon@gmail.com",
      // Water champion, moderate activity
      globalActions: 22, globalSpread: 48,
      challengeActions: 32, challengeSpread: 24,
      weights: { TRANSPORT: 0.15, ENERGY: 0.15, RECYCLING: 0.15, FOOD: 0.15, WATER: 0.40 },
      department: "Operations",
    },
    {
      email: "issolly2457@gmail.com",
      // Newer user, ramping up, energy focused
      globalActions: 15, globalSpread: 30,
      challengeActions: 22, challengeSpread: 20,
      weights: { TRANSPORT: 0.15, ENERGY: 0.35, RECYCLING: 0.20, FOOD: 0.15, WATER: 0.15 },
      department: "Finance",
    },
  ];

  // ── 6. Generate actions ──────────────────────────────────────────────────
  console.log("\nGenerating actions...");
  let totalActions = 0;

  for (const profile of profiles) {
    const user = users.find(u => u.email === profile.email);
    if (!user) { console.log(`  Skipping ${profile.email} — not found`); continue; }

    // Global actions (older, spread over ~2 months)
    const globalActs = generateActions(
      user.id, GLOBAL_ID, profile.globalActions, profile.globalSpread, profile.weights
    );

    // Challenge-specific actions (recent, within the challenge window)
    const challengeActs = generateActions(
      user.id, earthMonth.id, profile.challengeActions, profile.challengeSpread, profile.weights
    );

    const allActs = [...globalActs, ...challengeActs];
    await db.action.createMany({ data: allActs });

    const globalPts = globalActs.reduce((s, a) => s + a.points, 0);
    const challengePts = challengeActs.reduce((s, a) => s + a.points, 0);
    totalActions += allActs.length;

    console.log(`  ${user.name.padEnd(6)} | global: ${globalActs.length} actions (${globalPts} pts) | challenge: ${challengeActs.length} actions (${challengePts} pts) | total: ${allActs.length}`);
  }

  console.log(`\nTotal actions created: ${totalActions}`);

  // ── 7. Compute streaks and update user metadata ──────────────────────────
  console.log("\nComputing streaks...");
  for (const user of users) {
    const profile = profiles.find(p => p.email === user.email);

    // Find their most recent action overall
    const latest = await db.action.findFirst({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    });

    // Compute streak: consecutive days from today backwards
    const allUserActions = await db.action.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      select: { createdAt: true },
    });
    const days = new Set(allUserActions.map(a => {
      const d = new Date(a.createdAt);
      return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
    }));
    let streak = 0;
    const now = new Date();
    for (let i = 0; i < 60; i++) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
      if (days.has(key)) streak++;
      else break;
    }

    await db.user.update({
      where: { id: user.id },
      data: {
        onboarded: true,
        streak,
        lastActionDate: latest?.createdAt ?? null,
        department: profile?.department ?? pick(DEPARTMENTS),
      },
    });
    console.log(`  ${user.name.padEnd(6)} | streak: ${streak} days | dept: ${profile?.department ?? "—"}`);
  }

  console.log("\n=== DONE! Fresh mock data seeded. ===");
  await db.$disconnect();
}

main().catch(async (e) => {
  console.error(e);
  await db.$disconnect();
  process.exit(1);
});
