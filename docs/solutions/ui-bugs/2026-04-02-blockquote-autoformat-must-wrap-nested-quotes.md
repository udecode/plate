---
title: Blockquote autoformat must wrap nested quotes
date: 2026-04-02
category: ui-bugs
module: apps/www autoformat
problem_type: ui_bug
component: documentation
symptoms:
  - Typing `> ` at the start of a paragraph inside a blockquote inserted literal text instead of creating a nested quote.
  - The same `> ` autoformat rule still worked at the root, which made the failure look like a nested-block edge case.
  - The app autoformat rule still treated blockquote like a flat block type after blockquote became a container element.
root_cause: wrong_api
resolution_type: code_fix
severity: medium
tags:
  - blockquote
  - autoformat
  - nested-quotes
  - apps-www
  - editor-kit
  - container-blocks
  - wrapnodes
---

# Blockquote autoformat must wrap nested quotes

## Problem

The app's `> ` autoformat rule still used the generic block autoformat path for blockquote.

That path assumes the target is a retaggable block. After blockquote became a container element, the rule still worked at the root through normalization, but it failed inside an existing quote where nested wrapping was required.

## Symptoms

- In `/blocks/editor-ai`, typing `> ` at the start of a paragraph inside a blockquote left `> ` as plain text.
- Root-level `> ` still produced a blockquote, so the regression only showed up once a quote already existed.
- A focused integration test reproduced the exact shape mismatch:
  - expected `blockquote > blockquote > p`
  - received `blockquote > p` with text `> hello`

## What Didn't Work

- Treating this as another generic autoformat bug in `packages/autoformat`. The package-level block transform behaved exactly as designed for flat block types.
- Keeping the blockquote rule on `type: KEYS.blockquote` alone. That goes through `setNodes`, which is the wrong operation for a wrapper element.
- Using `toggleBlock(..., { wrap: true })` for this seam. Inside an existing quote, toggle semantics can unwrap instead of nesting.

## Solution

Make the package-owned rule explicit about blockquote being a wrapper:

- resolve the current block with `getBlockEntry()`
- delete the matched marker and wrap that block in the same active transaction
- use `tx.nodes.wrap(...)` so the rule constructs the container directly
- add an app integration test for both root `> ` and nested `> ` inside an existing quote

The fixed rule became:

```ts
export const BlockquoteRules = {
  markdown: createRuleFactory<{}, { marker: string }>({
    type: 'blockStart',
    marker: '>',
    trigger: ' ',
    enabled: ({ editor }) =>
      !editor.read.nodes.some({
        type: editor.plugin(KEYS.codeBlock).type,
      }),
    match: ({ marker }) => marker,
    apply: ({ editor, getBlockEntry, tx }, match) => {
      const blockEntry = getBlockEntry();

      if (!blockEntry) return;

      tx.text.delete({ at: match.range });
      tx.nodes.wrap(
        {
          children: [],
          type: editor.plugin(KEYS.blockquote).type,
        },
        {
          at: blockEntry[1],
        }
      );

      return true;
    },
  }),
};
```

## Why This Works

Nested quotes require one blockquote to wrap another block, not one block to change its `type` field.

`tx.nodes.wrap(...)` preserves that container relationship directly. Because the rule targets the resolved block path rather than retagging it, the same operation works at the root and inside an existing quote.

## Prevention

- When a node type becomes a wrapper/container, audit autoformat rules separately from toolbar and slash-command transforms.
- Generic block autoformat is safe for headings and paragraphs. It is not automatically safe for wrapper nodes like blockquote.
- If a rule should work both at the root and under the same ancestor type, make the target path explicit instead of relying on generic retag behavior.
- Add one integration test for the root case and one nested case whenever autoformat behavior depends on container structure.

## Related Issues

- `#4898`
- Related learning: [2026-04-02-blockquote-transforms-must-keep-selection-inside-the-new-quote](./2026-04-02-blockquote-transforms-must-keep-selection-inside-the-new-quote.md)
