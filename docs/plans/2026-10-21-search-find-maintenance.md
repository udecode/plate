---
review_scopes: [search]
verdict: pursue
review_basis: [2026-10-04-search-audit]
work_kind: implementation
review_commit: 5f94b61fb4dc06b3c74b693355b5af8bf53d1b8e
review_inputs: [VISION.md, packages/platejs/src/features/find/lib/BaseFindPlugin.spec.ts, apps/www/src/registry/components/editor/find.spec.tsx, docs/plans/2026-09-08-editor-performance-phase-3.md, docs/vision/common.md, docs/research/review-records/2026-10-04-search-audit.json, docs/plite/research/2026-09-09-editor-performance-iteration-2/experiments.md, docs/plans/2026-10-17-named-root-targeting.md, packages/platejs/src/features/lint/lib/BaseLintPlugin.ts, packages/plitejs/src/core/tx-only.ts, packages/plitejs/src/core/content.ts, 'content/docs/(plugins)/(functionality)/find.mdx']
review_upstreams: ['../prosemirror-search@ff1148a339bb7daa9d7b02dff9614b9d7123f552', '../lexical@dd5c41b13193efa9ab1574234d8593d2c9e4f988', '../slate@945a484df2497e4c448b33f417b0de2a49840032', '../tiptap@91c51be53c4655ef07e29ec489471524debfa0ca', '../ckeditor5@14e73cc31b869ce483bd8449f40b9102ac7746da']
---

# Find: keep up with edits without redoing the whole search

Status: partial: step 3's fixes landed as fe0fbacdf4; Phase 1 waits as a saved patch on t_ab664f2a's quiet-host timing
Topic: search
Playbook: plan

**Pursue.** While a query is active, every document commit reruns Find's whole-document search and repaints every match, and the active result is a list index that slides to another match when an edit adds or removes one before it. A probe measured both on this checkout. With 10,000 one-line paragraphs that all match, a keystroke took 62 to 140 ms against about 1.4 ms with no query, headless and before React draws anything. Each keystroke refreshed all 10,000 match nodes even when no match changed (`find-probe-a1.log`, `find-probe-split-a1.log` in this plan's run directory). The 2026-10-04 Defer waited on exactly that measurement. It shows that publishing and repainting, not the scan, carry most of a dense keystroke. The scan alone took 6.7 of 8.2 ms at 10,000 blocks with one match, while 10,000 matches took 62 to 140 ms. `BaseLintPlugin` in the same package already repaints only the blocks a commit changed. Find keeps every public call and its whole-document search, publishes and repaints only text whose matches changed, and keeps its active result on the same match. The target changes hot runtime work, so it stays provisional until the plan's benchmark shows the gain survives rendering. The 2026-09-09 performance iteration set that stop. The next owner is the Plan playbook, on this file.

## Brief

### What will change?

Two small Find fixes shipped. Selecting the active result from a named root's view now does nothing instead of selecting the wrong text, and an unused plugin name is gone. The faster Find waits, unshipped, as a saved patch.

### What could go wrong?

This machine was too busy to time the faster version, so task t_ab664f2a times it on a quiet one and lands it if it is twice as fast. Until then, every keystroke with a search open redraws every match.

## Teach

Find is the search bar that highlights every match and steps through them. The package keeps the query, the matches and which one is active. The copied bar handles typing and scrolling.

Today every edit made while a search is open rebuilds the whole list and redraws every highlight, even when no match changed. With 10,000 matches, one keystroke took 60 to 140 milliseconds in a test that drew nothing. The active result is a position in the list, so a new match typed above it moves the highlight to another match.

After the change, an edit still searches the whole document, then compares the new matches with the old ones text by text. It redraws only text whose matches differ, and publishes nothing when nothing differs. The active result is pinned to its spot in the text, so it follows its match through edits. Searching only edited paragraphs waits until a measurement shows the search itself matters.

## Public API

No call changes shape. The first observable change is which match stays active after an edit. Here the active match is the second paragraph's `hello`, and the edit types another `hello` in front of it. Today the index stays 1 and the highlight lands on the new text. After the change it follows the match the user was on.

```ts before
// packages/platejs/src/features/find/lib/BaseFindPlugin.spec.ts
api.search('hello');
api.move(1);
editor.update.text.insert('hello ', { at: { path: [1, 0], offset: 0 } });
expect(store.get('activeIndex')).toBe(1);
```

```ts after
// packages/platejs/src/features/find/lib/BaseFindPlugin.spec.ts
api.search('hello');
api.move(1);
editor.update.text.insert('hello ', { at: { path: [1, 0], offset: 0 } });
expect(store.get('activeIndex')).toBe(2);
```

An app's own `store.set({ activeIndex })` now takes effect at once and survives the next edit, as `api.move` does. A write that picks another result inside a transaction that has already edited the document applies its index to the list Find publishes when that transaction commits, as today. A store write that leaves the active result as it was, such as one that sets only `error`, keeps it on its match. The query changes only through `api.search`, and a `query` an app writes to the store no longer starts a search at the next edit. Store subscribers now hear only commits that change a match, the active result or `error`. A commit that changes none of them, or one to a named root or records, no longer notifies them, and unchanged matches keep their identity. A subscriber that calls `api.search` or `api.move` while the store notifies starts a nested publication, and later subscribers then hear the newest state, as with any Plate plugin store. `api.search` called inside the `update` of a named root's view searches the main document, where it used to search that root. `update.select()` in a named root's view transaction returns false and selects nothing, because matches are ranges into the main document. Match ids are opaque keys that survive a block moving above them. `PLUGINS.searchHighlight` is removed, as the next section says.

## Hard cuts and app migration

- `PLUGINS.searchHighlight` leaves `packages/platejs/src/utils/plate-keys.ts`, and `PluginName`, which reads its values, loses `'searchHighlight'`. No plugin has carried that key since the 2026-08-30 cut of `FindReplacePlugin`. `git grep -w searchHighlight` finds no reader outside the API reference manifest, decision logs, review records and the stale pending changeset that step 3 rewrites, and no copied registry component reads it. An app that reads it reads a name no plugin uses, so it deletes the read.
- `update.select()` in a named root's view transaction now returns false where it used to select a main-document range in that root. No copied registry component calls it; `find.tsx` steps results with `api.move`. Its callers are `find.spec.tsx` and the docs examples at `find.mdx:75` and `find.mdx:133`, which run in the main document and keep their behavior. An app that calls it from a named root's view gets false and keeps its own selection.
- A `query` an app writes straight to Find's store no longer starts a search at the next edit, because a commit now searches the query Find last searched. `find.tsx` and both Find pages change the query through `api.search`, and `git grep` finds no other writer. After such a write the store shows the app's query beside the last search's matches, and the bar shows it over the old highlights, until the app calls `api.search`. An app that writes `query` calls `api.search` instead.
- `api.search` called inside the `update` of a named root's view now searches the main document. It used to search that root and paint its ranges at the same paths in the main document. `git grep` finds `api.search` only in `find.tsx` and `find-surface.tsx`, neither inside an `update`. An app that searched a named root this way gets main-document matches.

## Layer and owner

| Change | Layer (Plite or Plate) | Package | Why |
| --- | --- | --- | --- |
| Compare results per text node and publish and repaint only what changed | Plate | `platejs/find` (`BaseFindPlugin.ts`) | Find owns its results and its paint |
| The active result follows its match through a range anchor | Plate | `platejs/find` (`BaseFindPlugin.ts`) | Navigation state belongs to the feature that publishes it; Plite's `editor.anchor` already follows edits |
| Remove the unused `searchHighlight` key | Plate | `platejs` (`utils/plate-keys.ts`) | No plugin is named with it |

No Plite behavior change, and no file moves between entrypoints.

## Native behavior and proof

| Behavior | What changes | Proof surface |
| --- | --- | --- |
| Typing that adds or breaks a match | Still repainted in the commit that made it, and only that text repaints | jsdom mounted tests with commits tagged `native-text-input` that add a match and break one; trusted keyboard typing that adds a match in the Chromium editor-perf Find lane |
| Typing that changes no match | Highlights keep their place through the runtime's native-input mapping, and Find publishes nothing | jsdom mounted test tagged `native-text-input`; the lane's trusted `no-change` cohort |
| Undo and redo | The active result follows its match through undo of edits elsewhere; after its own match is deleted it moves to the next match and stays there through undo | jsdom package spec |
| Enter in the bar | Unchanged. It moves to the next result through `api.move` | `find.spec.tsx` in jsdom |
| Selecting the active result (`update.select`) | Unchanged in the main document; returns false in a named root's view transaction | jsdom package spec |
| Focus and scrolling | Unchanged | `find.spec.tsx` in jsdom |
| IME composition | Unchanged code path | unproven |

## Main changes

- On a main-document commit with a query active, Find still searches the whole document, then compares the result with the last one text node by text node. It publishes a new list when any match's range differs, paths included, and refreshes only text nodes whose matches' offsets or text changed, plus the old and new active ones when the active match changes. A commit that changes no match, active result or `error` publishes nothing.
- A commit that changes only the selection, a named root or records runs no search.
- The active result is one range anchor into the text. After an edit it is the same match while the search still returns that range. Otherwise it is the first match that ends after the anchor's start, or else the first match. A search for a new query starts on its first match. A publication with no match releases the anchor.
- Find watches its own store from the moment it is created, with or without a mounted view. A write that leaves `matches[activeIndex]` different from the match Find anchored re-anchors at once, so `api.move` and an app's own `activeIndex` write take one path. That watch only re-anchors and never writes the store. Find searches the main document, keys each match by one of its text nodes and creates the anchor there, even inside a named-root transaction. A write that picks another result while the main document differs from the one Find last searched, such as inside a transaction that already edited it, does not anchor, because the published ranges no longer fit that document. The stored index then names a match other than the one Find anchored, so the next main-document commit applies it to the list its search returns. A write that leaves `matches[activeIndex]` on the anchored match, such as one that sets only `error`, changes nothing. That holds when the transaction throws, too.
- Match ids name the match's text node and its order in that node, so a block moving above them no longer changes them.
- The unused `searchHighlight` key leaves `PLUGINS`.

## Outcome

With a query active, a keystroke that changes no match and leaves the active result on its match publishes and repaints nothing, and one that changes a block's matches repaints that block, plus the old and new active match when the active match changes. A block inserted above the matches republishes every match with its new path and repaints nothing. A match that spans text nodes still repaints its first text node, and a suggested task owns that repair. The active result stays on its match through edits, undo, collaboration and structural changes while the search still returns that match, and an app's own pick of the active result survives the next edit. An active result the app picks or searches for inside `editor.update` jumps to a new match typed right before it in a later commit, because a Plite range anchor made inside an update does not move for an insertion at its start. Plite owns that repair. `api.search` called inside a named root view's `update` now searches and highlights the main document, where the base searched that root. After a transaction that called `api.search` throws, `api.move` throws until the next commit that changes the main document, because the store still holds the rolled-back ranges. A suggested task owns that repair. Every public call keeps its shape.

## Scope

- In: `packages/platejs/src/features/find/lib/BaseFindPlugin.ts` and its specs, the mounted cases in `apps/www/src/registry/components/editor/find.spec.tsx`, the editor-perf Find lane in `apps/www/src/app/dev/editor-perf/` and `apps/www/scripts/run-editor-perf.mts`, `find.mdx` and `find.cn.mdx`, `packages/platejs/src/utils/plate-keys.ts` and the API reference manifest, the stale pending `.changeset/find-replace-v54-runtime.md` and the Find sentence of `.changeset/plate-transient-editor-ui.md`.
- Out: what Find searches (struck suggestion text and named roots stay as they are), the copied bar, Plite and the Lint plugin.

## Decisions

- **Phase 1 keeps the whole-document search.** The 2026-09-08 iteration's scoped search gained 64 and 85 percent on dense 100 and 1,000-block rows, and 16.9 against a required 25 percent on the sparse 10,000-block row (`docs/plans/2026-09-08-editor-performance-phase-3.md:135`). That candidate changed its state shape, its search scope and its delivery together, so it does not show which part gained. That publishing and repainting less brings most of the dense gain is a hypothesis, and step 5 tests it against the baseline.
- **Results stay one immutable array in the store.** A per-block map beside it would have to stay in step with every publication, and a binary search over the sorted array answers decorate reads. `store.set` reuses match objects it already owns, so a change costs a copy of references.
- **Find refreshes changed text nodes itself, in the commit.** On native and DOM text input the decoration runtime only shifts old highlights and re-reads them 50 to 250 ms later (`packages/plitejs/src/react/decoration-source.ts:1746-1763`), so a new match would paint late while the count already changed.
- **The active result is one inward range anchor that deletes to the nearest point.** The probe showed that `drop` resolves to nothing in four of five deletions, while `nearest` lands next to the removed match. Find keeps one live anchor and releases it when it re-anchors, publishes no match, clears the query, fails or is torn down. Continuity holds only while the search still returns the anchored range, because the search returns no overlapping matches. With `aa` in `aaaa`, typing `a` in front leaves the anchored text unmatched, and the active result moves to the first match that ends after the anchor's start.
- **Find re-anchors the moment its store changes.** All three plan reviewers broke the earlier rule, which rebuilt the anchor at the stored index on the next commit. An edit that adds a match before the chosen one moves the choice. Find subscribes to its store when it is created, and any write that leaves `matches[activeIndex]` different from the match Find anchored re-anchors at once. Find's own publications leave the two equal, so they start nothing. The watch writes nothing. A store write made inside a store listener reaches every later listener twice, so a listener that advances on each new match list would advance twice. Find therefore stops reacting to a `query` written straight to its store, and `api.search` is the one way to change the query. Find does not queue an `api.search` or `api.move` that a subscriber calls while the store notifies. That nested write is the app's, and every Plate plugin store delivers it the same way. Find sets its bookkeeping before each `store.set` and refreshes after it, so its own state ends equal to a fresh search either way.
- **A write inside an edited transaction waits for the commit.** Plite maps every live anchor through each change as a transaction makes it, so an anchor created mid-transaction reads the draft (`packages/plitejs/src/core/anchor-state.ts:1135`). The published ranges still describe the document before the transaction, so anchoring one there lands on other text, or on a path a deletion removed. Plite has no public way to map a range from an earlier document. Find applies such a write's index to the list it publishes at commit, which is what every write does today.
- **Phase 1 lands only on a conclusive timing receipt.** The count lines cannot see Phase 1's own new work, such as comparing each new match list with the last. A Phase 1 slower than the baseline could pass them all. On a loaded host the decision stays `gate`, and nothing that changes per-keystroke work lands.
- **Timing lines judge medians.** The lane's p95 over at most 40 samples is its largest or second-largest sample. The 2026-09-08 probe's same-code p95 noise reached 12.8 percent at 40 samples per arm (`find-candidate-disposition.json`), past a 5 percent margin. The lines therefore judge the median and report p95. `idle-10k` runs the same code on both sides, so a timing line there measures only noise. It is a count line, and its time is reported beside the others. The named-root `update.select` fix and the `searchHighlight` cut run no per-keystroke code, so step 3 lands them first.
- **Reversed from the verdict.** The verdict promised matches kept per block, keyed by node, and a rescan of changed blocks only. The arena kept one array, and the changed-block rescan is out of this plan. The 2026-09-08 prototype already scanned one block through `at` (`BaseFindPlugin.incremental-prototype.ts:98` in that plan's run directory). The row that rejected it, `sparse-10k` with one match, spent its time outside Find's publication, and Phase 1 does not change that cost (`find-candidate-disposition.json`). Nothing that rejected it has changed. It reopens only when a quiet-host profile of a rendered `sparse-10k` keystroke on Phase 1 shows the scan is a large share of it.

## Decision ledger

| Surface | Current | Target | Owner | Reason | Adoption | Proof | Risk | Verdict |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Match results | Rebuilt and republished on every document commit, named roots and records included | Rebuilt by a whole search on main-document commits; published only when a range changes, unchanged objects reused | `BaseFindPlugin` store | Publication and repaint dominate at 10,000 matches | No call changes | Step 2 oracle and work counts; step 5 lane | The search stays proportional to the document | gate: step 5's receipt |
| Repaint | Refreshes every old and new match's text node | Refreshes text nodes whose matches' offsets or text changed, and the old and new active ones when the active match changes | `BaseFindPlugin` `decorate.observe` and `on.commit` | Same | None | Step 2 mounted tests; step 5 refresh counts | A path shift the runtime does not re-read would leave a stale highlight | gate: step 5's receipt |
| Active result | `activeIndex` kept by number | `activeIndex` of the match the anchor resolves to, re-anchored on every store write | `BaseFindPlugin` | Identity through edits | The spec's 1 becomes 2; docs | Step 2 | Apps that read `activeIndex` see a new number after edits | rearchitect |
| Match ids | Path and offsets | Text node key and order in it | `BaseFindPlugin` | Stable through path shifts | `data-find-id` values change; nothing parses them | Step 2 | An app parsing ids | rename |
| Named-root select | Selects a main-document range in the named root | Returns false and selects nothing in a named root's view | `BaseFindPlugin` `update.select` | Matches are main-document ranges | Docs | Step 2 | An app selecting from a named root | cut |
| Changed-block rescan | None | None in this plan | `BaseFindPlugin` | The 2026-09-08 test rejected it on `sparse-10k`, whose cost Phase 1 does not change | None | A quiet-host profile of a `sparse-10k` keystroke on Phase 1 | The scan stays proportional to the document | defer |
| `searchHighlight` key | In `PLUGINS`, unused | Removed | `platejs` `utils/plate-keys.ts` | Dead identity debt from the 2026-10-04 audit | API reference regenerated; stale changeset rewritten | `git grep -w searchHighlight`; `api-reference:check` | An app reading `PLUGINS.searchHighlight` | cut |

## Steps

### Phase 1: publish and repaint only what changed

- [x] **1. Freeze the speed budget on the baseline.** Finish the editor-perf Find lane with the cohorts, actions and metrics in Proof. Run it at `5f94b61fb4` with a same-code and a planted-slowdown arm for each frozen cohort through `paired-timing.mjs`. Every timing line in Proof is a ratio budget, frozen now. Each paired run measures its own baseline and noise, so no number from a loaded run sets a line. Before any Phase 1 bytes run, also freeze these: an absolute delta beside each ratio, as the methodology asks; the `loadLimit`, at a quarter of the host's logical cores; the planted slowdowns and the arm list; and a fixed 40 samples per arm, with the heap collected before each sample. Time one paired packet, then freeze the acceptance set that fits one hour as one protocol. The lines left out run in the production rerun after acceptance. Explain any correctness failure the base shows before freezing, and get one green base run of every frozen cohort, the 10,000-block ones included. A known-bad input must fail with the probe's own assertion text. Proof: the lane's baseline, same-code, planted and known-bad logs, every Start Gates row resolved, `pstack:benchmark-checklist` on the run, and a `proof` row citing the logs.
- [x] **2. Write the behavior tests against the base.** In `BaseFindPlugin.spec.ts`, and in `find.spec.tsx` for mounted cases:
  - a seeded edit oracle that, after every commit, compares `matches`, `count` and painted decorations with a fresh search of the same document, and checks `activeIndex` against a model in the test that tracks the active match's text offset through each generated text edit, resyncing to the plugin after a move, undo or redo;
  - the active match through an earlier match typed in its own block (the Public API pair), a block inserted above it, a move of its own block, undo of an edit elsewhere, and a remote commit that adds a match before it;
  - the active block deleted together with earlier matches in one transaction, landing on the next match by position, and undo of that deletion keeping the next match active;
  - a self-overlapping query, `aa` in `aaaa`, with the second match active and `a` typed at offset 0, landing on the match that overlaps it;
  - outside writes: `store.set({ activeIndex })` and then an edit that adds a match before the chosen one in its own block, in an earlier block, and a block inserted above; the same write made inside a named-root transaction, then a main-document edit before the chosen match; a selection-only commit after an outside write, which runs no search; a store subscriber added after Find, which hears exactly one change of `matches` per `api.search` and per commit that changes a match, and which advances once when it calls `api.move(1)` on each change; a subscriber that writes `activeIndex` while a commit's publication notifies, whose pick survives the next edit; a subscriber that calls `api.search` with a normalized query on each change, followed by one that calls `api.move(1)`, after which matches, highlights and the active match equal a fresh search of the final query; and `store.set({ activeIndex })` and `api.move(1)` inside a transaction that first types in the active match's block or deletes an earlier block, which apply their index to the list published at commit and never throw, and the same write in a transaction that throws afterwards, whose index the next edit's publication applies;
  - `update.select` in a named root's view transaction, which returns false and changes no selection;
  - a UTF-16 surrogate pair before a match, and a match that spans an inline element, under edits;
  - a mounted commit tagged `native-text-input` that types a new match, whose highlight is painted before the commit returns, one that types inside a match, whose highlight is gone before the commit returns, and one that changes no match, whose highlights stay in place;
  - a mounted insert of a block above matches, whose highlights move with their text; two mounted views of one editor, both painting the same highlights first, where native input then types a new match and both views paint it before the commit returns; and `value.replace` with new text, which repaints from a fresh search;
  - work counts: a selection-only or named-root commit runs no search and writes nothing, a keystroke that changes no match writes nothing and refreshes no node, one that changes a block's matches refreshes only that block's text nodes, plus the old and new active ones when the active match changes, and a block inserted above refreshes no node.

  Proof: `node tooling/scripts/proof-worktree.mjs` at `5f94b61fb4` with the new specs through `--with`, `--expect-fail` on each case that encodes the change, and a second run where the oracle's match and paint checks and every case that holds today pass. A mutant that refreshes only the last mounted view after a commit must fail the two-view case after its setup passes.
- [x] **3. Land the fixes that run no per-keystroke code.** Return false from `update.select` in a named root's view transaction. Cut `searchHighlight` from `PLUGINS`, which also drops it from `PluginName`, regenerate the API reference in a `proof-worktree.mjs --install` worktree that builds `plitejs` and `platejs` first, and rewrite the pending `.changeset/find-replace-v54-runtime.md`, which still names `FindReplacePlugin` and `searchHighlight`. Run `plate-docs` to fix `find.mdx` and `find.cn.mdx` lines 80 to 82 on what `update.select` returns, and run `best-api repair` on both cuts. Neither cut gets a changeset of its own, because platejs 53.3.18 on `origin/main`, the release baseline, has no `BaseFindPlugin` and no `PLUGINS` object. The rewritten pending changeset carries the migration from the baseline's `FindReplacePlugin` and `KEYS.searchHighlight`. Land them with step 1's lane and the step 2 cases that pass on these bytes, after the writing passes and the `push` panel on the diff. The cases that fail on these bytes stay in the run directory's patch, outside the worktree, and come back for step 4. Neither change runs per keystroke, so the pre-acceptance probe is N/A for them. Proof: the named-root case green, `git grep -w searchHighlight` finds only decision logs, review records, dated plans and that changeset's migration line, `pnpm --filter www api-reference:check` passes, and the land log.
- [x] **4. Build Phase 1 in `BaseFindPlugin.ts`.** Keep the whole search and run it only when `commit.changed.has('document')`. Compare the result with the last one per text node. Publish a new list when any range differs, paths included, and reuse match objects whose range is unchanged. Refresh only text nodes whose matches' offsets or text changed, plus the old and new active ones when the active match changes, and send every refresh through the `refresh` callback each `decorate.observe` hands Find. When nothing changed, publish nothing, and still record the searched document so decorate reads keep returning highlights. Derive ids from the text node key and order. Anchor the active match with `editor.anchor(range, { association: 'inward', deletion: 'nearest' })` inside `withEditorUpdateRootScope(editor, MAIN_ROOT_KEY, ...)`, which `facade.ts` re-exports from `plitejs/internal`, because the public `AnchorOptions.root` takes only a named root's key and a store write can come from a named root's transaction. Keep one live anchor, and release it on re-anchor, on an empty query, on failure and on teardown. Resolve the active result as the match equal to the anchored range, else the first match that ends after the anchor's start, else the first match. A search for a new query starts on its first match whatever the old anchor, and a package case pins it. Subscribe to Find's store when the plugin is created. A write that leaves `matches[activeIndex]` different from the match Find anchored re-anchors at once, and the subscription never writes the store. When the main document differs from the one Find last searched, the write does not anchor, and the next main-document commit applies its index to the list its search returns. Detect such a write by comparing the stored index's match in the published list with the match Find anchored, never with the anchor's live range, which every edit moves. Keep the query Find last searched in the plugin, so `api.search` with that query does nothing and a commit searches it. Set that query, the anchor and the searched document before `store.set`, and refresh after it, so Find never overwrites a write an app makes while Find's publication notifies listeners. A publication with no match releases the anchor. Publish failures atomically. Delete `matchesByAnchorPath` and binary-search `matches` in decorate reads. Proof: step 2's specs green through `pnpm --filter platejs test -- src/features/find` and the mounted spec's runner, `pnpm --filter platejs typecheck`, and a diff review that finds one live anchor at a time.
- [ ] **5. Accept Phase 1 on the frozen budget, or leave it open.** Before any Phase 1 bytes run in the lane, time one acceptance packet on two copies of the commit step 3 landed and record its time here, and measure `idle-1k` `no-change` on the same copies. For each `dense-1k` line, the floor F is the lower of the two copies' `idle-1k` medians on that line's input path, and B is the `baseMedianMs` that `harness/paired/lines.json` records for that line. When F exceeds 0.4 of B, the line's budget becomes 0.5 plus F/(2B), rounded up to the hundredth, so it still asks Phase 1 to halve the time above the floor. Before any Phase 1 bytes run, the run writes that budget as the cohort's entry in the per-cohort `budget` of the config that judges the line, `acceptance.json` for the acceptance lines. Every other line, `dense-10k` included, keeps its budget. No other rule restates a line. Then run step 1's acceptance protocol, `accept.sh`, on the Phase 1 bytes. Both arms run at the commit step 3 landed, in the checkouts and ports `acceptance.json` names, and the candidate is that commit plus Phase 1's files through `proof-worktree.mjs --with`. Phase 1 lands only when every count, correctness and timing line in the set passes conclusively. A count or correctness miss blocks it. The run fixes a harness error in the counts run, such as a stall, a missing frame or a changed checkout, and runs the protocol again. A conclusive timing miss sends the design back to `architect`. On a loaded host every timing line is inconclusive, so the decision stays `gate`, and Phase 1 stays quarantined and does not land. The run then does steps 6 to 8 and step 9's review on the unlanded bytes, and reruns the probe after each. If no run is conclusive, the run saves Phase 1's bytes, the cases that need them and every edit steps 6 to 8 made as one patch in this plan's run directory, drops them from the worktree, and lands the plan with `Status:` partial. `## Open work` then names the patch, the commit it applies to, the lane command, the frozen lines, the rule above and the checks the patch still owes when it lands, `plate-docs`, `changeset` and `best-api`. Proof: the lane's logs, checked with `pstack:benchmark-checklist`, and a `proof` row for each run.
- [ ] **6. Update the Find docs.** Run `plate-docs` on `find.mdx` and `find.cn.mdx`: line 21's "Rescans after document commits", line 80's "Document commits refresh the query automatically", lines 119 to 121 on store subscriptions, which now hear only commits that change a match, the active result or `error`, how the active result follows its match, what an app's own `activeIndex` write does, that the query changes only through `api.search`, and match ids as opaque keys that survive a block moving above them. Proof: the docs checks that skill names and the rendered English and Chinese Find pages.
- [x] **7. Check the release notes.** Phase 1 changes only behavior that platejs 53.3.18 on `origin/main`, the release baseline, does not have, so it gets no changeset of its own. Use the `changeset` skill to confirm that no pending Find note contradicts the final behavior. Proof: that skill's check.
- [x] **8. Repair the API teaching.** Run `best-api repair` on the active-result rule, so no skill, Vision file or doc still teaches `activeIndex` as a list position that ignores edits. Proof: its search of live docs and skills for the old teaching is empty.

### Close

- [x] **9. Review and land.** Run `deslop`, `no-comments` and `unslop`, the api-build panel on the diff and its fixes, then `node .agents/pstack/land.mjs --check 'pnpm check --affected'`. The panel reviews Phase 1's diff whether or not it lands, so a saved patch is a reviewed one. Proof: the panel rows and the land log.
- [ ] **10. Fold and close.** Fold the delta into `docs/plans/topics/search.md`, write the Close and flip `Status:`. When Phase 1 stays unlanded, fold only step 3's behavior, keep `Status:` partial and name the patch in `## Open work`. Proof: `node .agents/pstack/plan-page.mjs <plan> --folded` renders.

## Proof

Frozen budget lines. Each timing line is a ratio of Phase 1 to the baseline within one paired run, frozen before any Phase 1 bytes run. The decision metric is the median of CDP `TaskDuration` per action. The lane reports p95 beside it, and no line judges p95. The lane records frame presentation through `requestAnimationFrame`, and no line judges it, because it moves in steps of about 16.7 ms. Work counts come from the lane's own counters on Find's store writes, `findTextRanges` calls and the node keys Find passes to the `refresh` callback its `decorate.observe` receives. The lane keeps those keys and compares them with the set each line permits, so a mutant that refreshes the wrong text node with the right count fails. The lane reports the decoration runtime's own re-reads apart, and no line judges them. Each timed action runs through a drain of at least 300 ms, so the re-reads the runtime defers after native input fall inside the measured work.

The cohorts are `dense-100`, `dense-1k` and `dense-10k`, where every paragraph matches, `sparse-10k` with one match, and `idle-1k` and `idle-10k` with no query. Each reads its mode and workload back from the page. The actions are `no-change`, which types after a block's last match or into a block with no match, `shift`, which types before block 0's match, `create-destroy`, which completes a match and then deletes a character of it, `split-above`, which inserts and removes a paragraph at the top, and `query-change`, which alternates two queries with the same match count. The lane labels programmatic edits as proxies. `dense-1k` repeats `no-change`, `shift` and `create-destroy` with trusted keyboard input, `dense-10k` repeats `no-change` and `shift`, and `idle-1k` repeats `no-change`. A trusted step fails when a typed character arrives without a trusted `insertText` `beforeinput`.

| Line | Cohorts | Rule |
| --- | --- | --- |
| Work, no match changes | `dense-1k` and `dense-10k` `no-change`, programmatic and trusted | Phase 1 writes the store 0 times, refreshes 0 nodes and searches once |
| Work, a block's matches change | `shift` and `create-destroy` | 1 store write; refreshes only the edited block's text nodes and the old and new active ones |
| Work, structural shift | `split-above` | 1 store write and 0 refreshes |
| Work, no query | `idle-1k` and `idle-10k` | 0 store writes, 0 searches and 0 refreshes |
| Correctness | every cohort, both sides | Painted highlights' ranges and text equal a fresh search after every sample, and the document's first match is painted active, because no frozen step moves the active match and a search for a new query starts on its first match. An equal-count stale-paint arm and a page that activates the second match both fail |
| Immediate paint | `shift` and `create-destroy`, programmatic and trusted | The new highlight is painted before the drain. After a programmatic step, the check runs at the first animation frame. After a trusted key, a timer the key's own events queue runs the check before any re-read the runtime defers from that key's commit, however late the frame comes. An arm that paints it only on the deferred re-read fails |
| Dense time | `dense-1k` and `dense-10k` `no-change` and `shift`, programmatic and trusted | Phase 1's median at most half the baseline's |
| No slower | `sparse-10k` `no-change`, `dense-10k` `query-change` | Median at most 5 percent slower than the baseline's |
| No slower, other edits | `dense-1k` `split-above` and `create-destroy`, `dense-100` `shift` | Median at most 5 percent slower than the baseline's |

Step 1 froze the acceptance set as one protocol that fits the hour, `harness/paired/accept.sh` with `harness/paired/acceptance.json` in the run directory. It first runs the counts phase over every cohort on the candidate checkout that `acceptance.json` names, with `--find-assert-lines`, which fails the protocol on any work count, correctness or first-frame miss before any timing runs. Then it times the dense time line on `dense-1k` trusted `no-change` and `shift` and on `dense-10k` programmatic `no-change`. It skips the timing as inconclusive when the one-minute load is over its limit once the counts pass. The counts run must have measured every lane file as committed. Each timing arm checks as it finishes that it measured the counts run's checkout, `HEAD` and fingerprint, or, for a base arm, a checkout with no uncommitted file at that `HEAD`. A miss stops the timing, and the protocol ends in error. With every arm at base speed the counts step took 4 minutes 52 seconds and the timing takes about 45 minutes, about 50 minutes in all. Its planted arm busy-waits about 0.6 of each base median on the candidate, so it lands past the budget whatever Phase 1 saves. A no slower line's planted arm runs the base's code plus the plant, so a candidate at base speed passes and the planted arm fails. The production rerun after acceptance runs the rest: the dense time line on `dense-1k` programmatic and `dense-10k` trusted `no-change` and `shift` and on `dense-10k` programmatic `shift`, the no slower lines on `sparse-10k` `no-change` and on `query-change` at 1,000 and 10,000 blocks, and the other edits line. Every timing line runs paired through `.agents/rules/benchmark/scripts/paired-timing.mjs` with a same-code and a planted-slowdown arm, and it leaves a line inconclusive while the same-code noise reaches the candidate's distance to the budget. On a loaded host every timing line is inconclusive and Phase 1 does not land, as step 5 says.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Performance pack selected | yes | Find's per-keystroke work with an active query is repeated hot work |
| User-facing operation and runtime owner identified | yes | Typing while a Find query is active; `BaseFindPlugin`'s `on.commit` and `decorate.observe` |
| Scale variables and cohorts fixed | yes | Blocks (100, 1,000 and 10,000), matches (1 and all), edit kind (no match change, shift, create and destroy, block inserted above, query change), input (programmatic and trusted keyboard), and an idle control |
| Budget frozen before target measurement | yes | Step 1: `harness/paired/lines.json`, `harness/paired/accept.sh` and `harness/paired/acceptance.json` in the run directory, frozen at `5f94b61fb4` before any Phase 1 bytes ran in the lane |
| Baseline and target probe selected | yes | The editor-perf Find lane at `5f94b61fb4` against the Phase 1 bytes |
| Correctness guard selected | yes | Step 2's oracle, the lane's painted-range check and the existing Find specs |
| Production detector decision recorded | N/A | Find runs in the user's browser, and Plate ships no runtime detector |

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Pre-acceptance scale proof | yes | Step 5 | partial: every count line held on the round 3 bytes at 1,000 and 10,000 blocks; the timing waits on t_ab664f2a |
| Warm latency budget | yes | Step 5's `TaskDuration` lines; Phase 1 waits while the host is loaded | open: no timing ran at a load of 12.29 against 4.5; t_ab664f2a |
| Large/stress scaling | yes | Step 5's 10,000-block cohorts | partial: the `dense-10k` and `sparse-10k` counts held; the timing waits on t_ab664f2a |
| Cold and failure paths | yes | Mounting with a query is unchanged; step 2's failure case | the failure cases pass on the saved patch, 52 package and 28 mounted cases |
| Payload and fan-out | yes | Step 5's refresh and store-write counts | held on the saved patch, where `no-change` writes the store 0 times and refreshes 0 nodes, `shift` refreshes 1, and `split-above` writes once and refreshes none |
| Production-path rerun | yes | Step 5 on the final bytes after review fixes | open: t_ab664f2a |
| Correctness guard | yes | Step 4 | held on the saved patch by step 2's oracle and the lane's painted-range check |
| Before/after receipt | yes | Step 5's log | open: t_ab664f2a |
| Detector and privacy | N/A | No runtime detector | N/A |
| Performance regression check | yes | Step 2's work-count specs run in `pnpm check` | in the saved patch; they run in `pnpm check` once it lands |

## Defaults

| Decision | Pick | Alternative | Word | Impact |
| --- | --- | --- | --- | --- |
| What next meant | Search, the one scope a verdict can run on today | Authored or transactions, once the plans they wait on close | verdict authored | detail |
| Verdict | Pursue, and plan and build it in this run (look) | Stop at the verdict | hold | big |
| How the active result survives edits | It stays on the same match, and the bar still never moves your cursor (look) | The active result is wherever your cursor is, as ProseMirror does | selection-led | small |
| When the active match is deleted | The next match after where it was, and it stays there through undo (safe) | The match now at its old number | same number | small |
| Rechecking only edited paragraphs | Left out, until a quiet-machine profile shows the search itself is a big part of a keystroke in a large document (look) | Try it as a second phase in this plan | phase 2 | small |
| What Find searches | Unchanged, the main document with struck suggestion text included (look) | Settle it first in its own review | coverage first | small |
| The unused search highlight plugin key | Cut it, and fix the old release note that still names it (look) | Keep it | keep the key | detail |
| What a match id looks like | Its text and its order in that text (safe) | Keep today's ids, which change when a paragraph above moves | keep path ids | detail |
| Speed proof on a busy machine | The faster version waits, unshipped, until a quiet machine shows it is faster, and the two small fixes ship now (look) | Hold the small fixes until the faster version ships | ship together | small |

## Evidence

Model: claude-opus-5-5 @xhigh

This review reopens the 2026-10-04 Defer (`2026-10-04-search-audit`) on its own question, because the evidence it waited on now exists and the design it deferred has a primitive and prior art in the repository. It retains that review's ownership split, its native-find and per-view rejections, and the accepted 2026-09-09 view-ownership, controller-cut and range-scrolling plans.

### Requirements

- Literal, case-insensitive search over the canonical main document, including text across inline nodes and content the DOM omits (2026-10-04 head).
- Match paint through plugin decorate with copied presentation, and no document or history writes (head; `find.mdx`).
- Navigation, active-match selection and range scrolling in the exact mounted view (head; `find.spec.tsx`).
- Results stay current through edits, undo, collaboration and whole-document replacement (head; `BaseFindPlugin.spec.ts` lines 67 to 82).
- `update.select` runs in the caller's root on the stored document ([tx-only.ts](../../packages/plitejs/src/core/tx-only.ts) lines 193 to 201, the named-root targeting plan).
- No hidden latency, and no debounce (`VISION.md` Common Essentials). Scale-sensitive machinery needs a pre-acceptance benchmark receipt (`.agents/playbooks/references/architecture.md`, Decision ledger).
- Performance earns no public hook, option or toggle (`docs/vision/common.md`, Taste).

### Lanes

- **Keep the current owner.** It loses. The probe of [BaseFindPlugin.ts](../../packages/platejs/src/features/find/lib/BaseFindPlugin.ts) at `5f94b61fb4` measured median keystroke cost with an active query at 13.0 ms against 1.8 ms idle at 1,000 matches. At 10,000 blocks with one match it measured 8.2 ms against 1.1 ms, of which 6.7 ms is the scan alone. At 10,000 matches it measured 62.1 and 139.7 ms in two runs, against 1.4 and 1.9 ms idle. Each keystroke that changed no match refreshed 1,000 or 10,000 node keys. A second probe moved the active match from `[1,0]` offset 0 to `[0,0]` offset 6 when an edit typed a match into the first paragraph (`find-probe-a1.log`).
- **Delete `BaseFindPlugin` and rely on native browser find.** This is the strongest deletion, and it still loses. Native find misses content the DOM omits, cannot select into the editor model and cannot paint through decorations. None of that changed since the head.
- **Merge Find into Lint as one literal rule.** This is the strongest merger, and it loses. Lint rules are app configuration with async checks, fixes, severities and an `active` switch ([BaseLintPlugin.ts](../../packages/platejs/src/features/lint/lib/BaseLintPlugin.ts) lines 24 to 111). Find's query is a per-keystroke transient with its own count, active result and paint. A merger would run Lint's async and acceptance machinery on every Find keystroke and tie two jobs' lifetimes together. Find reuses Lint's pattern, not its owner.
- **A shared incremental text index in Plite.** It loses. Plite already owns the neutral part, `findTextRanges` with `at` and `content` ([node.ts](../../packages/plitejs/src/interfaces/node.ts) lines 182 to 200). Find and Lint maintain different payloads, a literal query's ranges against rule findings, so no shared index shape has two consumers.
- **The active match is the editor selection,** as in ProseMirror's search plugin and Lint's own navigation. Plite would rebase it for free, and `activeIndex` state could go. It loses for now, because the accepted 2026-09-09 design steps results without moving the caret while the bar keeps focus, and views share one result set. It stays a Defaults alternative with its word.
- **Publish and repaint only what changed, with the active match kept by identity.** This wins, provisionally. CKEditor 5 rescans only the nodes its model differ changed and keeps the active result as a live range, though an edit inside the active match's own block drops it (`findandreplaceediting.ts:228-290`). Plate's target keeps that match while the search still returns its range. Find keeps the whole-document scan, compares its result per text node and refreshes only text whose matches changed, as `BaseLintPlugin` repaints only the blocks a commit changed. Predicted benefit, a guess until the plan's benchmark: at 10,000 blocks a keystroke that changes no match costs about the scan, near the 6.7 ms the probe measured with one match, instead of 62 to 140 ms, and one that changes a block's matches refreshes that block alone. The plan's Close marks this held or falsified. The plan review cut the changed-block rescan this lane first promised. That cut raises the predicted floor from the idle 1 to 2 ms to the scan's cost, and the rescan stays deferred in the Decision ledger.
- **Per-view results.** This loses, as the head found. Results derive from the shared model, and the accepted plan proved shared results with view-local bars.

The proof has limits. The probe ran headless in Bun with no React render, on a host whose load average was 12 to 24, so the two 10,000-match runs spread from 62 to 140 ms. Paint cost, struck suggestion text and named roots were not measured. Multi-view behavior was not observed again; it was accepted from `find.spec.tsx`.

### Dependents

- `distribution` is unaffected. Its files import `PLUGINS` from `packages/platejs/src/utils/plate-keys.ts`, and cutting the unused `searchHighlight` key leaves every key they read.
- `editing` is unaffected for the same reason, through `ExitBreakPlugin.ts`, `SingleBlockPlugin.ts` and `SingleLinePlugin.ts`.
- `ui` is unaffected. Its files import the Plite example registry and loaders, which this target does not touch.

## Close

Reversals and deviations come first.

- Phase 1 did not land. Step 5's counts passed every work, correctness and first-frame line on the round 3 bytes, but the one-minute load was 12.29 against the limit of 4.5, so no timing ran. As step 5 says and the Defaults row 'Speed proof on a busy machine' picks, Phase 1, its cases and the docs edits of steps 6 to 8 wait as one saved patch in this plan's run directory. Suggested task t_ab664f2a times it and lands it. The faster Find the Brief first promised is not shipped.
- Round 3 of the api-build panel reverted round 2's fix that recorded the searched document from the transaction draft. That fix left a search made inside a transaction that edited another block unpainted after its commit. The revert brings back a round 2 warning. After a transaction that called `api.search` throws, `api.move` throws until the next commit that changes the main document. Suggested task t_e7f55348 owns it.
- Round 3 also replaced the limit that `api.search` inside a named root view's `update` throws when a match does not fit the main document. Find now searches the main document there, which Hard cuts lists as a migration.
- A public sentence stated behavior wider than the code three times in the api-build panel, twice in round 2 and once in round 3. `pstack:correct` kept the class rule-only, because only a test of each claim shows it false, and each fix added such a test.
- Step 5's A/A packet and the `idle-1k` floor were never measured, because the load stayed between 12 and 28 against 4.5. Every `dense-1k` line keeps its 0.5 budget until t_ab664f2a measures the floor.
- In every panel round, the opus seat's own runner failed on an expired login and reran once as an Agent call on the same model and effort.

Step 3 landed as fe0fbacdf4 on next. `update.select` in a named root's view returns false and selects nothing, `PLUGINS.searchHighlight` is gone, and the pending Find release note no longer names `FindReplacePlugin`. The editor-perf Find lane and the step 2 cases that pass on those bytes landed with it. This change adds the plan's close, a repeat note in `docs/plans/topics/correct.md`, and a behavior claim wider than the code to the rule-only half of the rules table's row on docs.

Of the 10 steps, 7 are done, two of them (7 and 8) only on the saved patch, whose landing runs their checks again. None are partial, skipped or blocked, and 3 are open (5, 6 and 10). Step 10's fold waits for Phase 1, because the saved patch carries search.md's half of it.

Proof:

- Step 3's named-root case passes, `git grep -w searchHighlight` finds only decision logs, review records, dated plans and the release note's migration line, and `api-reference:check` passes. `land.mjs` pushed it after every step of `pnpm check --affected` passed.
- On the saved patch's bytes, 52 package cases and 28 mounted cases pass, the platejs typecheck passes 84 of 84 tasks, and lint finds nothing.
- On those bytes, the lane's counts held at 1,000 and 10,000 blocks. A keystroke that changes no match writes the store 0 times and refreshes 0 nodes, `shift` refreshes 1 node, a block inserted above writes once and refreshes none, and an idle editor runs 0 searches.
- The api-build panel ran three rounds, the cap. Of its 11 critical findings, 10 were applied and 1 dismissed, and each round's fixes got their writing passes.

Limits:

- No timing ran on Phase 1. The lane's prediction under Evidence is untested: at 10,000 blocks a keystroke that changes no match does no publication or repaint work, but its time is unmeasured.
- A match that spans text nodes still refreshes its first text node when a block is inserted above it. Suggested task t_3b8b6e48 owns it.
- An active result picked or searched inside `editor.update` jumps to a new match typed right before it, because a Plite range anchor made inside an update does not move for an insertion at its start. Suggested task t_bcd9a432 owns it in Plite.
- Phase 1's publish is not atomic. It updates its bookkeeping and releases the old anchor before the new anchor can throw. Round 3 deferred it, because a fix would add code no round reviews.
- IME composition is unproven.

## Open work

- Time Phase 1 on a quiet host and land the saved patch, `phase1.patch` in this plan's run directory, sha256 c41c0fc55b5fd43cf36b346a01ba8b5ffc12788a7665b84521a175c67f18092a, made against fe0fbacdf4 and applying to next at e9612607. Run step 5 as written, meaning the A/A packet and the `idle-1k` floor on two arms at fe0fbacdf4 from `harness/paired/arm-up.sh`, then `harness/paired/accept.sh` on fe0fbacdf4 with the patch, judged by the lines in Proof and step 5's floor rule. Once every line passes conclusively, the patch owes `plate-docs` on both Find pages, the `changeset` check, `best-api repair` on the active-result rule and the production rerun. owner: zbeyens. stop: suggested task t_ab664f2a lands or is dropped, or a conclusive timing miss sends the design back to `architect`. Tracked in the suggested-task ledger.
- Keep `api.move` working after a transaction that called `api.search` throws. owner: zbeyens. stop: suggested task t_e7f55348 lands or is dropped. Tracked in the suggested-task ledger.
- Skip the refresh of a match that spans text nodes and only moved. owner: zbeyens. stop: suggested task t_3b8b6e48 lands or is dropped. Tracked in the suggested-task ledger.
- Keep a published anchor through a move and an edit in one update. owner: zbeyens. stop: suggested task t_bcd9a432 lands or is dropped. Tracked in the suggested-task ledger.
