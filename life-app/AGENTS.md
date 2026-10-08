# LIFE application instructions

Read `../AGENTS.md`, `README.md`, and `CONTRIBUTING.md` first.

## Boundaries

- Work from this directory for application installs and commands.
- Main uses Next.js App Router, React, Clerk authentication, and Sanity data.
- Keep database credentials and admin data operations on the server.
- Preserve role checks, public/guest behavior, webhook signature validation,
  and maintenance-mode behavior when changing auth or persistence.
- Match framework changes to the version installed in this application.
  Read packaged documentation when present, otherwise official version-specific
  documentation. Do not assume a middleware-to-proxy rename is behavior-neutral.

## Migration state

- Read current PRs and the application README before backend work.
- PR #8 introduces a LOY foundation; it does not remove Clerk/Sanity or finish
  the migration. PR #7 contains a separate Payload migration proposal.
- Preserve recoverable data and identity mappings through staged migration.
  Do not delete old providers or run production migration scripts on inference.

## Primary services and optional backups

- Target architecture: LOY-owned services provide core authentication, sessions,
  authorization, application data, and the deployable application runtime.
- Clerk, Sanity, and other replaceable providers may remain as optional backup
  adapters for planned maintenance or rollback. Their absence must not prevent
  the primary application from starting or serving its core workflows.
- Prioritize removing mandatory provider imports, configuration requirements,
  and request-path calls through explicit service interfaces and selected adapters.
- Separate current implementation from this target. Installing LOY packages alone
  does not establish an independent identity system or complete migration.
- Use stable application-owned user IDs and explicit external identity mappings.
  Do not equate matching email addresses with verified account ownership.
- Backup activation must be deliberate and documented. Define which deployment,
  identity records, data snapshot, and write owner are active. Prevent divergent
  writes and verify reconciliation before returning to the primary path.
- A backup identity provider cannot repair an incompatible application deployment.
  Plan a known-good deployment and data compatibility for feature maintenance.
- Verify core workflows with backup credentials absent and backup services
  unavailable: startup, public reads, sign-in/session lifecycle, permitted writes,
  role enforcement, administration, and maintenance controls.
- During the transition preserve existing providers until the replacement paths
  pass verification; outages must never bypass authentication or authorization.

## Current validation limitations

Reviewed October 8, 2026, against main at `f37cfbe`. Recheck these facts when
tooling changes; this snapshot is not an instruction to retain broken tooling.

- At the reviewed baseline, `lint` invokes removed `next lint` and builds skip
  TypeScript errors. Do not label those as complete release validation.
- Vercel installs with pnpm; both pnpm and npm lockfiles exist. Use the reviewed
  package-manager decision and keep lockfiles consistent with that decision.
- No dedicated automated test script is defined at the reviewed baseline.
- Documentation-only changes need link and factual consistency checks.
  Runtime changes need relevant type/lint/build checks and targeted smoke tests.
- Do not seed data, promote users to admin, or exercise write routes against
  production as part of ordinary verification.

## Handoff
Record commit/ref, scope, changed files, validation evidence, known failures,
runtime/config needs, rollout/rollback needs, and the exact next action.
