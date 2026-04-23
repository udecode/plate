---
date: 2026-04-10
topic: slate-v2-normalization-phase-boundary-note
---

# Slate v2 Normalization Phase Boundary Note

> Archive only. Detailed boundary note. For the live normalization read, see
> [../normalization-reference.md](/Users/zbeyens/git/plate-2/docs/slate-v2/references/normalization-reference.md).

## Purpose

Record the current normalization phase ordering so maintainers stop talking as
if a future `commit canonicalization` tier already exists.

It does not.

## Current Ordering

For ordinary work, `withTransaction(...)` does this on the outer transaction:

1. create transaction draft state
2. run user work
3. run custom normalizers
4. publish the transaction

Code:

- outer transaction creation and `explicitNormalize` default:
  [with-transaction.ts](/Users/zbeyens/git/slate-v2/packages/slate/src/core/with-transaction.ts#L19)
- custom normalization runs before publish:
  [with-transaction.ts](/Users/zbeyens/git/slate-v2/packages/slate/src/core/with-transaction.ts#L58)
- publish happens immediately after:
  [with-transaction.ts](/Users/zbeyens/git/slate-v2/packages/slate/src/core/with-transaction.ts#L64)

## What Publish Does

Publish is not a second normalization phase.

It materializes the committed snapshot, syncs the public editor, rebases range
refs, notifies listeners, and fires `onChange()`:

- snapshot materialization:
  [transaction-helpers.ts](/Users/zbeyens/git/slate-v2/packages/slate/src/core/transaction-helpers.ts#L132)
- public sync:
  [transaction-helpers.ts](/Users/zbeyens/git/slate-v2/packages/slate/src/core/transaction-helpers.ts#L143)
- range ref publish:
  [transaction-helpers.ts](/Users/zbeyens/git/slate-v2/packages/slate/src/core/transaction-helpers.ts#L146)
- listener + `onChange()`:
  [transaction-helpers.ts](/Users/zbeyens/git/slate-v2/packages/slate/src/core/transaction-helpers.ts#L160)

That means any new “commit-tier canonicalization” must answer one concrete
question first:

- does it run before snapshot materialization
- after snapshot materialization but before public sync
- or after public sync and therefore change the meaning of the published
  snapshot

Until that is explicit, the tier is imaginary.

## `Editor.normalize(...)` Is Still Just The Explicit Flag

`Editor.normalize(...)` does not call a separate canonicalization engine.

It enters the same transaction machinery with `explicitNormalize: true`:

- [editor.ts](/Users/zbeyens/git/slate-v2/packages/slate/src/editor.ts#L1476)

The public API docs already describe the live split this way:

- transaction completion does the default behavior
- `Editor.normalize(...)` is the explicit heavier pass

See:

- [editor.md](/Users/zbeyens/git/slate-v2/docs/api/nodes/editor.md#L563)
- [editor.md](/Users/zbeyens/git/slate-v2/docs/api/nodes/editor.md#L585)

## Consequence

Promoting an explicit-only cleanup rule into “commit-time canonicalization”
right now would not be a hidden internal refactor.

It would change what ordinary committed snapshots look like.

That is a migration-visible contract change.

## Required Precondition For Any Promotion

Before any explicit-only rule is promoted, the redesign must first define:

1. the new phase location
2. whether range refs publish before or after it
3. whether listeners / `onChange()` observe pre- or post-canonicalized state
4. whether app-owned `normalizeNode(...)` participates in that phase

If those answers are missing, the safe decision is to keep the lane closed.
