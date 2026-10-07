/**
 * Seed the permanent Global challenge.
 * Run with: node scripts/seed-global-challenge.js
 *
 * Safe to run multiple times — uses upsert so it won't duplicate.
 * Also enrolls every existing user who isn't already enrolled.
 */

require("dotenv").config({ path: ".env.local" });
const { PrismaClient } = require("@prisma/client");
const db = new PrismaClient();

const GLOBAL_CHALLENGE_ID = "global";

async function main() {
  // 1. Upsert the global challenge record
  await db.challenge.upsert({
    where: { id: GLOBAL_CHALLENGE_ID },
    update: {},
    create: {
      id: GLOBAL_CHALLENGE_ID,
      name: "GreenStep",
      code: "__GLOBAL__",   // not user-facing, just needs to satisfy unique constraint
      startDate: null,
      endDate: null,
    },
  });
  console.log("Global challenge record ensured (id: global)");

  // 2. Enroll every existing user who isn't already in the global challenge
  const allUsers = await db.user.findMany({ select: { id: true } });
  let enrolled = 0;
  for (const user of allUsers) {
    const exists = await db.userChallenge.findUnique({
      where: { userId_challengeId: { userId: user.id, challengeId: GLOBAL_CHALLENGE_ID } },
    });
    if (!exists) {
      await db.userChallenge.create({
        data: { userId: user.id, challengeId: GLOBAL_CHALLENGE_ID },
      });
      enrolled++;
    }
  }
  console.log(`Enrolled ${enrolled} existing user(s) in global challenge (${allUsers.length} total users)`);

  // 3. Re-tag any orphaned actions (challengeId = null) to the global challenge
  const updated = await db.action.updateMany({
    where: { challengeId: null },
    data: { challengeId: GLOBAL_CHALLENGE_ID },
  });
  console.log(`Re-tagged ${updated.count} orphaned action(s) to global challenge`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => db.$disconnect());
