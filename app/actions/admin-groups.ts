"use server";
import { db } from "@/lib/db";
import { User } from "@clerk/nextjs/server";
//import { TeamRequestStatus } from "@prisma/client";

export interface department {
  id: string;
  name: string;
  description: string | null;
  createdAt: Date;
  users: User[];
  _count: {
    users: number;
    challenges: number;
  }
}


export interface teamRequested {
    id: string;
    name: string;
    message: string | null;
    createdAt: Date | string;
    requestedBy: {
        id: string;
        name: string | null;
        email: string | null;
    };
    challenge: {
        id: string;
        name: string;
    }
}

type CreateDepartmentInput = {
    name: string;
    description?: string | null;
};

type ReviewTeamRequestInput = {
  requestId: string;
  action: "APPROVE" | "REJECT";
  reviewerId: string;
};

export async function getAdminDepartments(){
    try {
        const departments = await db.department.findMany({
            include: {
                _count: { select: {users: true, challenges: true}}
            }
        })
        return departments
    } catch (error) {
        return [];
    }
}
export async function getAdminDepartment(id: string){
    try {
        const department = await db.department.findUnique({ where: { id: id },
            include: {
                users: true,
                _count: { 
                    select: { users: true, challenges: true }
                }
            }
        })
        return department
    } catch (error) {
        return [];
    }
}


export async function getPendingTeamRequest(){
    const teamRequest = db.teamRequest.findMany({
        where: { status: "PENDING" },
        include: {
            requestedBy: { select: { id: true, name: true, email: true } },
            challenge: { select: { id: true, name: true } }
        }
    })
    return teamRequest
}

export async function reviewTeamRequest({
    requestId,
    action,
    reviewerId
}: ReviewTeamRequestInput) {
    return db.$transaction(async () => {
        const reviewer = await db.user.findUnique({ where: { id: reviewerId } });
        if (!reviewer) {
            throw new Error("User not found");
        }
// getting info about the request
        const request = await db.teamRequest.findUnique({
            where: { id: requestId },
            include: {
                requestedBy: {
                    include: {
                        teams: { include: { team: { select: { challengeId: true } } } },
                        challenges: { select: { challengeId: true } },
                    },
                },
                challenge: { select: { id: true, name: true } },
            },
        });
//  Team request does not exist
        if (!request) {
            throw new Error("Team request not found");
        }
// Team request already handled  
        if (request.status !== "PENDING") {
            throw new Error("This request has already been reviewed");
        }

        if (action === "REJECT") {
            return db.teamRequest.update({
                where: { id: request.id },
                data: {
                    status: "REJECTED",
                    reviewedById: reviewer.id,
                    reviewedAt: new Date(),
                },
                include: {
                    requestedBy: { select: { id: true, name: true, email: true } },
                    reviewedBy: { select: { id: true, name: true, email: true } },
                    challenge: { select: { id: true, name: true } },
                },
            });
        }

// duplicate teams
        const duplicateTeam = await db.team.findFirst({
            where: { challengeId: request.challengeId, name: request.name },
            select: { id: true },
        });
        if (duplicateTeam) {
            throw new Error("A team with that name already exists in this challenge");
        }

// if approved    
        const team = await db.team.create({
            data: {
                name: request.name,
                challengeId: request.challengeId,
            },
        });
        await db.teamMember.create({
            data: {
                userId: request.requestedById,
                teamId: team.id,
            },
        });
        return db.teamRequest.update({
            where: { id: request.id },
            data: {
                status: "APPROVED"                                                                                         ,
                reviewedById: reviewer.id,
                reviewedAt: new Date(),
            },
            include: {
                requestedBy: { select: { id: true, name: true, email: true } },
                reviewedBy: { select: { id: true, name: true, email: true } },
                challenge: { select: { id: true, name: true } },
            },
        });
    });
}

export async function createDepartment({
    name,
    description
}: CreateDepartmentInput) {
    //insert department into db.department.create
    return db.department.create({
        data: {
            name: name,
            description: description || null,
            createdAt: new Date(),
        }
    });
}