import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { isCurrentUserAdmin } from "@/lib/authz";
import { reviewTeamRequest } from "@/lib/team-requests";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ requestId: string }> },
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!(await isCurrentUserAdmin())) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const status = body?.status;
    if (status !== "APPROVED" && status !== "REJECTED") {
      return NextResponse.json(
        { error: "status must be APPROVED or REJECTED" },
        { status: 400 },
      );
    }

    const { requestId } = await params;
    const request = await reviewTeamRequest({
      requestId,
      reviewerClerkId: userId,
      status,
    });

    return NextResponse.json(request);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to review team request";
    const status =
      message === "Forbidden"
        ? 403
        : message === "User not found" || message === "Team request not found"
          ? 404
          : message.startsWith("This request") ||
              message.startsWith("Requester") ||
              message.startsWith("A team")
            ? 400
            : 500;

    return NextResponse.json({ error: message }, { status });
  }
}
