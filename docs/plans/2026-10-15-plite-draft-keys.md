# A draft keys the nodes it writes

Status: executed, landed as a patch on the checkout's working tree; waiting on your commit
Page: https://claude.ai/artifact/Av92P6rCHynCN8EXPLEqq9
Playbook: bug-fix

Execution playbook: Bug fix (`.agents/playbooks/bug-fix.md`). Run directory: `docs/plans/artifacts/2026-10-15-plite-draft-keys/`. Requested by suggested task task_5699b1c2 (topic `plite-draft-keys`), from round 2 of the PR 5170 diff panel, Opus warning 4. Intake base: `next` at `b1e70bb257` plus the checkout's uncommitted work, recorded as tree `d7254e53a2` in `docs/plans/artifacts/2026-10-15-plite-draft-keys/baseline-tree.txt`; the task lands as a patch on the checkout's working tree.

## Brief

### What will change?

Commands and input rules can now ask for the key of a block they just changed, and the block keeps that key once the change lands. It landed as a patch with tests.

### What could go wrong?

Every typed character now writes two more keys, whatever the document size. This machine was too busy to time it, so a follow-up times it on a quiet one. The new test also adds two type errors.

## Teach

Every block in the editor has a key, its identity. Plugins use keys to remember things about a block, like whether a toggle is open. Commands and input rules do their work on a draft first, and the editor lands the draft when the command finishes.

Before this fix, the draft knew each block's key by position but never wrote it onto the blocks it changed. So asking for the key of a block the draft just edited threw, and landing worked the keys out again from scratch. It got that wrong when a draft edited and then moved a block, or made a wrapper or a split. Those blocks landed with a new key.

Now the draft writes each key it knows onto the blocks it changes. A plugin can ask for any block's key mid-draft, and landing keeps those keys.

## Main changes

- A transaction-spec draft maps its keys with the `inherited` binding, the mode command frames already use, so each node the draft rewrites carries its inherited key and each node it creates carries its draft key. Acceptance keeps those keys as the live ones when it adopts the draft, and a discarded draft still allocates no live key. A spec applied after other writes moved the draft epoch replays its change instead and may assign new keys; t_3041aa10 checks that path.
- Prepared-key lookups bind in a draft too, so a node from a prepared slice, such as a `fragment.replace` or `tx.changes.apply` write, resolves its prepared key mid-draft.
- Outside publication, a mapping binds a key only onto an object that has none (`bindNodeKeyOnce`), so a draft never re-points the key of an object the live tree shares.
- The `none` binding has no user left and is deleted.

## Defaults

| Decision | Pick | Alternative | Word | Impact |
| --- | --- | --- | --- | --- |
| How a draft keys its blocks | The draft writes each known key onto the blocks it changes | Look the block up by position every time, which still loses keys when a block is edited then moved | lookup keys | big |
| Plate code that reads keys by position | Keep it, since it also picks the right root and now gets the same keys | Change it to read keys from the block | node reads | small |
| Typing speed check | Land now with the extra key writes counted, and time it later on a quiet machine (look) | Hold the fix until a quiet machine times it | time first | small |
| Draft key in the public types | Leave it to its own design task, so the new test adds two type errors until then | Add it to the draft's types now | type key now | small |
| Old bug: a cancelled draft re-keys a block it puts back | Give it its own task, since it happens without this fix too | Fix it here | fix reinsert | small |

## Steps

- [x] 1. Reproduce: in a spec draft, `tx.key(node)` throws for a node the draft rewrote, Details wrap throws in a command draft, and a census of draft writes shows which keys drift at acceptance. Proof: `docs/plans/artifacts/2026-10-15-plite-draft-keys/probes/rule-key-base-a1.log`, `docs/plans/artifacts/2026-10-15-plite-draft-keys/probes/details-draft-base-a1.log`, `docs/plans/artifacts/2026-10-15-plite-draft-keys/probes/spec-key-matrix-base-a1.log`.
- [x] 2. Run `architect` on the fix and pick the design. Proof: the three runner answers in `docs/plans/artifacts/2026-10-15-plite-draft-keys/architect/` and the cross-judge's `docs/plans/artifacts/2026-10-15-plite-draft-keys/architect/judge/verdict.md`.
- [x] 3. Write the failing contract case in `packages/plitejs/test/native-transaction-spec-contract.test.ts`, then make the fix in `packages/plitejs/src/core/public-state.ts` and `packages/plitejs/src/core/snapshot-index.ts`. Proof: the case red on the baseline with only the test applied and green on the fix, and the prepared-slice case red without the prepared-lookup binding: `docs/plans/artifacts/2026-10-15-plite-draft-keys/proof/contract-red-a1.log`, `docs/plans/artifacts/2026-10-15-plite-draft-keys/proof/contract-final-a1.log`, `docs/plans/artifacts/2026-10-15-plite-draft-keys/proof/graft-inherited-a1.log`, `docs/plans/artifacts/2026-10-15-plite-draft-keys/proof/graft-final-a1.log`.
  The approved proof named "a mutant that restores the old binding". With `none` deleted, restoring it alone behaves like `inherited` at runtime, so the baseline arm is that mutant.
- [x] 4. Run the pre-acceptance perf probe: key bindings per key press at 100 and 2,000 blocks, and the paired typing timing line. Proof: `docs/plans/artifacts/2026-10-15-plite-draft-keys/perf/count-bindings-base-a1.log`, `docs/plans/artifacts/2026-10-15-plite-draft-keys/perf/count-bindings-final-a1.log`; the timing line `docs/plans/artifacts/2026-10-15-plite-draft-keys/perf/paired-typing-a1.log` was inconclusive under load, accepted under Defaults' "time first" and owed to t_13817dd8.
- [x] 5. Run the plitejs and platejs suites on the baseline and on the fix. Proof: the same failures both ways and no new ones: `docs/plans/artifacts/2026-10-15-plite-draft-keys/proof/plitejs-pkg-base-a2.log`, `docs/plans/artifacts/2026-10-15-plite-draft-keys/proof/plitejs-pkg-final-a2.log`, `docs/plans/artifacts/2026-10-15-plite-draft-keys/proof/platejs-pkg-base-a1.log`, `docs/plans/artifacts/2026-10-15-plite-draft-keys/proof/platejs-pkg-final-a1.log`, and the IME flake's classification in `docs/plans/artifacts/2026-10-15-plite-draft-keys/proof/ime-count-a3.log` and `docs/plans/artifacts/2026-10-15-plite-draft-keys/proof/ime-family-x10-a1.log`. On the final bytes: `docs/plans/artifacts/2026-10-15-plite-draft-keys/proof/accept-plitejs-pkg-a1.log`, `docs/plans/artifacts/2026-10-15-plite-draft-keys/proof/accept-platejs-pkg-a1.log` and the combobox timeout's reruns in `docs/plans/artifacts/2026-10-15-plite-draft-keys/proof/combobox-x4-a1.log`.
- [x] 6. Close: writing passes, `pnpm lint:task` on the task's paths, the changeset, the patch landed on the checkout. Proof: `docs/plans/artifacts/2026-10-15-plite-draft-keys/comment-sicko/reply.md`, `docs/plans/artifacts/2026-10-15-plite-draft-keys/proof/lint-task-a1.log`, `.changeset/plite-draft-keys.md`, `docs/plans/artifacts/chips/task_5699b1c2.patch`.

## Verification

- The new contract case fails on the baseline and passes on the fix; the prepared-slice case fails without the prepared-lookup binding.
- Eight probes replay each reported shape on the final tree with stable keys; the plitejs and platejs suites fail only where the baseline fails.
- Typing writes 4 keys per character against 2 before, flat from 100 to 2,000 blocks; wall-clock timing is still owed.

## Open work

- t_365a2462 Keep a discarded draft from re-keying a block it reinserts. A draft that removes a live block and inserts the same object again leaves the live object keyed with a prepared key after a discard; the baseline does it too. owner: zbeyens; stop: the task is started or dismissed. Tracked in `docs/plans/suggested-tasks.decisions.tsv`.
- t_2d8a3c2b Decide whether a transaction spec's builder exposes `key`. The new test's two `tx.key` calls add two `TS2339` errors to the plitejs test typecheck, which is already red at baseline: 1,207 errors before, 1,208 with the fix, which also clears one. Four older calls in the same file fail the same way. Exposing `key` should clear all six (inferred, not run). owner: zbeyens; stop: the task is started or dismissed. Tracked in `docs/plans/suggested-tasks.decisions.tsv`.
- t_3041aa10 Decide whether a replayed spec keeps the keys its draft handed out; unverified. owner: zbeyens; stop: the task is started or dismissed. Tracked in `docs/plans/suggested-tasks.decisions.tsv`.
- t_13817dd8 Time the draft-keys typing path on a quiet host, budget 1.05 at 100 and 2,000 blocks; a conclusive miss sends the design back to `architect`. owner: zbeyens; stop: the task is started or dismissed. Tracked in `docs/plans/suggested-tasks.decisions.tsv`.
- `docs/plans/2026-10-14-pr-5170-redo.md` still says that inside an input rule's draft Plite has no key for a node the draft just wrote, which this fix makes false. That plan belongs to another run, so this page only flags it. owner: zbeyens; stop: that plan's next edit. Tracked on this page.

## Close

Reversals and deviations come first. The run committed a baseline in its worktree, then undid it, because a card session commits nothing; the baseline lives as tree `d7254e53a2`. The comment pass removed the `getEditorNodeKeyForNode` reorder along with the comment that explained it. The next line depended on a side effect of the index read, and correctness never needed it. The walk it saved runs only for `tx.key` on a prepared-slice node inside a draft, where the baseline walked the same index and then threw. Step 3's mutant is the baseline arm, because with `none` deleted a restored `none` behaves like `inherited`.

The change is a one-word edit in `inheritDocumentChangeStepNodeKeys`, bind-once binding for drafts and prepared lookups in `snapshot-index.ts`, the deleted `none` binding, a stale docstring removed from `inRoot.ts`, a new contract test, an updated prepared-slice test and the `plitejs` patch changeset. It landed as a patch on the checkout's working tree; the owner commits it.

Proof and its limits:

- The contract case fails on the baseline with only the test applied and passes on the fix. It reads `tx.key` for a wrapped quote and its paragraph inside `state.transaction` and compares with `editor.key` after `applyTransactionSpec`.
- The prepared-slice case fails without the prepared-lookup binding (expected `p0`) and passes on the fix.
- Nine probes, run again on the final bytes, match their earlier output. `tx.key` resolves rewritten, wrapped, split and moved nodes, Details edit-then-wrap opens with its key, and a prepared change resolves `p0`. The setType probe row throws a schema error on both trees because its fixture puts text in a blockquote.
- On the final bytes, the plitejs and platejs suites fail only where the baseline fails, apart from one combobox case that timed out at 5,016 ms while typing 76 characters. That case then passed 4 of 4 runs on both trees, and timed alternately at load 23 to 25 it took a median of about 1,226 ms on the baseline and 1,239 ms on the fix.
- The IME decoration family that failed on an earlier run of the fix is a timing flake. The baseline fails the same assertion in 1 of 10 runs. An instrumented final tree shows the IME file never reaches the spec mapping, the prepared binds or the node lookups. The other changed branch, the draft bind in `keyAt`, meets no node that already holds a key, as the next bullet counts.
- Bind-once differs from the old overwrite only when a draft binds a node that already holds another key. An instrumented final tree ran both package suites and the IME file: 79 test processes ran draft claims and 5 ran draft binds, and none met such a node or failed a claim. So on every tested path bind-once and the old overwrite behave the same. On an untested path the node would keep its key while the draft's index holds the new one, a reading of the code, not a run.
- A related old bug, a cancelled draft re-keying a block it reinserts, reproduces on the baseline and the fix alike and goes to t_365a2462.
- Typing writes 4 keys per character against 2 before, and Enter 4 against 3, flat from 100 to 2,000 blocks. Wall-clock timing did not run on the final bytes and was inconclusive under load on the one-word flip, so the performance gate stays open with t_13817dd8.
- No hand drive ran. The toolbar, slash menu and Turn into run Details writes as live updates, not spec drafts, and a proposing-view probe opens Details with the same keys on both trees.
- Every proof ran on the baseline tree plus this patch. By landing time the checkout's `public-state.ts` held another session's uncommitted edits elsewhere in the file. The patch applied cleanly beside them, but the combined file was not tested.
- The new test adds two type errors to the plitejs test typecheck, which is already red at baseline; t_2d8a3c2b owns the type that clears them.
- The key guarantee holds when acceptance adopts the draft. A spec applied after other writes replays instead, and t_3041aa10 checks whether its keys survive.

Counts: 6 steps, all done.

### Attention

reviewed by gpt-6.1-sol @xhigh

- Warning: the IME count rerun had not reached the checkout. It lands with this Close, and the close check passes there.
- Warning: the new test adds two type errors that are not pre-existing. The run keeps them and states them above, and t_2d8a3c2b owns the fix.
- Warning: the typing timing gate is unmet on the final bytes. The landing went ahead under the Defaults row "time first"; the gate stays open with t_13817dd8.
- Warning: bind-once had no reproducer and changes command frames too. The instrumented suites now count zero cases where it differs from the overwrite; the untested case is labeled as read from code.
- Warning: replay identity is unverified. The key guarantee is now qualified to adoption, and t_3041aa10 owns the replay path.
- Warning: the combobox timeout's cause was unproven. A controlled alternating timing now shows the same median on both trees.
- Warning: proof covered the baseline plus the patch, not the combined checkout. The Close states it as a limit. The finding's only trigger is another session's edits, so the project's Other sessions rule leaves it there. `landed-tree.txt` records the worktree's tree of baseline plus patch, the base of the Close patch, not the checkout.
- Nit: the IME claim overstated the instrumentation. The Close now narrows it and counts the `keyAt` bind too.
