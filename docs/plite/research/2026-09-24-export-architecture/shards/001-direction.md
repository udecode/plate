# Whole-document export: first-principles review

Verdict: **Pursue a document-first conversion boundary.** The strongest cut is
the requirement to create another editing runtime merely to convert a captured
document. Reuse the schema and feature codecs; keep format dependencies and
format promises separate. This is a direction for design, not an approved
backend implementation or a performance result.

## Job and hard laws

A caller has a canonical document and its application schema, chooses content
and output semantics, and receives a usable artifact with truthful losses. An
existing editor is one source of that input; saved content on a server is
another. Conversion must not require mounting, selection, history, collaboration,
normalization transactions, or activation of unrelated plugin lifecycles.

Capture the document, relevant conversion configuration, comments and source
lease before asynchronous work. Preserve custom schema identities, named-root
relationships, property meaning, accepted/proposed distinctions, and review
conflicts. No serializer can invent missing format semantics. A private native
envelope is preservation for Plate, not visible fidelity in another application.
Explicit clean projection must not accidentally embed excluded review content.

The ideal flow is:

```text
canonical document + schema/feature codec configuration
  -> native authored projection when requested
  -> format-owned encoding and diagnostics
  -> app-owned shell, assets, download/storage/delivery
```

Styled React presentation remains a distinct consumer of the same document.
Clipboard consumes an exact ContentSlice and synchronous MIME negotiation.
Neither job should dictate the whole-file conversion contract.

## What the completed repair did and did not settle

The model-switch audit and its three subsequent execution receipts established
single-revision capture, the cheaper targeted authored projection, conflict
reporting/refusal, the exact active-runtime guard and first-click menu behavior.
Retain those laws and the recorded proof. Do not rerun their tests as a substitute
for assessing this broader question.

Reopen the earlier rule that ordinary and authored HTML/Markdown must have
different caller APIs, and that the menu should own the capability branch.
The completed menu now derives projection warnings, constructs a BaseEditorKit
editor and serializes again. That is conversion coordination in copied UI.
The same work recurs in authored HTML and DOCX, including one temporary editor
per comment body. Earlier scope was the menu repair; the present request
explicitly includes all conversion owners and server consumers.

Keep the rejection of ExportPlugin, a universal Office/document engine, a
second checkpoint/store and a generic format dispatcher. Sharing a neutral
document boundary does not require those owners. Reconsidering a direct DOCX
encoder preserves the September 15 documents decision: its strongest candidate
was already direct OOXML, subject to a matched prototype. That prototype has
not been supplied by this source review.

## Decisive current-source observations

- `HtmlPlugin.ts:2669-2945` already compiles feature-owned semantic HTML encoders.
  It emits strings without React. Its public API at 2948 exposes only decode.
  Its host adapter catches reported encode failures and delegates; a file export
  cannot silently inherit that clipboard fallback policy. Traversal currently
  starts from `slice.content`, so whole-document named-root support is additional
  design work, not a free alias.
- `markdownConversion.ts:83-195` already accepts detached values and compiled
  feature codecs. Its runtime still closes over editor lookups; this is a reuse
  candidate, not an already independent pure compiler. AI consumers serialize
  a whole document, blocks, selected fragments and table cells with custom
  options. Those are real contracts to retain.
- `convertNodesSerialize.ts:94-135` warns to the console and returns no node
  when no serializer matches. Authored warnings alone do not describe that
  conversion loss. Deliberate allow/disallow filtering must remain distinguishable
  from an unsupported node that disappears accidentally.
- `renderStaticHtml.tsx:28-42` awaits ReactDOMServer before rendering the supplied
  editor. Its raw contract is a live renderer, not a captured export. Authored
  HTML creates another full editor from the original plugin inputs; the menu
  instead uses BaseEditorKit. Neither construction is a lifecycle-free renderer.
  Source inspection establishes construction, not a demonstrated subscription
  leak or latency regression.
- `exportToDocx.tsx:253-294,372-403` renders a new editor for the body and each
  comment, then converts HTML/CSS to OOXML. `docx-export.tsx` supplies columns,
  headings/bookmarks, TOC, equations and code handling needed by that format.
  Required encoding semantics belong with the format/feature owners; an app's
  fonts, page style and visual preferences remain optional copied configuration.
- `exportToDocx.tsx:193-220` describes roots/metadata as preserved in a native
  envelope even when a clean projection does not emit that envelope. The next
  design must make omission diagnostics projection-specific and test visible
  content separately from round-trip preservation.
- `readAuthoredProjection` already delegates to document-based admission.
  Expose or adapt that neutral capability at the authored owner rather than
  teaching every converter to install an authored editor. Full review segments
  still need correct schema/range mapping; do not infer that the entire heavier
  snapshot is already detached.
- `readAppStyles` in the menu inlines readable CSS and leaves cross-origin
  sheets/assets as URLs. The HTML file is not necessarily offline/self-contained.
  Asset embedding, credentials, URL resolution and document shell belong to the
  delivery environment, with explicit guarantees if offered.

## Audit census and dispositions

Expected 12 units; reviewed 12; excluded 0 within that boundary. Seven Pursue,
four Stop/retain and one Defer. All units have a disposition; DOCX backend
selection and PDF engine choice remain unresolved. This is not exhaustive
per-node fidelity, an import-engine audit, or a benchmark of every editor.

| Unit | Different current consumers | Strongest cut or replacement | Disposition and owner |
| --- | --- | --- | --- |
| Canonical JSON/persistence | saved model, review envelope, server data | Delete any new export snapshot model; use EditorDocumentValue with roots/meta and existing persistence/schema ownership | **Stop** adding a JSON export subsystem. Plite document/persistence owner stays canonical. |
| Authored projection/capture | menu, HTML, Markdown, DOCX, clean versus review | Adapt the existing authored document algorithm to detached input; remove repeated live capability branching from converters' callers | **Pursue**, Plite authored; Plate reexports by identity. Full range/property snapshot must preserve its stronger laws. |
| Text | selection copy, AI context, whole-document text | Reuse text/slice traversal; root order, block separators and atom fallback are format semantics, not a new TextPlugin | **Stop** adding a text subsystem; retain Plite primitives and format-owned selection of readable content. |
| Semantic HTML | host copy, HTML interchange, custom schema, server conversion | Public document serialization backed by the existing HTML compiler; no React/editor mounting and no silent host fallback | **Pursue**, Plate HTML codec owner. Named roots and diagnostics must be designed before promotion. |
| Styled HTML/React | copied HTML file, static document viewer, server-rendered page | Capture input/config before await; replace temporary mutable editor construction with an immutable rendering context | **Pursue**, Plate static/React. Keep explicit component mappings and root slots; semantic HTML cannot replace application presentation. |
| Markdown/MDX | download, server example, AI whole/block/selection/table, clipboard slice | One format encoder and projection-aware caller contract; delete serializeAuthored as a parallel serialization family | **Pursue**, platejs/markdown plus feature codecs. Keep filters, rules, remark options, IDs and open-slice behavior. |
| DOCX | ordinary file, tracked review, imported-source reuse, comments | Move required Word mappings out of copied React correctness kit; compare direct schema-to-OOXML with a document-first HTML hybrid | **Pursue** the ownership repair, platejs/docx/export. **Backend remains provisional** pending matched fidelity/scale proof. Retain source lease and explicit comments. |
| Clipboard egress | native copy/cut, selection fragments, multiple MIME fallback | Reuse encoder internals but retain ContentSlice, sync transfer and delegation policy | **Stop** merging clipboard and file lifecycles. Plite host codec and Plate transfer policy retain their jobs. |
| Losses/customization | unknown node/property, omission, conflicts, failed images, caller overrides | Results at each format owner; remove console-only or UI-reconstructed loss reports; reuse minimal diagnostic conventions without a universal result framework | **Pursue**, individual format APIs. Required mappings shipped by features; app overrides remain explicit. |
| PDF/print | documented Plus server PDF flow; separate browser print possibility | Accessible text/vector and paged engine, not canvas masquerading as document PDF | **Defer** new OSS PDF engine selection until a concrete output contract and matched native/rendered proof. Print remains a distinct app action; no automatic menu restoration. |
| Image capture | visual screenshot of a rendered view | Keep raster capture explicitly visual and view-dependent | **Stop** restoring it as structured document export. No demonstrated new screenshot job here. |
| Menu/delivery/assets | browser download, server response, stored object, preview iframe | Delete converter setup/projection mechanics from copied menu; retain policy, CSS shell, names and transport locally | **Pursue**, copied UI consuming package APIs; no shared browser/server delivery service. |

CSV currently owns import/paste, not a document exporter. RTF is a clipboard
source. No evidence justifies adding either export format in this work. The
documented Plus PDF flow is acknowledged; commercial internals were not audited.

## External editor comparison

The source shards record exact commits, licenses, call shapes, line ranges and
fingerprints: [ProseMirror/Tiptap/BlockNote](prosemirror-family.json) and
[Lexical/CKEditor/Quill](lexical-ckeditor-quill.json). Seven repository snapshots
cover six editor families; ProseMirror model and Markdown are separate repos.
Tiptap and BlockNote inherit parts of ProseMirror, so those shared mechanisms
are not independent inventions. Snapshots are not claims of latest versions.

| Editor family | Inspected equivalent | What to reuse or reject for Plate |
| --- | --- | --- |
| ProseMirror | Persistent Node/Fragment; DOMSerializer.fromSchema; separate MarkdownSerializer; text/JSON on the model | Reuse document/schema ownership. DOM output needs a Document; Markdown has its own semantics. Strict missing-handler behavior is useful; silent mark omission is not a complete loss contract. |
| Tiptap | Editor getters delegate; static HTML accepts content + extensions without an editor; dedicated MarkdownManager accepts JSON | Strong API precedent for document calls plus editor convenience. Static Markdown is explicitly incomplete in the sampled source. The HTML-string implementation avoids DOM, but package peers still include React. |
| BlockNote | HTML/Markdown depend on editor/DOM; DOCX/PDF accept blocks + mappings with distinct native backends | Strongest DOCX comparison: direct paragraphs, images and native equations. Its shared exporter base is not universal. Binary calls do not establish immutable capture or complete review export. |
| Lexical | Captured EditorState plus per-format adapters; HTML requires editor configuration and DOM; headless helper installs DOM temporarily | Capture document and configuration together. Headless does not mean lifecycle-free or DOM-free. Keep synchronous read scopes and format handlers. |
| CKEditor 5 | Separate data-downcast and editing-downcast; data processor; clipboard reuses data conversion with its own HTML processor | Editing appearance and external data need distinct contracts. Markdown uses a bounded HTML bridge. Premium DOCX/PDF examples do not prove converter internals. |
| Quill | Delta/text getters; semantic HTML walks live blots/DOM; clipboard calls the same methods | Reuse serializers across selected and whole documents; retain transfer ownership. Avoid live DOM dependence for saved-document conversion. Text omits embeds; video exports as a link. |

No candidate supplies a complete design to copy. Their weak points include
silently dropped handlers, separate review stores, mutable async inputs and DOM
requirements. Keep Plate's stronger authored-capture and diagnostics laws.
BlockNote's XL DOCX/PDF packages declare GPL-3.0 OR PROPRIETARY; core's MPL
license does not put those packages under the same terms. No upstream
implementation was copied.

Two historical Lexical issue bodies were sampled: #5192 concerns a selection
decoration changing exported HTML; #6086 concerns indentation in a one-paragraph
copy. They motivate UI/data and whole-document/selection proof cases, not claims
of current upstream defects or reproduced Plate bugs.

## Candidate call sites, not implemented APIs

Current copied Markdown export:

```ts
const captured = captureProjection(); // app capability check + warnings
const temporary = createEditor({
  initialValue: captured.document,
  plugins: BaseEditorKit,
});
const markdown = temporary.api.markdown.serialize();
```

Candidate ordinary editor call, same contract whether authored data exists:

```ts
const result = editor.api.markdown.serialize({ projection: 'accepted' });
// result.data and format-owned diagnostics; exact failure union is design work
```

Candidate server/document call:

```ts
import { serializeMarkdown } from 'platejs/markdown';

const result = serializeMarkdown(document, {
  plugins: EditorKit,
  projection: 'accepted',
});
```

The standalone call must compile the relevant schema/codec declarations without
activating editing lifecycles. The editor-bound call captures its configured
codec state, including current overrides, and delegates to the same encoder.
Do not replace dynamic configured state with plugin defaults. Exact inference,
schema input and callback context are the first design question. A public
CompiledExportContext or builder is not earned merely because internals compile.

HTML follows the same ownership principle through its existing codec API;
styled React remains `renderStaticHtml` at the presentation entrypoint. DOCX
keeps its lazy standalone format entrypoint, structured result, source and
comment policy. This review does not require every format to have identical
arguments or result payloads. Clean projections, embedded review envelopes and
native tracked changes must be explicit distinct promises; format-specific
review options must not imply visible parity.

## Alternatives that lose

1. Keep the menu adapters: preserves runtime reconstruction and repeated
   projection/diagnostics and still misses a standalone server job.
2. Universal ExportPlugin or `editor.api.export(format)`: adds a dispatcher and
   capability matrix around operations with different outputs and lifetimes.
   Existing schema, document, format and delivery owners already cover the jobs.
3. Put all conversion into Plite: pulls Plate feature vocabulary, CSS/React and
   Word dependencies into the neutral substrate. Promote neutral document and
   authored capabilities only.
4. HTML as the universal intermediate model: makes native review, comments,
   roots, fields and editable math depend on conventions that ordinary HTML
   does not own. A private format adapter may use HTML where it loses nothing.
5. One new universal AST/visitor/result framework: no demonstrated common law
   beyond the canonical document and schema. Format-native ASTs can remain
   private; new public nouns need independent evidence.
6. One exhaustive rewrite of every codec: source shows useful engines to reuse.
   A narrower public compiler boundary and accurate diagnostics can remove
   caller work without throwing away sound format behavior.

## Required next proof, not claimed here

Design one representative HTML and Markdown custom feature plus standalone
server and configured live-editor callers. Prove no lifecycle activation,
normalization edits or subscriptions; one revision/config capture; inferred
callbacks; roots/slots; deliberate filtering versus unsupported content;
and custom type/property overrides. Preserve AI fragment and clipboard slice
consumers instead of forcing them through whole-file defaults.

Compare DOCX backends with matched paragraphs/lists/tables, columns, code,
equations, headings/TOC, assets, comments, accepted/proposed/native review,
conflicts and retained-source cases. Include import/edit/export semantic reopen,
package inspection and actual native-viewer proof. Word semantics required by
the current kit must be at least as complete, not merely prettier output.

Benchmark complete operations at ordinary and large documents, cold and warm
module/configuration states and many comment bodies. Include allocation/peak
memory, setup+projection+encoding+ZIP, and output parity; do not call the earlier
projection-only improvement an end-to-end export improvement. Keep the runtime
target provisional until this comparison earns it.

Next owner: `$task design plan exports: document-first conversion, schema-owned
format codecs, and lifecycle-free rendering`. Task must jointly settle API,
Plite/Plate ownership, backend experiments, adoption, doctrine repair and proof.
No product implementation is authorized by this research request.
