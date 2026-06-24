---
title: Lexical paragraph node harvest rows need DOM import splitting
date: 2026-05-09
category: docs/solutions/best-practices
module: Plite Lexical harvest
problem_type: best_practice
component: testing_framework
symptoms:
  - Lexical paragraph tests mix node-class schema rows with a portable DOM import row.
  - Paragraph alignment can be lost during rich HTML paste even when editor block alignment exists elsewhere.
  - Browser assertions can accidentally count placeholder or leftover empty paragraphs.
root_cause: inadequate_documentation
resolution_type: documentation_update
severity: medium
tags: [plite, lexical-harvest, paragraph-node, paste-html, tests]
---

# Lexical paragraph node harvest rows need DOM import splitting

## Problem

Lexical `ParagraphNode` tests look like a paragraph behavior bundle, but most
rows are Lexical class shape: constructor rules, JSON schema, DOM class output,
factory helpers, and type guards. The portable row is narrower: paragraph DOM
import should preserve valid alignment from CSS `text-align` and legacy
`align`, with CSS winning when both are present.

## Symptoms

- Plite already had paragraph/block split and merge coverage.
- The paste-html importer created paragraph elements but ignored paragraph
  alignment.
- The paste-html renderer had `align` in the example value type but did not
  render it.
- A browser test that counted every `<p>` was too brittle because the editor can
  retain an empty paragraph around pasted content.

## Solution

Split the source file before porting:

- reject constructor, schema, `createDOM`, `updateDOM`, factory, and type-guard
  rows as Lexical API shape;
- route insert-after/split behavior through existing Plite insert-break and
  transform contracts;
- port paragraph DOM import alignment as a focused paste-html browser row.

The browser proof should assert the imported paragraphs by text and then inspect
their inline `style.textAlign`, not every rendered paragraph in the editor.

## Why This Works

Plite owns paragraph alignment as editor data and rendering policy. The copied
behavior is not Lexical's `ParagraphNode` class; it is the user-visible result of
pasting standard paragraph HTML. Keeping the proof at the paste-html boundary
protects the actual behavior without baking in Lexical internals.

## Prevention

- For upstream node tests, reject class/schema/helper rows unless Plite exposes
  the same public API.
- Preserve CSS-over-attribute precedence when importing common HTML attributes.
- In browser tests after paste, assert the imported blocks by content instead of
  assuming the exact editor wrapper count.

## Related Issues

- [Lexical element node harvest rows need API-shape splitting](./2026-05-09-lexical-element-node-harvest-rows-need-api-shape-splitting.md)
- [HTML paste formatting should stay app-owned on explicit inline elements](../logic-errors/2026-04-06-v2-html-paste-formatting-should-stay-app-owned-on-explicit-inline-elements.md)
