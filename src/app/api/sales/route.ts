import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const sales = await prisma.operacion.findMany({
      include: {
        cliente: true,
        vehiculo: true,
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(sales);
  } catch {
    return NextResponse.json({ error: "Failed to fetch sales" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const generatedComprobante = "OP-" + Math.random().toString(36).substring(2, 8).toUpperCase();

    const sale = await prisma.operacion.create({
      data: {
        clienteId: body.clienteId,
        vehiculoId: body.vehiculoId,
        vendedorId: body.vendedorId,
        precioVehiculo: parseFloat(body.precioVehiculo),
        formaPago: body.formaPago,
        
        efectivo: body.efectivo !== null ? parseFloat(body.efectivo) : null,
        credito: body.credito !== null ? parseFloat(body.credito) : null,
        porcentajeQuebranto: body.porcentajeQuebranto !== null ? parseFloat(body.porcentajeQuebranto) : null,
        quebranto: body.quebranto !== null ? parseFloat(body.quebranto) : null,
        autoPartePago: body.autoPartePago !== null ? parseFloat(body.autoPartePago) : null,
        detalleAutoPartePago: body.detalleAutoPartePago || null,
        
        total: parseFloat(body.total),
        saldoPendiente: parseFloat(body.saldoPendiente),
        comprobante: generatedComprobante,
      },
    });
    
    // Update vehicle status to VENDIDO
    await prisma.vehiculo.update({
      where: { id: body.vehiculoId },
      data: { estado: "VENDIDO" }
    });
    
    return NextResponse.json(sale);
  } catch {
    return NextResponse.json({ error: "Failed to create sale" }, { status: 500 });
  }
}
