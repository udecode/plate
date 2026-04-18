# Footnote Product Surface

## Goal
Implement the missing footnote product surface end-to-end:
- `tf.insert.footnote`
- footnote helpers and navigation
- app/demo toolbar and slash-command entry points
- footnote rendering helpers needed for preview/backlink behavior
- docs/spec sync

## Phases
- [in_progress] Audit current footnote package seams and clone the right insert/navigation patterns from adjacent packages
- [pending] Add red tests for package-level footnote insert and navigation behavior
- [pending] Implement footnote transforms, queries, and plugin API in `@platejs/footnote`
- [pending] Wire React/app UI surfaces: toolbar, slash, rendering/backlink/preview helpers
- [pending] Update docs/spec language to match the implemented package surface
- [pending] Run package/app verification and summarize the shipped contract

## Constraints
- Use one coherent lane, not insert-only.
- Default to numeric identifiers and avoid duplicate definitions.
- Definition placement should be deterministic and sane.
- If Plate does not support a Typora-like surface yet, say so plainly.
