---
title: Slate mentions portal positioning must fail closed on transient DOM range gaps
date: 2026-04-23
category: docs/solutions/ui-bugs
module: Slate v2 mentions example
problem_type: ui_bug
component: testing_framework
symptoms:
  - Mentions portal did not appear after typing an at-mention trigger.
  - The example crashed while positioning the portal after text insertion.
  - Browser tests waited for the portal while the page showed the React error fallback.
root_cause: async_timing
resolution_type: code_fix
severity: high
tags: [slate-v2, mentions, portal, dom-range, autocomplete, browser-editing]
---

# Slate mentions portal positioning must fail closed on transient DOM range gaps

## Problem

The mentions example can compute a valid model target while the matching DOM
node is not yet resolvable. Positioning the portal with `ReactEditor.toDOMRange`
must not crash the whole example during that transient gap.

## Symptoms

- `mentions example › shows list of mentions` failed because the portal count
  stayed `0`.
- The page displayed the React error fallback.
- The thrown error was `Cannot resolve a DOM node from Slate node`.

## What Didn't Work

- Changing the test to semantic handle insertion did not open the portal.
- Switching the example from `editor.selection` to `Editor.getLiveSelection`
  was correct but not sufficient.
- Treating the failure as a kernel bug was too broad; the model trigger state
  was valid, but portal positioning crashed.

## Solution

Make portal positioning fail closed:

```ts
let domRange: globalThis.Range
try {
  domRange = ReactEditor.toDOMRange(editor, target)
} catch {
  return
}
```

Also make the test select the intended mention insertion point and place the DOM
selection, not just the model selection.

## Why This Works

Autocomplete state is model-owned, but portal placement is DOM-owned. During
text insertion React can temporarily lack a DOM node for the exact target range.
Failing closed keeps the portal state alive and lets the next stable render
position it instead of crashing the example.

## Prevention

- For portal/autocomplete rows, assert model text and model selection before
  blaming the kernel.
- Browser helpers that claim native typing must place DOM selection, not only
  Slate model selection.
- Any UI positioning based on `ReactEditor.toDOMRange` should tolerate transient
  DOM bridge gaps.

## Related Issues

- [Slate React model-owned input must ignore stale DOM target ranges](../ui-bugs/2026-04-21-slate-react-model-owned-input-must-ignore-stale-dom-target-ranges.md)
- [Slate browser selectionchange proof must separate traceability from programmatic import](../test-failures/2026-04-22-slate-browser-selectionchange-proof-must-separate-traceability-from-programmatic-import.md)
