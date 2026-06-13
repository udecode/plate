# Huge-Document Native Selection Research

Date: 2026-06-12
Mode: slate-auto research packet
Status: kept, promoted, and promoted packets closed

## Verdict

Slate v2 should not try to make huge-document vertical selection purely native.
That is the wrong take. ProseMirror leaves ordinary vertical selection to the
browser because its DOM is present; Slate v2 partial DOM cannot trust native
selection when the target line may be absent. The right next packet is stricter
projection proof plus residual metric exposure, then reversible optimization
only if the metric points to a real hot path.

## Current Slate v2 Read

- Current v2 has direct behavior proof for staged and virtualized huge-document
  vertical selection, screenshots, model/native/view checks, and double-highlight
  assertions.
- Current v2 already prevents the old dirty fix class: virtualized repeated
  `Shift+ArrowDown` / `Shift+ArrowUp` is checked against staged focus-step
  parity and asserts no model-line fallback.
- The previously weak lanes are now closed:
  - start-block repeated `Shift+ArrowDown` is covered by the 50-step
    cross-editor benchmark;
  - staged/full-DOM parity is covered by the 50-step staged keyboard command
    benchmark on active-DOM-group and content-visibility surfaces;
  - select-all delete undo bulk-restore p95 is covered by a five-iteration
    200k staged/virtualized trace.
- Legacy Slate's huge-document example is chunking-first with a shallow test.
  It is useful as a baseline, not as a quality target.

## External Synthesis

ProseMirror:
- `coordsAtPos`, `posAtCoords`, and `endOfTextblock` form the mature browser
  geometry surface.
- It explicitly lets the browser own normal shifted text selection and captures
  vertical keys only when block/node selection behavior needs editor ownership.
- This supports Slate v2's hybrid rule: native when DOM coverage is reliable,
  projected/model-owned when DOM is partial.

Lexical:
- Selection is explicitly dirty-tracked.
- `$setSelection` marks selection dirty and clears cached nodes.
- `$selectAll` is model-level root selection, not a native-DOM all-text range.
- Useful contrast: select-all and mutation cost should be model/projection
  measured separately from native text selection.

Tiptap:
- Mostly reuses ProseMirror behavior here. Treat as duplicate support, not an
  independent source of truth.

## Promoted Packet

Lead: `huge-doc:projection-metric-honesty`

Owner:
- `slate-ar-perf` for benchmark packet;
- `slate-browser` only if repeated Playwright extraction becomes duplicated.

First command:

```bash
cd .tmp/slate-v2 && CROSS_EDITOR_HUGE_REPEATED_SHIFT_DOWN_COUNT=50 CROSS_EDITOR_HUGE_REPEATED_SHIFT_DOWN_MODE=held CROSS_EDITOR_HUGE_STRICT_REPEATED_SHIFT_DOWN=1 bun run bench:react:huge-document-cross-editor:local
```

Exit rule:
- artifact records start-block and middle-block repeated vertical selection
  separately for Slate auto, Slate virtualized, ProseMirror, and Lexical;
- artifact records command p50/p75/p95, paint-after-command p50/p95,
  long-task max, projection profiler summaries, selected-text monotonicity, and
  DOM budget;
- if Slate residual is only p95 noise with no long task and no projection hot
  phase, keep current runtime and tighten claim wording;
- if one projection phase dominates, run one reversible cache/geometry packet
  with keep/revert/quarantine metrics;
- if behavior parity or screenshots fail, route to `slate-patch` before perf.

Packet result:
- Before patch, strict 50-step held repeated ShiftDown failed on
  `slateAuto startBlock` at step 33: selected text length `253 -> 253`.
- Strict-off attribution showed `slateAuto startBlock` repeated ShiftDown p95
  `239.7ms`, command p95 `221.2ms`, with
  `plain-vertical.resolve-model-line-target` dominating about `19s` total.
- `slateVirtualized`, ProseMirror, and Lexical stayed near `16ms`.
- Kept patch:
  `.tmp/slate-v2/packages/slate-react/src/editable/dom-coverage-vertical-selection.ts`
  uses the existing cheap adjacent single-text-block extension before the
  expensive model-line fallback when leaving a rendered line.
- After patch, strict cross-editor passed and `slateAuto startBlock` repeated
  ShiftDown p95 was `15.4ms`; middle-block p95 was `15.8ms`.

Second command:

```bash
cd .tmp/slate-v2 && SLATE_STAGED_COMMANDS_REPEATED_SHIFT_DOWN_COUNT=50 SLATE_STAGED_COMMANDS_SURFACES=stagedDefault SLATE_STAGED_COMMANDS_ASSERT_FULL_DOM_PARITY=1 bun run bench:react:huge-document-staged-keyboard-commands:local
```

Exit rule:
- staged projected steps remain equal to full-DOM steps;
- no native double highlight;
- `plain-vertical.resolve-model-line-target` count stays zero for the promoted
  fast path;
- `Shift+ArrowUp` retraces the preceding focus keys.

Packet result:
- Passed after patch.
- Repeated ShiftDown p95 `21.7ms`.
- Select-all/delete/undo remained bounded: select-all p95 `24.9ms`, delete p95
  `45.7ms`, undo-delete p95 `68.2ms`.
- Focused Playwright repeated-selection proof also passed 3 Chromium tests with
  screenshots/no-double-highlight and staged/full-DOM parity.

## Rejected Leads

- "Make virtualized selection native." Rejected. Missing DOM makes the browser
  select the wrong thing or nothing.
- "Copy legacy Slate chunking behavior." Rejected. Legacy test only verifies
  chunk count and does not prove native selection, screenshots, undo, or perf.
- "Treat ProseMirror/Tiptap as proof that Slate v2 should not project
  selection." Rejected. Their DOM-present premise is different.
- "Optimize select-all undo before improving metric split." Rejected for now.
  The current browser tests allow 15s bounds; optimization without better p95
  attribution risks another fake win.

## Final Packet State

The promoted benchmark packets are closed and kept:

- Cross-editor 5k held ShiftDown rerun: Slate auto p95 `15.3ms`, Slate
  virtualized p95 `15.8ms`, ProseMirror p95 `15.8ms`, Lexical p95 `16.4ms`.
- Staged/full-DOM 10k parity: staged active-DOM-group repeated ShiftDown p95
  `14.1ms`, staged content-visibility p95 `14.2ms`; both matched 50 full-DOM
  reference steps.
- 200k select-all/delete/undo p95: staged undo-delete `45.6ms`, virtualized
  undo-delete `46.4ms`, both restored.
- Selection screenshot/helper promotion: existing
  `attachSlateBrowserSelectionScreenshot` plus no-double-highlight assertions
  cover the repeated visual proof pattern. Current visual-native-selection and
  huge-document projected-selection proof reused the helper; no new helper is
  needed.

Next checkpoints:
- do not reopen select-all undo unless a fresh metric exceeds the current
  bounded result;
- keep browser-unattributed long-task noise under benchmark claim-width
  discipline instead of treating it as a Slate runtime hot path.
