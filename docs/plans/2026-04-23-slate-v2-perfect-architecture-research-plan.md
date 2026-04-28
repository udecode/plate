---
date: 2026-04-23
topic: slate-v2-perfect-architecture-research
status: complete
source_skill: research-wiki full
scope:
  - Lexical
  - ProseMirror
  - Tiptap
  - Tiptap Docs
goal:
  - produce a deeper steal/reject/defer architecture and API analysis for the Slate v2 perfect plan
---

# Slate v2 Perfect Architecture Research Plan

## Goal

Use the normalized raw corpora for Lexical, ProseMirror, Tiptap, and Tiptap
Docs to produce a deeper architecture/API analysis for the Slate v2 perfect
plan:

- what to steal
- what to reject
- what to defer

## Research Questions

1. What lifecycle and mutation boundaries should Slate v2 expose publicly?
2. Which extension/plugin ideas are worth stealing directly?
3. Which engine/runtime ideas should stay internal only?
4. Which field ideas should be rejected because they conflict with a
   data-model-first React-perfect runtime?
5. Which ideas are valuable but should be deferred to a later batch?

## Phases

1. Re-read compiled architecture coverage and identify gaps.
2. Read strongest raw architecture/API hits per corpus.
3. Write deeper source summaries where existing pages are too narrow.
4. Write a system map for steal/reject/defer.
5. Write one or more decision pages for the perfect Slate v2 plan.
6. Update index/log and close the corpus ledger.

## Status

- Phase 1: complete.
- Phase 2: complete.
- Phase 3: complete.
- Phase 4: complete.
- Phase 5: complete.

## Outputs

Added:

- `docs/research/systems/slate-v2-perfect-plan-steal-reject-defer-map.md`
- `docs/research/decisions/slate-v2-perfect-plan-should-steal-read-update-transaction-discipline-and-extension-dx.md`

Updated:

- `docs/research/index.md`
- `docs/research/log.md`
- `docs/research/systems/editor-architecture-landscape.md`

## Corpus Closure

- Lexical: evidenced
- ProseMirror: evidenced
- Tiptap/Tiptap Docs: evidenced
