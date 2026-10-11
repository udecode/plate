---
review_scopes: [list]
review_basis: [2026-10-10-list-import-identity]
verdict: pursue
work_kind: implementation
review_commit: 666f02406e936864cc61e5ccb6824321df4d9a42
review_inputs: [docs/plans/2026-10-10-list-review.md, docs/plans/2026-10-10-list-import-identity.md, packages/platejs/src/markdown/lib/deserializer/deserializeMdList.spec.tsx, packages/platejs/src/markdown/lib/markdownContinuation.spec.ts, packages/platejs/src/markdown/lib/internal/markdownConversion.ts, packages/platejs/src/markdown/lib/internal/markdownSegments.ts, packages/platejs/src/markdown/lib/serializer/convertNodesSerialize.ts, packages/platejs/src/markdown/lib/serializer/listToMdastTree.ts, packages/platejs/src/migrations/migrateListIdentity.ts, packages/platejs/src/ai/react/AIChatPlugin.ts, packages/platejs/src/ai/react/CopilotPlugin.tsx, packages/platejs/src/lib/plugins/element-id/ElementIdPlugin.ts, packages/plitejs/src/core/correction.ts, packages/plitejs/src/core/transfer.ts, apps/www/src/registry/components/editor/block-list.tsx, apps/www/src/registry/components/editor/block-menu.tsx, apps/www/src/registry/components/editor/indent-toolbar-button.tsx, apps/www/src/registry/components/editor/tabbable.tsx, content/docs/(plugins)/(styles)/indent.mdx, content/docs/(plugins)/(serializing)/markdown.mdx, VISION.md, docs/vision/common.md, docs/vision/plate.md]
---

# Lists: one way to mark a separate list

Status: planning: plan revised after panel round 1; round 2 reviews it next
Playbook: plan

Pursue, but not a full redesign. You named lists and indent directly; `next` would have offered neutral naming. The 2026-10-10 redesign started from first principles on your steer. It chose flat list items, list ids, numbers derived per list and drawn through `ol.start`, and one indent depth. None of its requirements changed since. One premise failed. A separate list is stored two ways. HTML decode gives each list its own `listId`. Markdown decode puts every list in the root's default list and marks each list's first item with a forced `listRestart`. The two look the same until an ordinary edit. Backspace at the start of the second list's first item, or moving that item below the next one, leaves the next item at 3 when the lists came from Markdown and at 1 when they came from HTML. Pasting two Markdown lists merges them into one list, and into the landing list when pasted into a list item. The same premise failed step 3.2's L4 line. The plan gives every parsed Markdown list a fresh id at decode, the way HTML decode already does, so `listRestart` only means restart and parsed lists stay separate on every path. It also drops the list correction that guessed identity on every structural edit, which made undo change numbers. Indent keeps its shared depth and loses three commands only it and lists call. The plan names the Build playbook as its execution playbook.

## Brief

### What will change?

No full redesign. Markdown and AI lists get their own ids, like pasted HTML lists, so Backspace, a move, a paste or undo no longer makes one list count on from another. Indent drops three commands no app calls.

### What could go wrong?

Two parses of the same Markdown now differ in list ids, so parse tests compare up to renamed ids, and server code must pass its parsed document to the client. AI lists inserted below a list no longer join it.

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
| AI list output placed below a list item | Stays its own list, as its parse says (look) | Joins the list above when the kinds match, as it does today | ai-join | small |
| The chunk layer in the list index | Keep it; a single list still reaches 10,000 items and big pastes (look) | Measure one plain array per list against it now | measure-chunk-cut | small |
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
// packages/platejs/src/features/list/lib/BaseListPlugin.ts (planned)
tx.indent.decrease({ nodes: { at: options.at } });
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
| added | List facts in AI rewrites and formatted output | Plate | `platejs/ai` (`ai/react`) | A rewrite keeps the user's list; generated lists keep their own |
| changed | Identity in HTML, Markdown, plain text and Word HTML paste | Plate | `platejs` (`features/list`, `markdown`, `docx/paste`) | One identity rule behind every codec: each decoded list gets a fresh id, and the Markdown serializer reports what Markdown cannot carry |

## Hard cuts and app migration

Removed with no alias: `IndentPlugin`'s `update.change`, `update.tab` and `update.untab`, and `IndentChangeOptions`' `setNodeProps` and `unsetNodeProps`. Tab and Shift+Tab keep working as indent's shortcuts, and `TabbableKit`'s `shortcuts: { tab: null, untab: null }` override keeps its keys. An app that called `update.change({ offset })` calls `increase` or `decrease` once per step.

Markdown parse output changes shape. An app or test that compared parsed list blocks against `listRestart` now sees `listId` and `listStart`, and two parses of one text differ in list id strings. An app that parses Markdown on the server and again on the client gets different list ids; it passes the server's parsed document to the client instead, as it must already do for HTML and for `ElementIdPlugin` ids. No saved document carries the old Markdown encoding: the list-id model was never committed, and `migrateListIdentity` gives each list of a released document its own id.

A raw write of a list item without `listId` stays in the root's default list. It no longer joins a neighbor on the next structural edit; the list commands do that.

## Native behavior and proof

| Delta | Behavior | What happens | Proof surface |
| --- | --- | --- | --- |
| changed | Markdown round trip | Each Markdown list gets its own fresh id and keeps its start as `listStart`; task and bullet items of one list stay one list; serialize starts each run at its number and alternates the delimiter between adjacent lists, and reports a forced restart or a split list it cannot carry | `deserializeMdList.spec.tsx`, `standardList.spec.ts`, `markdownContinuation.spec.ts`, `EDIT-LIST-START-MD-401`, scale line L4 on parsed Markdown |
| added | Backspace or a move at a Markdown list's first item | The rest of that list keeps counting from 1, as an HTML list does | Headless spec of the probe's cases, tagged `EDIT-LIST-START-MD-401` |
| added | Pasting or inserting two Markdown lists | They stay two lists through paste, a raw insert, a value built from two parses and a transfer between editors | Clipboard spec through `parseSlice` and `slice.replace`; headless specs for raw insert and transfer |
| added | Undo after deleting an item of a list without ids | The document and its numbers come back exactly | Headless spec with history undo and redo |
| added | AI rewrite of list items, and AI lists placed below a list | A rewrite keeps the user's list and its starts; a generated list stays its own list | AI specs for suggestion and insert-below |

## Main changes

- The Markdown list decoder gives each list family a fresh id from `createListId()`, the generator HTML decode uses. The continuation parser needs no new state: a reused segment keeps its objects and ids, and a list never spans a reused segment.
- The list `children` correction that assigned a missing identity on structural edits is gone. `insert` and `upsert` resolve the identity of the item they create inside their own transaction, with the same neighbor rule.
- The Markdown serializer groups by ordered against unordered list, so task and bullet items of one list stay one Markdown list, and it reports a forced restart and a split list as omitted instead of claiming them.
- AI suggestions keep a rewritten item's own list facts when the parsed block corresponds to it, and formatted AI output keeps a generated list's own facts.
- The list's outdent clears its own fields when an item leaves the top level, and indent's Tab and Shift+Tab become shortcut handlers.

## Decision ledger

| Surface | Current | Target | Owner | Reason | Adoption | Proof | Risk | Verdict |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Markdown list boundary | Default list plus a forced `listRestart` per list | A fresh `listId` per list family; a non-1 start as `listStart` | `BaseListPlugin` Markdown decode | One encoding for a separate list; the probe's Backspace, move and paste cases fail today | Parse specs compare up to renamed ids; law text and docs | Edit, paste, raw-insert and transfer specs; L4 on parsed Markdown | Server and client parses differ | rearchitect |
| Parse equality | Whole results byte-equal | Equal up to a consistent renaming of generated list ids; completed blocks keep their exact objects | Markdown test support | No doctrine requires byte equality; HTML and `ElementIdPlugin` already generate ids at parse | Continuation, round-trip and streaming specs | Comparator fails a merged-list and a split-list mutant | A comparator that hides a real merge | rearchitect |
| Missing-identity correction | Assigns a neighbor's or a fresh id on structural edits, undo included | None; `insert` and `upsert` assign identity themselves | `BaseListPlugin` | It cannot tell creation from undo, and Yjs skips it | AI generated lists stop joining the list above | Undo and redo spec; insert specs | A raw write that relied on the join | cut |
| Serializer claims | Splits task from bullet; claims a forced restart equals its start | Unordered grouping; restart and split lists reported | Markdown serializer | A parsed list must round-trip as one list, and a loss must be reported | None | Round-trip and diagnostic specs | New export warnings | rearchitect |
| AI list facts | Parsed props override the source; formatting copies the source's list facts onto every block | Rewrites keep source facts by correspondence; generated lists keep theirs | `AIChatPlugin` | Parsed ids would move the user's items out of their list | None | AI specs | A correspondence that matches the wrong item | rearchitect |
| Indent `update` verbs | `change`, `increase`, `decrease`, `tab`, `untab` | `increase`, `decrease` | `BaseIndentPlugin` | No outside caller for the other three | Docs, spec, API reference | Typecheck, teaching sweep | Outside callers break | cut |
| HTML continuation by start number | `<ol start=N>` after a list with N−1 items joins it | Keep | `BaseListPlugin` HTML decode | Serves Google Docs paste | None | Existing specs | A separate list that starts at N joins | keep |
| Chunk layer | Per-level lanes in chunks | Keep | `listNumbering.internal.ts` | A single list still reaches 10,000 items and 5,000-item pastes | None | Existing slow lines | Code size | keep |

## Steps

Every step names its proof. The build runs in two phases, each ending with a keep or revert decision. Before writing or changing a test, the build loads `verify` and reads `.agents/pstack/rules/tests.md`; before touching a format mapping, it loads `plate-plugins`; before a docs edit, `plate-docs`.

### Phase 1: a separate list is always its own id

- [ ] 1.1 Add failing tests. In `BaseListPlugin.spec.tsx`: parse "1. A, 2. B, Note, 1. C, 2. D" as Markdown, then Backspace at the start of C, and separately move C below D, and assert D shows 1, then 1 and C 2, tagged `EDIT-LIST-START-MD-401`; load `parse(md1)` with `value.replace`, insert `parseSlice(md2).slice.content` with `tx.nodes.insert` after a paragraph, and assert two lists; and for id-less numbered A, a Note and id-less numbered B, delete B, undo and redo, and assert the value and B's number 2 come back exactly. In the list clipboard specs, paste the same Markdown through `parseSlice` and `slice.replace` away from a list and into an empty item of an existing numbered list, and assert two lists, A and B joining the landing list, and D at 1 after Backspace at C. In the transfer specs, copy a list between two editors loaded from separate parses and assert it stays separate. Proof: `proof-worktree.mjs --expect-fail` at the build base fails each case by its title, except any case the base already passes, which the log names.
- [ ] 1.2 Add a test-only comparator in `packages/platejs/src/markdown/lib/__tests__/` that renames each distinct generated `listId` to its first-seen order, so two parses compare equal when they hold the same lists. Move `markdownContinuation.spec.ts`, `MarkdownPlugin.spec.ts`'s parse-equality cases, the round-trip specs that hold lists (`standardList.spec.ts`, `gfmSurface.spec.ts`, `commonmarkSurface.slow.ts`, `paragraphBreaks.spec.ts`), `streamInsertChunk.slow.tsx` and `markdown-streaming-demo.spec.tsx` onto it, keeping every `toBe` reuse assertion exact. Add list-bearing continuation fixtures for a discarded range, a full fallback and a loss-policy change. Proof: the comparator fails a mutant that merges two lists and one that splits a list, and the moved specs pass at the build base.
- [ ] 1.3 In `BaseListPlugin.ts`'s Markdown decode, give each list family a fresh id from `createListId()`, the first sublist under an item its family's id and a later sublist a new one, and write a non-1 start as `listStart`; write no `listRestart`. Update `deserializeMdList.spec.tsx` and its snapshot to the new shape. Proof: the Markdown partition passes, the 1.1 edit, raw-insert and transfer cases pass, and the 1.2 continuation fixtures pass.
- [ ] 1.4 Delete the list `children` correction. In `insertList`, which `insert` and `upsert` share, resolve the created item's identity with `readMissingListIdentity` on its entry inside the same transaction. Proof: the 1.1 undo case passes; specs that `insert` an item after a list item with an id, after a Note and beside an id-less item pass on `nodes.insert`, `blocks.insertAfter` and the empty-block replacement path; and the `standard-list` and `standard-list-react` partitions pass.
- [ ] 1.5 In the Markdown serializer, group list items by ordered against unordered in `convertNodesSerialize.ts` and `listToMdastTree.ts`, so task and bullet items of one id stay one list. In `representedListProperties`, stop claiming `listRestart`, and stop claiming `listId` for a run whose id an earlier emitted run already used, so `markdown-property-omitted` reports both. Proof: specs that round-trip "- plain, - [ ] task, - plain again" as one list, and that serialize a forced restart and a list continued past a paragraph and get the warning, fail at the build base and pass after.
- [ ] 1.6 In `AIChatPlugin.ts`, `parseSuggestion` gives a parsed list item that corresponds to its source item, at the same index with the same list kind, the source item's `listId`, `listLevels`, `listStart` and `listRestart`, absent ones included; and `createFormattedBlocks` keeps a parsed block's own list facts when it has `listType`, while plain paragraphs still take the source block's. Proof: AI specs that rewrite the text of two items of a user's list and keep its id and a latent start and take the text-patch path, and that place a generated numbered list below a list item and get a separate list, each fail at the build base.
- [ ] 1.7 Rerun the scale lines through `benchmark` with the L4 rule from `artifacts/2026-10-10-list-import-identity/perf/budget-amendment-4.md` frozen before the run, on a new cohort of real parsed Markdown at N = 10, 100, 1,000 and 3,000 lists of ten, in the main root and in a named root. While each inserted item exists, assert its list, the numbers after it and the untouched neighbor lists. Count lane work and assert no other list's lanes are read. Time the index update and the whole insert separately; only the index lines gate. Two controls must fail: the old encoding, which keeps the numbers right and does work across all lists, and an insert given a wrong fresh id, which must fail the correctness check. Keep the single 10,000-item list, the 5,000-item paste and the multi-level cohorts. I8, which fails on the frozen tree for a reason this plan does not touch, stays failed with its open item. Proof: the index lines pass for the shipped arm in the main root and both controls fail; the named-root and whole-insert numbers are reported against the subject's open Plite item; a loaded host makes timing inconclusive and the claim narrows to the work count.
- [ ] 1.8 Reconcile the law: rewrite `EDIT-LIST-START-MD-401` in `markdown-editing-spec.md` so parse gives each list its own id and its start as `listStart`, tag the 1.1 and 1.3 tests, and update `current-evidence.md`. Through `plate-docs`, add to `markdown.mdx` after its streaming section that each parse gives every list a new `listId`, that two parses of one source are equal up to their list ids, and that a server passes its parsed document to the client; mirror it in the Chinese twin. Add a changeset through `changeset`. Proof: `pnpm kb check`, the docs checks `plate-docs` names, and the changeset check pass.
- [ ] 1.9 Phase exit: keep when 1.1 to 1.8 pass; otherwise revert the phase. Proof: decision row.

### Phase 2: indent's commands

- [ ] 2.1 Add a failing test in `BaseIndentPlugin.spec.ts` that Tab and Shift+Tab through the shortcut pipeline indent and outdent a paragraph, and one in `BaseListPlugin.spec.tsx` that the list's outdent at the top level clears the item's list facts. Proof: both pass at the build base, so they guard the cut, and a mutant that drops the shortcut handler fails the first.
- [ ] 2.2 In `BaseIndentPlugin.ts`, delete `update.change`, `update.tab` and `update.untab` and the `setNodeProps` and `unsetNodeProps` options; move Tab and Shift+Tab into shortcut handlers. In `BaseListPlugin.ts`, the outdent calls `indent.decrease` and clears the list fields itself when an item leaves the top level. Delete the `setNodeProps` and `unsetNodeProps` cases in `BaseIndentPlugin.spec.ts`. Proof: the 2.1 tests pass, the list and indent specs pass, and `pnpm --filter platejs typecheck` passes.
- [ ] 2.3 Through `best-api repair` and `plate-docs`, remove `update.change`, `update.tab` and `update.untab` from `indent.mdx` and `indent.cn.mdx`, run `node tooling/scripts/teaching-sweep.mjs` on the three names, regenerate the API reference manifest as `verify`'s command recipes say, and add a changeset. Proof: the sweep lists no live teaching, and the docs checks, `pnpm --filter www api-reference --check` and the changeset check pass.
- [ ] 2.4 Phase exit: keep when 2.1 to 2.3 pass; otherwise revert the phase. Proof: decision row.

### Close

- [ ] Writing passes: `deslop`, then `no-comments` on product code; `unslop` on docs and this plan.
- [ ] Panel on the diff, because the plan changes a public API (reviews: api-build).
- [ ] `pnpm lint:task` on this task's files, and the `pnpm check` steps the edits reach.
- [ ] Close, fold into `docs/plans/topics/list.md`, update `docs/research/decisions/list-ownership.md` through `research`, and run the decision-trail review when a rule triggers it.

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
| Pre-acceptance scale proof | N/A | The index and its lanes do not change; step 1.7 reruns the frozen lines on the new cohort | pending |
| Large/stress scaling | yes | Step 1.7 | pending |
| Correctness guard | yes | Steps 1.1 to 1.6 | pending |
| Performance regression check | yes | Step 1.7 | pending |

## Open work

- `docs/research/decisions/list-ownership.md` still states the 2026-10-04 verdict, although the 2026-10-10 iterations landed its target. owner: zbeyens. stop: this plan's Close updates it through `research`.
- The copied live list wrapper writes `data-list-id` (`apps/www/src/registry/components/editor/block-list.tsx` line 53), so an app that parses Markdown separately on server and client gets different attributes. Nothing found reads the live attribute; the static wrapper's copy feeds DOCX export. owner: zbeyens. stop: a `plate-ui` check that removes it from the live wrapper, or 2026-12-31.
- Two editors loaded from one saved value share list ids, so a transfer copy between them keeps the copied items in that list. This holds for every codec today. owner: zbeyens. stop: a report of such a merge, or 2026-12-31.
- HTML decode joins an `<ol start=N>` to a list before it whose next number is N, even across a paragraph, while Markdown parses the same text as two lists. It serves Google Docs paste, and its tests check numbers only. owner: zbeyens. stop: a captured Google Docs clipboard fixture that shows whether it needs the rule, or 2026-12-31.
- Outdent from the toolbar or block menu on a top list item drops its `indent` while it stays a list item, where Shift+Tab leaves it unchanged. A list rule there needs either indent to read list facts or a list correction whose undo step is unproven. owner: zbeyens. stop: a list toolbar plan, or 2026-12-31.
- The TabbableKit Tab case and the circle and square bullets are suggested as their own sessions. owner: zbeyens. stop: you start or dismiss those sessions.

## Challenge delta

Plan panel round 1 (claude-opus-5-5 at high, gpt-6-astra at xhigh, gpt-6.1-sol at xhigh) replaced the target. It rejected counter ids per parse (`md:0`, `md:1`) that a binder swapped for fresh ids at each Plate insertion site. The new target gives each parsed list a fresh random id at decode, compares parses up to renamed ids, and drops the missing-identity correction. Every critical coverage finding rested on counter ids persisting in documents: transfer copies, moves between roots, raw inserts, the streaming recipe and a value built from two parses. The first run had rejected random ids only because the lead tagged whole-result parse equality as law, and no doctrine file states it. Undo of an id-less list also changed numbers through the correction. `pstack:architect` replayed once on that question (`artifacts/2026-10-11-list-first-principles/architect-2/`), and all three runners picked the new target.

The round changed six other things. Copilot binding is cut, because Copilot parses inline only. The outdent rule is cut, because no list-owned mechanism exists and Shift+Tab differs inside a quote. The leading-edge join and toggle-across-Restart steps are cut as unneeded for the defect. Step 1.7 now keeps I8 failed and checks correctness while the inserted item exists. The serializer and AI list facts became steps. The saved-document question is settled, because no committed document carries the old Markdown encoding.

## Evidence

Model: Claude Opus 5.5 (`claude-opus-5-5`), xhigh effort.

The review read the working tree at `666f02406e`, which holds both 2026-10-10 list iterations uncommitted. Two Codex explorers (gpt-6.1-sol at medium) mapped the list owners (`artifacts/2026-10-11-list-first-principles/explorer-A-a1.md`) and indent with every outside reader of list properties (`artifacts/2026-10-11-list-first-principles/explorer-B-a1.md`). A third mapped every path that inserts parsed Markdown (`artifacts/2026-10-11-list-first-principles/explorer-C-a1.md`). The lead read `BaseIndentPlugin.ts`, the Markdown and HTML decode spans, the copied kits, `correction.ts`, `transfer.ts` and the AI spans itself.

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
- L4, an insert among N parsed Markdown lists in the main root, does index work flat from N = 10 to 3,000.
- Indent's public `update` shrinks from five verbs to two.

The verdict also predicted that the chunk layer could go once Markdown lists had their own ids, and that Outdent on a top list item would follow Shift+Tab. The plan withdraws both untested. A single list still reaches 10,000 items and 5,000-item pastes, and the 2026-10-10 measurement of plain arrays lost on a 3,000-item paste. The outdent rule has no list-owned mechanism. The Defaults rows `measure-chunk-cut` and `outdent-rule` reopen them.

### Design

The first `pstack:architect` run (`artifacts/2026-10-11-list-first-principles/architect/`) picked counter ids plus a binder. Plan panel round 1 replaced it, and the replay (`artifacts/2026-10-11-list-first-principles/architect-2/task.md`) ran claude-opus-5-5 at high, gpt-6-astra at xhigh and gpt-6.1-sol at xhigh, each after a ping. All three picked a fresh random id per parsed list. A claude-opus-5-5 cross-judge scored anonymized copies (`architect-2/judge/judge-a1.md`): Sol 27, Astra 24, Opus 21. The synthesis (`architect-2/synthesis.md`) takes Sol's design as the base. It grafts Opus's smaller `insertList` change, Astra's merge and split comparator mutants, and the named-root cost check. It names the AI insert-below change that no runner named.

Must-answer items settled before the pick:

- Adjacent lists with different ids stay separable through Markdown: they serialize as "1. a 2. b" then "1) c 2) d" and parse back as two lists (`artifacts/2026-10-11-list-first-principles/adjacent-serialize-a2.log`).
- A correction sees only the editor, the entry and the transaction, so it cannot tell inserted content from existing content (`packages/plitejs/src/core/correction.ts` lines 30 to 56).
- An internal block drag moves blocks with `tx.nodes.move` (`packages/plitejs/src/core/transfer.ts` line 597), so ids survive a drag.
- No committed document carries the default-list Markdown encoding: `git show HEAD:packages/platejs/src/migrations/migrateListIdentity.ts` fails, and HEAD's list plugin has no `listId`.
- Only `insert` and `upsert` among package writers rely on the deleted correction, and AI generated lists use it to join the list above.

### Proof limits

The probes run the headless editor in happy-dom and read model numbers; they prove the stored facts and derived numbers, not paint. The Backspace, move and paste cases ran through the update API, not a keyboard or clipboard in a browser. The TabbableKit and bullet-style findings are source traces. No external editor checkout was read for this review; the comparison table on the subject page comes from the 2026-10-10 runs.
