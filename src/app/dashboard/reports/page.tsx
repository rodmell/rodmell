export const dynamic = "force-dynamic";

import prisma from "@/lib/prisma";
import ReportsClient from "./ReportsClient";

export default async function ReportsPage() {
  const sales = await prisma.operacion.findMany({
    orderBy: { createdAt: "asc" },
    include: {
      pagos: true,
      cuotas: true,
      cliente: true,
      vehiculo: true
    }
  });

  const vehicles = await prisma.vehiculo.findMany({
    where: { estado: "DISPONIBLE" }
  });

  const customers = await prisma.cliente.findMany();

  return <ReportsClient sales={sales} vehicles={vehicles} customers={customers} />;
}
