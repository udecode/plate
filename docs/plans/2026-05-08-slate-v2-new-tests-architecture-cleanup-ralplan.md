# Slate v2 New Tests Architecture Cleanup Ralplan

status: done
score: 0.94
date: 2026-05-08
target: `../slate-v2`
source plan: `docs/editor-test-harvester/lexical/report.md`
skill: `slate-ralplan`

## Current Verdict

Do not rewrite Slate v2 for this. The new Lexical-derived tests are a useful
pressure pass, and the selected lane is green, but the cleanup target is small:

1. Keep external HTML paste policy app-owned and move the growing parser out of
   the example component body.
2. Split boolean mark controls from style-only leaf attributes so examples stop
   repeating casts around `state.marks.get()`.
3. Keep table tests honest: current Slate v2 proves containment and cell
   selection, not Lexical's whole-table selection model.
4. Keep browser transport claims explicit: native clipboard, synthetic
   `ClipboardEvent`, semantic handles, and raw device proof are different
   claims.

The architecture is basically right. The current rough edge is example-local
typing and organization, not core/runtime design.

## Execution Update

Implemented the approved cleanup in `../slate-v2`:

- added `site/examples/ts/mark-utils.ts`;
- changed `site/examples/ts/custom-types.d.ts` so `CustomTextKey` is derived
  from boolean leaf fields and excludes style-only attrs like `fontSize`;
- removed repeated `state.marks.get()` casts from `richtext.tsx`,
  `iframe.tsx`, and `hovering-toolbar.tsx`;
- extracted paste HTML import/parser policy into
  `site/examples/ts/paste-html-import.ts`;
- kept `site/examples/ts/paste-html.tsx` focused on rendering and editor
  composition.

No core, runtime, public API, issue claim, or table-selection model changed.

## Intent Boundary Record

- intent: clean up the architecture exposed by the new harvested tests without
  losing the green proof.
- desired outcome: all harvested test rows stay green, the example code is
  easier to maintain, and Slate core remains unopinionated.
- in scope:
  - `../slate-v2/site/examples/ts/paste-html.tsx`
  - `../slate-v2/site/examples/ts/custom-types.d.ts`
  - repeated mark helpers in `richtext.tsx`, `iframe.tsx`, and
    `hovering-toolbar.tsx`
  - proof naming and verification commands around the new Playwright rows
- non-goals:
  - no core rich-HTML import API
  - no whole-table selection feature without a first-class table-selection model
  - no raw mobile claim without Appium/device artifacts
  - no ProseMirror/Lexical API cloning
- decision boundary: this plan may require example-local helper extraction and
  type cleanup; it must not move source-app paste policy into `slate`,
  `slate-dom`, or `slate-react`.
- unresolved user decision points: none for this cleanup. A future table
  selection model is a separate product/API decision.

Pressure test: if the fix starts adding Google Docs, Google Sheets, Word, or
table-selection policy to Slate core, it is going the wrong way.

## Decision Brief

Principles:

- Slate core owns model, operations, DOM/runtime boundaries, and extension
  points.
- Apps/examples own source-specific import policy.
- Browser proof must name the real transport.
- Tests should describe behavior, not Lexical internals.
- Small helper extraction beats a grand rewrite here.

Top drivers:

- The new tests are already green in the selected lane.
- `paste-html.tsx` now mixes UI, parser policy, transport handling, and leaf
  rendering.
- `CustomTextKey` now excludes `fontSize`, but callers still cast marks because
  boolean marks and style attributes share one broad leaf type.

Viable options:

| Option | Verdict | Why |
| --- | --- | --- |
| Leave as-is | reject | Green, but repeated casts and a swollen example file will keep getting worse as more source-app paste corpus rows land. |
| Move paste parsing to core | reject | This would make raw Slate opinionated about Google Docs/Sheets/Word policy. Bad trade. |
| Extract example-local helpers and split mark/style typing | choose | Keeps core clean, preserves proof, and removes the actual maintenance debt. |
| Build Lexical-style whole-table selection now | reject for this lane | Current tests do not prove that model and Slate v2 does not own it yet. |

Consequences:

- The next implementation should be boring: helper extraction plus type cleanup.
- No behavior should change.
- If any harvested test fails after the refactor, revert the refactor shape
  before touching runtime code.

## Live Source Evidence

| Surface | Current owner | Finding |
| --- | --- | --- |
| HTML paste parser | `../slate-v2/site/examples/ts/paste-html.tsx:32-231` | Element/text tag maps, font-size normalization, styled text import, fragment normalization, and `deserialize` live inside the component file. |
| Paste transport | `../slate-v2/site/examples/ts/paste-html.tsx:263-305` | `dom.clipboard.insertData` remains the right extension point; iOS plain-text prediction is app policy. |
| Paste leaf style | `../slate-v2/site/examples/ts/paste-html.tsx:406-434` | `fontSize` rendering is leaf style policy, not a toolbar mark. |
| Custom leaf type | `../slate-v2/site/examples/ts/custom-types.d.ts:161-177` | `CustomText` includes boolean marks plus `fontSize`; `CustomTextKey` excludes `fontSize`. |
| Mark casts | `../slate-v2/site/examples/ts/richtext.tsx:159-164`, `iframe.tsx:81-86`, `hovering-toolbar.tsx:62-67` | Three examples repeat the same cast around `state.marks.get()`. |
| Table containment proof | `../slate-v2/playwright/integration/examples/tables.test.ts:129-179` | Tests lock triple-click and drag containment without claiming whole-table selection. |
| Browser transport proof | `../slate-v2/playwright/integration/examples/plaintext.test.ts:23-77`, `editable-voids.test.ts:48-71` | `execCommand`, synthetic paste, and native input paste are intentionally separate rows. |
| IME helper | `../slate-v2/packages/slate-browser/src/playwright/ime.ts:22-95` | Synthetic composition clones the DOM range before mutation; native Chromium CDP remains the stronger path when available. |
| IME/history proof | `../slate-v2/playwright/stress/generated-editing.test.ts:1070-1179`, `../slate-v2/packages/slate-history/test/history-contract.ts:259-305` | Composition-adjacent rows and history unit rows exist and should stay unchanged. |

## Ecosystem Strategy Synthesis

| Source | Mechanism | Slate target | Verdict |
| --- | --- | --- | --- |
| Lexical harvested tests: `../lexical/packages/lexical-playground/__tests__/e2e/Composition.spec.mjs`, `History.spec.mjs`, `CopyAndPaste/*`, `Selection.spec.mjs`, `Extensions.spec.mjs` | Issue-shaped browser rows for IME, paste corpus, browser transport, and table selection. | Keep behavior rows, not Lexical node classes, commands, or table model. | partial |
| Lexical table package tests: `../lexical/packages/lexical-table/src/__tests__/unit/LexicalTableExtension.test.ts` | Dedicated table selection / nested-table policy. | Defer whole-table selection until Slate v2 owns a table-selection model. | diverge |
| ProseMirror composition tests: `../prosemirror/view/test/webtest-composition.ts:87-305` | Heavy composition matrix around marks, cursor wrappers, widgets, overlap, and cross-paragraph changes. | Keep growing browser/composition coverage while isolating runtime behavior from app paste policy. | agree |
| ProseMirror composition runtime: `../prosemirror/view/src/input.ts:435-565` | Runtime tracks active composition, Safari/Android quirks, pending DOM records, and composition node ownership. | Keep IME/runtime policy in `slate-react` / `slate-browser`, not in examples. | agree |
| ProseMirror clipboard tests: `../prosemirror/view/test/webtest-clipboard.ts:44-123` | External HTML parsing stays parser/schema-owned with transformation hooks. | Slate exposes capability hooks; app examples choose source-specific parsing. | partial |

## Public API Target

No public Slate API change for this cleanup.

Accepted target:

- `dom.clipboard.insertData` remains the app-owned rich paste extension point.
- `fontSize` stays a leaf attribute in the paste-html example.
- Boolean toolbar marks use an explicit example-local boolean mark type/helper.
- No whole-table selection public API is introduced by this lane.

Rejected target:

- `editor.clipboard` as a new public namespace.
- core `parseExternalHtmlFromGoogleDocsOrSheets`.
- Lexical-style `TableSelection` without a real Slate table-selection design.

## Internal Runtime Target

No runtime rewrite. The existing runtime tests are good because they isolate
transport classes:

- IME composition: stress rows plus `slate-browser` helper.
- Browser transport: plaintext and editable-void Playwright rows.
- Clipboard model boundary: `slate-dom` unit tests.
- App rich HTML policy: paste-html example Playwright rows.

The next implementation should avoid touching `slate-react` runtime unless a
test fails after pure helper extraction.

## Hook, Component, And Render DX Target

Implement a tiny example-local helper layer:

- `site/examples/ts/mark-utils.ts`
  - `type BooleanCustomTextKey = ...`
  - `toggleBooleanMark(editor, key)`
  - `isBooleanMarkActive(editor, key)`
- Replace repeated casts in richtext, iframe, and hovering-toolbar.
- Keep `fontSize` out of toolbar mark controls.

For paste HTML:

- Extract parser/policy helpers from `paste-html.tsx` into an example-local file,
  likely `site/examples/ts/paste-html-import.ts`.
- Keep rendering components in `paste-html.tsx`.
- Keep the parser narrow: safe schemes, basic tags, inline styles already
  covered by tests. No generic sanitizer engine.

## Plate And slate-yjs Migration Backbone

No new adapter work. The cleanup preserves the important migration shape:

- raw Slate remains unopinionated;
- app/plugin layers own rich import policy;
- history composition proof stays operation/transaction-level;
- transport proof remains browser/runtime-level.

This is friendly to Plate and slate-yjs because it does not bake product import
rules into the core substrate.

## Issue Ledger Accounting

ClawSweeper related-issue pass: skipped.

Reason: the implementation is a behavior-neutral helper extraction/type cleanup.
It does not change public API, runtime behavior, browser behavior, examples'
observable output, issue claims, or PR narrative. Existing issue-ledger rows and
PR references stay unchanged.

Known nearby issue refs from existing ledgers:

| Issue | Cluster | Claim | Why | Proof route | Live ledger sync | PR line |
| --- | --- | --- | --- | --- | --- | --- |
| #6034 | DOM selection / table edge | no new claim | Existing PR reference already claims ArrowDown-at-last-table-cell. This cleanup does not widen it. | existing table Playwright row | unchanged | unchanged |
| Mobile/IME macro rows | mobile/IME/input | no new claim | Current plan explicitly refuses raw mobile closure without device proof. | none in this cleanup | unchanged | unchanged |
| Clipboard corpus rows | clipboard/paste | no new claim | Existing clipboard execution lane already owns claims; helper extraction should be behavior-neutral. | existing unit/browser gates | unchanged | unchanged |

## Legacy Regression Proof Matrix

Required after implementation:

```bash
cd /Users/zbeyens/git/slate-v2
bunx playwright test playwright/integration/examples/paste-html.test.ts --project=chromium
bunx playwright test playwright/integration/examples/plaintext.test.ts --project=chromium
bunx playwright test playwright/integration/examples/plaintext.test.ts --project=firefox
bunx playwright test playwright/integration/examples/editable-voids.test.ts --project=chromium -g "keeps native paste inside editable void input"
bunx playwright test playwright/integration/examples/editable-voids.test.ts --project=firefox -g "keeps native paste inside editable void input"
PLAYWRIGHT_RETRIES=0 bunx playwright test playwright/integration/examples/tables.test.ts --project=chromium
STRESS_FAMILIES=ime-composition-inline-void-boundary,ime-composition-undo,paste-html-image-void PLAYWRIGHT_RETRIES=0 bunx playwright test playwright/stress/generated-editing.test.ts --project=chromium
bun check
```

Run Playwright commands sequentially. The Next webserver build can collide when
parallelized.

Fresh planning-pass verification, run from `/Users/zbeyens/git/slate-v2` on
2026-05-08:

| Command | Result |
| --- | --- |
| `bun check` | passed |
| `bunx playwright test playwright/integration/examples/paste-html.test.ts --project=chromium` | passed, 8 tests |
| `PLAYWRIGHT_RETRIES=0 bunx playwright test playwright/integration/examples/tables.test.ts --project=chromium` | passed, 9 tests |
| `bunx playwright test playwright/integration/examples/plaintext.test.ts --project=chromium` | passed, 3 tests |
| `bunx playwright test playwright/integration/examples/plaintext.test.ts --project=firefox` | passed, 2 tests, 1 expected skip for blocked synthetic clipboard data |
| `bunx playwright test playwright/integration/examples/editable-voids.test.ts --project=chromium -g "keeps native paste inside editable void input"` | passed, 1 test |
| `bunx playwright test playwright/integration/examples/editable-voids.test.ts --project=firefox -g "keeps native paste inside editable void input"` | passed, 1 test |
| `STRESS_FAMILIES=ime-composition-inline-void-boundary,ime-composition-undo,paste-html-image-void PLAYWRIGHT_RETRIES=0 bunx playwright test playwright/stress/generated-editing.test.ts --project=chromium` | passed, 3 tests |

These proved the current new-test lane was green before cleanup.

Fresh implementation verification, run from `/Users/zbeyens/git/slate-v2` after
cleanup:

| Command | Result |
| --- | --- |
| `bun check` | passed |
| `bunx playwright test playwright/integration/examples/paste-html.test.ts --project=chromium` | passed, 8 tests |
| `bunx playwright test playwright/integration/examples/richtext.test.ts --project=chromium -g "mark\|toolbar bold"` | passed, 12 tests |
| `bunx playwright test playwright/integration/examples/iframe.test.ts --project=chromium` | passed, 2 tests |
| `bunx playwright test playwright/integration/examples/hovering-toolbar.test.ts --project=chromium` | passed, 4 tests |

## Implementation Skill Review Matrix

| Lens | Status | Result |
| --- | --- | --- |
| intent-boundary-pass | applied | Scope is helper extraction/type cleanup; no runtime rewrite. |
| tdd | applied | Existing harvested tests are the behavior lock. This cleanup should not add new behavior tests unless a refactor exposes a gap. |
| vercel-react-best-practices | applied | Avoid new render subscriptions; helper extraction must keep selectors stable and no inline component churn. |
| performance-oracle | applied | Parser helpers are linear in DOM nodes; no new global caches or repeated DOM walks. |
| steelman-pass | applied | Strongest objection is that cleanup churn risks breaking green proof for little payoff. Chosen plan wins because it removes repeated casts and file bloat without behavior change. |
| high-risk-deliberate-pass | applied | Browser-sensitive proof exists; any runtime change is out of scope. |

## High-Risk Pre-Mortem

1. Parser extraction changes behavior by accident.
   - proof: full paste-html Chromium file plus stress image paste row.
2. Mark helper hides `fontSize` and breaks formatted paste.
   - proof: paste-html font-size row plus site typecheck.
3. Table tests get "improved" into false whole-table claims.
   - proof: keep table assertions as containment/cell-selection only.

Rollback answer: revert helper extraction first; do not patch runtime unless a
focused test proves runtime drift.

## Hard Cuts And Rejected Alternatives

- Drop: core rich HTML parser.
- Drop: generic sanitizer package in Slate core.
- Drop: whole-table selection in this lane.
- Drop: raw mobile closure from Playwright mobile viewport.
- Keep: current `dom.clipboard.insertData` capability shape.
- Keep: current `slate-browser` transport distinction.

## Maintainer Objection Ledger

| Objection | Answer | Verdict |
| --- | --- | --- |
| "Why touch green code?" | Because the green code introduced repeated casts and a swollen example parser. The fix is organization-only and test-locked. | keep |
| "Why not solve all table selection now?" | That is a new table model, not cleanup. Shipping fake proof would be worse. | keep defer |
| "Why not make paste HTML first-class?" | Slate should expose hooks; apps choose import policy. ProseMirror and Slate both support transformation/parser boundaries without hard-coding source apps. | keep |

## Pass-State Ledger

| Pass | Status | Evidence added | Plan delta | Open issues | Next owner |
| --- | --- | --- | --- | --- | --- |
| Current-state read and initial score | complete | Live source/test reads listed above; Lexical and ProseMirror evidence sampled; fresh `../slate-v2` `bun check` and focused browser rows passed. | Created cleanup plan; chose helper extraction over rewrite. | none | implementation |
| Related issue discovery | complete | Existing nearby refs identified only. | Skipped ClawSweeper because implementation stayed behavior-neutral and claim-neutral. | none | none |
| Issue ledger pass | complete | No claim/API/runtime/browser behavior changed. | Ledgers unchanged by design. | none | none |
| Implementation cleanup | complete | Mark helper extraction and paste-html parser helper extraction landed in `../slate-v2`. | Removed repeated casts and shrank `paste-html.tsx`. | none | verification |
| Closure score | complete | `bun check`, paste-html, richtext mark, iframe, and hovering-toolbar Playwright rows passed after cleanup. | Status set to done. | none | none |

## Plan Deltas From Review

- Added a cleanup plan on top of the completed Lexical apply lane.
- Downgraded "improve Slate v2 architecture" from rewrite to two example-local
  refactors.
- Kept full-table selection out of scope.
- Kept raw mobile proof deferred.

## Open Questions

None for this cleanup. Future table selection needs a separate API/model plan.

## Implementation Phases

1. Mark typing cleanup.
   - Add example-local boolean mark type/helper.
   - Remove repeated `state.marks.get()` casts.
   - Verify site typecheck and richtext/iframe/hovering-toolbar behavior.
2. Paste HTML helper extraction.
   - Move parser/policy helpers out of the component file.
   - Keep `insertHtmlData` wired through `dom.clipboard.insertData`.
   - Keep `fontSize` rendering behavior unchanged.
3. Sequential proof.
   - Run focused Playwright rows.
   - Run `bun check`.
4. Planning closure.
   - Update this plan with changed files and command results.
   - Update completion state only after the closure pass.

## Final Completion Gates

- All touched source has live source pointers.
- No runtime/core API changes unless a focused failing test forces them.
- Focused harvested tests pass from `/Users/zbeyens/git/slate-v2`.
- `bun check` passes from `/Users/zbeyens/git/slate-v2`.
- `bun run completion-check` passes from `/Users/zbeyens/git/plate-2`.

Current state is `done` because the approved cleanup was implemented under an
execution lane after the Ralplan pass, with no claim-changing issue surface and
fresh `../slate-v2` verification.
