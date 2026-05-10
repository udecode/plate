# Slate v2 ProseMirror Runtime Proof Slices Ralplan

status: done
score: 0.94
date: 2026-05-10
skill: `slate-ralplan`
target repo: `/Users/zbeyens/git/slate-v2`
current pass: `final-revalidation`
next pass: `none`
completion: `.tmp/completion-checks/slate-v2-prosemirror-runtime-proof-slices-ralplan.md`

## Current Verdict

This is a narrowed revalidation plan for the remaining raw ProseMirror-derived
runtime proof slices:

- PM-10 composition gauntlet
- PM-09 DOM-change disambiguation
- PM-08 collaboration convergence
- PM-12 projection/decorator raw mapping
- PM-13 geometry/RTL browser selection

The broad ProseMirror harvest is already complete. The all-editor and
remaining-harvest plans already closed the first execution wave, and the live
`../slate-v2` owner scan confirms that several rows are now covered directly.
So the next move is not "add all five again." The next move is a focused
ClawSweeper and live-source revalidation pass that classifies each row as:
already sufficient, needs one hardening row, or explicitly no-claim/defer.

This plan is done. The related issue pass, exact live-source row reads, and
focused Slate v2 owner tests all completed. No implementation row remains from
this ralplan, and no issue claim was promoted.

## Intent Boundary

Intent: convert the ProseMirror runtime/browser pressure rows into a precise
Slate v2 revalidation queue without duplicating already-landed proof.

Outcome: one executable plan that says which of the five PM rows still needs
work, which ones are already covered, and what issue claims must remain out of
the PR narrative.

In scope:

- The five raw Slate rows PM-08, PM-09, PM-10, PM-12, and PM-13.
- Live `../slate-v2` owner tests for input routing, editing kernel,
  collaboration, projection, widgets, annotations, and browser selection.
- Issue-ledger accounting before any fixed/improved claim changes.
- Plate-owned routing for ProseMirror PluginView/NodeView/MarkView leftovers.

Non-goals:

- No Slate v2 implementation edits in this planning pass.
- No one-for-one ProseMirror test copy.
- No ProseMirror schema-expression, Step JSON, numeric-position, PluginView,
  NodeView, or MarkView API clone.
- No mobile-device claim from desktop Chromium, Playwright mobile viewport, or
  synthetic package tests.
- No PR-facing `Fixes #...` claim without exact repro/root-cause/proof.

Decision boundaries:

- Package tests prove model routing, commit replay, projection stores, widget
  mapping, and operation/history behavior.
- Browser tests prove real DOM selection, native composition, geometry, and
  rendered behavior.
- Plate owns opinionated plugin/view authoring APIs and product policy.
- Raw Slate owns substrate behavior: paths/ranges, transactions, DOM import,
  projection mapping, browser selection, and history/collab runtime contracts.

## Decision Brief

Principles:

- Keep Slate raw and unopinionated.
- Steal ProseMirror's behavior pressure, not its public API shape.
- Strengthen existing owner tests before adding new test islands.
- Keep browser-owned behavior in browser proof.
- Keep issue claims narrower than the proof.

Drivers:

- `docs/editor-test-harvester/prosemirror/report.md` marks PM-08/09/10/12/13 as
  the highest-value raw runtime/browser rows.
- The ProseMirror inventory routes plugin/view API leftovers to Plate, not raw
  Slate.
- The all-editor harvest plan says the first PM-08/09/10/12/13 execution wave
  already happened.
- Live Slate v2 tests now contain direct rows for composition, three-peer
  convergence, moved-node projection, node widgets, annotation buckets, and RTL
  browser selection.

Chosen path:

- Run one issue-facing ClawSweeper revalidation for the five PM rows.
- Read the exact current live source ranges in `../slate-v2`.
- Only schedule hardening rows where the live tests still miss a ProseMirror
  invariant.
- Keep PM plugin/view authoring rows as Plate-owned unless reduced to a raw
  projection, widget, transaction, surface, or browser-selection invariant.

Rejected paths:

- Reopen the whole ProseMirror harvest. It is already closed at 0 unresolved
  rows.
- Pretend all five rows are still missing. Live Slate v2 proof contradicts that.
- Declare the queue fully closed without issue revalidation. That would blur
  coverage proof and issue-claim proof.
- Clone PM NodeView/PluginView APIs in raw Slate. Wrong layer.

Consequences:

- The next pass is mostly audit/classification, not code.
- If a hardening row remains, it should be one small focused test in the
  existing owner file, not a broad new harness.
- No PR reference count changes until the issue matrix proves exact claim
  changes.

## Current Live Slate Owners

Live-source probe:

```bash
rg -n "describe\(|it\(|test\(" ../slate-v2/packages/slate-react/test/model-input-strategy-contract.test.ts ../slate-v2/packages/slate-react/test/editing-kernel-contract.ts ../slate-v2/packages/slate-react/test/selection-reconciler-contract.ts ../slate-v2/packages/slate/test/collab-history-runtime-contract.ts ../slate-v2/packages/slate-react/test/projections-and-selection-contract.tsx ../slate-v2/packages/slate-react/test/annotation-store-contract.tsx ../slate-v2/packages/slate-react/test/widget-layer-contract.tsx ../slate-v2/packages/slate-browser/test/browser/selection.browser.test.ts ../slate-v2/playwright/integration/examples/dom-coverage-boundaries.test.ts ../slate-v2/playwright/stress/generated-editing.test.ts
```

| PM row | Current owner evidence | Initial classification |
| --- | --- | --- |
| PM-10 composition | `model-input-strategy-contract.test.ts:23-449`, `editing-kernel-contract.ts:276-314`, `selection-reconciler-contract.ts:27-98`, `dom-coverage-boundaries.test.ts:291`, `richtext.test.ts`, `rendering-strategy-runtime.test.ts` | Covered. Existing package and browser rows include replacement ranges, Android-style newline/backspace, expanded CJK composition, composition ownership, hidden-boundary IME, formatted/rich-text IME, overlap cancellation, rapid follow-up composition, and cross-paragraph replacement. |
| PM-09 DOM-change | `model-input-strategy-contract.test.ts:24-449`, `editing-kernel-contract.ts:138-419`, `generated-editing.test.ts:1261`, `richtext.test.ts:1159` | Covered. Ambiguous replacement, native repair target ranges, beforeinput command ownership, backspace, Enter split, DOM-selection refresh, and generated/browser stress ownership are represented. |
| PM-08 collab convergence | `collab-history-runtime-contract.ts:62-578`, especially three-peer convergence at `233`, range-delete replay at `352`, history rebase at `452`, bookmark rebase at `496`, and remote move/remove runtime target rows at `530` | Covered for raw Slate package convergence. Exact collaboration issue closure remains unclaimed where the issue needs high-QPS selection or first-party collaboration protocol proof. |
| PM-12 projection/widget mapping | `projections-and-selection-contract.tsx:105-1084`, `annotation-store-contract.tsx:126-824`, `widget-layer-contract.tsx:88-275` | Covered for raw projection, annotation, and widget mapping. Plate-owned NodeView/MarkView/PluginView lifecycle APIs stay out. |
| PM-13 geometry/RTL | `selection.browser.test.ts:8-128` has simple snapshots, FEFF normalization, RTL geometry direction, and wrapped-line rectangles | Covered for this ralplan's browser geometry/RTL slice. Atom arrow-motion and block-boundary rectangles can be future browser rows, but they are not a current hardening requirement. |

## Ecosystem Strategy Synthesis

| Source | Mechanism to steal | Shape to reject | Slate target |
| --- | --- | --- | --- |
| ProseMirror composition | Real DOM composition lifecycle pressure, especially mutations inside marked text and ambiguous browser-owned ranges | PM view abstraction and numeric positions | Input strategy, editing kernel, selection reconciler, browser composition rows |
| ProseMirror DOM-change | Ambiguous native mutations must route once to model command, repair, or DOM import | One-off DOM diff policy as public API | Model input strategy, editing-kernel traces, generated browser stress |
| ProseMirror collab | Peer convergence under delayed local/remote edits and rebased history | PM Step JSON and collab plugin API | Commit replay, remote metadata, history rebase, slate-yjs future browser proof |
| ProseMirror decorations | Projection/widget mapping through structural edits with local subscriber wakeups | NodeView/MarkView/PluginView lifecycle APIs in raw Slate | Projection store, annotation store, widget layer, Plate plugin backlog |
| ProseMirror selection geometry | Browser proof for RTL, wrapped lines, coordinates, and native selection import/export | PM coordinate helpers as Slate API | `slate-browser` selection snapshots and example/stress browser proof |

## Revalidation Queue

1. PM-10 composition:
   - Read the live rows around Android newline, expanded CJK replacement,
     composition lifecycle ownership, DOM coverage composition, and the two IME
     solution notes.
   - If any PM pressure is missing, add exactly one focused row to the existing
     package or browser owner. Browser rows must use honest DOM/native proof.
   - Fast gate: `cd ../slate-v2 && bun test ./packages/slate-react/test/model-input-strategy-contract.test.ts ./packages/slate-react/test/selection-reconciler-contract.ts`
   - Browser gate if changed: `cd ../slate-v2 && bun playwright test playwright/integration/examples/dom-coverage-boundaries.test.ts --project=chromium`

2. PM-09 DOM-change:
   - Read ambiguous replacement, Android backspace, Enter split, DOM selection
     refresh, and generated stress ownership.
   - If still thin, add one package routing row before touching browser stress.
   - Fast gate: `cd ../slate-v2 && bun test ./packages/slate-react/test/model-input-strategy-contract.test.ts ./packages/slate-react/test/editing-kernel-contract.ts`

3. PM-08 collaboration convergence:
   - Read the three-peer convergence and history rebase rows.
   - If PM's delayed-local or undo/redo peer case is not covered, add one small
     convergence row to `collab-history-runtime-contract.ts`.
   - Fast gate: `cd ../slate-v2 && bun test ./packages/slate/test/collab-history-runtime-contract.ts`

4. PM-12 projection/widget mapping:
   - Read moved-node projection, nested moved-node projection, runtime bucket,
     annotation bucket, node-widget move, and widget metrics rows.
   - If missing, add one hardening row only in the existing owner file.
   - Keep NodeView/MarkView/contentDOM/update/ignoreMutation/destroy/getPos as
     Plate-owned unless the row reduces to raw projection/widget behavior.
   - Fast gate: `cd ../slate-v2/packages/slate-react && bun test:vitest -- projections-and-selection-contract annotation-store-contract widget-layer-contract`

5. PM-13 geometry/RTL:
   - Read simple snapshot, FEFF zero-width, RTL geometry, and wrapped-line
     rectangle rows.
   - If missing, schedule atom arrow-motion or block-boundary rectangle as a
     browser-only future row.
   - Fast gate: `cd ../slate-v2 && bun --filter slate-browser test:selection`

## Issue-Ledger Accounting

ClawSweeper related-issue revalidation completed on 2026-05-10. No issue claim
changes were made.

Candidate buckets reviewed:

- Input/runtime and DOM-change: #6051, #6022, #5989, #5984, #5983, #5931,
  #5830, #5643, #5883, #4400, #5603, #5669, #4223, #3470, #2051, #4466, #5493,
  #5974, #5918.
- Projection and selection: #3309, #4477, #5689, #5582, #5559, #5551, #5550.
- Collaboration/history: #5771, #5533, #2288, #1770, #3741.
- Performance-adjacent projection/render breadth: #4210, #4141, #3656, only if
  the PM-12 proof changes runtime invalidation breadth.

Decision:

- Preserve the existing related/not-claimed/improves statuses in
  `docs/slate-issues/gitcrawl-v2-sync-ledger.md` and
  `docs/slate-v2/ledgers/issue-coverage-matrix.md`.
- Add only a fork-dossier audit section for this revalidation pass.
- Do not update `docs/slate-v2/references/pr-description.md`; no PR-facing
  claim counts or proof references changed.
- Do not promote Android, raw mobile/device, keyboard-layout, decorated-text
  browser selection, high-QPS collaboration, first-party collaboration protocol,
  or whole-document performance claims from these rows.

Final row classification:

| PM row | Final classification | Issue policy |
| --- | --- | --- |
| PM-10 | covered | Input/runtime issues stay related or proof-needed; no mobile/device promotion. |
| PM-09 | covered | DOM-change and beforeinput issues stay related unless exact native-event proof exists. |
| PM-08 | covered for raw package convergence | Collaboration issues stay related or unchanged improves; no slate-yjs/OT/browser closure. |
| PM-12 | covered for raw projection/widget mapping | Projection/comment issues keep existing improves/related statuses; Plate-owned lifecycle rows stay out. |
| PM-13 | covered for RTL/wrapped-line geometry | Browser-selection issues stay related; no atom/table/mobile closure. |

## Maintainer Objection Ledger

| Objection | Answer |
| --- | --- |
| "Didn't we already process ProseMirror?" | Yes. This is not a new harvest; it is a narrow revalidation of five runtime proof rows against current Slate v2 and issue claims. |
| "Why keep the plan pending if tests already exist?" | Because coverage proof and issue-claim proof are different. The ClawSweeper pass is still required before closure. |
| "Why not copy ProseMirror APIs for plugin/view lifecycle?" | Raw Slate should expose primitive behavior. Plate owns opinionated authoring/lifecycle ergonomics. |
| "Why not close mobile/IME from these rows?" | Desktop browser/package rows are not raw-device proof. Mobile/device claims need real Appium/Android/iOS artifacts. |

## Implementation-Skill Review Notes

| Skill/lens | Status | Reason |
| --- | --- | --- |
| `tdd` | applied as acceptance criteria | Any remaining row should be a focused test in the existing owner before implementation. |
| `performance-oracle` | applied as review lens | PM-12 must not broaden projection or widget invalidation; local subscriber wakeups matter. |
| `vercel-react-best-practices` | applied as review lens | Projection and widget React rows must avoid broad rerender pressure. |
| `shadcn` | skipped | No UI component or registry surface changes. |
| `react-useeffect` | skipped | No hook/effect implementation edits in this planning pass. |

## Research And Learnings Input

Read:

- `docs/editor-test-harvester/prosemirror/report.md`
- `docs/editor-test-harvester/prosemirror/inventory.md`
- `docs/plans/2026-05-10-slate-v2-all-editor-harvest-test-processing-ralplan.md`
- `docs/plans/2026-05-10-slate-v2-remaining-harvest-test-lanes-ralplan.md`
- `docs/solutions/developer-experience/2026-05-07-slate-browser-ime-proof-rows-need-honest-dom-composition.md`
- `docs/solutions/ui-bugs/2026-05-07-slate-react-ime-formatted-selection-needs-native-owned-cleanup.md`

Learning applied:

- For ProseMirror composition rows, translate the DOM-mutation contract first.
- Assert model text, DOM text, mark preservation, caret, and trace ownership for
  IME proofs.
- Do not upgrade CDP/native composition proof to mobile-device proof unless the
  insertion point and device lane are proved.

The generic `docs/solutions/patterns/critical-patterns.md` file was requested
by the learnings skill but does not exist in this repo.

## Confidence Score

| Dimension | Weight | Score | Reason |
| --- | ---: | ---: | --- |
| React 19.2 runtime performance | 0.20 | 0.87 | PM-12 has projection/widget owner rows, but issue/perf revalidation is pending. |
| Slate-close unopinionated DX | 0.15 | 0.91 | PM API cloning is rejected; Plate-owned rows are separated. |
| Plate/slate-yjs migration backbone | 0.15 | 0.86 | Collab substrate rows exist; browser/yjs adapter proof remains out of scope. |
| Regression-proof testing | 0.20 | 0.90 | Current live owner tests are strong, but exact row-by-row reads are pending. |
| Research evidence completeness | 0.15 | 0.89 | Harvest, prior plans, live source probes, and IME learnings are recorded. |
| Issue claim discipline | 0.15 | 0.94 | ClawSweeper revalidation completed and no claim promotion was made. |

Weighted score: 0.94.

## Verification

Fresh same-turn checks:

```bash
cd /Users/zbeyens/git/slate-v2
bun test ./packages/slate-react/test/model-input-strategy-contract.test.ts ./packages/slate-react/test/selection-reconciler-contract.ts ./packages/slate-react/test/editing-kernel-contract.ts
# 20 pass, 0 fail

bun test ./packages/slate/test/collab-history-runtime-contract.ts
# 9 pass, 0 fail

cd /Users/zbeyens/git/slate-v2/packages/slate-react
bun test:vitest -- projections-and-selection-contract annotation-store-contract widget-layer-contract
# 3 files passed, 28 tests passed

cd /Users/zbeyens/git/slate-v2
bun --filter slate-browser test:selection
# 1 file passed, 4 tests passed
```

## Pass-State Ledger

| Pass | Status | Evidence | Next owner |
| --- | --- | --- | --- |
| Skill reload | complete | Loaded `slate-ralplan`, `editor-test-harvester`, `clawsweeper`, `ralph`, `planning-with-files`, and `learnings-researcher`. | n/a |
| Current-state read and initial score | complete | Read ProseMirror harvest, current done plans, focused live `../slate-v2` owner probes, and IME learnings. | n/a |
| Related issue revalidation | complete | Existing ledgers already preserve conservative statuses; fork dossier audit section appended. | n/a |
| Exact live-source row reads | complete | Read package/browser owner rows for all five PM slices. | n/a |
| Hardening/no-op decision | complete | All five rows are covered or explicitly future-owned; no current hardening row remains. | n/a |
| Implementation prompt | complete | No implementation prompt needed. | n/a |

## Closure

No autonomous pass remains in this ralplan. Future work, if reopened, should be
a new owner-specific plan: raw mobile/device, decorated-text browser selection,
collaboration/browser adapter proof, atom arrow-motion, or Plate plugin/view
authoring.
