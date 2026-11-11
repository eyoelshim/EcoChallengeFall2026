"use client";

import React from "react";
import { UserButton, useUser } from "@clerk/nextjs";

export default function AdminTopBar({ isSuperAdmin }: { isSuperAdmin: boolean }) {
  const { user } = useUser();

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-10">
      <div className="flex items-center gap-2">
        <h2 className="text-base font-semibold text-slate-800">
          {isSuperAdmin ? "SuperAdmin Console" : "Admin Console"}
        </h2>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <span className="font-medium text-slate-900">{user?.fullName || user?.primaryEmailAddress?.emailAddress || "Admin"}</span>
          {isSuperAdmin ? (
            <span className="bg-purple-100 text-purple-800 ring-1 ring-purple-200 text-xs px-2 py-0.5 rounded-full font-semibold">
              SuperAdmin
            </span>
          ) : (
            <span className="bg-emerald-100 text-emerald-800 text-xs px-2 py-0.5 rounded-full font-medium">
              Admin
            </span>
          )}
        </div>
        <UserButton />
      </div>
    </header>
  );
}
