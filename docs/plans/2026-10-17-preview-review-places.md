---
review_scopes: [suggestions, authored]
review_basis: [2026-10-12-suggestions-complete]
work_kind: implementation
review_commit: 51f3a53b665263bd0b0ae81b99978f542eede86f
review_inputs: [packages/plitejs/src/authored/authored.ts, packages/plitejs/src/authored/types.ts, packages/plitejs/src/authored/ledger/projection.ts, packages/plitejs/src/authored/format.ts, packages/platejs/src/react/features/suggestion/useSuggestion.ts, apps/www/src/registry/components/editor/discussion.tsx, apps/www/src/registry/components/editor/discussion.spec.tsx, packages/plitejs/test/authored-plugin.test.ts]
---

# Review reads take the view's own places

Status: superseded by docs/plans/2026-10-17-exact-preview-places.md, whose design replaces this one after its plan review
Playbook: plan

**Pursue. Plite resolves a view's places for the review reads, and the Plate hooks and copied discussion pass the block key they already hold.** Under a preview, `read.groups({ at })` and `read.changes({ at })` read `at` as a place of the stored document, so `useSuggestionGroups`, the discussion's target panel and its thread counts each turn a view key into its view index and read the stored block at that index. That lines up only while the preview keeps every block. A pending block insertion above a paragraph shifts it: under the Accepted preview, `alpha` shows the inserted paragraph's card and the unchanged `beta` shows alpha's card (`docs/plans/artifacts/2026-10-17-preview-review-places/probe/base-index-map-a1.log`). Plite's own `api.subscribeChanges` names its delta's blocks the same way, `editor.key([rank])` on the view. Plite already owns both maps a fix needs: the forward map that anchors use to paint a stored range in a preview, and an indexed inverse from a preview position back to the stored document. Every product caller holds a place of the document its view reads, and none holds a stored place. Of the three owners the task names, carrying stored keys onto rewritten blocks fixes only keys and leaves ranges and paths wrong, and the hooks cannot map exactly without a new public map every caller must learn. This continues the `authored` and `suggestions` scopes' open Pursue, `2026-10-12-suggestions-complete`; suggested task t_6e339e60 asked the question, from flag F5 of the comment review (`docs/plans/artifacts/2026-10-13-review-tree-pivot/paged/no-comments-s7/reply.md`).

## Brief

### What will change?

In the Accepted and Proposed previews, each paragraph shows its own review cards, even when the preview hides, merges or splits paragraphs above it. Badges also update when a hidden suggestion or a decision changes them.

### What could go wrong?

An app that asks a preview for cards with a saved-document position now gets the preview's cards at that position. Nothing in this repo does that. When a suggestion deletes the only paragraph, the preview's empty paragraph shows that card.

## Teach

A preview shows the document as if every suggestion were accepted, or every one rejected. It is read-only, and it can hide whole paragraphs, merge two into one, or pull paragraphs out of a quote.

The review sidebar asks which cards sit on a paragraph. Today it asks with the paragraph's position in the preview, and the answer comes from the saved document at that position. When the preview hides a paragraph above, every position below points at the wrong saved paragraph.

After the change, the sidebar asks with the paragraph it shows. The editor already keeps a map from each preview paragraph back to the saved content it came from, for cursors and highlights. It now uses that map for cards too, and to tell a badge when its cards change.

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
| A preview's review place reads map the view's place to the stored content it shows | Plite | `plitejs/authored` | The review ledger owns the mode projection and its alignment, the only record of what a preview block shows |
| `subscribeChanges` names the view blocks that show each stored block, written blocks included | Plite | `plitejs/authored` | The same owner as the reads, so a badge wakes for exactly what its read can show |
| `useSuggestionGroups` reads by the block key it renders | Plate | `platejs/suggestion/react` | Plate glue passes the place it holds and maps nothing |
| The discussion's target panel and thread counts read by block key | Plate | `apps/www` registry, `discussion` | Copied UI passes the place it holds and maps nothing |

## Hard cuts and app migration

- `at` on a preview view no longer names a place of the stored document. A key resolves only in the view, a path, point or range is a place of the preview, and no option reads stored places from a preview. Callers in this repository that pass `at` to a preview read are the four in the Findings below, and each already holds a view place, so they change only to drop their index mapping. An app that read a preview with a stored place, such as a record's `ranges`, reads the owner editor or an intent view instead. A page cursor works only on a view with the same root and preview mode as the one that returned it.
- `SuggestionDiscussionBlock` in the copied discussion loses its `blockIndex` prop, and `blockThreadCount` takes the block key. An app with a copied `discussion.tsx` re-copies it or makes the two edits in the Public API pairs above.
- Records keep their shape. `AuthoredChange.ranges` and the location fields of `details` stay places of the stored document, and their JSDoc now says so.

## Defaults

| Decision | Pick | Alternative | Word | Impact |
| --- | --- | --- | --- | --- |
| Who works out a preview paragraph's cards | The editor, for every way of naming a place (look) | The sidebar keeps guessing by position; previews copy saved keys onto the paragraphs they change | "hooks keep it", "carry keys" | big |
| Cards in a preview | Each paragraph shows the cards of the saved content it shows (look) | No cards while a preview shows | "no preview cards" | big |
| Asking a preview for cards with a saved-document position | No longer works, and nothing turns it back on (look) | Keep a switch for saved-document positions | "keep switch" | big |
| How the editor tells where a preview paragraph came from | Reuse the map the preview already keeps for cursors and highlights (look) | Build a separate record of where each paragraph came from | "separate record" | small |
| A paragraph that two saved paragraphs merge into | Shows both paragraphs' cards, and the card of a paragraph removed between them (look) | Leave out the removed paragraph's card | "skip removed middle" | small |
| Paragraphs pulled out of a quote | Each shows the quote's card and its own cards, never a sibling's (safe) | Only the first shows the quote's card | "quote card once" | small |
| The empty paragraph a preview shows when a suggestion deletes the only one | Shows the deleted paragraph's card (look) | Shows no card | "empty filler" | small |
| A paragraph the preview hides | Its cards show on no paragraph; the review list keeps them (safe) | Show them on the next paragraph | "next paragraph" | small |
| The copied discussion's per-block index | Removed; it reads by block key (safe) | Keep the index prop beside the key | "keep index" | detail |
| A page cursor used on another view | Refused as stale unless the view has the same root and preview (safe) | Keep accepting it | "share cursors" | detail |
| Where the review popover sits in a preview | Left for its own task (look) | Fix it in this change | "fix popover" | small |
| Work a preview nobody has open still does on each edit | Left for its own task (safe) | Fix it in this change | "fix idle preview" | detail |
| Page record | This page carries out the open suggestions plan instead of starting a new review | Write a new review that replaces it | "new review" | detail |
| The suggestions page link | A new page, https://claude.ai/artifact/STvVRPYvHguHpREtcLFV9F, because https://claude.ai/artifact/NKfmSN3HXP15YCC757xRc5 no longer opens for this account (safe) | Drop the new page and restore the old link | "drop new page" | detail |

## Design

The design came from an `architect` bakeoff of three runners and a cross-judge (`docs/plans/artifacts/2026-10-17-preview-review-places/architect/design.md`). Two runners proposed a new many-to-many record of where each preview block came from, built in the resolver and the recorder. The third reused the projection's existing alignment through `toStored`. The lead's probes ran that reuse on every case the other two cited against it, and it returned the expected cards in each. The cross-judge scored the reuse 31 of 32 and the other two 23 and 21, so the plan takes it as the base.

**Read path.** `placeIds(editor, book, at)` learns the receiving view's preview mode, which is null on the owner, on an intent view and inside `storedRead`.

- No preview, or a preview that shows the root as stored: today's code, except that a key resolves in the receiving editor's own document.
- A preview: resolve `at` in the view. A key or path names the node's outer token span in the view. Map its start with `toStored(from, 1)` and its end with `toStored(to, -1)`, the form the probes ran. The read then spans everything between the node's kept open and close tokens, including content the preview hides at its edges, and never a dropped neighbour. A point or range maps its start with `toStored(start, -1)` and its end with `toStored(end, 1)`, so a collapsed point at a gap spans the content the preview hides there. Both read the stored points inward (`pointAt(s, 1)`, `pointAt(e, -1)`) and run today's range branch over that stored range. A view place that holds no stored text reads nothing.
- A private `ReviewLedger.previewPlaces(stored, mode, root)` returns `{ range, blocks }` over the synced projection, or null while the mode shows the root as stored. It forces the sync `locationMap` already forces and no other.
- The page cursor's fingerprint adds the receiving view's root and preview mode to the query. Today a cursor from one preview passes the fingerprint on another view, and the page then starts at an unrelated change (`packages/plitejs/src/authored/authored.ts`, `changes`).

**Delta path.** `BookDelta` gains `written`: the stored blocks the syncs since the last publication wrote, or reread for a verdict, whose old or new contents held a pending occurrence. `RootBook.sync` and `reread` collect them as slots only while the book has a subscriber, and `publish` turns them into ranks. The view's publisher maps each `{ root, rank }` of `blocks` and `written` in its root through `places.blocks(rank)`, the output blocks of the run that holds that stored rank, read from the existing `OUTPUT_BLOCKS` measure, and names each view key once. On the owner and intent views that map is the identity. A run's outputs are a safe superset, because a view block's stored span stays inside its run. This replaces the book's rule that a written block re-renders anyway, which a preview breaks (`probe/hidden-wake-a1.log`, `probe/decision-wake-a1.log`).

**Cases.**

| Case | View block | Its key or path reads |
| --- | --- | --- |
| Unchanged | the stored object and key | nothing, because an unmarked block holds no occurrence |
| Shown unchanged with a hidden change inside, as when Accepted hides a new proposal | the old object and key | the hidden change's card |
| Rewritten | preview key | the stored block's cards, hidden content inside it included |
| Merged (Proposed join, Accepted split) | one block | both stored blocks' cards and the join or split, plus a block wholly removed between them, whoever made its card |
| Lifted (Proposed unwrap, Accepted wrap) | one block per child | its own child's changes and the wrapper's change, never a sibling's |
| Moved | one block, at the source under Accepted and the target under Proposed | the move and the moved block's own changes |
| Nested, such as a paragraph in a quote | same as a top-level block | the same rules, by its own key or path |
| Schema completion | fresh key | the stored content the kernel aligned it with, so a deleted only-block's card |
| Dropped (Proposed deletion, Accepted insertion) | none | shows in no block; a range across the drop site finds it |

Each row holds whether the preview existed before the edits or was built after them (`docs/plans/artifacts/2026-10-17-preview-review-places/probe/envelope-built-a1.log`).

**Limits.** The diff fallback in `acceptedChange` (`packages/plitejs/src/authored/tree/alignment.ts`) can align a repeated equal leaf to the wrong copy inside one run. A card would then show on a sibling block of that run. Carets and anchors drift the same way, so a fix belongs in the alignment. `useSuggestionChanges` wakes on the view's own commits, which may miss a change the preview hides; step 3 checks that before changing it.

**Three realistic failures.** First, an app reads a preview with a record's stored range and gets another block's cards. The docs and the `ranges` JSDoc name the receiving document, and reverting the Plite slice rolls it back. Second, the `written` wake fires on every key typed into a block that holds a change, on intent views too. The W1 arm in step 4 counts that work. Third, a place read forces a preview sync for a mode no view shows. Only a preview view issues such a read, and step 4's dormant-preview control checks it.

## Decision ledger

| Surface | Current | Target | Owner | Reason | Adoption | Proof | Risk | Verdict |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Review place reads on a preview | `at` read as a stored place; a key resolves under `storedRead` | `at` names a place of the view's document, mapped through the mode projection | `plitejs/authored` (`placeIds`, `ReviewLedger.previewPlaces`) | The projection is the only record of what a preview block shows; Boundary Law | Four in-repo callers drop their index mapping; three docs pages and the Vision paragraph | Steps 1 and 3 | An app passing a stored place to a preview read | rearchitect |
| Delta blocks on a preview | `editor.key([storedRank])`; written blocks left out | Forward-mapped through run outputs, written blocks included | `plitejs/authored` (book `written`, view publisher) | Same owner as the reads, so a badge wakes for what its read shows | None; hooks keep `delta.blocks.includes(blockKey)` | Steps 2 and 4 | Extra per-commit work on intent views | gate (W1, step 4) |
| Block card reads in Plate | View key, then view index, then stored read | `read.groups({ at: blockKey })` | `platejs/suggestion/react` | No Plate glue for a Plite gap | Docs teach the hook unchanged | Step 3 | None | cut (the mapping) |
| Discussion card and thread reads | Index mapping and a `blockIndex` prop | Reads by block key | `apps/www` registry `discussion` | Same | Copied-UI consumers re-copy | Step 3 | A stale copy keeps the old prop | cut (the mapping) |
| Popover anchor in a preview | A record's stored range resolves in the view | Unchanged here | Plite's forward map (`mapToView`) | A separate defect in the other direction | None | None here | Popover sits at the wrong block in a preview | defer (Open work) |
| Eager preview carry | `ledger.carry` advances every preview a reader indexed | Unchanged here | `plitejs/authored` ledger | Pre-existing, outside this change | None | None here | Idle work per commit | defer (Open work) |

## Steps

The build runs these in order under the Build playbook. Per the Codex workers rule, steps 1 to 3 go to a Codex worker with one brief once their failing tests are named, and the lead reviews the diff, the callers of every changed symbol and each test against the Tests rule. Docs and changesets stay the lead's.

- [ ] 1. **Plite reads a preview's place in the view.** `placeIds` and `ReviewLedger.previewPlaces` per the Design, and the `AuthoredQuery.at`, `groups({ at })` and `AuthoredChange.ranges` JSDoc in `packages/plitejs/src/authored/types.ts`. The page cursor's fingerprint per the Design. Tests in `packages/plitejs/test/authored-plugin.test.ts`, one per failure mode, each run red on the base before the fix: a block after a dropped block, read by key, path and range, with a stored-only key reading nothing (Accepted, an inserted block above); a merged block (Proposed join with an edit on each side), read alike on a preview built before the edits and one built after; lifted children (Proposed unwrap of a quote with an edit in each child); a pending move read at its target under Proposed; hidden edges (a point at offset 0 reads a deletion the preview hides at a block's start, a point inside does not, and a dropped neighbour's card shows nowhere); a `notes` root whose blocks sit at the same paths as `main` blocks with other cards; and a page cursor from an Accepted read refused on a Proposed view. Proof: each test's base-red log and its green log on the final tree, and `pnpm --filter plitejs typecheck`.
- [ ] 2. **The delta names the view's blocks.** `BookDelta.written` and the publisher's forward map per the Design. Tests in the same file, each red on the base: under Accepted with an inserted block above, a proposal inside `alpha` names alpha's view key, not the block at its stored rank; a hidden proposal under Accepted and an accept under Proposed each name alpha's view key. Proof: base-red and final green logs.
- [ ] 3. **Plate and the copied discussion read by key.** The three Public API pairs above. One case in `apps/www/src/registry/components/editor/discussion.spec.tsx` beside "keeps restored suggestions reachable when switching document projections": under Accepted, with a proposed paragraph inserted above `alpha`, alpha's trigger shows its one card and `beta` shows none. Then a second case, written first: under Accepted, a mounted `useSuggestionChanges([0])` gains the card of a new proposal the preview hides in that block. When it is red on the base, the hook moves onto `useAuthoredRead` with the same `when` as `useSuggestionGroups`, keyed by the block at `path[0]`; when it is green, the hook keeps its rule and the case is cut. Proof: each case red on the base and green on the final tree, or the green base log that cut it, and the platejs spec typecheck the command recipes name.
- [ ] 4. **W1 stays flat with preview listeners.** In `packages/plitejs/test/yjs/authored-key-work.slow.ts`, `mountReview` also subscribes each preview view's `api.authored.subscribeChanges` and reads the caret block's cards by its view key after each key. The frozen line stays as it is today. Every counter W1 reads is equal at 96 and 4,992 blocks on every arm. A miss sends the target back to `architect`. The same arm with the planted index rebuild of `probe/scale-count-probe.ts` is the control and must fail the line. A dormant-preview arm checks that a place read on the owner syncs no preview. Proof: the W1 log on the final tree and the planted control's failing log.
- [ ] 5. **Docs and law.** Through `plate-docs` on `content/docs/(guides)/authored-changes.mdx`, `content/docs/plite/libraries/plite-authored.mdx` and `content/docs/(plugins)/(collaboration)/suggestion.mdx` and their `.cn.mdx` twins: a review place is a place of the document the view reads, a preview maps it to the stored content it shows, records stay stored, and `subscribeChanges` names the view's blocks. The `docs/vision/plite.md` paragraph on review reads says the same. `best-api repair` on the `at` contract. Changesets for `plitejs` and `platejs` and a registry changelog entry for `discussion`, through `changeset`. Proof: the docs checks and preview `plate-docs` names, `node .agents/rules/plate-next/scripts/sync-resources.mjs --check` when a mirror changes, and `best-api repair`'s mirror proof.
- [ ] 6. **Hand drive.** Through `verify`'s Hand drive on the pages `node tooling/scripts/hand-drive.mjs scope` names for the change: on the suggestion demo, add a paragraph in Suggesting above a suggested edit, switch to Accepted and Proposed, and see each badge on its own paragraph; propose a hidden edit and decide one while a preview shows, and see the badge update. Proof: `node tooling/scripts/hand-drive.mjs check docs/plans/2026-10-17-preview-review-places.md` and a read screenshot per cell.
- [ ] 7. **Close.** The writing passes, the panel on the diff (reviews: api-build), `pnpm lint:fix` on the task's paths, the repeated acceptance proof on the final bytes and the landing the card's brief names. Proof: the decision-log rows of each gate.

## Open work

- The review popover in a preview resolves a record's stored range in the view, so it can sit at the wrong block (`apps/www/src/registry/components/editor/discussion.tsx`, `anchorRange`). Tracked as a suggested task offered at this run's close. owner: the owner; stop: that task lands or is dropped.
- `ledger.carry` advances every preview mode a reader ever indexed on each owner commit, even with no view showing it (`packages/plitejs/src/authored/ledger/ledger.ts`). Tracked as a suggested task offered at this run's close. owner: the owner; stop: that task lands or is dropped.

## Evidence

Model: claude-opus-5-5 at xhigh effort led this review; a Codex `gpt-6.1-sol` explorer at medium effort mapped the code (`docs/plans/artifacts/2026-10-17-preview-review-places/explorer/answer.md`).

This page executes the open Pursue `2026-10-12-suggestions-complete` and retains it, because its job, `/docs/suggestion` and the copied review UI on the review tree, still stands. The review-tree pivot (`docs/plans/2026-10-13-review-tree-pivot.md`) set the preview reads default this page replaces: its card-reads step said "Plite's reads take stored places only, so a key that only a preview holds reads no cards", and its Defaults row "Card reads while a preview shows" kept the same-index read. That plan is done, so this page supersedes that one default and keeps the rest.

### Requirements

- The task's ask: decide the owner among "Plite resolves view keys, previews keep stored keys for blocks they do not rewrite, or the hooks keep the mapping", given that "a projection that drops or adds blocks shifts indexes, so the mapping is approximate under Accepted and Proposed".
- Review reads take a place, so no read walks every pending change (`docs/vision/plite.md`, the authored paragraph).
- `api.subscribeChanges` hands each view one frozen delta per commit that changes the review, and its `blocks` name the view's blocks (`packages/plitejs/src/authored/types.ts`).
- A view never becomes a parallel authority for state the runtime owns (`docs/vision/common.md`, Boundary Law), and a Plite primitive gap is not hidden in Plate glue (`VISION.md`).
- A preview mode costs nothing per commit while no view shows it, and per-key work stays equal at 96 and 4,992 blocks (`docs/plans/2026-10-13-review-tree-pivot.md`, W1 in `packages/plitejs/test/yjs/authored-key-work.slow.ts`).
- The discussion keeps restored suggestions reachable when switching previews (`apps/www/src/registry/components/editor/discussion.spec.tsx`).

### Findings

- `placeIds` resolves a key through the stored document and takes a path or range as stored (`packages/plitejs/src/authored/authored.ts`). Its public doc says the same (`packages/plitejs/src/authored/types.ts`).
- Four reads hold a view place and pass it as stored: `useSuggestionGroups` and `useSuggestionChanges` (`packages/platejs/src/react/features/suggestion/useSuggestion.ts`), and the discussion's `targetGroups` and `blockThreadCount` (`apps/www/src/registry/components/editor/discussion.tsx`). Only tests and docs pass literal stored paths, all on writing views or the owner editor (explorer answer, section 5).
- `subscribeChanges` names each stored block of its delta as `editor.key([rank])` on the subscribing view, so under a preview it names the view block at the same rank (explorer answer, section 3).
- A preview keeps the stored key of a block it emits untouched and gives a rewritten block a fresh key, which later previews of the same view inherit. So a rewritten block keeps a stored key only when the preview existed before the edit (`packages/plitejs/test/authored-plugin.test.ts`, "keeps the node keys of a preview view across commits"), and never for a document loaded with pending changes (`apps/www/src/registry/components/editor/discussion.spec.tsx`, "keeps restored suggestions reachable when switching document projections").
- Proposed drops a deleted block and merges a pending join; Accepted drops an inserted block and merges a rejected split; an accepted unwrap or rejected wrap lifts children out of one stored block; schema completion can add a block (`packages/plitejs/src/authored/tree/resolve.ts`, explorer answer, section 2).
- Plite owns a forward map from stored places to a preview (`ledger.locationMap`, used by `mapToView` and anchors) and an indexed inverse for positions (`toStored` in `packages/plitejs/src/authored/ledger/projection.ts`), which searches the slot tree instead of walking the document.
- Measured on `51f3a53b66`: with an inserted paragraph proposed above `alpha` and `++` proposed in `alpha`, the Accepted preview's `alpha` reads the inserted paragraph's card by index and `beta` reads alpha's; by key both read nothing (`docs/plans/artifacts/2026-10-17-preview-review-places/probe/base-index-map-a1.log`).

### Lanes

- **Plite resolves the view's places** (picked): a review read on a view takes a key, path, point or range of the document that view reads, and Plite maps it to the stored document with the maps it already owns; the delta names the view blocks that show each stored block. The hooks and the discussion pass the key or path they hold.
- **Previews keep stored keys**: a preview gives each block it rewrites the key of the stored block it comes from. It fixes a key read for rewritten blocks, but a path, point or range from the view still reads the stored document at the same coordinates, a merged block reads only one of its stored blocks, and every preview build pays to carry keys.
- **The hooks keep the mapping**: the copies stay, or move into one Plate helper. An exact map needs a new public read from view places to stored places, so every caller learns two steps for one job, and Plate glue covers a Plite gap.
- **Keys only (F5 as written)**: resolve a key in the view and keep paths and ranges stored. It fixes the two key reads and leaves `useSuggestionChanges` and `blockThreadCount` wrong, and gives one read two coordinate systems.
- **No cards in a preview** (the strongest cut): the discussion shows nothing under a preview. It removes the mapping but drops the review job the pivot plan kept, and it fails the discussion spec that keeps restored suggestions reachable across previews.
- Proof limits. The base probe ran on the Plite owner with plain paragraphs. The design probes then ran the candidate read on joins, splits, a lifted quote, schema completion, a hidden proposal and a decision under both previews, and its counters at 96 and 4,992 blocks (`docs/plans/artifacts/2026-10-17-preview-review-places/probe/`). Named roots and the browser are not driven yet.

### Dependents

- `suggestions`: `packages/platejs/src/react/features/suggestion/useSuggestion.ts` and the copied discussion, `apps/www/src/registry/components/editor/discussion.tsx`, read the authored scope's place reads and change with this plan.
