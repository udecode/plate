# Footnote Create Definition Repair

## Goal

Add a definition-only repair path for unresolved footnote references so users
can recreate a missing definition without inserting another reference.

## Scope

- package-level `createDefinition` transform in `@platejs/footnote`
- unresolved footnote reference repair UI in the docs app
- focused tests, docs, and release notes for the new surface

## Non-Goals

- auto-healing deleted definitions behind the user's back
- changing duplicate-definition semantics
- broader footnote editor UX redesign

## Current Findings

- `tf.insert.footnote` always inserts a reference and only creates the matching
  definition as a side effect.
- The inline `[^` combobox can recreate a missing definition, but only by also
  inserting another reference.
- Unresolved references already expose package resolution state via
  `api.footnote.isResolved({ identifier })`.
- The right seam is a dedicated definition-only transform, then UI repair
  affordances can call that instead of abusing insert behavior.

## Working Plan

- [ ] add `tf.footnote.createDefinition`
- [ ] wire unresolved-reference repair UI to the new transform
- [ ] cover package and app behavior with focused tests
- [ ] update docs/spec/changeset for the new public surface
- [ ] run targeted verification only

## Progress Log

- 2026-04-06: scoped the feature as explicit unresolved-reference repair, not
  auto-heal
