---
title: Plite root normalizers need separate editor and node lanes
date: 2026-05-17
category: docs/solutions/developer-experience
module: plite extension normalizers
problem_type: developer_experience
component: tooling
symptoms:
  - forced-layout needed root repair but normalizers.node passed a node entry
  - examples risked teaching NodeApi.isEditor guards inside every root normalizer
  - docs and PR references could drift back to normalizers.node as the root repair API
root_cause: wrong_api
resolution_type: code_fix
severity: high
tags: [plite, normalizers, extensions, public-api, dx, benchmarks]
---

# Plite root normalizers need separate editor and node lanes

## Problem

Plite initially moved forced-layout repair from `commitListeners` into
`normalizers.node`, but root/value-level repair does not belong in a node-entry
callback. That API would force every root normalizer to branch on the editor
entry before doing useful work.

## Symptoms

- First-party forced-layout repair wanted the full editor value, not a node
  entry.
- A root repair authored in `normalizers.node` would need noisy guards:

```ts
normalizers: {
  node({ entry, next, tx }) {
    const [node] = entry

    if (!NodeApi.isEditor(node)) {
      next()
      return
    }

    // root/value repair
  },
}
```

- The plan and PR reference kept describing `normalizers.node` as the whole
  `normalizeNode` replacement, which made root repair look like a special case
  instead of a first-class extension lane.

## What Didn't Work

- Keeping one `normalizers.node` callback for every entry. It is close to legacy
  `normalizeNode`, but the v2 extension API can be clearer because root repair
  and node repair have different context needs.
- Adding `normalizers.element` or `normalizers.text`. That looks neat but creates
  extra lifecycle lanes before there is real pressure for them.
- Returning to `commitListeners` for root layout repair. That reintroduces
  post-commit policy and global reentry guards in examples.

## Solution

Split normalization authoring into two typed lanes:

```ts
defineEditorExtension({
  name: 'forced-layout',
  normalizers: {
    editor({ next, tx }) {
      const children = tx.value.get()

      // root/value-level repair
      next()
    },
    node({ entry, next, tx }) {
      // non-root node-entry repair
      next()
    },
  },
})
```

Runtime rules:

- `normalizers.editor` runs only for the editor root path `[]`.
- `normalizers.node` skips the editor root and only receives non-root entries.
- Both lanes use extension-local internal ids.
- Both lanes receive the scoped normalizer `tx`.
- `normalizers.editor` has no `entry` in its public type.

Forced-layout should use the root lane:

```ts
const forcedLayout = () =>
  defineEditorExtension<CustomEditor>()({
    name: 'forced-layout',
    normalizers: {
      editor({ next, tx }) {
        const children = tx.value.get()
        const first = children[0]

        if (!first) {
          tx.nodes.insert(createTitle(), { at: [0] })
          return
        }

        next()
      },
    },
  })
```

Lock the API with runtime and type tests:

```ts
expect(seen.includes('editor')).toBe(true)
expect(seen.includes('node:')).toBe(false)
expect(seen.includes('node:0')).toBe(true)
```

```ts
normalizers: {
  editor(context) {
    context.tx.value.get()

    // @ts-expect-error editor normalizers do not expose node entries
    context.entry
  },
}
```

## Why This Works

Root/value normalization and node-entry normalization are different authoring
jobs. Splitting them removes the need for `NodeApi.isEditor(node)` in normal
root repair code while preserving the Plite fallback mental model through
`next()`.

Keeping only `editor` and `node` avoids overfitting the API. The editor lane
handles document-wide invariants; the node lane handles ordinary structural
repair. Element/text lanes can wait until there is enough repeated pressure.

The benchmark stays honest by comparing equivalent lanes: v2
`normalizers.node` for no-op node dispatch and v2 `normalizers.editor` for
forced-layout repair against legacy `editor.normalizeNode`.

## Prevention

- If a public callback must check `NodeApi.isEditor(node)` before doing its
  normal work, consider a dedicated root/editor lane.
- Keep first-party examples on the narrowest callback that matches the policy:
  root layout in `normalizers.editor`, node repair in `normalizers.node`.
- Add negative type tests for context shape whenever splitting public extension
  lanes.
- Update plan docs, PR references, issue ledgers, and changesets in the same
  pass as the API split.
- Benchmark both dispatch overhead and the concrete root repair path after
  changing normalizer routing.

## Related Issues

- [Plite extension composition hard cuts need creation-time inference and browser proof](./2026-05-17-plite-extension-composition-hard-cuts-need-creation-time-inference-and-browser-proof.md)
- [Plite transform middleware defaults need an alias depth guard](./2026-05-16-slate-transform-middleware-defaults-need-alias-depth-guard.md)
- [Plite built-in normalization cannot be ported naively onto v2](../logic-errors/2026-04-09-slate-built-in-normalization-cannot-be-ported-naively-onto-v2.md)
