import React from "react";
import { ShieldAlert, ShieldCheck } from "lucide-react";
import AdminSidebar from "@/components/layout/AdminSidebar";
import AdminTopBar from "@/components/layout/AdminTopBar";
import { isCurrentUserSuperAdmin, requireAdmin } from "@/lib/authz";

export const metadata = {
  title: "Admin Console | GreenStep",
  description: "GreenStep sustainability challenge management console",
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdmin();
  const isSuperAdmin = await isCurrentUserSuperAdmin();

  return (
    <div className="flex min-h-screen bg-slate-50">
      <AdminSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <AdminTopBar isSuperAdmin={isSuperAdmin} />
        <RoleBanner isSuperAdmin={isSuperAdmin} />
        <main className="flex-1 p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

// Admins and SuperAdmins share one console, so the banner makes the active privilege level obvious
function RoleBanner({ isSuperAdmin }: { isSuperAdmin: boolean }) {
  if (isSuperAdmin) {
    return (
      <div className="flex items-center gap-2 px-6 py-2 bg-purple-50 border-b border-purple-200 text-sm text-purple-800">
        <ShieldAlert className="w-4 h-4 shrink-0" />
        <span>
          <strong className="font-semibold">SuperAdmin mode.</strong> You can permanently delete records
          and grant any role. Deletions cannot be undone.
        </span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 px-6 py-2 bg-emerald-50 border-b border-emerald-200 text-sm text-emerald-800">
      <ShieldCheck className="w-4 h-4 shrink-0" />
      <span>
        <strong className="font-semibold">Admin mode.</strong> You can create, edit, archive, and deactivate.
        Permanent deletions require a SuperAdmin.
      </span>
    </div>
  );
}
