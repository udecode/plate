---
review_scopes: [dnd, editing]
review_basis: [2026-10-04-dnd-audit, 2026-10-12-link-upsert-edges]
verdict: pursue
work_kind: implementation
review_commit: b1e70bb257d7a33c3a2f6160759a8ecb79e44500
review_inputs: [packages/plitejs/src/core/transfer.ts, packages/plitejs/src/core/transfer-guard.ts, packages/plitejs/src/transforms-text/delete-text.ts, packages/plitejs/src/transforms-text/delete-text-structural-cleanup.ts, packages/plitejs/src/editor/unhang-range.ts, packages/plitejs/src/core/editor-commands.ts, packages/plitejs/src/core/get-content-slice.ts, packages/plitejs/src/dom/plugin/dom-editor.ts, packages/plitejs/src/core/anchor.ts, packages/plitejs/src/core/command-frame.ts, packages/plitejs/src/core/public-state.ts, packages/plitejs/src/core/slice-fit/compiled-slice-fitter.ts, packages/plitejs/test/transfer-contract.test.ts, docs/editor-behavior/markdown-editing-spec.md, docs/vision/plite.md, docs/plans/2026-10-15-move-landing-guard.md]
review_upstreams: ['../slate@945a484df2497e4c448b33f417b0de2a49840032']
---

# A text move carries what its source loses

Status: done: landed in the checkout as a patch, uncommitted
Topic: dnd
Playbook: plan

Pursue: a text move should carry exactly what its source deletion removes and check exactly what its landing wrote, each fact read from its one owner. The strongest reason is that four of the five findings are the move holding a second copy of a fact another owner already decides. The source deletion (`deleteText`) and the moved slice (`getContentSlice`) each decide what a range covers, and they disagree at an inline void and at a hanging end. The guard rebuilds the range the paste landing wrote from draft positions, and maps it to later drafts through a whole-document diff, while the fitter knows where it wrote and anchors already follow the transaction's real steps. The fifth finding is a `deleteText` bug that reaches every cross-block delete, Backspace and cut included, not only moves. This page carries suggested task t_8b0aa6dc and the four tasks merged into it: t_45a9856d, t_6ef9e292, t_33ab69a9 and t_057f43b6. No ledger item queued it; the chips sweep in session local_18c70716 carded it.

## Brief

### What will change?

Deleting across paragraphs no longer eats the empty paragraph below. Dragging text no longer leaves a copy of a mention or a checkbox behind. A plugin can't quietly delete text you just moved. It's in your checkout, not committed, and the tests, the move sweep and a drive of the docs pages all came back clean.

### What could go wrong?

Deleting a selection that ends inside a mention now deletes the mention. Dragging a whole line leaves an empty line behind, and dragging just an empty line does nothing. Dragging a selection that starts or ends inside a locked block, or any locked element that isn't a mention, does nothing instead of losing or copying text. Text from a nested quote can't drop mid-line, same as pasting it. The speed check never got a quiet machine, so it's waived, but every run was as fast as before. A rare internal rewrite can still delete moved text after the check, like before. Four follow-ups wait in the ledger.

## Teach

A text move is two edits in one step: delete the selected text where it was, then paste it where you dropped it. A check afterwards makes sure the paste kept everything you moved, so a plugin cannot quietly change it.

Today the move asks two different questions about the same selection. Deleting decides what leaves, and copying decides what arrives, and they disagree in two places: a selection that ends inside a mention, and one that ends right at the start of the next line. Then the check guesses where the paste wrote by comparing whole documents, which mixes up the moved text with identical text beside it.

After this plan, the move pastes exactly what deleting removed. The paste says where it wrote, and that spot follows every later edit, so the check reads the real content. A delete bug that removed an empty paragraph below the selection goes too.

## Native behavior and proof

| Delta | Behavior | What changes | Proof surface | Source |
| --- | --- | --- | --- | --- |
| added | Delete, Backspace, cut or typing over a selection across blocks, with an empty block right after the block the selection ends in | The empty block stays. Before, the delete removed it, and a text drop into it landed in the block above (C9) | Step 1's raw `deleteText` and move cases | t_057f43b6 |
| added | Delete or a text move whose selection ends inside an inline void, such as a mention, at the start of a later block | The void goes with the selection, and the blocks merge. Before, the delete kept the void and the move landed a second copy | Step 1's cases; the void sweep rerun | t_8b0aa6dc |
| added | Delete or a text move whose selection starts or ends inside an inline void across blocks | The blocks merge after the void goes. Before, they stayed apart | Step 1's cases | t_8b0aa6dc |
| added | Text move whose selection starts at a block's start and ends at a later block's start | Only the text moves; the start block stays, emptied, and the end block keeps its settings once. Before, the move landed a second copy of the end block's settings | Step 2's rewritten case | t_6ef9e292 |
| added | Text move whose landing a correction deletes beside identical text | Refuses and changes nothing, on a plain editor and in Editing and Suggesting views | Step 3's cases | t_33ab69a9 |
| added | Text move that carries no characters, such as a line break between closed titles or a link's opening edge | Lands the document the final bytes of `move guard plan` landed, adding an empty title or an empty link. Its returned range now covers what it added, where those bytes returned a point inside the original link | Step 3's cases from diff round 1 of `move guard plan` | t_45a9856d |
| added | Forward Delete at a line's end, before an empty line and then another author's pending empty line | One empty line goes. Before, both went | Step 1's authored law in `authored-tree-commands.test.ts` | t_057f43b6 |
| added | Text move dropped at either edge of what its deletion removes, such as right after a mention its selection ends inside | Refuses as `no-op`. Before, it reported a move and changed nothing, or landed a second mention or empty block | Step 1's case; the oracle | t_8b0aa6dc |
| added | Text move whose deletion removes nothing, such as a selection of only an empty line | Refuses as `no-op`. Before, it added a line break or an empty link at the drop, or reported a move and changed nothing | Step 2's case; the oracle | t_6ef9e292 |
| added | Text move whose selection ends at a link's opening edge | Moves the text before the link. Before, it also landed an empty copy of the link | The oracle | t_8b0aa6dc |
| added | Text move from one block to the start of the line after a nested quote, dropped inside a line's text | Refuses as `schema`, as pasting the same text there does. Before, it landed and kept a second copy of the end block | The oracle | t_6ef9e292 |
| added | Text move whose selection still has an edge inside a non-editable element other than an inline void, such as a read-only block, a read-only inline or an atom, once an end at a line's start is pulled back | Refuses as `lossy` and changes nothing. Before, it lost the block's other text, copied a character or the atom's text, or turned the drop line into a heading | `transfer-contract.test.ts` read-only block cases for a start and an end edge; `d2-cases` | panel rounds 2 and 3 |
| added | Delete across blocks with an edge inside a block void nested in a container, or inside a read-only inline that is not a void | The blocks stay apart and the inline stays, as at `dc4e679307`. The build's first merge rule had merged them | `delete-contract.ts` nested block void and read-only inline cases | panel rounds 1 to 3 |
| removed | Text drag whose range ends inside an inline void's text, such as a mention's | Lands, keeping the void at the source and landing a copy of it, so the document holds one more void. The first plan's final bytes refused such moves, which the void sweep found 8 times | The void sweep `docs/plans/artifacts/2026-10-15-move-landing-guard/proof/v7/sweep-void-v7.out` | `move guard plan` plan panel round 3 |
| removed | Text drag that carries no characters: a line break between two closed blocks dropped into an empty one, or a link's opening edge inside a quote or a span dropped at a link's end | Refuses and changes nothing. The first plan's final bytes landed it, adding an empty title, or an empty paragraph that holds an empty link | Diff panel round 1's cases (`docs/plans/artifacts/2026-10-15-move-landing-guard/probes/d1/cases.ts`) | `move guard plan` diff round 1 |

`move guard plan` is `docs/plans/2026-10-15-move-landing-guard.md`.

## Public API

No signature changes. `editor.api.transfer.move` with a text `range` now lands what deleting that range removes, so a range that ends at a later line's start lands only its text.

```ts before
// packages/plitejs/test/transfer-contract.test.ts
[
  "ends at a block's start, keeping that block at the source too, for now",
  endChecked(),
  textRange([0, 0], [1, 0]),
  [
    paragraph(''),
    { ...paragraph('cd'), checked: true },
    paragraph('eab'),
    { ...paragraph('f'), checked: true },
  ],
],
```

```ts after
// packages/plitejs/test/transfer-contract.test.ts
[
  "ends at a block's start, landing only its text and keeping that block once",
  endChecked(),
  textRange([0, 0], [1, 0]),
  [paragraph(''), { ...paragraph('cd'), checked: true }, paragraph('eabf')],
],
```

## Main changes

- **`deleteText` owns what a text range deletes.** In `packages/plitejs/src/transforms-text/`, it no longer pulls back an end at a later line's start that lies inside an inline void, so the void goes. After it nudges an edge out of a non-editable element, it merges the blocks only when each nudged element is an inline void. Its structural cleanup window shrinks by the top-level blocks the merge removed. `resolveDeletedRange` returns the range it resolves, without deleting, or `null` when an edge still sits in a non-editable element other than an inline void.
- **A text move slices the range its deletion removes.** `runTransfer` in `packages/plitejs/src/core/transfer.ts` reads the moved slice from `resolveDeletedRange`, so a hanging range moves as its unhung range. It refuses as `lossy` when that range is `null`, and as `no-op` when it is collapsed or when the drop sits at an edge of the selection or of that range. It still deletes the range as given, so `deleteText` resolves the same plan.
- **The fitter reports where the slice's own content landed.** Each candidate in `slice-fit/compiled-slice-fitter.ts` records the token offsets of the slice's own tokens in what it writes, after any context its placement closes or opens. When the move asks for it, the fit maps both ends into the canonical document the way it maps its caret, by an offset within the block that counts each inline element's edges, so a link's edge stays on its side. The spec carries the result, and applying the spec binds it before listeners run (`public-state.ts`), on the direct path and on the content-roots continuation a card body's copy takes.
- **A draft track carries a landing through real steps.** `core/draft-track.ts` binds token positions to the draft they were read in and maps them through each later step. `commitRecordedDraft` maps them through the recorder's `mapPosition`; at a frame's commit it first maps them from the stored document to what the frame wrote. A schema rebind drops them, as does any other builder swap that does not map them, and the guard then refuses. Inside a frame the guard maps them with `frame.mapPosition`.
- **The guard reads the track.** Point landings read the range between the tracked ends; block landings track each block's start and end and check a block still spans them. `landedRange`, `openEdge`, `outsideInlines` and `mapDraft` leave `transfer-guard.ts`, and `measureDraftInsertion` leaves `public-state.ts`.

## Evidence

Model: claude-opus-5-5 at xhigh, Claude Code, session local_b4a8789f-233d-40c0-afdd-a0dc90b72c06. The review read `b1e70bb257` plus the checkout's uncommitted tree as of 16:10 UTC, mirrored into this session's worktree as commit `dc4e679307`. Slate was read at `../slate@945a484df` (`packages/slate/src/transforms-text/delete-text.ts`), not run. This review reopens no earlier verdict: the `dnd` head (`2026-10-04-dnd-audit`, Stop) judged the drag owner, not the move's facts, and the `editing` head (`2026-10-12-link-upsert-edges`, Pursue) judged inline wrap ranges. It builds on `move guard plan`, whose Risks 5 to 7 and Open work name four of these tasks.

### Requirements

- A move inside one document commits its whole landed content or nothing, and a guard after corrections refuses a landing that changes the payload (`docs/vision/plite.md`, transfer law).
- A text drag lands at its drop point as a paste there, and moves the content present at drop in one update and one undo entry (`docs/editor-behavior/markdown-editing-spec.md`, Mouse Drag And Selection notes).
- A triple-click selects one block's content and never reaches into the block below; Backspace after it removes the block (`EDIT-SEL-TRIPLE-SELECT-001`, `EDIT-SEL-TRIPLE-BS-001`).
- The user's typed asks, from the merged task briefs: decide whether the slice leaves out a void the range only enters or the deletion takes it, then fix it with a contract case; decide whether the landing should return the range it wrote, recorded in `docs/vision/plite.md`, with the diff-round cases landing as the first plan's final bytes landed them and the move contract cases green; decide how a range that ends at a block's start moves, in the spec, with a case that asserts the source and the landing agree on the end block; map the landed positions through the transaction's real draft steps so a deleted landing reads as deleted; find the empty-paragraph drop's cause, fix it at its owner and add a raw Plite case that fails first.

### What the probes show

Every probe ran in this worktree against the mirrored tree, logged with `proof.mjs` under `docs/plans/artifacts/2026-10-15-text-move-landing/proof/`.

- **The empty-paragraph drop is a `deleteText` bug** (`delete-a1.log`). `tx.text.delete` over `[0,0]:1` to `[1,0]:1` in `[p('ab'), p('cd'), p('')]` gives `[p('ad')]`: the empty paragraph after the end block vanishes, and with it the drop point, so the move lands in the block above (`baseline-a2.log`). The codex explorer traced it to `removeEmptyStructuralArtifacts`, which runs on the top-level window `getTopLevelCleanupRange` recorded before the merge, so the block the merge shifts into that window counts as an artifact (`explore/delete-answer.md`, section A).
- **The void duplicate is `deleteText` disagreeing with its own other paths** (`delete-a1.log`). A cross-block range that starts at a block's start and ends inside a void at a later block's start counts as hanging, so `deleteText` pulls its end back and keeps the void and the end block, while the slice carries both. A range that enters a void elsewhere takes the void: in one block at either edge, and at the start edge across blocks. Across blocks, a nudged void edge also skips the merge (`shouldMergeAcrossBlocks` needs both void flags null), which Slate's delete at `945a484df` does not skip.
- **The DOM layer already separates "before a void" from "inside a void".** `DOMEditor.resolveRange` unhangs a selection whose DOM focus is the element before a void ([dom-editor.ts](../../packages/plitejs/src/dom/plugin/dom-editor.ts), around line 2583), so a model point inside a void's text is a selection that entered the void.
- **A hanging range deletes as its unhung range, and copies as the hanging one.** `tx.text.delete` over `[0,0]:0` to `[1,0]:0` empties the start block and keeps the end block; the slice carries the start block and the end block's empty shell (`delete-a1.log`). The Delete command removes the fully covered start block instead, for a hanging range and for a triple-click's whole-content range alike (`delete-command-a1.log`), while a text move runs `tx.text.delete` for both.
- **Anchors already follow a correction's real steps.** Anchors placed at a landing's edges inside the update resolve, at the plain draft guard, to a collapsed range when a correction deletes the landed run and to the landed run when it deletes the identical neighbor (`anchor-guard-a1.log`). Inside a command frame an outer anchor falls back to a diff, while the frame maps stored positions to its result through real changes (`explore/anchor-answer.md`, sections B and C).
- **The loss reproduces on a plain editor and an Editing view, and a Suggesting view refuses it** (`frame-loss-a2.log`).
- **The fitter knows where it writes but reports only a caret.** Each candidate writes prefix, insert and suffix tokens over `[from, to)` and records the content end; the fit maps that caret through canonicalization (`explore/fit-answer.md`, section C). The three diff-round moves that carry no characters refuse today (`d1-cases-a1.log`) and landed at the first plan's final bytes (`../2026-10-15-move-landing-guard/proof/d1/cases-base-a1.log`).

### Lanes

- **Fix each fact at its owner (picked).** `deleteText` decides what a range deletes, the move slices that range, the paste landing reports where it wrote, and anchors carry positions through later steps. It deletes the move's rebuilds rather than adding a guard. Predicted benefit: the five findings close, cut and Backspace stop eating an empty paragraph, and `landedRange` and `mapDraft` go; the Close marks each held or falsified.
- **Patch the move to agree with its deletion.** `runTransfer` diffs the source before and after deleting and trims the slice to match, and keeps `landedRange` and `mapDraft`. Rejected: it is a second owner of what a range covers, the shape the `editing` head's link-upsert review found failing twice, and it leaves the delete bug to every other caller.
- **Strongest deletion: drop the range machinery and compare documents.** The guard checks that the moved tokens appear once in the document after corrections. Rejected: it cannot tell the moved text from identical text beside it, the very loss t_33ab69a9 names.
- **Stop.** Rejected: the empty-paragraph deletion loses user content on every cross-block delete, and the void and end-block duplicates add content the user did not have.

### The landing design and its prototype

- **Three designs ran blind.** `architect` gave the landing's report and transport to Opus, Astra and Sol runners (`architect/task.md`). An Opus cross-judge scored them 16, 14 and 13 against the incumbent's 5 and a no-artifact control's 7 (`architect/judge/verdict.md`). The run directory holds every file named here.
- **Picked: the Opus design with two grafts.** It carries two positions through the draft's steps and across the builder swaps that already exist, with no new transport. The first graft maps both bounds into the canonical document the way the fitter maps its caret, because the construction diff the design named confuses identical runs. The second lets only a move ask the fit for its bounds, so a paste does no extra work.
- **Not grafted: Sol's node identity for block landings.** The judge flagged that tracking a block by position could refuse a block move whose correction then moves or wraps the landed block. The base refuses both too, on a plain editor and in Editing and Suggesting views, and the base and the prototype both land a move whose correction moves a neighbor (`proof/block-correction-a3.log`).
- **The prototype passes its contract file**, 127 of 127 cases (`proof/proto3e-transfer-a1.log`). Six of the nine new landing cases fail at `dc4e679307`. The three that pass there check that the guard still lands a move whose correction deletes only the identical neighbor (`proof/red-p3-transfer-a1.log`).
- **The oracle of `move guard plan` finds no miss.** It runs 7,044 text moves over 19 documents and flips each block the moved slice carries (`proof/proto3e-oracle-a1.log`). It refuses 109 moves the base made: 66 whose deletion removes nothing, 38 dropped at an edge of what the deletion removes, 4 whose end sits in a nested quote where the candidate's own paste of that range refuses at the same drop, and 1 lossy refusal the base gives the same unhung text (`proof/proto3e-regress-detail-a1.log`). In all 66 that remove nothing, the base added a block, and in 21 of them it also split a link. Of the 38 edge drops, it changed nothing in 19 and, in the other 19, duplicated a mention or block or landed in the wrong block.
- **Every new or changed landing keeps the text in order.** The candidate lands 876 moves the base refused and lands 511 differently, and in each the result's text equals the source's with the deleted span moved to the drop; the base breaks that order in 30 (`proof/proto3e-landing-invariant-a1.log`). The base has more blocks in 452 of the 511, a second end block or an empty link copy. Of the 59 where the counts match, the base carries an empty link copy in 56 (`probes/equal-count.py`), and in the other 3 the candidate lands what a plain paste of the same range lands at that drop while the base does not (`proof/copy-vs-move-a1.log`).

Proof limits: a native text drag starts neither from Playwright nor from the in-app browser's mouse, so the hand drive selected text and fired drag events, as `move guard plan` did. Slate was read, not run.

### Dependents

- `distribution`, `editing`, `react`, `ui` (dependents of `dnd`, from `review-ledger.mjs lookup dnd`): unaffected in their calls, since no public signature changes; they inherit the move's new behavior through `editor.api.transfer`.
- `distribution`, `plate-api`, `react`, `ui` (dependents of `editing`): unaffected in their calls; every Plate delete, Backspace, cut and typing-over path inherits the `deleteText` fixes, which the Step 4 suites cover.

## Defaults

| Decision | Pick | Alternative | Word | Impact |
| --- | --- | --- | --- | --- |
| A selection that ends inside a mention at a line's start | Deleting or moving it takes the mention (look) | Leave the mention where it was | keep the mention | small |
| Moving a selection that runs to the start of the next line | Only the text moves, and an empty line stays, so a selection of only an empty line moves nothing (look) | Move the whole line, as Delete removes it | move the line | small |
| What a move that carries no characters returns | The range it wrote, from the new line's start into its empty link (look) | A point inside the original link, as the move guard plan's last version returned in the two link cases | keep the old point | small |
| The empty-paragraph fix | Every delete gets it, not only moves (safe) | Fix only text moves | fix moves only | small |
| Where a paste says it wrote | The paste reports it, and the check follows real edits (safe) | Keep guessing from the documents | keep guessing | detail |
| The move timing line | Skip it, since both runs hit a busy machine and every run was as fast as before (look) | Wait for a passing rerun on a quiet machine | rerun timing | small |
| The drag and drop page link | A new page at https://claude.ai/artifact/CYzConr7Z3AdVJGgyqZM4u, since the earlier link no longer opens (safe) | The earlier page at https://claude.ai/artifact/F7if6ESBGakX3qUPuoFQoa, or the first one at https://claude.ai/artifact/Fo9ckoasEpCPgbVtztPc4j | old dnd page | detail |

## Steps

- [x] 1. `deleteText` owns what a range deletes. Write failing raw cases first, in `packages/plitejs/test/delete-contract.ts` and `packages/plitejs/test/transfer-contract.test.ts`: the empty block after the end block survives a cross-block delete and a text drop into it lands there (C9); a range from a block's start into a void at a later block's start takes the void and merges, and a move of it leaves no copy; a range whose start or end sits in a void across blocks merges; a move dropped right after a void its range ends inside refuses as `no-op`. Then fix the cleanup window and the void handling in `packages/plitejs/src/transforms-text/`, and change the accepted result of the authored law "Delete at the end of a line before an empty line and another author's pending empty line" to keep one empty line. Proof: red at `dc4e679307`, green after, logged with `proof.mjs`; one mutant per fix fails its case. Done: every new or changed case fails at `dc4e679307` (`proof/red-build-a1.log`, `proof/red-d1-a1.log`, `proof/red-d2-a1.log`, `proof/red-d3-a1.log`); the panel rounds narrowed the merge and the end rule to inline voids, with cases for a nested block void and a read-only inline.
- [x] 2. The move slices what its deletion removes. Rewrite "lands a move whose range ends at a block's start, keeping that block at the source too, for now" to assert the source and the landing agree on the end block, and add "refuses to move a range that selects only an empty line", red first. Then add `resolveDeletedRange`, read the moved slice from it, and refuse as `no-op` a drop at its edges or a move whose deleted range is collapsed. Record the hanging-range rule in the spec's drag note. Proof: both cases red then green; the contract file green; a mutant that drops the collapsed check fails the new case. Done: both red at `dc4e679307` (`proof/red-build-a1.log`) and green after; panel round 2 added the `lossy` refusal for an edge left in another non-editable element, red for a start and an end edge (`proof/red-d3-a1.log`).
- [x] 3. The landing reports its range, and the guard reads it through real steps. Write the cases first: a correction that deletes the landing beside identical text refuses on a plain editor and while editing; one that deletes the identical neighbor lands on a plain editor and while editing and suggesting; a block move whose correction deletes the block beside an identical one refuses; the three diff-round moves land. Then build the picked design: the fitter records where the slice's own tokens land and maps both ends into the canonical document by an offset within the block that counts inline element edges, behind a `report` option only the move passes; `core/draft-track.ts` carries those positions through later draft steps, the recorder's commit and a frame's commit; the guard reads the range, or each landed block's start and end, from the track. Delete `landedRange`, `openEdge`, `outsideInlines`, `mapDraft` and `measureDraftInsertion`. Record in `docs/vision/plite.md` that the paste landing reports the range it wrote and the guard reads it through the transaction's real steps. Proof: six of the nine cases red at `dc4e679307` and all green after; a mutant that skips the carry at the recorder's commit fails a case; the oracle of `move guard plan` finds no miss, and each refusal it adds is a deletion that removes nothing, a drop at the deletion's edge, a paste the candidate's own copy refuses at that drop, or a refusal the base gives the same unhung text. Done: the cases fail at `dc4e679307` (`proof/red-build-a1.log`, `proof/red-cross-root-a1.log`); the schema-rebind carry and the fitter's void-edge rule were cut when their mutants survived; 21 of 21 mutants on the final tree `ff73d4aaa8` fail their named cases (`proof/mutate-final-2-run.txt`).
- [x] 4. Acceptance on the final bytes: the plitejs and platejs suites against `dc4e679307`, the plitejs typecheck, the probes (`frame-loss.ts`, `d1-cases.ts`, `baseline.ts`, `block-correction.ts`), the oracle rerun with `regress-detail.ts` and `landing-invariant.ts`, and the move timing line of `move guard plan`. Proof: no new failure; logs under the run directory. Done: the suites fail only what the base fails (`proof/cand-suite-plitejs-all-a2.log`, `proof/cand-suite-platejs-all-a2.log`); the typecheck shows only the base's 2 yjs errors (`proof/build-typecheck-a6.log`); every probe matches the run before panel round 3, with 7,044 moves, 109 explained refusals and 0 misses (`proof/final-oracle-a3.log`); the timing line was inconclusive under host load and is waived by the Defaults row "The move timing line" (`proof/move-timing-a2.log`).
- [x] 5. Close: writing passes, the diff panel, `pnpm lint:fix` on the task's paths, the decision-trail review, the land into the checkout and the chips `landed` row. Proof: their logs and rows.

## Completion Gates

| Gate | Applies | Artifact |
| --- | --- | --- |
| `pstack:blast-radius` before code when a public API changes | no | skip: no export changes; `resolveDeletedRange`, the fit's `report` option and `core/draft-track.ts` stay inside `plitejs` |
| Hard cut and `best-api repair` | no | skip: the deleted helpers were internal to `transfer-guard.ts` and `public-state.ts` |
| `plate-docs` on the affected docs pages | yes | the `range` input of `editor.api.transfer.move` in `dnd.mdx` and the text drag paragraph in `clipboard.mdx`, with their Chinese twins, state what a move carries and its `no-op` refusal; prose only, reread, no link changed; `build:registry` is left to CI, which owns generated registry output |
| `pstack:thermos` on the slice, which touches `plitejs` core that `platejs` uses | yes | found one regression on `5a4829b380`, a copy across a card body that refused, fixed with a case; two of three nits and seven of eight quality items applied (`thermos/bugs-reply.md`, `thermos/quality-reply.md`) |
| Diff panel, Opus, Astra and Sol seats | yes | three rounds on `bec73d74f0`, `9a1e4be383` and `65e14472d7`; three criticals fixed, every other finding applied or dismissed with a reason, and three deferred to Open work (`panel/d1`, `panel/d2`, `panel/d3`) |
| `pnpm check` steps the edits reach before acceptance | yes | the plitejs and platejs suites on the final bytes fail only the cases `dc4e679307` fails (`proof/cand-suite-plitejs-all-a2.log`, `proof/cand-suite-platejs-all-a2.log`); the plitejs typecheck shows only the 2 yjs errors the base has (`proof/build-typecheck-a6.log`) |
| `oxlint --type-aware` on the task's files before the panel freezes the diff | yes | clean (`proof/oxlint-typeaware-a5.log`) |
| Hand drive for a browser-visible change | yes | `/docs/dnd`, `/cn/docs/dnd`, `/docs/clipboard` and `/cn/docs/clipboard` covered at 1280 px in light (`proof/hand-drive-check-a2.log`, screenshots in `drive/`); on `/docs/dnd`, a text drag fired on a real selection moved the word and undid in one step, and a Backspace across the heading kept the empty line below |
| Changeset for the published `plitejs` edit | no | skip: `npm view plitejs@0.0.1` shows a 3-file placeholder, so `deleteText` and `editor.api.transfer` have no release baseline, and the unreleased `.changeset/plite-transfer.md` still describes the move's final behavior |
| `review-ledger.mjs check` at the close | yes | no problem names this plan; the other plans it lists predate this run |

## Open work

- **A text move and Delete disagree on a whole-line selection.** Delete removes a fully covered block; a text move leaves it empty, for a triple-click and for a hanging range alike. Deciding it changes what the move carries. owner: zbeyens. tracked: suggested task t_c95ad786. stop: t_c95ad786 lands, or zbeyens drops it.
- **A paste cannot land a slice that ends open inside a nested quote in the middle of a line's text.** It refuses as `schema`, so a text move from one block to the start of the line after a nested quote refuses there too, while a drop at a line's edge lands. owner: zbeyens. tracked: suggested task t_1b4352d1. stop: t_1b4352d1 lands, or zbeyens drops it.
- **A drop at a link's closing edge leaves an empty link.** Moving text there splits the link and keeps an empty link after the moved text, and moving text out of a tagged paragraph in a quote to that edge refuses as `lossy`, on the base and the candidate alike (`proof/link-end-a1.log`). owner: zbeyens. tracked: suggested task t_c95ad786. stop: t_c95ad786 lands, or zbeyens drops it.
- **The guard does not check after a recorder's final rewrite.** A recorder whose last rewrite deletes the landing commits after the plain guard passed, as the base does; only an internal recorder reaches it, and a check in the recorded phase would read review marks as loss (panel round 1). owner: zbeyens. tracked: suggested task t_ece8e967. stop: t_ece8e967 lands, or zbeyens drops it.
- **A move to the start of the document's last line carries that line's settings.** `deleteText` does not pull back an end at the document's end, so the move lands a second copy of the last line's settings; the spec's drag note states this exception (panel round 1). owner: zbeyens. tracked: suggested task t_c95ad786. stop: t_c95ad786 lands, or zbeyens drops it.
- **A move over only a link's opening edge lands an empty link.** The second ask wanted the diff-round cases to land as `move guard plan`'s bytes landed them, and those bytes landed this (panel round 1). owner: zbeyens. tracked: suggested task t_c95ad786. stop: t_c95ad786 lands, or zbeyens drops it.
- **The review-tree alignment's join-close fix lost its only test.** Forward Delete no longer removes the block after a merge, so the authored law case that reached the 2026-10-13 block-close drop now expects `[ab, '', cd]`, and three candidate cases did not reach it. owner: zbeyens. tracked: suggested task t_3050b578. stop: t_3050b578 lands, or zbeyens drops it.
- **A cut of a hanging range carries the end block's empty shell.** Cut removes the covered blocks and keeps the end block, but its clipboard slice still holds the end block's shell, so pasting it copies that block's settings. owner: zbeyens. tracked: suggested task t_c95ad786. stop: t_c95ad786 lands, or zbeyens drops it.

## Close

Reversals and deviations come first. Round 1 extended the moved slice to a read-only element's edge. Round 2 showed that duplicated characters, so the slice no longer reaches past an edge it cannot delete, and such a move refuses as `lossy` (decision rows 49, 53, 54). Two mechanisms left after their mutants survived: the draft track's carry across a schema rebind, and the fitter's rule for an edge inside an inline void (rows 28, 29). The docs narrowed twice instead of the behavior changing: a move to the document's last line still carries that line's settings, and a move whose end at a line's start leaves an atom keeps its text (rows 49, 58). The authored law case for forward Delete now keeps one empty line, which leaves the 2026-10-13 alignment join-close drop untested (row 41). No plan panel ran; three diff rounds took its place (row 23).

What landed is the patch `docs/plans/artifacts/chips/t_8b0aa6dc.patch`, applied to the checkout's working tree and left uncommitted. It holds the product code of frozen commit `ff73d4aaa8`, the docs pages, the spec, `docs/vision/plite.md`, this plan, its log and the `dnd` subject file. Three of those files had changed in the checkout since `dc4e679307`, so the patch merges onto the checkout's copies. In `public-state.ts` the checkout had moved content-root preparation into `fitSliceAtSite`, so the landing now records on that spec, and the separate relay this run had added to `writeSliceAtRange`'s own roots path is gone. Each ask's answer follows.

- The void ask (t_8b0aa6dc). Deleting takes an inline void the range enters, and the move carries it once. Contract cases fail at `dc4e679307` and pass now.
- The landing range ask (t_45a9856d). The landing reports the range it wrote, and `docs/vision/plite.md` says so. `landedRange` is gone. The diff-round cases land as the first plan's bytes landed them, empty link included.
- The block-start ask (t_6ef9e292). The spec's drag note says a range that ends at a later line's start moves only its text, except at the document's end. The rewritten case asserts that source and landing agree on the end block.
- The real-steps ask (t_33ab69a9). Landed positions map through draft steps, the recorder's commit and command frames, so a correction that deletes the landing refuses. An internal recorder's final rewrite after the guard is not checked, as before (t_ece8e967).
- The empty-paragraph ask (t_057f43b6). The cause was `deleteText`'s stale cleanup window, fixed there, with a raw case that fails first. Delete, Backspace, cut and typing over a selection get the fix too.

Proof. Every new or changed case fails at `dc4e679307`, and 21 of 21 mutants on `ff73d4aaa8` fail their named cases. A worktree that mirrors the checkout before the land, with and without the patch, shows the same failures on both sides. Two timeouts appeared on the patched side only, at host load 61, and the same cases took 0.9 s and 1.6 s on both sides in interleaved reruns. Dropping the landing record from `fitSliceAtSite` there fails the card-body copy case and the move cases. On the final bytes, the plitejs and platejs suites fail only what the base fails, and the plitejs typecheck shows only the base's 2 yjs errors. Oxlint is clean. The oracle's 7,044 moves show 0 misses and 109 refusals, each explained. The hand drive covered the four docs pages at desktop width in light, plus one text drag, undo and cross-block Backspace on `/docs/dnd`. Limits: the drag fired drag events on a real selection, since neither Playwright nor the in-app browser starts a native drag. No phone, dark or Safari check ran. The timing line was inconclusive twice under host load 25 to 30 and is waived by a `look` Defaults row (rows 64, 65).

Review inputs and what became of each. Changed: `packages/plitejs/src/core/transfer.ts`, `packages/plitejs/src/core/transfer-guard.ts`, `packages/plitejs/src/transforms-text/delete-text.ts`, `packages/plitejs/src/transforms-text/delete-text-structural-cleanup.ts`, `packages/plitejs/src/core/command-frame.ts`, `packages/plitejs/src/core/public-state.ts`, `packages/plitejs/src/core/slice-fit/compiled-slice-fitter.ts`, `packages/plitejs/test/transfer-contract.test.ts`, `docs/editor-behavior/markdown-editing-spec.md` and `docs/vision/plite.md`. Read and left unchanged: `packages/plitejs/src/editor/unhang-range.ts`, `packages/plitejs/src/core/editor-commands.ts`, `packages/plitejs/src/core/get-content-slice.ts`, `packages/plitejs/src/dom/plugin/dom-editor.ts` and `packages/plitejs/src/core/anchor.ts`. `docs/plans/2026-10-15-move-landing-guard.md` stays the plan this one builds on.

Counts: 5 steps, all done; 3 diff panel rounds, with 3 criticals fixed and 3 findings deferred; 4 suggested tasks offered for the 8 Open work items.

Attention, reviewed by gpt-6.1-sol @xhigh (`trail/sol.md`):

- The recorder's final rewrite stays open under t_ece8e967, so the real-steps ask holds for corrections and frames only.
- The document-end exception and the lost alignment coverage stay open under t_c95ad786 and t_3050b578.
- The typecheck now runs on the final bytes (`proof/build-typecheck-a6.log`); the timing gate is waived, not passed.
- The link opening-edge cases keep the first plan's empty link, as the second ask required.
