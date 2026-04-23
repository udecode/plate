---
date: 2026-04-13
topic: slate-v2-exact-ledgers-plan
status: in_progress
---

# Slate v2 Exact Ledgers Plan

## Goal

Add 1:1 exact legacy-file ledgers per scope so the repo stops pretending the
human control ledger is exhaustive.

## Scope

- `packages/slate/test/**`
- `packages/slate-react/test/**`
- `packages/slate-history/test/**`
- `playwright/integration/examples/**`

## Rules

- one exact row per legacy file
- exact relative path keys
- explicit mapping status:
  - mapped
  - explicit skip
  - needs-triage
- no silent aggregation

## Exit

- exact ledgers exist under `docs/slate-v2/ledgers/`
- the main release-file ledger points at them and stops overclaiming exhaustiveness
