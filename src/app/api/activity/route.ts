/* eslint-disable @typescript-eslint/no-explicit-any */

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    const whereClause: any = {};
    if (userId) {
      whereClause.userId = userId;
    }
    if (startDate || endDate) {
      whereClause.createdAt = {};
      if (startDate) whereClause.createdAt.gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        whereClause.createdAt.lte = end;
      }
    }

    const logs = await prisma.activityLog.findMany({
      where: whereClause,
      include: {
        user: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 200,
    });
    return NextResponse.json(logs);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch activity logs" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    const log = await prisma.activityLog.create({
      data: {
        userId: body.userId,
        action: body.action,
        details: body.details,
      },
    });
    return NextResponse.json(log);
  } catch {
    return NextResponse.json({ error: "Failed to create activity log" }, { status: 500 });
  }
}
