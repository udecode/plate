---
title: refactor: Slate v2 parity-first migration plan
type: refactor
status: active
date: 2026-04-18
deepened: 2026-04-18
---

# refactor: Slate v2 parity-first migration plan

## Overview

Rewrite the remaining `slate-v2` migration plan around the real goal:
preserve the broadest honest contract surface backed by tests and proof, even
when that requires rewriting internals. Legacy behavior remains the default
truth. Draft contract coverage is a second required source of truth. Current
implementation shape is evidence, not the goal.

This plan supersedes
[2026-04-18-slate-v2-lossless-remaining-work-replan.md](/Users/zbeyens/git/plate-2/docs/plans/2026-04-18-slate-v2-lossless-remaining-work-replan.md)
as the active remaining-work doctrine.

## Problem Frame

The existing live plan corrected one failure and created another.

It correctly rejected broad rewrite-first package churn. But it overcorrected
into a source-shape-preservation bias that is too timid for the actual goal.

The actual goal is not:

- keep current `slate-v2` implementation shape
- keep legacy implementation shape
- keep draft implementation shape

The actual goal is:

- keep maximum legacy public behavior
- keep maximum draft contract coverage where it represents intended v2 value
- keep maximum example/browser proof
- rewrite any implementation that blocks those kept rows

The `docs/slate-v2-draft/**` corpus shows the strongest consistent lesson:
proof-owner coverage matters more than implementation nostalgia, but the draft
stack also drifted too far toward “justify the architecture we like.” This
plan fixes both mistakes by making the merged contract corpus the primary
driver.

## Requirements Trace

- R1. Legacy public behavior and API width remain the default truth unless a
  narrower cut is explicit and justified.
- R2. Draft contract tests and draft package/docs evidence are preserved when
  they express intended v2 behavior that does not conflict with kept legacy
  rows.
- R3. Rewrites are allowed, and sometimes required, when current code cannot
  satisfy kept contract rows.
- R4. Test-backed contract coverage outranks implementation-shape fidelity for
  core engine files.
- R5. Same-path/source-close recovery remains strict for user-facing docs,
  examples, and package surfaces where source shape itself is part of the
  public product.
- R6. Example and browser proof remain sibling truth lanes and cannot be used
  to fake closure for core behavior rows.
- R7. Every cut or deferral must be explicit in ledgers, roadmap, readiness,
  and maintainer context.

## Scope Boundaries

- This plan covers the remaining migration program for:
  - `packages/slate`
  - `packages/slate-history`
  - `packages/slate-hyperscript`
  - `packages/slate-dom`
  - `packages/slate-react`
  - site examples and Playwright parity rows
- This plan does not require copying the draft engine wholesale.
- This plan does not preserve current `slate-v2` internals for their own sake.
- This plan does not allow blanket test deletion just because a family is
  painful or old.
- This plan does not reopen greenfield architecture work as a default lane.
  Reference docs remain reference docs.

## Context & Research

### Relevant Code and Patterns

- Live remaining-work doctrine:
  [2026-04-18-slate-v2-lossless-remaining-work-replan.md](/Users/zbeyens/git/plate-2/docs/plans/2026-04-18-slate-v2-lossless-remaining-work-replan.md)
- Live no-regression scope map:
  [2026-04-13-slate-v2-full-no-regression-story-plan.md](/Users/zbeyens/git/plate-2/docs/plans/2026-04-13-slate-v2-full-no-regression-story-plan.md)
- Live API recovery owner:
  [2026-04-13-slate-v2-exhaustive-api-contract-recovery-plan.md](/Users/zbeyens/git/plate-2/docs/plans/2026-04-13-slate-v2-exhaustive-api-contract-recovery-plan.md)
- Full draft-corpus review:
  [2026-04-18-slate-v2-draft-full-doc-corpus-review.md](/Users/zbeyens/git/plate-2/docs/plans/2026-04-18-slate-v2-draft-full-doc-corpus-review.md)
- Draft example parity matrix:
  [example-parity-matrix.md](/Users/zbeyens/git/plate-2/docs/slate-v2-draft/ledgers/example-parity-matrix.md)
- Draft exact core test ledger:
  [legacy-slate-test-files.md](/Users/zbeyens/git/plate-2/docs/slate-v2-draft/ledgers/legacy-slate-test-files.md)
- Draft package end-state roadmap:
  [package-end-state-roadmap.md](/Users/zbeyens/git/plate-2/docs/slate-v2-draft/archive/package-end-state-roadmap.md)
- Current live roadmap and readiness:
  [master-roadmap.md](/Users/zbeyens/git/plate-2/docs/slate-v2/master-roadmap.md)
  and
  [release-readiness-decision.md](/Users/zbeyens/git/plate-2/docs/slate-v2/release-readiness-decision.md)

### Institutional Learnings

- The draft corpus repeatedly proves that file-closure accounting is useful but
  insufficient; name-only helper recovery is not contract recovery.
- The draft ledgers are strongest when they classify proof ownership and
  weakest when they let proof ownership excuse obvious source/runtime drift.
- The example parity matrix is the best model for separating:
  - source parity
  - proof parity
  - open rows
- The architecture and archive docs are useful reference, but they repeatedly
  overreached when treated as queue owners.

### External References

- None. External research is unnecessary here because the authoritative
  evidence is the local draft corpus plus the sibling `../slate`,
  `../slate-v2`, and `../slate-v2-draft` repos.

## Key Technical Decisions

- **Decision: Build one merged contract corpus per package.**
  Legacy exact tests/docs and draft contract tests/docs both feed the kept
  surface decision. This replaces the weaker “legacy first, draft maybe later”
  hand-wave.

- **Decision: Let tests and proof drive the engine, not source nostalgia.**
  For `packages/slate/src/**`, implementation shape is subordinate to the kept
  contract rows. Same-path/source-close pressure remains strongest for docs,
  examples, and user-facing package surfaces.

- **Decision: Rewrite when needed, explicitly.**
  The plan no longer treats rewrite as a smell. Rewrite is mandatory whenever
  current code cannot satisfy a kept legacy or draft contract row honestly.

- **Decision: Separate behavior rows from harness rows.**
  Harness, manifest, and dead matrix files can be cut. Behavior-bearing tests,
  example rows, and package proof cannot be cut without explicit claim
  narrowing.

- **Decision: Use package order, but not package dogma.**
  Execution still runs in dependency order:
  `slate` -> `slate-history` -> `slate-hyperscript` -> `slate-dom` ->
  `slate-react`, but each package is driven by row classification, not by
  broad family vibes.

- **Decision: Current live docs must be rewritten to match this doctrine before
  more code churn.**
  If the control stack still says “classification before rewrite” without also
  saying “rewrite when the corpus demands it,” implementers will keep
  under-shooting the goal.

## Alternative Approaches Considered

- **Keep the current lossless replan and just harden a few sentences**
  Rejected because the underlying doctrine was still wrong. The problem is not
  wording polish. The problem is that the active plan still treated rewrite
  avoidance as a value.

- **Drive the migration from legacy only**
  Rejected because it would silently throw away draft contract coverage that now
  represents intended v2 behavior and useful proof.

- **Drive the migration from draft implementation shape**
  Rejected because the draft contains intentional breaking changes and
  architecture bias that are not automatically part of the kept public claim.

## Open Questions

### Resolved During Planning

- **Should implementation-source parity be the main driver for `packages/slate/src/**`?**
  No. Test-backed contract parity is the driver.

- **Should draft implementation shape be imported wholesale?**
  No. Draft contracts matter; draft internals are only a means.

- **Can rewrite be the right answer?**
  Yes. If it is required to satisfy kept legacy and draft rows, rewrite is not
  only allowed, it is expected.

- **Should legacy and draft contract coverage both be preserved?**
  Yes. The migration target is the broadest honest combined corpus, not just
  legacy-only or draft-only purity.

### Deferred to Implementation

- Exact keep/cut/post-RC disposition for every draft-only row in the merged
  corpora per package.
- Whether any draft-only benchmark or proof lane graduates from supporting
  evidence to RC blocker.
- Which remaining live same-path example files can be source-close recovered
  versus staying intentionally extended.

## High-Level Technical Design

> This illustrates the intended approach and is directional guidance for review, not implementation specification. The implementing agent should treat it as context, not code to reproduce.

```text
Inputs per package:
  legacy exact tests + legacy docs
  + draft contract tests + draft docs
  + current source + current browser/example proof

For each row in the merged corpus:
  classify -> both | legacy-only | draft-only | dead
  decide -> keep-now | keep-later | explicit-cut | post-RC

If keep-now:
  import/preserve the row as RED or characterization coverage first
  rewrite current implementation until GREEN
  sync docs/ledgers/verdict in the same turn

If explicit-cut or post-RC:
  record the reason in:
    ledgers
    roadmap
    readiness
    maintainer drift register

Rule:
  user-facing source shape matters most for docs/examples/package surfaces
  test-backed behavior matters most for core engine files
```

## Implementation Units

- [x] **Unit 1: Rewrite the Live Control Stack Around Parity-First Doctrine**

**Goal:** Replace the current anti-rewrite bias in the live roadmap/verdict/docs with a parity-first doctrine that explicitly allows rewrites when required by kept contract rows.

**Requirements:** R1, R3, R4, R6, R7

**Dependencies:** None

**Files:**
- Modify: `docs/slate-v2/master-roadmap.md`
- Modify: `docs/slate-v2/release-readiness-decision.md`
- Modify: `docs/slate-v2/true-slate-rc-proof-ledger.md`
- Modify: `docs/slate-v2/release-file-review-ledger.md`
- Modify: `docs/slate-v2/fresh-branch-migration-plan.md`
- Modify: `docs/slate-v2/references/pr-description.md`
- Modify: `docs/slate-v2/references/live-shape-register.md`

**Approach:**
- Replace “classification before rewrite” wording with “classification before unjustified rewrite.”
- Make “tests/contracts first, implementation second” the explicit rule for
  engine package work.
- Demote reference/north-star docs so they cannot silently steer live queue
  decisions.
- Mark this plan as the new active doctrine and older replans as supporting
  historical artifacts.

**Patterns to follow:**
- The draft exact ledgers’ explicit status vocabulary
- The draft example parity matrix’s source/proof/open distinction

**Verification:**
- Live docs all describe the same decision order and no longer imply rewrite
  avoidance is a virtue by itself.

- [x] **Unit 2: Create a Merged Contract Corpus for Every Package**

**Goal:** Build one row-classified contract corpus per package that merges legacy exact rows, draft contract rows, and current proof owners.

**Requirements:** R1, R2, R4, R6, R7

**Dependencies:** Unit 1

**Files:**
- Create: `docs/slate-v2/ledgers/slate-legacy-draft-contract-corpus.md`
- Create: `docs/slate-v2/ledgers/slate-history-legacy-draft-contract-corpus.md`
- Create: `docs/slate-v2/ledgers/slate-hyperscript-legacy-draft-contract-corpus.md`
- Create: `docs/slate-v2/ledgers/slate-dom-legacy-draft-contract-corpus.md`
- Create: `docs/slate-v2/ledgers/slate-react-legacy-draft-contract-corpus.md`
- Modify: `docs/slate-v2/ledgers/README.md`
- Modify: `docs/slate-v2/ledgers/example-parity-matrix.md`

**Approach:**
- For each package, merge:
  - legacy exact ledger rows
  - draft contract-owner rows
  - current same-path/browser/example proof
- Add row classification:
  - `both`
  - `legacy-only`
  - `draft-only`
  - `dead`
- Add execution disposition:
  - `keep-now`
  - `keep-later`
  - `explicit-cut`
  - `post-RC`
- Separate behavior-bearing rows from harness-only rows so infra churn cannot
  masquerade as product parity.

**Patterns to follow:**
- `docs/slate-v2-draft/ledgers/legacy-slate-test-files.md`
- `docs/slate-v2-draft/ledgers/example-parity-matrix.md`

**Verification:**
- Every package has one merged corpus doc, and no future package work can
  claim parity without referencing its corpus row statuses.

- [ ] **Unit 3: Recover `slate` Query, Interface, and Ref Surfaces from the Corpus**

**Goal:** Drive the remaining `slate` query/interface/ref work from the merged corpus instead of source-diff vibes.

**Requirements:** R1, R2, R3, R4

**Dependencies:** Unit 2

**Files:**
- Modify: `../slate-v2/packages/slate/src/interfaces/editor.ts`
- Modify: `../slate-v2/packages/slate/src/interfaces/node.ts`
- Modify: `../slate-v2/packages/slate/src/interfaces/path.ts`
- Modify: `../slate-v2/packages/slate/src/interfaces/path-ref.ts`
- Modify: `../slate-v2/packages/slate/src/interfaces/point.ts`
- Modify: `../slate-v2/packages/slate/src/interfaces/point-ref.ts`
- Modify: `../slate-v2/packages/slate/src/interfaces/range.ts`
- Modify: `../slate-v2/packages/slate/src/interfaces/range-ref.ts`
- Create: `../slate-v2/packages/slate/test/query-contract.ts`
- Create: `../slate-v2/packages/slate/test/legacy-editor-nodes-fixtures.ts`
- Create: `../slate-v2/packages/slate/test/legacy-interfaces-fixtures.ts`
- Modify: `docs/slate-v2/ledgers/slate-editor-api.md`
- Modify: `docs/slate-v2/ledgers/slate-interfaces-api.md`
- Modify: `../slate-v2/docs/api/nodes/editor.md`

**Approach:**
- Start from kept `both` and `legacy-only keep-now` rows in the merged corpus.
- Pull or preserve characterization rows first so current regressions go red
  before implementation changes.
- Import draft contract rows only when they strengthen kept public behavior or
  represent intended v2 value without narrowing legacy guarantees.
- Rewrite current interface helpers when necessary; do not prefer source-shape
  closeness over contract truth.

**Execution note:** Characterization-first. Preserve or import failing contract rows before changing implementation.

**Patterns to follow:**
- `../slate-v2/packages/slate/test/query-contract.ts`
- `../slate-v2/packages/slate/test/legacy-editor-nodes-fixtures.ts`
- `../slate-v2/packages/slate/test/legacy-interfaces-fixtures.ts`

**Test scenarios:**
- Happy path: legacy `Editor.before`, `Editor.after`, `Editor.next`,
  `Editor.previous`, `Editor.nodes`, `Editor.levels`, and `positions` rows
  still pass with the current public API names.
- Edge case: mixed-inline traversal, reverse traversal, `voids`, and
  `nonSelectable` rows behave like the kept corpus says, not like today’s
  accidental narrowing.
- Error path: rows marked `explicit-cut` stay explicitly documented and do not
  silently pass through fallback behavior.
- Integration: API ledger status, current docs, and runtime proof owner all
  agree for every changed row family.

**Verification:**
- `slate` query/interface/ref rows marked `keep-now` are green and synced in
  code, tests, docs, and ledgers.

Current progress:
- restored and green:
  - `../slate-v2/packages/slate/test/query-contract.ts`
  - `../slate-v2/packages/slate/test/legacy-editor-nodes-fixtures.ts`
  - `../slate-v2/packages/slate/test/legacy-interfaces-fixtures.ts`

- [ ] **Unit 4: Recover `slate` Transform, Operation, Snapshot, and Transaction Surfaces from the Corpus**

**Goal:** Close the remaining `slate` transform and operation-width debt using the merged corpus, even where that requires deeper engine rewrites.

**Requirements:** R1, R2, R3, R4

**Dependencies:** Unit 2

**Files:**
- Modify: `../slate-v2/packages/slate/src/interfaces/transforms/general.ts`
- Modify: `../slate-v2/packages/slate/src/interfaces/transforms/node.ts`
- Modify: `../slate-v2/packages/slate/src/interfaces/transforms/selection.ts`
- Modify: `../slate-v2/packages/slate/src/interfaces/transforms/text.ts`
- Modify: `../slate-v2/packages/slate/src/transforms-node/insert-nodes.ts`
- Modify: `../slate-v2/packages/slate/src/transforms-node/set-nodes.ts`
- Modify: `../slate-v2/packages/slate/src/transforms-node/split-nodes.ts`
- Modify: `../slate-v2/packages/slate/src/transforms-text/delete-text.ts`
- Modify: `../slate-v2/packages/slate/src/transforms-text/insert-fragment.ts`
- Modify: `../slate-v2/packages/slate/src/core/apply.ts`
- Modify: `../slate-v2/packages/slate/src/create-editor.ts`
- Create: `../slate-v2/packages/slate/test/operations-contract.ts`
- Create: `../slate-v2/packages/slate/test/snapshot-contract.ts`
- Modify: `../slate-v2/packages/slate/test/accessor-transaction.test.ts`
- Create: `../slate-v2/packages/slate/test/legacy-transforms-fixtures.ts`
- Modify: `docs/slate-v2/ledgers/slate-transforms-api.md`
- Modify: `../slate-v2/docs/api/transforms.md`

**Approach:**
- Use merged-corpus row status, not source similarity, to choose work.
- Import or preserve legacy and draft transform/transaction rows as RED first.
- Treat current engine internals as disposable if they block kept row coverage.
- Keep explicit-skip breadth closed unless a merged-corpus row reopens it.
- Use transaction/snapshot tests to prevent draft-only semantics from silently
  narrowing legacy transform behavior.

**Execution note:** Test-first for feature-bearing rows; characterization-first for legacy transforms already represented in same-path fixtures.

**Patterns to follow:**
- `../slate-v2/packages/slate/test/legacy-transforms-fixtures.ts`
- `../slate-v2/packages/slate/test/operations-contract.ts`
- `../slate-v2/packages/slate/test/snapshot-contract.ts`
- `../slate-v2/packages/slate/test/accessor-transaction.test.ts`

**Test scenarios:**
- Happy path: kept legacy transform rows for `move`, `delete`, `select`,
  `setPoint`, `setSelection`, `insertNodes`, `setNodes`, `splitNodes`, and
  `insertFragment` stay green.
- Happy path: kept draft transaction/snapshot rows for `withTransaction`,
  `applyBatch`, snapshot publication, and replacement visibility stay green.
- Edge case: mixed structural batches, duplicate exact-path writes, reverse and
  distance motion, mixed-inline ranges, and block-boundary delete/merge rows
  behave consistently across current helpers.
- Error path: explicit-cut batch or operation semantics fail closed and remain
  documented instead of half-working.
- Integration: transform namespace signatures, runtime implementation, docs,
  and corpus/ledger status stay aligned for every changed family.

**Verification:**
- `slate` transform/operation/snapshot rows marked `keep-now` are green, and
  the implementation no longer depends on current underpowered helpers.

- [ ] **Unit 5: Recover `slate-history` and `slate-hyperscript` Against the Same Combined Standard**

**Goal:** Apply the same merged-corpus doctrine to support packages instead of treating them as “close enough” because their current suites are smaller.

**Requirements:** R1, R2, R3, R4, R6

**Dependencies:** Units 2, 3, 4

**Files:**
- Modify: `../slate-v2/packages/slate-history/src/index.ts`
- Modify: `../slate-v2/packages/slate-history/src/history.ts`
- Modify: `../slate-v2/packages/slate-history/src/history-editor.ts`
- Modify: `../slate-v2/packages/slate-history/src/with-history.ts`
- Modify: `../slate-v2/packages/slate-history/test/index.spec.ts`
- Create: `../slate-v2/packages/slate-history/test/history-contract.ts`
- Modify: `../slate-v2/packages/slate-hyperscript/src/index.ts`
- Modify: `../slate-v2/packages/slate-hyperscript/src/hyperscript.ts`
- Modify: `../slate-v2/packages/slate-hyperscript/src/creators.ts`
- Modify: `../slate-v2/packages/slate-hyperscript/test/index.spec.ts`
- Modify: `docs/slate-v2/ledgers/slate-history-api.md`

**Approach:**
- Build support-package work from `both`, `legacy-only keep-now`, and
  `draft-only keep-now` rows in their corpora.
- For `slate-history`, keep legacy undo/redo semantics where they still belong,
  but also preserve draft history/transaction contract coverage where it
  expresses intended v2 batching behavior.
- For `slate-hyperscript`, keep fixture and runtime parity as contract, not as
  incidental Bun-loader luck.

**Execution note:** Import characterization coverage before changing support-package source; do not patch support packages around unresolved `slate` drift.

**Patterns to follow:**
- `../slate-v2/packages/slate-history/test/index.spec.ts`
- `../slate-v2/packages/slate-hyperscript/test/index.spec.ts`

**Test scenarios:**
- Happy path: legacy history rows for undo/redo, `History.isHistory`, and kept
  cursor/selection restore behavior pass.
- Happy path: draft history rows around transaction-owned batches and undo unit
  grouping pass where classified `keep-now`.
- Edge case: contiguous vs non-contiguous text undo, mixed transaction batches,
  and history reset semantics remain explicit.
- Integration: hyperscript fixture parsing and selection/cursor construction
  keep matching the kept legacy and draft fixture rows.

**Verification:**
- Support packages no longer rely on stale assumptions about `slate` internals,
  and their kept rows are green under the merged corpus.

- [ ] **Unit 6: Recover `slate-dom`, `slate-react`, and Example/Browser Parity from the Same Corpus**

**Goal:** Finish the runtime and user-facing surfaces using the merged corpus so example and browser proof close real product parity instead of dressing up partial core recovery.

**Requirements:** R1, R2, R3, R5, R6, R7

**Dependencies:** Units 2, 3, 4, 5

**Files:**
- Modify: `../slate-v2/packages/slate-dom/src/index.ts`
- Modify: `../slate-v2/packages/slate-dom/src/plugin/dom-editor.ts`
- Modify: `../slate-v2/packages/slate-dom/src/plugin/with-dom.ts`
- Create: `../slate-v2/packages/slate-dom/test/bridge.ts`
- Create: `../slate-v2/packages/slate-dom/test/clipboard-boundary.ts`
- Modify: `../slate-v2/packages/slate-react/src/index.ts`
- Modify: `../slate-v2/packages/slate-react/src/plugin/react-editor.ts`
- Modify: `../slate-v2/packages/slate-react/src/plugin/with-react.ts`
- Modify: `../slate-v2/packages/slate-react/src/components/editable.tsx`
- Modify: `../slate-v2/packages/slate-react/test/bun/editable.spec.tsx`
- Modify: `../slate-v2/packages/slate-react/test/react-editor.test.tsx`
- Modify: `../slate-v2/packages/slate-react/test/use-selected.test.tsx`
- Modify: `../slate-v2/site/examples/ts/check-lists.tsx`
- Modify: `../slate-v2/site/examples/ts/code-highlighting.tsx`
- Modify: `../slate-v2/site/examples/ts/custom-placeholder.tsx`
- Modify: `../slate-v2/site/examples/ts/editable-voids.tsx`
- Modify: `../slate-v2/site/examples/ts/images.tsx`
- Modify: `../slate-v2/site/examples/ts/markdown-preview.tsx`
- Modify: `../slate-v2/site/examples/ts/markdown-shortcuts.tsx`
- Modify: `../slate-v2/site/examples/ts/paste-html.tsx`
- Modify: `../slate-v2/site/examples/ts/plaintext.tsx`
- Modify: `../slate-v2/site/examples/ts/read-only.tsx`
- Modify: `../slate-v2/site/examples/ts/richtext.tsx`
- Modify: `../slate-v2/site/examples/ts/scroll-into-view.tsx`
- Modify: `../slate-v2/site/examples/ts/shadow-dom.tsx`
- Modify: `../slate-v2/site/examples/ts/styling.tsx`
- Modify: `../slate-v2/site/examples/ts/tables.tsx`
- Modify: `../slate-v2/playwright/integration/examples/check-lists.test.ts`
- Modify: `../slate-v2/playwright/integration/examples/code-highlighting.test.ts`
- Modify: `../slate-v2/playwright/integration/examples/custom-placeholder.test.ts`
- Modify: `../slate-v2/playwright/integration/examples/editable-voids.test.ts`
- Modify: `../slate-v2/playwright/integration/examples/images.test.ts`
- Modify: `../slate-v2/playwright/integration/examples/markdown-preview.test.ts`
- Modify: `../slate-v2/playwright/integration/examples/markdown-shortcuts.test.ts`
- Modify: `../slate-v2/playwright/integration/examples/paste-html.test.ts`
- Modify: `../slate-v2/playwright/integration/examples/plaintext.test.ts`
- Modify: `../slate-v2/playwright/integration/examples/read-only.test.ts`
- Modify: `../slate-v2/playwright/integration/examples/richtext.test.ts`
- Modify: `../slate-v2/playwright/integration/examples/select.test.ts`
- Modify: `../slate-v2/playwright/integration/examples/shadow-dom.test.ts`
- Modify: `../slate-v2/playwright/integration/examples/styling.test.ts`
- Modify: `../slate-v2/playwright/integration/examples/tables.test.ts`
- Modify: `docs/slate-v2/ledgers/example-parity-matrix.md`
- Modify: `docs/slate-v2/ledgers/slate-react-api.md`

**Approach:**
- Keep same-path/source-close pressure high for examples and user-facing docs.
- Use the merged corpus to classify each example row as:
  `recovered`, `mixed`, `extended`, `explicit-cut`, or `open`.
- Preserve draft runtime/browser proof rows when they cover intended v2 value
  not represented in legacy examples.
- Do not let browser proof close source drift by itself, but do require browser
  proof before claiming user-facing parity.

**Execution note:** Characterization-first for examples and browser rows; same-path source recovery first, then browser proof, then docs/ledger sync.

**Patterns to follow:**
- `docs/slate-v2-draft/ledgers/example-parity-matrix.md`
- current same-path example and Playwright file layout

**Test scenarios:**
- Happy path: same-path legacy examples and Playwright rows classified
  `keep-now` behave like legacy on the recovered current runtime.
- Edge case: rewritten examples with draft-only intended behavior are labeled
  `extended` and still have explicit proof for the new behavior.
- Error path: rows still outside the kept claim remain `open`, `explicit-cut`,
  or `post-RC` instead of being silently softened.
- Integration: browser/example proof, package APIs, example source parity, and
  example matrix status all agree for each recovered family.

**Verification:**
- The example/browser lane becomes a real parity lane instead of a mixture of
  current-only green tests and vague source drift.

- [ ] **Unit 7: Final RC Reconciliation from the Merged Corpus**

**Goal:** Reconcile readiness, roadmaps, proof ledgers, and maintainer context only after the merged corpus has driven package and example recovery.

**Requirements:** R6, R7

**Dependencies:** Units 1 through 6

**Files:**
- Modify: `docs/slate-v2/master-roadmap.md`
- Modify: `docs/slate-v2/release-readiness-decision.md`
- Modify: `docs/slate-v2/true-slate-rc-proof-ledger.md`
- Modify: `docs/slate-v2/release-file-review-ledger.md`
- Modify: `docs/slate-v2/references/pr-description.md`
- Modify: `docs/slate-v2/overview.md`

**Approach:**
- Update the active claim only from completed merged-corpus rows.
- Remove any remaining stale wording that overstates parity from helper
  presence, source similarity, or narrow browser proof.
- Keep `post-RC` rows named and bounded instead of hiding them under “future
  improvements.”

**Patterns to follow:**
- The strict owner separation in the current control docs

**Verification:**
- Roadmap, readiness, proof ledger, file ledger, and maintainer drift register
  all describe the same kept/cut/deferred truth.

## System-Wide Impact

- **Interaction graph:** This plan changes the control relationship between
  exact ledgers, API ledgers, proof owners, examples, browser lanes, and core
  package implementation units. Docs stop being passive summaries and become
  synchronized outputs of one merged corpus.
- **Error propagation:** Misclassified rows are the primary failure mode. A bad
  row status will now poison code, docs, and readiness all at once, which is
  why the corpus layer must be explicit before more implementation.
- **State lifecycle risks:** Current helpers, current docs, and current
  examples may all be rewritten to satisfy kept rows. That is intentional and
  should not be mistaken for accidental churn.
- **API surface parity:** Every package public surface is affected; `slate`
  first, then support/runtime packages, then examples/browser proof.
- **Integration coverage:** Browser/example scenarios and package-level contract
  tests must stay separate but aligned. One cannot substitute for the other.
- **Unchanged invariants:** Package order remains `slate` ->
  `slate-history` -> `slate-hyperscript` -> `slate-dom` -> `slate-react`.
  Legacy remains the default truth. Draft remains a value bank, not the default
  shipped shape.

## Risks & Dependencies

| Risk | Mitigation |
|------|------------|
| The merged corpus becomes a dumping ground and stalls execution | Keep one corpus file per package, row statuses tight, and package order strict |
| Draft-only rows silently widen the public claim | Require explicit `draft-only keep-now` classification before any code import |
| Rewrite aversion leaves broken current internals in place | Make rewrites the default for `keep-now` rows that current code cannot satisfy |
| Browser/example green rows are used to fake core closure again | Keep core contract tests and browser/example proof as separate required lanes |
| Harness churn is mistaken for behavior parity | Separate harness-only rows from behavior rows in the corpus and ledgers |

## Documentation / Operational Notes

- The live control docs should only be rewritten after the merged corpus and
  doctrine are settled, then kept in sync after each package tranche.
- The old replan and audit docs remain useful references but should be
  explicitly marked as supporting rather than active doctrine where needed.
- This plan is intended to be the active planning artifact for the remaining
  migration program until a materially different doctrine is agreed.

## Sources & References

- Related plan: [2026-04-18-slate-v2-draft-full-doc-corpus-review.md](/Users/zbeyens/git/plate-2/docs/plans/2026-04-18-slate-v2-draft-full-doc-corpus-review.md)
- Related plan: [2026-04-18-slate-v2-lossless-remaining-work-replan.md](/Users/zbeyens/git/plate-2/docs/plans/2026-04-18-slate-v2-lossless-remaining-work-replan.md)
- Related plan: [2026-04-13-slate-v2-full-no-regression-story-plan.md](/Users/zbeyens/git/plate-2/docs/plans/2026-04-13-slate-v2-full-no-regression-story-plan.md)
- Related plan: [2026-04-13-slate-v2-exhaustive-api-contract-recovery-plan.md](/Users/zbeyens/git/plate-2/docs/plans/2026-04-13-slate-v2-exhaustive-api-contract-recovery-plan.md)
- Draft ledger: [legacy-slate-test-files.md](/Users/zbeyens/git/plate-2/docs/slate-v2-draft/ledgers/legacy-slate-test-files.md)
- Draft ledger: [example-parity-matrix.md](/Users/zbeyens/git/plate-2/docs/slate-v2-draft/ledgers/example-parity-matrix.md)
- Draft reference: [architecture-contract.md](/Users/zbeyens/git/plate-2/docs/slate-v2-draft/references/architecture-contract.md)
- Draft archive: [package-end-state-roadmap.md](/Users/zbeyens/git/plate-2/docs/slate-v2-draft/archive/package-end-state-roadmap.md)
