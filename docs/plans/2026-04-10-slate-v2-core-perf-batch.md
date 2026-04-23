---
date: 2026-04-10
topic: slate-v2-core-perf-batch
status: completed
source_repos:
  - /Users/zbeyens/git/slate-v2
  - /Users/zbeyens/git/plate-2
context_snapshot:
  - /Users/zbeyens/git/plate-2/.omx/context/slate-v2-core-perf-batch-20260410T214503Z.md
---

# Slate v2 Core Perf Batch

## Goal

Land the next real core-performance cuts after the normalization win:

- transaction bootstrap cost
- transaction read cost
- lazy traversal for `nodes(...)`
- lazy traversal for `positions(...)`
- hot current-node read cost on insert

## Rules

- no fake performance wins by narrowing behavior
- no scope reduction
- one real measured improvement minimum before considering stop
- keep regression evidence fresh

## Phases

- [x] Phase 0: Grounding
  - context snapshot
  - known hot seams
- [x] Phase 1: Kill the biggest structural cost
  - outer transaction full-tree clone
  - or transaction read full-tree clone
- [x] Phase 2: Kill traversal materialization waste
  - attempted `Editor.nodes(...)`
  - attempted `Editor.positions(...)`
  - regressing fast paths reverted after measurement
- [x] Phase 3: Kill hot current-node cloning on insert
- [x] Phase 4: Re-measure core huge-doc and observation benches
- [x] Phase 5: Regression proof
  - targeted contract tests
  - full slate package tests
  - build
  - typecheck
  - diagnostics

## Current Evidence

- explicit normalization cliff is no longer the first problem:
  - adjacent-text `134.20ms -> 3.08ms`
  - inline flatten `1779.73ms -> 10.36ms`
  - observation path in the same bench `109.95ms -> 78.01ms`
- core huge-document typing improved but is still very red:
  - final direct fast-path rerun:
    - start-block `370.97ms -> 0.62ms`
    - middle-block `368.58ms -> 0.65ms`
- core observation improved on the clean stable branch versus the original read:
  - final direct fast-path rerun:
    - `editor.children.length` `940.18ms -> 1.34ms`
    - `Editor.nodes(...)` `1275.18ms -> 98.41ms`
    - `Editor.positions(...)` `1013.11ms -> 61.08ms`
- attempted `nodes(...)` / `positions(...)` fast paths regressed badly and were
  reverted
- final kept wins:
  - dirty-path-scoped non-explicit normalization for simple text/property ops
  - cached cloned children per transaction mutation version
  - raw current-node helper for hot internal reads
  - direct top-level `insert_text` / `remove_text` fast path that bypasses full
    transaction bootstrap and full snapshot rebuild when paths stay stable
