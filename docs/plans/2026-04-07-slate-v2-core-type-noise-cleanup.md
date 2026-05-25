---
date: 2026-04-07
topic: slate-v2-core-type-noise-cleanup
status: in_progress
---

# Slate v2 Core Type Noise Cleanup

> Supporting plan. For current queue and roadmap truth, see [master-roadmap.md](/Users/zbeyens/git/plate-2/docs/slate-v2/master-roadmap.md).

## Goal

Remove the long-standing TypeScript / `rpt2` warning debt in the current
`slate` package so the core surface stops looking half-broken during rollup
builds.

## Scope

1. Inspect the current warning set in:
   - `transforms-node.ts`
   - `transforms-text.ts`
   - `transforms-selection.ts`
   - `range-ref-transform.ts`
2. Replace bad unions and `unknown` property reads with real narrowing.
3. Re-run targeted verification and the `slate` rollup build.

## Progress

- plan created
- replaced the noisy `Extract<>` / `'text' in node` pseudo-narrowing with real
  `Text` / `Point` / `Range` guards
- cleaned the long-standing warning debt in:
  - `transforms-node.ts`
  - `transforms-text.ts`
  - `transforms-selection.ts`
  - `range-ref-transform.ts`
  - follow-on cleanup in `editor.ts`
- reran the targeted `slate` tests, lint, prettier, and rollup build

## Findings

- the rollup `rpt2` spew was mostly bad union narrowing, not deep logic debt
- once the helpers used explicit `Text` / `Point` / `Range` guards, the build
  stopped reporting those files as half-broken
- `ROLLUP_PACKAGES=slate yarn build:rollup` is now clean again
