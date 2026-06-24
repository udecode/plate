---
date: 2026-04-09
topic: plite-control-docs-proof-sync
status: completed
---

# Plite Control Docs Proof Sync

## Goal

Sync the live verdict and control-stack docs with the package/proof closures
already landed in code and package lanes.

## Completed

- updated `release-readiness-decision.md` to include `plite-hyperscript` in the
  explicit package surface and to call out package-local proof lanes
- updated `replacement-family-ledger.md` so the `plite-hyperscript` slot now
  reflects fixture + smoke proof instead of smoke-only wording
- updated `replacement-candidate.md` to name:
  - the widened `slate` utility layer
  - the stable `plite-hyperscript` package surface
  - the package-local proof lanes now available
- updated `replacement-gates-scoreboard.md` so the evidence board reflects the
  package-local proof lanes and direct `plite-hyperscript` package proof

## Verification

- readback of the touched control docs
- `yarn lint:typescript`
