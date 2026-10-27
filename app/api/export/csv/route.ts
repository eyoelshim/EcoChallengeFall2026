import { auth } from "@clerk/nextjs/server";
import { ActionCategory, Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { isCurrentUserAdmin } from "@/lib/authz";
import { NextResponse } from "next/server";

function escapeCsvCell(value: unknown): string {
  if (value === null || value === undefined) return "";
  const str = String(value);
  if (str.includes(",") || str.includes('"') || str.includes("\n") || str.includes("\r")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

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

    const filters: Prisma.ActionWhereInput = {};

    if (challengeId && challengeId !== "All") {
      filters.challengeId = challengeId;
    }

    if (
      category &&
      category !== "All" &&
      Object.values(ActionCategory).includes(category as ActionCategory)
    ) {
      filters.category = category as ActionCategory;
    }

    if (startDate || endDate) {
      const dateFilter: Prisma.DateTimeFilter = {};
      if (startDate) {
        dateFilter.gte = new Date(`${startDate}T00:00:00.000Z`);
      }
      if (endDate) {
        dateFilter.lte = new Date(`${endDate}T23:59:59.999Z`);
      }
      filters.date = dateFilter;
    }

    const actions = await db.action.findMany({
      where: filters,
      orderBy: { date: "desc" },
      include: {
        user: {
          select: {
            name: true,
            email: true,
            departmentName: true,
            department: {
              select: { name: true },
            },
          },
        },
        challenge: {
          select: {
            name: true,
          },
        },
      },
    });

    const header = "Date,User Name,Email,Department,Challenge,Category,Action,Points,Notes\r\n";
    const rows = actions.map((a) => {
      const department = a.user.department?.name || a.user.departmentName || "";
      return [
        escapeCsvCell(a.date ? new Date(a.date).toISOString() : new Date(a.createdAt).toISOString()),
        escapeCsvCell(a.user.name),
        escapeCsvCell(a.user.email),
        escapeCsvCell(department),
        escapeCsvCell(a.challenge?.name ?? ""),
        escapeCsvCell(a.category),
        escapeCsvCell(a.actionType),
        escapeCsvCell(a.points),
        escapeCsvCell(a.note ?? ""),
      ].join(",");
    });

    const csv = header + rows.join("\r\n");

    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="mpca-participation-report-${timestamp}.csv"`,
      },
    });
  } catch (error) {
    console.error("Failed to export CSV:", error);
    return NextResponse.json({ error: "Failed to export data" }, { status: 500 });
  }
}
