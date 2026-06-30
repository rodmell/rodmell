/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const { name, username, password, role, phone, ubicacion } = body;

    const dataToUpdate: Record<string, unknown> = {};
    if (name !== undefined) dataToUpdate.name = name;
    if (username !== undefined) dataToUpdate.username = username;
    if (role !== undefined) dataToUpdate.role = role;
    if (phone !== undefined) dataToUpdate.phone = phone;
    if (ubicacion !== undefined) dataToUpdate.ubicacion = ubicacion;
    if (password && password.trim() !== "") {
      dataToUpdate.password = await bcrypt.hash(password, 10);
    }

    const user = await prisma.user.update({
      where: { id },
      data: dataToUpdate,
      select: { id: true, name: true, username: true, role: true, phone: true, ubicacion: true, createdAt: true },
    });

    await prisma.activityLog.create({
      data: {
        userId: (session.user as any).id,
        action: "UPDATE_USER",
        details: `Actualizó datos del usuario: ${user.name} (@${user.username})`
      }
    });

    return NextResponse.json(user);
  } catch {
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { id } = await params;

    // Prevent deleting yourself
    if ((session.user as { id?: string }).id === id) {
      return NextResponse.json({ error: "No podés eliminar tu propio usuario" }, { status: 400 });
    }

    const userToDelete = await prisma.user.findUnique({ where: { id } });
    await prisma.user.delete({ where: { id } });
    
    if (userToDelete) {
      await prisma.activityLog.create({
        data: {
          userId: (session.user as any).id,
          action: "DELETE_USER",
          details: `Eliminó al usuario: ${userToDelete.name} (@${userToDelete.username})`
        }
      });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete user" }, { status: 500 });
  }
}
