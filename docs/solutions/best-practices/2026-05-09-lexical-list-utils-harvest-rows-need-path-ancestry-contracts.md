---
date: 2026-05-09
problem_type: best_practice
component: plite harvest
root_cause: test_design
title: Lexical list utility harvest rows need path ancestry contracts
tags:
  - plite
  - lexical-harvest
  - list
  - query-contract
  - path
severity: medium
---

# Lexical list utility harvest rows need path ancestry contracts

## Problem

Lexical list utility tests look tempting to port as helper APIs:
`$getListDepth`, `$getTopListNode`, and `$isLastItemInList`.

That is the wrong target for Plite unless Plite has accepted a public list
helper API. The portable behavior is the tree fact those helpers expose.

## Symptoms

- A harvest row says `refactor-existing` but the source test is mostly helper
  API shape.
- Copying the row would create a local list helper just to satisfy an upstream
  helper name.
- Existing Plite coverage already has broad transform/list behavior, but not a
  compact proof that public path queries expose the same ancestry facts.

## What Didn't Work

- Treating the Lexical helper names as the behavior.
- Duplicating every source fixture depth. One, two, and five levels all test the
  same path ancestry mechanism.
- Routing the row to browser list tests. This is model/query behavior, not
  native input transport.

## Solution

Write one compact package proof against Plite's public query primitives:

- `Path.levels` gives the logical ancestor chain.
- `Node.get` lets the proof filter list and list-item paths.
- `Node.has(editor, Path.next(path))` distinguishes terminal and non-terminal
  sibling positions.

The proof belongs in `packages/plite/test/query-contract.ts`.

## Why This Works

Plite's raw model does not need Lexical's list helper API to preserve the
behavior. The durable contract is that public path and node queries can recover:

- nested list depth;
- the top logical list ancestor, even below a non-root wrapper;
- descendant list ancestors for deeply nested items;
- whether an item is terminal in its local or ancestor list path.

## Prevention

When harvesting list utility tests from another editor:

- reject upstream helper API shape unless Plite already owns that public API;
- map helper outputs to `Path`, `Node`, or `Editor` query contracts;
- add one mechanism-level package proof instead of one fixture per source
  depth;
- keep browser proof for native list input, paste, or selection transport only.
