---
date: 2026-04-05
topic: slate-browser-proof-lane-matrix
---

# Slate Browser Proof-Lane Matrix

> Specialist testing/proof doc. For current queue and roadmap truth, see [master-roadmap.md](/Users/zbeyens/git/plate-2/docs/slate-v2/master-roadmap.md).

## Purpose

This doc says which command proves which kind of truth.

It is a specialist evidence map.
It does **not** own verdict or roadmap order.
It feeds rows into
[true-slate-rc-proof-ledger.md](/Users/zbeyens/git/plate-2/docs/slate-v2/true-slate-rc-proof-ledger.md)
for browser-facing and emitted-artifact proof.

If you do not know which lane to run, this is the answer key.

This file is a specialist evidence surface for the open `True Slate RC`
program.
It does **not** own tranche order or the live verdict.

## Core Lanes

### `yarn test:slate-browser:core`

Owns:

- pure helper semantics
- no real browser dependency

### `yarn test:slate-browser:dom`

Owns:

- focused DOM-backed contract checks
- browser-backed seam validation below full example orchestration

### `yarn test:slate-browser:selection`

Owns:

- focused selection helpers and browser-selection semantics

## Example Lanes

### `yarn test:slate-browser:e2e`

Owns:

- broad v2 example integration matrix
- structural browser truth on the proved v2 examples
- dedicated current-example proof for the broad current example suite
- excludes the specialized IME lane, anchors lane, and replacement matrix lane

### `yarn test:slate-browser:e2e:local`

Owns:

- the same matrix on a fresh local server
- the preferred same-turn gut-check command when touching v2 example behavior
- same-turn local proof for the broad current example suite

## Specialized Lanes

### `yarn test:slate-browser:ime`

Owns:

- IME / composition browser truth

### `yarn test:slate-browser:ime:local`

Owns:

- same-turn local IME validation on fresh local server state

### `yarn test:slate-browser:anchors`

Owns:

- persistent annotation anchors

## Replacement Lanes

### `yarn test:replacement:compat:local`

Owns:

- the rebuilt cross-repo stable compatibility rows
- legacy rows from `/Users/zbeyens/git/slate`
- replacement-candidate row from `/Users/zbeyens/git/slate-v2`

### `pnpm bench:replacement:placeholder:local`

Owns:

- cross-repo placeholder input latency:
  legacy `custom-placeholder` vs current `placeholder`

### `pnpm bench:replacement:huge-document:local`

Owns:

- cross-repo huge-document latency:
  legacy `huge-document` vs current `huge-document`

### `pnpm bench:replacement:richtext:local`

Owns:

- cross-repo richtext formatting latency

### `pnpm bench:replacement:markdown:local`

Owns:

- cross-repo markdown shortcut latency

### `pnpm bench:replacement:void:local`

Owns:

- cross-repo editable-void insert latency

### `pnpm bench:replacement:table:local`

Owns:

- cross-repo table edit latency

## Performance Gate Lanes

### `pnpm bench:replacement:placeholder:local`

Owns:

- mounted-runtime baseline perf gate for the default recommendation surface

### `pnpm bench:replacement:richtext:local`

Owns:

- mainstream richtext formatting/edit latency gate

### `pnpm bench:replacement:huge-document:local`

Owns:

- huge-document user-flow latency gate

### `pnpm bench:normalization:local`

Owns:

- local core normalization perf lanes
- diagnostic current-checkout normalization pressure

### `pnpm bench:normalization:compare:local`

Owns:

- cross-repo normalization perf comparison against `/Users/zbeyens/git/slate`
- diagnostic core normalization deltas, not standalone blocker truth by
  themselves

## Lane Selection Rule

If the question is:

- “is the helper API still truthful?”
  use `core`, `dom`, or `selection`
- “does the mounted editor still behave?”
  use `e2e`
- “does IME still work?”
  use `ime`
- “are annotation anchors still stable?”
  use `anchors`
- “what is the current compatibility envelope?”
  use `test:replacement:compat:local`
- “what do the current numbers say?”
  use the replacement benchmark lanes plus the normalization benchmark lanes
- “is the replacement candidate beating legacy on rebuilt comparison lanes?”
  use the replacement lanes and, for core normalization-only evidence,
  `pnpm bench:normalization:compare:local`
