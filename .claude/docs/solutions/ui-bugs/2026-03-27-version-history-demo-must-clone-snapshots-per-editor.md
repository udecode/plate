---
title: Version history demo must clone snapshots per editor
date: 2026-03-27
category: ui-bugs
module: apps/www version-history demo
problem_type: ui_bug
component: documentation
symptoms:
  - Editing near the inline void throws Slate path lookup errors.
  - Arrow keys and delete/backspace stop behaving normally.
  - Saving a revision leaves the diff pane unchanged or crashes the page.
root_cause: logic_error
resolution_type: code_fix
severity: high
tags:
  - plate
  - slate
  - version-history
  - diff
  - shared-references
  - multi-editor
---

# Version history demo must clone snapshots per editor

## Problem

The version history demo mounted the same Slate node objects in three places at once: the live editor, the saved revision view, and the diff comparison flow. That breaks Slate's DOM-to-node bookkeeping and also means saved revisions are not real snapshots.

## Symptoms

- Editing around the inline void raised `Unable to find the path for Slate node` errors for the trailing text node.
- Arrow navigation and delete/backspace became unreliable after a small edit.
- Saving a revision added another option in the dropdown, but the diff pane still looked unchanged.
- The deployed docs page could fall through to a client-side exception screen.

## What Didn't Work

- Looking only at the diff code was a red herring. The visible failure was in the diff pane, but the first hard error came from the editable editor's selection handling.
- Treating the saved revision array as immutable was also wrong. The array was new, but the nested Slate nodes inside it were still shared with the live editor.

## Solution

Clone every value that crosses an editor or revision boundary, and keep the diff-only plugin out of the editable editor.

```tsx
export const createVersionSnapshot = (value: Value): Value => cloneDeep(value);

const basePlugins = [
  ...BasicMarksKit,
  InlinePlugin.withComponent(InlineElement),
  InlineVoidPlugin.withComponent(InlineVoidElement),
];

const diffPlugins = [...basePlugins, DiffPlugin];
```

Use those snapshots for initial state, change handling, saved revisions, and diff inputs:

```tsx
const [revisions, setRevisions] = React.useState<Value[]>(() => [
  createVersionSnapshot(initialValue),
]);
const [value, setValue] = React.useState<Value>(() =>
  createVersionSnapshot(initialValue)
);

const saveRevision = () => {
  setRevisions([...revisions, createVersionSnapshot(value)]);
};

<VersionHistoryPlate
  onChange={({ value }) => setValue(createVersionSnapshot(value))}
  editor={editor}
/>;
```

Clone both sides before computing the diff:

```tsx
return computeDiff(
  createVersionSnapshot(previous),
  createVersionSnapshot(current),
  {
    isInline: editor.api.isInline,
    lineBreakChar: '¶',
  }
);
```

## Why This Works

Slate expects each mounted editor tree to own its own node graph. When two editors share the same node objects, Slate can resolve a DOM point against the wrong tree or fail to find a path entirely. Deep-cloned snapshots give each editor its own stable node identities, and saved revisions stop mutating alongside the live draft. Splitting `basePlugins` from `diffPlugins` also keeps diff rendering behavior scoped to the comparison pane instead of the editable surface.

## Prevention

- Never mount the same Slate `Value` object in multiple editors. If a value becomes a snapshot, clone it first.
- Treat revision history as immutable snapshots, not references to current editor state.
- For demos that compare live and historical content, add at least one test that proves snapshot cloning breaks reference sharing.
- If a demo only needs diff rendering in one pane, keep the diff plugin scoped to that pane.

## Related Issues

- GitHub: `#4875`
