/* eslint-disable @typescript-eslint/no-explicit-any */

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  try {
    const customers = await prisma.cliente.findMany({
      include: {
        operaciones: {
          include: {
            pagos: true,
            cuotas: true
          }
        }
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(customers);
  } catch {
    return NextResponse.json({ error: "Failed to fetch customers" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const body = await req.json();
    const customer = await prisma.cliente.create({
      data: {
        nombreCompleto: body.nombreCompleto,
        dni: body.dni,
        cuil: body.cuil,
        telefono: body.telefono,
        email: body.email,
        direccion: body.direccion,
      },
    });

    await prisma.activityLog.create({
      data: {
        userId: (session.user as any).id,
        action: "CREATE_CUSTOMER",
        details: `Agregó nuevo cliente: ${customer.nombreCompleto} (DNI: ${customer.dni || 'N/A'})`
      }
    });

    return NextResponse.json(customer);
  } catch {
    return NextResponse.json({ error: "Failed to create customer" }, { status: 500 });
  }
}
