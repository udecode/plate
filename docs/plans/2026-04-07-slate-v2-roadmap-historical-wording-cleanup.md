# Slate v2 Roadmap Historical Wording Cleanup

> Supporting plan. For current queue and roadmap truth, see [master-roadmap.md](/Users/zbeyens/git/plate-2/docs/slate-v2/master-roadmap.md).

## Goal

- Remove two leftover historical phrases that still sounded more live than they
  should.

## Finding

- `core-foundation-spec.md` still called the transaction seam "experimental"
  even though the public transaction seam is already a real current surface.
- `slate-batch-engine.md` still said "the right next slice" without marking it
  as historical.

## Patch

- Reframe the core-foundation seam as provisional instead of experimental.
- Reframe the batch-engine wording as the right slice at that point.

## Verification

- [x] `pnpm exec prettier --check /Users/zbeyens/git/plate-2/docs/slate-v2/core-foundation-spec.md /Users/zbeyens/git/plate-2/docs/slate-v2/references/slate-batch-engine.md /Users/zbeyens/git/plate-2/docs/plans/2026-04-07-slate-v2-roadmap-historical-wording-cleanup.md`
- [x] grep confirms the stale historical wording is gone from the target docs
