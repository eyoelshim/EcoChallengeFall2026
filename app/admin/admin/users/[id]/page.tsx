import React from "react";
import { notFound } from "next/navigation";
import { getAdminUserDetail } from "@/app/actions/admin-users";
import { isCurrentUserSuperAdmin } from "@/lib/authz";
import UserDetail from "./UserDetail";

export const dynamic = "force-dynamic";

export default async function UserProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [user, canChangeRole] = await Promise.all([getAdminUserDetail(id), isCurrentUserSuperAdmin()]);

  if (!user) notFound();

  return <UserDetail user={user} canChangeRole={canChangeRole} />;
}
