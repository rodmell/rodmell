/* eslint-disable @typescript-eslint/no-explicit-any */

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  try {
    const vehicles = await prisma.vehiculo.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(vehicles);
  } catch {
    return NextResponse.json({ error: "Failed to fetch vehicles" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const body = await req.json();
    const vehicle = await prisma.vehiculo.create({
      data: {
        marca: body.marca,
        modelo: body.modelo,
        anio: parseInt(body.anio),
        dominio: body.dominio,
        chasis: body.chasis,
        color: body.color,
        kilometros: parseInt(body.kilometros),
        precioVenta: parseFloat(body.precioVenta),
        estado: body.estado || "DISPONIBLE",
        descripcion: body.descripcion || null,
        tipo: body.tipo || "AUTO",
        precioCosto: body.precioCosto ? parseFloat(body.precioCosto) : null,
        precioFactura: body.precioFactura ? parseFloat(body.precioFactura) : null,
        precioUSD: body.precioUSD ? parseFloat(body.precioUSD) : null,
        condicion: body.condicion || null,
        combustible: body.combustible || null,
        fotos: body.fotos || [],
      },
    });

    await prisma.activityLog.create({
      data: {
        userId: (session.user as any).id,
        action: "CREATE_VEHICLE",
        details: `Agregó vehículo al inventario: ${vehicle.marca} ${vehicle.modelo} (${vehicle.dominio})`
      }
    });

    return NextResponse.json(vehicle);
  } catch (error) {
    console.error("Error creating vehicle:", error);
    return NextResponse.json({ error: "Failed to create vehicle" }, { status: 500 });
  }
}
