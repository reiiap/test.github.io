import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
const schema = z.object({ name: z.string().min(2).max(80), image: z.string().url().optional().or(z.literal("")) });
export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid profile data." }, { status: 400 });
  const user = await prisma.user.update({ where: { id: session.user.id }, data: { name: parsed.data.name, image: parsed.data.image || null } });
  return NextResponse.json({ ok: true, user: { name: user.name, image: user.image } });
}
