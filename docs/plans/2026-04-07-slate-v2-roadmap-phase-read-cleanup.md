# Slate v2 Roadmap Phase Read Cleanup

> Supporting plan. For current queue and roadmap truth, see [master-roadmap.md](/Users/zbeyens/git/plate-2/docs/slate-v2/master-roadmap.md).

## Goal

- Remove one last stale phase/read cluster from the Slate v2 docs.

## Finding

- `overview.md` still implied the active program phase was Phase 8.
- `phase7-migration-story.md` still described the target audience as adopting an
  experimental v2 surface.
- `final-synthesis.md` and `package-end-state-roadmap.md` still described the
  family ledger with old `not-yet-covered` wording even though the current
  useful split is comparison-only vs intentionally later.

## Patch

- Reframe Phase 8 as landed historical work.
- Reframe the migration target as a proved replacement-candidate surface.
- Align the family-ledger wording with the current public read.

## Verification

- [ ] `pnpm exec prettier --check` on the edited `plate-2` docs
- [x] grep confirms the stale `active program phase is now Phase 8` wording is gone
