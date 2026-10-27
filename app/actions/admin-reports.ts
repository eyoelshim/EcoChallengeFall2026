"use server";

import { ActionCategory, Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/authz";

export interface ReportFilterParams {
  challengeId?: string;
  category?: string;
  startDate?: string;
  endDate?: string;
}

export async function getReportChallenges() {
  await requireAdmin();
  return db.challenge.findMany({
    select: {
      id: true,
      name: true,
    },
    orderBy: {
      name: "asc",
    },
  });
}

export async function getLiveData(filters: ReportFilterParams) {
  await requireAdmin();

  const where: Prisma.ActionWhereInput = {};

  if (filters.challengeId && filters.challengeId !== "All") {
    where.challengeId = filters.challengeId;
  }

  if (
    filters.category &&
    filters.category !== "All" &&
    Object.values(ActionCategory).includes(filters.category as ActionCategory)
  ) {
    where.category = filters.category as ActionCategory;
  }

  if (filters.startDate || filters.endDate) {
    const dateFilter: Prisma.DateTimeFilter = {};
    if (filters.startDate) {
      dateFilter.gte = new Date(`${filters.startDate}T00:00:00.000Z`);
    }
    if (filters.endDate) {
      dateFilter.lte = new Date(`${filters.endDate}T23:59:59.999Z`);
    }
    where.date = dateFilter;
  }

  const [categoryBreakdown, participationRows] = await Promise.all([
    // Category breakdowns via db.action.groupBy
    db.action.groupBy({
      by: ["category"],
      where,
      _count: {
        id: true,
      },
      _sum: {
        points: true,
      },
    }),

    // Filtered participation rows via db.action.findMany
    db.action.findMany({
      where,
      orderBy: {
        date: "desc",
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            departmentName: true,
            department: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        challenge: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    }),
  ]);

  return { categoryBreakdown, participationRows };
}
