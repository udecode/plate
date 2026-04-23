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

Make the app rule explicit about blockquote being a wrapper:

- set `allowSameTypeAbove: true` so the rule can fire while already inside a quote
- replace the generic retag behavior with `editor.tf.wrapNodes({ type: KEYS.blockquote, children: [] })`
- add an app integration test for both root `> ` and nested `> ` inside an existing quote

The fixed rule became:

```ts
{
  allowSameTypeAbove: true,
  format: (editor) => {
    editor.tf.wrapNodes({ children: [], type: KEYS.blockquote });
  },
  match: '> ',
  mode: 'block',
  type: KEYS.blockquote,
}
```

## Why This Works

Nested quotes require one blockquote to wrap another block, not one block to change its `type` field.

`wrapNodes(...)` preserves that container relationship directly. `allowSameTypeAbove: true` removes the guard that previously blocked the rule the moment the cursor was already inside a quote.

## Prevention

- When a node type becomes a wrapper/container, audit autoformat rules separately from toolbar and slash-command transforms.
- Generic block autoformat is safe for headings and paragraphs. It is not automatically safe for wrapper nodes like blockquote.
- If a rule should work both at the root and under the same ancestor type, review same-type guards before assuming the formatter is broken.
- Add one integration test for the root case and one nested case whenever autoformat behavior depends on container structure.

## Related Issues

- `#4898`
- Related learning: [2026-04-02-blockquote-transforms-must-keep-selection-inside-the-new-quote](./2026-04-02-blockquote-transforms-must-keep-selection-inside-the-new-quote.md)
