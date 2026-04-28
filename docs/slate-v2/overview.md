---
date: 2026-04-18
topic: slate-v2-overview
status: active
---

# Slate v2 Overview

## Purpose

Front door to the live `slate-v2` migration program.

This stack now describes the final-state program for the fresh `../slate-v2`
clone. It is not the old rewrite archive.

## Current Read

- `../slate-v2` is the live target
- `../slate-v2-draft` is the evidence/value bank
- `docs/slate-v2/**` is the final-state spec lane
- `docs/slate-v2-draft/**` is the archived prior doc lane
- tranche 1 is complete:
  - Bun root/tooling graph
  - Bun test ownership
  - package-manifest build owners
  - docs ownership reset
- tranche 2 is complete:
  - React 19.2.5 baseline
  - Next 16.2.4 for the site/runtime lane
  - TypeScript 6.0.3 baseline
  - package-src HMR without package rebuilds
  - low-risk compatibility fallout only
- tranche 3 is the live redesign lane:
  - `packages/slate` is being redesigned toward the native transaction engine
    and snapshot/store-first API described in
    [architecture-contract.md](/Users/zbeyens/git/plate-2/docs/slate-v2/references/architecture-contract.md)
  - support-package work stays blocked until the `slate` core API is honestly
    settled
  - backward compatibility is no longer the default value; compatibility keeps
    only what still earns its weight
  - hard cuts are allowed when retrofit baggage blocks the better API
  - current `packages/slate` proof and perf floors stay active guardrails while
    the redesign lands
- merged corpus docs now exist for:
  - `slate`
  - `slate-history`
  - `slate-hyperscript`
  - `slate-dom`
  - `slate-react`
- the live stack again has explicit north-star docs for:
  - absolute architecture release claim
  - post-closure proof hardening plan
  - architecture contract
  - overlay roadmap
  - decorations/annotations rationale
  - chunking rejection and huge-doc posture

## Read Order

1. [absolute-architecture-release-claim.md](/Users/zbeyens/git/plate-2/docs/slate-v2/absolute-architecture-release-claim.md)
2. [docs/plans/2026-04-25-slate-v2-editing-epoch-kernel-regression-closure-plan.md](/Users/zbeyens/git/plate-2/docs/plans/2026-04-25-slate-v2-editing-epoch-kernel-regression-closure-plan.md)
3. [docs/plans/2026-04-24-slate-v2-post-closure-proof-hardening-plan.md](/Users/zbeyens/git/plate-2/docs/plans/2026-04-24-slate-v2-post-closure-proof-hardening-plan.md)
4. [docs/plans/2026-04-24-slate-v2-absolute-architecture-closure-plan.md](/Users/zbeyens/git/plate-2/docs/plans/2026-04-24-slate-v2-absolute-architecture-closure-plan.md)
5. [references/architecture-contract.md](/Users/zbeyens/git/plate-2/docs/slate-v2/references/architecture-contract.md)
6. [master-roadmap.md](/Users/zbeyens/git/plate-2/docs/slate-v2/master-roadmap.md)
7. [release-readiness-decision.md](/Users/zbeyens/git/plate-2/docs/slate-v2/release-readiness-decision.md)
8. [replacement-gates-scoreboard.md](/Users/zbeyens/git/plate-2/docs/slate-v2/replacement-gates-scoreboard.md)
9. [true-slate-rc-proof-ledger.md](/Users/zbeyens/git/plate-2/docs/slate-v2/true-slate-rc-proof-ledger.md)
10. [fresh-branch-migration-plan.md](/Users/zbeyens/git/plate-2/docs/slate-v2/fresh-branch-migration-plan.md)
11. [release-file-review-ledger.md](/Users/zbeyens/git/plate-2/docs/slate-v2/release-file-review-ledger.md)
12. historical context only:
   [2026-04-18-001-refactor-slate-v2-parity-first-migration-plan.md](/Users/zbeyens/git/plate-2/docs/plans/2026-04-18-001-refactor-slate-v2-parity-first-migration-plan.md)
13. [decoration-roadmap.md](/Users/zbeyens/git/plate-2/docs/slate-v2/decoration-roadmap.md)
14. [decorations-annotations-cluster.md](/Users/zbeyens/git/plate-2/docs/slate-v2/decorations-annotations-cluster.md)
15. [references/chunking-review.md](/Users/zbeyens/git/plate-2/docs/slate-v2/references/chunking-review.md)
16. [final-api-hard-cuts-status.md](/Users/zbeyens/git/plate-2/docs/slate-v2/final-api-hard-cuts-status.md)
17. [pr-description.md](/Users/zbeyens/git/plate-2/docs/slate-v2/references/pr-description.md)
18. [ledgers/README.md](/Users/zbeyens/git/plate-2/docs/slate-v2/ledgers/README.md)

## Ownership

| Class | Owner |
| --- | --- |
| architecture claim | [absolute-architecture-release-claim.md](/Users/zbeyens/git/plate-2/docs/slate-v2/absolute-architecture-release-claim.md) |
| execution plan | [2026-04-25-slate-v2-editing-epoch-kernel-regression-closure-plan.md](/Users/zbeyens/git/plate-2/docs/plans/2026-04-25-slate-v2-editing-epoch-kernel-regression-closure-plan.md), [2026-04-24-slate-v2-post-closure-proof-hardening-plan.md](/Users/zbeyens/git/plate-2/docs/plans/2026-04-24-slate-v2-post-closure-proof-hardening-plan.md), [2026-04-24-slate-v2-absolute-architecture-closure-plan.md](/Users/zbeyens/git/plate-2/docs/plans/2026-04-24-slate-v2-absolute-architecture-closure-plan.md), and [fresh-branch-migration-plan.md](/Users/zbeyens/git/plate-2/docs/slate-v2/fresh-branch-migration-plan.md) |
| tranche order | [master-roadmap.md](/Users/zbeyens/git/plate-2/docs/slate-v2/master-roadmap.md) |
| review state | [release-file-review-ledger.md](/Users/zbeyens/git/plate-2/docs/slate-v2/release-file-review-ledger.md) |
| readiness claim | [release-readiness-decision.md](/Users/zbeyens/git/plate-2/docs/slate-v2/release-readiness-decision.md) |
| gate status | [replacement-gates-scoreboard.md](/Users/zbeyens/git/plate-2/docs/slate-v2/replacement-gates-scoreboard.md) |
| proof status | [true-slate-rc-proof-ledger.md](/Users/zbeyens/git/plate-2/docs/slate-v2/true-slate-rc-proof-ledger.md) |
| maintainer drift story | [pr-description.md](/Users/zbeyens/git/plate-2/docs/slate-v2/references/pr-description.md) |

## Archive Rule

If a doc belongs to the old rewrite program and is not live migration truth, it
belongs in `docs/slate-v2-draft/**`.
