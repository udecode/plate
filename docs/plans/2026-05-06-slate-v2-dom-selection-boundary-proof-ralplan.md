---
date: 2026-05-06
topic: slate-v2-dom-selection-boundary-proof
status: done
score: 0.96
completion: .tmp/completion-checks/slate-v2-dom-selection-boundary-proof-ralplan.md
---

# Slate v2 DOM Selection Boundary Proof Ralplan

## 1. Current Verdict

Next cluster: `v2-dom-selection`.

The next implementation slice should not chase Android IME, virtualization, or
another clipboard fast path. The highest-leverage browser-replayable gap is
central DOM selection import/export around tables, inline boundaries, voids,
triple-click hanging ranges, nested editors, and outside-editor selections.

Do the strict runtime bridge first. Do not add a public `normalizePoint` API.

## 2. Intent And Boundary Record

Intent:

- Turn the largest issue cluster, selection/focus/DOM bridge, from
  architecture pressure into replayable browser proof.

Desired outcome:

- Slate v2 has one selection bridge that imports native selection, exports model
  selection, and fails closed with a reason instead of throwing raw
  `Cannot resolve ...` errors in the runtime path.

In scope:

- `slate-dom` selection import/export result objects.
- `slate-react` selection reconciler/runtime integration.
- Browser scenario rows for table edge navigation, inline/void boundaries,
  triple-click hanging block ranges, outside-editor drag/import, and nested
  editor containment.
- Issue-ledger sync for exact fixed, improved, related, and not-claimed rows.

Non-goals:

- No Android/iOS device closure without raw device proof.
- No public `normalizePoint` extension point.
- No app-rendered arbitrary DOM support.
- No new product-level Plate selection UX.
- No virtualization convergence.

Decision boundaries:

- The implementation may add internal DOM selection capability names.
- The implementation may migrate runtime callsites away from raw throwing
  `toSlatePoint` / `toSlateRange`.
- Public DOM helper names should not be expanded unless a test proves internal
  capability-only design is insufficient.

Unresolved user-decision points:

- None for planning. User review is still required before `ralph` executes.

## 3. Decision Brief

Principles:

- Selection import/export has one owner.
- Runtime paths must prefer typed failure over exceptions.
- Browser replay beats architecture confidence.
- Slate core stays model-first and unopinionated.
- Mobile claims need device proof, not desktop emulation.

Top drivers:

- Issue corpus: selection/focus/DOM bridge is the biggest raw cluster at `172`
  issues; `118` of those are runtime-boundary owned.
- Live source: `DOMEditorCapability` still exposes direct `toSlatePoint` /
  `toSlateRange` primitives, while `selection-reconciler` owns separate
  collapsed/select-all fallback logic.
- Browser contracts already have first-party rows for inline void, block void,
  table boundary, and toolbar/mouse selection, but not enough exact issue rows
  for the open DOM-selection cluster.

Viable options:

| Option                                                   | Pros                                         | Cons                                                  | Verdict |
| -------------------------------------------------------- | -------------------------------------------- | ----------------------------------------------------- | ------- |
| A. Patch each failing example                            | Fast per bug                                 | Recreates legacy selection whack-a-mole               | reject  |
| B. Add public `normalizePoint`                           | Gives apps an escape hatch                   | Leaks browser DOM policy into app code; hard to prove | reject  |
| C. Central internal selection bridge with result objects | One owner, typed failures, browser-proofable | Requires callsite migration and more contracts        | choose  |
| D. Copy ProseMirror view model                           | Proven DOM bridge discipline                 | Too schema/view-heavy for Slate's model               | partial |

Chosen option:

- Add a central internal DOM selection bridge and route `slate-react` runtime
  through it. Keep raw strict `toSlatePoint` / `toSlateRange` for low-level
  exact helpers, but runtime event paths should consume non-throwing result
  objects with failure reasons.

Consequences:

- Some previously thrown runtime errors become repair/fail-closed traces.
- Exact issue claims are allowed only when a browser row replays the original
  behavior.
- Mobile rows stay `Related` until real device proof exists.

Follow-ups:

- Android IME proof lane after this bridge is stable.
- Public helper docs only after internal bridge naming survives the tests.

## 4. Confidence Scorecard

| Dimension                              | Score | Evidence                                                                                                                                                                                                                               |
| -------------------------------------- | ----: | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| React 19.2 runtime performance         |  0.91 | Runtime bridge centralizes native listener/import work instead of widening React subscriptions; current selectionchange path is throttled and traced in `packages/slate-react/src/editable/runtime-selection-engine.ts`. |
| Slate-close unopinionated DX           |  0.94 | Rejects public `normalizePoint`; keeps app renderers out of DOM bridge policy.                                                                                                                                                         |
| Plate and slate-yjs migration backbone |  0.89 | Selection bridge emits model selections and reasoned traces; no Plate API or Yjs adapter promised.                                                                                                                                     |
| Regression-proof testing               |  0.95 | Existing browser contract registry has inline void, block void, and table rows; plan adds exact replay rows before any `Fixes` claim.                                                                                                  |
| Research evidence completeness         |  0.93 | Uses Lexical lifecycle tags and dirty selection state, ProseMirror view DOM selection ownership, Tiptap node-view event boundary as evidence, plus live Slate v2 source.                                                               |
| shadcn-style composability             |  0.91 | No product chrome; runtime result objects remain composable for examples and Plate.                                                                                                                                                    |

Total: `0.93`.

## 5. Source-Backed North Star

Current live source:

- `packages/slate-dom/src/plugin/dom-editor.ts:57` exposes
  `toDOMPoint`, `toDOMRange`, `toSlatePoint`, and `toSlateRange` as direct DOM
  capabilities.
- `packages/slate-react/src/editable/selection-reconciler.ts:46`
  has a separate collapsed DOM-selection importer and select-all fallback.
- `packages/slate-react/src/editable/runtime-selection-engine.ts:46`
  owns throttled native `selectionchange` handling and kernel traces.
- `packages/browser/test/core/scenario.test.ts:137` locks
  first-party parity families, including inline void and table boundary rows.

Target:

```txt
native selection event
  -> DOM selection bridge
  -> SelectionImportResult | SelectionExportResult
  -> selection controller policy
  -> model selection / repair trace / fail-closed reason
```

Raw runtime code should stop blindly calling strict DOM-to-Slate conversion in
places where the browser may hand us foreign, nested, void, table, or
temporarily stale DOM.

## 6. Ecosystem Strategy Synthesis

| System               | Source                                                                                                                                       | Mechanism                                                                           | Avoids                                               | Steal                                                                | Reject                                           | Slate target                                                                  | Verdict |
| -------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- | ---------------------------------------------------- | -------------------------------------------------------------------- | ------------------------------------------------ | ----------------------------------------------------------------------------- | ------- |
| Lexical              | `docs/research/sources/editor-architecture/lexical-read-update-extension-runtime.md`; `../lexical/packages/lexical/src/LexicalUpdateTags.ts` | Update tags for `skip-dom-selection`, focus, and composition; dirty selection state | DOM selection side effects leaking into every update | Commit/trace metadata for selection ownership and skip/repair policy | Class nodes and `$` API                          | Selection import/export records reason/policy in runtime trace                | partial |
| ProseMirror          | `docs/research/sources/editor-architecture/prosemirror-transaction-view-dom-runtime.md`                                                      | View owns `selectionFromDOM`, `selectionToDOM`, DOM observer, composition           | App commands reading DOM directly                    | One DOM selection bridge owner                                       | Integer document positions and schema-first core | `slate-dom` bridge owns DOM import/export, React consumes result              | agree   |
| Tiptap               | `../tiptap/packages/core/src/NodeView.ts`                                                                                                    | NodeView `stopEvent` / `ignoreMutation` boundaries over ProseMirror view            | Node views corrupting editor selection/mutations     | Boundary policy as product-extension pressure                        | ProseMirror NodeView as Slate API                | Runtime can classify internal/foreign DOM targets without exposing node views | partial |
| Slate v2 live source | `packages/slate-react/src/editable/selection-reconciler.ts`; `packages/slate-dom/src/plugin/dom-editor.ts`       | Split direct DOM helpers plus runtime fallback import                               | Some current crashes, but not enough issue proof     | Existing kernel trace and browser scenario infrastructure            | Scattered fallback logic                         | Central result object bridge                                                  | revise  |

## 7. Public API Target

Status: `keep-private`.

- No new public `normalizePoint`.
- No public app-authored DOM selection policy.
- No public `DOMSelectionBridge` export in this slice.
- Keep strict helper behavior for direct low-level use.
- Runtime event paths use internal non-throwing result objects.

Candidate internal shape:

```ts
type DOMSelectionImportResult =
  | { type: "ok"; selection: Range | null; source: "native" | "fallback" }
  | { type: "ignored"; reason: "foreign-target" | "nested-editor" | "readonly" }
  | { type: "repair"; reason: "missing-dom" | "boundary" | "stale-dom" }
  | { type: "error"; reason: string };
```

This is not a final API proposal. It is the proof seam.

## 8. Internal Runtime Target

- Move collapsed selection fallback and select-all fallback behind one import
  bridge.
- Add explicit failure reasons for:
  - outside editor target;
  - nested editor target;
  - table non-cell structural DOM;
  - inline boundary padding / adjacent spacer target;
  - void boundary target;
  - stale or missing DOM;
  - DOM coverage boundary.
- Make selection controller consume result type, not exception control flow.
- Trace every non-`ok` decision through the existing kernel trace.
- Preserve strict `toSlatePoint` tests; add runtime tests proving it is no
  longer called blindly from selectionchange.

## 9. Hook / Component / Render DX Target

- No app renderer receives extra selection props.
- Void and inline examples should only prove behavior, not own policy.
- Existing browser examples become proof routes:
  - `mentions`: inline void boundary navigation.
  - `tables`: table edge arrow navigation.
  - `richtext`: triple-click + destructive edit.
  - nested/iframe route if needed for cross-root containment.

## 10. Plate Migration Backbone

Plate should get a cleaner substrate:

- one internal bridge for native selection;
- reasoned traces for plugin/UI debugging;
- browser contracts for table, inline void, and toolbar selection;
- no need for Plate to wrap raw DOM conversion helpers.

No current Plate adapter compatibility is promised.

## 11. slate-yjs Migration Backbone

Collab relevance:

- Selection import/export must produce deterministic model selections or
  explicit ignored/repair states.
- No remote operation semantics change in this slice.
- Future awareness/cursor adapters can consume the same model selection and
  failure reason, but this plan does not implement slate-yjs support.

## 12. Issue-Ledger Accounting

ClawSweeper pass: `applied`.

Gitcrawl evidence:

- `gitcrawl doctor --json` green with `617` clusters and `659` open threads.
- `gitcrawl cluster-detail` reviewed clusters `1`, `5`, `12`, `17`, and `23`.
- Existing recluster map marks table selection, inline boundary, inline/void,
  mobile/browser selection quirks, triple-click, and DOM point crashes under
  `v2-dom-selection`.

Current issue matrix:

| Issue                      | Cluster                              | Claim       | Why                                                                                                                                                                                 | Proof route                                                            | Live ledger sync                                                                          | PR line             |
| -------------------------- | ------------------------------------ | ----------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- | ------------------- |
| #6034                      | table-selection-and-arrow-navigation | Fixes       | Exact table-end ArrowDown browser repro is covered: remove the trailing paragraph, keep the table as the last node, press ArrowDown at the last cell, then type.                    | `apps/www/tests/slate-browser/donor/examples/tables.test.ts`         | `fixes-claimed` in the fork ledger; live gitcrawl ledger remains upstream-current only    | fixed line allowed  |
| #5355                      | table-selection-and-arrow-navigation | Not claimed | Exact repro depends on `colgroup` / `col` renderer shapes that omit editable descendants; raw app-rendered missing DOM remains unsupported without a Slate-owned coverage boundary. | No exact browser row in this slice.                                    | keep `issue-reviewed` / `not-claimed`; live gitcrawl ledger remains upstream-current only | no fixed line       |
| #4658                      | table-selection-and-arrow-navigation | Improves    | Custom text outside table should fail closed, but exact custom table repro is not in scope.                                                                                         | DOM import unit + table browser row.                                   | keep related unless exact repro added                                                     | related matrix only |
| #3871                      | triple-click-and-block-selection     | Fixes       | Exact desktop browser triple-click proof imports the clicked richtext paragraph as one block range only.                                                                            | `apps/www/tests/slate-browser/donor/examples/richtext.test.ts`       | `fixes-claimed` in the fork ledger; live gitcrawl ledger remains upstream-current only    | fixed line allowed  |
| #5847                      | triple-click-and-block-selection     | Fixes       | Exact desktop browser triple-click + Backspace proof removes the selected block instead of emptying it.                                                                             | `apps/www/tests/slate-browser/donor/examples/richtext.test.ts`       | `fixes-claimed` in the fork ledger; live gitcrawl ledger remains upstream-current only    | fixed line allowed  |
| #3991                      | inline-void-and-void-selection       | Fixes       | Exact block-void Backspace browser repro is covered: empty paragraph after the void is removed and the void is selected instead of deleted.                                         | `apps/www/tests/slate-browser/donor/examples/images.test.ts`         | `fixes-claimed` in the fork ledger; live gitcrawl ledger remains upstream-current only    | fixed line allowed  |
| #4301                      | inline-void-and-void-selection       | Fixes       | Exact clicked-selected block-void Enter repro is covered: Enter inserts an editable paragraph after the void.                                                                       | `apps/www/tests/slate-browser/donor/examples/images.test.ts`         | `fixes-claimed` in the fork ledger; live gitcrawl ledger remains upstream-current only    | fixed line allowed  |
| #4074                      | inline-boundary-cursor-movement      | Fixes       | Exact Chromium browser row proves text can be inserted at an editable inline edge without being pushed outside the inline.                                                          | `apps/www/tests/slate-browser/donor/examples/inlines.test.ts`        | `fixes-claimed` in the fork ledger; live gitcrawl ledger remains upstream-current only    | fixed line allowed  |
| #4618                      | inline-boundary-cursor-movement      | Not claimed | Public `normalizePoint` is rejected; bridge policy is the answer.                                                                                                                   | Plan decision.                                                         | existing `cluster-synced`                                                                 | related matrix only |
| #3429                      | inline-boundary-cursor-movement      | Fixes       | Exact Chromium browser row proves the caret target before a padded editable inline stays outside the padded inline.                                                                 | `apps/www/tests/slate-browser/donor/examples/inlines.test.ts`        | `fixes-claimed` in the fork ledger; live gitcrawl ledger remains upstream-current only    | fixed line allowed  |
| #3148                      | inline-boundary-cursor-movement      | Fixes       | Exact Chromium and WebKit browser rows prove inline-end and following-text-start selections stay distinct before text insertion.                                                    | `apps/www/tests/slate-browser/donor/examples/inlines.test.ts`        | `fixes-claimed` in the fork ledger; live gitcrawl ledger remains upstream-current only    | fixed line allowed  |
| #3150                      | inline-boundary-cursor-movement      | Related     | Tracker-like row; do not close.                                                                                                                                                     | None.                                                                  | existing `Related`                                                                        | related matrix only |
| #4564                      | dom-point-resolution-crashes         | Improves    | Programmatic removal stale-DOM crash class should fail closed, but exact repro not in this slice unless added.                                                                      | DOM unit + browser row optional.                                       | existing `Improves`                                                                       | related matrix only |
| #4789                      | dom-point-resolution-crashes         | Fixes       | Exact Chromium browser row creates a native selection that starts outside Slate and ends inside the editor, then verifies no DOM point crash and normal refocus usability.          | `apps/www/tests/slate-browser/donor/examples/richtext.test.ts`       | `fixes-claimed` in the fork ledger; live gitcrawl ledger remains upstream-current only    | fixed line allowed  |
| #4984                      | dom-point-resolution-crashes         | Fixes       | Exact Chromium browser row creates a parent-editor native selection that crosses into a nested editor, then verifies no DOM point crash and focused-editor input ownership.         | `apps/www/tests/slate-browser/donor/examples/editable-voids.test.ts` | `fixes-claimed` in the fork ledger; live gitcrawl ledger remains upstream-current only    | fixed line allowed  |
| #3723, #3834, #3836, #5711 | dom-point-resolution-crashes         | Related     | Same DOM import crash family; exact browser/device repro varies.                                                                                                                    | DOM bridge contracts.                                                  | existing `cluster-synced`                                                                 | related matrix only |
| #5183, #5391               | inline-void-and-void-selection       | Related     | Android/iOS keyboard/handle behavior requires device proof.                                                                                                                         | No desktop auto-close.                                                 | existing `Related`                                                                        | related matrix only |

Live ledger sync status:

- `docs/slate-issues/open-issues-ledger.md`,
  `docs/slate-v2/ledgers/issue-coverage-matrix.md`,
  `docs/slate-v2/ledgers/fork-issue-dossier.md`, and
  `docs/slate-v2/references/pr-description.md` are synced for #6034, #5355,
  #3871, #5847, #3991, #4301, #4074, #3148, #3429, #4618, #4789, and #4984.
- The live gitcrawl corpus files remain upstream-current discovery inputs, not
  fork-local claim ledgers.

PR description status:

- `pr-description` includes exact `Fixes #6034`, `Fixes #3871`,
  `Fixes #5847`, `Fixes #3991`, `Fixes #4301`, `Fixes #4074`,
  `Fixes #3148`, `Fixes #3429`, `Fixes #4789`, and `Fixes #4984` lines, with
  #5355 and #4618 intentionally omitted.

## 13. Legacy Regression Proof Matrix

| Family                     | Route                             | Required proof                                                                                            |
| -------------------------- | --------------------------------- | --------------------------------------------------------------------------------------------------------- |
| table edge ArrowDown       | `tables`                          | model and DOM selection agree at table-last-node boundary; no throw                                       |
| table colgroup/col         | `tables`                          | non-cell table DOM cannot resolve into invalid Slate point                                                |
| triple-click hanging range | `richtext`                        | triple-click range imports as intended block range; Backspace/Cut removes block as browser parity expects |
| inline void selection      | `mentions`                        | arrow keys enter/select/leave mention; Delete/Backspace deterministic                                     |
| block void selection       | `images` / `embeds`               | selection enters/leaves block void with no hidden-anchor gap                                              |
| outside-editor drag        | dedicated browser row             | foreign DOM point ignored/fail-closed; no model corruption                                                |
| nested editor boundary     | nested/iframe route               | parent cannot import child editor DOM point                                                               |
| zero-width fallback        | existing zero-width browser tests | no regression                                                                                             |

## 14. Browser Stress / Parity Strategy

Use generated browser scenario rows, not one-off manual examples.

Minimum execution gate:

```bash
bun test packages/slate-dom/test/bridge.test.ts \
  packages/slate-react/test/selection-controller-contract.test.ts \
  packages/slate-react/test/selection-reconciler-contract.ts

STRESS_FAMILIES=table-cell-boundary-navigation,inline-void-boundary-navigation,block-void-navigation,triple-click-block-selection \
PLAYWRIGHT_RETRIES=0 \
bunx playwright test playwright/stress/generated-editing.test.ts --project=chromium
```

Exact commands may need adjustment to current package scripts during execution.

## 15. Applicable Implementation-Skill Review Matrix

| Lens                          | Applicability | Findings                                                                     | Plan delta                                            |
| ----------------------------- | ------------- | ---------------------------------------------------------------------------- | ----------------------------------------------------- |
| `vercel-react-best-practices` | applied       | Runtime listener and selection import must stay outside broad React renders. | Use bridge result objects and existing kernel trace.  |
| `performance-oracle`          | applied       | Selection import must avoid full DOM/tree scans on every selectionchange.    | Require bounded lookup and no document-scan fallback. |
| `performance`                 | skipped       | No large repeated-unit performance claim in this slice.                      | Browser parity proof is the gate.                     |
| `tdd`                         | applied       | Behavior must start with red DOM/unit and browser rows.                      | Execution phase starts with failing contracts.        |
| `build-web-apps:shadcn`       | skipped       | No UI chrome.                                                                | None.                                                 |
| `react-useeffect`             | applied       | Selection listeners are external sync; effects must stay subscription-only.  | No derived state reset effects.                       |

## 16. High-Risk Deliberate Mode

Triggered: yes. This touches selection, focus, DOM repair, browser runtime, and
issue claims.

Pre-mortem:

1. Non-throwing bridge hides a real selection corruption bug.
2. Table/inline special cases leak product policy into raw Slate.
3. Browser proof passes on desktop but mobile issues are accidentally claimed.

Proof response:

- Every ignored/repair result must trace a reason.
- Exact `Fixes` claims require replayable browser row.
- Mobile rows stay related until raw device proof exists.

Blast radius:

- `packages/slate-dom/src/plugin/dom-editor.ts`
- `packages/slate-react/src/editable/selection-reconciler.ts`
- `packages/slate-react/src/editable/runtime-selection-engine.ts`
- `packages/browser/**`
- Issue ledgers and PR reference.

Rollback / hard-cut answer:

- This is worth doing because the current debt is scattered exception-driven
  selection repair. If the bridge result shape is wrong, keep the tests and
  revise the internal result naming, not the public API.

## 17. Hard Cuts And Rejected Alternatives

- Cut: public `normalizePoint` as the first answer to #4618.
- Cut: app renderer-owned DOM point repair.
- Cut: claiming mobile inline void issues from desktop browser proof.
- Cut: table-specific hacks inside examples.
- Cut: swallowing errors without trace reason.
- Keep: strict low-level `toSlatePoint` / `toSlateRange` for exact helper use.
- Keep: `DOMCoverage` as missing-DOM substrate when boundaries are involved.

## 18. Slate Maintainer Objection Ledger

| Change                                          | Pain                                      | Objection                              | Steelman antithesis                          | Tradeoff                     | Answer                                                                                   | Evidence                                   | Rejected alternative               | Migration                             | Docs/example                            | Proof                | Ecosystem                                                                  | Verdict |
| ----------------------------------------------- | ----------------------------------------- | -------------------------------------- | -------------------------------------------- | ---------------------------- | ---------------------------------------------------------------------------------------- | ------------------------------------------ | ---------------------------------- | ------------------------------------- | --------------------------------------- | -------------------- | -------------------------------------------------------------------------- | ------- |
| Internal result-object DOM selection bridge     | Runtime maintainers                       | "This sounds like hiding real errors." | Throwing exposes broken assumptions quickly. | More result plumbing.        | Runtime paths need policy; strict helpers can still throw in exact tests.                | DOM crash cluster and live strict helpers. | Catch-and-ignore exceptions.       | No public migration.                  | Browser scenario rows explain behavior. | Unit + browser rows. | Plate gets trace reasons; collab gets deterministic model selection/no-op. | keep    |
| Reject public `normalizePoint`                  | App authors needing custom caret behavior | "Apps need a hook."                    | A hook is flexible.                          | Less immediate app escape.   | First fix the raw selection bridge; public hooks without proof fossilize browser quirks. | #4618 cluster context.                     | Public one-off hook.               | Document no public API in this slice. | Inline examples prove default.          | Browser row.         | Plate can layer UX later.                                                  | keep    |
| Candidate fixed claims only after browser proof | PR narrative                              | "Why not claim the cluster?"           | The architecture clearly targets it.         | Slower issue count increase. | Exact issue closure without replay is bullshit.                                          | ClawSweeper rules.                         | Broad "Fixes DOM selection" claim. | N/A.                                  | Ledger matrix.                          | Browser rows.        | Maintainer-safe.                                                           | keep    |

## 19. Pass Schedule And Pass-State Ledger

| Pass                                                    | Status   | Evidence added                                                                                                                                                                                                                                                                      | Plan delta                                                                                                                                                       | Open issues                              | Next owner                                                                |
| ------------------------------------------------------- | -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------- | ------------------------------------------------------------------------- |
| current-state read                                      | complete | Live source, research, issue ledgers                                                                                                                                                                                                                                                | Selected `v2-dom-selection`                                                                                                                                      | none                                     | current pass                                                              |
| related issue discovery                                 | complete | Gitcrawl clusters 1, 5, 12, 17, 23                                                                                                                                                                                                                                                  | Issue matrix added                                                                                                                                               | exact Fixes pending proof                | current pass                                                              |
| intent/boundary brief                                   | complete | Sections 2-3                                                                                                                                                                                                                                                                        | Public API non-goals clarified                                                                                                                                   | none                                     | current pass                                                              |
| ecosystem synthesis                                     | complete | Section 6                                                                                                                                                                                                                                                                           | ProseMirror/Lexical/Tiptap decisions added                                                                                                                       | none                                     | current pass                                                              |
| high-risk / maintainer pass                             | complete | Sections 16-18                                                                                                                                                                                                                                                                      | Fixed-claim bar tightened                                                                                                                                        | none                                     | current pass                                                              |
| user review                                             | pending  | This plan                                                                                                                                                                                                                                                                           | User may approve `ralph` execution                                                                                                                               | not started                              | user                                                                      |
| #6034 table ArrowDown proof                             | complete | `apps/www/tests/slate-browser/donor/examples/tables.test.ts`; `packages/slate-dom/test/bridge.ts`; `gitcrawl threads ianstormtaylor/slate --numbers 6034 --include-closed --json`; focused table Playwright green                                                   | #6034 moved to `fixes-claimed`; non-exact DOM point offsets clamp to model text bounds.                                                                          | broader DOM-selection plan still pending | #5355 table colgroup/col proof                                            |
| #5355 colgroup/col proof                                | complete | `gitcrawl threads ianstormtaylor/slate --numbers 5355 --include-closed --json`; issue ledgers                                                                                                                                                                                       | Reclassified from candidate to `not-claimed`: raw app-rendered missing DOM stays unsupported without DOM coverage boundaries.                                    | broader DOM-selection plan still pending | triple-click block selection proof                                        |
| #3871/#5847 triple-click block selection proof          | complete | `gitcrawl threads ianstormtaylor/slate --numbers 3871,5847 --include-closed --json`; `apps/www/tests/slate-browser/donor/examples/richtext.test.ts`; focused richtext Playwright green                                                                                            | #3871 and #5847 moved to `fixes-claimed`; React destructive command handling recognizes full-block browser/hanging ranges.                                       | broader DOM-selection plan still pending | inline void selection proof                                               |
| #3991/#4301 block-void delete and Enter proof           | complete | `gitcrawl threads ianstormtaylor/slate --numbers 3991,4301 --include-closed --json`; `apps/www/tests/slate-browser/donor/examples/images.test.ts`; `packages/slate-react/src/editable/mutation-controller.ts`; focused images Playwright green                      | #3991 and #4301 moved to `fixes-claimed`; React model-owned mutation path handles block-void Backspace and Enter parity.                                         | broader DOM-selection plan still pending | inline boundary cursor movement proof                                     |
| #4074/#3148/#3429 inline boundary cursor movement proof | complete | `gitcrawl threads ianstormtaylor/slate --numbers 4074,3429,3148,4618 --include-closed --json`; `apps/www/tests/slate-browser/donor/examples/inlines.test.ts`; focused Chromium and WebKit Playwright rows green                                                                   | #4074, #3148, and #3429 moved to `fixes-claimed`; #4618 moved to `not-claimed` because public `normalizePoint` remains rejected.                                 | broader DOM-selection plan still pending | outside-editor and nested-editor DOM point proof                          |
| #4789/#4984 outside and nested editor DOM point proof   | complete | `gitcrawl threads ianstormtaylor/slate --numbers 4789,4984,4564,3723,3834,3836,5711 --include-closed --json`; `apps/www/tests/slate-browser/donor/examples/richtext.test.ts`; `apps/www/tests/slate-browser/donor/examples/editable-voids.test.ts`; focused Chromium rows green | #4789 and #4984 moved to `fixes-claimed`; #4564 remains `Improves`; #3723/#3834/#3836/#5711 remain related because exact repros differ or require iOS/IME proof. | broader DOM-selection plan still pending | remaining DOM point crash variants and full selection-family verification |

## 20. Plan Deltas From Review

- Added next cluster decision: `v2-dom-selection`.
- Dropped mobile IME as next executable slice.
- Dropped public `normalizePoint`.
- Strengthened exact issue claim bar.
- Added browser-first proof matrix.
- Preserved existing issue-ledger statuses until execution produces proof.

## 21. Open Questions And What Would Change The Decision

- If `selection-reconciler` already has a central result object hidden in live
  source, execution should harden that instead of adding a new one.
- If table rows already pass exact #6034/#5355 proof, execution should switch
  to ledger sync and missing browser rows only.
- If a public app hook is still required after central bridge proof, create a
  separate API bake-off; do not smuggle it into this slice.

## 22. Implementation Phases

### Phase 1: Red Contracts

Owner: `packages/slate-dom` and `packages/slate-react`.

- Add result-object tests for selection import/export.
- Add fail-closed tests for outside/nested/stale/missing DOM.
- Add table/inline/void/triple-click browser rows as failing contracts.

### Phase 2: Internal Bridge

Owner: `slate-dom`.

- Add internal DOM selection bridge capability.
- Preserve strict helper behavior.
- Add bounded lookup and reasoned failure results.

### Phase 3: Runtime Integration

Owner: `slate-react`.

- Route selectionchange and keydown selection import through the bridge.
- Record kernel traces for ignored/repair/error decisions.
- Remove duplicate fallback logic from reconciler callsites where the bridge
  owns it.

### Phase 4: Browser Proof

Owner: `slate-browser`.

- Run table, inline void, block void, triple-click, outside selection, and nested
  editor rows.
- Record exact issue claim outcomes.

### Phase 5: Ledger And PR Sync

Owner: `plate-2` docs.

- Update live ledger, issue coverage matrix, fork dossier, PR reference, and
  completion file.

## 23. Fast Driver Gates

- `bun test` focused DOM/react selection contract files.
- `bun --filter slate-dom typecheck`.
- `bun --filter slate-react typecheck`.
- `bun lint:fix`.
- Focused Playwright stress rows by family.
- `bun run completion-check` in `/Users/zbeyens/git/plate-2`.

## 24. Final User-Review Handoff Outline

When executed, report:

- fixed vs improved vs related issue rows;
- exact browser families passed;
- public API unchanged unless proof forces a change;
- strict helper behavior kept;
- mobile claims not made without device proof.

## 25. Final Completion Gates

Completion requires:

- all red contracts green;
- no runtime path blindly throws on known foreign/nested/table/inline/void DOM
  target classes;
- browser stress rows green;
- issue ledgers synced;
- PR description synced or explicitly unchanged;
- completion file `done`.
