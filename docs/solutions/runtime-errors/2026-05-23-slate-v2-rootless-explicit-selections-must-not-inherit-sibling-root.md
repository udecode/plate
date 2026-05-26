---
title: Slate v2 rootless explicit selections must not inherit sibling roots
date: 2026-05-23
category: docs/solutions/runtime-errors
module: slate-v2 multi-root runtime selection
problem_type: runtime_error
component: tooling
symptoms:
  - "Clicking Header editor and then the second Body editor paragraph crashed with Cannot find a descendant at path [1,0]."
  - "The commit after a body click still reported roots:header."
  - "Header view marks tried to read a main-root path."
root_cause: logic_error
resolution_type: code_fix
severity: high
tags: [slate-v2, multi-root, selection, root-location, runtime-view]
---

# Slate v2 rootless explicit selections must not inherit sibling roots

## Problem

After focusing a non-main root, clicking a later paragraph in the main root could
store the main path under the previous root. A header-root marks read then tried
to resolve `[1,0]` inside the header tree and crashed.

## Symptoms

- Runtime overlay: `Cannot find a descendant at path [1,0]`.
- Header then body click produced a body focus but a `roots:header`
  `set_selection` commit.
- The crash stack passed through `state.marks.get()` in
  `runtime-root-engine.ts`.

## What Didn't Work

- Only fixing `useSlateActiveRoot`. That removed a selector rerender loop, but
  did not change how rootless explicit selection targets were rooted.
- Treating the issue as example-owned focus repair. The bad root was created in
  the core runtime transaction path before the example could recover.

## Solution

Keep current-selection-root fallback for implicit edits, but do not let it root
an explicit rootless location on the base runtime. Rootless explicit locations
on the runtime mean `main`; root-bound views still stamp their view root through
the active operation root.

```ts
const getLocationMutationRoot = (
  editor: Editor,
  location: Location
): string | undefined =>
  getExplicitLocationRoot(location) ??
  getActiveMutationRoot(editor) ??
  MAIN_ROOT_KEY
```

Also avoid wrapping a plain `editor.update` in the current selection root. The
per-mutation root resolver already handles implicit operations that should
follow the current selection.

## Why This Works

There are two different cases:

- Implicit mutation: `tx.text.insert('x')` should follow the current selection
  root.
- Explicit rootless location: `tx.selection.set({ path: [1, 0], offset: 0 })`
  on the base runtime should target `main`.

The bug came from collapsing both cases into "current selection root". Splitting
them lets main-root DOM selection imports replace a previous header selection
instead of storing a main path under header ownership.

## Prevention

- Add a core runtime/view contract before patching React symptoms.
- Test the exact root transition: header selection first, then rootless explicit
  runtime selection at a main-only path.
- Assert both the public selection shape and view marks reads; marks catch the
  stale-root/path mismatch that focus checks miss.

## Related Issues

- [Slate v2 multi-root roots must stay natively editable for caret clicks](../ui-bugs/2026-05-21-slate-v2-multi-root-chrome-clicks-must-activate-root-before-focus.md)
- [Slate React multi-root Editable DX needs package-owned root views](../developer-experience/2026-05-23-slate-react-multi-root-editable-dx-needs-package-owned-root-views.md)
