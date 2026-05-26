---
title: Slate v2 extension composition hard cuts need creation-time inference and browser proof
date: 2026-05-17
last_updated: 2026-05-17
category: docs/solutions/developer-experience
module: slate-v2 extension composition
problem_type: developer_experience
component: tooling
symptoms:
  - public examples still taught withEditor and with* wrappers after the API decision
  - browser proof found stale root editor.undo and editor.dom.clipboard runtime paths
  - completion-check stayed pending until examples, docs, browser rows, and broad gates all closed
  - default React history plus enabled false tombstones initially collapsed installed extension types to unknown
root_cause: wrong_api
resolution_type: code_fix
severity: high
tags: [slate-v2, extensions, public-api, hard-cut, browser-proof, ralph, typescript]
---

# Slate v2 extension composition hard cuts need creation-time inference and browser proof

## Problem

Slate v2 had picked the right public direction: `extensions: [...]` at editor
creation, replayable APIs on `state` / `tx`, and installed runtime APIs on
`editor.api`. The implementation was not done while first-party examples,
docs, and React runtime paths still taught or depended on wrapper-era roots.

## Symptoms

- Examples still had `withEditor`, local `withX(editor)` wrappers, or
  wrapper-shaped casts.
- Runtime React code still probed root `editor.undo()` / `editor.redo()` and
  root `editor.dom.clipboard`.
- Public docs and examples still used `dom.clipboard.insertData` after the API
  decision moved clipboard to sibling `editor.api.clipboard`.
- The scoped Ralph completion file correctly stayed `pending` while runnable
  browser and broad verification remained.

## What Didn't Work

- Cutting package root exports alone. That hides old names from app imports,
  but stale runtime calls and examples can still keep the old model alive.
- Treating package typecheck as enough. The two browser failures were real user
  paths: editable-void undo and nested editor rich HTML drop.
- Marking the stop-hook state `done` to silence the hook. That would have made
  the execution state lie while proof remained runnable.

## Solution

Make the creation-time extension list the only public composition story:

```ts
const editor = useSlateEditor({
  initialValue,
  extensions: [editableVoid(), checklist()],
})
```

React editor creation installs `react()` and `history()` by default. Raw
`createEditor()` stays unopinionated:

```ts
const headlessEditor = createEditor({
  initialValue,
  extensions: [history(), checklist()],
})
```

Make extension resolution deterministic:

```ts
const editor = createReactEditor({
  initialValue,
  extensions: [history({ enabled: false })],
})

// @ts-expect-error disabled history contributes no installed state group
editor.read((state) => state.history.undos())
```

The resolver should walk tuples right-to-left, keep the latest extension for a
name, and treat `enabled: false` as a tombstone. Empty extension slots must
contribute `never`, not `unknown`, or one extension with no state/tx group will
erase the useful union members.

Move installed APIs to their final owners:

```ts
editor.read((state) => state.history.undos())

editor.update((tx) => {
  tx.history.undo()
})

editor.api.history.withoutSaving(() => {
  editor.update((tx) => {
    tx.nodes.set({ type: 'paragraph' })
  })
})

editor.api.clipboard.insertData(data)
```

For React runtime history, stop probing root methods:

```ts
const hasHistory = editor.read((state) => {
  const history = (state as { history?: unknown }).history as
    | { redos?: unknown; undos?: unknown }
    | undefined

  return (
    typeof history?.redos === 'function' &&
    typeof history?.undos === 'function'
  )
})

if (hasHistory) {
  editor.update((tx) => {
    tx.history.undo()
  })
}
```

For clipboard customization, align the handler key with the public API:

```ts
const html = () =>
  defineEditorExtension({
    name: 'paste-html',
    capabilities: {
      'clipboard.insertData': insertData,
    },
  })
```

Then close the lane with the proof stack that matches the blast radius:

```bash
bun --filter slate-dom typecheck
bun --filter slate-react typecheck
bun x tsc --project packages/slate/test/tsconfig.generic-types.json --noEmit
bun x tsc --project packages/slate-history/test/tsconfig.generic-types.json --noEmit
bun x tsc --project packages/slate-react/test/tsconfig.generic-types.json --noEmit
bun typecheck:site
bun lint:fix
PLAYWRIGHT_RETRIES=0 PLAYWRIGHT_WORKERS=1 bun x playwright test \
  playwright/integration/examples/check-lists.test.ts \
  playwright/integration/examples/editable-voids.test.ts \
  playwright/integration/examples/markdown-shortcuts.test.ts \
  playwright/integration/examples/inlines.test.ts \
  --project=chromium
bun check
node tooling/scripts/completion-check.mjs
```

## Why This Works

Creation-time `extensions` gives TypeScript a single place to infer installed
`state`, `tx`, and `editor.api` handles. It also removes the wrapper
intersection trap where examples recover type power through `T & HistoryEditor`
or `as CustomEditor`.

React defaults need one extra rule: the context value should require only React
capabilities, not history. `history({ enabled: false })` is valid, so
`EditorContext` cannot be typed as a default-history editor.

The browser rows matter because hard-cutting public roots can still leave stale
internal calls. Typecheck did not catch the stale undo path; the editable-voids
row did.

Keeping `active goal state` pending until the final gate is
not bureaucracy. It prevents the stop hook from becoming a fake green light.

## Prevention

- For public API hard cuts, grep examples, docs, package tests, and source for
  stale names before closure.
- Negative type tests are allowed to mention old APIs. Everything else should
  teach the current API.
- If runtime APIs move from root editor fields to `editor.api`, run browser rows
  that exercise the moved behavior, not only package typechecks.
- Do not mark Ralph completion `done` while the continuation file names a
  runnable next action.
- Handler keys should follow the public capability name. If users call
  `editor.api.clipboard`, examples should not teach `dom.clipboard`.
- When mapping installed extension unions, distribute per extension and return
  `never` for empty groups. `unknown` is not a neutral element inside unions.
- Test `enabled: false` both at runtime and in negative type contracts.

## Related Issues

- [Slate public root hard cuts need internal imports and explicit type exports](./2026-05-03-slate-public-root-hard-cuts-need-internal-imports-and-explicit-type-exports.md)
- [Slate transform middleware defaults need an alias depth guard](./2026-05-16-slate-transform-middleware-defaults-need-alias-depth-guard.md)
- [Package typecheck must run public type contracts](./2026-05-04-package-typecheck-must-run-public-type-contracts.md)
- [Slate v2 migration-backbone lanes need browser contracts before completion](./2026-04-28-slate-v2-migration-backbone-lanes-need-browser-contracts-before-completion.md)
