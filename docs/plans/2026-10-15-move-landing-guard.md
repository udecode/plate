---
review_scopes: [dnd, list]
review_basis:
work_kind: implementation
review_commit: 1a9a7cbf1ef02e6ebbf73a749a6bcfadbfe98c95
review_inputs: [packages/plitejs/test/transfer-contract.test.ts, packages/platejs/src/features/list/lib/BaseListPlugin.spec.tsx]
---

# A text move checks every block it carries

Status: executed, uncommitted on next, waiting on your commit
Topic: dnd
Playbook: plan

Execution playbook: Build (`.agents/playbooks/build.md`), with the Plan playbook's architecture rules (`.agents/playbooks/references/architecture.md`). Run directory: `docs/plans/artifacts/2026-10-15-move-landing-guard/`. Intake base: `1a9a7cbf1e` plus the uncommitted tree, the same base as `docs/plans/2026-10-15-list-drag-landing.md`, whose task (task_46ac463d) this iteration finishes. That plan's decision-trail review opened it. Its critical finding says the guard the task names still lets a landing change the moved range's last block (`docs/plans/2026-10-15-list-drag-landing.decisions.tsv`, phase `trail`).

## Brief

### What will change?

A review found that moving text could still change the last block you dragged. Now the check covers every block you move, even an empty last one, and list items dragged out of a quote land.

### What could go wrong?

Dragging just a line break or a link's start now does nothing. Dragging text that ends inside a mention can duplicate it. A plugin deleting moved text beside identical text still passes. Each has a follow-up.

## Teach

When you drag text to move it, Plite deletes it where it was and lands it like a paste. A check then makes sure the landing kept everything you moved, apart from settings a plugin marks as following the drop, like list depth. Otherwise the move does nothing.

Today the check skips the blocks at both ends of the dragged text. But the source usually loses the last block, and the landing writes it, so a plugin could untick its checkbox and the move still landed.

Now the check skips only the block your text joins at the drop point and the blocks around it. It lines blocks up from the top of what you dragged, so whole list items still move out of a quote. The check looks for an empty first or last block at the drop point. If the selection ends right at a block's start, that block also stays behind; a follow-up decides that.

## What other editors do

The first plan read ProseMirror view `ca4c78e`, Lexical `dd5c41b13`, Slate `945a484df` and Tiptap `91c51be53` in local source, not run (`docs/plans/artifacts/2026-10-15-move-landing-guard/prior-art.md`). Every one lands a text drag-move as a delete followed by its paste path and keeps whatever the paste wrote. None of them compares what landed with what moved, so none refuses a move a paste hook changed (inferred from those paste paths; no editor was run).

| Editor | What a move lands | Check after the landing |
| --- | --- | --- |
| ProseMirror | The source is deleted, then `replaceRange` fits the dragged slice, after `transformPasted` | None |
| Tiptap | ProseMirror's drop | None |
| Lexical | The range is removed, then `$insertDataTransferForRichText`, the paste path, inserts it | None |
| Slate | The range is deleted, then `insertData`, the paste call, inserts it | None |
| Plite today | The paste plan with intent `move`, then a guard that skips both open edges and every empty edge block | Text and marks, and the shells of middle blocks |
| Plite after this plan | The same landing | Text and marks, and every shell the move carries, an empty last block included |

## Decision ledger

| Surface | Current | Target | Owner | Reason | Adoption | Proof | Risk | Verdict |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Which landed blocks a move must keep | The guard skips both open edges and every block above the target block's depth, from the slice's openness | The guard compares every block the move carries; it skips only the block the head merges into and the blocks that hold it | `plitejs` transfer guard | The source deletes the end block, so its shell lives only in the landing, except when the range ends at that block's start, which keeps the block at the source too (t_6ef9e292); the start block stays at the source | Internal; `transfer.ts` hands the guard the moved and written slices | Step 1's contract cases, the probes P1b, P13, F3 and A2, and the wrapped List case | none | rearchitect |
| Alignment of moved, written and landed blocks | `sliceDepth` from the target block's depth | The blocks along each tree's first path from the top, its head chain | `plitejs` transfer guard | The fit merges the slice's open head chain into the drop block's chain, and the first character can sit in a later block | Internal | Step 1's empty-head and break-only controls, P13 at depth 2, the List peel | none | rearchitect |
| What the landed range covers | The inserted characters and each whole element without characters, each end read outward | Also, when the first or last block the landing wrote holds nothing, the text block at the drop point that block merges into, reached from the insertion's own bounds, outside each link the drop splits but inside each link the dragged text reaches into; no end reads past the block its content lies in | `plitejs` `landedRange` in `transfer-guard.ts`, from `measureDraftInsertion`'s `span` and new `tokenSpan` | An empty end block's shell moves with the text, and an empty head decides how the blocks line up | A move or copy whose text starts at a block's end or ends at a block's start returns and selects a range from the end of the drop point's text block, or to the start of the block that holds the drop point's following text | Step 1's empty-edge, link and nested cases; the differential run | The selection after such a drop includes the line break | rearchitect |
| Where declared properties resolve | The moved side resolves them in the source's ancestors, the landed side in the destination's | Both sides resolve them on the landed block in its destination | `plitejs` transfer guard | One permission set per block pair; the two lookups could only refuse falsely | Internal | Step 1's destination-declared case | none | rearchitect |
| List join compatibility | Checks the first copied item of the joined list | Checks the copied item at the join's depth nearest the drop edge | `platejs` List | The join walks at that depth, so its kind decides compatibility | Internal | Step 2's join cases, both edges | none | rearchitect |
| Work as a copied family grows | Unmeasured | A work case copies a block with 10 and 300 patched children and counts the child entries the adoption copies along its patch paths; other work per patch stays uncounted | `plitejs` `adoptAt` | Two diff-round seats found quadratic copying, since fixed but never swept | Internal counter `landingMetrics` | Step 2's work case | none | gate: Step 2's work case; a miss sends the adoption back to `architect` |

## Comparison

`architect` ran three runners and a blind cross-judge (`docs/plans/artifacts/2026-10-15-move-landing-guard/architect/synthesis.md`). The pick is the opus runner's design with one graft, declarations resolved at the destination, from the astra and sol runners.

| Target | Refuses every loss | Admits legitimate moves | One owner | Cost | Surface | Survives after the fit | Judge total |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Incumbent guard | 1 | 2 | 1 | 3 | 4 | 3 | 14 |
| Start-edge-only skip, no new artifact | 3 | 2 | 2 | 3 | 4 | 3 | 17 |
| Fit receipt carried through every step (astra) | 4 | 3 | 4 | 3 | 1 | 4 | 19 |
| Private witness (sol) | 4 | 3 | 3 | 3 | 1 | 4 | 18 |
| Moved payload checked against the drop point (opus, picked) | 3 | 3 | 3 | 4 | 4 | 3 | 20 |

Challenge delta, plan panel round 1 (`docs/plans/artifacts/2026-10-15-move-landing-guard/panel/p1/`):

- All three seats found that skipping empty edge blocks lets a move change an empty last block the source drops.
- gpt-6-astra and gpt-6.1-sol found that lining blocks up by the first character refuses moves that land today: a range that starts with an empty block, one that holds only a line break, one around a block void, and a nested end at a block's start.
- gpt-6-astra and gpt-6.1-sol found that the location mapping can credit a deleted landing to identical text beside it.

The plan now lines blocks up by the head chain, has the landed range cover an empty end block, and drops the empty-edge exemptions. It also drops the one-time drop check, which refused heads and wrappers that only duplicate shells the source keeps. The location mapping predates this task at `1a9a7cbf1e` and goes to a follow-up.

Challenge delta, plan panel round 2 (`docs/plans/artifacts/2026-10-15-move-landing-guard/panel/p2/`):

- Opus found that the landed range's tail runs into a link the drop splits, so moves dropped inside a link refuse.
- gpt-6-astra and gpt-6.1-sol found that an empty first block or a lone paragraph break leaves the landed range short, so such moves refuse. gpt-6-astra found that the tail takes in a paragraph the fit reopens in nested drops.
- gpt-6-astra and gpt-6.1-sol found the location-mapping loss again, through a rebased move.

The plan now builds the landed range in one function, `landedRange`, from the insertion's own bounds. It reaches into the block at the drop point only for an empty first or last block, stays outside any link the drop splits, and never reads past the block its content lies in. A differential run over 4,324 moves in 14 documents (`docs/plans/artifacts/2026-10-15-move-landing-guard/proof/v6/oracle-moves.log`, script in `docs/plans/artifacts/2026-10-15-move-landing-guard/probes/p2/oracle/`) finds 3 moves that the first plan's final bytes land and this plan refuses, each a range that holds no characters, only a link's edge. Across 5,112 landing reads that each change one carried block, it lets none through; the first plan's final bytes let 2,006 through. None of them needed the one-time drop check this plan removes. The check exempts only the landed blocks at the top of the head chain, and it compares every block below them in order, with an exact count. The location mapping stays with the follow-up, since every move, rebased or not, reaches it the same way at `1a9a7cbf1e`.

Challenge delta, plan panel round 3 (`docs/plans/artifacts/2026-10-15-move-landing-guard/panel/p3/`):

- gpt-6-astra and gpt-6.1-sol found that the link lift drops a link the dragged text carries, so a move from a link's end across a paragraph break refuses.
- Opus found that copies change whether they report lost content, which the plan did not say. gpt-6-astra found that the copy run sorted ranges by text leaves, not blocks.
- gpt-6-astra and gpt-6.1-sol raised the location-mapping loss a third time.

The empty-edge read now keeps as many links as the dragged text reaches into at that end, and lifts the point out of the rest. The differential run now covers 7,044 moves in 19 documents, the seats' documents and two with inline voids among them (`docs/plans/artifacts/2026-10-15-move-landing-guard/proof/v7/oracle-moves.log`, script in `docs/plans/artifacts/2026-10-15-move-landing-guard/probes/p3/oracle/`). It finds no move the first plan's final bytes land that this plan refuses, and it lets none of 7,351 carried-block changes through, where the first plan's final bytes let 3,184 through. It also lands 579 moves the first plan's final bytes refuse, and each keeps every character and void. Across 7,044 copies, 1,950 return a different range. Of those, 1,884 start at a block's end or end at a block's start, 55 hold no characters, only a link's edge, and 11 start or end beside or inside a link (`docs/plans/artifacts/2026-10-15-move-landing-guard/proof/v7/oracle-copies.log`).

Challenge delta, diff panel round 1 (`docs/plans/artifacts/2026-10-15-move-landing-guard/panel/d1/`):

- gpt-6-astra and gpt-6.1-sol found moves that the first plan's final bytes land and the build refuses. One is a line break between two closed titles, dropped into an empty title. The others are a link's opening edge inside a quote or a span, dropped at a link's end. Their sweeps, with title, heading and nested inline documents, found 17 such moves, and none carries a character.
- Opus found a control that pins a move keeping its end block at the source while landing that block's shell too, two guard rules no case pinned, and two reasons the comment pass had deleted.
- gpt-6-astra found that the adoption work case passes when every node on a patch path is copied.

The build keeps those refusals and names them as Risk 5. The landed range comes from draft positions, which cannot tell which equal block the landing reused, or see the block a split adds. t_45a9856d decides whether the landing reports the range it wrote. The end-block duplication predates this task and goes to t_6ef9e292. Two new cases pin the exact count and declarations that follow the drop only where the block left, and the adoption counter now counts where it copies.

## Native behavior and proof

| Delta | Behavior | What changes | Proof surface | Source |
| --- | --- | --- | --- | --- |
| added | Text drag whose landing changes the block that holds the range's end, empty or not, or a block containing it | Refuses and changes nothing | Step 1's raw Plite cases, through a landing read and through a correction | `move guard plan` Step 1 |
| added | Text drag whose range ends at the start of a block the source merges away, from inside a block or from a block's end | Lands, with that block's settings around the drop point's following text. Before, such a range refused when a whole block sat between its ends (F3) | Step 1's controls; probes F3 and A2 (`proof/p1-d3-probes-a1.log`, `proof/p1-v5-probes-a1.log`) | `move guard plan` Step 1 |
| added | Text drag or Option-drag copy whose range starts at a block's end or ends at a block's start | The returned range and the selection after the drop start at the end of the drop point's text block, or end at the start of the block that holds the drop point's following text | Step 1's copy-range and empty-edge cases; the copy run (`docs/plans/artifacts/2026-10-15-move-landing-guard/proof/v7/oracle-copies.log`) | `move guard plan` Step 1 |
| added | Text drag or Option-drag copy with an end at a link's edge | The returned range and the selection cover the link the landing wrote, and stop outside a link the drop splits | Step 1's link cases; the copy run | `move guard plan` Step 1 |
| added | Option-drag copy that starts at a block's end or ends at a block's start | Lands without saying that some content does not fit (486 copies in the copy run). A copy that holds no characters and ends at a link's start, dropped at the end of a link's text, now says it (14 copies), though it lands the same | Step 1's copy cases compare the whole outcome; the copy run | `move guard plan` Step 1 |
| added | Text drag of whole list items out of a quote into an empty paragraph | Lands at the drop's depth; one undo restores the source | Step 2's List case | `move guard plan` Step 2 |
| added | Text drag whose range ends inside an inline void's text, such as a mention's | Lands, keeping the void at the source and landing a copy of it, so the document holds one more void. The first plan's final bytes refused such moves, which the void sweep found 8 times | The void sweep `docs/plans/artifacts/2026-10-15-move-landing-guard/proof/v7/sweep-void-v7.out` | `move guard plan` plan panel round 3 |
| added | Text drag that carries no characters: a line break between two closed blocks dropped into an empty one, or a link's opening edge inside a quote or a span dropped at a link's end | Refuses and changes nothing. The first plan's final bytes landed it, adding an empty title, or an empty paragraph that holds an empty link | Diff panel round 1's cases (`docs/plans/artifacts/2026-10-15-move-landing-guard/probes/d1/cases.ts`) | `move guard plan` diff round 1 |

`move guard plan` is this file.

## Main changes

- **A move's guard compares what landed with what moved.** `carryMove` in `packages/plitejs/src/core/transfer-guard.ts` runs once, right after a text move lands. It lines up the moved slice and the slice the fit wrote by their head chains, and exempts the shells the source keeps that the landing read peeled or the fit merged. On every plain guard pass, `landsMoved` lines the landed fragment up the same way, skips the block the head merged into and the blocks that hold it, and compares each other landed block with its moved block. It skips the properties declared to follow the drop where the block landed. `LandingShape` and `landingTokens` go.
- **The landed range finds empty edge blocks.** `landedRange` in `packages/plitejs/src/core/transfer-guard.ts` builds a point landing's range from `measureDraftInsertion`'s `span` and its new `tokenSpan`, the positions around every token the landing inserted (`packages/plitejs/src/core/public-state.ts`). When the first or last block the landing wrote holds nothing, that end reaches into the text block at the drop point. It stays outside each link the drop splits, and inside each link the dragged text reaches into, which `openEdge` counts from the written slice. No end reads past the block its content lies in.
- **List joins a copied list by the item at the join's depth.** `adoptListBlocks` in `packages/platejs/src/features/list/lib/listIdentity.internal.ts` checks the kind of the copied item at the join's depth nearest the drop edge, not the first copied item.
- **Adoption counts its copying.** `adoptAt` in `packages/plitejs/src/core/landing.ts` adds the child entries it copies along each patch path to `landingMetrics.copiedEntries`, which the work case reads. It catches repeated child-array copies, not other work per patch.

## Risks and rollback

Realistic failures:

1. **A correction that deletes moved text beside identical text passes the check.** The guard maps the landing through `mapDraft`'s rebuilt whole-document diff, which can credit the deletion to the neighbor. That is true at `1a9a7cbf1e` already (`docs/plans/artifacts/2026-10-15-move-landing-guard/proof/p1-head-probes-a1.log`, case A1). A follow-up owns a mapping through the transaction's real steps, the recorder and command frames.
2. **The selection after some drops grows by a line break.** When the dragged text starts at a block's end or ends at a block's start, the returned range now starts at the end of the drop point's text block or ends inside the block that holds the drop point's following text. Moves and Option-drag copies both return it.
3. **A move that a paste would land inside a new container refuses.** It refuses today too, when the schema wraps carried blocks in a container the move did not carry. The law forbids changing a carried block, not adding a wrapper. Plate's lists are flat, so no shipped Plate kit wraps a moved paragraph (inferred from the kit schemas; not counted).
4. **A few empty copies say content did not fit.** A copy that holds no characters and ends at a link's start, dropped at the end of a link's text, now reports that some content does not fit, though it lands the same document. The copy run found 14 such copies among 7,044.
5. **A move that carries no characters can refuse where it used to land.** The guard reads the landed range from draft positions. When the draft's diff reuses a written block equal to one already there, or the fit splits the drop block, that range misses part of what landed, and the guard refuses. Two shapes do this: a line break between two closed titles dropped into an empty title, and a link's opening edge inside a quote or a span dropped at a link's end. The first plan's final bytes landed both, adding an empty title, or an empty paragraph that holds an empty link. With one character, the quoted link-edge move refuses at the first plan's final bytes too. The seats' sweeps found 9 such moves among 5,752 and 8 more in a run that stopped early, and every one carries no characters. t_45a9856d asks whether the landing should report the range it wrote, which would land them.
6. **A move whose range ends inside an inline void's text lands the void twice.** Deleting such a range keeps the void at the source, and the landing writes the void the slice carries. The first plan's final bytes refused these moves; the void sweep found 8 that now land with one more void (`docs/plans/artifacts/2026-10-15-move-landing-guard/proof/v7/sweep-void-v7.out`). t_8b0aa6dc decides how a move treats such a range.
7. **A range that ends at a block's start keeps that block at the source too.** The source keeps the block, and the landing writes its shell around the drop point's following text, so a setting such as `checked` ends up in both places (`docs/plans/artifacts/2026-10-15-move-landing-guard/proof/d1/hanging-proto-a1.log`: three blocks become four). The same document results at `1a9a7cbf1e` and at the first plan's final bytes. t_6ef9e292 decides it.

Blast radius: `LandingShape` and `landingTokens` have one caller, `runTransfer` in `packages/plitejs/src/core/transfer.ts`; `measureDraftInsertion` and `landedRange` each have one caller, the same function (`git grep -n`, 2026-10-15). The guard runs on every text move inside one document, from the Editable's native drop and from `editor.api.transfer.move` with a range; the landed range change also reaches text copies through a point. Block moves, block copies, pastes and hover never reach either. The registry's `transfer.move` calls (`block-menu.tsx`, `column.tsx`, `dnd.tsx`, `table.tsx`) move blocks, not ranges.

Rollback: revert `transfer.ts`, `transfer-guard.ts`, the `measureDraftInsertion` hunk of `public-state.ts`, `landing.ts`, `listIdentity.internal.ts` and their tests to the first plan's final bytes. No stored shape changes.

## Defaults

| Decision | Pick | Alternative | Word | Impact |
| --- | --- | --- | --- | --- |
| What a move's check skips | Only the block the text joins and the blocks around it (look) | Both ends of the dragged text, as today | skip both ends | big |
| A plugin deleting moved text next to identical text | Leave how the check tracks locations as it is; a follow-up fixes it (look) | Track locations through every real edit, in this plan | track real steps | big |
| Selection after dropping text that starts or ends at a line break | Includes that line break, like the text you dragged (safe) | Covers only the dropped characters, as today | select characters only | detail |
| Moves a paste would put inside a new container | Do nothing, as today (look) | Land them, since a container loses nothing | land wrapped moves | small |
| How deep the redesign goes | Two files that judge what landed, plus where the landing ends (safe) | A full record kept from the paste through every later step | trace the paste | small |
| Where plugin settings are looked up | Where the block lands (safe) | Where the block came from | settings at source | detail |
| Which copied item decides a list join | The one at the depth where it joins (safe) | The first copied item | join on first item | small |

## Start Gates

| Gate | Applies | Evidence |
| --- | --- | --- |
| `architect` picked a target | yes | `docs/plans/artifacts/2026-10-15-move-landing-guard/architect/synthesis.md`, `judge/verdict.md` |
| Each step's cheapest control behaves at base in a detached worktree | yes | at the first plan's final bytes, P1b, P13 and A2 land with the read's change, F3 refuses even with no read, and the empty-head, break-only, void and nested controls land (`docs/plans/artifacts/2026-10-15-move-landing-guard/proof/final-probes-a1.log`, `proof/p1-d3-probes-a1.log`, `proof/v5/contract-wt-guard-base-a2.log`); the wrapped List move refuses (`probes/wrapped-list.probe.spec.tsx`, run in `wt-guard-base`); Step 1's contract cases there fail only the 10 refusals and 2 copy ranges (`proof/p3-d3-contract-a1.log`) |
| The prototype keeps every passing case | yes | prototype v7 (`build-base/cand/proto-v7`): `proof/proto-v7-suite-plitejs-a1.log`, `proto-v7-suite-platejs-a1.log` and `proto-v7-slow-a1.log` fail the same 8, 200 and 193 cases as the first plan's final bytes; `proto-v7-typecheck-plitejs-a1.log` passes; Step 1's contract cases pass, 112 of 112 (`proof/p3-v7-contract-a1.log`), where v6 fails the 2 round 3 cases; every round 2 and round 3 probe behaves as the plan says (`proof/p2-v7-probes-a1.log`, `proof/p3-probes-a1.log`) |
| Benchmark pre-acceptance probe | yes | `docs/plans/artifacts/2026-10-15-move-landing-guard/proof/move-guard-timing-a2.log`: a text move across 10, 200 and 1000 blocks, line frozen at 1.5 times the base before the run; prototype v3 reads 1.024, 1.003 and 1.015, the planted two-move arm 1.94 to 2.08, same-code noise at most 0.024; the known-bad drop fails on the bench's own check (`proof/move-guard-known-bad-a2.log`). `proof/move-guard-timing-a3.log` reruns it on v5. On v7, `proof/move-guard-timing-a8.log` passes: 1.080, 1.024 and 1.029, planted arms 1.86 to 2.15, same-code noise at most 0.056. Runs a4 to a7 came back inconclusive because other sessions held the host's one-minute load above the limit of 12. Step 4 reruns it on the production path |

## Steps

- [x] 1. Write the failing raw Plite cases in `packages/plitejs/test/transfer-contract.test.ts`, each refusal asserting the document unchanged, no commit and `refused lossy`: a landing read that unticks the block that holds the range's end (P1b), turns it into a heading, or drops its checked state so the prepared path applies; a correction that unticks it; a landing read that unticks a quote that holds the range's end (P13, depth 2); a landing read that unticks an empty block that holds the range's end (A2), dropped inside a block, at a block's end and inside a link; a correction that unticks such an empty block. Add the controls, green before and after: the head merges and the end block lands as itself on the local and the prepared path (P1a); a range that ends at a block's start, dropped inside a block and at a block's end; a range that starts at a block's end; a range that starts with an empty block, dropped onto an aligned block; a range that holds only a paragraph break, dropped inside a block, at its end and at its start; moves dropped inside a link; a nested move dropped at a quoted block's end; a range that ends inside a link, dropped at a quoted block's end; a range from a link's end to the next link's start, dropped inside a link, and its refusal when a landing read unticks the end block; a move a paste would land inside items the schema creates refuses, for now; a property the drop declares as following the drop lands; and the whole outcome of three copies, range and diagnostics. Then replace `LandingShape` and `landingTokens` with `carryMove` and `landsMoved`, add `tokenSpan` (built as `bounds`) to `measureDraftInsertion`, and build the landed range in `landedRange`. Proof: the refusal cases red at the first plan's final bytes and green after, logged with `proof.mjs` in detached worktrees; one mutant per mechanism fails a named case: the end chain exempt again, lining up by the first character, the `uncarried` bound (built as `merged`) removed, declarations resolved on the moved side, the empty head ignored, the empty end ignored, the bounds ignored, an end that leaves its block, the link lift removed, the carried links lifted and ends read outward (prototype runs: `docs/plans/artifacts/2026-10-15-move-landing-guard/proof/v7/mutant-*.log`).
- [x] 2. In `packages/platejs/src/features/list/lib/BaseListPlugin.spec.tsx`: whole items moved out of a blockquote into an empty paragraph under a list item land at the drop depth, and one undo restores the source (red at base, `lossy`); a copy that shares one list id across a bulleted item at depth 2 and a numbered item at depth 1, dropped after and before a bulleted item at depth 1, gets its own list (red at base: today it joins). In `transfer-contract.test.ts`, a work case copies a block whose 10 or 300 children the adopt read patches and asserts the copy at 300 copies no more child entries per child than at 10, counted by `landingMetrics.copiedEntries` (built as `adoptWork`). Then fix `matches` in `listIdentity.internal.ts` to check the copied item at the join's depth nearest the edge, and add the counter to `adoptAt`. Proof: red at base and green after; a mutant restoring the first-item check fails both join cases; a mutant that drops the reuse of copied nodes fails the work case (prototype run: `proof/v5/mutant-owned-reuse-removed.log`). The work budget, no more entries per child at 300 than at 10, is frozen here, and a miss sends the adoption back to `architect`.
- [x] 3. Record the law: rewrite the guard sentences in `docs/vision/plite.md` and the drag note in `docs/editor-behavior/markdown-editing-spec.md` to say the guard skips only the block the moved text joins and the blocks that hold it; run `plate-docs` on `content/docs/(plugins)/(functionality)/dnd.mdx`, `content/docs/(guides)/clipboard.mdx`, `content/docs/(guides)/plugin.mdx`, `content/docs/api/core/plate-plugin.mdx` and their Chinese twins, where the narrowed promise lives; amend `.changeset/list-drag-landing.md`. Proof: `pnpm kb check` reports no new finding, the docs checks pass, and a teaching sweep for "open blocks that hold the range's start and end" finds no live hit.
- [x] 4. Run the acceptance proof on the final bytes in detached worktrees: the targeted files, the full plitejs and platejs suites and the slow suites against the first plan's final bytes, the plitejs typecheck, the probes P1b, P13, the round 1, 2 and 3 probes and the wrapped probe, the differential move and copy runs, the benchmark rerun on the production path, and five warm Chromium runs of the "list drop" cases in `apps/www/tests/browser/list-keys.spec.ts` with `--install`. Proof: the same failures as the first plan's final bytes and no new one, the probes behaving as rounds 1 to 3 logged, the differential runs matching `proof/v7/oracle-*.log`, the benchmark within its frozen line, 15 of 15 browser passes, and the hand drive of the text move on `/blocks/list-demo`.
- [x] 5. Close: the writing passes, the `api-build` diff panel, `pnpm lint:task` on the task's paths, the decision-trail review, the first plan's close and fold, and reflect. Proof: their logs and rows.
  Done: the writing rows, diff round 1, `lint:task` with 0 errors on the six task files, the repeated acceptance proof and the hand drive on the final bytes, the trail rows, and the first plan's Close and fold into `docs/plans/topics/dnd.md`. Reflect runs right after this Close and logs its row here.

## Completion Gates

| Gate | Artifact |
| --- | --- |
| Plan panel on this plan | round 1: `docs/plans/artifacts/2026-10-15-move-landing-guard/panel/p1/`; round 2: `docs/plans/artifacts/2026-10-15-move-landing-guard/panel/p2/`; round 3: `docs/plans/artifacts/2026-10-15-move-landing-guard/panel/p3/`, the last before the build |
| Writing passes on the diff and the docs | the `writing` rows after the build and after diff round 1 |
| Diff panel on the build | round 1: `docs/plans/artifacts/2026-10-15-move-landing-guard/panel/d1/`; it dismissed both critical findings, so no later round runs and the decision-trail review does |
| `plate-docs` on each named page and its twin | the build row's step 3 logs: `docs/plans/artifacts/2026-10-15-move-landing-guard/proof/step3-build-source-a1.log`, `step3-docs-parity-a1.log`, `step3-registry-check-a1.log`; after diff round 1, `docs/plans/artifacts/2026-10-15-move-landing-guard/proof/d1-registry-check-a1.log` and `d1-docs-parity-a1.log` |
| Decision-trail review | gpt-6.1-sol at xhigh, `docs/plans/artifacts/2026-10-15-move-landing-guard/trail/answer.md`; its rows in the decision log, phase `trail` |

## Open work

Each task is tracked in `docs/plans/suggested-tasks.decisions.tsv`.

- **The guard's location mapping.** `mapDraft` maps the landing through a rebuilt whole-document diff, so a correction that deletes moved text beside identical text passes the check (case A1, at `1a9a7cbf1e` and after this plan). A sound fix maps positions through the transaction's real steps, across the recorder's rewrite and command frames. t_33ab69a9, "Track a text move's landing through the transaction's steps (xhigh)". owner: zbeyens. stop: that session lands it, or zbeyens drops it.
- **Moves that carry no characters refuse.** A line break between two closed titles dropped into an empty title, or a link's opening edge inside a quote or a span dropped at a link's end, now does nothing (Risk 5). t_45a9856d, "Decide whether the paste landing should report the range it wrote (xhigh)". owner: zbeyens. stop: that session decides it, or zbeyens drops it.
- **A move whose range ends inside an inline void lands the void twice** (Risk 6). t_8b0aa6dc, "Decide how a text move treats an inline void its range ends inside (xhigh)". owner: zbeyens. stop: that session decides it, or zbeyens drops it.
- **A range that ends at a block's start keeps that block at the source too** (Risk 7). t_6ef9e292, "Decide how a text move treats a range that ends at a block's start (xhigh)". owner: zbeyens. stop: that session decides it, or zbeyens drops it.
- **A text drop into an empty paragraph lands in the block before it.** Dropping text into an empty paragraph merges its first block into the paragraph above and removes the empty one (case C9, at `1a9a7cbf1e`). t_057f43b6, "Land a text drop into an empty paragraph where it falls (xhigh)". owner: zbeyens. stop: that session lands it, or zbeyens drops it.
- **Moves a paste lands inside a new wrapper.** The guard refuses them, though the law forbids only changing a carried block (Risk 3). In Plite transfer (`packages/plitejs/src/core/transfer-guard.ts`). owner: zbeyens. stop: a Plate kit or Plite example lands a text move inside a created wrapper, or zbeyens accepts the refusal.
- **www's API reference check fails at `HEAD`.** `check:docs` stops at `api-reference:check`, which fails the same way at `1a9a7cbf1e`. t_4d43777d, "Make www's API reference check pass at HEAD". owner: zbeyens. stop: that session lands it, or zbeyens drops it.

## Close

**Reversals and deviations.**

- **Two critical findings dismissed, one fix reverted.** Diff round 1 found moves that carry no characters, which the first plan's final bytes land, refusing after the build: a line break between two closed titles dropped into an empty title, and a link's opening edge inside a quote or a span dropped at a link's end. The lead first took the range from the landing plan's replaced-block path. That did not reach the title case, because the fitter itself consumes the empty drop title, so the lead reverted it. Both findings were dismissed: the refusal changes nothing, which the law allows, and an exact range needs the landing to report where it wrote. Risk 5 names the limit, and t_45a9856d decides it.
- **The location-mapping loss dismissed four times.** Plan rounds 1 to 3 and the decision-trail review raised it. The loss, and the Vision sentence it breaks, exist at `1a9a7cbf1e`, and this plan does not touch `mapDraft`, so the lead dismissed it each time and offered t_33ab69a9.
- **Names.** The comment pass renamed `kept` to `carried`, `merged` to `peeled` and `uncarried`, `Declared` to `FollowsDrop`, `bounds` to `tokenSpan` and `adoptWork` to `landingMetrics`, and diff round 1 split the bound into `addsShell` and `losesShell`. Steps 1 and 2 keep the names they were built with and give the new ones beside them.
- **Overlays.** The comment pass and diff round 1 copied their bytes over the proto-v7 and final overlays in place, so earlier logs cite folders that now hold the final bytes. `docs/plans/artifacts/2026-10-15-move-landing-guard/build/overlays.md` names the saved copy that holds each stage, with a hash per file.

**What landed.** A text move inside one document carries a payload built right after its landing and before corrections. The guard lines the landed fragment up with it by the blocks along each first path, skips only the block the moved text joins at the drop point and the blocks that contain it, and compares every other block in order, with an exact count, an empty last block included. Declarations resolve where each block landed. The landed range covers what the landing inserted and reaches into the drop point's block for an empty first or last block, so a move or copy whose text starts at a block's end or ends at a block's start returns and selects the line break. List joins a copied list by the item at the join's depth. `docs/vision/plite.md`, the spec's drag note and EDIT-LIST-DROP-001, the dnd, clipboard and plate-plugin pages and their Chinese twins, and the plitejs changeset say so. Everything sits uncommitted on `next`.

**Proof.**

- Step 1's refusals and copy outcomes and Step 2's List cases fail at the first plan's final bytes for their named defects (the build row).
- On the final bytes, in detached worktrees at `1a9a7cbf1e` plus the final overlay, `packages/plitejs/test/transfer-contract.test.ts` passes 114 of 114 and `packages/platejs/src/features/list/lib/BaseListPlugin.spec.tsx` 259 of 259, and the plitejs typecheck passes. The plitejs, platejs and slow suites fail the same 8, 200 and 193 cases as the first plan's final bytes, each failing at `1a9a7cbf1e` too (the repeated acceptance row).
- Sixteen mutants each fail a named case: eleven for Step 1, two for Step 2 and three from diff round 1.
- Over 7,044 moves in 19 documents, no move the first plan's final bytes land refuses here, and none of 7,351 carried-block changes gets through, against 3,184 there (Step 4's row). Diff round 1's sweeps then found 17 moves without characters that now refuse (Risk 5) and 34 misses, each an oracle artifact (the misses row).
- 15 of 15 Chromium list drop runs pass over five warm runs. The paired move timing passes at 1.028, 1.001 and 0.994 against its 1.5 line, with every planted arm caught; on Step 4's bytes the built package passed at 0.958, 0.969 and 0.993.
- `pnpm lint:task` reports 0 errors on the six task files. The docs registry is fresh and docs parity passes.
- The hand drive on the final bytes moved Roman 2's end to Roman 3's start onto Decimal 111's end on `/blocks/list-demo`, landing as Step 4's drive did, and one undo restored it; `check` covers all seven cells (the final hand-drive row).

**Limits.** Browser runs are Chromium only, and Firefox does not launch on this host. No tool here starts a native drag, so the text move cases and the hand drive select with a real mouse drag and then fire drag events. The built-in pane was hidden and painted no frames, so the docs sentences were read in each page's DOM and served HTML, not on screen. The timing on the built package ran on Step 4's bytes; the final rerun timed the source. `check:docs` stops at the API reference check, which fails the same way at `1a9a7cbf1e` (t_4d43777d).

**Counts.** Five steps, all done. Five completion gates, all done. Seven open items, each with an owner and a stop.

**Decision-trail review.** Reviewed by gpt-6.1-sol at xhigh. It raised 1 critical, 4 warnings and 1 side nit (decision log, phase `trail`).

- **A rebased move still loses moved text that a correction deletes beside identical text.** Critical, dismissed, attention look. The reviewer says pre-existence does not meet the guard the ask names. The loss and the Vision sentence it breaks predate this task, and the fix needs a new owner for location mapping, which t_33ab69a9 tracks. Until it lands, the Vision's promise that a guard after corrections refuses such a landing stays false for this case. Say "track real steps", the Defaults row's word, to pivot into it.
- **Moves without characters newly refuse.** Warning, recorded. They lose nothing, and t_45a9856d decides the exact range that would land them. The Brief and Risk 5 name them.
- **8 moves whose range ends inside an inline void now land with one more void.** Warning, applied. A Native behavior row and Risk 6 name them; t_8b0aa6dc decides the fix.
- **A range ending at a block's start keeps that block at the source too.** Warning, applied. Teach, the first Decision ledger row and Risk 7 now say so; t_6ef9e292 decides it.
- **Cited overlay folders no longer hold the bytes earlier proofs ran on.** Warning, applied. The overlays manifest names each stage's saved copy and its hashes.

**Reflect.** One opus reviewer applied the tooling, judgment and divergent lenses (`docs/plans/artifacts/2026-10-15-move-landing-guard/reflect/answer.md`). The lead applied no lesson, because none fixes a script that refuses an allowed case or rewords a rule without adding words.

- **Backlog, offered as suggested tasks.** Verify's proof lessons, such as worktree probes importing by bare package name, saved drive scripts and frozen proof overlays (t_c5ca13c9). Plan front matter caught when a plan is written (t_c78992be). How a panel dismisses a known hole in a mechanism the ask names (t_c50c7700). A hook that denies inline `node -e` scripts (t_73159450). Which plan a subject page leads with at a hand-back (t_fd284610). A plate-plugins trigger for edits to a Base plugin (t_5fad3351); its late check of this run's plugin changes found no gap.
- **Rejected.** The decisions grammar, the page word limits and the exact chip title, because append and the renderer already refuse with the fix. A cron watch of peer sessions, which depends on this harness's tools. Checking load before timing, because the paired runner already marks a loaded run inconclusive. A status line to the parent session at the pivot, because the session rule keeps messages to the parent for blocking questions.
