import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import ServicesClient from "./ServicesClient";

export const dynamic = "force-dynamic";

export default async function ServicesPage() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) redirect("/login");

  const [servicios, clientes, operaciones, catalogServices] = await Promise.all([
    prisma.servicio.findMany({
      include: {
        cliente: true,
        operacion: { include: { vehiculo: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.cliente.findMany({ orderBy: { nombreCompleto: "asc" } }),
    prisma.operacion.findMany({
      include: { vehiculo: true, cliente: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.catalogoServicio.findMany({ orderBy: { tipo: "asc" } }),
  ]);

  return (
    <ServicesClient
      servicios={servicios}
      clientes={clientes}
      operaciones={operaciones}
      catalogServices={catalogServices}
    />
  );
}
