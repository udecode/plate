---
module: Markdown
date: 2026-03-30
problem_type: logic_error
component: markdown_deserializer
symptoms:
  - "Ordered markdown lists starting above `1` lost their numbering after `editor.tf.setValue(...)`"
  - "A restarted list like `2. item` normalized to `1.` then `2.` inside the editor state"
root_cause: missing_restart_metadata
resolution_type: code_change
severity: medium
tags:
  - markdown
  - deserializer
  - lists
  - liststart
  - listrestartpolite
  - normalization
  - setvalue
---

# Markdown ordered list restarts must emit `listRestartPolite`

## Problem

`deserializeMd(...)` already read ordered-list starts correctly from markdown. A list like:

```md
2. Second list item
3. Third list item
```

produced nodes with `listStart: 2` and `listStart: 3`.

The bug showed up one step later. Once that value went through `editor.tf.setValue(...)`, the first item lost `listStart`, and the following item got renumbered from the wrong base.

## Root cause

The list plugin normalizer does not treat `listStart` alone as authoritative for the first item in a list.

For a first list item with a number above `1`, it expects restart metadata:

- `listRestart`
- or `listRestartPolite`

Without one of those fields, normalization assumes the list should start at `1`, strips the first item's `listStart`, and recomputes later siblings from there.

The markdown deserializer emitted `listStart`, but it did not emit the restart metadata that the list normalizer relies on.

## Fix

When deserializing the first node of an ordered list whose markdown start is above `1`, emit `listRestartPolite` alongside `listStart`:

```ts
if (isOrdered) {
  itemContent.listStart = startIndex + index;

  if (index === 0 && nodeIndex === 0 && itemContent.listStart > 1) {
    itemContent.listRestartPolite = itemContent.listStart;
  }
}
```

`listRestartPolite` is the right fit here because the restart only matters while the node is still the first item in that list. If later edits insert a new item before it, normalization can renumber naturally.

## Verification

These checks passed:

```bash
bun test packages/markdown/src/lib/deserializer/deserializeMdList.spec.tsx
bun test packages/markdown/src
pnpm install
pnpm turbo build --filter=./packages/markdown
pnpm turbo typecheck --filter=./packages/markdown
pnpm lint:fix
```

## Prevention

If a deserializer feeds nodes into a normalized list system, do not emit only the derived number field.

Emit the restart signal that normalization actually respects, then add one regression that runs the full path:

1. deserialize markdown
2. call `editor.tf.setValue(...)`
3. assert the restarted list still begins at the original number
