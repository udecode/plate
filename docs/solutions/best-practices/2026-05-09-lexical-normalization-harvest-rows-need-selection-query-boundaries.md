---
title: Lexical normalization harvest rows need selection query boundaries
date: 2026-05-09
category: docs/solutions/best-practices
module: Slate v2 Lexical harvest
problem_type: best_practice
component: testing_framework
symptoms:
  - Lexical normalization tests only exercised `$normalizeSelection`, not tree repair.
  - The obvious Slate target looked like normalization contracts, but the portable behavior was path edge resolution.
  - Copying the source file directly would mix Lexical element-point and decorator semantics into Slate tests.
root_cause: inadequate_documentation
resolution_type: documentation_update
severity: medium
tags: [slate-v2, lexical-harvest, normalization, selection, query-contract]
---

# Lexical normalization harvest rows need selection query boundaries

## Problem

Lexical's `LexicalNormalization.test.tsx` looks like tree-normalization
coverage by filename, but the file tests `$normalizeSelection`: element-backed
selection endpoints are converted to concrete text endpoints when possible.

## Symptoms

- The source rows are named under `LexicalNormalization`, but every test builds a
  `RangeSelection` and calls `$normalizeSelection`.
- Some rows are portable text-edge behavior; others depend on Lexical decorator
  and element-point semantics.
- Routing the whole file to Slate normalization would invite a broad tree-repair
  test where Slate only needs a query/location contract.

## What Didn't Work

- Treating the file as generic tree normalization would reopen the wrong owner.
- Copying Lexical element-point assertions would be fake parity because Slate
  public `Point` values target text nodes.
- Treating reversed rows as a separate browser behavior would overclaim; the
  accepted behavior is package-level location resolution.

## Solution

Route the portable part to Slate's public query APIs:

- element path -> `Editor.range(editor, path)`;
- element path start/end -> `Editor.edges(editor, path)`;
- nested element path -> text child points through `Editor.range` and
  `Editor.edges`;
- backward ranges -> `Editor.point(editor, range)` and `{ edge: 'end' }`.

The compact proof belongs in
`packages/slate/test/query-contract.ts`, not in
`normalization-contract.ts`.

## Why This Works

Slate's public selection model stores text points. Lexical's normalization
helper is useful only as a reminder to prove that callers can pass element
paths and still get stable text endpoints through the public query layer.

Decorator and element-point rows are intentionally not generic Slate behavior.
They should only come back under a real decorator, void, or browser-selection
owner.

## Prevention

- Do not trust upstream filenames when harvesting tests; read the operation
  under test.
- If a source "normalization" row only converts selection endpoints, check the
  query/location owner first.
- Keep tree-repair normalization rows in `normalization-contract.ts`; keep
  path/range/point resolution rows in `query-contract.ts`.
- Reject decorator endpoint semantics unless a Slate owner exposes the same
  public behavior.

## Related Issues

- [Lexical caret harvest rows need range-edge contracts](./2026-05-09-lexical-caret-harvest-rows-need-range-edge-contracts.md)
- [Lexical docs traversal harvest rows need query-shape contracts](./2026-05-09-lexical-docs-traversal-harvest-rows-need-query-shape-contracts.md)
- [Slate built-in normalization cannot be ported naively onto v2](../logic-errors/2026-04-09-slate-built-in-normalization-cannot-be-ported-naively-onto-v2.md)
