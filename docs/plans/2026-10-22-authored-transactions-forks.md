---
review_scopes: [authored, transactions]
verdict: [authored=stop, transactions=stop]
review_basis: [2026-10-17-authored-root-deletion, 2026-10-17-command-law-moved-content, 2026-10-16-transactions-refused-result, 2026-10-16-transactions-spec-key]
review_commit: 1d2221b6847cf74fe910d8e8c748250dd32d96e7
review_inputs: [VISION.md, docs/vision/common.md, .agents/playbooks/verdict.md, docs/plans/2026-10-17-authored-root-deletion.md, docs/plans/2026-10-17-command-law-moved-content.md, docs/plans/2026-10-16-transactions-refused-result.md, docs/plans/2026-10-16-transactions-spec-key.md, docs/plans/topics/authored.md, docs/plans/topics/transactions.md, docs/research/review-scopes/authored.json, docs/research/review-scopes/transactions.json, packages/plitejs/test/authored-root-deletion.test.ts, packages/plitejs/test/authored-tree-commands.test.ts, packages/plitejs/test/authored-refusal.test.ts, packages/plitejs/test/native-transaction-spec-contract.test.ts, packages/plitejs/test/react/projected-command-contract.test.ts]
---

# Authored and transactions: two forks of shipped work

Status: closed: Stop verdict
Playbook: verdict

**Stop for both scopes. Each scope had two current reviews, and all four Pursues have already landed on `next`, so no unbuilt target is left to choose between.** In `authored`, the root deletion review and the moved-content review each read a tree that did not hold the other, and each built its own target. In `transactions`, the refused-result review and the spec-key review did the same. Two Pursues on one scope with no later page naming both is what `review-ledger.mjs check` reports as a fork, and the daily full check has failed on these two since 2026-10-20. The verdict playbook writes a Pursue whose target already landed as a Stop, with the landed work as evidence. This page names all four heads, so it becomes the one head of each scope. The open work each head left stays with the suggested tasks its Close names.

## Brief

### What will change?

The review ledger stops reporting two forks. The authored and transactions scopes each get one current review again, a Stop, because the four reviews that forked them have all shipped and their tests still pass.

### What could go wrong?

A Stop could read as "nothing left to do" in those scopes. It is not. The open authored and transactions plans keep running, and every follow-up the four reviews left stays a suggested task.

## Teach

The review ledger keeps one current review per scope, so a later review knows what it builds on. When two sessions review the same scope at the same time, each writes its own page and neither page names the other. The ledger then sees two current reviews and calls it a fork, and its check fails until a page names both.

That happened twice. Two authored reviews and two transactions reviews ran in parallel, and each one built what it asked for. Nothing is left to pick between them. This page names all four and closes each scope with a Stop, which the verdict rules use for a Pursue whose work already shipped.

## Public API

No public call changes. This page records verdicts only.

## Defaults

| Decision | Pick | Alternative | Word | Impact |
| --- | --- | --- | --- | --- |
| When to settle the forks | Settle both now, as you asked (look) | Wait for the open authored and transactions plans to finish | wait | small |
| What both scopes do next | Hold, with nothing new to build | Review the scope again; a three-model challenge | again; interrogate | small |
| The authored page link | A new page at https://claude.ai/artifact/V1tpozSyUe7nsDoYrYUj9N, because https://claude.ai/artifact/LMYNM7X5UttawN35x7edE5 no longer opens for this account | Go back to the old page | old page | detail |

## Evidence

Model: Opus 5.5 (`claude-opus-5-5`), at xhigh effort.

### Requirements

- A scope has one current review, so a later review can name it in `review_basis` ([review history](../research/schema.md#review-history)).
- A Pursue whose target already landed is written as a Stop, with the landed work as evidence ([verdict playbook](../../.agents/playbooks/verdict.md)).
- A changed verdict reopens or supersedes the review before it and never retains it.
- `authored` keeps its question: a native contract that keeps authorship and reversible edits without a particular review UI ([authored scope](../research/review-scopes/authored.json)).
- `transactions` keeps its question: what becomes observable when updates commit, nest, fail or repair content ([transactions scope](../research/review-scopes/transactions.json)).

### Lanes

- **Stop both scopes and supersede all four heads (picked).** Every head's landing commit is in `origin/next`, and each head's own tests pass on this page's tree, as the reconciliation lines below cite.
- **Keep one head per scope as a Pursue.** Loses. Neither head in a scope leaves an unbuilt target, so a Pursue head would only send the ship list to plan work that already landed, and the other head still has to be superseded.
- **Wait for the open plans, as the ship items' waits say.** Loses on the owner's word. The `authored` item waits on four open plans and the `transactions` item on one, but none of them changes either fork's answer, and the check fails every day until they close.
- **The rule is wrong: let a fork of two built Pursues pass `check`.** Loses. A later review still needs one head to name, and two built Pursues can contradict each other: both authored landings changed `authored.ts` and `tree/record.ts`. Judging each fork once costs one page like this one.

### Reconciliation

- This review supersedes 2026-10-17-authored-root-deletion, because its Pursue landed on `next` in `7b7b76573b` and `authored-root-deletion.test.ts` passes 111 of 111 on this tree ([authored root deletion](2026-10-17-authored-root-deletion.md)).
- This review supersedes 2026-10-17-command-law-moved-content, because its Pursue landed on `next` in `c1dcf28cb5` and `authored-tree-commands.test.ts` passes 229 of 229 on this tree ([command law over moved content](2026-10-17-command-law-moved-content.md)).
- This review supersedes 2026-10-16-transactions-refused-result, because its Pursue landed on `next` in `83f6e5dde0`, `authored-refusal.test.ts` passes 19 of 19 and `react/projected-command-contract.test.ts` passes 61 of 61 on this tree ([refused result](2026-10-16-transactions-refused-result.md)).
- This review supersedes 2026-10-16-transactions-spec-key, because its Pursue landed on `next` in `e184158398` and `native-transaction-spec-contract.test.ts` passes 9 of 9 on this tree ([spec key](2026-10-16-transactions-spec-key.md)).

### Dependents

- ai, comments, documents, exports, html, layout, persistence, react, suggestions and ui: unaffected, because this page changes no code and records only that the two authored Pursues these scopes import from already landed with their own consumer proof.

`transactions` has no dependent scope.

### Proof limits

- The test runs prove the landed targets still hold on this tree under Bun and Vitest. No browser ran, and each head's own Close names where its proof stops.
- The `authored` and `transactions` subject files keep their current decisions. This page changes no conclusion in them.

## Close

What landed, in one commit on `next`, with the review ledger's rule fix landed before it as its own commit:

- This page, which settles the two forks.
- Record repairs in 24 older plans. Six plans had `review_inputs` that named run-directory files or upstream paths a fresh checkout lacks; they now name tracked files. Twenty plans got a `### Review inputs` list in their Close, because check asks a landed plan's Close to name each review input. `2026-10-16-raw-root-writes.md` and `2026-10-15-whole-block-roots.md` got a full-length `review_commit` and full upstream hashes, and `2026-10-17-command-law-moved-content.md` got the `## Public API` section a Pursue page needs.
- Scope membership. Eleven scope entries named files that no longer exist; each now names the file that replaced it, or is gone. The 96 files no scope owned now each belong to the scope whose tests or callers use them.

Proof:

- `node tooling/scripts/review-ledger.mjs check` passes on the final tree. Scope: every plan and review page in `docs/plans` and every scope file, on this worktree's tree.
- `node tooling/scripts/review-ledger.mjs coverage` lists 0 unowned and 0 dangling entries. Scope: every tracked source file the ledger's universe counts.
- Each forked head's tests pass on this tree, as the reconciliation lines cite.

Where the proof stops. `pnpm check knowledge` still fails on its K7 citations, which this run did not touch, and suggested task `t_13ef6379` owns that check too.

Review inputs: `VISION.md`, `docs/vision/common.md`, `.agents/playbooks/verdict.md`, `docs/plans/2026-10-17-authored-root-deletion.md`, `docs/plans/2026-10-17-command-law-moved-content.md`, `docs/plans/2026-10-16-transactions-refused-result.md`, `docs/plans/2026-10-16-transactions-spec-key.md`, `docs/plans/topics/authored.md`, `docs/plans/topics/transactions.md`, `docs/research/review-scopes/authored.json`, `docs/research/review-scopes/transactions.json`, `packages/plitejs/test/authored-root-deletion.test.ts`, `packages/plitejs/test/authored-tree-commands.test.ts`, `packages/plitejs/test/authored-refusal.test.ts`, `packages/plitejs/test/native-transaction-spec-contract.test.ts`, `packages/plitejs/test/react/projected-command-contract.test.ts`.
