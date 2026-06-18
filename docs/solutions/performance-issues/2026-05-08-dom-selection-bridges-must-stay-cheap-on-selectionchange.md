---
title: DOM selection bridges must stay cheap on selectionchange
date: 2026-05-08
category: docs/solutions/performance-issues
module: Slate v2 DOM selection bridge
problem_type: performance_issue
component: tooling
symptoms:
  - A private DOM selection bridge can quietly add allocation and DOM scan cost to every native selectionchange.
  - Classification details can leak into public React hooks even though apps only need model Range or null state.
  - Collaboration and cursor overlays can accidentally depend on raw DOM ranges instead of deterministic model ranges.
root_cause: inadequate_documentation
resolution_type: documentation_update
severity: high
tags:
  [slate-v2, dom-selection, selectionchange, performance, react-runtime, yjs]
---

# DOM selection bridges must stay cheap on selectionchange

## Problem

DOM selection import needs explicit ownership classification, but
`selectionchange` is a hot browser path. A clean bridge can become slow if it
allocates structured reason objects, scans arbitrary DOM, or exposes classifier
details through public React APIs.

## Symptoms

- The plan wants fail-closed classification for foreign, stale, nested, or
  app-owned DOM selection ranges.
- The runtime already throttles native `selectionchange`, but classification
  still runs on a frequent browser event.
- Plate, Yjs, cursor overlays, and public hooks need deterministic model
  selection output, not raw DOM range ownership details.

## What Didn't Work

- Returning rich result objects from the hot path by default. That is useful for
  tests and debug traces, but it is avoidable churn for ordinary browser events.
- Treating public hooks as the right place for bridge reasons. Apps should not
  author DOM selection policy to keep Slate usable.
- Solving migration pressure by leaking raw DOM ranges into collaboration
  adapters. That couples deterministic editor state to transient browser state.

## Solution

Keep the bridge private and make the hot path primitive:

- classify with finite string reasons and `Range | null`;
- do cheap containment/root/path checks before conversion;
- avoid full DOM scans in normal `selectionchange` handling;
- reserve rich debug objects for tests, traces, or non-hot diagnostics;
- keep React listeners in the runtime root;
- expose app-facing state through existing selector hooks, not a new bridge API;
- send Plate/Yjs/cursor overlays model `Range | null` state only.

The execution plan records the specific source owners:

- `packages/slate-react/src/editable/runtime-selection-engine.ts`
  owns native `selectionchange` throttling.
- `packages/slate-react/src/editable/selection-runtime.ts` and
  `packages/slate-react/src/hooks/use-editor-selector.tsx` own
  selection fanout filters.
- `packages/slate-react/src/editable/selection-controller.ts` owns
  fast DOM selection range creation, fail-closed import, model export, and
  scroll timing.
- `packages/slate-react/src/editable/runtime-root-engine.ts` owns
  React listener/effect wiring.

## Why This Works

`selectionchange` can fire often and can be triggered by both user action and
runtime repair. The editor should decide ownership before importing DOM state,
but that decision should not allocate a fresh object graph or traverse broad DOM
on every event.

Keeping bridge reasons private also preserves Slate's API shape. Public
consumers care whether the model selection is a `Range` or `null`; they should
not need to understand stale DOM, nested editor, shadow-root, or app-owned
selection classifications.

## Prevention

- Add classifier unit tests for foreign, stale, app-owned, nested, and shadow
  DOM selections before adding browser rows.
- Add selection runtime contract tests that prove classification happens before
  conversion and that listener ownership stays in the runtime root.
- Add one issue-shaped browser proof before any `Fixes #...` claim.
- Reject bridge changes that add broad DOM scans, per-event rich objects, public
  classifier hooks, or raw DOM range outputs to collaboration adapters.

## Related Issues

- [Slate React foreign DOM selections must be ignored before import](../logic-errors/2026-05-06-slate-react-foreign-dom-selections-must-be-ignored-before-import.md)
- [Slate browser selectionchange proof must separate traceability from programmatic import](../test-failures/2026-04-22-slate-browser-selectionchange-proof-must-separate-traceability-from-programmatic-import.md)
- [Slate React repair-induced selectionchange must stay model-owned](../ui-bugs/2026-04-25-slate-react-repair-induced-selectionchange-must-stay-model-owned.md)
- [Slate React runtime owner cuts need static inventories and browser proof](../developer-experience/2026-04-27-slate-react-runtime-owner-cuts-need-static-inventories-and-browser-proof.md)
