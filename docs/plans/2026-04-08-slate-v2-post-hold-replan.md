---
date: 2026-04-08
topic: slate-v2-post-hold-replan
status: complete
source: /Users/zbeyens/git/plate-2/docs/slate-v2/commands/replan-remaining-work.md
---

# Slate v2 Post-Hold Replan

## Decision

The blocker ladder is complete.
There is no default `Batch 10`.

Best default move:

- ship the proved `Target A` surface
- keep `Target B` on explicit hold

Why:

- the surviving gaps are no longer cleanup debt
- they are structural widening work:
  - claim width
  - oracle depth
  - intentionally narrow family contracts

Perf is no longer a standalone blocker.
It stays a lane-by-lane marketing constraint only.

## What Not To Do

Do **not** restart generic roadmap churn.

Do **not** open another batch just because there is still ambition left.

Do **not** say “continue toward `Target B`” without choosing which structural
program earns that reopening.

## If You Reopen `Target B`

Choose one explicit program first.

### Program A: Core Oracle Expansion

Use this if the next move is broader core proof before any claim widening.

Scope:

- `/Users/zbeyens/git/slate-v2/packages/slate/test/snapshot-contract.ts`
- `/Users/zbeyens/git/slate-v2/packages/slate/test/range-ref-contract.ts`
- `/Users/zbeyens/git/slate-v2/packages/slate/test/clipboard-contract.ts`
- [oracle-harvest-ledger.md](/Users/zbeyens/git/plate-2/docs/slate-v2/archive/oracle-harvest-ledger.md)
- [release-file-review-ledger.md](/Users/zbeyens/git/plate-2/docs/slate-v2/release-file-review-ledger.md)

Exit bar:

- new supportable legacy rows imported
- remaining skipped rows named one by one
- no helper/API sentence widened unless the oracle now earns it

### Program B: Contract Widening

Use this if the next move is to broaden a currently narrow claim deliberately.

Scope:

- [replacement-family-ledger.md](/Users/zbeyens/git/plate-2/docs/slate-v2/replacement-family-ledger.md)
- [release-readiness-decision.md](/Users/zbeyens/git/plate-2/docs/slate-v2/release-readiness-decision.md)
- [full-replacement-blockers.md](/Users/zbeyens/git/plate-2/docs/slate-v2/archive/full-replacement-blockers.md)
- [replacement-candidate.md](/Users/zbeyens/git/slate-v2/docs/general/replacement-candidate.md)
- [Readme.md](/Users/zbeyens/git/slate-v2/Readme.md)

Good targets:

- a specific family with a real legacy floor
- a specific helper seam with a named proof plan

Bad targets:

- “full replacement” as a slogan
- broad parity language without proof

Exit bar:

- one deliberately widened contract
- matching runtime/browser/compat proof
- matching granular ledger rows

### Program C: Perf Marketing Upgrade

Use this only if you want a broader performance sentence.

This is optional.
It is not the default next move.

Scope:

- [replacement-gates-scoreboard.md](/Users/zbeyens/git/plate-2/docs/slate-v2/replacement-gates-scoreboard.md)
- benchmark scripts under `/Users/zbeyens/git/slate-v2/scripts/`
- benchmark outputs under `/Users/zbeyens/git/slate-v2/tmp/`

Exit bar:

- broader measured lane set
- still honest wording
- no fake “faster everywhere” sentence

## Granular Rule

If any post-hold program reopens work, refresh the granular ledger first for
the touched surfaces.

Do not reopen `Target B` through prose alone.
Reopen it through checked rows and named proof owners.

## Recommended Next Move

If the goal is shipping:

- stop here

If the goal is reopening `Target B`:

1. choose `Program A` or `Program B`
2. write a dedicated follow-up plan
3. only then create a new batch ladder
