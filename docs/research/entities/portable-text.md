---
title: Portable Text
type: entity
status: partial
updated: 2026-05-28
related:
  - docs/research/sources/editor-architecture/portable-text-schema-behavior-and-portability.md
  - docs/research/systems/editor-architecture-landscape.md
---

# Portable Text

Type: structured block content specification and editor reference

Portable Text is the spec/schema/behavior benchmark in the editor architecture
candidate set.

## Why It Matters

- public JSON content specification instead of editor-private runtime shape
- schema-driven editor with styles, lists, decorators, annotations, block
  objects, inline objects, and nested containers
- behavior API with explicit event, guard, action, and propagation semantics
- browser behavior test story for author-facing editor customizations

## Strongest Local Evidence

- `../portabletext/README.md`
- `../portabletext/apps/docs/src/content/docs/specification.mdx`
- `../portabletext/packages/schema/src/compile-schema.ts`
- `../portabletext/packages/editor/src/behaviors/behavior.types.action.ts`
- `../portabletext/packages/editor/src/behaviors/behavior.perform-event.ts`
- `../portabletext/apps/docs/src/content/docs/editor/guides/testing-behaviors.mdx`

## Limits

- not a better raw editor engine than current Slate v2
- Portable Text categories are CMS/content-profile categories, not raw Slate
  core law
- XState actor orchestration is useful product evidence, not a runtime backbone
  Slate should copy

