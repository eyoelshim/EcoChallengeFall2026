"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import { MailCheck } from "lucide-react";
import { requestJoinInvitation, type JoinRequestResult } from "@/app/actions/join";

const fieldClass =
  "w-full h-12 rounded-xl border border-[#e5e7eb] bg-[#f9fafb] px-4 text-[14px] text-[#111827] outline-none focus:border-[#0b5d1e]";

export function JoinForm({ departments }: { departments: { id: string; name: string }[] }) {
  const [email, setEmail] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [result, setResult] = useState<JoinRequestResult | null>(null);
  const [isPending, startTransition] = useTransition();

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setResult(null);
    startTransition(async () => setResult(await requestJoinInvitation({ email, departmentId })));
  };

  if (result?.status === "invited") {
    return (
      <div className="mt-6 rounded-2xl bg-[#ecf7ef] p-5 text-center">
        <MailCheck className="mx-auto h-8 w-8 text-[#0b5d1e]" />
        <p className="mt-3 text-[15px] font-semibold text-[#111827]">Check your inbox</p>
        <p className="mt-1 text-[14px] text-[#4b5563]">
          We sent an invitation to <strong>{email.trim()}</strong>. Open it to create your account.
        </p>
      </div>
    );
  }

  if (result?.status === "already_member") {
    return (
      <div className="mt-6 rounded-2xl bg-[#f3f4f6] p-5 text-center">
        <p className="text-[15px] font-semibold text-[#111827]">You already have an account</p>
        <Link
          href="/sign-in"
          className="mt-4 inline-flex rounded-full bg-[#0b5d1e] px-5 py-3 text-[14px] font-bold text-white"
        >
          Sign in
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="mt-6 space-y-4">
      <label className="block">
        <span className="mb-1.5 block text-[13px] font-medium text-[#374151]">Work email</span>
        <input
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@city.gov"
          className={fieldClass}
        />
      </label>
      <label className="block">
        <span className="mb-1.5 block text-[13px] font-medium text-[#374151]">Department</span>
        <select required value={departmentId} onChange={(e) => setDepartmentId(e.target.value)} className={fieldClass}>
          <option value="" disabled>
            Select your department
          </option>
          {departments.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name}
            </option>
          ))}
        </select>
      </label>

      {result?.error && <p className="text-[13px] font-medium text-[#b91c1c]">{result.error}</p>}

      <button
        type="submit"
        disabled={isPending}
        className="h-12 w-full rounded-full bg-[#0b5d1e] text-[15px] font-bold text-white disabled:opacity-60"
      >
        {isPending ? "Sending..." : "Send my invitation"}
      </button>
      <p className="text-center text-[13px] text-[#6b7280]">
        Already have an account?{" "}
        <Link href="/sign-in" className="font-semibold text-[#0b5d1e]">
          Sign in
        </Link>
      </p>
    </form>
  );
}
