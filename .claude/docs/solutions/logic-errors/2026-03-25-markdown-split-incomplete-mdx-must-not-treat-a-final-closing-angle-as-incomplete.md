---
title: Markdown splitIncompleteMdx must not treat a final closing angle as incomplete
type: solution
date: 2026-03-25
status: completed
category: logic-errors
module: markdown
tags:
  - markdown
  - mdx
  - parser
  - tests
---

# Problem

`splitIncompleteMdx` split fully balanced input like `<a><b></b></a>` into `['', '<a><b></b></a>']`.

The parser reached the final `>` at end-of-string, incremented `i`, then immediately treated `i >= len` as “never found the closing angle.”

# Fix

- Track whether the tag scan actually found `>`.
- Only mark the tag as incomplete when the scan exits without ever finding `>`.

# Rule

When a small parser advances past a delimiter before checking end-of-input, keep an explicit `foundDelimiter` flag.

Otherwise balanced input at EOF gets misclassified as truncated.
