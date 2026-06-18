# Slate v2 integration-local triage

Status: complete

## Goal

Identify `Plate repo root` Playwright integration rows that are redundant, low-value,
or better covered by generated stress / package contracts, so
`bun test:integration-local` can shrink without gutting browser-regression
coverage.

## Constraints

- Do not remove tests by vibe.
- Prefer deleting rows that duplicate a stronger generated scenario or assert
  only route smoke.
- Keep tests that cover user-reported regression classes, browser selection,
  DOM/model parity, void navigation, table navigation, IME, clipboard, and
  toolbar selection repair unless there is a strictly stronger row nearby.
- Do not require `bun test:integration-local` just to triage; use listing,
  static clustering, and targeted rows first.

## Working Plan

1. Inventory Playwright projects and test rows.
2. Cluster by route and scenario family.
3. Compare duplicate rows against generated stress / slate-browser contracts.
4. Produce safe-cut candidates, risky candidates, and keepers.
5. If the user approves, delete a first batch and verify with `bun check` plus
   targeted Playwright rows.

## Evidence Log

- Started from user request: identify useless / DRY removable rows from
  `bun test:integration-local`, which takes over 10 minutes.
- `bunx playwright test --list` before cleanup: 676 rows, 30 files, 169 rows
  per project across Chromium, Firefox, mobile, and WebKit.
- Biggest immediate waste: `playwright/stress/**` was included in
  `test:integration-local`, even though `test:stress` and
  `test:stress:replay` already own that lane.
- Updated `Plate repo root/package.json` so `test:integration` and
  `test:integration-local` run `playwright/integration` only.
- `bunx playwright test playwright/integration --list` after cleanup: 588 rows,
  28 files, 147 rows per project.
- `bun check` passes after the script change.
- Fail-fast browser sweep after fixing current reds:
  `PLAYWRIGHT_RETRIES=0 bunx playwright test playwright/integration
--max-failures=1 --reporter=line` passes 588/588 across Chromium, Firefox,
  mobile, and WebKit.
- Final fast gate: `bun check` passes in `Plate repo root`.

## Safe Cuts Found

1. Exclude `playwright/stress/**` from `test:integration*`.

   - Already applied.
   - Removes 88 listed rows from integration-local: 84 generated stress rows
     plus 4 skipped replay rows.
   - Coverage remains available through explicit `test:stress` and
     `test:stress:replay`.

2. Delete route-smoke rows that are strictly weaker than existing rows in the
   same file or generated stress:

   - `playwright/integration/examples/richtext.test.ts`
     - `renders rich text`
     - `inserts text through browser input`
     - `runs a traced slate-browser scenario`
   - `playwright/integration/examples/markdown-shortcuts.test.ts`
     - `contains quote`
   - `playwright/integration/examples/forced-layout.test.ts`
     - `checks for the elements`
   - `playwright/integration/examples/images.test.ts`
     - `contains image`
   - `playwright/integration/examples/hovering-toolbar.test.ts`
     - `hovering toolbar appears`

3. Delete Playwright rows that are already better covered by package-level
   app-owned customization tests:

   - `playwright/integration/examples/markdown-preview.test.ts`
     - `checks for markdown`
     - stronger owner:
       `packages/slate-react/test/app-owned-customization.tsx`
       `Editable supports app-owned markdown preview projections`
   - `playwright/integration/examples/forced-layout.test.ts`
     - remaining forced-layout row can be considered after confirming the
       package-level normalization/app-owned customization tests cover the exact
       contract.

4. DRY or chromium-scope, not delete blindly:
   - `playwright/integration/examples/styling.test.ts`
     - both rows are pure prop/style rendering and should become React/package
       tests or Chromium-only integration rows.
   - richtext kernel trace metadata rows:
     - `records kernel commands for structural browser edits`
     - `records kernel commands for proof-handle edits`
     - `records allowed kernel transitions for movement commands`
     - `records core command metadata for keydown movement`
     - `records kernel policies for browser command and repair traces`
     - `records core command metadata for text input and delete`
     - `records selectionchange and repair kernel results`
     - These are important contracts, but running them across all projects is
       wasteful. Keep one browser-level row and move the rest to package/core
       tests or make them Chromium-only.

## Keepers

- Void / inline / table navigation rows that match recent user regressions.
- Decoration focus and render-budget rows.
- IME/composition rows.
- Clipboard/paste rows that use real browser clipboard on desktop and semantic
  fallback on mobile.
- Shadow DOM and iframe rows.
- The generated stress lane itself, but only through `test:stress`.

## Execution Pass: fail-fast reds

Status: complete

Trigger: user sees many reds and wants fixes to begin before the full
integration sweep finishes.

Run policy:

- Run `playwright/integration` with `--max-failures=1` and retries disabled.
- Fix the first current red from command output.
- Rerun the focused project/file/title before continuing the broader sweep.
- Keep status `in_progress` until the active red cluster is fixed or a real
  blocker prevents autonomous progress.

Current red cluster:

- Command: `PLAYWRIGHT_RETRIES=0 bunx playwright test playwright/integration
--max-failures=1 --reporter=line`
- First failure: `playwright/integration/examples/inlines.test.ts` /
  `wraps typed URL text as a link command` on Chromium.
- Root cause: the example put URL wrapping in `onDOMBeforeInput`, while the
  slate-browser handle's `insertText()` path applies `Editable` `inputRules`.
  That made the app behavior split between native browser events and command
  style text insertion.
- Patch: move the URL wrapping rule to `Editable inputRules` and keep the test
  on `editor.insertText(...)`, which is cross-browser and exercises the shared
  command/input-rule path.
- Follow-up build red: `EditableInputRule` was not exported and
  `EditableTextBlocks` did not expose/forward `inputRules` to `EditableDOMRoot`.
  Patch: export the input-rule types and forward `inputRules` through the
  public `Editable` wrapper.
- Focused verification: `PLAYWRIGHT_RETRIES=0 bunx playwright test
playwright/integration/examples/inlines.test.ts -g "wraps typed URL text as a
link command" --reporter=line` passes on Chromium, Firefox, mobile, and
  WebKit.

Second red cluster:

- Command: same fail-fast sweep.
- First failure: `playwright/integration/examples/markdown-shortcuts.test.ts` /
  `can add list items` on Chromium.
- Root cause: same app policy split as inlines. Markdown shortcut conversion
  lived only in `onDOMBeforeInput`, while the browser handle's command-style
  `insertText()` path only runs `Editable inputRules`.
- Patch: move markdown text shortcut conversion to `Editable inputRules`; keep
  `onDOMBeforeInput` only for the Android pending-diff microtask.
- Focused verification: `PLAYWRIGHT_RETRIES=0 bunx playwright test
playwright/integration/examples/markdown-shortcuts.test.ts --reporter=line`
  passes 16/16 across Chromium, Firefox, mobile, and WebKit.

Third red cluster:

- Command: same fail-fast sweep.
- First failure:
  `playwright/integration/examples/persistent-annotation-anchors.test.ts` /
  `keeps the annotation anchor attached across fragment insert, text insert,
and clear` on Chromium.
- Root cause: the example's "Insert fragment before anchor" button used raw
  `tx.nodes.insert(...)` at a text point even though the contract expects Slate
  fragment insertion semantics, where the trailing inserted block merges with
  the current text block.
- Patch: select the insertion point and call `tx.fragment.insert(...)`.
- Focused verification: `PLAYWRIGHT_RETRIES=0 bunx playwright test
playwright/integration/examples/persistent-annotation-anchors.test.ts
--reporter=line` passes 4/4 across Chromium, Firefox, mobile, and WebKit.

Fourth red cluster:

- Command: same fail-fast sweep.
- First failure: `playwright/integration/examples/large-document-runtime.test.ts`
  / `preserves app-owned rich HTML paste over shell-backed selection` on
  Firefox.
- Root cause: test paste transport dispatched a synthetic paste event, then
  forced the browser-handle fallback for Firefox. The synthetic Firefox event
  could mutate the shell-backed selection before the fallback inserted data.
- Deeper root cause: the model selection was imported correctly, but the
  app-owned rich HTML `insertData` handler used raw node insertion for content
  that should follow fragment replacement semantics. That left
  browser/transport differences to decide whether replacement happened.
- Patch: use the browser-handle `insertData` fallback directly where needed,
  import DOM selection before fallback, and make the custom rich HTML paste
  handler call `tx.fragment.insert(...)` with the deserialized paragraph.
- Focused verification: `PLAYWRIGHT_RETRIES=0 bunx playwright test
playwright/integration/examples/large-document-runtime.test.ts -g "preserves
.*paste" --reporter=line` passes 12/12 across Chromium, Firefox, mobile, and
  WebKit.
