---
review_scopes: [authored, schema, collaboration]
review_basis: [2026-10-12-suggestions-complete]
work_kind: implementation
review_commit: 53fa46d0f17f6ff726bfcaf88391acc248282b98
review_inputs: [packages/plitejs/src/authored/ledger/ledger.ts, packages/plitejs/src/authored/ledger/projection.ts, packages/plitejs/src/authored/ledger/runs.ts, packages/plitejs/src/authored/ledger/level.ts, packages/plitejs/src/core/public-state.ts, packages/plitejs/test/authored-tree-spares.test.ts, packages/plitejs/test/authored-tree-work.test.ts]
---

# Resolve only what a spare record change can reach

Status: executed
Playbook: plan

This iteration changes two things that phase B of [Suggest, preview and decide in an editor that makes block ids](2026-10-23-construction-values.md) built: how the review view reacts when a root's spare records change, and when core builds its index of unique values. That plan's step 8 timed the Suggesting line on phase B's final bytes, 53fa46d0f1, narrowed to its eight at-risk cohorts, and four of them missed their frozen budget conclusively. A suggested Enter took 5.60 and 30.96 times base at 1,000 and 10,000 paragraphs, against budgets of 1.83 and 3.91. A suggested list item deletion took 8.45 against 1.60, and a suggested deletion of the first top-level block 7.82 against 1.50. As the Autopilot rule says, the miss went to `architect`. Runners on Opus, Astra and Sol each designed a fix, and an Opus judge picked the Opus design with test grafts from the other two. Every behavior phase B proved stays as it is.

## Brief

### What will change?

Suggesting an Enter or a block deletion in a long document is fast again. Saving a spare block redoes only the view pieces that could use it, and the id index is built when the document opens.

### What could go wrong?

If the view misses a piece that can use a spare, that block stays stale until a nearby change. Tests compare the view with a fresh load after each change. Opening a document walks its blocks once more.

## Teach

A suggested deletion can keep a spare copy of a block, so a later decision can refill a container it would empty. The review view resolves each root in cached pieces called runs. Today any change to a root's spare records drops that cache and resolves the whole root again, in each of three modes.

Only two runs can take a root's spare: the first, when the root has slots that must come first, and the last, when the root would otherwise hold too few blocks. Step 8's documents have neither, so now nothing resolves again there.

Core's index of unique ids is now built when a document loads. Each commit updates it only for the blocks it added, removed or changed. An Enter shifts every later block, but the index is keyed by node, not position, so those shifts cost nothing.

## What other editors do

A Codex explorer read these from local checkouts on 2026-10-25 for the [Settle readiness](2026-10-25-settle-readiness.md) plan, and the lead read Slate's normalizer at `945a484df`. None was run for this plan. Each scopes its per-change work to what the change touched.

| Editor | What runs after a change | What it reads |
| --- | --- | --- |
| Slate `945a484df` | Normalization | Only the paths each operation dirties (`normalize.ts:12`, `DIRTY_PATHS`) |
| BlockNote `1e26f1c` | UniqueID repair of missing and duplicate ids | The changed ranges of each transaction (`UniqueID.ts:149`) |
| Tiptap `91c51be53` | UniqueID | Skips sync transactions after the first sync (`unique-id.ts:208`) |
| Plite after phase B | The review view after a spare record change | The whole root, in each of three modes |
| Plite after phase B | The unique index on the first unique write, then each commit | Every element at the first write, then every node a commit changed or moved |
| Plite after this plan | The review view after a spare record change | The root's first and last runs, only when they can take a spare |
| Plite after this plan | The unique index | Every element once at load, then every node a commit added, removed or changed |

## Decision ledger

| Surface | Current | Target | Owner | Reason | Adoption | Proof | Risk | Verdict |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| What a spare record change resolves | `ModeProjection.sync` passes `respared.has(root)`, and `RootProjection.sync` clears the run cache and builds the whole root (`projection.ts:165-177`) | Each respared root's spare readers, its rank 0 run when its part is the head and its last run when it fills a share of the minimum, join the root's touched ranks; beside the edit's own windows, nothing else resolves | `readsRootSpares` in `ledger/runs.ts`, `unpendedSpareReaders` on `RootProjection`, the merge in `ModeProjection.sync` | Only a root-level resolve reads `facts.reserves(root)` (`resolve.ts:874`), and the root level completes only for a head part or a part with a minimum share (`representation.ts` `partOf`, `level.ts` `endingMin`) | Internal | Steps 1 and 2 | Medium: a missed reader shows a stale spare | rearchitect |
| Run cache validity | A cached run is reused when its verdicts version, part and nodes match (`runs.ts:619-629`) | A run whose part reads root spares is also reused only when its `spares` version is the current one | `Run.spares` and `RunContext.spares` in `ledger/runs.ts` | Without it, an undo brings back a reader resolved against older records (the judge's case against the control) | Internal | Step 1's undo case | Low | rearchitect |
| A frame's write in a respared root | Never adopted, since the root rebuilds | Never adopted, since the frame wrote before the commit's record writes | `writtenRoot` in `ModeProjection.sync` | A reader's records moved under it, so a frame's slice cannot stand for it | Internal | Step 1's case "a command that stores a spare itself" | Low: the root's windows also skip the frame check, as at 53fa46d0f1 (Open work) | keep |
| When the unique index is built | Lazily on the first unique write, inside that write (`uniqueIndexOf`, `public-state.ts:1751`) | At each load publish, beside `seedNodeKeys`; never again unless the schema changes | `seedUniqueIndex` in `core/public-state.ts` | The Enter's timed span indexed every element, 1,000 and 10,000 nodes (row 183) | Internal; the Spare collaboration plan's "built on first use" changes | Steps 1 and 3 | Medium: load walks every element once more | rearchitect |
| What each commit advances | Every `node`, `path` and `presence` key, keyed by node key alone (`public-state.ts:1708-1716`) | `node` and `presence` keys only, as (root, key) pairs, removals before additions | `advanceUniqueIndexOnCommit` | A holder is keyed by node key and root, so a path shift changes no entry; a key reported in two roots keeps only the last root today | Internal | Steps 1 and 3 | Low | rearchitect |

## Layer and owner

| Delta | Change | Layer (Plite or Plate) | Package | Why |
| --- | --- | --- | --- | --- |
| added | `readsRootSpares`, `Run.spares`, `RunContext.spares` | Plite | `plitejs/authored` (`ledger/runs.ts`) | The run owns what it resolved against, as its `verdicts` already does |
| added | `unpendedSpareReaders` | Plite | `plitejs/authored` (`ledger/projection.ts`, `level.ts` exports `isLevelRun`) | The projection owns the slot tree whose ends are the readers |
| added | `ModeProjection.sync` merges readers into touched ranks; `RootProjection.sync` loses `respared` | Plite | `plitejs/authored` (`ledger/ledger.ts`, `ledger/projection.ts`) | The ledger already diffs the spare record set once per commit |
| added | `seedUniqueIndex` at load | Plite | `plitejs` core (`core/public-state.ts`) | Core owns the index and the load publish |
| added | The advance reads `node` and `presence` keys per root | Plite | `plitejs` core (`core/public-state.ts`, `core/unique-values.ts`) | The index is keyed by node, not path |

## Main changes

- **Spare readers.** One predicate, `readsRootSpares(part, context)`, holds for a root-level run whose part is the head or fills a share of the root's minimum. `unpendedSpareReaders` reads the two ends of the root's slot tree and keeps each end that is a run, not a level run, whose part passes the predicate, mapped through the root's changed children so a reader the commit's own ranges reach pends anyway. A respared root's readers join its touched ranks, and the projection resolves them like any touched window. With no readers, nothing resolves and no cache entry is dropped.
- **Spare-stamped cache.** `RunContext.spares` carries the spare record set's version, which the ledger already reads. A new run records it as `Run.spares`. `resolveRun` reuses a cached reader only when its `spares` is the current version, so a reader brought back by an undo or a re-cut window resolves against the current records. A run that is not a reader keeps today's check.
- **No whole build for spares.** `RootProjection.sync` builds the whole root only when the schema changes. A respared root gets a null `written`: the frame wrote before the commit's record writes, so its slice can show a spare those writes replaced.
- **The unique index at load.** `seedUniqueIndex` builds the index where core publishes a loaded document, the initial value and each reconfiguration, when the schema has a unique property. `uniqueIndexOf` stays the only builder, and its version check stays as the fallback, so a commit after load finds the index at its previous version and builds nothing.
- **Advance by identity.** Each commit's guard reads the `node` and `presence` keys of every root, never `path`, as (root, key) pairs. It drops each removed key from the root that held it before it adds any present key, so a node a commit moves between roots ends up held in the root it lands in.
- **The Spare collaboration plan's index sentence.** "built on first use" becomes "built at load", in that plan's Main changes and in the authored subject when phase B folds it.

## Native behavior and proof

| Behavior | What changes | Proof surface |
| --- | --- | --- |
| Undo and redo of a write that stores a spare | Nothing a user sees: a reader the undo brings back resolves against the current records | jsdom tests with the history plugin in `authored-tree-spares.test.ts`, step 1 |
| A peer's records-only import through Yjs | Nothing a user sees: only the root's readers resolve again | `authored-spare-collaboration.test.ts`, step 1 |

## Three realistic failures

- **A missed reader.** A run that can take a root spare is not in `unpendedSpareReaders`, so the view keeps an old spare until something touches that run. Guarded by step 1's head, minimum, emptied-root and named-root cases, each asserting the view equals a fresh load, and by the premise probe that every root spare take in the authored suites comes from a head or minimum part.
- **A stale cached reader.** An undo or a re-cut window reuses a reader resolved against older records. Guarded by the spare stamp and step 1's undo case, which fails with the stamp check removed.
- **A unique index that drifts.** A commit changes a unique value through a kind the advance no longer reads, so a later duplicate goes unrenamed. Guarded by the premise that path-only keys never change the index, step 1's cross-root move and reconfiguration cases, and a guard in the unique-values suites that compares the advanced index with one built from the committed document after every commit.

Blast radius: `ModeProjection.sync` feeds every authored view, preview and decision read; the unique index serves only `repairCommittedUniqueValues`. A rollback reverts this iteration's commit, which leaves phase B correct and over budget.

## Losing candidates' cases

- A dormant cache entry that becomes a reader again (Sol, Astra): covered by the spare stamp and step 1's undo case.
- A frame-adopted boundary run (Sol, Astra): step 1's emptied-root case, and a null `written` for every respared root since diff round 1.
- Two roots side by side, one respared (Sol): grafted into step 1.
- Content and records in one commit, with an insertion before an existing reader (Sol): grafted into step 1.
- The winning record removed while another compatible record remains, unbuilt turned built while another completion needs the pool, and a removed root recreated under the same name (Astra): grafted into step 1.
- Rerunning the typing and deletion cohorts once the index is built at load (Astra): grafted into step 5.
- Skipping text-only commits in the advance (Sol): a named limit, decided by step 5's typing cohorts.
- Root deletion scanning every holder (Opus's `roots` map): a named limit in Open work.

## Premises

Run before the build, on phase B's bytes 53fa46d0f1 (`spare-resolve/how/`).

- Holds: every root spare take in the authored suites comes from a part with a share of the minimum. That is 75 takes, none from a head part and none from a part with neither. 13 more come from `authored-tree-work.test.ts` calling `completeChildrenAt` directly, with no list part, outside any projection (`root-take-stack-53fa46d0f1-a1.log`). No suite takes a spare at a head, so step 1's prefix-slot case is the first.
- Holds on the bench: across step 8's Suggesting cohorts at 1,000 paragraphs under `ElementIdPlugin` (typing, the Enter, the remote keystroke, both decisions, the quote, table, list, join and top deletions), 203 advances read 2,725 keys. 999 of those keys were reported only as moved, and none of the 999 changed the index (`path-only-bench-suggesting-53fa46d0f1-a1.log`). In Editing, the Enter's one advance read 1,002 keys, 998 of them only moved, and none of those changed the index (`path-only-bench-editing-53fa46d0f1-a2-a1.log`). The authored and unique-values suites never reach the advance, 0 advances in 1,415 tests (`path-only-probe-53fa46d0f1-a2-a1.log`), so step 1 adds the fresh-build guard.
- Holds, read in code: a commit classifies presence per root (`commit.ts:937`), so a key that moves between roots is a presence key in both, and today's map keyed by node key alone keeps only the last root.
- Measured: the Enter's 2,004 extra whole reads are the id property's own Editing cost (`how/whole-reads.md`), so no design here removes them.
- Measured: with the rebuild knocked out, 401 of the 402 spare and collaboration tests pass (`knockout-spare-tests-53fa46d0f1-a1.log`).
- Prototype: with the rebuild knocked out, `path` dropped from the advance and the index warmed before the timed span, the 1,000-paragraph Enter reads 4 holders, indexes nothing and still reads 3,007 whole nodes. Typing reads 2 holders per keystroke (`proto-count-53fa46d0f1-a1.log`). Timed against base with step 8's arms, the suggested Enter took 1.27 and 1.21 times base at 1,000 and 10,000 paragraphs, against 1.83 and 3.91, and Suggesting typing 1.03 against 1.3, each past its noise (`proto-suggesting-53fa46d0f1-a1.log`). On the Editing line, typing took 1.00 and 1.14 and the Enter 0.91 and 0.44, and the remote keystroke 1.16 and 1.17 was inconclusive, with same-code noise 0.22 at a load of 60 on 18 cores (`proto-editing-53fa46d0f1-a1.log`). Those runs still took the frame's write in a respared root, which the final bytes never take, so only step 5's rerun on the final bytes counts for any line.

## Defaults

| Decision | Pick | Alternative | Word | Impact |
| --- | --- | --- | --- | --- |
| When the unique index is built | At load, so no write pays for it (look) | Keep the first-use build and accept that the first unique write after a load reads every element | build on first use | big |
| Text-only commits in the index advance | Advanced like any commit, about 2 entries per keystroke (safe) | Skip a commit that changes only text | skip text keystrokes | small |
| A plan review before building | Skipped: three designs and a judge already compared it, and the panel on the finished diff still runs (look) | Review the plan first | panel the plan | small |
| Root deletion in the unique index | Still scans every holder; no step 8 cohort deletes a root (safe) | Keep each root's holders so a deletion drops only its own | index by root | detail |

## Steps

- [x] 1. **Cases that fail today.** In `authored-tree-spares.test.ts`, each asserting the view equals a fresh load, with the work counts named: a records-only write of a spare that sorts first, in a root with a prefix slot whose head the view vacates; a root whose minimum is 2 holding a kept and a deleted block, with `rootRebuilds` 0 and 1 run resolved again; content and records in one commit with an insertion before an existing reader; two named roots, one respared; a commit that empties a root's view and stores its spare; the winning record removed while another compatible record remains; unbuilt turned built while another root completion needs the pool; a removed root recreated under the same name; an undo that brings back a reader resolved against an older record; a decision that drops a spare reaching a warm view; and a reconfiguration and an app's value replace reaching a warm view. In `authored-spare-collaboration.test.ts`, a peer's records-only Yjs import. In `authored-tree-work.test.ts`, under `ElementIdPlugin`'s schema, the three missing writes resolve 0 spare readers and build 0 roots, and a records-only write in a 1,000-paragraph root with a pending suggestion resolves 0 runs. In the unique-values suites, `uniqueIndexedNodes` 0 inside every write after a load, `uniqueHolderReads` equal for an Enter at 10 and 1,000 paragraphs, a node moved from a content root into `main` keeping its value unique, and a guard that compares the advanced index with a fresh build after every commit. Proof: each case fails at 53fa46d0f1, with the rebuild knocked out where phase B's rebuild hides it, or is named in the log as a guard that already passes; `cases-red-a1.log`.
- [x] 2. **Spare readers.** As Main changes says, in `runs.ts`, `projection.ts`, `level.ts` and `ledger.ts`. Proof: step 1's projection and collaboration cases pass, as do the knock-out's control case "show the spare a later record write stores, as a fresh load does" and every authored suite; the undo case fails with the stamp check removed and the minimum case fails with `unpendedSpareReaders` returning nothing.
- [x] 3. **The unique index at load.** As Main changes says, in `public-state.ts` and `unique-values.ts`, with the Spare collaboration plan's sentence. Proof: step 1's index cases pass, as do the unique-values suites, `ElementIdPlugin`'s specs in `platejs` and every partition of the plitejs suite; the fresh-build guard fails on the cross-root case when the advance adds before it removes.
- [x] 4. **Review.** `deslop`, then `no-comments`, then the panel on the diff (reviews: push), at most three rounds, each round's fixes with their writing passes. Proof: the panel's rows, and the plitejs suite, typecheck and lint on the final bytes.
- [x] 5. **Back to the scale gate.** On the final bytes, the step 8 Suggesting line's eight at-risk cohorts plus Suggesting typing at 1,000 and 10,000 paragraphs, and the Editing line's typing, Enter and remote keystroke, through `paired-timing.mjs` with the step 8 configs' arms, samples and budgets, each run under an hour; and the time to open each cohort's document with `ElementIdPlugin`, 53fa46d0f1 against the final bytes, reported beside them. Proof: those runs' logs; a conclusive miss sends its row back to `architect`.
- [x] 6. **Close.** This iteration lands with phase B through the parent plan's step 9.

## Proof

- Every view case compares the view with a fresh editor loaded from the same stored document, in each mode, and counts `rootRebuilds` and the runs resolved again.
- The knock-out of `respared.has(root)` stands for phase B with this iteration's projection half undone; a case that passes there proves nothing about readers.
- Timing runs only through `paired-timing.mjs` with a planted arm and a same-code arm per cohort, against `wt-s8-base-ee0b38ca07`.

## Close

What landed. A change to a root's spare records no longer builds that root again in each mode. `unpendedSpareReaders` finds the runs at the two ends of the root's slot tree that can take a root spare, the head and a part that fills a share of the minimum, and the projection resolves only those beside the edit's own windows. A reader keeps the spare record set's version as `Run.spares`, so one that an undo or a re-cut window brings back resolves against the current records. A respared root never takes the frame's write (row 24). `seedUniqueIndex` builds the unique index at load, and each commit advances it from the `node` and `presence` keys of every root, keyed by root and key, so a move between roots lands in the root it reaches. A test-only law check, `lawCheckEnabled` in `internal/law-check.ts`, compares the advanced index with a fresh build after every commit under test (rows 20 and 21). The Spare collaboration plan's index sentence says "built at load". The build is `473f2de575` to `958923800a` in a worktree at `53fa46d0f1`, applied as one patch to phase B's tree, and it lands in phase B's commit.

Reversals. Round 1's critical (astra 1) reversed the build's adoption of the frame's write for a reader the commit's own edit pends. A respared root now gets no frame write, and the `unwritten` set went (row 24). Round 2's opus 1 replaced the work case's comparison of runs with one of window slots, because the runs comparison could not fail on whole-root work (row 28).

Deviations. The delegate wrote the undo case with history-skip, made the fresh-build guard a test-only law check, passed the run context to the reader search, used Editing writes in the spare cases, lifted the Suggesting refusal in `authored-tree-work.test.ts` with `mock.module`, and expected `[1, 1]` in the minimum case (row 20). The lift goes at construction-values step 10. The case for a command that stores a spare itself turns the test build's frame law off, because that law throws at `53fa46d0f1` too (row 24). Round 2's opus 2, the frame check a respared root skips, waits on construction-values step 10 (row 28). The architect base dropped a facade export, the plugin guard rewrite and a per-root holder map (row 7). Step 5's Suggesting line stays a gate that construction-values step 13 replays on phase C's final bytes, and suggested task t_c79519a1 runs the full protocol (row 31).

Proof and its limits. 7 of step 1's 19 cases fail on `53fa46d0f1`, and all 19 pass after step 3. 1,484 authored tests, the plitejs suite's 21 tasks, typecheck, lint and 34 `ElementIdPlugin` tests pass, and four mutants that each remove one mechanism each fail a case (row 19). After round 1, the 20 cases, the plitejs suite uncached and the `ElementIdPlugin` tests pass, then lint, typecheck and both changed test files pass on the final test bytes (row 26). The work case fails on a mutant that puts every rank of a respared root in the touched set (row 28). On phase B's final bytes the affected check passes every step with nothing cached, after fixes to a test's cast and format and to the schema audit's stage list for `ElementIdPlugin`. The one exception is a DOCX benchmark test that times out under a load near 200 at `ee0b38ca07` too and passes alone at a load of 180 (construction-values row 189). Step 5 ran on the final product bytes `c678eff5d2`. The Editing line passes every cohort past its noise at a load of 40 (row 30). The Suggesting line ran twice, at loads of 105 and 150. The suggested Enter passes at 1,000 paragraphs in both runs and at 10,000 in the second, and a suggested list deletion passes in the first. Every other cohort is inconclusive in both, its base-against-base arm reading up to 2.29, and none misses conclusively (row 31). Opening a document stays within noise of `53fa46d0f1` at 1,000 and 10,000 paragraphs, and the quote, table and join documents are inconclusive (row 32). The limits hold. The premises that every take of a root spare comes from a head or a minimum part, and that a path-only key never changes the unique index, rest on the authored suites and step 8's cohorts at 1,000 paragraphs (rows 13 and 14). The Enter still reads about 3,007 and 30,007 whole nodes, the id property's own Editing cost (row 4). The seven items in Open work stay with their owners and stops.

Counts. 6 steps. Steps 1 to 4 are done in the log (rows 19 to 29), step 5 is its scale rows, and step 6 closes with this landing. The diff panel ran two rounds, the second earned by round 1's applied critical, and found no critical in round 2.

## Open work

- Deleting a root scans every unique holder. owner: zbeyens. stop: a cohort that deletes a root under a unique schema.
- `ElementIdPlugin`'s runtime index stores paths and moves them on `path` keys once a `read.entry` builds it, so each top-level insertion then moves every later sibling's entry. No step 8 cohort reads an entry. owner: zbeyens. stop: a cohort that reads an entry after an insertion.
- A keystroke in a named content root builds that root's snapshot index each commit once the unique index exists, because `getEditorCommitSnapshot` makes a fresh index for a named root. Before this plan that began at the first unique write; the load-time seed starts it at load. owner: zbeyens. stop: a scale gate that times typing in a named content root under a unique property.
- An editor that never writes, such as a read-only or server editor under `ElementIdPlugin`, builds the unique index at load. owner: zbeyens. stop: a cohort that measures such an editor's load.
- A command that writes a spare record itself fails the test build's frame law, at 53fa46d0f1 too, because its frame holds the build from before that write; its case turns the law off. The plugin's own writers store the value the view showed. owner: zbeyens. stop: a product command that writes a spare record inside its frame.
- A respared root gets no frame write, so its windows also skip `assertShowsWritten`, the check that refuses a window the kernel resolves away from what the commands wrote. Phase B's rebuild at 53fa46d0f1 skipped it too. Under a generated id a document's first suggested write respares the root, so once the Suggesting refusal lifts, a suggested move made first goes unchecked. The fix passes the frame's write with adoption off and recording on. owner: construction-values step 10 in this run. stop: step 10 narrows the refusal.
- The Enter still reads about 3,007 and 30,007 whole nodes, the id property's own Editing cost (`how/whole-reads.md`), which the budget's factors allow. owner: zbeyens. stop: a budget that excludes the id property's cost.
