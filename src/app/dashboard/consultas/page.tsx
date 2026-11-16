import prisma from "@/lib/prisma";
import ConsultasClient from "./ConsultasClient";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function ConsultasPage() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    redirect("/login");
  }

  const [consultas, users] = await Promise.all([
    prisma.consulta.findMany({
      include: {
        cliente: true,
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.user.findMany({
      select: { id: true, name: true, username: true, role: true },
      orderBy: { name: "asc" },
    }),
  ]);

  return <ConsultasClient consultas={consultas} users={users} session={session} />;
}

