"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import {
  ChevronRight,
  ChevronDown,
  Search,
  Bike,
  Zap,
  Recycle,
  Utensils,
  Droplet,
  Clock,
  TrendingUp,
  Home,
  Trophy,
  Activity,
  Users,
  Plus,
} from "lucide-react";
import Image from "next/image";
import type { ActionItem } from "@/lib/actions-data";
import { GLOBAL_CHALLENGE_ID } from "@/lib/constants";

const MIN_POPULAR_ACTIONS = 5;

type Category =
  | "Popular"
  | "Recent"
  | "Transportation"
  | "Recycling"
  | "Energy"
  | "Food"
  | "Water";

const categoryToEnum: Record<string, string> = {
  Transportation: "TRANSPORT",
  Recycling: "RECYCLING",
  Energy: "ENERGY",
  Food: "FOOD",
  Water: "WATER",
};

export default function LogActionPage() {
  const router = useRouter();

  const [activeChallengeId, setActiveChallengeId] = useState<string>(GLOBAL_CHALLENGE_ID);
  const [challengeName, setChallengeName] = useState<string | null>(null);
  const [liveActions, setLiveActions] = useState<ActionItem[]>([]);
  const [loadingLiveActions, setLoadingLiveActions] = useState(true);

  const [selectedCategory, setSelectedCategory] =
    useState<Category>("Transportation");
  const [sortBy, setSortBy] = useState("Default");
  const [searchQuery, setSearchQuery] = useState("");
  const [popularActions, setPopularActions] = useState<ActionItem[]>([]);
  const [recentActions, setRecentActions] = useState<ActionItem[]>([]);
  const [fetchingDynamic, setFetchingDynamic] = useState(false);

  // 1. Read active challenge from local storage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("activeChallengeId") || GLOBAL_CHALLENGE_ID;
      setActiveChallengeId(saved);
    }
  }, []);

  // 2. Fetch live challenge actions from live database
  useEffect(() => {
    setLoadingLiveActions(true);
    const cId = activeChallengeId || GLOBAL_CHALLENGE_ID;
    fetch(`/api/actions/catalog?challengeId=${encodeURIComponent(cId)}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.actions && Array.isArray(data.actions)) {
          setLiveActions(data.actions);
        }
        if (data.challenge?.name) {
          setChallengeName(data.challenge.name);
        } else if (cId === GLOBAL_CHALLENGE_ID) {
          setChallengeName("GreenStep Global Challenge");
        } else {
          setChallengeName(null);
        }
      })
      .catch((err) => {
        console.error("Failed to load actions catalog:", err);
      })
      .finally(() => setLoadingLiveActions(false));
  }, [activeChallengeId]);

  function fillPopularActions(items: ActionItem[], pool: ActionItem[]) {
    if (items.length >= MIN_POPULAR_ACTIONS) {
      return items;
    }

    const seen = new Set(items.map((item) => item.actionType.toLowerCase()));
    const fallback = [...pool]
      .sort((a, b) => b.points - a.points)
      .filter((item) => !seen.has(item.actionType.toLowerCase()))
      .slice(0, MIN_POPULAR_ACTIONS - items.length);

    return [...items, ...fallback];
  }

  // 3. Dynamic Popular and Recent feeds
  useEffect(() => {
    if (selectedCategory === "Popular") {
      setFetchingDynamic(true);
      fetch("/api/actions?filter=popular")
        .then((r) => r.json())
        .then((data: { actionType: string; category?: string }[]) => {
          const items = data
            .map((d) => {
              const found = liveActions.find(
                (a) => a.actionType.toLowerCase() === d.actionType.toLowerCase()
              );
              if (found) return found;
              return {
                title: d.actionType,
                actionType: d.actionType,
                description: "Popular community action",
                category: (d.category as "TRANSPORT" | "RECYCLING" | "ENERGY" | "FOOD" | "WATER") || "TRANSPORT",
                points: 15,
              } as ActionItem;
            })
            .filter((a): a is ActionItem => Boolean(a));
          setPopularActions(fillPopularActions(items, liveActions));
        })
        .finally(() => setFetchingDynamic(false));
    } else if (selectedCategory === "Recent") {
      setFetchingDynamic(true);
      fetch("/api/actions?filter=recent")
        .then((r) => r.json())
        .then((data: { actionType: string; category?: string }[]) => {
          const items = data
            .map((d) => {
              const found = liveActions.find(
                (a) => a.actionType.toLowerCase() === d.actionType.toLowerCase()
              );
              if (found) return found;
              return {
                title: d.actionType,
                actionType: d.actionType,
                description: "Recently logged action",
                category: (d.category as "TRANSPORT" | "RECYCLING" | "ENERGY" | "FOOD" | "WATER") || "TRANSPORT",
                points: 15,
              } as ActionItem;
            })
            .filter((a): a is ActionItem => Boolean(a));
          setRecentActions(items);
        })
        .finally(() => setFetchingDynamic(false));
    }
  }, [selectedCategory, liveActions]);

  const categoryTiles: {
    name: Category;
    icon: React.ComponentType<{ className?: string }>;
  }[] = [
    { name: "Popular", icon: TrendingUp },
    { name: "Recent", icon: Clock },
    { name: "Transportation", icon: Bike },
    { name: "Recycling", icon: Recycle },
    { name: "Energy", icon: Zap },
    { name: "Food", icon: Utensils },
    { name: "Water", icon: Droplet },
  ];

  const targetCategoryEnum = categoryToEnum[selectedCategory];
  const baseActions: ActionItem[] =
    selectedCategory === "Popular"
      ? popularActions
      : selectedCategory === "Recent"
        ? recentActions
        : liveActions.filter((a) => a.category === targetCategoryEnum);

  let filteredActions = baseActions.filter((action) => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return true;
    return (
      action.title.toLowerCase().includes(query) ||
      (action.description && action.description.toLowerCase().includes(query))
    );
  });

  if (sortBy === "High Points") {
    filteredActions = [...filteredActions].sort((a, b) => b.points - a.points);
  } else if (sortBy === "Low Points") {
    filteredActions = [...filteredActions].sort((a, b) => a.points - b.points);
  } else if (sortBy === "A to Z") {
    filteredActions = [...filteredActions].sort((a, b) =>
      a.title.localeCompare(b.title),
    );
  } else if (sortBy === "Z to A") {
    filteredActions = [...filteredActions].sort((a, b) =>
      b.title.localeCompare(a.title),
    );
  }

  const categoryIconColor: Record<string, { bg: string; icon: string }> = {
    TRANSPORT: { bg: "bg-blue-200", icon: "text-blue-600" },
    RECYCLING: { bg: "bg-green-200", icon: "text-green-700" },
    ENERGY: { bg: "bg-yellow-200", icon: "text-yellow-700" },
    FOOD: { bg: "bg-orange-200", icon: "text-orange-700" },
    WATER: { bg: "bg-blue-100", icon: "text-blue-700" },
  };

  function getIconColors(action: ActionItem) {
    return (
      categoryIconColor[action.category] ?? {
        bg: "bg-gray-200",
        icon: "text-gray-600",
      }
    );
  }

  function getIcon(action: ActionItem) {
    const cat = action.category;
    switch (cat) {
      case "TRANSPORT":
        return Bike;
      case "RECYCLING":
        return Recycle;
      case "ENERGY":
        return Zap;
      case "FOOD":
        return Utensils;
      case "WATER":
        return Droplet;
      default:
        return Bike;
    }
  }

  return (
    <div
      className="min-h-screen bg-[#f5f5f3] flex flex-col font-sans"
      suppressHydrationWarning
    >
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
        <div className="flex items-center gap-2 lg:gap-4 shrink-0">
          <Link
            href="/dashboard"
            className="text-[13px] text-[#6b7280] hover:text-[#111827] transition-colors"
          >
            Dashboard
          </Link>
          <UserButton
            appearance={{ elements: { avatarBox: "h-9 w-9" } }}
          />
        </div>
      </header>

      <header className="lg:hidden flex items-center justify-between px-5 pt-6 pb-4 bg-white rounded-b-[24px] shadow-sm mb-4 relative z-10">
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
          <div>
            <p className="text-[15px] font-bold text-[#111827] leading-tight">
              GreenStep
            </p>
            <p className="text-[11px] text-[#6b7280]">Log an action</p>
          </div>
        </Link>
        <UserButton
          appearance={{ elements: { avatarBox: "h-10 w-10" } }}
        />
      </header>

      <main className="flex-1 w-full max-w-[1240px] mx-auto px-4 lg:px-8 py-4 pb-24 lg:pb-12">
        <div className="w-full max-w-[1100px] mx-auto">
          <div className="rounded-[32px] bg-white border border-[#ececea] p-6 lg:p-8 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <Link
                href="/dashboard"
                className="min-h-11 rounded-full border border-[#ececea] bg-[#f8f8f7] px-5 py-3 text-[14px] font-semibold text-[#374151] hover:text-[#111827]"
              >
                Back
              </Link>
              <h1 className="text-[20px] font-bold text-[#111827]">
                Log Action
              </h1>
              <div className="w-[64px]" />
            </div>

            {challengeName && (
              <div className="mb-5 flex items-center">
                <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 border border-emerald-200/80 px-3.5 py-1 text-xs font-semibold text-emerald-800">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Challenge: {challengeName}</span>
                </span>
              </div>
            )}

            <div className="relative mb-4">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#9ca3af]" />
              <input
                type="text"
                placeholder="Search for an action..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-14 w-full rounded-[16px] border border-[#e5e7eb] bg-gray-100 pl-12 pr-4 text-[16px] text-[#111827] outline-none placeholder:text-[#9ca3af] focus:border-[#0b5d1e]"
              />
            </div>

            <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="relative">
                <select
                  value={selectedCategory}
                  onChange={(e) => {
                    setSelectedCategory(e.target.value as Category);
                  }}
                  className="h-12 w-full appearance-none rounded-[14px] border border-[#e5e7eb] bg-gray-100 px-4 pr-10 text-[15px] text-[#111827] outline-none focus:border-[#0b5d1e]"
                >
                  <option value="Popular">Popular</option>
                  <option value="Recent">Recent</option>
                  <option value="Transportation">Transportation</option>
                  <option value="Recycling">Recycling</option>
                  <option value="Energy">Energy</option>
                  <option value="Food">Food</option>
                  <option value="Water">Water</option>
                </select>
                <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9ca3af]" />
              </div>

              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="h-12 w-full appearance-none rounded-[14px] border border-[#e5e7eb] bg-[#f8f8f7] px-5 pr-10 text-[15px] text-[#111827] outline-none focus:border-[#0b5d1e]"
                >
                  <option>Default</option>
                  <option>High Points</option>
                  <option>Low Points</option>
                  <option>A to Z</option>
                  <option>Z to A</option>
                </select>
                <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9ca3af]" />
              </div>
            </div>

            <div className="mb-4 flex gap-3 overflow-x-auto scrollbar-hide pb-2 lg:grid lg:grid-cols-7 lg:overflow-visible">
              {categoryTiles.map((tile) => {
                const Icon = tile.icon;
                const isSelected = selectedCategory === tile.name;

                return (
                  <button
                    key={tile.name}
                    type="button"
                    onClick={() => setSelectedCategory(tile.name)}
                    className={`flex min-w-[124px] min-h-[92px] flex-col items-center justify-center rounded-[18px] px-4 py-3 transition lg:min-w-0 ${
                      isSelected
                        ? "bg-[#0b5d1e] text-white shadow-md"
                        : "bg-gray-100 text-[#6b7280]"
                    }`}
                  >
                    <Icon className="mb-2 h-6 w-6" />
                    <span className="text-[13px] font-medium">{tile.name}</span>
                  </button>
                );
              })}
            </div>

            <div className="mb-5 border-t border-[#ddddda]" />

            <div className="grid max-h-[420px] gap-2 overflow-y-auto rounded-[20px] border border-[#e5e7eb] bg-gray-100 p-2 lg:max-h-[560px] lg:grid-cols-2">
              {loadingLiveActions || fetchingDynamic ? (
                <div className="col-span-full rounded-[22px] border border-[#ececea] bg-white px-5 py-12 text-center">
                  <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-emerald-600 border-t-transparent mb-2" />
                  <p className="text-[14px] text-[#6b7280]">Loading actions for active challenge...</p>
                </div>
              ) : filteredActions.length > 0 ? (
                filteredActions.map((action) => {
                  const Icon = getIcon(action);
                  const colors = getIconColors(action);
                  return (
                    <button
                      key={`${action.category}-${action.actionType}`}
                      type="button"
                      onClick={() =>
                        router.push(
                          `/log-action/${encodeURIComponent(action.actionType)}`,
                        )
                      }
                      className="w-full rounded-[20px] border bg-white px-5 py-5 text-left shadow-sm transition border-[#ececea] hover:border-[#0b5d1e]"
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3 sm:gap-4">
                          <div
                            className={`flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full ${colors.bg}`}
                          >
                            <Icon
                              className={`h-7 w-7 flex-shrink-0 ${colors.icon}`}
                            />
                          </div>

                          <div>
                            <h3 className="text-[16px] font-medium text-[#1f2937]">
                              {action.title}
                            </h3>
                            <p className="text-[13px] leading-5 text-[#6b7280]">
                              {action.description}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className="text-[16px] font-medium text-[#166534]">
                            +{action.points}
                          </span>
                          <ChevronRight className="h-4 w-5 text-[#9ca3af]" />
                        </div>
                      </div>
                    </button>
                  );
                })
              ) : (
                <div className="col-span-full rounded-[22px] border border-[#ececea] bg-white px-5 py-8 text-center">
                  <p className="text-[15px] font-medium text-[#374151]">
                    {selectedCategory === "Popular" ||
                    selectedCategory === "Recent"
                      ? "No actions logged yet."
                      : "No actions available in this category for the active challenge."}
                  </p>
                  {selectedCategory === "Popular" && (
                    <p className="mt-2 text-[13px] text-[#6b7280]">
                      Popular actions will appear here as people start logging
                      activity.
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-[#ececea] py-3 px-6 shadow-[0_-4px_20px_rgba(0,0,0,0.06)]">
        <div className="flex items-center justify-around max-w-[430px] mx-auto">
          {(
            [
              { href: "/dashboard", icon: Home, label: "Home" },
              { href: "/dashboard", icon: Trophy, label: "Ranks" },
              { href: "/log-action", icon: Plus, label: "Log", active: true },
              { href: "/dashboard", icon: Activity, label: "Stats" },
              { href: "/dashboard", icon: Users, label: "Teams" },
            ] as const
          ).map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className={`flex min-h-12 min-w-12 flex-col items-center justify-center gap-1 rounded-[16px] px-2 transition-colors ${
                "active" in item && item.active
                  ? "text-[#0b5d1e]"
                  : "text-[#9ca3af] hover:text-[#6b7280]"
              }`}
            >
              {item.label === "Log" ? (
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#0b5d1e] shadow-lg">
                  <Plus className="h-6 w-6 text-white" />
                </div>
              ) : (
                <item.icon className="h-6 w-6" />
              )}
              {item.label !== "Log" && (
                <span className="text-[10px] font-semibold">{item.label}</span>
              )}
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
}
