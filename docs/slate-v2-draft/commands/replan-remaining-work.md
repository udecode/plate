---
date: 2026-04-08
topic: slate-v2-command-replan-remaining-work
---

# Command: Re-Plan Remaining Work

## When To Run

- after a batch changes the blocker set materially
- after a batch changes proof ownership or proof rows materially
- after re-interviewing unresolved scope
- after a drift review proves a supposedly mirrored API row is actually
  narrower in accepted arguments, option bag, or behavior

## Hard Rule

- do not let `remaining work` collapse to browser/input only while exhaustive
  API/public-surface contract-width audit is still open
- if a kept API helper exists but its live signature or behavior is narrower
  than legacy, reopen the public-surface lane before planning the next batch

## Invocation

```sh
$ralplan /Users/zbeyens/git/plate-2/.omx/specs/deep-interview-slate-v2-true-slate-rc-roadmap.md
```

## Refresh Afterward

- [master-roadmap.md](/Users/zbeyens/git/plate-2/docs/slate-v2/master-roadmap.md)
- [release-readiness-decision.md](/Users/zbeyens/git/plate-2/docs/slate-v2/release-readiness-decision.md)
- [release-file-review-ledger.md](/Users/zbeyens/git/plate-2/docs/slate-v2/release-file-review-ledger.md)
- [true-slate-rc-proof-ledger.md](/Users/zbeyens/git/plate-2/docs/slate-v2/true-slate-rc-proof-ledger.md)
- [pr-description.md](/Users/zbeyens/git/plate-2/docs/slate-v2/references/pr-description.md)
- [2026-04-13-slate-v2-full-no-regression-story-plan.md](/Users/zbeyens/git/plate-2/docs/plans/2026-04-13-slate-v2-full-no-regression-story-plan.md)
- [2026-04-13-slate-v2-exhaustive-api-contract-recovery-plan.md](/Users/zbeyens/git/plate-2/docs/plans/2026-04-13-slate-v2-exhaustive-api-contract-recovery-plan.md)
