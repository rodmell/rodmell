import prisma from "@/lib/prisma";
import CustomerClient from "./CustomerClient";

export const dynamic = "force-dynamic";

export default async function CustomersPage() {
  const customers = await prisma.cliente.findMany({
    include: {
      operaciones: {
        include: {
          pagos: true,
          cuotas: true,
          vehiculo: true,
          vendedor: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return <CustomerClient customers={customers} />;
}
