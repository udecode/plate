---
title: Lexical docs traversal harvest rows need query-shape contracts
date: 2026-05-09
category: docs/solutions/best-practices
module: Slate v2 Lexical harvest
problem_type: best_practice
component: testing_framework
symptoms:
  - Lexical docs traversal tests mix portable traversal behavior with caret helper APIs.
  - Existing query coverage can prove point movement while missing node-shape traversal rows.
  - Directly copying the tests would encode Lexical-specific range semantics.
root_cause: inadequate_documentation
resolution_type: documentation_update
severity: medium
tags: [slate-v2, lexical-harvest, traversal, query-contract, tests]
---

# Lexical docs traversal harvest rows need query-shape contracts

## Problem

Lexical's docs traversal tests are useful, but the useful part is not the
caret helper API. The portable part is the document shape: sibling order,
descendant order, and how a partial range maps to included leaves or elements.

## Symptoms

- The source file tests `$iterSiblings`, `$iterCaretsDepthFirst`, and
  `$iterNodesDepthFirst` together.
- Slate already has strong point movement coverage through `Editor.before`,
  `Editor.after`, and `Editor.positions`, but that does not automatically prove
  node traversal shape.
- A direct port would copy Lexical caret enter/exit machinery instead of
  strengthening the public Slate query contract.

## What Didn't Work

- Treating the row as already covered by point movement alone would miss
  `Node.children`, `Node.descendants`, and `state.nodes.match(...)` behavior.
- Copying Lexical's "enter" and "leave" caret events would add a fake API to
  Slate tests.
- Turning the row into browser proof would overclaim: this is package traversal
  behavior, not native browser transport.

## Solution

Map the Lexical traversal doc shape onto Slate's public query APIs:

- sibling traversal -> `Node.children(editor, path)`;
- reverse sibling traversal -> `Node.children(editor, path, { reverse: true })`;
- descendant traversal -> `Node.descendants(editor)`;
- leaf range traversal -> `state.nodes.match({ at: range, mode: 'lowest' })`;
- wholly included element traversal -> `state.nodes.match({ at: range, match:
  isElement, mode: 'lowest' })`.

The compact proof landed in
`../slate-v2/packages/slate/test/query-contract.ts` and uses the same nested
paragraph/link document shape as the Lexical docs test.

## Why This Works

Slate callers observe traversal through paths and node entries. Proving those
paths through the public query APIs covers the portable behavior while avoiding
Lexical's caret implementation model.

The `mode: 'lowest'` split is important: leaf traversal and element traversal
answer different questions. Keeping both assertions prevents a future query
change from preserving point movement while breaking caller-visible node
selection.

## Prevention

- For harvested traversal docs, first translate the source shape into Slate
  query APIs before writing any test.
- Do not copy caret enter/exit helper events unless Slate exposes that API.
- Keep traversal package proof out of browser rows unless the source invariant
  depends on native selection, DOM mutation, IME, or clipboard transport.
- When the source mentions "wholly included" nodes, test both leaf and element
  `mode: 'lowest'` output explicitly.

## Related Issues

- [Lexical caret harvest rows need range-edge contracts](./2026-05-09-lexical-caret-harvest-rows-need-range-edge-contracts.md)
- [Slate v2 editor query reverse must reverse emitted matches](../logic-errors/2026-05-07-slate-v2-editor-query-reverse-must-reverse-emitted-matches.md)
