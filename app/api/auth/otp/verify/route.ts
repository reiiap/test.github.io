import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const schema = z.object({ phone: z.string().min(8).max(20), code: z.string().length(6) });

export async function POST(req: Request) {
  try {
    const body = await req.json().catch((error) => {
      console.error("[otp:verify] Failed to parse JSON body", error);
      return null;
    });
    const parsed = schema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: "Invalid OTP request." }, { status: 400 });

    const otp = await prisma.phoneOtp.findFirst({
      where: { phone: parsed.data.phone, consumed: false, expires: { gt: new Date() } },
      orderBy: { createdAt: "desc" },
    });
    if (!otp || !(await bcrypt.compare(parsed.data.code, otp.codeHash))) {
      return NextResponse.json({ error: "OTP is invalid or expired." }, { status: 401 });
    }

    let user = await prisma.user.findUnique({ where: { phone: parsed.data.phone } });
    user ??= await prisma.user.create({
      data: { name: `Developer ${parsed.data.phone.slice(-4)}`, phone: parsed.data.phone, provider: "phone" },
    });
    await prisma.phoneOtp.update({ where: { id: otp.id }, data: { consumed: true, userId: user.id } });

    console.info("[otp:verify] Phone verified", { userId: user.id, phone: parsed.data.phone });
    return NextResponse.json({ ok: true, userId: user.id, message: "Phone verified." });
  } catch (error) {
    console.error("[otp:verify] Unexpected OTP verification failure", error);
    return NextResponse.json({ error: "Failed to verify OTP." }, { status: 500 });
  }
}
