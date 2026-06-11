import prisma from "@/lib/prisma";
import CustomerClient from "./CustomerClient";

export default async function CustomersPage() {
  const customers = await prisma.cliente.findMany({
    orderBy: { createdAt: "desc" },
  });

  return <CustomerClient customers={customers} />;
}
