import prisma from "@/lib/prisma";
import VehicleClient from "./VehicleClient";

export default async function VehiclesPage() {
  const vehicles = await prisma.vehiculo.findMany({
    orderBy: { createdAt: "desc" },
  });

  return <VehicleClient vehicles={vehicles} />;
}
