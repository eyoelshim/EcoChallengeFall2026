import React from "react";
import Image from "next/image";
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { JoinForm } from "./JoinForm";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Join GreenStep",
  description: "Request your invitation to the GreenStep sustainability challenge.",
};

// Evergreen general invitation link: shareable forever, no token or expiry in the URL
export default async function JoinPage() {
  const { userId } = await auth();
  if (userId) redirect("/dashboard");

  const departments = await db.department.findMany({
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f5f5f3] px-4 py-8">
      <div className="w-full max-w-[440px] rounded-[32px] border border-[#ececea] bg-white p-8 shadow-sm">
        <div className="flex items-center gap-3">
          <Image src="/icons/logo.png" alt="GreenStep logo" width={40} height={40} className="rounded-xl" />
          <span className="text-[18px] font-bold text-[#111827]">GreenStep</span>
        </div>
        <h1 className="mt-6 text-[26px] font-bold leading-tight text-[#111827]">Join the challenge</h1>
        <p className="mt-2 text-[15px] text-[#6b7280]">
          Enter your work email and department. We&apos;ll email you a link to create your account.
        </p>
        <JoinForm departments={departments} />
      </div>
    </main>
  );
}
