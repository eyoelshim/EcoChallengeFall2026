import Link from "next/link";
import { currentUser, auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createChallenge } from "@/app/actions/challenge";
import { isCurrentUserAdmin } from "@/lib/authz";
import { db } from "@/lib/db";
import { reviewTeamRequest } from "@/lib/team-requests";

function formatDate(date?: Date | null) {
  if (!date) return "No date";
  return new Date(date).toLocaleDateString();
}

function parseOptionalDate(value: FormDataEntryValue | null) {
  if (typeof value !== "string" || !value) return undefined;
  return new Date(`${value}T00:00:00`);
}

const DEMO_CHALLENGES = [
  "Transportation Challenge",
  "Energy Challenge",
  "Recycling Challenge",
  "Food Challenge",
  "Water Challenge",
];

export default async function AdminPage() {
  const user = await currentUser();
  if (!user) {
    redirect("/sign-in");
  }

  const admin = await isCurrentUserAdmin();
  if (!admin) {
    return (
      <main className="min-h-screen bg-[#f5f5f3] px-6 py-10">
        <div className="mx-auto max-w-[720px] rounded-[32px] border border-[#ececea] bg-white p-8 shadow-sm">
          <p className="text-[12px] font-bold uppercase tracking-[0.24em] text-[#9ca3af]">
            Admin Access Required
          </p>
          <h1 className="mt-3 text-[28px] font-bold text-[#111827]">
            You do not have access to this page.
          </h1>
          <p className="mt-3 text-[15px] text-[#6b7280]">
            This admin workspace is only available to users whose Clerk
            metadata role is set to <span className="font-semibold">admin</span>.
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

  async function handleCreateChallenge(formData: FormData) {
    "use server";

    if (!(await isCurrentUserAdmin())) {
      redirect("/dashboard");
    }

    const name = String(formData.get("name") ?? "").trim();
    const startDate = parseOptionalDate(formData.get("startDate"));
    const endDate = parseOptionalDate(formData.get("endDate"));

    await createChallenge({ name, startDate, endDate });
    revalidatePath("/admin");
    revalidatePath("/dashboard");
  }

  async function handleCreateDemoPack() {
    "use server";

    if (!(await isCurrentUserAdmin())) {
      redirect("/dashboard");
    }

    const existing = await db.challenge.findMany({
      where: { name: { in: DEMO_CHALLENGES } },
      select: { name: true },
    });
    const existingNames = new Set(existing.map((challenge) => challenge.name));

    for (const name of DEMO_CHALLENGES) {
      if (!existingNames.has(name)) {
        await createChallenge({ name });
      }
    }

    revalidatePath("/admin");
    revalidatePath("/dashboard");
  }

  async function handleReviewRequest(formData: FormData) {
    "use server";

    const { userId } = await auth();
    if (!userId || !(await isCurrentUserAdmin())) {
      redirect("/dashboard");
    }

    const requestId = String(formData.get("requestId") ?? "");
    const status = String(formData.get("status") ?? "") as
      | "APPROVED"
      | "REJECTED";

    await reviewTeamRequest({
      requestId,
      reviewerClerkId: userId,
      status,
    });

    revalidatePath("/admin");
    revalidatePath("/dashboard");
  }

  const [pendingRequests, recentRequests, challenges] = await Promise.all([
    db.teamRequest.findMany({
      where: { status: "PENDING" },
      orderBy: { createdAt: "asc" },
      include: {
        challenge: { select: { id: true, name: true } },
        requestedBy: { select: { name: true, email: true } },
      },
    }),
    db.teamRequest.findMany({
      where: { status: { in: ["APPROVED", "REJECTED"] } },
      orderBy: { reviewedAt: "desc" },
      take: 10,
      include: {
        challenge: { select: { id: true, name: true } },
        requestedBy: { select: { name: true, email: true } },
        reviewedBy: { select: { name: true } },
      },
    }),
    db.challenge.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        code: true,
        startDate: true,
        endDate: true,
        _count: {
          select: {
            users: true,
            teams: true,
            actions: true,
            teamRequests: true,
          },
        },
      },
    }),
  ]);

  return (
    <main className="min-h-screen bg-[#f5f5f3] px-6 py-8">
      <div className="mx-auto max-w-[1100px] space-y-6">
        <div className="rounded-[32px] border border-[#ececea] bg-white p-8 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-[12px] font-bold uppercase tracking-[0.24em] text-[#9ca3af]">
                Admin Workspace
              </p>
              <h1 className="mt-2 text-[30px] font-bold text-[#111827]">
                Manage requests, exports, and challenges
              </h1>
              <p className="mt-2 text-[15px] text-[#6b7280]">
                Review pending team requests, export activity data, and create
                demo-ready challenges from one place.
              </p>
            </div>
            <Link
              href="/dashboard"
              className="rounded-full border border-[#d1d5db] px-4 py-2 text-[13px] font-semibold text-[#374151]"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.3fr_0.9fr]">
          <section className="rounded-[32px] border border-[#ececea] bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-[22px] font-bold text-[#111827]">
                  Pending Team Requests
                </h2>
                <p className="mt-1 text-[14px] text-[#6b7280]">
                  Approve to create the team and add the requester to it, or
                  reject to close the request.
                </p>
              </div>
              <span className="rounded-full bg-yellow-100 px-3 py-1 text-[12px] font-bold text-yellow-800">
                {pendingRequests.length} pending
              </span>
            </div>

            {pendingRequests.length === 0 ? (
              <p className="rounded-[24px] border border-dashed border-[#d1d5db] bg-[#f9fafb] px-5 py-10 text-center text-[14px] text-[#6b7280]">
                No pending team requests right now.
              </p>
            ) : (
              <div className="space-y-4">
                {pendingRequests.map((request) => (
                  <div
                    key={request.id}
                    className="rounded-[24px] border border-[#ececea] bg-[#fcfcfb] p-5"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-[17px] font-bold text-[#111827]">
                            {request.name}
                          </h3>
                          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-bold text-slate-700">
                            {request.challenge.name}
                          </span>
                        </div>
                        <p className="mt-2 text-[13px] text-[#6b7280]">
                          Requested by {request.requestedBy.name} (
                          {request.requestedBy.email})
                        </p>
                        <p className="mt-1 text-[13px] text-[#6b7280]">
                          Submitted {formatDate(request.createdAt)}
                        </p>
                        {request.message && (
                          <p className="mt-3 text-[14px] text-[#374151]">
                            {request.message}
                          </p>
                        )}
                      </div>

                      <div className="flex gap-2">
                        <form action={handleReviewRequest}>
                          <input type="hidden" name="requestId" value={request.id} />
                          <input type="hidden" name="status" value="APPROVED" />
                          <button
                            type="submit"
                            className="rounded-full bg-[#0b5d1e] px-4 py-2 text-[13px] font-bold text-white"
                          >
                            Approve
                          </button>
                        </form>
                        <form action={handleReviewRequest}>
                          <input type="hidden" name="requestId" value={request.id} />
                          <input type="hidden" name="status" value="REJECTED" />
                          <button
                            type="submit"
                            className="rounded-full bg-[#ef4444] px-4 py-2 text-[13px] font-bold text-white"
                          >
                            Reject
                          </button>
                        </form>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-8">
              <h3 className="text-[17px] font-bold text-[#111827]">
                Recently Reviewed
              </h3>
              <div className="mt-4 space-y-3">
                {recentRequests.length === 0 ? (
                  <p className="text-[14px] text-[#9ca3af]">
                    No reviewed requests yet.
                  </p>
                ) : (
                  recentRequests.map((request) => (
                    <div
                      key={request.id}
                      className="rounded-[20px] border border-[#ececea] bg-white px-4 py-3"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <p className="text-[14px] font-bold text-[#111827]">
                            {request.name}
                          </p>
                          <p className="text-[12px] text-[#6b7280]">
                            {request.challenge.name} • {request.requestedBy.name}
                          </p>
                        </div>
                        <span
                          className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${
                            request.status === "APPROVED"
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {request.status}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </section>

          <div className="space-y-6">
            <section className="rounded-[32px] border border-[#ececea] bg-white p-6 shadow-sm">
              <h2 className="text-[22px] font-bold text-[#111827]">
                Export Data
              </h2>
              <p className="mt-1 text-[14px] text-[#6b7280]">
                Download all activity or export a challenge-specific CSV.
              </p>

              <div className="mt-5 flex flex-wrap gap-3">
                <a
                  href="/api/export/csv"
                  className="rounded-full bg-[#0b5d1e] px-4 py-2 text-[13px] font-bold text-white"
                >
                  Export All Activity
                </a>
              </div>

              <div className="mt-5 space-y-3">
                {challenges.map((challenge) => (
                  <div
                    key={challenge.id}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-[20px] border border-[#ececea] bg-[#fcfcfb] px-4 py-3"
                  >
                    <div>
                      <p className="text-[14px] font-bold text-[#111827]">
                        {challenge.name}
                      </p>
                      <p className="text-[12px] text-[#6b7280]">
                        Code: {challenge.code}
                      </p>
                    </div>
                    <a
                      href={`/api/export/csv?challengeId=${challenge.id}`}
                      className="rounded-full border border-[#0b5d1e] px-4 py-2 text-[12px] font-bold text-[#0b5d1e]"
                    >
                      Export Challenge
                    </a>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-[32px] border border-[#ececea] bg-white p-6 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="text-[22px] font-bold text-[#111827]">
                    Challenge Setup
                  </h2>
                  <p className="mt-1 text-[14px] text-[#6b7280]">
                    Create new challenges or quickly add the category-themed
                    demo pack.
                  </p>
                </div>
                <form action={handleCreateDemoPack}>
                  <button
                    type="submit"
                    className="rounded-full border border-[#0b5d1e] px-4 py-2 text-[12px] font-bold text-[#0b5d1e]"
                  >
                    Create Demo Challenge Pack
                  </button>
                </form>
              </div>

              <form action={handleCreateChallenge} className="mt-5 space-y-3">
                <input
                  type="text"
                  name="name"
                  required
                  placeholder="Challenge name"
                  className="w-full rounded-[16px] border border-[#e5e7eb] bg-white px-4 py-3 text-[14px] text-[#111827] outline-none"
                />
                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="text-[13px] font-medium text-[#374151]">
                    <span className="mb-1 block">Start date</span>
                    <input
                      type="date"
                      name="startDate"
                      className="w-full rounded-[16px] border border-[#e5e7eb] bg-white px-4 py-3 text-[14px] text-[#111827] outline-none"
                    />
                  </label>
                  <label className="text-[13px] font-medium text-[#374151]">
                    <span className="mb-1 block">End date</span>
                    <input
                      type="date"
                      name="endDate"
                      className="w-full rounded-[16px] border border-[#e5e7eb] bg-white px-4 py-3 text-[14px] text-[#111827] outline-none"
                    />
                  </label>
                </div>
                <button
                  type="submit"
                  className="rounded-full bg-[#111827] px-5 py-3 text-[13px] font-bold text-white"
                >
                  Create Challenge
                </button>
              </form>

              <div className="mt-6 space-y-3">
                {challenges.map((challenge) => (
                  <div
                    key={challenge.id}
                    className="rounded-[20px] border border-[#ececea] bg-[#fcfcfb] p-4"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="text-[15px] font-bold text-[#111827]">
                          {challenge.name}
                        </p>
                        <p className="text-[12px] text-[#6b7280]">
                          Join code: {challenge.code}
                        </p>
                        <p className="mt-1 text-[12px] text-[#9ca3af]">
                          {formatDate(challenge.startDate)} -{" "}
                          {formatDate(challenge.endDate)}
                        </p>
                      </div>
                      <div className="text-right text-[12px] text-[#6b7280]">
                        <p>{challenge._count.users} users</p>
                        <p>{challenge._count.teams} teams</p>
                        <p>{challenge._count.actions} actions</p>
                        <p>{challenge._count.teamRequests} requests</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}
