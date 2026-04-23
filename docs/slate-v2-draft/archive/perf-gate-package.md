---
date: 2026-04-10
topic: slate-v2-perf-gate-package
---

# Slate v2 Perf Gate Package

> Historical/supporting perf note. The live perf gate read now lives in
> [../replacement-gates-scoreboard.md](/Users/zbeyens/git/plate-2/docs/slate-v2/replacement-gates-scoreboard.md).

## Purpose

Concrete perf blocker package for the reopened `slate-v2` perf lane.

This file defines:

- blocker classes
- blocker lanes
- explicit non-blockers
- command / artifact ownership
- how blocker classes affect `Target A`, `Target B`, or only perf wording

It does **not** own the live final verdict by itself.

## Non-blockers

These do not block RC truth by themselves:

- low-value demo/example lanes
- microbench noise without user-facing impact
- scenarios slower than legacy but still comfortably fast in practice

## Deterministic Target Rule

- `Target A` reopens **iff** a blocker lane lands inside the default
  recommendation surface:
  - `Slate`
  - `EditableBlocks`
  - `withHistory(createEditor())`
- `Target B` reopens **iff** a blocker lane invalidates the broader explicit
  package-level replacement claim
- perf wording only reopens **iff** a failing lane is diagnostic/core-only and
  does not map to either claim surface

## Blocker Class Matrix

| Perf class | Reopens `Target A`? | Reopens `Target B`? | Notes |
| --- | --- | --- | --- |
| `slate-react` mounted runtime basics | yes | yes | default recommendation surface |
| `slate-history` undo / redo on the default editor surface | yes | yes | default recommendation includes `withHistory(createEditor())` |
| huge-document user flows | no | yes | broader replacement truth |
| mainstream richtext formatting/edit flows | yes | yes | current runtime/browser proof stack already carries them |
| core normalization / engine lanes | no | no | diagnostic class; only matters when mapped upward into user-facing flows |

## Gate Lanes

| Lane id | Class | Command | Artifact / output | Owner | Current status |
| --- | --- | --- | --- | --- | --- |
| `perf-runtime-richtext-format` | mainstream richtext flows | `pnpm bench:replacement:richtext:local` | `tmp/slate-replacement-richtext-benchmark.json` | [replacement-gates-scoreboard.md](/Users/zbeyens/git/plate-2/docs/slate-v2/replacement-gates-scoreboard.md) | `pass` |
| `perf-runtime-placeholder` | `slate-react` mounted runtime basics | `pnpm bench:replacement:placeholder:local` | `tmp/slate-replacement-placeholder-benchmark.json` | [replacement-gates-scoreboard.md](/Users/zbeyens/git/plate-2/docs/slate-v2/replacement-gates-scoreboard.md) | `pass` |
| `perf-runtime-huge-document` | huge-document user flows | `pnpm bench:replacement:huge-document:local` | `tmp/slate-replacement-huge-document-benchmark.json` | [replacement-gates-scoreboard.md](/Users/zbeyens/git/plate-2/docs/slate-v2/replacement-gates-scoreboard.md) | `pass` |
| `perf-history-compare` | `slate-history` undo / redo on the default editor surface | `pnpm bench:history:compare:local` | `tmp/slate-history-benchmark.json` | [true-slate-rc-proof-ledger.md](/Users/zbeyens/git/plate-2/docs/slate-v2/true-slate-rc-proof-ledger.md) | `pass` |
| `perf-core-normalization-local` | core normalization / engine lanes | `pnpm bench:normalization:local` | `tmp/slate-normalization-benchmark.json` | [true-slate-rc-proof-ledger.md](/Users/zbeyens/git/plate-2/docs/slate-v2/true-slate-rc-proof-ledger.md) | `open` |
| `perf-core-normalization-compare` | core normalization / engine lanes | `pnpm bench:normalization:compare:local` | `tmp/slate-normalization-compare-benchmark.json` | [true-slate-rc-proof-ledger.md](/Users/zbeyens/git/plate-2/docs/slate-v2/true-slate-rc-proof-ledger.md) | `open` |

Current read:

- the curated blocker package is green enough for `Target A` and `Target B`
- richtext, placeholder, huge-document, and history compare gate lanes currently clear
- huge-document typing and chunking-at-scale comparisons remain follow-up
  evidence, not promoted blocker lanes in this package
- normalization remains diagnostic

## Read

- Perf is blocker truth again.
- But blocker truth is now curated and command-backed.
- This package exists to stop perf from collapsing back into either:
  - fake lane-by-lane caveat language
  - or benchmark-matrix prison
