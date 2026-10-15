import React from "react";
import Link from "next/link";
import { UserPlus } from "lucide-react";
import UsersTable from "./UsersTable";

export default function AdminUsersPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Users & Roles</h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage participants, assign admin privileges, oversee team memberships, and view engagement activity.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/admin/admin/users/new"
            className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors shadow-sm"
          >
            <UserPlus className="w-4 h-4" />
            Invite User
          </Link>
        </div>
      </div>

      <UsersTable />
    </div>
  );
}
