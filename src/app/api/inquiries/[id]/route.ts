/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();

    const updated = await prisma.consulta.update({
      where: { id },
      data: {
        nombre: body.nombre?.trim(),
        telefono: body.telefono?.trim() || null,
        email: body.email?.trim() || null,
        quienAtendio: body.quienAtendio?.trim() || null,
        interes: body.interes?.trim() || null,
        observaciones: body.observaciones?.trim() || null,
        estado: body.estado || undefined,
        clienteId: body.clienteId || undefined,
      },
      include: {
        cliente: true,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error al actualizar consulta:", error);
    return NextResponse.json({ error: "Error al actualizar consulta" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { id } = await params;
    await prisma.consulta.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error al eliminar consulta:", error);
    return NextResponse.json({ error: "Error al eliminar consulta" }, { status: 500 });
  }
}

