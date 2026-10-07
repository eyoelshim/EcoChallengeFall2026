import { TeamRequestStatus } from "@prisma/client";
import { db } from "@/lib/db";

type CreateTeamRequestInput = {
  clerkId: string;
  challengeId: string;
  name: string;
  message?: string | null;
};

type ReviewTeamRequestInput = {
  requestId: string;
  reviewerClerkId: string;
  status: "APPROVED" | "REJECTED";
};

export async function createTeamRequest({
  clerkId,
  challengeId,
  name,
  message,
}: CreateTeamRequestInput) {
  const trimmedName = name.trim();
  if (!trimmedName) {
    throw new Error("Team name is required");
  }

  const user = await db.user.findUnique({
    where: { clerkId },
    include: {
      challenges: {
        where: { challengeId },
        select: { challengeId: true },
      },
      teams: {
        include: { team: { select: { challengeId: true } } },
      },
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  if (user.challenges.length === 0) {
    throw new Error("You must join the challenge before requesting a team");
  }

  const alreadyOnTeam = user.teams.some(
    (membership) => membership.team.challengeId === challengeId,
  );
  if (alreadyOnTeam) {
    throw new Error("You already belong to a team in this challenge");
  }

  const existingTeam = await db.team.findFirst({
    where: { challengeId, name: trimmedName },
    select: { id: true },
  });
  if (existingTeam) {
    throw new Error("A team with that name already exists in this challenge");
  }

  const duplicatePendingRequest = await db.teamRequest.findFirst({
    where: {
      challengeId,
      requestedById: user.id,
      name: trimmedName,
      status: TeamRequestStatus.PENDING,
    },
    select: { id: true },
  });
  if (duplicatePendingRequest) {
    throw new Error("You already have a pending request for this team name");
  }

  return db.teamRequest.create({
    data: {
      name: trimmedName,
      message: message?.trim() || null,
      challengeId,
      requestedById: user.id,
    },
    include: {
      requestedBy: { select: { id: true, name: true, email: true } },
      reviewedBy: { select: { id: true, name: true, email: true } },
    },
  });
}

export async function reviewTeamRequest({
  requestId,
  reviewerClerkId,
  status,
}: ReviewTeamRequestInput) {
  const reviewer = await db.user.findUnique({ where: { clerkId: reviewerClerkId } });
  if (!reviewer) {
    throw new Error("User not found");
  }

  const request = await db.teamRequest.findUnique({
    where: { id: requestId },
    include: {
      requestedBy: {
        include: {
          teams: { include: { team: { select: { challengeId: true } } } },
          challenges: { select: { challengeId: true } },
        },
      },
      challenge: { select: { id: true, name: true } },
    },
  });

  if (!request) {
    throw new Error("Team request not found");
  }

  if (request.status !== TeamRequestStatus.PENDING) {
    throw new Error("This request has already been reviewed");
  }

  if (status === "REJECTED") {
    return db.teamRequest.update({
      where: { id: request.id },
      data: {
        status: TeamRequestStatus.REJECTED,
        reviewedById: reviewer.id,
        reviewedAt: new Date(),
      },
      include: {
        requestedBy: { select: { id: true, name: true, email: true } },
        reviewedBy: { select: { id: true, name: true, email: true } },
        challenge: { select: { id: true, name: true } },
      },
    });
  }

  const requesterInChallenge = request.requestedBy.challenges.some(
    (challenge) => challenge.challengeId === request.challengeId,
  );
  if (!requesterInChallenge) {
    throw new Error("Requester is no longer part of this challenge");
  }

  const requesterAlreadyHasTeam = request.requestedBy.teams.some(
    (membership) => membership.team.challengeId === request.challengeId,
  );
  if (requesterAlreadyHasTeam) {
    throw new Error("Requester already belongs to a team in this challenge");
  }

  const duplicateTeam = await db.team.findFirst({
    where: { challengeId: request.challengeId, name: request.name },
    select: { id: true },
  });
  if (duplicateTeam) {
    throw new Error("A team with that name already exists in this challenge");
  }

  return db.$transaction(async (tx) => {
    const team = await tx.team.create({
      data: {
        name: request.name,
        challengeId: request.challengeId,
      },
    });

    await tx.teamMember.create({
      data: {
        userId: request.requestedById,
        teamId: team.id,
      },
    });

    return tx.teamRequest.update({
      where: { id: request.id },
      data: {
        status: TeamRequestStatus.APPROVED,
        reviewedById: reviewer.id,
        reviewedAt: new Date(),
      },
      include: {
        requestedBy: { select: { id: true, name: true, email: true } },
        reviewedBy: { select: { id: true, name: true, email: true } },
        challenge: { select: { id: true, name: true } },
      },
    });
  });
}
