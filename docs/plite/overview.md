---
date: 2026-04-18
topic: plite-overview
status: active
updated: 2026-09-18
---

# Plite Overview

## Purpose

This directory contains current contracts, active research, and historical
migration evidence. Do not assign one lifecycle status to the entire tree.

Start with [agent-start.md](agent-start.md), [Plite Vision](../vision/plite.md),
and the [feature review ledger](../research/reviews.md). The
[architecture contract](references/architecture-contract.md) describes current
runtime invariants. Linked feature decisions and plans own their narrower
questions and execution state. [Research runs](research/) retain source pins
and rejected alternatives; [transplant records](../transplant/) retain
donor/deletion evidence. Proof is valid only for its captured inputs.

The migration snapshot below is historical. Its tranche status, package names,
versions, and release claims do not establish the current checkout state.

## Historical migration snapshot

- `Plate repo root` is the live source of truth
- `docs/transplant/plite/**` is the donor manifest and deletion-readiness ledger
- `content/docs/plite/**`, `apps/www`, and `packages/**` are the current public surfaces
- Migration documents in this directory preserve historical design evidence
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
    [architecture-contract.md](references/architecture-contract.md)
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

## Historical migration reading

1. [absolute-architecture-release-claim.md](absolute-architecture-release-claim.md)
2. [docs/plans/2026-04-25-plite-editing-epoch-kernel-regression-closure-plan.md](../plans/2026-04-25-plite-editing-epoch-kernel-regression-closure-plan.md)
3. [docs/plans/2026-04-24-plite-post-closure-proof-hardening-plan.md](../plans/2026-04-24-plite-post-closure-proof-hardening-plan.md)
4. [docs/plans/2026-04-24-plite-absolute-architecture-closure-plan.md](../plans/2026-04-24-plite-absolute-architecture-closure-plan.md)
5. [references/architecture-contract.md](references/architecture-contract.md)
6. [master-roadmap.md](master-roadmap.md)
7. [release-readiness-decision.md](release-readiness-decision.md)
8. [replacement-gates-scoreboard.md](replacement-gates-scoreboard.md)
9. [true-plite-rc-proof-ledger.md](true-plite-rc-proof-ledger.md)
10. [release-file-review-ledger.md](release-file-review-ledger.md)
11. [decoration-roadmap.md](decoration-roadmap.md)
12. [decorations-annotations-cluster.md](decorations-annotations-cluster.md)
13. [references/chunking-review.md](references/chunking-review.md)
14. [final-api-hard-cuts-status.md](final-api-hard-cuts-status.md)
15. [ledgers/README.md](ledgers/README.md)

## Reference Only

- [fresh-branch-migration-plan.md](fresh-branch-migration-plan.md)
- [2026-04-18-001-refactor-plite-parity-first-migration-plan.md](../plans/2026-04-18-001-refactor-plite-parity-first-migration-plan.md)
- [pr-description.md](references/pr-description.md)

## Historical program ownership

| Class                  | Owner                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| architecture claim     | [absolute-architecture-release-claim.md](absolute-architecture-release-claim.md)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| execution plan         | [2026-04-25-plite-editing-epoch-kernel-regression-closure-plan.md](../plans/2026-04-25-plite-editing-epoch-kernel-regression-closure-plan.md), [2026-04-24-plite-post-closure-proof-hardening-plan.md](../plans/2026-04-24-plite-post-closure-proof-hardening-plan.md), and [2026-04-24-plite-absolute-architecture-closure-plan.md](../plans/2026-04-24-plite-absolute-architecture-closure-plan.md) |
| tranche order          | [master-roadmap.md](master-roadmap.md)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| review state           | [release-file-review-ledger.md](release-file-review-ledger.md)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| readiness claim        | [release-readiness-decision.md](release-readiness-decision.md)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| gate status            | [replacement-gates-scoreboard.md](replacement-gates-scoreboard.md)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| proof status           | [true-plite-rc-proof-ledger.md](true-plite-rc-proof-ledger.md)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |

## Archive Rule

If a doc belongs to the old rewrite program and is not live private-alpha truth,
it belongs in `docs/plite-draft/**`.
