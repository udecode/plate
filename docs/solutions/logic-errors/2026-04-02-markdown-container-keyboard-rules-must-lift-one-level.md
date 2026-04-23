---
module: Editor Behavior
date: 2026-04-02
problem_type: logic_error
component: editor_transforms
symptoms:
  - "Empty `Enter` inside a quoted paragraph inserted the wrong structure after blockquote became a real container"
  - "`Backspace` at the start of a quoted paragraph reset or blew away the wrong amount of structure"
  - "An empty non-first quoted paragraph lifted out of the quote instead of deleting inside it"
  - "Reverse `Tab` needed quote-level ownership without letting plain `Tab` fall out of the editor"
root_cause: wrong_api
resolution_type: code_change
severity: medium
tags:
  - markdown
  - blockquote
  - keyboard
  - enter
  - backspace
  - tab
  - transforms
  - lift
---

# Markdown container keyboard rules must lift one level at a time

## Problem

Once blockquote became a real container, the old keyboard primitives stopped matching the model.

`exit` inserts a sibling after a container. `reset` rewrites the current block in place. Markdown-first quotes needed a different behavior: remove exactly one container level from the current block and leave surrounding structure intact.

## Symptoms

- Empty `Enter` in a quoted paragraph did not express "leave this quote level" cleanly.
- `Backspace` at the start of a quoted paragraph risked resetting the block instead of peeling off one quote layer.
- `Backspace` at the start of an empty quoted paragraph with a quoted sibling above it could outdent the empty block instead of just removing it inside the quote.
- Reverse `Tab` on quoted paragraphs could get swallowed by paragraph indent logic before quote lift had a chance to run.

## What Didn't Work

- Reusing `exit` for quote exit. That inserts after the quote; it does not lift the current block out of the quote.
- Reusing `reset` for quote delete-at-start. That changes block type, but it does not preserve container splitting semantics.
- Treating every quoted `delete.start` as a lift. That overreached on empty non-first quoted paragraphs where default same-container delete or merge should win.
- Letting generic indent claim reverse `Tab` even when there was no paragraph indent to remove. That blocked quote lift.
- Treating plain `Tab` like a no-op for quoted paragraphs. That let focus escape to other UI instead of keeping `Tab` editor-owned.

## Solution

Add an explicit structural primitive and wire quote rules to it:

- introduce `editor.tf.liftBlock(...)`
- add `'lift'` to `rules.break.empty` and `rules.delete.start`
- make `BlockquotePlugin` claim lift behavior only for plain quoted paragraphs
- only lift `delete.start` for non-empty quoted paragraphs or the first empty quoted paragraph in the quote
- let empty non-first quoted paragraphs fall through to the default delete path so they merge inside the quote
- let list behavior win first for quoted list items
- keep plain paragraph `Tab` editor-owned through indent behavior
- keep quoted paragraph `Tab` editor-owned through the same indent behavior
- make reverse `Tab` on a quoted plain paragraph lift one quote level
- let reverse `Tab` remove paragraph indent before lifting the quote

The key transform is narrow on purpose:

```ts
export const liftBlock = (editor, { at, match } = {}) => {
  const block = editor.api.block({ at });

  if (!block || !match) return;

  const [, blockPath] = block;
  const ancestor = editor.api.above({
    at: blockPath,
    match: combineMatchOptions(
      editor,
      (_node, path) => path.length < blockPath.length,
      { match }
    ),
  });

  if (!ancestor) return;

  editor.tf.unwrapNodes({
    at: blockPath,
    match,
    split: true,
  });

  return true;
};
```

And the blockquote rule seam becomes:

```ts
rules: {
  break: { empty: 'lift' },
  delete: { start: 'lift' },
}
```

## Why This Works

Markdown containers should behave like lists: one keypress changes one structural depth.

`unwrapNodes(..., { split: true })` gives exactly that. The current block leaves the nearest matching ancestor, nested containers only lose one level, and quoted siblings stay wrapped instead of exploding into flat content.

But destructive keys still need one more law: empty blocks should die in place before structure peels away. A second empty paragraph inside the same quote is not a quote-exit gesture. It is just dead air.

## Prevention

- If a markdown container can hold blocks, do not fake its keyboard behavior with `reset` or generic sibling insertion.
- Treat `Enter`, `Backspace@start`, and reverse `Tab` as structural ownership questions, not isolated key handlers.
- Do not let a structural delete rule steal empty non-first blocks from Slate's default same-container merge behavior.
- Add one regression for top-level exit, one for nested exit, and one for "nearest structure wins" when a list lives inside the container.
- Add destructive regressions for both quote cases:
  - first empty quoted paragraph exits one level
  - empty non-first quoted paragraph deletes inside the quote

## Verification

These checks passed:

```bash
bun test packages/core/src/lib/plugins/slate-extension/transforms/liftBlock.spec.tsx packages/core/src/lib/plugins/slate-extension/SlateExtensionPlugin.spec.tsx packages/indent/src/lib/withIndent.spec.tsx packages/core/src/lib/plugins/override/withBreakRules.spec.tsx packages/core/src/lib/plugins/override/withDeleteRules.spec.tsx packages/basic-nodes/src/lib/BaseBlockquotePlugin.spec.ts packages/list/src/lib/withList.spec.tsx packages/code-block/src/lib/withCodeBlock.spec.tsx packages/table/src/lib/withTable.spec.tsx
bun test apps/www/src/registry/components/editor/transforms.spec.ts apps/www/src/__tests__/package-integration/autoformat/blockquote.slow.tsx apps/www/src/__tests__/package-integration/autoformat/list.slow.tsx packages/markdown/src/lib/deserializer/deserializeMd.spec.ts packages/markdown/src/lib/deserializer/deserializeMdList.spec.tsx packages/markdown/src/lib/serializer/convertNodesSerialize.spec.ts
pnpm build
pnpm lint:fix
```

Browser checks on `/blocks/editor-ai` also confirmed:

- empty `Enter` exits a top-level quote
- empty `Enter` inside a nested quote exits one quote level, not all of them
- plain paragraph `Tab` stays in the editor and adds paragraph indent
- quoted paragraph `Tab` stays in the editor, keeps quote depth, and adds paragraph indent

## Related Issues

- `#4898`
- Related learning: [2026-04-01-markdown-blockquotes-must-round-trip-as-container-blocks](./2026-04-01-markdown-blockquotes-must-round-trip-as-container-blocks.md)
- Related learning: [2026-04-02-blockquote-autoformat-must-wrap-nested-quotes](../ui-bugs/2026-04-02-blockquote-autoformat-must-wrap-nested-quotes.md)
