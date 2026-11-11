"use client";

import React, { useState } from "react";
import { Check, Link2 } from "lucide-react";

/**
 * Copies the evergreen general invitation link (/join on the current host) to the clipboard.
 *
 * Intent: The link never expires, so admins can paste it into staff newsletters or onboarding
 * emails once and keep reusing it.
 */
export function CopyJoinLinkButton() {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/join`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard can be blocked (e.g. insecure origin); fall back to a prompt the admin can copy from
      window.prompt("Copy the invitation link:", `${window.location.origin}/join`);
    }
  };

  return (
    <button
      type="button"
      onClick={copy}
      title="Anyone with this link can request an invitation. It never expires."
      className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors shadow-sm"
    >
      {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Link2 className="w-4 h-4 text-slate-500" />}
      {copied ? "Link copied" : "Copy Invite Link"}
    </button>
  );
}
