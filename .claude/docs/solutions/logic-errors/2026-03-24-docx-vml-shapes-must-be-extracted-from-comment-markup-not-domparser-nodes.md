---
module: Docx
date: 2026-03-24
problem_type: logic_error
component: docx_cleaner
symptoms:
  - "VML shape ids disappeared when Word markup lived inside HTML comments"
  - "Direct shape extraction tests returned empty objects for real-looking VML snippets"
root_cause: logic_error
resolution_type: code_change
severity: medium
tags:
  - docx
  - vml
  - html
  - parsing
  - testing
  - coverage
---

# Docx VML shapes must be extracted from comment markup, not DOMParser nodes

## Problem

Direct coverage on `getVShapes(...)` exposed a quiet mismatch between the test seam and real Word markup.

The helper looked for `V:SHAPE` elements through `DOMParser` and `querySelectorAll(...)`. That works only if the VML survives as real DOM nodes. In the actual cleaner flow, the interesting VML often arrives inside comment markup, so the DOM query path sees nothing useful and the helper returns an empty object.

## Root cause

The implementation assumed the parsed HTML tree preserved the VML shape elements in a queryable form.

That assumption was wrong for the real seam we care about. The data we need is the raw shape markup itself, specifically the `id` and `o:spid` attributes. DOM traversal was the wrong extraction tool.

## Fix

Read the raw comment markup and extract VML shapes directly from the string.

The working approach was:

- scan the comment text for `<v:shape ...>` blocks
- capture the `id`
- capture the `o:spid`
- ignore malformed entries instead of inventing partial output

This keeps the helper aligned with how Word markup actually shows up in the docx cleaner path.

## Verification

These checks passed:

```bash
bun test packages/docx/src/lib/docx-cleaner/utils/getVShapes.spec.ts
bun test packages/docx/src
pnpm turbo build --filter=./packages/docx
pnpm turbo typecheck --filter=./packages/docx
```

## Prevention

For docx cleaner helpers, prefer tests built from realistic pasted Word fragments over idealized DOM fixtures.

When the source data is comment-wrapped or namespace-heavy markup, parse the raw string first. DOM APIs are too eager to normalize the interesting bits away.
