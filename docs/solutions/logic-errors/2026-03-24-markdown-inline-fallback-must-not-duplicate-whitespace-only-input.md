---
module: Markdown
date: 2026-03-24
problem_type: logic_error
component: parser
symptoms:
  - "Whitespace-only inline markdown fallback returned duplicated spaces"
  - "Direct deserializeInlineMd coverage failed on all-whitespace input"
root_cause: logic_error
resolution_type: code_change
severity: medium
tags:
  - markdown
  - parser
  - whitespace
  - testing
  - coverage
---

# Markdown inline fallback must not duplicate whitespace-only input

## Problem

Direct coverage on `deserializeInlineMd(...)` exposed a quiet parser bug.

When the input was only whitespace, the helper treated the string as both the preserved prefix and the fallback inline payload. That produced duplicated spaces instead of returning the original whitespace once.

## Root cause

The fallback path assumed there would always be some non-space inline markdown after trimming the leading whitespace.

That assumption breaks on whitespace-only input. In that case there is no inline payload to deserialize, so re-appending the original prefix doubles the content.

## Fix

Handle the whitespace-only case explicitly before the normal fallback merge.

The working rule is simple:

- if the input is entirely whitespace, return it once as a single text node
- otherwise preserve the leading spaces and append the parsed inline nodes as usual

## Verification

These checks passed:

```bash
bun test packages/markdown/src/lib/deserializer/utils/deserializeInlineMd.spec.ts
bun test packages/markdown/src/lib/deserializer/utils/markdownToSlateNodesSafely.spec.tsx
pnpm turbo build --filter=./packages/markdown
pnpm turbo typecheck --filter=./packages/markdown
```

## Prevention

For parser fallback helpers, always add one pure-whitespace case.

Whitespace-only input is boring, but it is exactly where trim-based fallback logic lies to you.
