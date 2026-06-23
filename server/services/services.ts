import { ServiceStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export function getActiveServices() {
  return prisma.service.findMany({
    where: { status: ServiceStatus.ACTIVE },
    orderBy: { createdAt: "desc" },
  });
}

export function getAllServices() {
  return prisma.service.findMany({ orderBy: { createdAt: "desc" } });
}

export async function getDashboardStats() {
  const [users, services, activeServices] = await Promise.all([
    prisma.user.count(),
    prisma.service.count(),
    prisma.service.count({ where: { status: ServiceStatus.ACTIVE } }),
  ]);

  return { users, services, activeServices };
}
