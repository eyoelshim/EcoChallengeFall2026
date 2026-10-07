/**
 * Mock data seed script
 * Run with: node scripts/seed-mock.js
 *
 * What it does:
 *  1. Links existing teams to the "Earth Month 2026" challenge
 *  2. Enrolls all users in the challenge
 *  3. Assigns users to teams
 *  4. Generates realistic actions spread over the past 30 days
 *  5. Marks all users as onboarded + computes streaks
 */

require("dotenv").config({ path: ".env.local" });
const { PrismaClient } = require("@prisma/client");
const db = new PrismaClient();

// ── Action catalogue (mirrors lib/actions-data.ts) ──────────────────────────
const ACTIONS = {
  TRANSPORT: [
    { actionType: "Biked to work",       points: 50 },
    { actionType: "Used public transit", points: 30 },
    { actionType: "Carpooled",           points: 25 },
    { actionType: "Walked to work",      points: 40 },
    { actionType: "Electric vehicle",    points: 35 },
  ],
  ENERGY: [
    { actionType: "Turned off unused lights",       points: 10 },
    { actionType: "Used natural lighting",          points: 15 },
    { actionType: "Unplugged devices",              points: 12 },
    { actionType: "Adjusted thermostat",            points: 20 },
    { actionType: "Used energy-efficient equipment",points: 18 },
  ],
  RECYCLING: [
    { actionType: "Recycled paper",          points: 15 },
    { actionType: "Recycled plastic",        points: 15 },
    { actionType: "Composted food waste",    points: 20 },
    { actionType: "Brought reusable mug",    points: 20 },
    { actionType: "Used reusable containers",points: 15 },
  ],
  FOOD: [
    { actionType: "Ate plant-based meal",   points: 30 },
    { actionType: "Bought local produce",   points: 22 },
    { actionType: "Avoided food waste",     points: 25 },
    { actionType: "Packed lunch from home", points: 18 },
    { actionType: "Used reusable utensils", points: 12 },
  ],
  WATER: [
    { actionType: "Took shorter shower",         points: 20 },
    { actionType: "Fixed a leak",                points: 40 },
    { actionType: "Used low-flow fixtures",      points: 25 },
    { actionType: "Used refillable bottle",      points: 15 },
    { actionType: "Turned off tap while washing",points: 18 },
  ],
};
const CATEGORIES = Object.keys(ACTIONS);

function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

/** Return a Date N days ago, at a random time that day */
function daysAgo(n, hourOffset = 0) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(7 + hourOffset + Math.floor(Math.random() * 6), Math.floor(Math.random() * 60), 0, 0);
  return d;
}

/** Generate mock actions for a user. spread = how many of the last N days to hit */
function generateActions(userId, challengeId, count, spread) {
  const used = new Set(); // prevent two actions on same day with same type
  const actions = [];
  for (let i = 0; i < count; i++) {
    const daysBack = Math.floor(Math.random() * spread);
    const cat  = pick(CATEGORIES);
    const item = pick(ACTIONS[cat]);
    const key  = `${daysBack}-${item.actionType}`;
    if (used.has(key)) continue;
    used.add(key);
    actions.push({
      userId,
      challengeId,
      category: cat,
      actionType: item.actionType,
      points: item.points,
      date:      daysAgo(daysBack),
      createdAt: daysAgo(daysBack, 1),
    });
  }
  return actions;
}

async function main() {
  // ── 1. Load existing data ──────────────────────────────────────────────────
  const challenge = await db.challenge.findFirst({ where: { code: "TEST26" } });
  if (!challenge) { console.error("Challenge TEST26 not found."); process.exit(1); }
  console.log(`Challenge: ${challenge.name} (${challenge.id})`);

  const users = await db.user.findMany();
  console.log(`Users found: ${users.map(u => u.name).join(", ")}`);

  const teams = await db.team.findMany();
  console.log(`Teams found: ${teams.map(t => t.name).join(", ")}`);

  // ── 2. Link teams to challenge ─────────────────────────────────────────────
  for (const team of teams) {
    if (team.challengeId !== challenge.id) {
      await db.team.update({ where: { id: team.id }, data: { challengeId: challenge.id } });
      console.log(`  Linked team "${team.name}" to challenge`);
    }
  }

  // ── 3. Assign users to teams & challenge ───────────────────────────────────
  // Oli (oligurmessa)  → Team Alpha
  // Hadi               → Team Alpha
  // App                → Team Beta
  // Nate               → Team Beta
  // Oli (issolly)      → UST
  const teamAlpha = teams.find(t => t.name === "Team Alpha");
  const teamBeta  = teams.find(t => t.name === "Team Beta");
  const teamUST   = teams.find(t => t.name === "UST");

  const assignments = [
    { email: "oligurmessa@gmail.com",   team: teamAlpha },
    { email: "itshadi.sh@gmail.com",    team: teamAlpha },
    { email: "appreviewtrial@gmail.com",team: teamBeta  },
    { email: "nate.agbemadon@gmail.com",team: teamBeta  },
    { email: "issolly2457@gmail.com",   team: teamUST   },
  ];

  for (const { email, team } of assignments) {
    const user = users.find(u => u.email === email);
    if (!user || !team) { console.log(`  Skipping ${email} — user or team not found`); continue; }

    // Enroll in challenge
    await db.userChallenge.upsert({
      where: { userId_challengeId: { userId: user.id, challengeId: challenge.id } },
      update: {},
      create: { userId: user.id, challengeId: challenge.id },
    });

    // Join team
    await db.teamMember.upsert({
      where: { userId_teamId: { userId: user.id, teamId: team.id } },
      update: {},
      create: { userId: user.id, teamId: team.id },
    });

    console.log(`  ${user.name} (${email}) → ${team.name}`);
  }

  // ── 4. Clear old mock actions (clean slate) ────────────────────────────────
  const userIds = users.map(u => u.id);
  const deleted = await db.action.deleteMany({ where: { userId: { in: userIds } } });
  console.log(`\nCleared ${deleted.count} existing actions`);

  // ── 5. Generate mock actions ───────────────────────────────────────────────
  const profiles = [
    { email: "oligurmessa@gmail.com",    count: 22, spread: 28 }, // active
    { email: "itshadi.sh@gmail.com",     count: 18, spread: 25 }, // active
    { email: "appreviewtrial@gmail.com", count: 10, spread: 20 }, // moderate
    { email: "nate.agbemadon@gmail.com", count: 14, spread: 22 }, // moderate
    { email: "issolly2457@gmail.com",    count: 8,  spread: 15 }, // light
  ];

  for (const { email, count, spread } of profiles) {
    const user = users.find(u => u.email === email);
    if (!user) continue;
    const actions = generateActions(user.id, challenge.id, count, spread);
    await db.action.createMany({ data: actions });
    const pts = actions.reduce((s, a) => s + a.points, 0);
    console.log(`  ${user.name}: ${actions.length} actions, ${pts} pts`);
  }

  // ── 6. Mark all users onboarded & compute streaks ─────────────────────────
  for (const user of users) {
    // Find their most recent action
    const latest = await db.action.findFirst({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    });

    // Compute a simple streak (consecutive days from today backwards)
    const allActions = await db.action.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      select: { createdAt: true },
    });
    const days = new Set(allActions.map(a => {
      const d = new Date(a.createdAt);
      return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
    }));
    let streak = 0;
    const now = new Date();
    for (let i = 0; i < 30; i++) {
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
        department: user.department ?? pick(["Engineering", "Marketing", "Operations", "HR", "Finance"]),
      },
    });
    console.log(`  ${user.name}: streak=${streak}, onboarded=true`);
  }

  console.log("\nDone! Mock data seeded successfully.");
  await db.$disconnect();
}

main().catch(async (e) => {
  console.error(e);
  await db.$disconnect();
  process.exit(1);
});
