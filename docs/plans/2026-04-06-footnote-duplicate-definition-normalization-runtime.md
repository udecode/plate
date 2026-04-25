# Footnote Duplicate Definition Normalization Runtime

## Goal

Implement duplicate-definition normalization for footnotes so the first
definition stays canonical, later duplicates become explicit invalid siblings,
and the user gets a repair path instead of only a warning.

## Scope

- `@platejs/footnote` package queries / transforms / API
- app footnote UI in `apps/www/src/registry/ui/footnote-node.tsx`
- docs / release note sync if runtime behavior changes

## Current Findings

- The registry already sorts definitions by path and `definition()` already
  returns the first one.
- Duplicate detection already exists through:
  - `api.footnote.hasDuplicateDefinitions`
  - `api.footnote.duplicateIdentifiers`
  - `api.footnote.definitions`
- The current app UI warns about duplicate references in hover preview, but
  duplicate definition blocks still behave too much like valid definitions.
- Backlink navigation from a later duplicate is misleading because references
  belong to the canonical first definition.

## Working Plan

- [x] add package-level tests for canonical-first duplicate semantics and a
      repair transform
- [x] add app-level tests for invalid duplicate definition UI and repair action
- [x] implement package helpers / transform
- [x] implement app duplicate definition UI
- [x] verify with tests, build, typecheck, lint, browser

## Progress Log

- 2026-04-06: read current registry, package API, app UI, and the deferred spec
  note
- 2026-04-06: added package helpers for duplicate definitions plus
  `tf.footnote.normalizeDuplicateDefinition`
- 2026-04-06: changed duplicate definition blocks so later duplicates render as
  invalid siblings and expose a renumber repair action instead of backlink
  behavior
- 2026-04-06: synced docs, changeset, and a reusable learning
