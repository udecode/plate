---
date: 2026-05-06
topic: slate-v2-core-history-selection-undo-ralplan
status: slate-ralplan-done
skill: slate-ralplan
current_score: 0.93
source_ledger: docs/slate-issues/gitcrawl-live-open-ledger.md
source_clusters: docs/slate-issues/gitcrawl-clusters.md
---

# Slate v2 Core History Selection Undo Ralplan

## Current Verdict

The next cluster should be `v2-core-engine`, narrowed to history, undo, and
selection integrity.

Hard take: **do not jump back to Android or another DOM bridge pass right now.**
Input runtime, React runtime, DOM selection, and clipboard already have completed
local proof lanes. Android exact closure still needs raw-device evidence. The
next runnable architecture owner is the core transaction/history path, because
the issue corpus still has open undo selection rows and the current implementation
already exposes the right live hooks to test them without browser hardware.

Chosen first slice:

```txt
history/undo selection integrity
+ move_node undo state
+ deleteFragment undo selection restoration
+ incomplete set_selection replay guards
+ transaction metadata and collaboration boundaries
```

Not chosen:

- a full 104-row `v2-core-engine` rewrite in one pass;
- another generic clipboard pass;
- public history API design;
- raw Android/iOS exact claims without raw-device proof.

## Intent And Boundary

- intent: convert the remaining high-signal core history/selection issue family
  into replayable v2 proof.
- desired outcome: undo/redo restores document and selection deterministically
  across destructive range edits, `move_node`, and partial `set_selection`
  histories, without adding product-shaped public APIs.
- in scope: `slate`, `slate-history`, transaction commits, operation inverse,
  refs/bookmarks, history grouping, collaboration history metadata, and issue
  accounting for clusters 6 and 27 plus singleton #4559.
- non-goals: no DOM/browser selection bridge rewrite, no Android raw-device
  claim, no Tiptap-style command-first API, no ProseMirror position model, no
  public `normalizeSelection` escape hatch.
- decision boundary: this plan may choose internal history/transaction shape and
  package tests. Exact `Fixes #...` claims require red/green proof matching the
  issue repro.

## Decision Brief

Principles:

- History follows transaction commits, not render timing.
- Selection restoration must be full-range, deterministic, and never rely on
  incomplete `set_selection` patches during replay.
- Operations remain first-class for history and collaboration.
- Public API stays Slate-close: `editor.update`, tags, metadata, and
  `HistoryEditor` helpers are enough unless proof says otherwise.
- Exact issue closure is earned by a replayable test, not by architectural
  similarity.

Top drivers:

- Gitcrawl cluster 6: #3705, #3756, #3921 incomplete or wrong history selection.
- Gitcrawl cluster 27: #3534, #3551 undo selection and `move_nodes` wrong state.
- Singleton #4559: deleteFragment undo should select the reinserted fragment.
- Live source already has commit metadata, selectionBefore/selectionAfter,
  bookmarks, operation inverse, and history batching; the proof can be local.

Viable options:

1. Continue with Android input runtime.
   - upside: largest issue bucket.
   - rejection: exact closure depends on missing raw mobile proof artifacts.
2. Reopen React runtime for async decoration #5987.
   - upside: high-signal issue plus PR linkage.
   - rejection: React runtime execution just closed its available local slice;
     core history has stronger next-owner ordering and no hardware blocker.
3. Execute core history/undo selection proof.
   - upside: local, issue-backed, foundational for collaboration and Plate/Yjs.
   - downside: likely touches low-level history and operation semantics, so the
     proof matrix must be strict.
4. Chase large-paste performance again.
   - upside: measurable and already hot.
   - rejection: #5992 is already improved; deeper optimization is useful, but
     it should not skip unresolved correctness rows.

Chosen option: option 3.

Consequences:

- The first execution slice starts with red tests for issue-shaped behavior.
- If the current code is already green, we promote only the exact proven rows
  and do not patch for vibes.
- If history needs a shape change, prefer internal batch selection bookmarks or
  full-range replay guards over a new public API.

## Source-Backed Current State

Live owners:

- `packages/slate-history/src/with-history.ts`
- `packages/slate-history/test/history-contract.ts`
- `packages/slate-history/test/integrity-contract.ts`
- `packages/slate/src/core/apply.ts`
- `packages/slate/src/core/public-state.ts`
- `packages/slate/src/editor/bookmark.ts`
- `packages/slate/test/collab-history-runtime-contract.ts`
- `packages/slate/test/selection-rebase-contract.ts`

Current implementation facts:

- `withHistory` captures `previousSnapshot = Editor.getSnapshot(e)` and stores
  `selectionBefore: previousSnapshot.selection` in each new batch.
- undo replays `batch.operations.map(Operation.inverse).reverse()` and then
  sets `batch.selectionBefore`.
- redo sets `batch.selectionBefore` before replaying the original operations.
- `set_selection` operations are not saved as history content operations.
- `editor.update` owns tags and metadata, including `history`, `collab`, and
  `selection`.
- `EditorCommit` already records `selectionBefore`, `selectionAfter`,
  `selectionChanged`, `metadata`, `tags`, dirty runtime ids, and operations.
- `apply` transforms path refs, point refs, range refs, bookmarks, and implicit
  targets before applying each operation.
- `Editor.bookmark` exists as a live op-rebased range primitive.

Current gap:

- The existing history contracts prove broad transaction behavior, but they do
  not yet replay #3534, #3551, #3705, #3756, #3921, or #4559 as exact issue
  rows.

## Ecosystem Strategy Synthesis

### Lexical

- source used: `docs/research/sources/editor-architecture/lexical-read-update-extension-runtime.md`
- observed mechanism: synchronous `editor.update`, update tags, dirty sets,
  command handlers inside update context.
- Slate target: keep `editor.update` as the mutation boundary and use commit
  tags/metadata for history grouping and collaboration import policy.
- steal: lifecycle tags and dirty commit records.
- reject: class nodes, `$` helper API, and command-first mutation as the normal
  app API.
- verdict: agree on lifecycle discipline, diverge on node model and command API.

### ProseMirror

- source used: `docs/research/sources/editor-architecture/prosemirror-transaction-view-dom-runtime.md`
- observed mechanism: transactions map selection through steps; selection
  bookmarks can map without the current document and resolve later.
- Slate target: keep paths/operations/runtime ids, but use bookmark-like internal
  range preservation when raw selection snapshots fail under structural undo.
- steal: selection mapping and durable bookmark discipline.
- reject: integer document positions and schema-first content matching.
- verdict: partial. The history lesson is right; the position model is not.

### Tiptap

- source used: `docs/research/sources/editor-architecture/tiptap-extension-command-react-dx.md`
- observed mechanism: extension commands and chains build product DX around one
  transaction.
- Slate target: keep command/chain sugar optional and outside this proof. The
  core history lane should prove transaction semantics, not toolbar ergonomics.
- steal: discoverable extension methods later.
- reject: command-first history policy.
- verdict: diverge for engine work, borrow later for DX.

## Public API Target

No new public API in the first slice.

Keep:

- `editor.update((tx) => ...)`
- update tags: `history-push`, `history-merge`, `historic`, `collaboration`
- update metadata: `metadata.history`, `metadata.collab`, `metadata.selection`
- `withHistory(editor)`
- `HistoryEditor.withoutSaving`, `withoutMerging`, `withNewBatch`, `undo`,
  `redo`

Reject for this lane:

- public `normalizeSelection`
- public `historyTransaction`
- public ProseMirror-style `SelectionBookmark`
- public command-first history API
- compatibility overloads for legacy mutable editor internals

If exact proof shows raw range snapshots are insufficient, the target is an
internal history selection bookmark, not a new public concept.

## Internal Runtime Target

The implementation target is:

```txt
commit owns before/after selection
+ history batch owns replay policy
+ undo/redo replay emits complete selection state or null
+ structural inverse operations restore the exact document first
+ selection restoration happens after the restored document is valid
+ remote/collab imports cannot poison local undo stacks
```

Hard requirements:

- undo after destructive range edits restores the original selected range when
  the original document is restored;
- undo after `move_node` restores the exact original tree and selection;
- history replay never applies an incomplete `set_selection` patch without a
  current selection;
- `set_selection`-only commits stay out of undo stacks;
- remote collaboration commits with `history: { mode: 'skip' }` stay out of
  local undo stacks;
- no DOM selection import/export is required for package-level proof.

## Hook, Component, And Render DX Target

Skipped for the first slice. This is not a React render API plan.

The only React-facing requirement is negative: React runtime must consume the
resulting commits without depending on mutable editor fields or browser timing.

## Plate Migration-Backbone Target

Plate needs:

- deterministic undo units for toolbar, slash-command, AI, and table operations;
- history grouping controlled by update metadata instead of wrapper timing;
- selection restoration that survives structural commands;
- no product-specific history command API in raw Slate.

This lane strengthens the substrate Plate builds on; it should not add Plate
policy to `slate-history`.

## Slate-Yjs Migration-Backbone Target

Slate-yjs needs:

- op-first commit records;
- remote import metadata that skips local history unless explicitly opted in;
- bookmarks/ranges that rebase under remote operations;
- deterministic inverse operation replay.

This plan must keep local-only runtime ids out of serialized collaboration
operations. Current `collab-history-runtime-contract.ts` already proves runtime
ids are local and remote remove/move rebases them.

## Issue-Ledger Accounting

ClawSweeper status: complete for the core-history selection/undo surface.

Gitcrawl evidence read:

- `gitcrawl doctor --json`: `659` open threads, `617` clusters,
  `last_sync_at=2026-05-04T14:58:11.123944Z`.
- `gitcrawl cluster-detail ... --id 6`: #3705, #3756, #3921.
- `gitcrawl cluster-detail ... --id 27`: #3534, #3551.
- `gitcrawl search ... "history undo selection set_selection move_nodes"`:
  no additional hybrid hits.
- `gitcrawl threads ... --numbers 3534,3551,3705,3756,3921,4559,1770,2288,3741,3752 --include-closed --json`:
  refreshed the exact issue bodies and states for this slice.
- `gitcrawl neighbors ... --number 3534` and `--number 3705`: confirmed the
  selection/undo and incomplete `set_selection` families overlap, but do not
  prove the same root cause for every row.

Fixed issues: none in the planning pass.

Candidate exact claims after execution, only if red/green proof lands:

- #3534: undo after multi-block edit restores original selection range.
- #4559: deleteFragment undo selects the restored fragment.
- #3551: undoing `move_nodes` restores the exact original tree and selection.
- #3705/#3756/#3921: promote only if the execution proof reproduces the
  incomplete `set_selection` or selection-movement failure directly.

Related but not fixed yet:

- #3705: incomplete `set_selection` history replay family.
- #3756: history undo selection movement family.
- #3921: refocus plus incomplete `set_selection` history replay family.
- #2288: already `Improves` through `replace_children`; keep out of new fixed
  claims unless public range operation proof changes.
- #1770 and #3741: collaboration operation metadata pressure; reviewed as
  related, but do not claim from history proof alone.
- #3752: history memory benchmark pressure; keep for the performance lane unless
  the history implementation changes stack retention.

Ledger sync status:

- `docs/slate-v2/ledgers/issue-coverage-matrix.md` lists #3534, #3551,
  #3705, #3756, #3921, and #4559 as `Related`, #2288 as `Improves`, and #1770,
  #3741, and #3752 as related/non-claim pressure.
- `docs/slate-v2/ledgers/fork-issue-dossier.md` already has sections for
  #3534, #3551, #3705, #3756, #3921, #4559, #1770, #2288, #3741, and #3752.
- `docs/slate-v2/references/pr-description.md` keeps fixed issue claims
  unchanged and updates the improved/related/not-claimed count to `99`.
- no `Fixes #...` rows are added until execution proof lands.

Remaining cluster backlog:

- full `v2-core-engine` bucket: `104` rows.
- this plan covers the first history/selection subset, not normalization,
  custom operation validation, transform ergonomics, hyperscript, or full
  performance.

## Regression Proof Matrix

| Contract                          | Required proof                                                                                                           |
| --------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| #3534 multi-block edit undo       | package test in `slate-history` or `slate` that reproduces selected multi-block edit, undo, exact selection restore      |
| #4559 deleteFragment undo         | package test that selects/deletes a fragment, undoes, and asserts restored fragment selection                            |
| #3551 move_nodes undo             | package test that moves nodes via public transform/update, undoes, and asserts exact original tree plus selection        |
| incomplete `set_selection` replay | operation/history test proving replay either resolves against live selection or rejects safely before history corruption |
| selection-only commits            | existing proof stays green: selection-only commits are not saved to history                                              |
| collaboration import              | existing proof stays green: remote imports can skip local history                                                        |
| replace_children undo             | existing proof stays green: range delete stores one undoable batch and restores selection                                |
| refs/bookmarks                    | existing bookmark and selection-rebase tests stay green                                                                  |

Fast local verification target for execution:

```bash
bun --filter slate-history typecheck
bun --filter slate typecheck
bun test ./packages/slate-history/test/history-contract.ts ./packages/slate-history/test/integrity-contract.ts ./packages/slate/test/collab-history-runtime-contract.ts ./packages/slate/test/selection-rebase-contract.ts
```

Broaden only if the changed files touch operation inverse, refs, or
normalization:

```bash
bun test ./packages/slate/test/operations-contract.ts ./packages/slate/test/transaction-contract.ts ./packages/slate/test/delete-contract.ts
```

## Browser Stress And Parity Strategy

Package tests are the first owner. Browser proof is not required for the first
red/green history slice unless the repro depends on native selection import or
DOM focus.

If a browser row is needed later:

- use the richtext example for destructive selection undo;
- use tables/lists only when the red test names a structural container;
- keep browser proof as confirmation, not the only history contract.

## Applicable Implementation-Skill Matrix

| Skill                         | Status                        | Reason                                                                                                                    |
| ----------------------------- | ----------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| `clawsweeper`                 | applied                       | clusters 6 and 27 plus #4559/#1770/#2288/#3741/#3752 reviewed and synced into fork dossier, coverage matrix, and PR count |
| `tdd`                         | required next                 | execution must start with red package tests                                                                               |
| `performance`                 | applied as non-claim boundary | #3752 is classified as memory benchmark pressure, not correctness closure                                                 |
| `performance-oracle`          | skipped until execution       | apply if implementation changes operation count, stack retention, or ref transforms                                       |
| `vercel-react-best-practices` | skipped                       | no React render surface in first slice                                                                                    |
| `react-useeffect`             | skipped                       | no React effect surface                                                                                                   |
| `shadcn`                      | skipped                       | no UI surface                                                                                                             |
| `high-risk-deliberate-pass`   | applied                       | risk matrix blocks public/API changes and exact issue claims until red/green proof lands                                  |

## High-Risk Pre-Mortem

Failure modes:

- raw selection snapshots restore to invalid paths after inverse structural ops;
- a fix for #3534 changes selection policy and breaks normal typing undo;
- `move_node` inverse is correct for content but not for refs/bookmarks;
- collaboration imports accidentally become undoable;
- history grouping changes improve one issue but merge unrelated transactions;
- exact issue claims get promoted from "similar" proof instead of matching repro.

Mitigation:

- red tests use issue-shaped scenarios first;
- changes stay in history/operation/ref layers only;
- fixed claims stay blocked until exact issue rows are replayed;
- performance/memory proof is separate from correctness proof.

## Hard Cuts And Rejected Alternatives

- Do not add public `normalizeSelection`.
- Do not store browser DOM selection in history.
- Do not make `set_selection` history-saveable by default.
- Do not make remote collaboration imports undoable by default.
- Do not port ProseMirror positions.
- Do not use Tiptap command chains as the engine model.
- Do not claim Android/mobile rows from package tests.

## Maintainer Objection Ledger

| Objection                                     | Answer                                                                                                                  | Status   |
| --------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- | -------- |
| "History is already closed in the roadmap."   | Support-package closure is not exact issue closure. The issue matrix still marks #3534/#3551/#4559 as related.          | accepted |
| "This is old Slate issue debt."               | Old does not mean stale when the same transaction/history class remains central to v2 and can be tested locally.        | accepted |
| "Why not Android next?"                       | Android exact closure needs raw-device proof. This core lane is runnable now and strengthens collaboration/history.     | accepted |
| "Selection bookmarks are a ProseMirror idea." | The mechanism is useful; the public position model is not. Slate can keep JSON paths and internal op-rebased bookmarks. | accepted |
| "Do not add new public history API."          | Agreed. First slice is internal proof only.                                                                             | accepted |

## Pass Schedule

1. Current-state read and initial score.
2. Related issue discovery pass: finish ClawSweeper for clusters 6 and 27,
   singleton #4559, and nearby #1770/#3741/#3752/#2288 rows.
3. Issue-ledger pass: confirm exact candidate rows and non-claims.
4. Intent/boundary and decision-brief pass.
5. Research/source refresh pass against live Slate v2 and local Lexical,
   ProseMirror, and Tiptap sources if current docs are stale.
6. Regression and TDD proof plan pass.
7. High-risk deliberate pass.
8. Revision pass.
9. Issue sync accounting pass.
10. Closure score and final gates.

## Pass-State Ledger

| Pass                                 | Status   | Evidence added                                                                                                                              | Plan delta                                                                           | Open issues                  | Next owner |
| ------------------------------------ | -------- | ------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ | ---------------------------- | ---------- |
| current-state read and initial score | complete | recent completion files, full issue ledger plan, gitcrawl clusters 6/27, live `with-history`, core transaction, bookmark, and history tests | selected `v2-core-engine-history-selection-undo` as next plan                        | none for planning            | ralph      |
| related issue discovery              | complete | refreshed gitcrawl threads for #3534/#3551/#3705/#3756/#3921/#4559/#1770/#2288/#3741/#3752 plus neighbors for #3534/#3705                   | #3705/#3756/#3921/#3741/#3752 added to coverage matrix accounting                    | none for planning            | ralph      |
| issue-ledger pass                    | complete | coverage matrix, fork dossier, PR count, and full issue-ledger execution row synced                                                         | fixed claims unchanged; improved/related/not-claimed count moves to `99`             | no new closure claims        | ralph      |
| research/source refresh              | complete | live Slate v2 history/core/bookmark/collab files refreshed; local Lexical/ProseMirror/Tiptap source mechanisms checked                      | plan now uses source-backed tags/bookmarks/selection mapping/command-chain decisions | none for planning            | ralph      |
| high-risk deliberate pass            | complete | premortem and exact-claim gates require red/green issue proof before promotion                                                              | implementation must start with package tests, not API changes                        | none for planning            | ralph      |
| closure score                        | complete | scorecard raised above gate with no dimension below `0.85`                                                                                  | plan is ready for execution, not issue closure                                       | execution proof still needed | ralph      |

## Plan Deltas From This Pass

- picked core history/undo selection as the next lane;
- explicitly rejected Android as the immediate next lane because raw-device proof
  is the blocker;
- kept async decoration as a later React-runtime exact-proof candidate, not the
  next bucket;
- kept issue claims unchanged;
- narrowed first execution target to issue-shaped history tests;
- completed the ClawSweeper related pass for clusters 6/27, singleton #4559,
  and nearby #1770/#2288/#3741/#3752;
- synced the fork dossier, coverage matrix, full issue-ledger execution row,
  and PR description count without adding any `Fixes` rows.

## Open Questions And What Would Change The Decision

- If #3534 and #4559 are already green in live tests, promote only those exact
  rows and move the implementation owner to #3551/#3705.
- If #3551 fails in operation inverse, broaden to move-node inverse/ref proof.
- If #3705/#3921 require DOM refocus, keep them related and require browser
  proof before exact closure.
- If the next ClawSweeper pass finds a stronger core row with ready-now proof,
  swap it into the first execution slice and record the reason.
- If history stack retention changes, add the #3752 memory benchmark lane.

## Implementation Phases

Phase 1: red issue-shaped package tests.

- #3534 multi-block destructive edit undo selection.
- #4559 deleteFragment undo restored-fragment selection.
- #3551 move_nodes undo exact tree and selection.
- #3705/#3921 incomplete `set_selection` replay guard if reproducible without
  DOM refocus.

Phase 2: smallest core/history fix.

- Prefer full-range replay guards and internal bookmark-backed selection
  restoration if raw snapshots fail.
- Touch `slate-history` first; touch operation inverse/ref layers only if the
  red test proves the bug lives there.

Phase 3: preserve existing contracts.

- history grouping metadata;
- selection-only commit exclusion;
- remote collaboration history skip;
- replace_children undo;
- refs/bookmarks.

Phase 4: ledger and PR sync.

- update issue coverage, fork dossier, live ledger, and PR description only for
  rows with changed claim status.

## Fast Driver Gates

Must pass before implementation handoff:

```bash
bun test ./packages/slate-history/test/history-contract.ts ./packages/slate-history/test/integrity-contract.ts
bun test ./packages/slate/test/collab-history-runtime-contract.ts ./packages/slate/test/selection-rebase-contract.ts
bun --filter slate-history typecheck
bun --filter slate typecheck
bun lint:fix
```

Add `operations-contract.ts`, `transaction-contract.ts`, and `delete-contract.ts`
when operation inverse or range delete code changes.

## Final User-Review Handoff Outline

- next lane chosen and why;
- exact issues tested;
- fixed/improved/related issue claim changes;
- source files changed;
- verification commands and results;
- remaining non-claims.

## Confidence Scorecard

| Dimension                                      | Score | Evidence                                                                                                                                 |
| ---------------------------------------------- | ----: | ---------------------------------------------------------------------------------------------------------------------------------------- |
| React 19.2 runtime performance                 |  0.92 | no React hot path planned; commits already carry dirty runtime ids in `public-state.ts`; React consumption is a negative constraint only |
| Slate-close unopinionated DX                   |  0.92 | no new public API; keeps `editor.update`, metadata, tags, and `HistoryEditor`                                                            |
| Plate and slate-yjs migration backbone         |  0.93 | commit metadata, remote history skip, runtime-id locality, and collaboration tests are current source owners                             |
| Regression-proof testing strategy              |  0.94 | exact issue-shaped package tests are named before any fix; fixed claims stay blocked until red/green proof lands                         |
| Research evidence completeness                 |  0.92 | live Slate v2 source plus local Lexical/ProseMirror/Tiptap mechanisms were refreshed for this pass                                       |
| shadcn-style composability and hook minimalism |  0.91 | React/UI not in scope; plan avoids new hooks/components and keeps extension ergonomics out of the engine proof                           |

Weighted score: `0.93`.

Status: `done`. The plan is closure-ready for Ralph execution. It is not an
issue-fix claim and adds no public API.

## Ralph Execution Result

Status: execution slice complete.

- Added issue-shaped package proof in `packages/slate-history/test/history-contract.ts`.
- Promoted #3534, #3551, and #4559 to exact `Fixes` claims.
- Promoted #3705 and #3921 to `Improves` claims for the model-level partial
  `set_selection` guard.
- Left #3756 as `Related` because exact closure still needs matching repro
  proof.
- No implementation source patch was needed; current Slate v2 history behavior
  already satisfied the focused proofs.

Verification:

```bash
cd Plate repo root && bun test ./packages/slate-history/test/history-contract.ts ./packages/slate-history/test/integrity-contract.ts
cd Plate repo root && bun test ./packages/slate/test/collab-history-runtime-contract.ts ./packages/slate/test/selection-rebase-contract.ts
cd Plate repo root && bun --filter slate-history typecheck
cd Plate repo root && bun --filter slate typecheck
cd Plate repo root && bun lint:fix
```

All gates passed after lint. The execution checkpoint is
`.tmp/completion-checks/slate-v2-core-history-selection-undo-execution.md`.

## Final Completion Gates

- ClawSweeper related-issue pass complete for clusters 6 and 27 plus #4559,
  #1770, #2288, #3741, and #3752.
- exact candidate/non-claim rows recorded.
- external ecosystem evidence refreshed or explicitly accepted as current.
- high-risk deliberate pass complete.
- implementation phases have red/green proof commands.
- issue ledgers and PR description sync plan complete.
- final score `>= 0.92`, no dimension below `0.85`.
