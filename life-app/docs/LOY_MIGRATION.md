# LIFE → LOY storage migration

This branch starts LOY toolkit dogfooding without changing the production data path. Clerk, Sanity, and Vercel remain the active authentication, editorial, and hosting path until the replacement stores pass their migration gates.

## Package pins

LIFE currently consumes the unreleased package commits directly so the install is reproducible:

- `@lambofyasha/loy-dual-store` at `d953c542b5a2d121ceec9305594425e5f06a8a4b`
- `@lambofyasha/loy-webapp-essentials` at `6fd614b39fbcbb4e013603e78b0c8de658e428eb`

Publish signed, versioned package releases before making these dependencies part of a customer-facing starter template.

## Ownership contract

| Domain | Transitional source of truth | Target owner | Migration rule |
| --- | --- | --- | --- |
| Blogs, lessons, pages, tags, media, site settings, CMS users | Sanity | Postgres/editorial service | One-time export plus verified reconciliation; do not dual-write by default |
| Profiles, communities, posts, comments, favorites, reports, notifications, tickets, feedback | Sanity | MongoDB | Backfill first, then switch one bounded feature at a time |
| Sign-in and sessions | Clerk | Clerk during the transition | Keep the Clerk user ID as the cross-store identity reference |
| Hosting and runtime | Vercel | Vercel initially | Keep the Node-only store boundary compatible with the current deployment |

The dual-store package does not create Payload tables or run editorial migrations. `DATABASE_URI` remains reserved for a future Payload-owned SQL integration. Set `POSTGRES_URL` only for a deliberately owned raw-SQL surface.

## Environment contract

The new server boundary is dormant unless `MONGO_URL` is set.

```env
MONGO_URL=mongodb://...
MONGO_DB=life
# Optional raw SQL owned by the application, not Payload:
# POSTGRES_URL=postgresql://...
```

Use `/api/loy/health` as an authenticated `admin`/`dev` check. It returns `enabled: false` when the new store is not configured, so the existing deployment remains healthy while the migration is prepared.

## Runtime rules

- Import `lib/loy/dual-store` only from Node.js route handlers or server code.
- Never open MongoDB from `middleware.ts` or an Edge runtime.
- Do not put Sanity CDN URLs into the target media fields; move media to storage controlled by the application first.
- Keep Clerk IDs as strings in both stores; do not create cross-database foreign keys.
- Do not delete Sanity documents or remove the old adapters until export, replay, reconciliation, rollback, and restore checks are documented and tested.

## Promotion gates

1. Configure isolated MongoDB and, separately, the future editorial SQL service.
2. Run the health check and package tests against non-production data.
3. Build one read-only community projection and compare it with Sanity.
4. Add a replayable backfill with counts, checksums, and a rollback plan.
5. Switch one feature behind a flag, monitor errors, and preserve the Sanity fallback.
6. Only after a verified rollback window decide whether any Sanity content can be retired.
