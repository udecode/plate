---
title: Docs demos must clone reusable values per editor
date: 2026-03-30
category: ui-bugs
module: apps/www docs demos
problem_type: ui_bug
component: documentation
symptoms:
  - Dragging a multi-cell selection in `/docs/table` throws `Unable to find the path for Slate node`.
  - The failure only appears on pages that mount more than one editor from the same reusable demo value.
  - A stale local `.bun` mirror can hide or reintroduce the bug during verification.
root_cause: logic_error
resolution_type: code_fix
severity: high
tags:
  - plate
  - slate
  - docs
  - table
  - shared-references
  - multi-editor
  - demo-values
---

# Docs demos must clone reusable values per editor

## Problem

The docs app was mounting multiple editors from the same reusable Slate value object. On `/docs/table`, the generic `table-demo` and the disable-merge table demo both started from the same `tableValue` tree, so Slate's DOM-to-node bookkeeping could end up pointing at the wrong mounted editor.

## Symptoms

- Dragging across multiple cells in the first table demo raised `Unable to find the path for Slate node: {"text":"Heading","bold":true}`.
- The crash came from Slate React's DOM selection sync path, not from a table transform:
  - `findPath`
  - `toSlatePoint`
  - `toSlateRange`
  - `Editable.useMemo[onDOMSelectionChange]`
- Fresh verification was confusing because a corrupted local `node_modules/.bun` mirror could also break docs compilation with the unrelated `is-hotkey` parse error.

## What Didn't Work

- Treating this as a table-plugin bug first was a red herring. The failure surfaced during table selection, but the actual problem was editor ownership of the underlying value graph.
- Verifying against an already-running local docs server was also misleading. A stale process on `3002` kept serving old code, so the first browser retest did not prove anything.

## Solution

Clone reusable demo values before passing them into `usePlateEditor`, so every mounted docs editor owns its own Slate tree.

```tsx
import cloneDeep from 'lodash/cloneDeep.js';

export const createDemoValueSnapshot = <T,>(value: T): T => cloneDeep(value);
```

Use that helper for the generic demo renderer and the custom table no-merge demo:

```tsx
const editor = usePlateEditor({
  plugins: EditorKit,
  value: createDemoValueSnapshot(DEMO_VALUES[id]),
});
```

```tsx
const editor = usePlateEditor({
  plugins: [
    ...EditorKit,
    TablePlugin.configure({
      options: {
        disableMerge: true,
      },
    }),
  ],
  value: createDemoValueSnapshot(tableValue),
});
```

Add a regression test that proves the same reusable demo value produces isolated snapshots:

```tsx
const snapshotA = createDemoValueSnapshot(DEMO_VALUES.table);
const snapshotB = createDemoValueSnapshot(DEMO_VALUES.table);

expect(snapshotA[2]).not.toBe(DEMO_VALUES.table[2]);
expect(snapshotA[2]).not.toBe(snapshotB[2]);
```

## Why This Works

Slate expects each mounted editor to own its own node graph. Reusing one static value object across multiple editors breaks that assumption, so DOM selection can resolve a node from one mounted editor against another editor's tree and fail path lookup. Deep-cloning the initial value restores one-editor-one-tree ownership and keeps Slate's internal DOM mappings stable.

## Prevention

- Never pass a shared exported Slate value directly into more than one mounted editor.
- If a docs example uses reusable constants like `DEMO_VALUES[id]`, snapshot the value at the editor boundary.
- When a docs page mounts a generic demo and a custom demo from the same source value, treat that as a multi-editor case even if both examples look read-only at first glance.
- If local verification suddenly shows unrelated `.bun` parse failures while CI is green, clean non-versioned local env first:
  - remove `node_modules`
  - remove app caches like `apps/www/.next` and `apps/www/.contentlayer`
  - remove `.turbo`
  - rerun `pnpm install`

## Related Issues

- Related learning: `.claude/docs/solutions/ui-bugs/2026-03-27-version-history-demo-must-clone-snapshots-per-editor.md`
