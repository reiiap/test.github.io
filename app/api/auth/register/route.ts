import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
});

export async function POST(req: Request) {
  try {
    const body = await req.json().catch((error) => {
      console.error("[register] Failed to parse JSON body", error);
      return null;
    });

    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Please provide a valid name, email, and 8+ character password." },
        { status: 400 },
      );
    }

    const { name, password } = parsed.data;
    const email = parsed.data.email.toLowerCase();
    const exists = await prisma.user.findUnique({ where: { email } });

    if (exists) {
      return NextResponse.json({ error: "An account with this email already exists." }, { status: 409 });
    }

    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash: await bcrypt.hash(password, 12),
        provider: "email",
        emailVerified: new Date(),
      },
      select: { id: true, name: true, email: true, createdAt: true },
    });

    console.info("[register] User created", { userId: user.id, email: user.email });
    return NextResponse.json({ ok: true, user, message: "Account created successfully." }, { status: 201 });
  } catch (error) {
    console.error("[register] Unexpected registration failure", error);
    return NextResponse.json(
      { error: "Registration failed. Please check your database connection and try again." },
      { status: 500 },
    );
  }
}
