import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { isCurrentUserAdmin } from "@/lib/authz";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (!(await isCurrentUserAdmin())) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const challengeId = searchParams.get("challengeId") ?? undefined;
    const category = searchParams.get("category") ?? undefined;
    const startDate = searchParams.get("startDate") ?? undefined;
    const endDate = searchParams.get("endDate") ?? undefined;

    const filters: any = {};
    if (challengeId) filters.challengeId = challengeId;
    if (category) filters.category = category;
    if (startDate || endDate) {
      filters.createdAt = {};
      if (startDate) filters.createdAt.gte = new Date(startDate);
      if (endDate) filters.createdAt.lte = new Date(endDate);
    }

    const actions = await db.action.findMany({
      where: filters,
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: {
            name: true,
            email: true,
            department: {
              select: {name: true,},
            },
          },
        },
        challenge: {
            select: {
              name: true,
            }
          }
      },
    });

    const header = "Date,User Name,Email,Department,Challenge,Category,Action,Points,Notes\n";
    const rows = actions.map((a) =>
      [
        new Date(a.createdAt).toISOString(),
        `"${a.user.name}"`,
        `"${a.user.email}"`,
        `"${a.user.department}"`,
        `"${a.challenge?.name}"`,
        `"${a.category}"`,
        `"${a.actionType}"`,
        a.points,
        `"${a.note}"`,
      ].join(",")
    );

    const csv = header + rows.join("\n");

    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="mpca-participation-report-${timestamp}.csv`,
      },
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to export data" }, { status: 500 });
  }
}
