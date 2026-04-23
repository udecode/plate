---
date: 2026-04-08
topic: slate-v2-post-roadmap-blocker-batches
status: complete
source: /Users/zbeyens/git/plate-2/docs/slate-v2/commands/replan-remaining-work.md
context_snapshot: /Users/zbeyens/git/plate-2/.omx/context/slate-v2-target-b-blocker-replan-20260408T121114Z.md
---

# Slate v2 Post-Roadmap Blocker Batches Plan

## Goal

Turn the finished `1-6` roadmap ladder into a new blocker-owned execution
sequence for `Target B`.

## Planning Rules

- keep the canonical live roadmap in `docs/slate-v2/master-roadmap.md`
- keep live verdict ownership in the existing release/blocker docs
- keep granular diff tracking explicit in
  `release-file-review-ledger.md`
- do not quietly put perf back into the routine shipping gate

## Phases

1. Re-read remaining blockers and proof ownership
2. Define the next blocker batch ladder
3. Sync roadmap, commands, and granular ledger language
4. Verify and architect-review the replan

## Progress

- created Ralph context snapshot
- started blocker-batch replanning from the completed roadmap cashout
- refreshed the canonical roadmap with explicit blocker batches:
  - Batch 7: Claim Width And Oracle Deepening
  - Batch 8: Family Depth And Granular Diff Closure
  - Batch 9: Perf Posture And `Target B` Promotion / Hold
- added explicit unchecked granular review rows for the post-roadmap
  blocker surfaces in `release-file-review-ledger.md`
- synced the command pack and overview to the new blocker ladder

## Exit Read

The roadmap no longer stops at "1-6 complete."

It now tells the operator exactly what the next blocker batches are and which
files must be reviewed granularly while doing them.
