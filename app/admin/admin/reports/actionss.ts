"use server"
import {db} from "../../../../lib/db";
import { Action, ActionCategory } from "@prisma/client";


interface FilterParams {
  challengeId?: string;
  category?: string;
  startDate?: string;
  endDate?: string;
}

export async function getLiveData(filters: FilterParams) {
  const where: any = {};
  if (filters.challengeId && filters.challengeId !== "All") {
    where.challengeId = filters.challengeId;
  }
  if (filters.category && filters.category !== "All") {
    where.category = filters.category as ActionCategory;
  }
  if (filters.startDate || filters.endDate) {
    where.date = {};
    if (filters.startDate) {
      where.date.gte = new Date(`${filters.startDate}T00:00:00.000Z`);
    }
    if (filters.endDate) {
      where.date.lte = new Date(`${filters.endDate}T23:59:59.999Z`);
    }
  }

  const [categoryBreakdown, participationRows] = await Promise.all([
    
    //Query category breakdowns via db.action.groupBy
    db.action.groupBy({
      by: ["category"],
      where: where,
      _count: {
        id: true,
      },
      _sum: {
        points: true,
      },
    }),

    // Filtered rows with participation rows via db.action.findMany
    db.action.findMany({
      where: where,
      orderBy: {
        date: "desc"
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
            department: true
          },
        },
        challenge: {
          select: {
            name: true
          },
        },
      },
    }),
  ]);
  return {categoryBreakdown, participationRows};
}