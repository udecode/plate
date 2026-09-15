---
title: Atomic updates and synchronous transaction authors
type: decision
status: accepted
updated: 2026-09-11
review_scope: transactions
current_review: 2026-09-11-transactions-synchronous-boundary
review_history:
  - ../review-records/2026-09-11-transactions-synchronous-boundary.json
source_refs:
  - ../../../packages/plitejs/src/core/public-state.ts
  - ../../../packages/plitejs/src/core/editor-lifecycle-api.ts
  - ../../../packages/plitejs/src/core/editor-extension.ts
  - ../../../packages/plitejs/src/core/command-registry.ts
  - ../../../packages/plitejs/src/editor-runtime-view.ts
related:
  - ./slate-v2-read-update-runtime-architecture.md
  - ./model-document-boundary.md
  - ./reads-demand-driven-invalidation.md
---

# Atomic updates and synchronous transaction authors

**Accepted and locally implemented:** enforce synchronous transaction authors
through the existing update, prepared-spec and canonical-change owners.
Extension writers and spec callbacks reject thenable results, and named-root
views forward author results to the same check. Independent read results keep
their existing contract.

## Job and hard laws

An editor operation must publish one coherent document, selection and metadata
result. An uncaught failure before publication discards its draft. Public
updates are synchronous and cannot nest; helpers use the active transaction.
Escaped transaction methods cannot write after their callback ends. A retained
commit or snapshot continues to describe its own revision.

Commands also need a non-publishing preparation phase. An input rule can build
a prefix, evaluate downstream behavior against it, and either discard or
continue that result. Media's break handler extends the downstream spec before
publication. These are distinct current jobs, not an argument from API age.

From scratch, the smallest design has one draft/change owner and one commit
boundary. Immediate writes and prepared commands enter that boundary after
their synchronous authors finish. Neither input path can hide an unfinished
author behind a discarded return value.

## Review-time evidence

| Surface | Source-backed behavior |
| --- | --- |
| Public update callback | `public-state.ts:8218` rejects a returned thenable; `runEditorTransaction` discards the failed draft. |
| Direct extension update | `editor-lifecycle-api.ts:168` captures the method result inside an update callback but does not return it to that check. |
| Configured extension portal | `editor-extension.ts:175` has the same result-discarding pattern. |
| Active extension method | `public-state.ts:4052` guards transaction lifetime but passes method results through; ignoring a returned Promise bypasses the outer callback check. This helper also serves read methods, so a blanket change needs care. |
| Pure and extended specs | `public-state.ts:5892` invokes the builder callback and finalizes the spec without checking its result. |
| Command publication | `command-registry.ts:398` applies a handled prepared spec through the existing active or outer update. There is no second public commit engine. |
| Corrections and publication | `runEditorTransaction` finalizes representation and corrections before publishing; post-commit observers run after publication with error reporting. |

The public probe has 14 boundary rows. Both synchronous controls work. Three
thenable-returning callback controls reject and preserve text, version and
notification count. Nine other forms accept a thenable-producing author:
seven publish a commit, while two return a prepared spec without publishing.

Three controlled delayed cases show the user-visible consequence at the model
API. The author inserts `!`, waits, then tries to insert `?`. A normal update
rejects and leaves `one` at version 0. An extension method and a command builder
publish `one!` at version 1. Both later fail with an inactive-transaction error;
their first write remains committed. This is a partial operation, not an async
transaction capability.

## Compare the material directions

| Direction | Decision and reason |
| --- | --- |
| Keep or configure | Keep the model and update surface. Caller discipline cannot make the inconsistent runtime rejection reliable. |
| Repair existing contracts | Selected. Enforce synchronous author completion for extension writes and pure/extended builders, using existing transaction lifetime and rollback owners. Preserve ordinary synchronous return values and inference. |
| Add an async transaction API | Reject for this job. It creates draft lifetime, concurrency and rebase obligations without a current requirement. Async work can finish before starting a fresh synchronous update. |
| Delete direct/configured update forms | Reject. They are entrances to the same boundary; deleting them adds callback ceremony and still leaves the pure-spec hole. They do not own another document or commit lifetime. |
| Delete prepared specs and run all commands live | Reject. It removes non-publishing evaluation, discarded prefixes and downstream composition. Recreating those jobs with savepoints or preview editors would retain equivalent machinery elsewhere. |
| Merge DocumentChange, TransactionSpec and Commit | Reject. A change supplies document transformation/mapping; a spec adds revision-bound selection/effects/tags before publication; a commit records an observed before/after revision. Their different lifetimes earn those boundaries. |
| Move the guard to Plate | Reject. Raw Plite, descriptor portals and headless command builders all expose the same defect. Plite owns the invariant. |
| Replace every update with a prepared command | Reject for this question. Immediate updates also stage extension publication and local after-commit work. Turning these into command payloads adds coordination without eliminating the synchronous-author requirement. |

The strongest justified cut removes the unchecked author-result paths. It does
not remove canonical changes, prepared command composition, or the public
update callback. No new signature, import, scheduler, cache, store or wrapper
family is proposed.

Existing call sites remain:

```ts
editor.update((tx) => {
  tx.text.insert("Hello");
  tx.marks.add("bold", true);
});

editor.update.command(command, input);
```

Ownership flow:

```text
synchronous update or command author
  -> existing draft / canonical change
  -> existing commit publication
  -> observers and afterCommit
```

The repair must preserve synchronous return values, command fallthrough and
prefix continuation, exact view/root scope, failed-draft cleanup, and read/API
methods with independent contracts. Do not broaden a shared proxy guard merely
because both reads and writes pass through it. This review approves the repair
direction; it does not select an unmeasured new per-method runtime layer.

## Proof and local adoption

At review time, five existing contract files passed 94 cases: document-change
algebra, update policy, after-commit behavior, read/update isolation, and
command specs. The separate public probe reproduced the gap with 14 boundary
rows and three delayed continuations. The original source-bound receipt
records those inputs and commands; implementation and its proof were outside
that review.

This is the first record for the transactions question. It freshly supports
the earlier read/update ownership direction while adding an inconsistent
author-boundary finding. The April decision and July broad API assessment are
historical context; their source observations were not assumed current. The
earlier invalidation implementation and its blocked closure remain separate.

The separately authorized Patch implements this repair in
`public-state.ts` and `editor-runtime-view.ts`. Its durable regression matrix
covers root and named-root update callbacks, extension facades and portals,
ignored results, nested/callable/tx-only methods, and pure/extended command
specs. It verifies rollback, retired continuations, notifications, subsequent
valid updates, thenable objects/functions and independent read results.

The initial regression run had 2 passing controls and 27 failures for missing
rejection. Final focused proof passes 187 tests across 10 files, including
31 regression cases, plus 12 source-first typecheck tasks and scoped lint.
The [Patch plan](../../plans/2026-09-11-synchronous-transaction-authors.md) and
[source-bound receipt](../../plans/artifacts/synchronous-transaction-authors/proof-receipt.json)
record the exact local proof. The original review record and probe remain
immutable historical evidence. This is local implementation evidence, with no
publication, browser/native, broad-checkout or performance claim.
