/**
 * @file app/(dashboard)/log-action/page.tsx
 * @author GreenStep Development Team
 * @date Fall 2026
 * @purpose Participant action discovery and logging view. Queries live
 *          ChallengeAction database records with master ActionCatalog fallback.
 */

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

type ActionCategoryTab =
  | "Popular"
  | "Recent"
  | "Transportation"
  | "Recycling"
  | "Energy"
  | "Food"
  | "Water";

interface CategoryTileConfig {
  readonly name: ActionCategoryTab;
  readonly icon: React.ComponentType<{ className?: string }>;
}

const CATEGORY_MAP: Record<string, ActionItem["category"]> = {
  Transportation: "TRANSPORT",
  Recycling: "RECYCLING",
  Energy: "ENERGY",
  Food: "FOOD",
  Water: "WATER",
};

const CATEGORY_COLOR_CONFIG: Record<
  string,
  { readonly bg: string; readonly icon: string }
> = {
  TRANSPORT: { bg: "bg-blue-200", icon: "text-blue-600" },
  RECYCLING: { bg: "bg-green-200", icon: "text-green-700" },
  ENERGY: { bg: "bg-yellow-200", icon: "text-yellow-700" },
  FOOD: { bg: "bg-orange-200", icon: "text-orange-700" },
  WATER: { bg: "bg-blue-100", icon: "text-blue-700" },
};

/**
 * Fills popular action lists up to the minimum display threshold using the
 * available action pool when insufficient telemetry actions exist.
 *
 * @param items - Currently aggregated popular actions.
 * @param pool - Fallback pool of available live challenge actions.
 * @returns Array containing at least MIN_POPULAR_ACTIONS actions.
 */
function fillPopularActions(
  items: ActionItem[],
  pool: ActionItem[],
): ActionItem[] {
  if (items.length >= MIN_POPULAR_ACTIONS) {
    return items;
  }

  const seenActionTypes = new Set(
    items.map((actionItem) => actionItem.actionType.toLowerCase()),
  );

  const fallbackActions = [...pool]
    .sort((first, second) => second.points - first.points)
    .filter(
      (actionItem) => !seenActionTypes.has(actionItem.actionType.toLowerCase()),
    )
    .slice(0, MIN_POPULAR_ACTIONS - items.length);

  return [...items, ...fallbackActions];
}

/**
 * Retrieves the Tailwind CSS background and icon color classes for an action.
 *
 * @param action - ActionItem containing category metadata.
 * @returns Object with bg and icon color class strings.
 */
function getIconColors(action: ActionItem): { bg: string; icon: string } {
  return (
    CATEGORY_COLOR_CONFIG[action.category] ?? {
      bg: "bg-gray-200",
      icon: "text-gray-600",
    }
  );
}

/**
 * Maps an action's sustainability category to its Lucide icon component.
 *
 * @param action - ActionItem containing category enum string.
 * @returns Lucide icon component.
 */
function getCategoryIcon(
  action: ActionItem,
): React.ComponentType<{ className?: string }> {
  switch (action.category) {
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

/**
 * Main participant view for discovering and selecting sustainability actions.
 * Dynamically queries the active challenge's catalog with fallback support.
 *
 * @returns Rendered React JSX element.
 */
export default function LogActionPage(): React.JSX.Element {
  const router = useRouter();

  const [activeChallengeId, setActiveChallengeId] =
    useState<string>(GLOBAL_CHALLENGE_ID);
  const [challengeName, setChallengeName] = useState<string | null>(null);
  const [liveActions, setLiveActions] = useState<ActionItem[]>([]);
  const [loadingLiveActions, setLoadingLiveActions] = useState<boolean>(true);

  const [selectedCategory, setSelectedCategory] =
    useState<ActionCategoryTab>("Transportation");
  const [sortBy, setSortBy] = useState<string>("Default");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [popularActions, setPopularActions] = useState<ActionItem[]>([]);
  const [recentActions, setRecentActions] = useState<ActionItem[]>([]);
  const [fetchingDynamic, setFetchingDynamic] = useState<boolean>(false);

  // 1. Synchronize active challenge from browser local storage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedChallengeId =
        localStorage.getItem("activeChallengeId") || GLOBAL_CHALLENGE_ID;
      setActiveChallengeId(storedChallengeId);
    }
  }, []);

  // 2. Query live actions catalog scoped to the selected challenge
  useEffect(() => {
    setLoadingLiveActions(true);
    const targetChallengeId = activeChallengeId || GLOBAL_CHALLENGE_ID;

    fetch(
      `/api/actions/catalog?challengeId=${encodeURIComponent(
        targetChallengeId,
      )}`,
    )
      .then((response) => response.json())
      .then((catalogResponse) => {
        if (catalogResponse.actions && Array.isArray(catalogResponse.actions)) {
          setLiveActions(catalogResponse.actions);
        }
        if (catalogResponse.challenge?.name) {
          setChallengeName(catalogResponse.challenge.name);
        } else if (targetChallengeId === GLOBAL_CHALLENGE_ID) {
          setChallengeName("GreenStep Global Challenge");
        } else {
          setChallengeName(null);
        }
      })
      .catch((caughtError) => {
        console.error("Failed to load actions catalog:", caughtError);
      })
      .finally(() => {
        setLoadingLiveActions(false);
      });
  }, [activeChallengeId]);

  // 3. Aggregate popular and recent actions dynamically from activity logs
  useEffect(() => {
    if (selectedCategory === "Popular") {
      setFetchingDynamic(true);
      fetch("/api/actions?filter=popular")
        .then((response) => response.json())
        .then(
          (
            popularResponseList: { actionType: string; category?: string }[],
          ) => {
            const mappedPopularItems = popularResponseList
              .map((apiItem) => {
                const matchedLiveAction = liveActions.find(
                  (actionItem) =>
                    actionItem.actionType.toLowerCase() ===
                    apiItem.actionType.toLowerCase(),
                );
                if (matchedLiveAction) {
                  return matchedLiveAction;
                }
                const fallbackCategory =
                  apiItem.category === "TRANSPORT" ||
                  apiItem.category === "RECYCLING" ||
                  apiItem.category === "ENERGY" ||
                  apiItem.category === "FOOD" ||
                  apiItem.category === "WATER"
                    ? apiItem.category
                    : "TRANSPORT";

                return {
                  title: apiItem.actionType,
                  actionType: apiItem.actionType,
                  description: "Popular community action",
                  category: fallbackCategory,
                  points: 15,
                };
              })
              .filter((actionItem): actionItem is ActionItem =>
                Boolean(actionItem),
              );
            setPopularActions(
              fillPopularActions(mappedPopularItems, liveActions),
            );
          },
        )
        .finally(() => {
          setFetchingDynamic(false);
        });
    } else if (selectedCategory === "Recent") {
      setFetchingDynamic(true);
      fetch("/api/actions?filter=recent")
        .then((response) => response.json())
        .then(
          (recentResponseList: { actionType: string; category?: string }[]) => {
            const mappedRecentItems = recentResponseList
              .map((apiItem) => {
                const matchedLiveAction = liveActions.find(
                  (actionItem) =>
                    actionItem.actionType.toLowerCase() ===
                    apiItem.actionType.toLowerCase(),
                );
                if (matchedLiveAction) {
                  return matchedLiveAction;
                }
                const fallbackCategory =
                  apiItem.category === "TRANSPORT" ||
                  apiItem.category === "RECYCLING" ||
                  apiItem.category === "ENERGY" ||
                  apiItem.category === "FOOD" ||
                  apiItem.category === "WATER"
                    ? apiItem.category
                    : "TRANSPORT";

                return {
                  title: apiItem.actionType,
                  actionType: apiItem.actionType,
                  description: "Recently logged action",
                  category: fallbackCategory,
                  points: 15,
                };
              })
              .filter((actionItem): actionItem is ActionItem =>
                Boolean(actionItem),
              );
            setRecentActions(mappedRecentItems);
          },
        )
        .finally(() => {
          setFetchingDynamic(false);
        });
    }
  }, [selectedCategory, liveActions]);

  const categoryTiles: CategoryTileConfig[] = [
    { name: "Popular", icon: TrendingUp },
    { name: "Recent", icon: Clock },
    { name: "Transportation", icon: Bike },
    { name: "Recycling", icon: Recycle },
    { name: "Energy", icon: Zap },
    { name: "Food", icon: Utensils },
    { name: "Water", icon: Droplet },
  ];

  const targetCategoryEnum = CATEGORY_MAP[selectedCategory];
  const baseActions: ActionItem[] =
    selectedCategory === "Popular"
      ? popularActions
      : selectedCategory === "Recent"
        ? recentActions
        : liveActions.filter(
            (actionItem) => actionItem.category === targetCategoryEnum,
          );

  let filteredActions = baseActions.filter((actionItem) => {
    const trimmedQuery = searchQuery.toLowerCase().trim();
    if (!trimmedQuery) {
      return true;
    }
    const matchesTitle = actionItem.title.toLowerCase().includes(trimmedQuery);
    const matchesDescription =
      actionItem.description &&
      actionItem.description.toLowerCase().includes(trimmedQuery);
    return matchesTitle || matchesDescription;
  });

  if (sortBy === "High Points") {
    filteredActions = [...filteredActions].sort(
      (first, second) => second.points - first.points,
    );
  } else if (sortBy === "Low Points") {
    filteredActions = [...filteredActions].sort(
      (first, second) => first.points - second.points,
    );
  } else if (sortBy === "A to Z") {
    filteredActions = [...filteredActions].sort((first, second) =>
      first.title.localeCompare(second.title),
    );
  } else if (sortBy === "Z to A") {
    filteredActions = [...filteredActions].sort((first, second) =>
      second.title.localeCompare(first.title),
    );
  }

  return (
    <div
      className="min-h-screen bg-[#f5f5f3] flex flex-col font-sans"
      suppressHydrationWarning
    >
      {/* ── Desktop Navigation Header ── */}
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
          <UserButton appearance={{ elements: { avatarBox: "h-9 w-9" } }} />
        </div>
      </header>

      {/* ── Mobile Navigation Header ── */}
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
        <UserButton appearance={{ elements: { avatarBox: "h-10 w-10" } }} />
      </header>

      {/* ── Main Content Area ── */}
      <main className="flex-1 w-full max-w-[1240px] mx-auto px-4 lg:px-8 py-4 pb-24 lg:pb-12">
        <div className="w-full max-w-[1100px] mx-auto">
          <div className="rounded-[32px] bg-white border border-[#ececea] p-6 lg:p-8 shadow-sm">
            {/* Top Toolbar */}
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

            {/* Active Challenge Indicator Badge */}
            {challengeName && (
              <div className="mb-5 flex items-center">
                <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 border border-emerald-200/80 px-3.5 py-1 text-xs font-semibold text-emerald-800">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Challenge: {challengeName}</span>
                </span>
              </div>
            )}

            {/* Action Search Input */}
            <div className="relative mb-4">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#9ca3af]" />
              <input
                type="text"
                placeholder="Search for an action..."
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                className="h-14 w-full rounded-[16px] border border-[#e5e7eb] bg-gray-100 pl-12 pr-4 text-[16px] text-[#111827] outline-none placeholder:text-[#9ca3af] focus:border-[#0b5d1e]"
              />
            </div>

            {/* Filter and Sort Dropdowns */}
            <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="relative">
                <select
                  value={selectedCategory}
                  onChange={(event) => {
                    setSelectedCategory(
                      event.target.value as ActionCategoryTab,
                    );
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
                  onChange={(event) => setSortBy(event.target.value)}
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

            {/* Category Filter Buttons Carousel */}
            <div className="mb-4 flex gap-3 overflow-x-auto scrollbar-hide pb-2 lg:grid lg:grid-cols-7 lg:overflow-visible">
              {categoryTiles.map((tileConfig) => {
                const IconComponent = tileConfig.icon;
                const isSelected = selectedCategory === tileConfig.name;

                return (
                  <button
                    key={tileConfig.name}
                    type="button"
                    onClick={() => setSelectedCategory(tileConfig.name)}
                    className={`flex min-w-[124px] min-h-[92px] flex-col items-center justify-center rounded-[18px] px-4 py-3 transition lg:min-w-0 ${
                      isSelected
                        ? "bg-[#0b5d1e] text-white shadow-md"
                        : "bg-gray-100 text-[#6b7280]"
                    }`}
                  >
                    <IconComponent className="mb-2 h-6 w-6" />
                    <span className="text-[13px] font-medium">
                      {tileConfig.name}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="mb-5 border-t border-[#ddddda]" />

            {/* Action Grid Results */}
            <div className="grid max-h-[420px] gap-2 overflow-y-auto rounded-[20px] border border-[#e5e7eb] bg-gray-100 p-2 lg:max-h-[560px] lg:grid-cols-2">
              {loadingLiveActions || fetchingDynamic ? (
                <div className="col-span-full rounded-[22px] border border-[#ececea] bg-white px-5 py-12 text-center">
                  <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-emerald-600 border-t-transparent mb-2" />
                  <p className="text-[14px] text-[#6b7280]">
                    Loading actions for active challenge...
                  </p>
                </div>
              ) : filteredActions.length > 0 ? (
                filteredActions.map((actionItem) => {
                  const CategoryIconComponent = getCategoryIcon(actionItem);
                  const colorStyles = getIconColors(actionItem);
                  return (
                    <button
                      key={`${actionItem.category}-${actionItem.actionType}`}
                      type="button"
                      onClick={() =>
                        router.push(
                          `/log-action/${encodeURIComponent(
                            actionItem.actionType,
                          )}`,
                        )
                      }
                      className="w-full rounded-[20px] border bg-white px-5 py-5 text-left shadow-sm transition border-[#ececea] hover:border-[#0b5d1e]"
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3 sm:gap-4">
                          <div
                            className={`flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full ${colorStyles.bg}`}
                          >
                            <CategoryIconComponent
                              className={`h-7 w-7 flex-shrink-0 ${colorStyles.icon}`}
                            />
                          </div>

                          <div>
                            <h3 className="text-[16px] font-medium text-[#1f2937]">
                              {actionItem.title}
                            </h3>
                            <p className="text-[13px] leading-5 text-[#6b7280]">
                              {actionItem.description}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className="text-[16px] font-medium text-[#166534]">
                            +{actionItem.points}
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

      {/* ── Mobile Tab Navigation Bar ── */}
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
          ).map((navItem) => (
            <Link
              key={navItem.label}
              href={navItem.href}
              className={`flex min-h-12 min-w-12 flex-col items-center justify-center gap-1 rounded-[16px] px-2 transition-colors ${
                "active" in navItem && navItem.active
                  ? "text-[#0b5d1e]"
                  : "text-[#9ca3af] hover:text-[#6b7280]"
              }`}
            >
              {navItem.label === "Log" ? (
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#0b5d1e] shadow-lg">
                  <Plus className="h-6 w-6 text-white" />
                </div>
              ) : (
                <navItem.icon className="h-6 w-6" />
              )}
              {navItem.label !== "Log" && (
                <span className="text-[10px] font-semibold">
                  {navItem.label}
                </span>
              )}
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
}
