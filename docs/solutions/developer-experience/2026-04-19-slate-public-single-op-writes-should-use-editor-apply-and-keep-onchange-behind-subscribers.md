---
title: Slate operation replay should use applyOperations, operation middleware, and commit subscribers
date: 2026-04-19
last_updated: 2026-04-25
category: developer-experience
module: slate-v2
problem_type: developer_experience
component: tooling
symptoms:
  - public single-operation writes still made replaceable instance editor.apply look like the extension point
  - React and history paths still had pressure to use editor.onChange for post-commit observation
  - DOM runtime operation interception depended on monkeypatching editor.apply
  - tests kept reaching for deleted editor.selection and editor.marks mirrors after the public mutable-field cut
root_cause: wrong_api
resolution_type: code_fix
severity: high
tags: [slate, slate-v2, applyoperations, operation-middleware, commit-subscribers, transaction, update-runtime]
---

# Slate operation replay should use applyOperations, operation middleware, and commit subscribers

## Problem

Slate v2 cannot claim an authoritative `editor.update` / commit runtime while
`editor.apply` and `editor.onChange` are still viable extension points.

The correct shape is:

- `editor.applyOperations(...)` for explicit operation import/replay
- `editor.extend({ operationMiddlewares })` for low-level operation interception
- `Editor.subscribe(...)` and `Editor.registerCommitListener(...)` for
  observation
- readonly low-level `editor.apply` as machinery, not plugin API

## Symptoms

- Assigning `editor.apply = ...` still worked in contracts and encouraged
  monkeypatch plugins.
- `editor.onChange = ...` still appeared in tests as a reentry/observation
  hook.
- `slate-dom` wrapped `apply` to keep DOM node maps synchronized around
  operations.
- React composition, clipboard, selection, and Android code still read
  `editor.selection` / `editor.marks` after those public mirrors were cut.
- History fixture runners compared `editor.children` / `editor.selection`
  directly instead of snapshot accessors.

## What Didn't Work

- Keeping `Editor.apply(editor, op)` as the only explicit public single-op seam.
  It still left instance `editor.apply` looking like the thing plugin authors
  should replace.
- Treating `editor.onChange` as "after subscribers" compatibility. The callback
  still looked like commit authority and kept reentry tests pointed at the wrong
  abstraction.
- Restoring public read-only `selection` or `marks` mirrors to make React code
  compile. That would reintroduce the stale-state habit the architecture is
  cutting.

## Solution

Seal the legacy extension points and name the real ones.

```ts
editor.applyOperations([
  {
    type: 'insert_text',
    path: [0, 0],
    offset: 5,
    text: '!',
  },
])
```

Use operation middleware when a runtime package needs to observe or wrap
low-level operations:

```ts
editor.extend({
  name: 'operation-spy',
  operationMiddlewares: [
    ({ operation }, next) => {
      // pre-operation bookkeeping
      next(operation)
      // post-operation bookkeeping
    },
  ],
})
```

Use commit subscribers for observation:

```ts
const unsubscribe = Editor.subscribe(editor, (_snapshot, commit) => {
  if (!commit) return

  // history, React, and runtime observers consume commit metadata here
})
```

Implementation details that matter:

- `BaseEditor` does not expose `onChange`.
- `createEditor()` defines instance `apply` as non-writable and
  non-configurable.
- `applyOperations(...)` runs through the transaction/update pipeline.
- `slate-dom` operation interception composes through extension middleware.
- React `<Slate onChange>` remains a component prop, but it is backed by
  snapshot/commit subscription instead of `editor.onChange`.
- History undo/redo replays operation batches with `applyOperations(...)`.
- React runtime code reads current state through `getSelection()` and
  `getMarks()`.

## Why This Works

The design separates three jobs that legacy `apply`/`onChange` blurred:

- operation replay is an explicit API
- operation interception is extension middleware
- observation is commit subscription

That keeps plugins powerful without letting them replace the core operation
applier or observe stale callback timing.

It also aligns with the broader Slate v2 architecture:

- `editor.update` owns local writes
- transactions own operation application
- `EditorCommit` owns runtime observation
- React consumes snapshots/commits instead of mutable editor fields

## Prevention

- Do not document instance `editor.apply` as plugin API.
- Do not add `editor.onChange` back to `BaseEditor`.
- If a runtime needs operation wrapping, add an operation middleware.
- If a runtime needs observation, subscribe to commits.
- If a test needs to replay raw operations, use `editor.applyOperations(...)`.
- If React or DOM code needs current state, use accessors like
  `editor.getSelection()` and `editor.getMarks()`.
- Keep an executable hard-cut contract that proves:
  - `editor.onChange` is absent
  - `editor.apply` cannot be redefined
  - `applyOperations(...)` publishes commits
  - subscribers and commit listeners see the committed batch

## Related Issues

- [Slate history capture must anchor to commit subscribers, not onChange order](../logic-errors/2026-04-03-slate-history-capture-must-anchor-to-commit-subscribers-not-onchange-order.md)
- [Slate transform namespaces should stay thin sugar over the current engine](2026-04-09-slate-transform-namespaces-should-stay-thin-sugar-over-the-current-engine.md)
