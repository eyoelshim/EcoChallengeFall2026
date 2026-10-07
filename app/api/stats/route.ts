import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

function getDayLabel(date: Date): string {
  return ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][date.getDay()];
}

function getMonthLabel(date: Date): string {
  return ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][
    date.getMonth()
  ];
}

export async function GET(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const range = searchParams.get("range") ?? "week"; // week | month | alltime
    const challengeId = searchParams.get("challengeId") ?? undefined;
    const category = searchParams.get("category") ?? undefined;

    const user = await db.user.findUnique({ where: { clerkId: userId } });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const now = new Date();
    const buckets: { label: string; from: Date; to: Date }[] = [];

    if (range === "week") {
      const day = now.getDay();
      const monday = new Date(now);
      monday.setDate(now.getDate() - ((day + 6) % 7));
      monday.setHours(0, 0, 0, 0);
      for (let i = 0; i < 7; i++) {
        const from = new Date(monday);
        from.setDate(monday.getDate() + i);
        const to = new Date(from);
        to.setHours(23, 59, 59, 999);
        buckets.push({ label: getDayLabel(from), from, to });
      }
    } else if (range === "month") {
      for (let i = 3; i >= 0; i--) {
        const to = new Date(now);
        to.setDate(now.getDate() - i * 7);
        to.setHours(23, 59, 59, 999);
        const from = new Date(to);
        from.setDate(to.getDate() - 6);
        from.setHours(0, 0, 0, 0);
        buckets.push({ label: `Wk${4 - i}`, from, to });
      }
    } else {
      for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const from = new Date(d.getFullYear(), d.getMonth(), 1);
        const to = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999);
        buckets.push({ label: getMonthLabel(from), from, to });
      }
    }

    const rangeFrom = buckets[0].from;
    const rangeTo = buckets[buckets.length - 1].to;

    // Scope actions to challenge and category if provided
    const challengeFilter = challengeId ? { challengeId } : {};
    const categoryFilter = category ? { category: category as "TRANSPORT" | "WATER" | "ENERGY" | "RECYCLING" | "FOOD" } : {};

    const [userActions, allActions] = await Promise.all([
      db.action.findMany({
        where: {
          userId: user.id,
          ...challengeFilter,
          ...categoryFilter,
          createdAt: { gte: rangeFrom, lte: rangeTo },
        },
        select: { points: true, createdAt: true },
      }),
      db.action.findMany({
        where: {
          ...challengeFilter,
          ...categoryFilter,
          createdAt: { gte: rangeFrom, lte: rangeTo },
        },
        select: { points: true, createdAt: true, userId: true },
      }),
    ]);

    const activeUserIds = new Set(allActions.map((a) => a.userId));
    const userCount = Math.max(1, activeUserIds.size);

    const data = buckets.map(({ label, from, to }) => {
      const myPoints = userActions
        .filter((a) => a.createdAt >= from && a.createdAt <= to)
        .reduce((s, a) => s + a.points, 0);

      const totalPoints = allActions
        .filter((a) => a.createdAt >= from && a.createdAt <= to)
        .reduce((s, a) => s + a.points, 0);

      return {
        label,
        you: myPoints,
        average: Math.round(totalPoints / userCount),
      };
    });

    return NextResponse.json(data);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
  }
}
