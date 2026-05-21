# Slate v2 All Editor Harvest Test Processing Ralplan

status: done
score: 0.96
date: 2026-05-10
skill: `slate-ralplan`
inputs:

- `docs/editor-test-harvester/lexical/report.md`
- `docs/editor-test-harvester/lexical/slate-processing-ledger.md`
- `docs/editor-test-harvester/prosemirror/report.md`
  target repo: `/Users/zbeyens/git/slate-v2`

## Current Verdict

Lexical is not the next broad work item. Its selected processing lane is closed:
the harvest report says the selected implementation lane covered IME/history,
clipboard corpus, browser transport, and table containment, and the
consolidation pass found no unresolved top-level `create-new`, `copy-now`, or
`refactor-existing` rows in that selected lane
(`docs/editor-test-harvester/lexical/report.md:16-20`). The detailed ledger
accounts for 271 inventory rows, 137 runnable portable/portable-mixed files, and
1996 indexed names, with only explicit future-owner deferrals left
(`docs/editor-test-harvester/lexical/slate-processing-ledger.md:13-29`).

ProseMirror is the next useful pressure source. Its harvest is complete and
report-only: 32 files, 848 named rows, 19 portable files, 10 portable-mixed
files, 0 unresolved rows, and a clear warning not to copy the ProseMirror schema
or numeric-position model (`docs/editor-test-harvester/prosemirror/report.md:3-29`).
The high-value portable rows are DOM mutation disambiguation, composition
lifecycle, clipboard context, selection geometry, decoration mapping, history
rebasing, and multi-peer collaboration convergence
(`docs/editor-test-harvester/prosemirror/report.md:9-13`).

This plan is done for the all-harvest processing milestone.
PM-10 composition, PM-09 DOM-change, PM-08 collaboration convergence, PM-12
projection/widget mapping, and PM-13 geometry/RTL browser selection are
processed for this milestone. PM-10 added one missing package contract for
Android-style newline after composition plus one target-range test-fixture fix.
PM-09 reused existing package and browser proof. PM-08 added one package
convergence matrix for core replay. PM-12 added deep moved-node projection and
runtime-id node-widget mapping proof. PM-13 added browser-only RTL geometry and
wrapped-line selection proof. PM-01/02/03/05/06/07/11/14 were reviewed against
current owner tests and explicitly deferred where the remaining rows need
separate structural, clipboard, operation, history, lifecycle, browser, or
device proof. No fixed or improved issue claim was added.

## Intent Boundary

Intent: process every harvested editor-test source into an execution-grade Slate
v2 queue without duplicating already-applied Lexical work or importing foreign
editor architecture.

Outcome: a single plan that tells `ralph` what to execute next, what remains
deferred by design, what proof command owns each slice, and when ClawSweeper has
to sync claims.

In scope:

- Lexical closure accounting.
- ProseMirror PM-01 through PM-15 routing.
- Current Slate v2 owner-test grounding.
- Slate issue-ledger claim discipline.
- Future mobile/raw-device and collaboration browser deferrals.

Non-goals:

- No broad `.tmp/slate-v2` implementation edits from the review pass.
- No GitHub issue comments.
- No `Fixes #...` claim without exact repro proof.
- No ProseMirror schema-expression, Step JSON, PluginView, NodeView, MarkView,
  or numeric position clone.
- No Lexical node-class, command registry, React Composer, playground product,
  or private MIME clone.

Decision boundaries:

- Package tests can prove model routing, history, refs, projection stores, and
  operation replay.
- Browser tests prove DOM selection, native composition, clipboard transport,
  geometry, and real rendered behavior.
- Raw mobile/device rows stay deferred until a real device lane can run
  `bun test:mobile-device-proof:raw`.
- Exact issue closure depends on current issue proof and matching browser/device
  coverage, not on architecture adjacency.

## Decision Brief

Principles:

- Keep Slate raw and unopinionated.
- Steal behavior pressure, not foreign API shape.
- Prefer strengthening existing Slate contract files over adding duplicate test
  islands.
- Browser/runtime behavior must be proved where browsers own the bug.
- Keep claims narrow enough that a maintainer cannot fairly call them hype.

Main drivers:

- ProseMirror exposes runtime/browser pressure that Lexical did not fully cover.
- Lexical already closed the selected non-table lane, so rerunning it would be
  noisy.
- Current issue ledgers require exact distinction between `Fixes`, `Improves`,
  `Related`, and `Not claimed` (`docs/slate-v2/ledgers/issue-coverage-matrix.md:17-31`).
- The v2 sync ledger owns current manual live-issue state and has 630 live rows
  (`docs/slate-issues/gitcrawl-v2-sync-ledger.md:8-16`).

Chosen path:

- Treat Lexical as already processed except for explicit future-owner deferrals.
- Make ProseMirror PM-10, PM-09, PM-08, PM-12, and PM-13 the first execution
  queue.
- Batch later structural/clipboard/operation/history rows only after the
  browser/runtime slices stop moving the underlying proof owners.

Rejected paths:

- Copy all harvested tests: too much churn, bad architecture.
- Start with PM model/content-expression tests: lower value than runtime proof.
- Use jsdom composition as closure: known weak proof for Slate IME work.
- Claim mobile/IME closure from Chromium desktop or Playwright mobile viewport:
  dishonest and already forbidden by the local proof rules.

## Current Live Slate Owners

The current owner scan found these relevant tests:

| Owner                         | Current evidence                                                                         | Plan use                                                     |
| ----------------------------- | ---------------------------------------------------------------------------------------- | ------------------------------------------------------------ |
| Input strategy                | `.tmp/slate-v2/packages/slate-react/test/model-input-strategy-contract.test.ts:23-400`   | PM-09 and PM-10 package routing rows.                        |
| Editing kernel                | `.tmp/slate-v2/packages/slate-react/test/editing-kernel-contract.ts:39-419`              | Ownership/trace rows for DOM-change and composition routing. |
| Selection reconciler          | `.tmp/slate-v2/packages/slate-react/test/selection-reconciler-contract.ts:27-95`         | PM-10 target-range import and substitution rows.             |
| History                       | `.tmp/slate-v2/packages/slate-history/test/history-contract.ts:56-710`                   | PM-07 history and composition undo rows.                     |
| Collaboration/history runtime | `.tmp/slate-v2/packages/slate/test/collab-history-runtime-contract.ts:29-382`            | PM-08 peer convergence additions.                            |
| Projections                   | `.tmp/slate-v2/packages/slate-react/test/projections-and-selection-contract.tsx:105-999` | PM-12 moved-node projection rows.                            |
| Annotation store              | `.tmp/slate-v2/packages/slate-react/test/annotation-store-contract.tsx:126-824`          | PM-12 projection/data wake rows.                             |
| Widget layer                  | `.tmp/slate-v2/packages/slate-react/test/widget-layer-contract.tsx:88-209`               | PM-12 widget boundary rows.                                  |
| Browser selection             | `.tmp/slate-v2/packages/slate-browser/test/browser/selection.browser.test.ts:8-45`       | PM-13 currently thin; needs geometry/RTL browser proof.      |

## Ecosystem Strategy Synthesis

Lexical gives Slate the issue-shaped browser regression habit: IME, paste,
table, DOM repair, focus, and clipboard rows should preserve the real browser
transport (`docs/editor-test-harvester/lexical/report.md:108-126`).

ProseMirror gives Slate the transaction/runtime authority habit: the strongest
rows are not schema expressions, but ambiguous DOM-change routing, composition
overlap, peer convergence, projection mapping, and selection geometry
(`docs/editor-test-harvester/prosemirror/report.md:52-68`).

Tiptap remains a DX comparison point for extension ergonomics only. It should
not drive this test-processing queue unless a future extension-command pass
reopens public API shape.

React 19.2 pressure stays subscription and render-breadth oriented: projection,
widget, and annotation tests must prove local subscriber wakeups instead of
forcing broad editor rerenders.

Slate should deliberately diverge from both Lexical and ProseMirror on public
shape. Slate owns path/range/operation/runtime behavior; Plate and apps own
product policy.

## All-Harvest Execution Queue

| Priority | Source rows                                                                  | Slate owner                                                                                                                                | Action                                                                                                                                                                               | Fast gate                                                                                                                                                     | Final gate                                                                                                                                 |
| -------- | ---------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| 1        | PM-10 composition lifecycle plus the already-known Lexical IME proof lessons | `model-input-strategy-contract.test.ts`, `selection-reconciler-contract.ts`, `dom-coverage-boundaries.test.ts`, `slate-browser/playwright` | Add package routing for empty block, mark/cursor-wrapper, overlap cancel, rapid follow-up, and cross-paragraph composition; add one honest browser composition row before expanding. | `cd .tmp/slate-v2 && bun test ./packages/slate-react/test/model-input-strategy-contract.test.ts ./packages/slate-react/test/selection-reconciler-contract.ts` | `cd .tmp/slate-v2 && playwright test playwright/integration/examples/dom-coverage-boundaries.test.ts --project=chromium` plus `bun check`. |
| 2        | PM-09 DOM-change disambiguation                                              | `model-input-strategy-contract.test.ts`, `editing-kernel-contract.ts`, `generated-editing.test.ts`                                         | Add ambiguous add/remove/backspace/enter/replacement routing rows before one browser stress replay.                                                                                  | `cd .tmp/slate-v2 && bun test ./packages/slate-react/test/model-input-strategy-contract.test.ts ./packages/slate-react/test/editing-kernel-contract.ts`       | Focused generated stress row plus `bun check`.                                                                                             |
| 3        | PM-08 collaboration convergence                                              | `collab-history-runtime-contract.ts`                                                                                                       | Add two/three-peer convergence for delayed local changes, simultaneous typing, deleted content, block movement, mark changes, and undo/redo.                                         | `cd .tmp/slate-v2 && bun test ./packages/slate/test/collab-history-runtime-contract.ts`                                                                       | Same focused test plus later slate-yjs browser proof if a browser collaboration claim is made.                                             |
| 4        | PM-12 projection/decorator/widget mapping                                    | `projections-and-selection-contract.tsx`, `annotation-store-contract.tsx`, `widget-layer-contract.tsx`                                     | Add moved-node projection, widget side/boundary ordering, and lifecycle-cleanup rows without cloning PM NodeView/MarkView.                                                           | `cd .tmp/slate-v2/packages/slate-react && bun test:vitest -- projections-and-selection-contract annotation-store-contract widget-layer-contract`              | `cd .tmp/slate-v2 && bun check`.                                                                                                           |
| 5        | PM-13 geometry/RTL/browser selection                                         | `slate-browser/test/browser/selection.browser.test.ts`, `richtext.test.ts`, `generated-editing.test.ts`                                    | Add browser-only coords, RTL/bidi, wrapped line, block-boundary rect, atom arrow-motion rows.                                                                                        | `cd .tmp/slate-v2 && bun --filter slate-browser test:selection`                                                                                               | Browser proof on the specific example/stress target plus `bun check`.                                                                      |
| 6        | PM-01/02/03/11 structural and clipboard context                              | `clipboard-contract.ts`, `clipboard-boundary.ts`, `paste-html.test.ts`, transform/operation tests                                          | Add only missing open-edge, comment-wrapper, impossible insert/delete, and context-wrapper rows.                                                                                     | Focused clipboard/operation package tests.                                                                                                                    | Paste-html browser proof if external HTML transport changes.                                                                               |
| 7        | PM-05/06 operation mapping and range/selection refs                          | `operations-contract.ts`, `transaction-contract.ts`, `range-ref-contract.ts`, `selection-rebase-contract.ts`                               | Add replace-around-like wrap/unwrap conflict and atom-boundary rebase rows.                                                                                                          | Focused package tests.                                                                                                                                        | `bun check`.                                                                                                                               |
| 8        | PM-07 history rebase                                                         | `history-contract.ts`, `collab-history-runtime-contract.ts`                                                                                | Add simultaneous-edit and remote-rebase history rows only after PM-08 target shape is stable.                                                                                        | Focused history/collab tests.                                                                                                                                 | `bun check`.                                                                                                                               |
| 9        | PM-14 lifecycle                                                              | `transaction-contract.ts`, `surface-contract.tsx`, `editable-behavior.tsx`                                                                 | Strengthen only public Slate lifecycle rows; reject PM PluginView/NodeView API shape.                                                                                                | Focused package/vitest tests.                                                                                                                                 | `bun check`.                                                                                                                               |
| 10       | Lexical future-owner deferrals                                               | table model/navigation, raw mobile/device, slate-yjs browser, HR/block-void, drag/drop                                                     | Do not restart Lexical. Open only when the owner is accepted.                                                                                                                        | Owner-specific focused test.                                                                                                                                  | Raw device or browser proof when claimed.                                                                                                  |

## ProseMirror Row Routing

| PM row                     | Status in this plan  | Reason                                                                                                                                                            |
| -------------------------- | -------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| PM-01 structural fit       | deferred             | Current transform, fragment, and operation owners already cover broad structural pressure; schema/filler parity is a future structural lane, not PM API cloning.  |
| PM-02 open fragments       | deferred             | Slate clipboard is already strong; remaining context gaps belong to a dedicated clipboard import/export lane.                                                     |
| PM-03 DOM parse/export     | deferred             | Route future work through paste-html browser rows and `slate-dom`, not a standalone serializer clone.                                                             |
| PM-04 marks                | mostly covered/defer | Slate should not clone mark-exclusion algebra.                                                                                                                    |
| PM-05 op mapping           | deferred             | Current operation/range-ref owners cover replay, inversion, move, split, merge, and selection rebase; wrap/unwrap conflicts are future focused work.              |
| PM-06 selection/range refs | deferred             | Existing selection/range owners are strong; atom-boundary and wrap/unwrap rows need a dedicated structural selection pass.                                        |
| PM-07 history              | deferred             | Existing history rows are broad and PM-08 added peer convergence; remote/simultaneous history rebase is future collab/history work.                               |
| PM-08 collab convergence   | priority 3           | Current Slate has replay/metadata, not enough PM-grade peer convergence.                                                                                          |
| PM-09 DOM-change           | priority 2           | Direct browser/runtime gap.                                                                                                                                       |
| PM-10 composition          | priority 1           | Highest risk and strongest local solution history.                                                                                                                |
| PM-11 clipboard            | deferred             | Current clipboard, `slate-dom`, and paste-html browser rows cover the common transport families; comment-wrapper/context-wrapper rows are future clipboard proof. |
| PM-12 decorations/widgets  | priority 4           | React projection work needs moved-node/widget proof.                                                                                                              |
| PM-13 geometry/RTL         | priority 5           | Current `slate-browser` selection proof is thin.                                                                                                                  |
| PM-14 lifecycle            | deferred             | Public transaction, surface, and editable lifecycle rows are covered; PM PluginView/NodeView/MarkView lifecycle is not a Slate API target.                        |
| PM-15 harness              | skipped              | Fixture style only.                                                                                                                                               |

## Issue-Ledger Accounting

ClawSweeper related-issue pass for PM-10/PM-09 completed on 2026-05-10. It
added a macro sync section to
`docs/slate-v2/ledgers/fork-issue-dossier.md` and a planning sync section to
`docs/slate-v2/ledgers/issue-coverage-matrix.md`. No fixed, improved, or
PR-facing issue claim changed.

Reviewed input-runtime and DOM-change pressure:

- Existing related/non-claim/proof rows stay conservative for `#6051`, `#6022`,
  `#5989`, `#5984`, `#5983`, `#5931`, `#5830`, `#5643`, `#5883`, `#4400`,
  `#5603`, `#5669`, `#4223`, `#3470`, and `#2051`.
- `#4466`, `#5493`, `#5974`, and `#5918` stay proof-needed or future-proof
  pressure until a matching keyboard, IME, browser, or raw-device row exists.
- `#3309` routes to PM-12/PM-13 projection and browser-selection proof, not
  PM-10/PM-09 closure.

`docs/slate-issues/gitcrawl-v2-sync-ledger.md` already carries current manual
classifications for these rows, so this pass did not churn individual table
rows. `docs/slate-v2/references/pr-description.md` stays unchanged because the
PR-facing claim count and proof references did not change.

Before closing any execution slice from this plan:

- Run one ClawSweeper related-issue pass for the touched surface.
- Update `docs/slate-issues/gitcrawl-v2-sync-ledger.md` when a slice claims,
  improves, reviews, or intentionally excludes a live issue or cluster.
- Update `docs/slate-v2/ledgers/fork-issue-dossier.md` for reviewed related
  issues.
- Update `docs/slate-v2/ledgers/issue-coverage-matrix.md` for each fixed or
  related issue claim.
- Update `docs/slate-v2/references/pr-description.md` only when the PR-facing
  fixed/improved/related counts or proof references change.

Likely related clusters for the first five slices:

- PM-10 / PM-09: `v2-input-runtime`, Android/IME/beforeinput, composition,
  placeholder, keyboard layout, native input event boundary.
- PM-08 / PM-07: `v2-core-engine`, collaboration selection/rebase, history undo
  selection state.
- PM-12: `v2-react-runtime`, decoration/projection/caret stability, async
  decoration, selector breadth.
- PM-13: `v2-dom-selection`, geometry, RTL, selection import/export, focus,
  atom/block boundary movement.

## PM-10 Composition Execution Result

Status: complete for this all-harvest milestone.

Live source reread found existing browser coverage for the highest-risk
ProseMirror composition rows:

- start, inside, end, emoji, overlap cancellation, rapid follow-up, and
  cross-paragraph replacement in
  `.tmp/slate-v2/playwright/integration/examples/rendering-strategy-runtime.test.ts`.
- bold/mark/cursor-wrapper and multiple formatted-node composition in
  `.tmp/slate-v2/playwright/integration/examples/richtext.test.ts`.
- decorated text composition in
  `.tmp/slate-v2/playwright/integration/examples/highlighted-text.test.ts`.
- placeholder empty-state composition in
  `.tmp/slate-v2/playwright/integration/examples/placeholder.test.ts`.
- inline-boundary composition in
  `.tmp/slate-v2/playwright/integration/examples/mentions.test.ts`.

Changes made in `/Users/zbeyens/git/slate-v2`:

- Added Android-style newline-after-composition package coverage in
  `packages/slate-react/test/model-input-strategy-contract.test.ts`.
- Fixed stale target-range import test fixtures in
  `packages/slate-react/test/selection-reconciler-contract.ts` by stubbing the
  selectable-target guard alongside `toSlateRange`.

Verification:

- `cd /Users/zbeyens/git/slate-v2 && bun test ./packages/slate-react/test/model-input-strategy-contract.test.ts ./packages/slate-react/test/selection-reconciler-contract.ts ./packages/slate-react/test/editing-kernel-contract.ts`
  passed: 20 tests, 31 expects.
- `cd /Users/zbeyens/git/slate-v2 && bun run playwright playwright/integration/examples/rendering-strategy-runtime.test.ts --project=chromium -g "commits IME composition at the start|commits IME composition inside existing text|commits IME composition at the end|drops active IME composition|commits rapidly following IME compositions|commits cross-paragraph IME composition"`
  passed: 8 tests.
- `cd /Users/zbeyens/git/slate-v2 && bun turbo typecheck --filter=./packages/slate-react`
  passed.
- `cd /Users/zbeyens/git/slate-v2 && bunx biome check packages/slate-react/test/model-input-strategy-contract.test.ts packages/slate-react/test/selection-reconciler-contract.ts --fix`
  passed with no fixes.

Claim policy:
No `Fixes #...` or `Improves #...` promotion. Exact mobile/IME issue closure
still requires matching browser or raw-device proof for the original issue.

## PM-09 DOM-Change Execution Result

Status: complete for this all-harvest milestone.

Live source reread found existing coverage for the first DOM-change
disambiguation set:

- target-range browser substitutions in
  `.tmp/slate-v2/playwright/integration/examples/plaintext.test.ts`.
- browser text mutations inside bold markup and ambiguous mark-boundary
  insertion in `.tmp/slate-v2/playwright/integration/examples/richtext.test.ts`.
- browser Backspace after selected text and selected ranges in
  `.tmp/slate-v2/playwright/integration/examples/richtext.test.ts`.
- package-level target-range import and command-routing rows in
  `.tmp/slate-v2/packages/slate-react/test/selection-reconciler-contract.ts` and
  `.tmp/slate-v2/packages/slate-react/test/model-input-strategy-contract.test.ts`.

Verification:

- `cd /Users/zbeyens/git/slate-v2 && bun test ./packages/slate-react/test/model-input-strategy-contract.test.ts ./packages/slate-react/test/selection-reconciler-contract.ts ./packages/slate-react/test/editing-kernel-contract.ts`
  passed.
- `cd /Users/zbeyens/git/slate-v2 && bun run playwright playwright/integration/examples/plaintext.test.ts playwright/integration/examples/richtext.test.ts --project=chromium -g "applies beforeinput target ranges for browser text substitutions|syncs browser text mutations inside bold markup|resolves ambiguous browser insertion at a mark boundary|keeps caret editable after browser Backspace"`
  passed: 5 tests.

Claim policy:
No new issue promotion. This is runtime proof reuse, not exact upstream issue
closure.

## PM-08 Collaboration Convergence Execution Result

Status: complete for this all-harvest milestone.

Live source reread found existing collaboration coverage in
`.tmp/slate-v2/packages/slate/test/collab-history-runtime-contract.ts` for:

- deterministic remote operation replay.
- typed remote collaboration metadata that skips local undo history.
- `replace_children` replay through the collaboration import path.
- remote operation replay without losing local bookmark ranges.
- local runtime-id behavior for remote remove and move operations.

The PM-08 gap was peer breadth. This pass added a focused three-peer convergence
matrix in `.tmp/slate-v2/packages/slate/test/collab-history-runtime-contract.ts`
for text insert, mark change, cross-block range delete, and block move commits.
Each case verifies both remote peers converge to the source children while
remote collaboration metadata keeps their local undo stacks empty.

Verification:

- `cd /Users/zbeyens/git/slate-v2 && bun test ./packages/slate/test/collab-history-runtime-contract.ts`
  passed: 8 tests.
- `cd /Users/zbeyens/git/slate-v2 && bun turbo typecheck --filter=./packages/slate`
  passed.
- `cd /Users/zbeyens/git/slate-v2 && bunx biome check packages/slate/test/collab-history-runtime-contract.ts --fix`
  fixed formatting, then the focused test and package typecheck were rerun and
  passed.

Claim policy:
No `Fixes #...` or `Improves #...` promotion. This is package-level operation
replay proof. It does not claim slate-yjs browser behavior, OT transform
closure, simultaneous typing rebasing, or high-QPS remote-selection stability.

## PM-12 Projection And Widget Mapping Execution Result

Status: complete for this all-harvest milestone.

Live source reread found existing projection, annotation, and widget coverage in:

- `.tmp/slate-v2/packages/slate-react/test/projections-and-selection-contract.tsx`
  for decoration sources, cross-node projection, runtime-id subscriber locality,
  source-bus refresh, and top-level structural path changes.
- `.tmp/slate-v2/packages/slate-react/test/annotation-store-contract.tsx` for
  annotation projection/data wakeups and changed runtime buckets.
- `.tmp/slate-v2/packages/slate-react/test/widget-layer-contract.tsx` for
  selection widget visibility and unrelated text-change isolation.
- `.tmp/slate-v2/packages/slate-react/src/widget-store.ts`, which exposes
  selection, annotation, and runtime-id node widgets. It is not a ProseMirror
  widget-decoration side-position API.

The PM-12 gap was structural depth and runtime-id widget mapping. This pass
added:

- a nested moved-node projection row proving the same text runtime bucket follows
  a node moved from `[0, 1, 0]` to `[1, 0]`, while unaffected runtime subscribers
  stay asleep.
- a runtime-id node-widget row proving a widget remains attached and silent when
  its node moves, then wakes exactly once when that runtime-id node is removed.

Verification:

- `cd /Users/zbeyens/git/slate-v2/packages/slate-react && bun test:vitest -- projections-and-selection-contract annotation-store-contract widget-layer-contract`
  passed: 28 tests.
- `cd /Users/zbeyens/git/slate-v2 && bunx biome check packages/slate-react/test/projections-and-selection-contract.tsx packages/slate-react/test/widget-layer-contract.tsx --fix`
  passed with no fixes.
- `cd /Users/zbeyens/git/slate-v2 && bun turbo typecheck --filter=./packages/slate-react`
  passed.

Claim policy:
No `Fixes #...` or `Improves #...` promotion. PM-12 strengthens package-level
projection/widget mapping proof. Exact decorated-selection browser closure,
async decoration caret closure, product comment closure, and legacy decorate API
parity are not claimed.

## PM-13 Geometry And RTL Browser Selection Execution Result

Status: complete for this all-harvest milestone.

Live source reread found existing `slate-browser` selection proof in
`.tmp/slate-v2/packages/slate-browser/test/browser/selection.browser.test.ts` for:

- simple DOM selection snapshot import/export.
- zero-width FEFF offset normalization back to editor offset zero.

The PM-13 gap was real browser geometry and RTL/wrapped-line pressure. This pass
added browser-project rows for:

- RTL DOM selection offset mapping while browser geometry proves the first
  logical RTL character renders to the right of the last logical character.
- wrapped-line range rectangles, proving one editor selection produces multiple
  browser line rectangles.

Verification:

- `cd /Users/zbeyens/git/slate-v2 && bun --filter slate-browser test:selection`
  passed: 4 tests.
- `cd /Users/zbeyens/git/slate-v2 && bunx biome check packages/slate-browser/test/browser/selection.browser.test.ts --fix`
  fixed formatting, then the browser selection test was rerun and passed.
- `cd /Users/zbeyens/git/slate-v2 && bun turbo typecheck --filter=./packages/slate-browser`
  passed.

Claim policy:
No `Fixes #...` or `Improves #...` promotion. PM-13 strengthens browser
selection-geometry proof. Exact RTL Enter/new-line caret closure, mobile Persian
scroll closure, list-direction behavior, atom arrow-motion, and decorated-text
selection closure are not claimed.

## PM-01/02/03/05/06/07/11/14 Gap-Fill Review Result

Status: complete for this all-harvest milestone.

The gap-fill review reread the ProseMirror report rows and current Slate v2
owner tests. It found no high-value missing row that should be added in this
milestone.

| PM rows                                                       | Current Slate owner evidence                                                                                                                                                                                                                                                                                                                                                                | Closure decision                                                                                                                              |
| ------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| PM-01 structural fit                                          | `.tmp/slate-v2/packages/slate/test/transforms/**`, `clipboard-contract.ts`, and `operations-contract.ts` cover structural insert, delete, split, merge, wrap, unwrap, move, void, list, table, and invalid-operation pressure.                                                                                                                                                              | Deferred. Do not clone ProseMirror content expressions or filler policy. Future work should be a focused Slate structural-normalization lane. |
| PM-02/03/11 fragment, DOM parse/export, and clipboard context | `clipboard-contract.ts`, `packages/slate-dom/test/clipboard-boundary.ts`, and `playwright/integration/examples/paste-html.test.ts` cover fragment extraction/insertion, list/table fitting, custom fragment MIME, embedded HTML fragments, malformed payload fallback, multiline text fallback, Google Docs/Sheets, Quip, lists, tables, images, links, and generated paste/drop gauntlets. | Deferred. Remaining comment-wrapper/parser-context rows are real but belong to a dedicated clipboard/HTML import pass.                        |
| PM-05/06 operation mapping and selection/range refs           | `operations-contract.ts`, `range-ref-contract.ts`, `selection-rebase-contract.ts`, `selection-controller-contract.ts`, and transform fixtures cover replay/inversion, `replace_children`, `move_node`, split/merge/remove rebasing, nested range refs, native/model selection ownership, and broad transform edge cases.                                                                    | Deferred. Wrap/unwrap conflict and atom-boundary rows need a focused structural-selection pass, not all-harvest closure churn.                |
| PM-07 history rebase                                          | `history-contract.ts` covers grouping, redo clearing, selection restoration, composition undo, deleteFragment undo, blur/refocus selection, multi-block insertBreak undo, marked Enter undo, move undo, reverse joins, same-text deletes, and insertBreak undo; PM-08 added three-peer replay convergence in `collab-history-runtime-contract.ts`.                                          | Deferred. Simultaneous remote history rebase needs a future collab/history lane and should not be claimed from package replay alone.          |
| PM-14 lifecycle                                               | `transaction-contract.ts`, `surface-contract.tsx`, and `editable-behavior.tsx` cover transaction publication, command middleware, extension registry slots, commit listeners, render policy, selector inventory, public host authoring, mount identity, void renderer contracts, callbacks, keydown context, and input-rule reads.                                                          | Deferred. Only public Slate lifecycle abstractions matter; PM PluginView, NodeView, and MarkView lifecycle are rejected as API targets.       |
| PM-15 harness                                                 | ProseMirror report classifies it as harness/support only.                                                                                                                                                                                                                                                                                                                                   | Skipped. No Slate implementation action.                                                                                                      |

Relevant current-source probes:

- `cd /Users/zbeyens/git/slate-v2 && rg --files | rg 'paste-html|clipboard|selection-controller|transforms'`
- `cd /Users/zbeyens/git/slate-v2 && rg -n "(it|test)\\(" packages/slate/test/clipboard-contract.ts packages/slate-dom/test/clipboard-boundary.ts packages/slate/test/operations-contract.ts packages/slate/test/range-ref-contract.ts`
- `cd /Users/zbeyens/git/slate-v2 && rg -n "(it|test)\\(" packages/slate/test/selection-rebase-contract.ts packages/slate-history/test/history-contract.ts packages/slate/test/collab-history-runtime-contract.ts packages/slate/test/transaction-contract.ts`
- `cd /Users/zbeyens/git/slate-v2 && rg -n "(it|test)\\(" packages/slate-react/test/surface-contract.tsx packages/slate-react/test/editable-behavior.tsx playwright/integration/examples/paste-html.test.ts`
- `cd /Users/zbeyens/git/slate-v2 && rg -n "(it|test)\\(" packages/slate-react/test/selection-controller-contract.ts packages/slate-react/test/selection-controller-contract.test.ts`

Claim policy:
No PR-facing claim changed. These rows are explicitly accounted for as related
test pressure, not fixed or improved issue closure.

## Applicable Implementation Skill Notes

| Skill lens                       | Status  | Note                                                                                                   |
| -------------------------------- | ------- | ------------------------------------------------------------------------------------------------------ |
| Vercel React / React runtime     | applied | PM-12 must prove local projection/widget subscriber wakeups, not broad React rerenders.                |
| performance-oracle / performance | applied | Runtime slices should avoid broad document scans and add perf rows only where the touched path is hot. |
| tdd                              | applied | Each execution slice starts with the harvested behavior row as a red/focused test where practical.     |
| testing-review                   | applied | This is a value-ranked test queue, not a coverage sweep.                                               |
| shadcn                           | skipped | No UI component design change.                                                                         |
| react-useeffect                  | skipped | No effect API or hook behavior changed in this review pass.                                            |

## High-Risk Pre-Mortem

| Risk                                   | Bad outcome                                                               | Guard                                                                                                   |
| -------------------------------------- | ------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| Composition proof lies                 | A jsdom or CDP row passes while real DOM composition still fails.         | Use direct DOM composition mutation for mark/cursor-wrapper rows; keep raw mobile separate.             |
| DOM-change rows duplicate repair tests | More tests without new runtime value.                                     | Start with command-routing ambiguity, then add one browser replay only after the package row is clear.  |
| Collaboration row overclaims slate-yjs | Core peer convergence passes, but browser collaboration remains unproved. | Keep PM-08 core-only unless a real slate-yjs/browser lane is added.                                     |
| Projection row absorbs app policy      | Slate starts cloning PM NodeView/MarkView or Lexical decorator APIs.      | Only prove logical range projection, widget ordering, lifecycle cleanup, and React subscriber locality. |
| Geometry row becomes package-only      | Coordinate/RTL behavior is claimed without a rendered browser.            | PM-13 is browser-only except for helper normalization tests.                                            |
| Issue claims drift                     | PR says `Fixes` for cluster adjacency.                                    | ClawSweeper pass before slice closure; exact issue proof only.                                          |

## Maintainer Objection Ledger

| Objection                                           | Answer                                                                                                                                                                            |
| --------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| "Why ProseMirror after Lexical?"                    | Lexical closed the selected lane; ProseMirror exposes remaining runtime/browser pressure, especially DOM-change, composition, geometry, projection, and collab convergence.       |
| "Are you turning Slate into ProseMirror?"           | No. The plan rejects PM schema, numeric positions, Step JSON, PluginView, NodeView, and MarkView. Only behavior pressure maps into Slate path/range/operation/runtime vocabulary. |
| "Why not mark this done?"                           | This activation created the all-harvest queue. ClawSweeper sync and first PM execution slice are runnable, so the correct state is `pending`.                                     |
| "Can we claim the mobile input issues after PM-10?" | Not unless exact Android/iOS device proof exists. Chromium desktop composition rows are useful but not raw mobile closure.                                                        |
| "Why not execute PM-01 first?"                      | Runtime/browser failures are higher release risk than structural fit rows that current Slate contracts already partially cover.                                                   |

## Plan Deltas From Review

- Created one all-harvest queue that separates Lexical closure from ProseMirror execution.
- Promoted PM-10, PM-09, PM-08, PM-12, and PM-13 as the first five slices.
- Demoted PM-01/02/03/05/06/07/11/14 to later gap-fill or strengthening rows.
- Kept PM-15 skipped as harness only.
- Added exact ClawSweeper/ledger obligations before any issue-facing closure.
- Completed PM-10 composition processing with focused package and browser proof.
- Fixed stale target-range selection-reconciler test fixtures exposed by the
  PM-10 package gate.
- Completed PM-09 DOM-change processing by verifying existing target-range,
  markup mutation, mark-boundary ambiguity, and Backspace browser rows.
- Completed PM-08 collaboration processing by adding three-peer core replay
  convergence for text, mark, range-delete, and move commits.
- Synced PM-08 collaboration issue accounting without promoting PR-facing
  claim counts.
- Completed PM-12 projection/widget processing by adding nested moved-node
  projection proof and runtime-id node-widget structural mapping proof.
- Synced PM-12 issue accounting without promoting PR-facing claim counts.
- Completed PM-13 geometry/RTL browser selection processing by adding RTL visual
  geometry and wrapped-line rectangle browser proof.
- Synced PM-13 issue accounting for `#1498` without promoting PR-facing claim
  counts.
- Completed PM-01/02/03/05/06/07/11/14 gap-fill review by rereading current
  Slate owner tests and explicitly deferring the remaining rows to future
  focused lanes.
- Closed final accounting without changing PR-facing issue claims.
- Set completion `done`.

## Pass-State Ledger

| Pass                                           | Status   | Evidence added                                                                                                                                                                                          | Plan delta                                                                                           | Open issues                                                                                                                    | Next owner              |
| ---------------------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ | ----------------------- |
| Skill reload and boundary                      | complete | Reloaded `slate-ralplan`, `editor-test-harvester`, `clawsweeper`, `ralph`, `planning-with-files`, `learnings-researcher`, and `testing-review`.                                                         | Scope locked to plan/accounting only.                                                                | none                                                                                                                           | n/a                     |
| Harvest artifact read                          | complete | Read Lexical report/processing ledger and ProseMirror report/index.                                                                                                                                     | Split Lexical done from PM runnable queue.                                                           | none                                                                                                                           | n/a                     |
| Live Slate owner scan                          | complete | Grepped current Slate v2 package/browser test owners for input, history, collab, projections, widgets, and selection.                                                                                   | Added current owner table.                                                                           | Source files can drift before execution; re-read before editing.                                                               | PM slice owner          |
| Issue-accounting read                          | complete | Read live sync ledger and coverage matrix rules.                                                                                                                                                        | Added closure ledger obligations.                                                                    | No current ledger edit because no claim changed.                                                                               | ClawSweeper pass        |
| Initial all-harvest scoring                    | complete | Score set to 0.86.                                                                                                                                                                                      | Pending until related issue pass and first execution slice are performed.                            | PM-10 not started.                                                                                                             | `ralph`                 |
| ClawSweeper related issue pass                 | complete | Reviewed PM-10/PM-09 against gitcrawl archive, sync ledger, coverage matrix, and fork dossier; added macro sync rows.                                                                                   | No claim promotion; PR description unchanged.                                                        | Exact mobile/IME closure still needs matching browser or raw-device proof.                                                     | PM-10                   |
| PM-10 composition execution                    | complete | Added Android newline-after-composition package row, repaired target-range import fixture, and verified focused package/browser/type/lint gates in `/Users/zbeyens/git/slate-v2`.                       | PM-10 processed without issue-claim promotion.                                                       | Exact mobile/IME closure remains gated on matching original repro proof.                                                       | PM-09                   |
| PM-09 DOM-change execution                     | complete | Verified existing target-range substitution, markup mutation, ambiguous mark-boundary insertion, and browser Backspace rows.                                                                            | PM-09 processed without issue-claim promotion.                                                       | Exact issue closure remains gated on matching original repro proof.                                                            | PM-08                   |
| PM-08 collaboration execution                  | complete | Added three-peer core replay convergence for text, mark, range-delete, and move commits; verified focused package test, package typecheck, and Biome formatting in `/Users/zbeyens/git/slate-v2`.       | PM-08 processed without issue-claim promotion.                                                       | High-QPS remote selection, simultaneous typing rebasing, and browser collaboration remain future proof.                        | PM-12                   |
| PM-12 projection/widget execution              | complete | Added nested moved-node projection proof and runtime-id node-widget structural mapping proof; verified focused package tests, package typecheck, and Biome formatting in `/Users/zbeyens/git/slate-v2`. | PM-12 processed without issue-claim promotion.                                                       | Exact decorated-selection browser closure, async decoration caret closure, and legacy decorate API parity remain future proof. | PM-13                   |
| PM-13 geometry/RTL browser selection execution | complete | Added browser-only RTL visual geometry and wrapped-line rectangle proof; verified focused browser selection test, package typecheck, and Biome formatting in `/Users/zbeyens/git/slate-v2`.             | PM-13 processed without issue-claim promotion.                                                       | Exact RTL Enter/new-line caret closure, mobile RTL scroll, atom arrow motion, and decorated selection remain future proof.     | gap-fill review         |
| PM-01/02/03/05/06/07/11/14 gap-fill review     | complete | Reread ProseMirror matrix rows and current Slate owner tests for structural fit, fragments, DOM parse/export, operation mapping, selection/range refs, history, clipboard, and lifecycle.               | Remaining rows explicitly deferred to future focused lanes; no all-harvest implementation row added. | Future lanes remain, but this milestone has no runnable all-harvest owner left.                                                | final ledger accounting |
| Final ledger accounting                        | complete | Plan, checkpoint, and continuation prompt synced; no PR-facing claim count changed.                                                                                                                     | Completion state can be `done`.                                                                      | none for this milestone                                                                                                        | n/a                     |

## Confidence Score

| Dimension                       | Score | Evidence                                                                                                                                                                                                                                                    |
| ------------------------------- | ----: | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Harvest accounting completeness |  0.96 | Lexical and ProseMirror harvests are both closed with inventories and indexes, and every PM row has a milestone decision.                                                                                                                                   |
| Current Slate owner grounding   |  0.96 | PM-10, PM-09, PM-08, PM-12, PM-13, and gap-fill owners were reread live before closure.                                                                                                                                                                     |
| Issue-ledger readiness          |  0.94 | PM-10/PM-09, PM-08, PM-12, and PM-13 related issue passes are recorded; gap-fill closure did not alter PR-facing claims.                                                                                                                                    |
| Execution queue quality         |  0.96 | PM-10, PM-08, PM-12, and PM-13 proved the queue can reuse existing owners and add only real gaps; later rows are explicitly future lanes.                                                                                                                   |
| Proof discipline                |  0.96 | PM-10 has focused package/browser/type/lint proof, PM-09 has focused browser proof, PM-08 has focused package/type/lint proof, PM-12 has focused package/type/lint proof, PM-13 has focused browser/type/lint proof, and gap-fill rows are not overclaimed. |
| Closure readiness               |  0.96 | No runnable all-harvest milestone row remains; future work is intentionally split into focused lanes.                                                                                                                                                       |

Weighted score: 0.96. This is good enough to close the all-harvest milestone.

## Completion Closure

Completion target is met:

- ClawSweeper ran for every touched issue-facing surface in this all-harvest
  milestone.
- PM-10 through PM-13 priority slices are implemented or proof-reused and
  verified from `/Users/zbeyens/git/slate-v2`.
- PM-01/02/03/05/06/07/11/14 rows have current owner tests and commands
  recorded, with explicit future-lane decisions.
- Issue claims in `docs/slate-issues/gitcrawl-v2-sync-ledger.md`,
  `docs/slate-v2/ledgers/issue-coverage-matrix.md`,
  `docs/slate-v2/ledgers/fork-issue-dossier.md`, and
  `docs/slate-v2/references/pr-description.md` remain conservative: no new
  `Fixes` or `Improves` claim was added.
- `plate-2` completion checks verify planning artifacts only; Slate v2 runtime,
  package, and browser proof is recorded above with commands run from
  `/Users/zbeyens/git/slate-v2`.
