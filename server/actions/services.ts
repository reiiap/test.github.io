"use server";

import { ServiceStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { serviceSchema } from "@/lib/validation";

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (session?.user.role !== "ADMIN") throw new Error("Unauthorized");
}

export async function upsertService(formData: FormData) {
  await requireAdmin();

  const parsed = serviceSchema.safeParse({
    id: formData.get("id") || undefined,
    title: formData.get("title"),
    description: formData.get("description"),
    price: formData.get("price") || undefined,
    status: formData.get("status"),
  });

  if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? "Invalid service data");

  const { id, ...data } = parsed.data;
  if (id) {
    await prisma.service.update({ where: { id }, data });
  } else {
    await prisma.service.create({ data });
  }

  revalidatePath("/services");
  revalidatePath("/dashboard/admin");
}

export async function toggleService(id: string) {
  await requireAdmin();
  const service = await prisma.service.findUniqueOrThrow({ where: { id } });
  await prisma.service.update({
    where: { id },
    data: { status: service.status === ServiceStatus.ACTIVE ? ServiceStatus.INACTIVE : ServiceStatus.ACTIVE },
  });
  revalidatePath("/services");
  revalidatePath("/dashboard/admin");
}

export async function deleteService(id: string) {
  await requireAdmin();
  await prisma.service.delete({ where: { id } });
  revalidatePath("/services");
  revalidatePath("/dashboard/admin");
}
