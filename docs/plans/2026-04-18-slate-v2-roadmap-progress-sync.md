---
date: 2026-04-18
topic: slate-v2-roadmap-progress-sync
status: active
---

# Goal

Sync `docs/slate-v2/**` with the actual `../slate-v2` state after the Bun hard
cut and the TypeScript 6 upgrade.

# Facts

- Live roadmap docs still describe the April 16 `pnpm` snapshot.
- `../slate-v2` now runs on Bun, ships `bun.lock`, and no longer has `.npmrc`,
  `pnpm-workspace.yaml`, or `pnpm-lock.yaml`.
- Root `package.json` now pins `packageManager: bun@1.3.12` and
  `typescript: 6.0.3`.
- Bun test discovery is owned by root `bunfig.toml`.
- Runtime/package recovery still has not started; the stale part is the
  tranche 1/2 infrastructure and compatibility description.

# Plan

1. Read every progress-owning `docs/slate-v2` file that still mentions the old
   root graph.
2. Update the roadmap stack to describe the live Bun + TS6 baseline honestly.
3. Re-read the touched docs and grep for stale `pnpm` claims inside
   `docs/slate-v2`.
