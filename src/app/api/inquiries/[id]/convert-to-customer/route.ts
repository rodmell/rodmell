/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();

    const consulta = await prisma.consulta.findUnique({
      where: { id },
    });

    if (!consulta) {
      return NextResponse.json({ error: "Consulta no encontrada" }, { status: 404 });
    }

    // Datos del cliente a crear
    const nombreCompleto = body.nombreCompleto?.trim() || consulta.nombre;
    const telefono = body.telefono?.trim() || consulta.telefono || "";
    const email = body.email?.trim() || consulta.email || "";
    const dni = body.dni?.trim() || "";
    const cuil = body.cuil?.trim() || "";
    const direccion = body.direccion?.trim() || "";
    const observaciones = body.observaciones?.trim() || `Convertido desde Consulta #${consulta.id.slice(-6).toUpperCase()}${consulta.interes ? ` (Interés: ${consulta.interes})` : ""}`;

    if (!nombreCompleto) {
      return NextResponse.json({ error: "El nombre del cliente es obligatorio" }, { status: 400 });
    }

    // Crear el nuevo cliente en la base de datos
    const nuevoCliente = await prisma.cliente.create({
      data: {
        nombreCompleto,
        telefono: telefono || null,
        email: email || null,
        dni: dni || null,
        cuil: cuil || null,
        direccion: direccion || null,
        observaciones,
      },
    });

    // Actualizar la consulta vinculándola al cliente y marcando estado
    const consultaActualizada = await prisma.consulta.update({
      where: { id },
      data: {
        clienteId: nuevoCliente.id,
        estado: "CLIENTE",
      },
      include: {
        cliente: true,
      },
    });

    return NextResponse.json({
      success: true,
      cliente: nuevoCliente,
      consulta: consultaActualizada,
    });
  } catch (error) {
    console.error("Error al convertir consulta en cliente:", error);
    return NextResponse.json({ error: "Error al convertir consulta en cliente" }, { status: 500 });
  }
}

