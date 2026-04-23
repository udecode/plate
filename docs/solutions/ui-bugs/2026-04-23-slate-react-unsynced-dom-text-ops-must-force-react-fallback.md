---
title: Slate React unsynced DOM text ops must force React fallback
date: 2026-04-23
category: docs/solutions/ui-bugs
module: Slate v2 slate-react large-document DOM sync
problem_type: ui_bug
component: testing_framework
symptoms:
  - Large-document composition fallback kept visible DOM text at `alpha` after the Slate model inserted `alpha!`.
  - Text operations were hidden from React because the direct DOM sync lane usually owns them.
  - React event tests used bare core editors, so browser event rows missed `slate-react` onChange wiring.
root_cause: async_timing
resolution_type: code_fix
severity: high
tags: [slate-v2, slate-react, dom-sync, composition, large-document, withreact]
---

# Slate React unsynced DOM text ops must force React fallback

## Problem

The direct DOM text lane skipped composition text updates correctly, but React
still treated the text operation as handled by the fast path. The visible DOM
stayed stale while the Slate model moved forward.

## Symptoms

- `Editable falls back to React updates while composing` showed `alpha` in the
  DOM after `Transforms.insertText(editor, '!')`.
- `didSyncTextPathToDOM(editor, [0, 0])` correctly stayed `false`.
- Event-driven large-document tests did not update when rendered with a bare
  `createEditor()` because `withReact` owns the `onChange` bridge.

## What Didn't Work

- Treating every `insert_text` / `remove_text` operation as a React-skip is too
  broad. That only works when direct DOM sync actually mutates the text node.
- Rendering React event tests with a bare core editor is fake evidence. The
  `Editable` event path depends on the React/DOM plugin wrapping `onChange`.
- Calling `collapseToEnd()` during composition repair without a DOM range turns
  an empty browser selection into a runtime exception.

## Solution

Make `syncTextOperationsToDOM(...)` report whether text operations were actually
synced. `Slate` can then force selector updates only when the capability
declines:

```ts
const textSync = syncTextOperationsToDOM(editor, nextOperations)
const hasUnsyncedTextOperation =
  textSync.textOperationCount > textSync.syncedTextOperationCount

handleSelectorChange(hasUnsyncedTextOperation ? undefined : nextOperations)
```

Keep React event fixtures honest:

```ts
const editor = withReact(createEditor())
```

Fail closed during composing selection repair:

```ts
if (domSelection.rangeCount > 0) {
  domSelection.collapseToEnd()
} else {
  domSelection.setBaseAndExtent(
    newDomRange.endContainer,
    newDomRange.endOffset,
    newDomRange.endContainer,
    newDomRange.endOffset
  )
}
```

## Why This Works

Direct DOM sync is a capability, not a blanket render-skip rule. Composition,
custom rendering, projections, placeholders, and other opt-out cases still need
React to render the changed text. Counting attempted text ops versus synced
text ops keeps the fast path fast while preserving fallback correctness.

`withReact(createEditor())` is the real React event fixture because it installs
the DOM/onChange bridge used by `Editable`.

## Prevention

- Direct DOM sync helpers should return capability results, not just mutate
  opportunistically.
- Tests for React event behavior should use `withReact(createEditor())`.
- Composition fallback tests must assert both DOM sync did not run and visible
  DOM still updates through React.
- Selection repair should never assume a browser selection range exists during
  composition.

## Related Issues

- [Slate React model-owned input must ignore stale DOM target ranges](./2026-04-21-slate-react-model-owned-input-must-ignore-stale-dom-target-ranges.md)
- [Slate React keydown must import DOM selection before model-owned navigation](./2026-04-22-slate-react-keydown-must-import-dom-selection-before-model-owned-navigation.md)
- [Slate React focus restore must fail closed on transient DOM point gaps](../logic-errors/2026-04-09-slate-react-focus-restore-must-fail-closed-on-transient-dom-point-gaps.md)
