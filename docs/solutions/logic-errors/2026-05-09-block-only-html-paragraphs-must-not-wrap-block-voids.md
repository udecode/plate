---
title: Block-only HTML paragraphs must not wrap block voids
date: 2026-05-09
category: docs/solutions/logic-errors
module: Plite paste-html import
problem_type: logic_error
component: testing_framework
symptoms:
  - Lexical ImageHTML exported no-caption images as `<p><img></p>`.
  - Plite paste-html imported the block image under a paragraph.
  - The first ImageHTML browser proof failed because a paragraph still wrapped the image.
root_cause: logic_error
resolution_type: code_fix
severity: medium
tags: [plite, lexical-harvest, paste-html, image, block-void, tests]
---

# Block-only HTML paragraphs must not wrap block voids

## Problem

Lexical's `ImageHTML.test.ts` exports a no-caption image as `<p><img></p>`.
In Plite's paste-html example, `image` is a block void. Importing that HTML
as a paragraph containing an image creates the wrong document shape.

## Symptoms

- The red browser proof showed one rendered paragraph around the image.
- The image was visible, so a loose "img exists" assertion would have missed the
  bug.
- The caption case still needed to import caption text as normal editable text.

## What Didn't Work

- Treating the row as already covered by multi-image paste stress proof. That
  stress row uses top-level `<img>` siblings, not Lexical's `<p><img></p>`
  export shape.
- Weakening the test to accept an empty paragraph around the image. That would
  bless a block void under a paragraph, which is the wrong Plite shape.

## Solution

Keep the test strict and unwrap paragraph wrappers that only contain block
elements:

```ts
if (nodeName === 'P') {
  const meaningfulChildren = getMeaningfulChildren(children)

  if (
    meaningfulChildren.length > 0 &&
    meaningfulChildren.every(isTopLevelBlock)
  ) {
    return meaningfulChildren
  }
}
```

The browser proof covers both source shapes:

- `<p><img alt="" height="inherit" src="/test/image.jpg" width="inherit"></p>`
  imports as one block image with no text.
- `<figure><img ...><figcaption>caption text</figcaption></figure>` imports as
  one image plus following caption text.

## Why This Works

HTML `<p>` is often a source wrapper, not a Plite paragraph contract. When its
meaningful children are already block elements, keeping the paragraph wrapper
turns a valid block into an invalid nested block. Unwrapping only block-only
paragraphs preserves normal text paragraphs while keeping block images at the
right level.

## Prevention

- For HTML import rows, assert structure, not only visible content.
- When a source editor exports block content inside a paragraph wrapper, decide
  whether the wrapper is source noise before mapping it to Plite.
- If `paste-html-import.ts` changes, run the focused browser row and the full
  `paste-html.test.ts` file.
- Keep exact image attributes, caption editor internals, native clipboard
  transport, raw mobile, collaboration, and export claims out unless a future
  owner explicitly accepts them.

## Related Issues

- [Lexical HTML copy harvest rows need whitespace and empty-target boundaries](../best-practices/2026-05-09-lexical-htmlcopy-harvest-rows-need-whitespace-and-empty-target-boundaries.md)
- [Lexical codeblock harvest rows need DataTransfer boundaries](../best-practices/2026-05-09-lexical-codeblock-harvest-rows-need-data-transfer-boundaries.md)
- [V2 HTML paste formatting should stay app-owned on explicit inline elements](./2026-04-06-v2-html-paste-formatting-should-stay-app-owned-on-explicit-inline-elements.md)
