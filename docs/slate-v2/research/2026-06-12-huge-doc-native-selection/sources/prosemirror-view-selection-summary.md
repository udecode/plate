# ProseMirror View Selection Notes

Relevant source:
- `../prosemirror/view/src/domcoords.ts:275-515`
- `../prosemirror/view/src/selection.ts:9-215`
- `../prosemirror/view/src/capturekeys.ts:244-264`

Take:
- ProseMirror exposes mature browser geometry APIs: `posAtCoords`,
  `coordsAtPos`, and `endOfTextblock`.
- `endOfTextblock` caches by state and direction and uses flushed DOM state for
  vertical textblock boundary checks.
- `selectionFromDOM` and `selectionToDOM` are explicit bridge points between
  native DOM selection and model selection.
- Vertical key capture does not own normal shifted text selection; it only
  applies editor ownership when vertical movement would need node/block
  selection behavior.

Slate v2 implication:
- Copy the ownership principle, not the exact code. DOM-present editors can
  lean on native selection; Slate v2 partial DOM needs projected selection when
  native DOM cannot represent the target.
