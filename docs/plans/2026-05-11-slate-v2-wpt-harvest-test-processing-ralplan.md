# Slate v2 WPT Harvest Test Processing Ralplan

status: done
score: 0.94
lane: slate-v2
source_harvest: `.tmp/editor-test-harvester/wpt/report.md`
row_accounting: `docs/plans/2026-05-11-slate-v2-wpt-harvest-test-processing-row-accounting.md`
downstream_skill: `.agents/skills/slate-ralplan/SKILL.md`
created: 2026-05-11

## Current Verdict

Process WPT into Slate v2 as five browser-substrate queues, not as 1,139 direct test ports. Start with native input and DOM Selection/Range because those are the highest-leverage raw Slate browser risks and already have strong owner tests to dedupe against.

This plan is ready for Ralph execution. It makes no implementation edits, no Slate issue claims, and no Plate/product backlog claims.

## Intent Boundary

Intent: turn the WPT focused editor harvest into an execution-grade raw Slate v2 test plan.

Outcome: every promoted WPT matrix row has a Slate owner, action, proof kind, target location, and verification command.

In scope:

- raw Slate browser input, selection, clipboard, contenteditable structural edit, focus, and Shadow DOM behavior;
- current `.tmp/slate-v2` package and browser test owners;
- fresh local invariant wording with WPT path provenance.

Out of scope:

- Plate plugin/product behavior;
- upstream WPT helper, fixture, snapshot, or expressive prose copy;
- broad WPT repository mining beyond the focused harvest;
- live GitHub issue claims.

Decision boundary: package tests can close model/core behavior. Browser, clipboard, selection, focus, Shadow DOM, IME, and native input claims need browser proof.

## Harvest Grounding

| Field                             | Value                                                                                          |
| --------------------------------- | ---------------------------------------------------------------------------------------------- |
| Harvest report                    | `.tmp/editor-test-harvester/wpt/report.md`                                                     |
| Inventory                         | `.tmp/editor-test-harvester/wpt/inventory.md`                                                  |
| Test index                        | `.tmp/editor-test-harvester/wpt/test-index.md`                                                 |
| Harvester report status at intake | `pending`, because lane-level mapping was deferred here                                        |
| WPT checkout                      | `../wpt`                                                                                       |
| WPT revision                      | `dd54691426`                                                                                   |
| License mode                      | permissive, evidence in `../wpt/LICENSE.md`                                                    |
| Output mode                       | scratch-forced-by-user                                                                         |
| Versioned policy                  | fresh local invariant wording; no upstream code, helpers, fixtures, snapshots, or prose copied |

## Row Accounting

Full row accounting is in `docs/plans/2026-05-11-slate-v2-wpt-harvest-test-processing-row-accounting.md`.

| Source class            | Count | Lane decision                                                                       |
| ----------------------- | ----: | ----------------------------------------------------------------------------------- |
| Promoted matrix rows    |     5 | all in-lane as WPT-1 through WPT-5                                                  |
| Focused inventory files | 1,139 | grouped by category/action; not all are Slate tests                                 |
| Portable rows           |   518 | grouped into WPT-1 through WPT-5                                                    |
| Portable-mixed rows     |   198 | raw substrate split in; product/plugin behavior excluded                            |
| Harness rows            |   172 | skipped                                                                             |
| Skip rows               |   182 | out-of-lane                                                                         |
| Defer rows              |     7 | explicit defer                                                                      |
| Uncertain rows          |    62 | not promoted to Slate v2 rows; excluded until a future harvester pass promotes them |

## Current Owner Coverage

Live `.tmp/slate-v2` search found current owner coverage in these files:

- Native input: `packages/slate-react/test/model-input-strategy-contract.test.ts`, `packages/slate-react/test/selection-controller-contract.ts`, `packages/slate-react/test/editing-kernel-contract.ts`, `playwright/integration/examples/plaintext.test.ts`, `playwright/integration/examples/rendering-strategy-runtime.test.ts`.
- Selection/Range: `packages/slate-browser/test/browser/selection.browser.test.ts`, `packages/slate-browser/test/core/selection.test.ts`, `packages/slate-react/test/selection-controller-contract.ts`, `packages/slate-react/test/dom-coverage-boundary-contract.tsx`, `playwright/integration/examples/dom-coverage-boundaries.test.ts`, `playwright/integration/examples/inlines.test.ts`, `playwright/integration/examples/shadow-dom.test.ts`.
- Clipboard/DataTransfer: `packages/slate/test/clipboard-contract.ts`, `packages/slate-dom/test/clipboard-boundary.ts`, `packages/slate-dom/test/clipboard-boundary.test.ts`, `packages/slate-react/test/dom-coverage-native-bridge-contract.test.ts`, `playwright/integration/examples/paste-html.test.ts`.
- Structural edit/delete/insert: `packages/slate/test/delete-contract.ts`, `packages/slate/test/transforms-contract.ts`, `packages/slate/test/transforms/**`, `packages/slate-react/test/dom-coverage-native-bridge-contract.test.ts`, `playwright/integration/examples/inlines.test.ts`, `playwright/integration/examples/rendering-strategy-runtime.test.ts`.
- Focus/Shadow DOM: `packages/slate-react/src/editable/runtime-focus-mouse-events.ts`, `packages/slate-react/src/editable/selection-controller.ts`, `playwright/integration/examples/shadow-dom.test.ts`, `playwright/integration/examples/iframe.test.ts`, `playwright/integration/examples/read-only.test.ts`.

## Execution Queue

| Queue | Harvest row                            | Target invariant                                                                                                                                               | Action                                                                                        | Target files                                                                                                                                                                                                                                               | Proof                      |
| ----- | -------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------- |
| 1     | WPT-1 beforeinput/input                | Native input must preserve event type, target range, data transfer ownership, cancellation, and readOnly/model/native ownership.                               | refactor existing first; create only missing DataTransfer/cancel/readOnly rows                | `packages/slate-react/test/model-input-strategy-contract.test.ts`, `packages/slate-react/test/selection-controller-contract.ts`, `playwright/integration/examples/plaintext.test.ts`, `playwright/integration/examples/rendering-strategy-runtime.test.ts` | package + Chromium browser |
| 2     | WPT-2 DOM Selection/Range              | DOM Selection/Range import/export must fail closed across hidden, removed, shadow, detached, and odd range states.                                             | refactor existing; add narrow gap rows for states not covered by selection/dom-coverage tests | `packages/slate-browser/test/browser/selection.browser.test.ts`, `packages/slate-react/test/selection-controller-contract.ts`, `playwright/integration/examples/dom-coverage-boundaries.test.ts`, `playwright/integration/examples/shadow-dom.test.ts`     | browser + package          |
| 3     | WPT-3 clipboard/DataTransfer           | Clipboard/DataTransfer events stay app-owned when canceled and model-owned only when accepted; copy/paste should not leak render wrappers or lose line breaks. | refactor existing; add gap rows only around cancellation and DataTransfer payload routes      | `packages/slate/test/clipboard-contract.ts`, `packages/slate-dom/test/clipboard-boundary.ts`, `packages/slate-react/test/dom-coverage-native-bridge-contract.test.ts`, `playwright/integration/examples/paste-html.test.ts`                                | package + desktop browser  |
| 4     | WPT-4 contenteditable structural edits | Delete, insert, split, noneditable, void, SVG/table/hidden/removed-node cases should not crash and should route to explicit core or browser ownership.         | refactor existing; create browser stress rows only after dedupe                               | `packages/slate/test/delete-contract.ts`, `packages/slate/test/transforms-contract.ts`, `packages/slate/test/transforms/**`, `playwright/integration/examples/inlines.test.ts`, `playwright/integration/examples/rendering-strategy-runtime.test.ts`       | package + browser          |
| 5     | WPT-5 focus/Shadow DOM                 | Focus, activeElement, shadow-root selection, iframe, blur, and detached host movement must not import stale or foreign DOM selection.                          | refactor existing; add fail-closed rows for detached/shadow host gaps                         | `packages/slate-react/src/editable/selection-controller.ts`, `playwright/integration/examples/shadow-dom.test.ts`, `playwright/integration/examples/iframe.test.ts`, `playwright/integration/examples/read-only.test.ts`                                   | browser                    |

## Focused Verification Commands For Ralph

Run focused gates first, then widen only if implementation touches shared runtime code.

```bash
cd .tmp/slate-v2/packages/slate-react
bun test:vitest test/model-input-strategy-contract.test.ts test/selection-controller-contract.test.ts test/editing-kernel-contract.ts test/dom-coverage-native-bridge-contract.test.ts test/dom-coverage-boundary-contract.tsx
```

```bash
cd .tmp/slate-v2
bun --filter slate-browser test:selection
bun test ./packages/slate/test/clipboard-contract.ts ./packages/slate-dom/test/clipboard-boundary.ts ./packages/slate/test/delete-contract.ts ./packages/slate/test/transforms-contract.ts
bunx playwright test playwright/integration/examples/plaintext.test.ts playwright/integration/examples/dom-coverage-boundaries.test.ts playwright/integration/examples/paste-html.test.ts playwright/integration/examples/shadow-dom.test.ts playwright/integration/examples/inlines.test.ts playwright/integration/examples/rendering-strategy-runtime.test.ts --project=chromium
```

If a WPT row becomes an IME/composition row, use real browser composition proof. Do not treat jsdom contenteditable composition as authoritative.

## Excluded Rows

| Family                                           | Decision                                                                            |
| ------------------------------------------------ | ----------------------------------------------------------------------------------- |
| WPT support/resources/reference files            | skip                                                                                |
| Manual files                                     | skip                                                                                |
| Clipboard permissions, permission policy, grants | out-of-lane browser policy                                                          |
| General Shadow DOM slots/style/layout            | out-of-lane unless tied to selection, focus, caret, input, or editing host behavior |
| Editing data fixtures                            | defer until harness interpretation produces a direct invariant                      |
| EditContext tentative API                        | defer                                                                               |
| Plate plugin/product behavior                    | out-of-lane                                                                         |

## Slate Ralplan Gates Applied

- Intent, outcome, scope, non-goals, and decision boundary are explicit.
- Raw Slate owns substrate behavior only; Plate/product rows stay excluded.
- Current `.tmp/slate-v2` tests were searched before action rows were marked.
- Browser claims have browser proof commands.
- Package-only checks are not counted as browser proof.
- No issue claim changed; no `docs/slate-issues/**` edit is needed for WPT provenance.
- No upstream WPT code, helpers, fixtures, snapshots, expected output, or prose is copied into versioned output.
- Execution is handed to Ralph; this skill does not edit `.tmp/slate-v2`.

## Pass-State Ledger

| Pass                                 | Status   | Evidence                                                                                                                |
| ------------------------------------ | -------- | ----------------------------------------------------------------------------------------------------------------------- |
| Argument resolution                  | complete | inferred `slate-v2 .tmp/editor-test-harvester/wpt/report.md` from prior requested next step                             |
| Artifact validation                  | complete | report, inventory, test-index, and harvester completion file read                                                       |
| Row accounting                       | complete | appendix accounts for promoted matrix rows and all 1,139 inventory files                                                |
| Current owner search                 | complete | live `.tmp/slate-v2` tests/source searched by input, selection, clipboard, delete, focus, and shadow terms              |
| Downstream Slate Ralplan application | complete | browser proof, owner split, no issue claim, no source edits                                                             |
| Completion state                     | complete | session completion and continuation updated                                                                             |
| Ralph full execution                 | complete | WPT-1 through WPT-5 processed into `.tmp/slate-v2`; focused package, typecheck, lint, and Chromium browser gates passed |

## Ralph Execution Results

| Queue                                  | Result                   | Evidence                                                                                                                                                                              |
| -------------------------------------- | ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| WPT-1 beforeinput/input                | implemented              | Added `beforeinput` DataTransfer command coverage in `.tmp/slate-v2/packages/slate-react/test/editing-kernel-contract.ts`; Slate React focused owner suite passed.                    |
| WPT-2 DOM Selection/Range              | implemented              | `takeEditorSelectionSnapshot` now returns `null` for foreign and partially foreign DOM selections; `slate-browser` selection suite passed with 7 tests.                               |
| WPT-3 clipboard/DataTransfer           | deduped plus payload row | Existing native bridge, Slate clipboard, and Slate DOM clipboard suites cover readOnly/app-owned/copy/paste/drop ownership; DataTransfer beforeinput payload route added under WPT-1. |
| WPT-4 contenteditable structural edits | deduped                  | Existing delete, transforms, inlines, rendering-strategy, void, table, and DOM coverage rows cover the promoted structural edit queue; package and Chromium browser gates passed.     |
| WPT-5 focus/Shadow DOM                 | implemented plus deduped | Added a shadow-root selection snapshot row; existing shadow DOM and iframe browser rows cover browser focus/root behavior.                                                            |

Fresh verification from `.tmp/slate-v2`:

```bash
bun --filter slate-browser test:selection
```

Fresh verification from `.tmp/slate-v2/packages/slate-react`:

```bash
bun test:vitest test/editing-kernel-contract.test.ts test/model-input-strategy-contract.test.ts test/selection-controller-contract.test.ts test/dom-coverage-native-bridge-contract.test.ts test/dom-coverage-boundary-contract.test.tsx
```

Fresh verification from `.tmp/slate-v2`:

```bash
bun test ./packages/slate/test/clipboard-contract.ts ./packages/slate-dom/test/clipboard-boundary.test.ts ./packages/slate/test/delete-contract.ts ./packages/slate/test/transforms-contract.ts
bun test ./packages/slate/test/transforms-contract.ts
bunx playwright test playwright/integration/examples/plaintext.test.ts playwright/integration/examples/dom-coverage-boundaries.test.ts playwright/integration/examples/paste-html.test.ts playwright/integration/examples/shadow-dom.test.ts playwright/integration/examples/inlines.test.ts playwright/integration/examples/rendering-strategy-runtime.test.ts --project=chromium
bun --filter slate-browser typecheck
bun --filter slate-react typecheck
bun lint:fix
```

## Confidence Score

| Dimension                        | Score | Evidence                                                                                        |
| -------------------------------- | ----: | ----------------------------------------------------------------------------------------------- |
| Harvest source readiness         |  0.95 | report, inventory, test-index, revision, license, and output mode recorded                      |
| Lane-filter completeness         |  0.93 | all five promoted matrix rows routed; full inventory grouped and excluded/deferred where needed |
| Current owner coverage mapping   |  0.92 | current `.tmp/slate-v2` tests/source searched and mapped to each row                            |
| Actionability of execution queue |  0.94 | every in-lane row has owner, target files, proof kind, and focused commands                     |
| License/provenance discipline    |  0.96 | permissive source still uses fresh invariant wording and path provenance only                   |

Total: 0.94.

## Ralph Handoff

Run:

```text
[$ralph](.agents/skills/ralph/SKILL.md) docs/plans/2026-05-11-slate-v2-wpt-harvest-test-processing-ralplan.md
```

Start with queue 1 and queue 2. Dedupe against the named current owner files before adding tests. Do not reopen the external TMS lane. Do not change Slate issue claims from WPT rows unless a later execution reproduces a named issue with exact evidence.
