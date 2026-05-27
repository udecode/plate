# Slate v2 Roadmap Ledger Closeout

> Supporting plan. For current queue and roadmap truth, see [master-roadmap.md](/Users/zbeyens/git/plate-2/docs/slate-v2/master-roadmap.md).

## Goal

- Remove one last stale roadmap cluster from the family ledger.

## Finding

- `replacement-family-ledger.md` still carried an unused `Not Yet Covered`
  status.
- It still listed `code-highlighting` and `custom-placeholder` as outside the
  envelope even though those examples already roll up into covered families.
- It still told readers to keep widening the matrix by default, which conflicts
  with the closed-roadmap posture.

## Patch

- Remove the unused `Not Yet Covered` status from the ledger.
- Reclassify the leftover examples as intentionally-later example debt.
- Change the next-work guidance so the ledger matches the current maintenance
  rule: no default roadmap widening.

## Verification

- [x] `pnpm exec prettier --check /Users/zbeyens/git/plate-2/docs/slate-v2/replacement-family-ledger.md /Users/zbeyens/git/plate-2/docs/plans/2026-04-07-slate-v2-roadmap-ledger-closeout.md`
- [x] grep confirms the stale unused status/default-widening wording is gone from the ledger
