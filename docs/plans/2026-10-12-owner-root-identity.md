# Content-root owners keep their index identity after an edit inside them

Status: executed, waiting on your commit
Page: https://claude.ai/artifact/KenzHgKaJwCZJwY2z9xABD
Playbook: bug-fix

In `plitejs`, removing an element that owns a content root threw `EditorSchemaValidationError: Element-owned root index provenance for "exclusive-portal.body" is stale.` when the owner had been edited inside first. Typing into the owner's text, deleting text there, appending a child at the end of its children, or deleting from its text into the next block all set it off. The same removal worked with no earlier edit. This plan fixes the element-owned root index so an owner keeps its index identity across any edit that starts inside it.

## Brief

### What will change?

Removing or retyping an element that owns a content root now works after someone typed, deleted or added content inside it. Before, it crashed with a stale index error.

### What could go wrong?

The risk is low. Edits inside such an element do a bit more work, which grows only with how deep the edit sits. You asked for one test, and I added two. Nothing is committed yet. That's yours.

## Teach

Some elements own a separate content root, like a portal whose body lives in its own root. Plite keeps an index of these owners so it can check, on every change, that each exclusive root still has exactly one owner. The index tags each owner with an id. Documents are immutable, so every edit inside an owner swaps in a new copy of it, and the index has to move the id onto the new copy.

It moved ids only along the nodes a change marked as touched. Typing into the middle of an owner's text marks nothing, so the new copy got no id. The next change that looked at the owner, such as removing it, gave it a fresh id, removed that fresh id, and left the old entry behind. The validator then found an entry it could not place and threw.

Now the index also moves ids along every node that holds the start of the edit. Any edit that starts inside an owner keeps its id, so a later removal finds and drops the right entry.

## Main changes

- In `packages/plitejs/src/core/element-owned-root-index.ts`, the new `innermostPathContaining` finds the deepest node whose interior holds a changed range's start. `transferChangedOwnerIdentities` now carries owner ids along that node's path for each changed range, and still along each `changedNodes` candidate's path. The walk that copies an id onto an owner's replacement when its type and `childRoots` are unchanged moved into the local `transferIdsAlongPath` without change.
- `packages/plitejs/test/content-root-lifecycle-contract.test.ts` adds `cascades an exclusive root when its owner is removed after an edit inside it` and `cascades an exclusive root when its owner is removed after a delete from inside it into the next block`.

## Defaults

| Decision | Pick | Alternative | Word | Impact |
| --- | --- | --- | --- | --- |
| Regression tests | Two, since a delete that leaves the owner fails differently from typing | Only the typing test you asked for | one test | small |
| Release note | None, because Plite has only shipped an empty placeholder | Add a Plite patch note | add note | detail |
| Speed check | Count the index work at 50,000 owners, since the busy machine made timings unreliable | Time typing on a quiet machine | time it | small |
| The explaining comment | A named helper instead, as the comment pass asked | Keep the comment | keep comment | detail |

## Performance

- applicability: applied
- repeated unit: a changed range in a document whose schema declares content roots; schemas without content roots skip this index.
- cost: one `openContextAt` descent per changed range, then one id lookup per node whose interior holds the range start, and one path mapping per such owner. It grows with nesting depth, not document size.
- cohorts: the existing case `keeps omitted-value root lookup and local edits sparse at 50k owners` in `incremental-schema-validation.test.ts` types inside one of 50,000 owners and asserts zero owner visits, zero index builds and zero global fallbacks. It passed on the final bytes.
- interaction metrics: none. The host load average was 38.88, 53.07 and 37.29 on 18 cores, so a timing line would be inconclusive; the claim stays at the deterministic count.
- native behavior, memory and DOM: not touched; this is model-side index bookkeeping.

## Close

**Reversals.** The first fix walked only the nodes whose content held the whole changed range. After the audit, a probe I added showed that a delete from the owner's text into the next block still threw. The walk now follows every node whose interior holds the range start, and a second test covers that delete. The first acceptance run (`accept-a1.log`) and the first mutation ran on the first fix's bytes, so the final runs below replace them. The comment pass removed the fix's comment and asked for a named helper instead. You asked for one regression test, and there are two, because the second fails on a defect the first cannot see. The `one test` word in Defaults drops it.

**Landed, uncommitted on `next`.** Two files: `packages/plitejs/src/core/element-owned-root-index.ts` and `packages/plitejs/test/content-root-lifecycle-contract.test.ts`. Neither held other sessions' work before this run. The exact patch is `docs/plans/artifacts/2026-10-12-owner-root-identity/task-2.patch`, and every log below is in that folder.

**Proof.**

- Reproduction. At HEAD 6fa1169c5e in a clean worktree, `probe-owner-edits.ts` threw stale provenance for typing inside, deleting inside, appending a paragraph at `[1,1]` in a box owner, typing and removing in one transaction, editing a nested box paragraph, and typing then retyping the owner (`probe-base-a1.log`). Removing with no edit and inserting a text node at `[1,0]` passed.
- Mechanism. With tagged logs in a scratch copy of the index, a text insert at `[1,0]` offset 0 had changed range `7..7` and no `changedNodes` candidates while `[1]` and `[1,0]` held it. The removal then minted id `00000002` and removed key `00000002:body` while the index held `00000001:body` (`diag-instrumented-a1.log`).
- Red first. With only the new tests at HEAD, both new cases fail with stale provenance (`test-red-head-a3.log`).
- Mutation. On the frozen candidate `b5d335c029`, the control passes 19 of 19 (`mutate/control-1-a2.log`). Dropping the new call fails both new cases (`mutate/drop-containing-path-transfer-a1.log`). Walking the range end instead of its start fails only the delete case (`mutate/walk-range-end-instead-of-start-a1.log`).
- Final acceptance. In a `proof-worktree.mjs --install` worktree at HEAD plus `task-2.patch`, the lifecycle and incremental-validation files pass 46 of 46, the probe's ten cases all succeed, the plitejs bun lane passes 3,446 tests with 0 failures across 155 files, and `pnpm turbo typecheck --filter=./packages/plitejs` passes 13 of 13 tasks with 0 cached (`accept-a2.log`).
- Reporter's gesture. The reporter's own `probe-owner-removal.ts` now passes both cases in this checkout (`reporter-probe-checkout-a1.log`), where it threw before.
- Lint. `pnpm lint:task` reports 0 warnings and 0 errors on both files (`lint-task-a2.log`).
- Audit. A read-only Codex seat listed 32 places in plitejs that carry per-node state across a change and found none with this gap (`audit/answer.frozen.md`). I read the two closest ones, the node-key mapping in `snapshot-index.ts` and the runtime candidates in `classification.ts`. Both already keep the nodes that touch each range end.

**Limits.** The audit read source and ran nothing. No timing was measured, because the machine was heavily loaded; the speed claim is the existing 50,000-owner work count. The probe's box-owner delete into the next block already passed on the first fix, so it shows only that nothing regressed. The test file sits outside the tsconfigs that the plitejs typecheck covers, as `verify`'s command recipes say, so only its runtime run checks it.

**Counts.** 16 decision rows. Every requested item is done: the mechanism confirmed at runtime, the fix in the owning function, the regression test seen red first, and acceptance in an install worktree. There is no changeset, because `plitejs` 0.0.1 on npm holds only a license, `package.json` and a readme.
