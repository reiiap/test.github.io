import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");
  const admin = await prisma.user.findUnique({ where: { id: session.user.id }, select: { id: true, role: true, name: true, email: true } });
  if (admin?.role !== "ADMIN") redirect("/dashboard");
  return admin;
}

export function idr(amount: number) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(amount);
}
