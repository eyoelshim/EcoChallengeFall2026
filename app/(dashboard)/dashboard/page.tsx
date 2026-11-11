/**
 * @file app/(dashboard)/dashboard/page.tsx
 * @description Server Component entrypoint for the participant dashboard.
 * Resolves user identity, ensures global challenge enrollment, and passes
 * scoped team memberships and initial streak stats to DashboardClient.
 */

import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { isAdminUser } from "@/lib/authz";
import { UserStatus } from "@prisma/client";
import { db } from "@/lib/db";
import { GLOBAL_CHALLENGE_ID } from "@/lib/constants";
import { ensureGlobalChallengeExists } from "@/lib/global-challenge";
import DashboardClient from "./DashboardClient";

/**
 * Server Component rendering the participant dashboard.
 *
 * @returns DashboardClient component hydrated with user metadata.
 */
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
    challenges: {
      where: { challengeId: GLOBAL_CHALLENGE_ID },
      select: { id: true },
    },
  } as const;

  const existingByClerkId = await db.user.findUnique({
    where: { clerkId: user.id },
    include: userInclude,
  });

  const targetName = user.firstName || "User";

  const dbUser = existingByClerkId
    ? existingByClerkId.email !== email || existingByClerkId.name !== targetName
      ? await db.user.update({
          where: { id: existingByClerkId.id },
          data: {
            email,
            name: targetName,
          },
          include: userInclude,
        })
      : existingByClerkId
    : await (async () => {
        const existingByEmail = await db.user.findUnique({
          where: { email },
          include: userInclude,
        });

        // Pre-created rows (bulk invites, /join) already hold the department; linking here
        // attaches the Clerk account and turns the pending invitee into an active participant
        if (existingByEmail) {
          return db.user.update({
            where: { id: existingByEmail.id },
            data: {
              clerkId: user.id,
              email,
              name: targetName,
              ...(existingByEmail.status === UserStatus.INVITED && {
                status: UserStatus.ACTIVE,
              }),
            },
            include: userInclude,
          });
        }

        return db.user.create({
          data: {
            clerkId: user.id,
            email,
            name: targetName,
          },
          include: userInclude,
        });
      })();

  if (!dbUser.onboarded) {
    redirect("/onboarding");
  }

  // Ensure user is enrolled in the global challenge only if not already enrolled
  const isEnrolledInGlobal = dbUser.challenges.length > 0;
  if (!isEnrolledInGlobal) {
    await ensureGlobalChallengeExists();
    await db.userChallenge.upsert({
      where: {
        userId_challengeId: {
          userId: dbUser.id,
          challengeId: GLOBAL_CHALLENGE_ID,
        },
      },
      update: {},
      create: { userId: dbUser.id, challengeId: GLOBAL_CHALLENGE_ID },
    });
  }

  // Pass all team memberships so the client can derive the active team
  // based on whichever challenge is currently selected.
  const teamMemberships = dbUser.teams.map(
    (m: {
      teamId: string;
      team: { id: string; challengeId: string | null };
    }) => ({
      teamId: m.teamId,
      challengeId: m.team.challengeId,
    }),
  );

  return (
    <DashboardClient
      firstName={targetName}
      teamMemberships={teamMemberships}
      initialStreak={dbUser.streak}
      isAdmin={isAdminUser(user)}
    />
  );
}
