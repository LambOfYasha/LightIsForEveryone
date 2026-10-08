# Repository instructions

## Scope and starting point

- These instructions apply across this repository. Read any more specific
  AGENTS.md in the directory being changed as well.
- The LIFE application lives in `life-app/`; the root has no package.json.
- `clerk-nextjs/` and its nested copy are separate starter applications.
  Do not reorganize or remove them without an approved scope.
- Read the application README and CONTRIBUTING before changing LIFE.
- Record the branch and base commit; preserve unrelated local changes.

## Working agreement

- Inspect first; reuse existing helpers and keep each change focused.
- For bugs, record the trigger, expected/actual behavior, and root cause.
- Separate proposed architecture from implemented and deployed behavior.
- A documentation draft awaiting review does not authorize implementation.
  Once a bounded change is approved, perform its necessary work within scope.
- Merge, deployment, production migrations, destructive cleanup, and credential
  changes require authorization covering the particular action.
- Do not commit secrets or paste their values into logs or review reports.
- Preserve generated Next.js agent-guidance blocks in directories that have them.

## Validation and handoff

- Use the scripts and tool versions verified for the selected application.
- A green build is insufficient when type checks are bypassed or lint is absent.
- Report commands actually run, results, skipped checks, and remaining defects.
- Update operational documentation when behavior, setup, or contracts change.
- Finish with changed files, evidence, unresolved items, and the next action.

## Draft management

- Give each reviewable proposal a stable ID, version, repository, base commit,
  scope, status, validation plan, and links to related work.
- Human decisions apply to an exact version and scope.
- If rejected, retain reasons and let the developer revise the same proposal.
  Keep prior versions available; never convert rejection into approval.
- After approval, refresh the programming draft inventory and identify overlaps,
  blocked work, superseded candidates, and concrete next actions.
