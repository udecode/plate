---
title: HTML div boundaries must survive inline wrappers
date: 2026-05-09
category: docs/solutions/logic-errors
module: Slate v2 paste-html import
problem_type: logic_error
component: testing_framework
symptoms:
  - Lexical core HTMLCopyAndPaste rows expected nested divs to split paragraphs.
  - Slate paste-html flattened div-separated text under spans and divs into one paragraph.
  - Plain text, malformed paragraphs, and strong paste mark inheritance already passed.
root_cause: logic_error
resolution_type: code_fix
severity: medium
tags: [slate-v2, lexical-harvest, paste-html, html, div, tests]
---

# HTML div boundaries must survive inline wrappers

## Problem

Lexical's core `HTMLCopyAndPaste.test.ts` treats generic `<div>` as a visible
block boundary, even when it is nested under a `<span>` or another `<div>`.
Slate v2's paste-html importer treated unknown elements as transparent
children, so `123<div>456</div>` and `<span>123<div>456</div></span>` collapsed
into one paragraph.

## Symptoms

- Focused browser proof expected `['123', '456']` but received `['123456']`.
- Nested span/div proof expected `['a b c d e', 'f g h']` but received one
  flattened paragraph.
- The strong-paste inheritance row was already green, so the gap was specifically
  block boundary import, not active mark handling.

## Solution

Deserialize generic `DIV` nodes as body-like fragments:

```ts
if (nodeName === 'DIV') {
  return jsx('fragment', {}, normalizeBodyFragment(children))
}
```

Then protect list-item handling from wrapping an already block-shaped `DIV`
fragment in another paragraph:

```ts
if (meaningfulValues.length > 0 && meaningfulValues.every(isTopLevelBlock)) {
  return meaningfulValues
}
```

## Why This Works

`DIV` is not just a style wrapper in copied editor HTML. It often carries the
same visible boundary as a paragraph. Treating it like a body fragment lets
inline children flush into paragraphs while preserving nested block children.

The list guard keeps existing list boundary rows honest: a `div` inside an `li`
can still become a paragraph boundary, but already block-shaped children are
not nested under a second paragraph.

## Prevention

- For clipboard harvest rows, assert block text arrays, not only full text.
- Include nested block boundaries under inline wrappers when testing HTML import.
- When touching `paste-html-import.ts`, run the focused Lexical core rows and
  the full `paste-html.test.ts` browser file.
- Keep checklist schema, ARIA/theme output, native clipboard transport, raw
  mobile, collaboration, and table-model claims out unless a future owner accepts
  them explicitly.

## Related Issues

- [Block-only HTML paragraphs must not wrap block voids](./2026-05-09-block-only-html-paragraphs-must-not-wrap-block-voids.md)
- [Lexical HTML copy harvest rows need whitespace and empty-target boundaries](../best-practices/2026-05-09-lexical-htmlcopy-harvest-rows-need-whitespace-and-empty-target-boundaries.md)
- [Lexical codeblock harvest rows need DataTransfer boundaries](../best-practices/2026-05-09-lexical-codeblock-harvest-rows-need-data-transfer-boundaries.md)
