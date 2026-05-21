---
title: Lexical caret harvest rows need range-edge contracts
date: 2026-05-09
category: docs/solutions/best-practices
module: Slate v2 Lexical harvest
problem_type: best_practice
component: testing_framework
symptoms:
  - Lexical caret tests mix portable editor behavior with Lexical-specific caret object APIs.
  - A direct copy would duplicate class internals instead of strengthening Slate behavior contracts.
  - Existing Slate traversal tests can hide a missing destructive range edge case.
root_cause: inadequate_documentation
resolution_type: documentation_update
severity: medium
tags: [slate-v2, lexical-harvest, caret, range-delete, tests]
---

# Lexical caret harvest rows need range-edge contracts

## Problem

Lexical caret tests are useful, but most of their surface is not portable to
Slate. The valuable part is not the caret object API; it is the behavior around
traversal, ordering, splitting, and destructive range edges.

## Symptoms

- The source file contains caret constructors, flips, splices, node-key checks,
  decorator rows, token/segmented modes, traversal ordering, common ancestor
  logic, range deletion, and splitting helpers in one test suite.
- Slate already has strong `Editor.before`, `Editor.after`, `positions`,
  `Point`, `Path`, split operation, and text-unit owners.
- The missing useful coverage can be small: expanded range deletion should trim
  both edges and collapse at the anchor.

## What Didn't Work

- Copying the Lexical file directly would encode Lexical's caret classes and
  node-key model.
- Treating every caret test as a query test would miss destructive edit behavior.
- Treating token/segmented text modes as generic Slate core behavior would create
  fake parity work.

## Solution

Split caret harvest files by behavior family before writing Slate tests:

- traversal and ordering -> query contracts;
- text units -> text-unit contracts;
- splitting -> operation or transform contracts;
- destructive range edges -> delete contracts;
- node-key, caret class, decorator, token/segmented rows -> reject or route to a
  separate explicit owner.

For the LexicalCaret pass, the useful Slate proof landed in
`.tmp/slate-v2/packages/slate/test/delete-contract.ts`:

- expanded range deletion trims both sibling text-leaf edges;
- expanded range deletion trims cross-block edges into the anchor block;
- selection collapses at the anchor after the destructive edit.

## Why This Works

The Slate contract should prove behavior a user or API caller can observe.
Lexical's caret classes are implementation machinery, but range deletion
semantics are editor behavior. Keeping the proof at the range edge avoids a
giant copied matrix while still covering the bug-prone part.

## Prevention

- Do not port upstream caret helper APIs unless Slate exposes the same API.
- For harvested caret tests, first ask which Slate owner already proves the row:
  query, text units, delete, split operations, or browser navigation.
- Add one compact behavior proof for the missing edge instead of copying every
  upstream permutation.
- Keep browser/native caret claims out of package tests.

## Related Issues

- [Adjacent block void delete must path-delete one target](../logic-errors/2026-05-09-slate-v2-adjacent-block-void-delete-must-path-delete-one-target.md)
- [Delete selection normalization must distinguish inline spacers from inline targets](../logic-errors/2026-04-14-slate-v2-delete-selection-normalization-must-distinguish-inline-spacers-from-inline-targets.md)
- [Adjacent mixed inline range delete should share edge delete helper](../logic-errors/2026-04-07-slate-v2-adjacent-mixed-inline-range-delete-should-share-edge-delete-helper.md)
