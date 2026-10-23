---
review_scopes: [search]
verdict: pursue
review_basis: [2026-10-21-search-find-maintenance]
work_kind: implementation
review_commit: 89a3a795f43b072441fc6947f14c2767c7005f20
review_inputs: [packages/platejs/src/features/find/lib/BaseFindPlugin.ts, packages/platejs/src/features/find/lib/BaseFindPlugin.spec.ts, packages/platejs/src/features/find/lib/BaseFindPlugin.oracle-and-work.spec.ts, packages/platejs/src/internal/plugin/pluginStore.ts, packages/platejs/src/facade.ts, packages/plitejs/src/interfaces/node.ts, packages/plitejs/src/internal/index.ts, packages/plitejs/src/core/commit.ts, 'content/docs/(plugins)/(functionality)/find.mdx', docs/development/enforcement.md, docs/plans/2026-10-22-search-block-rescan.md, docs/plans/2026-10-21-search-find-maintenance.md, VISION.md, docs/vision/common.md]
review_upstreams: ['../vscode@df2411cf7d8f2e0cfc79109a3bc8eaab2c69165b', '../codemirror-search@4db1811530f9e77239e5de8bd7bb155ffc0377e0', '../codemirror-view@fbff59ba004d80d8c914f64c42586387b08706ac', '../prosemirror-search@ff1148a339bb7daa9d7b02dff9614b9d7123f552', '../lexical@dd5c41b13193efa9ab1574234d8593d2c9e4f988', '../ckeditor5@14e73cc31b869ce483bd8449f40b9102ac7746da']
---

# Find: rescan only the part of the document an edit changed

Status: building: steps 1 to 7 done; landing, then step 8
Topic: search
Playbook: plan

This plan replaces `2026-10-22-search-block-rescan`, whose rescan round 3's panel reverted. It keeps that plan's Pursue, its research and its frozen timing lines, and changes how Find learns what an edit changed. The reverted rescan asked the commit which nodes changed and then asked a run lookup where each one belonged, and both questions failed in ways the panel found three times. This design compares the document Find last searched with the current one. Plite never edits a node in place, so every node an edit did not touch is the same object in both trees. Find walks down from the root along the one child that differs, and stops at the deepest node that the whole search visits on its own in both trees. It searches that node and splices its matches into the list. Architect's arena scored four designs and picked this one, 26 points against 25, 21 and 20. Rounds 1 to 3 of the plan panel changed parts of it, which the Challenge delta lists.

## Brief

### What will change?

Typing in one paragraph re-searches only that paragraph, as you asked. Round 3's review threw out the last try, so this one finds the edited part by comparing the document before and after the edit.

### What could go wrong?

Tests check every edit against a fresh search, since a wrong guess leaves stale highlights. Enter or Backspace across paragraphs still searches everything. A match list other code writes shows as written until the next change or search.

## Teach

Find highlights every match of a search and steps through them. The search reads each paragraph as one string, or more exactly each stretch of text that no block breaks, so a match never runs into the next paragraph.

With Phase 1, each edit made while a search is open searches the whole document again. Then it compares the new matches with the old ones, so it only redraws what changed. The search and the comparison still touch every paragraph.

After this change, Find keeps the document it last searched. The editor never changes a paragraph in place, so everything an edit left alone is the same object. Find follows the one part that differs, down to the smallest piece the search reads on its own, and searches only that piece. Enter or Backspace across paragraphs, or an edit in two places, still searches everything.

## Public API

No public call changes. Inside Find, Phase 1's code that runs after each commit, at `fb91632b47`, searches the whole document when the document changed. The planned version checks its last search on every commit and searches only the part that changed.

```ts before
// packages/platejs/src/features/find/lib/BaseFindPlugin.ts
commit: ({ commit }) => {
  if (searchedQuery && commit.changed.has('document')) {
    publish(searchedQuery, true);
  }
},
```

```ts after
// packages/platejs/src/features/find/lib/BaseFindPlugin.ts
commit: () => {
  if (search?.query) {
    const children = readMainChildren();
    const owned = store.get().matches === search.matches;
    const current = owned && search.schema === editor.read.schema.identity();
    if (!current || children !== search.children) {
      const scope =
        current && !search.failed
          ? getTextSearchScope(editor.read.schema, search.children, children)
          : null;
      if (!scope || !publishScope(search, scope, children)) {
        publish(search.query, true);
      }
    }
  }
  if (held === 'all' || held.size > 0) {
    const nodeKeys = held === 'all' ? held : [...held];
    held = new Set();
    send(nodeKeys);
  }
},
```

## What other editors do

This plan reuses the 2026-10-22 review's reads of VS Code, Monaco, CodeMirror 6 and ProseMirror's view at the commits in the front matter, and the 2026-10-21 reads of `prosemirror-search`, Lexical and CKEditor 5. Google Docs, Word and Word for the web are closed, so their rows rest on public material only. Only CKEditor 5 rescans just the nodes an edit changed, and it finds them from its model differ, as the reverted rescan did from commit metadata. No editor read finds them by comparing node identity. The research run is `docs/plite/research/2026-10-22-find-incremental-decorations/`.

| Delta | Editor | Where results live | Rescan on edit | Repaint on edit | Active match identity | Deleted or hidden text | Other roots |
| --- | --- | --- | --- | --- | --- | --- | --- |
| changed | Plate | Plugin store | Only the deepest node the whole search reads on its own that holds the edit, usually one paragraph; the whole main document after a top-level insert or removal, an edit in two places under one parent, a replace with new nodes, a schema change, the first commit after the app writes its own match list, and the first tree change after a failed search | Only text whose matches changed, from Phase 1 | A range anchor that follows its match, from Phase 1 | Searched | Not searched or painted |
| added | VS Code and Monaco | A match list, then decoration ids in the text model's interval trees | The whole search scope, 100 ms after the edit, capped at 19,999 matches (`findModel.ts:81`, `:105-110`); Monaco packages the same core, not checked here | The interval trees move decorations with the edit at once; only rendered lines whose input changed redraw | A decoration id; an edit clears its active styling | Not checked | Not checked |
| added | CodeMirror 6 (`@codemirror/search`) | A decoration set over the visible ranges | Only the visible ranges, on every doc, selection or viewport change (`search.ts:399-425`) | Rebuilt for the viewport, and only changed tiles redraw; `MatchDecorator` instead maps its set and rescans changed visible lines (`matchdecorator.ts:103-143`) | The editor selection | Not checked | Not checked |
| added | Google Docs (public material only) | Unknown | Unknown | Canvas rendering is documented; what it redraws is not | Unknown | Unknown | Unknown |
| added | Word desktop (public material only) | Unknown | Unknown | Background pagination is documented; local redraw is not | Unknown | Unknown | Unknown |
| added | Word for the web (public material only) | Unknown | Search as you type is documented; a rescan after an edit is not | Unknown | Unknown | Unknown | Unknown |

## Layer and owner

| Change | Layer (Plite or Plate) | Package | Why |
| --- | --- | --- | --- |
| Find the deepest node the whole search reads on its own that holds every difference between two trees | Plite | `plitejs/internal`, from a new `internal/text-run.ts` whose `isTextRun` `findTextRanges` in `interfaces/node.ts` also calls, and Plate's facade | `findTextRanges` owns what it searches as one string, so one private test decides both what it reads as one run and where a scope may stop |
| Keep the searched tree and its published matches, and splice one node's new matches into the list | Plate | `platejs/find` (`BaseFindPlugin.ts`) | Find owns its results and their publication |

The Plite change adds an internal export only, the same path `withEditorUpdateRootScope` takes through the facade today, and no file moves between entrypoints. Plite's public index re-exports all of `interfaces/node.ts`, so the new code lives in an internal file instead.

## Native behavior and proof

| Behavior | What changes | Proof surface |
| --- | --- | --- |
| Typing inside a paragraph | Rescans that paragraph alone | Find's seeded oracle and the work cases at 100 and 1,000 blocks; the lane's trusted `shift` and `create-destroy` counts at 1,000 and 10,000 blocks |
| Typing that splits or joins text nodes inside a paragraph, such as at a mark boundary | Rescans that paragraph alone | Oracle; the lane's trusted `shift`, where every other step splits a text node |
| Typing in a text that sits beside blocks in one element | Rescans that text alone | Oracle; a work case |
| Typing in a paragraph beside text or in a nested container, such as a table cell | Rescans that paragraph alone | Oracle; a work case for each, the nested container standing for every container, because the walk branches on no element type |
| A mark or block property applied inside one paragraph or one container | Rescans that paragraph or container | Oracle |
| A mark applied across two top-level paragraphs | Searches the whole document | Oracle |
| A property change that turns an inline element into a block, or back | Rescans the nearest node the search reads on its own in both versions, or the whole document | Oracle |
| Enter, Backspace or a join between top-level blocks, a paste of several blocks | Searches the whole document, as Phase 1 | Oracle; the lane's `split-above` |
| Enter inside a nested container, such as a table cell or a quote | Rescans that container | Oracle, through its nested containers |
| A search inside `editor.update` after an edit in the same update | Searches the update's edited tree; Find holds the keys it would refresh and sends them at the commit, so the matches paint in that commit | The mounted Find spec, whose cases check paint right after the commit |
| A search inside an update that throws | The store keeps that search's results until the next commit of any kind, which settles them | Package and mounted cases; the oracle commits a selection change after each step whose update threw |
| A schema change, such as an element type that stops being inline | Searches the whole document in the commit that changes the schema | A package case |
| An app's own write to `matches` | Find repaints every text node at the write, so the app's list paints as written, in any order, and at each move through it. It stays until Find next publishes, at the next commit while a query is open or at the next search, which searches everything and repaints every text node again | Oracle; mounted cases for a list written while a view is mounted and then Find's own list restored, a move through a list the app wrote, a list out of document order, the next commit, a clear, and a clear after an edit in the same update |
| A store subscriber's write to `matches` while Find publishes | The subscriber's list shows as written until the next commit, which searches everything | Oracle; a mounted case |
| Typing beside a long run of unchanged inline elements | The walk checks each direct child once and never walks into the run | A work case counting inline checks at 10 and 1,000 inline elements |
| Undo | Follows the same rule as the edit it replays | Oracle, with at least 10 local undo rescans; a work case at 1,000 blocks |
| Redo | Follows the same rule | A work case at 1,000 blocks |
| A remote commit | Follows the same rule | Unproven for its locality, because the only harness runs the local path; Phase 1's package case keeps the active result through one |
| IME composition | Unchanged code path | Unproven |

## Main changes

- On every commit while a query is active, Find checks its last search. The store must hold the array Find published, the schema must be the one it searched with, and the main tree must be the one it searched. When all three hold, it does nothing, at the cost of one read of the tree per commit. A schema change, a search inside an update that threw and an app's write can each leave the results stale on a commit that changes no text, so the check does not wait for a document change.
- When only the tree differs, Plite's internal `getTextSearchScope` walks down from the root. At each node it requires both child lists to have one length and exactly one differing slot. It also requires `isTextRun` to be false for the node in both trees, which is the test `findTextRanges` uses to decide whether it reads a node as one string. `isTextRun` looks for a block among a node's direct children before it walks into any inline element, so an unchanged run of inline elements beside the edited paragraph costs one check per direct child. The differing child becomes the scope, and the walk goes on into it unless it is a text. The walk compares every slot of each node on its path by reference, so a keystroke costs one comparison per top-level block, and the search that reads the scope checks its inline children once more. A property change that keeps a node's run status leaves its children list the same, so the walk stops at that node. The root is never a scope, and the function returns `null` when only the whole search is exact.
- Find searches the scope with `findTextRanges` and `at`, and replaces the matches whose anchor path starts with the scope's path, which sit together in document order. It keeps every other match object and reuses a match inside the scope when its id and range are equal. It then settles the active result and publishes with Phase 1's code.
- Any other stale commit runs Phase 1's whole search. That covers a top-level insert or removal, a commit that changes two slots under one parent, a replace with new nodes, a root whose children are all text or inline elements, a schema change, the first tree change after a failed search, a scope search that throws, and the first commit after the app writes its own `matches`. A replace that reuses most nodes can still splice.
- Find refreshes by key only for its own list, whose match ids hold the key of the text each match paints in. Keys for another writer's list would come from its anchor paths, which hold only while Find's searched tree is the committed main tree and the app's paths resolve there. So while the store shows such a list, or returns from one to Find's own, its store subscriber refreshes every text node at each change of `matches` or the active index. An app's list then paints as written at the write and at each move through it. Find's next publish over it, or the app restoring Find's own array, clears its highlights. Find paints its own list by a binary search in document order. It paints any other list through a copy sorted into document order, made once per list, so painting costs one binary search per text node either way.
- Find keeps one private record of its last search: the query, the exact tree the search read, whether that search failed, the schema it read with, and the match array the store received. A match id is its text node's key and its order in that node, so Find reads a match's key back from its id instead of keeping a map. The tree is the main document as the current update sees it, which is the update's edited tree inside `editor.update`, and Find searches that tree through a text-range view, so the tree, the matches and their keys come from one read. A failed search keeps its tree but never serves as a splice base, so a selection change after it searches nothing and the next edit searches everything. Find snapshots the matches with the store's own `snapshotPluginState(matches, true)` and installs the record before `store.set`, so a subscriber that writes during the publish can never become the baseline. `searchedQuery` and `searchedChildren` go.
- Views paint the committed tree. While Find's record holds a tree the view has not committed, such as an update's edited tree, Find holds the keys it would refresh, or the full refresh, instead of sending them. The next commit settles the record first and then sends what it held once, so the matches paint in that commit. An ordinary commit holds none.
- `findTextRanges` and `getTextSearchScope` share one private test, `isTextRun`, in Plite's new `internal/text-run.ts`. The 2026-10-22 verdict said Plite was out of scope; this plan changes `node.ts` and adds one internal file and its export.

## Outcome

With a query active, typing, deleting or formatting inside one paragraph searches that paragraph alone, at any document size. Enter or Backspace that adds or removes a top-level block still searches the whole document, as Phase 1 does. After every commit, the matches, count, active result and paint equal a fresh search, with one rule for a list another writer stores. When an app or a store subscriber writes `matches`, before Find's publish or during it, Find shows and paints that list as written. Find's next publish, at the next commit or search, replaces it. A write made during Find's publish is the one case where a commit ends unequal to a fresh search, as in Phase 1, and the owner of that fix is zbeyens, under the Defaults word read-only matches. Every public call keeps its shape.

## Scope

- In: `packages/platejs/src/features/find/lib/BaseFindPlugin.ts` and its two specs, `packages/plitejs/src/interfaces/node.ts`, the new `packages/plitejs/src/internal/text-run.ts`, `packages/plitejs/src/internal/index.ts`, `packages/platejs/src/facade.ts`, the mounted Find spec `apps/www/src/registry/components/editor/find.spec.tsx`, the editor-perf runner `apps/www/scripts/run-editor-perf.mts`, the Find docs page and its Chinese twin, and row 58 of `docs/development/enforcement.md`. The build starts from the current tree, Phase 1's code at `fb91632b47` on `89a3a795f4`. Phase 1's open steps 5, 6 and 10 in `docs/plans/2026-10-21-search-find-maintenance.md` close in this build, because Phase 1 lands here.
- Out: the decoration runtime, the editor's own keystroke cost at 10,000 blocks, the copy of the whole match list on each changed publish (t_95b5151d), Lint's own run test (t_253fd716) and read-only `matches`.

## Decisions

### Arena against the control

Architect ran four runners on the same task, each told the outcome and none the mechanism: Opus, Astra and Sol at `xhigh`, and the lead's own candidate. An Opus cross-judge scored them on six criteria. Phase 1's whole search is the control that adds nothing.

| Design | How it finds what changed | Score | Typing in a paragraph | Cost when it falls back |
| --- | --- | --- | --- | --- |
| Phase 1, the control | Nothing; it searches everything | n/a | Searches every paragraph and compares every text node's matches | n/a |
| Identity descent (lead, picked) | Compares the searched tree with the current tree | 26 | Searches one paragraph | Phase 1 plus one pass over the top-level slots |
| Closed dirty region (Opus) | Seeds from commit metadata, closed over runs | 25 | Searches one paragraph | Phase 1 plus capped lookups |
| Certified scope with a frontier index (Sol) | An index of which run holds each node, plus a store projection | 21 | Searches one paragraph | Phase 1 plus an index rebuild on every whole search |
| Scanner with a membership index (Astra) | An index, a new commit visitor and read-only `matches` | 20 | Searches one paragraph | Phase 1 plus an index rebuild, and a new store promise for every plugin |

The descent wins because its correctness depends on two facts one reader can check in one function. Nothing outside the scope changed identity, and the whole search reads the scope on its own in both trees. Neither depends on commit metadata being complete, which is what produced round 3's critical findings 1, 2 and 4.

### What the losing designs handled

| Case | Raised by | Result |
| --- | --- | --- |
| A changed text or inline element directly inside a container that also holds blocks | Sol | Graft: the scope rule stops at the deepest node the whole search reads on its own, text and inline elements included, at any depth |
| The splice property over generated documents, with coverage floors and random app and subscriber writes | Opus | Graft: it runs at Find's commit entry as the widened seeded oracle, because Find's store after each commit must equal a fresh search, which is the splice property, and `.agents/pstack/rules/tests.md` keeps one test per failure mode at the outermost entry |
| Counting the discovery work itself | Sol | Dropped in the plan panel's round 1: a counter inside Plite that only a test reads is code the product never uses, so the work cases count the nodes `findTextRanges` searches, and step 6 times the walk in the `dense-10k` cohorts |
| Pinning the whole search before `breaksTextRun` is extracted | Astra | Graft: a base-versus-after run over generated documents, logged as proof, because Find's oracle and the scope both call `findTextRanges` and would share a refactoring mistake |
| A subscriber's write to `matches` during a commit's own publish never survives | Sol, Astra | Limit, narrowed by the plan panel's round 3: the write shows and paints as written until the next commit, like any app write; read-only `matches` is a Defaults alternative |
| Enter at the top level stays local | Opus | Limit: a top-level insert or removal searches everything, because it shifts every later match's path |
| Several changed places in one commit stay local | Opus, Sol | Limit: one scope per commit; several scopes is a Defaults alternative |
| Paint after the app writes its own `matches` | Sol, Astra | Graft, from the plan panel's rounds 2 and 3: Find's next publish over another writer's array, at a commit or a search, refreshes every text node |
| Lint's run test uses the same rule | Astra | Limit: Lint's `kindOf` calls an empty block a text block and stays with t_253fd716 |
| Publishing a changed match copies the whole list | all four | Limit: stays with t_95b5151d |
| A match across a block boundary inside one container | all four | Limit: the search keeps its behavior, and the docs say it searches adjacent text leaves within one text run |

### Decision ledger

| Surface | Current | Target | Owner | Reason | Adoption | Proof | Risk | Verdict |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Find's rescan after an edit | Phase 1 searches the whole main document on each commit | The identity descent picks one scope, and Find splices its matches | `platejs/find` | Find's commit work grows with the document while the edit touches one paragraph | Internal; no caller changes | Steps 3 and 4, then the frozen timing lines in step 6 | Stale highlights from a wrong scope | gate, on step 6's frozen lines; a conclusive miss sends the design back to `architect` |
| What `findTextRanges` reads as one text run | A private `collectTextRun` inside `findTextRanges` | One private `isTextRun` that the search and the scope both call | `plitejs` `internal/text-run.ts` | One owner of the run rule, as the 2026-10-22 correct row requires | Internal | Step 1's base-versus-after run | The walk also relies on the search reading each child of a non-run node on its own, a rule `isTextRun` does not hold, so a change to that rule desyncs the walk until the oracle catches it | keep |
| Find's record of its last search | Three variables, the tree read after the search, and an id-to-key map | One private record of the query, the searched tree, whether that search failed, the schema and the matches, checked on every commit and installed before the store publishes | `platejs/find` | Closes round 3's failures 3 and 5, and the plan panel's failed-search, schema and stale-commit findings | Internal | Step 4's subscriber writes and rolled-back steps in the oracle; step 3's package and mounted cases | A subscriber's write lives until the next commit | rearchitect |
| App writes to `matches` | Allowed; shown until the next commit | Allowed; painted as written from the write, in any order, until Find's next publish, at a commit or a search, which searches everything and refreshes every text node | `platejs/find` | Read-only `matches` would change every plugin's store contract | None | Step 4's random app and subscriber writes; mounted cases | One full refresh per app write, and one more at Find's next publish | keep |
| The decoration runtime | Re-reads only the nodes a source marks dirty | Unchanged | `plitejs/react` | It cost 0.03 to 0.26 ms per pair in every Phase 1 profile | None | The 2026-10-22 profiles | none new | keep |
| Publishing a changed match | Copies and freezes the whole list, and copies the id-to-key map | Copies and freezes the whole list; the map is gone, because each id holds its key | `platejs/find` | Its own task, t_95b5151d, which the close extends to the snapshot walk | None | n/a | A keystroke that changes a match still costs O(matches) in two passes | defer |

Challenge delta: round 1 of the plan panel, with Opus, Astra and Sol at `xhigh`, raised six critical findings, and a prototype of the design proved each fix before this revision.

| Finding | Raised by | Change |
| --- | --- | --- |
| The scope code in `node.ts` became public, because Plite's index re-exports that whole file | Opus | Moved to `internal/text-run.ts` |
| A search that threw became the next splice's baseline | Opus, Astra, Sol | The record keeps no tree after a failed search |
| A search inside `editor.update` after an edit refreshed nodes the view had not committed yet, so its matches never painted | Astra, Sol | Find refreshes those keys again at the commit, and the `'same'` result is gone |
| A schema change that alters what is inline went unseen | Astra, Sol | The record keeps the schema identity, and a change searches everything |
| A subscriber that writes `matches` during the publish leaves results unequal to a fresh search | Sol | Left open as a stated limit, since Phase 1 fails the same way |
| The optional top-level window assumed the searched tree is the commit's previous tree | Sol, Astra | The window and its 0.2 ms trigger are gone |

Round 2 re-reviewed round 1's changes with the same seats and a prototype of them. It raised two critical findings. This revision applies the first and half of the second, and leaves the other half open again.

| Finding | Raised by | Change |
| --- | --- | --- |
| Find checked its results only on commits that change the document, so a schema change, a search inside an update that threw, and a search between an edit and its removal left stale results | Opus, Astra, Sol | Find checks its record on every commit |
| Highlights from an app's own match list stayed after the next commit | Astra | That commit refreshes every text node |
| A subscriber that writes `matches` during the publish keeps a new match from counting and painting in that commit | Sol | Left open again, and its Defaults row is now rated answer |
| Held keys were sent and held again on every commit after a failed search, a rolled-back search or a clear inside an update that threw | Opus, Sol | Find holds keys without sending them and sends them once at the next commit, and a failed search keeps its tree, marked failed |
| The walk copied `findTextRanges`' run test in a weaker form | Opus | Both call one `isTextRun` |
| The Outcome claimed locality that Enter and Backspace do not get | Opus | The Outcome and Teach say so, and the Enter row in Defaults is rated look |
| The locality rows cited an oracle that cannot fail when locality is lost | Opus | Work cases for text beside a block, a paragraph beside text, a nested container, a table cell, a remote commit, undo and redo |
| The id-to-key map came back without a record, and the predicted benefit covered more than search work | Opus | The ledger and Evidence say so |
| The mounted case allowed a delayed paint | Opus, Astra | It checks paint right after the commit |

Round 3, the last plan round, re-reviewed round 2's changes with the same seats and a prototype of them. It raised one critical finding, which this revision applies with a test that fails on round 2's code, and warnings and nits, which it applies or dismisses as listed.

| Finding | Raised by | Change |
| --- | --- | --- |
| A search or a clear made after the app wrote its own list removed the evidence of that list, so the app's highlights stayed painted | Astra, Sol | Find refreshes every text node whenever it publishes over a list another writer stored, at a commit or a search, and holds that full refresh like keys inside an update |
| A store subscriber's write during the publish changed the count but repainted only the nodes Find changed | Opus | Find repaints every text node when the store holds another list after its own write, so one rule covers every app write; the Outcome states it, and its Defaults row drops to look because paint now matches the store |
| Finding a scope beside a long run of inline elements walked into every one of them, in both trees | Astra, Sol, Opus | `isTextRun` checks a node's direct children for a block first, and builds paths only when it collects entries; a work case counts the inline checks at 10 and 1,000 inline elements |
| Two package cases failed on no planted bug that a mounted case misses, and the remote work case ran the local path | Opus | Cut, and the remote row is Unproven; the file split Opus suggested is dismissed, since each file holds one test kind |
| Step 3's text said a failed search makes every commit search everything | Opus | Reworded to a tree change after a failed search |
| Step 1's hash covered neither a view with `content: true` nor a text node as `at` | Opus | A second leg covers both |
| `isTextRun` holds only half the descent rule, so the ledger's "Risk: none" was too strong | Opus | The ledger names the risk; moving the other half into `text-run.ts` is dismissed, because the oracle compares every step with a fresh whole search |
| Step 8 had no `/pstack:correct` run for row 58's class | Opus | Added |
| The named-root case still waited for its paint | Opus | It checks paint right after the update |

Diff round 1 reviewed the built tree with the same seats. It raised four critical findings. This revision applies three of them, which share two causes, and adds mounted cases that fail on the reviewed code. It leaves the fourth open, because the base fails it the same way.

| Finding | Raised by | Change |
| --- | --- | --- |
| An app's write that changes only inactive matches, or restores Find's own array, sent no refresh, so old highlights stayed | Astra, Sol | Find's store subscriber refreshes every text node whenever the `matches` array changes to or from one Find did not publish |
| Painting binary-searched every list, so an app's list out of document order painted only part of it | Astra | Find binary-searches only its own list and checks every match of any other list |
| An active result picked inside an update keeps an anchor from that update's draft | Sol | Open: the base and Phase 1 fail Sol's case the same way, the Find pages state the limit, and t_bcd9a432 owns the fix in Plite |
| The oracle could not catch a walk that checks the run rule in one tree only | Opus | A package case for the commit that turns a block beside text into an inline element, which the `before-only-run` planted bug fails, as the inline-to-block case fails `one-tree-run` |
| The id-to-key map repeated what each id holds and was copied on every changed keystroke | Opus | The map is gone, and Find reads a match's key from its id |
| The proof ran on older bytes, and three planted bugs no longer applied | Opus | The lead repaired and extended the planted-bug runner and reran every proof on the final bytes |
| A splice could start from a base that holds matches without a node key | Opus | A scope search falls back to the whole search when the scope or its base holds such a match |
| The store subscriber compared the record's tree with the active root instead of the main document | Opus | It reads the main document |
| The inline-check case passed with no checks, and deleted the schema's `isInline` | Opus | It requires at least one check and restores `isInline` |
| The table-cell case added nothing over the nested-container case and pulled in the table feature | Opus | Cut, with the find partition's table dependency |
| A mounted case's title no longer held | Opus | Retitled |
| The oracle copies Find's active index, so a wrong active result can pass it | Astra | No change: the `scope-no-follow` planted bug fails 15 package cases and 3 oracle cases |
| A throw inside the commit handler skips sending held keys | Opus | Noted: Plite reports the throw, and the next commit sends them |
| `isTextRun` both answers and collects | Opus | Dismissed: two functions would write the recursion twice |
| The plan understated the walk's cost | Opus | Main changes says the walk compares every slot on its path; the block pre-check stays, and step 6 times whole searches against Phase 1 |

Diff round 2 reviewed round 1's fixes with the same seats. It raised one critical finding, which two seats found apart. This revision applies it with a mounted case that fails on the reviewed code, and applies or dismisses the warnings and nits as listed.

| Finding | Raised by | Change |
| --- | --- | --- |
| Moving through a list the app wrote refreshed only the nodes its match ids name, and an app's ids name none, so the old active highlight stayed | Opus, Sol | While the store shows another writer's list, or returns from one, each change of `matches` or the active index refreshes every text node; a mounted case moves through such a list |
| Painting another writer's list checked every match for each text node, so a full refresh cost text nodes times matches | Opus, Astra, Sol | Find paints such a list through a copy sorted into document order, made once per list, and a work case counts path comparisons at 100 and 1,000 blocks |
| The planted-bug runner counted Bun's 5-second timeout as a failing assertion | Opus | The runner allows 60 seconds and flags any timeout, and none occurred on the final bytes; raising the oracle's own timeout is dismissed, because the repo lint forbids it and the oracle runs in 1.36 s |
| Round 1's fix for the store subscriber's root read was never proven | Opus | Unproven. The `store-write-active-root` planted bug fails no case. A move inside a named root's update makes its anchor from that update's draft, which is round 1's open Sol 2 defect, so the fixed and the planted code both lose the match. The probe `panel-run-diff-2/repro/lead-named-root-move.probe.spec.ts` fails on both and waits for t_bcd9a432 |
| The `installed-after-set` planted bug no longer applied, so round 1's claim that every proof reran on the final bytes was wrong for it | Astra, Sol | Repaired; it fails 2 package and 2 oracle cases |
| The restore case waited for a commit before it checked paint | Astra | It checks paint right after the app's write, and a planted bug that holds the restore's refresh fails 3 mounted cases |
| The store subscriber read the matches two ways and refreshed twice | Opus | It reads the listener's state once and sends no keyed refresh after a full one |
| Plan text the round 1 delta wrote was out of date | Opus | Fixed |

Diff round 3, the last diff round, reviewed round 2's fixes with the same seats. It raised no critical finding. This revision applies or settles the warnings and nits as listed.

| Finding | Raised by | Change |
| --- | --- | --- |
| The paint work case counted only `PathApi.equals`, so a copy sorted again at every read, or a linear walk to a text's first match, passed it | Opus, Astra, Sol | The case also counts `PathApi.compare` and is retitled; both planted bugs fail its bound, and the final code makes 13.7 times the comparisons at 1,000 blocks that it makes at 100 |
| A move through a list the app wrote refreshes every text node, though only two matches changed | Astra, Opus | Deferred to the owner. Keys from the matches' anchor paths would need the record's tree to be the committed main tree and the app's paths to resolve there, so the full refresh stays the fallback for this rare path. Astra's probe counts 2,000 source reads for such a move at 1,000 blocks, against 2 for Find's own list. Main changes now gives this reason instead of claiming an app's match carries no node key |
| The restore case failed on no planted bug that another case misses | Opus | A planted bug that refreshes everything only when Find publishes over another writer's list fails the restore case alone |
| The Native row said an app's list ends at the next commit, which is false while the query is empty | Opus | The row and its Defaults row say the list stays until Find's next publish, at the next commit while a query is open or at the next search |
| `onStoreWrite` mixes anchoring and paint around two early returns, and its flag stays set after Find adopts an app's copy of its list | Opus | Dismissed. The suggested order changes no behavior, and the stale flag costs one extra full refresh with correct paint, while a rewrite at the last round adds unreviewed code |

## Steps

### Phase 2: rescan only the part an edit changed

- [x] **1. Share the run test.** Add `isTextRun` in `packages/plitejs/src/internal/text-run.ts` and call it from `findTextRanges` in `packages/plitejs/src/interfaces/node.ts`, in place of its private `collectTextRun`. Proof: a seeded run of `findTextRanges` over 400 generated documents, with roots of inline elements, empty inline and block elements, mixed containers and nested containers, prints the base's hash, `5b244d5e…` over 7,084 searches, again after the edit, through `proof.mjs`. A second leg over 400 more documents searches a text-range view with `content: true` and every node path as `at`, text nodes included, and prints the base's `52742695…` over 14,134 searches again. A planted change that lets an empty block join a text run changes it; `pnpm --filter plitejs test:partition:core` and `typecheck:partition:core` pass.
- [x] **2. Add the scope function.** Add `getTextSearchScope(schema, before, after)` to `text-run.ts`, walking only through nodes for which `isTextRun` is false in both trees, and export it through `plitejs/internal` and Plate's facade. Proof: `pnpm --filter plitejs typecheck:partition:core` and `lint:partition:core` pass; a logged probe shows Plite's public index exports neither function, and finds both with the code planted in `node.ts`; step 4's oracle is its test, because Find is its only caller.
- [x] **3. Splice in Find.** Replace `searchedQuery` and `searchedChildren` with one private `search` record of the query, the tree, whether the search failed, the schema identity and the matches, and read each match's node key back from its id. Read the main tree once through the update's draft, in the same read that names the match keys, and search that exact tree through a text-range view, so the record's tree and its matches come from one read. Snapshot the matches with `snapshotPluginState(matches, true)`, install `search`, then `store.set`. On every commit with a query, do nothing when the store holds Find's array, the schema is unchanged and the tree is the searched one. Search everything when the store holds another array or the schema changed, or on a tree change after a failed search. From the store subscriber, refresh every text node at each change of `matches` or the active index while the store shows a list Find did not publish, or returns from one to Find's own. Paint another writer's list through a copy sorted into document order, made once per list. Otherwise splice the scope's interval, reuse equal match objects and return the same array when nothing changed. A scope search that throws falls back to the whole search. While the record's tree is not the committed tree, hold the keys a refresh would send, or the full refresh, and send them once after the next commit settles the record. Proof: `pnpm --filter platejs test:partition:find` and Plate's typecheck pass, with Phase 1's 52 cases unchanged and these package cases: an edit after a failed search, a scope search that throws, the commit that stops the schema treating an element as inline, the commit that turns an inline element inside a text run into a block, the commit that turns a block beside text into an inline element, and an app's reordered match list followed by a commit that only moves the selection. One more package case checks that no refresh follows a clear inside an update that threw. The mounted Find spec, `apps/www/src/registry/components/editor/find.spec.tsx`, passes its 38 cases and checks paint right after each commit or search. It covers a search inside an update after an edit, a search between an edit and its removal, a selection change after a search in an update that threw, a clear in an update that threw, a search inside a named root's update, a match the app wrote at the next commit, a list the app writes while a view is mounted and then Find's own list restored, a move through a list the app wrote, a list out of document order, a clear that replaces the app's list, alone and after an edit in the same update, and a list a subscriber writes while Find publishes.
- [x] **4. Widen the oracle and count the work.** Widen Phase 1's seeded oracle in `BaseFindPlugin.oracle-and-work.spec.ts` with property changes, inline and block type flips, mark toggles over ranges, wrap, unwrap and move, empty inline and block elements, roots of inline elements, nested containers, multi-block transactions, random app writes of `matches` and `activeIndex`, and a subscriber that writes `matches` or searches inside a publish. Steps that commit nothing are skipped, and the floors count committed steps only: every edit kind ran, at least 40 local rescans, at least 10 local undo rescans and at least one fallback. After a step whose update threw, the oracle commits a selection change and compares. Add the work cases: typing in a paragraph of 100 or 1,000 blocks searches only that paragraph, and bolding paragraph 500 of 1,000 searches it once. An undo and a redo at 1,000 blocks each search one paragraph. Typing in a text beside a block, a paragraph beside text and a paragraph in a nested container each search only that text or paragraph. Typing in a paragraph beside an inline element that holds 10 or 1,000 inline elements makes the same number of inline checks, and at least one, so a counter that sees no check cannot pass. Painting a list the app writes out of document order at 1,000 blocks makes fewer than 20 times the path comparisons, `PathApi.compare` and `PathApi.equals` calls, that it makes at 100. Give row 58 of `docs/development/enforcement.md` its Find entry back. Proof: the specs pass. Through `proof.mjs`, each of these planted bugs fails the oracle, a step 3 case, a work case or the mounted spec: a scope taken at a node that is one text run in one tree only, a walk that never descends below a container, a run test that walks into inline elements before it finds a block, `search` installed after `store.set`, a splice while the store holds another array, a record that ignores the schema, a check that runs only on document commits, a failed search used as a splice base, a scope search whose error escapes, held keys that are never sent, sent without being cleared, sent on a timer or held again at each commit, no full refresh when the store's list changes to or from another writer's, a check that misses the app restoring Find's own list, a restore whose full refresh waits for the next commit, a full refresh only when Find publishes over another writer's list, a move through another writer's list that refreshes by key, a binary search of another writer's list in its own order, a scan of every match of another writer's list for each text node, a copy of that list sorted again at every read, a linear walk to a text's first match, an app's reordered list kept as Find's own, a scope search that resets the active result instead of following it, and a full refresh that an update drops or that is never sent. A planted store subscriber that compares the record with the active root fails no case while round 1's Sol 2 defect is open, as the Diff round 2 table says. Every search-count work case fails on Phase 1's bytes through `proof-worktree.mjs --with --expect-fail`. The inline-check case fails there only on its at-least-one check, because Phase 1's whole search makes no check through the schema Find's view passes. So the round 2 tree and the planted run test are its controls. The app-list paint case fails on Phase 1, which paints nothing of a reversed list, and the planted scan of every match, the copy sorted again at every read and the linear walk are the controls for its comparison count.
- [x] **5. Docs.** Run `plate-docs` on `content/docs/(plugins)/(functionality)/find.mdx` and its Chinese twin. Say that an edit re-searches only the part it changed. Change "Searches through adjacent text leaves and inline descendants" to say a match can run across text leaves and inline elements within one block, and that text placed directly beside a block is searched on its own. Change "A commit that leaves the main document unchanged, such as a selection change or an edit in a named root, runs no search" to say such a commit searches only when the results went stale: after a schema change, an app's write to `matches`, or a search inside an update that threw. This also closes Phase 1's step 6. Proof: the docs checks, the registry build, and the rendered page read back in the browser.
- [x] **6. Measure the final bytes.** In `apps/www/scripts/run-editor-perf.mts`, add a `dense-10k` trusted `create-destroy` cohort and a `textRunsScanned: 1` line for each cohort the work line names, and show that `--find-assert-lines` fails on Phase 1's bytes with those lines. Run the Find lane's counts with `--find-assert-lines`, then both frozen paired-timing configs, against Phase 1 and against the base, with every source pointing at the final bytes. Then hand-drive the Find demo with `node tooling/scripts/hand-drive.mjs scope` and `check`. Proof: the runner's known-bad run, and the counts, timing and hand-drive logs, checked with `pstack:benchmark-checklist`, and a `proof` row for each run. A conclusive miss against Phase 1 sends the design back to `architect`; an inconclusive line stays a `gate`.
- [x] **7. Review and land.** Run `deslop`, `no-comments` and `unslop`, then a panel on the diff, because it changes Plite core (reviews: push). Land through `node .agents/pstack/land.mjs --check 'pnpm check --affected'`. Proof: the writing rows, the panel rows and the land log.
- [ ] **8. Fold and close.** Run `/pstack:correct` on row 58's class, per-keystroke work that grows with the document, which this run repeated in round 1's warnings 2 and 4 and round 3's walk finding. Fold the delta into `docs/plans/topics/search.md`, write the Close and flip `Status:`. Close Phase 1's steps 5, 6 and 10 in its plan, citing step 6's timing as its acceptance. Proof: `node .agents/pstack/plan-page.mjs docs/plans/2026-10-22-search-run-rescan.md --folded` renders.

## Proof

Frozen lines, reused from `2026-10-22-search-block-rescan` and written before any timing of its prototype ran. Each timing line is a ratio of the candidate's median CDP `TaskDuration` per keystroke pair to its base's, within one paired run of six packets of four arms, base, candidate, same-code and planted, through `.agents/rules/benchmark/scripts/paired-timing.mjs`. A line is inconclusive while a planted arm exceeds the budget by no more than the same-code noise, or while that noise reaches the candidate's distance to the budget. Step 6 ran each arm at 30 samples instead of 40, so one config fits the hour.

| Line | Base | Cohorts | Rule | Planted slowdown |
| --- | --- | --- | --- | --- |
| Work, one block changed | Phase 1 | `dense-1k` and `dense-10k` trusted `shift` and `create-destroy`; `dense-1k` and `dense-10k` `no-change` | One text run scanned per step; store writes, refreshed keys and leaf renders equal Phase 1's | none |
| Work, structural | Phase 1 | `split-above`, `query-change` | Whole search, equal to Phase 1's counts | none |
| Correctness | both | every cohort | The lane's painted-range check against a fresh search after every sample | none |
| Faster than Phase 1 | Phase 1 | `dense-1k` trusted `shift`; `sparse-10k` programmatic `no-change` | Median at most 0.93 of Phase 1's | 14 ms and 20 ms |
| Faster than Phase 1, large | Phase 1 | `dense-10k` trusted `no-change` | Median at most 0.8 of Phase 1's | 60 ms |
| Phase 1's acceptance lines | `origin/next` | `dense-1k` trusted `no-change` and `shift`; `dense-10k` programmatic `no-change` | Median at most 0.5 of the base's | 37, 42 and 260 ms |

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Performance pack selected | yes | Find's per-keystroke work with an active query is repeated hot work |
| User-facing operation and runtime owner identified | yes | Typing while a Find query is active; `BaseFindPlugin`'s `on.commit` |
| Scale variables and cohorts fixed | yes | Blocks (1,000 and 10,000), matches (1 and all), edit kind (no match change, shift, create and destroy, block inserted above, query change), input (programmatic and trusted keyboard), and `idle-1k` and `idle-10k` with no query |
| Budget frozen before target measurement | yes | `paired/vs-head.json` and `paired/vs-p1.json` in the run directory, sha256 `c089d271…` and `ec0a7a19…`, frozen by the previous plan before its first arm ran; no arm of this design has run |
| Baseline and target probe selected | yes | The editor-perf Find lane, served from source in three worktrees: `origin/next`, Phase 1, and Phase 1 plus this design's final bytes |
| Correctness guard selected | yes | Step 4's widened oracle, Phase 1's 52 package cases, and the lane's painted-range check |
| Phase 1 is the build's base | yes | Phase 1's patch is applied at `fb91632b47` on `89a3a795f4`, and its 52 Find cases pass there in a detached worktree |
| Each step's cheapest control ran at base | yes | Step 1: the whole-search hash over 400 generated documents is `5b244d5e…`, read from the base tree's `node.ts`. Step 3: Phase 1's 52 Find cases pass. Step 4: the earlier work case failed on Phase 1's whole search, 602 text nodes searched against 2. Steps 2, 5 and 6: Plite's core typecheck, the registry check and the paired timing configs passed on this tree before |
| The design's premises hold in existing code | yes | Typing, bolding and two inserts in one update change only one top-level node of 50, and an indent change keeps its children array; over 400 generated documents, the whole search's matches under each of 2,707 nodes it reads on its own equal `findTextRanges` at that path, and none crosses it; the store keeps an owned snapshot array as is; the probe fails 128 times with the container test removed |
| Production detector decision recorded | N/A | Find runs in the user's browser, and Plate ships no runtime detector |

Completion Gates:
| Gate | Applies | Required action | Evidence |
|-----------------|---------|-----------------|----------|
| Pre-acceptance scale proof | yes | Step 6 | One text run scanned per keystroke for typing, no-change and create-destroy at 1,000 and 10,000 blocks, where Phase 1 scans 1,000 or 10,000, in `counts-r2-a1.log`; the runner's count lines fail on Phase 1's bytes in `build-s6-runner-lines-p1-knownbad-a1.log` |
| Warm latency budget | yes | Step 6's timing lines | Two lines pass and four are inconclusive, with no conclusive miss. Against Phase 1, `dense-1k` trusted `shift` passes at 0.908 of its 0.93, in `vs-p1-final-s30-a1.log`. Against the base, `dense-1k` trusted `no-change` passes at 0.352 of its 0.5, in `vs-head-final-s30-a1.log`. `dense-10k` trusted `no-change` at 0.799 of 0.8, `sparse-10k` at 0.784 of 0.93 with 0.158 of noise, `dense-1k` trusted `shift` against the base at 0.441 of 0.5 with 0.064 of noise, and `dense-10k` programmatic `no-change` at 0.121 of 0.5, whose planted arm could not fail the line, stay gates |
| Large/stress scaling | yes | Step 6's 10,000-block cohorts | One text run scanned per keystroke at 10,000 blocks; a programmatic keystroke takes about 105 ms against the base's 860 ms, and a trusted one about 200 ms against Phase 1's 250 ms, where the rest is the editor's own cost; both 10,000-block timing lines stay gates, as the row above says |
| Cold and failure paths | yes | Step 4's fallback floor and step 3's throw fallback | 74 fallbacks against a floor of 1, and the throw case passes, in `build-s3-platejs-test-find-a3.log` |
| Payload and fan-out | yes | Step 6's counts | Store writes and refreshed keys equal Phase 1's: none for a keystroke that changes no match, one for `shift` and `create-destroy`, in `counts-r2-a1.log` |
| Production-path rerun | yes | Step 6 on the final bytes | The counts and both timing configs ran on the final plugin bytes, sha256 `0495708b…`, served from source |
| Correctness guard | yes | Step 4 | 70 cases pass with 285 commits compared, 194 local and 15 local undo rescans in `fix3-platejs-test-find-a1.log`; 38 mounted cases pass in `fix2-mounted-a1.log`; 27 of 28 planted bugs fail a spec by assertion, with no timeout, in the `fix2-mutant-*` and `fix3-mutant-*` logs, and `store-write-active-root` fails none, as the Diff round 2 table says |
| Before/after receipt | yes | Step 6's logs | `r2.json` and the two `-s30-a1.measurements.json` files in the run directory |
| Detector and privacy | N/A | No runtime detector | N/A |
| Performance regression check | yes | Step 4's work cases in `pnpm check` | All ten fail on Phase 1 in `fix3-work-cases-on-phase1-a1.log`, the inline-check case only on its at-least-one check, and the find partition runs them |
| Hand drive | yes | Step 6, after the last page edit | Covered on `/blocks/find-demo`, `/docs/find` and `/cn/docs/find` in `hand-drive-check-final-a1.log` |
| Playtest | N/A | `playtest.mjs scope` names no scenario catalog for these files | N/A |
| Slice review (`pstack:thermos`) | skip: the `push` panel on the diff in step 7 is owed from the first slice | none | skip |

## Defaults

| Decision | Pick | Alternative | Word | Impact |
| --- | --- | --- | --- | --- |
| Verdict | Pursue, and rescan only the part an edit changed, on top of Phase 1 (look) | Stop, and keep Phase 1's whole search | hold | big |
| How the rescan lands | Together with Phase 1, as one change, because only the pair passes Phase 1's typing-speed line for sure (look) | Ship Phase 1 alone at its budget first | land at budget | big |
| How Find spots the edited part | Compare the document before and after the edit, picked by a four-way design review (look) | Ask the edit which nodes it changed, as the reverted try did; keep an index of which paragraph holds each node | use edit list; index design | big |
| Apps that write their own match list, even while Find publishes an edit | Keep Phase 1's rule. The app's list paints as written from the write, in any order, and repaints every text node at each move through it, until Find's next publish, at the next commit while a query is open or at the next search, which searches everything and repaints. A write made while Find publishes still leaves that one commit unequal to a fresh search, and a match Find found then does not paint. Every plan round raised it, and it stays open because Phase 1 does the same (look) | Make the match list read-only for apps. That adds a read-only rule to Plate's plugin store, changes Find's docs and the tests that write the match list, and costs about one more build step and one more panel round | read-only matches | small |
| An active result picked inside an update, when a later commit types a new match right before it | Leave it open. The base, Phase 1 and this build all move the active result to the new match, the Find pages say so, and t_bcd9a432 owns the fix in Plite. Once that fix lands, the named-root probe in the Diff round 2 table should pass, which also proves round 1's root-read fix (look) | Make the anchor again from the committed document at the commit that ends the update, in Find. That adds anchor work to such commits, about one build step and one more diff round | fix draft anchors | small |
| Enter between top-level paragraphs | Searches everything, as Phase 1 does. Typing, deleting and formatting inside a paragraph stay local, and Enter, Backspace across paragraphs and pastes do not (look) | Compare the unchanged paragraphs at both ends, search only between them, and move the later matches | enter local | small |
| One edit in two places | Searches everything (safe) | Search each changed place on its own | multi-scope | detail |
| Bold, indent and other property edits | Rescan the smallest part that holds them (safe) | Search everything on any property change | properties full | detail |
| Phase 1's saved patch on next | Already applied on top of the latest next here, where its 52 tests pass (look) | Rebuild Phase 1's patch by hand | rebuild phase 1 | detail |
| The highlight engine | Keep it; its own verdict waits as a suggested task (safe) | Rework it now into mapped highlight sets | mapped sets | small |
| Slow typing in huge documents | A suggested task finds why each keystroke at 10,000 paragraphs costs about 100 ms with no search open (safe) | Fold that work into this plan | fold editor cost | small |
| The inline-check work case's control on Phase 1 | It fails on Phase 1 only on its at-least-one check, because Phase 1's whole search reads the schema through a getter the case cannot count. Its controls are the round 2 tree, 2,006 checks against 26, and the planted run test (look) | Count Phase 1's schema reads too, through a test-only hook in Plite | count phase 1 checks | detail |
| The pstack version this run uses | Keep going on the installed 0.9.101 skills, though the project pins 0.9.88, because a downgrade needs a new session (look) | Reinstall 0.9.88 and restart the run | pin pstack | detail |

## Evidence

Model: claude-opus-5-5 @xhigh

This plan retains 2026-10-21-search-find-maintenance, because its Phase 1 is the base this build starts from and lands with.
This plan supersedes 2026-10-22-search-block-rescan, because round 3's panel reverted that plan's rescan; it keeps that plan's Pursue, research and frozen lines, and rows 52 to 57 of its decision log record the revert and its reasons.

### Lanes

- **Keep Phase 1's whole search.** The control. Phase 1's [BaseFindPlugin.ts](../../packages/platejs/src/features/find/lib/BaseFindPlugin.ts) searches the whole main document on each commit and compares every text node's matches, which the 2026-10-22 profiles put at 4.07 to 6.27 ms of Find work per trusted keystroke pair. It stays as the fallback inside the picked design.
- **Ask the commit what changed, then find each change's run.** The reverted rescan. Round 3's panel found a critical against each of its two mechanisms after each had used its one replacement.
- **Keep an index of which run holds each node.** Sol's and Astra's candidates. Each answers the lookup at once but rebuilds the index on every whole search, so the first search and every fallback cost more than Phase 1.
- **Compare the searched tree with the current tree.** The lead's candidate, picked. It reads [node.ts](../../packages/plitejs/src/interfaces/node.ts)'s run rule through one shared test and needs no commit metadata. Its predicted benefit, which the Close marks held or falsified, is that Find's search work on a keystroke inside one paragraph stops growing with the document, apart from one pointer comparison and at most one inline check per child at each level of the walked path. A keystroke that changes a match still copies the match list and walks the new list, which t_95b5151d owns.

### Requirements

- Literal, case-insensitive search over the main document, text across inline nodes included (2026-10-04 head; `find.mdx`).
- After every commit, matches, count, active result and paint equal a fresh search (2026-10-21 oracle). A list another writer stores shows and paints as written until Find's next publish. So a commit during whose publish a store subscriber writes `matches` ends unequal to a fresh search. That limit is open, its owner is zbeyens, and the Defaults word read-only matches fixes it.
- A new match paints in the commit that made it, with no debounce or hidden latency (`VISION.md` Common Essentials; the 2026-10-21 Decisions). The same subscriber write is the one exception.
- Find shows a total count and steps through every match, rendered or not (`find.mdx`).
- Performance earns no public hook, option or toggle (`docs/vision/common.md`, Taste).
- One owner of the run rule, as the 2026-10-22 `correct` row on that plan's log requires.
- Scale-sensitive work needs a pre-acceptance benchmark receipt (`.agents/playbooks/references/architecture.md`, Decision ledger).
- The owner's words: "if i modify a single block it should compute only for that block".

### Round 3's failures and how this design closes each

| Failure | How it closes |
| --- | --- |
| 1. A text beside blocks was grouped with them | The scope is the node the whole search reads on its own, never a guess about runs |
| 2. A property change regrouped runs | An inline element that becomes a block breaks runs in one tree only, so the scope stops above it; a property change that keeps the node's run status keeps its children list, so the walk stops at that node |
| 3. The app's own `matches` write | The splice runs only while the store holds the exact array Find published, and while the store shows an array another writer stored, or returns from one, each change of `matches` or the active index refreshes every text node |
| 4. A node that left every run | The walk never asks where a run is; it compares trees, so that node is still inside the scope |
| 5. A subscriber's write became the baseline | The record is installed before the store publishes and is never read back |
| 6. Run lookup repeated per changed key | Nothing is classified per key; the walk reads each level once along one path |
| 7. The oracle never generated these shapes | Step 4 widens it and asserts coverage floors |
| 8. A match across text beside a block | Kept; the docs narrow the claim |
| 9. Publishing copies the whole list | Kept; t_95b5151d |

### Dependents

- `distribution`, `editing` and `ui` are unaffected for the reasons the previous plan gives; this plan touches none of the files they import.
- `performance` is unaffected. Its editor-perf page mounts the Find lane's `find-surface.tsx`, whose actions and counters this plan reads and does not change.
- Lint calls `findTextRanges` through a text-range view. Step 1's base-versus-after run covers the shared test it calls.

## Open work

- Build this plan's steps 1 to 8. owner: zbeyens. stop: the change lands through `land.mjs`, or the owner says hold or land at budget. Tracked in this plan's steps.
- Keep a store subscriber's write to `matches` during Find's publish from leaving results unequal to a fresh search. owner: zbeyens. stop: the owner says read-only matches, or drops the limit. Tracked in this plan's Defaults. Once the fix lands, restore the Brief's risk line, the Outcome, and the fresh-search and paint Requirements, which this limit narrows.
- Decide whether the decoration runtime stays the fastest owner of editor highlights, for every source and not just Find. owner: zbeyens. stop: suggested task t_c5055d2a lands its verdict or is dropped. Tracked in the suggested-task ledger.
- Find why a keystroke at 10,000 blocks costs about 100 ms with no search open. owner: zbeyens. stop: suggested task t_c5a89c2a lands or is dropped. Tracked in the suggested-task ledger.
- Keep an active result picked inside `editor.update` on its match when a later commit types a new match right before it. owner: zbeyens. stop: suggested task t_bcd9a432 lands or is dropped. Tracked in the suggested-task ledger. Once the fix lands, cut the limit sentence from both Find pages.
- Stop copying the whole match list when one match changes. owner: zbeyens. stop: suggested task t_95b5151d lands or is dropped. Tracked in the suggested-task ledger.
- Move Lint's run test onto Plite's rule. owner: zbeyens. stop: suggested task t_253fd716 lands or is dropped. Tracked in the suggested-task ledger.
