# Yjs virtual placeholder split/merge bug

Date: 2026-06-03
Route scope:
- `/examples/yjs-collaboration`

## Summary

Repeated paragraph split/merge operations can corrupt the Yjs-backed Slate tree.
The failure is not a React hydration bug. React only exposes the corrupted Slate
value when a leaked internal virtual placeholder is rendered as a paragraph.

The high-risk operation family is:

```text
split_node -> merge_node -> split_node -> merge_node
```

The generic Yjs collaboration example can hit the merge encoder error while
leaving an extra empty paragraph behind.

## Stable browser evidence

The following checks were run through the persistent Dev Browser on
`127.0.0.1:9222`, using the Fehala debug profile.

### Generic Yjs collaboration example

Route:

```text
http://localhost:3100/examples/yjs-collaboration
```

Minimal single-peer reproduction:

1. Open the route.
2. In Peer A, place the caret at the end of the first paragraph.
3. Press `Enter`.
4. Place the caret at the start of the new empty paragraph.
5. Press `Backspace`.
6. Place the caret at the end of the first paragraph again.
7. Press `Enter`.
8. Place the caret at the start of the new empty paragraph.
9. Press `Backspace`.

Observed stability:

```text
3/3 runs failed
```

Observed state after failure:

```text
Peer A/B/C:
  nested p count: 0
  element paths: 0, 1
  text: Hello world!
```

Observed browser error:

```text
Cannot merge Yjs nodes of different kinds.
```

This route does not immediately render nested paragraphs, but the failed merge
leaves an extra empty paragraph. That is still a structural failure.

## Root cause hypothesis

The corruption appears to come from internal virtual Yjs placeholders being
treated as normal element children during later split/merge operations.

Relevant source paths:

```text
packages/slate-yjs/src/core/operations.ts
packages/slate-yjs/src/core/document.ts
playwright/integration/examples/yjs-collaboration.test.ts
```

Important code shape:

1. `merge_node` for element + element uses `virtual-merge-ref`.
   It inserts `createVirtualYjsMovePlaceholder(child)` into the previous node
   and hides the merged target.

2. `split_node` for elements reads raw `getYjsChildren(target)` and clones the
   right-side children.

3. `getYjsChildren` filters hidden nodes but does not filter virtual
   placeholders.

4. `readSlateNodeFromYjs` treats any remaining `Y.XmlElement` as a Slate
   element. A leaked `slate-yjs-virtual-placeholder` can therefore become a
   Slate element with empty `children`.

5. Example renderers that map every Slate element to `<p>` can expose leaked
   placeholders as nested paragraphs.

The likely bad transition is:

```text
First Enter:
  split paragraph into [text paragraph, empty paragraph]

First Backspace:
  merge empty paragraph back through virtual-merge-ref
  leave virtual placeholder state behind in the raw Yjs tree

Second Enter:
  split a paragraph whose raw Yjs children include a virtual placeholder
  clone or carry the placeholder into the right-side split paragraph

Second Backspace:
  merge the right-side paragraph and virtualize a virtual placeholder
  readSlateValueFromYjs leaks the internal placeholder as a normal Slate element
```

## Why existing tests missed it

The provider Playwright test covers provider status, remote cursors, reconnect,
and append behavior. It does not cover real keyboard paragraph split/merge.

The existing Yjs unit contracts cover individual `split_node` and `merge_node`
operation families, but they do not cover repeated split/merge cycles where a
previous virtual merge placeholder is still present in the raw Yjs tree.

The missing regression shape is:

```text
repeat twice:
  select end of paragraph
  insert break
  select start of empty paragraph
  delete backward

assert:
  no nested block DOM
  getText() does not throw
  no leaked slate-yjs-virtual-placeholder element in Slate value
  no "Cannot merge Yjs nodes of different kinds" page error
```

## Suggested fix direction

Treat virtual placeholders as internal Yjs bookkeeping, not normal document
children.

Likely repair points:

1. Element `split_node` should operate on visible Slate children or explicitly
   handle virtual placeholders instead of blindly cloning `getYjsChildren`.
2. `merge_node` should not create a virtual move placeholder for an existing
   virtual placeholder.
3. `readSlateValueFromYjs` should never expose
   `slate-yjs-virtual-placeholder` as a Slate element.
4. Add provider and generic Yjs browser regressions for the two-loop
   `Enter -> Backspace` sequence.

## Classification

Severity: high

Reason:
- corrupts shared collaborative document state;
- syncs to remote peers;
- throws browser/runtime errors;
- makes ordinary text reads fail;
- can be triggered by normal keyboard editing without offline/reconnect.
