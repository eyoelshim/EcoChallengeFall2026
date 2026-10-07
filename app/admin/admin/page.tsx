import React from "react";
import { Users, Calendar, Target, Award } from "lucide-react";

export default function AdminDashboardPage() {
  const statCards = [
    { title: "Total Participants", count: "128", icon: Users, color: "text-blue-600 bg-blue-50" },
    { title: "Active Challenges", count: "3", icon: Calendar, color: "text-emerald-600 bg-emerald-50" },
    { title: "Total Teams", count: "12", icon: Target, color: "text-amber-600 bg-amber-50" },
    { title: "Actions Logged", count: "1,420", icon: Award, color: "text-purple-600 bg-purple-50" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Dashboard Overview</h1>
        <p className="text-sm text-slate-500 mt-1">
          Monitor participation metrics and live sustainability activity.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.title}
              className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:shadow transition-shadow"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-500">{card.title}</span>
                <div className={`p-2 rounded-lg ${card.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-4">
                <span className="text-2xl font-bold text-slate-900">{card.count}</span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
        <h2 className="text-base font-semibold text-slate-900 mb-2">Sprint 1 Demo 1 Architecture Status</h2>
        <ul className="space-y-2 text-sm text-slate-600">
          <li className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            Next.js 15 App Router Scaffold & Layout Shell Established
          </li>
          <li className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            Tailwind CSS & Lucide Icons Integrated
          </li>
          <li className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            Clerk Authentication & Route Guards in Progress
          </li>
          <li className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            Prisma Neon PostgreSQL Read/Write Connection in Progress
          </li>
        </ul>
      </div>
    </div>
  );
}