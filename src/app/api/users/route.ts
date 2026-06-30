/* eslint-disable @typescript-eslint/no-explicit-any */

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        username: true,
        role: true,
        phone: true,
        ubicacion: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(users);
  } catch {
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const body = await req.json();
    
    const existing = await prisma.user.findUnique({
      where: { username: body.username }
    });

    if (existing) {
      return NextResponse.json({ error: "Username already exists" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(body.password, 10);

    const user = await prisma.user.create({
      data: {
        name: body.name,
        username: body.username,
        password: hashedPassword,
        role: body.role || "SELLER",
        phone: body.phone || null,
        ubicacion: body.ubicacion || "CASA_CENTRAL",
      },
    });

    await prisma.activityLog.create({
      data: {
        userId: (session.user as any).id,
        action: "CREATE_USER",
        details: `Creó un nuevo usuario: ${user.name} (@${user.username}) con rol ${user.role}`
      }
    });

    return NextResponse.json(user);
  } catch {
    return NextResponse.json({ error: "Failed to create user" }, { status: 500 });
  }
}
