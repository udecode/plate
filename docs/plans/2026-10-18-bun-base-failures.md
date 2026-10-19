# Fix the Bun tests that fail on next

Status: executed, two AI discard tests left to t_c411234d
Page: https://claude.ai/artifact/1tmt3TSk8mfAxx49JeDGiF
Playbook: bug-fix

## Brief

### What will change?

Four of the six tests still failing on next pass again. The first undo of a removal hands back the same block again, so code blocks keep their syntax colors. Two test fixtures now match the stored shapes you changed.

### What could go wrong?

An undo after a redo still rebuilds the block, as it did before the regression. Two AI discard tests stay red. A task already waiting for you owns them.

## Teach

Undo works by applying the reverse of the edit you made. When that reverse puts back a block you removed, Plite can hand back the very same object, so anything cached on that block, like code syntax colors, is reused. Plite allows that only once per object, to stop one object from showing up twice.

On next, every history write also built a "replay record" for mapping collaborators' edits, and building it ran the reverse edit early. That early run used up the one-time reuse, so the real undo had to copy the block, and the code block lost its cache.

Now the record is built only when a later change, such as a collaborator's edit, is mapped over that history entry, which is also when the old code ran that edit. The one-time rule still bites on an undo after a redo, because the first undo already used the reuse up.

## Main changes

- `HistoryReplay` in `packages/plitejs/src/history/history-replay.ts` keeps `change` and `direction` as fields and moves `after`, `format` and `structure` behind a memoized `record()` call. Every history write recorded the replay, and its eager `change.apply` spent the change's one-time prepared-node claim, so undo rebuilt the blocks it restored. Only `resolveHead` and `mapHistoryReplay` call `record()`, when a later change maps over the entry.

## Defaults

| Decision | Pick | Alternative | Word | Impact |
| --- | --- | --- | --- | --- |
| AI discard tests | Leave both to the waiting task that already owns them (look) | Fix them here, racing that task's session | fix AI here | big |
| History fix shape | Build the replay record only when it is read (look) | Change Plite so applying an edit no longer uses up block reuse | rescope claims | small |

## Steps

- [x] Rerun the twelve on current next, alone and without load. Proof: logs `alone-*.log` in the run directory.
- [x] Find each cause on the base. Proof: probe runs and bisect logs in the decision log.
- [x] Fix the code-block identity, the code-block slice policy and the S1 fixture. Proof: `fixed-*.log`, `plitejs-fixed-a1.log`, `platejs-fixed-a1.log`.
- [x] Panel on the diff, then land. Proof: three seats on `round1.patch`; `final-codeblock-a1.log`, `final-s1-a1.log`, `final-plite-history-a1.log`.

## Close

Ten of the twelve pass on next with this commit. Six already passed upstream: the five plitejs authored-tree-record laws and migratePlateV54. This change fixes four: the code-block paste and restored-block tests and S1 in Editing and in Suggesting. The two AI discard tests stay red, owned by suggested task t_c411234d.

- Proof on the final bytes: the code-block spec passes 66 of 66 and the S1 spec 44 of 44. The plitejs history, yjs, core and authored partitions pass in full. The react partition passes 1505 of 1506. Its one failure is a source audit of `mutation-controller.ts`, a file this change leaves alone. Before the type reshape, the platejs suite passed apart from the AI pair.
- Limit: remove, undo, redo, undo still rebuilds the block on the second undo, as it did before the regression. Suggested task t_d5321f37 owns that call.
- Reversals: the first build made the record lazy through getters on a type that still read as plain data. The comment pass deleted the comment that explained it, and the type now shows the delay as `record()`, which also settles the panel's nit about the hidden side effect. Deviations: none. The panel's claim-set warning stays deferred to t_d5321f37, and its nit asking for more suites was dismissed because those suites pass.
- The full plitejs suite times out on module load when it runs beside another heavy suite; run it alone.

## Open work

- The two `AIChatPlugin.suggestions.spec.ts` discard tests fail on next, red since the owner squash 422564e6f6 that added the second one. Each streamed chunk rejects the last preview and proposes again, and the review tree keeps a `held` mark and a verdict record for every reject, so N chunks leave N of each, and `ai.api.reset()` leaves one more. `docs/plans/topics/ai.md` says Discard rejects the proposal, while both tests expect discard to restore the stored value exactly. Suggested task t_c411234d, carded, owns `cmd:platejs-test` and holds the same diagnosis. owner: zbeyens. stop: t_c411234d lands or is dropped.
- `DocumentChange.apply` claims prepared nodes in the process-wide `CLAIMED_PREPARED_SOURCES`, so a node lands by identity once per process. Remove, undo, redo, undo rebuilds the block on the second undo, at 2e0e658784, at 924b994fde and with this fix (`probe-undo-redo-*.log`). Bookkeeping applies in `fromBatches`, `settlePendingHistoryReplay`, the history plugin's anchor recovery and `history-codec.ts` spend the claim too. Dropping the set is unsafe, because `content-slice.test.ts` requires repeated insertions to get distinct nodes and keys. owner: zbeyens. stop: the suggested task this run offers lands or is dropped.
