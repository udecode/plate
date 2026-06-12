# ProseMirror View Source Summary

## Files Read

- `../prosemirror/view/test/webtest-composition.ts`
- `../prosemirror/view/test/webtest-selection.ts`
- `../prosemirror/view/test/webtest-domchange.ts`
- `../prosemirror/view/test/webtest-clipboard.ts`

## Useful Invariants

- Composition rows cover empty/end/start blocks, existing text, word
  replacement, marks, multi-child marks, cursor wrappers, decoration changes,
  overlapping transaction cancellation, rapid consecutive compositions, and
  cross-paragraph composition.
- Selection rows cover DOM selection import/export, model-to-DOM sync,
  coordinate round trips, wrapped line coordinates, node-boundary coordinates,
  RTL coordinates, selectable inline/block arrow movement, and
  `Selection.extend` fallback.
- DOM-change rows cover selection adjustment after native DOM mutation and
  ambiguous deletion/replacement step extraction.
- Clipboard rows cover node selection serialization, text selection context,
  open node preservation, external HTML cleanup, paste transforms, table
  wrappers, comment-bounded fragments, and custom parser/serializer hooks.

## Slate Translation

Do not copy ProseMirror's ontology. Translate these into Slate-native scenario
families: model selection/value, DOM/native selection, view selection markers
when projected, commit trace, follow-up typing, undo, screenshot/geometry when
visible, and focused commands.

## Current Coverage Mapping

- RTL DOM selection mapping and wrapped-line rectangles:
  `.tmp/slate-v2/packages/slate-browser/test/browser/selection.browser.test.ts`.
- Wrapped right-edge event ranges and RTL physical-to-logical edge mapping:
  `.tmp/slate-v2/packages/slate-dom/test/bridge.ts`.
- DOM-change selection repair and ambiguous native deletion/replacement pressure
  maps to existing Slate v2 proof: plaintext beforeinput target-range
  replacement, native partial replacement undo, mouse-drag replacement undo,
  slate-react selection reconciler target-range import/rejection, and deferred
  native text input repair contracts.
- Clipboard open-slice/context pressure maps to existing Slate v2 browser proof:
  paste-html imports ProseMirror list/text slices without exposing
  `data-pm-slice`, imports comment-bounded fragments without outside wrapper
  content, and imports external table clipboard HTML with rows, cells, and
  cell-local marks.
- Rapid consecutive and cross-paragraph composition pressure maps to new
  Slate v2 richtext proof: native Chromium cross-paragraph IME replacement,
  rapid consecutive synthetic compositions across blocks, and a synthetic
  transport guard that does not mutate React-owned expanded DOM ranges.
- Decoration-change composition pressure maps to new Slate v2 async-decoration
  proof: prop and hook decoration sources refresh while stepwise synthetic IME
  composition remains active, then the final composition commit preserves
  model, DOM caret, and rendered text.
- Composition overlap cancellation rows are still queued; they need a separate
  Slate-native scenario owner instead of being hidden under rapid,
  cross-paragraph, or decoration-refresh contracts.
