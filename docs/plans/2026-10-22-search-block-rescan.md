---
review_scopes: [search]
verdict: pursue
review_basis: [2026-10-21-search-find-maintenance]
work_kind: implementation
review_commit: ab9f63eba9e849bd57477db7a105e1eefcdbbc76
review_inputs: [packages/platejs/src/features/find/lib/BaseFindPlugin.ts, packages/platejs/src/features/find/lib/BaseFindPlugin.spec.ts, packages/plitejs/src/react/decoration-source.ts, packages/plitejs/src/interfaces/node.ts, packages/plitejs/src/core/commit.ts, packages/plitejs/src/dom/utils/selection-writes.ts, apps/www/src/app/dev/editor-perf/find-surface.tsx, apps/www/scripts/run-editor-perf.mts, packages/platejs/src/utils/plate-keys.ts, 'apps/www/src/app/(app)/examples/plite/[example]/page.tsx', docs/plans/2026-10-21-search-find-maintenance.md, docs/plite/research/2026-10-22-find-incremental-decorations/README.md, VISION.md, docs/vision/common.md]
review_upstreams: ['../vscode@df2411cf7d8f2e0cfc79109a3bc8eaab2c69165b', '../monaco-editor@7374dcb41a787a63d5885a5be5e6bbc2e6bc338c', '../codemirror-search@4db1811530f9e77239e5de8bd7bb155ffc0377e0', '../codemirror-view@fbff59ba004d80d8c914f64c42586387b08706ac', '../codemirror-state@9c801279cb83011e6f92af778f4443406e8f1200', '../prosemirror-search@ff1148a339bb7daa9d7b02dff9614b9d7123f552', '../prosemirror-view@ca4c78e9b56f1b164c0b3758b59d8748f11b7534', '../lexical@dd5c41b13193efa9ab1574234d8593d2c9e4f988', '../ckeditor5@14e73cc31b869ce483bd8449f40b9102ac7746da']
---

# Find: rescan only the paragraphs an edit changed

Status: planning: builds on Phase 1's code, so it waits on your call on Phase 1's task t_ab664f2a
Topic: search
Playbook: plan

**Pursue.** Rescan only the text blocks a commit changed, on top of Phase 1. Plate's search runs one text block at a time, and no match crosses a block (`packages/plitejs/src/interfaces/node.ts` lines 822 to 904), so rescanning the changed blocks returns what a whole search returns. A prototype on Phase 1's code scans one text run per typed character, where Phase 1 scans all 1,000 or 10,000. In sampled CPU profiles of 30 trusted keystroke pairs, Find's own commit work per pair fell from 6.27 to 0.13 ms on `sparse-10k`, from 4.07 to 0.09 ms on `dense-1k` `no-change` and from 5.35 to 0.98 ms on `dense-1k` `shift`. Timed against `origin/next`, Phase 1 plus the rescan passes all three of Phase 1's acceptance lines conclusively, at 0.398, 0.426 and 0.114 of the base against a 0.5 budget. Phase 1 alone sat at 0.48 to 0.52 on the `dense-1k` trusted `shift` line. Against Phase 1 itself, the rescan passes all three of this plan's frozen lines conclusively, at 0.881 on `dense-1k` trusted `shift`, 0.642 on `dense-10k` trusted `no-change` and 0.777 on `sparse-10k` programmatic `no-change`, against budgets of 0.93, 0.8 and 0.93. This challenges the 2026-10-21 reopen condition. Read literally, that condition is not met, because the scan is 5.7 percent of a rendered `sparse-10k` keystroke pair; the editor itself spends about 108 ms per pair at 10,000 blocks with no query at all. But the condition measured only the scan. Phase 1 also compares every text node's matches on each commit, which costs three times the scan on `dense-1k`, and the rescan removes both. The decoration runtime stays. On Phase 1's code it re-reads only changed nodes and costs 0.03 to 0.26 ms per pair, so the mapped highlight sets that ProseMirror, CodeMirror and VS Code keep would save nothing measurable. CKEditor 5 is the one editor read that also rescans only changed nodes. The Plan playbook owns this file next, and the build waits on Phase 1.

## Brief

### What will change?

With a search open, typing in a paragraph re-searches just that paragraph instead of the whole document. Added to Phase 1, it passes the typing-speed test that Phase 1 could not settle on its own.

### What could go wrong?

If an edit shifts matches beyond its own paragraph, highlights could go stale, so adding, moving or changing a paragraph's properties still re-searches everything. Typing in huge documents stays slow, but that cost is not Find's.

## Teach

Find highlights every match of a search and steps through them. Each paragraph is searched on its own, and a match never runs from one paragraph into the next.

Today, and with Phase 1, each edit made while a search is open searches the whole document again. Phase 1 then compares the new matches with the old ones paragraph by paragraph, so it redraws only what changed, but the search and the comparison still touch every paragraph.

After this change, Find asks the edit which paragraphs it changed, searches only those, and swaps their matches into the list. Because no match crosses a paragraph, the list is the same as a full search would give. Adding, removing or moving a paragraph, or changing its properties, still searches everything, since later matches move too.

## Public API

No public call changes. Inside Find, the code that runs after each edit searches the whole document on `next`. The planned version, taken from the prototype built on Phase 1, re-searches only the paragraphs that changed.

```ts before
// packages/platejs/src/features/find/lib/BaseFindPlugin.ts
commit: ({ commit }) => {
  const query = store.get('query');
  if (query && commit.changed.hasAny('document')) search(query, true);
},
```

```ts after
// packages/platejs/src/features/find/lib/BaseFindPlugin.ts
commit: ({ commit }) => {
  if (!searchedQuery || !commit.changed.has('document')) return;
  const blocks = store.get('error') ? null : changedTextBlocks(commit);
  if (blocks) patch(blocks);
  else publish(searchedQuery, true);
},
```

## What other editors do

This review read VS Code, Monaco, CodeMirror 6 and ProseMirror's view source at the commits in the front matter, and reused the 2026-10-21 reads of `prosemirror-search`, Lexical and CKEditor 5. Google Docs, Word and Word for the web are closed, so their rows rest on public material only and say so. A research seat extracted every row, and the lead checked the rescan and repaint cells against the cited lines; the active-match cells for VS Code and CodeMirror are the seat's read alone. Only CKEditor 5 rescans just the nodes an edit changed. VS Code rescans the whole scope after a 100 ms pause, and CodeMirror's built-in search covers only the visible lines. The research run is `docs/plite/research/2026-10-22-find-incremental-decorations/`.

| Delta | Editor | Where results live | Rescan on edit | Repaint on edit | Active match identity | Deleted or hidden text | Other roots |
| --- | --- | --- | --- | --- | --- | --- | --- |
| changed | Plate | Plugin store | Only the text blocks a commit changed; adding, removing or moving a block, a properties change, a changed block with an inline element, a whole replace or a commit after a search error searches the whole main document | Only text whose matches changed, from Phase 1 | A range anchor that follows its match, from Phase 1 | Searched | Not searched or painted |
| added | VS Code and Monaco | A match list, then decoration ids in the text model's interval trees | The whole search scope, 100 ms after the edit, capped at 19,999 matches (`findModel.ts:81`, `:105-110`); Monaco packages the same core, not checked here | The interval trees move decorations with the edit at once; only rendered lines whose input changed redraw | A decoration id; an edit clears its active styling | Not checked | Not checked |
| added | CodeMirror 6 (`@codemirror/search`) | A decoration set over the visible ranges | Only the visible ranges, on every doc, selection or viewport change (`search.ts:399-425`) | Rebuilt for the viewport, and only changed tiles redraw; `MatchDecorator` instead maps its set and rescans changed visible lines (`matchdecorator.ts:103-143`) | The editor selection | Not checked | Not checked |
| added | Google Docs (public material only) | Unknown | Unknown | Canvas rendering is documented; what it redraws is not | Unknown | Unknown | Unknown |
| added | Word desktop (public material only) | Unknown | Unknown | Background pagination is documented; local redraw is not | Unknown | Unknown | Unknown |
| added | Word for the web (public material only) | Unknown | Search as you type is documented; a rescan after an edit is not | Unknown | Unknown | Unknown | Unknown |

## Layer and owner

| Change | Layer (Plite or Plate) | Package | Why |
| --- | --- | --- | --- |
| Rescan only the text blocks a commit changed and splice their matches into the list | Plate | `platejs/find` (`BaseFindPlugin.ts`) | Find owns its results. Plite already gives it a per-block search, `findTextRanges` with `at`, and the commit's changed node keys and before and after indexes |

No Plite change, and no file moves between entrypoints.

## Native behavior and proof

| Behavior | What changes | Proof surface |
| --- | --- | --- |
| Typing inside a text block | Rescans that block alone | Package spec; the lane's trusted `shift` and `create-destroy` cohorts at 1,000 and 10,000 blocks count one text run scanned per step |
| Typing that splits or joins text nodes inside a block, such as at a mark boundary | Rescans that block alone | Package spec; the lane's trusted `shift`, where every other step splits the typed character into its own text node |
| Enter, a join of two blocks, a paste of several blocks | Searches the whole document, as Phase 1 | Package spec; the lane's `split-above`, which scans every block |
| Undo and redo | Follows the same rule as the edit it replays | Package spec |
| A remote commit | Follows the same rule | Package spec |
| IME composition | Unchanged code path | Unproven |

## Main changes

- On a main-document commit with a query active, Find rescans only the text blocks the commit changed when every changed block holds only text and keeps its path, and every node the commit added, removed or moved sits directly in one of those blocks. It splices each block's new matches into the sorted list and keeps every other match object. Any other document commit runs Phase 1's whole search: one that adds, removes or moves a block, changes properties, replaces the document, reorders roots, changes a block that holds an inline element, or follows a search error. A rescan that throws falls back to the whole search.
- Phase 1's map from match id to text node key goes, because a match id already names its text node.

## Outcome

With a query active, a keystroke inside a text block scans that block alone, whatever the document's size, and the matches, count, active result and paint equal a fresh search. Every other document commit keeps Phase 1's behavior. Every public call keeps its shape.

## Scope

- In: `packages/platejs/src/features/find/lib/BaseFindPlugin.ts` and its specs, and the editor-perf Find lane's scan count, which already reports text runs scanned.
- Out: whether and how Phase 1 lands, which t_ab664f2a owns; the decoration runtime; the editor's own keystroke cost at 10,000 blocks; Plite.

## Decisions

- **The rescan unit is the text block.** `findTextRanges` with `at` searches one block, and a match can span text nodes inside it, such as across a bold boundary. A rescan of changed text nodes alone would miss those matches.
- **A block added, removed or moved still searches everything.** It shifts every later match's path, so every later range must be rebuilt anyway, and Phase 1 already republishes them with no repaint. Skipping the scan there would save at most the scan, 6.2 ms per pair at 10,000 blocks, for a path-shifting splice no other edit needs.
- **The rescan builds on Phase 1.** It reuses Phase 1's per-text-node comparison, which keeps unchanged match objects, its ids keyed by text node and its active-result anchor. Without Phase 1, a block rescan would still republish and repaint every match on each edit, which the 2026-10-21 probe measured as most of a dense keystroke.
- **The decoration runtime stays.** It re-reads only the nodes each source marks dirty, shifts highlight slices through native text input, and cost 0.03 to 0.26 ms per pair in every profile of Phase 1 and the prototype. On `origin/next` it cost 18.1 ms per `dense-1k` `shift` pair, because Find there republishes every match and so marks every node dirty; Phase 1 already removes that. A mapped highlight set has nothing to save.
- **The frozen budgets come from the profiles.** Against Phase 1, the budget on each cohort is at most Phase 1's Find share of that cohort's keystroke, set before any timing ran. Against the base, the rescan on top of Phase 1 keeps Phase 1's own half-speed acceptance lines.

## Steps

### Phase 2: rescan only the blocks an edit changed

- [ ] **1. Start on Phase 1's code.** Start gate: Phase 1's commit is on `origin/next` and its Find specs pass there, or the owner's word on t_ab664f2a picks this design, and the build starts from `phase1.patch` applied to `origin/next` and lands with it. Proof: `git log origin/next` naming Phase 1's commit and `pnpm --filter platejs test -- src/features/find` green at that `HEAD`, or the owner's word quoted in the decision log and `git apply --check` of the patch at the build's base.
- [ ] **2. Port the prototype with specs.** Move `changedTextBlocks`, `staysInBlocks` and `patch` from the prototype into `BaseFindPlugin.ts` without their prototype comments, and drop the id-to-key map. In `BaseFindPlugin.spec.ts`, run Phase 1's seeded edit oracle under the rescan, and add cases for typing that splits a text node inside a block, one commit that edits two blocks, a block inserted above the matches, a block moved, a properties change, a block that holds an inline element, `value.replace`, an edit after a search error, a rescan that throws, and undo of a delete across blocks. Each case checks matches, count, active result and paint against a fresh search. Add one work-count case: a keystroke inside one block of 100 scans one text run. Proof: `pnpm --filter platejs test -- src/features/find` and `pnpm --filter platejs typecheck` green; the work-count case fails on Phase 1's bytes through `proof-worktree.mjs --with --expect-fail`; a mutant that treats every structure change as block-local fails the block-insert case after its setup passes.
- [ ] **3. Time the final bytes.** Run the lane's counts with `--find-assert-lines` on the final bytes, then both paired-timing configs this plan froze, against Phase 1 and against the base, with each config's sources pointing at the final bytes. Proof: the counts and timing logs, checked with `pstack:benchmark-checklist`, and a `proof` row for each run. A conclusive miss against Phase 1 sends the design back to `architect`; an inconclusive line stays a `gate`.
- [ ] **4. Review and land.** Run `deslop`, `no-comments` and `unslop`, then land through `node .agents/pstack/land.mjs --check 'pnpm check --affected'`. When it lands with Phase 1, Phase 1's own docs, `changeset` and `best-api repair` steps cover the shared files; the rescan changes no documented behavior. Proof: the writing rows and the land log.
- [ ] **5. Fold and close.** Fold the delta into `docs/plans/topics/search.md`, write the Close and flip `Status:`. Proof: `node .agents/pstack/plan-page.mjs docs/plans/2026-10-22-search-block-rescan.md --folded` renders.

## Proof

Frozen lines, written before any timing of the prototype ran. Each timing line is a ratio of the candidate's median CDP `TaskDuration` per keystroke pair to its base's, within one paired run of six packets of four arms, base, candidate, same-code and planted, through `.agents/rules/benchmark/scripts/paired-timing.mjs`. A line is inconclusive while a planted arm exceeds the budget by no more than the same-code noise, or while that noise reaches the candidate's distance to the budget.

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
| Budget frozen before target measurement | yes | `paired/vs-head.json` and `paired/vs-p1.json` in this plan's run directory, sha256 `c089d271…` and `ec0a7a19…`, written at 01:39:44 before the first arm started at 01:43:26 |
| Baseline and target probe selected | yes | The editor-perf Find lane at `ab9f63eba9`, served from source in three worktrees: `origin/next`, Phase 1, and Phase 1 plus the prototype |
| Correctness guard selected | yes | Phase 1's seeded oracle, its 52 package cases, and the lane's painted-range check |
| Production detector decision recorded | N/A | Find runs in the user's browser, and Plate ships no runtime detector |

Completion Gates:
| Gate | Applies | Required action | Evidence |
|-----------------|---------|-----------------|----------|
| Pre-acceptance scale proof | yes | Step 3 | held on the prototype: one text run scanned per typing step at 100, 1,000 and 10,000 blocks, where Phase 1 scans every block |
| Warm latency budget | yes | Step 3's timing lines | held on the prototype: against `origin/next`, 0.398, 0.426 and 0.114 against 0.5; against Phase 1, 0.881 on `dense-1k` `shift` and 0.777 on `sparse-10k` against 0.93; each conclusive; step 3 reruns them on the final bytes |
| Large/stress scaling | yes | Step 3's 10,000-block cohorts | held on the prototype: `dense-10k` programmatic `no-change` at 0.114 of `origin/next`, `dense-10k` trusted `no-change` at 0.642 of Phase 1 against 0.8, and one text run scanned per step at 10,000 blocks |
| Cold and failure paths | yes | Step 2's error and throw cases | open: the prototype falls back to the whole search on both, and no spec pins it yet |
| Payload and fan-out | yes | Step 3's counts | held on the prototype: store writes, refreshed keys and leaf renders equal Phase 1's in every cohort |
| Production-path rerun | yes | Step 3 on the final bytes | open |
| Correctness guard | yes | Step 2 | held on the prototype: Phase 1's 52 package cases pass, and the lane's painted-range check passes in every cohort |
| Before/after receipt | yes | Step 3's logs | partial: the prototype's profiles, counts and timing, which the decision log cites |
| Detector and privacy | N/A | No runtime detector | N/A |
| Performance regression check | yes | Step 2's work-count case in `pnpm check` | open |

## Defaults

| Decision | Pick | Alternative | Word | Impact |
| --- | --- | --- | --- | --- |
| Verdict | Pursue: rescan only the paragraphs an edit changed, on top of Phase 1 (look) | Stop, and keep Phase 1's whole search | hold | big |
| How the rescan lands | Ship it together with Phase 1 if your call on t_ab664f2a picks the version that passes its speed line; otherwise right after Phase 1 ships (look) | Ship Phase 1 alone at its budget first, whatever you pick, and this after it | after phase 1 | detail |
| When the rescan gets built | After your call on Phase 1's task, because the rescan builds on its code (look) | Build it now as a second saved change on top of Phase 1's | build on patch | detail |
| Edits that still search everything | Adding, removing or moving a paragraph, a property change, a paragraph with a link or other inline element, a whole replace, and the first edit after a search error (safe) | Also shift later matches without a search when a paragraph is added or removed | shift paths | detail |
| The old reopen rule | Reopen it. The scan alone is under 6 percent of a keystroke in a large document, but Phase 1's whole-document comparison costs more than the scan, and this removes both (look) | Keep it deferred, as the rule reads literally | keep deferred | small |
| The highlight engine | Keep it; its own verdict waits as a suggested task (safe) | Rework it now into mapped highlight sets, as ProseMirror and CodeMirror keep | mapped sets | small |
| Slow typing in huge documents | A suggested task finds why each keystroke at 10,000 paragraphs costs about 100 ms with no search open (safe) | Fold that work into this plan | fold editor cost | small |

## Evidence

Model: claude-opus-5-5 @xhigh

This review reaffirms the 2026-10-21 Pursue (`2026-10-21-search-find-maintenance`) and its Phase 1 design, and reopens that plan's deferred changed-block rescan, whose Decision ledger row it replaces. It retains the 2026-10-04 audit's ownership split as that Pursue did, and the accepted 2026-09-09 view-ownership, controller-cut and range-scrolling plans. The 2026-09-08 iteration's block-scan prototype was rejected on `sparse-10k`, whose time this review finds is the editor's own, so that rejection holds for `sparse-10k` and says nothing about the dense cohorts this plan targets. External checkouts read: VS Code `df2411cf`, Monaco `7374dcb4`, CodeMirror `search@4db18115`, `view@fbff59ba` and `state@9c801279`, `prosemirror-search@ff1148a3`, `prosemirror-view@ca4c78e9`, Lexical `dd5c41b1` and CKEditor 5 `14e73cc3`.

### Requirements

- Literal, case-insensitive search over the main document, text across inline nodes included (2026-10-04 head; `find.mdx`).
- After every commit, matches, count, active result and paint equal a fresh search (2026-10-21 oracle).
- A new match paints in the commit that made it, with no debounce or hidden latency (`VISION.md` Common Essentials; the 2026-10-21 Decisions).
- Find shows a total count and steps through every match, rendered or not (`find.mdx`).
- Performance earns no public hook, option or toggle (`docs/vision/common.md`, Taste).
- Scale-sensitive work needs a pre-acceptance benchmark receipt (`.agents/playbooks/references/architecture.md`, Decision ledger).
- The owner's words: "if i modify a single block it should compute only for that block".

### Lanes

- **Keep Phase 1's whole search.** It loses. Today's [BaseFindPlugin.ts](../../packages/platejs/src/features/find/lib/BaseFindPlugin.ts) reruns the whole search on each commit, and Phase 1 keeps that search. On each commit it scans every text run and compares every text node's matches. Profiles of Phase 1 put Find's commit work at 6.27 ms per trusted pair on `sparse-10k` (6.19 of it the scan), 4.07 on `dense-1k` `no-change` (1.0 the scan) and 5.3 on `dense-1k` `shift`, out of 44.5 ms of busy time per shift pair. Its `dense-1k` trusted `shift` timing sits on its 0.5 budget.
- **Delete Find's search and let decorate find matches per rendered node,** as Slate's example does. This is the strongest deletion, and it loses. Find needs a total count and navigation over every match, unrendered ones included, which a per-node decorate cannot give.
- **Merge Find's paint into one mapped highlight set,** as ProseMirror, CodeMirror and VS Code keep. This is the strongest merger, and it loses. The decoration runtime already re-reads only dirty nodes and cost 0.03 to 0.26 ms per pair in every profile ([decoration-source.ts](../../packages/plitejs/src/react/decoration-source.ts) lines 890 to 1117 and 1704 to 1767). Its 18.1 ms on `origin/next`'s `dense-1k` `shift` pair is Find marking every node dirty, which Phase 1 removes. A mapped set would save nothing measurable and would add a second mapping beside Plite's.
- **Search only the viewport,** as CodeMirror 6's built-in search does. It loses on the count and on navigation, as above.
- **Rescan after a short pause,** as VS Code does. It loses, because the count and the ranges go stale between the edit and the rescan, against the no-hidden-latency law, and the block rescan already costs about 0.1 ms per pair.
- **Rescan only changed text nodes.** It loses, because a match can span text nodes inside a block, so the unit must be the block.
- **Rescan only the changed text blocks, on top of Phase 1,** CKEditor 5's shape. This wins. Its predicted benefit, which the Close marks held or falsified, is that Find's work per keystroke stops growing with the document, at about 0.1 ms per pair at 1,000 and 10,000 blocks. Phase 1 plus the rescan keeps all three of Phase 1's acceptance lines against `origin/next`, as the prototype did at 0.398, 0.426 and 0.114, and beats Phase 1 on this plan's three lines, as the prototype did at 0.881, 0.642 and 0.777.

The proof has limits. The arms ran Next dev servers from source, with React in development mode, on an 18-core host whose one-minute load ran from 7.22 to 33.45 during timing. Profiles sample 30 pairs each. The closed editors rest on public material only, Monaco was not checked apart from VS Code, IME composition was not tested, and multi-view paint was not run again; it rests on Phase 1's mounted specs.

### Dependents

- `distribution` is unaffected. Its files, such as `markdownParagraph.ts`, import `PLUGINS` from `packages/platejs/src/utils/plate-keys.ts`, which this plan does not touch.
- `editing` is unaffected for the same reason, through `ExitBreakPlugin.ts` and `SingleBlockPlugin.ts`.
- `performance` is unaffected. Its editor-perf page, `apps/www/src/app/dev/editor-perf/page.tsx`, mounts the Find lane's `find-surface.tsx`, whose actions and counters this plan reads and does not change. This review added that page to the performance scope's members, because adding `find-surface.tsx` to search's members left the page with no owner.
- `ui` is unaffected. It imports the Plite example registry through `apps/www/src/app/(app)/examples/plite/[example]/page.tsx`, which this plan does not touch.

## Close

Reversals first. The 2026-10-21 plan kept this rescan deferred until a profile showed the scan as a large share of a rendered `sparse-10k` keystroke. The profile shows 5.7 percent, so that condition, read as written, is not met. This review reopens the rescan anyway, because Phase 1's whole-document compare costs more than the scan, and the rescan removes both. The prototype's first version searched everything whenever a commit split or joined text nodes, so trusted `shift`, which splits a text node every other step, still scanned every block. It now keeps such a commit local when every change stays inside its own block. The specs, counts, `shift` profile and timing ran on the fixed bytes; the `no-change` and `sparse-10k` profiles of the prototype ran just before that fix, which changes only commits that add, remove or move nodes.

What landed is this verdict page and its decision log, the research run `docs/plite/research/2026-10-22-find-incremental-decorations/`, and two scope fixes: `find-surface.tsx` joins the search scope and the editor-perf page joins the performance scope, so neither is unowned. No product code landed. The prototype lives only in the run directory, and Phase 1's saved patch is untouched. Steps done: 0 of 5, because step 1 waits on t_ab664f2a. The owner's three questions are answered: the block rescan in the lead paragraph and Lanes, the highlight engine in Decisions and Lanes, and the other editors in What other editors do.

Proof, each from its decision-log row. Phase 1's 52 package cases pass on the prototype. The Find lane's counts show one text run scanned per step in every typing cohort at 100, 1,000 and 10,000 blocks, with every other count equal to Phase 1's and no painted-range mismatch. Sampled profiles of 30 trusted pairs put Find's commit work at 0.09 to 0.98 ms per pair on the prototype, against 4.07 to 6.27 on Phase 1. Paired timing against `origin/next` passes all three of Phase 1's acceptance lines conclusively. Paired timing against Phase 1 passes all three of this plan's lines conclusively, at 0.881, 0.642 and 0.777. The `dense-1k` `shift` saving, 4.3 ms per pair, matches the 4.4 ms of Find work the profiles remove. The `sparse-10k` saving, 13.7 ms per pair, is about twice the 6.5 ms the profiles remove, because two packets ran Phase 1 while the host's one-minute load was near 30. Its three quietest packets give 0.84 to 0.88, still under the 0.93 budget, by about the same-code noise.

Limits. Every arm ran a Next dev server from source with React in development mode, so the ratios hold for development builds; production was not timed. The prototype is not the shipped code, and step 3 reruns every line on the final bytes. IME composition and multi-view paint were not run. The closed editors rest on public material only.

## Open work

- Build the rescan, this plan's steps 1 to 5. It builds on Phase 1's code, so it starts once Phase 1's commit is on `origin/next`, or once the owner's call on t_ab664f2a picks this design and the two land as one change. owner: zbeyens. stop: Phase 1 lands, or the owner picks this design on t_ab664f2a. Tracked in this plan's step 1 and in the suggested-task ledger as t_ab664f2a.
- Decide whether the decoration runtime stays the fastest owner of editor highlights, for every source and not just Find. owner: zbeyens. stop: suggested task t_c5055d2a lands its verdict or is dropped. Tracked in the suggested-task ledger.
- Find why a keystroke at 10,000 blocks costs about 100 ms with no search open; the profiles point at the two DOM selection writes and React's tree walks. owner: zbeyens. stop: suggested task t_c5a89c2a lands or is dropped. Tracked in the suggested-task ledger.
