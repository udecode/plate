# Two Test Lanes Cleanup

## Goal

Collapse the repo test model to exactly two lanes:

- fast: `*.spec.ts[x]`
- slow: `*.slow.ts[x]`

## Why

The current setup has a hidden path-bucketed slow lane in `test-fast.mjs` on top
of the explicit `*.slow.*` lane. That makes `docx` and package-integration
tests behave like slow tests without actually being named or run like slow
tests.

## Work

1. Remove path-based slow buckets from `tooling/config/test-suites.mjs`.
2. Update fast-lane tooling to stop excluding files by path.
3. Rename current bucketed slow specs to `*.slow.ts[x]`:
   - `packages/docx/src/**`
   - `packages/docx-io/src/**`
   - `apps/www/src/__tests__/package-integration/**`
   - the current `reactHeavy` specs
4. Keep `test:slow` as the single slow-lane runner.
5. Update active testing guidance so “slow” means filename suffix only.
