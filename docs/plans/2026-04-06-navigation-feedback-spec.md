# Navigation Feedback Spec

## Goal

Define reusable navigation feedback as shared editor law:

- move focus or caret
- scroll target into view
- briefly highlight the landed target

This should be a cross-surface contract for current Plate features such as TOC,
footnote navigation, and search jumps.

## Phases

- [x] Read current law and architecture seams
- [x] Patch standards / readable law / protocol rows
- [x] Patch architecture notes for the shared primitive
- [x] Read back the changed docs for consistency

## Notes

- Treat this as a shared editor-scoped primitive, not a footnote-local hack.
- This is docs-only unless a later turn asks for implementation.
- Parity may stay unchanged if this remains outside current content-affecting
  gate scope.
- Outcome:
  - `EDIT-NAV-FEEDBACK-*` now exists as shared cross-surface law
  - TOC, footnote, and search jumps now explicitly reuse one transient
    navigation-feedback primitive
  - the architecture doc now treats navigation feedback as a shared editor
    domain instead of a per-feature hack
