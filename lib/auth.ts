import { PrismaAdapter } from "@next-auth/prisma-adapter";
import bcrypt from "bcryptjs";
import type { NextAuthOptions, Profile } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

const phoneOtpSchema = z.object({
  phone: z.string().min(8).max(20),
  code: z.string().length(6),
});

const googleClientId = process.env.GOOGLE_CLIENT_ID;
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;

function getProfileEmail(profile?: Profile): string | undefined {
  return typeof profile?.email === "string" ? profile.email : undefined;
}

if (!googleClientId || !googleClientSecret) {
  console.warn(
    "[auth] Google OAuth is not configured. Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in Vercel and local .env.",
  );
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  secret: process.env.NEXTAUTH_SECRET,
  pages: { signIn: "/login", error: "/login" },
  providers: [
    GoogleProvider({
      clientId: googleClientId ?? "",
      clientSecret: googleClientSecret ?? "",
      allowDangerousEmailAccountLinking: true,
    }),
    CredentialsProvider({
      id: "credentials",
      name: "Email and password",
      credentials: { email: {}, password: {} },
      async authorize(credentials) {
        const parsed = credentialsSchema.safeParse(credentials);
        if (!parsed.success) {
          console.warn("[auth:credentials] Invalid credentials payload", parsed.error.flatten());
          return null;
        }

        const email = parsed.data.email.toLowerCase();
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user?.passwordHash) {
          console.warn("[auth:credentials] User not found or has no password", { email });
          return null;
        }

        const valid = await bcrypt.compare(parsed.data.password, user.passwordHash);
        if (!valid) {
          console.warn("[auth:credentials] Invalid password", { email });
          return null;
        }

        if (!user.emailVerified) {
          await prisma.user.update({ where: { id: user.id }, data: { emailVerified: new Date() } });
        }

        return { id: user.id, email: user.email, name: user.name, image: user.image };
      },
    }),
    CredentialsProvider({
      id: "phone-otp",
      name: "Phone OTP",
      credentials: { phone: {}, code: {} },
      async authorize(credentials) {
        const parsed = phoneOtpSchema.safeParse(credentials);
        if (!parsed.success) {
          console.warn("[auth:phone-otp] Invalid OTP payload", parsed.error.flatten());
          return null;
        }

        const otp = await prisma.phoneOtp.findFirst({
          where: { phone: parsed.data.phone, consumed: false, expires: { gt: new Date() } },
          orderBy: { createdAt: "desc" },
        });

        if (!otp || !(await bcrypt.compare(parsed.data.code, otp.codeHash))) {
          console.warn("[auth:phone-otp] Invalid or expired OTP", { phone: parsed.data.phone });
          return null;
        }

        let user = await prisma.user.findUnique({ where: { phone: parsed.data.phone } });
        user ??= await prisma.user.create({
          data: { name: `Developer ${parsed.data.phone.slice(-4)}`, phone: parsed.data.phone, provider: "phone" },
        });

        await prisma.phoneOtp.update({ where: { id: otp.id }, data: { consumed: true, userId: user.id } });
        return { id: user.id, name: user.name, email: user.email, image: user.image };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, account, profile }) {
      if (user?.id) token.id = user.id;

      if (account?.provider === "google") {
        const email = token.email ?? getProfileEmail(profile);
        if (!email) {
          console.error("[auth:google] Google profile did not include an email address");
          return token;
        }

        const dbUser = await prisma.user.upsert({
          where: { email },
          update: {
            name: token.name,
            image: typeof token.picture === "string" ? token.picture : undefined,
            provider: "google",
            emailVerified: new Date(),
          },
          create: {
            email,
            name: token.name,
            image: typeof token.picture === "string" ? token.picture : undefined,
            provider: "google",
            emailVerified: new Date(),
          },
        });
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
    },
    async signIn({ account, profile }) {
      if (account?.provider === "google" && !getProfileEmail(profile)) {
        console.error("[auth:google] Rejecting sign-in because Google did not return email");
        return false;
      }
      return true;
    },
  },
  events: {
    async signIn({ user, account }) {
      console.info("[auth:event:signIn] User signed in", { userId: user.id, provider: account?.provider });
    },
  },
  logger: {
    error(code, metadata) {
      console.error("[next-auth:error]", code, metadata);
    },
    warn(code) {
      console.warn("[next-auth:warn]", code);
    },
    debug(code, metadata) {
      if (process.env.NODE_ENV !== "production") console.debug("[next-auth:debug]", code, metadata);
    },
  },
};
