# Plite Roadmap Plite-browser Conditionalization

> Supporting plan. For current queue and roadmap truth, see [master-roadmap.md](/Users/zbeyens/git/plate-2/docs/plite/master-roadmap.md).

## Goal

- Remove the last stale "next move" wording that still sounded like active queue
  ownership instead of conditional follow-on.

## Finding

- `final-synthesis.md` still framed Phase 8 package shaping as the
  front-of-queue risk.
- `overview.md`, `plite-browser/overview.md`, and
  `plite-browser/next-system-move.md` still described a concrete next move
  without saying it was conditional.

## Patch

- Reframe the old Phase 8 risk as landed historical work.
- Reframe the Plite-browser next-move docs as targeted follow-on only if that
  package work reopens.

## Verification

- [x] `pnpm exec prettier --check /Users/zbeyens/git/plate-2/docs/plite/archive/final-synthesis.md /Users/zbeyens/git/plate-2/docs/plite/overview.md /Users/zbeyens/git/plate-2/docs/plite-browser/overview.md /Users/zbeyens/git/plate-2/docs/plite-browser/next-system-move.md /Users/zbeyens/git/plate-2/docs/plans/2026-04-07-plite-roadmap-plite-browser-conditionalization.md`
- [x] grep confirms the stale active-next-move wording is gone from the target docs
