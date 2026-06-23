---
title: Plite bookmarks through replace_children should follow surviving text before same-position fallback
date: 2026-05-14
category: docs/solutions/logic-errors
module: plite bookmarks
problem_type: logic_error
component: tooling
symptoms:
  - Persistent annotation anchors resolved to null after fragment insertion before the anchored text.
  - The annotation store could not project a range after root runtime order changed.
  - Browser proof showed the document still contained the anchored text, but the bookmark had already failed closed.
root_cause: logic_error
resolution_type: code_fix
severity: medium
tags: [plite, bookmarks, replace-children, annotations, projections, browser-proof]
---

# Plite bookmarks through replace_children should follow surviving text before same-position fallback

## Problem

Persistent annotation anchors failed after a fragment insert before the anchored
text. The document still contained the logical text, but the bookmark backing
the annotation resolved to `null`, so the React annotation store projected
`none`.

## Symptoms

- `persistent-annotation-anchors` expected `comment-anchor:8-11`, but rendered
  `none`.
- A package regression for root runtime order changes expected `1.0:8|1.0:11`,
  but got `none`.
- After the first fix attempt, projection threw `Cannot project a range outside
  the committed snapshot` because replacement paths were rebased incorrectly.

## What Didn't Work

- Treating this as an annotation-store candidate refresh bug was too shallow.
  The store was refreshing, but the underlying bookmark had already been nulled.
- Generic `RangeApi.transform(..., replace_children)` was not enough. It must
  fail closed for ordinary refs inside a replaced child window, but bookmarks
  are durable anchors and can preserve more intent.
- Prefixing replacement paths with `op.path.concat(op.index)` was wrong for
  child-list replacement. It produced paths like `[0,1,0]` instead of rebasing
  the replacement-window child index to `[1,0]`.

## Solution

Keep generic point/range refs conservative, but give bookmarks a
`replace_children` transform that:

1. detects points inside the replaced child window,
2. first maps them to a unique surviving text occurrence in `newChildren`,
3. falls back to same relative path/offset when no surviving text match exists,
4. fails closed when neither mapping is valid.

The core regression should use the public editor path, not React:

```ts
const bookmark = Editor.bookmark(
  editor,
  createRange({ path: [0, 0], offset: 1 }, { path: [0, 0], offset: 4 })
)

editor.update((tx) => {
  tx.selection.set({
    anchor: { path: [0, 0], offset: 0 },
    focus: { path: [0, 0], offset: 0 },
  })
  tx.fragment.insert([
    { type: 'paragraph', children: [{ text: 'intro-a' }] },
    { type: 'paragraph', children: [{ text: 'intro-b' }] },
  ])
})

assert.deepEqual(bookmark.resolve(), {
  anchor: { path: [1, 0], offset: 8 },
  focus: { path: [1, 0], offset: 11 },
})
```

Keep the React annotation-store test as the integration proof that refreshed
projections can see the rebased bookmark after root runtime ids change.

## Why This Works

`replace_children` is intentionally broad: it can represent a paste,
canonical remote reconcile, or fragment replacement. Ordinary refs inside the
replaced window cannot assume semantic continuity, so they should still null.

Bookmarks are different. They are durable annotation-style anchors. If the old
text leaf survives uniquely inside the replacement, the bookmark can follow
that text. If the replacement is a canonical same-position swap, the bookmark
can preserve the same relative path and offset. If neither condition is true,
failing closed remains the correct behavior.

## Prevention

- When persistent anchors fail after paste or fragment insertion, inspect the
  bookmark transform before patching projection stores.
- Add core bookmark tests for document-operation rebasing, then React store
  tests for projection refresh. Do not let React tests be the only proof.
- For `replace_children`, keep ordinary refs conservative and make bookmark
  behavior explicit. Durable anchors and normal refs do not have the same
  contract.
- Path rebasing for replacement windows must adjust the first relative child
  index: `op.path.concat(op.index + relativeChildIndex, childPath)`.

## Related Issues

- [Persistent anchor browser examples must follow current content not initial runtime ids](./2026-04-04-persistent-anchor-browser-examples-must-follow-current-content-not-initial-runtime-ids.md)
- [Plite range refs must be transaction-aware and default inward](./2026-04-03-plite-range-refs-must-be-transaction-aware-and-default-inward.md)
- [Persistent range ref projections belong in a React hook not the headless store](./2026-04-03-persistent-range-ref-projections-belong-in-a-react-hook-not-the-headless-store.md)
- [Annotation store inputs must keep stable data references](./2026-04-15-annotation-store-inputs-must-keep-stable-data-references.md)
