"use client";

import { UserButton } from "@clerk/nextjs";
import Link from "next/link";
import React, { useCallback, useEffect, useState } from "react";
import { getUserChallenges, joinChallenge } from "@/app/actions/challenge";
import { GLOBAL_CHALLENGE_ID } from "@/lib/constants";
import {
  Home,
  Leaf,
  Trophy,
  Users,
  Plus,
  Activity,
  Flame,
  Zap,
  Crown,
  X,
} from "lucide-react";
import Image from "next/image";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import type {
  ChallengeType,
  Team,
  LeaderboardTeam,
  ActionItem,
  GlobalActionItem,
  TeamRequestItem,
  Tab,
  BadgeCtx,
} from "./types";
import { useCountUp } from "./useCountUp";
import {
  timeAgo,
  getChallengeLabel,
  getChallengePillClasses,
  getLevelInfo,
  getBadgeAnimationClass,
  groupByRank,
} from "./helpers";

const BADGES: {
  id: string;
  icon: React.ReactNode;
  label: string;
  desc: string;
  earned: (ctx: BadgeCtx) => boolean;
}[] = [
  {
    id: "first_steps",
    icon: <Leaf className="h-8 w-8 text-emerald-500" />,
    label: "First Steps",
    desc: "Completed first action",
    earned: (c) => c.actionCount >= 1,
  },
  {
    id: "team_player",
    icon: <Users className="h-8 w-8 text-blue-500" />,
    label: "Team Player",
    desc: "Joined a team",
    earned: (c) => c.hasTeam,
  },
  {
    id: "on_fire",
    icon: <Flame className="h-8 w-8 text-orange-500" />,
    label: "On Fire",
    desc: "3-day streak",
    earned: (c) => c.streak >= 3,
  },
  {
    id: "week_warrior",
    icon: <Flame className="h-8 w-8 text-red-500" />,
    label: "Week Warrior",
    desc: "7-day streak",
    earned: (c) => c.streak >= 7,
  },
  {
    id: "century_club",
    icon: <Crown className="h-8 w-8 text-purple-500" />,
    label: "Century Club",
    desc: "100 points earned",
    earned: (c) => c.pts >= 100,
  },
  {
    id: "rising_star",
    icon: <Trophy className="h-8 w-8 text-amber-500" />,
    label: "Rising Star",
    desc: "Top 10 this month",
    earned: (c) => c.inTop10,
  },
  {
    id: "action_hero",
    icon: <Zap className="h-8 w-8 text-yellow-500" />,
    label: "Action Hero",
    desc: "Logged 10 actions",
    earned: (c) => c.actionCount >= 10,
  },
  {
    id: "energy_saver",
    icon: <Zap className="h-8 w-8 text-teal-500" />,
    label: "Energy Saver",
    desc: "20 energy actions",
    earned: (c) => c.energyCount >= 20,
  },
  {
    id: "transport_hero",
    icon: <Leaf className="h-8 w-8 text-blue-600" />,
    label: "Transport Hero",
    desc: "15 transport actions",
    earned: (c) => c.transportCount >= 15,
  },
  {
    id: "quarter_grand",
    icon: <Trophy className="h-8 w-8 text-teal-600" />,
    label: "Quarter Grand",
    desc: "250 points earned",
    earned: (c) => c.pts >= 250,
  },
  {
    id: "go_getter",
    icon: <Leaf className="h-8 w-8 text-lime-500" />,
    label: "Go-Getter",
    desc: "Logged 25 actions",
    earned: (c) => c.actionCount >= 25,
  },
  {
    id: "water_guardian",
    icon: <Leaf className="h-8 w-8 text-cyan-500" />,
    label: "Water Guardian",
    desc: "10 water actions",
    earned: (c) => c.waterCount >= 10,
  },
  {
    id: "zero_waste",
    icon: <Crown className="h-8 w-8 text-green-600" />,
    label: "Zero Waste",
    desc: "15 recycling actions",
    earned: (c) => c.recyclingCount >= 15,
  },
  {
    id: "eco_champion",
    icon: <Trophy className="h-8 w-8 text-yellow-600" />,
    label: "Eco Champion",
    desc: "500 points earned",
    earned: (c) => c.pts >= 500,
  },
  {
    id: "fortnight",
    icon: <Zap className="h-8 w-8 text-indigo-500" />,
    label: "Fortnight",
    desc: "14-day streak",
    earned: (c) => c.streak >= 14,
  },
  {
    id: "overachiever",
    icon: <Crown className="h-8 w-8 text-pink-500" />,
    label: "Overachiever",
    desc: "Logged 50 actions",
    earned: (c) => c.actionCount >= 50,
  },
  {
    id: "plant_based_pro",
    icon: <Leaf className="h-8 w-8 text-orange-400" />,
    label: "Plant-Based Pro",
    desc: "10 food actions",
    earned: (c) => c.foodCount >= 10,
  },
  {
    id: "legend",
    icon: <Trophy className="h-8 w-8 text-orange-600" />,
    label: "Legend",
    desc: "1,000 points earned",
    earned: (c) => c.pts >= 1000,
  },
];

export default function DashboardClient({
  firstName,
  teamMemberships,
  initialStreak,
  isAdmin,
}: {
  firstName: string;
  teamMemberships: { teamId: string; challengeId: string | null }[];
  initialStreak: number;
  isAdmin: boolean;
}) {
  const [challenges, setChallenges] = useState<ChallengeType[]>([]);
  const [globalChallengeName, setGlobalChallengeName] = useState("GreenStep");
  const [activeChallengeId, setActiveChallengeId] =
    useState<string>(GLOBAL_CHALLENGE_ID);
  const [showChallengeModal, setShowChallengeModal] = useState(false);
  const [challengeCode, setChallengeCode] = useState("");
  const [challengeError, setChallengeError] = useState("");
  const [leaveChallengeLoading, setLeaveChallengeLoading] = useState(false);
  const [leaveChallengeError, setLeaveChallengeError] = useState("");
  const [showLeaveChallengeModal, setShowLeaveChallengeModal] = useState(false);
  const [leaveTeamLoading, setLeaveTeamLoading] = useState(false);
  const [leaveTeamError, setLeaveTeamError] = useState("");
  const [showLeaveTeamModal, setShowLeaveTeamModal] = useState(false);
  const [activityModal, setActivityModal] = useState<
    "my-activity" | "community-feed" | null
  >(null);

  const [teams, setTeams] = useState<Team[]>([]);
  const [teamRequests, setTeamRequests] = useState<TeamRequestItem[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardTeam[]>([]);
  const [actions, setActions] = useState<ActionItem[]>([]); // challenge-scoped (stat cards)
  const [myActivity, setMyActivity] = useState<ActionItem[]>([]); // all-time personal (My Activity + badges)
  const [globalFeed, setGlobalFeed] = useState<GlobalActionItem[]>([]);
  // localMemberships tracks joins made this session (augments the server-passed list)
  const [localMemberships, setLocalMemberships] = useState(teamMemberships);
  const [loading, setLoading] = useState(false);
  const [teamError, setTeamError] = useState("");
  const [requestName, setRequestName] = useState("");
  const [requestMessage, setRequestMessage] = useState("");
  const [requestError, setRequestError] = useState("");
  const [requestSuccess, setRequestSuccess] = useState("");
  const [requestLoading, setRequestLoading] = useState(false);
  const [tab, setTab] = useState<Tab>("home");
  const [streak, setStreak] = useState(initialStreak);

  // Category filtering for activity views
  type CategoryType =
    | "ALL"
    | "TRANSPORT"
    | "WATER"
    | "ENERGY"
    | "RECYCLING"
    | "FOOD";

  // Derive active category from challenge selection
  const activeCategory: CategoryType = activeChallengeId.startsWith("CATEGORY_")
    ? (activeChallengeId.replace("CATEGORY_", "") as CategoryType)
    : "ALL";
  const isCategoryView = activeCategory !== "ALL";

  // Global lifetime stats (not challenge-scoped) — for badges & level
  const [globalPoints, setGlobalPoints] = useState(0);
  const [globalActionCount, setGlobalActionCount] = useState(0);

  // Whether the user is viewing the global (non-challenge) experience or a category filter
  const isGlobalView = activeChallengeId === GLOBAL_CHALLENGE_ID;

  // Derive current team from active challenge — single source of truth
  const currentTeamId = isGlobalView
    ? null
    : isCategoryView
      ? (localMemberships[0]?.teamId ?? null)
      : (localMemberships.find((m) => m.challengeId === activeChallengeId)
          ?.teamId ?? null);

  // Leaderboard view toggle (global = individual only)
  type LeaderboardView = "team" | "individual";
  const [leaderboardView, setLeaderboardView] =
    useState<LeaderboardView>("team");
  type IndividualRankItem = {
    rank: number;
    name: string;
    teamName: string | null;
    value: number;
    unit: string;
  };
  const [individualLeaderboard, setIndividualLeaderboard] = useState<
    IndividualRankItem[]
  >([]);

  // Performance chart state
  type StatPoint = { label: string; you: number; average: number };
  type ChartRange = "week" | "month" | "alltime";
  const [chartRange, setChartRange] = useState<ChartRange>("week");
  const [statsData, setStatsData] = useState<StatPoint[]>([]);

  async function loadUserChallenges() {
    try {
      const userChallenges = (await getUserChallenges()) as ChallengeType[];
      const globalChallenge = userChallenges.find(
        (challenge) => challenge.id === GLOBAL_CHALLENGE_ID,
      );
      const namedChallenges = userChallenges.filter(
        (challenge) =>
          challenge.id !== GLOBAL_CHALLENGE_ID &&
          challenge.name.toLowerCase() !==
            (globalChallenge?.name ?? "greenstep").toLowerCase(),
      );
      setGlobalChallengeName(globalChallenge?.name ?? "GreenStep");
      setChallenges(namedChallenges);
      const saved = localStorage.getItem("activeChallengeId");
      const isSavedCategoryView = saved?.startsWith("CATEGORY_") ?? false;

      if (saved && namedChallenges.find((c) => c.id === saved)) {
        setActiveChallengeId(saved);
      } else if (isSavedCategoryView && saved) {
        setActiveChallengeId(saved);
      } else if (saved === GLOBAL_CHALLENGE_ID) {
        setActiveChallengeId(GLOBAL_CHALLENGE_ID);
      } else if (namedChallenges.length > 0) {
        setActiveChallengeId(namedChallenges[0].id);
        localStorage.setItem("activeChallengeId", namedChallenges[0].id);
      } else {
        // No specific challenges — default to global
        setActiveChallengeId(GLOBAL_CHALLENGE_ID);
        localStorage.setItem("activeChallengeId", GLOBAL_CHALLENGE_ID);
      }
    } catch (e) {
      console.error(e);
    }
  }

  async function handleJoinChallenge(e: React.FormEvent) {
    e.preventDefault();
    setChallengeError("");
    setLoading(true);
    try {
      await joinChallenge(challengeCode);
      await loadUserChallenges();
      setShowChallengeModal(false);
      setChallengeCode("");
    } catch (e) {
      setChallengeError((e as Error).message || "Failed to join challenge");
    } finally {
      setLoading(false);
    }
  }

  function handleChallengeChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const val = e.target.value;
    setActiveChallengeId(val);
    setLeaveChallengeError("");
    localStorage.setItem("activeChallengeId", val);

    // Reset to individual leaderboard when switching to global or category view (no teams)
    if (val === GLOBAL_CHALLENGE_ID) {
      setLeaderboardView("individual");
      setTab((prev) => (prev === "teams" ? "home" : prev));
    }
  }

  async function handleLeaveChallenge() {
    if (!activeChallengeId || activeChallengeId === GLOBAL_CHALLENGE_ID) {
      return;
    }

    setLeaveChallengeLoading(true);
    setLeaveChallengeError("");
    try {
      const res = await fetch("/api/challenge/leave", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ challengeId: activeChallengeId }),
      });
      const data = await res.json().catch(() => null);

      if (!res.ok) {
        setLeaveChallengeError(data?.error || "Failed to leave challenge.");
        setShowLeaveChallengeModal(false);
        return;
      }

      setChallenges((prev) =>
        prev.filter((challenge) => challenge.id !== activeChallengeId),
      );
      setLocalMemberships((prev) =>
        prev.filter(
          (membership) => membership.challengeId !== activeChallengeId,
        ),
      );
      setTeams([]);
      setTeamRequests([]);
      setLeaderboard([]);
      setTab((prev) => (prev === "teams" ? "home" : prev));
      setLeaderboardView("individual");
      setActiveChallengeId(GLOBAL_CHALLENGE_ID);
      localStorage.setItem("activeChallengeId", GLOBAL_CHALLENGE_ID);
      setShowLeaveChallengeModal(false);
      await fetchMyActivity();
      await fetchGlobalFeed();
    } finally {
      setLeaveChallengeLoading(false);
    }
  }

  async function loadTeams(cId = activeChallengeId) {
    if (!cId) {
      setTeams([]);
      return;
    }
    const res = await fetch(`/api/team/list?challengeId=${cId}`);
    const data = await res.json();
    setTeams(Array.isArray(data) ? data : []);
  }

  async function loadTeamRequests(cId = activeChallengeId) {
    if (!cId || cId === GLOBAL_CHALLENGE_ID) {
      setTeamRequests([]);
      return;
    }
    const res = await fetch(`/api/team/request?challengeId=${cId}`);
    const data = await res.json();
    setTeamRequests(Array.isArray(data) ? data : []);
  }

  async function loadLeaderboard(cId = activeChallengeId) {
    const params = new URLSearchParams();
    if (cId && cId !== GLOBAL_CHALLENGE_ID && !cId.startsWith("CATEGORY_")) {
      params.set("challengeId", cId);
    }
    if (activeCategory !== "ALL") {
      params.set("category", activeCategory);
    }
    const query = params.toString();
    const url = `/api/leaderboard${query ? `?${query}` : ""}`;
    const res = await fetch(url);
    const data = await res.json();
    setLeaderboard(Array.isArray(data) ? data : []);
  }

  async function fetchActions(cId = activeChallengeId) {
    const params = new URLSearchParams();
    if (cId && cId !== GLOBAL_CHALLENGE_ID && !cId.startsWith("CATEGORY_")) {
      params.set("challengeId", cId);
    }
    if (activeCategory !== "ALL") {
      params.set("category", activeCategory);
    }
    const query = params.toString();
    const res = await fetch(`/api/actions${query ? `?${query}` : ""}`);
    const data = await res.json();
    if (Array.isArray(data)) setActions(data);
  }

  const fetchMyActivity = useCallback(
    async (category = activeCategory) => {
      const params = new URLSearchParams();
      if (
        activeChallengeId !== GLOBAL_CHALLENGE_ID &&
        !activeChallengeId.startsWith("CATEGORY_")
      ) {
        params.set("challengeId", activeChallengeId);
      }
      if (category !== "ALL") {
        params.set("category", category);
      }
      const query = params.toString();
      const res = await fetch(`/api/actions${query ? `?${query}` : ""}`);
      const data = await res.json();
      if (Array.isArray(data)) setMyActivity(data);
    },
    [activeCategory, activeChallengeId],
  );

  const fetchGlobalFeed = useCallback(
    async (category = activeCategory) => {
      const params = new URLSearchParams();
      params.set("filter", "global");
      params.set("all", "true");
      if (
        activeChallengeId !== GLOBAL_CHALLENGE_ID &&
        !activeChallengeId.startsWith("CATEGORY_")
      ) {
        params.set("challengeId", activeChallengeId);
      }
      if (category !== "ALL") {
        params.set("category", category);
      }
      const res = await fetch(`/api/actions?${params.toString()}`);
      const data = await res.json();
      if (Array.isArray(data)) setGlobalFeed(data);
    },
    [activeCategory, activeChallengeId],
  );

  async function fetchIndividualLeaderboard(cId = activeChallengeId) {
    const params = new URLSearchParams();
    params.set("type", "champs");
    if (cId && cId !== GLOBAL_CHALLENGE_ID && !cId.startsWith("CATEGORY_")) {
      params.set("challengeId", cId);
    }
    if (activeCategory !== "ALL") {
      params.set("category", activeCategory);
    }
    const res = await fetch(`/api/leaderboard?${params.toString()}`);
    const data = await res.json();
    if (Array.isArray(data)) setIndividualLeaderboard(data);
  }

  async function fetchStats(range: ChartRange, cId = activeChallengeId) {
    const params = new URLSearchParams();
    params.set("range", range);
    if (cId && cId !== GLOBAL_CHALLENGE_ID && !cId.startsWith("CATEGORY_")) {
      params.set("challengeId", cId);
    }
    if (activeCategory !== "ALL") {
      params.set("category", activeCategory);
    }
    const res = await fetch(`/api/stats?${params.toString()}`);
    const data = await res.json();
    if (Array.isArray(data)) setStatsData(data);
  }

  async function fetchUserMeta(cId = activeChallengeId) {
    const params = new URLSearchParams();
    if (cId && cId !== GLOBAL_CHALLENGE_ID && !cId.startsWith("CATEGORY_")) {
      params.set("challengeId", cId);
    }
    if (activeCategory !== "ALL") {
      params.set("category", activeCategory);
    }
    const query = params.toString();
    const res = await fetch(`/api/me${query ? `?${query}` : ""}`);
    const data = await res.json();
    if (typeof data.streak === "number") setStreak(data.streak);
    if (typeof data.globalPoints === "number")
      setGlobalPoints(data.globalPoints);
    if (typeof data.globalActionCount === "number")
      setGlobalActionCount(data.globalActionCount);
  }

  async function handleJoinTeam(id: string) {
    setLoading(true);
    setTeamError("");
    setLeaveTeamError("");
    try {
      const res = await fetch("/api/team/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ teamId: id }),
      });
      const data = await res.json();
      if (!res.ok) {
        setTeamError(data.error || "Failed to join team.");
        return;
      }
      // Update local memberships so currentTeamId derives correctly
      setLocalMemberships((prev) => [
        ...prev,
        { teamId: id, challengeId: activeChallengeId },
      ]);
      await loadTeams();
      await loadLeaderboard();
      await loadTeamRequests();
    } finally {
      setLoading(false);
    }
  }

  async function handleLeaveTeam() {
    if (!currentTeamId) {
      return;
    }

    setLeaveTeamLoading(true);
    setLeaveTeamError("");
    try {
      const res = await fetch("/api/team/leave", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ teamId: currentTeamId }),
      });
      const data = await res.json().catch(() => null);

      if (!res.ok) {
        setLeaveTeamError(data?.error || "Failed to leave team.");
        setShowLeaveTeamModal(false);
        return;
      }

      setLocalMemberships((prev) =>
        prev.filter((membership) => membership.teamId !== currentTeamId),
      );
      setShowLeaveTeamModal(false);
      await loadTeams();
      await loadLeaderboard();
      await fetchIndividualLeaderboard();
      await fetchUserMeta();
    } finally {
      setLeaveTeamLoading(false);
    }
  }

  async function handleRequestTeam(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setRequestError("");
    setRequestSuccess("");

    if (!requestName.trim()) {
      setRequestError("Please enter a team name.");
      return;
    }

    setRequestLoading(true);
    try {
      const res = await fetch("/api/team/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: requestName,
          message: requestMessage,
          challengeId: activeChallengeId,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setRequestError(data.error || "Failed to submit team request.");
        return;
      }

      setRequestName("");
      setRequestMessage("");
      setRequestSuccess("Team request submitted for review.");
      await loadTeamRequests();
    } finally {
      setRequestLoading(false);
    }
  }

  useEffect(() => {
    loadUserChallenges();
  }, []);

  useEffect(() => {
    // Load data scoped to the active challenge
    const cId = activeChallengeId;
    const categoryView = cId.startsWith("CATEGORY_");
    const effectiveChallengeId = categoryView ? undefined : cId;
    const global = cId === GLOBAL_CHALLENGE_ID;

    if (!global && !categoryView && effectiveChallengeId) {
      loadTeams(effectiveChallengeId);
      loadTeamRequests(effectiveChallengeId);
    }
    loadLeaderboard(effectiveChallengeId);
    fetchIndividualLeaderboard(effectiveChallengeId);
    fetchActions(effectiveChallengeId);
    fetchMyActivity();
    fetchGlobalFeed();
    fetchStats("week", effectiveChallengeId);
    fetchUserMeta(effectiveChallengeId);
    // Reset leaderboard view when switching to global view
    if (global) setLeaderboardView("individual");

    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        fetchActions(effectiveChallengeId);
        fetchMyActivity();
        fetchGlobalFeed();
        loadLeaderboard(effectiveChallengeId);
        if (!global && !categoryView && effectiveChallengeId) {
          loadTeamRequests(effectiveChallengeId);
        }
        fetchIndividualLeaderboard(effectiveChallengeId);
        fetchUserMeta(effectiveChallengeId);
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibility);
  }, [activeChallengeId]); // eslint-disable-line react-hooks/exhaustive-deps

  // Challenge-scoped stats (for stat cards)
  const scopedUserActions = isCategoryView ? myActivity : actions;
  const challengePoints = scopedUserActions.reduce(
    (sum, a) => sum + (a.points ?? 0),
    0,
  );
  const animatedChallengePoints = useCountUp(challengePoints);
  const activeChallengeName =
    challenges.find((c) => c.id === activeChallengeId)?.name ??
    "this challenge";

  const levelPoints = isGlobalView ? globalPoints : challengePoints;
  const levelScopeLabel = isGlobalView ? "Lifetime Level" : "Challenge Level";
  const levelPointLabel = isGlobalView
    ? "total pts"
    : `pts in ${activeChallengeName}`;

  // Level follows the selected scope; badges still use lifetime stats.
  const levelInfo = getLevelInfo(levelPoints);
  const animatedLevelCurrent = useCountUp(levelInfo.current);
  const progressPercent = Math.min(
    100,
    levelInfo.isMaxLevel
      ? 100
      : levelInfo.goal && levelInfo.goal > 0
        ? (levelInfo.current / levelInfo.goal) * 100
        : 0,
  );

  // Actual team rank within this challenge
  const myTeamRank = currentTeamId
    ? (leaderboard.find((t) => t.id === currentTeamId)?.rank ?? 0)
    : 0;
  const pendingTeamRequest = teamRequests.find(
    (request) => request.status === "PENDING",
  );

  // Individual rank (used in global view)
  const myIndividualRank = individualLeaderboard.find((p) =>
    p.name.toLowerCase().startsWith(firstName.toLowerCase()),
  );
  const displayRank = isGlobalView
    ? myIndividualRank
      ? `#${myIndividualRank.rank}`
      : "-"
    : myTeamRank > 0
      ? `#${myTeamRank}`
      : "-";
  const currentTeamName =
    teams.find((team) => team.id === currentTeamId)?.name ?? "your team";
  const allActivityLabel = `All Activity - ${globalChallengeName}`;
  return (
    <div className="min-h-screen bg-[#f5f5f3] flex flex-col font-sans">
      {/* ── TOP NAVIGATION (DESKTOP) ── */}
      <header className="hidden lg:flex items-center justify-between sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-[#ececea] px-8 py-3">
        <Link
          href="/dashboard"
          className="flex items-center gap-3 rounded-2xl transition-opacity hover:opacity-80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#0b5d1e]"
        >
          <Image
            src="/icons/logo.png"
            alt="GreenStep"
            width={52}
            height={52}
            className="rounded-[14px]"
          />
          <h1 className="text-[17px] font-bold text-[#111827]">GreenStep</h1>
        </Link>

        <nav className="flex items-center gap-2 bg-[#f8f8f7] p-1 rounded-full border border-[#ececea]">
          {(
            [
              { key: "home", label: "Dashboard", icon: Home },
              { key: "leaderboard", label: "Leaderboard", icon: Trophy },
              { key: "activity", label: "Activity", icon: Activity },
              ...(!isGlobalView
                ? [{ key: "teams" as const, label: "Teams", icon: Users }]
                : []),
            ] as const
          ).map((item) => (
            <button
              key={item.key}
              onClick={() => setTab(item.key)}
              className={`flex items-center gap-2 px-5 py-2 rounded-full text-[13px] font-medium transition-all ${
                tab === item.key
                  ? "bg-white text-[#0b5d1e] shadow-sm font-bold"
                  : "text-[#6b7280] hover:text-[#111827]"
              }`}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-2 lg:gap-4 shrink-0">
          <select
            value={activeChallengeId}
            onChange={handleChallengeChange}
            className="text-[13px] bg-white border border-[#ececea] rounded-full py-1.5 px-3 outline-none text-[#111827] cursor-pointer hover:border-[#0b5d1e] transition-colors max-w-[200px] truncate"
          >
            <option value={GLOBAL_CHALLENGE_ID}>{allActivityLabel}</option>
            {challenges.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
            <option value="CATEGORY_TRANSPORT">
              Transportation Challenge
            </option>
            <option value="CATEGORY_WATER">Water Challenge</option>
            <option value="CATEGORY_ENERGY">Energy Challenge</option>
            <option value="CATEGORY_RECYCLING">Recycling Challenge</option>
            <option value="CATEGORY_FOOD">Food Challenge</option>
          </select>
          {!isGlobalView && (
            <button
              onClick={() => setShowLeaveChallengeModal(true)}
              disabled={leaveChallengeLoading}
              className="text-[13px] text-red-600 font-bold px-2 hover:text-red-700 disabled:opacity-50 shrink-0 whitespace-nowrap"
            >
              {leaveChallengeLoading ? "Leaving..." : "Leave Challenge"}
            </button>
          )}
          <button
            onClick={() => setShowChallengeModal(true)}
            className="text-[13px] text-[#0b5d1e] font-bold px-2 hover:opacity-80 shrink-0 whitespace-nowrap"
          >
            + Join Challenge
          </button>
          {isAdmin && (
            <Link
              href="/admin"
              className="flex items-center gap-1.5 text-[13px] font-semibold text-[#0b5d1e] hover:text-[#083d14] transition-colors px-2 shrink-0"
            >
              Admin
            </Link>
          )}
          <div className="hidden lg:block h-8 w-[1px] bg-[#ececea] mx-1"></div>
          <UserButton
            appearance={{ elements: { avatarBox: "h-9 w-9" } }}
          />
        </div>
      </header>

      {/* ── MOBILE HEADER ── */}
      <header className="lg:hidden flex flex-col gap-3 px-5 pt-6 pb-4 bg-white rounded-b-[24px] shadow-sm mb-4 relative z-10">
        <div className="flex items-center justify-between gap-3">
          <Link
            href="/dashboard"
            className="flex min-w-0 items-center gap-3 rounded-2xl transition-opacity hover:opacity-80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#0b5d1e]"
          >
            <Image
              src="/icons/logo.png"
              alt="GreenStep"
              width={52}
              height={52}
              className="rounded-[14px] shrink-0"
            />
            <div className="min-w-0">
              <p className="text-[15px] font-bold text-[#111827] leading-tight truncate">
                GreenStep
              </p>
              <p className="text-[11px] text-[#6b7280] truncate">
                Welcome, {firstName}
              </p>
            </div>
          </Link>
          <UserButton
            appearance={{ elements: { avatarBox: "h-9 w-9" } }}
          />
        </div>

        <div className="grid grid-cols-[1fr_auto] items-center gap-2">
          <select
            value={activeChallengeId}
            onChange={handleChallengeChange}
            className="min-h-11 w-full rounded-[14px] border border-[#ececea] bg-gray-100 px-3 text-[12px] font-semibold text-[#111827] outline-none"
          >
            <option value={GLOBAL_CHALLENGE_ID}>{allActivityLabel}</option>
            {challenges.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
            <option value="CATEGORY_TRANSPORT">
              Transportation Challenge
            </option>
            <option value="CATEGORY_WATER">Water Challenge</option>
            <option value="CATEGORY_ENERGY">Energy Challenge</option>
            <option value="CATEGORY_RECYCLING">Recycling Challenge</option>
            <option value="CATEGORY_FOOD">Food Challenge</option>
          </select>
          {!isGlobalView && (
            <button
              onClick={() => setShowLeaveChallengeModal(true)}
              disabled={leaveChallengeLoading}
              className="min-h-11 rounded-[14px] px-3 text-[12px] text-red-600 font-bold hover:text-red-700 disabled:opacity-50 shrink-0 whitespace-nowrap"
            >
              {leaveChallengeLoading ? "Leaving..." : "Leave"}
            </button>
          )}
        </div>

        <button
          onClick={() => setShowChallengeModal(true)}
          className="min-h-11 w-full rounded-[14px] bg-[#e8f3eb] px-3 text-[13px] text-[#0b5d1e] font-bold hover:opacity-80"
        >
          + Join Challenge
        </button>

        <div className="flex">
          <div className="flex w-full gap-2">
            {isAdmin && (
              <Link
                href="/admin"
                className="inline-flex min-h-11 items-center justify-center rounded-[14px] border border-[#0b5d1e] px-4 text-[13px] font-bold text-[#0b5d1e]"
              >
                Admin
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Join Challenge Modal (Works Desktop & Mobile) */}
      {showChallengeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
          <div className="bg-white rounded-[32px] p-8 w-full max-w-[360px] shadow-2xl relative">
            <button
              onClick={() => setShowChallengeModal(false)}
              className="absolute top-4 right-5 text-gray-400 hover:text-gray-900 font-bold text-xl"
            >
              ✕
            </button>
            <h3 className="text-[22px] font-bold text-[#111827] mb-2">
              Join Challenge
            </h3>
            <p className="text-[14px] text-gray-500 mb-6">
              Enter the code provided by your organization.
            </p>

            <form
              onSubmit={handleJoinChallenge}
              className="flex flex-col gap-4"
            >
              <input
                type="text"
                value={challengeCode}
                onChange={(e) => setChallengeCode(e.target.value.toUpperCase())}
                placeholder="e.g. A1B2C3"
                className="w-full border border-[#ececea] bg-[#f8f8f7] rounded-[16px] px-5 py-4 outline-none font-bold text-center tracking-widest uppercase focus:border-[#0b5d1e] focus:bg-white transition-colors"
                maxLength={6}
              />
              {challengeError && (
                <p className="text-[13px] text-red-500 text-center font-medium">
                  {challengeError}
                </p>
              )}

              <button
                type="submit"
                disabled={loading || !challengeCode.trim()}
                className="w-full bg-[#0b5d1e] text-white font-bold rounded-[16px] py-4 disabled:opacity-50 hover:bg-[#0a4f1a] transition-colors"
              >
                Join Now
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Leave Challenge Modal */}
      {showLeaveChallengeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
          <div className="relative w-full max-w-[390px] overflow-hidden rounded-[32px] bg-white p-7 shadow-2xl">
            <div className="absolute -right-12 -top-12 h-36 w-36 rounded-full bg-red-100" />
            <div className="absolute -left-10 bottom-0 h-28 w-28 rounded-full bg-[#dcfce7]" />
            <div className="relative">
              <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-red-600">
                <Users className="h-7 w-7" />
              </div>
              <h3 className="text-[22px] font-bold text-[#111827]">
                Leave Challenge?
              </h3>
              <p className="mt-2 text-[15px] leading-6 text-[#6b7280]">
                You&apos;re about to leave{" "}
                <span className="font-bold text-[#111827]">
                  {activeChallengeName}
                </span>
                . Your past actions will stay saved, but this challenge will no
                longer appear on your dashboard.
              </p>

              <div className="mt-6 rounded-[20px] border border-[#fee2e2] bg-red-50 px-4 py-3">
                <p className="text-[13px] font-medium text-red-700">
                  Any team membership for this challenge will also be removed.
                </p>
              </div>

              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={() => setShowLeaveChallengeModal(false)}
                  disabled={leaveChallengeLoading}
                  className="min-h-12 flex-1 rounded-full border border-[#e5e7eb] bg-white px-5 text-[14px] font-bold text-[#374151] transition hover:bg-[#f8f8f7] disabled:opacity-50"
                >
                  Keep Challenge
                </button>
                <button
                  type="button"
                  onClick={handleLeaveChallenge}
                  disabled={leaveChallengeLoading}
                  className="min-h-12 flex-1 rounded-full bg-red-600 px-5 text-[14px] font-bold text-white shadow-sm transition hover:bg-red-700 disabled:opacity-60"
                >
                  {leaveChallengeLoading ? "Leaving..." : "Leave Challenge"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Leave Team Modal */}
      {showLeaveTeamModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
          <div className="relative w-full max-w-[390px] overflow-hidden rounded-[32px] bg-white p-7 shadow-2xl">
            <div className="absolute -right-12 -top-12 h-36 w-36 rounded-full bg-amber-100" />
            <div className="absolute -left-10 bottom-0 h-28 w-28 rounded-full bg-[#dcfce7]" />
            <div className="relative">
              <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-amber-50 text-amber-700">
                <Users className="h-7 w-7" />
              </div>
              <h3 className="text-[22px] font-bold text-[#111827]">
                Leave Team?
              </h3>
              <p className="mt-2 text-[15px] leading-6 text-[#6b7280]">
                You&apos;re about to leave{" "}
                <span className="font-bold text-[#111827]">
                  {currentTeamName}
                </span>
                . You&apos;ll stay in{" "}
                <span className="font-bold text-[#111827]">
                  {activeChallengeName}
                </span>{" "}
                and can join another team afterward.
              </p>

              <div className="mt-6 rounded-[20px] border border-[#fef3c7] bg-amber-50 px-4 py-3">
                <p className="text-[13px] font-medium text-amber-800">
                  Your past actions and challenge membership will stay saved.
                </p>
              </div>

              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={() => setShowLeaveTeamModal(false)}
                  disabled={leaveTeamLoading}
                  className="min-h-12 flex-1 rounded-full border border-[#e5e7eb] bg-white px-5 text-[14px] font-bold text-[#374151] transition hover:bg-[#f8f8f7] disabled:opacity-50"
                >
                  Keep Team
                </button>
                <button
                  type="button"
                  onClick={handleLeaveTeam}
                  disabled={leaveTeamLoading}
                  className="min-h-12 flex-1 rounded-full bg-amber-600 px-5 text-[14px] font-bold text-white shadow-sm transition hover:bg-amber-700 disabled:opacity-60"
                >
                  {leaveTeamLoading ? "Leaving..." : "Leave Team"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Activity List Modal */}
      {activityModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm">
          <div className="relative flex max-h-[82vh] w-full max-w-[680px] flex-col overflow-hidden rounded-[32px] border border-white/70 bg-white shadow-2xl">
            <div className="absolute -right-16 -top-16 h-44 w-44 rounded-full bg-[#dcfce7]" />
            <div className="absolute -left-14 bottom-0 h-36 w-36 rounded-full bg-blue-50" />
            <div className="relative flex items-start justify-between gap-4 border-b border-[#ececea] px-6 py-5">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#0b5d1e]">
                  Full history
                </p>
                <h3 className="mt-1 text-[22px] font-extrabold text-[#111827]">
                  {activityModal === "my-activity"
                    ? activeCategory === "ALL"
                      ? "My Activity"
                      : `My ${activeCategory.charAt(0) + activeCategory.slice(1).toLowerCase()} Activity`
                    : activeCategory === "ALL"
                      ? "Community Feed"
                      : `${activeCategory.charAt(0) + activeCategory.slice(1).toLowerCase()} Community Feed`}
                </h3>
                <p className="mt-1 text-[13px] font-medium text-[#6b7280]">
                  {activityModal === "my-activity"
                    ? `${myActivity.length} logged action${myActivity.length === 1 ? "" : "s"}${activeCategory !== "ALL" ? ` in ${activeCategory.charAt(0) + activeCategory.slice(1).toLowerCase()}` : ""}`
                    : `${globalFeed.length} community action${globalFeed.length === 1 ? "" : "s"}${activeCategory !== "ALL" ? ` in ${activeCategory.charAt(0) + activeCategory.slice(1).toLowerCase()}` : ""}`}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActivityModal(null)}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#f8f8f7] text-[#6b7280] transition hover:bg-[#ececea] hover:text-[#111827]"
                aria-label="Close activity list"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="relative overflow-y-auto px-5 py-5">
              {activityModal === "my-activity" ? (
                myActivity.length === 0 ? (
                  <div className="flex h-[220px] flex-col items-center justify-center rounded-[24px] border border-dashed border-[#d1d5db] bg-[#f9fafb] p-6 text-center">
                    <Leaf className="mb-2 h-8 w-8 text-[#9ca3af]" />
                    <p className="text-[14px] font-medium text-[#6b7280]">
                      No activity yet. Log your first action!
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {myActivity.map((a) => (
                      <div
                        key={a.id}
                        className="flex items-center justify-between gap-4 rounded-[22px] border border-[#ececea] bg-[#f8f8f7] px-4 py-3 transition-colors hover:border-[#0b5d1e]"
                      >
                        <div className="min-w-0">
                          <p className="truncate text-[14px] font-bold text-[#111827]">
                            {a.actionType}
                          </p>
                          <div className="mt-1 flex flex-wrap items-center gap-2">
                            <p className="text-[11px] font-medium text-[#9ca3af]">
                              {timeAgo(a.createdAt)}
                            </p>
                            <span
                              className={`rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide ${getChallengePillClasses(a.challengeId)}`}
                            >
                              {getChallengeLabel(
                                a.challengeId,
                                a.challengeName,
                              )}
                            </span>
                          </div>
                        </div>
                        <span className="shrink-0 rounded-full bg-[#dcfce7] px-3 py-1 text-[13px] font-bold text-[#166534]">
                          +{a.points}
                        </span>
                      </div>
                    ))}
                  </div>
                )
              ) : globalFeed.length === 0 ? (
                <div className="flex h-[220px] flex-col items-center justify-center rounded-[24px] border border-dashed border-[#d1d5db] bg-[#f9fafb] p-6 text-center">
                  <Users className="mb-2 h-8 w-8 text-[#9ca3af]" />
                  <p className="text-[14px] font-medium text-[#6b7280]">
                    No one has logged actions yet.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {globalFeed.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between gap-4 rounded-[22px] border border-[#ececea] bg-[#f8f8f7] px-4 py-3"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 text-[14px] font-bold text-blue-700 shadow-sm">
                          {item.userName.charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-[14px] font-bold text-[#111827]">
                            {item.actionType}
                          </p>
                          <div className="mt-1 flex flex-wrap items-center gap-2">
                            <p className="text-[11px] font-medium text-[#9ca3af]">
                              {item.userName} · {timeAgo(item.createdAt)}
                            </p>
                            <span
                              className={`rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide ${getChallengePillClasses(item.challengeId)}`}
                            >
                              {getChallengeLabel(
                                item.challengeId,
                                item.challengeName,
                              )}
                            </span>
                          </div>
                        </div>
                      </div>
                      <span className="shrink-0 text-[13px] font-bold text-[#1d4ed8]">
                        +{item.points}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── MAIN CONTENT AREA ── */}
      <main className="flex-1 w-full max-w-[1240px] mx-auto px-4 lg:px-6 py-2 pb-24 lg:pb-12">
        {leaveChallengeError && (
          <div className="mx-auto mb-4 w-full max-w-[800px] rounded-[18px] border border-red-100 bg-red-50 px-4 py-3 text-center text-[13px] font-medium text-red-700">
            {leaveChallengeError}
          </div>
        )}
        {tab === "home" && (
          <div className="flex flex-col lg:grid lg:grid-cols-12 gap-4">
            {/* HERO TRACKER (Spans 8 columns on Desktop) */}
            <div className="lg:col-span-8 flex flex-col gap-4">
              <div className="relative overflow-hidden rounded-[32px] bg-[#0b5d1e] p-5 lg:p-6 text-white shadow-md">
                <div className="absolute right-0 top-0 opacity-10 pointer-events-none">
                  <Leaf className="h-64 w-64 -mr-16 -mt-16" />
                </div>
                <div className="relative z-10 flex items-center justify-between">
                  <div>
                    <p className="text-[12px] lg:text-[14px] font-bold uppercase tracking-wider text-green-200 mb-1">
                      {levelScopeLabel} {levelInfo.level}
                    </p>
                    <h2 className="text-[24px] lg:text-[32px] font-bold">
                      {levelInfo.title}
                    </h2>
                  </div>
                  <div className="flex h-14 w-14 lg:h-16 lg:w-16 items-center justify-center rounded-full bg-white/20 backdrop-blur-md text-[20px] lg:text-[24px] font-bold">
                    {levelInfo.level}
                  </div>
                </div>

                <div className="relative z-10 mt-6">
                  <div className="h-3 w-full overflow-hidden rounded-full bg-black/20 backdrop-blur-sm">
                    <div
                      className="h-full rounded-full bg-white transition-all duration-1000 ease-out"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                  <p className="mt-3 text-[13px] font-medium text-green-100">
                    {levelInfo.isMaxLevel
                      ? `${animatedLevelCurrent.toLocaleString()} ${levelPointLabel} — highest level reached`
                      : `${animatedLevelCurrent.toLocaleString()} / ${levelInfo.goal?.toLocaleString()} ${levelPointLabel} toward Level ${levelInfo.level + 1}`}
                  </p>
                </div>
              </div>

              {/* QUICK STATS CARDS */}
              <div className="grid grid-cols-3 gap-3 lg:gap-4">
                <div className="flex flex-col items-center justify-center rounded-[24px] bg-white border border-[#ececea] p-4 lg:p-5 shadow-sm">
                  <p className="text-[24px] lg:text-[32px] font-black text-[#111827]">
                    {animatedChallengePoints}
                  </p>
                  <p className="text-[11px] lg:text-[13px] font-semibold text-[#6b7280]">
                    Points
                  </p>
                </div>
                <div className="flex flex-col items-center justify-center rounded-[24px] bg-white border border-[#ececea] p-4 lg:p-5 shadow-sm">
                  <p className="text-[24px] lg:text-[32px] font-black text-[#111827]">
                    {scopedUserActions.length}
                  </p>
                  <p className="text-[11px] lg:text-[13px] font-semibold text-[#6b7280]">
                    Actions
                  </p>
                </div>
                <div className="flex flex-col items-center justify-center rounded-[24px] bg-white border border-[#ececea] p-4 lg:p-5 shadow-sm">
                  <p className="text-[24px] lg:text-[32px] font-black text-[#111827]">
                    {displayRank}
                  </p>
                  <p className="text-[11px] lg:text-[13px] font-semibold text-[#6b7280]">
                    {isGlobalView ? "Rank" : "Team Rank"}
                  </p>
                </div>
              </div>

              {/* BADGES — only show earned */}
              <div className="mt-0">
                {(() => {
                  const badgeCtx: BadgeCtx = {
                    actionCount:
                      activeCategory === "ALL"
                        ? globalActionCount
                        : myActivity.length,
                    pts:
                      activeCategory === "ALL"
                        ? globalPoints
                        : myActivity.reduce((sum, a) => sum + a.points, 0),
                    streak,
                    hasTeam: !!currentTeamId,
                    transportCount:
                      activeCategory === "ALL" || activeCategory === "TRANSPORT"
                        ? myActivity.filter((a) => a.category === "TRANSPORT")
                            .length
                        : 0,
                    energyCount:
                      activeCategory === "ALL" || activeCategory === "ENERGY"
                        ? myActivity.filter((a) => a.category === "ENERGY")
                            .length
                        : 0,
                    recyclingCount:
                      activeCategory === "ALL" || activeCategory === "RECYCLING"
                        ? myActivity.filter((a) => a.category === "RECYCLING")
                            .length
                        : 0,
                    foodCount:
                      activeCategory === "ALL" || activeCategory === "FOOD"
                        ? myActivity.filter((a) => a.category === "FOOD").length
                        : 0,
                    waterCount:
                      activeCategory === "ALL" || activeCategory === "WATER"
                        ? myActivity.filter((a) => a.category === "WATER")
                            .length
                        : 0,
                    inTop10: individualLeaderboard
                      .slice(0, 10)
                      .some((p) =>
                        p.name
                          .toLowerCase()
                          .startsWith(firstName.toLowerCase()),
                      ),
                  };
                  // Filter badges based on category
                  const commonCategoryBadgeIds = [
                    "first_steps",
                    "action_hero",
                    "go_getter",
                    "overachiever",
                    "century_club",
                    "quarter_grand",
                    "eco_champion",
                    "legend",
                    "rising_star",
                    "on_fire",
                    "week_warrior",
                    "fortnight",
                    "team_player",
                  ] as const;

                  const categorySpecificBadgeIds: Record<
                    Exclude<CategoryType, "ALL">,
                    string[]
                  > = {
                    TRANSPORT: ["transport_hero"],
                    WATER: ["water_guardian"],
                    ENERGY: ["energy_saver"],
                    RECYCLING: ["zero_waste"],
                    FOOD: ["plant_based_pro"],
                  };

                  const allowedBadgeIds =
                    activeCategory === "ALL"
                      ? null
                      : new Set<string>([
                          ...commonCategoryBadgeIds,
                          ...categorySpecificBadgeIds[activeCategory],
                        ]);

                  const categoryBadges =
                    activeCategory === "ALL"
                      ? BADGES
                      : BADGES.filter((b) => allowedBadgeIds?.has(b.id));

                  const earned = categoryBadges.filter((b) =>
                    b.earned(badgeCtx),
                  );
                  const unearned = categoryBadges.filter(
                    (b) => !b.earned(badgeCtx),
                  );
                  return (
                    <>
                      <div className="mb-3 xl:px-2">
                        <h3 className="text-[18px] font-bold text-[#111827]">
                          My Badges
                        </h3>
                      </div>
                      {categoryBadges.length === 0 ? (
                        <div className="flex flex-col items-center justify-center rounded-[24px] bg-gray-50 border border-dashed border-gray-200 py-8 px-4 text-center">
                          <Leaf className="h-8 w-8 text-gray-300 mb-2" />
                          <p className="text-[13px] font-medium text-[#9ca3af]">
                            No badges available for this challenge
                          </p>
                        </div>
                      ) : (
                        <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2 pt-1 xl:px-2">
                          {[...earned, ...unearned].map((b) => {
                            const isEarned = earned.includes(b);
                            return (
                              <div
                                key={b.id}
                                title={b.desc}
                                className={`group flex min-w-[100px] flex-col items-center justify-center rounded-[24px] border p-4 text-center transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg ${
                                  isEarned
                                    ? "bg-white shadow-sm border-[#ececea] hover:border-[#0b5d1e]/30"
                                    : "bg-gray-50 border-gray-200 opacity-60"
                                }`}
                              >
                                <div
                                  className={`badge-icon mb-2 drop-shadow-md ${
                                    isEarned ? getBadgeAnimationClass(b.id) : ""
                                  } ${isEarned ? "" : "grayscale"}`}
                                >
                                  {b.icon}
                                </div>
                                <span
                                  className={`text-[12px] font-bold leading-tight ${
                                    isEarned
                                      ? "text-[#111827]"
                                      : "text-gray-500"
                                  }`}
                                >
                                  {b.label}
                                </span>
                                <span
                                  className={`text-[10px] mt-0.5 leading-tight ${
                                    isEarned
                                      ? "text-[#9ca3af]"
                                      : "text-gray-400"
                                  }`}
                                >
                                  {b.desc}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </>
                  );
                })()}
              </div>
            </div>

            {/* RIGHT SIDE (Spans 4 columns on Desktop) */}
            <div className="lg:col-span-4 flex flex-col gap-4 mt-6 lg:mt-0">
              {/* DESKTOP LOG ACTION BUTTON (Hidden on Mobile) */}
              <Link
                href="/log-action"
                className="hidden lg:flex items-center justify-center gap-2 rounded-[24px] bg-[#0b5d1e] py-4 px-6 shadow-md text-white hover:bg-[#0a4f1a] transition-all transform hover:scale-[1.02]"
              >
                <Plus className="h-6 w-6 font-bold" />
                <span className="text-[18px] font-bold tracking-wide">
                  Log New Action
                </span>
              </Link>

              {/* MY RECENT ACTIVITY */}
              <div className="flex flex-1 flex-col rounded-[32px] bg-white border border-[#ececea] p-5 shadow-sm">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <h3 className="text-[18px] font-bold text-[#111827]">
                    My Activity
                  </h3>
                  {myActivity.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setActivityModal("my-activity")}
                      className="rounded-full bg-[#e8f3eb] px-3 py-1.5 text-[12px] font-bold text-[#0b5d1e] transition hover:bg-[#dcfce7]"
                    >
                      See all
                    </button>
                  )}
                </div>
                {myActivity.length === 0 ? (
                  <div className="flex h-[180px] flex-col items-center justify-center rounded-[24px] border border-dashed border-[#d1d5db] bg-[#f9fafb] p-6 text-center">
                    <Leaf className="mb-2 h-8 w-8 text-[#9ca3af]" />
                    <p className="text-[14px] font-medium text-[#6b7280]">
                      No activity yet. Log your first action!
                    </p>
                  </div>
                ) : (
                  <div className="flex-1 space-y-2 overflow-y-auto pr-1">
                    {myActivity.slice(0, 5).map((a) => (
                      <div
                        key={a.id}
                        className="flex items-center justify-between rounded-[18px] bg-[#f8f8f7] px-4 py-2.5 border border-[#ececea] hover:border-[#0b5d1e] transition-colors"
                      >
                        <div>
                          <p className="text-[14px] font-bold text-[#111827]">
                            {a.actionType}
                          </p>
                          <div className="mt-1 flex flex-wrap items-center gap-2">
                            <p className="text-[11px] font-medium text-[#9ca3af]">
                              {timeAgo(a.createdAt)}
                            </p>
                            <span
                              className={`rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide ${getChallengePillClasses(a.challengeId)}`}
                            >
                              {getChallengeLabel(
                                a.challengeId,
                                a.challengeName,
                              )}
                            </span>
                          </div>
                        </div>
                        <span className="rounded-full bg-[#dcfce7] px-3 py-1 text-[13px] font-bold text-[#166534]">
                          +{a.points}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* COMMUNITY FEED */}
            <div className="lg:col-span-12 rounded-[32px] bg-white border border-[#ececea] p-5 shadow-sm">
              <div className="mb-4 flex items-center justify-between gap-3">
                <h3 className="text-[18px] font-bold text-[#111827]">
                  Community Feed
                </h3>
                {globalFeed.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setActivityModal("community-feed")}
                    className="rounded-full bg-blue-50 px-3 py-1.5 text-[12px] font-bold text-blue-700 transition hover:bg-blue-100"
                  >
                    See all
                  </button>
                )}
              </div>
              {globalFeed.length === 0 ? (
                <p className="text-[13px] text-[#9ca3af] font-medium">
                  No one has logged actions yet.
                </p>
              ) : (
                <div className="grid gap-2.5 md:grid-cols-2 xl:grid-cols-3">
                  {globalFeed.slice(0, 6).map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between gap-3 rounded-[18px] bg-[#f8f8f7] px-4 py-2.5"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-100 text-[14px] font-bold text-blue-700 shadow-sm">
                          {item.userName.charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-[13px] font-bold text-[#111827] leading-tight">
                            {item.actionType}
                          </p>
                          <div className="mt-0.5 flex flex-wrap items-center gap-2">
                            <p className="text-[11px] font-medium text-[#9ca3af]">
                              {item.userName} · {timeAgo(item.createdAt)}
                            </p>
                            <span
                              className={`rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide ${getChallengePillClasses(item.challengeId)}`}
                            >
                              {getChallengeLabel(
                                item.challengeId,
                                item.challengeName,
                              )}
                            </span>
                          </div>
                        </div>
                      </div>
                      <span className="shrink-0 text-[13px] font-bold text-[#1d4ed8]">
                        +{item.points}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {tab === "leaderboard" && (
          <div className="w-full max-w-[800px] mx-auto pt-4 space-y-4">
            {/* Toggle — only show when inside a specific challenge (global has no teams) */}
            {!isGlobalView && (
              <div className="flex items-center bg-[#f8f8f7] p-1 rounded-full border border-[#ececea] w-fit mx-auto">
                {(["team", "individual"] as LeaderboardView[]).map((v) => (
                  <button
                    key={v}
                    onClick={() => setLeaderboardView(v)}
                    className={`px-6 py-2 rounded-full text-[14px] font-bold transition-all capitalize ${
                      leaderboardView === v
                        ? "bg-white text-[#0b5d1e] shadow-sm"
                        : "text-[#9ca3af] hover:text-[#111827]"
                    }`}
                  >
                    {v === "team" ? "Team" : "Individual"}
                  </button>
                ))}
              </div>
            )}

            {/* ── Team leaderboard (hidden in global view) ── */}
            {!isGlobalView && leaderboardView === "team" && (
              <div className="rounded-[32px] bg-white border border-[#ececea] p-6 shadow-sm">
                <h3 className="text-[20px] font-bold text-[#111827] mb-6">
                  Team Rankings
                </h3>
                {leaderboard.length === 0 ? (
                  <p className="text-[14px] text-[#6b7280]">
                    No teams in this challenge yet.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {groupByRank(leaderboard).map((rankGroup) => {
                      const medals = ["🥇", "🥈", "🥉"];
                      const rank = rankGroup[0].rank;
                      const rankLabel = medals[rank - 1] ?? `#${rank}`;
                      return (
                        <div
                          key={`team-rank-${rank}`}
                          className={`grid gap-3 ${rankGroup.length > 1 ? "md:grid-cols-2" : ""}`}
                        >
                          {rankGroup.map((team) => {
                            const isMyTeam = team.id === currentTeamId;
                            return (
                              <div
                                key={team.id}
                                className={`flex items-center justify-between rounded-[20px] p-4 border transition-all ${
                                  isMyTeam
                                    ? "bg-[#f0fdf4] border-[#0b5d1e] shadow-sm"
                                    : team.rank <= 3
                                      ? "bg-[#fcf8f2] border-orange-200"
                                      : "bg-white border-[#ececea] hover:border-gray-300"
                                }`}
                              >
                                <div className="flex items-center gap-4">
                                  <span className="flex h-8 w-8 shrink-0 items-center justify-center text-[18px] font-black">
                                    {rankLabel}
                                  </span>
                                  <div>
                                    <div className="flex items-center gap-2">
                                      <p className="text-[16px] font-bold text-[#111827]">
                                        {team.name}
                                      </p>
                                      {isMyTeam && (
                                        <span className="rounded-full bg-[#dcfce7] px-2 py-0.5 text-[10px] font-bold text-[#166534]">
                                          You
                                        </span>
                                      )}
                                    </div>
                                    <p className="text-[12px] font-medium text-[#9ca3af]">
                                      {team.memberCount} member
                                      {team.memberCount !== 1 ? "s" : ""}
                                    </p>
                                  </div>
                                </div>
                                <span
                                  className={`shrink-0 text-[18px] font-black ${team.rank <= 3 ? "text-orange-600" : "text-[#0b5d1e]"}`}
                                >
                                  {team.totalPoints.toLocaleString()}
                                  <span className="text-[12px] text-gray-500 font-bold ml-1">
                                    pts
                                  </span>
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* ── Individual leaderboard (always visible in global view) ── */}
            {(isGlobalView || leaderboardView === "individual") && (
              <div className="rounded-[32px] bg-white border border-[#ececea] p-6 shadow-sm">
                <h3 className="text-[20px] font-bold text-[#111827] mb-6">
                  Individual Rankings
                </h3>
                {individualLeaderboard.length === 0 ? (
                  <p className="text-[14px] text-[#6b7280]">
                    No individual data yet.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {groupByRank(individualLeaderboard).map((rankGroup) => {
                      const medals = ["🥇", "🥈", "🥉"];
                      const rank = rankGroup[0].rank;
                      const rankLabel = medals[rank - 1] ?? `#${rank}`;
                      return (
                        <div
                          key={`person-rank-${rank}`}
                          className={`grid gap-3 ${rankGroup.length > 1 ? "md:grid-cols-2" : ""}`}
                        >
                          {rankGroup.map((person) => (
                            <div
                              key={`${person.rank}-${person.name}`}
                              className={`flex items-center justify-between rounded-[20px] p-4 border transition-all ${
                                person.rank <= 3
                                  ? "bg-[#fcf8f2] border-orange-200"
                                  : "bg-white border-[#ececea] hover:border-gray-300"
                              }`}
                            >
                              <div className="flex items-center gap-4">
                                <span className="flex h-8 w-8 shrink-0 items-center justify-center text-[18px] font-black">
                                  {rankLabel}
                                </span>
                                <div className="flex items-center gap-3">
                                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#0b5d1e]/10 text-[14px] font-bold text-[#0b5d1e]">
                                    {person.name.charAt(0).toUpperCase()}
                                  </div>
                                  <div>
                                    <p className="text-[15px] font-bold text-[#111827]">
                                      {person.name}
                                    </p>
                                    {person.teamName && (
                                      <p className="text-[11px] font-medium text-[#9ca3af]">
                                        {person.teamName}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              </div>
                              <span
                                className={`shrink-0 text-[18px] font-black ${person.rank <= 3 ? "text-orange-600" : "text-[#0b5d1e]"}`}
                              >
                                {person.value.toLocaleString()}
                                <span className="text-[12px] text-gray-500 font-bold ml-1">
                                  pts
                                </span>
                              </span>
                            </div>
                          ))}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {tab === "activity" && (
          <div className="w-full max-w-[800px] mx-auto pt-4">
            <div className="rounded-[32px] bg-white border border-[#ececea] p-8 shadow-sm">
              <h2 className="text-[20px] font-bold text-[#111827] mb-6">
                Performance Charts
              </h2>
              <div className="flex items-center gap-2 mb-8 bg-[#f8f8f7] p-1.5 rounded-full w-fit border border-[#ececea]">
                {(["week", "month", "alltime"] as ChartRange[]).map((r) => (
                  <button
                    key={r}
                    onClick={() => {
                      setChartRange(r);
                      fetchStats(r);
                    }}
                    className={`px-5 py-2 rounded-full text-[13px] font-bold transition-all capitalize ${
                      chartRange === r
                        ? "bg-white text-[#111827] shadow-sm"
                        : "hover:text-[#111827] text-[#9ca3af]"
                    }`}
                  >
                    {r.replace("alltime", "All Time")}
                  </button>
                ))}
              </div>

              {statsData.length > 0 ? (
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={statsData}
                      margin={{ top: 5, right: 20, bottom: 5, left: 0 }}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        vertical={false}
                        stroke="#f3f4f6"
                      />
                      <XAxis
                        dataKey="label"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: "#9ca3af", fontSize: 12 }}
                        dy={10}
                      />
                      <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: "#9ca3af", fontSize: 12 }}
                        dx={-10}
                      />
                      <Tooltip
                        contentStyle={{
                          borderRadius: "16px",
                          border: "none",
                          boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                        }}
                      />
                      <Legend
                        iconType="circle"
                        wrapperStyle={{ paddingTop: "20px" }}
                      />
                      <Line
                        type="monotone"
                        dataKey="you"
                        name="You"
                        stroke="#0b5d1e"
                        strokeWidth={3}
                        dot={{ r: 4, strokeWidth: 2 }}
                        activeDot={{ r: 6 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="average"
                        name="Team Avg"
                        stroke="#9ca3af"
                        strokeWidth={3}
                        strokeDasharray="5 5"
                        dot={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="flex h-[200px] items-center justify-center rounded-[24px] bg-[#f9fafb] border border-dashed border-gray-200">
                  <p className="text-[14px] font-medium text-[#9ca3af]">
                    No chart data available for this range.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {tab === "teams" && !isGlobalView && (
          <div className="w-full max-w-[800px] mx-auto pt-4">
            <div className="rounded-[32px] bg-white border border-[#ececea] p-6 shadow-sm">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-[20px] font-bold text-[#111827]">
                  Teams in{" "}
                  {challenges.find((c) => c.id === activeChallengeId)?.name ??
                    "Challenge"}
                </h2>
                {currentTeamId && (
                  <span className="rounded-full bg-[#dcfce7] px-3 py-1 text-[12px] font-bold text-[#166534]">
                    You have a team
                  </span>
                )}
              </div>

              {/* Prompt if no team yet */}
              {!currentTeamId && (
                <div className="mb-6 bg-[#f0fdf4] rounded-[20px] p-4 border border-green-100">
                  <p className="text-[13px] text-[#166534] font-medium">
                    Pick a team below to join this challenge.
                  </p>
                </div>
              )}

              <div className="mb-6 rounded-[24px] border border-[#ececea] bg-[#f8f8f7] p-5">
                <div className="mb-4">
                  <h3 className="text-[16px] font-bold text-[#111827]">
                    Request a new team
                  </h3>
                  <p className="mt-1 text-[13px] text-[#6b7280]">
                    Need a team that does not exist yet? Submit a request for
                    review.
                  </p>
                </div>

                <form onSubmit={handleRequestTeam} className="space-y-3">
                  <input
                    type="text"
                    value={requestName}
                    onChange={(e) => setRequestName(e.target.value)}
                    placeholder="Team name"
                    className="w-full rounded-[16px] border border-[#e5e7eb] bg-white px-4 py-3 text-[14px] text-[#111827] outline-none focus:border-[#0b5d1e]"
                  />
                  <textarea
                    value={requestMessage}
                    onChange={(e) => setRequestMessage(e.target.value)}
                    placeholder="Why should this team be added? (optional)"
                    rows={3}
                    className="w-full resize-none rounded-[16px] border border-[#e5e7eb] bg-white px-4 py-3 text-[14px] text-[#111827] outline-none focus:border-[#0b5d1e]"
                  />
                  <div className="flex flex-wrap items-center gap-3">
                    <button
                      type="submit"
                      disabled={requestLoading || !requestName.trim()}
                      className="rounded-full bg-[#0b5d1e] px-5 py-2.5 text-[13px] font-bold text-white disabled:opacity-60"
                    >
                      {requestLoading ? "Submitting..." : "Submit Request"}
                    </button>
                    {pendingTeamRequest && (
                      <span className="rounded-full bg-yellow-100 px-3 py-1 text-[11px] font-bold text-yellow-800">
                        Pending request: {pendingTeamRequest.name}
                      </span>
                    )}
                  </div>
                </form>
              </div>

              {(teamError || requestError || leaveTeamError) && (
                <p className="mb-4 text-[13px] font-bold text-red-500">
                  {teamError || requestError || leaveTeamError}
                </p>
              )}
              {requestSuccess && (
                <p className="mb-4 text-[13px] font-bold text-[#166534]">
                  {requestSuccess}
                </p>
              )}

              {teams.length === 0 ? (
                <p className="text-[14px] text-[#9ca3af]">
                  No teams set up for this challenge yet. Check back soon.
                </p>
              ) : (
                <div className="grid sm:grid-cols-2 gap-4">
                  {teams.map((team) => {
                    const isJoined = team.id === currentTeamId;
                    return (
                      <div
                        key={team.id}
                        className={`rounded-[24px] p-5 border transition-all ${isJoined ? "bg-[#f0fdf4] border-[#0b5d1e]" : "bg-white border-[#ececea] hover:border-gray-300"}`}
                      >
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <p className="text-[16px] font-bold text-[#111827]">
                              {team.name}
                            </p>
                            <p className="text-[13px] font-medium text-[#6b7280] mt-0.5">
                              {team.members.length} member
                              {team.members.length !== 1 ? "s" : ""}
                            </p>
                          </div>
                          {isJoined ? (
                            <div className="flex flex-wrap items-center justify-end gap-2">
                              <span className="rounded-full bg-[#dcfce7] px-3 py-1 text-[11px] font-black text-[#166534]">
                                Joined
                              </span>
                              <button
                                type="button"
                                onClick={() => setShowLeaveTeamModal(true)}
                                disabled={leaveTeamLoading}
                                className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-[11px] font-bold text-amber-800 transition hover:bg-amber-100 disabled:opacity-50"
                              >
                                {leaveTeamLoading ? "Leaving..." : "Leave Team"}
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => handleJoinTeam(team.id)}
                              disabled={loading}
                              className="rounded-full bg-[#0b5d1e] px-4 py-1.5 text-[12px] font-bold text-white hover:bg-[#0a4f1a] transition"
                            >
                              Join
                            </button>
                          )}
                        </div>

                        {/* Members Preview */}
                        {team.members.length > 0 && (
                          <div className="flex -space-x-2">
                            {team.members.slice(0, 5).map((m) => (
                              <div
                                key={m.id}
                                className="h-8 w-8 rounded-full border-2 border-white bg-gray-200 flex items-center justify-center text-[10px] font-bold text-gray-500"
                              >
                                {m.name.charAt(0)}
                              </div>
                            ))}
                            {team.members.length > 5 && (
                              <div className="h-8 w-8 rounded-full border-2 border-white bg-gray-100 flex items-center justify-center text-[10px] font-bold text-gray-500">
                                +{team.members.length - 5}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              <div className="mt-6 rounded-[24px] border border-[#ececea] bg-[#fcfcfb] p-5">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <div>
                    <h3 className="text-[16px] font-bold text-[#111827]">
                      My Team Requests
                    </h3>
                    <p className="mt-1 text-[13px] text-[#6b7280]">
                      Track the status of your submitted team requests.
                    </p>
                  </div>
                  <span className="rounded-full bg-[#eeeeeb] px-3 py-1 text-[11px] font-bold text-[#4b5563]">
                    {teamRequests.length} total
                  </span>
                </div>

                {teamRequests.length === 0 ? (
                  <p className="text-[14px] text-[#9ca3af]">
                    You have not submitted any team requests yet.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {teamRequests.map((request) => {
                      const statusStyles = {
                        PENDING: "bg-yellow-100 text-yellow-800",
                        APPROVED: "bg-green-100 text-green-800",
                        REJECTED: "bg-red-100 text-red-700",
                      } as const;

                      return (
                        <div
                          key={request.id}
                          className="rounded-[20px] border border-[#ececea] bg-white p-4"
                        >
                          <div className="flex flex-wrap items-start justify-between gap-3">
                            <div>
                              <div className="flex flex-wrap items-center gap-2">
                                <p className="text-[15px] font-bold text-[#111827]">
                                  {request.name}
                                </p>
                                <span
                                  className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${statusStyles[request.status]}`}
                                >
                                  {request.status}
                                </span>
                              </div>
                              <p className="mt-1 text-[12px] text-[#6b7280]">
                                Requested by {request.requestedBy.name} •{" "}
                                {timeAgo(request.createdAt)}
                              </p>
                            </div>
                          </div>

                          {request.message && (
                            <p className="mt-3 text-[13px] text-[#374151]">
                              {request.message}
                            </p>
                          )}

                          {request.reviewedBy && request.reviewedAt && (
                            <p className="mt-3 text-[12px] text-[#9ca3af]">
                              Reviewed by {request.reviewedBy.name} •{" "}
                              {timeAgo(request.reviewedAt)}
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ── MOBILE BOTTOM NAVIGATION ── */}
      <nav className="fixed bottom-0 z-50 w-full border-t border-[#ececea] bg-white/90 backdrop-blur-md px-2 py-2 pb-6 lg:hidden shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
        <div className="flex items-center justify-around max-w-[430px] mx-auto">
          {(
            [
              { key: "home", icon: Home, label: "Home" },
              { key: "leaderboard", icon: Trophy, label: "Board" },
            ] as const
          ).map((item) => (
            <button
              key={item.key}
              onClick={() => setTab(item.key)}
              className={`flex flex-col items-center gap-1 p-2 w-[60px] ${tab === item.key ? "text-[#0b5d1e]" : "text-[#9ca3af]"}`}
            >
              <item.icon
                className="h-[22px] w-[22px]"
                strokeWidth={tab === item.key ? 2.5 : 2}
              />
              <span
                className={`text-[10px] ${tab === item.key ? "font-bold" : "font-medium"}`}
              >
                {item.label}
              </span>
            </button>
          ))}

          <Link
            href="/log-action"
            className="-mt-8 flex h-14 w-14 items-center justify-center rounded-full bg-[#0b5d1e] text-white shadow-[0_8px_16px_rgba(11,93,30,0.3)] border-4 border-white transition-transform active:scale-95"
          >
            <Plus className="h-6 w-6" strokeWidth={3} />
          </Link>

          {(
            [
              { key: "activity", icon: Activity, label: "Activity" },
              ...(!isGlobalView
                ? [{ key: "teams" as const, icon: Users, label: "Teams" }]
                : []),
            ] as const
          ).map((item) => (
            <button
              key={item.key}
              onClick={() => setTab(item.key)}
              className={`flex flex-col items-center gap-1 p-2 w-[60px] ${tab === item.key ? "text-[#0b5d1e]" : "text-[#9ca3af]"}`}
            >
              <item.icon
                className="h-[22px] w-[22px]"
                strokeWidth={tab === item.key ? 2.5 : 2}
              />
              <span
                className={`text-[10px] ${tab === item.key ? "font-bold" : "font-medium"}`}
              >
                {item.label}
              </span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}
