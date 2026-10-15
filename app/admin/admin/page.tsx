import React from "react";
import Link from "next/link";
import {
  Users,
  Calendar,
  Award,
  Sparkles,
  UserPlus,
  Building2,
  CalendarPlus,
  BarChart3,
  ArrowUpRight,
  Clock,
  ChevronRight,
  TrendingUp,
} from "lucide-react";

interface ActivityItem {
  id: string;
  userId: string;
  userName: string;
  actionName: string;
  points: number;
  challengeId: string;
  challengeName: string;
  category: "Transportation" | "Waste & Recycling" | "Energy Conservation" | "Water Conservation";
  timeAgo: string;
}

const RECENT_ACTIVITIES: ActivityItem[] = [
  {
    id: "act-1",
    userId: "u3",
    userName: "Sarah Jenkins",
    actionName: "Biked to Campus",
    points: 15,
    challengeId: "1",
    challengeName: "Commuter Challenge",
    category: "Transportation",
    timeAgo: "5m ago",
  },
  {
    id: "act-2",
    userId: "u1",
    userName: "Jordan Reyes",
    actionName: "Turned off office lights",
    points: 10,
    challengeId: "2",
    challengeName: "Energy Saver Sprint",
    category: "Energy Conservation",
    timeAgo: "18m ago",
  },
  {
    id: "act-3",
    userId: "u2",
    userName: "Marcus Lee",
    actionName: "Fixed breakroom faucet aerator",
    points: 20,
    challengeId: "c3",
    challengeName: "Campus Clean Water Drive",
    category: "Water Conservation",
    timeAgo: "42m ago",
  },
  {
    id: "act-4",
    userId: "u3",
    userName: "Priya Shah",
    actionName: "Composted lunch food scraps",
    points: 15,
    challengeId: "3",
    challengeName: "Zero Waste Week",
    category: "Waste & Recycling",
    timeAgo: "2h ago",
  },
  {
    id: "act-5",
    userId: "u4",
    userName: "Daniel Okafor",
    actionName: "Printed double-sided monthly budget",
    points: 5,
    challengeId: "3",
    challengeName: "Zero Waste Week",
    category: "Waste & Recycling",
    timeAgo: "4h ago",
  },
];

const LEADERBOARD_USERS = [
  { rank: 1, id: "u1", name: "Jordan Reyes", role: "SuperAdmin", team: "Team Alpha", points: 1280, pct: 100 },
  { rank: 2, id: "u3", name: "Priya Shah", role: "GeneralUser", team: "Team Alpha", points: 860, pct: 67 },
  { rank: 3, id: "u2", name: "Marcus Lee", role: "Admin", team: "Team Beta", points: 740, pct: 58 },
  { rank: 4, id: "u4", name: "Daniel Okafor", role: "GeneralUser", team: "UST Operations", points: 210, pct: 16 },
];

const CATEGORY_PILL_STYLES: Record<ActivityItem["category"], string> = {
  Transportation: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  "Waste & Recycling": "bg-blue-50 text-blue-700 ring-blue-200",
  "Energy Conservation": "bg-amber-50 text-amber-700 ring-amber-200",
  "Water Conservation": "bg-cyan-50 text-cyan-700 ring-cyan-200",
};

export default function AdminDashboardPage() {
  const statCards = [
    {
      title: "Active Challenges",
      value: "3",
      trend: "2 upcoming sprints scheduled",
      icon: Calendar,
      iconBg: "text-emerald-600 bg-emerald-50 ring-emerald-100",
    },
    {
      title: "Actions Logged",
      value: "1,420",
      trend: "+14% vs last week · 384 kg CO2",
      icon: Award,
      iconBg: "text-purple-600 bg-purple-50 ring-purple-100",
    },
    {
      title: "Active Participants",
      value: "128",
      trend: "78.4% participation across 3 groups",
      icon: Users,
      iconBg: "text-blue-600 bg-blue-50 ring-blue-100",
    },
    {
      title: "Total Points Earned",
      value: "12,450",
      trend: "Avg 97 pts/participant",
      icon: Sparkles,
      iconBg: "text-amber-600 bg-amber-50 ring-amber-100",
    },
  ];

  const quickActions = [
    {
      title: "New Challenge",
      description: "Launch a sustainability sprint or competition with custom rules and timeline.",
      href: "/admin/admin/challenges/new",
      icon: CalendarPlus,
      color: "text-emerald-600 bg-emerald-50 ring-emerald-100 hover:border-emerald-300",
      buttonText: "Create Challenge",
    },
    {
      title: "Invite User",
      description: "Add a campus participant, department member, or assign admin role permissions.",
      href: "/admin/admin/users/new",
      icon: UserPlus,
      color: "text-blue-600 bg-blue-50 ring-blue-100 hover:border-blue-300",
      buttonText: "Invite User",
    },
    {
      title: "Create Group",
      description: "Organize campus departments, student organizations, or facilities squads.",
      href: "/admin/admin/groups/new",
      icon: Building2,
      color: "text-purple-600 bg-purple-50 ring-purple-100 hover:border-purple-300",
      buttonText: "Add Department",
    },
    {
      title: "View Reports",
      description: "Inspect cross-challenge engagement, filter logs, and download CSV export files.",
      href: "/admin/admin/reports",
      icon: BarChart3,
      color: "text-amber-600 bg-amber-50 ring-amber-100 hover:border-amber-300",
      buttonText: "Open Analytics",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Dashboard Overview</h1>
          <p className="text-sm text-slate-500 mt-1">
            Monitor real-time participation metrics, recent sustainability activities, and manage platform resources.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Live Platform Status: Active
          </span>
        </div>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.title}
              className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-500">{card.title}</span>
                <div className={`p-2.5 rounded-lg ring-1 ${card.iconBg}`}>
                  <Icon className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-4">
                <span className="text-3xl font-bold tracking-tight text-slate-900">
                  {card.value}
                </span>
                <p className="text-xs text-slate-500 font-medium mt-1 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3 text-emerald-600 shrink-0" />
                  {card.trend}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Action Navigation Tiles */}
      <div>
        <div className="mb-3">
          <h2 className="text-base font-bold text-slate-900">Quick Actions</h2>
          <p className="text-xs text-slate-500">Shortcut buttons for common administrative tasks.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <Link
                key={action.title}
                href={action.href}
                className="group bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className={`p-2.5 rounded-lg ring-1 ${action.color} transition-transform group-hover:scale-105`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-slate-900 transition-colors" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                    {action.title}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    {action.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center text-xs font-semibold text-emerald-600 group-hover:text-emerald-700">
                  <span>{action.buttonText}</span>
                  <ChevronRight className="w-3.5 h-3.5 ml-1 transition-transform group-hover:translate-x-0.5" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Main Two-Column Layout: Live Feed & Leaderboard / Category Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Live Recent Activity Feed (7 cols) */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl shadow-sm flex flex-col">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900">Live Recent Activity Feed</h2>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Real-time participant challenge completions and logged environmental actions.
              </p>
            </div>
            <Link
              href="/admin/admin/reports"
              className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 inline-flex items-center gap-1"
            >
              View Full Report
              <ChevronRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="p-5 divide-y divide-slate-100 flex-1">
            {RECENT_ACTIVITIES.map((activity) => (
              <div
                key={activity.id}
                className="py-3.5 first:pt-0 last:pb-0 flex items-start justify-between gap-3"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Link
                      href={`/admin/admin/users/${activity.userId}`}
                      className="text-sm font-bold text-slate-900 hover:text-emerald-700 hover:underline"
                    >
                      {activity.userName}
                    </Link>
                    <span className="text-xs text-slate-400">logged</span>
                    <span className="text-sm font-semibold text-slate-800">
                      {activity.actionName}
                    </span>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200">
                      +{activity.points} pts
                    </span>
                  </div>

                  <div className="mt-1 flex items-center gap-2 text-xs text-slate-500 flex-wrap">
                    <span>in</span>
                    <Link
                      href={`/admin/admin/challenges/${activity.challengeId}`}
                      className="font-medium text-slate-700 hover:text-emerald-700 hover:underline"
                    >
                      {activity.challengeName}
                    </Link>
                    <span>·</span>
                    <span
                      className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium ring-1 ${CATEGORY_PILL_STYLES[activity.category]}`}
                    >
                      {activity.category}
                    </span>
                  </div>
                </div>

                <div className="shrink-0 flex items-center gap-1 text-xs text-slate-400 font-medium">
                  <Clock className="w-3 h-3 text-slate-400" />
                  <span>{activity.timeAgo}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 bg-slate-50 border-t border-slate-100 rounded-b-xl text-center">
            <Link
              href="/admin/admin/reports"
              className="text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
            >
              See all 1,420 participation records in Reports &rarr;
            </Link>
          </div>
        </div>

        {/* Right Column: Top Leaderboard & Category Breakdown (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Top Participants Leaderboard */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div>
                <h2 className="text-base font-bold text-slate-900">Top Participants</h2>
                <p className="text-xs text-slate-500 mt-0.5">Leading campus contributors by total points.</p>
              </div>
              <Link
                href="/admin/admin/users"
                className="text-xs font-semibold text-emerald-600 hover:text-emerald-700"
              >
                All Users
              </Link>
            </div>

            <div className="space-y-3.5">
              {LEADERBOARD_USERS.map((user) => (
                <div key={user.id} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 min-w-0">
                      <span
                        className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[11px] shrink-0 ${
                          user.rank === 1
                            ? "bg-amber-100 text-amber-800 ring-1 ring-amber-300"
                            : user.rank === 2
                            ? "bg-slate-200 text-slate-800 ring-1 ring-slate-300"
                            : user.rank === 3
                            ? "bg-amber-700/10 text-amber-900 ring-1 ring-amber-700/20"
                            : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        {user.rank}
                      </span>
                      <Link
                        href={`/admin/admin/users/${user.id}`}
                        className="font-bold text-slate-900 hover:text-emerald-700 truncate"
                      >
                        {user.name}
                      </Link>
                      <span className="text-slate-400 truncate hidden sm:inline">
                        ({user.team})
                      </span>
                    </div>
                    <span className="font-bold text-slate-900 shrink-0">
                      {user.points.toLocaleString()} pts
                    </span>
                  </div>

                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-2 rounded-full ${
                        user.rank === 1
                          ? "bg-amber-400"
                          : user.rank === 2
                          ? "bg-slate-400"
                          : user.rank === 3
                          ? "bg-amber-600"
                          : "bg-emerald-500"
                      }`}
                      style={{ width: `${user.pct}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Category Engagement Breakdown */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
            <div className="pb-3 border-b border-slate-100 mb-4">
              <h2 className="text-base font-bold text-slate-900">Impact Categories</h2>
              <p className="text-xs text-slate-500 mt-0.5">Distribution of campus action volume.</p>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <div className="flex justify-between font-medium text-slate-700 mb-1">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                    Transportation
                  </span>
                  <span className="font-bold text-slate-900">42% (596 acts)</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-emerald-500 h-2 rounded-full" style={{ width: "42%" }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between font-medium text-slate-700 mb-1">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                    Waste & Recycling
                  </span>
                  <span className="font-bold text-slate-900">28% (398 acts)</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-blue-500 h-2 rounded-full" style={{ width: "28%" }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between font-medium text-slate-700 mb-1">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                    Energy Conservation
                  </span>
                  <span className="font-bold text-slate-900">18% (256 acts)</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-amber-500 h-2 rounded-full" style={{ width: "18%" }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between font-medium text-slate-700 mb-1">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-cyan-500" />
                    Water Conservation
                  </span>
                  <span className="font-bold text-slate-900">12% (170 acts)</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-cyan-500 h-2 rounded-full" style={{ width: "12%" }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}