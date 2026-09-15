---
title: DOCX conversion fidelity and source authority
type: decision
status: adopted
updated: 2026-09-15
review_scope: documents
current_review: 2026-09-15-documents-retained-source-implementation
review_history:
  - ../review-records/2026-09-14-documents-oss-fidelity-review.json
  - ../review-records/2026-09-14-documents-final-reassessment.json
  - ../review-records/2026-09-15-documents-canonical-conversion-implementation.json
  - ../review-records/2026-09-15-documents-retained-source-reassessment.json
  - ../review-records/2026-09-15-documents-retained-source-final-reassessment.json
  - ../review-records/2026-09-15-documents-retained-source-implementation.json
source_refs:
  - ../sources/docx-interoperability-oss.md
  - ../../plite/research/2026-09-14-docx-interoperability-oss/shards/plate-audit.md
  - ../../plite/research/2026-09-14-docx-interoperability-oss/shards/final-reassessment.md
  - ../../plite/research/2026-09-14-docx-interoperability-oss/proof/receipt.json
  - ../../plite/research/2026-09-15-docx-post-implementation-oss/README.md
  - ../../plite/research/2026-09-15-docx-post-implementation-oss/source-manifest.json
  - ../../plite/research/2026-09-15-docx-post-implementation-oss/read-log.tsv
  - ../../plite/research/2026-09-15-docx-post-implementation-oss/shards/retained-source-and-package-editing.md
related:
  - ../reviews.md#documents
  - authored-change-ownership.md
  - clipboard-content-fitting.md
  - ../open-questions/documents-conversion-proof.md
---

# DOCX conversion fidelity and source authority

**The semantic converter and explicit retained-source path are adopted and
implemented.** DOCX file conversion has one canonical import result, one
projection-aware export operation captured from one immutable editor snapshot,
structured fidelity diagnostics, bounded package work, and an opt-in source
artifact for exact unchanged reuse and safe edited package overlay. Word
clipboard fitting remains the separate `WordPastePlugin` job.

The implementation uses a bounded hybrid pipeline: direct OOXML inspection
owns package limits, revisions, comments, relationships, and sidecar
correspondence; one configured Plate codec pass owns application schema. It
does not add a universal document engine, Office abstraction, retained package
model, or public converter registry. `DocxSource` retains the admitted Blob and
a private immutable semantic baseline outside editor and document state. The
first-party app owns its lifetime and passes it explicitly from import to
export.

## Strongest justified cuts

1. **Delete public `exportAuthoredToDocx`.** `exportToDocx` and
   `exportAuthoredToDocx` are two public operations for one user job. The
   latter also owns a second schema serializer and reads live state after an
   asynchronous conversion. One `exportToDocx` must capture the editor once,
   require an explicit authored projection, and return the Blob with structured
   diagnostics.
2. **Delete `ImportDocxResult.nodes`.** Import currently returns competing
   `nodes` and optional `document` truths. The copied action always consumes
   `nodes`, discarding authored state, comments, and warnings. A successful
   file import must return one `EditorDocumentValue`; plain content is simply
   its `children`. A failed conversion must not return an empty replacement as
   if it succeeded.
3. **Delete `ImportDocxOptions.rtf`.** RTF is matching clipboard payload, not a
   `.docx` file-import option. The only scoped caller is its unit test. Word
   HTML/RTF cleanup stays in the paste adapter.
4. **Rename and move `DocxPlugin`.** It does not import or export DOCX files. It
   transforms Word clipboard HTML/RTF. The design target is an explicit name
   such as `WordPastePlugin` under a paste-specific entrypoint, while file
   import and export retain lazy entrypoints.
5. **Delete unconditional native-sidecar authority.** `editor/authored.json`
   may supplement a verified corresponding Word package. It cannot override
   changed Word content merely because its JSON shape is valid.
6. **Delete the parallel review serializer.** Authored owns canonical
   projections and before/after properties; installed codecs own Plate schema;
   DOCX owns Word encoding. A second literal tag/mark map is not a durable
   owner.
7. **Delete silent loss.** String warnings and Blob-only export cannot express
   which node, property, package part, image, root, comment, or revision was
   omitted. Use structured diagnostics and an explicit success/failure result.

The rename and API consolidation are target decisions, not instructions to
merge clipboard and file lifecycles. They remain different operations with
different source material and owners.

## Public experience

```ts
const model = useModelEditor();

const imported = await importDocx(model, bytes, {
  limits,
  retainSource: true,
  signal,
});

if (imported.ok) {
  model.update.value.replace(imported.document);
  const exported = await exportToDocx(model, {
    ...options,
    projection: "review",
    source: imported.source,
  });

  imported.source.dispose();
}

const plugins = [WordPastePlugin];
```

`useModelEditor()` supplies the complete document for load, replacement,
persistence, and snapshot conversion. Mounted commands, DOM access, and
selection continue to use `useEditor()`. The import and export result unions
share the DOCX diagnostic contract privately without adding a generic
conversion framework.

## Required semantic flow

```text
DOCX bytes
  -> bounded package reader
  -> one semantic mapper using installed schema
  -> EditorDocumentValue + Word comment facts + diagnostics

editor
  -> one synchronous immutable capture
  -> explicit accepted | proposed | review projection
  -> one DOCX encoder
  -> Blob + diagnostics

Word HTML + RTF
  -> WordPastePlugin
  -> existing transfer fitting and insertion
```

The file adapter may privately use HTML for selected content or direct OOXML
for package semantics. That is an implementation comparison, not a reason to
expose another public AST.

## Retained-source preservation

The first-party UI offers Word import and Word export in the same editor. A
user can import a package, edit one paragraph, and export while expecting
unrelated headers, footers, custom XML, and unknown parts to survive where
safe. Default semantic conversion still creates a fresh package and retains no
source bytes. A successful literal `retainSource: true` import adds an opaque,
immutable, disposable `DocxSource`; default and literal-false results cannot
expose one, while dynamic booleans require source-presence narrowing.

Exact original bytes require the complete matching schema identity, unchanged
review document, review projection, unchanged or unspecified imported comments,
and no explicit package metadata or page-layout override. Exact reuse bypasses
rendering and ZIP work. Edited export regenerates `word/document.xml`, then
preserves only safe relationship-closed root graphs and one-section
header/footer graphs. It omits active content, signatures, external
relationships, conflicts, unreachable parts, and ambiguous multi-section
headers or footers with structured diagnostics.

Retained bytes remain outside `EditorDocumentValue`, editor metadata, plugin
state, and generic persistence. No `DocxSession` is warranted: Plate already
owns transactions, selection, comments, schema, persistence, math, emoji,
media, tables, and custom nodes. Whole-ZIP passthrough remains insufficient:
generated owners stay authoritative, every copied graph must remain reachable,
and the final package must pass bounded validation and semantic reopen proof.

## Pre-adoption defects and incomplete contracts

- A ZIP-level reproduction changes only `word/document.xml` while retaining
  `editor/authored.json`. Import returns the stale native body with empty
  comments and warnings. Removing the sidecar returns the edited Word body.
- Review export captures markup, awaits DOCX conversion, then embeds a fresh
  `editor.read.value()`. A reproduction produced `ORIGINAL` in Word XML and
  `ORIGINALLATE` in the native part.
- Review export ignores configured static serialization and omits recognized
  element properties without equivalent diagnostics. Empty `w:rPrChange` and
  `w:pPrChange` records cannot represent arbitrary prior formatting even
  though authored snapshots contain the before/after facts.
- File import exposes point references after comment markers, not Word comment
  ranges. It omits author, date, replies, and resolution facts. The current
  docs therefore overstate comment fidelity.
- Revision reconstruction scans only `word/document.xml`, sorts revisions by
  timestamp, and repeatedly rebuilds a ZIP and runs Mammoth for the baseline
  and every cumulative revision. Causal ordering, overlapping moves, malformed
  dates, other Word parts, and large revision histories remain unproven.
- Current visible export consumes only `document.children`. Named roots and
  metadata have no visible Word mapping or loss report. A private sidecar is
  not visible-format support.
- The copied import action ignores every result field except `nodes`; a failed
  decode can replace the current document with empty content.
- Ordinary export returns only a Blob while invalid, unavailable, or
  unsupported images can be omitted inside the converter.
- File import opens an untrusted ZIP and may repeatedly expand and convert it
  without an explicit input-byte, expanded-byte, part, revision, time, or
  cancellation policy. This is a missing resource boundary; this review does
  not claim a demonstrated exploit.

## Correction to the first review

The first review was too eager about preserving Word-paste images and table
geometry. The deletion is real, but preservation is not automatically correct.
Word clipboard images can be RTF, local, data, CID-like, or remote payloads;
their safe conversion depends on the destination media/upload owner and size
policy. Table geometry can contain Word-specific layout debris. Keep the
current omission until a separate destination-policy comparison proves which
payloads are safe and useful, then make the supported and omitted cases
explicit. Do not turn the documents plan into a media or table redesign.

Standard Plate link parsing already applies its URL policy, and Mammoth's
external-file access is not enabled here. This review found a missing resource
budget, not a confirmed generic HTML-script vulnerability.

## Architecture comparison

| Lane                                | Final assessment                                                                                                                                                                                                                                                 |
| ----------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Keep/configure                      | Keep detached import, snapshot export, lazy dependencies, installed schema, remote-image opt-in, and app-owned styling. Configuration cannot repair competing result truths, stale authority, or the duplicate serializer.                                       |
| Delete/rename/consolidate           | Selected public direction: one import document, one export function, structured diagnostics, no file-import RTF, and an accurately named Word paste adapter. Delete the catalog-only `docxExport` identity if caller reconciliation confirms no independent job. |
| Repair HTML conversion              | Valid comparator. Reuse configured serialization and add exact Word mappings and diagnostics. HTML still cannot recover package facts discarded before it exists.                                                                                                |
| Direct OOXML adapters               | Strongest replacement candidate for file semantics, revisions, ranges, numbering, relationships, roots, and supported properties. Accept only after a matched prototype proves behavior and complete-operation cost.                                             |
| Retain the original package         | Selected and implemented as an explicit bounded source artifact for import, edit, then export. It stays outside editor state and requires source identity, invalidation, structured fallback diagnostics, and package plus semantic proof.                    |
| Universal document/Office framework | Stop. DOCX file I/O, Word paste, CSV, pagination, math, comments, media, and authored runtime retain separate user jobs and owners.                                                                                                                              |

## Proof and limits

The retained-source implementation passes 146 focused DOCX package tests, six
package-integration roundtrips, focused registry/provider tests, all affected
entrypoint lint and typechecks, public contract typechecks, the Plate package
build, website typecheck, generated registry/source parity, and packed
NodeNext, Bundler, Node, SSR, tree-shaking, export-parity, package-direction,
and optional-peer checks. Chromium proves invalid-file preservation and exact
byte reuse through the real file picker/download flow. LibreOffice headlessly
renders an edited overlay, re-saves it as DOCX, and Plate reimports the native-
saved file with the edit intact.

The retained-source production benchmark passes 506 assertions across normal,
large, stress, and pathological cohorts. Retained import p95 ranges from 30.23
to 943.40 ms within frozen matched-baseline budgets; exact export p95 ranges
from 0.47 to 1.77 ms; edited overlay p95 ranges from 19.92 to 982.70 ms while
preserving 8 to 900 closed root graphs. The content-free receipt is
`benchmarks/editor/benchmarks/results/plate-docx-retained-source-latest.json`.

The proof does not certify Microsoft Word, arbitrary package-preserving
roundtrips, imported body media, Word-equivalent layout, visible named-root
mapping, or hard cancellation inside synchronous third-party codecs. Body
edits still discard unknown body XML, and multi-section header/footer
reconstruction remains omitted. The aggregate registry test has one unrelated
expected-file-list failure caused by concurrent untracked rich-text editor
registry work; focused DOCX registry tests, generated registry, website
typecheck, and browser workflow pass. External repository suites and Microsoft
Word were not run. Proprietary converter internals and upstream runtime claims
remain outside this decision.
