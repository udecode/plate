# Tiptap: testing and proof

## Paste test helper

- Tiptap's Cypress paste helper (`tests/cypress/support/commands.js:74-100`) builds a `DataTransfer`, puts the data under one MIME type and dispatches a cancelable, bubbling synthetic `ClipboardEvent('paste')` on the subject. It never touches the native clipboard, so it proves the editor's paste handler, not browser paste. Source: `c70bacbd4a:docs/plite/research/2026-06-12-testing-oracles/sources/tiptap-summary.md:1-11`, `read-log.tsv:13`. Limit: unpinned local checkout read on 2026-06-12.

## What Tiptap's tests are good for

- **Mostly Plate policy.** Tiptap's tests are mostly a source of Plate product-policy cases, not editor-core architecture. A report-only harvest of a local ueberdosis/tiptap clone on 2026-05-10 classed 184 of its 276 test and support files as Plate-owned, 63 as portable-mixed, 21 as harness or placeholder and 8 as skip. The core pressure it found is narrow: paste transform ordering, mark-range boundaries, undo and redo shortcuts on non-Latin layouts, editor host lifecycle, read-only and focus, and a few document and empty-node basics. Evidence: `docs/editor-test-harvester/tiptap/report.md:12-16` and lines 30-42 of the same file. Limit: one reader's file-level classification; the harvest pinned no commit.

- **Invariants, not machinery.** Take invariants and proof shapes from Tiptap's tests: deterministic plugin ordering, mark-boundary behavior, undo and redo shortcuts on non-Latin layouts and collaboration-startup races. They do not justify importing Tiptap's command-chain API, ProseMirror integer positions, NodeView policy or demo UI into Plite (`docs/editor-test-harvester/tiptap/report.md:143-147`).

## Tests with no portable behavior

- **Skip these.** Some Tiptap tests carry no editor behavior worth porting: `ueberdosis/tiptap@91c51be53c:packages/core/__tests__/mergeDeep.spec.ts` (a generic deep merge), and in the same folder `extensionOptions.spec.ts` (Tiptap's option inheritance), `nodePos.spec.ts` (a query wrapper over ProseMirror integer positions) and `mergeAttributes.spec.ts` (HTML attribute merging inside Tiptap's render pipeline). Fourteen Cypress demo specs only visit a route and hold a `TODO: Write tests` comment, with no `it` block; they assert nothing (counted at that commit on 2026-10-08; `docs/editor-test-harvester/tiptap/report.md:53-55`, and lines 109-113).
