---
title: Yjs Testing Execution
type: testing
date: 2026-03-22
status: active
---

# Yjs Testing Execution

## Goal

Implement the March 22 Yjs testing plan with:

- fast `*.spec.ts` coverage that stays in `bun test`
- opt-in slow collaboration coverage behind `pnpm test:slow -- packages/yjs/src`

## Phases

- [completed] Phase 1: inspect Yjs seams, repo test patterns, and script wiring
- [completed] Phase 2: add fast deterministic and plugin-contract specs
- [completed] Phase 3: add slow collaboration harness, fixtures, and `pnpm test:slow -- packages/yjs/src`
- [in_progress] Phase 4: extend the slow lane with upstream-driven reconnect and ordering cases
- [pending] Phase 5: run targeted tests, slow suite, build, typecheck, lint

## Notes

- No `/react` coverage.
- No browser lane.
- Slow Yjs collaboration tests must not run as part of `bun test`.
- Use upstream `slate-yjs` and `yjs` for invariants, not for blind file mirroring.

## Findings

- `tooling/scripts/test-fast.mjs` only discovers `*.spec.ts[x]`, so `*.slow.ts` is enough to keep the slow lane out of default discovery.
- Bun ships `mock.module(...)`, and the local `bun-types` docs confirm it is available in this repo.
- `BaseYjsPlugin` is the core risk surface: provider instantiation, sync wait, seed behavior, and cleanup.
- `withPlateYjs` is worth direct coverage because it has real branching and composition order.
- Upstream `slate-yjs` mostly validates operation-level Slate/Yjs correctness and should not be mirrored in this wrapper package.
- Upstream `yjs` late-sync and pending-update cases are worth adapting at the provider-sync layer, which justified the disconnected-concurrent and out-of-order slow fixtures.

## Verification Target

- targeted fast Yjs specs
- `bun test packages/yjs/src`
- `pnpm test:slow -- packages/yjs/src`
- `pnpm install`
- `pnpm turbo build --filter=./packages/yjs`
- `pnpm turbo typecheck --filter=./packages/yjs`
- `pnpm lint:fix`
