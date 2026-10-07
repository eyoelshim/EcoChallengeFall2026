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

    const actions = await db.action.findMany({
      where: challengeId ? { challengeId } : {},
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: {
            name: true,
            email: true,
            teams: { include: { team: { select: { name: true } } } },
          },
        },
      },
    });

    const header = "User,Email,Team,Action,Category,Points,Date\n";
    const rows = actions.map((a) =>
      [
        `"${a.user.name}"`,
        `"${a.user.email}"`,
        `"${a.user.teams[0]?.team?.name ?? ""}"`,
        `"${a.actionType}"`,
        `"${a.category}"`,
        a.points,
        new Date(a.createdAt).toISOString(),
      ].join(",")
    );

    const csv = header + rows.join("\n");

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="greenstep-export.csv"`,
      },
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to export data" }, { status: 500 });
  }
}
