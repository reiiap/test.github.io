import bcrypt from "bcryptjs";
import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const credentialsSchema = z.object({ email: z.string().email(), password: z.string().min(8) });

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  pages: { signIn: "/login", error: "/login" },
  providers: [
    GoogleProvider({ clientId: process.env.GOOGLE_CLIENT_ID ?? "", clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "", allowDangerousEmailAccountLinking: true }),
    CredentialsProvider({
      id: "credentials",
      name: "Email and password",
      credentials: { email: {}, password: {} },
      async authorize(credentials) {
        const parsed = credentialsSchema.safeParse(credentials);
        if (!parsed.success) return null;
        const user = await prisma.user.findUnique({ where: { email: parsed.data.email.toLowerCase() } });
        if (!user?.passwordHash) return null;
        const valid = await bcrypt.compare(parsed.data.password, user.passwordHash);
        if (!valid) return null;
        if (!user.emailVerified) await prisma.user.update({ where: { id: user.id }, data: { emailVerified: new Date() } });
        return { id: user.id, email: user.email, name: user.name, image: user.image };
      }
    }),
    CredentialsProvider({
      id: "phone-otp",
      name: "Phone OTP",
      credentials: { phone: {}, code: {} },
      async authorize(credentials) {
        const parsed = z.object({ phone: z.string().min(8).max(20), code: z.string().length(6) }).safeParse(credentials);
        if (!parsed.success) return null;
        const otp = await prisma.phoneOtp.findFirst({ where: { phone: parsed.data.phone, consumed: false, expires: { gt: new Date() } }, orderBy: { createdAt: "desc" } });
        if (!otp || !(await bcrypt.compare(parsed.data.code, otp.codeHash))) return null;
        let user = await prisma.user.findUnique({ where: { phone: parsed.data.phone } });
        user ??= await prisma.user.create({ data: { name: `Developer ${parsed.data.phone.slice(-4)}`, phone: parsed.data.phone, provider: "phone" } });
        await prisma.phoneOtp.update({ where: { id: otp.id }, data: { consumed: true, userId: user.id } });
        return { id: user.id, name: user.name, email: user.email, image: user.image };
      }
    })
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) token.id = user.id;
      if (account?.provider === "google" && token.email) {
        const dbUser = await prisma.user.upsert({ where: { email: token.email }, update: { name: token.name, image: token.picture as string | undefined, provider: "google", emailVerified: new Date() }, create: { email: token.email, name: token.name, image: token.picture as string | undefined, provider: "google", emailVerified: new Date() } });
        token.id = dbUser.id;
      }
      if (account?.provider) token.provider = account.provider;
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.provider = (token.provider as string) ?? "email";
      }
      return session;
    }
  },

};
