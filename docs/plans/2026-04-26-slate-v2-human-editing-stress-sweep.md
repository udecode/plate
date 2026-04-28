# Slate v2 Human Editing Stress Sweep

## Status

Done for this sweep slice.

## Goal

Use the real debug browser to stress test Slate v2 examples like a human editor
and surface browser-visible editing bugs.

## Scope

- Active code repo: `/Users/zbeyens/git/slate-v2`.
- Browser target: local Slate v2 example app, expected at `http://localhost:3100`.
- Tooling: `dev-browser --connect http://127.0.0.1:9222`.
- Scenario families:
  - focus/click into editor
  - plain typing and deletion
  - select-all replacement
  - enter/split blocks
  - backspace/delete at text and block boundaries
  - undo/redo
  - paste plain text and multi-line text
  - mark toggles with selection
  - list/checklist toggles where present
  - inline/void interaction where present

## Non-Goals

- Do not continue placeholder-only testing.
- Do not treat one flaky automation run as a product bug.
- Do not patch route-specific oddities unless they reproduce as real human
  editing failures.

## Plan

1. Inventory editable examples and choose a representative route matrix.
2. Run a fast browser stress pass to discover failures.
3. Re-run any suspicious result with a smaller targeted script and stronger
   focus/selection assertions.
4. Classify findings:
   - confirmed shared editor bug
   - route/example bug
   - harness artifact
   - out of scope
5. Patch only confirmed bugs if the owner is clear.
6. Add focused package or browser contract coverage for patched behavior.
7. Update this plan and `tmp/completion-check.md` before handoff.

## Evidence Log

- 2026-04-26: User asked to stress test all editing scenarios like a human with
  `dev-browser`.
- 2026-04-26: Route inventory found editable examples under
  `/Users/zbeyens/git/slate-v2/site/examples/ts`. First pass will cover:
  `plaintext`, `richtext`, `hovering-toolbar`, `markdown-shortcuts`,
  `markdown-preview`, `check-lists`, `tables`, `inlines`, `mentions`,
  `images`, `embeds`, `editable-voids`, `paste-html`, `code-highlighting`,
  `forced-layout`, `styling`, `android-tests`, `scroll-into-view`,
  `search-highlighting`, `highlighted-text`, `review-comments`,
  `persistent-annotation-anchors`, `large-document-runtime`, and
  `huge-document`.
- 2026-04-26: Generic scenarios: click/focus, type, Enter, Backspace/Delete,
  select-all replacement, undo/redo, plain-text paste, focus/selection
  retention, and console/page error capture.
- 2026-04-26: Specific probes: richtext toolbar mark/block buttons,
  markdown shortcuts/backspace, checklist checkbox interaction, table
  boundary keys, inline insertion controls, mention trigger/menu, and void
  image/embed/editable-void adjacency.
- 2026-04-26: First broad artifact:
  `/Users/zbeyens/.dev-browser/tmp/slate-v2-human-editing-stress-results.json`.
  Most initial failures were harness noise from the paste probe, but the route
  sweep surfaced real candidates.
- 2026-04-26: Confirmed v2 vs legacy regression with real `Meta+V`: multiline
  plain-text paste after select-all replacement lost the first line in
  `plaintext` and `richtext`; legacy preserved both lines.
- 2026-04-26: Confirmed `forced-layout` threw a page error on the same real
  paste flow before the fix.
- 2026-04-26: Confirmed `scroll-into-view` route crash: the file existed and
  `getAllExamples()` exposed it, but the dynamic import map and constants did
  not include the route.
- 2026-04-26: Fixed multiline paste by syncing the implicit transaction target
  after the full-document `Editor.replace` text insertion path in
  `/Users/zbeyens/git/slate-v2/packages/slate/src/transforms-text/insert-text.ts`.
- 2026-04-26: Added regression coverage in
  `/Users/zbeyens/git/slate-v2/packages/slate-dom/test/clipboard-boundary.ts`.
- 2026-04-26: Fixed the `scroll-into-view` route by adding it to
  `/Users/zbeyens/git/slate-v2/site/constants/examples.ts` and
  `/Users/zbeyens/git/slate-v2/site/pages/examples/[example].tsx`.
- 2026-04-26: Remaining notable finding not fixed in this slice: `mentions`
  logs invalid HTML nesting (`<div>` inside `<p>`) from the inline mention
  renderer. The actual mention insertion flow still worked in the targeted
  browser probe.
- 2026-04-26: Verification:
  - `bun test ./packages/slate-dom/test/clipboard-boundary.ts --bail 1`
  - `bun test ./packages/slate/test/primitive-method-runtime-contract.ts --bail 1`
  - `dev-browser --connect http://127.0.0.1:9222` proof for `plaintext`,
    `richtext`, `forced-layout`, and `scroll-into-view`
  - `bunx turbo build --filter=./packages/slate --filter=./packages/slate-dom --force`
  - `bunx turbo typecheck --filter=./packages/slate --filter=./packages/slate-dom --force`
  - `bun typecheck:site`
  - `bun run lint:fix`
  - `bun run lint`

## Changeset

Required if published package behavior changes.
