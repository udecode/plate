---
date: 2026-04-07
topic: slate-v2-production-replacement-plan
status: completed
---

# Slate v2 Production Replacement Plan

> Supporting plan. For current queue and roadmap truth, see [master-roadmap.md](/Users/zbeyens/git/plate-2/docs/slate-v2/master-roadmap.md).

## Goal

Release `/Users/zbeyens/git/slate-v2` as the production replacement for legacy
Slate with the smallest honest remaining risk.

Bluntly:

- literal `0` regression risk is fantasy
- the real target is:
  - no known unclassified behavior regressions in claimed families
  - no unverified claimed families
  - no blanket performance language beyond measured workloads

## Current State

Already landed and browser-proved:

- anchor lifecycle
- inline
- decoration / highlight
- anchor / projection
- richtext
- markdown
- forced-layout
- styling
- hovering-toolbar
- editable-voids
- images
- embeds
- tables
- shadow DOM
- iframe
- plaintext
- read-only
- placeholder / IME

Additional current truth already landed:

- family-by-family legacy audit for:
  - markdown
  - forced-layout
  - styling
  - hovering-toolbar
  - editable-voids
  - images
  - embeds
  - tables
- runtime/package tests for those same families
- frozen benchmark lanes for:
  - richtext blockquote toggle
  - markdown blockquote shortcut
  - editable-void insert `x5`
  - table cell edit

Still intentionally later:

- none

Current release truth:

- `Target A`: **Go**
- `Target B`: **Go**

## Release Read

The release claim is:

- replace legacy Slate in production
- keep perf wording limited to measured lanes

The measured lanes are:

- placeholder
- huge-document `1000`-block
- richtext blockquote toggle
- markdown blockquote shortcut
- editable-void insert `x5`
- table cell edit

Do not imply a blanket speed win.

## Remaining Work

None required for the release claim.

Optional follow-up:

1. widen benchmark coverage
2. broaden non-governing example backlog
3. keep harvesting new parity rows if future family scope expands

## Execution Order

1. done

## Stop Rules

Stop widening claim if:

- a claimed family exposes a real regression
- a current family still lacks its explicit skip list
- a benchmark claim outruns measured workloads

## Source Of Truth

Use these together:

- [overview.md](/Users/zbeyens/git/plate-2/docs/slate-v2/overview.md)
- [replacement-family-ledger.md](/Users/zbeyens/git/plate-2/docs/slate-v2/replacement-family-ledger.md)
- [replacement-gates-scoreboard.md](/Users/zbeyens/git/plate-2/docs/slate-v2/replacement-gates-scoreboard.md)
- [release-readiness-decision.md](/Users/zbeyens/git/plate-2/docs/slate-v2/release-readiness-decision.md)
- [full-replacement-blockers.md](/Users/zbeyens/git/plate-2/docs/slate-v2/archive/full-replacement-blockers.md)
- [replacement-candidate.md](/Users/zbeyens/git/slate-v2/docs/general/replacement-candidate.md)
