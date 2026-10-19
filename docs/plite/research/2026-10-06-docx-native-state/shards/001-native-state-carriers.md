# Shard 001: native-state carriers in DOCX

Scope: the fifteen clones in `../repo-registry.tsv` and the official save-behavior sources in `../read-log.tsv`.

## Top leads

- `docx-native-state:no-surveyed-editor-embeds-whole-document-native-state-in-docx:source-inventory` (A). No clone writes whole-document editor state into the package.
- `docx-native-state:per-part-digests-are-unique-to-plate:inventory` (A). Other tools bind stored data to visible content by id and treat a lost anchor as an orphan; none binds it to package bytes.
- `docx-native-state:sidecar-beside-docx-not-inside:superdoc-export-api` (A). SuperDoc returns exact application data beside the .docx in an outer archive.
- `docx-native-state:save-copy-vs-export-copy-split:eigenpal-preserveOnExport` (A). eigenpal strips its payload markup from a shared copy or refuses to export it, the nearest prior art for the stale-envelope leak the review proved.
- `docx-native-state:app-payload-anchored-by-visible-control-and-swept-when-control-gone:eigenpal-source` (A). If an app payload must stay inside the package, the visible control decides whether it exists.
- `docx-native-state:unknown-relationship-preservation-is-optional:ecma-376-text` (C). A conforming producer may drop an unknown relationship and its part, which is how Plate's envelope is linked.

## Rejected and duplicate leads

Fourteen leads are rejected in `../rejected-ledger.tsv`. They cover repositories with no public DOCX code or with export only (ckeditor5, tiptap, tinymce, wordgard, windoc, BlockNote), libraries that own no editor state (docx, Open-XML-SDK, docxjs), the closed SuperDoc engine, save-behavior questions with no official source (Writer and customXml, Writer and docVars, Word and unknown parts), and eigenpal's Word-survival claim, whose round-trip fixture is byte-identical to its input.

## Score changes and next query

The SuperDoc clone is at `cabf6fae6816`, 69 commits behind the `3bad86724392` the 2026-09-14 pass read, and its DOCX engine is still a closed npm package. Next query: none for this decision.
