/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
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
    const { medioPago, comprobanteUrl, observaciones } = body;

    const dataToUpdate: any = {};
    if (medioPago !== undefined) dataToUpdate.medioPago = medioPago;
    if (comprobanteUrl !== undefined) dataToUpdate.comprobanteUrl = comprobanteUrl;
    if (observaciones !== undefined) dataToUpdate.observaciones = observaciones;

    const pago = await prisma.pago.update({
      where: { id },
      data: dataToUpdate
    });

    return NextResponse.json(pago);
  } catch (error: any) {
    console.error("Error updating payment:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
