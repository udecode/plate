# Slate v2 TipTap Slate-Candidate Tests Ralplan

status: done
score: 0.95
created: 2026-05-11
skill: `.agents/skills/slate-ralplan/SKILL.md`
source harvest: `docs/editor-test-harvester/tiptap/report.md`

## Current Verdict

TipTap does not produce a broad raw Slate test backlog. After stripping
Plate-owned/plugin/product rows, the raw Slate result is:

- new Slate tests worth considering: 2
- already covered raw Slate rows: 5
- deferred raw performance row: 1
- hard rejects from raw Slate: all TipTap command-chain, extension option,
  NodeView, mark-range UI, serializer, markdown/input-rule, collaboration plugin,
  menu, toolbar, and product demo rows

The two real raw Slate candidates are:

1. `readOnly` browser guard: read-only editable ignores typing and exposes the
   correct non-textbox DOM state.
2. Soft-break browser guard: `Shift+Enter` routes through the browser path as a
   distinct soft-break command.

Everything else is either already covered in live `.tmp/slate-v2` tests or belongs
to Plate.

## Intent And Boundary

Intent: turn the TipTap harvest into only the raw Slate candidate tests.

Desired outcome: a short execution plan that tells a later implementation pass
which Slate v2 tests to add, which current tests to trust, and which TipTap rows
to leave out.

In scope:

- raw Slate v2 browser/unit tests only
- current `.tmp/slate-v2` source/test grounding
- de-dupe against existing Slate tests before adding anything

Non-goals:

- no Plate tests
- no TipTap extension API adoption
- no serializer/markdown/link/toolbar/plugin work in raw Slate
- no `.tmp/slate-v2` implementation changes in this ralplan
- no issue closure claims

Decision boundaries:

- decide test ownership and target files without asking again
- reject TipTap API shape when the invariant belongs to Plate or ProseMirror
- keep completion `pending` because this is a newly created Slate Ralplan pass

## Decision Brief

Principles:

- Raw Slate owns primitives: input, selection, clipboard, history, render/runtime
  contracts.
- Plate owns product policy: link range UX, markdown, serializers, menus,
  extension commands, collaboration plugins.
- Do not port API shape; port only behavior invariants.
- Prefer strengthening existing Slate tests over adding duplicate examples.

Options:

| Option                                                        | Result                                                                                    | Verdict  |
| ------------------------------------------------------------- | ----------------------------------------------------------------------------------------- | -------- |
| Port every portable-mixed TipTap row                          | Imports Plate/plugin/product behavior into raw Slate and duplicates existing Slate proof. | rejected |
| Add no Slate tests                                            | Misses two cheap browser guards exposed by the harvest.                                   | rejected |
| Add only raw Slate gaps and mark existing coverage explicitly | Keeps Slate unopinionated and makes execution small.                                      | chosen   |

Consequences:

- Later execution should be tiny: probably two Playwright rows.
- Most TipTap work shifts to Plate backlog, not Slate.
- Issue ledgers stay unchanged unless later implementation finds an actual issue
  mapping.

## Slate Candidate Matrix

| ID           | TipTap source                                                                                                                                                                                                 | Slate invariant                                                                                                                                      | Live Slate owner                                                                                                                                                                                                                                                                                                  | Decision                           | Target                                                                                                 |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------- | ------------------------------------------------------------------------------------------------------ |
| TT-SLATE-001 | `../tiptap/packages/core/src/__tests__/transformPastedHTML.test.ts:8`, `:84`, `:153`, `:204`; `../tiptap/tests/cypress/integration/core/transformPastedHTML.spec.ts`                                          | Rich HTML paste must import deterministically and avoid illegal kernel transitions. Do not port TipTap extension transform order to raw Slate.       | `.tmp/slate-v2/playwright/integration/examples/paste-html.test.ts:117`, `:183`, `:942`                                                                                                                                                                                                                            | covered / keep                     | No new raw Slate test. Run paste-html browser gate when clipboard code changes.                        |
| TT-SLATE-002 | `../tiptap/demos/src/GuideContent/ReadOnly/React/index.spec.js:12`, `:23`                                                                                                                                     | Read-only editable must reject text input and expose non-editable DOM semantics.                                                                     | Current source: `.tmp/slate-v2/packages/slate-react/src/components/editable.tsx:97`, `:220`, `:281`, `:285`, `:300`; browser owner: `.tmp/slate-v2/playwright/integration/examples/read-only.test.ts`.                                                                                                            | strengthened                       | Added typing-no-op assertion to the existing read-only browser row.                                    |
| TT-SLATE-003 | `../tiptap/demos/src/Nodes/HardBreak/React/index.spec.js:12`, `:19`, `:34`, `:42`                                                                                                                             | `Shift+Enter` must route through browser input as the `soft` break command. Do not port TipTap `mod+Enter`; Slate's open-line contract is different. | Hotkey source/test: `.tmp/slate-v2/packages/slate-dom/src/utils/hotkeys.ts:27`, `.tmp/slate-v2/packages/slate-dom/test/hotkeys.ts:37`; runtime mapping: `.tmp/slate-v2/packages/slate-react/src/editable/editing-kernel.ts:942`; browser owner: `.tmp/slate-v2/playwright/integration/examples/richtext.test.ts`. | created                            | Added a focused richtext browser row for `Shift+Enter` soft command routing.                           |
| TT-SLATE-004 | `../tiptap/demos/src/Extensions/UndoRedo/React/index.spec.js:19`, `:25`, `:33`, `:43`, `:69`, `:79`                                                                                                           | Undo/redo hotkeys must include non-English physical-key fallback.                                                                                    | `.tmp/slate-v2/packages/slate-dom/test/hotkeys.ts:54`; history browser rows in `.tmp/slate-v2/playwright/integration/examples/plaintext.test.ts:271`, `:302` and `richtext.test.ts:4467`, `:4499`, `:4531`.                                                                                                       | covered / keep                     | No new test unless Playwright can reliably emit Cyrillic key plus physical code in a real browser row. |
| TT-SLATE-005 | `../tiptap/packages/core/__tests__/unmounted.spec.ts:8`, `:29`, `:69`, `:128`, `:148`, `:166`, `:184`, `:202`; `../tiptap/packages/core/__tests__/dispatchTransaction.spec.ts:8`, `:26`, `:56`, `:75`, `:102` | Mount/unmount/remount must not duplicate input handling; raw Slate should not adopt TipTap dispatch middleware.                                      | `.tmp/slate-v2/playwright/integration/examples/richtext.test.ts:4614`; store destroy owners exist in `projection-store.ts` and `annotation-store.ts`.                                                                                                                                                             | covered / reject TipTap middleware | No new test. Keep current remount row.                                                                 |
| TT-SLATE-006 | `../tiptap/packages/core/__tests__/isNodeEmpty.spec.ts:21`, `:42`, `:74`, `:100`, `:134`, `:147`, `:192`                                                                                                      | Empty element checks must classify empty text/block/void behavior consistently.                                                                      | `.tmp/slate-v2/packages/slate/test/query-contract.ts:988`, `:1018`, `:1047`, `:2445`                                                                                                                                                                                                                              | covered / keep                     | No new test. Existing query contracts are stronger than TipTap row.                                    |
| TT-SLATE-007 | `../tiptap/demos/src/Examples/Performance/React/index.spec.js:6`                                                                                                                                              | Large editor route should mount and be testable.                                                                                                     | `.tmp/slate-v2/playwright/integration/examples/huge-document.test.ts:7`, `:21`; stress helpers verified by `slate-browser test:proof`.                                                                                                                                                                            | covered / defer                    | No TipTap-derived perf test. Use existing huge-document and stress gates.                              |
| TT-SLATE-008 | `../tiptap/demos/src/Commands/InsertContent/React/index.spec.js`; `../tiptap/demos/src/Commands/SetContent/React/index.spec.js`                                                                               | Synthetic paste/text insertion imports data and updates selection.                                                                                   | `.tmp/slate-v2/playwright/integration/examples/plaintext.test.ts:52`; rich paste rows under `paste-html.test.ts`.                                                                                                                                                                                                 | covered / keep                     | No new raw parser/serializer rows; Plate owns broad insert-content policy.                             |

## Execution Plan

Phase 1: add readOnly browser proof. Completed.

- File: `.tmp/slate-v2/playwright/integration/examples/read-only.test.ts`
- Route: `/examples/read-only`
- Assertions:
  - root has `data-slate-editor`
  - root has `contenteditable="false"`
  - root has no textbox role from `Editable`
  - keyboard text attempt leaves model/rendered text unchanged
- Gate run from `.tmp/slate-v2`:
  `PLAYWRIGHT_RETRIES=0 ./node_modules/.bin/playwright test playwright/integration/examples/read-only.test.ts --project=chromium`
  -> 1 passed.

Phase 2: add soft-break browser proof. Completed.

- File: likely `.tmp/slate-v2/playwright/integration/examples/richtext.test.ts`
- Action:
  - collapse selection inside normal paragraph
  - press `Shift+Enter`
  - assert the kernel records `{ kind: 'insert-break', variant: 'soft' }`
  - leave current block-split semantics to existing core contract coverage
- Explicit reject: do not add `mod+Enter`; TipTap treats it as hard-break, Slate
  maps open-line separately.
- Gate run from `.tmp/slate-v2`:
  `PLAYWRIGHT_RETRIES=0 ./node_modules/.bin/playwright test playwright/integration/examples/richtext.test.ts --project=chromium --grep "records a soft break command"`
  -> 1 passed.

Phase 3: no-op coverage audit for covered rows.

- Do not add tests for paste transform order, non-English undo hotkeys,
  lifecycle/remount, empty-node basics, or performance smoke unless the focused
  execution pass finds the cited live tests missing or stale.
- Gates already run in this ralplan:
  - `cwd=/Users/zbeyens/git/slate-v2 bun test ./packages/slate-dom/test/hotkeys.ts` -> 14 pass
  - `cwd=/Users/zbeyens/git/slate-v2 bun test ./packages/slate-history/test/history-contract.ts` -> 24 pass
  - `cwd=/Users/zbeyens/git/slate-v2 bun test ./packages/slate/test/snapshot-contract.ts ./packages/slate/test/transaction-contract.ts` -> 228 pass
  - `cwd=/Users/zbeyens/git/slate-v2 bun --filter slate-browser test:proof` -> 23 pass
- Browser gates not run in this ralplan; they belong to implementation.

## Ecosystem Strategy Synthesis

| System | Source                      | Mechanism                                                       | Avoids                                            | Steal                                        | Reject                                                                | Slate target                                                                       | Verdict |
| ------ | --------------------------- | --------------------------------------------------------------- | ------------------------------------------------- | -------------------------------------------- | --------------------------------------------------------------------- | ---------------------------------------------------------------------------------- | ------- |
| TipTap | `transformPastedHTML` tests | Ordered extension paste transforms over ProseMirror view props. | nondeterministic plugin paste chains              | Deterministic paste proof shape.             | Raw `transformPastedHTML` extension chain.                            | Existing paste-html gauntlets; Plate paste pipeline can own extension order later. | partial |
| TipTap | `ReadOnly` guide spec       | Browser asserts read-only edit attempt and focusability state.  | readOnly prop only tested as static render output | Add Slate browser guard.                     | TipTap `setEditable` API.                                             | `/examples/read-only` Playwright row.                                              | agree   |
| TipTap | `HardBreak` node spec       | Browser/shortcut proof for soft-break command routing.          | hotkey unit tests without runtime DOM proof       | Add Slate browser soft-break row.            | `mod+Enter` hard-break behavior and TipTap hard-break node semantics. | Richtext soft-break Playwright row.                                                | partial |
| TipTap | `UndoRedo` spec             | UI and non-English shortcut coverage.                           | English-only hotkey assumptions                   | Keep non-English physical-key unit coverage. | TipTap button/UI state.                                               | Existing Slate DOM hotkey row.                                                     | agree   |
| TipTap | `unmounted` spec            | Lifecycle tests for unmounted editor.                           | duplicate event handlers after remount            | Keep route-remount browser proof.            | TipTap mount/unmount events and dispatch middleware.                  | Existing remount row.                                                              | diverge |
| TipTap | `isNodeEmpty` spec          | Empty-node classification matrix.                               | ambiguous empty/void semantics                    | Keep broad query contracts.                  | ProseMirror hardBreak/mention node taxonomy.                          | Existing `Editor.isEmpty` query contracts.                                         | partial |

## Issue Accounting

ClawSweeper status: skipped.

Reason: this plan is a test-harvest routing plan with no issue-fix claim, no PR
narrative change, no public API change, and no implementation. If the later
execution pass adds browser rows and discovers a matching open issue, run
ClawSweeper then before claiming anything.

Fixed issues: none.

Improved issues: none.

Related issues: none claimed.

PR description: unchanged, because this plan changes no issue claims, API shape,
release gate, example narrative, or implementation.

## Applicable Review Matrix

| Lens                          | Status          | Reason                                                                                             | Plan delta                                                          |
| ----------------------------- | --------------- | -------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------- |
| `tdd`                         | applied         | The output is executable acceptance criteria for two browser rows.                                 | Add readOnly and soft-break as tests before implementation changes. |
| `vercel-react-best-practices` | skipped         | No React rendering implementation change in this plan.                                             | None.                                                               |
| `performance-oracle`          | applied lightly | TipTap performance spec is only a smoke row; live Slate has stronger 10k route and stress helpers. | Defer TipTap perf; keep existing huge-document/stress gates.        |
| `performance`                 | skipped         | No production perf claim or dashboard work.                                                        | None.                                                               |
| `build-web-apps:shadcn`       | skipped         | No UI component/chrome work.                                                                       | None.                                                               |
| `react-useeffect`             | skipped         | No effects or external-system sync change.                                                         | None.                                                               |

## Confidence Scorecard

| Dimension                                                | Score | Evidence                                                                                                  |
| -------------------------------------------------------- | ----: | --------------------------------------------------------------------------------------------------------- |
| React 19.2 runtime performance                           |  0.88 | No render implementation change; performance row mapped to existing huge-document and stress proof files. |
| Slate-close unopinionated DX                             |  0.94 | Rejects TipTap command-chain and extension APIs; only raw browser primitives stay.                        |
| Plate and slate-yjs migration backbone                   |  0.88 | Plate-owned rows excluded; collaboration rows remain Plate/Yjs backlog, not raw Slate.                    |
| Regression-proof testing strategy                        |  0.95 | Read-only and soft-break browser rows now exist and passed focused Playwright gates.                      |
| Research evidence completeness                           |  0.90 | TipTap harvest plus live `.tmp/slate-v2` source/tests cited; no external docs needed.                     |
| shadcn-style composability and hook/component minimalism |  0.91 | No new props/hooks; tests exercise existing surfaces.                                                     |
| Weighted total                                           |  0.95 | Execution slice implemented both candidate browser rows and passed focused gates.                         |

## Pass-State Ledger

| Pass                                 | Status   | Evidence added                                                                                                | Plan delta                                          | Open issues                         | Next owner                             |
| ------------------------------------ | -------- | ------------------------------------------------------------------------------------------------------------- | --------------------------------------------------- | ----------------------------------- | -------------------------------------- |
| Current-state read and initial score | complete | TipTap harvest files, live Slate source/tests, focused unit/proof commands.                                   | Raw Slate candidate matrix created.                 | Browser proof rows not implemented. | user review / `ralph` execution prompt |
| Ralph execution                      | complete | `read-only.test.ts` strengthened; `richtext.test.ts` soft command row added; focused Playwright gates passed. | TT-SLATE-002 and TT-SLATE-003 moved to implemented. | None.                               | verification closeout                  |
| Closure score and final gates        | complete | Focused Playwright rows, hotkeys gate, slate-browser proof, lint, root typecheck.                             | Plan status moved to `done`.                        | None.                               | complete                               |

## Ralph Execution Evidence

Changed files in `.tmp/slate-v2`:

- `playwright/integration/examples/read-only.test.ts`
- `playwright/integration/examples/richtext.test.ts`

Commands run from `.tmp/slate-v2`:

- `PLAYWRIGHT_RETRIES=0 ./node_modules/.bin/playwright test playwright/integration/examples/read-only.test.ts --project=chromium` -> 1 passed
- `PLAYWRIGHT_RETRIES=0 ./node_modules/.bin/playwright test playwright/integration/examples/richtext.test.ts --project=chromium --grep "records a soft break command"` -> 1 passed
- `bun test ./packages/slate-dom/test/hotkeys.ts` -> 14 passed
- `bun --filter slate-browser test:proof` -> 23 passed
- `bun lint:fix` -> checked 1601 files, no fixes applied
- `bun typecheck:root` -> passed

Rejected tactic:

- Do not add a duplicate read-only test file; the live browser owner already
  existed and only needed the TipTap typing-no-op assertion.
- Do not port TipTap `mod+Enter` hard-break behavior.
- Do not force TipTap hard-break node semantics into raw Slate.

## Final Completion Gates

Before this lane can be called complete after execution:

- [x] readOnly browser row exists and passes from `.tmp/slate-v2`
- [x] soft-break browser row exists and passes from `.tmp/slate-v2`
- [x] covered rows are not duplicated
- [x] no Plate-owned TipTap rows are added to raw Slate
- [x] `bun test ./packages/slate-dom/test/hotkeys.ts` still passes
- [x] relevant focused Playwright rows pass
- [x] completion state can move from `pending` to `done` only after the closure pass
