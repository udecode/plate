# Document import and conversion fidelity

Each format owns direct parse and serialize operations, its result and diagnostic unions, its limits and its source behavior. There is no public codec, format registry, dispatcher, intermediate AST, conversion session or shared cross-format result. The 2026-10-04 audit found the cross-format contract live and stopped; CSV deserialize has its own Pursue in the csv audit, and the [2026-10-06 documents plan](../2026-10-06-documents-review.md) deleted the DOCX `authoredTrust` mode ([triage audit](../2026-10-04-ledger-triage-audit.md), [corrections](../2026-09-27-document-conversion-architecture-corrections.md), [closure repairs](../2026-09-27-document-conversion-closure-repairs.md)). `node tooling/scripts/review-ledger.mjs show imports` prints the full history.

## Layer and owner

| Responsibility | Decision |
| --- | --- |
| Plite | Canonical documents and slices, schema assertion and fitting, versioned JSON codecs, browser `DataTransferFormat`s. |
| Plate core | Feature format mappings and private frozen compilation. |
| HTML, Markdown, DOCX | Syntax, options, results, diagnostics, limits and source behavior. |
| Applications | File selection, text and byte decoding, complete-value replacement, user feedback, URL and resource policy. |

### Names and shapes

| Operation | Shape |
| --- | --- |
| Complete file | `parseHtml`, `parseMarkdown`, editor `parse` → `EditorDocumentValue`. |
| Selection, clipboard, generated insertion | `parseHtmlSlice` and editor `parseSlice` → `ContentSlice`; Markdown has no standalone slice parser (see the `markdown` subject). |
| Inline Markdown | Editor `parseInline` → `ContentSlice`; raw descendant arrays are not a third carrier, and callers never unwrap `.children`. |
| Text syntax | `parse` and `serialize`, as in parse5, unified and ProseMirror. HTML and Markdown are synchronous. |
| Typed paired representations | `encode` and `decode`: `EditorValuePersistence<TValue, TEncoded>` with a positive `version` and decode-only `legacyDecoders`; reusable `valueCodecs` spread into it. `HostCodec` and plugin `codecs` were hard-renamed with no alias. |
| DOCX | `importDocx` and `exportDocx`, a file-package workflow; async import captures every input before its first await and rejects cancellation with the signal reason. |
| Typing | Standalone functions take any plugin list and type documents as `Value`; exact types come from generated editor types, since inferring over a full kit tuple exceeded TypeScript's depth. |

### Results and diagnostics

| Rule | Decision |
| --- | --- |
| Success and failure | Success holds the carrier plus warnings only; failure holds no carrier and a nonempty tuple starting with an error. No soft errors. Plugin, configuration and programmer invariants throw. |
| Recovery | Every Plate-controlled fallback, fit, unwrap, filter, unknown-node drop, unsupported construct and unsafe-content removal is reported; custom mappings own their projection laws. |
| Loss policy | HTML, Markdown and DOCX reject lossy recovery unless `lossPolicy: 'allow'`, with the exact warning. DOCX reports `schema-repair` and `unsupported-content`. |
| Coordinates | Encoded source and canonical model use separate optional fields; the fitting report has zero-to-many input and output locations. |
| Schema | `assertDocument` and `assertFragment` throw and fail fast with one `EditorSchemaValidationDiagnostic`; `fitDocument` is explicit coercion. The compiled editor schema is the only model grammar. |
| Unknown elements | A closed schema never turns one into a paragraph; an open schema's `unknown: 'preserve'` element stays and fails admission if it cannot be placed. |
| Export | Assert the document, project authored state, assert the projection, test representability; never `fitDocument`. |

### Transfer and HTML

| Rule | Decision |
| --- | --- |
| DataTransfer | Boolean imperative insertion. A format decodes to a `ContentSlice` or `null` to delegate; `accept` returning `false` skips it. A slice that does not fit falls through, finally to plain text. A throwing callback goes to `lifecycleErrorSink` and the next format runs. |
| Paste diagnostics | The mounted `EditorContent` delivers them through optional `onPasteResult`; Plate renders no default notification. |
| Clipboard HTML | Same parse5 safety and admission as `parseHtmlSlice` with `lossPolicy: 'allow'`; a mapping that throws or returns invalid output is reported and the next candidate decodes. |
| Block content in paragraphs | The decoder lifts a disallowed block child, such as `<img>`, into a sibling. Slice insertion never drops admitted content; it refuses atomically. |
| Plain-text fallback | New lines start with the root default block when the anchor block needs required properties. |
| Safety removal | Metadata, scripts, style sheets, handlers, script URLs and `aria-hidden` graphics are lossless; other SVG, MathML, objects, blocked `data:` media, frames and resource-loading styles are lossy and fail a `reject` parse. Unmapped embedded media is reported. |
| Server HTML | Browser and server share parse5; the browser builds a detached document node by node, and `platejs/html/server` uses LinkeDOM as an inert facade. Explicit byte, node and depth limits; no ambient globals or script evaluation. Every Plate graph that creates an editor includes parse5; raw Plite graphs do not. |
| Hidden authored envelopes | Deleted from HTML and Markdown; exact review state uses `JSON.stringify(snapshot.review)` and `parseAuthoredDocument(json)`. DOCX keeps `DocxSource`, comments, limits and diagnostics. |

Rejected, and why:

| Alternative | Why it lost |
| --- | --- |
| `DocumentCodec`, `DocumentFormat`, a registry, AST or session | Formats share private mechanics, not one round-trip law, failure contract, environment or caller. |
| Zod, Standard Schema, `validateDocument` or `safeParseDocument` | A second document grammar with no job. |
| An aggregate schema-validation API | No branching caller. |
| A retained-source sidecar for HTML and Markdown | Two authorities for one file. |
| Happy DOM as the server adapter | Retained hundreds of megabytes per parse and exhausted a 4 GB process. |

## What other editors do

| Editor | What it does | What Plate takes |
| --- | --- | --- |
| ProseMirror | Checked construction, whole-tree validation and fill are separate | The structural-schema benchmark. |
| CKEditor | Strongest contextual schema checks; repair is live mutation through post-fixers | Plate repairs in a detached, diagnosed admission result. |
| Slate | Arbitrary normalization that may delete or wrap content imperatively | Rejected as a recovery model. |
| Lexical | Validates registered serialized node types without a declarative grammar | Plate keeps one compiled grammar. |
| Tiptap | Strict-content switches with permissive fallbacks | Plate reports every fallback. |

The research run is `docs/plite/research/2026-09-25-document-codec-architecture/`.

## Main changes

- Format-owned parse results, loss policy and the transfer fallback chain replaced hidden envelopes and generic paragraph recovery.

## Open work

- CSV deserialize failure semantics. owner: the csv audit's Pursue. stop: its plan lands.
