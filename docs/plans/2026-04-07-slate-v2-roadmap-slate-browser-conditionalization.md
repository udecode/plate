# Slate v2 Roadmap Slate-browser Conditionalization

> Supporting plan. For current queue and roadmap truth, see [master-roadmap.md](/Users/zbeyens/git/plate-2/docs/slate-v2/master-roadmap.md).

## Goal

- Remove the last stale "next move" wording that still sounded like active queue
  ownership instead of conditional follow-on.

## Finding

- `final-synthesis.md` still framed Phase 8 package shaping as the
  front-of-queue risk.
- `overview.md`, `slate-browser/overview.md`, and
  `slate-browser/next-system-move.md` still described a concrete next move
  without saying it was conditional.

## Patch

- Reframe the old Phase 8 risk as landed historical work.
- Reframe the Slate-browser next-move docs as targeted follow-on only if that
  package work reopens.

## Verification

- [x] `pnpm exec prettier --check /Users/zbeyens/git/plate-2/docs/slate-v2/archive/final-synthesis.md /Users/zbeyens/git/plate-2/docs/slate-v2/overview.md /Users/zbeyens/git/plate-2/docs/slate-browser/overview.md /Users/zbeyens/git/plate-2/docs/slate-browser/next-system-move.md /Users/zbeyens/git/plate-2/docs/plans/2026-04-07-slate-v2-roadmap-slate-browser-conditionalization.md`
- [x] grep confirms the stale active-next-move wording is gone from the target docs
