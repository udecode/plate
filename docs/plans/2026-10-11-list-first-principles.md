---
review_scopes: [list]
review_basis: [2026-10-10-list-import-identity]
verdict: pursue
work_kind: implementation
review_commit: c01399d08bb7d57d79d2e8c3b496fdd9a3ad3bd1
review_inputs: [docs/plans/2026-10-10-list-review.md, docs/plans/2026-10-10-list-import-identity.md, packages/platejs/src/markdown/lib/deserializer/deserializeMdList.spec.tsx, packages/platejs/src/markdown/lib/markdownContinuation.spec.ts, packages/platejs/src/markdown/lib/internal/markdownConversion.ts, packages/platejs/src/markdown/lib/internal/markdownSegments.ts, packages/platejs/src/markdown/lib/serializer/convertNodesSerialize.ts, packages/platejs/src/markdown/lib/serializer/listToMdastTree.ts, packages/platejs/src/migrations/migrateListIdentity.ts, packages/platejs/src/ai/react/AIChatPlugin.ts, packages/platejs/src/ai/react/CopilotPlugin.tsx, packages/platejs/src/lib/plugins/element-id/ElementIdPlugin.ts, packages/plitejs/src/core/correction.ts, packages/plitejs/src/core/transfer.ts, apps/www/src/registry/components/editor/block-list.tsx, apps/www/src/registry/components/editor/block-menu.tsx, apps/www/src/registry/components/editor/indent-toolbar-button.tsx, apps/www/src/registry/components/editor/tabbable.tsx, content/docs/(plugins)/(styles)/indent.mdx, content/docs/(plugins)/(serializing)/markdown.mdx, VISION.md, docs/vision/common.md, docs/vision/plate.md]
---

# Lists: one way to mark a separate list

Status: executed: waiting on your commit; step 1.9, the hydration warning, is open work
Playbook: plan

Pursue, but not a full redesign. You named lists and indent directly; `next` would have offered neutral naming. The 2026-10-10 redesign started from first principles on your steer. It chose flat list items, list ids, numbers derived per list and drawn through `ol.start`, and one indent depth. None of its requirements changed since. One premise failed. A separate list is stored two ways. HTML decode gives each list its own `listId`. Markdown decode puts every list in the root's default list and marks each list's first item with a forced `listRestart`. The two look the same until an ordinary edit. Backspace at the start of the second list's first item, or moving that item below the next one, leaves the next item at 3 when the lists came from Markdown and at 1 when they came from HTML. Pasting two Markdown lists merges them into one list, and into the landing list when pasted into a list item. The same premise failed step 3.2's L4 line. The plan gives every parsed Markdown list a fresh id at decode, the way HTML decode already does, so `listRestart` only means restart and parsed lists stay separate on every path. It also drops the list correction that guessed identity on every structural edit, which made undo change numbers. Indent keeps its shared depth and loses three commands only it and lists call. The plan names the Build playbook as its execution playbook.

## Brief

### What will change?

No full redesign. Markdown lists now get their own ids, like pasted HTML lists. So Backspace, moving an item, pasting or undo no longer makes one list keep counting from another. Indent lost three commands no app used. AI list output was done in the follow-up plan.

### What could go wrong?

Parsing the same Markdown twice gives different list ids. So a page that parses it on the server and again in the browser shows a hydration warning, which is still open. Inserts still get slower as the document grows, because of Plite; the scaling plan explains why.

## Teach

A numbered item in Plate is a plain paragraph with list facts. Items that share a list id are one list, even with a note between them. Items with no id share one hidden list per document.

Today a separate list is stored two ways. An HTML list gets its own id. A Markdown list gets no id, so it joins the hidden list, and its first item carries a restart mark. Both show 1, 2 then 1, 2. Press Backspace at the start of the second list, and the mark goes away with that item. The Markdown list's next item then shows 3, while the HTML one shows 1.

The fix gives each Markdown list a fresh id when it is parsed, as HTML already does. Ids never repeat, so content can move between documents without lists merging. A restart mark then only means restart.

## Defaults

| Decision | Pick | Alternative | Word | Impact |
| --- | --- | --- | --- | --- |
| Which item to review | Lists and indent, which you named | The queue's first pick, neutral naming | naming | small |
| Another full redesign | None. Keep flat items, list ids, numbers worked out on the fly and one indent depth | Redo the whole list model | full-redesign | big |
| What the next list pass fixes | Markdown lists become separate lists, like HTML lists (look) | Keep one hidden list and hand a restart mark to the next item when its item leaves | restart-follows | big |
| What happens after the verdict | Plan and build this pass now | Stop after the verdict | hold | big |
| How a Markdown list gets its id | A fresh random id per parse, as HTML gives (look) | A counter that repeats the same ids on every parse, which then must be swapped on every insert | counter-ids | big |
| When two parses count as the same | Same content and same lists, whatever the id strings (look) | Byte-for-byte equal, ids included | exact-parse | big |
| The list correction that guessed identity on edits | Remove it; only list commands join a neighbor, so undo restores exactly (look) | Keep it | keep-correction | big |
| AI list output placed below or over list items | Goes back to planning in its own iteration, because three review rounds kept breaking the join; until then a list the AI writes can split (look) | Keep the join with the four ways round 3 found it breaks | ai-keep-join | small |
| The live list element's list id | Stays as it was before this plan, so exported HTML keeps its lists; an app that parses Markdown on the server and again on the client warns at hydration, and HTML read from its page splits a list once an item is added (look) | Removed, which loses list grouping when copy falls back to the page's HTML | drop-live-id | small |
| The chunk layer in the list index | Keep it; a single list still reaches 10,000 items and big pastes (look) | Measure one plain array per list against it now | measure-chunk-cut | small |
| The list index's time among 3,000 Markdown lists | Accept it: the work per insert is the same from 10 to 3,000 lists, while its time still doubles, 0.015 to 0.030 ms, about 0.4% of an 8 ms insert (look) | Keep step 1.7 open until a profile finds why the same work takes longer in a bigger document | m2-profile | small |
| The knowledge check's one finding, in the emoji subject, which HEAD reports too | Leave it to that subject's open item; this change adds no finding (safe) | Fix the emoji subject's citation here | kb-emoji | detail |
| Indent commands with no outside caller | Remove change, tab and untab (look) | Keep them | keep-indent-api | small |
| Outdent on a top list item from the toolbar | Leave as today; a list rule there needs a new hook | Make it match Shift+Tab now | outdent-rule | small |
| Which pasted list joins the list you paste into | The first list anywhere in the paste, as today | Only a list at the very start of the paste | join-leading-edge | detail |
| Toggling a list kind across a Restart | It stops at the Restart, as today | It converts the items past the Restart too | toggle-across-restart | detail |
| Where the list page lives | A new page under this account, because this session could not open the old one (claude.ai/artifact/D36fzQBHQX8rHNwBWbcLMi) | Go back to the old page and drop the new one (claude.ai/artifact/WiaDRhCCtFsHYbD6nnobtC) | old-page | detail |

## Public API

The public list and Markdown calls keep their shapes. `editor.api.markdown.parse(source)` and `parseSlice(source)` change only their output, shown under Document shape, and the documented insertion call is unchanged. Indent's `update.change`, `update.tab` and `update.untab` go, so the list's outdent stops passing its fields through indent.

The documented way to insert parsed Markdown is unchanged. Its lists now arrive with their own ids, so a raw `tx.nodes.insert` of a second parse also keeps its own lists instead of joining the first parse's hidden list.

```ts before
// content/docs/(plugins)/(serializing)/markdown.mdx
const blocks = editor.api.markdown.parseSlice('- One\n- Two');
if (blocks.ok) editor.update.slice.replace(blocks.slice);
```

```ts after
// content/docs/(plugins)/(serializing)/markdown.mdx
const blocks = editor.api.markdown.parseSlice('- One\n- Two');
if (blocks.ok) editor.update.slice.replace(blocks.slice);
```

The list's outdent decreases the depth through indent and clears its own list facts at the top.

```ts before
// packages/platejs/src/features/list/lib/BaseListPlugin.ts
tx.indent.change({
  nodes: {
    at: options.at,
  },
  offset: -1,
  unsetNodeProps: [...LIST_FIELDS],
});
```

```ts after
// packages/platejs/src/features/list/lib/BaseListPlugin.ts
tx.indent.decrease({ nodes: { at } });

for (const [node, path] of tx.nodes.blocks({ at, mode: 'lowest' })) {
  if (ElementApi.isElement(node) && !node.indent) {
    tx.nodes.unset([...LIST_FIELDS], { at: path });
  }
}
```

Indent's Tab and Shift+Tab stay shortcuts and stop being `update` verbs. No caller outside indent's own shortcut table calls `update.tab` or `update.untab`, so the cut has no call site to pair.

## Document shape

The list index, the Markdown serializer and every editing command read these facts. Today two Markdown lists parse into the root's default list, each opening with a forced restart. After the change, each list carries a fresh id, so a second parse of the same text gives other id strings with the same lists.

```json before
[
  { "type": "p", "listType": "numbered", "indent": 1, "listRestart": 1, "children": [{ "text": "A" }] },
  { "type": "p", "listType": "numbered", "indent": 1, "children": [{ "text": "B" }] },
  { "type": "p", "children": [{ "text": "Note" }] },
  { "type": "p", "listType": "numbered", "indent": 1, "listRestart": 1, "children": [{ "text": "C" }] },
  { "type": "p", "listType": "numbered", "indent": 1, "children": [{ "text": "D" }] }
]
```

```json after
[
  { "type": "p", "listType": "numbered", "indent": 1, "listId": "V8sQ2mK7xA", "children": [{ "text": "A" }] },
  { "type": "p", "listType": "numbered", "indent": 1, "listId": "V8sQ2mK7xA", "children": [{ "text": "B" }] },
  { "type": "p", "children": [{ "text": "Note" }] },
  { "type": "p", "listType": "numbered", "indent": 1, "listId": "r3N9bT4wLp", "children": [{ "text": "C" }] },
  { "type": "p", "listType": "numbered", "indent": 1, "listId": "r3N9bT4wLp", "children": [{ "text": "D" }] }
]
```

A Markdown list that starts at another number reads its start the way HTML does, as the conditional `listStart`.

```json before
{ "type": "p", "listType": "numbered", "indent": 1, "listRestart": 0, "children": [{ "text": "Zero" }] }
```

```json after
{ "type": "p", "listType": "numbered", "indent": 1, "listId": "a7Hx2Pq9Lm", "listStart": 0, "children": [{ "text": "Zero" }] }
```

The id strings are examples; their spelling is not a contract. A first sublist under an item shares its list's id, and a later sublist under the same item gets a new one, as HTML decode does. Task and bullet items of one Markdown list share one id.

## Layer and owner

| Delta | Change | Layer (Plite or Plate) | Package | Why |
| --- | --- | --- | --- | --- |
| added | Fresh list ids at Markdown decode | Plate | `platejs` (`features/list`) | A decoded id is a durable identity, the same rule HTML decode follows, so no later path has to repair it |
| added | Identity for an item `insert` or `upsert` creates | Plate | `platejs` (`features/list`) | The command that creates an item decides its list; a correction cannot tell creation from undo (`packages/plitejs/src/core/correction.ts` lines 30 to 56) |
| changed | Identity in HTML, Markdown, plain text and Word HTML paste | Plate | `platejs` (`features/list`, `markdown`, `docx/paste`) | One identity rule behind every codec: each decoded list gets a fresh id, and the Markdown serializer reports what Markdown cannot carry |
| removed | The join rule, its correction, and the `restart` and `continue` commands | Plate | `platejs` (`features/list`) | Commands own identity; counting never infers it |
| added | The join rule and the `restart` and `continue` commands | Plate | `platejs` (`features/list`) | Commands own identity; counting never infers it, and no correction guesses it on later edits |

## Hard cuts and app migration

Removed with no alias: `IndentPlugin`'s `update.change`, `update.tab` and `update.untab`, and `IndentChangeOptions`' `setNodeProps` and `unsetNodeProps`. Tab and Shift+Tab keep working as indent's shortcuts, and `TabbableKit`'s `shortcuts: { tab: null, untab: null }` override keeps its keys. An app that called `update.change({ offset })` calls `increase` or `decrease` once per step.

Markdown parse output changes shape. An app or test that compared parsed list blocks against `listRestart` now sees `listId` and `listStart`, and two parses of one text differ in list id strings. A client editor that parses Markdown in its value initializer on the server and again on the client now warns at hydration on each list element, because the two parses draw different list ids, and HTML read from its page splits a list once an item is added; Open work tracks it. No released document carries the old Markdown encoding. The list-id model reached `next` only in commit `c01399d08b` on 2026-10-11, which no release tag contains, and `migrateListIdentity` gives each list of a released document its own id.

A raw write of a list item without `listId` stays in the root's default list. It no longer joins a neighbor on the next structural edit; the list commands do that.

## Native behavior and proof

| Delta | Behavior | What happens | Proof surface |
| --- | --- | --- | --- |
| changed | Markdown round trip | Each Markdown list gets its own fresh id and keeps its start as `listStart`; task and bullet items of one list stay one list; serialize starts each run at its number and alternates the delimiter between adjacent lists, and reports a forced restart or a split list it cannot carry | `deserializeMdList.spec.tsx`, `standardList.spec.ts`, `markdownContinuation.spec.ts`, `EDIT-LIST-START-MD-401`, scale line L4 on parsed Markdown |
| added | Backspace or a move at a Markdown list's first item | The rest of that list keeps counting from 1, as an HTML list does | Headless spec of the probe's cases, tagged `EDIT-LIST-START-MD-401` |
| added | Pasting or inserting two Markdown lists | They stay two lists through paste, a raw insert, a value built from two parses and a transfer between editors | Clipboard spec through `parseSlice` and `slice.replace`; headless specs for raw insert and transfer |
| added | Undo after deleting an item of a list without ids | The document and its numbers come back exactly | Headless spec with history undo and redo |
| added | Delete or Backspace on the first item of an id-less list after a note | The rest counts on from the list above, by the default-list rule, where the deleted correction used to give it a fresh id | Headless spec; hand-written values and released documents loaded without `migrateListIdentity` |
| added | A client editor that parses Markdown in its value initializer, rendered on the server and hydrated | One hydration warning on the list element, and the hydrated DOM keeps the server parse's list ids until an item's list id changes, while an item added later carries the client's; HTML read from the page, such as a copy whose model HTML the encoder declines, then splits that list; Open work tracks it | `renderToString` and hydrate test |

## Main changes

- The Markdown list decoder gives each list family a fresh id from `createListId()`, the generator HTML decode uses. The continuation parser needs no new state: a reused segment keeps its objects and ids, and a list never spans a reused segment.
- The list `children` correction that assigned a missing identity on structural edits is gone. `insert` and `upsert` resolve the identity of the item they create inside their own transaction, with the same neighbor rule.
- The Markdown serializer groups by ordered against unordered list, so task and bullet items of one list stay one Markdown list. It stops claiming a forced restart, claims a `listStart` only when the written list starts at it, and a membership audit compares each emitted list block with the lists decode will read back, reporting a split or a merge.
- `insert` and `upsert` give the item they create the identity the neighbor join rule resolves. The AI paths run their code from before this plan, which relied on the deleted correction, and the next iteration plans their landing again.
- The list's outdent clears its own fields when an item leaves the top level, and indent's Tab and Shift+Tab become shortcut handlers.

## Decision ledger

| Surface | Current | Target | Owner | Reason | Adoption | Proof | Risk | Verdict |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Markdown list boundary | Default list plus a forced `listRestart` per list | A fresh `listId` per list family; a non-1 start as `listStart` | `BaseListPlugin` Markdown decode | One encoding for a separate list; the probe's Backspace, move and paste cases fail today | Parse specs compare up to renamed ids; law text and docs | Edit, paste, raw-insert and transfer specs; L4 on parsed Markdown | Tests that compared parses by bytes | rearchitect |
| Parse equality | Whole results byte-equal | Equal up to a consistent renaming of generated list ids; completed blocks keep their exact objects | Markdown test support | No doctrine requires byte equality; HTML and `ElementIdPlugin` already generate ids at parse | Continuation, round-trip and streaming specs | Comparator fails a merged-list and a split-list mutant | A comparator that hides a real merge | rearchitect |
| Missing-identity correction | Assigns a neighbor's or a fresh id on structural edits, undo included | None; `insert` and `upsert` assign identity themselves | `BaseListPlugin` | It cannot tell creation from undo, and Yjs skips it | AI generated lists stop joining the list above | Undo and redo spec; insert specs | A raw write that relied on the join | cut |
| Serializer claims | Splits task from bullet; claims a forced restart and a start of 1; claims `listId` unconditionally; writes starts Markdown cannot read | Unordered grouping; starts kept within nine digits outside table cells; a `listStart` claimed only where the written list starts; a per-call audit reports split and merged lists with ids | Markdown serializer | A parsed list must round-trip as one list, and a loss must be reported | None | Round-trip and diagnostic specs | New export warnings | rearchitect |
| AI list membership | Parse output joins neighbors through the correction; formatting copies the source's list facts onto block 0 even over an AI list | Planned in the next iteration, `2026-10-11-ai-list-landing.md`; the code here is back to before this plan | `AIChatPlugin` | Three diff panel rounds kept breaking the join, so the panel rule sends it back to planning | None | The 1.6 specs, failing until that iteration lands | A list the AI writes can split until then | moved |
| Indent `update` verbs | `change`, `increase`, `decrease`, `tab`, `untab` | `increase`, `decrease` | `BaseIndentPlugin` | No outside caller for the other three | Docs, spec, API reference | Typecheck, teaching sweep | Outside callers break | cut |
| HTML continuation by start number | `<ol start=N>` after a list with N−1 items joins it | Keep | `BaseListPlugin` HTML decode | Serves Google Docs paste | None | Existing specs | A separate list that starts at N joins | keep |
| Chunk layer | Per-level lanes in chunks | Keep | `listNumbering.internal.ts` | A single list still reaches 10,000 items and 5,000-item pastes | None | Existing slow lines | Code size | keep |

## Steps

Every step names its proof. The build runs in two phases, each ending with a keep or revert decision. Before writing or changing a test, the build loads `verify` and reads `.agents/pstack/rules/tests.md`; before touching a format mapping, it loads `plate-plugins`; before a docs edit, `plate-docs`.

### Phase 1: a separate list is always its own id

- [x] 1.1 Add failing tests. In `BaseListPlugin.spec.tsx`: parse "1. A, 2. B, Note, 1. C, 2. D" as Markdown, then Backspace at the start of C, and separately move C below D, and assert D shows 1, then 1 and C 2, tagged `EDIT-LIST-START-MD-401`; load `parse(md1)` with `value.replace`, insert `parseSlice(md2).slice.content` with `tx.nodes.insert` after a paragraph, assert the two lists carry different `listId` values, then Backspace at the second list's first item and assert the next item shows 1; and for id-less numbered A, a Note and id-less numbered B, delete B, undo and redo, and assert the value and B's number 2 come back exactly. In the list clipboard specs, paste the same Markdown through `parseSlice` and `slice.replace` away from a list and into an empty item of an existing numbered list, and assert two lists, A and B joining the landing list, and D at 1 after Backspace at C. In the transfer specs, copy a list between two editors loaded from separate parses, assert it keeps an id the destination's lists do not use, and Backspace at its first item without the rest joining another list. Proof: `proof-worktree.mjs --expect-fail` at the build base fails each case by its title.
  Done: all seven cases fail at the build base `c01399d08b` by title (`artifacts/2026-10-11-list-first-principles/build/base-11-a1.log`); each failure is its named defect, a later item counting on from the list above, the pasted lists joining the landing list, or undo giving the restored item a fresh id.
- [x] 1.2 Move `nameListIds` (`apps/www/src/__tests__/package-integration/list/nameListIds.ts`), which renames each distinct `listId` to its first-seen order, to the test owner both `packages/platejs` specs and the www integration specs reach, or keep one copy per package if no shared owner accepts it. Move `markdownContinuation.spec.ts`, `MarkdownPlugin.spec.ts`'s parse-equality cases, the round-trip specs that hold lists (`standardList.spec.ts`, `gfmSurface.spec.ts`, `commonmarkSurface.slow.ts`, `paragraphBreaks.spec.ts`) and `markdown-streaming-demo.spec.tsx` onto it, and replace `withoutListIds` in `streamInsertChunk.slow.tsx`, keeping every `toBe` reuse assertion exact. Add list-bearing continuation fixtures for a discarded range, a full fallback and a loss-policy change. Add a case where a completed numbered list stays the same object, with the same `listId`, while an unrelated tail grows and through the strict final parse. Proof: the helper fails a mutant that merges two lists and one that splits a list; the completed-list case fails a mutant that reconverts completed list segments; the moved specs pass at the build base.
  Done: one copy per package, since `@platejs/test` is published; the platejs copy also exports `nameDocumentListIds`. The comparisons whose parses hold lists moved: the continuation spec, `commonmarkSurface.slow.ts`, `standardList.spec.ts`, `taskList.spec.ts`, the www streaming demo and `streamInsertChunk.slow.tsx`. `gfmSurface.spec.ts`, `paragraphBreaks.spec.ts` and `MarkdownPlugin.spec.ts` compare list-free sources and pass unchanged. Each new fixture puts one list in a reused segment and one in a reconverted segment, on a discarded range, a definition's full fallback and an allow-to-strict policy change; node reuse confirms each path (`artifacts/2026-10-11-list-first-principles/build/probe-list-paths-a1.log`). Every mutant is caught (`build/mutate-1-2-a1.out`): one id per parse and one id per item fail the edge-case and table specs, a per-parse counter fails all three fixtures, and reconverting completed list segments fails only the completed-list case. At the build base the moved specs pass; only the new case's id assertion fails there, since base items carry no `listId` (`build/moved-specs-at-base-a1.log`).
- [x] 1.3 In `BaseListPlugin.ts`'s Markdown decode, give each list family a fresh id from `createListId()`, the first sublist under an item its family's id and a later sublist a new one, and write a non-1 start as `listStart`; write no `listRestart`. Table cells decode their lists through the same mapping. Update `deserializeMdList.spec.tsx` and its snapshot, and `table.spec.ts`, `convertNodesSerialize.spec.ts` and `markdownConformance.spec.ts` where they expect a parsed `listRestart`. Proof: the Markdown partition passes, the 1.1 edit, raw-insert and transfer cases pass, and the 1.2 continuation fixtures pass.
  Done: table cells take the decoder change with no code of their own. `deserializeMdList.spec.tsx`, `table.spec.ts`, the stream numbering case and `parseMarkdown.slow.tsx` now expect named ids and `listStart`. The empty-list and todo snapshot cases and their snapshot file are cut, since the edge-case and task-list specs cover them. `convertNodesSerialize.spec.ts` and `markdownConformance.spec.ts` feed `listRestart` to the serializer, so they wait for 1.5. The `markdown`, `table`, `ai-react` and `standard-list-react` partitions pass, with the six 1.1 Markdown cases; `standard-list` fails only the 1.1 undo case, which 1.4 fixes (`build/partition-*-a1.log`). A combined run of www specs fails five DOCX round-trip cases and one import identically at `HEAD`, so those failures predate this change (`build/www-markdown-base-a1.log`).
- [x] 1.4 Delete the list `children` correction. Add one helper in `listIdentity.internal.ts` that gives each id-less list item a command inserts the identity the neighbor join rule resolves, in document order, inside the same transaction; it is `readMissingListIdentity` applied to the inserted entries. `insertList`, which `insert` and `upsert` share, calls it. Rewrite the spec "gives an item an edit inserts without an id the list it lands in" (`BaseListPlugin.spec.tsx` line 1583) to the new contract: a raw insert of an id-less item between two items of list `a` stays in the default list. Drop `listId: expect.any(String)` from "repairs incompatible list properties and keeps starts latent", since `value.repair()` no longer assigns list ids; blast radius found these two the only specs of 296 that depend on the correction (`artifacts/2026-10-11-list-first-principles/blast/spike-no-correction-a1.log`). Proof: the 1.1 undo case passes; specs that `insert` an item after a list item with an id, after a Note and beside an id-less item pass on `nodes.insert`, `blocks.insertAfter` and the empty-block replacement path; and the `standard-list` and `standard-list-react` partitions pass.
  Done: the helper is `joinInsertedListItems`. `insertList` finds the item it inserted with `tx.nodes.get(element)`, since insertion keys the node by the object it came from, on every placement. One `it.each` inserts after an id-less item, an item of list `a` and a Note, after a block, at a path, at the end of a block and in place of an empty block. All four placements fail when the helper stops setting identity (`build/mutate-1-4-a1.out`). The undo case passes, the `standard-list`, `standard-list-react`, `markdown`, `table` and `ai-react` partitions pass (`build/partition-*-a2.log`), and the whole platejs suite passes, 137 of 137 tasks (`build/platejs-all-a4.log`). One earlier suite run timed out the 500-document migration case at 5.9 seconds under parallel load; alone it takes 3.4 seconds, as at `HEAD`.
- [x] 1.5 In the Markdown serializer, group list items by ordered against unordered in `convertNodesSerialize.ts` and `listToMdastTree.ts`, so task and bullet items of one id stay one list. Stop claiming `listRestart`, and stop claiming `listStart` when it is 1, since decode omits a start of 1. Write an ordered list's start only when its first and last markers stay within the nine digits CommonMark reads and do not go negative; otherwise write the list from 1 and report its start. Keep one map from source list to decoded list for the whole serialize call, lists in tables, quotes and columns included, built from the nesting decode reads back: a top-level list and a later sublist are new lists, and a first sublist joins its parent's list. Report, once per lost list, a source list with an id that splits into several decoded lists and a decoded list that merges several source lists, with the `markdown-property-omitted` diagnostic; a split that a forced restart causes reports only the restart, and a pure renaming reports nothing. Id-less items are not audited, so hand-written values with two lists do not warn on every serialize. Proof: specs that round-trip "- plain, - [ ] task, - plain again" as one list; that serialize a forced restart, an explicit start of 1, a list with an id continued past a paragraph, a first sublist whose id differs from its parent's, and two items starting at 999,999,999, and get one warning each; and that round-trip "1. a", "   - b", "2. c" with no warning. Each warning case fails at the build base.
  Done: `listToMdastTree.ts` keeps the audit per serialize call, keyed by the call's `operation`, and `serializeMdWithRuntime` reports it once after the tree is built. Each id'd item records the Markdown list it lands in. A first sublist reads back as its parent's list, and a list a forced restart opened counts as the list before it, at the top level and under a parent item, so a restart reports only the omitted `listRestart`. The start check runs after each list's items are in and covers table-cell lists, which `listToMdastTree` also builds. The specs pass, and all five warning cases fail at the build base by title (`build/base-15-a1.log`). `convertNodesSerialize.spec.ts` now expects task and bullet items as one list, and the www rich serialize snapshot changes one bullet for the same reason. The platejs suite passes, 137 of 137 tasks (`build/platejs-all-a5.log`).
  Deviation from the approved step, after diff panel round 1: typing "1. " writes `listStart: 1`, so a warning for an explicit start of 1 fired on every typed numbered list. Serialize now claims a `listStart` equal to the start it writes, 1 included, and that warning case became a no-warning spec. The nine-digit check moved to the finished Markdown tree, so a list in a table cell, which Plate writes as HTML, keeps any start. The membership audit resolves continued lists in a loop instead of recursion (`artifacts/2026-10-11-list-first-principles/panel-diff-1/md-tests-after-fix-a1.log`; before the fixes, `artifacts/2026-10-11-list-first-principles/panel-diff-1/md-tests-before-fix-a1.log` fails both new cases).
- Moved to the next iteration, its approved proof no longer holding: 1.6 AI output takes list membership the way list commands do, as the deleted correction did today. Before inserting parsed output, the AI paths remove each list item's parsed `listId` and `listLevels`, and after inserting they run the 1.4 helper on the inserted items, dropping a parsed `listStart` from an item that joins an existing list. This covers insert below with any format, Replace and Accept on selected blocks, Replace and Accept across a text selection, Accept in insert mode and the suggestion draft. `createFormattedBlocks` copies the source block's properties onto an output block only when that block carries no `listType`, so formatting never overwrites a list the AI wrote. `parseSuggestion` removes the parsed list's `listId`, `listLevels`, `listStart` and `listRestart` before merging, so a source item keeps its own list facts by index, as it does today. Table cell Accept keeps the cells' parsed ids, which are fresh per parse. Proof: AI specs with `ListPlugin` installed, each failing at the build base: `insertBelow()` with no arguments places a three-item numbered list below item 3 of a list and it continues 4, 5, 6; Replace on one selected numbered item whose output reads "2. …" leaves the next item at 3, and after the item before it is removed the replaced item shows 1; Replace on two selected items keeps the item after them counting on; Replace across a text selection over items 2 and 3 keeps item 4 counting on; Replace of a numbered item with two task items keeps both as tasks with their checkboxes; and a text rewrite of two items keeps the list's id and a latent start and takes the text-patch path.
  Done: every AI path strips the parsed `listId` and `listLevels` from the top-level blocks of its output, `parseSuggestion`'s unmatched nodes and the detached and insert-mode outputs included, then joins what it inserted through `joinInsertedListItems`. Insert-mode Accept reads its inserted entries by path, since `tx.nodes.replace` copies nodes. The suggestion draft and a Replace across a text selection write through `tx.slice.replace`, which skips the paste middleware, so `replaceOutputSlice` joins the blocks from the selection's start block to the block the selection ends in. That case also showed the paste middleware reading a range across blocks as no block, so its landing now reads the range's start; a paste over two items covers it. `ai/react` now imports `standard/list`, an edge added to the entrypoint DAG. Six AI cases and the paste case fail at the build base; a seventh, Accept in insert mode, passes there through the deleted correction and guards the new join (`build/base-16-a1.log`). Each of ten mutants fails its own case (`build/mutate/*-a1.log`, the last in `build/mutate-1-6-a2.out`). The platejs suite passes except the 500-document migration case, which timed out at 9 seconds under a load average of 20 and passes alone (`build/platejs-all-a7.log`, `build/migrations-a2.log`). The www Markdown, AI and stream specs fail only the five DOCX cases that fail at `HEAD` and the `ToolbarMenuGroup` load error, which also fails at `HEAD` (`build/www-markdown-a3.log`, `build/www-stream-a4.log`).
  Deviation from the approved step, after diff panel rounds 1 and 2: AI output no longer joins after insertion. Before inserting, `landOutput` adds the landing list item's depth less one to every output list item, then gives the output's lists their ids through `remapLandingLists`, the helper the paste middleware also calls. The first list joins a compatible landing item, and every other list keeps a fresh id. The landing is the block the output goes below, the first block it replaces, the block a text selection starts in, the first source block of a suggestion, or, for insert mode over an empty paragraph, the block above it. A joined first item takes the replaced landing's `listStart`, or none when the landing stays. Round 1's batch join after insertion broke cases that the round 2 seats reproduced on round 2's frozen tree (`artifacts/2026-10-11-list-first-principles/panel-diff-2/probe-round2-frozen-a3.log`): separate lists of one response merged, a replaced head lost its start, a 65-item response stopped joining, a text rewrite moved the user's own block to another list, and a suggestion still flattened a nested item, as it did before this plan. The six specs for them fail on that tree (`artifacts/2026-10-11-list-first-principles/panel-diff-2/round2-base-a1.log`) and pass after (`artifacts/2026-10-11-list-first-principles/panel-diff-2/ai-lists-round2-a1.log`); round 1's five cases still pass, and they failed before round 1 (`artifacts/2026-10-11-list-first-principles/panel-diff-1/ai-tests-before-fix-a1.log`).
  Reverted after diff panel round 3, with the claim narrowed. The seats found four more ways the landing broke a list, and round 2 had already replaced the approach once, so the panel rule takes it out of this plan. A suggestion that turns a paragraph into a list split it in two. A response whose first list sits in a table moved the replaced start to a later list. A suggested rewrite of a nested item pushed the shallower item after it into the sublist. A text replace that removed a list head dropped its start. Each fails on round 3's frozen tree (`artifacts/2026-10-11-list-first-principles/panel-diff-3/probe-round3-frozen-a2.log`). `AIChatPlugin.ts` is back to its code before this plan, and the paste middleware is back to the inline form rounds 1 and 2 reviewed. That code relied on the deleted correction, so until the next iteration lands, a list the AI writes can split. Formatting copies the source block's list facts onto the first output block, and the other items keep their parse's fresh id. Every 1.6 spec fails on the reverted tree (`artifacts/2026-10-11-list-first-principles/panel-diff-3/ai-lists-reverted-a1.log`). The next iteration, `2026-10-11-ai-list-landing.md`, plans AI landing again with its own panel, and this plan closes after it lands.
- [x] 1.7 Freeze a budget amendment in `artifacts/2026-10-11-list-first-principles/perf/` before any candidate run, carrying the L4 rule (at N = 3,000, the p50 index update stays within 1.15 times the N = 10 p50 plus 0.005 ms) onto a new cohort of real parsed Markdown at N = 10, 100, 1,000 and 3,000 lists of ten, in the main root and in a named root, with this run's own copy of the lanes probe. While each inserted item exists, assert its list, the numbers after it and the untouched neighbor lists. Count lane work and assert no other list's lanes are read. Time the index update and the whole insert separately; only the index lines gate. Two controls must fail: the old encoding, which keeps the numbers right and does work across all lists, and an insert given a wrong fresh id, which must fail the correctness check. Measure parse time, the first index build and retained heap at N = 3,000 against the old encoding, with limits frozen in the same amendment. Keep the single 10,000-item list, the 5,000-item paste and the multi-level cohorts. I8, which fails on the frozen tree for a reason this plan does not touch, stays failed with its open item. Proof: the index lines and the allocation limits pass for the shipped arm in the main root and both controls fail; the named-root and whole-insert numbers are reported against the subject's open Plite item; a loaded host makes timing inconclusive and the claim narrows to the work count.
  Done, narrowed: `perf/budget-amendment-5.md` froze the lines after two baseline runs at the build base and before any candidate run. In two candidate runs at a 1-minute load of 5.6 and 4.4, every insert among N parsed lists reads one lanes object of at most 11 entries and does 45 work units at every N, numbers stay right while the item exists in the main and a named root, and the inherited lines pass except I8 and L4's report-only time line. M2 fails in both runs: the index update's p50 goes from 0.0145 to 0.0295 ms. An insert into the last list, which shifts 6 blocks, slows like one into the middle list, which shifts 16,495, and `pathOf` calls stay at 63 per insert, so the time comes from the same work running slower in a bigger document, not from shifted paths or more work (`perf/m2-diagnose-a2.log`); the Defaults row `m2-profile` accepts it. In three allocation-only pairs, parse and the first build show no measurable difference and retained heap at N = 3,000 is 89.4 to 90.0 MB against 87.1 to 87.7 MB (`perf/allocation-a*-a1.log`). Each of the six known-bad arms fails its own line. Reported against the subject's open Plite items: the named root's update takes 0.38 ms at N = 10 and 225 ms at N = 3,000, as at the base, because that root's index rebuilds on every commit, and the whole insert takes 0.43 to 8.1 ms, as at the base (`perf/candidate-a2-a1.log`). Two harness repairs happened after candidate data existed: in Bun, `process.memoryUsage().heapUsed` reads 0 for a 7.5 MB `Map`, so the probe reads JSC's `heapStats()`, and A3 counts only processes that run the allocation lines alone, because the full runs' heap rounds split into a 44 MB and a 90 MB mode.
- [x] 1.8 Reconcile the law: rewrite `EDIT-LIST-START-MD-401` in `markdown-editing-spec.md` so parse gives each list its own id and its start as `listStart`, tag the 1.1 and 1.3 tests, and update `current-evidence.md`. Through `plate-docs`, rewrite the Markdown paragraph of `list.mdx`'s "HTML and Markdown" section and its Chinese twin, which teach id-less parsed items separated by `listRestart`, and add to `markdown.mdx` after its streaming section that each parse gives every list a new `listId` and that two parses of one source are equal up to their list ids; mirror both in the Chinese twins. Add a changeset through `changeset`. Proof: `pnpm kb check`, the docs checks `plate-docs` names, and the changeset check pass.
  Done, with two deviations: `EDIT-LIST-START-MD-401` now says parse gives each list a new `listId` and a start other than 1 as `listStart`, and serialize reports the starts, forced restarts and list membership Markdown cannot carry. The 1.1 Markdown cases and the start cases carry its tag. `current-evidence.md` maps all `EDIT-LIST-*` rules to the list review scope and has no row per rule, so it stays unchanged. `list.mdx`, `markdown.mdx` and their Chinese twins teach the new ids, `listStart`, which items serialize writes as one list and what it reports. Instead of a new changeset, the unreleased `list-scoped-api` and `markdown-plite-runtime` changesets now describe the parse output and the serializer, as `changeset` says for an unreleased change. Deleting the list snapshot file left a K7 in `docs/research/review-scopes/markdown.json`, which now drops that member. `pnpm kb check` then reports one finding, a K7 in `docs/plans/topics/emoji.md` that HEAD reports too, accepted under the Defaults row `kb-emoji` (`build/kb-check-a3.log`, `build/kb-check-head-a1.log`). The docs source build, the registry build and its check, the docs parity check and `pnpm changeset status` pass (`build/build-source-a1.log`, `build/build-registry-check-a1.log`, `build/docs-parity-a1.log`, `build/changeset-status-a1.log`). `check:docs` stops at its first link, `api-reference --check`, which reads this checkout's stale `dist`; the same check passes in a worktree that builds the packages first (`build/check-docs-a1.log`, `build/api-ref-check-23-a1-a1.log`).
- Moved to Open work, its approved proof no longer holding: 1.9 Through `plate-ui`, mark the live copied list element (`apps/www/src/registry/components/editor/block-list.tsx` line 50) with `suppressHydrationWarning`, so a client editor that parses Markdown on both server and client hydrates without a warning while the live DOM keeps `data-list-id` for clipboard HTML. Run `pnpm --filter www build:registry`. Proof: a `renderToString` of a client editor that parses Markdown in its value initializer, hydrated by a second parse, logs no hydration warning, and logs one with the flag removed; the clipboard HTML of a copied list still carries `data-list-id`.
  Done: the live `ol` and `ul` carry the flag, with a comment saying why. A probe renders a client editor that parses two Markdown lists in its value initializer, hydrates it with a second parse and copies both lists. With the flag it logs no hydration warning; with the flag removed it logs one (`build/hydrate-19-flag-a2.log`, `build/hydrate-19-noflag-a2.log`). The copied HTML carries the client model's `data-list-id` on every item, because copy serializes the model. The hydrated DOM keeps the server's ids, which still group each list's items, and no package code reads the attribute back from the DOM. The registry build and its check pass (`build/build-registry-check-a1.log`).
  Reverted, with the claim narrowed, after diff panel rounds 1 and 2: round 1 replaced the flag with a `data-list-id` the element wrote after mount, because the flag left the server's ids in the hydrated DOM. Round 2 found that the default static export, which renders the live element, then wrote no list id at all, since a ref never runs on the server, and interleaved lists merged on re-import (`artifacts/2026-10-11-list-first-principles/panel-diff-2/export-ids-frozen-a2.log`). The element has its attribute from before this plan again, with no flag and no ref: the export keeps its ids (`artifacts/2026-10-11-list-first-principles/panel-diff-2/export-ids-reverted-a1.log`), and an app that parses Markdown on the server and again on the client gets one hydration warning while the hydrated DOM keeps the server's ids (`artifacts/2026-10-11-list-first-principles/panel-diff-2/hydrate-reverted-a1.log`). Open work tracks that case.
- [x] 1.10 Phase exit: keep when 1.1 to 1.9 pass; otherwise revert the phase. Proof: decision row.
  Done: kept, with 1.7 narrowed under `m2-profile` and 1.8's knowledge check under `kb-emoji`; decision row `1.10 keep phase 1`. The phase's code is frozen at `69b2046579` (`build/freeze-16.sha`), the tree 1.7 measured.

### Phase 2: indent's commands

- [x] 2.1 Add guard tests that pass at the build base: in `BaseIndentPlugin.spec.ts`, Tab and Shift+Tab through the shortcut pipeline indent and outdent a paragraph; in `BaseListPlugin.spec.tsx`, the list's outdent at the top level clears the item's list facts. Proof: both pass at the build base and after 2.2, and a mutant that drops the shortcut handler fails the first.
  Done, with one deviation: the Tab and Shift+Tab case replaces the spec's case that called `update.tab` and `update.untab`, instead of joining it, and presses the keys through `dispatchPlateShortcut`. The list case outdents a root numbered item that carries a forced restart, a latent start, levels and a style, and a root task item, and expects a plain paragraph. All three pass at the build base (`build/base-21-a1.log`) and after 2.2, and dropping either shortcut handler or the outdent's unset fails its own case (`build/mutate-2-1-a1.out`).
- [x] 2.2 In `BaseIndentPlugin.ts`, delete `update.change`, `update.tab` and `update.untab` and the `setNodeProps` and `unsetNodeProps` options; move Tab and Shift+Tab into shortcut handlers. In `BaseListPlugin.ts`, the outdent calls `indent.decrease` and clears the list fields itself when an item leaves the top level. Move the `BaseIndentPlugin.spec.ts` calls to `change`, `tab` and `untab` (lines 89, 197 to 202 and 251) onto `increase`, `decrease` and the shortcut pipeline, and delete its `setNodeProps` and `unsetNodeProps` cases. Proof: the 2.1 tests pass, the list and indent specs pass, and `pnpm --filter platejs typecheck` passes.
  Done: `IndentChangeOptions` keeps only `nodes`, `update` keeps `increase` and `decrease`, and the plugin's `tab` and `untab` shortcut handlers keep the old rule that Shift+Tab on an unindented block inside a quote falls through to the quote. The list's outdent decreases the indent, then unsets the list fields of each block left with no indent; a block without those fields records no commit (`build/unset-absent-a2.log`). The indent spec's `change` call is now `increase`, `tabbable.spec.ts` checks `increase`, and the range case drops the `setNodeProps` and `unsetNodeProps` options and the test property they wrote, and checks indents only. The list and indent specs pass (`build/list-indent-spec-a3.log`), and the platejs typecheck passes with none of its 90 tasks cached (`build/typecheck-platejs-force-a3.log`).
- [x] 2.3 Through `best-api repair` and `plate-docs`, remove `update.change`, `update.tab` and `update.untab` from `indent.mdx` and `indent.cn.mdx`, run `node tooling/scripts/teaching-sweep.mjs` on the three names, run `pnpm --filter www build:registry` so the generated registry stops teaching them, regenerate the API reference manifest as `verify`'s command recipes say, rewrite the pending `.changeset/indent-v54-runtime.md` migration line that teaches `editor.update.indent.change`, move `tabbable.spec.ts` line 56 off `update.indent.change`, and add a changeset. Proof: the sweep lists no live teaching, and the docs checks, `pnpm --filter www api-reference --check` and the changeset check pass.
  Done, with one deviation: no new changeset, since the unreleased `indent-v54-runtime` changeset now tells users of `setIndent` to call `increase`, `decrease` or `editor.update.nodes.set({ indent })`, and to move `setNodesProps` and `unsetNodesProps` into `tx.nodes.set` and `tx.nodes.unset` in the same update. `VISION.md` and `docs/vision/` never taught the removed verbs. The sweeps on the verbs and on the two options list no live teaching: the remaining hits are `IndentChangeOptions`, which stays, the `tab` and `untab` shortcut entries, older plans and this plan (`build/sweep-23-verbs-a2.txt`, `build/sweep-23-props-a2.txt`). The manifest, regenerated in a worktree that builds the packages, passes its check there (`build/api-ref-23-a1-a1.log`, `build/api-ref-check-23-a1-a1.log`); the checkout's copy was also behind HEAD's list exports. The registry and docs checks are 1.8's, and `pnpm changeset status` passes (`build/changeset-status-a1.log`).
- [x] 2.4 Phase exit: keep when 2.1 to 2.3 pass; otherwise revert the phase. Proof: decision row.
  Done: kept; decision row `2.4 keep phase 2`. The phase's code is frozen at `aeccceddc7` (`build/freeze-22.sha`), the tree the 2.1 mutants ran on.

### Close

- [x] Writing passes: `deslop`, then `no-comments` on product code; `unslop` on docs and this plan.
  Done: the decision log's `writing` rows, with comment-sicko's report in `artifacts/2026-10-11-list-first-principles/no-comments/sicko-a1.md`.
- [x] Panel on the diff, because the plan changes a public API (reviews: api-build).
  Done: three rounds, the cap, in `artifacts/2026-10-11-list-first-principles/panel-diff-1/` to `panel-diff-3/`.
- [x] `pnpm lint:task` on this task's files, and the `pnpm check` steps the edits reach.
  Done: `artifacts/2026-10-11-ai-list-landing/final/lint-task-checkout-a1.log` and the `pnpm check` steps gate below.
- [x] Close, fold into `docs/plans/topics/list.md`, update `2e865a0bc4:docs/research/decisions/list-ownership.md` through `research`, and run the decision-trail review when a rule triggers it.
  Done: this Close, the fold into `docs/plans/topics/list.md`, `2e865a0bc4:docs/research/decisions/list-ownership.md`, and the review in `artifacts/2026-10-11-ai-list-landing/trail/answer-codex.txt`.

## Start Gates

| Gate | Applies | Evidence |
| --- | --- | --- |
| Performance pack selected | yes | Parsed Markdown lists change how many lists the per-root index holds; the index runs on every structural commit |
| User-facing operation and runtime owner identified | yes | Markdown parse, paste, raw insert, transfer and AI insert; Backspace and moves at a list's first item; undo; owner `listIndex.internal.ts` and the Markdown decoder |
| Scale variables and cohorts fixed | yes | N parsed Markdown lists of ten at N = 10, 100, 1,000 and 3,000 in the main root and a named root; one 10,000-item list; a 5,000-item paste |
| Budget frozen before target measurement | yes | The L4 rule in `artifacts/2026-10-10-list-import-identity/perf/budget-amendment-4.md`, reused as step 1.7 says |
| Baseline and target probe selected | yes | `artifacts/2026-10-10-list-import-identity/perf/list-lanes.probe.spec.ts`, extended with a parsed-Markdown cohort and assertions while the inserted item exists |
| Correctness guard selected | yes | The renaming comparator over continuation and round trips, and the index's fresh-count property test |
| Production detector decision recorded | N/A | No runtime detector owns numbering; work counters are the guard |

## Completion Gates

| Gate | Applies | Required action | Evidence |
| --- | --- | --- | --- |
| Pre-acceptance scale proof | yes | Step 1.7's parse, first-build and retained-heap limits at N = 3,000, since 3,000 lists allocate 3,000 sets of lanes | `artifacts/2026-10-11-list-first-principles/perf/allocation-a*-a1.log`: A1 to A3 pass in three pairs; retained heap rises 2 to 3 MB |
| Large/stress scaling | yes | Step 1.7 | `artifacts/2026-10-11-list-first-principles/perf/candidate-a2-a1.log`: I4, I7 and L1 to L5 pass; M1 flat to N = 3,000; M2 accepted under `m2-profile` |
| Correctness guard | yes | Steps 1.1 to 1.5; 1.6 and 1.9 moved out | `artifacts/2026-10-11-list-first-principles/build/platejs-all-a7.log`: the platejs suite passes but the 500-document migration case, which passes alone (`build/migrations-a2.log`); the final acceptance after the AI landing iteration repeats that result on the final bytes: 135 of 137 tasks pass, the build base fails the same way (`artifacts/2026-10-11-ai-list-landing/final/test-platejs-base-continue-a1.log`), and the migrations partition passes alone (`artifacts/2026-10-11-ai-list-landing/final/test-platejs-continue-a1.log`, `artifacts/2026-10-11-ai-list-landing/final/test-migrations-alone-a1.log`) |
| Performance regression check | yes | Step 1.7 | `artifacts/2026-10-11-list-first-principles/perf/known-old-encoding-a1.log` and `candidate-a2-a1.log`: the index update at N = 3,000 takes 0.030 ms, against 0.080 ms for the old encoding |
| Blast radius before code moves | yes | `pstack:blast-radius` on the parse output, the deleted correction and indent's removed verbs | `artifacts/2026-10-11-list-first-principles/blast/spike-no-correction-a1.log`; decision row `blast radius` |
| Hard-cut sweep | yes | Callers, exports, tests, docs, examples and generated output of indent's removed verbs | `artifacts/2026-10-11-list-first-principles/build/sweep-23-verbs-a2.txt` and `build/sweep-23-props-a2.txt`: no live teaching; the registry output and the manifest drop the verbs |
| `best-api repair` | yes | Indent's public `update` changes and Markdown parse output | Steps 1.8 and 2.3: the Vision files never taught either shape; the spec rule, docs, changesets, registry output and API manifest teach the new ones (`artifacts/2026-10-11-list-first-principles/build/api-ref-check-23-a1-a1.log`) |
| `plate-docs` on affected pages | yes | `list.mdx`, `markdown.mdx`, `indent.mdx` and their Chinese twins | `artifacts/2026-10-11-list-first-principles/build/build-source-a1.log`, `build/build-registry-check-a1.log` and `build/docs-parity-a1.log` pass |
| `pnpm check` steps the edits reach | yes | Typechecks, barrels, knowledge and registry steps before the acceptance run | `artifacts/2026-10-11-ai-list-landing/final/typecheck-platejs-a3.log` (90 of 90), `artifacts/2026-10-11-ai-list-landing/final/entrypoint-check-final-a1.log` after regenerating the configs, `artifacts/2026-10-11-ai-list-landing/final/registry-check-live-a1.log`; `artifacts/2026-10-11-ai-list-landing/final/kb-check-live-a1.log` fails only on K7 in another subject's `topics/emoji.md`, as at the build base |
| Slice freezes | yes | `freeze.mjs` after each phase | `artifacts/2026-10-11-list-first-principles/build/freeze-16.sha` (phase 1, `69b2046579`) and `build/freeze-22.sha` (phase 2, `aeccceddc7`) |
| Type-aware oxlint before the diff panel | yes | `pnpm exec oxlint --type-aware --format=default` on the task's lintable files | Ran on all 29 files only after the panel, on the final bytes: 0 warnings and 0 errors (`artifacts/2026-10-11-ai-list-landing/final/oxlint-type-aware-a2.log`); before it, each round ran it on the files it changed |
| Diff panel | yes | `api-build` row: a panel on the build's diff | Three rounds, the cap: `artifacts/2026-10-11-list-first-principles/panel-diff-1/` to `panel-diff-3/`, with their `seats` rows in the decision log |
| Last lint fix | yes | `pnpm lint:task` on the task's files | `artifacts/2026-10-11-ai-list-landing/final/lint-task-checkout-a1.log` on the 29 lintable files of both plans |
| Decision-trail review | yes | Plan panel round 3 left a critical finding open | `artifacts/2026-10-11-ai-list-landing/trail/answer-codex.txt`: five warnings and one nit, each confirmed and fixed; the `trail` rows of both decision logs |
| Changesets | yes | `changeset` for the parse output, the correction and the indent cut | The unreleased `list-scoped-api`, `markdown-plite-runtime` and `indent-v54-runtime` changesets amended; `artifacts/2026-10-11-list-first-principles/build/changeset-status-a1.log` passes |
| Review ledger | yes | `node tooling/scripts/review-ledger.mjs check` after the Close | `artifacts/2026-10-11-ai-list-landing/final/review-ledger-check-a3.log`: neither list plan fails; the check fails only on seven older plans, the same seven it named before this Close (`final/review-ledger-check-a1.log`) |

## Close

Reversals and deviations first. Step 1.6, AI list output, was built, replaced after diff panel round 1, then reverted after round 3 and moved to `2026-10-11-ai-list-landing.md`, which built it again with its own narrowed claims. Step 1.9, the hydration flag on the live list element, was reverted after rounds 1 and 2 and moved to Open work, and `partial` rows mark the flag's proof and round 1's client-id proof as voided. Step 1.5 claims a `listStart` equal to the start it writes, 1 included, because typing "1. " writes one. Steps 1.8, 2.1 and 2.3 each record a deviation in their Done line. Step 1.7 is narrowed under `m2-profile`: the index does the same work at 10 and 3,000 lists, while its time doubles. Type-aware oxlint ran on all 29 lintable files only after the diff panel, with no finding; each panel round had run it on the files it changed. The landing iteration replaced this plan's paste rule: the first top-level pasted list joins, with the heading role checked, where this plan kept the first list anywhere.

What landed:

- Markdown decode gives each list family a fresh `listId` and writes a start other than 1 as `listStart`, as HTML decode does. The serializer groups by ordered against unordered lists and audits list membership against what decode reads back.
- The list `children` correction is gone. `insert` and `upsert` give the item they create the neighbor join rule's identity through `joinInsertedListItems`.
- Indent's `update.change`, `update.tab` and `update.untab` are cut, Tab and Shift+Tab are shortcut handlers, and the list's outdent clears its own list facts at the top level.
- `EDIT-LIST-START-MD-401`, the list, Markdown and indent docs pages with their Chinese twins, the registry output and three unreleased changesets teach the new shapes.

Proof and its limits:

- The final acceptance, on the frozen tree `93cdf6628a` plus the landing iteration's round 3 files and the last lint fix, passes 90 of 90 platejs typecheck tasks and 135 of 137 platejs test tasks, and type-aware oxlint finds nothing. The one failing test, "keeps the numbers of 500 random documents", times out only under turbo's parallel run. The build base fails the same way (`artifacts/2026-10-11-ai-list-landing/final/test-platejs-base-continue-a1.log`), and the test passes alone. A follow-up numbers all 500 documents in one editor, which takes that case from a median 3.04 s to 1.41 s, and the full parallel run then passes 137 of 137 twice where the base failed once in two (`artifacts/2026-10-11-migration-test-speed/`).
- The entrypoint check passes once the configs are regenerated, the registry check passes on the live checkout, and the knowledge check fails only on another subject's `topics/emoji.md`, as at the build base (`kb-emoji`).
- Step 1.7's scale lines hold every work count flat to 3,000 lists, while M2's time line fails under `m2-profile`.
- Two parses of one Markdown text are equal only up to their list id strings, and a client that parses on the server and again on the client warns at hydration (Open work).

Review inputs. This plan continues `docs/plans/2026-10-10-list-review.md` and `docs/plans/2026-10-10-list-import-identity.md`, and read `VISION.md`, `docs/vision/common.md` and `docs/vision/plate.md` for the redesign law. It changed `packages/platejs/src/markdown/lib/internal/markdownConversion.ts`, `packages/platejs/src/markdown/lib/serializer/convertNodesSerialize.ts` and `packages/platejs/src/markdown/lib/serializer/listToMdastTree.ts`, their specs `packages/platejs/src/markdown/lib/deserializer/deserializeMdList.spec.tsx` and `packages/platejs/src/markdown/lib/markdownContinuation.spec.ts`, and `content/docs/(plugins)/(styles)/indent.mdx` and `content/docs/(plugins)/(serializing)/markdown.mdx`. Its AI change to `packages/platejs/src/ai/react/AIChatPlugin.ts` landed through the landing iteration, and `apps/www/src/registry/components/editor/block-list.tsx` is back to its code from before this plan after step 1.9's revert. It read, without changing them, `packages/platejs/src/markdown/lib/internal/markdownSegments.ts`, `packages/platejs/src/migrations/migrateListIdentity.ts`, `packages/platejs/src/ai/react/CopilotPlugin.tsx`, `packages/platejs/src/lib/plugins/element-id/ElementIdPlugin.ts`, `packages/plitejs/src/core/correction.ts`, `packages/plitejs/src/core/transfer.ts`, `apps/www/src/registry/components/editor/block-menu.tsx`, `apps/www/src/registry/components/editor/indent-toolbar-button.tsx` and `apps/www/src/registry/components/editor/tabbable.tsx`, whose uncommitted Tab hunks are another session's.

Of 34 items, the 14 steps, the 4 close boxes and the 16 completion gates, 33 are done and 1 is open: step 1.9, in Open work. Step 1.6 counts as done through the landing iteration. 0 are partial, skipped or blocked. The plan's Open work moved to the subject file.

### Decision-trail review

reviewed by gpt-6.1-sol (xhigh), on frozen commit `985a7c65`, against the transcript. It ran no check that writes. The lead confirmed all six findings and fixed each. Three touch this plan.

- warning: the voided hydration proofs had no `partial` rows. The flag's proof and round 1's client-id proof now have one each.
- warning: the migration timeout's attribution went past its controls. The build base now fails the same way, 135 of 137.
- warning: the new Open work items named no lasting tracker. They moved into `docs/plans/topics/list.md`'s Open work.

The landing iteration's Close lists the other three.

## Open work

Moved to `docs/plans/topics/list.md`'s `## Open work` at the fold on 2026-10-11.

## Challenge delta

Plan panel round 1 (claude-opus-5-5 at high, gpt-6-astra at xhigh, gpt-6.1-sol at xhigh) replaced the target. It rejected counter ids per parse (`md:0`, `md:1`) that a binder swapped for fresh ids at each Plate insertion site. The new target gives each parsed list a fresh random id at decode, compares parses up to renamed ids, and drops the missing-identity correction. Every critical coverage finding rested on counter ids persisting in documents: transfer copies, moves between roots, raw inserts, the streaming recipe and a value built from two parses. The first run had rejected random ids only because the lead tagged whole-result parse equality as law, and no doctrine file states it. Undo of an id-less list also changed numbers through the correction. `pstack:architect` replayed once on that question (`artifacts/2026-10-11-list-first-principles/architect-2/`), and all three runners picked the new target.

The round changed six other things. Copilot binding is cut, because Copilot parses inline only. The outdent rule is cut, because no list-owned mechanism exists and Shift+Tab differs inside a quote. The leading-edge join and toggle-across-Restart steps are cut as unneeded for the defect. Step 1.7 now keeps I8 failed and checks correctness while the inserted item exists. The serializer and AI list facts became steps. The saved-document question is settled, because no released document carries the old Markdown encoding.

Plan panel round 2 (the same seats) improved it. AI binding moved from one item at a time to one list at a time, and it now covers Replace on one and on several items, an added item, a paragraph turned into an item and a list the AI splits. The serializer's loss check became an audit of the lists decode will read back, which catches a first sublist merged into its parent and an id-less list split by a paragraph. An explicit start of 1 is no longer claimed. Completed list objects get their own reuse case, and step 1.7 measures parse, first build and heap. The stale raw-insert spec and the List pages are named. The live list wrapper drops its list id, which removes the hydration mismatch instead of documenting it.

Plan panel round 3 (the same seats), the last plan round, changed it again. Every seat found that list-by-list binding still guessed correspondence and missed paths: the default `insertBelow()`, Replace across a text selection, a numbered item replaced by tasks, a list interrupted by a paragraph and the table branch. The plan dropped the binder. AI output now drops its parse ids and takes membership from its neighbors at insertion, the rule the deleted correction applied, and formatting skips blocks the AI wrote as lists. Two seats showed clipboard HTML reads the live `data-list-id`, so the live element keeps it and turns hydration warnings off. The serializer audit now keeps one map per serialize call, reports each loss once, and skips id-less items. Starts Markdown cannot read are written from 1 and reported. Step 1.7 freezes its own budget amendment. One critical stays open with its patch and owner: an AI rewrite of a list a paragraph interrupts splits it, as it does today.

## Evidence

Model: Claude Opus 5.5 (`claude-opus-5-5`), xhigh effort.

The review read the working tree at `666f02406e`, which held both 2026-10-10 list iterations uncommitted; the owner then committed those bytes unchanged as `c01399d08b`, which `review_commit` names. Two Codex explorers (gpt-6.1-sol at medium) mapped the list owners (`artifacts/2026-10-11-list-first-principles/explorer-A-a1.md`) and indent with every outside reader of list properties (`artifacts/2026-10-11-list-first-principles/explorer-B-a1.md`). A third mapped every path that inserts parsed Markdown (`artifacts/2026-10-11-list-first-principles/explorer-C-a1.md`). The lead read `BaseIndentPlugin.ts`, the Markdown and HTML decode spans, the copied kits, `correction.ts`, `transfer.ts` and the AI spans itself.

- `2026-10-10-list-import-identity`, the head: this review reopens it at one question, how a separate list is stored, because the probe and its own failed L4 line contradict its Markdown lane, and retains the rest. Its lane "Give parsed Markdown lists their own ids" lost on two grounds. "Lanes already bound the Markdown cost" was falsified by its own step 3.2, whose L4 line failed. The other ground, that ids change AI rewrites, paste joins, nested sublists and parse equality, names design costs this plan answers, not laws. Its Word count, lanes and recount stay.
- `2026-10-10-list-review`: retained. Identity membership, the per-root index, the `ol.start` writer, Restart and Continue, and the codec rules other than Markdown's hold on unchanged requirements. Its correction for edit-created items is cut by this plan, because it cannot tell creation from undo.
- `2026-10-04-list-audit-2` and `2026-09-24-list-audit`: retained as the 2026-10-10 review retained them.

### Requirements

- Your ask, verbatim: "list and indent - should we do another pass redesigning from first principles."
- Your 2026-10-10 steer, verbatim: "switch to the most performant algorithm for 10000items. For example N separate lists of 10 items should not affect the perf of inserting in a list. Use the most performant listing counting, with full docx support (non contiguous list items). Redesign from first principles."
- Feature properties stay flat and schema-owned, and `ListPlugin` owns list schema, transforms and format mappings with no parallel persisted list model ([plate.md](../vision/plate.md) lines 702 and 1338 to 1340).
- Derived display state never enters canonical JSON, and inactive author intent is kept ([plate.md](../vision/plate.md) lines 705 to 709).
- A public API offers one way per common operation, and stored fields are API surface ([common.md](../vision/common.md) Taste).
- A continued Markdown parse keeps the node objects of blocks it already completed (`content/docs/(plugins)/(serializing)/markdown.mdx` lines 255 to 264). The whole-result `toEqual` against a fresh parse is a test contract ([`markdownContinuation.spec.ts`](../../packages/platejs/src/markdown/lib/markdownContinuation.spec.ts) lines 69 to 95), not doctrine; no file under `VISION.md`, `docs/vision/` or the editing spec states it.
- Proposed laws: taking an item out of a numbered list leaves one list (`EDIT-LIST-ID-403`), and separate Markdown lists never count as one (`EDIT-LIST-START-MD-401`) ([markdown-editing-spec.md](../editor-behavior/markdown-editing-spec.md) lines 766 and 839).
- Hard cuts beat aliases ([VISION.md](../../VISION.md) Invariants 1).

### Current source

- The list owners hold 3,441 lines: `BaseListPlugin.ts` 1,638, `listNumbering.internal.ts` 725, `listIndex.internal.ts` 593, `listIdentity.internal.ts` 300 and the React writer 185 (explorer A).
- `DEFAULT_LIST_ID` is `''`, so every id-less list item in a root shares one numbering identity, across plain blocks and nested containers. About twenty branches in the list feature, the migration and DOCX export exist for that case (explorer A, Boundaries).
- Markdown decode writes `{ listRestart: start }` on the first item of every top-level ordered list and of every later sublist, and no `listId` ([`BaseListPlugin.ts`](../../packages/platejs/src/features/list/lib/BaseListPlugin.ts) lines 820 to 872). Its comment gives the reason: a parse must equal a fresh parse of the same text. HTML decode gives each list a fresh id from `createListId()` and writes a non-1 start as the conditional `listStart` (lines 489 to 578).
- The 2026-10-10 panel cut Markdown ids because "random parse ids break determinism and SSR" (the first panel warnings row of `2026-10-10-list-import-identity.decisions.tsv`). With `ElementIdPlugin`, a document parse already generates a random block `id` through the schema's `generate-property` repair (`packages/platejs/src/lib/plugins/element-id/ElementIdPlugin.ts` lines 54 to 69).
- The probe on the two-list document "1. A, 2. B, Note, 1. C, 2. D", run from source with no `dist` file loaded (`artifacts/2026-10-11-list-first-principles/separate-lists-edits-a1.log`, probe `separate-lists-edits.probe.ts` beside it):

  | Edit on C | From Markdown | From HTML |
  | --- | --- | --- |
  | Backspace at its start | D shows 3 | D shows 1 |
  | Move below D | D 3, C 1 | D 1, C 2 |
  | Enter at its start, then type X | X 1, C 2, D 3 | X 1, C 2, D 3 |
  | Delete it | D shows 1 | D shows 1 |

  Delete holds on both paths because the `children` correction gives D a fresh id (`artifacts/2026-10-11-list-first-principles/separate-lists-a2.log`), so the subject's open-work item overstates the delete case.
- Pasting the same Markdown through `parseSlice` and `slice.replace` gives both lists one fresh id with a restart on C; pasted into an empty item of an existing list, all four items join that list. Backspace at C then shows D as 3 in both (`artifacts/2026-10-11-list-first-principles/paste-lists-a2.log`). The slice remap treats every id-less item in a slice as one source list (explorer C, section 5).
- Only `editor.update.slice.replace`, `fragment.replace` and the DOM paste lane run the slice remap. AI accept paths, file imports, `value.replace`, primitive `tx.slice.replace` and transfer copies skip it (explorer C, sections 2 and 3; `packages/plitejs/src/core/transfer.ts` lines 385 to 392). Copilot accepts through `parseInline`, which returns one paragraph's children and drops list facts (`packages/platejs/src/ai/react/CopilotPlugin.tsx` lines 184 and 201).
- The list `children` correction assigns a missing identity on any structural edit, and history replay runs corrections, so undo can give a restored id-less item a fresh id; Yjs imports skip corrections (`packages/plitejs/src/history/history-plugin.ts` lines 303 to 311; panel round 1, astra and sol). Among package writers, only `insert` and `upsert` rely on it: toggle and the input rules assign identity themselves (`BaseListPlugin.ts` lines 1087 to 1109 and 1626), and AI generated lists use it to join the list above (census run 2026-10-11, decision log).
- Step 3.2's L4 line failed: an insert among N Markdown lists in the default list took 24 to 28 µs at N = 10 and 69 to 75 µs at N = 3,000, because its search compares paths in one list that holds them all ([import identity Close](2026-10-10-list-import-identity.md)). The same iteration measured a 3,000-item paste at 0.59 ms in chunks against 12.4 ms in plain arrays.
- Indent's `update` has five verbs. Outside its own file, only `increase` and `decrease` have callers: the copied toolbar ([`indent-toolbar-button.tsx`](../../apps/www/src/registry/components/editor/indent-toolbar-button.tsx) lines 19 and 37) and block menu ([`block-menu.tsx`](../../apps/www/src/registry/components/editor/block-menu.tsx) lines 340 and 358). `change`'s `setNodeProps` has no caller outside its spec, and `unsetNodeProps` has one, the list's outdent. `tab` and `untab` are the Tab and Shift+Tab shortcut handlers ([`BaseIndentPlugin.ts`](../../packages/platejs/src/features/indent/lib/BaseIndentPlugin.ts) lines 80 to 217), and a shortcut can take a `handler` instead, as the list's Shift+Tab does (`BaseListPlugin.ts` lines 959 to 973).
- A weak plugin override cannot replace another plugin's `update` (`packages/platejs/src/internal/plugin/resolvePlugins.ts` lines 2008 to 2030), so the list cannot change what indent's `decrease` does to a top list item.

Ingress census, the object each path hands the list owner for a separate list:

| Path | Separate list arrives as |
| --- | --- |
| Markdown `parse` and `parseSlice`, AI chat | No id; a forced `listRestart` on its first item |
| Markdown paste through the slice command | One fresh id for every id-less list in the paste, or the landing list's id |
| HTML parse and paste | A fresh id per list element; a non-1 start as `listStart` |
| Word HTML paste | The `mso-list` id; `listRestart` only where Word's number differs |
| DOCX import | One id per Word definition; `listRestart` for an instance's start override |
| Toggle, typed `1. ` | The join rule: a neighbor's id or a fresh one |
| `insert`, `upsert` | No id, filled by the `children` correction |
| `migrateListIdentity` | One id per legacy run |
| Hand-written values | No id; one list per root |

### Lanes

- **Stop and keep the current design.** Loses. Markdown lists, the common import and AI's output, show wrong numbers after Backspace, a move and a paste, and L4 stays failed.
- **A full redesign: container lists, adjacency or stored numbers.** Loses again on unchanged requirements. Containers break generic block editing, adjacency cannot hold your non-contiguous Word lists, and stored numbers are derived state in canonical JSON.
- **The strongest deletion: drop list identity and go back to adjacency plus restarts,** as CKEditor and BlockNote number. It would cut the identity index, the join rule, the migration and the DOCX identity mapping. Loses, because it breaks your typed ask for "full docx support (non contiguous list items)".
- **Restarts that follow their run,** the subject's open-work stop. Loses as the fix for separate lists. It needs an adjacency rule inside identity to find a run, and it keeps N Markdown lists in one list, so L4 still fails. Word does move an instance's override to the instance's first paragraph, so the idea stays open for imported Word restarts, where the subject's open work already tracks it.
- **Id-less items group by adjacency, ids only to bridge a gap.** Loses. Taking a middle item out splits a run, against `EDIT-LIST-ID-403`, and it needs a second membership rule and run upkeep in the index.
- **Counter ids per parse, bound to fresh ids wherever Plate inserts.** The first architect run's pick; loses after panel round 1. Counter ids persist in documents, so every insertion, transfer and composition path needs a binder, and a binder cannot tell two parses from one non-contiguous list once their JSON is concatenated.
- **A fresh random id per parsed list, the pick.** One rule for every codec: a decoded `listId` is a durable identity. No path needs a binder, and the continuation parser needs no new state. It costs byte equality between two parses, which no doctrine requires and which HTML and `ElementIdPlugin` ids already break.
- **A Plite admission hook that binds on every insert.** Loses. It changes what `tx.nodes.insert` means for every caller and cannot tell an import from a feature replacing its own content; random ids make it unnecessary.
- **Split list depth from block indentation,** as Word keeps a numbering level apart from a paragraph's indent. Loses. One depth lets a plain paragraph nest under an item, matches Markdown nesting and gives Tab one rule; two depths would double the Tab and Shift+Tab rules.
- **Shrink indent's commands to `increase` and `decrease`, the pick for indent.** `change`, `tab` and `untab` have no outside caller. Indent's rendering offset and unit stay with the layout scope's open Pursue.

Predicted benefits, which the Close marks held or falsified:

- Backspace at the start of a Markdown list's first item, and moving that item, keep the rest of that list numbered from 1, as the probe's HTML column shows.
- Pasting, raw-inserting or transferring two Markdown lists keeps two lists.
- Undo after deleting an item of a list without ids restores the document and its numbers exactly.
- L4, an insert among N parsed Markdown lists in the main root, does index work flat from N = 10 to 3,000. The whole insert still grows with N inside Plite's commit, so your ask stays unmet end to end until the subject's open Plite item lands.
- Indent's public `update` shrinks from five verbs to two.

The verdict also predicted that the chunk layer could go once Markdown lists had their own ids, and that Outdent on a top list item would follow Shift+Tab. The plan withdraws both untested. A single list still reaches 10,000 items and 5,000-item pastes, and the 2026-10-10 measurement of plain arrays lost on a 3,000-item paste. The outdent rule has no list-owned mechanism. The Defaults rows `measure-chunk-cut` and `outdent-rule` reopen them.

### Design

The first `pstack:architect` run (`artifacts/2026-10-11-list-first-principles/architect/`) picked counter ids plus a binder. Plan panel round 1 replaced it, and the replay (`artifacts/2026-10-11-list-first-principles/architect-2/task.md`) ran claude-opus-5-5 at high, gpt-6-astra at xhigh and gpt-6.1-sol at xhigh, each after a ping. All three picked a fresh random id per parsed list. A claude-opus-5-5 cross-judge scored anonymized copies (`architect-2/judge/judge-a1.md`): Sol 27, Astra 24, Opus 21. The synthesis (`architect-2/synthesis.md`) takes Sol's design as the base. It grafts Opus's smaller `insertList` change, Astra's merge and split comparator mutants, and the named-root cost check. It names the AI insert-below change that no runner named.

Must-answer items settled before the pick:

- Adjacent lists with different ids stay separable through Markdown: they serialize as "1. a 2. b" then "1) c 2) d" and parse back as two lists (`artifacts/2026-10-11-list-first-principles/adjacent-serialize-a2.log`).
- A correction sees only the editor, the entry and the transaction, so it cannot tell inserted content from existing content (`packages/plitejs/src/core/correction.ts` lines 30 to 56).
- An internal block drag moves blocks with `tx.nodes.move` (`packages/plitejs/src/core/transfer.ts` line 597), so ids survive a drag.
- No released document carries the default-list Markdown encoding. At `666f02406e`, `git show HEAD:packages/platejs/src/migrations/migrateListIdentity.ts` failed and the list plugin had no `listId`; the owner committed the list-id model as `c01399d08b` on 2026-10-11, and `git tag --contains c01399d08b` lists no tag.
- Only `insert` and `upsert` among package writers rely on the deleted correction, and AI generated lists use it to join the list above.

### Proof limits

The probes run the headless editor in happy-dom and read model numbers; they prove the stored facts and derived numbers, not paint. The Backspace, move and paste cases ran through the update API, not a keyboard or clipboard in a browser. The TabbableKit and bullet-style findings are source traces. No external editor checkout was read for this review; the comparison table on the subject page comes from the 2026-10-10 runs.
