import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const schema = z.object({ phone: z.string().min(8).max(20) });

export async function POST(req: Request) {
  try {
    const body = await req.json().catch((error) => {
      console.error("[otp:request] Failed to parse JSON body", error);
      return null;
    });
    const parsed = schema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: "Enter a valid phone number." }, { status: 400 });

    const code = String(Math.floor(100000 + Math.random() * 900000));
    await prisma.phoneOtp.create({
      data: { phone: parsed.data.phone, codeHash: await bcrypt.hash(code, 10), expires: new Date(Date.now() + 10 * 60 * 1000) },
    });

    console.info("[otp:request] OTP generated", { phone: parsed.data.phone });
    return NextResponse.json({
      ok: true,
      devOtp: process.env.NODE_ENV === "production" ? undefined : code,
      message: "OTP generated. In production, send this via Twilio/Firebase instead of returning it.",
    });
  } catch (error) {
    console.error("[otp:request] Unexpected OTP generation failure", error);
    return NextResponse.json({ error: "Failed to generate OTP." }, { status: 500 });
  }
}
