import prisma from "@/lib/prisma";
import VehicleClient from "./VehicleClient";

export const dynamic = "force-dynamic";

export default async function VehiclesPage() {
  const vehicles = await prisma.vehiculo.findMany({
    orderBy: { createdAt: "desc" },
  });

  return <VehicleClient vehicles={vehicles} />;
}
