/**
 * File: types.ts
 * Author: GreenStep Team
 * Created: 2026-05-20
 * Description: Shared TypeScript types for the dashboard client and its
 *   helper modules (challenges, teams, leaderboard, actions, badges).
 * Contact: gurm1658@stthomas.edu
 */

export type ChallengeType = { id: string; name: string; code: string };

export type Team = {
  id: string;
  name: string;
  members: {
    id: string;
    name: string;
    email: string;
    teamId: string | null;
  }[];
};

export type LeaderboardTeam = {
  id: string;
  rank: number;
  name: string;
  totalPoints: number;
  memberCount: number;
};

export type ActionItem = {
  id: string;
  actionType: string;
  category: string;
  points: number;
  createdAt: string;
  challengeId?: string | null;
  challengeName?: string | null;
};

export type GlobalActionItem = {
  id: string;
  actionType: string;
  points: number;
  createdAt: string;
  userName: string;
  challengeId?: string | null;
  challengeName?: string | null;
};

export type TeamRequestItem = {
  id: string;
  name: string;
  message: string | null;
  status: "PENDING" | "APPROVED" | "REJECTED";
  createdAt: string;
  reviewedAt: string | null;
  requestedBy: {
    id: string;
    name: string;
    email: string;
  };
  reviewedBy?: {
    id: string;
    name: string;
    email: string;
  } | null;
};

export type Tab = "home" | "leaderboard" | "activity" | "teams";

export type BadgeCtx = {
  actionCount: number;
  pts: number;
  streak: number;
  hasTeam: boolean;
  transportCount: number;
  energyCount: number;
  recyclingCount: number;
  foodCount: number;
  waterCount: number;
  inTop10: boolean;
};
