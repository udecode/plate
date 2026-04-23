---
title: Date MDX payload contract
type: open-question
status: answered
updated: 2026-04-09
related:
  - docs/editor-behavior/markdown-editing-spec.md
  - docs/editor-behavior/editor-protocol-matrix.md
  - content/(plugins)/(elements)/date.mdx
  - content/(plugins)/(serializing)/markdown.mdx
---

# Date MDX payload contract

## Question

What richer serialized payload, if any, should Plate support beyond the current
single-string `<date>value</date>` contract?

## Current answer

The current narrow contract is the shipped answer.

What Plate now treats as locked:

- inline atom model
- boundary delete / keyboard access
- one canonical `YYYY-MM-DD` node payload
- markdown write shape `<date value="YYYY-MM-DD" />`
- legacy child-text read compatibility
- render-layer formatting above the canonical payload

What remains deferred:

- display-vs-value split
- locale/timezone payload semantics
- richer serialized date payloads beyond the current canonical attribute form

## Why this matters

Without a clear payload contract, it is too easy to confuse bundled UI behavior
with serialized markdown law.

That risk is lower now because the repo already converged on one narrow
contract. Future richer date work should only reopen this if new product
evidence justifies widening the schema.
