# Contributing to Light Is For Everyone

This project uses a branch-intent workflow. In the current checkout, the configured local branches all start from the same base commit, so the branch names describe the intended scope of work more than permanently divergent code lines.

## Core contribution principles

- Inspect before editing.
- Prefer minimal diffs.
- Reuse shared utilities, hooks, components, and service helpers before adding new code.
- Avoid unnecessary dependencies.
- Explain root cause before fixing bugs.
- Keep changes immediately runnable.
- Update docs when setup, routes, roles, moderation behavior, or content models change.

## Branch map

| Branch | Intended purpose | Best fit |
| --- | --- | --- |
| `main` | Stable integration and release branch | Reviewed, validated, deployable work |
| `_life-bug` | Bug-fix branch | Regressions, broken flows, hotfixes, and tightly related follow-up updates |
| `_life-new_feature` | Net-new feature branch | New routes, APIs, schemas, integrations, and product capabilities |
| `_life-ui` | Visual design branch | Styling, component visuals, layout, and presentation polish |
| `_life-ux` | Experience design branch | Navigation, accessibility, clarity, and user-flow improvements |
| `_life-experimental` | Prototype and spike branch | Risky refactors, experiments, and idea validation |

## Rules for every branch

- Keep each branch single-purpose.
- If the work stops matching the branch name, create a new branch instead of widening scope.
- Sync from `main` before final review so behavior is checked against the current baseline.
- Remove temporary debugging code, one-off toggles, and throwaway scaffolding before merge.
- Validate the exact area you changed.
- Update documentation when behavior or contributor expectations change.

## Branch-specific rules

### `main`

- Keep it release-ready and deployable.
- Only merge reviewed and validated work into this branch.
- Do not use it for spikes, temporary debugging, or unfinished experiments.

### `_life-bug`

- Limit changes to bug fixes, regressions, and tightly related tests or docs.
- Start by identifying and documenting the root cause.
- Prefer minimal diffs over opportunistic cleanup.
- Do not bundle feature work, redesign work, or large refactors unless they are required to fix the bug safely.

### `_life-new_feature`

- Use it for new capabilities such as routes, APIs, schemas, integrations, or user-facing features.
- Keep the feature scope explicit and avoid mixing in unrelated cleanup.
- Update permissions, moderation paths, and setup docs when the feature touches them.
- Call out any schema, API, or environment-variable changes in the merge summary.

### `_life-ui`

- Restrict changes to presentation, styling, layout, spacing, and component visuals.
- Avoid changing business logic or data contracts unless the UI cannot function without it.
- Preserve responsive behavior and accessibility states across desktop and mobile layouts.
- Keep any required logic changes as small and isolated as possible.

### `_life-ux`

- Focus on user flow, navigation, information architecture, accessibility, copy clarity, and friction reduction.
- Changes may span multiple screens, but should preserve permissions and core feature intent.
- Validate key journeys such as discovery, sign-in, posting, moderation, and dashboard usage.
- Document any intentional flow changes that contributors should know about.

### `_life-experimental`

- Use it for prototypes, spikes, risky refactors, and idea validation.
- Temporary scaffolding and breaking changes are acceptable here.
- Do not merge experimental work directly to `main` without cleanup and branch re-scoping.
- Promote successful experiments into the correct long-lived branch once the direction is proven.

## Suggested contribution workflow

1. Choose the branch that matches the intended scope of the change.
2. Sync with the latest `main` before final review or merge.
3. Keep commits and diffs focused on one concern.
4. Run the smallest relevant validation for the area you touched.
5. Update docs when setup, behavior, permissions, or branch expectations change.
6. Summarize scope, affected areas, risks, and follow-up work in the merge request or handoff.

## Validation and testing expectations

This repo currently exposes `npm run lint`, `npm run build`, `npm run build:prod`, and `npm run typegen`. There is not currently a dedicated automated `test` script in `package.json`, so contributors should pair command-based validation with targeted manual verification.

- Run `npm run lint` for code changes unless the change is documentation-only.
- Run `npm run build` when you touch routing, config, providers, auth boundaries, or server-integrated features.
- Run `npm run typegen` after Sanity schema changes.
- Manually verify the exact flow you changed.
- If you cannot run a validation step, call that out clearly in the pull request or handoff.

### Branch-aware validation expectations

- **`_life-bug`**
  - Reproduce the bug before the fix when possible.
  - Verify the exact failing scenario after the fix.
  - Confirm that adjacent behavior did not regress.

- **`_life-new_feature`**
  - Validate the primary happy path.
  - Check auth, role gating, empty states, and obvious error handling.
  - Note any new environment variables, schema requirements, or seed/setup steps.

- **`_life-ui`**
  - Check desktop and mobile layouts.
  - Verify hover, focus, disabled, loading, and error states when applicable.
  - Include screenshots or visual notes in the pull request when the change is substantial.

- **`_life-ux`**
  - Walk the full user journey affected by the change.
  - Confirm navigation clarity, copy clarity, accessibility, and reduced-friction flow.
  - Note intended behavior changes so reviewers know what is different by design.

- **`_life-experimental`**
  - Record what was tested and what remains intentionally unvalidated.
  - Identify any known instability, temporary scaffolding, or merge blockers.

## Commit naming rules

- Preferred format: `<type>(<scope>): <summary>`
- Keep the summary short, specific, and written in the imperative mood.
- Keep one concern per commit whenever possible.
- Match the commit `type` to the branch intent when it makes sense.
- Keep generated files, lockfile changes, or schema outputs in the same commit that requires them.

### Recommended commit types

- `fix` for bugs and regressions
- `feat` for new capabilities
- `ui` for visual-only changes
- `ux` for flow or experience improvements
- `refactor` for internal restructuring without behavior change
- `docs` for documentation-only updates
- `chore` for tooling, config, housekeeping, or maintenance
- `perf` for performance work
- `spike` for experiments or prototypes
- `revert` for rollbacks

### Commit examples

- `fix(auth): stop guest redirect loop on protected routes`
- `feat(lessons): add category-aware lesson filtering`
- `ui(sidebar): tighten spacing on mobile nav groups`
- `ux(search): simplify empty-state guidance for new users`
- `docs(contributing): add branch validation expectations`

## Pull request checklist

- [ ] The branch matches the scope of the work.
- [ ] The change stays focused and avoids unrelated edits.
- [ ] Root cause is explained for bug fixes.
- [ ] Validation steps are listed with commands run and manual checks performed.
- [ ] Any unverified areas or known risks are explicitly called out.
- [ ] Screenshots or recordings are included for meaningful UI or UX changes.
- [ ] Documentation is updated if routes, setup, roles, moderation behavior, schemas, or contributor workflow changed.
- [ ] New environment variables, migrations, seed data, or setup steps are documented.
- [ ] No secrets, tokens, or sensitive values are committed.

## Documentation ownership

- `README.md` covers product overview, architecture summary, setup, and branch map.
- `CONTRIBUTING.md` covers contribution rules, branch rules, and workflow.
- `Project_Overview.md` covers deeper engineering and architecture context.
