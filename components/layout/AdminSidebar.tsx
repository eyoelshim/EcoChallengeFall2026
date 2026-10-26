"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Calendar,
  Building2,
  Users,
  BarChart3,
  LayoutTemplate,
  ListChecks,
} from "lucide-react";

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const navItems: NavItem[] = [
  { label: "Dashboard", href: "/admin/admin", icon: LayoutDashboard },
  { label: "Challenges", href: "/admin/admin/challenges", icon: Calendar },
  { label: "Action Catalog", href: "/admin/admin/actions", icon: ListChecks },
  { label: "Templates", href: "/admin/admin/templates", icon: LayoutTemplate },
  { label: "Groups", href: "/admin/admin/groups", icon: Building2 },
  { label: "Users", href: "/admin/admin/users", icon: Users },
  { label: "Reports", href: "/admin/admin/reports", icon: BarChart3 },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-60 bg-white border-r border-slate-200 min-h-screen flex flex-col shrink-0">
      <div className="h-16 flex items-center px-6 border-b border-slate-200 gap-2.5">
        <Image
          src="/GreenStep.png"
          alt="GreenStep"
          width={28}
          height={28}
          className="w-7 h-7 rounded-lg object-contain"
        />
        <span className="font-bold text-lg text-slate-900 tracking-tight">GreenStep Admin</span>
      </div>

      <nav className="p-3 space-y-1 flex-1">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/admin/admin" && pathname.startsWith(item.href));
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? "bg-emerald-50 text-emerald-700 font-semibold"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? "text-emerald-600" : "text-slate-400"}`} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-100 text-xs text-slate-400">
        Sprint 1 Demo Console v0.1
      </div>
    </aside>
  );
}