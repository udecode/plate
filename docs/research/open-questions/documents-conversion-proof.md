---
title: DOCX fidelity decisions and missing proof
type: open-question
status: resolved
updated: 2026-09-15
related:
  - ../decisions/documents-conversion-fidelity.md
  - ../sources/docx-interoperability-oss.md
---

# DOCX fidelity decisions and proof

The canonical conversion contract resolves this design packet. It does not
promise arbitrary Word-package fidelity or Microsoft Word certification.

| Question | Resolution |
| --- | --- |
| Import truth and failure | `DocxImportResult` returns one complete `EditorDocumentValue` on success and no document on expected package, limit, or decode failure. |
| Export input and capture | `exportToDocx(editor, options)` requires an explicit projection and captures the complete model editor once before asynchronous work. |
| Native authored correspondence | The private envelope is accepted only when its version, schema identity, package-part digests, and accepted/proposed projections match the Word-visible conversion. |
| Conversion runtime | One bounded OOXML inspection pass retains package facts; one Mammoth/installed-codec pass projects supported Word-visible content into the application schema. |
| Revisions and comments | Source-ordered sparse `DocumentChange` records represent supported revisions. Main-body comments retain rich bodies, ranges, author/date metadata, durable IDs, replies, and resolved state when present. |
| Resource boundary | Input, entry, expansion, relationship, revision, comment, XML depth, and XML node limits are checked with cooperative cancellation and explicit diagnostics. |
| Retained source | A literal `retainSource: true` success adds one opaque disposable source. Exact unchanged review export returns original bytes; edited export regenerates the body and overlays only safe closed root and one-section header/footer graphs with structured fallbacks. |
| Package and browser proof | Packed NodeNext, Bundler, Node import, SSR, and DCE consumers pass. Chromium proves invalid-file preservation and byte-exact retained-source import/export through the copied toolbar. |
| Native application proof | LibreOffice headlessly renders an edited retained-source overlay, re-saves it as DOCX, and the public importer reopens the native-saved file with the edit intact. |

Word paste keeps its existing media and table policy under `WordPastePlugin`.
Single-section headers and footers can survive edited export when their complete
relationship graphs are safe. Notes, body media ingestion, visible named-root
mapping, arbitrary package preservation, multi-section reconstruction, and
Microsoft Word certification remain outside this contract and are reported as
loss where applicable.
