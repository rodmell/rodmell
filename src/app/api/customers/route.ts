import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const customers = await prisma.cliente.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(customers);
  } catch {
    return NextResponse.json({ error: "Failed to fetch customers" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
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
    return NextResponse.json(customer);
  } catch {
    return NextResponse.json({ error: "Failed to create customer" }, { status: 500 });
  }
}
