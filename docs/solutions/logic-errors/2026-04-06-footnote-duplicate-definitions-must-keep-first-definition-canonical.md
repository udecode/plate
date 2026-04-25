---
title: Footnote duplicate definitions must keep the first definition canonical
date: 2026-04-06
last_updated: 2026-04-06
category: logic-errors
module: footnote
problem_type: logic_error
component: footnote_registry_and_ui
symptoms:
  - "Multiple footnote definitions with the same identifier all looked equally valid"
  - "A later duplicate definition could still show backlink behavior even though references really belonged to the first definition"
  - "The product could warn about duplicates, but it could not repair them"
root_cause: duplicate_definition_semantics_missing
resolution_type: code_change
severity: medium
tags:
  - footnote
  - duplicate-definition
  - registry
  - navigation
  - normalization
  - ui
---

# Footnote duplicate definitions must keep the first definition canonical

## Problem

Footnote duplicate definitions were only half-modeled.

The registry already sorted definitions by document order, so the first
definition quietly won for preview and navigation. But later duplicate
definitions still rendered like valid definitions, including backlink behavior,
which made the UI lie about which definition references actually resolved to.

## What Didn't Work

- Treating duplicate detection as enough on its own
- Letting later duplicate definitions keep the same backlink affordance as the
  canonical definition
- Renumber repair as an app-only guess instead of a package-owned transform

## Solution

Make the first definition canonical and treat later duplicates as explicit
invalid siblings.

At the package layer:

- `api.footnote.duplicateDefinitions({ identifier })` returns later duplicate
  definitions only
- `api.footnote.isDuplicateDefinition({ path })` answers whether a specific
  definition is one of those later duplicates
- `tf.footnote.normalizeDuplicateDefinition({ path, identifier? })` renumbers a
  later duplicate definition to an explicit new identifier

At the app layer:

- later duplicate definition blocks render an invalid-warning state
- later duplicates do not pretend they can backlink to the same references
- the repair button renumbers the duplicate to the next free identifier

That keeps the real resolution model visible instead of hiding it behind a
warning-only surface.

## Why This Works

References for one identifier cannot meaningfully belong to multiple different
definition blocks at once.

So the runtime needs one winner.

The registry already had the right implicit winner: first definition in
document order. The fix was to stop letting the rest of the system act like all
duplicates were equivalent.

Once the package exposes canonical-vs-duplicate semantics directly, the UI can
render later duplicates as invalid and the repair flow can be explicit instead
of magical.

The follow-up UI fix mattered too: duplicate-warning chrome cannot rely on
`useNodePath` when sibling edits can shift the surviving definition to a new
path. `useNodePath` does not update for that case. The warning state needs to
derive from the current editor path via `editor.api.findPath(element)` inside a
live selector.

## Verification

These checks passed:

```bash
pnpm install
pnpm brl
bun test packages/footnote/src/lib/BaseFootnotePlugins.spec.ts packages/footnote/src/lib/queries/footnoteRegistry.spec.ts packages/footnote/src/lib/transforms/insertFootnote.spec.ts apps/www/src/registry/ui/footnote-node.spec.tsx
pnpm turbo build --filter=./packages/footnote --filter=./apps/www
pnpm turbo typecheck --filter=./packages/footnote --filter=./apps/www
pnpm lint:fix
```

Browser verification on `http://localhost:3000/docs/footnote`:

- before repair, the duplicate definition showed a warning and a
  `Renumber to [^4]` action
- after clicking the repair action, the warning and renumber button disappeared

## Prevention

- If one document entity can have duplicates, the runtime must still declare a
  canonical winner instead of leaving the UI to guess
- Do not let invalid duplicates keep navigation affordances that belong only to
  the canonical entity
- Put repair semantics in package transforms, not app-only event handlers
- When suggesting a replacement identifier, use the shared “next free”
  allocator so repair does not collide with existing references or definitions
- Do not use `useNodePath` for validity state that must survive sibling
  insertions, removals, or merges; derive current path from the live editor
  state instead

## Related Issues

- [registry.ts](packages/footnote/src/lib/registry.ts)
- [getFootnoteDefinition.ts](packages/footnote/src/lib/queries/getFootnoteDefinition.ts)
- [normalizeDuplicateFootnoteDefinition.ts](packages/footnote/src/lib/transforms/normalizeDuplicateFootnoteDefinition.ts)
- [footnote-node.tsx](apps/www/src/registry/ui/footnote-node.tsx)
