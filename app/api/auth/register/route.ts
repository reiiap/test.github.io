import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
const schema = z.object({ name: z.string().min(2), email: z.string().email(), password: z.string().min(8) });
export async function POST(req: Request) {
  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "Please provide a valid name, email, and 8+ character password." }, { status: 400 });
  const { name, email, password } = parsed.data;
  const exists = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
  if (exists) return NextResponse.json({ error: "An account with this email already exists." }, { status: 409 });
  await prisma.user.create({ data: { name, email: email.toLowerCase(), passwordHash: await bcrypt.hash(password, 12), provider: "email", emailVerified: new Date() } });
  return NextResponse.json({ ok: true, message: "Account created and email verification simulated for local development." });
}
