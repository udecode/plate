# Final export architecture reassessment

Date: 2026-09-24

Verdict: **Pursue**, with three material corrections to the preceding review.
This is a source-only API and architecture judgment. It adds no product code
or runtime proof.

## Corrections

### Plain text is a real format job

The public serializing guide presents `nodes.map(NodeApi.string).join('\n')`
as plain-text export. The Node API reference correctly says `NodeApi.string`
concatenates descendant text without separators and is intended for offset
computations, not user-facing text. A top-level table therefore becomes
`Cell1Cell2` rather than a structural representation.

Do not change `NodeApi.string`; separator-free text is part of its offset job.
Pursue a schema-aware `text/plain` encoder through the existing codec family.
Plite can own structural defaults and exact slice behavior. Plate feature
codecs own richer representations such as table TSV and labels for atoms or
media. This does not justify a `TextPlugin` or a universal export runtime.

### Detached conversion cannot accept raw plugins as its contract

Current HTML codec preparation and feature mappings can depend on configured
plugin state. Creating an editor from raw plugins both activates editing
lifecycle and may fail to reproduce the captured editor's compiled settings.
The durable input is a document plus frozen schema/conversion configuration.

An editor-bound method should capture its current document and compiled codec
configuration before asynchronous work, then delegate. A standalone function
should compile conversion declarations without mounting an editing runtime.
The design pass must prove inference, configured overrides, named roots and
callbacks that currently close over editor state. A public compiler/context
object is not earned merely because the implementation compiles declarations.

### Static HTML cleanup flags are workaround API

`stripClassNames`, `preserveClassNames` and `stripDataAttributes` are public,
documented and tested, but have no in-repository product caller. They use
post-render string cleanup to make presentation HTML approximate semantic HTML.
Once semantic HTML has a public document-first path, target all three for
deletion. Static presentation components should emit their intended attributes;
semantic interchange should never render those presentation attributes first.

## Settled target

1. Plite owns canonical documents, authored projection facts and structural
   `text/plain` defaults. Projection produces a detached document plus factual
   diagnostics; it does not know HTML, Markdown or DOCX warning policy.
2. Plate feature and format owners map the projected document with one encoder
   per format. Each encoder returns data plus diagnostics, including the empty
   case. Separate ordinary/authored serializer names are unnecessary.
3. Semantic HTML and styled React rendering remain separate output families.
   Projection can be shared; interchange markup and presentation markup cannot.
4. JSON needs projection and validation, not a parallel JSON conversion engine:
   project the document, then stringify it. Keep validated authored import.
5. DOCX remains format-specific and its backend remains provisional. Clipboard
   retains synchronous slice/MIME/cut semantics while sharing format codecs.
6. The copied menu owns projection choice, file shell, styles/assets, filenames,
   notifications and delivery. It must consume diagnostics rather than recreate
   projection warning policy.
7. No `ExportPlugin`, universal `export(format)` dispatcher, universal export
   AST or all-format Plite package is justified.

The exact public signatures belong to the design plan. The API must support an
editor convenience path and a saved-document path without changing result shape
between ordinary and authored projections.

## Assessment of the supplied audit

The supplied audit reaches the right main conclusion: cut serializer-only
editors, keep format ownership and avoid a universal export abstraction. Its
plain-text and cleanup-option findings are valid and were missing from the
preceding review.

Three claims are too broad. Projection facts belong to Plite, while
format-specific warnings remain at their format owners. "The editor's plugins"
is not a sufficient detached input because current compiled/configured state is
the behavior to preserve. The added ProseKit, Milkdown, Editor.js, Portable
Text and Slate comparisons were not bound to the recorded source corpus, so
they do not support this immutable review. The universal claim that no open
source editor has unified export also exceeds the sampled evidence.

The restoration claim is only partially verifiable from immutable records:
the research closure binds the lead ledger and read log hashes. The other four
TSV files are structurally present but are not individually hash-bound by that
record. This is a proof-limit correction, not evidence of current corruption.

## Next owner

`$task design plan exports: document-first conversion, schema-owned format codecs, lifecycle-free rendering, and structural plain text`

The plan must settle one result contract, detached configuration capture,
semantic versus presentation HTML, complete-document roots/metadata, structural
plain text, format-specific diagnostics and the deletion sequence for authored
serializer names and static cleanup flags.
