/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const inquiries = await prisma.consulta.findMany({
      include: {
        cliente: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(inquiries);
  } catch (error) {
    console.error("Error al obtener consultas:", error);
    return NextResponse.json({ error: "Error al obtener consultas" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const body = await req.json();
    const { nombre, telefono, email, quienAtendio, interes, observaciones } = body;

    if (!nombre || !nombre.trim()) {
      return NextResponse.json({ error: "El nombre es obligatorio" }, { status: 400 });
    }

    const defaultAtendio = quienAtendio?.trim() || session.user.name || "Sin asignar";

    const consulta = await prisma.consulta.create({
      data: {
        nombre: nombre.trim(),
        telefono: telefono?.trim() || null,
        email: email?.trim() || null,
        quienAtendio: defaultAtendio,
        interes: interes?.trim() || null,
        observaciones: observaciones?.trim() || null,
        estado: "PENDIENTE",
      },
    });

    return NextResponse.json(consulta, { status: 201 });
  } catch (error) {
    console.error("Error al crear consulta:", error);
    return NextResponse.json({ error: "Error al crear la consulta" }, { status: 500 });
  }
}

