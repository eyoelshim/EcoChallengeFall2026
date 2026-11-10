/**
 * One-time sync of User.status → Clerk ban state, for users deactivated before
 * deactivation started banning the Clerk account.
 * Run with: node scripts/sync-clerk-bans.js          (dry run, prints changes)
 *           node scripts/sync-clerk-bans.js --apply  (writes them)
 *
 * DEACTIVATED → banned (cannot sign in), ACTIVE → unbanned.
 * Safe to run multiple times — only users whose ban state differs are updated.
 */

require("dotenv").config({ path: ".env.local" });
const { createClerkClient } = require("@clerk/backend");
const { PrismaClient } = require("@prisma/client");

const db = new PrismaClient();
const clerk = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });
const apply = process.argv.includes("--apply");

async function main() {
  const clerkBanned = new Map();
  for (let offset = 0; ; offset += 100) {
    const { data } = await clerk.users.getUserList({ limit: 100, offset });
    for (const u of data) clerkBanned.set(u.id, u.banned);
    if (data.length < 100) break;
  }

  const users = await db.user.findMany({ select: { clerkId: true, email: true, status: true } });
  let changes = 0;

  for (const user of users) {
    if (!clerkBanned.has(user.clerkId)) {
      console.log(`  skip  ${user.email} (not found in Clerk)`);
      continue;
    }
    const shouldBan = user.status === "DEACTIVATED";
    if (shouldBan === clerkBanned.get(user.clerkId)) continue;

    changes++;
    const verb = shouldBan ? "ban" : "unban";
    console.log(`  ${apply ? verb : `would ${verb}`}  ${user.email}`);
    if (apply) {
      if (shouldBan) await clerk.users.banUser(user.clerkId);
      else await clerk.users.unbanUser(user.clerkId);
    }
  }

  console.log(`\n${changes} change(s)${apply ? " applied" : " found — rerun with --apply to write them"}.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
