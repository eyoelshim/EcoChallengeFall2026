import Link from "next/link";

export const metadata = {
  title: "Access Denied | GreenStep",
};

export default function AdminUnauthorizedPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f5f5f3] px-6 py-10">
      <div className="w-full max-w-[560px] rounded-[32px] border border-[#ececea] bg-white p-8 text-center shadow-sm">
        <p className="text-[12px] font-bold uppercase tracking-[0.24em] text-[#9ca3af]">
          403 · Admin Access Required
        </p>
        <h1 className="mt-3 text-[28px] font-bold text-[#111827]">
          You do not have access to this page.
        </h1>
        <p className="mt-3 text-[15px] text-[#6b7280]">
          The admin console is only available to accounts with administrator
          privileges. If you think this is a mistake, contact your challenge
          administrator.
        </p>
        <Link
          href="/dashboard"
          className="mt-6 inline-flex rounded-full bg-[#0b5d1e] px-5 py-3 text-[14px] font-bold text-white"
        >
          Back to Dashboard
        </Link>
      </div>
    </main>
  );
}
