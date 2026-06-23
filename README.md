# ReiiKajurawa Studio

A production-ready developer studio website built with Next.js App Router, TypeScript, Tailwind CSS, NextAuth, Prisma, and PostgreSQL.

## Features

- Premium dark SaaS landing page and services page
- Google OAuth, email/password registration, and phone OTP credentials flow
- Secure bcrypt password and OTP hashing
- Prisma schema for users, accounts, sessions, verification tokens, and OTP records
- Protected dashboard and editable profile page
- Toast notifications, loading states, responsive glassmorphism UI, SEO metadata, and custom 404

## Setup

1. Install dependencies: `npm install`
2. Copy environment values: `cp .env.example .env`
3. Add PostgreSQL and Google OAuth credentials in `.env`
4. Generate Prisma client: `npm run prisma:generate`
5. Apply migrations: `npx prisma migrate dev --name init`
6. Start development: `npm run dev`

Phone OTP returns the code in development so the flow is testable locally. Replace that response with Twilio/Firebase delivery before production.
