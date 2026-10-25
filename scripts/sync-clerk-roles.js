/**
 * One-time sync of Clerk publicMetadata.role → User.role in the database.
 * Run with: node scripts/sync-clerk-roles.js          (dry run, prints changes)
 *           node scripts/sync-clerk-roles.js --apply  (writes them)
 *
 * Clerk "superadmin" → SUPERADMIN, "admin" → ADMIN, anything else → GENERAL_USER.
 * Safe to run multiple times — only rows whose role differs are updated.
 */

require("dotenv").config({ path: ".env.local" });
const { createClerkClient } = require("@clerk/backend");
const { PrismaClient } = require("@prisma/client");

const db = new PrismaClient();
const clerk = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });
const apply = process.argv.includes("--apply");

function toDbRole(clerkRole) {
  if (clerkRole === "superadmin") return "SUPERADMIN";
  if (clerkRole === "admin") return "ADMIN";
  return "GENERAL_USER";
}

async function main() {
  const clerkRoles = new Map();
  for (let offset = 0; ; offset += 100) {
    const { data } = await clerk.users.getUserList({ limit: 100, offset });
    for (const u of data) clerkRoles.set(u.id, u.publicMetadata?.role);
    if (data.length < 100) break;
  }

  const users = await db.user.findMany({ select: { id: true, clerkId: true, name: true, email: true, role: true } });
  let changes = 0;

  for (const user of users) {
    if (!clerkRoles.has(user.clerkId)) {
      console.log(`  skip  ${user.email} (not found in Clerk)`);
      continue;
    }
    const role = toDbRole(clerkRoles.get(user.clerkId));
    if (role === user.role) continue;

    changes++;
    console.log(`  ${apply ? "set " : "would set"}  ${user.email}: ${user.role} → ${role}`);
    if (apply) await db.user.update({ where: { id: user.id }, data: { role } });
  }

  console.log(`\n${changes} change(s)${apply ? " applied" : " found — rerun with --apply to write them"}.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
