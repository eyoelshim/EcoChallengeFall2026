"use client";

import React, { useState, useEffect, useMemo } from "react";
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

import { getMockChallenges, type Challenge } from "./challenges/mock-data";
import { getMockUsers, type MockUser } from "./users/mock-data";
import { getMockGroups, type DepartmentGroup } from "./groups/mock-data";
import {
  INITIAL_PARTICIPATION_RECORDS,
  CATEGORY_COLORS,
  CATEGORY_BADGES,
  type ParticipationRecord,
} from "./reports/mock-data";

export default function AdminDashboardPage() {
  const [mounted, setMounted] = useState(false);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [users, setUsers] = useState<MockUser[]>([]);
  const [groups, setGroups] = useState<DepartmentGroup[]>([]);

  useEffect(() => {
    setChallenges(getMockChallenges());
    setUsers(getMockUsers());
    setGroups(getMockGroups());
    setMounted(true);
  }, []);

  // Compute live KPIs from shared mock stores
  const kpis = useMemo(() => {
    const activeChallenges = challenges.filter((c) => c.status === "Active").length;
    const upcomingChallenges = challenges.filter((c) => c.status === "Upcoming").length;
    const activeUsers = users.filter((u) => u.status === "Active").length;
    const totalActions = users.reduce((sum, u) => sum + (u.actionsLogged || 0), 0) || 1420;
    const totalPoints = users.reduce((sum, u) => sum + (u.points || 0), 0) || 12450;
    const estimatedCO2 = Math.round(totalActions * 0.27);
    const avgPointsPerUser = activeUsers > 0 ? Math.round(totalPoints / activeUsers) : 0;

    return {
      activeChallenges,
      upcomingChallenges,
      activeUsers,
      totalActions,
      totalPoints,
      estimatedCO2,
      avgPointsPerUser,
    };
  }, [challenges, users]);

  // Derive top leaderboard participants sorted by actual points
  const topParticipants = useMemo(() => {
    if (!users.length) return [];
    const sorted = [...users].sort((a, b) => b.points - a.points).slice(0, 4);
    const maxPoints = sorted[0]?.points || 1;
    return sorted.map((user, idx) => ({
      rank: idx + 1,
      id: user.id,
      name: user.name,
      role: user.role,
      department: user.department,
      groupName: user.groupName || "Individual",
      points: user.points,
      pct: Math.round((user.points / maxPoints) * 100),
    }));
  }, [users]);

  // Derive category distribution from participation dataset
  const categoryDistribution = useMemo(() => {
    const counts: Record<string, number> = {};
    INITIAL_PARTICIPATION_RECORDS.forEach((rec) => {
      counts[rec.category] = (counts[rec.category] || 0) + 1;
    });
    const total = INITIAL_PARTICIPATION_RECORDS.length || 1;
    return Object.entries(counts).map(([category, count]) => ({
      category,
      count,
      pct: Math.round((count / total) * 100),
      color: CATEGORY_COLORS[category] || "#10B981",
    }));
  }, []);

  // Live recent activity feed derived from participation records
  const recentFeed = useMemo(() => {
    return INITIAL_PARTICIPATION_RECORDS.slice(0, 5).map((rec, index) => {
      // Relative time indicators for demo visualization
      const timeLabels = ["5m ago", "18m ago", "42m ago", "2h ago", "4h ago"];
      return {
        ...rec,
        timeAgo: timeLabels[index] || rec.completedAt,
      };
    });
  }, []);

  const statCards = [
    {
      title: "Active Challenges",
      value: mounted ? kpis.activeChallenges.toString() : "3",
      trend: `${mounted ? kpis.upcomingChallenges : 2} upcoming sprints scheduled`,
      icon: Calendar,
      iconBg: "text-emerald-600 bg-emerald-50 ring-emerald-100",
    },
    {
      title: "Actions Logged",
      value: mounted ? kpis.totalActions.toLocaleString() : "1,420",
      trend: `+14% vs last week · ${mounted ? kpis.estimatedCO2 : 384} kg CO2`,
      icon: Award,
      iconBg: "text-purple-600 bg-purple-50 ring-purple-100",
    },
    {
      title: "Active Participants",
      value: mounted ? kpis.activeUsers.toString() : "128",
      trend: `Across ${mounted ? groups.length : 3} campus departments`,
      icon: Users,
      iconBg: "text-blue-600 bg-blue-50 ring-blue-100",
    },
    {
      title: "Total Points Earned",
      value: mounted ? kpis.totalPoints.toLocaleString() : "12,450",
      trend: `Avg ${mounted ? kpis.avgPointsPerUser : 97} pts/participant`,
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
            {recentFeed.map((activity: ParticipationRecord & { timeAgo: string }) => (
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
                      {activity.action}
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
                      className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium ring-1 ${
                        CATEGORY_BADGES[activity.category] || "bg-slate-100 text-slate-700 ring-slate-200"
                      }`}
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
              See all participation records in Reports &rarr;
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
              {(mounted ? topParticipants : []).map((user) => (
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
                        ({user.groupName})
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
              {categoryDistribution.map((cat) => (
                <div key={cat.category}>
                  <div className="flex justify-between font-medium text-slate-700 mb-1">
                    <span className="flex items-center gap-1.5">
                      <span
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: cat.color }}
                      />
                      {cat.category}
                    </span>
                    <span className="font-bold text-slate-900">
                      {cat.pct}% ({cat.count} acts)
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div
                      className="h-2 rounded-full transition-all duration-300"
                      style={{
                        width: `${cat.pct}%`,
                        backgroundColor: cat.color,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}