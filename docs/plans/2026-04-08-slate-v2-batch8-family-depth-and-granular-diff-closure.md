---
date: 2026-04-08
topic: slate-v2-batch8-family-depth-and-granular-diff-closure
status: complete
source: /Users/zbeyens/git/plate-2/docs/slate-v2/master-roadmap.md
context_snapshot: /Users/zbeyens/git/plate-2/.omx/context/slate-v2-batch8-family-depth-and-granular-diff-closure-20260408T135116Z.md
---

# Slate v2 Batch 8: Family Depth And Granular Diff Closure

## Goal

Execute Batch 8 from `docs/slate-v2/master-roadmap.md`.

## Phases

1. rank the remaining thin family seams
2. deepen current compatibility proof where it buys real closure
3. narrow any still-current-only family contract explicitly
4. sync the family ledger, maintainer story, and granular ledger
5. verify and review

## Progress

- created Batch 8 context snapshot
- identified the cheap deepening path:
  - current compatibility rows for markdown
  - current compatibility rows for forced-layout
  - current compatibility rows for styling
  - current compatibility rows for hovering-toolbar
- identified `scroll-into-view` as the main intentionally-current-only family
- added current compatibility rows for:
  - `markdown-preview`
  - `markdown-shortcuts`
  - `forced-layout`
  - `styling`
  - `hovering-toolbar`
- updated the family ledger so every widened family now has an explicit proof
  posture:
  - runtime-backed
  - browser-backed
  - compat-backed where honest
  - intentionally narrow where required
- kept `scroll-into-view` explicitly current-only instead of inventing a fake
  legacy floor
- synced the maintainer diff story and granular ledger rows

## Exit Read

Batch 8 is complete.

The widened family story is tighter now:

- markdown, forced-layout, styling, and hovering-toolbar gained current
  compatibility-floor rows
- editable-voids, images, embeds, and tables keep that compat-backed posture
- scroll-into-view stays explicitly current-only
- the family-ledger granular row is closed without pretending every family is a
  blanket legacy clone
