---
module: Discussion
date: 2026-04-05
problem_type: performance_issue
component: plugin_system
symptoms:
  - "Block discussion rendering mixed ownership resolution, document scans, and popover UI state in the same component tree"
  - "Suggestion resolution scanned the full editor once per suggestion id, which grows with both document size and annotation count"
  - "Comment and suggestion ownership relied on render-time mutation of plugin state via uniquePathMap"
root_cause: logic_error
resolution_type: code_fix
severity: medium
tags:
  - discussion
  - comment
  - suggestion
  - rendering
  - performance
  - caching
  - slate
---

# Block discussion should build a shared annotation index once per editor version

## Problem

`block-discussion.tsx` and `block-suggestion.tsx` were doing too much work at render time.

The discussion card needed one core answer: which top-level block owns a given comment or suggestion thread. The old implementation answered that indirectly:

- keep a mutable `uniquePathMap` in plugin options
- repair that map during render
- for suggestions, rescan the full document once per suggestion id

That kept the behavior working, but it made the render path harder to reason about and more expensive than necessary.

## Symptoms

- The ownership rule lived in two places, one for comments and one for suggestions.
- Comment and suggestion hooks wrote back into plugin state during render.
- Suggestion resolution used `editor.api.nodes({ at: [] })` inside an id loop, so one render could trigger many full-document scans.
- The UI component needed to understand ownership repair details instead of just rendering resolved items.

## Solution

Build a shared derived index once per editor version, then let each block read from that index.

### 1. Scan the document once

Create a dedicated helper that walks editor entries once and derives:

- the first top-level block that owns each comment id
- the first top-level block that owns each suggestion id
- grouped suggestion entries by suggestion id

### 2. Resolve suggestions from grouped entries

Instead of rescanning the full editor per suggestion id, reuse the grouped entries collected during the single document pass.

That keeps suggestion reconstruction local to each id's collected entries while preserving cross-block ownership rules.

### 3. Cache by editor version

Use `useEditorVersion()` as the invalidation signal and store the derived index in a `WeakMap` keyed by editor.

That gives one index build per editor version, even if many `BlockDiscussion` wrappers render in the same pass.

### 4. Keep block components render-focused

`BlockDiscussion` now asks for resolved discussions and suggestions with:

```ts
const { resolvedDiscussions, resolvedSuggestions } =
  useBlockDiscussionItems(blockPath);
```

The UI component no longer owns the cross-block resolution algorithm.

## Why This Works

The expensive question is not "what should this one block render?" The expensive question is "what annotation ids exist in the editor, and which top-level block owns each one?"

That second question is global. Treating it as per-block local work forces repeated scans and state repair.

Treating it as a shared derived index makes the ownership rule explicit:

- derive once from editor state
- cache for the current editor version
- let blocks do cheap lookups

This removes render-time plugin mutation and changes the hot path from repeated document rescans to one shared pass.

## Prevention

- Do not repair ownership maps during render for block-level annotation UI.
- If multiple wrappers need the same document-wide ownership answer, compute it once at editor scope.
- Avoid `editor.api.nodes({ at: [] })` inside per-id loops when the ids all come from the same document snapshot.
- Extract document-wide resolution into a pure helper first, then wrap it in a small hook with version-based caching.

## Verification

These checks passed:

```bash
bun test apps/www/src/registry/ui/block-discussion-index.spec.ts
corepack pnpm install
corepack pnpm turbo build --filter=./apps/www
corepack pnpm turbo typecheck --filter=./apps/www
corepack pnpm lint:fix
```

The focused spec covers the critical ownership behavior:

- cross-block comments stay anchored to the first block that owns the discussion id
- cross-block suggestion entries are grouped once under the owner block
