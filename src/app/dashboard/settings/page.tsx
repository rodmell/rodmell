import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import SettingsClient from "./SettingsClient";

export default async function SettingsPage() {
  const session = await getServerSession(authOptions);
  const role = (session?.user as { role?: string })?.role;

  if (role !== "MANAGER") {
    redirect("/dashboard");
  }

  const users = await prisma.user.findMany({
    select: { id: true, name: true, username: true, role: true, createdAt: true },
    orderBy: { createdAt: "desc" }
  });

  const logs = await prisma.activityLog.findMany({
    include: { user: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
    take: 50
  });

  return <SettingsClient users={users} logs={logs} />;
}
