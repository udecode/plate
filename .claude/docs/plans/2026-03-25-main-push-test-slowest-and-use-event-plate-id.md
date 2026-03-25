# Main push test failures

## Goal

1. Keep `test:slowest` as a PR-only failure path, not a `main` push blocker.
2. Fix the failing `useEventPlateId` behavior or contract so `main` is green again.

## Scope

1. Inspect hook + spec for `useEventPlateId`.
2. Inspect workflow/scripts that run `test:slowest`.
3. Add or adjust the smallest regression coverage needed.
4. Implement minimal fixes.
5. Run targeted verification plus required build/type/lint checks for touched code.

## Findings

- `useEventPlateId` already matches the documented contract: explicit id, then focus, blur, last, then provider id.
- The main spec failure was test pollution. `EventEditorStore` is global, and the spec only reset it in `afterEach`, so leaked state from earlier tests could beat the provider id on the first assertion.
- `main` push ran `bun check`, and `check` hard-included `pnpm test:slowest`.
- The right boundary is workflow-level: keep `check` as the PR gate, and give push CI a separate script that skips only `test:slowest`.
- Repo-wide lint and both `check:push` / `lint:fix` still fail on unrelated `.codex/skills/claude-permissions-optimizer/scripts/extract-commands.mjs` diagnostics.

## Progress

- [x] Loaded relevant skills.
- [x] Read code and relevant docs.
- [x] Reproduce failures locally.
- [x] Fix hook/spec behavior.
- [x] Fix PR-only `test:slowest` gating.
- [x] Verify.
