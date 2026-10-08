# Tiptap: model and schema

## Empty nodes

- **Empty nodes.** `ueberdosis/tiptap@91c51be53c:packages/core/__tests__/isNodeEmpty.spec.ts:19-247` (21 tests) pins Tiptap's `isNodeEmpty`. By default a paragraph with no content is empty even when it carries attributes or marks, while text, a hard break or a mention makes it non-empty. A document whose only content is an empty paragraph, or an empty heading and paragraph, is empty; a document holding an image is not. With `ignoreWhitespace: true`, whitespace-only text, a lone hard break and a paragraph holding only either count as empty. The harvest routes generic empty-node rules to Plite's document contracts and node-specific ones to Plate node plugins (`docs/editor-test-harvester/tiptap/report.md:101`). Read at that commit on 2026-10-08; the 2026-05-10 harvest pinned no commit, but its cited lines match this one.

## Feature migrations

- Tiptap's mathematics extension ships a manual migration: `createMathMigrateTransaction` and `migrateMathStrings` replace `$...$` LaTeX strings in the document with inline math nodes in one transaction (`ueberdosis/tiptap@91c51be5:packages/extension-mathematics/src/utils.ts:16-100`). Tiptap has no document-level version chain. Source: `docs/plite/research/2026-08-17-document-schema-migrations/read-log.tsv:8`; reread at the pinned commit on 2026-10-08.
