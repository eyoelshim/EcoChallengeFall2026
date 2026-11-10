import React from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getDepartmentOptions } from "@/app/actions/admin-users";
import { CopyJoinLinkButton } from "@/components/admin/CopyJoinLinkButton";
import { InviteUsersForm } from "./InviteUsersForm";

export const dynamic = "force-dynamic";

export default async function InviteUsersPage() {
  const departments = await getDepartmentOptions();

  return (
    <div className="space-y-6">
      <Link
        href="/admin/users"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-900"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Users
      </Link>

      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Invite Users</h1>
          <p className="text-sm text-slate-500 mt-1">
            Paste one or many emails. Each person gets an invitation email and joins as a General User.
          </p>
        </div>
        <CopyJoinLinkButton />
      </div>

      <InviteUsersForm departments={departments} />
    </div>
  );
}
