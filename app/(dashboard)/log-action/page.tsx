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
import {
  allActions,
  actionsByCategory,
  findAction,
  type ActionItem,
} from "@/lib/actions-data";

const MIN_POPULAR_ACTIONS = 5;

type Category =
  | "Popular"
  | "Recent"
  | "Transportation"
  | "Recycling"
  | "Energy"
  | "Food"
  | "Water";

export default function LogActionPage() {
  const router = useRouter();

  const [selectedCategory, setSelectedCategory] =
    useState<Category>("Transportation");
  const [sortBy, setSortBy] = useState("Default");
  const [searchQuery, setSearchQuery] = useState("");
  const [popularActions, setPopularActions] = useState<ActionItem[]>([]);
  const [recentActions, setRecentActions] = useState<ActionItem[]>([]);
  const [fetchingDynamic, setFetchingDynamic] = useState(false);

  function fillPopularActions(items: ActionItem[]) {
    if (items.length >= MIN_POPULAR_ACTIONS) {
      return items;
    }

    const seen = new Set(items.map((item) => item.actionType));
    const fallback = [...allActions]
      .sort((a, b) => b.points - a.points)
      .filter((item) => !seen.has(item.actionType))
      .slice(0, MIN_POPULAR_ACTIONS - items.length);

    return [...items, ...fallback];
  }

  useEffect(() => {
    if (selectedCategory === "Popular") {
      setFetchingDynamic(true);
      fetch("/api/actions?filter=popular")
        .then((r) => r.json())
        .then((data: { actionType: string }[]) => {
          const items = data
            .map((d) => findAction(d.actionType))
            .filter((a): a is ActionItem => Boolean(a));
          setPopularActions(fillPopularActions(items));
        })
        .finally(() => setFetchingDynamic(false));
    } else if (selectedCategory === "Recent") {
      setFetchingDynamic(true);
      fetch("/api/actions?filter=recent")
        .then((r) => r.json())
        .then((data: { actionType: string }[]) => {
          const items = data
            .map((d) => findAction(d.actionType))
            .filter((a): a is ActionItem => Boolean(a));
          setRecentActions(items);
        })
        .finally(() => setFetchingDynamic(false));
    }
  }, [selectedCategory]);

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

  const staticMap: Record<string, ActionItem[]> = {
    Transportation: actionsByCategory.Transportation,
    Recycling: actionsByCategory.Recycling,
    Energy: actionsByCategory.Energy,
    Food: actionsByCategory.Food,
    Water: actionsByCategory.Water,
  };

  const baseActions: ActionItem[] =
    selectedCategory === "Popular"
      ? popularActions
      : selectedCategory === "Recent"
        ? recentActions
        : (staticMap[selectedCategory] ?? []);

  let filteredActions = baseActions.filter((action) => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return true;
    return (
      action.title.toLowerCase().includes(query) ||
      action.description.toLowerCase().includes(query)
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
    Transportation: { bg: "bg-blue-200", icon: "text-blue-600" },
    Recycling: { bg: "bg-green-200", icon: "text-green-700" },
    Energy: { bg: "bg-yellow-200", icon: "text-yellow-700" },
    Food: { bg: "bg-orange-200", icon: "text-orange-700" },
    Water: { bg: "bg-blue-100", icon: "text-blue-700" },
    Popular: { bg: "bg-gray-200", icon: "text-gray-600" },
    Recent: { bg: "bg-gray-200", icon: "text-gray-600" },
  };

  function getIconColors(action: ActionItem) {
    const cat =
      selectedCategory === "Popular" || selectedCategory === "Recent"
        ? (Object.entries(staticMap).find(([, items]) =>
            items.some((i) => i.actionType === action.actionType),
          )?.[0] ?? "Transportation")
        : selectedCategory;
    return (
      categoryIconColor[cat] ?? { bg: "bg-gray-200", icon: "text-gray-600" }
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
            <div className="mb-7 flex items-center justify-between">
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
              {fetchingDynamic ? (
                <div className="rounded-[22px] border border-[#ececea] bg-white px-5 py-8 text-center">
                  <p className="text-[15px] text-[#6b7280]">Loading...</p>
                </div>
              ) : filteredActions.length > 0 ? (
                filteredActions.map((action) => {
                  const Icon = getIcon(action);
                  const colors = getIconColors(action);
                  return (
                    <button
                      key={action.actionType}
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
                <div className="rounded-[22px] border border-[#ececea] bg-white px-5 py-8 text-center">
                  <p className="text-[15px] font-medium text-[#374151]">
                    {selectedCategory === "Popular" ||
                    selectedCategory === "Recent"
                      ? "No actions logged yet."
                      : "No actions available yet"}
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
