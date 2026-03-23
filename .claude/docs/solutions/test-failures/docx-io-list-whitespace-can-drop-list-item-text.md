---
title: Docx IO list whitespace can drop list item text
category: test-failures
date: 2026-03-18
tags:
  - docx-io
  - lists
  - whitespace
  - html-to-docx
---

# Docx IO list whitespace can drop list item text

## Problem

`pnpm check` failed in `packages/docx-io/src/lib/html-to-docx/html-to-docx.spec.ts` for nested lists and indented lists.

The generated `word/document.xml` kept the list numbering paragraphs but dropped visible item text like `Item 1` and `Indented item`.

## Root Cause

`buildList` treated formatting whitespace around `<li>` nodes as real content.

When a `<ul>` or `<ol>` started with indentation text nodes, the reducer created a blank paragraph first, then appended the real `<li>` node into that paragraph instead of treating it as a list item. That left Word XML with numbering and whitespace runs, but no actual list text.

## Solution

Ignore whitespace-only text nodes while walking list children, and do not append `<li>` nodes into an already-open paragraph accumulator.

Relevant fix:

```ts
const isBlankTextNode =
  isVText(childVNode) &&
  (childVNode as VTextType).text.trim() === '';

if (isBlankTextNode) {
  return accumulator;
}

// ...
} else if (
  accumulator.length > 0 &&
  isVNode(accumulator.at(-1)!.node) &&
  ((accumulator.at(-1)!.node as VNodeType).tagName || '').toLowerCase() ===
    'p' &&
  (childNode.tagName || '').toLowerCase() !== 'li'
) {
```

## Prevention

- Treat indentation whitespace in parsed HTML as layout noise, not list content.
- For list walkers, keep `<li>` as a structural boundary. Do not merge it into a text paragraph.
- When a DOCX list test loses text but keeps numbering, inspect the intermediate list reducer before blaming ZIP or XML generation.
