---
title: Slate v2 ReactEditor should ride the mounted bridge and keep base components standalone
date: 2026-04-09
category: docs/solutions/developer-experience
module: slate-v2 slate-react
problem_type: developer_experience
component: tooling
symptoms:
  - slate-react still dropped obvious legacy public names like useElement, useSelected, withReact, and ReactEditor
  - stale docs implied a broader React plugin stack than the code actually shipped
  - binding SlateElement directly to Slate context broke standalone component/runtime tests
root_cause: wrong_api
resolution_type: code_fix
severity: medium
tags: [slate-v2, slate-react, reacteditor, withreact, dom-bridge, public-surface]
---

# Slate v2 ReactEditor should ride the mounted bridge and keep base components standalone

## Problem
`slate-react` had recovered a lot of core editor surface, but the React package
still dropped some of the obvious extension and ergonomics seams people expect:
element hooks, default aliases, `withReact`, and `ReactEditor`. The stale docs
made it worse by describing the old plugin-era contract as if it still existed.

## Symptoms
- `useElement`, `useElementIf`, `useSelected`, `withReact`, and `ReactEditor`
  were missing from the public barrel
- docs in `docs/libraries/slate-react/` described methods the current runtime
  did not ship
- adding runtime-id DOM binding to `SlateElement` naively caused standalone
  component tests to throw because they were no longer usable outside `<Slate>`

## What Didn't Work
- treating this as a pure docs problem would have kept the real public surface
  narrow and surprising
- recreating the full old `slate-dom` plugin stack would have been a fake
  victory and a lot of unnecessary code
- binding every `SlateElement` through `useSlateStatic()` broke presentational
  usage outside editor context

## Solution
Recover the current React compatibility seam over the mounted bridge instead of
resurrecting the old plugin stack wholesale.

Key moves:

- restore element/path/runtime-id context in
  `packages/slate-react/src/context.tsx`
- add `useElement`, `useElementIf`, and `useSelected`
- add default aliases in the `slate-react` barrel:
  `DefaultElement`, `DefaultLeaf`, `DefaultText`, `DefaultPlaceholder`
- restore `withReact` as a compatibility constructor that records the clipboard
  format key without mutating the editor instance
- restore a current `ReactEditor` helper namespace over the mounted bridge:
  focus/readOnly/composing state, path/key lookup, DOM translation, and
  clipboard helpers
- widen `slate-dom` only enough to back that seam honestly:
  `getRoot`, `hasDOMNode`, `toDOMNode`, `toSlateNode`, `toSlateRange`,
  split clipboard insertion, DOM target checks, and event-range resolution
- keep `useSlateNodeRef` optional so base presentational components still render
  outside `<Slate>`

Representative shape:

```ts
export const withReact = <T extends SlateEditor>(
  editor: T,
  clipboardFormatKey = 'x-slate-fragment'
): T & ReactEditor => {
  setEditorClipboardFormatKey(editor, clipboardFormatKey)
  return editor as T & ReactEditor
}
```

```ts
export const useSelected = () => {
  const editor = useSlateStatic()
  const path = useContext(ElementPathContext)
  const selection = useSlateSelection()

  if (!path || !selection || !Editor.hasPath(editor, path)) {
    return false
  }

  return rangesOverlap(Editor.range(editor, path), selection)
}
```

## Why This Works
The real seam in Slate v2 is the mounted DOM bridge plus the current immutable
snapshot model, not the old wrapper/plugin stack. Rebuilding `ReactEditor` over
that bridge keeps the API useful without lying about architecture that no
longer exists.

The follow-on detail matters too: DOM event helpers should resolve from the DOM
target path, not by round-tripping through Slate node identity. For void targets
in particular, the mounted wrapper is the stable source of truth. The same
principle applies to clipboard handling: split fragment-vs-text insertion on the
bridge, then let the generic helper compose them.

The provider seam follows the same rule. `Slate` callback classification should
diff snapshots, not stare at raw operations and hope the categories line up.
`replace()` is the obvious trap there: it can change children without fitting a
naive "non-selection op" heuristic.

Focused and read-only hook state follows the same rule too: if the docs describe
`useFocused()` and `useReadOnly()` as editor state, that state belongs at the
provider seam, not only inside `<Editable>` descendants.

The same pressure applies to rendering hooks. If the docs still describe
`renderText`, custom placeholder hosts, and `leafPosition`, either the current
text seam needs to carry them or the docs need to stop promising them.

The same rule applies to hook ordering inside render components. If a node can
switch between text and element shapes at the same path, any hooks shared by
both paths must run before the branch point. Otherwise the bug hides until a
real browser flow flips that shape in place.

Making node binding optional is the other half of the fix. Base view components
like `SlateElement` need to support both mounted-editor usage and standalone
presentational usage. If those components hard-require editor context, the
recovered API instantly regresses the package's own runtime/component tests.

## Prevention
- Recover legacy-facing API names only when they can be backed by the current
  seam. Do not cargo-cult old wrappers.
- For DOM event helpers, prefer resolving through the mounted DOM target and
  current path bridge instead of depending on Slate node object identity.
- Split clipboard fragment-vs-text insertion explicitly when the bridge already
  has enough information to do it cleanly.
- For provider callbacks, classify value-vs-selection change by comparing the
  previous and next snapshots, not by pattern-matching raw operations.
- If hook docs describe editor-wide state, expose that state from the provider
  so sibling toolbars and overlays do not get stuck on default values.
- If the docs describe rendering metadata like `leafPosition`, only claim it
  where the current split-text seam can actually compute and prove it.
- In branchy render components, move shared hooks above early returns and
  text/element branches so shape changes do not trigger hook-order crashes.
- If a component can render both inside and outside editor context, keep the
  editor-bound behavior optional.
- When restoring public API names, update the package docs and proof ledger in
  the same batch so the repo stops making contradictory claims.
- Prove the seam with runtime tests, not just source exports:
  `yarn workspace slate-react run test`
  `yarn test:custom`
  `yarn lint:typescript`

## Related Issues
- [2026-04-09-slate-v2-slate-react-surface-recovery.md](/Users/zbeyens/git/plate-2/docs/plans/2026-04-09-slate-v2-slate-react-surface-recovery.md)
- [true-slate-rc-proof-ledger.md](/Users/zbeyens/git/plate-2/docs/slate-v2/true-slate-rc-proof-ledger.md)
