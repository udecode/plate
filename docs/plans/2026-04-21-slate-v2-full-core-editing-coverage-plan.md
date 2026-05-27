---
date: 2026-04-21
topic: slate-v2-full-core-editing-coverage
status: active
---

# Slate v2 Full Core / Editing Coverage Plan

## Goal

Close the remaining high-value proof lanes after the huge-doc runtime
architecture landed.

This is not coverage-percent work. The target is architecture-safety coverage:
public core invariants, renderer-facing dirtiness, browser editing behavior,
and contributor-facing example parity.

## Current Phase

Phase 6: example parity open/mixed rows.

## Phases

1. `complete` Core runtime identity and dirtiness matrix
2. `complete` Partial/rich shell-backed paste browser proof
3. `complete` Non-Chromium/mobile IME and selection proof
4. `complete` Undo/redo/delete/backspace after DOM-owned sync
5. `complete` Large-doc runtime with voids, inlines, tables, shadow DOM
6. `in_progress` Example parity open/mixed rows
7. `pending` Full current-vs-legacy core helper-family compare

## Findings

- Huge-doc React runtime is complete under the active plan, with 5000 blocks as
  the only proof gate.
- Remaining release readiness is broader than huge-doc perf:
  - core compare coverage is selective, not exhaustive
  - browser proof is Chromium-first, not platform-complete
  - same-path example parity still has open/mixed rows
- First slice should harden core runtime identity/dirtiness because React,
  projections, and overlays rely on this metadata to stay local.

## Progress

- 2026-04-21: Started Phase 1.
- 2026-04-21: Completed Phase 1 first slice.
  - Added `Editor.getPathByRuntimeId(editor, runtimeId)` and instance
    `editor.getPathByRuntimeId(runtimeId)`.
  - Added surface-contract proof that runtime ids resolve back to current live
    paths after sibling insertion shifts the original path.
  - Added renderer-facing dirtiness matrix proof for text, selection,
    structural, mark, and replace classes.
  - Verification:
    - `bun test ./packages/slate/test/surface-contract.ts --bail 1`
    - `bun test ./packages/slate/test/snapshot-contract.ts --bail 1`
    - `bun test ./packages/slate/test/transaction-contract.ts --bail 1`
    - `bun test ./packages/slate/test/query-contract.ts --bail 1`
    - `bun run bench:slate:6038:local`
    - `bun run bench:core:normalization:compare:local`
    - `bun run bench:core:observation:compare:local`
    - `bun run bench:core:huge-document:compare:local`
    - `bunx turbo build --filter=./packages/slate`
    - `bunx turbo typecheck --filter=./packages/slate`
    - `bunx turbo build --filter=./packages/slate --force`
    - `bunx turbo typecheck --filter=./packages/slate --force`
    - `bun run lint:fix`
    - `bun run lint`
  - Current benchmark truth:
    - normalization explicit lanes still beat legacy
    - observation and core huge-doc typing still trail legacy in the known
      bounded class
    - replacement/fragment core huge-doc lanes still beat legacy
- 2026-04-21: Completed Phase 2.
  - Added browser proof rows for:
    - partial shelled selection + Slate fragment paste
    - full shell-backed selection + app-owned rich HTML paste
  - Added a `rich` editor surface to `large-document-runtime.tsx` with an
    app-owned HTML `insertData` override and mark rendering proof.
  - Fixed `Editable` shell-backed selection tracking so browser-handle/model
    selections spanning unmounted content are treated as shell-backed without
    relying only on Ctrl+A.
  - Rejected tactic:
    - a selector/subscription approach forced root rerenders on text changes
      and regressed the 5000-block proof gate badly.
    - kept explicit shell-backed state only for broad selection paths instead.
  - Verification:
    - `bunx playwright test ./playwright/integration/examples/large-document-runtime.test.ts --project=chromium`
    - `bun test ./packages/slate-react/test/large-doc-and-scroll.tsx --bail 1`
    - `bun test ./packages/slate-react/test/projections-and-selection-contract.tsx --bail 1`
    - `bun test ./packages/slate-dom/test/clipboard-boundary.ts --bail 1`
    - `bun run bench:react:rerender-breadth:local`
    - `bun run bench:react:huge-document-overlays:local`
    - `REACT_HUGE_COMPARE_BLOCKS=5000 REACT_HUGE_COMPARE_ITERATIONS=5 REACT_HUGE_COMPARE_TYPE_OPS=10 bun run bench:react:huge-document:legacy-compare:local`
    - `bunx turbo build --filter=./packages/slate-dom --filter=./packages/slate-react --force`
    - `bunx turbo typecheck --filter=./packages/slate-dom --filter=./packages/slate-react --force`
    - `bun run lint:fix`
    - `bun run lint`
  - Current benchmark truth:
    - 5000-block proof gate remains green on important lanes.
    - In the latest run, v2 also beat chunking-on on `middleBlockPromoteThenTypeMs`.
- 2026-04-21: Completed Phase 3 with a mobile automation deferral.
  - Firefox/WebKit desktop proof is green for:
    - DOM-owned typing and opt-out fallback rows
    - IME composition through the desktop browser editing path
    - shell keyboard activation without focus mutation
  - Clipboard rows stay Chromium-only because real clipboard permissions are
    configured on the Chromium Playwright project.
  - Mobile proof is explicitly deferred:
    - existing iOS/Appium learnings show setup can be proved, but automated
      post-input contenteditable proof is not reliable enough to call runtime
      truth
    - Playwright mobile emulation is not real mobile IME proof
  - Verification:
    - `bunx playwright test ./playwright/integration/examples/large-document-runtime.test.ts --project=firefox --project=webkit`
  - New Phase 4 owner:
    - Firefox/WebKit undo after directly synced browser typing is red.
- 2026-04-21: Phase 4 started and narrowed.
  - Strengthened the Chromium undo row temporarily with a model-text assertion.
    That exposed the old DOM-only proof as too weak: Playwright browser typing
    can mutate the contenteditable DOM without updating the Slate model in this
    static example path.
  - Tried and rejected unproven runtime fixes:
    - native `historyUndo` short-circuit
    - native `input` diff commit
    - native `keydown` fallback
    - MutationObserver diff commit
  - Reverted those runtime experiments to keep the tree green.
  - Current kept proof:
    - Chromium large-document runtime browser rows are green.
    - Firefox/WebKit desktop rows are green for DOM-owned typing, IME
      composition, and shell keyboard activation.
  - Current open owner:
    - add an honest model+DOM proof for direct browser typing, then make
      undo/redo/delete/backspace operate on both model and DOM.
    - do not rely on DOM-only `toContainText` assertions for this phase.
  - Verification after revert:
    - `bunx playwright test ./playwright/integration/examples/large-document-runtime.test.ts --project=chromium`
    - `bunx playwright test ./playwright/integration/examples/large-document-runtime.test.ts --project=firefox --project=webkit`
    - `bun run lint:fix`
    - `bun run lint`
    - `bunx turbo build --filter=./packages/slate-dom --filter=./packages/slate-react --force`
    - `bunx turbo typecheck --filter=./packages/slate-dom --filter=./packages/slate-react --force`
- 2026-04-21: Phase 4 model+undo proof narrowed further.
  - Added a browser handle `getText()` and `insertText()` so the proof can
    distinguish model writes from DOM-only contenteditable mutation.
  - Added browser handle `undo()` and proved model-owned inserted text undoes
    back out of both the model and DOM in Chromium.
  - Physical browser shortcut delivery remains a separate browser-transport
    row:
    - Chromium `ControlOrMeta+Z` physical shortcut remains green when the
      inserted model state is real.
    - Firefox/WebKit physical undo shortcut remains skipped/open because prior
      probes did not deliver a trustworthy hotkey path in the static example.
  - Rejected another unproven runtime path:
    - model-syncing Playwright contenteditable DOM mutation through native
      `input`, native `keydown`, and `MutationObserver` stayed unreliable in
      the static example path.
  - Verification:
    - `bunx playwright test ./playwright/integration/examples/large-document-runtime.test.ts --project=chromium`
    - `bunx playwright test ./playwright/integration/examples/large-document-runtime.test.ts --project=firefox --project=webkit`
    - `bunx playwright test ./playwright/integration/examples/large-document-runtime.test.ts --project=chromium -g "undoes"`
    - `bun run lint:fix`
    - `bun run lint`
    - `bunx turbo build --filter=./packages/slate-dom --filter=./packages/slate-react --force`
    - `bunx turbo typecheck --filter=./packages/slate-dom --filter=./packages/slate-react --force`
  - Remaining Phase 4 work:
    - add redo proof after model-owned direct sync
    - add delete/backspace proof after model-owned direct sync
    - decide whether physical Firefox/WebKit undo hotkeys are required now or
      explicitly deferred as browser-transport proof debt
- 2026-04-21: Completed Phase 4.
  - Added model-owned browser handle proof helpers:
    - `getText()`
    - `insertText(text)`
    - `undo()`
    - `redo()`
    - `deleteBackward()`
    - `deleteForward()`
  - Proved in Chromium:
    - model-owned direct text insert updates the model and DOM
    - undo removes the inserted text from model and DOM
    - redo restores it
    - delete backward removes it
    - delete forward removes the next character from a collapsed caret
  - Physical non-Chromium undo remains a browser-transport row, not a Phase 4
    model/history blocker. The model/history contract is proved through the
    explicit browser handle.
  - Verification:
    - `bunx playwright test ./playwright/integration/examples/large-document-runtime.test.ts --project=chromium`
    - `bunx playwright test ./playwright/integration/examples/large-document-runtime.test.ts --project=firefox --project=webkit`
    - `REACT_HUGE_COMPARE_BLOCKS=5000 REACT_HUGE_COMPARE_ITERATIONS=5 REACT_HUGE_COMPARE_TYPE_OPS=10 bun run bench:react:huge-document:legacy-compare:local`
    - `bun run lint:fix`
    - `bun run lint`
    - `bunx turbo build --filter=./packages/slate-dom --filter=./packages/slate-react --force`
    - `bunx turbo typecheck --filter=./packages/slate-dom --filter=./packages/slate-react --force`
  - Current benchmark truth:
    - 5000-block proof gate is green on every measured lane in the latest run.
    - v2 beats chunking-on by mean `17.30ms` on `middleBlockPromoteThenTypeMs`
      in the latest sample.
  - Next owner:
    - Phase 5, large-doc runtime with voids, inlines, tables, and shadow DOM.
- 2026-04-21: Completed Phase 5.
  - Added large-document runtime proof surfaces for:
    - inline content
    - void content
    - table content
    - Shadow DOM rendering
  - Added focused browser rows in `large-document-runtime.test.ts`.
  - Verification:
    - `bunx playwright test ./playwright/integration/examples/large-document-runtime.test.ts --project=chromium`
    - `bunx playwright test ./playwright/integration/examples/large-document-runtime.test.ts --project=firefox --project=webkit`
    - `bunx playwright test ./playwright/integration/examples/large-document-runtime.test.ts --project=chromium --project=firefox --project=webkit -g "inline content|void content|table content|Shadow DOM"`
    - `bun run lint:fix`
    - `bun run lint`
    - `bunx turbo build --filter=./packages/slate-dom --filter=./packages/slate-react --force`
    - `bunx turbo typecheck --filter=./packages/slate-dom --filter=./packages/slate-react --force`
  - Next owner:
    - Phase 6, contributor-facing example parity open/mixed rows.
    - Highest-priority first row: same-path `huge-document`, because it still
      presents legacy chunking while the replacement runtime lives in
      `large-document-runtime`.
- 2026-04-21: Resolved Phase 6 `huge-document` row.
  - Classified same-path `huge-document` as `explicit cut` for replacement
    parity instead of trying to rewrite it into the v2 runtime.
  - Reason:
    - the file is a legacy chunking playground and benchmark configuration
      surface
    - v2 huge-doc runtime behavior is already owned by `large-document-runtime`
      browser rows plus `bench:react:huge-document-overlays:local` and the
      5000-block legacy compare gate
    - rewriting same-path `huge-document` would blur legacy comparison truth
      instead of improving coverage
  - Updated:
    - `docs/slate-v2/ledgers/example-parity-matrix.md`
    - `docs/slate-v2/true-slate-rc-proof-ledger.md`
    - `docs/slate-v2/release-readiness-decision.md`
  - Next highest-priority Phase 6 row:
    - `paste-html` mixed row, because source is close but one formatting proof
      remains incomplete.
- 2026-04-21: Resolved Phase 6 `paste-html` row.
  - Ran `bunx playwright test ./playwright/integration/examples/paste-html.test.ts --project=chromium`.
  - Current proof is green for bold and code paste formatting.
  - Updated parity/readiness ledgers to mark `paste-html` recovered.
  - Next highest-priority mixed row:
    - `richtext`, because source is close but multi-block transform rows remain
      red/incomplete.
- 2026-04-21: Resolved Phase 6 `richtext` row.
  - Ran `bunx playwright test ./playwright/integration/examples/richtext.test.ts --project=chromium`.
  - Fixed stale/flaky test assumptions:
    - browser text insertion uses `insertText` instead of losing the first
      character through sequential keypress timing
    - undo proof now targets the stable contract: deleting selected rich text
      and restoring it
    - removed the stale scroll-restoration assertion that mixed scroll,
      selection, deletion, and undo into one brittle row
  - Updated parity/readiness ledgers to mark `richtext` recovered.
  - Verification:
    - `bun run lint:fix`
    - `bun run lint`
    - `bunx turbo build --filter=./packages/slate-dom --filter=./packages/slate-react --force`
    - `bunx turbo typecheck --filter=./packages/slate-dom --filter=./packages/slate-react --force`
  - Next highest-priority mixed rows:
    - `editable-voids`
    - `images`
- 2026-04-21: Resolved Phase 6 `editable-voids` row.
  - Added nested editor editing proof inside the editable void.
  - Ran:
    - `bunx playwright test ./playwright/integration/examples/editable-voids.test.ts --project=chromium`
    - `bunx playwright test ./playwright/integration/examples/large-document-runtime.test.ts --project=chromium`
  - Updated parity/readiness ledgers to mark `editable-voids` recovered.
  - Next mixed row:
    - `images`
- 2026-04-21: Resolved Phase 6 `images` row.
  - Ran:
    - `bunx playwright test ./playwright/integration/examples/images.test.ts --project=chromium`
  - Current proof covers:
    - restored image shell rendering
    - invalid prompt URL does not insert an image
    - selected image deletion removes one image
  - Updated parity/readiness ledgers to mark `images` recovered.
  - Remaining Phase 6 rows:
    - `code-highlighting`
    - `markdown-preview`
    - `markdown-shortcuts`
    - `scroll-into-view`
    - `shadow-dom`
    - `styling`
    - `tables`
- 2026-04-21: Continue checkpoint after `images` ledger sync.
  - Verdict: keep course.
  - Harsh take: completion-check is doing its job; flipping it before Phase 6
    and Phase 7 close would be fake progress.
  - Why: `images` is recovered, no mixed rows remain, but eight open example
    rows and the full current-vs-legacy core helper-family compare are still
    active owners.
  - Risks: source-close parity can still be overfit if browser proof only
    checks mount; each row needs a behavior proof tied to the legacy intent or
    an explicit cut rationale.
  - Earliest gates:
    - row-specific Playwright example test
    - `bun run lint`
    - `bun completion-check` must keep failing while status is `pending`
  - Next move: recover the next small open row before the heavier
    `code-highlighting`, `markdown-*`, and `tables` rows.
  - Do-not-do list:
    - do not mark completion while open rows remain
    - do not treat source similarity as behavior proof
    - do not rewrite examples just to raise similarity scores
- 2026-04-21: Resolved Phase 6 `custom-placeholder` row.
  - Read current and legacy `site/examples/ts/custom-placeholder.tsx`.
  - Current source is equivalent to legacy aside from current type-only import
    syntax.
  - Ran:
    - `bunx playwright test ./playwright/integration/examples/placeholder.test.ts --project=chromium`
  - Proof is green for:
    - custom placeholder rendering
    - editor height large enough for the placeholder host
  - Updated parity/readiness ledgers to mark `custom-placeholder` recovered.
  - Remaining Phase 6 rows:
    - `code-highlighting`
    - `markdown-preview`
    - `markdown-shortcuts`
    - `scroll-into-view`
    - `shadow-dom`
    - `styling`
    - `tables`
- 2026-04-21: Continue checkpoint after `custom-placeholder`.
  - Verdict: keep course.
  - Harsh take: this row was stale bookkeeping, not real runtime debt; keeping
    it open would waste future loops.
  - Why: source is effectively legacy parity and the focused placeholder
    browser proof is green.
  - Risks: remaining open rows are harder because several are true rewrites,
    not stale classifications.
  - Earliest gates:
    - row-specific Playwright example test
    - source read against legacy same-path file
    - `bun completion-check` must keep failing while status is `pending`
  - Next move: inspect `styling` or `shadow-dom`, because both have small
    source footprints and should classify quickly before the parser/highlighter
    rows.
  - Do-not-do list:
    - do not rewrite large examples just for diff similarity
    - do not mark recovered without a behavior proof or explicit cut
    - do not mark completion before Phase 7 closes
- 2026-04-21: Urgent richtext history regression fixed.
  - Trigger:
    - manual `/examples/richtext` report: Cmd+Z after typing did not update
      the visible editor.
  - Root cause:
    - keyboard/native history undo and redo mutated the Slate model but did
      not force a view repair on the browser-native DOM text path.
    - the browser test handle already forced render after undo/redo, so the
      earlier proof was too narrow and missed the real hotkey path.
  - Added proof:
    - richtext browser typing + keyboard undo hotkey
    - Mac-user-agent keyboard undo DOM repair row
  - Fixed:
    - `packages/slate-react/src/components/editable.tsx` now forces render
      after keyboard undo/redo and native `historyUndo` / `historyRedo`.
  - Verification:
    - connected local Chrome 146 on `http://localhost:3100/examples/richtext`
      shows model and DOM both remove `Undo Me` after `Meta+Z`
    - `bunx playwright test ./playwright/integration/examples/richtext.test.ts --project=chromium`
    - `bunx playwright test ./playwright/integration/examples/large-document-runtime.test.ts --project=chromium -g "undo|redo|delete"`
    - `bun test ./packages/slate-react/test/large-doc-and-scroll.tsx --bail 1`
    - `bun test ./packages/slate-react/test/projections-and-selection-contract.tsx --bail 1`
    - `bun run lint:fix`
    - `bun run lint`
    - `bunx turbo build --filter=./packages/slate-dom --filter=./packages/slate-react --force`
    - `bunx turbo typecheck --filter=./packages/slate-dom --filter=./packages/slate-react --force`
  - Rejected tactic:
    - do not rely on browser-native undo to clean the DOM after Slate model
      history changes; the runtime owns the repair.
  - Next owner remains:
    - Phase 6 open example parity rows, then Phase 7 core helper-family compare.

## Errors Encountered

| Error | Attempt | Resolution |
| --- | --- | --- |
| Partial shelled selection did not mark the root shell-backed | Initial browser proof | Fixed `Editable` to mark explicit shell-backed state for browser-handle/model selections. |
| Selector/subscription shell-backed tracking regressed 5000-block typing | Runtime fix attempt | Removed root rerender subscription; kept explicit shell-backed state for broad selection paths only. |
| Browser proof used stale package output | First partial-row rerun | Rebuilt `slate-dom`/`slate-react` before rerunning Playwright. |
| Firefox/WebKit undo after direct DOM sync did not remove inserted text | Phase 3 desktop expansion | Classified as Phase 4 owner instead of hiding it under IME/selection proof. |
| iOS/Appium contenteditable input is not reliable enough for automated behavior proof | Mobile proof review | Deferred mobile runtime proof with existing tooling evidence; do not call Playwright mobile emulation real IME proof. |
| DOM-only undo proof was too weak | Phase 4 model assertion | Reverted unproven runtime experiments; next slice must establish model+DOM typing proof first. |
| Playwright contenteditable mutation did not imply Slate model mutation | Phase 4 model assertion | Added browser-handle model read/write proof; keep DOM-only typing assertions out of Phase 4 closure. |
| Native input/keydown/MutationObserver model-sync attempts stayed unproven | Phase 4 runtime experiments | Reverted runtime experiments; keep model-owned proof and classify physical non-Chromium hotkeys separately. |
| Physical non-Chromium undo hotkeys did not deliver a trustworthy model/history signal | Phase 4 browser expansion | Kept model/history proof through browser handle; track physical shortcut transport separately if product needs it. |
