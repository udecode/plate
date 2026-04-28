---
title: Lexical read/update extension runtime
type: source
status: accepted
updated: 2026-04-23
source_refs:
  - ../raw/lexical/repo/packages/lexical-website/docs/intro.md
  - ../raw/lexical/repo/packages/lexical-website/docs/concepts/editor-state.md
  - ../raw/lexical/repo/packages/lexical-website/docs/concepts/updates.md
  - ../raw/lexical/repo/packages/lexical-website/docs/concepts/commands.md
  - ../raw/lexical/repo/packages/lexical-website/docs/concepts/transforms.md
  - ../raw/lexical/repo/packages/lexical-website/docs/extensions/intro.md
  - ../raw/lexical/repo/packages/lexical-website/docs/extensions/design.md
  - ../raw/lexical/repo/packages/lexical/src/LexicalUpdateTags.ts
related:
  - docs/research/entities/lexical.md
  - docs/research/decisions/slate-v2-read-update-runtime-architecture.md
---

# Lexical read/update extension runtime

## Purpose

Compile the Lexical evidence that matters to Slate v2's final read/update
runtime architecture.

## Strongest Evidence

- Lexical makes `editor.update(...)` the normal way to mutate editor state.
- Lexical makes `editor.read(...)` and `editorState.read(...)` the coherent
  read boundary.
- update/read closures are synchronous and carry active editor-state context.
- command handlers run inside an update context.
- update tags carry history, paste, collaboration, scroll, DOM-selection, focus,
  and composition policy.
- node transforms run during the update lifecycle before DOM reconciliation.
- dirty leaves and dirty elements drive transform/reconcile work.
- extensions bundle configuration, registration, dependency declaration, and
  runtime output.

## What To Steal

### 1. Read/update lifecycle naming

`editor.update` is a better public name than `withTransaction` or `command` for
the write boundary. `editor.read` is the matching read boundary.

Slate v2 should use:

```ts
editor.read(() => {
  editor.getSelection()
})

editor.update(() => {
  editor.setNodes({ type: 'heading-one' })
})
```

### 2. Contextual read/write legality

Lexical makes helper functions depend on active read/update context. Slate v2
should not copy `$` naming, but it should copy the rule:

- coherent reads belong in `editor.read`
- writes belong in `editor.update`
- writes from read context should fail in development/test

### 3. Tags as lifecycle metadata

Slate v2 should adopt update tags as commit metadata:

- `history-push`
- `history-merge`
- `paste`
- `collaboration`
- `skip-dom-selection`
- `skip-scroll`
- `composition-start`
- `composition-end`

Tags should inform history, collaboration, React runtime, and DOM repair. They
should not be normal app-command policy objects.

### 4. Dirty-node discipline

Lexical tracks dirty leaves and elements below rendering. Slate v2 should adapt
that to:

- dirty paths
- dirty runtime ids
- dirty top-level ranges
- text/structural/selection/mark operation classes

React should consume this commit data instead of rediscovering it from full
snapshots.

### 5. Extension dependency graph

Lexical Extensions exist because configuration and registration often need to
travel together. Slate v2 should steal that concept for Plate/Yjs migration:

- extension methods
- normalizers
- command handlers
- commit listeners
- dependencies / peer dependencies
- runtime output

## What Not To Steal

- Do not copy Lexical's class-based node model.
- Do not copy `$function` naming.
- Do not replace React with a full Lexical-style DOM reconciler as the main
  rendering story.
- Do not make commands the normal user-facing mutation API.

## Take For Slate v2

The final Slate v2 public runtime should be:

```txt
editor.read
editor.update
primitive methods inside update
commit metadata after update
React runtime consumes live reads and dirty commits
```

`tx.resolveTarget()` remains useful internally, but the public architecture is
read/update lifecycle discipline.
