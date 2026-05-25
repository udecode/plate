---
date: 2026-04-10
topic: api-drift-perf-execution-batch
status: active
source_repos:
  - /Users/zbeyens/git/plate-2
  - /Users/zbeyens/git/slate-v2
context_snapshot:
  - /Users/zbeyens/git/plate-2/.omx/context/api-drift-perf-batch-20260410T192507Z.md
---

# API Drift Perf Execution Batch

## Goal

Finish the kept API-drift performance program until every drift class is either:

- benchmarked and green enough
- benchmarked and explicitly diagnostic
- or benchmarked and consciously deferred with a reason

## Hard Rules

- do not expand the drift inventory unless a kept public surface is missing
- treat `slate-batch-engine` as compare-only black-box evidence
- blocker lanes outrank diagnostic lanes
- generic tax beats one-off cleanup
- non-API drift stays out unless needed to explain blocker-facing numbers

## Phases

- [x] Phase 0: Grounding
  - context snapshot
  - Ralph state
  - frozen drift register exists
- [x] Phase 1: Freeze inventory and register truth
  - verify all kept drift classes are represented
  - stop inventory expansion
- [x] Phase 2: Add missing drift lanes
  - wrapper-heavy richtext lane
  - normalization-mapped richtext lane
  - query/ref observation lane
  - node-transform hot-wrapper lanes
- [x] Phase 3: Run lanes and capture current numbers
  - fill register
  - update scoreboard with blocker vs diagnostic split
- [x] Phase 4: Cause analysis on red blocker-facing lanes
  - init vs live
  - wrapper vs core
  - pure value transform vs editor-operation path
  - observe/read vs mutate/write
- [x] Phase 5: Rank fixes by leverage
  - generic tax first
  - surviving drift-specific hotspot second
- [x] Phase 6: Start optimization only after the above is true

## Working Notes

- richtext runtime dissection already exists and first read points at mark
  rendering, not toolbar subscription
- missing requested file: `docs/shared/agent-tiers.md`
- one explorer lane is running for wrapper-heavy richtext mapping
- fresh same-turn replacement reruns are noisier than the older frozen scoreboard
  implied; read them as bands, not scripture
- current red reads:
  - richtext blocker still slower than legacy
  - normalization compare still very red but diagnostic
  - query/ref only shows obvious pressure on `rangeRef` rebasing
- current green or near-green reads:
  - markdown
  - table
  - node-transform wrappers
  - editable-void is now basically parity
- scoped deslop review found no high-signal cleanup worth landing:
  extracting shared benchmark helpers across the new scripts would be needless
  abstraction right now
