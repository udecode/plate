---
title: Document import and conversion fidelity
type: decision
status: accepted
updated: 2026-09-27
review_scope: imports
current_review: 2026-09-27-imports-adversarial-audit-feedback
reconciled_executions:
  - 2026-09-25-document-conversion-contracts-design
  - 2026-09-25-document-conversion-schema-admission-design
  - 2026-09-26-document-conversion-vocabulary-design
  - 2026-09-26-document-conversion-vocabulary-doctrine-design
  - 2026-09-27-document-conversion-contracts-implementation
review_history:
  - ../review-records/2026-09-25-imports-document-slice-loss-contract.json
  - ../review-records/2026-09-25-imports-codec-ontology-final.json
  - ../review-records/2026-09-25-imports-codec-ontology-closure.json
  - ../review-records/2026-09-25-imports-schema-admission-recovery.json
  - ../review-records/2026-09-26-imports-conversion-vocabulary-hard-cut.json
  - ../review-records/2026-09-26-imports-conversion-vocabulary-doctrine-closure.json
  - ../review-records/2026-09-27-imports-adversarial-audit-feedback.json
source_refs:
  - ../../../packages/platejs/src/lib/plugins/html/HtmlPlugin.ts
  - ../../../packages/platejs/src/markdown/lib/MarkdownPlugin.ts
  - ../../../packages/platejs/src/docx/import/lib/importDocx.ts
  - ../../../packages/plitejs/src/dom/plugin/data-transfer-format.ts
  - ../../../packages/plitejs/src/core/editor-schema.ts
  - ../../../packages/plitejs/src/core/slice-fit/compiled-slice-fitter.ts
  - ../../plite/research/2026-09-25-document-codec-architecture/README.md
  - ../../plite/research/2026-09-25-document-codec-architecture/api-ontology.tsv
related:
  - ../reviews.md#imports
  - export-fidelity.md
  - documents-conversion-fidelity.md
  - persistence-ownership.md
---

# Document import and conversion fidelity

The [adversarial audit feedback](../../plans/artifacts/2026-09-27-document-conversion-audit-feedback/feedback.md)
reopens implementation closure for HTML transfer parity, fragment admission,
observable recovery, finalized AI output, DOCX cancellation and comment adoption.
Three source probes reproduce two HTML discrepancies and silent inline Markdown
truncation. Existing proof remains valid for its exercised cases. Public naming
and format ownership remain settled; diagnostic deletion and DOCX native-state
deletion are not accepted consequences of this review. Typed persistence
flattening is a design candidate, not an adopted contract.

**Use direct format-owned parse and serialize operations.** Do not introduce a
public `DocumentCodec`, `DocumentFormat`, format registry, dispatcher,
intermediate AST, conversion session, compiler, or shared cross-format result.
These formats share private compilation mechanics, but they do not share one
round-trip law, failure contract, environment, extras shape, retained-source
lifetime, or polymorphic caller.

Reserve `codec` for a typed current persistence pair. `EditorValueCodec` maps
live state to admitted canonical JSON and owns both direction laws.
`EditorValuePersistence` separately owns the envelope version and decode-only
legacy inputs. Browser MIME negotiation is a
`DataTransferFormat`; plugin syntax declarations are feature format mappings.
The former `HostCodec` and plugin `codecs` nouns are hard-renamed with no
compatibility aliases on `next`.

## Parse shapes

Complete-file import returns `EditorDocumentValue`. Selection, clipboard, and
generated insertion return `ContentSlice`. Inline Markdown is a distinct parse
operation that also returns `ContentSlice`; raw descendant arrays are not a
third carrier. Callers never recover one shape from another by taking
`.children` or wrapping arrays.

HTML exposes `parseHtml` and `parseHtmlSlice`; Markdown exposes
`parseMarkdown`, `parseMarkdownSlice`, and `parseMarkdownInline`. The default
parse consumes a complete document, so `Document` is redundant while slice and
inline carriers stay explicit. Matching editor APIs use `parse`, `parseSlice`,
and `parseInline`. Plate privately captures and compiles plugins and schema;
callers do not construct an editor or public conversion context. HTML and
Markdown stay synchronous. Async DOCX import captures every conversion input
before its first await and rejects cancellation with the signal reason.

Use `parse`/`serialize` for text syntax conversion, matching parse5, unified,
and ProseMirror. Reserve `encode`/`decode` for typed paired representations with
direction laws, including `EditorValueCodec`, plugin mappings, and
DataTransfer formats. DOCX remains `importDocx`/`exportDocx`: ZIP parts,
comments, retained source, cancellation, assets, and native review make it a
file-package workflow rather than another text parser.
Best API, Plate vision, generated mirrors, and Plate Next doctrine v240 teach
the same reusable law. Vocabulary adoption is recorded; the audit feedback above
identifies uncovered behavioral requirements and limits the completion claim.

## Results and diagnostics

Each format owns its parse and serialize result and diagnostic unions. Success
contains the requested carrier plus warnings only. Failure contains no carrier
and a nonempty tuple beginning with an error. Tolerant recovery may still
succeed, but every Plate-controlled fallback, fit, unwrap, filter,
unknown-node drop, unsupported construct, and unsafe-content removal is
reported. Custom mappings own their declared projection laws because the
framework cannot infer arbitrary semantic loss inside user code.
Plugin/configuration and programmer invariants throw.

Do not model “soft errors.” A warning accompanies a usable, schema-valid
carrier and states a recovery or intentional projection. An error means that
operation produced no publishable carrier. This keeps callers from accidentally
using a result whose validity depends on inspecting a severity convention.

Encoded source and canonical model use separate optional coordinate fields.
One flattened location cannot identify both truthfully. Schema assertion
failures are adapted into the owning format's diagnostics rather than creating
a universal diagnostic class.

Schema assertion is deliberately fail-fast. A format operation may collect
ordered parser, mapping, repair, and representability diagnostics across its
own stages, but one failed canonical assertion contributes the first precise
`EditorSchemaValidationDiagnostic`; there is no current UI or branching caller
that justifies an aggregate public schema-validation API.

Plite keeps `assertDocument` and `assertFragment` as the canonical throwing
validation boundary. `fitDocument` remains explicit coercion. Format parsers
consume a private semantic fitting report so every framework-owned repair is
observable; no Zod, Standard Schema, `validateDocument`, or generic
`safeParseDocument` API earns a current job. The report uses zero-to-many input
and output locations because merges, defaults, drops, splits, wrapping, and root
creation are not one-to-one operations.

Validation, recovery, and representability remain distinct. The compiled
plugin schema decides whether model data is canonical; it does not decide what
unknown HTML, Markdown, or OOXML means. Each fit repair records whether it
preserves every input model fact or loses one. HTML, Markdown, and DOCX reject
lossy recovery by default and accept it only under their explicit
`lossPolicy: 'allow'`, with the exact warning. Callers that require no recovery
can reject any warning without another parser mode.

An unknown model element under a closed schema is never converted generically
to a paragraph. An open schema's lawful `unknown: 'preserve'` element stays
unchanged and fails admission if it cannot be placed; schema defaults construct
required content rather than reinterpret unknown content. A format may map or
unwrap a known external construct only through an explicit mapping and
diagnostic. This keeps a missing plugin, custom block, table, media node,
secondary root, or property from becoming plausible-looking prose after silent
data loss.

Export uses the same schema authority more strictly: assert the captured
document, project authored state, assert the projection, then test target-format
representability. Export never calls `fitDocument`. Persistence and native
authored payloads likewise require strict admission after their explicit
migrations; format recovery policy cannot weaken those boundaries.

Browser transfer preserves the settled boolean insertion API while making
negotiation observable. Each `DataTransferFormat` returns a warning-only slice
success, a nonempty diagnosed failure, or `null` for mismatch. The DOM owner
retains rejected and unfit richer attempts when a later format wins and emits
one `DataTransferReport` only after an accepted commit, completed write, or
final unhandled result. This prevents HTML/Word parse warnings from disappearing
inside `ContentSlice | null` without inventing a universal conversion result or
changing `insertData` into an analysis API.

## Fidelity and source ownership

HTML and Markdown carry visible semantic syntax only. Delete their hidden
authored envelopes, trust options, correspondence hashes, and authored parser
entrypoints. They duplicate native persistence, give one file two competing
authorities, and have no production caller. Accepted and proposed projections
remain available and diagnose omitted model facts.

Exact review state uses the canonical authored document:
`JSON.stringify(snapshot.review)` writes its already JSON-compatible model and
`parseAuthoredDocument(json)` validates the read path. Do not add a parallel
serializer or rename this to a codec. DOCX keeps its own authored package part,
`DocxSource`, comments, limits, diagnostics, and package correspondence because
Word revisions and retained source are real format jobs. HTML and Markdown do
not gain a universal retained-source sidecar. CSV remains table/plain-text
ingress and needs a separate failure-semantics review.

## Validation benchmark

ProseMirror remains the structural-schema benchmark: checked construction,
whole-tree validation, and fill operations are separate. CKEditor has the
strongest contextual schema checks and post-fixer model, but its repair path is
live mutation rather than a detached diagnosed admission result. Slate can
express arbitrary normalization but may delete or wrap content imperatively;
Lexical validates registered serialized node types without a comparable
declarative document grammar; Tiptap adds useful strict-content switches but
also retains permissive fallback paths around ProseMirror.

Plite supplies Plate's complete admission substrate: one plugin-compiled
grammar covers JSON shape, element/content rules, property values and
placement, named and element-owned roots, immutable path diagnostics, schema
identity, and incremental validation. Reported fitting, impact classification,
explicit format loss policy, and the no-fit export law complete that boundary.
Do not add a second Zod or Standard Schema document grammar; those tools may
validate a format envelope or application-owned metadata, but the compiled
editor schema remains the sole model authority.

## Server HTML

Browser and server HTML share parse5 for WHATWG tree construction. The browser
materializes parse5 nodes directly into the owner document of a detached
template fragment without an HTML injection sink. `platejs/html/server` uses
LinkeDOM as
an inert DOM facade for feature mappings. The server path accepts explicit
byte, node, and depth limits and does not mutate ambient DOM globals or evaluate
scripts/resources. Parse5 appears only in graphs that retain HTML parsing;
non-HTML graphs exclude it. LinkeDOM and Node built-ins remain server-only.

The production public entrypoint passes the frozen 10 KB through 3.17 MB
benchmark, malformed/security/mapping corpus, SSR and packed-consumer checks,
and browser isolation checks. Happy DOM is not the built-in adapter:
its stress workload retained hundreds of megabytes per parse and exhausted a
4 GB process.

## Ownership

- Plite owns canonical documents and slices, schema assertion/fitting,
  versioned JSON codecs, and browser DataTransfer formats.
- Plate core owns feature format mappings and private frozen compilation.
- HTML, Markdown, and DOCX own syntax, options, results, diagnostics, limits,
  and native/source behavior.
- Applications own file selection, text/byte decoding, complete-value
  replacement, user feedback, and URL/resource policy.

The research baseline, final 349-row disposition, complete affected-export
diff, fixed-source research, rejected alternatives, browser/server probes, and
promoted proof packets live in
`docs/plite/research/2026-09-25-document-codec-architecture/`.
