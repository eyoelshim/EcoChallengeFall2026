"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { UserCheck, UserX } from "lucide-react";
import { setChallengeParticipantActive } from "@/app/actions/admin-challenges";
import { ConfirmActionButton } from "@/components/admin/ConfirmActionButton";

type ParticipantStatusButtonProps = {
  challengeId: string;
  challengeName: string;
  userId: string;
  userName: string;
  isDeactivated: boolean;
};

/**
 * Roster control for per-challenge deactivation: deactivating asks for confirmation,
 * reactivating is a single click since it only restores access.
 */
export function ParticipantStatusButton(props: ParticipantStatusButtonProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  if (!props.isDeactivated) {
    return (
      <ConfirmActionButton
        label="Deactivate"
        icon={UserX}
        title="Deactivate in this challenge?"
        subtitle="They can still sign in and use other challenges"
        description={
          <p>
            <strong className="text-slate-900">{props.userName}</strong> won&apos;t be able to log actions or
            change teams in <strong className="text-slate-900">{props.challengeName}</strong>. Their points and
            team stay as they are, and you can reactivate them anytime.
          </p>
        }
        confirmLabel="Deactivate"
        pendingLabel="Deactivating..."
        tone="warning"
        action={setChallengeParticipantActive.bind(null, props.challengeId, props.userId, false)}
      />
    );
  }

  const reactivate = () => {
    setError(null);
    startTransition(async () => {
      const result = await setChallengeParticipantActive(props.challengeId, props.userId, true);
      if (result.error) setError(result.error);
      else router.refresh();
    });
  };

  return (
    <span className="inline-flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={reactivate}
        disabled={isPending}
        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200 hover:bg-emerald-100 transition-colors disabled:opacity-60"
      >
        <UserCheck className="w-3.5 h-3.5" />
        {isPending ? "Reactivating..." : "Reactivate"}
      </button>
      {error && <span className="text-[11px] text-rose-600">{error}</span>}
    </span>
  );
}
