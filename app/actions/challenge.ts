"use server";

import { db } from "@/lib/db";
import { isCurrentUserAdmin } from "@/lib/authz";
import { auth } from "@clerk/nextjs/server";

export async function createChallenge(data: { name: string; startDate?: Date; endDate?: Date }) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");
  if (!(await isCurrentUserAdmin())) throw new Error("Forbidden");

  const user = await db.user.findUnique({ where: { clerkId: userId } });
  if (!user) throw new Error("User not found");
  if (!data.name.trim()) throw new Error("Challenge name is required");

  let code = "";
  do {
    code = Math.random().toString(36).substring(2, 8).toUpperCase();
  } while (await db.challenge.findUnique({ where: { code } }));

  const challenge = await db.challenge.create({
    data: {
      name: data.name.trim(),
      code,
      startDate: data.startDate,
      endDate: data.endDate,
    },
  });

  // Automatically join the user to the challenge they created
  await db.userChallenge.create({
    data: {
      userId: user.id,
      challengeId: challenge.id,
    },
  });

  return challenge;
}

export async function joinChallenge(code: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({ where: { clerkId: userId } });
  if (!user) throw new Error("User not found");

  const challenge = await db.challenge.findUnique({
    where: { code: code.toUpperCase() },
  });

  if (!challenge || challenge.id === "global") {
    throw new Error("Invalid challenge code");
  }

  // Block joining an expired challenge
  if (challenge.endDate && new Date(challenge.endDate) < new Date()) {
    throw new Error("This challenge has ended");
  }

  // Check if user is already in the challenge
  const existing = await db.userChallenge.findUnique({
    where: {
      userId_challengeId: {
        userId: user.id,
        challengeId: challenge.id,
      },
    },
  });

  if (existing) {
    throw new Error("You have already joined this challenge");
  }

  const join = await db.userChallenge.create({
    data: {
      userId: user.id,
      challengeId: challenge.id,
    },
  });

  return join;
}

export async function getUserChallenges() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({ 
    where: { clerkId: userId },
    include: {
      challenges: {
        include: {
          challenge: true
        }
      }
    }
  });

  if (!user) throw new Error("User not found");

  return user.challenges.map(uc => uc.challenge);
}
