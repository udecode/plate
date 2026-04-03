---
module: CSV
date: 2026-03-23
problem_type: logic_error
component: parser_deserialization
symptoms:
  - "Valid CSV deserialization returned `undefined` when `CsvPlugin` used its default `parseOptions.header = true`"
  - "Array-mode CSV worked, which hid the bug behind the non-default path"
root_cause: logic_error
resolution_type: code_change
severity: medium
tags:
  - csv
  - papaparse
  - deserialization
  - parser
  - testing
---

# CSV header-mode validity check must handle object rows

## Problem

`CsvPlugin` is supposed to deserialize plain CSV into a Slate table.

Valid input like `name,age\nAda,36` returned `undefined` on the default path because Papa Parse was configured with `header: true`, but the validity check still treated the parsed rows like arrays.

## Root cause

`deserializeCsv` used one validation shape for both parse modes:

```ts
data.length < 2 || data[0].length < 2 || data[1].length < 2
```

That only makes sense for array rows. In header mode, Papa returns objects plus `meta.fields`, so:

- `data.length` counts only data rows, not the header row
- `data[0].length` is `undefined`

So valid header-based CSV was rejected before the AST builder ever ran.

## Fix

Split validation by parse shape:

- header mode uses `meta.fields` for column count and requires at least one data row
- array mode keeps the old row-length checks
- error tolerance still compares parser errors against parsed row count

That makes the default plugin path valid again without weakening the malformed-CSV guardrails.

## Verification

These checks passed:

```bash
bun test packages/csv/src
pnpm test:slowest -- --top 20 packages/csv/src
pnpm turbo build --filter=./packages/csv
pnpm turbo typecheck --filter=./packages/csv
```

## Prevention

When a parser supports both header mode and array mode, test both. They are not the same data shape, and pretending otherwise is how you ship a broken default.
