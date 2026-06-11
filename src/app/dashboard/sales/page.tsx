import prisma from "@/lib/prisma";
import SaleClient from "./SaleClient";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export default async function SalesPage() {
  const session = await getServerSession(authOptions);
  
  const sales = await prisma.operacion.findMany({
    include: { cliente: true, vehiculo: true },
    orderBy: { createdAt: "desc" },
  });

  const vehicles = await prisma.vehiculo.findMany({
    where: { estado: "DISPONIBLE" },
    orderBy: { createdAt: "desc" },
  });

  const customers = await prisma.cliente.findMany({
    orderBy: { createdAt: "desc" },
  });

  return <SaleClient sales={sales} vehicles={vehicles} customers={customers} session={session} />;
}
