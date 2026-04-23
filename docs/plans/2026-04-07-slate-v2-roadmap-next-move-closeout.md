# Slate v2 Roadmap Next-Move Closeout

> Supporting plan. For current queue and roadmap truth, see [master-roadmap.md](/Users/zbeyens/git/plate-2/docs/slate-v2/master-roadmap.md).

## Goal

- Remove the last stale "next move" sections that still pointed people back into
  old Phase 8 roadmap language.

## Finding

- `phase6-hardening.md` still ended with "Current active move after that:
  Phase 8 package API shaping".
- `cohesive-program-plan.md` still had an `Immediate Next Step` section that
  told readers to run active work through Phase 8.

## Patch

- Reframe those sections around the current read:
  - Phase 8/9/10 roadmap follow-on is landed historical work
  - default next work is implementation or shipping
  - further roadmap work is selective only when it changes the claim

## Verification

- [x] `pnpm exec prettier --check /Users/zbeyens/git/plate-2/docs/slate-v2/archive/phase6-hardening.md /Users/zbeyens/git/plate-2/docs/slate-v2/archive/cohesive-program-plan.md /Users/zbeyens/git/plate-2/docs/plans/2026-04-07-slate-v2-roadmap-next-move-closeout.md`
- [x] grep confirms the stale Phase 8 next-move wording is gone from the target docs
