# Editing format takeover

Status: superseded: by docs/plans/2026-10-17-editing-format-stack.md after plan review round 3
Page: https://claude.ai/artifact/8B24XPnJvFfmdfquhhWTKe
Playbook: verdict

**Stop. Keep the takeover for the tags its writer read, and fix the law sentence instead.** When Bob writes a format key in Editing over Alice's pending format tag on that key, `writeLayer` drops the key's tags, so Bob's value holds whatever anyone later decides about Alice's change. `docs/vision/plite.md` says Editing "leaves every other author's claims pending", but the code never did that for a key Editing writes, and it never did it for text Editing deletes out of a pending insertion either. Keeping Alice's tag would let a reject of her change undo Bob's direct edit. A verdict would decide her whole change, other members included. So the code stays, and the sentence changes to say what Editing does. Two limits stay, and suggested task `t_9fd027cd` owns both. A suggestion a peer writes at the same moment survives the takeover, and rejecting it undoes the Editing write. A fork that keeps an accepted tag loses that value when its pending sibling is rejected. The folded finding is a real bug, and its cause is wider than the card states. A fork that still stores a tag an earlier verdict accepted makes decisions wait on its pending sibling. That includes decisions that never touch the key and decisions on a tag written over the fork. `decideKey` gets a settled outcome for such a tag, which waits on nothing, and settling reads it the same way. The same block on an accepted line join goes to suggested task `t_a269db34`. This is a decision on one question inside the authored scope, not a review of the scope, so the scope's review verdict stays as it is.

## Brief

### What will change?

Editing keeps overwriting another author's pending formatting, and the law now says so, including what happens when two people write together. Deciding a change no longer gets stuck behind an old accepted format suggestion stored next to a pending one.

### What could go wrong?

An overwritten format suggestion disappears undecided, and undo brings it back. A peer's format suggestion made at the same moment survives, and rejecting it restores the value from before both writes. An accepted line join still blocks other decisions.

## Teach

A pending format suggestion is a small tag on the text. It says who changed which property and what the value was before. Accepting keeps today's value, and rejecting puts the old value back.

In Editing mode a write lands right away. When it overwrites a property that another author has a pending suggestion on, it drops the tags it can see on that property, so no later decision can bring their values back. Deleting text out of someone's pending insertion already works the same way, and the text just goes. A suggestion that arrives from a peer at the same moment was never seen, so it stays.

This keeps that rule and writes it into the law. It also fixes a case where an accepted suggestion, still stored next to a pending one, made other decisions wait. An accepted tag now counts as decided, so it waits on nothing.

## Defaults

| Decision | Pick | Alternative | Word | Impact |
| --- | --- | --- | --- | --- |
| Editing over another author's pending format | The Editing value stays whatever is decided later, and the tags its writer read on that property go (look) | Their tags stay, so rejecting their change undoes the edit; Editing rejects their whole change | keep their tags | big |
| A suggestion a peer writes at the same moment as an Editing write | It stays pending over the Editing value, and rejecting it restores the value it replaced; the law states the limit and the suggested task on recording the written value owns the fix (answer, because panel round 2 raised the race again) | Fix it in this run: every format tag records the value it wrote, which recording, deciding, settling and the collaboration laws read, with a rule for corrections, which rewrite values today | fix the takeover race | big |
| A rejected tag beside an accepted one in a fork | The key goes back to the value below the fork, as today, so the accepted value goes too; the same suggested task owns the fix (look) | Keep the accepted value, which needs the same recorded value | keep the accepted fork value | small |
| Where this decision lives | Its own page, leaving the authored scope's review verdict alone | A full review of the authored scope | review authored | detail |
| The same block on an accepted line join | A suggested task of its own | Fix it in this run | fix the join here | small |
| Where the page lives | The new page at https://claude.ai/artifact/8B24XPnJvFfmdfquhhWTKe, because the old one at https://claude.ai/artifact/8RRGgjQ8Zfok4BaEXs7uQo no longer opens | No published page; read the plan file | drop the page | detail |
| Review before building | Panel rounds on this plan until a round applies no critical finding | Build without a panel | fast | detail |

## Evidence

Model: claude-opus-5-5 @xhigh. Base commit at intake: `51f3a53b665263bd0b0ae81b99978f542eede86f` (`next`). Probes ran on package source with `bun test` from this worktree; the run directory is `docs/plans/artifacts/2026-10-17-editing-format-takeover/`.

### Requirements

- [law] `docs/vision/plite.md:381-384`: "Editing records the same way and accepts the writer's own claims in the same commit. It leaves every other author's claims pending, so text it writes inside another author's pending insertion joins that insertion."
- [law] `docs/vision/plite.md:384-385`: "A decision removes the decided claims and appends a verdict for each incarnation it decides in one transaction." A verdict names an incarnation, not a tag.
- [law] `docs/vision/plite.md:372-373`: "A decision takes the changes or cards it read and refuses one that moved since."
- [law] Plan P1.3b deviation (`docs/plans/2026-10-13-review-tree-pivot.md:394`): "an Editing format write replaces the key's pending values".
- [ask] "Decide whether Editing keeps the other author's tag, decides it with a verdict, or keeps the takeover and the vision sentence says so, then repair the losing side."
- [ask] Folded: "deciding a new incarnation of C returns blocked with D, because decide takes the change id and reaches the accepted claim".
- [own] An Editing write is a direct edit over what its writer saw, and Bob sees it land in both previews at once. The takeover guarantees that no later decision brings back a pending value his write removed. It does not keep his value against every decision. Rejecting an insertion still removes its text, formatting included, a correction derives values from the pending ones it keeps, and a value a peer suggests at the same moment survives his write, as Limits says. Panel rounds 1 and 2 found those cases.
- [own] Editing never writes a verdict for another author's change.

### What the code does today

From `probe-precedents-a2.log`, Bob in Editing, Alice's change `A` pending:

| Case | Stored after Bob's write | `A` still listed |
| --- | --- | --- |
| F1 Bob unsets bold over Alice's pending bold | `x` plain, no tag | no |
| F2 Bob sets green over Alice's pending blue, from red | green, no tag | no |
| F3 like F1, and `A` also holds an insertion `y` elsewhere | `x` plain, no tag | yes, with `y`; rejecting `A` removes `y` and leaves `x` plain |
| F4 Bob unsets bold in Suggesting | Bob's tag over Alice's | yes; accepting Bob alone is blocked with `A` |
| T1 Bob deletes `b` inside Alice's pending `abc` | `ac` under Alice's insertion | yes |
| T2 Bob deletes Alice's whole pending insertion | gone | no |
| T3 Bob types inside Alice's pending insertion | joins it as `aQbc` | yes |
| T4 Bob bolds Alice's pending insertion | bold on her text, no tag | yes |
| T5 Bob bolds Alice's pending deletion | nothing written; her deletion stays plain | yes |

In F1 to F3 both previews show Bob's value. The pre-pivot control does F1 the same way (`docs/plans/artifacts/2026-10-13-review-tree-pivot/panel-diff/probe-edit-format-control-a1.log`).

### Lanes

1. **Keep the takeover and restate the law** (picked). No recording code moves. Bob's value holds in both previews, as T1 and T2 already hold for deleted text. Alice's change keeps every member Bob did not overwrite (F3). Undo is local inverse history, so Bob's undo brings Alice's tags back. The takeover reaches only the tags Bob's write read, as Limits says.
2. **Keep the other author's tags** (the law as written). In F1 Alice's tag would sit on plain text and show a bold card that changes nothing. In F2 rejecting Alice's blue would restore red over Bob's green, so a decision on her change undoes his direct edit. prosemirror-suggest-changes behaves this way as a side effect of storing a format suggestion as a struck copy and an inserted copy (`prior-art-codex.md`, source inference). Rejected.
3. **Decide Alice's tag with a verdict.** A verdict decides a whole incarnation, so in F3 a reject verdict would also remove `y`, which Bob never touched, and an accept verdict would accept it. An accept verdict would also settle an amendment Alice writes inside that same explicit change at the same moment, which the takeover leaves pending (both seats in panel round 2), but only by accepting `y` as well. A verdict per tag would be a new stored shape whose only job is to record what the edit already shows. Rejected.
4. **Delete the Editing branch of `writeLayer` (the strongest deletion).** Editing would then record as Suggesting and accept its own tag, the one-recorder rule P1.3b followed elsewhere. F4 shows accepting Bob's tag waits on Alice's, so the write would either block or need public retain, which P1.3b rejected because three order-independence laws broke (`docs/plans/2026-10-13-review-tree-pivot.md:393`). Rejected.

**Proof limits.** Google Docs, Word and CKEditor 5 document nothing for a direct format write over another user's pending format suggestion (`prior-art-codex.md`). The precedent probes ran in bun on package source, with no browser; the two-client cases ran on in-process Yjs peers.

### Limits the takeover keeps

Both limits need a format tag that records the value it wrote. Today a tag stores only `before`, and `decideKey` never compares the live value with a tag, because a correction can rewrite that value. Suggested task `t_9fd027cd` owns that question. owner: the owner; stop: `t_9fd027cd` lands or is dropped. When it lands, it removes the last clause of the step 1 sentence and this section.

- **A suggestion a peer writes at the same moment.** Alice amends her pending color from blue to yellow while Bob, who saw only blue, sets green in Editing. Bob's write drops the tag he read, and Alice's new tag survives the sync. When green wins, rejecting Alice's change restores red on every peer. When yellow wins, green is gone before anyone decides (`probe-amend-race-a1.log`). `takeoverVersusStack` in `packages/plitejs/test/authored-tree-collab.test.ts` stores the same state and keeps its expectation. All three seats raised this in panel round 1. In panel round 2 both Codex seats showed that an accept verdict on the change Bob read would settle Alice's amendment when she writes it inside that same explicit change. A default Suggesting amendment starts a new change, `alice:2` in the probe, which no verdict on `alice:1` reaches, so only a recorded written value removes the race in general.
- **A rejected tag beside an accepted one in a fork.** With C's accepted bold stored in a fork with D's pending bold, rejecting D leaves `x` plain, so C's accepted bold goes too (`probe-fork-cause-a1.log`, the D reject lines). `decideKey` decides a fork as one, and any reject in it restores the value below the fork. The Opus seat raised this in panel round 1.

### The folded finding

The card says deciding a new incarnation of `C` is blocked with `D` because the decision takes the change id and reaches `C`'s accepted claim. The cause is wider. `decideFormats` in `resolve.ts` gives every format tag its outcome through `decisionOf`, which reads `C`'s tag as `accept` from its verdict. So `decideKey` sees a fork that is half decided and waits on `D`, whatever the decision decides. Deciding `E`, an unrelated insertion, is blocked with `D` (`probe-fork-cause-a1.log`). Rejecting a new incarnation of `C` that unbolds `x` over the fork is blocked with `D`, and accepting Eve's tag over the fork is blocked with `D` and `C` (`probe-fork-stack-a1.log`). Deciding `D` itself applies.

The fix gives `decideKey` a fourth outcome, `settled`, for a tag an earlier verdict accepted. `decideFormats` passes it where `decisionOf` says `accept` from a verdict, and `settleFormats` passes it for an accept verdict. A settled tag waits on nothing, and no decision waits on it. In a step beside live tags, the live tags alone decide the step, so rejecting them still restores the value below the fork, as Limits says. A step of settled tags alone stays stored while a pending step sits below it and no step below it is rejected. Otherwise it counts as accepted, as today, so a reject between a pending step and a settled one still waits on the pending one. A decision on a key with no settled tag runs exactly as today, and accepting a tag over a pending one still waits on it.

Panel round 2 found the two parts of that rule the first design missed (`probe-r2-criticals-v1-a1.log`, `probe-r2-criticals-v2-a1.log`). Sol's case is a chain of pending `P`, pending `R` over it and `S`'s accepted tag over `R`. If rejecting `R` applied, `S`'s tag would lose its link to `P`, because a tag's `over` names only stored tags, and the two would read as a fork, so rejecting `P` next would drop `S`'s accepted value. Rejecting `R` stays blocked with `P`, as on the base. Astra's case is a load in which a rejected new incarnation of `C` sits over the fork. Reading the accept verdict as `accept`, settling waited on `D` and left the rejected value stored with no pending change; reading it as settled restores the value below the rejected tag and drops it.

The same class shows up in structure. Ann's public join, accepted by a verdict while the line it joins holds only Bob's pending insertion `X`, stays stored, and deciding `E` is blocked with `X` (`probe-join-class-a2.log`). Its landing logic is the P1.3b retention design, so it goes to suggested task `t_a269db34`.

### Ownership flow

No public call changes. Recording stays in `RootRecorder.formattedProps` in `packages/plitejs/src/authored/tree/record.ts`, which calls `writeLayer` in `packages/plitejs/src/authored/tree/layers.ts`; Editing commands return no tags there. Deciding stays in `resolveAuthoredChildren` in `packages/plitejs/src/authored/tree/resolve.ts`, which calls `decideFormats` and then `decideKey`. `LayerOutcome` and `decideKey` in `layers.ts` gain the settled outcome. The `decideFormats` call and `settleFormats` in `packages/plitejs/src/authored/facts/settle.ts` pass it, and `decisionOf`, which the structural readers share, stays as it is.

## Steps

- [ ] 1. Restate Editing's law in `docs/vision/plite.md:381-384` as: "Editing records the same way and accepts the writer's own claims in the same commit. It never decides another author's change. Text it writes inside another author's pending insertion joins that insertion, and it neither deletes nor formats another author's pending deletion. What an Editing command overwrites goes with it, which is text it deletes from a pending insertion and every pending value its writer read on a format key it sets, and no later decision brings back a value it removed. Rejecting an insertion still removes its text, formatting included. A correction keeps every pending value, so rejecting one can change what the correction derives from it. A suggestion a peer writes on that key at the same moment stays pending over the written value, and rejecting it restores the value it replaced, until a format tag records the value it wrote (the owner's suggested task `t_9fd027cd`)." Proof: step 2's test asserts the format clause; `authored-tree-record.test.ts:501` asserts that typing joins an insertion and `:581` that an Editing delete leaves struck text; `probe-precedents-a2.log` shows T1, T2, T4 and T5; the sum-to-100 case at `authored-tree-collab.test.ts:865` shows a correction keeping a pending value; `probe-amend-race-a1.log` shows the peer clause.
- [ ] 2. Pin the takeover at the public boundary in `packages/plitejs/test/authored-tree-record.test.ts`. Text `x` is red, Alice's change sets it blue and also inserts `y` elsewhere, and Bob sets green in Editing; rejecting Alice's change then returns `applied` for it, leaves `x` green with no tag and removes `y`. The applied result tells the takeover from a write that rejected all of Alice's change first, which ends in the same document. Proof: it fails with `writeLayer` keeping the tags in Editing, where the reject restores red, and passes on the tree, by `mutate.mjs`.
- [ ] 3. Give `decideKey` the settled outcome, and pass it from the `decideFormats` call in `packages/plitejs/src/authored/tree/resolve.ts` and from `settleFormats`. Proof: three tests in `packages/plitejs/test/authored-facts.test.ts` beside the fork incarnation test, each with its own `mutate.mjs` mutation.
  - A new incarnation of `C` sets `x` yellow over a blue fork and is rejected; the decision applies with `x` blue and the fork stored as before. It fails on the base, blocked with `D`, and with the resolver passing `decisionOf` again.
  - With `P` pending, `R` pending over it and `S`'s accepted tag over `R`, rejecting `R` stays blocked with `P`. It passes on the base and fails with the held status ignoring a rejected step below it.
  - A load of the fork with a rejected new incarnation of `C` over it restores the value below that tag and drops it, leaving the fork. It fails on the base and with `settleFormats` reading an accept verdict as `accept`.
  - `probe-fork-cause`, `probe-fork-stack` and `probe-r2-criticals` rerun on the built tree.
- [x] 4. Offer the open limits and the structural twin as suggested tasks: `t_9fd027cd` and `t_a269db34`, in `docs/plans/suggested-tasks.decisions.tsv`.
- [ ] 5. Proof: the authored partition, the plitejs typecheck and `pnpm lint:task` on the changed files.

## Open work

- `t_9fd027cd` Decide whether a format tag records the value it wrote. owner: the owner; stop: that task lands or is dropped; tracked in `docs/plans/suggested-tasks.decisions.tsv`.
- `t_a269db34` Keep an accepted join whose landing waits from blocking other decisions. owner: the owner; stop: that task lands or is dropped; tracked in `docs/plans/suggested-tasks.decisions.tsv`.
