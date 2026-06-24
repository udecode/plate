---
title: Lexical history harvest rows need stack-law contracts
date: 2026-05-09
category: docs/solutions/best-practices
module: plite lexical harvest slate-history
problem_type: best_practice
component: testing_framework
symptoms:
  - LexicalHistory tests mixed portable undo/redo behavior with command payloads and nested editor wiring.
  - Copying the source tests directly would import Lexical APIs instead of strengthening Plite history contracts.
  - Existing Plite history rows covered many undo cases but missed redo-stack invalidation and node-property history capture.
root_cause: wrong_api
resolution_type: test_fix
severity: medium
tags: [plite, lexical-harvest, history, undo, redo, testing]
---

# Lexical history harvest rows need stack-law contracts

## Problem

LexicalHistory tests are useful, but only after stripping away Lexical command
notifications, shared parent editors, node keys, React harness setup, and nested
editor extension wiring.

The portable behavior is the history stack law: what enters undo, what enters
redo, what clears redo, and which document/selection state comes back.

## Symptoms

- A source row named `LexicalHistory in sequence: change, undo, redo, undo, change`
  looked like a CAN_UNDO/CAN_REDO command test, but the portable row was redo
  invalidation after a new edit.
- A quote-node undo test looked like Lexical rich-text coverage, but the portable
  row was block property changes entering undo/redo as one history batch.
- A TextNode leaf test looked like Lexical custom node dirty tracking, but the
  portable row was no-op updates staying out of history while property commits
  remain undoable.

## What Didn't Work

- Copying Lexical command payload assertions into Plite. Plite history exposes
  stacks and commands differently.
- Treating nested parent/child shared history as a raw Plite invariant. That is
  framework/product integration until a Plite nested-editor owner accepts it.
- Counting existing broad undo rows as enough. They did not explicitly prove the
  three stack laws this source file exposed.

## Solution

Translate each LexicalHistory row to the narrow Plite history contract it
actually exercises.

The accepted rows landed in
[`packages/plite-history/test/history-contract.ts`](/Users/zbeyens/git/plite/packages/plite-history/test/history-contract.ts):

- a new edit after undo clears redo history and later redo is a no-op
- selected block property changes undo and redo cleanly
- empty updates do not save history, while node property commits are undoable

The rejected rows stayed out:

- CAN_UNDO/CAN_REDO command notification payloads
- CLEAR_HISTORY command shape
- shared history across parent and nested editors
- Lexical node-key and NodeSelection internals
- React test harness setup

## Why This Works

History portability lives at the stack and committed-state level, not at the
source framework's command surface.

Plite can share the same behavior without sharing Lexical APIs:

- undo and redo stacks are observable
- document and selection snapshots are observable
- metadata and commit tags already own explicit grouping, merging, and skipping
- nested editor shared history needs its own accepted owner before it becomes a
  Plite claim

## Prevention

- For external history tests, first classify rows as stack law, selection
  restoration, command API, nested-editor integration, or harness setup.
- Add Plite rows only for stack laws and state restoration that current Plite
  owns.
- Reject command payloads and shared-editor wiring unless a Plite public owner
  exists.
- Keep history proof in `plite-history` package contracts unless the behavior
  needs browser/native transport.

## Related Issues

- [Plite history capture must anchor to commit subscribers, not onChange order](../logic-errors/2026-04-03-slate-history-capture-must-anchor-to-commit-subscribers-not-onchange-order.md)
- [Plite history withNewBatch must split at the commit writer](../logic-errors/2026-04-09-slate-history-withnewbatch-must-split-at-the-commit-writer.md)
- [Plite history deleted test closure must follow live contract width](../workflow-issues/2026-04-09-slate-history-deleted-test-closure-must-follow-live-contract-width.md)
- [Plite history typing bursts need legacy-style merge heuristics before anything else](../performance-issues/2026-04-11-slate-history-typing-bursts-need-legacy-style-merge-heuristics-before-anything-else.md)
