"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limit";
import { registerSchema } from "@/lib/validation";

type State = { error?: string; success?: string };

export async function registerUser(_: State, formData: FormData): Promise<State> {
  const parsed = registerSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input" };

  const limited = rateLimit(`register:${parsed.data.email}`, 4, 60_000);
  if (!limited.success) return { error: "Too many attempts. Please try again shortly." };

  const existing = await prisma.user.findUnique({ where: { email: parsed.data.email } });
  if (existing) return { error: "An account already exists for this email." };

  const passwordHash = await bcrypt.hash(parsed.data.password, 12);
  await prisma.user.create({
    data: { name: parsed.data.name, email: parsed.data.email, passwordHash },
  });

  redirect("/auth/login?registered=1");
}
