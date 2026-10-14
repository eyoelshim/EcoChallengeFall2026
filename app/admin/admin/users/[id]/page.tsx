import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Award, CalendarDays, Flame, Leaf, Star } from "lucide-react";
import { ROLE_BADGE_STYLES, formatDate, getMockUser } from "../mock-data";

const CATEGORY_DOT: Record<string, string> = {
  Transport: "bg-blue-500",
  Water: "bg-cyan-500",
  Energy: "bg-amber-500",
  Recycling: "bg-emerald-500",
  Food: "bg-rose-500",
};

export default async function UserProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = getMockUser(id);
  if (!user) notFound();

  const stats = [
    { title: "Total Points", value: user.points.toLocaleString(), icon: Star, color: "text-purple-600 bg-purple-50" },
    { title: "Current Streak", value: `${user.streak} days`, icon: Flame, color: "text-orange-600 bg-orange-50" },
    { title: "Actions Logged", value: user.actionsLogged, icon: Leaf, color: "text-emerald-600 bg-emerald-50" },
    { title: "Joined", value: formatDate(user.joinedAt), icon: CalendarDays, color: "text-blue-600 bg-blue-50" },
  ];

  return (
    <div className="space-y-6">
      <Link
        href="/admin/admin/users"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-900"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Users
      </Link>

      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-lg font-semibold shrink-0">
          {user.name
            .split(" ")
            .map((part) => part[0])
            .join("")}
        </div>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">{user.name}</h1>
            <span
              className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ring-1 ring-inset ${ROLE_BADGE_STYLES[user.role]}`}
            >
              {user.role}
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1 break-all">
            {user.email} · {user.department}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.title} className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-500">{stat.title}</span>
                <div className={`p-2 rounded-lg ${stat.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-4 text-2xl font-bold text-slate-900">{stat.value}</div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <section className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
          <h2 className="text-base font-semibold text-slate-900">Badges Earned</h2>
          {user.badges.length === 0 ? (
            <p className="mt-4 text-sm text-slate-500">No badges earned yet.</p>
          ) : (
            <ul className="mt-4 space-y-3">
              {user.badges.map((badge) => (
                <li key={badge.name} className="flex items-start gap-3 rounded-lg border border-slate-100 p-3">
                  <div className="p-2 rounded-lg bg-amber-50 text-amber-600 shrink-0">
                    <Award className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-900">{badge.name}</p>
                    <p className="text-xs text-slate-500">{badge.description}</p>
                    <p className="text-xs text-slate-400 mt-0.5">Earned {formatDate(badge.earnedAt)}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
          <h2 className="text-base font-semibold text-slate-900">Recent Activity</h2>
          {user.recentActivity.length === 0 ? (
            <p className="mt-4 text-sm text-slate-500">No activity logged yet.</p>
          ) : (
            <ol className="mt-4 relative border-l border-slate-200 ml-1.5 space-y-5">
              {user.recentActivity.map((activity) => (
                <li key={activity.id} className="pl-5 relative">
                  <span
                    className={`absolute -left-[5px] top-1.5 w-2.5 h-2.5 rounded-full ring-4 ring-white ${CATEGORY_DOT[activity.category]}`}
                  />
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-slate-900">{activity.action}</p>
                      <p className="text-xs text-slate-500">
                        {activity.category} · {formatDate(activity.date)}
                      </p>
                    </div>
                    <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full shrink-0">
                      +{activity.points} pts
                    </span>
                  </div>
                </li>
              ))}
            </ol>
          )}
        </section>
      </div>
    </div>
  );
}
