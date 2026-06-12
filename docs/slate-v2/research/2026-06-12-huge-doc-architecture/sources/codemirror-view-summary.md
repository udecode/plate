# CodeMirror View Summary

CodeMirror is the useful external source for huge-document architecture because
it explicitly models what is drawn, what is visible, how selection endpoints are
kept in DOM, and how scroll anchoring survives measurement.

Important source reads:

- `EditorView.viewport` and `visibleRanges` are public contracts for drawn and
  actually visible content (`../codemirror-view/src/editorview.ts:90-103`).
- If the main selection starts or ends outside the main viewport, extra
  single-line viewports are created so DOM selection does not land in a gap
  (`../codemirror-view/src/viewstate.ts:157-204`).
- Viewport computation uses a height map and explicitly includes scroll targets
  (`../codemirror-view/src/viewstate.ts:393-416`).
- Huge scroll heights are scaled around active viewports
  (`../codemirror-view/src/viewstate.ts:693-736`).
- The measure loop preserves scroll anchors and adjusts scroll offset after
  measured height changes (`../codemirror-view/src/editorview.ts:413-496`).
- Coordinate lookup distinguishes precise DOM-backed answers from estimated
  answers outside the drawn viewport (`../codemirror-view/src/editorview.ts:741-765`).

Slate pressure:

Keep Slate's hybrid DOM strategy, but make scroll/viewport stability a named
contract and add future metrics for scroll anchor drift, viewport settle frames,
and precise-versus-estimated coordinate behavior.

