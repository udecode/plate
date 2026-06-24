---
title: Collapsed inline link insertion must move selection outside the link
date: 2026-05-09
category: docs/solutions/logic-errors
module: plite lexical harvest inlines
problem_type: logic_error
component: testing_framework
symptoms:
  - Enter after a typed URL link created a second empty link at the start of the next paragraph.
  - Follow-up typing risked inheriting the inserted link instead of landing outside it.
  - Existing link tests covered wrapping and paste boundaries but not Enter after collapsed link insertion.
root_cause: logic_error
resolution_type: code_fix
severity: medium
tags: [plite, lexical-harvest, inline, link, selection, browser-proof]
---

# Collapsed inline link insertion must move selection outside the link

## Problem

Lexical regression 1113 exposed a missing Plite browser proof: after a URL is
typed and wrapped as an inline link, pressing Enter should place the selection
outside the link. The next block must not inherit an empty duplicate link.

## Symptoms

- The new browser proof initially failed with two `https://example.com` links.
- The first paragraph contained the expected link text.
- The next paragraph started with an empty link using the same href before the
  following text.

## What Didn't Work

- Only proving the typed URL becomes a link. That missed the next-key boundary.
- Treating Enter as the root bug. The split behavior was exposing stale
  selection affinity after the collapsed inline insertion.
- Copying Lexical Playground DOM output. The portable behavior is the selection
  boundary, not Lexical's exact `<br>` rendering.

## Solution

Add a focused inlines browser row:

- type a URL through the example input rule;
- press Enter;
- assert exactly one typed URL link remains;
- assert selection moved to the next block;
- type follow-up text and assert it is outside the link.

Then make collapsed link insertion move one offset after inserting the inline:

```ts
tx.nodes.insert(link)
tx.selection.move({ unit: 'offset' })
```

This mirrors the boundary policy already used by the mentions example.

## Why This Works

Inserting a non-void inline at a collapsed selection can leave the model
selection at the end of the inline's text. The next structural key then splits
from inside the inline and carries an empty inline wrapper into the new block.

Moving by offset after insertion places the selection at the outside boundary
between the inline and the following text position. Enter then splits the block
from the correct editor point.

## Prevention

- For non-void inline insertion commands, prove the next key after insertion,
  not only the inserted node shape.
- Browser rows should type after the boundary action to prove affinity, because
  selection assertions alone can miss inherited formatting or inline wrappers.
- Keep product autolink policy separate from generic Plite core; this fix lives
  in the example link command.

## Related Issues

- [Expanded delete across inline boundaries must remove crossed inline ancestors](./2026-05-09-expanded-delete-across-inline-boundaries-must-remove-crossed-inline-ancestors.md)
