---
title: Export fidelity
type: decision
status: accepted
updated: 2026-10-04
source_refs:
  - ../../plite/research/2026-09-24-export-architecture/README.md
  - ../../plite/research/2026-09-24-export-architecture/shards/001-direction.md
  - ../../plite/research/2026-09-24-export-architecture/shards/002-final-reassessment.md
  - ../../../packages/platejs/src/lib/plugins/html/HtmlPlugin.ts
  - ../../../packages/platejs/src/markdown/lib/internal/markdownConversion.ts
  - ../../../packages/platejs/src/docx/export/lib/exportDocx.tsx
  - ../../../packages/plitejs/src/authored/format.ts
  - ../../../packages/plitejs/src/core/plain-text.ts
  - ../../../apps/www/src/registry/components/editor/export-toolbar-button.tsx
related:
  - ../review-scopes/exports.json
  - authored-change-ownership.md
  - documents-conversion-fidelity.md
---

# Export fidelity

**Audit of 2026-10-04.** Pursue. The adopted export contract says an authored document without an explicit projection throws, yet standalone serializeHtml defaults it to the proposed projection, because each export path keeps its own copy of the guard instead of the shared projection helper owning it. The [triage audit](../../plans/2026-10-04-ledger-triage-audit.md) and records `2026-10-04-exports-audit` and `2026-10-04-exports-audit-2` hold the evidence.

The [adversarial audit feedback](../../plans/artifacts/2026-09-27-document-conversion-audit-feedback/feedback.md)
retains document-first format ownership but reopens the blanket conversion
closure claim. Detached HTML serialization already asserts its projection;
that proposed repair is a false positive. DOCX cancellation needs repair. That
round kept DOCX native-state attachment pending a decision on exact single-file
round trips; the [2026-10-06 documents plan](../../plans/2026-10-06-documents-review.md)
found no such job and deleted it. Existing artifact and performance receipts retain their
original, bounded claims.

**Use document-first conversion at the existing schema and format owners.** The
strongest cut is requiring an editing runtime to serialize a captured document.
Format adapters consume canonical document data and configured feature mappings.
Editor methods capture and delegate; server callers do not construct an editor.
The document-first base and final public vocabulary are adopted without a
public compiler or a complete DOCX rewrite. HTML and Markdown hidden payloads
are cut from the product surface.

HTML and Markdown use `parse`/`serialize`, not `encode`/`decode` or
`import`/`export`. Their standalone names are `parseHtml`, `parseHtmlSlice`,
`serializeHtml`, `parseMarkdown`, `parseMarkdownSlice`,
`parseMarkdownInline`, and `serializeMarkdown`; installed editor namespaces
shorten those to `parse`, `parseSlice`, `parseInline`, and `serialize`.
`Document` is redundant on the default complete parse. DOCX remains the file
workflow `importDocx`/`exportDocx`, with no editor namespace.
Best API, Plate vision, generated mirrors, and Plate Next doctrine v240 carry
the same reusable naming and hidden-authority law. Vocabulary adoption is
recorded; the audit feedback above limits the broader completion claim.

The [12-unit audit](../../plite/research/2026-09-24-export-architecture/shards/001-direction.md)
records the source evidence, ordinary and custom consumers, proposed call sites,
alternatives, ownership and proof limits. Seven external repositories across six
editor families were compared at fixed commits.
The [final reassessment](../../plite/research/2026-09-24-export-architecture/shards/002-final-reassessment.md)
adds the missed structural plain-text job, narrows detached input to frozen
conversion configuration and targets static HTML cleanup flags for deletion.
The [implementation outcome](../review-records/2026-09-25-document-first-export-contracts-implementation.json)
records completed adoption with current source, package, browser, artifact and
performance proof.

## Ownership and strongest cuts

- Plite owns EditorDocumentValue, ContentSlice, schema meaning, pure authored
  projection and structural plain-text defaults. The document-based authored
  algorithm serves detached conversion without a second checkpoint,
  ExportSession or projection store. NodeApi.string keeps its separator-free
  offset semantics. Plate feature mappings own richer text/plain behavior such as
  table TSV and atom labels.
- Plate owns feature mapping compilation and semantic HTML serialization built on
  its HTML compiler. Detached conversion consumes frozen schema and conversion
  configuration rather than a live editor. Complete-document input is explicit;
  clipboard slice traversal and fallback policy remain clipboard concerns.
  Video and audio export as HTML figures with native controls and a
  `<figcaption>` caption instead of unwrapping to their caption text.
  Clipboard writes run the same format order as paste and write each MIME
  type once: the first encoder that returns a string wins, `null` leaves the
  type to the next encoder, and a throw goes to the lifecycle error sink
  before the next encoder runs. Copy reports no loss; missing output is fixed
  by adding the mapping.
- Markdown keeps its full format compiler, feature mappings, remark settings,
  filters and AI/selection consumers. Serialization exposes accepted/proposed
  semantic projections through one document contract and one result shape.
- Styled React rendering remains a distinct presentation job. It captures before
  async work, consumes immutable input and uses one private projected view.
  Custom components and schema root slots remain supported. Semantic HTML owns
  clean interchange output, so static class/data stripping flags and hidden
  authored review envelopes do not exist.
- DOCX retains its lazy standalone entrypoint, explicit comments, diagnostics,
  source artifact and Word revision guarantees. Required Word semantics live in
  package and feature mappings rather than a copied React correctness kit. The
  measured hybrid backend remains the implementation.
- Copied UI owns projection choice, CSS/document shell, asset policy, filenames,
  toasts and delivery. Browser downloads and server responses need no shared
  delivery runtime. Inline CSS does not guarantee an offline HTML artifact.

Keep JSON/persistence at its existing owner: project, stringify and validate
rather than inventing a JSON conversion engine. Plain text is a real structural
format job; NodeApi.string is not its serializer. Clipboard retains synchronous
MIME negotiation, exact open slices and cut lifecycle while sharing encoder
internals. No universal ExportPlugin, format dispatcher, public universal AST
or all-formats-in-Plite package is justified.

A new OSS PDF backend remains deferred until its text/vector, pagination, fonts,
assets and native-output requirements can be compared. The existing public docs
already describe a Plus server PDF flow; its commercial internals were not
audited. Browser print and screenshots are separate application jobs. The
accepted removal of raster PDF/image items remains in force.

## Reconciliation with adopted work

The [authored-capture closure](../review-records/2026-09-24-exports-authored-capture-closure.json)
remains the completed and verified implementation for its exact captured source.
It established one revision before async work, targeted clean projection,
separate pending/conflicted counts, refusal of unrepresentable review DOCX,
an active-runtime capability guard and first-click menu behavior. Its package,
browser, native-artifact and projection benchmark receipts retain their original
limits. Those measurements are not complete export performance measurements.

The document-first implementation supersedes the earlier topology that rebuilt
BaseEditorKit or temporary editors for menu, HTML and DOCX work. The previous
capture and conflict behavior remains valid through the shared projection
contract.

The September 15 [documents decision](documents-conversion-fidelity.md) already
identified direct OOXML as a comparison candidate. Retain its source lease,
one canonical import/export result, independent Word paste owner, bounded
package work and the lease's document, comment and schema checks. No new
source comparison proves that a direct encoder is faster or more faithful than
Plate's hybrid for every case.

The earlier [presentation move](../../plans/2026-09-04-move-docx-export-presentation-to-registry.md)
also remains valid: optional themes belong to the registry, while required
conversion mechanics belong to the package. Promoting mandatory Word mappings
enforces that distinction; it does not restore an implicit package stylesheet.

Review preservation is format-specific. Exact Plate review state is canonical
authored JSON; Word review is DOCX revisions and comments. DOCX, HTML and
Markdown carry no hidden authored document. Their hidden envelopes were
deleted, and HTML and Markdown also lost their `review` projections, because
they duplicated persistence, created competing file authorities, and had no
production caller. Capture promised comments and
converter settings alongside the document; a block array alone may exclude
external thread state. Deliberate filters, unsupported content and conflicts
need distinct diagnostics at each format owner.

Suggestion identity and author eligibility remain under authored/suggestions.
This review does not reopen them or absorb the independent HTML, Markdown,
documents, table, media or AI feature audits.

## Adopted conversion contracts and proof

The [document-first contract](../../plans/2026-09-24-document-first-export-contracts.md)
is implemented. Standalone format functions accept a document plus source
plugin and schema declarations, while editor methods capture once and delegate.
The implementation privately compiles and freezes those declarations; there is
no public conversion object or universal export plugin. Each format returns its
own `{ data, diagnostics }` result, authored projection is pure Plite document
work, structural plain text keeps `NodeApi.string` unchanged, and styled React
rendering uses one private read-only projected view per document without editing
lifecycle activation.

The [runtime probe](../../plans/artifacts/2026-09-24-document-first-export-contracts/export-runtime-probe.json)
records exact Markdown and static HTML output digests in normal, fanout, stress
and pathological cohorts. One compiled conversion runtime and one projected
view per document beat the repeated-editor baseline in every cohort and pass the
frozen p95 budgets. The [DOCX receipt](../../plans/artifacts/2026-09-24-document-first-export-contracts/docx-export-proof.json)
covers accepted, proposed, review and retained-source artifacts, including
0/10/100-comment workloads. LibreOffice reopen/resave is the available native
viewer proof; Microsoft Word remains untested, and memory figures are
whole-process RSS.

The final conversion implementation adds direct diagnosed HTML and Markdown
parse/serialize functions, deletes their authored envelopes and review
projection, renames DOCX export to `exportDocx`, and makes DOCX import detached.
Package declarations, SSR, tree shaking, packed consumers, source types, full
package tests, strict Chromium, registry output, API reference, changesets, and
doctrine checks pass. LibreOffice reopens and resaves final accepted, proposed,
and review DOCX artifacts. New PDF selection retains its own unresolved output
contract.
