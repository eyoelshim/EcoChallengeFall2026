/**
 * File: helpers.ts
 * Author: GreenStep Team
 * Created: 2026-05-20
 * Description: Pure presentation helpers for the dashboard — relative time
 *   formatting, challenge labels/pill colors, level computation, badge
 *   animation class selection, and rank grouping.
 * Contact: gurm1658@stthomas.edu
 */

import { GLOBAL_CHALLENGE_ID } from "@/lib/constants";

/** Formats an ISO timestamp as a short relative string (e.g. "5 mins ago"). */
export function timeAgo(createdAt: string) {
  const now = new Date().getTime();
  const created = new Date(createdAt).getTime();
  const diffInMinutes = Math.max(1, Math.floor((now - created) / 60000));
  if (diffInMinutes < 60)
    return `${diffInMinutes} min${diffInMinutes === 1 ? "" : "s"} ago`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24)
    return `${diffInHours} hr${diffInHours === 1 ? "" : "s"} ago`;
  const diffInDays = Math.floor(diffInHours / 24);
  return `${diffInDays} day${diffInDays === 1 ? "" : "s"} ago`;
}

/**
 * Returns the display label for a challenge, falling back to "All Activity"
 * for the global challenge and "Challenge" when no name is provided.
 * @param challengeId The challenge id, or null/undefined for global.
 * @param challengeName The challenge's display name, if known.
 */
export function getChallengeLabel(
  challengeId?: string | null,
  challengeName?: string | null,
) {
  if (!challengeId || challengeId === GLOBAL_CHALLENGE_ID) {
    return "All Activity";
  }

  return challengeName ?? "Challenge";
}

/**
 * Picks a stable Tailwind color-pill class for a challenge id so the same
 * challenge always renders the same color.
 * @param challengeId The challenge id, or null/undefined for global.
 */
export function getChallengePillClasses(challengeId?: string | null) {
  if (!challengeId || challengeId === GLOBAL_CHALLENGE_ID) {
    return "bg-slate-100 text-slate-700";
  }

  const palette = [
    "bg-emerald-100 text-emerald-800",
    "bg-sky-100 text-sky-800",
    "bg-amber-100 text-amber-800",
    "bg-rose-100 text-rose-800",
    "bg-violet-100 text-violet-800",
    "bg-cyan-100 text-cyan-800",
  ];

  const hash = challengeId
    .split("")
    .reduce((sum, char) => sum + char.charCodeAt(0), 0);

  return palette[hash % palette.length];
}

/**
 * Computes level metadata (title, current progress, goal) from a point total.
 * @param totalPoints The user's point total for the active scope.
 */
export function getLevelInfo(totalPoints: number) {
  const levels = [
    { level: 1, title: "Green Starter", min: 0, max: 99 },
    { level: 2, title: "Eco Learner", min: 100, max: 249 },
    { level: 3, title: "Eco Enthusiast", min: 250, max: 499 },
    { level: 4, title: "Green Champion", min: 500, max: 999 },
    { level: 5, title: "Eco Hero", min: 1000, max: Infinity },
  ];
  const entry = levels.findLast((l) => totalPoints >= l.min) ?? levels[0];
  const isMaxLevel = entry.max === Infinity;
  const nextLevelAt = isMaxLevel ? null : entry.max + 1;
  const goal = nextLevelAt ? nextLevelAt - entry.min : null;
  return {
    level: entry.level,
    title: entry.title,
    current: isMaxLevel ? totalPoints : totalPoints - entry.min,
    goal,
    isMaxLevel,
    nextLevelAt,
    totalPoints,
  };
}

/** Maps a badge id to its CSS hover-animation class. */
export function getBadgeAnimationClass(id: string) {
  switch (id) {
    case "first_steps":
    case "go_getter":
    case "plant_based_pro":
      return "badge-sway";
    case "team_player":
      return "badge-team-bounce";
    case "on_fire":
    case "week_warrior":
      return "badge-flame";
    case "century_club":
    case "zero_waste":
    case "overachiever":
      return "badge-crown-shine";
    case "rising_star":
    case "quarter_grand":
    case "eco_champion":
    case "legend":
      return "badge-trophy-pop";
    case "action_hero":
    case "energy_saver":
    case "fortnight":
      return "badge-zap";
    case "transport_hero":
      return "badge-drift";
    case "water_guardian":
      return "badge-ripple";
    default:
      return "badge-sway";
  }
}

/**
 * Groups consecutive ranked items that share the same rank (for ties).
 * @param items Items already sorted by rank.
 */
export function groupByRank<T extends { rank: number }>(items: T[]) {
  return items.reduce<T[][]>((groups, item) => {
    const lastGroup = groups[groups.length - 1];
    if (lastGroup?.[0]?.rank === item.rank) {
      lastGroup.push(item);
    } else {
      groups.push([item]);
    }

    return groups;
  }, []);
}
