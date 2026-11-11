import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { getAdminChallengeForEdit, getDepartmentOptions } from "@/app/actions/admin-challenges";
import EditChallengeForm from "./EditChallengeForm";

export const dynamic = "force-dynamic";

// In Next.js 15, params is a Promise and must be awaited.
type EditChallengePageProps = {
  params: Promise<{ id: string }>;
};

// Loads the challenge on the server so the form opens pre-filled, with no loading flash
export default async function EditChallengePage(props: EditChallengePageProps) {
  const { id } = await props.params;
  const [challenge, departments] = await Promise.all([getAdminChallengeForEdit(id), getDepartmentOptions()]);

  if (!challenge) {
    notFound();
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <Link
        href={`/admin/challenges/${id}`}
        className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-900 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to challenge
      </Link>

      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Edit Challenge</h1>
        <p className="text-sm text-slate-500 mt-1">
          Update details for <span className="font-medium text-slate-700">{challenge.name}</span>{" "}
          <span className="font-mono">({challenge.code})</span>, or reopen it with new dates.
        </p>
      </div>

      <EditChallengeForm challenge={challenge} departments={departments} />
    </div>
  );
}
