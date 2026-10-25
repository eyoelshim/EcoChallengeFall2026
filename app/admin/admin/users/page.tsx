import React from "react";
import Link from "next/link";
import { UserPlus } from "lucide-react";
import UsersTable from "./UsersTable";
import { getAdminUsers } from "@/app/actions/admin-users";

export const dynamic = "force-dynamic";

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

function param(value: string | string[] | undefined) {
  return typeof value === "string" && value ? value : undefined;
}

export default async function AdminUsersPage({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;
  const filters = {
    role: param(sp.role),
    status: param(sp.status),
    department: param(sp.department),
    search: param(sp.search),
  };
  const data = await getAdminUsers(filters);

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

      <UsersTable data={data} filters={filters} />
    </div>
  );
}
