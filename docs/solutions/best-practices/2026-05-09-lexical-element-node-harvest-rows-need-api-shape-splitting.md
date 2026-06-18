---
title: Lexical element node harvest rows need API-shape splitting
date: 2026-05-09
category: docs/solutions/best-practices
module: Slate v2 Lexical harvest
problem_type: best_practice
component: testing_framework
symptoms:
  - Lexical element-node tests mix portable query behavior with Lexical JSON, DOM slot, and node lifecycle APIs.
  - Existing Slate operation coverage can make a direct splice port redundant.
  - Text traversal gaps can hide inside a broad element-node source file.
root_cause: inadequate_documentation
resolution_type: documentation_update
severity: medium
tags: [slate-v2, lexical-harvest, element-node, query-contract, tests]
---

# Lexical element node harvest rows need API-shape splitting

## Problem

Lexical element-node tests look portable at first, but the file combines several
owners: JSON schema, element child queries, text traversal, splice behavior,
transform scheduling, DOM slot rendering, and DOM index helpers. A direct copy
would drag Lexical architecture into Slate tests.

## Symptoms

- `getChildren`, `getAllTextNodes`, `getFirstChild`, `getLastChild`, and
  `getTextContent` are portable query behavior.
- `splice` rows overlap with Slate operation, transform, and selection-rebase
  contracts.
- `getDOMSlot`, `indexPath`, Lexical JSON schema, node keys, and transform
  scheduling are not raw Slate package behavior.

## What Didn't Work

- Treating the whole file as one "element contract" would either duplicate
  existing operation proofs or assert Lexical-only API shape.
- Skipping the file as framework internals would miss the useful text-leaf
  traversal proof.
- Browser proof would overclaim the accepted row. The useful gap is package
  query behavior.

## Solution

Split Lexical element-node rows by the API the Slate caller actually observes:

- child/text queries -> `Node.children`, `Node.texts`, `Node.first`,
  `Node.last`, and `Node.string`;
- splice/selection movement -> existing operation, transform, and selection
  owners unless a concrete gap appears;
- DOM slot and DOM index helpers -> reject or route to a browser/React owner;
- Lexical JSON/node lifecycle -> reject as framework API shape.

For this pass, the useful proof landed in
`packages/slate/test/query-contract.ts`:

- nested text leaves are emitted in document order;
- first and last text leaves resolve from a nested element;
- element text content is produced by Slate's public `Node.string` contract.

## Why This Works

The Slate test should protect observable editor behavior, not Lexical's class
model. Query APIs own text traversal; operation APIs own structural mutation;
React/browser tests own DOM slot behavior. Keeping those owners separate makes
the harvested coverage stronger and smaller.

## Prevention

- For broad upstream node test files, split each row by public Slate owner
  before editing.
- Do not port upstream JSON schemas, node-key lifecycle, or DOM helper APIs
  unless Slate exposes the same public surface.
- Prefer one compact query proof for missing traversal behavior over copying a
  matrix of class methods.
- Route mutation rows through existing operation and selection contracts first.

## Related Issues

- [Lexical docs traversal harvest rows need query-shape contracts](./2026-05-09-lexical-docs-traversal-harvest-rows-need-query-shape-contracts.md)
- [Slate v2 editor query reverse must reverse emitted matches](../logic-errors/2026-05-07-slate-v2-editor-query-reverse-must-reverse-emitted-matches.md)
