---
date: 2026-04-18
topic: plite-overview
status: superseded
---

# Plite Overview

## Purpose

Front door to the historical `plite` private-alpha program.

The package source, tests, examples, docs, benchmarks, and browser proof now
live in the Plate repo. Use the transplant ledger for deletion/readiness proof.
This stack is retained as historical design evidence only.

## Current Read

- `Plate repo root` is the live source of truth
- `docs/transplant/plite/**` is the donor manifest and deletion-readiness ledger
- `content/docs/plite/**`, `apps/www`, and `packages/**` are the current public surfaces
- `docs/plite/**` is historical design evidence
- `docs/plite-draft/**` is the archived prior doc lane
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
  - compatibility fallout is scoped evidence, not product shape
- tranche 3 is the live redesign lane:
  - `packages/plite` is being redesigned toward the native transaction engine
    and snapshot/store-first API described in
    [architecture-contract.md](/Users/zbeyens/git/plate-2/docs/plite/references/architecture-contract.md)
  - support-package work stays blocked until the `slate` core API is honestly
    settled
  - current API quality is the default value; any escape hatch must be named,
    narrow, and proved
  - hard cuts are allowed when retrofit baggage blocks the better API
  - current `packages/plite` proof and perf floors stay active guardrails while
    the redesign lands
- merged corpus docs now exist for:
  - `slate`
  - `plite-history`
  - `plite-hyperscript`
  - `plite-dom`
  - `plite-react`
- the live stack again has explicit north-star docs for:
  - absolute architecture private-alpha claim
  - post-closure proof hardening plan
  - architecture contract
  - overlay roadmap
  - decorations/annotations rationale
  - chunking rejection and huge-doc posture

## Default Read Order

1. [absolute-architecture-release-claim.md](/Users/zbeyens/git/plate-2/docs/plite/absolute-architecture-release-claim.md)
2. [docs/plans/2026-04-25-plite-editing-epoch-kernel-regression-closure-plan.md](/Users/zbeyens/git/plate-2/docs/plans/2026-04-25-plite-editing-epoch-kernel-regression-closure-plan.md)
3. [docs/plans/2026-04-24-plite-post-closure-proof-hardening-plan.md](/Users/zbeyens/git/plate-2/docs/plans/2026-04-24-plite-post-closure-proof-hardening-plan.md)
4. [docs/plans/2026-04-24-plite-absolute-architecture-closure-plan.md](/Users/zbeyens/git/plate-2/docs/plans/2026-04-24-plite-absolute-architecture-closure-plan.md)
5. [references/architecture-contract.md](/Users/zbeyens/git/plate-2/docs/plite/references/architecture-contract.md)
6. [master-roadmap.md](/Users/zbeyens/git/plate-2/docs/plite/master-roadmap.md)
7. [release-readiness-decision.md](/Users/zbeyens/git/plate-2/docs/plite/release-readiness-decision.md)
8. [replacement-gates-scoreboard.md](/Users/zbeyens/git/plate-2/docs/plite/replacement-gates-scoreboard.md)
9. [true-slate-rc-proof-ledger.md](/Users/zbeyens/git/plate-2/docs/plite/true-slate-rc-proof-ledger.md)
10. [release-file-review-ledger.md](/Users/zbeyens/git/plate-2/docs/plite/release-file-review-ledger.md)
11. [decoration-roadmap.md](/Users/zbeyens/git/plate-2/docs/plite/decoration-roadmap.md)
12. [decorations-annotations-cluster.md](/Users/zbeyens/git/plate-2/docs/plite/decorations-annotations-cluster.md)
13. [references/chunking-review.md](/Users/zbeyens/git/plate-2/docs/plite/references/chunking-review.md)
14. [final-api-hard-cuts-status.md](/Users/zbeyens/git/plate-2/docs/plite/final-api-hard-cuts-status.md)
15. [ledgers/README.md](/Users/zbeyens/git/plate-2/docs/plite/ledgers/README.md)

## Reference Only

- [fresh-branch-migration-plan.md](/Users/zbeyens/git/plate-2/docs/plite/fresh-branch-migration-plan.md)
- [2026-04-18-001-refactor-plite-parity-first-migration-plan.md](/Users/zbeyens/git/plate-2/docs/plans/2026-04-18-001-refactor-plite-parity-first-migration-plan.md)
- [pr-description.md](/Users/zbeyens/git/plate-2/docs/plite/references/pr-description.md)

## Ownership

| Class                  | Owner                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| architecture claim     | [absolute-architecture-release-claim.md](/Users/zbeyens/git/plate-2/docs/plite/absolute-architecture-release-claim.md)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| execution plan         | [2026-04-25-plite-editing-epoch-kernel-regression-closure-plan.md](/Users/zbeyens/git/plate-2/docs/plans/2026-04-25-plite-editing-epoch-kernel-regression-closure-plan.md), [2026-04-24-plite-post-closure-proof-hardening-plan.md](/Users/zbeyens/git/plate-2/docs/plans/2026-04-24-plite-post-closure-proof-hardening-plan.md), and [2026-04-24-plite-absolute-architecture-closure-plan.md](/Users/zbeyens/git/plate-2/docs/plans/2026-04-24-plite-absolute-architecture-closure-plan.md) |
| tranche order          | [master-roadmap.md](/Users/zbeyens/git/plate-2/docs/plite/master-roadmap.md)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| review state           | [release-file-review-ledger.md](/Users/zbeyens/git/plate-2/docs/plite/release-file-review-ledger.md)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| readiness claim        | [release-readiness-decision.md](/Users/zbeyens/git/plate-2/docs/plite/release-readiness-decision.md)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| gate status            | [replacement-gates-scoreboard.md](/Users/zbeyens/git/plate-2/docs/plite/replacement-gates-scoreboard.md)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| proof status           | [true-slate-rc-proof-ledger.md](/Users/zbeyens/git/plate-2/docs/plite/true-slate-rc-proof-ledger.md)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |

## Archive Rule

If a doc belongs to the old rewrite program and is not live private-alpha truth,
it belongs in `docs/plite-draft/**`.
