import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const logs = await prisma.activityLog.findMany({
      include: {
        user: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 100,
    });
    return NextResponse.json(logs);
  } catch {
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
