---
title: EditableBlocks app-owned surfaces must not churn runtime ids or miss plain-editor updates
date: 2026-04-20
category: docs/solutions/logic-errors
module: Slate React runtime
problem_type: logic_error
component: tooling
symptoms:
  - "EditableBlocks app-owned proofs rendered no projection slices even though the projection store snapshot was populated"
  - "Plain createEditor()-backed app-owned transforms changed editor state without rerendering EditableBlocks subscribers"
  - "App-owned scrollSelectionIntoView could not resolve DOM text nodes for plain-editor text selections"
root_cause: logic_error
resolution_type: code_fix
severity: high
tags: [slate-react, editableblocks, runtime-ids, plain-editor, dom-mapping, app-owned]
---

# EditableBlocks app-owned surfaces must not churn runtime ids or miss plain-editor updates

## Problem
`EditableBlocks` looked like a valid app-owned surface, but the first real
app-owned owner exposed a bad split between the public block surface and the
legacy provider bridge.

Projection-backed markdown previews, block-level shortcuts, forced layout, and
app-owned scroll forwarding all depended on stable runtime ids and live
selector updates. The current package was quietly breaking both.

## Symptoms
- `app-owned-customization.tsx` stayed red even though the projection store
  snapshot already contained the expected slices
- block transforms updated the editor snapshot, but rendered blocks stayed on
  the old element type
- `scrollSelectionIntoView` never fired for plain-editor selections because
  DOM text nodes could not be resolved

## What Didn't Work
- Treating the failures as separate app-owned feature bugs. They were one
  shared runtime bridge problem.
- Fixing `EditableBlocks` tests without fixing the provider/plain-editor wakeup.
  That only hid the missing update owner.
- Broad selector/runtime rewrites that disturbed the legacy `Editable` surface.
  That just traded one honest red for a fake green and a regression elsewhere.

## Solution
Keep the existing legacy `Editable` surface intact, but fix the app-owned
bridge seams that were actually broken.

1. Stop auto-wrapped `EditableBlocks` from reinitializing the editor with
   `initialValue`. That mount-time replace churned runtime ids and immediately
   desynced projection-store keys from the mounted tree.
2. Make the `Slate` provider wake selector subscribers for plain editors by
   bridging `editor.onChange` when the editor is not DOM-enhanced.
3. Pass text marks through `EditableTextBlocks` so projection-backed text nodes
   can stay on the direct projected rendering path.
4. Ensure `useSlateNodeRef` creates the plain-editor key-to-element map when it
   does not already exist, so DOM range resolution works for app-owned
   selections.
5. Preserve shifted node keys across `insert_node` and `remove_node` in
   `with-dom`, so mounted surfaces do not remount unchanged siblings when a
   structural edit only shifts paths.

Key files:

```ts
// packages/slate-react/src/components/editable-text-blocks.tsx
return (
  <Slate editor={editor} projectionStore={projectionStore}>
    {content}
  </Slate>
)
```

```ts
// packages/slate-react/src/components/slate.tsx
if (!EDITOR_TO_KEY_TO_ELEMENT.has(editor)) {
  const originalOnChange = editor.onChange

  editor.onChange = (options) => {
    EDITOR_TO_ON_CHANGE.get(editor)?.(options)
    originalOnChange(options)
  }
}
```

```ts
// packages/slate-react/src/hooks/use-slate-node-ref.tsx
const keyToElement = EDITOR_TO_KEY_TO_ELEMENT.get(editor) ?? new WeakMap()

if (!EDITOR_TO_KEY_TO_ELEMENT.has(editor)) {
  EDITOR_TO_KEY_TO_ELEMENT.set(editor, keyToElement)
}

keyToElement.set(key, node)
```

```ts
// packages/slate-dom/src/plugin/with-dom.ts
case 'insert_node':
case 'remove_node': {
  pathRefMatches.push(...getPathRefMatches(e, Path.parent(op.path)))
  break
}
```

## Why This Works
The app-owned row was not missing custom renderer logic. It was missing a
stable bridge between editor state, selector wakeups, runtime-id keyed
projection data, and DOM key maps.

Once the provider stopped replacing the editor on mount, the projection store
and mounted tree finally agreed on runtime ids. Once plain editors started
publishing selector updates, block-level app-owned transforms became visible.
Once plain-editor DOM key maps were created and shifted keys were preserved,
selection-to-DOM resolution became honest enough for `scrollSelectionIntoView`.

## Prevention
- Do not auto-wrap an already-populated editor with a provider that blindly
  reapplies `initialValue`.
- Treat `createEditor()` support as a real public contract. If a surface
  accepts a plain editor, selector wakeups and DOM key maps must not rely on
  `withReact()` or `withDOM()` being present.
- When a proof owner says “snapshot changed but UI did not,” check four things
  before touching feature code:
  - provider wakeup path
  - runtime-id stability
  - DOM key map coverage
  - key preservation across shifted paths
- Keep a focused contract on any public editing surface that mixes:
  - projection-backed rendering
  - app-owned element rendering
  - structural transforms
  - selection-to-DOM forwarding

## Related Issues
- [V2 editable blocks can be the first public editor surface](/Users/zbeyens/git/plate-2/docs/solutions/logic-errors/2026-04-04-v2-editable-blocks-can-be-the-first-public-editor-surface.md)
- [V2 editable blocks need structure-preserving DOM reconciliation for mixed-inline editing](/Users/zbeyens/git/plate-2/docs/solutions/logic-errors/2026-04-04-v2-editable-blocks-need-structure-preserving-dom-reconciliation-for-mixed-inline-editing.md)
- [V2 text surfaces should bind runtime ids from paths and use zero-length projections for mark placeholders](/Users/zbeyens/git/plate-2/docs/solutions/logic-errors/2026-04-04-v2-text-surfaces-should-bind-runtime-ids-from-paths-and-use-zero-length-projections-for-mark-placeholders.md)
