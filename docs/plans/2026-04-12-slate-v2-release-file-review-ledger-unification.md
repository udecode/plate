---
date: 2026-04-12
topic: slate-v2-release-file-review-ledger-unification
status: completed
---

# Slate v2 Release File Review Ledger Unification

## Goal

Make
[release-file-review-ledger.md](/Users/zbeyens/git/plate-2/docs/slate-v2/release-file-review-ledger.md)
the single live answer for legacy-file closure truth.

## Scope

- inline the key external closure matrices that currently live in `docs/plans/`
- keep historical batch notes as history, not required control-plane docs
- reduce “closed in X” wording in the live ledger

## External Truth To Fold In

- core deleted test-family aggregate closeout
- slate-react deleted test-family matrix
- slate-history deleted test-family matrix
- deleted Playwright example-test matrix
- restore-dom family closure matrix
- Android legacy-case classification matrix

## Exit

- the live ledger can answer the legacy-file closure question without requiring
  sibling plan docs as the primary source

## Result

- consolidated deleted test-family matrices now live in
  [release-file-review-ledger.md](/Users/zbeyens/git/plate-2/docs/slate-v2/release-file-review-ledger.md)
- consolidated browser/input legacy family matrices for `restore-dom` and the
  Android manual-case classification now live there too
- former sibling closeout docs are demoted to historical batch notes instead of
  primary closure owners
