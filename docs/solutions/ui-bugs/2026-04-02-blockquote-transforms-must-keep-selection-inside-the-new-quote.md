---
title: Blockquote transforms must keep selection inside the new quote
date: 2026-04-02
category: ui-bugs
module: apps/www editor transforms
problem_type: ui_bug
component: documentation
symptoms:
  - Turning a paragraph into a blockquote moved the caret into the previous block.
  - Inserting a blockquote from the slash menu selected the previous block instead of the new quote.
  - Core `tf.blockquote.toggle()` worked in isolation, which made the regression look like a plugin bug first.
root_cause: wrong_api
resolution_type: code_fix
severity: high
tags:
  - blockquote
  - selection
  - transforms
  - apps-www
  - slash-menu
  - context-menu
  - container-blocks
---

# Blockquote transforms must keep selection inside the new quote

## Problem

After blockquote became a real container node, the app-level editor helpers in `apps/www` still treated it like a flat text block.

That mismatch broke the editing flow: inserting or converting a quote created the right shape eventually, but the caret landed in the previous block instead of inside the new quote.

## Symptoms

- `/quote` in `/blocks/editor-ai` inserted a blockquote, then typing went into the previous paragraph.
- Converting a paragraph into a blockquote moved selection from `[1, 0]` to the previous block instead of the wrapped paragraph at `[1, 0, 0]`.
- `editor.tf.blockquote.toggle()` did not reproduce the bug by itself, so the broken seam was easy to misread.

## What Didn't Work

- Treating this like another `BaseBlockquotePlugin` regression. The core wrap transform already preserved selection.
- Keeping `setBlockType(...)` on flat `setNodes({ type: KEYS.blockquote })`. That let normalization repair the node shape later, after selection had already drifted.
- Relying on generic `select: true` after inserting a blockquote node. For a container block, that is not precise enough.

## Solution

Fix the shared `apps/www` editor transform helper instead of patching one UI caller at a time.

- Add a `createBlockquote(...)` helper that builds a container quote with an inner paragraph.
- Group quote insertion, source cleanup, nested-point lookup, and selection in one `editor.update((tx) => ...)`.
- Special-case `setBlockType(editor, KEYS.blockquote)` with `tx.nodes.wrap(...)` instead of flat `setNodes`.
- Use `editor.plugin(BaseBlockquotePlugin).update.toggle()` when the caller wants the package-owned toggle command.
- Route block-context-menu quote conversion through `setBlockType(...)` so it uses the same fixed path.
- Add regressions for quote insert and quote conversion selection behavior.

The important transform seams became:

```ts
if (type === KEYS.blockquote) {
  const insertPath = PathApi.next(path);

  editor.update((tx) => {
    tx.nodes.insert(createBlockquote(), { at: insertPath });

    if (!isSameBlockType && isCurrentBlockEmpty) {
      editor.plugin(BaseSuggestionPlugin).api.untracked(() => {
        tx.nodes.remove({ at: path });
      });
    }

    const start = tx.points.start(
      (isCurrentBlockEmpty && !isSameBlockType ? path : insertPath).concat([0])
    );

    if (start) tx.selection.set(start);
  });

  return;
}
```

```ts
if (type === KEYS.blockquote) {
  const isActive =
    node.type === type ||
    !!tx.nodes.above({
      at: path,
      match: { type },
    });

  if (!isActive) {
    tx.nodes.wrap({ children: [], type } as Element, { at: path });
  }

  return;
}
```

For a real toggle rather than idempotent conversion, call the plugin command:

```ts
editor.plugin(BaseBlockquotePlugin).update.toggle();
```

## Why This Works

`blockquote` is now a container element, so insertion and conversion must preserve two things together:

- the nested paragraph child
- the nested selection path inside that paragraph

The package-owned toggle and the app's grouped transaction both preserve that structure. Once the app helper stopped creating flat quotes and moved insertion plus selection into one transaction, selection stayed anchored inside the new quote.

## Prevention

- When a node becomes a container element, audit app-level insert and convert helpers. They often lag behind package-level transforms.
- Do not use generic `setNodes` or generic `select: true` for container-block insertion when the user must land inside a nested text block.
- If a core transform path behaves correctly but the UI still breaks, inspect the caller helpers before reopening plugin internals.
- Add one regression for conversion and one for insertion whenever selection behavior depends on nested paths.

## Related Issues

- `#4898`
- Related learning: [2026-04-01-markdown-blockquotes-must-round-trip-as-container-blocks](../logic-errors/2026-04-01-markdown-blockquotes-must-round-trip-as-container-blocks.md)
