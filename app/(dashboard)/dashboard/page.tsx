import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { GLOBAL_CHALLENGE_ID } from "@/lib/constants";
import { ensureGlobalChallengeExists } from "@/lib/global-challenge";
import DashboardClient from "./DashboardClient";

export default async function DashboardPage() {
  const user = await currentUser();

  if (!user) {
    redirect("/sign-in");
  }

  const email = user.emailAddresses[0]?.emailAddress;
  if (!email) {
    redirect("/sign-in");
  }

  const userInclude = {
    teams: {
      include: { team: { select: { id: true, challengeId: true } } },
    },
  } as const;

  const existingByClerkId = await db.user.findUnique({
    where: { clerkId: user.id },
    include: userInclude,
  });

  const dbUser = existingByClerkId
    ? await db.user.update({
        where: { id: existingByClerkId.id },
        data: {
          email,
          name: user.firstName || "User",
        },
        include: userInclude,
      })
    : await (async () => {
        const existingByEmail = await db.user.findUnique({
          where: { email },
          include: userInclude,
        });

        if (existingByEmail) {
          return db.user.update({
            where: { id: existingByEmail.id },
            data: {
              clerkId: user.id,
              email,
              name: user.firstName || "User",
            },
            include: userInclude,
          });
        }

        return db.user.create({
          data: {
            clerkId: user.id,
            email,
            name: user.firstName || "User",
          },
          include: userInclude,
        });
      })();

  if (!dbUser.onboarded) {
    redirect("/onboarding");
  }

  await ensureGlobalChallengeExists();

  // Ensure user is enrolled in the global challenge (idempotent)
  await db.userChallenge.upsert({
    where: {
      userId_challengeId: { userId: dbUser.id, challengeId: GLOBAL_CHALLENGE_ID },
    },
    update: {},
    create: { userId: dbUser.id, challengeId: GLOBAL_CHALLENGE_ID },
  });

  // Pass all team memberships so the client can derive the active team
  // based on whichever challenge is currently selected.
  const teamMemberships = dbUser.teams.map((m: { teamId: string; team: { id: string; challengeId: string | null } }) => ({
    teamId: m.teamId,
    challengeId: m.team.challengeId,
  }));

  return (
    <DashboardClient
      firstName={user.firstName || "User"}
      teamMemberships={teamMemberships}
      initialStreak={dbUser.streak}
      isAdmin={user.publicMetadata?.role === "admin"}
    />
  );
}
