---
title: Slate React focus tests need Vitest with jsdom 20, not Happy DOM or jsdom 26
date: 2026-04-17
category: test-failures
module: slate-v2 slate-react
problem_type: test_failure
component: testing_framework
symptoms:
  - Bun plus Happy DOM failed the ReactEditor focus row while Jest passed
  - Vitest plus Happy DOM failed with the same wrong selection shape
  - Vitest plus jsdom 26 still failed, but with a different wrong selection shape
root_cause: config_error
resolution_type: code_fix
severity: high
tags: [slate-v2, slate-react, bun, vitest, jsdom, happy-dom, reacteditor, focus]
---

# Slate React focus tests need Vitest with jsdom 20, not Happy DOM or jsdom 26

## Problem

`packages/slate-react/test/react-editor.vitest.tsx` had one focus/selection row
that Bun could not carry honestly.

The failing case was:

- `ReactEditor > .focus > should be able to call .focus without getting toDOMNode errors`

Jest passed it. Bun did not.

## Symptoms

- Bun + Happy DOM returned the old `"test"` node instead of `"bar"`.
- Bun + an ad hoc JSDOM preload returned `"foobar"` instead of `"bar"`.
- Vitest + Happy DOM still returned `"test"`.

Those were three different setups, but none matched the old Jest result.

## What Worked

Use a split runner for `slate-react`:

- keep the existing Bun lane for `packages/slate-react/test/bun/**`
- move the remaining `test/*.vitest.{ts,tsx}` lane to Vitest
- run the Vitest lane on `jsdom 20.0.3`

With that environment, the full `slate-react` non-Bun spec lane went green,
including the `ReactEditor.focus(...)` row.

## Why

This was not just a “Bun vs Vitest” choice.

The real seam was DOM environment fidelity on focus/selection behavior:

- Happy DOM was not faithful enough for this row.
- newer jsdom also did not match the old expectation here.
- the old Jest lane was effectively proving against the older jsdom contract.

## Prevention

- For `slate-react` DOM/focus tests, do not assume Bun + Happy DOM is lossless.
- If a row is selection/focus sensitive, compare the exact DOM environment, not
  just the test runner.
- When replacing Jest, check the jsdom version it was implicitly using before
  blaming the product code.
