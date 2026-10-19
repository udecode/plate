# Markdown Feature Priority Roadmap

## Goal

Push `search / find-replace` down in the current editor-behavior roadmap so
markdown-feature work comes first.

## Scope

- canonical roadmap truth
- active mirror implementation roadmap
- no broad rewrite of historical execution notes unless they falsely claim
  current truth

## Decision

- markdown-adjacent feature lanes should lead the queue
- `search / find-replace` remains a real lane, but not the next priority
- the active roadmap should prefer:
  - autoformat runtime alignment
  - toggle rewrite
  - date contract expansion
  - media/embed expansion
  before the cross-surface search lane

## Verification

- read back roadmap docs
- grep current-truth docs for stale search-first wording

## Progress

- [done] Recorded the priority change request.
- [done] Reordered the canonical roadmap and active mirror roadmap so
  markdown-feature lanes lead the queue.
- [done] Removed search-first ordering claims from current-truth parity wording.
