---
title: Heading start Enter must normalize the split block type
date: 2026-05-09
category: docs/solutions/logic-errors
module: Slate v2 markdown shortcuts
problem_type: logic_error
component: testing_framework
symptoms:
  - Lexical TextEntry expects Enter at the start of a heading to create a paragraph before the heading.
  - Slate markdown-shortcuts split the heading but kept the empty split block as a heading.
  - The browser proof found no paragraph before the heading.
root_cause: logic_error
resolution_type: code_fix
severity: medium
tags: [slate-v2, lexical-harvest, markdown-shortcuts, heading, enter]
---

# Heading start Enter must normalize the split block type

## Problem

Lexical's `TextEntry.spec.mjs` has a useful row: create a heading, move to the
start of it, press Enter, and get a paragraph before the heading.

Slate v2's markdown-shortcuts example created the heading correctly, but native
Enter at the heading start inherited the heading type for the empty split block.

## Symptoms

- The focused browser proof expected one `p` before the `h1`.
- The red run found zero paragraphs.
- The heading text survived, so the failure was block type normalization after a
  start split, not markdown heading creation.

## Solution

Handle heading-start Enter in the markdown-shortcuts keydown owner:

```ts
if (event.key === 'Enter' && applyMarkdownHeadingStartEnter(editor)) {
  event.preventDefault()
  return true
}
```

The handler only applies to collapsed selections at the start of a heading. It
lets the normal split run, then changes the split empty heading at the original
block path into a paragraph.

## Why This Works

The original heading content should stay a heading. The new empty block before
it should represent user intent: opening a normal paragraph before the heading.

Normalizing only the start-split block avoids changing middle-split or end-split
heading behavior.

## Prevention

- For markdown/block shortcut rows, test start, middle, and end Enter behavior
  separately.
- When splitting a semantic block at offset `0`, assert the type of the empty
  block, not just text content.
- Keep product markdown parser behavior separate from raw block split behavior.

