---
review_scopes: [authored]
verdict: pursue
review_basis: [2026-10-24-authored-joined-line-end]
work_kind: implementation
review_commit: 6babd4ddc011c8cd055e36d9c6c1634581828888
review_inputs: [VISION.md, docs/vision/plite.md, docs/plans/topics/authored.md, docs/plans/topics/collaboration.md, docs/plans/2026-10-17-join-keeps-target.md, packages/plitejs/src/authored/facts/settle.ts, packages/plitejs/src/authored/facts/admission.ts, packages/plitejs/src/authored/tree/resolve.ts, packages/plitejs/src/authored/resolve-schema.ts, packages/plitejs/src/yjs/core/controller.ts, packages/plitejs/src/yjs/core/change-bridge.ts, packages/plitejs/src/yjs/core/replacement.ts]
---

# Settle drops a block whose accepted deletion leaves it empty

Status: executed; its Yjs step landed as step 1 of the settle repair identity plan
Topic: authored
Playbook: plan

Pursue. When a verdict accepts a suggested deletion of a whole paragraph and that claim reaches settle later, settle takes the paragraph's text and keeps the paragraph, empty, with the accepted claim still stored (`docs/plans/artifacts/2026-10-17-held-editing-deletion/probe-settle-link-head-a2.log`). Deciding the same claim removes the paragraph. The subject's law says settling applies a claim as a decision would, so the block goes. Settle now drops each element whose own accepted deletion leaves nothing live, and completes the level it leaves the way the resolver does. It keeps today's shell only where deciding the claim alone would wait on another pending change.

## Brief

### What will change?

A paragraph whose accepted suggested deletion arrives late no longer stays as an empty line. In a shared room each peer's storage drops it too, so a reader sees one copy and the peer's next edit no longer fails.

### What could go wrong?

A peer that typed inside a paragraph the reviewer removed loses that typing, because the deletion wins. A repair the new writer cannot express falls back to today's whole-block rewrite, which can store two copies.

## Teach

A review document keeps each pending change as a mark on one tree, and a verdict decides it. A peer that was offline can later bring in more of a decided change, such as a paragraph it deleted. Admission settles that late claim against the stored verdict.

Settle dropped deleted text but kept a deleted paragraph as an empty line, where deciding removes it and fills the level back to what the schema needs. In a shared room the settled result also never reached storage, or reached it as fresh nodes that each peer wrote again.

Settle now removes the block and completes the level as deciding does, keeping the empty line only where deciding would wait. Each peer writes the repair to storage as deletions and in-place property writes, so the peers' identical writes merge into one.

## Public API

No public call changes. Settle changes what a loaded document holds after a late verdict, not how a caller asks for it.

## Main changes

- Settle removes an element whose own deletion a verdict accepted once none of its settled children is live content, for blocks as well as inline elements. Its level then drops it, and when what is left no longer fills the level, the level takes the schema's completion of what is left, as the resolver's does. A title slot or a minimum comes back as a fresh empty block with no claim (`packages/plitejs/src/authored/facts/settle.ts`).
- Settle keeps today's empty block, with its accepted claim stored, where the completion would build and deciding the claim alone waits on another pending change: a pending place change or deletion of the parent, a pending insertion or structure change on the parent or any ancestor, a pending structure change on a block left in the level, or a pending insertion at the front of a level with prefix slots. The parent and structure-change waits match the resolver's `waitOnBuild`, and the front-of-level wait matches `waitOnPrefix`. Under a pending insertion on the parent or an ancestor the resolver does not wait. It builds the completion as part of that insertion (`underInsertions`). Settle waits there instead, which shows the same line, and the next decision removes the shell.
- A vacated prefix slot takes a fresh element instead of moving the next block up, as the resolver's `vacatesSlot` reads it.
- The commit path reports each scoped block that settles to other than one node, and admission's repair places each later block by the difference (`packages/plitejs/src/authored/facts/admission.ts`).
- Every trusted update returns the admission's repair and the value it repaired, even when the update publishes no commit, and a commit no longer carries the repair (`packages/plitejs/src/core/public-state.ts`, `packages/plitejs/src/core/commit.ts`).
- `retractionOf` reads a change that only takes from its base: the elements that go whole, the characters that go from texts that stay, and what each touched block keeps. It returns nothing for a change that adds an element, a text or a character, or reorders what it keeps (`packages/plitejs/src/core/change/retraction.ts`).
- The Yjs binding lowers each import's repair once, after the import's own bookkeeping, by deleting stored items and writing the kept properties in place (`packages/plitejs/src/yjs/core/retraction.ts`, `packages/plitejs/src/yjs/core/controller.ts`). A repair that is not a retraction, or a stored block that does not read as the repair's base, takes today's root rewrite, traced as `rewrite`. The controller's repair fields and its delayed repair pass go.
- Settle builds a completion node only where a gone block can become it by removals and property writes, one built node per gone block, and keeps the emptied block elsewhere. A gone quote counts: storage reads an element left with no children as holding one empty text, so the quote becomes the empty line.
- The subject's settle rule covers blocks: settling applies a claim as a decision would, so an element whose accepted deletion leaves nothing live goes, inline or block, and its level completes as deciding completes it.

## What other editors do

Each source whose storage was read keeps deleting a paragraph's text apart from deleting the paragraph itself. The storage of Fidus Writer, manuscripts and EigenPal is unread. None settles a remembered verdict onto a claim that arrives later.

| Editor | Accepting a deletion of the whole paragraph | A container that needs a paragraph | Read |
| --- | --- | --- | --- |
| Word (OOXML) | The deleted paragraph mark joins the paragraph forward, so no empty paragraph stays | No rule for a sole cell, list item or quote paragraph | ECMA-376 Part 1 17.13.5.14-15 |
| ONLYOFFICE | Joins forward and leaves no empty paragraph | Refuses a deleted end mark at the document end or in a table cell, and rebuilds a paragraph when removal empties content | `onlyoffice/sdkjs@72b0421c0b`, `word/Editor/DocumentContentBase.js`, `word/Editor/Run.js`, `word/Editor/Document.js` |
| LibreOffice Writer | Joins the range; accepting a deletion of the text alone leaves an empty paragraph (testTdf135260) | Not read | `libreoffice/core@760394bbad`, `sw/qa/extras/uiwriter/uiwriter4.cxx` |
| prosemirror-suggest-changes | Deletes the block, and consumes a boundary suggestion in range in the same pass | Not read | `handlewithcarecollective/prosemirror-suggest-changes@653fba70ba`, `src/commands.ts` |
| Fidus Writer | Joins backward only when a text block precedes it with no isolating node between, otherwise keeps the paragraph and drops its tracking; an offline merge applies every stored deletion, not a remembered verdict | Not read | `fiduswriter/fiduswriter@e14cc456ac`, `track/delete.js` |
| manuscripts track changes | Joins the paragraph into the block above when ProseMirror can join them, else deletes it with its content | Not read | `atypon-opensource/manuscripts-track-changes-plugin@62f4d19dda`, `src/tracking/lib/mergeNode.ts:27-41`, `src/tracking/lib/deleteNode.ts:33-47` |
| EigenPal docx-editor | Joins forward; keeps a paragraph with no following paragraph | Keeps the last paragraph | `eigenpal/docx-editor@84c46227d4`, `tree-op-revisions.ts` |

SuperDoc's accept lives in an engine the clone does not hold, so it stays unread.

## Layer and owner

| Change | Layer | Package | Why |
| --- | --- | --- | --- |
| Settle removes a block whose accepted deletion leaves nothing live, and completes its level | Plite | `plitejs` authored, `facts/settle.ts` | Settle owns applying a stored verdict to a late claim, and the law says it applies it as a decision would |
| The commit repair places blocks after a removed or rebuilt one | Plite | `plitejs` authored, `facts/admission.ts` | Admission owns the repair a commit's settle returns |
| Each admitting peer writes the repair as deletions and in-place writes | Plite | `plitejs` core, `core/change/retraction.ts` and `core/public-state.ts`, and yjs, `yjs/core/retraction.ts` and `yjs/core/controller.ts` | Core owns what admission repaired and whether a change only takes from its base; the binding owns how a change reaches storage |

## Native behavior and proof

| Behavior | What changes | Proof surface |
| --- | --- | --- |
| Loading a document whose verdict accepted a whole paragraph's deletion | The paragraph goes; a quote or document that needs a line gets an empty one | The settle-of-a-deleted-block tests in `packages/plitejs/test/authored-facts.test.ts` |
| A peer's commit that brings such a paragraph after the verdict | Admission removes it, and places the blocks after it | The commit-path tests in the same block |
| A pending join or split that points at the removed paragraph | The join lands into the line before it and the split goes with the paragraph, as deciding both at once gives | The join and split tests, and the follower test |
| A pending change that decides what the level's completion builds | Settle keeps today's empty block until the next decision | The wait tests, each compared with deciding both at once |
| Two peers that admit one update a verdict settles | Both delete the same stored items, so storage holds one copy that a reader without admission reads as the editor shows, and the next edit lowers | The two-peer tests in `packages/plitejs/test/yjs/authored-admission-contract.spec.ts` and the table in `packages/plitejs/test/document-change-retraction.test.ts` |

## Defaults

| Decision | Pick | Alternative | Word | Impact |
| --- | --- | --- | --- | --- |
| Where deciding would wait | Keep today's empty line until the next decision (look) | Track the shell and settle it again later | settle later | small |
| A rare root that must hold two blocks, where the gone one sits before a kept one | Keep today's empty line, since deciding puts the rebuilt line elsewhere (look) | Move the rebuilt line to where deciding puts it | match the rebuilt line | detail |
| A repair the new writer cannot express | Today's whole-root rewrite, traced (look) | Refuse the import and retry it | fail closed | small |

## Steps

- [x] **1. Settle.** Settle removes an element whose accepted deletion leaves nothing live and completes its level as the resolver does, waiting where the resolver waits. Proof: the settle-of-a-deleted-block tests fail at the review commit and pass with the change; each branch's mutant fails a test.
- [x] **2. Yjs.** Core returns each trusted update's admission repair, `retractionOf` reads it, the binding writes it as deletions and in-place writes, and settle builds only what retracts. Proof: the two-peer tests converge on every probe case with no `rewrite` trace, and the retraction table, both partitions and the type check pass. Done by step 1 of `docs/plans/2026-10-26-settle-repair-identity.md`, after this plan's diff panel found that a value diff loses which block settle kept.
- [x] **3. Subject.** The settle rule covers blocks, and the join plan's out-of-scope row points here. Proof: `review-ledger.mjs check` and `plan-page.mjs --check` pass.
- [x] **4. Close.** Writing passes, a panel on the diff, and landing through `land.mjs`. Proof: the panel's rows and the landed commit.

## Close

Settle now drops a block whose accepted deletion leaves nothing live and completes the level it leaves as deciding does. Step 1 landed here. This plan's diff panel found that its Yjs step lost which block settle kept, so step 2 was rebuilt by the settle repair identity plan, whose three diff panel rounds and proof close it. Its Close holds the landed proof and limits. The open items below moved to the authored and collaboration subjects. The review read `VISION.md`, `docs/vision/plite.md`, `docs/plans/topics/authored.md`, `docs/plans/topics/collaboration.md`, `docs/plans/2026-10-17-join-keeps-target.md`, `packages/plitejs/src/authored/facts/settle.ts`, `packages/plitejs/src/authored/facts/admission.ts`, `packages/plitejs/src/authored/tree/resolve.ts`, `packages/plitejs/src/authored/resolve-schema.ts`, `packages/plitejs/src/yjs/core/controller.ts`, `packages/plitejs/src/yjs/core/change-bridge.ts` and `packages/plitejs/src/yjs/core/replacement.ts`.

## Open work

- A completion that needs a node no gone block can supply, such as a list where a paragraph was removed, keeps the emptied block and its accepted claim. owner: the owner. stop: the owner asks for a fix or drops it.
- When peers receive a late claim that empties a level and the verdict on one of its sibling claims in different orders, each keeps a different gone block and deletes the other's, so the level ends empty in storage, and two peers typing into the line each editor shows store two lines (R6 in `docs/plans/2026-10-26-settle-repair-identity.md`, measured before and after this run). owner: zbeyens. stop: a donor every peer agrees on whatever verdicts it knows, or a binding that keeps an emptied level.
- Each mark rewrite stores one mark record per admitting peer. owner: the owner. stop: the owner asks for a fix or drops it.

## Evidence

Model: claude-opus-5-5 at xhigh effort, read from this session's metadata.

### Requirements

- Settling applies a claim as a decision would ([the authored subject](topics/authored.md), its Rules).
- A block goes when its own mark says so and nothing inside it survives, and a decision completes the level it changes with the schema's completion, waiting on a pending change that decides what the completion builds (`packages/plitejs/src/authored/tree/resolve.ts`, `completeLevel` and `waitOnBuild`).
- An import never deletes a stored text inside an element, and a moved block that became a new Yjs node would lose a peer's typing inside it ([the collaboration subject](topics/collaboration.md), its Rules and Rejected table).
- Stored documents keep their shape, with no new mark kind or record.

### Lanes

- **Keep the empty paragraph.** Today's behavior. Rejected, because deciding the same claim removes the paragraph, and the law says settle matches the decision.
- **Remove the block only when its level keeps enough without it.** The first build. Replaced, because deciding also rebuilds a vacated title or a level below its minimum, and that build kept the empty block with its accepted claim stored, which deciding never leaves.
- **Track each kept shell and settle it again once its wait clears.** Rejected in the first design arena, because the next decision already cleans the shell, and the index and retry machinery add a second settle path.
- **Run the resolver itself as settle, with every other pending change kept.** Not taken here. It would make settle and deciding one code path, but it changes how admission and loading read every claim, which is wider than this task.
- **Diff storage against the editor after each import.** Rejected in the Yjs architect round, because a diff loses which sibling the admission kept, so a tie keeps the wrong one and drops an offline author's typing.
- **Lower the repair through the bridge that lowers local commits.** Rejected, because that bridge may split, copy and fill, which is right for one writer and duplicates under several.
- **Prepare the repair inside the import, through a second core entry point.** Rejected, because it adds a retry lifecycle and refuses the whole import when storage refuses the repair.

### Dependents

- `ai`, `layout`: `packages/platejs/src/ai/react/AIChatPlugin.ts`, unaffected, it decides changes and never reads how settle stores a decided block.
- `comments`: `apps/www/src/registry/components/editor/discussion.tsx`, unaffected, it reads cards and anchors, and a settled block carries no card.
- `documents`, `exports`, `html`: `packages/platejs/src/docx/export/lib/reviewProjection.tsx`, `apps/www/src/registry/components/editor/export-toolbar-button.tsx`, `packages/platejs/src/static/renderStaticHtml.tsx`, unaffected beyond an empty paragraph that no longer appears.
- `persistence`: `packages/platejs/src/migrations/migratePlateV54Suggestions.internal.ts`, unaffected, no stored shape changes.
- `react`, `suggestions`, `ui`: `packages/platejs/src/react/features/suggestion/useSuggestion.ts`, `apps/www/src/registry/components/editor/suggestion.tsx`, unaffected beyond the empty line that no longer renders.
- Dev pages `authored-review` and `suggestion-performance`: unaffected beyond the same empty line.

### History

This review retains `2026-10-24-authored-joined-line-end`, because its join rules still hold, and extends its settle rule to blocks on the authored scope. It takes over the block row that `docs/plans/2026-10-17-join-keeps-target.md` left out of scope, whose reason was that removing a block moves join targets and the commit repair aligned blocks by index. The join and split tests here show both stay correct, and the repair now places blocks by the difference.
