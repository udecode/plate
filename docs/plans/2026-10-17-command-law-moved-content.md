---
review_scopes: [authored]
verdict: pursue
review_basis: [2026-10-12-suggestions-complete]
work_kind: implementation
review_commit: d0209b439a8f18dffa38cb74f8061bc0230bc8cc
review_inputs: [VISION.md, docs/vision/common.md, docs/vision/plite.md, docs/plans/2026-10-13-review-tree-pivot.md, docs/plans/topics/authored.md, packages/plitejs/src/authored/authored.ts, packages/plitejs/src/authored/tree/resolve.ts, packages/plitejs/src/authored/tree/proposed.ts, packages/plitejs/src/authored/tree/record.ts, packages/plitejs/src/authored/tree/alignment.ts, packages/plitejs/src/authored/tree/marks.ts, packages/plitejs/src/authored/facts/settle.ts, packages/plitejs/src/authored/ledger/ledger.ts, packages/plitejs/src/authored/ledger/projection.ts, packages/plitejs/src/authored/ledger/runs.ts, packages/plitejs/src/core/command-frame.ts, packages/plitejs/src/core/command-document.ts, packages/plitejs/test/authored-tree-commands.test.ts, packages/plitejs/test/authored-tree-resolve.test.ts, packages/plitejs/test/authored-tree-work.test.ts, packages/plitejs/test/authored-tree-recording-laws.slow.ts, packages/platejs/src/authored/authored.api.spec.ts, packages/platejs/src/docx/export/lib/authoredDocx.spec.ts, packages/platejs/src/react/features/suggestion/SuggestionPlugin.spec.tsx]
---

# Command law over histories that move content

Status: done
Playbook: plan

Pursue. Commands over content that someone moved break the review tree's command law in three places, and one of them loses text. After Bob moves a line into a quote with Editing, between the two halves of Alice's pending join, a Backspace at the start of that line deletes the wrong letter and the stored document then drops the moved line and the join's second half (seed 207). The law's test filter and the ledger law's skip hide that class today (`packages/plitejs/test/authored-tree-recording-laws.slow.ts:1658`, `:2344`). The pieces are separable: the resolver lands an emptied join target's line at the wrong place, the ledger's position map cannot follow the reorder that the follower rule makes, and the view carries a stored marker that typing copies. Each has one owner to fix, and none needs a new stored shape. This is the `authored` scope's head Pursue (`2026-10-12-suggestions-complete`) narrowed to the class the review-tree pivot left to task_ed6723b2 (`docs/plans/2026-10-13-review-tree-pivot.md:529`).

## Brief

### What will change?

Typing, deleting and joining over lines someone moved now land where the editor shows them, in Suggesting and Editing. A Backspace after an Editing move into a quote no longer deletes the wrong letter or loses a line.

### What could go wrong?

Four edits beside a line moved between a join's halves are refused, where next recorded them. Accepting a moved line that later joins pull in still loses it. Asks 2 and 3 rest on the pre-merge tree until t_cbe5346a lands.

## Teach

A review document stores pending changes as marks. A pending join is a line marked to merge into the line before it. Commands run on the view with every change accepted, and a recorder writes their result back as marks.

Moves break that. A line moved between a join's two halves, a follower, shows after the joined line, so view order and stored order differ. The map between them cannot reorder, so a caret there jumps to the far edge and an edit can hit the wrong text. Emptying the join's first half also leaves its second half behind the follower, and a rejected text move leaves a hidden marker that typing copies.

The fix has the resolver report where it lands each follower. The ledger maps carets through that order. The recorder splits an edit that crosses two stored pieces shown side by side, and refuses one it cannot split.

## Main changes

The ownership flow for a framed command stays the same: the ledger projects the stored document, the frame maps the stored caret into that projection, the command runs there, and the recorder lifts the result back through the same map. This plan changes what four owners compute inside that flow.

- The resolver lands a join whose target holds no live content at the target's place, and the target's followers land after it (`packages/plitejs/src/authored/tree/resolve.ts:903-908`). Completion's proposed children follow the same landing (`packages/plitejs/src/authored/tree/proposed.ts:174-185`). A line that takes an emptied target's place and is then emptied by a later join hands that place on, so a chain of emptied targets gives its last line once, and a line moved among any of their followers lands after the line that ends up in their place. A block merged into a landed block lands with it, and an emptied moved line lands with the line standing in for it. A moved line that the joins after it merge into still resolves as at `next`, where accepting drops that line and every line joined into it; where it should land is suggested task t_bdec706b. Each resolution reports the nodes it lands out of stored order, in the order it emits them.
- Projections drop the `held` member, the stored record of a rejected deletion that a later decision can reopen. Only the resolutions written back to storage, own acceptance and decisions, keep it (`packages/plitejs/src/authored/tree/resolve.ts:539`).
- A ledger run whose blocks store a follower before its join's line maps positions through a run order: the stored pieces in the order the resolver lands them, then the accepted change. Whole-document readers get a hull that agrees with the point maps outside moved content. The frame map reports breaks, the places where the view shows two stored pieces side by side, a run's own edges included when a moved piece lands at one (new `packages/plitejs/src/authored/ledger/order.ts`, `packages/plitejs/src/authored/ledger/projection.ts:899-1010`, `packages/plitejs/src/core/command-document.ts`).
- The recorder splits a frame step that crosses a break into sub-steps that each map in stored order, using the existing move roles, and `rebase` refuses a removal whose stored range runs backward instead of clamping it (`packages/plitejs/src/authored/tree/record.ts:325-357`, `:587-770`). A crossing the split cannot lower is refused whole, so the command stores nothing, and so is a step that breaks a line after a break inside it, such as Enter in the joining half of a line with moved lines between its halves, inside a link there too. The line around a position is the block holding its text, never an inline element such as a link. A removal or change maps its stored end without the caret, and a position that associates forward reads past content a step removed. A block merge whose right line holds or ends at a break is refused, because the merge moves the rest of that line as one piece, and so is a block inserted beside a moved line. The recorder reads breaks only over the lines that hold a step's two ends, and the work test counts the ordered runs that read walks. Pasting an inline element such as a link into a joined half records, because the line-close check pairs each close with the innermost node around the position, text leaves included. Suggesting refuses a lowered merge whose moved children own an exclusive content root, because the struck source and the landed copy would both own it.
- A canonical step that only adds empty text leaves records each one that lands on a line the stored document holds childless, so Enter at the end of a line in a named root keeps its caret on the new line (`emptyLeavesOf` in `packages/plitejs/src/authored/tree/record.ts`).
- Suggesting no longer counts an Editing follower's insertion as the writer's own pending element, so typing inside a line someone's Editing move put among a join's followers records an ordinary suggestion instead of copying the follower's claim onto text. Text typed inside one's own suggested line takes that line's claim without its place after a join (`ownElement` in `packages/plitejs/src/authored/tree/record.ts`).
- Editing's own acceptance settles only the own marks its resolution removes, so a deletion inside a line another author's pending join holds stays pending and the caret keeps its place. The character alignment reads each leaf's marks from the node and its position from the document index, because an index copies the marks it reads (`acceptOwn` in `packages/plitejs/src/authored/authored.ts`, `liveCharacters` in `packages/plitejs/src/authored/tree/alignment.ts`).
- The framed law's selection check maps the stored caret through the map the next frame reads, and the command and ledger laws run over histories that move content with the full check (`packages/plitejs/src/authored/authored.ts:409-471`, `packages/plitejs/test/authored-tree-recording-laws.slow.ts:1658`, `:2318-2351`).

## What other editors do

No editor checkout was read for this plan, because the decision is internal to how Plite's review ledger maps positions. The table says what each editor is inferred to ship from its public feature set, not checked in source.

| Editor | Pending structural joins in review | Moved content inside review | Read |
| --- | --- | --- | --- |
| ProseMirror | No; `prosemirror-changeset` tracks inserted and deleted ranges | No | Inferred, not read |
| Lexical | No review mode in core | No | Inferred, not read |
| Slate | No review mode in core | No | Inferred, not read |
| Tiptap | Track changes is a paid extension of insert and delete marks | No | Inferred, not read |

## Layer and owner

| Change | Layer | Package | Why |
| --- | --- | --- | --- |
| Emptied target's line takes its place, `held` stays out of projections, `reordered` reported | Plite | `plitejs` authored, `tree/resolve.ts` and `tree/proposed.ts` | The resolver owns where content lands |
| Run order, hull and breaks | Plite | `plitejs` authored, new `ledger/order.ts` | The ledger owns the stored-to-projected map |
| `breaks` on the frame map | Plite | `plitejs` core, `core/command-document.ts` | The frame map type the recorder reads |
| Lowering across breaks, reversed removal refused | Plite | `plitejs` authored, `tree/record.ts` | The recorder owns lifting frame steps |

## Native behavior and proof

| Behavior | What changes | Proof surface |
| --- | --- | --- |
| Caret after a line moved between a join's halves | Maps where the view shows it, not to the far edge | Bun model tests M2 and M4; browser unproven |
| Backspace at a moved line's start | Merges it into the joined line, recorded as a struck source and a landed copy | Bun model test M3 and the seed 207 replay |
| A letter typed beside a rejected move's held letter | Stays out of the held leaf | Bun model test M5 |
| Undo and redo of a split step | One history entry restores every sub-step | The lifted recording laws, which undo and redo |
| Enter in the joining half of a line with moved lines between its halves | Refused with nothing stored, where it used to put the new line after the moved lines | Bun refusal tests; M12 to M14 still record |
| A range delete or typing whose merge moves a joined line with a moved line between its halves | Refused with nothing stored; `next` recorded the panel's case to the plain result in Editing | Bun refusal test; M9 still records |
| Delete at the end of a moved line whose next line ends at a break | Refused with nothing stored, where it threw; `next` stored a result that drops a joined line | Bun refusal test |
| A delete or typing over every line of a quote that holds a moved line between a join's halves | Refused with nothing stored; `next` recorded typing over it to the plain result | Panel probe O4, no test |
| A block inserted beside a moved line between a join's halves | Refused with nothing stored; `next` recorded a block inserted after the last moved line, which suggested task t_bdec706b gets back | Bun refusal test |
| Backspace at the line after a moved line, or Delete at a moved line's end, at the top level | Merges the line after into the moved line, recorded as a struck source and a landed copy; the PR lost the join's second half | Bun model tests M23 and M24, both intents |
| Backspace at a moved line that holds an exclusive content root's owner | Refused in Suggesting with nothing stored, where it threw a schema error with no refusal; Editing records one owner | Bun model test M27 |
| The toast after a refused Editing change | Asks the writer to accept or reject the pending suggestion first; it used to tell someone already in Editing to switch to Editing | The suggestion spec and the hand drive's refusal steps |

## Decision ledger

| Surface | Current | Target | Owner | Reason | Adoption | Proof | Risk | Verdict |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Emptied join target | Joining line stays at its stored place | Joining line takes the target's place, followers after it | `resolve.ts` | A plain editor merges there | Projections and decisions read it | Resolver tests, M1, M2 | Deciding existing documents changes | rearchitect |
| `held` in projections | Kept by every resolution | Kept only where the result is stored | `resolve.ts` `keptMembers` | Typing copied it | Own acceptance and decisions pass `stores` | M5, platejs docx and suggestion specs | A projection reader that needs `held` | rearchitect |
| Run map over a follower reorder | One monotone change, two diffs | Run order, then the accepted change; hull for `change()` | `ledger/order.ts` | Coarse caret, lost text | Gated on cached block facts | M2, M4, map law marker oracle | Per-key work | gate |
| Frame steps across breaks | One monotone rebase that clamps | Lowered sub-steps; reversed removal refused | `record.ts` | Seed 207 loses text | None | M3, seed 207 replay | A refused real command | rearchitect |
| Law filters | Move filter, framed skip, content-only check | Lifted; selection through the next frame's map | Laws test, `authored.ts` | They hid the loss | None | Recording laws suite | Long-tail refusals | cut |
| Node placement, undo keys, anchors near followers | Hull | Hull | `command-frame.ts`, `record.ts` | The law does not need them exact | None | Lifted laws detect a miss | Coarse anchors near moved lines | defer |
| Own acceptance's change | Coarse when own acceptance reorders | Unchanged | `authored.ts` `acceptOwn` | No briefed case reaches it | None | Framed selection check detects it | Coarse caret after an own join | defer |

The `gate` row waits on step 2's scale gate. Each `defer` row's next owner is a suggested task, offered only when step 4's lifted laws hit it.

Three realistic failures: a refusal blocks a real Backspace in a layout the lowering table misses; a projection reader that needed `held` changes output; and a stored document with an emptied join target decides to different content. Each slice reverts alone. The ledger and recorded laws skip refusals, so the first shows only in commands tests, and the panel's refused layouts went to t_bdec706b. The second is caught by the platejs specs in step 1, and the third is the `look` default below.

## Defaults

| Decision | Pick | Alternative | Word | Impact |
| --- | --- | --- | --- | --- |
| Where an emptied joined line goes | In its target's place, also when deciding stored documents (look) | Where it was stored, after any moved lines | stored place | small |
| Type of an emptied joined line | Its own type, as plain Editing's merge gives | The emptied target's type | target type | detail |
| How caret mapping follows moved lines | An order taken from where the resolver puts each line, kept beside the stored runs (look) | Tracking each position through resolving and completion | provenance | big |
| An edit the recorder cannot split | Refused, so nothing is saved and a toast says why, also in four layouts next recorded (look) | Clamped, as today | clamp | big |
| Undo keys, anchors and node placement near moved lines | Coarse, as today | An exact node map | node map | small |
| Proof that a removal mapped backward is refused | Step 3 closes without a run of it, because no command reaches it once the recorder splits each crossing (look) | Step 3 stays partial until a test reaches it | reach the refusal | detail |
| Proving asks 2 and 3 on the merged code | Step 4 closes on the proof from before the merge, because next's own ledger bug stops those checks before any step over moved content (look) | Step 4 stays open until t_cbe5346a lands | rerun the ledger laws | small |
| How this work gets to next | One squashed commit, opened as a pull request into next, as the new delivery rule says (look) | The brief's patch, applied to the main checkout and left uncommitted | apply the patch | small |
| The page link | A new page at https://claude.ai/artifact/LMYNM7X5UttawN35x7edE5, because the earlier one, https://claude.ai/artifact/LzfdwnVufGpA4S1r9qnDmv, was deleted or no longer opens for this account | Drop the new page and publish nowhere | drop the new page | detail |

## Steps

The coding of steps 1 to 4 goes to a Codex worker, steps 1 and 2 in one run and steps 3 and 4 in a second, per the Codex workers rule. This session reviews each diff and runs every proof.

- [x] **1. Resolver.** An emptied target's joining line takes the target's place and its followers anchor on it. `keptMembers` drops `held` unless the new `stores` option is set, which replaces `holdsRejectedDeletions`. The resolution reports `reordered`, and `proposedChildren` follows the same landing. Proof: the two new resolver tests and M1, M2 and M5 pass in every intent they run, after failing at base (`docs/plans/artifacts/2026-10-17-command-law-moved-content/probes/resolve-at-base-a1.log`, `docs/plans/artifacts/2026-10-17-command-law-moved-content/probes/tests-at-base-a2.log`). The plitejs authored tests and the platejs authored, docx and suggestion specs pass.
  Done: the resolver tests, M1, M2 and M5 pass in every intent, and M4 too. The authored suite passes but for M3 (`probes/s12-authored-suite-a2.log`), both slow law files pass (`probes/s12-slow-laws-a1.log`), and so do the platejs authored, docx-export and suggestion partitions (`probes/s12-platejs-*-a1.log`).
- [x] **2. Ledger order.** New `ledger/order.ts` builds a run order from `reordered` for a run whose cached block facts store a follower before its join's line. Point reads and `edgeInsertion` read it, `change()` reads its hull, and the frame map gains `breaks`. Proof: M4 passes both intents, and the map law's marker oracle passes inside moved content. A classification run with the recorder instrumented runs the lifted laws over a fixed seed budget in both intents, logs each framed step that crosses a break by lowering row, and counts content failures in runs with no order; a count above zero adds a conservation guard to `rebase` in step 3.
  Scale gate, frozen before the build: new work-test cells hold one pending join with a moved line between its halves every 100 blocks, at 100 and 5,000 blocks, and run an Editing and a Suggesting letter, Backspace and Enter outside any ordered run and inside the moved line. Every counter the work test reads is equal at both sizes, and the existing work tests keep their counts. A planted mutant that orders every apart run on each key must fail the outside cells. A miss sends the order back to `architect`.
  Done: M4 passes both intents, and the marker oracle checked moved points at every seed it ran. The six scale cells pass, and the mutant fails all six outside cells (`docs/plans/artifacts/codex/task_ed6723b2-s12/work-mutant-final.log`). The classification run met a break in random histories once, a text removal at seed 207, and the M cases add a text insertion and a merge. No content failure came from a run without an order, so `rebase` gets no conservation guard (`probes/classify/summary.out`).
- [x] **3. Recorder.** `recordAuthoredSteps` lowers a frame step that crosses a break by the rows the classification met, a text removal (J1) and a block merge (B3, B4), and refuses every other crossing. `rebase` refuses a reversed removal. A canonical step that only adds empty text leaves records like the main root's `insert-node` step, so a named root keeps the caret an Enter puts on a new line. Proof: M3 passes both intents, and so does a commands case that runs that Enter in a named root. Seed 207 replays in both intents with its stored marks, accept all, reject Bob, reject all, undo, redo and the next typed letter checked. A reversed removal throws, and a zero-length insertion behind the cursor still records (`docs/plans/artifacts/2026-10-17-command-law-moved-content/probes/clamp-probe-a1.log`).
  Done: M3, M6 and the named-root Enter case pass in both intents. The seed 207 replay runs Backspace at the moved line's start, a Suggesting line delete across the join, typing over a selection across it and Enter at it, in both intents. Accept all matches the plain editor, reject all gives back the start, undo and redo restore the stored document, and Enter at the join is refused with nothing stored (`docs/plans/artifacts/2026-10-17-command-law-moved-content/probes/s207-replay-final-a1.log`). Each new test fails without its change. No test reaches the reversed-removal refusal, because the lowering leaves no command that maps a removal backward, so that part of the proof is a gap (`docs/plans/artifacts/2026-10-17-command-law-moved-content/probes/s34-mutants/summary.out`). Typing inside one's own Editing follower in Suggesting threw `Only a block follows a join` until `ownElement` skipped the follower's Editing insertion (M7).
- [x] **4. Laws.** Lift the move clauses of `settles`, the ledger law's framed skip and its forced `PLITE_LAW_CHECK=content`, and the plain-editor command law's move filter, and map the framed selection check through the next frame's map. The ledger law gains examples that put a moved line between a pending join's halves, one per lowered row. Proof: the recording laws suite passes at its default budget, both intents, and fails on seed 207 with step 3's lowering reverted.
  Done: before the merge with `next`, the recording laws pass at their default budget in both intents (`docs/plans/artifacts/2026-10-17-command-law-moved-content/probes/deslop-checks/summary.out`). With the lowering reverted, the main ledger law's examples fail, and so do M3, M6 and the refusal case (`docs/plans/artifacts/2026-10-17-command-law-moved-content/probes/s34-mutants/summary.out`). After the merge, the suite passes but for two ledger laws that `next` fails the same way, and the resolver fix repairs the seeds that the merge run found, -1829688287 and 2123092819 (`docs/plans/artifacts/2026-10-17-command-law-moved-content/probes/fixed-checks/summary.out`). A new example of two cards that become one keeps the ledger law's renames floor off the random stream.
- [x] **5. Close.** Writing passes, a panel on the diff because the design was contested, `pnpm lint:fix` on the task's files, and the patch landed on the checkout. Proof: the panel's rows in the decision log, the lint log and the patch's `git apply --check`.
  Done: three diff rounds ran, each logged with its fixes and writing passes, and the decision-trail review ran same-family. The lint fix over the package files changed nothing on 808a3d765f and reflowed one line of the toast fix (`docs/plans/artifacts/2026-10-17-command-law-moved-content/probes/final/lint-808a3d765f-a1.log`, `docs/plans/artifacts/2026-10-17-command-law-moved-content/probes/landed/lint-a1.log`). The branch merged next b40cebebee, and the battery on the landed code, 78daab0230 with the registry output regenerated for the toast fix, passes but for next's five record tests, two ledger laws and one www type error (`docs/plans/artifacts/2026-10-17-command-law-moved-content/probes/landed/wt-summary-a1.out`, `docs/plans/artifacts/2026-10-17-command-law-moved-content/probes/landed/wt-www-checks-a3.log`). The hand drive covers all 43 cells (`docs/plans/artifacts/2026-10-17-command-law-moved-content/drive/check-a2.log`). The Delivery rule changed mid-run, so the task lands as one commit through `node .agents/pstack/land.mjs`, a PR into next, instead of a patch on the checkout.

## Close

### Reversals and deviations

- PR 5188 closed without merging. The work was redone on next 32c34c8df5 as one commit, because next had moved under the PR's merge. The redo keeps everything next added since b40cebebee. The redo names the resolution's out-of-order report `reordered`, because next's `landed` now holds format-tag records. The recorder computes each step's root changes once, next's followed-root skip and `strikeRetyped` included, before the projection reads its breaks. The framed law treats a null `toProjected`, a deleted root, as no match.
- The redo's one panel round, Opus, Sol and Astra at xhigh, found two critical defects in the PR's code. The run order missed the break at an ordered run's edge, so a Backspace at the line after a top-level moved line lost the join's second half (Sol 1, Opus 1). In Suggesting, a lowered merge kept two owners of an exclusive content root and threw a schema error with no refusal (Astra 1). The redo fixes both, and tests M23, M24 and M27 cover them.
- The task lands through land.mjs, as one commit pushed as a PR into next, instead of the brief's patch applied to the checkout. The main checkout's staged pstack sync changed the Delivery rule mid-run, and the Defaults row on how this work gets to next gives the word that reverses it.
- The hand drive found a writer in Editing told to switch to Editing when the recorder refused their Enter. The toast now reads the view's intent, and the suggestion spec fails without that fix.
- The branch merged next a second time, b40cebebee as e826336c51, after the decision-trail review found the frozen patch no longer applied. Next's 2e865a0bc4 had changed the recorder, the resolver, settle.ts and authored.ts. The merge resolved record.ts and CODING_STANDARDS.md by hand, and the battery, the seed 207 replay and the no-refusal mutant reran on the merged tree.
- Diff round 3 reverted round 2's fix for a moved line that the joins after it merge into. Both of round 3's critical findings, Sol 1 and Astra 1, were in that fix's guard, which had already had its one replacement, so the run reverted it, as the panel rule requires, instead of patching it again. The layout now resolves as at `next`, where accepting drops that line and every line joined into it, and the revert also removed tests M18 and M19. The run withdraws the round 2 claim, and where that line should land is t_bdec706b.
- The recorder now refuses three layouts that `next` recorded, and stores nothing, because it cannot split a merge that moves a joined line holding a moved line: a range delete or typing whose merge moves such a line (round 2, Astra 1), a delete or typing over every line of a quote that holds one (round 2, Opus 4), and a block inserted after the last moved line (round 3, Opus warning 1). The Native behavior table names each, and t_bdec706b owns recording them again.
- Step 3's proof that `rebase` refuses a removal mapped backward never ran, because no command reaches it once the recorder splits each crossing. The refusal stays in place of the clamp, which dropped text and reported nothing, and the step closed on the narrower proof as the Defaults row says.
- The redo cut the resolver's vacancy rule, which the PR added beyond the synthesized sketch. It made a join whose target search passes only removed lines take the place of the nearest one in a surviving container, so that deciding at once and deciding step by step agreed. On the rebased resolver its two probe cases agree without it, and it disagreed with `proposedChildren`, which record-time completion reads (redo round 1, Astra 2).
- The branch first merged `next` at 51f3a53b66 mid-build. `next`'s two ledger laws fail on "accepted main hides stored 18" before most framed steps, so the run proves asks 2 and 3 on the pre-merge commit 64ebb3f296 with every change since the merge applied. t_cbe5346a owns that failure. That merge brought the failure in and next moved again before landing, so it bought no current base.

### What landed

The resolver lands an emptied join target's line in the target's place and reports what it lands out of stored order. Projections drop the `held` member. The ledger maps positions through a run order read from that landing, and the frame map reports breaks. The recorder splits a frame step that crosses a break, refuses one it cannot split, and refuses a removal mapped backward. The recording laws lost their move filter, their framed skip and their content-only check. The suggestion kit's refusal toast asks an Editing writer to accept or reject the pending suggestion first. Main changes states each rule.

### Proof

Each ask, on the landed code at 78daab0230 unless the line says otherwise:

1. Seed 234982603 passes with the filter lifted. The command law passes at that seed on the landed code and on the pre-merge tree (`probes/landed/wt-command-234982603-a1.log`, `probes/final/pre-command-234982603-a1.log`), and M1 checks the same shape in both intents.
2. The recorder stores what commands wrote over histories that move content, at seeds 207 and 20261015. The ledger laws pass at both seeds on the pre-merge tree (`probes/final/pre-ledger-207-a1.log`, `probes/final/pre-ledger-20261015-a1.log`). On the landed code they stop at next's own failure before any framed step (`probes/landed/wt-ledger-207-a1.log`), and a Defaults row accepts the pre-merge proof until t_cbe5346a lands. The seed 207 replay on the landed code matches the plain editor on accept all and gives back the start on reject all, with undo and redo exact, and Enter at the join is refused with nothing stored (`probes/landed/wt-s207-replay-a1.log`). M3 and M5 check both seeds in both intents.
3. The ledger law no longer skips framed steps or turns off the selection check. The default run passes on the pre-merge tree (`probes/final/pre-laws-default-a1.log`), and on the landed code it passes but for next's two ledger laws (`probes/landed/wt-laws-default-a1.log`).
4. Case step:389 accepts to the plain editor's result. M4 passes in both intents (`probes/landed/wt-authored-a1.log`).
5. The t_761dd2c5 follower case gives cd then ef. M2 passes in both intents, in the same log.

Each fix from rounds 1 and 2 has a test that failed on the reviewed tree before it and passes after, and a mutant that removes the fix fails that test, as the panel rows cite. The revert settled round 3's two critical findings, and each seat's case ran before and after it. The per-keystroke work test keeps equal counts at 100 and 5,000 blocks with a moved line every hundred blocks, typing in the middle hundred. With the refusal of a removal mapped backward cut from the landed recorder, the commands tests and the command law still pass, so no command reaches it after the three rounds either (`probes/landed/wt-mutant-commands-a1.log`, `probes/landed/wt-mutant-command-law-a1.log`). The hand drive opened every page its scope lists after the last source change and drove one refusal in the browser (`drive/check-a2.log`, `drive/drive-notes.md`).

### Limits

- The caret mapping is proven in model tests only. The hand drive moved lines, typed beside them and drove one refusal, but checked no caret inside a line moved between a pending join's halves.
- The recorder refuses four layouts that next recorded. The laws skip refused steps, so they cannot tell a command that should have applied, and only the commands tests name those layouts.
- Asks 2 and 3 hold on the pre-merge tree. The landed code's ledger laws wait on t_cbe5346a.
- Accepting a moved line that the joins after it merge into drops it with every line joined into it, as on next. The round 3 revert left that data loss to t_bdec706b.
- The toast reads the view, not the refused write's intent, so a proposal forced from Editing, such as an AI preview, would get the Editing message.
- Undo keys, comment anchors and node placement near moved lines stay coarse, as the deferred ledger rows say.
- The refusal of a removal mapped backward is read, never run.
- The redo's round 1 fixes had no second panel round, because the brief allowed one round while the weekly quota is tight. Each fix has a test that fails with that fix reverted alone.

### Counts

Of the twelve items, seven asks and five steps, all twelve are done, none partial, skipped, blocked or open. Four rest on narrower proofs that Defaults rows accept: asks 2 and 3 and step 4 on the pre-merge tree, and step 3 without a run of its refusal. Ask 7 landed as a PR instead of a patch, as the delivery Defaults row says. Three diff rounds ran, with 10 critical findings applied, two of them by the round 3 revert, and none dismissed. The revert left one data-loss layout to t_bdec706b.

### Attention

Reviewed by claude-opus-5-5, same-family, because the ChatGPT login behind the Codex seat does not support gpt-6.1-sol or gpt-6-astra.

- C1, applied. Step 5 cited a log that did not exist, and the frozen patch no longer applied. The branch merged next b40cebebee, the battery and the seed 207 replay reran on the merged tree, and step 5 cites them.
- W1, accepted. Asks 2 and 3 rest on the pre-merge tree until t_cbe5346a lands, and t_5706461c reruns the ledger laws then.
- W2, applied. The refusal Defaults row is now look and big, and the second Proof line says Enter at the join is refused.
- W3, applied. The hand drive ran, found the wrong Editing toast, and the fix carries its test.
- W4, applied. The no-refusal mutant reran on the landed code, and nothing reaches the refusal.
- W5, settled. The redo's round 1 seats, Opus, Sol and Astra, attacked both. They found a break the run order missed at a run's edge, now fixed, and a reader that the vacancy rule disagreed with, so the rule is cut.
- W6, applied. Counts and Limits name the data-loss layout the revert left to t_bdec706b.
- W7, applied. Reversals name both merges and what the first one cost.
- W8, open. The Codex login needs the owner, under Open work.
- N1, settled. The typed-text law passes at seed 697763044 on the landed code.
- N2, dismissed. The Open work entry in the correct subject tracks the stale-log check.
- N3, recorded. The run did not bisect which round moved the typed letter into the joining half, and the move-free control places it the same way.

## Open work

- t_bdec706b, decide where Enter and block merges land among a pending join's moved lines. It owns the refused layouts in the Native behavior table, round 2's Opus warning 5 and round 3's revert. owner: zbeyens; stop: it lands or is dropped.
- t_a9d89ef3, keep a moved line's place after its join when another join on it is decided alone (round 3, Opus warning 2). owner: zbeyens; stop: it lands or is dropped.
- t_9bd5d71a, apply a mark across the whole of a pending join's joined line (round 1, Sol 3). owner: zbeyens; stop: it lands or is dropped.
- t_e623a723, keep other authors' pending claims on a lowered merge's landed copy (round 1, Astra 2 and Opus W5). owner: zbeyens; stop: it lands or is dropped.
- t_7765642d, decide what a text drag over a moved line between a pending join's halves moves (round 1, Opus W4). owner: zbeyens; stop: it lands or is dropped.
- t_3b905704, make rejecting one's own split in a pending join's target undo it. owner: zbeyens; stop: it lands or is dropped.
- t_b483ab66, keep the caret after a link when Backspace merges a line into one that ends in a link. owner: zbeyens; stop: it lands or is dropped.
- t_4b8c1202, give the token cursor a query for the elements strictly open at a position, from comment-sicko's flags. owner: zbeyens; stop: it lands or is dropped.
- t_04797f74, fix the recording law that throws "Only a block follows a join". owner: zbeyens; stop: it lands or is dropped.
- t_d4caeb74, let the authored subject page render again, so this plan's page can publish. owner: zbeyens; stop: it lands or is dropped.
- t_5706461c, rerun the ledger laws at seeds 207, 101 and 20261015 on the landed code once t_cbe5346a lands, so asks 2 and 3 hold there too. owner: zbeyens; stop: it lands or is dropped.
- t_4b729b20, say which intent a refused change ran in, so the toast names the right mode for a proposal forced from Editing. owner: zbeyens; stop: it lands or is dropped.
- t_2a5844dd, make the proposed-children recording law pass at seed -956128617, which next fails too. owner: zbeyens; stop: it lands or is dropped.
- t_ba15349a, map the framed law's collapsed selection with the next frame's association (redo round 1, Opus warning 3). owner: zbeyens; stop: it lands or is dropped.
- t_24a44a7e, find the joins an Editing follower claim needs without scanning every sibling (redo round 1, Opus warning 5). owner: zbeyens; stop: it lands or is dropped.
- t_58193e11, move the stored-order break lowering out of record.ts into its own module (redo round 1, Opus warning 6). owner: zbeyens; stop: it lands or is dropped.
- t_6d95652c, make the Editing fill law pass at seed -922408562, which next fails too. owner: zbeyens; stop: it lands or is dropped.
- The two `defer` rows of the decision ledger, exact node placement, undo keys and anchors near moved lines, and own acceptance's change. owner: zbeyens; stop: a lifted law fails on one, which offers its task.

## Evidence

Model: claude-opus-5-5 at xhigh effort, read from this session's metadata.

The probes ran the five briefed cases and three move-free controls through the recording laws' own helpers, with the framed law off and on (`docs/plans/artifacts/2026-10-17-command-law-moved-content/probes/probe-cases.ts`, `probe-nomove.ts`). They forced Editing, so the Suggesting scope comes from tests M2 to M5, which run in both intents and fail at base (`probes/tests-at-base-a2.log`).

| Case | History | What goes wrong | Owner | Log |
| --- | --- | --- | --- | --- |
| Seed 234982603 | Alice suggests joining gh into ef, then moves ef into a quote with Editing, which leaves the join on cd | A word Backspace that empties cd leaves gh outside the quote: the view shows quote[ab, ef], gh where a plain editor gives quote[ab, ef, gh] | Resolver's emptied target | `probes/s234982603-a1.log` |
| Follower case | Alice suggests joining cd into ab, Erin's Editing move puts ef between them | Deleting a through b gives ef then cd where a plain editor gives cd then ef | Resolver's emptied target | `probes/follower-a1.log` |
| Seed 207 | Alice suggests joining ef into cd in a quote, Bob's Editing move puts ab between them | The frame maps Bob's caret at the start of ab to its end, Backspace deletes b, and the recorder stores quote[cd, empty line], losing a and ef | Ledger run map and the recorder's clamp | `probes/s207-a1.log`, `probes/s207-frame-a1.log` |
| step:389 | Alice suggests a cross-line delete, then a move that lands between the join's halves | Content matches a plain editor; the next letter lands after ab in the frame and after h in the store, where a plain editor puts it before h | Ledger run map | `probes/step389-a1.log` |
| Seed 20261015 | Alice suggests a text move then a split, and Bob rejects the move | The view keeps a held marker on b, so a letter typed at its start joins b's leaf in the frame while the recorder puts it after a | Projection's held member | `probes/s20261015-a1.log` |
| Controls | Cross-container joins emptied by a word Backspace or a range delete, and a follower from an Editing Enter | Pass both intents with the framed law on, because the recorder stores a cross-container join's line next to its target | none | `probes/crossEmpty-a1.log`, `probes/crossEmptyRange-a1.log`, `probes/splitFollower-a1.log` |

The frame instrumentation for seed 207 shows the map: stored positions 6 to 16, the follower and the joining line, map to 5 backward and 13 forward, one coarse replacement, because the alignment chain in [`alignment.ts`](../../packages/plitejs/src/authored/tree/alignment.ts) (lines 539 to 555) falls through to two diffs when the view reorders letters. Moving the follower after the joining line first makes the structural alignment succeed on seed 207 and on the follower case (`probes/perm-probe-a1.log`). Even an exact map cannot record seed 207's Backspace through `rebase`, which walks one cursor and clamps a range whose stored image runs backward (`packages/plitejs/src/authored/tree/record.ts:352`). The clamp fires 306 times across the passing authored suites, every time on a zero-length insertion and never on a removal (`probes/clamp-probe-a1.log`).

### Design

`architect` ran three runners and an Opus cross-judge over anonymized candidates (`docs/plans/artifacts/2026-10-17-command-law-moved-content/architect/judge.md`). The base is the Opus candidate: an order beside the stored runs, read from the resolver's landing, and a recorder that splits steps at breaks. The Sol and Astra candidates threaded offset provenance through resolution and completion, which covers node placement, undo keys and anchors exactly but rewrites the snapshot index, anchors and completion; the judge scored their size and risk 1 and 2 out of 5 against the base's 3. The synthesis takes two grafts, completion's proposed children following the landing and a marker oracle for the map law, and names the rest as the deferred ledger rows (`architect/synthesis.md`).

### Requirements

- Commands decide on the proposed projection, and the recorder lifts their result back into authored changes (`docs/vision/plite.md:386-387`).
- The framed law: accepting the recorded document gives what the commands wrote, and the stored selection maps to where the commands left it (`packages/plitejs/src/authored/authored.ts:409-471`).
- A block written among a pending join's followers lands right after the joined line when the join is accepted, and stays put when it is rejected (`docs/plans/2026-10-13-review-tree-pivot.decisions.tsv`, the row of 2026-10-14T18:51:07Z on followers).
- An empty join target goes and the joining block keeps its own type and properties, as Editing's merge does (`packages/plitejs/src/authored/tree/resolve.ts:905-906`).
- Stored documents keep their shape: no change to marks or records.
- Per-key work stays at the control's counts on the work suite's cells, and does not grow with document size on cells that hold followers (`packages/plitejs/test/authored-tree-work.test.ts`).

### Lanes

- Keep the filters, the strongest deletion. No code changes, and the law keeps excluding moved content. Rejected: seed 207 loses two letters and a line through two ordinary commands, a move and a Backspace.
- Store a follower after the joining line, so the proposed view never reorders. Rejected: the reorder moves to the rejected view, the follower still needs a mark saying where it goes when the join is rejected, and every stored document with a follower changes meaning.
- Provenance through resolution and completion, the Sol and Astra candidates. Rejected for now: exact everywhere, but it rewrites the snapshot index, anchors and completion for positions the law does not read.
- An order read from the resolver's landing, and a recorder that splits steps at breaks. Picked.
- Repair at record time, by refusing or rewriting a frame step that lands in a coarse region. Rejected: it guards the symptom, and the caret the user sees stays wrong.

### Dependents

- `ai`, `layout`: `packages/platejs/src/ai/react/AIChatPlugin.ts`, unaffected, it reads changes and decides them, never a follower's order or a held member.
- `comments`: `apps/www/src/registry/components/editor/discussion.tsx`, unaffected, it reads cards and anchors.
- `documents`: `packages/platejs/src/docx/export/lib/reviewProjection.tsx`, affected only by the emptied-target landing, which matches the editor's view; `packages/platejs/src/docx/export/lib/authoredDocx.spec.ts` reads `held` from stored children, which keep it.
- `exports`: `apps/www/src/registry/components/editor/export-toolbar-button.tsx`, unaffected, it calls the export entry points above and reads no review member.
- `html`: `packages/platejs/src/static/renderStaticHtml.tsx`, unaffected, a projection never carried a rendered held member.
- `persistence`: `packages/platejs/src/migrations/migratePlateV54Suggestions.internal.ts`, unaffected, no stored shape changes.
- `react`, `suggestions`, `ui`: `packages/platejs/src/react/features/suggestion/useSuggestion.ts`, `packages/platejs/src/react/features/suggestion/SuggestionPlugin.spec.tsx`, `apps/www/src/registry/components/editor/suggestion.tsx`, unaffected beyond the editor's own fixes; the spec reads `held` from stored children.

### History

This review retains `2026-10-12-suggestions-complete` because its Pursue of the review tree still holds and this page only narrows it to commands over moved content.
This review retains `2026-10-17-suggestions-bulk-resolve` because its Accept all and Reject all in the copied mode menu call the same decide path, which this plan changes only for an emptied join target.
It also retains the review-tree pivot's follower rule and its cross-container join recording (`docs/plans/2026-10-13-review-tree-pivot.md`, decision rows of 2026-10-14T18:51:07Z and 2026-10-15T17:12:35Z). It reopens the pivot's Defaults row on the framed law's selection check (`docs/plans/2026-10-13-review-tree-pivot.md:535`), whose owner question this plan answers by mapping through the frame's own map, and takes over the filters that the pivot's final gate left to task_ed6723b2 (`docs/plans/2026-10-13-review-tree-pivot.md:529`). The t_761dd2c5 follower case (`docs/plans/artifacts/chips/t_761dd2c5/probes/probe-plain-a1.log`) is folded in. No external checkout was read.
