---
review_scopes: [authored]
verdict: pursue
review_basis: [2026-10-12-suggestions-complete]
work_kind: implementation
review_commit: 51f3a53b665263bd0b0ae81b99978f542eede86f
review_inputs: [VISION.md, docs/vision/common.md, docs/vision/plite.md, docs/plans/2026-10-08-authored-review.md, docs/plans/2026-10-16-raw-root-writes.md, docs/plans/2026-10-16-transactions-refused-result.md, packages/plitejs/src/authored/authored.ts, packages/plitejs/src/authored/tree/record.ts, packages/plitejs/src/authored/tree/resolve.ts, packages/plitejs/src/authored/tree/alignment.ts, packages/plitejs/src/authored/resolve-schema.ts, packages/plitejs/src/authored/format.ts, packages/plitejs/src/authored/facts/admission.ts, packages/plitejs/src/authored/ledger/ledger.ts, packages/plitejs/src/core/editor-schema.ts, packages/plitejs/src/core/element-owned-root-index.ts, packages/plitejs/src/core/public-state.ts, packages/plitejs/src/core/command-frame.ts, packages/plitejs/src/core/document-recorder.ts, packages/plitejs/src/core/document-admission.ts, packages/plitejs/src/core/plugin.ts, packages/plitejs/src/authored/ledger/runs.ts, packages/plitejs/src/editor/insert-text.ts, packages/plitejs/src/react/components/editable-text-blocks.tsx, packages/plitejs/src/yjs/core/controller.ts, packages/plitejs/test/authored-refusal.test.ts, packages/plitejs/test/refused-update-answer.test.ts, packages/plitejs/test/authored-tree-work.test.ts, packages/plitejs/test/authored-tree-record.test.ts, packages/plitejs/test/yjs/multi-root-contract.spec.ts]
review_upstreams: ['../prosemirror-suggest-changes@653fba70ba29ef6ea6af3ad8d60244a58df7281b', '../manuscripts-track-changes-plugin@62f4d19dda4c2d41afa5d9fdecea840fb6bfb0be', '../lexical@dd5c41b13193efa9ab1574234d8593d2c9e4f988', '../BlockNote@1e26f1c5e1cd7df81df9d4ab2a853bf1b298b163', '../y-prosemirror@9200946f0ea455c681a7496c364ee998a9f064f7', '../tiptap@91c51be53c4655ef07e29ec489471524debfa0ca', '../slate@945a484df2497e4c448b33f417b0de2a49840032']
---

# Authored: a suggested deletion keeps the owner's content root

Status: executed: landed on next as one commit; a Codex review of the diff waits on the Codex login
Playbook: build

**Pursue. A content root should live exactly as long as core's ownership rule keeps it, in the stored review tree and in every projection, decision and load of it.** Today the recorder refuses a Suggesting update whose plain draft deletes a root (`packages/plitejs/src/authored/authored.ts:1655`), so a paste, removal or fragment replace over a block that owns an exclusive content root cannot be suggested, and since t_cff52975 a refused rich paste there lands nothing. The refusal is not even consistent. Once any suggestion is pending, the same commands run in a review frame, record a struck card and leave its root in the proposed view with no owner (probe `framed-a3.log`). The mirror case is broken as well. Rejecting a suggested card insert answers `invalid` under a closed schema and, under an open one, leaves the card's root in the document with no owner (probe `insert-decide-a3.log`). All three come from one gap. Core drops a root whose last owner a transaction removes (`packages/plitejs/src/core/editor-schema.ts:1342`), but authored resolution, load admission, the review projection and the command frame keep every stored root whatever they do to its owners (`packages/plitejs/src/authored/tree/resolve.ts:1519`, `packages/plitejs/src/authored/facts/admission.ts:269`, `packages/plitejs/src/core/command-frame.ts:756`), and the recorder has no way to say that a root goes later with a struck owner. This plan answers suggested task t_a7c71be6, from the Open work of [the refused-result plan](2026-10-16-transactions-refused-result.md). Run directory: `docs/plans/artifacts/2026-10-17-authored-root-deletion/`.

## Brief

### What will change?

In suggesting mode you can now delete, replace or paste over a block that has its own content area. It shows as a suggested deletion, and the area stays until someone accepts. The Close lists the proof and its limits.

### What could go wrong?

The area doesn't look crossed out; the block's component styles it. Typing inside it does nothing until someone decides. Removing your own suggested block later just crosses it out. Only unit tests prove this, since no demo shows a card.

## Teach

Some blocks keep part of their content outside themselves. A card names a separate content root, and the document stores that root's blocks beside the main ones. The editor deletes such a root as soon as the last block that owns it is gone.

Suggesting keeps a deleted block in place under a delete mark, so nothing is gone until someone decides. The code that records suggestions had no way to say "this root goes later", so it refused the whole edit. Decisions had the opposite gap. Rejecting a suggested card removed the card and left its root behind.

Now a root follows its owner. A crossed-out owner keeps its root as it was, with no marks. The root looks deleted only through the owner drawn around it, so the root shown alone looks plain. When a preview, a decision or a load removes the last owner, the root goes too, by the rule the editor already uses.

## Public API

No call shape changes. The same Suggesting call that was refused now strikes the card and keeps its root.

```ts before
// packages/plitejs/test/refused-update-answer.test.ts
const { editor, refusals } = make('propose');

assert.equal(
  editor.update((tx) =>
    tx.command(editorCommands.replaceSlice, { slice: cardBlock() })
  ),
  undefined
);
assert.deepEqual(refusals, ['unrepresentable']);
```

```ts after
// packages/plitejs/test/authored-root-deletion.test.ts
const { editor, refusals } = make({
  selection: blockSelected,
  unknown,
  value: initial(unknown),
});

editor.update((tx) =>
  tx.command(editorCommands.replaceSlice, {
    slice: ContentSlice.closed([p('x')]),
  })
);

assert.deepEqual(refusals, []);
const { main, roots } = marked(editor);

assert.deepEqual(main[0], ['card', 'delete:bob:1', { body: 'b1' }]);
assert.deepEqual(roots, ['b1']);
```

## What other editors do

Read from local checkouts and vendor docs on 2026-10-17 (`docs/plans/artifacts/2026-10-17-authored-root-deletion/editors/answer.md`), none run. No editor we read marks content stored outside the owner when a tracked change deletes the owner. Where a model ties the content to its owner, it goes when the owner goes for good and stays while the deletion is pending.

| Editor | Where owned content lives | Suggested owner deletion | Accept or reject | Rejected owner insertion |
| --- | --- | --- | --- | --- |
| prosemirror-suggest-changes (`653fba7`), manuscripts-track-changes-plugin (`62f4d19`) | No content outside the node tree | The owner is kept and marked deleted | The owner is removed or restored | The owner is removed |
| Lexical (`dd5c41b13`) | A caption is a nested editor held by its image node | No track changes; a plain deletion removes the caption with its node | History restores both | Not covered |
| CKEditor 5 (`14e73cc31b`, track changes is commercial, vendor docs only) | Named roots of one document | Track changes across roots not documented; detaching a root empties it | Not documented | Not documented |
| BlockNote (`1e26f1c`) with y-prosemirror (`9200946`) | A caption is a node property | The block carries a deletion attribution and its properties stay | Delegated to y-prosemirror, whose checkout lacks the helpers | Not covered |
| Word (OOXML, vendor docs) | Footnote and comment bodies live in their own parts, linked by ID | The reference sits inside `w:del`, and the body stays unmarked (inferred) | Accept removes the reference; body cleanup not documented | Not documented |

Tiptap (`91c51be53`) has no open-source track changes, and Slate (`945a484df`) has neither content roots nor track changes.

## Layer and owner

| Change | Layer | Package | Why |
| --- | --- | --- | --- |
| Which roots lose their last owner, judged once with its cascade, reading only the roots a change touched | Plite | `plitejs` core, new `core/root-ownership.ts` behind `core/editor-schema.ts` | Core already owns the orphan rule and the ownership index; every caller asks the same judge instead of copying the rule |
| Every core finalize drops what it orphans, the command frame's included | Plite | `plitejs` core, `core/command-frame.ts` and `core/public-state.ts` | A frame write must carry the same root deletions a plain draft does, or the framed law cannot hold |
| A Suggesting write keeps the root of an owner it strikes | Plite | `plitejs/authored`, recorder in `authored.ts` with `tree/record.ts` | The recorder already turns the draft's removal into a pending deletion; the root's lifetime follows that deletion |
| A resolution, a decision and a load drop each root whose last owner they remove | Plite | `plitejs/authored`, `tree/resolve.ts`, `resolve-schema.ts` and `facts/admission.ts` | `projectAuthoredDocument`, exports, decisions and load all settle claims, and each must return a document the schema accepts |
| A review projection drops the same roots | Plite | `plitejs/authored`, `ledger/ledger.ts` | Commands run on the proposed projection, so it must equal what the commands wrote |
| Positions map root by root between stored and accepted | Plite | `plitejs/authored`, `tree/alignment.ts` | The framed selection law and each decision's change map through this alignment, which gives up on any document with a content root |
| No implicit write lands outside a dropped root | Plite | `plitejs` core, `core/command-frame.ts` | A caret the frame maps to no place must not fall back to the end of the document |

## Native behavior and proof

| Behavior | What changes | Proof surface |
| --- | --- | --- |
| Paste or replace over a selected card while suggesting | Records the card struck and the new content inserted, instead of refusing | jsdom package test, the clipboard `insertData` path included; browser unproven, because no registered example mounts a card under authored review |
| Backspace or Delete on a selected card while suggesting | Records the card struck | jsdom package test; browser unproven |
| Undo after accepting the deletion | Brings back the card, its area and the pending deletion | jsdom package test |
| A caret inside the area of a struck card | Typing, pasting and inserting write nothing, in Suggesting and Editing | jsdom package test; browser unproven |
| A selection after a framed replace or a decision in a document with a content root | Lands where the commands or the decision left it | jsdom package test under the framed selection law |
| The area of a struck card on screen | Renders unmarked inside the struck card's element, where a component styles it; a view of the area alone shows it unmarked | No first-party component mounts a content root, so nothing to prove on screen |

## Decision ledger

| Surface | Current | Target | Owner | Reason | Adoption | Proof | Risk | Verdict |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Suggesting deletes an owner | Refused unframed; recorded framed with the root left orphaned in the proposed view | Owner struck, its roots kept as stored and unmarked, in both paths | Recorder with core's judge | Roots are never pending, and the owner's claim already decides the root | Rewrite the refused-update cases that used this refusal as their fixture | Package tests in both schema modes, framed and unframed, under the framed law check | Editing must record and accept the same way | rearchitect |
| Suggesting deletes a root nobody owns | Refused | Refused | Recorder | No owner to strike, and striking the root's content was never built | None | Existing `authored-refusal.test.ts` case | None | keep |
| Orphan discovery in core | Reads every root on each commit, and reads `dirtyChildRoots`, which a seal can empty, so an open-schema retype through `changes.apply` leaves an orphan | Diffs the child-root maps of the roots a change touched, and reads nothing when none changed | Core judge | One discovery rule every caller can trust, at the cost of the edit | None outside core | Core package test, red at base, and the per-key read counts | A change to the set core drops in plain editors | rearchitect |
| Root whose owner a resolution removes | Kept | Dropped under core's rule, cascading, judged with every stored root present | Resolver | An accepted or proposed document must pass the schema | `projectAuthoredDocument` callers and the serializer get valid documents | Package tests | A projection with no schema keeps roots as today | rearchitect |
| Root whose owner a load or repair settles away | Kept, so an open schema keeps the orphan for good and a closed one refuses to load | Dropped by the same judge before validation | Admission | Load and live editing must agree on what a document holds | None outside authored | Package tests in both schema modes | None | rearchitect |
| Review projection of such a root | Keeps every stored root | Drops the same roots as the resolver, judged from the last answer and the owner changes of each sync | Review ledger | The framed law check and command frames read this projection | None outside authored | Package tests, an equality check against the resolver, and the per-key work test | Per-key cost in documents with content roots | gate |
| Decision that orphans a root | Keeps the root, `invalid` in a closed schema | Deletes the root in the decision's change | `decideOn` | One transaction removes what the decision removes | None | Package tests in both schema modes | Another author's pending edit inside the dropped root | rearchitect |
| Another author's pending insertion inside a root the decision drops | Blocks only when the whole change disappears | Also blocks when a root the decision drops holds any of its inserted text | `decideOn` | Text in a dropped root carries no claim the decision covers, unlike text under the decided deletion's own mark | None; a paragraph deletion over part of a change and a move's source keep today's rule | Package tests | Accepts that applied over part of a change now ask to decide it | rearchitect |
| Retype that unbinds an owner's root while suggesting | Format claims, so stored loses the owner | Strike the old block and insert the new one; refused when the struck and inserted blocks would both own one exclusive root, a descendant's included | Recorder | Core judges ownership from elements alone and cannot read a claim's before value, and an exclusive root takes one owner | None | Package tests, red at base under an open schema | Retype suggestions on cards read as a deletion and an insertion | rearchitect |
| Alignment between stored and accepted | Two whole-document diffs once any value has a root | Each root aligned on its own | Alignment | The framed selection law fails on a replace in any document with a content root (`replace-law-control-a2.log`) | In such documents, `decideOn`'s change, its undo, its selection mapping and the framed law check change; the ledger's runs align values without roots and stay as today | Package tests under the framed selection law | A mapping change in documents with content roots | rearchitect |
| Pending root lifecycle claim | None | None | None | The owner's own claim already decides the root, so a root claim would be a second truth | None | None | None | keep |

The review projection row stays `gate`: its count lines passed on a prototype (lines O1 to O3 and G of `perf/budget-frozen.md`), though that prototype's 20-card cohort put all 50 pending insertions in one paragraph, the panel's first round added lines O4 and O5 there for the final path, and its timing line T was inconclusive on a loaded host. Step 6 runs every count line on the final path and step 7 reruns T; a conclusive miss on either sends the design back to `architect`.

## Defaults

| Decision | Pick | Alternative | Word | Impact |
| --- | --- | --- | --- | --- |
| How a suggested deletion shows the block's content area | The area gets no marks and shows inside the crossed-out block, whose component styles it; shown alone, it looks unmarked | Mark every block in the area deleted too | strike area | big |
| What a review list says about the area | The list shows the block's deletion and doesn't mention the area that goes with it | The list also names the areas that accepting removes | name areas | small |
| Deleting a content area no block owns, while suggesting | Still refused | Mark the area's content deleted and keep the area | suggest area | small |
| Another author's pending edit inside an area an accept removes | Their pending text blocks the accept, even if that change also has text elsewhere; their pending deletions go with the area, as in a deleted paragraph | Any pending edit inside blocks the accept | hold all | small |
| Editing removes a block whose area holds another author's pending text | Their text goes with the area, as when Editing deletes a paragraph holding it | Keep the block until their text is decided | hold in editing | small |
| Editing removes a block someone else suggested deleting | It stays crossed out with its area, as a crossed-out paragraph does | Remove the block and its area | remove struck | small |
| Removing your own suggested block in a later edit | It stays crossed out with its area, because nothing shows who wrote the area's text (look) | Remove the block and its area | withdraw cards | small |
| Typing or pasting in the area of a block someone suggested deleting | Nothing happens until the deletion is decided (look) | The text lands after the struck block | land beside | small |
| A block turned into another kind while suggesting, when it loses its area | Recorded as the old block deleted and the new one added, so rejecting brings the area back | Recorded as a kind change | kind change | detail |
| Changing a block's kind while suggesting, when it loses an area but the new block still holds a single-owner area, its own or a nested block's or inline's | Refused, because two blocks can't share an area only one may own | Record a claim that moves one area to the new block | move area | detail |
| Design comparison before the build | Three independent designs and a judge | The lead's own comparison only | fast | detail |
| Review of this plan | A review panel checks the plan before the build, because I changed one of the judge's picks | Build from the judge's pick with no panel | skip panel | detail |
| Who writes the build's code | I write it, because Codex's current login can't run its model (look) | Codex writes it from my brief once it's logged in again | codex build | detail |
| Where the authored page lives | A new page at https://claude.ai/artifact/LzfdwnVufGpA4S1r9qnDmv, because the earlier ones at https://claude.ai/artifact/FnFuMm5oQ9jkR2VaY5CFYP and https://claude.ai/artifact/9cWhXkwmQrpyrwSVkbZkcM no longer open (look) | Drop the new page and go without one | drop page | detail |

## Open questions

### Codex login

Do you want to log Codex back in with your API key?

Why it needs you: It uses your API key, and I never use a credential for you.

- Codex now signs in with ChatGPT, which lacks the two review models.
- Until then I write the build and only Opus reviews it.

- **Log back in** (recommended): You run one command, and Codex reviews the code again. Cost: Those reviews bill your API key.
- **Leave it**: I build and review with Opus only. Cost: No second model family checks the code.

Why I pick it: Codex seats raised most of the earlier critical findings.

Attention: look

## Steps

The Build playbook executes these steps. Each package test runs with `pnpm --filter plitejs test:bun <file>` from the repository root, with `NODE_ENV=test PLITE_LAW_CHECK=1` for every authored file, so the framed law runs on each write, its selection check included. Each new test of a changed behavior fails at `b40cebebee`, the build's base, before its step's change, and the probe runs cited below, made at `51f3a53b6`, show the behavior each one asserts against. A guard test that pins what the base already does, such as the move and nested-insertion cases, passes at the base and after.

### Phase 1: one ownership judge in core

This phase is done when core drops the open-schema retype orphan and a plain key reads the same number of nodes at 20 and 1,000 cards. Keep when every existing authored, core and Yjs suite passes unchanged; revert the phase otherwise. No authored path changes in this phase.

- [x] 1. Core judge. Add `core/root-ownership.ts` with `ownerChanges` (the child-root map entries that differ, read from the ownership indexes of the roots a change touched, with no value read when none of those maps changed), `judgeOwnedRoots` (cascades into roots an orphaned root owns) and `orphanedRoots`. A root bound through an exclusive slot has at most one owner in a valid document and in each projection of it, so the judge counts its owners from the touched roots alone. Its count before the change is 1 when a binding the change removes held it, or when it had a stored owner and the last judgment kept it, and 0 otherwise; its count after adds the bindings `ownerChanges` adds and subtracts those it removes. A shared root in a closed schema, which validity does not bound, still sweeps every root's index once per pass into one map, and an open schema never orphans a shared root, so it never counts one. Under `PLITE_LAW_CHECK` the judge also runs the full sweep and throws when the two disagree, so every content-root suite checks the shortcut. Turn `getOrphanedElementOwnedRoots` into an adapter over it, so `dropOrphanedRootsOnce` stops reading every root on each commit (`perf/findings.md`, `panel-2/probes/plain-keys-a1.log`). Cache `hasContentRoots` per compiled schema, make `dropOrphanedRoots` one judgment, and add `ownershipBuilds`, `ownedRootsJudged` and `ownerIndexReads` to `core/work.ts`. Proof: a core test where a plain editor under an open schema retypes a card through `changes.apply` and keeps no orphan (base keeps `b1`, `probes/discovery-a1.log` and `probes/owner-removal-a1.log`), a nested card whose inner root goes with the outer card, and a shared root that goes with its last owner only in a closed schema; a key typed in a main paragraph of a plain editor counts the same `wholeReadNodes` and owner-index reads at 20 and 1,000 cards (base: 40 against 2,000 on every key, all read through `getOrphanedElementOwnedRoots`, and none when the schema declares no content root, `panel-2/probes/plain-keys-a1.log`); plus the existing content-root suites (`multi-root`, `raw-root-writes`, editor-schema and `yjs/multi-root-contract`) unchanged.

### Phase 2: Suggesting records an owner's deletion, and everything that settles claims drops its orphans

This phase is one change, because resolution, the command frame, the recorder and the review projection must agree on which roots exist, or the framed law fails between them. It is done when every removal, replacement, Backspace and paste over a selected card records a suggested deletion in both schema modes, framed and unframed, under the framed law with its selection check, the base's framed card removal (`probes/framed-a3.log`) included, and rejecting a suggested card paste answers `applied` with no orphan. Keep when phase 1's exit still holds and the existing authored suites pass; revert the phase otherwise, and phase 1 stands alone.

- [x] 2. Resolution, decisions and admission. Add the required `ownership` field to `AuthoredResolveSchema`, bound in `authoredResolveSchemaOf`, whose cache now keys on the compiled schema's identity, so a schema change gives a new resolve schema and the ledger sees it (`resolve-schema.ts:19`). `resolveAuthoredValue` drops what `orphanedRoots` answers, judged over the resolved value with every stored root present and each root whose resolved children differ from its stored children as a moved root, and omits `roots` when none is left; a null schema keeps today's output. The serializer capability (`authored.ts:1187`) gets an ownership-only resolve schema built from the compiled schema, with `content` and `complete` left as today. `decideOn` deletes the roots its resolution drops in the decision's change, and its `taken` rule also blocks when a root the decision drops holds non-empty inserted text of an undecided change that no deletion mark covers, even when that change has text elsewhere (`authored.ts:1134`). Text under a deletion mark, the decision's own, another pending deletion's or a move's struck source, keeps today's rule, as in a struck paragraph. Load and repair admission (`facts/admission.ts:269`, `admitTransactionDraft` in `core/public-state.ts`) run the judge between the document before the repair and the settled one, before validation, and put the deletions into the repair and its inverse. `DocumentAdmission.load` and `admitDocument` take the schema they judge under. The first publication's load passes the candidate schema (`core/plugin.ts:2359`), `adoptInitialDocumentChange` passes `publication.schemaCompilation().schema` (`create-editor.ts:240` and `:359`), and every other caller passes the installed one (`core/document-admission.ts:31` and `:66`). The Yjs controller lowers a remote repair's root deletions the way it lowers a local commit's. `handleCommit` keeps the repair's `deleteRoots`, and `lowerRemoteCommitRepairs` removes those roots from the roots map and drops their bindings instead of reconciling their children, and its early return counts them (`yjs/core/controller.ts:670`, `:779` and `:1031`). Proof: in a new `test/authored-root-deletion.test.ts`, rejecting a suggested card paste answers `applied` with `b2:copy` gone in both schema modes (base answers `invalid` and keeps an orphan, `probes/insert-decide-a3.log`); the accepted projection of a pending card paste passes `assertDocument`; `projectAuthoredDocument` without an editor keeps every root, as today; an export of a pending card paste through the serializer capability has no orphan, and an export of a document with no content root is byte-identical to the base's; an insertion by another author with text in `b1` and in main blocks the accept of the card's deletion (base applies it); accepting and rejecting a suggested move of a paragraph that holds another author's pending insertion both apply and keep that insertion pending, with the move case in `authored-tree-record.test.ts` unchanged; rejecting an insertion typed inside another author's pending insertion applies and keeps the outer insertion's text, in a document with no content root; loading, through `createEditor({ initialValue, plugins })`, a document whose card-insertion claim a verdict already rejects keeps no orphan in an open schema and loads in a closed one (base keeps the orphan or refuses); a transaction that brings a card, its root and the verdict that settles the card away keeps no orphan; a schema change that changes a root's ownership while a projection is cached reads the new ownership; in `test/yjs/multi-root-contract.spec.ts`, a peer that attaches to a Y.Doc holding a card claim, its root and a verdict that rejects the claim, with no root deletion, drops the root, and its roots equal its Y.Doc roots map and the other peer's (base keeps the orphan); the case fails with the `lowerRemoteCommitRepairs` branch removed and every other step 2 change kept.
- [x] 3. Recorder, command frame and alignment. Replace the refusal at `authored.ts:1655` with one judgment over the draft's `deleteRoots`, with each deleted root put back on the after side: in Suggesting, orphaned roots follow their owner and leave the recorded `deleteRoots`, owned ones pass through and fail validation as in a plain editor, and unowned ones stay refused. In Editing, orphaned roots follow their owner the same way, and named deletions pass through. So Editing keeps the root of a block whose deletion another author has pending, as it keeps that block, and the orphan pass after recording drops the root of a block it removes. Root creation and deletion steps never count as writes into a root, for the pending-deletion gate or for a veto. `AuthoredRecordInput.followed` skips a followed root's step entries in `tree/record.ts`. Withdrawing one's own pending owner removes it outright only when every node in the roots the change deletes passes the recorder's `withdrawn` test under its `isOwn`. A node with no insertion holds the withdrawal in every root, as accepted content inside one's own insertion does, because a root's content carries no marks and nothing tells the owner's text from text another author wrote there through Editing; otherwise the owner stays struck and its roots follow (`tree/record.ts:2044-2077`). So another author's change, or another incarnation under a forced change, holds the withdrawal as it holds one over an ordinary descendant. Under a forced change the test compares incarnations, otherwise authors, and a format or deletion claim alone never holds it. The command frame finalizes with `finalizeWithoutOrphanedRoots` and tracks the roots its own write created (`command-frame.ts:756`), and `commitRecordedDraft` drops orphans before `RECORDING_FRONTIERS.set`. For each element the draft changes in place, the recorder compares its schema-owned roots before and after. When a lost root is in the followed set, it records the old block struck and the new one inserted. When the struck subtree, as the strike leaves it, and the inserted one would together hold two owners of one exclusive root, counting every descendant, such as a nested card the new block keeps, it refuses as unrepresentable. A strike that withdraws one's own pending block leaves none of its owners behind. A lost shared root that another element still owns leaves the change a format claim. `acceptedChange` and `decidedContentChange` run their structural, character and diff chain on each root both sides hold, so one root that needs the diff leaves the others aligned, and compose the results with the other roots' creations and deletions, instead of returning null once a value has roots (`tree/alignment.ts:278` and `:481`). Proof: in `authored-root-deletion.test.ts`, both schema modes, with and without another pending suggestion so both paths run: `nodes.remove`, the `removeNodes`, `deleteFragment`, `delete` and `replaceSlice` commands, `slice.replace` over a block-selected card, `fragment.replace` over a range crossing the card and a rich clipboard paste through `insertData` each record a struck card that still owns `b1`, with no refusal and no plain-text fallback, and accept and reject as expected (base refuses unframed, `probes/owner-removal-a1.log`, and orphans `b1` framed, `probes/framed-a3.log`); a framed replace over a card, and over a paragraph beside a card, passes the framed selection law (base throws on both, `panel-1/probes/replace-law-control-a2.log`); after one decision that accepts a card's deletion together with a pending change in a second root that needs the diff, and after its undo, a caret in main maps to the same text; one update that pastes a card and then deletes it leaves no `b2:copy`, framed and unframed; `nodes.set` and `toggleBlock` that retype the card record strike plus insert and rejecting restores card and body (base records format claims, `probes/pre-pick-retype-a1.log`), a retype of a two-area card that keeps one area is refused, and so are a retype of an outer block that loses `b1` and keeps a nested card that owns `c1`, and a `toggleBlock` retype of a card whose own text holds an inline that owns an exclusive root, in both schema modes, and a retype that drops a shared root another card still owns stays a format claim; a retype of one's own pending card whose text holds an inline owner strikes the card and inserts the new block, which takes the inline and its root with the card's own text (`panel-diff-1/probes/own-retype-a2.log`); in Editing, the two-area retype and the nested-card retype apply as in a plain editor; withdrawing one's own pending card in a later update leaves it struck and keeps the text Editing wrote in its root, and over a shared root another card keeps it removes the card outright; a struck card whose root holds a block a veto keeps Suggesting out of records with no refusal; `tx.roots.delete` of an unowned root stays refused and of an owned root fails as in a plain editor; Editing removes the card and drops `b1` with another author's pending text in it (`probes/pre-pick-a1.log`), and leaves another author's pending deletion of the card in place with `b1`, as it leaves a struck paragraph; `refused-update-answer.test.ts` keeps its clipboard and `fragment.replace` cases as positive cases here and moves its Suggesting refusals to an `authoredVeto` fixture, which still proves that a refused rich paste does not fall back to plain text; `authored-refusal.test.ts` passes unchanged.
- [x] 4. Review projection. `Synced` gains `dropped`, judged over the projected value with every stored root present, from the last sync's `dropped` plus each root whose owners changed since, which covers the owner changes of each moved root, each root whose stored or projected ownership index changed, each created root and each stored root the update deleted, whose bindings it reads from the last sync's roots. The test for whether a root had an owner reads stored ownership, never the last projection. It is reused when there are none, taken from `back` on the history path, and judged in full on the first sync or when the resolve schema changes, so it always equals what `resolveAuthoredValue` drops for the same value. Each candidate is counted as step 1's judge counts it, from the touched roots alone for a root bound through an exclusive slot, and a root whose owner moves between an exclusive and a shared slot sends the sync to the full judgment. `changeOf`'s fast path leaves out a root both previews drop. `projectedValueOf` leaves dropped roots out, `mapOf` lists them in `deleteRoots` and removes them from `map.roots`, the frame's indexes and `locationMap` leave them out, and `changeOf` covers their lifecycle. The frame keeps every stored root's name reserved. Root naming in `remapContentSliceRoots` and the fragment insert (`core/public-state.ts:3423` and `:4314`) and `tx.roots.create` check names against the stored roots as well as the builder's, so a dropped root's name is never minted again. Proof: in `authored-root-deletion.test.ts`, the proposed preview of a struck card lacks `b1` and the accepted preview keeps it; rejecting the deletion brings `b1` back into the proposed preview; accepting drops card and `b1` in one decision, and undo restores both with the pending deletion; another author's insertion inside `b1` blocks the accept with that change and deciding both applies, while their pending deletion there goes with the area (`probes/parity-a1.log`, `probes/parity-delete-a1.log`); a nested card's root goes with the outer card in the preview too; with shared roots in a closed schema where main owns A, A owns B and B owns A, suggesting the removal of A's owner of B and then of main's owner of A, then rejecting the first, gives the same proposed document from a warmed ledger, a fresh ledger and `resolveAuthoredValue`, and again after undo, redo and a remote update that adds an owner of A; in a closed schema, with shared root `r` owned by a struck block in main and by a block inside card `c`'s exclusive root, Editing deleting `c` drops `r` from the proposed preview of a warmed ledger, a fresh ledger and `resolveAuthoredValue` alike; in an open schema, a suggested card that binds an unowned stored root `n` drops `n` from the accepted preview of all three; after a suggested deletion of a pasted card, pasting the same source again applies under `b1:copy:2` and leaves the struck card's root unchanged, and `tx.roots.create` with the dropped root's name refuses.
- [x] 5. Commands in a dropped root. `getDefaultInsertLocation`, in its fallback branch, refuses when the current selection is null because the frame mapped a stored selection in a root the projection drops to no place, so no write with an implicit target lands and none of the default-location fallbacks runs (`editor/insert-text.ts:99`, `transforms-text/insert-text.ts:224` and `:283`, `transforms-node/insert-nodes.ts:74`, `core/public-state.ts:3861` and `:4179`). `CommandProjectionMap.toProjected` and `toStored` answer null for a position in a dropped root instead of the position itself, and each caller handles null. `toFrame` maps to no selection, `effectChange` and `storedToWritten` refuse, and `locationMap` skips. Proof: with a caret in `b1` while the card's deletion is pending, `tx.text.insert`, the `insertText` command, a paste through `insertData`, `tx.nodes.insert` without `at`, an `insertFragment` and typing through a view on `b1` write nothing and leave `b1` and main unchanged, in Suggesting and Editing (the base analog lands typing beside struck content, `probes/placeless-a2.log`); an explicit `at` inside `b1` writes nothing either, and an effect at a stored location inside `b1` is refused; a framed insert with no stored selection still lands at the end of main, and so does one whose block selection is on a paragraph another author struck, in a schema with no content root; and a command in that frame that sets a selection in main and then inserts without `at` writes at that selection.

### Phase 3: prove the cost and the collaboration, then the docs

This phase is done when the work gate passes in `pnpm check`, line T is measured on the final path, the Yjs cases pass and the docs state the new law. Keep when step 6 passes; a conclusive miss on step 6 or step 7 sends the design back to `architect`.

- [x] 6. Work gate, the pre-acceptance probe carried into the build. Port lines O1 to O5 and the known-bad controls of `perf/budget-frozen.md` into `authored-tree-work.test.ts`: 8 keys from the first at the caret plus the proposed preview read, in a main paragraph with 0 and 50 pending insertions, the 50 spread five each over the same 10 paragraphs at both sizes, in a card body root, in a card's own text, and in a main paragraph while 10 card deletions are pending, loaded from a stored value with the cards already struck so both trees start from it, and after an undo and a redo, at 20 and 1,000 cards. Per key, `ownedRootsJudged` and `ownershipBuilds` are 0 and equal across sizes, `wholeReadNodes` and owner-index reads are equal across sizes, and each other core and ledger count over the base's grows no more at 1,000 cards than at 20; the known-bad arm, judging every root on each key, must fail with "ownership work grew with the document". Backspace over one selected card, one decision on a card's deletion and one export of the cohort with 10 pending card deletions, whose roots are exclusive, count the same judged roots and owner-index reads at both sizes; their known-bad arm judges every root on each operation, and it is also the known-bad arm for the owner-index half of O4. The ledger's first sync and a closed-schema removal of one owner of a shared root read at most 60 times as many owner indexes at 1,000 cards as at 20; their known-bad arm judges every root as a candidate and counts each over every root. Line G compares the stored values with the base's in every cohort, and the proposed previews with the base's in every cohort with no pending card deletion. In the cohorts with pending card deletions, where the base's preview keeps the struck cards' roots, it compares the ledger's proposed preview with `resolveAuthoredValue` over the same stored value and checks that each card is struck and its root is gone from the preview. Proof: `pnpm --filter plitejs test:bun test/authored-tree-work.test.ts` with `PLITE_LAW_CHECK=0`, and each known-bad arm's own failing run logged.
- [x] 7. Timing rerun of line T on the final path, the line the plan's probe left inconclusive. `node .agents/rules/benchmark/scripts/paired-timing.mjs` with `perf/timing-config.json` pointed at the built tree against a clean base worktree: candidate over base median per key at most 1.05 for `main-c1000-p0`, `main-c1000-p50` and `body-c1000-p0`, load limit 6, with the planted arm of about +15% and a same-code arm. A conclusive miss sends the design back to `architect`. An inconclusive run stays a gate. When the host stays loaded past the hour the Time budget allows, the run is offered as a suggested task, this box closes citing that task through an accepted row, and the Close says T is not yet measured on the final path. Line T passed on the fourth run, at 0.74 to 0.80 of the base in the three cohorts, with a planted arm of about +110% to +150% instead of +15%, because a +15% plant on a candidate this much faster than the base cannot fail the budget (`perf/timing-final-a4.log`).
- [x] 8. Collaboration. In `test/yjs/multi-root-contract.spec.ts`, peer A goes offline and types in `b1`, which A's own value then shows; peer B suggests and accepts the card's deletion; the peers reconnect, with the updates delivered in each order. Both converge with card and `b1` gone and no orphan, each peer's roots equal its Y.Doc roots map, and A's late text is lost as a plain editor loses an edit inside a deleted root. In an open schema, two peers that each remove one of a shared root's two owners at the same time both keep the root, and their Y.Doc roots match. Proof: the new cases in that file. The shared-root case found that, in any schema with content roots, a peer failed to apply its first remote edit after its own commit; the controller now resets the bridge mirror of each root it reconciles, and a case where two peers take turns typing covers it.
- [x] 9. Docs. State the law in `docs/vision/plite.md` beside the authored paragraph on content roots: an exclusive root lives as long as its owner, and a shared one goes with its last owner in a closed schema and stays in an open one; every projection, decision and load applies that rule to the roots it orphans, and a struck owner keeps its roots unmarked. Replace the limit line in [the refused-result plan](2026-10-16-transactions-refused-result.md)'s Open work, add a changeset for `plitejs` through the `changeset` skill, and fold this plan into the authored subject at the close. Proof: `node .agents/pstack/plan-page.mjs` on this plan and `pnpm lint:task` on the changed files. The law went into the authored subject's Rules at the fold, because the merge with `next` moved the authored law out of `docs/vision/plite.md`. The authored guide, the roots guide and the Plite authored page, with their Chinese pages, say how a proposed deletion treats a block's area, and the transactions subject's limit line is replaced.

## Start Gates

| Gate | Applies | Evidence |
| --- | --- | --- |
| Performance pack selected | yes | The review projection row adds work to every Suggesting key in documents with content roots, and the orphan check runs on every commit |
| User-facing operation and runtime owner identified | yes | A Suggesting key at the caret plus the proposed preview read, owned by `ModeProjection.sync` (`ledger.ts`) and core's per-transaction orphan check |
| Scale variables and cohorts fixed | yes | Cards 20 and 1,000, pending insertions 0 and 50, the 50 spread five each over 10 paragraphs, pending card deletions 0 and 10, loaded already struck, key site main paragraph, card body root or card text (`perf/budget-frozen.md`) |
| Budget frozen before target measurement | yes | `perf/budget-frozen.md`, written before the prototype ran, with lines O4 and O5 added after the plan panel and before any final-path result |
| Baseline and target probe selected | yes | A clean base worktree at `51f3a53b6` against prototype L (`perf/proto.patch`), probe `perf/keys.ts` |
| Correctness guard selected | yes | Line G, stored values equal to the base's, and proposed previews equal to the base's or, with pending card deletions, to `resolveAuthoredValue`, plus the package tests of steps 1 to 5 |
| Production detector decision recorded | no | Plite ships no runtime detector for per-key work; the deterministic work counters in `authored-tree-work.test.ts` own it |

## Completion Gates

| Gate | Applies | Required action | Evidence |
| --- | --- | --- | --- |
| Pre-acceptance scale proof | yes | Lines O1 to O3 and G on the prototype, with the known-bad control | `perf/judge-counts-a1.log` and `perf/judge-knownbad-a1.log` on the prototype, and lines O1 to O5 and G on the final path in step 6 |
| Warm latency budget | yes | Line T on the final path, step 7 | `perf/timing-final-a4.log` and `perf/counts-final-a1.log`, before the merge with next |
| Large/stress scaling | yes | Step 6 at 20 and 1,000 cards, keys and full passes | `build/work-gate-a1.log` |
| Cold and failure paths | yes | The ledger's first sync and an index build counted in step 6 | `build/work-gate-a1.log`, with the first sync and the export of a stored copy that no editor indexed |
| Payload and fan-out | no | No payload, query or subscription changes | skip: no payload, query or subscription changes |
| Production-path rerun | yes | Steps 6 and 7 on the built tree | `panel-diff-1/final/work-gate-a1.log`; `panel-diff-1/final/line-t-a1.log` |
| Correctness guard | yes | Steps 1 to 5 and the existing authored suites on the built tree | `panel-diff-1/final/root-deletion-a1.log`; `panel-diff-1/final/bun-lane-a1.log`; `panel-diff-1/final/yjs-a1.log` |
| Before/after receipt | yes | Base and final counts from step 6 and the timing log from step 7 | `perf/counts-base-a1.log`; `perf/counts-final-a1.log`; `perf/timing-final-a4.log`; `panel-diff-1/final/line-t-a1.log` |
| Detector and privacy | no | No runtime detector owns this path | skip: no runtime detector owns this path |
| Performance regression check | yes | `authored-tree-work.test.ts` in `pnpm check` | `panel-diff-1/final/bun-lane-a1.log` runs it |
| Blast radius before code | yes | `pstack:blast-radius` on the public change | `docs/plans/artifacts/2026-10-17-authored-root-deletion/blast-radius.md` |
| Slice review | no | `pstack:thermos` on each slice | skip: the `api-build` row owes a panel on the diff, which applies both lenses |
| Slice freeze | yes | `freeze.mjs` after each slice's fixes | `next` removed `freeze.mjs`; the diff panel ran on commit `d064da4b74` |
| Hard cut sweep | no | Callers, exports, tests and docs of a removed surface | skip: the plan removes no surface |
| Check steps the edits reach | yes | `pnpm check` typecheck steps for `plitejs` before the acceptance runs | `panel-diff-1/final/typecheck-a1.log` |
| Type-aware lint before the panel freeze | yes | `pnpm exec oxlint --type-aware --format=default` on the task's lintable files | `build/oxlint-merged-a2.log` |
| Writing passes | yes | `deslop`, then `no-comments` on code, and `unslop` on the docs, changeset and plan | the decision log's `writing` rows |
| Diff panel | yes | `/pstack:interrogate` on the build's diff, per the `api-build` row | `panel-diff-1/`, partial: three Opus seats |
| Public API repair | yes | `best-api repair` if a reusable call shape or its promise changed | the decision log's best-api repair row; the authored subject's Rules |
| Docs pages | yes | `plate-docs` on each public docs page the change affects | the decision log's docs row |
| Hand drive | yes | `hand-drive.mjs scope` on the plan's files, then `check` | `drive/hand-drive-check-a2.log` |
| Playtest | yes | `playtest.mjs scope` on the plan's files | `playtest/specs-a1.md`; its 16 failures fail the same way at `d064da4b74` and `next` |
| Changeset | yes | A `plitejs` changeset through `changeset` | `.changeset/authored-root-deletion.md` |
| Review ledger | yes | `review-ledger.mjs check` on this plan | `close/review-ledger-a2.log` |
| Last code-editing check | yes | `pnpm lint:task` on the task's files | `panel-diff-1/final/lint-a1.log` |

## High-risk gate

The change touches history, collaboration, selection and core transactions.

Three realistic failures:

1. Undo of an accepted card deletion brings the card back without its root, or with a root whose content is lost. Proof: step 4's undo case.
2. A peer's late edit inside `b1` resurrects the root after another peer accepted the deletion, or leaves an orphan on one peer. Proof: step 8.
3. Typing, pasting or inserting with the caret in a dropped root lands at the end of the main document through a default insert location. Proof: step 5.

The blast radius is in `docs/plans/artifacts/2026-10-17-authored-root-deletion/blast-radius.md`. `resolveAuthoredValue` feeds `decideOn`, `projectAuthoredValue`, `projectAuthoredDocument`, `projectAuthoredFragment` and `assertFramedLaw`; core's orphan discovery feeds every plain transaction and every Yjs import in a schema that declares content roots; the alignment feeds `decideOn`'s change and the framed law check in documents with a content root, while the ledger's runs align values without roots and stay as today; the `taken` change reaches only decisions that drop a content root. No first-party Plate plugin declares a content root, so Plate's docx, AI, migration and suggestion consumers read the same documents as today, and step 2 proves the export byte-identical for a document without one. The one fact the change relies on, that a resolution removing no owner returns today's value, is proven when the existing authored suites, the generated law suite included, pass unchanged on the built tree.

Rollback is a revert of the patch. Old code cannot accept a suggested card deletion recorded by new code under a closed schema; it answers `invalid` there and leaves an orphan under an open one, the same as its reject-insert bug today.

## Design comparison

`architect` ran three runners and an Opus cross-judge (`docs/plans/artifacts/2026-10-17-authored-root-deletion/architect/judge.md`). The judge picked cand-3, which places core's orphan drop in the command frame's finalize and before the recording frontier, and whose ledger path is the one the prototype measured flat.

| Candidate | Score | What decided it |
| --- | --- | --- |
| cand-3 (Opus), the pick | 20 | The only entry that makes a framed removal carry its root deletion, which probe 2 confirmed it needs |
| cand-2 (Astra) | 18 | Persistent owner counts the per-key probe shows are not needed; it records earlier body edits in the same update |
| Lead variant L | 18 | Every-root candidates in resolution, quadratic at 1,000 cards |
| cand-1 (Sol) | 16 | Closure in the recorder, which never sees the framed case |
| Keep the refusal, the control | 14 | Keeps the reported refusal and the reject-insert bug |

Grafts taken: the typing fallback and null maps (graft 1), now one refusal in the frame for every implicit-target write; strike plus insert for a retype that unbinds a root (graft 2, needed by probe 1b), detected from schema ownership as cand-1 does; load and repair admission with the schema on the serializer capability (graft 4, whole); the work gate (graft 5); and the restoration rule of cand-1 and cand-2, which judges with every stored root present so the ledger and the resolver agree. I changed one of the judge's grafts, and the panel attacked it as my own call. Graft 3 is cut to main's behavior, because probes 6 and 6b show that main blocks an accept only on another author's insertion inside removed content, and that Editing erases that insertion; the insertion rule now also blocks on another change's inserted text inside a root the decision drops, the part of the judge's ask this run needs.

Limits, each a case a losing candidate handles: body edits made earlier in the update that removes their owner follow the net diff, as a struck paragraph's do; `changes.apply` in a closed schema still throws in validation before the drop, so a Yjs import in which two peers each removed one owner of a shared root fails there; a Suggesting retype that loses one area while it keeps another exclusive one, or a nested block or an inline that owns one, is refused; a suggested move of a block that owns an exclusive root still fails validation with two owners, as at the base, and so do a retype and a move of the nested owner in one update; and on a peer-to-peer transport a peer can receive a repair's root deletion before the verdict behind it, which holds a closed schema's admission in its error state until the verdict arrives.

The plan panel's three rounds kept cand-3 and changed five things. The insertion rule blocks only on text in a dropped root that no deletion mark covers. Exclusive owners are counted from the touched roots alone. The frame keeps every stored root's name reserved. Load takes the schema. A Yjs repair carries its root deletions.

## Evidence

Model: Opus 5.5 (`claude-opus-5-5`). This review read the authored recorder, resolver, review ledger, decision, alignment and admission code and core's orphan-root, ownership-index and command-frame code at `51f3a53b6`, and the probes below ran at that commit.

### Requirements

- [ask] "Decide how a suggested deletion of the owner and its root is recorded and decided, then build it" (t_a7c71be6).
- [ask] The finding: "in Suggesting a paste, removal or fragment replace over that block cannot be suggested at all".
- [law] Named roots are never pending ([authored review](2026-10-08-authored-review.md), line 229).
- [law] An exclusive root goes with its owner, and a shared one goes with its last owner in a closed schema and stays in an open one (`getOrphanedElementOwnedRoots`, `packages/plitejs/src/core/editor-schema.ts:1342`; [raw root writes](2026-10-16-raw-root-writes.md)).
- [law] Commands decide on the proposed projection and the recorder lifts their result back (`docs/vision/plite.md:390`), so the proposed projection of what was recorded equals what the commands wrote (`assertFramedLaw`, `packages/plitejs/src/authored/authored.ts:416`).
- [law] An element-owned content root mounted by `Editable` paints its owner's decoration sources and follows its owner's authored mode (`docs/vision/plite.md:225`); the sources run on the root's own nodes, so the owner's deletion does not mark them.
- [law] `projectAuthoredDocument` returns one accepted or proposed document (`docs/vision/plite.md:401`).
- [law] A decision removes the decided claims and appends verdicts in one transaction (`docs/vision/plite.md:383`).
- [law] A key costs what its edit changed (`ReviewLedger` doc comment, `packages/plitejs/src/authored/ledger/ledger.ts:412`).

### Lanes

1. **A root follows its owner (picked).** The recorder strikes the owner and keeps its root untouched; resolution, load admission, the review projection, the command frame and decisions drop a root once no surviving element owns it, under core's orphan rule. One law covers the refused recording, the framed orphan and the mirror bug.
2. **Strike the root's content too.** Every block in the root gets a delete mark under the same change. It would show the body struck with today's suggestion UI, but it adds a claim per block, a rejected deletion must restore each one, and the proposed projection must still drop the then-empty root, so it needs lane 1's orphan rule anyway. The body already renders inside its struck owner's element, where a component can style it. Rejected.
3. **Keep refusing (the strongest deletion lane).** Keep the refusal and state the limit. No first-party Plate plugin declares a content root (`git grep -l contentRoots` over `packages/platejs/src` lists only the schema plumbing and test fixtures), so Plate users never hit it today. It still leaves the mirror bug and the framed orphan, which any app with a content root and authored reaches through an ordinary Suggesting paste, and it keeps a whole block kind unsuggestable. Rejected.
4. **A pending root lifecycle claim.** The 2026-10-08 plan cut it because an empty root has no node to mark, and the owner's own claim already says when the root goes. Rejected as a second truth.

### Probes

Each ran at `51f3a53b6` in `docs/plans/artifacts/2026-10-17-authored-root-deletion/`, on two hand-made schemas, one closed and one open, with a card that owns one paragraph root.

- In `probes/owner-removal-a1.log`, a plain editor and Editing remove the card and drop `b1`; Suggesting refuses both removal and replacement as unrepresentable.
- In `probes/insert-decide-a3.log`, a suggested card paste records a type and `childRoots` format on the empty paragraph and writes root `b2:copy` plain. Accepting works. Rejecting answers `invalid` under the closed schema, and under the open schema keeps `b2:copy` with no owner.
- In `probes/framed-a3.log`, with another suggestion pending, framed delete commands over a card record a struck card, and the frame write keeps `b1` with no deletion, so the proposed view keeps `b1` with no owner.
- In `probes/replace-law-a1.log` and `panel-1/probes/replace-law-control-a2.log`, a framed replace fails the framed selection law over a card and over a paragraph beside a card, and passes over a paragraph in a document with no content root, so the alignment's refusal of documents with roots is the cause.
- In `probes/pre-pick-a1.log` and `probes/pre-pick-retype-a1.log`, where Suggesting can remove a card today, a replace records strike plus insert and Backspace a strike, while a retype through `nodes.set` records format claims that leave stored without the owner. Editing erases another author's pending insertion with the block it removes.
- In `probes/parity-a1.log` and `probes/parity-delete-a1.log`, accepting a suggested block deletion over another author's pending insertion is blocked with that change, and over their pending deletion it applies.
- In `probes/discovery-a1.log`, under the open schema, `changes.apply` validation seals main's ownership index before the orphan drop, so `b1` survives with no owner; the child-root map diff names it.
- In `panel-2/probes/plain-keys-a1.log`, a key in a plain editor reads 40 nodes whole at 20 cards and 2,000 at 1,000 on every key, all through `getOrphanedElementOwnedRoots` from `dropOrphanedRootsOnce`, and reads none when the schema declares no content root.
- In `panel-3/probes/suggest-keys-a1.log`, a Suggesting key with the proposed preview read reads 41 nodes whole on the first key and 81 on each later one at 20 cards, and 2,001 and 4,001 at 1,000. All but one node per key come through `getOrphanedElementOwnedRoots`, called twice per later key from `finalizeWithoutOrphanedRoots`; the one is the edited block's structural change.
- In `probes/placeless-a2.log`, typing with the caret inside struck content lands at the end of the block before it, in both intents.
- In `perf/judge-counts-a1.log`, `perf/judge-knownbad-a1.log`, `perf/judge-counts-owner-a1.log` and `perf/timing-a1.log`, the prototype's per-key counts pass lines O1 to O3 and G, typing in a card's own text included, the known-bad control fails as planted, and T was inconclusive on a loaded host. The prototype covered the ledger only, so lines O4 and O5 and the core call sites wait for step 6.
- In `build/work-gate-a1.log`, on the final path at `ac27ee99f1`, the work gate passes lines O1 to O5 at 20 and 1,000 cards, and each known-bad arm fails it with its own message (`build/mutants-step6/` and `build/mutants-step6-reorder/`). Before that commit, an export and a decision judged every card's root, 20 roots at 20 cards and 1,000 at 1,000. In `build/line-g-o3-compare.txt`, from probe runs at `b40cebebee` and `89cde991d1`, every cohort's stored value equals the base's. Previews equal the base's where no card deletion is pending, and where one is they drop exactly the struck cards' roots. No core or ledger count's excess over the base grows with the document.

The probes did not cover peers editing a root while another accepts its owner's deletion, nested owners under the ledger's incremental path, or a pending format inside a dropped root. Steps 8 and 4 test the first two, and the third follows main's rule for removed content.

### Dependents

Every dependent scope of `authored` (ai, comments, documents, exports, html, layout, persistence, react, suggestions, ui) is unaffected. None of their files declares a content root, and the change only alters Suggesting over a block that owns one, decisions, loads and projections of such roots (`git grep -l contentRoots -- packages/platejs/src apps/www/src`, 2026-10-17).

### Prior work

- This plan retains [Suggestions complete](2026-10-12-suggestions-complete.md), the scope's head, and narrows one limit inside it.
- This plan retains [Accept all and Reject all](2026-10-17-suggestions-bulk-resolve.md), because both buttons call `update.decide`, which now drops an orphaned root in the same decision.
- This plan retains [card grouping](2026-10-17-card-grouping.md), because a struck owner is one pending change in one card and its kept root carries no marks, so no new change joins a card.
- [Authored review](2026-10-08-authored-review.md): "named roots are never pending" is retained. Its sentence that suggesting a root's deletion strikes its content was never built, since the code refuses; this plan keeps that refusal for a root nobody owns and replaces it for an owner's deletion.
- [Refused result](2026-10-16-transactions-refused-result.md): its Open work limit on this refusal is what this plan lifts.
- This plan retains [Unused review reads](2026-10-17-unused-review-reads.md), because it removed `read.authored.preview` and two change filters this plan never reads, and the merge with `next` keeps that removal.
- This plan retains [One card for lines suggested one at a time](2026-10-17-card-own-split.md), because a struck owner is one change and its kept root carries no marks, so the card fold sees nothing new.

## Close

Reversals and deviations come first.

- The diff panel reversed the withdrawal of one's own pending card. The build removed the card and its root when the root held only unmarked content, which could delete text another author wrote there through Editing, because a root's content carries no marks. Unmarked content now holds the withdrawal, so removing one's own pending card in a later update strikes it (the Defaults row "withdraw cards").
- The panel also found that Editing threw when it removed a card another author had suggested deleting. Editing now leaves that card struck with its root, as it leaves a struck paragraph (the Defaults row "remove struck").
- Step 9 put the law in `docs/vision/plite.md`. The merge with `origin/next` at `4e332b497c` moved the authored law out of that file into the authored subject, so the law went into the subject's Rules, and `docs/vision/plite.md` stays as `next` has it.
- Step 7's planted arm spins about +110% to +150% instead of +15%, because the candidate runs at about 0.77 of the base, and a +15% plant on it cannot cross the 1.05 budget.
- This run did not measure line T on the final bytes. On the final bytes against `next`, each cohort's candidate ran at 0.74 to 0.78 of `next` and each planted arm failed past the same-code noise, but the host's one-minute load reached 9.1 against a limit of 6 (`panel-diff-1/final/line-t-a1.log`). The merged bytes hit the same limit at 15.6 (`perf/timing-merged-a1.log`). The pass that counts is the fourth run before the merge (`perf/timing-final-a4.log`). The rerun is a backlog line, not a session card, because this close already offered three cards.
- The comment pass fixed one finding in scope, F13, by building the before index in `droppedRoots`' `sidesOf` before the rebase. The larger API change, `rebaseElementOwnedRootIndex` taking the before index, is a backlog line.
- The step 5 refusal also covers direct writes inside a dropped root, such as `tx.text.insert` and `tx.nodes.insert`, which the plan's frame mechanism did not reach.
- Six base-green tests were cut, because their cases never reach the recorder once validation refuses the owned-root delete, and one Editing delete of an unowned root replaces them. The panel round cut the cycle test, because core never deletes roots that own each other.
- The Yjs attach case lives in `test/yjs/authored-admission-contract.spec.ts`, not `multi-root-contract.spec.ts`, beside the admitting-peer helpers it needs.
- Delivery changed mid-run from leaving changes on `next` to `land.mjs`, which pushes one commit to `next`.

What landed. In Suggesting, a removal, a replacement, a Backspace and a paste over a block that owns an exclusive content root now strike the block and keep its roots unmarked and unchanged. Accepting the deletion removes the block and its roots in one decision, rejecting keeps both, and undo after the accept brings back the block, its roots and the pending deletion. Rejecting a suggested card insertion removes the card's root, which used to answer `invalid` in a closed schema and leave an orphan in an open one. Editing leaves another author's pending deletion of a card in place with its root. Core has one ownership judge, `core/root-ownership.ts`, that counts an exclusive root's owners from the roots a change touched, so a key in a plain editor no longer reads every root, and an open-schema retype through `changes.apply` no longer keeps an orphan. Resolution, `decideOn`, load and repair admission and the review ledger drop the same roots. A write whose implicit target lies in a dropped root writes nothing. A Suggesting retype that unbinds a root records the old block struck and the new one inserted. The Yjs controller resets the bridge mirror of each root it reconciles, which fixes a peer that failed its first remote edit after its own commit in any schema with content roots.

Proof, by the rows that record it:

- Steps 1 to 5. Each new test fails at `b40cebebee` for the defect it names, and 13 mutants of steps 2 to 5 and 7 of step 2 each fail the test they name (rows of 23:34 and 23:55).
- Step 6. `authored-tree-work.test.ts` passed 31 of 31 on the final path before the merge (`build/work-gate-a1.log`). Per key, judged roots and ownership builds are 0, and whole reads and owner-index reads are equal at 20 and 1,000 cards in every cohort outside undo and redo. Each known-bad arm fails with its own message. Line G holds in all 8 cohorts.
- Step 8. The offline typist and the suggesting decider converge with the card and `b1` gone in both delivery orders, two peers removing both owners of a shared root at once keep it in an open schema, and two peers taking turns typing pass.
- The panel fixes. Each has a test that fails at `d064da4b74`, 9 in all (`panel-diff-1/probes/tests-before-a2-a1.log`).
- The final bytes. The root deletion file passes 95 of 95 under the framed law check, the work gate 33 of 33, the Yjs files 15 of 15, and the plitejs typecheck and `lint:task` pass. The Bun lane passes 4,013 tests and fails 5, the "rejecting a pending property change after Enter" record cases, which fail the same way at `next` (`panel-diff-1/final/`, `build/next-record-a1-a1.log`).
- The hand drive. The 11 pages the changed files route to render at desktop width with no runtime error, the docs pages show the new sentences, typing in a synced block updates its other copy, and typing in one Yjs peer reaches the other (`drive/hand-drive-check-a2.log`).
- The playtest. The www suggestion specs pass 107 in Chromium, 106 in Firefox and 105 in WebKit, and the Plite suggestion specs pass 39 of 39 in Chromium. The 16 failures, 5 in Chromium and Firefox and 6 in WebKit, fail the same way at `d064da4b74` and at `next` (`playtest/specs-a1.md`).

Where the proof stops:

- No registered example mounts a card under authored review, so paste, Backspace and typing in a struck card's area are proven in jsdom only.
- This run did not measure line T on the final bytes, as the deviations say.
- The diff panel ran three Opus seats, because Codex is signed in with a ChatGPT account. The core judge's exclusive counting and the reserved names, both picked in same-family rounds, wait for a reviewer of another family.
- The 16 failing runs prove nothing about this change either way, because they fail at `next` too. The three suggestion-page cases throw a malformed review mark after a decision that merges cards, which backlog line `t_1b08869a` covers. WebKit's playground image case times out on a click, which `t_095b0272` covers. The two authored-review cases never show a ready editor, which a new backlog line covers.

Rules moved during the run. `next` removed `mutate.mjs`, `decisions-check.mjs`, `freeze.mjs`, the close and title rules and the suggested-task ledger, and moved delivery to `land.mjs`. This run appended decision rows by hand, kept the slice freeze as a frozen commit, and lands through `land.mjs`.

Review inputs: the verdict and the build read `VISION.md`, `docs/vision/common.md`, `docs/vision/plite.md`, `docs/plans/2026-10-08-authored-review.md`, `docs/plans/2026-10-16-raw-root-writes.md`, `docs/plans/2026-10-16-transactions-refused-result.md`, `packages/plitejs/src/authored/authored.ts`, `packages/plitejs/src/authored/tree/record.ts`, `packages/plitejs/src/authored/tree/resolve.ts`, `packages/plitejs/src/authored/tree/alignment.ts`, `packages/plitejs/src/authored/resolve-schema.ts`, `packages/plitejs/src/authored/format.ts`, `packages/plitejs/src/authored/facts/admission.ts`, `packages/plitejs/src/authored/ledger/ledger.ts`, `packages/plitejs/src/core/editor-schema.ts`, `packages/plitejs/src/core/element-owned-root-index.ts`, `packages/plitejs/src/core/public-state.ts`, `packages/plitejs/src/core/command-frame.ts`, `packages/plitejs/src/core/document-recorder.ts`, `packages/plitejs/src/core/document-admission.ts`, `packages/plitejs/src/core/plugin.ts`, `packages/plitejs/src/authored/ledger/runs.ts`, `packages/plitejs/src/editor/insert-text.ts`, `packages/plitejs/src/react/components/editable-text-blocks.tsx`, `packages/plitejs/src/yjs/core/controller.ts`, `packages/plitejs/test/authored-refusal.test.ts`, `packages/plitejs/test/refused-update-answer.test.ts`, `packages/plitejs/test/authored-tree-work.test.ts`, `packages/plitejs/test/authored-tree-record.test.ts` and `packages/plitejs/test/yjs/multi-root-contract.spec.ts`.

Open work, below, lists the follow-ups with their owners and stops.

## Open work

- Suggesting a move of a block that owns an exclusive content root fails validation, which reports two owners of its root. owner: the owner, through session card `task_04df43cd`. stop: that session lands or is dropped.
- Removing one's own pending card in a later update strikes it instead of removing it, because a root's content carries no marks that say who wrote it. owner: the owner, through session card `task_78ec84d8`. stop: that session lands or is dropped.
- Three ownership judges infer the owners of roots a change did not touch, and the projected judge falls back to a full judgment when an owner moves between an exclusive and a shared slot. owner: the owner, through session card `task_97fe3a33`. stop: that session lands or is dropped.
- Line T was not measured on the final bytes, because the host stayed loaded past its limit. owner: the owner, through a line in `docs/plans/backlog.md`. stop: that line is taken or deleted.
- The diff panel had only Opus seats, because Codex is signed in with a ChatGPT account that lacks the review models. owner: the owner, through this plan's Codex login question. stop: a Codex seat reviews the diff, or the owner drops it.
- A Yjs import in a closed schema, in which two peers each removed one owner of a shared root, fails validation before the orphan drop, and the 8-key work gate leaves work that grows with a long session's key count ungated. owner: the owner, through two lines in `docs/plans/backlog.md`. stop: each line is taken or deleted.
