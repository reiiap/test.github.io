# ReiiKajurawa Studio

A production-ready developer studio website built with Next.js App Router, TypeScript, Tailwind CSS, NextAuth, Prisma, and PostgreSQL.

## Features

- Premium dark SaaS landing page and services page
- Google OAuth, email/password registration, and phone OTP credentials flow
- Secure bcrypt password and OTP hashing
- Prisma schema and migration for users, accounts, sessions, verification tokens, and OTP records
- Protected dashboard and editable profile page
- Toast notifications, loading states, responsive glassmorphism UI, SEO metadata, and custom 404

## Local setup

1. Install dependencies: `npm install`
2. Copy environment values: `cp .env.example .env`
3. Add PostgreSQL and Google OAuth credentials in `.env`
4. Apply migrations: `npx prisma migrate dev --name init`
5. Start development: `npm run dev`

Phone OTP returns the code in development so the flow is testable locally. Replace that response with Twilio/Firebase delivery before production.

## Prisma/Vercel compatibility note

This project intentionally pins `prisma` and `@prisma/client` to the same Prisma 6 version. Do not change either package back to `latest` unless you also update the generated client import strategy, because newer major Prisma releases can change how the client is generated/imported and may make `import { PrismaClient } from "@prisma/client"` fail during Vercel type checking.

## Deploy to Vercel

1. Push this repository to GitHub and import it in Vercel as a Next.js project.
2. Create a PostgreSQL database, for example Vercel Postgres/Neon/Supabase, and set `DATABASE_URL` in Vercel Project Settings → Environment Variables.
3. Set `NEXTAUTH_SECRET` to a strong random value, for example `openssl rand -base64 32`.
4. Set `NEXTAUTH_URL` to your production URL, for example `https://your-project.vercel.app` or your custom domain.
5. Create Google OAuth credentials in Google Cloud Console and add this authorized redirect URI: `https://your-domain.com/api/auth/callback/google`.
6. Add `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` in Vercel.
7. Deploy. Vercel runs `npm run vercel-build`, which executes `prisma generate`, `prisma migrate deploy`, and then `next build`, so the initial auth tables are created before the app starts handling requests.

For manual production migration, run `npm run prisma:deploy` with the same `DATABASE_URL` configured in Vercel. The default local `npm run build` still runs `prisma generate && next build` without mutating a database, while the Vercel build command runs migrations automatically. `postinstall` also generates the Prisma client so serverless functions have the generated client available. The project pins Node to `20.x` for Vercel and keeps `prisma` / `@prisma/client` on the same version.
