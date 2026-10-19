# DOCX native editor state: who carries it inside the package

Question: does any editor or DOCX library carry its own editor state inside a .docx it writes, how does it restore that state, who wins when the visible Word content disagrees, and what do Word and LibreOffice do to that state on save?

Scope: the `documents` review scope, for `docs/plans/2026-10-06-documents-review.md`, which judges Plate's hidden `editor/authored.json` envelope. Fifteen local clones beside the repository, at the revisions in `repo-registry.tsv`: SuperDoc (`docx-editor`), eigenpal `docx-editor`, BlockNote, ckeditor5, tiptap, tinymce, Open-XML-SDK, docx, docxjs, python-docx, docx-redline-js, wordgard, windoc, opendoc and pandoc. Save behavior came only from Microsoft Learn, Microsoft Support, the ISO 29500 text as quoted on the SC34 WG4 list, and LibreOffice's bug tracker read through its REST API.

Stop rule: every clone has a disposition, and the save question has an official source or a stated evidence gap. Both hold.

Exclusions: no clone was built or run, no upstream test ran, Microsoft Word was not run, and the ISO 29500 PDF was not downloaded.

## Current verdict

No surveyed editor or library writes its whole-document editor state into a DOCX. The closest two, SuperDoc and eigenpal, store per-record caller data in Word's customXml data parts and tie each record to a visible content control, so the visible document decides whether a record still applies. pandoc writes metadata to custom properties and never reads it back. Plate's per-part digest check has no counterpart. SuperDoc carries exact application data beside the .docx in an outer archive, not inside it, and eigenpal splits the copy it saves from the copy it shares. Plate's envelope hangs off an unknown root relationship type, which ISO 29500 lets a conforming producer drop. LibreOffice has an open data-loss bug (tdf#61606) about custom parts confirmed only for spreadsheets; what Writer does to them in DOCX is an evidence gap.

These leads support the 2026-10-06 Pursue to hard-cut the envelope and keep exact state in canonical authored JSON (`promoted-ledger.tsv`).

## Files

- `repo-registry.tsv`, `query-ledger.tsv`, `lead-ledger.tsv`, `read-log.tsv`, `rejected-ledger.tsv`, `promoted-ledger.tsv`
- `shards/001-native-state-carriers.md`: the one shard of this run

Counts: 15 clones searched, 11 read past the pattern search, about 62 files read, 8 official web pages and 5 LibreOffice bug reports read, 15 leads kept, 14 rejected, 5 promoted. Next shard: none, because the question that could change the decision is answered and the remaining gaps (Word's handling of unknown parts, Writer's handling of customXml) cannot change a cut whose part restores only from byte-identical packages.
