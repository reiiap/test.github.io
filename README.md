# ReiiKajurawa Development Service

Production-grade SaaS foundation for a real development agency, built with the Next.js App Router, TypeScript, TailwindCSS, Prisma, PostgreSQL, NextAuth credentials auth, bcryptjs, Zod, and React Hook Form.

## Core routes

- `/` marketing homepage with DB-driven services preview
- `/services` active service catalog from PostgreSQL
- `/about` agency positioning and delivery model
- `/contact` project inquiry page
- `/auth/register` secure account registration
- `/auth/login` credentials login
- `/dashboard` protected user dashboard
- `/dashboard/admin` admin-only services and user management

## Security and data

- Credentials authentication with NextAuth.js
- bcryptjs password hashing with 12 salt rounds
- Zod validation for auth and service mutations
- In-memory rate limiting for login and registration MVP protection
- Middleware protection for all `/dashboard` routes
- Admin-only protection for `/dashboard/admin`
- PostgreSQL schema managed by Prisma migrations

## Default seed

The seed script creates an admin account and sample services:

- Email: `admin@reii.com`
- Password: `Admin123!`

Run:

```bash
npm run seed
```

## Environment variables

Copy `.env.example` to `.env` and set:

```bash
DATABASE_URL=
NEXTAUTH_SECRET=
NEXTAUTH_URL=
```

## Local development

```bash
npm install
npm run prisma:deploy
npm run seed
npm run dev
```

## Production deployment on Vercel

The project includes `vercel.json` with:

- install command: `npm install`
- build command: `npm run vercel-build`

`npm run vercel-build` executes:

```bash
prisma generate && prisma migrate deploy && next build
```

Set `DATABASE_URL`, `NEXTAUTH_SECRET`, and `NEXTAUTH_URL` in Vercel before deploying.
