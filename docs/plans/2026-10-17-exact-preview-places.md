---
review_scopes: [suggestions, authored]
review_basis: [2026-10-12-suggestions-complete]
work_kind: implementation
review_commit: 51f3a53b665263bd0b0ae81b99978f542eede86f
review_inputs: [packages/plitejs/src/authored/authored.ts, packages/plitejs/src/authored/types.ts, packages/plitejs/src/authored/tree/resolve.ts, packages/plitejs/src/authored/resolve-schema.ts, packages/plitejs/src/authored/ledger/runs.ts, packages/plitejs/src/authored/ledger/projection.ts, packages/plitejs/src/authored/ledger/book.ts, packages/plitejs/src/authored/ledger/ledger.ts, packages/platejs/src/react/features/suggestion/useSuggestion.ts, apps/www/src/registry/components/editor/discussion.tsx, apps/www/src/registry/components/editor/discussion.spec.tsx, packages/plitejs/test/authored-plugin.test.ts, packages/plitejs/test/react/decoration-manager-contract.test.ts]
---

# Review reads map a preview's places exactly

Status: superseded by `docs/plans/2026-10-17-preview-review-origins.md`, because its plan review proved that a written run does not reproduce a fresh resolve on a reordered run
Playbook: plan

**Pursue, with a new design. Plite reads a view's places from the resolver's record of where each preview block came from, and the Plate hooks and the copied discussion pass the block key they hold.** Under a preview, `read.groups({ at })` and `read.changes({ at })` read `at` as a place of the stored document, so `useSuggestionGroups`, the discussion's target panel and its thread counts each turn a view key into its view index and read the stored block at that index. A pending block insertion above a paragraph shifts every block below it. Under the Accepted preview, `alpha` shows the inserted paragraph's card and `beta` shows alpha's (`docs/plans/artifacts/2026-10-17-preview-review-places/probe/base-index-map-a1.log`). This plan replaces `docs/plans/2026-10-17-preview-review-places.md`, whose plan review proved that mapping back through the projection's alignment gives a reordered block another block's card and misses a change hidden at a block's edge (`docs/plans/artifacts/2026-10-17-preview-review-places/panel/plan-r1/probe-reorder-a1.log`, `docs/plans/artifacts/2026-10-17-preview-review-places/panel/plan-r1/probe-point-edge-a2.log`). Suggested task t_6e339e60 asked the question, from flag F5 of the comment review (`docs/plans/artifacts/2026-10-13-review-tree-pivot/paged/no-comments-s7/reply.md`), and this continues the open Pursue `2026-10-12-suggestions-complete`.

## Brief

### What will change?

In the Accepted and Proposed previews, each paragraph shows exactly its own review cards, even when the preview hides, merges, splits, reorders or pulls paragraphs out of a quote. Badges update when a hidden suggestion or a decision changes them.

### What could go wrong?

An app that asks a preview for cards with a saved-document position now gets the preview's cards at that position. A paragraph the preview hides shows its cards nowhere until you switch back to Editing.

## Teach

A preview shows the document as if every suggestion were accepted, or every one rejected. It can hide paragraphs, merge two into one, pull paragraphs out of a quote, and move a paragraph that follows a merge.

The review sidebar asks which cards sit on a paragraph by the paragraph's position in the preview, and the editor answers from the saved document at that position. When the preview hides a paragraph above, every position below points at the wrong saved paragraph. The first plan mapped positions back with the map cursors use, but that map keeps saved order, so a moved paragraph gets its neighbour's card.

The code that builds the preview already knows which saved paragraph and text each preview paragraph came from. After this change it records that when a review read asks, and the sidebar asks with the paragraph it shows.

## Public API

The copied discussion's target panel reads the cards of the block it targets by that block's key, instead of the block's index.

```ts before
// apps/www/src/registry/components/editor/discussion.tsx
const targetGroups = useEditorSelector(
  (current) => {
    // Under a preview, the stored block at the same index holds the cards.
    const index =
      suggestions && targetKey
        ? current.read.nodes.path(targetKey)?.[0]
        : undefined;

    return index === undefined
      ? NO_GROUPS
      : current.plugin(AuthoredPlugin).read.groups({ at: [index] });
  },
  { equalityFn: sameGroups }
);
```

```ts after
// apps/www/src/registry/components/editor/discussion.tsx
const targetGroups = useEditorSelector(
  (current) =>
    suggestions && targetKey
      ? current.plugin(AuthoredPlugin).read.groups({ at: targetKey })
      : NO_GROUPS,
  { equalityFn: sameGroups }
);
```

The Plate hook reads the cards of the block key it renders, so it no longer turns that key into an index.

```ts before
// packages/platejs/src/react/features/suggestion/useSuggestion.ts
return useAuthoredRead(
  () => {
    const index = editor.read.nodes.path(blockKey)?.[0];

    return index === undefined
      ? NO_GROUPS
      : editor.plugin(AuthoredPlugin).read.groups({ at: [index] });
  },
  { equal: sameGroups, when }
);
```

```ts after
// packages/platejs/src/react/features/suggestion/useSuggestion.ts
return useAuthoredRead(
  () => editor.plugin(AuthoredPlugin).read.groups({ at: blockKey }),
  { equal: sameGroups, when }
);
```

The copied discussion counts a block's threads by the block's key, and its block wrapper loses the index prop.

```ts before
// apps/www/src/registry/components/editor/discussion.tsx
<SuggestionDiscussionBlock blockIndex={path[0] ?? 0} blockKey={blockKey}>
  {children}
</SuggestionDiscussionBlock>

const page = read.changes({ at: [blockIndex], cursor, limit: 200 });
```

```ts after
// apps/www/src/registry/components/editor/discussion.tsx
<SuggestionDiscussionBlock blockKey={blockKey}>{children}</SuggestionDiscussionBlock>

const page = read.changes({ at: blockKey, cursor, limit: 200 });
```

## What other editors do

Read on 2026-10-17 from local checkouts (BlockNote `1e26f1c`, prosemirror-suggest-changes `653fba7`, manuscripts track-changes `62f4d19`, CKEditor 5 `14e73cc31b`, ONLYOFFICE `72b0421`, EigenPal DOCX editor `84c4622`) and vendor docs for Google Docs, Word and CKEditor 5's commercial track changes; none was run (`docs/plans/artifacts/2026-10-17-preview-review-places/research/answer.md`). Google Docs, Word's Original view and CKEditor 5's final-content preview hide review cards in a clean preview, and Google Docs requires inline indexes for any write. EigenPal keeps its review queue in both previews and places each card by the stored paragraph ids its layout keeps, a merged fragment indexing every paragraph it shows; content the preview drops gets no anchor. No editor documents a map from a preview position back to its stored suggestions.

| Editor | Preview modes | Cards in a preview | A preview place to its stored suggestions | Block identity across a preview | Source |
| --- | --- | --- | --- | --- | --- |
| Google Docs | Suggestions accepted, suggestions rejected | Hidden; the clean previews show no comments or suggestions | None documented; writes need inline indexes | Not documented | [Suggestions API guide](https://developers.google.com/workspace/docs/api/how-tos/suggestions), [SuggestionsViewMode](https://developers.google.com/workspace/docs/api/reference/rest/v1/documents#SuggestionsViewMode) |
| Microsoft Word | No Markup, Original | Original hides tracked changes and comments | Not documented | Not documented | [Track changes in Word](https://support.microsoft.com/en-gb/word/training/track-changes-in-word) |
| CKEditor 5 (commercial, docs only) | Final content in a modal; accepted or discarded data | Not documented; the modal shows content only | None; a temporary editor serializes the result | No shared model objects | [Preview final content](https://ckeditor.com/docs/ckeditor5/latest/features/collaboration/track-changes/track-changes-preview.html) |
| EigenPal DOCX editor `84c4622` | Proposed result, original | Kept; the review queue reads the stored tree in both modes | Stored paragraph ids and offsets that layout fragments keep; a merged fragment indexes every paragraph it shows | Yes, by stored paragraph id; dropped content gets no anchor | `eigenpal/docx-editor@84c4622:packages/core/src/store/store/review-reads.ts`; `packages/pro/src/review/review-model.ts` |
| BlockNote `1e26f1c` | Viewing suggestions, base document; no accept-all preview | Suggestion marks stay in viewing mode | Mark ranges and CRDT ids | Raw block ids kept, sometimes duplicated | `TypeCellOS/BlockNote@1e26f1c:packages/core/src/y/extensions/Suggestions.ts` |
| prosemirror-suggest-changes `653fba7` | None built in; `applySuggestionsToNode` returns the accepted document | No sidebar | None returned | No block ids | `handlewithcarecollective/prosemirror-suggest-changes@653fba7:src/commands.ts` |

## Layer and owner

| Change | Layer (Plite or Plate) | Package | Why |
| --- | --- | --- | --- |
| The resolver records, on request, which stored node each preview node shows and where hidden content sits | Plite | `plitejs/authored` (`tree/resolve.ts`, `resolve-schema.ts`) | Only the resolver knows where its output came from |
| A preview's review place reads map the view's place to the stored content it shows | Plite | `plitejs/authored` (`authored.ts`, `ledger/places.ts`) | The ledger owns the mode projection and its runs |
| `subscribeChanges` names the view blocks whose cards changed | Plite | `plitejs/authored` (`ledger/book.ts`, `authored.ts`) | The same owner as the reads, so a badge wakes for exactly what its read can show |
| `useSuggestionGroups` reads by the block key it renders, and `useSuggestionChanges` also wakes on the review delta | Plate | `platejs/suggestion/react` | Plate glue passes the place it holds and maps nothing |
| The discussion's target panel, thread counts and popover anchor use the block key | Plate | `apps/www` registry, `discussion` | Copied UI passes the place it holds and maps nothing |

## Hard cuts and app migration

- `at` on a preview view no longer names a place of the stored document. A key resolves only in the view, and a path, point or range is a place of the preview. The owner editor reads its own preview the same way, and no option reads stored places from a preview. An app that read a preview with a stored place, such as a record's `ranges`, reads through an intent view instead.
- In this repository, five places pass `at` to a preview read. `useSuggestionGroups`, `useSuggestionChanges`, the discussion's `targetGroups` and `blockThreadCount` already hold a view place, so they only drop their index mapping. `packages/plitejs/test/react/decoration-manager-contract.test.ts` reads a view range on an Accepted preview and paints the returned stored ranges into the view, which this change makes wrong; it asserts the hidden insertion's id instead and stops painting stored ranges on a preview.
- A page cursor from a read with `at` works only on a view with the same root and preview mode. A cursor from a read without `at` keeps working on any view.
- `SuggestionDiscussionBlock` in the copied discussion loses its `blockIndex` prop, and `blockThreadCount` takes the block key. An app with a copied `discussion.tsx` re-copies it or makes the edits in the Public API pairs above.
- Records keep their shape. `AuthoredChange.ranges` and the location fields of `details` stay places of the stored document, and their JSDoc now says so.

## Defaults

| Decision | Pick | Alternative | Word | Impact |
| --- | --- | --- | --- | --- |
| Who works out a preview paragraph's cards | The editor, for every way of naming a place (look) | The sidebar keeps guessing by position; previews copy saved keys onto the paragraphs they change | "hooks keep it", "carry keys" | big |
| Cards in a preview | Each paragraph shows the cards of the saved content it shows (look) | No cards while a preview shows | "no preview cards" | big |
| Asking a preview for cards with a saved-document position | No longer works, and nothing turns it back on (look) | Keep a switch for saved-document positions | "keep switch" | big |
| How the editor knows where a preview paragraph came from | The code that builds the preview writes it down when a review read asks, once per changed stretch (look) | Update that record as you type, so two pieces of code must agree on it | "update in place" | small |
| A paragraph that two saved paragraphs merge into | Shows both paragraphs' cards, and the card of a paragraph removed between them (look) | Leave out the removed paragraph's card | "skip removed middle" | small |
| Paragraphs pulled out of a quote | Each shows the quote's card and its own cards, never a sibling's (safe) | Only the first shows the quote's card | "quote card once" | small |
| A paragraph inside a quote | Shows its own cards, not the quote's own change, as in Editing (safe) | Also shows the quote's change | "show quote change" | detail |
| The empty paragraph a preview shows when a suggestion deletes the only one | Shows the deleted paragraph's card (look) | Shows no card | "empty filler" | small |
| A paragraph the preview hides | Its cards show on no paragraph; switch to Editing to see and decide them (look) | Show them on the next paragraph | "next paragraph" | small |
| A stretch whose rebuilt record does not match what the preview shows | Every paragraph in that stretch shows all the stretch's cards, the editor counts it, and tests fail on it (look) | Show no cards there | "no cards on mismatch" | detail |
| The copied discussion's per-block index | Removed; it reads by block key (safe) | Keep the index prop beside the key | "keep index" | detail |
| A paging cursor from one view used on another | Refused as stale when its read named a place and the other view shows a different root or preview (safe) | Keep accepting it | "share cursors" | detail |
| Where a suggestion's popover sits in a preview | On the paragraph you opened it from (safe) | Leave it where the saved range lands | "keep popover" | detail |
| Cursors and highlights on paragraphs a preview moves | Left for their own task; they can still drift there (look) | Fix them in this change | "fix carets" | small |
| Work a preview nobody has open still does on each edit | Left for its own task; this change adds none (look) | Stop it here, which changes code that every edit runs | "fix idle preview" | detail |
| One wake listener per badge | Kept, since badges wake no more often than today (safe) | Share one listener per editor | "share listener" | detail |
| Proof of badges in a preview | The discussion spec renders them, because no demo page offers a preview with badges (look) | Add a preview switch to the suggestion demo | "add preview demo" | small |
| Page record | This page carries out the open suggestions plan instead of starting a new review | Write a new review that replaces it | "new review" | detail |
| The suggestions page link | A new page, https://claude.ai/artifact/STvVRPYvHguHpREtcLFV9F, because https://claude.ai/artifact/NKfmSN3HXP15YCC757xRc5 no longer opens for this account (safe) | Drop the new page and restore the old link | "drop new page" | detail |

## Design

The design came from a second `architect` bakeoff of three runners and a blinded cross-judge, run on the plan review's findings (`docs/plans/artifacts/2026-10-17-preview-review-places/architect-2/design.md`). All three runners dropped the alignment and built on the resolver's own `origins` map. The judge picked the design that keeps one read rule on every view, 30 against 26 and 26, with the other runners' simpler producer and law test grafted in.

**Mode.** One private `previewModeOf(editor)` in `packages/plitejs/src/authored/authored.ts` returns the receiving editor's preview mode by `readView`'s rule, so the owner and every view that inherits its preview read the preview, and `storedRead` is the only escape. `readView`, `placeIds` and the delta publisher all call it.

**Record.** `resolveAuthoredChildren` takes a `trace` option that also returns the existing `origins` map, the stored leaves and offsets of each merged output leaf, from both the plain merge and the schema path's merge, and each node completion built with the required occupant it replaces. `packages/plitejs/src/authored/resolve-schema.ts` stops dropping completion's `sources`. A new `packages/plitejs/src/authored/ledger/places.ts` builds a `RunPlaces` per `Run` on first use, cached by the immutable `Run`, by running the traced resolve over the run's own input and checking the output against `run.output`. Written runs take the same path. A mismatch throws under the framed-law check, and otherwise makes the run opaque and counted. For each output top block the record lists the marked stored nodes it images, the stored wrappers or lines dissolved into it, the hidden subtrees attached at its gaps by identity and sibling order, and the vacated occupant a completion-built block replaces.

**Read path.** With no preview mode, `placeIds` keeps today's code, except that a key resolves in the receiving editor's own document. Under a preview, the place resolves in the view, and a key the view lacks reads nothing. Each view top block it reaches maps through the mode's slot tree to its slot. An identity slot reads the stored block at the same relative place. A run slot reads its record and keeps each occurrence of the run's stored blocks whose node the place shows. A node reads its images, its dissolved ancestors and the hidden content attached inside it, never an imaged ancestor's own change. A point or range reads the images it touches, closed, and the inline gaps at either side of it, so a point at a block's start or end finds a change hidden there. A range also reads the seams between blocks it crosses. The page cursor's fingerprint adds the view's root and mode only when `at` is set.

**Delta path.** The book collects each changed stored range that held a pending occurrence, with the removed slots' occurrences captured before they detach, and skips a detached slot at publication. The intent publisher keeps today's rule on live slots. A preview publisher holds a watch on its mode while it has listeners. It maps the captured old occurrences through the record of the run that held them at the last publication, kept in a window of replaced runs, and the new ones through the current runs, then names each view block whose span the projection kept. A block the projection rewrote rereads on render. With no watch, the mode does no new work.

**Cases.**

| Case | View block | Its key or path reads |
| --- | --- | --- |
| Unchanged | the stored object and key | nothing |
| Shown unchanged with a hidden change inside, as when Accepted hides a new proposal | the old object and key | the hidden change's card |
| Rewritten | preview key | the stored block's cards, hidden content inside it included |
| Merged (Proposed join, Accepted split) | one block | both stored blocks' cards and the join or split, plus a block wholly removed between them, whoever made its card |
| Lifted (Proposed unwrap, Accepted wrap) | one block per child | its own child's changes and the wrapper's change, never a sibling's |
| Moved | one block, at the source under Accepted and the target under Proposed | the move and the moved block's own changes |
| Nested, such as a paragraph in a kept quote | same as a top-level block | its own changes, never the quote's own change |
| Reordered, as a split following a join into a quote | one block per stored block, in the resolver's order | its own stored block's changes, with equal or distinct text |
| Schema completion | fresh key | a deleted only-block's card, by node and by a point in it |
| Dropped (Proposed deletion, Accepted insertion) | none | shows in no block; a range across the drop site finds it |

Each row holds on a document loaded with pending changes and on one built by commands.

**Cost.** A warm read costs the slot search plus the occurrences of the stored blocks the place reaches, the same bound as an intent read today. The first read or watched publication that reaches a changed run pays one traced resolve of that run. A write to a marked run under a watched preview pays it once per commit, the same order as the `writtenRun` walk that commit already pays. A mode no view watches does no new work. Step 5 counts each.

**Limits.** Carets, anchors and command frames stay on today's alignment, so they can still drift on a block a preview moves. `ledger.carry` still advances a mode a reader once indexed, on every owner commit. Both are Open work.

**Three realistic failures.** First, an app reads a preview with a record's stored range and gets the preview's cards there. The docs and the `ranges` JSDoc name the receiving document, and the decoration test shows the right use. Second, typing in a large pending unwrap under a watched preview rebuilds that run's record on every key. Step 5's long-run arm bounds it against the walk that typing already pays. Third, the record of a run built after its facts moved reads what the run did not show. The removed-block and decision wake tests catch it, and the fallback builds a watched run's record when its sync replaces it.

## Decision ledger

| Surface | Current | Target | Owner | Reason | Adoption | Proof | Risk | Verdict |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Review place reads on a preview | `at` read as a stored place; a key resolves under `storedRead` | `at` names a place of the view's document, read through the resolver's record | `plitejs/authored` (`placeIds`, `ledger/places.ts`) | The resolver is the only record of where a preview block came from; Boundary Law | Five in-repo callers; three docs pages and the Vision paragraph | Steps 1 and 2 | An app passing a stored place to a preview read | rearchitect |
| The resolver's trace | `origins` kept inside one resolve and dropped | Returned on request, with merged text parts and completion's replaced occupant | `plitejs/authored` (`tree/resolve.ts`, `resolve-schema.ts`) | Identity, not text, decides where a card belongs | None outside the ledger | Step 1 | A canonical pass that drops a source | rearchitect |
| Delta blocks on a preview | `editor.key([storedRank])`; a removed slot can throw | View blocks through the same record; detached slots skipped | `plitejs/authored` (book, view publisher) | Same owner as the reads, so a badge wakes for what its read shows | None; hooks keep `delta.blocks.includes(blockKey)` | Steps 3 and 5 | Extra per-commit work under a watched preview | gate (step 5) |
| Block card reads in Plate | View key, then view index, then stored read | `read.groups({ at: blockKey })` | `platejs/suggestion/react` | No Plate glue for a Plite gap | Docs teach the hook unchanged | Step 4 | None | cut (the mapping) |
| Discussion card, thread and popover reads | Index mapping, a `blockIndex` prop, a stored-rank anchor | Reads and anchors by block key | `apps/www` registry `discussion` | Same | Copied-UI consumers re-copy | Step 4 | A stale copy keeps the old prop | cut (the mapping) |
| Carets and anchors on reordered blocks | Monotone alignment | Unchanged here | Plite's command projection map | One order-preserving change feeds commands | None | None here | A caret drifts on a moved block | defer (Open work) |
| Eager preview carry | `ledger.carry` advances every preview a reader indexed | Unchanged here | `plitejs/authored` ledger | Predates this change; adds no work here | None | None here | Idle work per commit | defer (Open work) |

## Steps

The build runs these in order under the Build playbook. Per `.agents/pstack/rules/codex.md`, steps 1 to 4 go to a Codex worker with one brief, and the lead reviews the diff, the callers of every changed symbol and each test against the Tests rule. Docs and changesets stay the lead's.

- [ ] 1. **The resolver's trace and the run record.** `trace` on `resolveAuthoredChildren`, the merged text parts in both merges, completion's replaced occupant and `resolve-schema.ts`'s `sources`, and `packages/plitejs/src/authored/ledger/places.ts` per the Design. A differential law test compares each run's record with a fresh traced resolve by explicit stored identity, on repeated equal text, a split following a join, merged leaves with and without a schema, and completion, in both previews. Proof: the law test green on the final tree with a planted control that pairs by text and fails it, and `pnpm --filter plitejs typecheck`.
- [ ] 2. **Plite reads a preview's place in the view.** `previewModeOf`, `placeIds` and the cursor fingerprint per the Design, and the `AuthoredQuery.at`, `groups({ at })`, `AuthoredChange.ranges` and details JSDoc in `packages/plitejs/src/authored/types.ts`. Tests in `packages/plitejs/test/authored-plugin.test.ts` that assert change ids, each run red on the base before the fix: a block after an inserted block under Accepted, read by key, path, point and range, with a stored-only key reading nothing; the same on the owner in Accepted and on a view inheriting it; the reorder document of the review, equal and distinct text, loaded fresh from its saved value and read by key, path and an interior point, and the same document built by commands giving the same ids; hidden edges after a dropped block (a deletion at a block's start and end under Proposed, an insertion at a block's start under Accepted, a reversed range, an interior merged-leaf gap as the control); a hidden leaf before an inline element; a nested paragraph that does not show its quote's property change; lifted children; a merged block with another author's removed middle paragraph; a move; completion by key and by a point in the empty block; a dropped block that a range across finds and its neighbours do not; a `notes` root at `main`'s paths; and a cursor from a read with `at` refused on another mode while one without `at` keeps working. Proof: each test's base-red log and its green log on the final tree.
- [ ] 3. **The delta names the view's blocks.** The book's captured scopes, the skip of detached slots, the watch, the window and the preview publisher per the Design, and the `AuthoredChangesDelta.blocks` JSDoc. Tests in the same file, each red on the base and asserting change ids in the reread: a hidden proposal under Accepted names alpha; accepting alpha's insertion under Proposed names alpha; accepting Bob's deletion of `b` in `[a, b, c, d]` under Proposed names the merged block and its read loses Bob; a block's last change decided while the preview keeps its element names it; two syncs before one publication, one removing a slot, name the right key without throwing; a regroup after a dropped block names the view key; the owner in a preview gets view keys; a merged, a lifted and a dropped-above case name their view blocks. Proof: base-red and final green logs.
- [ ] 4. **Plate and the copied discussion read by key.** The three Public API pairs above, `useSuggestionChanges` keeping its document-commit wake and adding the review-delta wake, and the change-targeted popover anchored to the trigger's view key. In `apps/www/src/registry/components/editor/discussion.spec.tsx`, beside "keeps restored suggestions reachable when switching document projections": under Accepted, with a proposed paragraph inserted above `alpha`, alpha's trigger shows its own card id and `beta` shows none; a mounted `useSuggestionChanges([0])` gains a proposal the preview hides in that block; prepending an unmarked paragraph makes `useSuggestionChanges([1])` read the new block there; opening a change-targeted thread keeps the popover on alpha; a restored whole-block suggestion shows on no block under the preview and is reachable after switching to Editing. `packages/plitejs/test/react/decoration-manager-contract.test.ts` asserts the hidden insertion's id under Accepted and paints no stored range there. Proof: each case red on the base and green on the final tree, and the platejs spec typecheck the command recipes name.
- [ ] 5. **Cost stays bounded.** In `packages/plitejs/test/yjs/authored-key-work.slow.ts`: W1 with a subscribed preview view of each mode reading the caret block's cards by view key between each key's press and its read, every counter equal at 96 and 4,992 blocks, with listener calls counted; a long pending unwrap whose size scales with the document, where each key's traced nodes stay within twice the nodes `writtenRun` walks and only the typed block is named; a dormant Accepted preview, indexed and then unsubscribed, adding no trace, window or placement work. A planted control that builds every run's record on each key must fail the line. Proof: the W1 log on the final tree and the planted control's failing log.
- [ ] 6. **Docs and law.** Through `plate-docs` on `content/docs/(guides)/authored-changes.mdx`, `content/docs/plite/libraries/plite-authored.mdx` and `content/docs/(plugins)/(collaboration)/suggestion.mdx` and their `.cn.mdx` twins: a review place is a place of the document the view reads, a preview reads the stored content it shows, a node read never shows an ancestor's own change, records stay stored, and `subscribeChanges` names the view's blocks. The `docs/vision/plite.md` paragraph on review reads says the same. `best-api repair` on the `at` contract. Changesets for `plitejs` and `platejs` and a registry changelog entry for `discussion`, through `changeset`. Proof: the docs checks and preview `plate-docs` names, `node .agents/rules/plate-next/scripts/sync-resources.mjs --check` when a mirror changes, and `best-api repair`'s mirror proof.
- [ ] 7. **Hand drive.** Through `verify`'s Hand drive on the pages `node tooling/scripts/hand-drive.mjs scope` names for the change, in Editing and Suggestion: badges stay on their own paragraphs, a thread opens from its trigger, and Accept and Reject all still work. The preview badges are proven by step 4's spec. Proof: `node tooling/scripts/hand-drive.mjs check docs/plans/2026-10-17-exact-preview-places.md` and a read screenshot per cell.
- [ ] 8. **Close.** The writing passes, the panel on the diff (reviews: api-build), `pnpm lint:fix` on the task's paths, the repeated acceptance proof on the final bytes and the landing the card's brief names. Proof: the decision-log rows of each gate.

## Open work

- Carets, anchors and command frames map through the alignment, which keeps stored order, so on a block a preview moves they can land on the wrong copy (`packages/plitejs/src/authored/tree/alignment.ts`, `packages/plitejs/src/core/command-frame.ts`). The probe is a location-consumer test on the review's reorder document. Tracked as a suggested task offered at this run's close. owner: the owner; stop: that task lands or is dropped.
- `ledger.carry` advances every preview mode a reader ever indexed on each owner commit, even with no view showing it (`packages/plitejs/src/authored/ledger/ledger.ts`, `docs/plans/artifacts/2026-10-17-preview-review-places/panel/plan-r1/probe-dormant-removed-a1.log`). It limits the line "A preview mode costs nothing per commit while no view shows it" in `docs/plans/2026-10-13-review-tree-pivot.md`, which restores once the task lands. Tracked as a suggested task offered at this run's close. owner: the owner; stop: that task lands or is dropped.

## Evidence

Model: claude-opus-5-5 at xhigh effort led this review; a Codex `gpt-6.1-sol` explorer at medium effort mapped the code (`docs/plans/artifacts/2026-10-17-preview-review-places/explorer/answer.md`).

This page executes the open Pursue `2026-10-12-suggestions-complete` and retains it, because its job, `/docs/suggestion` and the copied review UI on the review tree, still stands. The review-tree pivot (`docs/plans/2026-10-13-review-tree-pivot.md`) set the preview reads default this page replaces: its card-reads step said "Plite's reads take stored places only, so a key that only a preview holds reads no cards", and its Defaults row "Card reads while a preview shows" kept the same-index read. That plan is done, so this page supersedes that one default and keeps the rest. It also replaces `docs/plans/2026-10-17-preview-review-places.md`, whose design its own plan review rejected.

### Requirements

- The task's ask: decide the owner among "Plite resolves view keys, previews keep stored keys for blocks they do not rewrite, or the hooks keep the mapping", given that "a projection that drops or adds blocks shifts indexes, so the mapping is approximate under Accepted and Proposed".
- Review reads take a place, so no read walks every pending change (`docs/vision/plite.md`, the authored paragraph).
- `api.subscribeChanges` hands each view one frozen delta per commit that changes the review, and its `blocks` name the view's blocks (`packages/plitejs/src/authored/types.ts`).
- A view never becomes a parallel authority for state the runtime owns (`docs/vision/common.md`, Boundary Law), and a Plite primitive gap is not hidden in Plate glue (`VISION.md`).
- A preview mode adds no work per commit while no view shows it, and per-key work stays equal at 96 and 4,992 blocks (`docs/plans/2026-10-13-review-tree-pivot.md`, W1 in `packages/plitejs/test/yjs/authored-key-work.slow.ts`).
- The discussion keeps restored suggestions reachable when switching previews (`apps/www/src/registry/components/editor/discussion.spec.tsx`).

### Findings

- `placeIds` resolves a key through the stored document and takes a path or range as stored (`packages/plitejs/src/authored/authored.ts`). Its public doc says the same (`packages/plitejs/src/authored/types.ts`).
- Five reads hold a view place and pass it as stored: `useSuggestionGroups` and `useSuggestionChanges` (`packages/platejs/src/react/features/suggestion/useSuggestion.ts`), the discussion's `targetGroups` and `blockThreadCount` (`apps/www/src/registry/components/editor/discussion.tsx`), and the Accepted range read in `packages/plitejs/test/react/decoration-manager-contract.test.ts` (explorer answer, section 5).
- The owner editor can show a preview: `setView` stores a view per runtime, `viewOf` falls back to the owner's, and `readView` projects any receiving editor whose view is a preview (`packages/plitejs/src/authored/authored.ts`).
- `subscribeChanges` names each stored block of its delta as `editor.key([rank])` on the subscribing view, so under a preview it names the view block at the same rank (explorer answer, section 3). A hidden proposal under Accepted and a decision under either preview keep the block's element and name no block (`docs/plans/artifacts/2026-10-17-preview-review-places/probe/hidden-wake-a1.log`, `docs/plans/artifacts/2026-10-17-preview-review-places/probe/decision-wake-a1.log`), and accepting a whole-block deletion inside a Proposed merge names no block either (`docs/plans/artifacts/2026-10-17-preview-review-places/panel/plan-r1/probe-dormant-removed-a1.log`).
- A run's alignment keeps stored order while the resolver places a join's follower after the joined line, so reading back through the alignment gives a reordered block another block's card, and with distinct text the joined line reads nothing (`docs/plans/artifacts/2026-10-17-preview-review-places/panel/plan-r1/probe-reorder-a1.log`). A point at a block's edge maps inside its leaf and misses a change hidden in its own leaf there (`docs/plans/artifacts/2026-10-17-preview-review-places/panel/plan-r1/probe-point-edge-a2.log`).
- The resolver keeps an `origins` map from each output node to its stored node and exposes `resolvedOf`, but `resolveRun` keeps only the children (`packages/plitejs/src/authored/tree/resolve.ts`, `packages/plitejs/src/authored/ledger/runs.ts`).
- Measured on `51f3a53b66`: with an inserted paragraph proposed above `alpha` and `++` proposed in `alpha`, the Accepted preview's `alpha` reads the inserted paragraph's card by index and `beta` reads alpha's; by key both read nothing (`docs/plans/artifacts/2026-10-17-preview-review-places/probe/base-index-map-a1.log`).

### Lanes

- **Plite resolves the view's places from the resolver's record** (picked): a review read on a view takes a key, path, point or range of the document that view reads, and Plite reads the stored content the resolver says that place shows; the delta names the view blocks whose cards changed. The hooks and the discussion pass the key or path they hold.
- **Plite resolves the view's places through the alignment** (the replaced plan): exact while a run keeps stored order, wrong on a reordered block and at a block's edge.
- **Previews keep stored keys**: fixes a key read for rewritten blocks only; paths, points and ranges still read stored coordinates, and a merged block reads one stored block.
- **The hooks keep the mapping**: an exact map needs a new public read from view places to stored places, so every caller learns two steps for one job, and Plate glue covers a Plite gap.
- **No cards in a preview** (the strongest cut): removes the mapping but drops the review job the pivot plan kept, and fails the discussion spec that keeps restored suggestions reachable across previews.
- Proof limits. The base probes ran on the Plite owner with paragraphs, a quote and a join's follower, under both previews. Named roots and the browser are not driven yet.

### Dependents

- `suggestions`: `packages/platejs/src/react/features/suggestion/useSuggestion.ts` and the copied discussion, `apps/www/src/registry/components/editor/discussion.tsx`, read the authored scope's place reads and change with this plan.
