# Production migration repair note

## Current blocker

Vercel is failing during `prisma migrate deploy` with Prisma error `P3009` because the production database has a failed migration record for `20260623225000_saas_foundation` that started at `2026-06-23 23:16:28.323415 UTC`.

## Repository findings

The repository currently contains these Prisma migrations only:

- `20260623172000_init`
- `20260623212000_platform_models`
- `20260801193000_conversion_jobs`
- `20260801195500_coin_wallet`

There is no local migration directory named `20260623225000_saas_foundation`, and Git history in this checkout does not contain that migration file. Because the failed migration SQL is absent and no production `DATABASE_URL` is available in this environment, the failed migration cannot be safely marked as applied or rolled back from this checkout.

## Safe production procedure

Do **not** run `prisma migrate reset`, drop the database, delete `_prisma_migrations` rows, or run destructive SQL.

Before any repair, inspect production with read-only checks and capture:

1. The `_prisma_migrations` row for `20260623225000_saas_foundation`, including `logs`, `started_at`, `finished_at`, `rolled_back_at`, and `applied_steps_count`.
2. Whether every object that migration was supposed to create or alter exists in production.
3. Row counts for existing user, auth, order, payment, Coin, and other application tables.
4. The exact SQL from the missing `20260623225000_saas_foundation/migration.sql` migration, recovered from the deployment artifact, prior branch, or Vercel build source.

Only after that inspection should production be repaired:

- If the migration made no relevant changes, fix the underlying schema/data issue and rerun `prisma migrate deploy`.
- If it partially applied, create or run only idempotent corrective SQL for the missing pieces, then use `prisma migrate resolve --applied 20260623225000_saas_foundation` only after the schema matches the intended migration.
- If it fully applied but Prisma recorded a failure, use `prisma migrate resolve --applied 20260623225000_saas_foundation` only after confirming schema equivalence and preserving all data.
- If production differs from the migration assumptions, correct the specific difference with the minimum non-destructive operation, then rerun or resolve based on the verified state.

## Deployment commands after repair

Run the same deployment sequence used by Vercel after production migration history is repaired:

```sh
npm install
npx prisma generate
npx prisma migrate deploy
npm run build
```

Also run any available project checks from `package.json`, such as `npm run lint` and the defined test scripts.
