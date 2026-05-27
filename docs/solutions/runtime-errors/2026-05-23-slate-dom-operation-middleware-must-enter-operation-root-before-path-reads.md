---
title: Slate DOM operation middleware must enter operation roots before path reads
date: 2026-05-23
category: docs/solutions/runtime-errors
module: slate-v2 slate-dom multi-root history
problem_type: runtime_error
component: tooling
symptoms:
  - Multi-root undo crashed with "Cannot find a descendant at path [1] in node {\"api\":{}}"
  - Replaying a main-root history batch while a header view was focused read the path from the header root
root_cause: scope_issue
resolution_type: code_fix
severity: high
tags: [slate-v2, slate-dom, multi-root, history, operation-root, middleware]
---

# Slate DOM operation middleware must enter operation roots before path reads

## Problem

Multi-root history replay could crash when undoing a batch from one root while another root was focused.

The core replay path was already root-aware, but `slate-dom` operation middleware read model paths before `next(op)` handed the operation to core apply.

## Symptoms

- Browser crash after editing several roots and undoing repeatedly.
- Stack pointed through `packages/slate-dom/src/plugin/with-dom.ts` `getMatches`.
- Error: `Cannot find a descendant at path [1] in node: {"api":{}}`.

## What Didn't Work

- Patching `slate-history` selection filters would not fix this. The failing operation already carried the right root.
- Ignoring missing DOM paths in `slate-dom` would hide the crash while leaving DOM key repair scoped to the wrong root.
- Core-only replay tests were not enough because they bypassed the DOM middleware that reads paths before core apply.

## Solution

Wrap the DOM operation middleware body with `withOperationRootChildren(e, op, ...)`.

That scopes all pre-apply and post-apply path reads to the operation root:

```ts
apply({ operation: op, next }) {
  withOperationRootChildren(e, op, () => {
    const matches: [Path, Key][] = []
    const pathRefMatches: [PathRef, Key][] = []

    // pre-apply path/key collection
    // next(op)
    // post-apply NODE_TO_KEY repair
  })
}
```

The regression belongs in `slate-dom`, not only `slate`, because the bug lives in middleware ordering around DOM key preservation.

```ts
const runtime = createEditorRuntime({
  extensions: [history(), dom()],
  initialValue: {
    roots: {
      header: [paragraph('header')],
      main: [paragraph('first'), paragraph('second')],
    },
  },
})

mainEditor.update((tx) => {
  tx.selection.set({
    anchor: { path: [1, 0], offset: 'second'.length },
    focus: { path: [1, 0], offset: 'second'.length },
  })
  tx.text.insert('!')
})

headerEditor.update((tx) => {
  tx.history.undo()
})
```

## Why This Works

Operation root ownership is not only a core apply concern.

Any middleware that reads model paths before calling `next(op)` must enter the same operation root that core apply will use later. Otherwise a valid `main` operation at `[1, 0]` can be looked up inside `header`, where `[1]` does not exist.

## Prevention

- If operation middleware calls `Editor.levels`, `NodeApi.get`, `Editor.pathRef`, or `state.nodes.get` using an operation path, wrap that work in the operation root first.
- Multi-root replay regressions should include sibling roots with different shapes. A single paragraph in every root lets wrong-root path reads pass accidentally.
- Browser proof should include repeated undo across roots, including a non-active root operation whose path cannot exist in the focused root.

## Related Issues

- [Slate operation replay should use applyOperations, operation middleware, and commit subscribers](../developer-experience/2026-04-19-slate-public-single-op-writes-should-use-editor-apply-and-keep-onchange-behind-subscribers.md)
- [Slate history leading selection imports are batch preconditions](../logic-errors/2026-05-13-slate-history-leading-selection-imports-are-batch-preconditions.md)
- [Editable blocks app-owned surfaces must not churn runtime ids or miss plain editor updates](../logic-errors/2026-04-20-editable-blocks-app-owned-surfaces-must-not-churn-runtime-ids-or-miss-plain-editor-updates.md)
