"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, Archive, Trash2 } from "lucide-react";

type Tone = "danger" | "warning";

type ConfirmActionButtonProps = {
  label: string;
  title: string;
  subtitle: string;
  description: React.ReactNode;
  confirmLabel: string;
  pendingLabel: string;
  tone: Tone;
  // A Server Action bound to its record id, e.g. deleteChallenge.bind(null, id)
  action: () => Promise<{ error?: string }>;
  // Where to go after success; omit to stay on the page and refresh it
  redirectTo?: string;
};

const TONE_STYLES: Record<Tone, { trigger: string; icon: string; confirm: string }> = {
  danger: {
    trigger: "bg-rose-50 text-rose-700 ring-1 ring-rose-200 hover:bg-rose-100",
    icon: "bg-rose-100 text-rose-600",
    confirm: "bg-rose-600 hover:bg-rose-700",
  },
  warning: {
    trigger: "bg-amber-50 text-amber-800 ring-1 ring-amber-200 hover:bg-amber-100",
    icon: "bg-amber-100 text-amber-600",
    confirm: "bg-amber-600 hover:bg-amber-700",
  },
};

/**
 * Button that opens a confirmation dialog before running a destructive Server Action.
 *
 * Intent: Archive and permanent-delete flows across the admin console share one dialog,
 * so every irreversible action gets the same explicit confirmation step and error display.
 * Callers decide visibility (e.g. SuperAdmin-only); the Server Action enforces it again.
 */
export function ConfirmActionButton(props: ConfirmActionButtonProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const styles = TONE_STYLES[props.tone];
  const TriggerIcon = props.tone === "danger" ? Trash2 : Archive;

  const close = () => {
    if (isPending) return;
    setIsOpen(false);
    setError(null);
  };

  const confirm = () => {
    setError(null);
    startTransition(async () => {
      const result = await props.action();
      if (result.error) {
        setError(result.error);
        return;
      }
      setIsOpen(false);
      if (props.redirectTo) router.push(props.redirectTo);
      else router.refresh();
    });
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${styles.trigger}`}
      >
        <TriggerIcon className="w-3.5 h-3.5" />
        {props.label}
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs px-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-6 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${styles.icon}`}>
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">{props.title}</h3>
                <p className="text-xs text-slate-500 font-medium">{props.subtitle}</p>
              </div>
            </div>

            <div className="text-sm text-slate-600 leading-relaxed">{props.description}</div>

            {error && (
              <p className="text-sm text-rose-700 bg-rose-50 border border-rose-200 rounded-lg px-3 py-2">{error}</p>
            )}

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={close}
                disabled={isPending}
                className="px-4 py-2 border border-slate-200 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirm}
                disabled={isPending}
                className={`px-4 py-2 text-white rounded-lg text-sm font-semibold transition-colors shadow-sm disabled:opacity-50 ${styles.confirm}`}
              >
                {isPending ? props.pendingLabel : props.confirmLabel}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
