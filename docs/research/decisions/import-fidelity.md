---
title: Document import and conversion fidelity
type: decision
status: accepted
updated: 2026-09-28
review_scope: imports
current_review: 2026-09-28-imports-paste-loss-reporting-review
reconciled_executions:
  - 2026-09-25-document-conversion-contracts-design
  - 2026-09-25-document-conversion-schema-admission-design
  - 2026-09-26-document-conversion-vocabulary-design
  - 2026-09-26-document-conversion-vocabulary-doctrine-design
  - 2026-09-27-document-conversion-contracts-implementation
  - 2026-09-27-document-conversion-architecture-corrections
  - 2026-09-27-document-conversion-closure-repairs
  - 2026-09-27-document-conversion-closure-repairs-final
  - 2026-09-28-document-conversion-standalone-value-types
  - 2026-09-28-document-conversion-open-findings
  - 2026-09-28-conversion-correctness-guarantees
  - 2026-09-28-paste-loss-reporting-repairs
  - 2026-09-28-paste-proof-and-media-html
review_history:
  - ../review-records/2026-09-25-imports-document-slice-loss-contract.json
  - ../review-records/2026-09-25-imports-codec-ontology-final.json
  - ../review-records/2026-09-25-imports-codec-ontology-closure.json
  - ../review-records/2026-09-25-imports-schema-admission-recovery.json
  - ../review-records/2026-09-26-imports-conversion-vocabulary-hard-cut.json
  - ../review-records/2026-09-26-imports-conversion-vocabulary-doctrine-closure.json
  - ../review-records/2026-09-27-imports-adversarial-audit-feedback.json
  - ../review-records/2026-09-28-imports-paste-loss-reporting-review.json
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
reopened implementation closure for HTML transfer parity, fragment admission,
observable recovery, finalized AI output, DOCX cancellation and comment adoption.
The [corrections](../../plans/2026-09-27-document-conversion-architecture-corrections.md)
and [closure repairs](../../plans/2026-09-27-document-conversion-closure-repairs.md)
adopt those repairs. Public naming and format ownership remain settled;
diagnostic deletion and DOCX native-state deletion are not accepted.

The [paste-loss follow-up](../review-records/2026-09-28-imports-paste-loss-reporting-review.json)
retains the conversion design. Its HTML findings live in parse results:
embedded media with fallback children reports unsupported content, and security
removal of SVG or object content is lossy. Clipboard negotiation reports no
loss; see the browser transfer decision below.

**Use direct format-owned parse and serialize operations.** Do not introduce a
public `DocumentCodec`, `DocumentFormat`, format registry, dispatcher,
intermediate AST, conversion session, compiler, or shared cross-format result.
These formats share private compilation mechanics, but they do not share one
round-trip law, failure contract, environment, extras shape, retained-source
lifetime, or polymorphic caller.

Reserve `encode`/`decode` for typed paired representations.
`EditorValuePersistence<TValue, TEncoded>` directly owns the current `encode`
and `decode` pair, its positive envelope `version`, and optional decode-only
`legacyDecoders`; reusable `valueCodecs` pairs spread into it with an explicit
version. Browser MIME negotiation is a
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
callers do not construct an editor or public conversion context. Standalone
functions take any plugin list and type documents as `Value`, like
`createEditor({ plugins })`; editor methods carry that editor's value type, and
exact document types come from generated editor types. Deriving an exact value
over a runtime tuple exceeded TypeScript's instantiation depth with a full
application kit. HTML and Markdown stay synchronous. Async DOCX import captures every conversion input
before its first await and rejects cancellation with the signal reason.

Use `parse`/`serialize` for text syntax conversion, matching parse5, unified,
and ProseMirror. Reserve `encode`/`decode` for typed paired representations with
direction laws, including `EditorValuePersistence`, plugin mappings, and
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
`lossPolicy: 'allow'`, with the exact warning. DOCX reports schema fitting as
`schema-repair` and mapping loss as `unsupported-content` under that policy;
Plate merges adjacent text left by its own revision projection before fitting,
so repairs describe schema changes rather than projection artifacts. Callers
that require no recovery can reject any warning without another parser mode.

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

Browser transfer keeps the boolean insertion API, and negotiation is not
publicly observable. A `DataTransferFormat` decodes to a `ContentSlice` or
encodes to a string, and returns `null` to delegate to the next format; `accept`
returning `false` skips it. Each decoded slice is fitted at the actual range,
and one that does not fit falls through to the next format and finally to plain
text. Encoders write each MIME type once. A callback that throws is a bug: it
goes to the editor's `lifecycleErrorSink` with the format key, MIME type, owner
and phase, and the next format runs, so a broken format never blocks paste or
copy. Nothing consumes per-attempt diagnostics, and announcing loss offers the
user no recovery, so negotiation carries no diagnostics, report or loss flag.
Loss is fixed where it occurs by adding the mapping that represents the
content, as the video and audio HTML mappings do.

Clipboard HTML runs the same parse5 safety and admission operation as
`parseHtmlSlice`, with `lossPolicy: 'allow'`. Transfer negotiation isolates
each mapping candidate: a mapping that throws or returns schema-invalid output
is reported to the lifecycle error sink and the next lower-priority candidate
decodes. Direct `parseHtml` and `parseHtmlSlice` throw that programmer failure
instead.

HTML allows block content such as `<img>` inside a paragraph; the editor grammar
does not. The HTML decoder lifts each disallowed block child out of its text
block into a sibling, splitting the text around it, so parse and paste keep the
image. Slice insertion never drops admitted content: a slice the fitter cannot
place refuses atomically, and negotiation falls back to the next format. Slice
admission checks vocabulary and content-root references, not closed-element
grammar, because the fitter repairs grammar losslessly where it can, for example
text pasted into a table cell. Replacing a range across blocks joins both
boundaries into the start block.

When a richer format fails, the built-in plain-text fallback starts new lines
with the root default block whenever the anchor block cannot be constructed
without required properties, such as a heading level. A `createsElement`
mapping such as `<li>` creates the schema default block when that block is one
of its targets, whatever the configured target order.

Parse results carry actual loss. HTML safety removal is mandatory and
classifies what it removed at the sanitizer: metadata, scripts, style sheets,
event handlers, script URLs and graphics inside an `aria-hidden="true"` subtree
are lossless, because the author declared them decorative; other SVG, MathML,
embedded objects, blocked `data:` media sources, inline frame documents and
resource-loading styles are lossy and fail a `reject` parse. Schema repairs
classify their own impact the same way. Audio and video map to HTML figures and
paste from bare media elements. The HTML decoder reports embedded media (`img`,
`video`, `audio`, `iframe`, `canvas`) that no installed mapping owns, including
when its fallback children survive; `<picture>` is a container whose `<img>`
reports for itself. Clipboard HTML keeps what maps and returns `null` when
nothing insertable remains, so plain text handles the paste. Clipboard keys
resolve through the runtime owner, so mounted views use the configuration their
DOM plugin activated.

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
materializes parse5 nodes node by node into a detached
`document.implementation.createHTMLDocument('')` document, which has no
browsing context, without an HTML injection sink. `platejs/html/server` uses
LinkeDOM as an inert DOM facade for feature mappings. Both paths accept explicit
byte, node, and depth limits and do not mutate ambient DOM globals or evaluate
scripts/resources. The core editor installs the HTML capability that clipboard
paste uses, so every Plate graph that creates or compiles an editor includes
parse5; raw Plite graphs exclude it. LinkeDOM and Node built-ins remain
server-only.

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
