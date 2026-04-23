---
date: 2026-04-06
topic: phase6-lane-ci-ownership
status: completed
---

# Phase 6 Lane CI Ownership

## Goal

Give the frozen Phase 6 benchmark and compatibility lanes a durable GitHub
Actions home in [../slate-v2](/Users/zbeyens/git/slate-v2) so the recent large-paste
win stays measured, not local-only.

## Scope

- add CI-usable scripts for the Phase 6 compat and huge-document lanes
- add a dedicated workflow that runs them on demand and on relevant mainline
  changes
- upload the huge-document benchmark JSON as an artifact

## Non-Goals

- no broad CI redesign
- no full e2e matrix expansion
- no flaky benchmark threshold gate beyond command success and artifact capture

## Acceptance

- a workflow exists under
  [/Users/zbeyens/git/slate-v2/.github/workflows](/Users/zbeyens/git/slate-v2/.github/workflows)
- the workflow installs deps, prepares the Phase 6 runtime, and runs compat +
  huge-document lanes
- the huge-document benchmark JSON is uploaded
- local Phase 6 commands still work

## Progress

- inspected current `slate` CI: only a generic matrix exists today
- confirmed current Phase 6 lanes only have local-oriented scripts
- decided on the smallest durable cut:
  factor reusable scripts first, then add one isolated workflow
- added reusable `phase6:prepare`, `test:phase6:compat`, and
  `bench:phase6:huge-document` scripts in
  [package.json](/Users/zbeyens/git/slate-v2/package.json)
- added CI workflow
  [phase6-proof.yml](/Users/zbeyens/git/slate-v2/.github/workflows/phase6-proof.yml)
- verified the workflow-shaped commands sequentially:
  `yarn phase6:prepare`, `yarn test:phase6:compat`, and
  `yarn bench:phase6:huge-document`
