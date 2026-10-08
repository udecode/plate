# ProseMirror: selection and caret

## Vertical selection and geometry

- ProseMirror's browser geometry surface is `posAtCoords`, `coordsAtPos` and `endOfTextblock` (`view/src/domcoords.ts:275-515`); `endOfTextblock` caches its answer by state and direction and reads flushed DOM state for vertical textblock boundary checks. Source: `docs/plite/research/2026-06-12-huge-doc-native-selection/sources/prosemirror-view-selection-summary.md:8-12`. Limit: unpinned local checkout read on 2026-06-12.

- ProseMirror's vertical key capture (`view/src/capturekeys.ts:244-264`) leaves ordinary shifted vertical text selection to the browser and takes ownership only when vertical movement needs node or block selection; that works because its whole document is in the DOM. Source: `docs/plite/research/2026-06-12-huge-doc-native-selection/sources/prosemirror-view-selection-summary.md:15-17`, `README.md:36-42`. Limit: unpinned local checkout read on 2026-06-12.
