---
title: Plite render props should not carry moving paths
date: 2026-05-12
category: docs/solutions/performance-issues
module: plite slate-react plite-dom render runtime
problem_type: performance_issue
component: tooling
symptoms:
  - Element render props exposed `path` and `index` even though a leading root insert shifts every following block path.
  - Keeping eager paths fresh would require rerendering every shifted mounted sibling.
  - Skipping shifted rerenders left app handlers and DOM weak-map lookups at risk of stale paths.
root_cause: wrong_api
resolution_type: code_fix
severity: high
tags: [plite, slate-react, plite-dom, render-props, runtime-id, path]
---

# Plite render props should not carry moving paths

## Problem

Plite paths are current tree addresses, not stable node identity. Passing them
through default React render props turns every structural shift into either a
wide rerender requirement or a stale handler bug.

## Symptoms

- `RenderElementProps` exposed eager `path` and `index`.
- `RenderVoidProps` exposed eager `path`.
- A leading insert before mounted siblings could only keep those props current
  by waking every shifted sibling.
- `DOMEditor.findPath` still had a weak-map fallback path that could be stale
  after skipped structural rerenders.

## What Didn't Work

- Keeping eager `path` and rerendering shifted siblings. That preserves
  correctness by giving up the rerender-breadth win.
- Keeping eager `path` and skipping shifted siblings. That preserves React
  performance by making closed-over event handlers unsafe.
- Treating `data-plite-path` as app truth. DOM metadata is useful fallback and
  debug state, but it should not define the public render contract.

## Solution

Cut eager moving addresses from public render props:

```ts
type RenderElementProps<TElement extends Element = Element> = {
  attributes: RenderElementAttributes
  children: ReactNode
  element: TElement
  isInline: boolean
  slots: EditableElementSlots
}

type RenderVoidProps<TElement extends Element = Element> = {
  element: TElement
}
```

Resolve current paths lazily where the app actually needs them:

```ts
const path = ReactEditor.findPath(editor, element)
const path = useElementPath()
```

Back `findPath` with runtime ids before weak-map indexes:

```ts
const runtimeId = NODE_TO_RUNTIME_ID.get(node)

if (runtimeId) {
  const path = Editor.getPathByRuntimeId(editor, runtimeId)

  if (path) return path
}
```

Move examples to event-time path resolution inside handlers instead of closing
over render-time path props.

## Why This Works

Runtime id is stable identity; path is a query against the current tree. Once
the public API follows that split, structural root-order changes can stay cheap:
mounted siblings keep their identity without being rerendered just to refresh a
moving address.

The lazy APIs preserve Plite-close DX. App code still calls
`ReactEditor.findPath(editor, element)` when it wants to mutate the current
element. Render-time path display remains possible through `useElementPath()`,
but that opt-in hook owns the rerender cost explicitly.

## Prevention

- Do not expose moving tree addresses as default render props.
- Event handlers should resolve paths at event time from stable element/runtime
  identity.
- `DOMEditor.findPath` should prefer live runtime-id lookup before weak-map or
  DOM metadata fallbacks.
- Add type-level surface tests that fail if `path` or `index` returns to
  default render props.
- Pair the type contract with a leading-insert render-breadth test and a
  shifted-handler path-resolution test.

## Related Issues

- [Plite React public selectors must stay model-truth](../developer-experience/2026-04-27-slate-react-public-selectors-must-stay-model-truth.md)
- [Plite ReactEditor should ride the mounted bridge and keep base components standalone](../developer-experience/2026-04-09-plite-reacteditor-should-ride-the-mounted-bridge-and-keep-base-components-standalone.md)
