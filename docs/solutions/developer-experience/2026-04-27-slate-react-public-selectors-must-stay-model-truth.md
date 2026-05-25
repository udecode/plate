---
title: Slate React public selectors must stay model-truth
date: 2026-04-27
category: docs/solutions/developer-experience
module: slate-v2 slate-react runtime selectors
problem_type: developer_experience
component: tooling
symptoms:
  - Public selector options exposed a mounted-render optimization as an app-facing policy.
  - Generic selectors could be made stale to preserve direct DOM text-sync performance.
  - React files imported core live-read internals directly across components, hooks, and event owners.
root_cause: wrong_api
resolution_type: code_fix
severity: high
tags: [slate-v2, slate-react, selectors, live-read, runtime, dx, performance]
---

# Slate React public selectors must stay model-truth

## Problem

`slate-react` needs direct DOM text-sync performance without letting public app
selectors lie about the model. The same runtime also needs live node, text, and
selection reads without scattering `slate/internal` imports across React
components and event modules.

## Symptoms

- `skipSyncedTextOperations` appeared on generic selector options.
- Public `useNodeSelector` / `useTextSelector` and mounted editor render
  subscriptions shared the same stale-data knob.
- Direct `slate/internal` live reads appeared in hooks, components, browser
  handles, selection reconciliation, DOM repair, Android input, and clipboard
  code.
- The optimization was easy to preserve locally by making too much React code
  aware of core internals.

## What Didn't Work

- Keeping `skipSyncedTextOperations` as a public selector option. That makes a
  render optimization look like a truth policy.
- Broadening `forceRender()` after direct text sync. That hides stale selector
  boundaries by waking React instead of fixing ownership.
- Letting every hot file import `getEditorLive*` from `slate/internal`. That
  spreads fallback policy and selection authority across too many files.

## Solution

Split selector truth from mounted render policy.

Public selectors stay model-truth-only:

```ts
useNodeSelector(selector, equalityFn, options)
useTextSelector(selector, equalityFn, options)
```

Internal mounted render subscribers carry the direct-DOM-sync skip policy:

```ts
useMountedNodeRenderSelector(selector, equalityFn, options)
useMountedTextRenderSelector(selector, equalityFn, options)
```

Under the hood, keep one shared selector implementation and make only the
update policy internal:

```ts
type RuntimeSelectorUpdatePolicy =
  | 'model-truth'
  | 'skip-synced-text-render'
```

Then move core live reads behind React-owned runtime facades:

```ts
// editable/runtime-live-state.ts
readRuntimeNode(editor, path)
readRuntimeText(editor, path)
readRuntimeNodeById(editor, runtimeId)
readRuntimeTextById(editor, runtimeId)

// editable/runtime-selection-state.ts
readLiveSelection(editor)
readRuntimeSelection(editor)

// editable/runtime-mutation-state.ts
writeRuntimeMarks(editor, marks)
writeRuntimeSelection(editor, selection)
writeTargetRuntime(editor, targetRuntime)
```

The public barrel exports only the public selector hooks and types. Internal
mounted render hooks are source-internal imports used by renderer code.

## Why This Works

Selector truth and render invalidation are different contracts.

App code asks selectors for the current model. If a public selector can skip a
text commit because the browser already owns the visible DOM text, the selector
API is lying to consumers.

Mounted editor text and block renderers have a narrower job: avoid React churn
when direct DOM sync already owns visible text. That optimization is valid, but
only as an internal render subscription policy.

The live-read facades create one runtime-owned place for fallback order,
runtime-id lookup, selection read policy, marks writes, and target-runtime
writes. Components and event handlers depend on the React runtime boundary, not
core internals.

## Prevention

- Public selectors must observe model truth. Do not add stale-data options to
  app-facing selector hooks.
- Performance skips belong to internal mounted render subscriptions with
  contract tests that prove non-text commits still invalidate.
- Keep `slate/internal` live reads behind runtime facade modules and guard that
  with a static test.
- Pair package contracts with browser rows for toolbar, mentions, tables,
  images, search highlighting, generated paste/undo, and full browser sweep
  when making release-quality runtime claims.
- Treat a `bun check:full` retry as residual flake risk. If the exact row fails
  again without retries, keep the lane open.

## Related Issues

- [Slate React history hotkeys must repair DOM after model undo](../ui-bugs/2026-04-21-slate-react-history-hotkeys-must-repair-dom-after-model-undo.md)
- [Slate React selection export listeners must skip DOM-owned selection](../ui-bugs/2026-04-27-slate-react-selection-export-listeners-must-skip-dom-owned-selection.md)
- [Slate React rerender breadth is mostly local and useSlate is the only broad hook left](../performance-issues/2026-04-11-slate-react-rerender-breadth-is-mostly-local-and-useSlate-is-the-only-broad-hook-left.md)
- [Slate React void renderers should not own hidden children](./2026-04-27-slate-react-void-renderers-should-not-own-hidden-spacer-children.md)
