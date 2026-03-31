# Issue 4656 Plan

## Source

- Type: GitHub issue
- Id: `#4656`
- Title: `resetNode does not respect idKey option`
- URL: `https://github.com/udecode/plate/issues/4656`
- Task type: bug

## Goal

Keep the configured node-id `idKey` on reset transforms instead of hard-coding `id`.

## Acceptance

- Reproduce the bug with a focused automated test in `packages/core`
- Fix the transform using existing node-id config
- Verify the touched package with targeted tests, build-first typecheck, and lint

## Findings

- Issue points at `packages/core/src/lib/plugins/slate-extension/transforms/resetBlock.ts`
- Existing node-id tests live under `packages/core/src/lib/plugins/node-id/`
- No existing `resetBlock` test file surfaced from test search
- `docs/solutions/patterns/critical-patterns.md` does not exist in this repo
- One possibly related learning exists:
  - `docs/solutions/developer-experience/2026-03-28-static-demo-values-need-deterministic-ids-and-timestamps-for-hydration.md`

## Plan

1. Read the transform and nearby node-id behavior/tests
2. Add the smallest failing regression test
3. Patch `resetBlock` to respect the configured `idKey`
4. Run targeted tests
5. Run package verification for `packages/core`
6. Evaluate whether this deserves a reusable learning doc

## Progress

- [x] Read issue source of truth
- [x] Load repo instructions and required skills
- [x] Create persistent plan
- [ ] Read code/test context
- [ ] Add failing test
- [ ] Implement fix
- [ ] Verify
- [ ] Evaluate compoundable knowledge

## Notes

- No browser surface
- No PR/issue sync-back unless user asks or task flow explicitly requires it
