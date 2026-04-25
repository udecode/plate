---
title: Table root clicks must recover selection
date: 2026-04-25
category: ui-bugs
module: packages/table
problem_type: ui_bug
component: documentation
symptoms:
  - Clicking an unmapped editor root region near a table can leave browser selection outside Slate text.
  - Typing or pasting after the click can throw `Cannot resolve a Slate point from DOM point`.
  - Text can render outside the Plate value when the native browser edit is not intercepted.
root_cause: logic_error
resolution_type: code_fix
severity: high
tags:
  - plate
  - slate
  - table
  - selection
  - dom-selection
  - root-click
  - toslaterange
---

# Table root clicks must recover selection

## Problem

On `/docs/table`, clicking editor padding or another unmapped root region near a table could move the browser selection to the contentEditable root instead of a Slate text node. The next typed character or paste could then run through Slate React with a DOM point that has no Slate point.

## Symptoms

- Browser console error: `Cannot resolve a Slate point from DOM point`.
- The clicked target can be the editor root with `data-slate-node="value"`, not a mapped descendant.
- Typed text can appear outside the editor value if the native browser edit is allowed to proceed.

## What Didn't Work

- Adding paragraph normalization around adjacent tables was too broad. It shifted path-targeted table transforms, including insert and margin operations that intentionally address a specific top-level table path.
- Treating any ancestor with `data-slate-node` as mapped was wrong. `data-slate-node="value"` identifies the editor root, not a selectable Slate descendant.

## Solution

Handle table editor `mousedown` events on unmapped root regions. If the click is inside the editable, not on a mapped Slate descendant, and the editor contains a table, prevent the native edit path and select the closest valid Slate point.

```ts
const hasMappedSlateTarget = (target: EventTarget | null) => {
  const slateNode = getTargetElement(target)?.closest('[data-slate-node]');

  return !!slateNode && slateNode.getAttribute('data-slate-node') !== 'value';
};
```

The handler then chooses the nearest top-level child by vertical click position and selects either that child start or end point.

## Why This Works

Slate React can only translate DOM points that belong to mapped Slate nodes. Root-level contentEditable clicks can still produce a DOM target inside the editor, but the root is not enough information to resolve a text point. Intercepting those clicks before the browser edits the DOM keeps selection inside Slate and makes typing or paste use the editor transforms.

## Prevention

- Do not count `data-slate-node="value"` as a mapped Slate target in DOM event guards.
- Prefer explicit selection recovery for root/unmapped clicks over structural normalization that changes document paths.
- Add browser proof for DOM selection bugs. Unit tests catch the guard, but only the browser proves native typing stays inside the editor value.

## Related Issues

- GitHub issue: https://github.com/udecode/plate/issues/4956
- Related learning: `docs/solutions/ui-bugs/2026-03-30-docs-demos-must-clone-reusable-values-per-editor.md`
