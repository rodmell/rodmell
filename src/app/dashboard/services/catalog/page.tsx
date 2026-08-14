import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import CatalogClient from "./CatalogClient";

export const dynamic = "force-dynamic";

export default async function CatalogPage() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) redirect("/login");

  const catalog = await prisma.catalogoServicio.findMany({
    orderBy: { tipo: "asc" },
  });

  return (
    <CatalogClient catalog={catalog} />
  );
}
