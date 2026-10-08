# Wordgard: selection and caret

## Line navigation

- In the 2026-09-09 nine-editor performance fixture, Wordgard at revision `b5ad0d057e2790c8cf971c85a9d2fb7e4a82da54` failed macOS line navigation, so it got no speed rank for that operation. Source: `docs/editor-audits/reports/editor-performance-research-iteration-2-2026-09-09.md:29`, `:57`. Limit: the preserved summary names neither the failing gesture nor the output; treat it as a lead, not a reproduced Wordgard bug.

- The cause of Wordgard's macOS line-navigation failure in the 2026-09-09 fixture, as the research read it in source: the default keymap lists the `Mod-ArrowLeft` and `Mod-ArrowRight` word bindings before the Mac `Cmd-ArrowLeft` and `Cmd-ArrowRight` line-side bindings, `Mod` is Cmd on macOS, and the first handler that returns true wins, so Cmd-Arrow moves by word in both directions and exact native navigation oracles fail (`wordgard/wordgard@b5ad0d057e2790c8cf971c85a9d2fb7e4a82da54:src/editor/keymap.ts:107-110`, `:185-192`). Source: `docs/plite/research/2026-09-09-editor-performance-iteration-2/read-log.tsv:7`, `repo-registry.tsv:2`. Limit: a source reading, not a reproduced Wordgard run.

## Custom selection kinds

- **Custom selection kinds.** `test/test-cellselection.ts` lines 1-179 at b5ad0d0 pin that a registered non-text selection maps every range it contains and keeps its kind through edits, and that table selections cover rectangular cells and keep their direction. Plite's `packages/plitejs/test/selection-protocol.test.ts` defines and maps a custom cell selection. Plate's `packages/platejs/src/features/table/lib/BaseTablePlugin.selection.spec.tsx` and `.slow.tsx` prove the `table-cell` kind, rectangular geometry, mapping and keyboard behavior (report.md:100).

## Cursor motion

- **Cursor motion.** `test/test-selection.ts` lines 36-249 at b5ad0d0 pin cursor motion over editable positions, isolation, atoms, grapheme clusters, bidi order, punctuation, CJK and forward and backward word boundaries. Plite covers it with `packages/plitejs/test/text-units-contract.ts`, `test/utils/string.ts`, `test/react/plite-string-coordinate-placement.test.ts`, its caret engine and its browser RTL and grapheme rows (report.md:101).

## Coordinates

- **Coordinate mapping.** `test/webtest-coords.ts` lines 18-191 at b5ad0d0 pin mapping between coordinates and model positions in both directions across wraps, affinity, hard breaks, atoms, text height, RTL, vertical goal columns, nesting and tables. Plite covers equal or harder surfaces in `packages/plitejs/test/dom/bridge.ts`, `test/react/plite-string-coordinate-placement.test.ts`, content-root navigation, table browser rows, pagination and huge-document vertical selection. Physical geometry needs focused browser rows (report.md:111).

## Nearest caret placement

- **Nearest caret.** `test/test-selection.ts` lines 168-186 at b5ad0d0 pin that the nearest caret placement avoids the inside of a surrogate pair, chooses a stable structural boundary and stays inside selectable inline content. Plite covers it with grapheme-aware geometry, text units and inline-void traversal in `packages/plitejs/test/dom/dom-geometry.test.ts`, `delete-contract.ts` and `query-contract.ts` (report.md:121, 165).
