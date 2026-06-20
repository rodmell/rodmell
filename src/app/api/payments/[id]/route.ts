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

    await prisma.activityLog.create({
      data: {
        userId: (session.user as any).id,
        action: "UPDATE_PAYMENT",
        details: `Actualizó pago de $${pago.importe} (ID: ${pago.comprobante})`
      }
    });

    return NextResponse.json(pago);
  } catch (error: any) {
    console.error("Error updating payment:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { id } = await params;
    
    // Find pago to get importe and operacionId
    const pago = await prisma.pago.findUnique({ where: { id } });
    if (!pago) {
      return NextResponse.json({ error: "Pago no encontrado" }, { status: 404 });
    }

    // Delete pago
    await prisma.pago.delete({ where: { id } });

    // Increment saldoPendiente
    await prisma.operacion.update({
      where: { id: pago.operacionId },
      data: {
        saldoPendiente: { increment: pago.importe }
      }
    });

    await prisma.activityLog.create({
      data: {
        userId: (session.user as any).id,
        action: "DELETE_PAYMENT",
        details: `Eliminó pago de $${pago.importe} (ID: ${pago.comprobante})`
      }
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error deleting payment:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
