---
review_scopes:
  - imports
  - exports
review_basis:
  - 2026-09-26-imports-conversion-vocabulary-doctrine-closure
  - 2026-09-26-exports-conversion-vocabulary-doctrine-closure
work_kind: implementation
---

# Document conversion contracts

Status: Completed.

Objective:
Adopt one truthful conversion architecture for Plate and Plite, using
direct format-owned parse/serialize operations, explicit document versus slice
authority, schema-valid diagnosed projection, detached conversion, bounded HTML,
and a hard cut of misleading codec and conversion machinery.

Authority: the user's Ultra research request and subsequent `go`. Product
implementation is active. It may break public APIs on `next`; it must not add
compatibility aliases.

Source decision:
`docs/research/review-records/2026-09-26-imports-conversion-vocabulary-doctrine-closure.json`
and
`docs/research/review-records/2026-09-26-exports-conversion-vocabulary-doctrine-closure.json`.
Raw evidence and the bounded 405-row ontology:
`docs/plite/research/2026-09-25-document-codec-architecture/`.

Research objective:

Choose the smallest truthful Plate/Plite conversion architecture from current
source and fixed external evidence, record the decision immutably, and leave an
exact ordered implementation and proof contract without changing product code.

Completion threshold:

Research covers every candidate family, the normalized public manifest is
fully classified, the strongest server target has pre-acceptance correctness
and performance evidence, the superseding review is recorded, and this plan
specifies exact types, packages, migration order, callers, proof, and rollback
without an unresolved P0/P1 API decision.

Verification surface:

The design closes against the generated 405-row ontology, six well-formed TSV
ledgers, fixed-source shards, four server benchmark cohorts, the malformed and
Plate conversion probe, immutable review render/check, Plate Next registry
validation, and independent final audits by the three research agents.

Constraints:

- Product implementation and local verification are authorized in the current
  checkout. No commit, push, PR, or release is authorized.
- `next` may break APIs and receives no compatibility aliases.
- Reuse accepted persistence, clipboard, authored, export, and DOCX laws unless
  fixed-source evidence defeats them.
- Do not copy external source or fixtures; promote only independently stated
  laws, API pressure, and proof techniques.

Boundaries:

CSV failure semantics remain a separate audit. The plan does not redesign the
editor model, authored change semantics, DOCX export rendering, file-picking
UI, or static presentation except where their existing public calls must move
to the accepted conversion boundary.

Blocked condition:

None for design closure. Product execution may stop only if a hard-law conflict
appears, the production server adapter defeats the frozen correctness or
resource budget, or a required browser/native proof environment is unavailable.

Work Checklist:

- [x] Reconcile prior import/export, persistence, clipboard, authored, and DOCX
      decisions.
- [x] Inspect typed codecs, document pipelines, source-aware printers, editor
      candidates, and cross-language controls at fixed commits.
- [x] Generate and classify the complete bounded API manifest.
- [x] Benchmark and correctness-check the strongest Node HTML target and reject
      the failed alternatives.
- [x] Run delete/merge/inline/reuse and three bounded saturation challenges.
- [x] Record the superseding Best API Review and update the compiled decision.
- [x] Write the exact adoption, caller migration, proof, package, and rollback
      plan.
- [x] Re-audit the public conversion vocabulary and hidden authored payloads;
      cut redundant document suffixes, HTML/Markdown review envelopes, and the
      directional `exportToDocx` name from the target.
- [x] Repair Best API and Plate vision teaching, regenerate Codex/Claude
      mirrors, and record Plate Next doctrine through v240 without changing
      package attestations.

Implementation progress:

- [x] Slice 1: typed persistence law.
- [x] Slice 2 core: DataTransfer format hard cut and atomic report lifecycle.
- [x] Slice 3: reported schema fitting and detached slice admission.
- [x] Slice 2 mapping contexts: migrate remaining live editor/store closures.
- [x] Slice 4: Markdown parse and serialize contract.
- [x] Slices 5–6: browser and server HTML contracts.
- [x] Slice 7: detached DOCX import.
- [x] Slice 8: callers, docs, registry, doctrine, ledger, and closure proof.

## Final direction

There is no public universal import/export abstraction. HTML, Markdown, DOCX,
JSON persistence, DataTransfer, structural text, CSV, authored state, and
retained source keep distinct owners because their laws differ.

The target has four surfaces:

1. Plite owns JSON codec pairs, versioned persistence, canonical schema
   admission and fitting, `ContentSlice`, and browser `DataTransferFormat`
   negotiation.
2. Plate plugins contribute pure feature format mappings through
   `formats`/`defineFormats`; private compilation captures mappings, schema, and
   plugin state for an operation.
3. HTML and Markdown expose direct detached parse/serialize functions and
   matching editor convenience APIs. Format-specific results carry all
   expected loss and recovery.
4. DOCX keeps its async package, comments, source, cancellation, limit, and
   diagnostic contract, but detached import captures a complete target before
   the first await.

Public names follow the operation's real law. HTML and Markdown use
`parse`/`serialize`, the established syntax conversion vocabulary used by
parse5, unified, and ProseMirror. The default parse consumes a complete
document, so only exceptional carriers add a suffix: `parseHtmlSlice`,
`parseMarkdownSlice`, and `parseMarkdownInline`. `encode`/`decode` remain
reserved for paired typed representations such as `EditorValueCodec`, plugin
mappings, and DataTransfer formats. DOCX remains `importDocx`/`exportDocx`
because it is an asynchronous package workflow with comments, retained source,
assets, limits, and native-review behavior rather than a text syntax pair.

| Job | Standalone public function | Installed editor convenience |
| --- | --- | --- |
| Parse a complete HTML document | `parseHtml(source, { plugins, schema })` | `editor.api.html.parse(source)` |
| Parse an HTML insertion slice | `parseHtmlSlice(source, { plugins, schema })` | `editor.api.html.parseSlice(source)` |
| Serialize HTML | `serializeHtml(document, { plugins, schema, projection })` | `editor.api.html.serialize({ document?, projection })` |
| Parse a complete Markdown document | `parseMarkdown(source, { plugins, schema })` | `editor.api.markdown.parse(source)` |
| Parse a Markdown insertion slice | `parseMarkdownSlice(source, { plugins, schema })` | `editor.api.markdown.parseSlice(source)` |
| Parse Markdown inline content | `parseMarkdownInline(source, { plugins, schema })` | `editor.api.markdown.parseInline(source)` |
| Serialize Markdown | `serializeMarkdown(document, { plugins, schema, projection })` | `editor.api.markdown.serialize({ document?, projection })` |
| Import/export a DOCX package | `importDocx(source, options)` / `exportDocx(editor, options)` | none |
| Persist exact authored review state | `JSON.stringify(snapshot.review)` / `parseAuthoredDocument(json)` | authored projection/read APIs only |

The two HTML/Markdown surfaces serve distinct proven lifecycles. Detached
functions compile the supplied declarations once and work in server or utility
code. Editor methods reuse the editor's already compiled configuration and
capture it synchronously. Both delegate to the same private operation; no
public converter/session/compiler object sits between them. DOCX remains
standalone because one-shot package work has no installed plugin lifecycle.

Delete or reject `DocumentCodec`, `DocumentFormat`, `ConversionResult`, a
format registry/dispatcher, universal AST, conversion session/artifact, public
compiler, `safeParseDocument`, and a generic retained-source object. Preserve
`compileEditor`: it owns independent schema/application compilation rather than
format conversion.

## Hard laws

- A complete file parse produces `EditorDocumentValue`; insertion produces
  `ContentSlice`. Inline parsing is a distinct operation and still returns
  `ContentSlice`. Direct HTML/Markdown slice parsing is closed and rootless;
  only native transfer payloads can preserve open edges or detached roots.
- Parse succeeds only when it returns the requested schema-valid carrier.
  Success contains warnings only; failure contains at least one error and no
  carrier. Every Plate-controlled mutation or loss, and every parser-reported
  error or recovery, is diagnosed. Custom mappings own their stated projection
  laws; the framework cannot infer arbitrary semantic loss inside user code.
- Diagnostics preserve stage order on success. On failure, the owner performs a
  stable partition with errors before warnings while preserving order inside
  each severity, so the nonempty error-first tuple is true without scrambling
  causal order.
- Direct format functions and compilation throw on configuration/programmer
  failures. DataTransfer callbacks are an isolation boundary: mismatch returns
  `false`/`null`; a callback exception is lifecycle-reported and negotiation
  continues. Expected source failures use format results.
- Encoded source coordinates and canonical model coordinates are distinct.
- `assertDocument` and `assertFragment` remain rejection-only. `fitDocument`
  remains coercive and never masquerades as validation.
- Validation, recovery, and format representability are separate decisions.
  The compiled plugin schema owns canonical model invariants. A format owner
  may use reported fitting to recover a candidate, but lossy recovery fails by
  default and requires that format's explicit `lossPolicy: 'allow'`.
- Export asserts the captured document and every authored projection. It never
  fits or repairs model data. A valid model that a target format cannot
  represent follows the format's loss policy instead of mutating the document.
- HTML and Markdown carry visible semantic syntax only. They never embed or
  restore hidden authored documents. Exact review state uses the canonical
  authored JSON document; Word review uses DOCX revisions and its format-owned
  authored part. There is no HTML/Markdown trust mode, correspondence digest,
  or authored parser.
- Exact/source-aware retention stays format-owned. DOCX keeps `DocxSource`;
  HTML and Markdown do not gain a generic source sidecar.
- Every async operation captures plugins, schema, plugin state, options,
  projection, comments, source lease, limits, and signal before its first
  await. Later editor reconfiguration cannot alter the operation.
- HTML and Markdown are synchronous and do not accept `AbortSignal`. Markdown
  accepts only sync plugins and rejects a returned thenable as configuration
  failure; future async conversion uses separately named async functions. DOCX
  is asynchronous and rejects `signal.reason` or `AbortError` on cancellation.
- Browser and server HTML use one parse5 tree and private realm adapters. They
  do not mutate ambient globals, execute scripts, fetch resources, apply CSS,
  create active iframes, or expose LinkeDOM/Node dependencies to browser graphs.
- No compatibility aliases survive on `next`.

## Ownership matrix

| Concern | Canonical owner | Public surface | Explicit non-owner |
| --- | --- | --- | --- |
| Live/encoded JSON pair and version history | Plite core | `EditorValueCodec`, `EditorValuePersistence` | HTML/Markdown/DOCX |
| Canonical grammar and rejection | Plite compiled schema | `assertDocument`, `assertFragment` | Zod/Standard Schema |
| Canonical fitting mechanism | Plite compiled schema | `fitDocument` | parser validity and recovery policy |
| Import recovery and loss policy | each format owner | parse options/results | plugin schema and application UI |
| Open insertion carrier | Plite core | `ContentSlice` | raw arrays |
| Browser MIME negotiation | Plite DOM | `DataTransferFormat` | plugin node mappings |
| Feature syntax mappings | Plate plugin model | `formats`, `defineFormats`, `*NodeMapping` | DataTransfer policy |
| HTML syntax/results | `platejs/html` | direct functions and `editor.api.html` | root `platejs/static` presentation |
| Node HTML DOM adapter | `platejs/html/server` | same parse types/functions | ambient browser globals |
| Markdown syntax/results | `platejs/markdown` | direct functions and `editor.api.markdown` | universal converter |
| DOCX package/source/comments | existing DOCX entrypoints | `importDocx`, `exportDocx` | generic extras/source |
| Authored projection | authored owner | existing projection API/options | format parser |
| Static/styled React rendering | `platejs/static` | existing rendering APIs | semantic HTML interchange |
| CSV table/plain-text ingress | `platejs/csv` | unchanged pending own audit | document-format symmetry |
| File picker/value replacement/toasts | application/registry | copied application code | packages |

## Exact Plite API

### JSON values and persistence codecs

Promote one canonical JSON type and type both encoded values:

```ts
/** Immutable JSON data admitted by editor persistence and schema properties. */
export type EditorJsonValue =
  | boolean
  | null
  | number
  | string
  | readonly EditorJsonValue[]
  | Readonly<{ [key: string]: EditorJsonValue }>;

/** Current mapping between one live editor value and canonical persisted JSON. */
export type EditorValueCodec<
  TValue = unknown,
  TEncoded extends EditorJsonValue = EditorJsonValue,
> = Readonly<{
  /** Validate and decode one current-version untrusted payload. */
  decode: (value: unknown) => TValue;
  /** Produce one current-version canonical JSON payload. */
  encode: (value: TValue) => TEncoded;
}>;

export type EditorValueDecoder<TValue = unknown> = (
  value: unknown
) => TValue;

/** Version ownership around one current codec and decode-only legacy inputs. */
export type EditorValuePersistence<
  TValue = unknown,
  TEncoded extends EditorJsonValue = EditorJsonValue,
> = Readonly<{
  codec: EditorValueCodec<TValue, TEncoded>;
  legacyDecoders?: Readonly<Record<number, EditorValueDecoder<TValue>>>;
  /** Current positive integer envelope version. */
  version: number;
}>;

/** JSON envelope produced by one versioned editor value codec. */
export type SerializedEditorValue<
  TEncoded extends EditorJsonValue = EditorJsonValue,
> = Readonly<{
  value: TEncoded;
  version: number;
}>;
```

`defineValueCodec` preserves the exact encoded generic. Versioned state/effect
descriptors use `EditorValuePersistence`; add `defineValuePersistence` where a
standalone descriptor is authored. Thread `TEncoded` through persistence,
state/effect descriptors, and serialized return types instead of erasing it.
`PropertyJsonValue` becomes a temporary internal alias of `EditorJsonValue` in
the migration slice and is deleted once property declarations and public docs
use the canonical name.

The JSON type bound narrows output structurally; it cannot reject `NaN`,
infinities, `-0`, sparse arrays, cycles, accessors, exotic prototypes, or
`any`. Mandatory runtime snapshot validation is the authority that rejects
those values, detaches accepted data, and freezes the owned result.

Required laws:

- current version: `decode(encode(value))` is semantically equal under the
  codec owner's comparator;
- encoded side: `encode(decode(encoded))` equals the documented canonical
  encoding and encoding that result is idempotent;
- encoded output passes `assertEditorJsonValue`, is detached, and survives
  JSON stringify/parse;
- every `legacyDecoders[n]` is tested with a fixed historical fixture, produces
  a value accepted by the current codec, and can then be encoded canonically;
- unknown, missing, future, malformed, or non-integer versions fail without
  mutation or fallback.

Do not add `safeDecode`, `safeEncode`, Standard Schema, or a generic codec
registry. A persistence owner may translate a decode exception into its own
failure state, but it may not substitute a default/current value, mutate
storage, acknowledge collaborative input, or publish partial state. Reset and
migration remain separately named operations.

### DataTransfer formats

Replace the complete `HostCodec` family:

```ts
export type DataTransferFormatPhase =
  | 'accept'
  | 'decode'
  | 'encode'
  | 'notify';

export type DataTransferDiagnostic =
  | Readonly<{
      code: string;
      message: string;
      severity: 'error';
    }>
  | Readonly<{
      code: string;
      message: string;
      severity: 'warning';
    }>;

export type DataTransferWarningDiagnostic = Extract<
  DataTransferDiagnostic,
  { severity: 'warning' }
>;

export type DataTransferErrorDiagnostic = Extract<
  DataTransferDiagnostic,
  { severity: 'error' }
>;

/** Immutable snapshot captured when browser transfer handling begins. */
export type DataTransferSnapshot = Readonly<{
  files: Readonly<{
    readonly [index: number]: File;
    readonly length: number;
    item: (index: number) => File | null;
  }>;
  getData: (mimeType: string) => string;
  types: readonly string[];
}>;

export type DataTransferDecodeContext<V extends Value = Value> = Readonly<{
  data: string;
  mimeType: string;
  snapshot: DataTransferSnapshot;
  state: EditorCoreStateView<V>;
}>;

export type DataTransferEncodeContext<V extends Value = Value> = Readonly<{
  mimeType: string;
  slice: ContentSlice<V>;
  state: EditorCoreStateView<V>;
}>;

export type DataTransferDecodeResult<V extends Value = Value> =
  | Readonly<{
      diagnostics: readonly DataTransferWarningDiagnostic[];
      ok: true;
      slice: ContentSlice<V>;
    }>
  | Readonly<{
      diagnostics: readonly [
        DataTransferErrorDiagnostic,
        ...DataTransferDiagnostic[],
      ];
      ok: false;
    }>;

export type DataTransferEncodeResult =
  | Readonly<{
      data: string;
      diagnostics: readonly DataTransferWarningDiagnostic[];
      ok: true;
    }>
  | Readonly<{
      diagnostics: readonly [
        DataTransferErrorDiagnostic,
        ...DataTransferDiagnostic[],
      ];
      ok: false;
    }>;

export type DataTransferAttempt = Readonly<{
  diagnostics: readonly DataTransferDiagnostic[];
  key: string;
  mimeType: string;
  outcome: 'rejected' | 'selected' | 'unfit' | 'written';
  phase: 'decode' | 'encode';
}>;

export type DataTransferReport = Readonly<{
  attempts: readonly DataTransferAttempt[];
  outcome: 'inserted' | 'unhandled' | 'written';
}>;

/** Stable schema resource claimed by one transfer format direction. */
export type DataTransferSchemaClaim =
  | Readonly<{ kind: 'element'; type: string }>
  | Readonly<{ kind: 'schema' }>
  | SchemaProperty;

/** One browser DataTransfer representation of an editor ContentSlice. */
export type DataTransferFormat<V extends Value = Value> = Readonly<{
  /** Skip this payload without reporting a failure when false. */
  accept?: (context: DataTransferDecodeContext<V>) => boolean;
  /** Stable schema claims used for deterministic conflict checks. */
  claims?: readonly DataTransferSchemaClaim[];
  /** Decode one intact slice, return a diagnosed rejection, or delegate. */
  decode?: (
    context: DataTransferDecodeContext<V>
  ) => DataTransferDecodeResult<V> | null;
  /** Encode one representation, return a diagnosed rejection, or delegate. */
  encode?: (
    context: DataTransferEncodeContext<V>
  ) => DataTransferEncodeResult | null;
  /** Stable registration identity used for diagnostics and conflicts. */
  key: string;
  /** MIME type read from or written to DataTransfer. */
  mimeType: string;
}>;

export function dataTransferFormats<V extends Value = Value>(
  owner: string,
  formats: readonly DataTransferFormat<V>[]
): Plugin;
```

Hard-rename internal and public helpers in the same slice:

| Current | Target |
| --- | --- |
| `HostCodec` | `DataTransferFormat` |
| `HostDataSource` | `DataTransferSnapshot` |
| `HostCodecParseContext` | `DataTransferDecodeContext` |
| `HostCodecSerializeContext` | `DataTransferEncodeContext` |
| `HostCodecSchemaTarget` | `DataTransferSchemaClaim` |
| `HostCodecPhase` | `DataTransferFormatPhase` |
| `format` | `mimeType` |
| `parse` / `query` / `serialize` | `decode` / `accept` / `encode` |
| `owns` | `claims` |
| `hostCodecs` | `dataTransferFormats` |
| `createHostDataTransactionSpec` | `createDataTransferTransactionSpec` |
| `insertHostData` | `insertDataTransfer` |
| `writeHostFragmentData` | `writeDataTransferFragment` |
| lifecycle source `host-codec` | `data-transfer-format` |

Keep `DOMClipboardApi.readSlice`, `writeSlice`, `writeSelection`, DOM
assertions, and `parseDOMClipboardHtml`: they own concrete browser operations.
`DOMEditorOptions` adds
`onDataTransferReport?: (report: DataTransferReport) => void`; the public
`insertData` result remains the settled handled/unhandled boolean.

`accept: false` and `decode`/`encode: null` mean mismatch and create no attempt.
A returned failure records a rejected attempt and allows the next independent
format to try. A decoded slice that cannot fit records the transfer-owned
`data-transfer-unfit` error before negotiation continues. If a later format is
accepted, its warnings and all earlier rejected/unfit attempts remain in the
report with their original severities; fallback does not rewrite an error into
a warning. The private command-attempt collector schedules an inserted report
through the existing transaction-spec `afterCommit` metadata, reports writes
after the complete writer returns, and reports `unhandled` only after the
outermost command chain declines. It never calls application code for a
speculative or abandoned candidate. Sink exceptions are lifecycle-reported in
the `notify` phase and cannot roll back an accepted commit. The application
registry wires the sink to user feedback; direct format callers keep the full
format-specific diagnostic union.

## Exact Plate feature mapping API

Replace plugin `codecs` and `defineCodecs` with `formats` and
`defineFormats`. Format declarations use semantic keys because node mappings
are not MIME registrations:

```ts
const BaseCalloutPlugin = definePlugin('callout', {
  formats: ({ defineFormats, schema: { type } }) =>
    defineFormats({
      html: {
        decode: ({ element }) => ({ type: element.dataset.type ?? 'info' }),
        encode: ({ node }) => ({
          attributes: { 'data-type': node.type },
          tag: 'aside',
        }),
        match: { tag: 'aside' },
      },
      markdown: {
        decode: ({ node }) => ({ children: [], type }),
        encode: ({ node }) => ({
          children: [],
          name: 'Callout',
          type: 'mdxJsxFlowElement',
        }),
      },
    }),
});
```

The exact public rename is:

| Current | Target |
| --- | --- |
| plugin field `codecs` | `formats` |
| context `defineCodecs` | `defineFormats` |
| `PluginCodecMapDeclaration` | `PluginFormatMapDeclaration` |
| `DefinePluginCodecs` | `DefinePluginFormats` |
| `PluginCodecNode` | `PluginFormatNode` |
| `MarkdownNodeCodec` / `Input` | `MarkdownNodeMapping` / `Input` |
| `PlainTextNodeCodec` / `Input` | `PlainTextNodeMapping` / `Input` |
| `HtmlCodecHooks` | delete; retain only inferred `html.prepareDocument` |
| `compilePlateCodecs` | private `compilePlateFormats` |
| `compilePlainTextCodecs` | private `compilePlainTextMappings` |
| `markdownCodecs` internals | private `markdownMappings` |

`formats` authoring receives `defineFormats` and static schema bindings. It no
longer receives a live `editor` or `store`. Per-operation mapping contexts
receive:

```ts
export type PluginFormatRegistry = Readonly<{
  has: (plugin: PluginReference | string) => boolean;
  type: (plugin: PluginReference | string) => string | undefined;
}>;

export type PluginFormatSchemaView = Pick<
  EditorStateSchemaApi,
  | 'allowsElementType'
  | 'element'
  | 'getElementBehavior'
  | 'getProperty'
  | 'getVocabulary'
>;

export type PluginFormatModelView<V extends Value = Value> = Readonly<{
  document: EditorDocumentValue<V>;
  node: DescendantIn<V>;
  parent: ElementIn<V> | null;
  path: Path;
  previousSibling: DescendantIn<V> | null;
  root: RootKey;
}>;

type HtmlMappingDiagnosticInput = Readonly<{
  action: 'dropped' | 'replaced' | 'unwrapped';
  kind: 'attribute' | 'element' | 'style';
  message: string;
}>;

type MarkdownMappingDiagnosticInput = Readonly<{
  action: 'dropped' | 'replaced' | 'unwrapped';
  message: string;
  nodeType: string;
}>;

type PluginFormatContext<C extends AnyBasePluginDefinition> = Readonly<{
  name: string;
  pluginState: Readonly<InferPluginStoreState<C>>;
  registry: PluginFormatRegistry;
  schema: PluginFormatSchemaView;
}>;

type HtmlPluginFormatContext<C extends AnyBasePluginDefinition> =
  PluginFormatContext<C> &
    Readonly<{
      report: (diagnostic: HtmlMappingDiagnosticInput) => void;
    }>;

type MarkdownPluginFormatContext<C extends AnyBasePluginDefinition> =
  PluginFormatContext<C> &
    Readonly<{
      report: (diagnostic: MarkdownMappingDiagnosticInput) => void;
    }>;
```

There is no universal diagnostic input type. Mapping reporters accept only
mapping-owned loss descriptions. The operation collector assigns the final
code, severity under the active loss policy, phase, owner key, source location,
and model location; parser, limit, safety, schema, and fit stages reserve
their own codes. It
deduplicates by the stable tuple `(phase, owner, code, source, model, action)`
and preserves first-report order, so one framework mutation produces one
diagnostic. Plain text gets no diagnostic channel until it has a demonstrated
lossy parse job.

Existing declarations that close over `store.get()` read the frozen
`pluginState`; declarations that call `editor.plugin(...)` use
`registry.has/type`. Encoding callbacks that need structural context receive
`PluginFormatModelView` for the immutable input document and current node;
decoders do not receive a partially built model. Neither direction receives
selection, fields, metadata APIs, live node access, or `EditorCoreStateView`.
Type inference must work without annotating callback parameters. Foreign-target
`defineFormats(TargetPlugin, map)` keeps exact target node/property inference.

Delete `HtmlCodecHooks` rather than renaming the mixed wrapper. HTML mappings
may declare one inferred `prepareDocument({ document, ...context })` field. It
runs after inert parsing and before element matching, mutates only that
operation's detached DOM, and exists for the list normalization now implemented
by `BaseListPlugin`; it does not receive a `DataTransfer` source. `query`, Word
cleanup, RTF access, and post-decode Word repair move to the HTML
`DataTransferFormat`, whose `decode` may prepare the source, call
`parseHtmlSlice`, and postprocess the returned slice. No generic
`transformFragment` hook survives without another format-owned caller.

Whole-payload `text/markdown`, `text/html`, `text/plain`, Word, CSV, and custom
MIME declarations are not accepted by `defineFormats`. Their feature plugins
register `DataTransferFormat` contributions. HTML/Markdown/plain-text node and
mark mappings stay under `formats`.

Private format compilation may reuse the existing activation-free
`withPlateFormatCompilation` mechanism. It must snapshot the compiled model,
schema, plugin states, authored capability, and mapping registry at operation
entry. It must not run handlers, shortcuts, editor effects, React hooks, or
plugin lifecycle callbacks. The temporary internal Plite editor remains an
implementation detail and never escapes as a public compiler/context/session.

## Exact HTML API

Package ownership:

- `platejs/html`: browser/core HTML types, `HtmlPlugin`, direct functions, and
  editor API.
- `platejs/html/server`: Node parse functions using the same public types and
  behavior contract.
- root `platejs` may continue aggregating `HtmlPlugin` as a canonical root
  export; server code and dependencies are never reachable from the root graph.

```ts
export type HtmlParseLimits = Readonly<{
  maxBytes: number;
  maxDepth: number;
  maxNodes: number;
}>;

export type HtmlSourceLocation =
  | Readonly<{
      endCodeUnit: number;
      excerpt?: string;
      kind: 'source';
      startCodeUnit: number;
    }>
  | Readonly<{
      kind: 'tree';
      path: readonly number[];
      tag?: string;
    }>;

export type HtmlModelLocation = Readonly<{
  path?: readonly number[];
  property?: string;
  root?: RootKey;
}>;

type HtmlDiagnosticContext = Readonly<{
  model?: HtmlModelLocation;
  source?: HtmlSourceLocation;
}>;

type PolicyDiagnostic<T extends object> =
  | Readonly<T & { severity: 'error' }>
  | Readonly<T & { severity: 'warning' }>;

export type HtmlDiagnostic =
  | NativeAuthoredProjectionDiagnostic
  | (HtmlDiagnosticContext &
      Readonly<{
        code: 'html-invalid-source';
        message: string;
        reason: 'parser-failure';
        severity: 'error';
      }>)
  | (HtmlDiagnosticContext &
      Readonly<{
        code: 'html-parser-recovery';
        message: string;
        parserCode: string;
        severity: 'warning';
      }>)
  | (HtmlDiagnosticContext &
      Readonly<{
        actual: number;
        code: 'html-limit-exceeded';
        limit: keyof HtmlParseLimits;
        maximum: number;
        message: string;
        severity: 'error';
      }>)
  | Readonly<{
      code: 'html-multiple-editor-roots';
      count: number;
      message: string;
      severity: 'error';
    }>
  | (HtmlDiagnosticContext &
      Readonly<{
        code: 'html-schema-invalid';
        message: string;
        schema: EditorSchemaValidationDiagnostic;
        severity: 'error';
      }>)
  | (HtmlDiagnosticContext &
      PolicyDiagnostic<{
        code: 'html-schema-repair';
        impact: 'lossless' | 'lossy';
        inputs: readonly HtmlModelLocation[];
        message: string;
        outputs: readonly HtmlModelLocation[];
        owner: 'document' | 'grammar' | 'property' | 'representation';
        repair: EditorSchemaRepairCode;
      }>)
  | (HtmlDiagnosticContext &
      Readonly<{
        action: 'removed';
        code: 'html-unsafe-content';
        kind: 'attribute' | 'element' | 'style' | 'url';
        message: string;
        severity: 'warning';
      }>)
  | (HtmlDiagnosticContext &
      PolicyDiagnostic<{
        action: 'dropped' | 'replaced' | 'unwrapped';
        code: 'html-unsupported-content';
        kind: 'attribute' | 'element' | 'style';
        message: string;
        owner: string;
        phase: 'parse' | 'serialize';
      }>)
  | Readonly<{
      code: 'html-unsupported-metadata';
      key: string;
      message: string;
      severity: 'warning';
    }>
  | Readonly<{
      code: 'html-unsupported-root';
      message: string;
      root: RootKey;
      severity: 'warning';
    }>;

export type HtmlWarningDiagnostic = Extract<
  HtmlDiagnostic,
  { severity: 'warning' }
>;

export type HtmlErrorDiagnostic = Extract<
  HtmlDiagnostic,
  { severity: 'error' }
>;

export type HtmlDocumentParseResult<V extends Value = Value> =
  | Readonly<{
      diagnostics: readonly HtmlWarningDiagnostic[];
      document: EditorDocumentValue<V>;
      ok: true;
    }>
  | Readonly<{
      diagnostics: readonly [HtmlErrorDiagnostic, ...HtmlDiagnostic[]];
      ok: false;
    }>;

export type HtmlSliceParseResult<V extends Value = Value> =
  | Readonly<{
      diagnostics: readonly HtmlWarningDiagnostic[];
      ok: true;
      slice: ContentSlice<V>;
    }>
  | Readonly<{
      diagnostics: readonly [HtmlErrorDiagnostic, ...HtmlDiagnostic[]];
      ok: false;
    }>;

export type HtmlSerializeResult =
  | Readonly<{
      data: string;
      diagnostics: readonly HtmlWarningDiagnostic[];
      ok: true;
    }>
  | Readonly<{
      diagnostics: readonly [HtmlErrorDiagnostic, ...HtmlDiagnostic[]];
      ok: false;
    }>;

export type HtmlParseOptions<
  TPlugins extends readonly BasePluginInput[],
> = Readonly<{
  collapseWhitespace?: boolean;
  limits?: Partial<HtmlParseLimits>;
  lossPolicy?: 'allow' | 'reject';
  plugins: TPlugins;
  schema?: EditorApplicationSchema;
}>;

export type HtmlSerializeOptions<
  TPlugins extends readonly BasePluginInput[],
> = Readonly<{
  lossPolicy?: 'allow' | 'reject';
  plugins: TPlugins;
  projection?: 'accepted' | 'proposed';
  schema?: EditorApplicationSchema;
}>;

export function parseHtml<
  const TPlugins extends readonly BasePluginInput[],
>(
  source: string,
  options: HtmlParseOptions<TPlugins>
): HtmlDocumentParseResult<EditorValueFromPlugins<TPlugins>>;

export function parseHtmlSlice<
  const TPlugins extends readonly BasePluginInput[],
>(
  source: string,
  options: HtmlParseOptions<TPlugins>
): HtmlSliceParseResult<EditorValueFromPlugins<TPlugins>>;

export function serializeHtml<
  const TPlugins extends readonly BasePluginInput[],
>(
  document: EditorDocumentValue<EditorValueFromPlugins<TPlugins>>,
  options: HtmlSerializeOptions<TPlugins>
): HtmlSerializeResult;
```

`HtmlApi<V>` exposes `parse`, `parseSlice`, and `serialize`. Editor options
omit `plugins`/`schema`, use a synchronously captured frozen target, and allow
`document` only on `serialize`. Direct functions accept plugin descriptors as
one-shot authoring input, compile them before conversion starts, then discard
all raw plugin/editor/store references; no public compiler escapes. Delete
public `deserialize`, `deserializeDocument`, authored-envelope parsing, and
`HTMLElement` input. DOCX and clipboard use a private `decodeHtmlElement` over
an explicit DOM adapter.

Serialization first asserts the model and authored projection; invalid model
data throws as a boundary/programmer failure. For a valid model,
`lossPolicy` defaults to `reject`: unmapped visible content or another expected
representational failure returns `ok: false` and no publishable `data`. `allow`
permits a documented drop only with an `html-unsupported-content` warning.
Projection-defined omissions and explicit filters may warn on success. Mapping
exceptions still throw as programmer failures. Every save/download caller
branches on `ok`.

Parsing also defaults `lossPolicy` to `reject`. Lossless schema repairs may
succeed with
`html-schema-repair`; a lossy repair returns `ok: false` unless the caller
explicitly selects `allow`, in which case the result carries the exact repair
warning. Callers that require zero recovery can reject any warning; there is no
second generic recovery mode.

Document root policy is exact:

1. HTML is visible syntax only. Scripts, comments, and other non-semantic
   hidden payloads receive no model authority and follow the ordinary safety
   and unsupported-content policy.
2. When one `[data-editor="true"]` exists, parse that element's children.
3. When none exists, parse the document body's children.
4. More than one marker returns `ok: false` with
   `html-multiple-editor-roots`; never choose the first.
5. `parseSlice` parses the supplied fragment as one closed, rootless slice and
   does not grant a marker complete-document authority.

Default limits are `maxBytes: 5 * 1024 * 1024`, `maxNodes: 100_000`, and
`maxDepth: 256`. `maxBytes` means UTF-8 bytes and is checked before parsing.
The parse5 tree adapter counts nodes and depth during construction and aborts
before DOM materialization. Breach returns `ok: false`; no partial model
escapes. Markdown's node/depth limits are post-parse admission limits because
its current mdast parser exposes no bounded construction hook; the byte cap is
its pre-parse resource bound.

Browser and server parsing share parse5 as the only HTML tree builder. In the
browser, a private adapter materializes the parse5 tree node by node into the
`ownerDocument` of a detached `<template>` fragment. That document has no
browsing context; the adapter never assigns `innerHTML`, does not require a
Trusted Types policy, does not attach the tree, and cannot execute scripts or
start resource requests. The frozen Chromium probe proves complete
`head`/`body` construction, marker preservation, Trusted Types CSP operation,
zero probe requests, and zero script execution. Browser-matrix network oracles
remain required implementation proof.

A Node call through `platejs/html` throws an actionable environment error
naming `platejs/html/server`. The server entrypoint consumes the same parse5
tree and materializes it in LinkeDOM. The adapter maintains parse5-node-to-DOM
correspondence; original code-unit ranges come only from parse5 nodes, while
implied nodes receive tree paths and never fabricated offsets. Both adapters
pass DOM objects explicitly; neither reads or installs ambient `document`,
`Node`, `NodeFilter`, `Element`, constructors, or factories. One private adapter
owns node constants, creation, tree walking, style access, realm-safe type
predicates, parsing, and serialization. Replace
`CSSStyleDeclaration.item()` iteration with numeric-key iteration compatible
with browser DOM and LinkeDOM.

One private HTML safety policy runs on the parse5 tree before feature matching
in both environments. It owns executable elements, event attributes, `srcdoc`,
URL schemes, external resource attributes including `srcset`, CSS
`url()`/`@import`, and foreign content. Rejected values cannot enter mapping
contexts or be reintroduced by mapping output. Browser/server safety diagnostic
codes are identical and the browser network sentinel covers image, iframe,
stylesheet, `srcset`, CSS URL, and CSS import cases.

## Exact Markdown API

```ts
export type MarkdownParseLimits = Readonly<{
  maxBytes: number;
  maxDepth: number;
  maxNodes: number;
}>;

export type MarkdownSourceLocation = Readonly<{
  end?: Readonly<{ column: number; line: number; offset?: number }>;
  excerpt?: string;
  nodeType?: string;
  start?: Readonly<{ column: number; line: number; offset?: number }>;
}>;

export type MarkdownModelLocation = Readonly<{
  path?: readonly number[];
  property?: string;
  root?: RootKey;
}>;

type MarkdownDiagnosticContext = Readonly<{
  model?: MarkdownModelLocation;
  source?: MarkdownSourceLocation;
}>;

export type MarkdownDiagnostic =
  | AuthoredProjectionDiagnostic
  | (MarkdownDiagnosticContext &
      Readonly<{
        code: 'markdown-fallback';
        message: string;
        reason: 'incomplete-stream';
        severity: 'warning';
      }>)
  | (MarkdownDiagnosticContext &
      Readonly<{
        code: 'markdown-filtered-node';
        message: string;
        nodeType: string;
        severity: 'warning';
      }>)
  | (MarkdownDiagnosticContext &
      Readonly<{
        code: 'markdown-invalid-source';
        message: string;
        reason: 'parser-failure';
        severity: 'error';
      }>)
  | (MarkdownDiagnosticContext &
      Readonly<{
        actual: number;
        code: 'markdown-limit-exceeded';
        limit: keyof MarkdownParseLimits;
        maximum: number;
        message: string;
        severity: 'error';
      }>)
  | (MarkdownDiagnosticContext &
      Readonly<{
        code: 'markdown-schema-invalid';
        message: string;
        schema: EditorSchemaValidationDiagnostic;
        severity: 'error';
      }>)
  | (MarkdownDiagnosticContext &
      PolicyDiagnostic<{
        code: 'markdown-schema-repair';
        impact: 'lossless' | 'lossy';
        inputs: readonly MarkdownModelLocation[];
        message: string;
        outputs: readonly MarkdownModelLocation[];
        owner: 'document' | 'grammar' | 'property' | 'representation';
        repair: EditorSchemaRepairCode;
      }>)
  | Readonly<{
      code: 'markdown-unsupported-metadata';
      key: string;
      message: string;
      severity: 'warning';
    }>
  | (MarkdownDiagnosticContext &
      PolicyDiagnostic<{
        action: 'dropped' | 'replaced' | 'unwrapped';
        code: 'markdown-unsupported-node';
        message: string;
        nodeType: string;
        owner: string;
        phase: 'parse' | 'serialize';
      }>)
  | Readonly<{
      code: 'markdown-unsupported-root';
      message: string;
      root: RootKey;
      severity: 'warning';
    }>;

export type MarkdownWarningDiagnostic = Extract<
  MarkdownDiagnostic,
  { severity: 'warning' }
>;

export type MarkdownErrorDiagnostic = Extract<
  MarkdownDiagnostic,
  { severity: 'error' }
>;

export type MarkdownDocumentParseResult<V extends Value = Value> =
  | Readonly<{
      diagnostics: readonly MarkdownWarningDiagnostic[];
      document: EditorDocumentValue<V>;
      ok: true;
    }>
  | Readonly<{
      diagnostics: readonly [MarkdownErrorDiagnostic, ...MarkdownDiagnostic[]];
      ok: false;
    }>;

export type MarkdownSliceParseResult<V extends Value = Value> =
  | Readonly<{
      diagnostics: readonly MarkdownWarningDiagnostic[];
      ok: true;
      slice: ContentSlice<V>;
    }>
  | Readonly<{
      diagnostics: readonly [MarkdownErrorDiagnostic, ...MarkdownDiagnostic[]];
      ok: false;
    }>;

export type MarkdownSerializeResult =
  | Readonly<{
      data: string;
      diagnostics: readonly MarkdownWarningDiagnostic[];
      ok: true;
    }>
  | Readonly<{
      diagnostics: readonly [MarkdownErrorDiagnostic, ...MarkdownDiagnostic[]];
      ok: false;
    }>;

export type MarkdownSyncTransformer = (
  tree: MdRoot,
  file: VFile
) => MdRoot | void;

export type MarkdownSyncPlugin<
  TParameters extends readonly unknown[] = readonly unknown[],
> = (
  this: Processor,
  ...parameters: TParameters
) => MarkdownSyncTransformer | void;

export type MarkdownSyncPluggable =
  | MarkdownSyncPlugin
  | readonly [MarkdownSyncPlugin, ...unknown[]];

export type MarkdownParseOptions<
  TPlugins extends readonly BasePluginInput[],
> = Readonly<{
  limits?: Partial<MarkdownParseLimits>;
  lossPolicy?: 'allow' | 'reject';
  plugins: TPlugins;
  remarkPlugins?: readonly MarkdownSyncPluggable[];
  schema?: EditorApplicationSchema;
}>;

export type MarkdownSerializeOptions<
  TPlugins extends readonly BasePluginInput[],
> = Readonly<{
  lossPolicy?: 'allow' | 'reject';
  plugins: TPlugins;
  projection?: 'accepted' | 'proposed';
  remarkPlugins?: readonly MarkdownSyncPluggable[];
  schema?: EditorApplicationSchema;
}>;

export function parseMarkdown<
  const TPlugins extends readonly BasePluginInput[],
>(
  source: string,
  options: MarkdownParseOptions<TPlugins>
): MarkdownDocumentParseResult<EditorValueFromPlugins<TPlugins>>;

export function parseMarkdownSlice<
  const TPlugins extends readonly BasePluginInput[],
>(
  source: string,
  options: MarkdownParseOptions<TPlugins>
): MarkdownSliceParseResult<EditorValueFromPlugins<TPlugins>>;

export function parseMarkdownInline<
  const TPlugins extends readonly BasePluginInput[],
>(
  source: string,
  options: MarkdownParseOptions<TPlugins>
): MarkdownSliceParseResult<EditorValueFromPlugins<TPlugins>>;

export function serializeMarkdown<
  const TPlugins extends readonly BasePluginInput[],
>(
  document: EditorDocumentValue<EditorValueFromPlugins<TPlugins>>,
  options: MarkdownSerializeOptions<TPlugins>
): MarkdownSerializeResult;
```

`MarkdownParseOptions` requires `plugins`, accepts optional `schema`, limits,
loss policy, filters, MDX/line-break policy, sync remark plugins, and
preservation policy.
`MarkdownSerializeOptions` requires `plugins`, accepts optional `schema`,
projection, loss policy, filters, sync remark plugins/stringify options,
block-ID policy, plain-mark policy, and list spread. A thenable returned by an
attacher or transformer throws as a configuration error. If an async caller is
later proven, add separately named `parse*Async`/`serialize*Async` functions;
never return `Result | Promise<Result>`. Delete `rules`, `ruleOverrides`, and
`onError`. Make `MdRules`, `MdNodeParser`, `convert*`, `parseAttributes`,
`parseMarkdownBlocks`, and `getSerializableListStyle` package-private.

Filters remain a real per-operation job, but every filtered node adds
`markdown-filtered-node`. Unknown or unrepresentable mdast adds
`markdown-unsupported-node`; no branch silently returns `undefined` and loses
content. The Markdown parser exposes no generic recovery signal, so
`markdown-fallback` is reserved for Plate's explicit incomplete-stream fallback.
Default limits match HTML. An empty document is not an implicit fallback.

Serialization defaults `lossPolicy` to `reject`: unrepresentable visible
content returns `ok: false` without data. `allow` turns an explicit supported
drop into a warning. Projection-defined omissions and caller-requested filters
may warn on success. Every export caller branches on `ok`.

Parsing uses the same default: lossless recovery may succeed with warnings,
while a lossy schema repair fails unless
`lossPolicy: 'allow'` is explicit. The policy does not turn malformed plugin
output into user data loss: a mapping that violates its declared schema
contract remains a programmer/configuration failure and throws with its owner.

`MarkdownApi<V>` exposes `parse`, `parseSlice`, `parseInline`, and `serialize`.
Direct plugin input is synchronously compiled and discarded as described for
HTML. Delete `deserialize`, `deserializeInline`, and authored-envelope parsing.
Direct `parseSlice` and `parseInline` return closed, rootless `ContentSlice`
values. Arbitrary openness and detached roots survive only through
DataTransfer's native slice envelope or another explicitly reviewed native
fragment format.

## Schema fitting and validation

Keep these public methods unchanged:

```ts
schema.assertDocument(value);
schema.assertFragment(children);
schema.fitDocument(document);
```

Expose the stable repair-code vocabulary used by format diagnostics, and add
one private Plite report primitive for framework admission owners:

```ts
export type EditorSchemaRepairCode =
  | 'canonicalize-set-property'
  | 'create-root'
  | 'default-property'
  | 'drop-unplaceable-text'
  | 'flatten-block-content'
  | 'generate-property'
  | 'insert-empty-text'
  | 'insert-inline-spacer'
  | 'insert-required-content'
  | 'merge-text'
  | 'omit-default-property'
  | 'remove-empty-text'
  | 'remove-noncanonical-child'
  | 'replace-element-shell'
  | 'resolve-exclusive-property'
  | 'wrap-content';

type EditorSchemaModelLocation = Readonly<{
  path: readonly number[];
  property?: string;
  root: RootKey;
}>;

type EditorSchemaRepair = Readonly<{
  code: EditorSchemaRepairCode;
  impact: 'lossless' | 'lossy';
  inputs: readonly EditorSchemaModelLocation[];
  outputs: readonly EditorSchemaModelLocation[];
  owner: 'document' | 'grammar' | 'property' | 'representation';
}>;

type EditorSchemaFitReport<V extends Value> = Readonly<{
  document: EditorDocumentValue<V>;
  repairs: readonly EditorSchemaRepair[];
}>;

function fitDocumentWithReport(...): EditorSchemaFitReport;

function assertContentSliceForSchema(
  slice: unknown
): asserts slice is ContentSlice;
```

The report covers document topology, grammar, properties, and representation.
Its location arrays support zero, one, or many inputs and outputs, including
defaults, drops, merges, splits, grouped wrapping, and root creation. Repairs
are collected transactionally: failed speculative fits and the projected-root
second pass emit nothing and cannot duplicate a committed repair. An
unclassified mutation throws in development/tests and blocks adoption. Raw
before/after document JSON and free-form reasons are excluded from the report.

`assertDocument` and `assertFragment` stay fail-fast and return no aggregate
result. The format collector can retain diagnostics from completed earlier
stages, but one failed canonical assertion contributes the first immutable
`EditorSchemaValidationDiagnostic`. No current caller branches on a complete
set of schema violations, so an aggregate validation API would add cost and a
second error contract without a user job.

Public `fitDocument` delegates and returns only `.document`, because its name
already grants coercive authority. HTML, Markdown, and DOCX map every committed
repair to one format diagnostic, then assert the final document. Failure to
admit a source-derived candidate becomes
`*-schema-invalid` with the original immutable
`EditorSchemaValidationDiagnostic`. A custom mapping that violates its
compiled output contract is a programmer/configuration failure and throws with
its owner; unrelated errors also rethrow.

`impact` is assigned per repair, not inferred from `code`. `lossless` preserves
every input model fact through schema-declared canonicalization or required
structure; `lossy` discards or replaces an input fact. A lossy action cannot
publish a parse success under the default policy. Fitting must be idempotent:
fitting its result produces the same document with no repairs. Same-input
repeatability is not promised when a declared property generator runs.

Format import applies its format loss policy. Persistence, native authored
payloads, and collaboration never fit incoming canonical state: after any
explicit version migration they assert it and preserve the last accepted state
on failure. A migration owns any deliberate rewrite itself. Public
`fitDocument` remains an explicitly coercive convenience and returns only the
document.

The schema does not own source-format fallback. `content.default` authorizes
construction, never reinterpretation. An unknown canonical element in a closed
schema is an error; a lawful unknown element under `unknown: 'preserve'`
remains unchanged, and admission fails if that element cannot be placed. It is
never generically converted to a paragraph. Remove default-shell substitution
from detached document fitting; an explicitly destination-owned insertion may
retain such behavior only if its content-conservation law holds. HTML,
Markdown, or DOCX may map a known external construct to a paragraph or unwrap
it only under an explicit format mapping whose diagnostics state what happened.
This avoids turning an unknown table, media node, custom root, or plugin block
into plausible-looking but corrupted prose.

Admission disposition is exact:

| Event | Outcome |
| --- | --- |
| Invalid source, resource limit, missing required part, or no schema-valid carrier | `ok: false`; no carrier under either loss policy |
| Lossless parser/schema canonicalization | `ok: true` with a warning |
| Unsupported visible semantics or a lossy schema fit | `ok: false` by default; `lossPolicy: 'allow'` may return the carrier with the exact warning |
| Caller-requested filter or authored projection | `ok: true` with a warning because the call explicitly selected that projection |
| Mandatory removal of executable or unsafe host behavior | Apply the safety rule and warn; loss policy cannot restore unsafe behavior |
| Invalid serializer model, malformed mapping output, configuration, or callback bug | Throw; loss policy cannot downgrade it |
| Hidden payload in HTML or Markdown | Give it no model authority; apply the ordinary safety/unsupported-content policy to the visible format |

Do not add `fitContentSliceWithTrace`. Open and inline slices have no lawful
fit without a destination parent, root, selection, and schema context. Detached
`parseSlice`/`parseInline` use private `assertContentSliceForSchema` to validate
strict JSON shape, node/property vocabulary, referenced-root reachability, and
open-depth bounds without wrapping, default insertion, or another mutation.
Contextual fitting remains at the canonical insertion owner
(`state.slice.fit`, `tx.slice.replace`, or `state.slice.fitContent`) after a
destination exists. A format parser must not invent that destination or report
insertion policy as source-format loss. Acceptance covers invalid properties,
unknown nodes, open/root-bearing native slices, closed/rootless direct syntax,
and a destination-specific repair separately.

Successful insertion is content-conserving. The fitter may add required
wrappers/defaults and apply proven canonical equivalence, but it may not drop,
replace, truncate, or semantically rewrite source content. A candidate that
would do so returns `false`. A caller that deliberately wants a lossy insertion
must transform the slice first and own that operation's diagnostics; no public
slice-fit trace is added.

## Exact authored state

Delete the HTML `<script>` envelope, the Markdown trailing-comment envelope,
their parsers, trust options, hashes, diagnostics, tests, and docs. HTML and
Markdown are semantic interchange formats; hiding an exact Plate document in
either one creates a second native persistence channel, gives ordinary syntax
two competing authorities, and has no production caller. Accepted and proposed
exports remain visible format projections and diagnose omitted roots, metadata,
pending changes, and conflicts.

Exact review state already has one truthful portable owner:

```ts
import { parseAuthoredDocument, projectAuthoredReview } from 'platejs/authored';

const snapshot = projectAuthoredReview(editor.read.value());
const json = JSON.stringify(snapshot.review);
const document = parseAuthoredDocument(json);
```

Do not add `serializeAuthoredDocument`: `snapshot.review` is already canonical
JSON-compatible model data, and `JSON.stringify` owns text encoding. Do not
rename this pair to `encode`/`decode`: no second representation is being
constructed on the write side. `EditorValueCodec` remains the typed bidirectional
codec for application persistence.

DOCX keeps its separate authored package part because tracked revisions,
comments, retained source, and Word interoperability are a proven format job.
That part uses a DOCX-owned trust and correspondence contract; it does not
justify HTML/Markdown envelopes or a shared native-format abstraction.

## DOCX API and lifecycle

Keep `DocxImportResult`, `DocxExportResult`, `DocxDiagnostic`, `DocxComment`,
`DocxSource`, package limits, source leases, and `exportDocx(editor, options)`.
Do not force detached export without a caller that can supply the static
rendering contract.

Hard-change import to:

```ts
export type DocxSourceLocation = Readonly<{
  endCodeUnit: number;
  part: string;
  qName: string;
  startCodeUnit: number;
}>;

export type DocxAuthoredTrust =
  | Readonly<{ kind: 'same-application' }>
  | Readonly<{
      kind: 'signature';
      verify: (input: Readonly<{
        canonicalPart: Uint8Array;
        signature: string;
      }>) => boolean;
    }>;

export type DocxImportOptions<
  TPlugins extends readonly BasePluginInput[],
  TRetainSource extends boolean = false,
> =
  Readonly<{
    authoredTrust?: DocxAuthoredTrust;
    limits?: Partial<DocxImportLimits>;
    lossPolicy?: 'allow' | 'reject';
    plugins: TPlugins;
    retainSource?: TRetainSource;
    schema?: EditorApplicationSchema;
    signal?: AbortSignal;
  }>;

export type DocxWarningDiagnostic = Extract<
  DocxDiagnostic,
  { severity: 'warning' }
>;

export type DocxErrorDiagnostic = Extract<
  DocxDiagnostic,
  { severity: 'error' }
>;

type DocxImportSuccess<
  TRetainSource extends boolean,
  V extends Value,
> = Readonly<{
  comments: readonly DocxComment[];
  diagnostics: readonly DocxWarningDiagnostic[];
  document: EditorDocumentValue<V>;
  ok: true;
}> & (TRetainSource extends true ? Readonly<{ source: DocxSource }> : {});

type DocxImportFailure = Readonly<{
  diagnostics: readonly [DocxErrorDiagnostic, ...DocxDiagnostic[]];
  ok: false;
}>;

export type DocxImportResult<
  TRetainSource extends boolean,
  V extends Value,
> = DocxImportSuccess<TRetainSource, V> | DocxImportFailure;

export function importDocx<
  const TPlugins extends readonly BasePluginInput[],
  const TRetainSource extends boolean = false,
>(
  source: ArrayBuffer | Blob,
  options: DocxImportOptions<TPlugins, TRetainSource>
): Promise<
  DocxImportResult<TRetainSource, EditorValueFromPlugins<TPlugins>>
>;
```

`platejs/docx/import` remains browser/client-only and editor-free. At function
entry, synchronously validate options and compile one immutable target holding
the schema and identity, mapping registry, frozen plugin states, authored
capability, and complete explicit DOM realm adapter. Capture `retainSource`,
normalized limits, loss policy, authored trust, and the signal reference before
the first await. After package read, never inspect a live editor, mutable store,
or ambient DOM constructor. Pass the target into Mammoth, HTML, authored,
schema-fit, comments, and source-correspondence stages. Collapse redundant HTML
cycles only after matched semantic/source/comment proof preserves every
sanitation and correspondence boundary.

`DocxDiagnostic` gives unsupported/lossy content warning and error variants
under the same stable codes so policy changes severity rather than changing
identity. A failure never carries a document, comments, or retained source;
`retainSource: true` does not authorize visible semantic loss.

Before Mammoth or DOM normalization can erase unknown OOXML, a bounded XML
tokenizer inventories main-document and package-part elements and records
`DocxSourceLocation`. Every unsupported diagnostic states `dropped`,
`unwrapped`, `preserved-in-source`, or `replaced`. The OOXML disposition table
is exact:

| Disposition | Outcome |
| --- | --- |
| Invalid ZIP/package, limit breach, missing required part, malformed required XML, or no schema-valid document | failure under every policy |
| Canonicalized with all visible/model facts retained | success with an action warning |
| Visible semantic loss through drop, replacement, or unsupported conversion | failure by default; `lossPolicy: 'allow'` may succeed with the exact warning |
| Visible semantics retained only in `DocxSource` | same semantic-loss rule; retaining source does not authorize an incomplete editor projection |
| Ignored non-visible package metadata | success with a warning when the omission can affect downstream behavior; otherwise no diagnostic |

Ordinary import ignores `editor/authored.json`. With `authoredTrust`, import
validates/signs the complete hidden payload, converts visible OOXML first, and
requires the hidden document's canonical selected projection to equal that
visible conversion before hidden roots/metadata can win. Changing only the
hidden document invalidates correspondence. The same trust rule covers exact
retained-source export; package-part hashes alone never authenticate authored
JSON.

Native DOCX admission calls `assertDocument` directly. It never fits the hidden
candidate and compares canonical model values structurally when exact equality
is required; `JSON.stringify` order is not an equality contract.

Cancellation is exceptional. Check at entry and every controllable boundary;
pass the signal into phases that accept it. A non-interruptible Mammoth/JSZip
phase may finish internally, but its result is discarded and the promise
rejects with `signal.reason ?? new DOMException('Aborted', 'AbortError')`
before model/source publication. A plugin mapping bug or invalid configuration
throws.

The import result keeps comments and optional source as named fields. Future
assets remain named format fields only after a real caller; no `extras` bag.
HTML/Markdown neither fetch nor return assets. DOCX export retains
`allowRemoteImages: false` by default and diagnoses omitted resources.

## Package and dependency topology

Add package exports:

```json
{
  "./html": {
    "types": "./dist/html/index.d.ts",
    "import": "./dist/html/index.js",
    "default": "./dist/html/index.js"
  },
  "./html/server": {
    "types": "./dist/html/server/index.d.ts",
    "import": "./dist/html/server/index.js",
    "default": "./dist/html/server/index.js"
  }
}
```

`platejs/html/server` is Node ESM. Do not advertise CommonJS while the package
does not ship a `require` condition. Add parse5 as a normal direct `platejs`
dependency because HTML parsing shares one WHATWG tree builder across
environments. Do not rely on transitive installations. The isolated
parse5 8.0.1 browser entry measures 151,560 minified bytes / 42,013 gzip bytes; the
production bundle gate records the full `platejs/html` delta and caps parser
overhead at 60 KiB gzip. LinkeDOM remains the only optional server peer:

```json
{
  "dependencies": {
    "parse5": "^8.0.1"
  },
  "peerDependencies": {
    "linkedom": "^0.18.13"
  },
  "peerDependenciesMeta": {
    "linkedom": { "optional": true }
  }
}
```

The server entrypoint resolves LinkeDOM synchronously with Node's module loader
through a server-only `createRequire(import.meta.url)` helper and throws one
stable actionable missing-peer error. Browser/root modules that do not
reach HTML parsing, plus Markdown and DOCX graphs, contain no LinkeDOM or Node
builtin import; parse5 appears only when an HTML parse capability is retained
by the bundle. Do not create a new package: the subpath owns one official server
implementation without fragmenting the monolith.

Package adoption updates `package.json` exports, TypeScript paths, tsdown
entries, entrypoint DAG/runtime classification, task partitions, and generated
runtime proof together. Packed proof covers LinkeDOM absent and present; parse5
is always installed directly. Probe artifacts bind exact parse5 8.0.1 and
LinkeDOM 0.18.13. The supported caret ranges are tested at their minimum and
newest admitted versions whenever either range advances.

Keep `platejs/markdown`, `platejs/docx/import`, `platejs/docx/export`, and
`platejs/dom`. Plite exports the DataTransfer names from its DOM entrypoint;
Plate's DOM facade re-exports them. Run `pnpm brl` after files and exports move.

## Bounded API migration

`api-ontology.tsv` is the row-level source of truth for the name-filtered
conversion ontology, not every export in 81 entrypoints. Execution regenerates
it before the rename and after the final surface; reviewed count must equal
expected count both times. A separate complete before/after export-symbol diff
for every affected root and subpath catches helpers whose names evade the
ontology filter. The family-level disposition is:

| Family | Disposition |
| --- | --- |
| `EditorValueCodec` | keep only the current typed JSON pair; move version/legacy decode to `EditorValuePersistence` |
| `PropertyJsonValue` | merge into `EditorJsonValue` |
| persisted document migrations | keep separate |
| `HostCodec*` and host-data helpers | hard rename to DataTransfer family |
| DOM clipboard read/write/assertions | keep |
| plugin `codecs`/`defineCodecs` | hard rename and narrow to feature mappings |
| arbitrary MIME declarations in plugin formats | move to `DataTransferFormat` |
| Markdown/PlainText `*Codec` node types | hard rename to `*Mapping` |
| `HtmlCodecHooks` | delete mixed wrapper; keep only inferred `html.prepareDocument` and move transfer work to `DataTransferFormat` |
| public Markdown conversion helpers/rules | make private or delete |
| HTML `deserialize*` | replace with `parseHtml`/`parseHtmlSlice` results |
| Markdown `deserialize*` | replace with document/slice/inline parse results |
| HTML/Markdown authored envelopes | delete; use authored JSON for exact review state and DOCX for Word revisions |
| HTML/Markdown serializers | keep direct; accepted/proposed visible projections only, impossible-state results, and default loss rejection |
| DOCX import | detached signature and capture |
| DOCX export | keep editor capture and source-aware result |
| plain-text projection | keep one-way serialization |
| schema assertions and explicit fit | keep; private semantic fit report added |
| `compileEditor` | keep independent application-schema job |
| CSV parse types | defer to CSV review |
| inherited React/generic lexical matches | exclude |

Delete old files after all callers move; do not leave re-export barrels,
deprecated names, dual plugin fields, overloads, or migration shims.

## Before and after call sites

### 1. Node HTML

Before:

```ts
const editor = createEditor({ plugins: EditorKit });
const document = editor.api.html.deserializeDocument(source);
```

After:

```ts
import { parseHtml } from 'platejs/html/server';

const result = parseHtml(source, { plugins: EditorKit });

if (!result.ok) throw new ImportError(result.diagnostics);
const document = result.document;
```

### 2. Complete Markdown file replacement

Before:

```ts
const document = editor.api.markdown.deserialize(markdown);
editor.update((tx) => tx.value.replace({ children: document.children }));
```

After:

```ts
const result = editor.api.markdown.parse(markdown);

if (result.ok) {
  editor.update((tx) => tx.value.replace(result.document));
}
showImportDiagnostics(result.diagnostics);
```

### 3. AI block and inline insertion

Before:

```ts
const blocks = editor.api.markdown.deserialize(answer).children;
tx.fragment.replace(blocks);
tx.fragment.replace(editor.api.markdown.deserializeInline(completion));
```

After:

```ts
const blocks = editor.api.markdown.parseSlice(answer);
const inline = editor.api.markdown.parseInline(completion);

if (blocks.ok && !tx.slice.replace(blocks.slice)) {
  reportInsertionFailure(blocks.diagnostics);
}
if (inline.ok && !tx.slice.replace(inline.slice)) {
  reportInsertionFailure(inline.diagnostics);
}
```

AI owns how diagnostics reach chat/UI; it cannot silently insert a failed or
lossy fallback.

### 4. HTML and Markdown export diagnostics

Before:

```ts
const html = serializeHtml(document, { plugins: EditorKit });
const markdown = serializeMarkdown(document, { plugins: EditorKit });
```

After:

```ts
const html = serializeHtml(document, {
  plugins: EditorKit,
  projection: 'proposed',
});
const markdown = serializeMarkdown(document, {
  plugins: EditorKit,
  projection: 'proposed',
});

showExportDiagnostics([...html.diagnostics, ...markdown.diagnostics]);
if (!html.ok || !markdown.ok) return;

downloadHtml(html.data);
downloadMarkdown(markdown.data);
```

The result shape remains format-specific even when one UI combines warnings.

### 5. DOCX import, cancellation, and retained source

Before:

```ts
const result = await importDocx(editor, file, {
  retainSource: true,
  signal,
});
```

After:

```ts
const result = await importDocx(file, {
  plugins: EditorKit,
  retainSource: true,
  signal,
});

if (result.ok) {
  editor.update((tx) => tx.value.replace(result.document));
  docxSourceRef.current = result.source;
}
```

### 6. DOCX export name

Before:

```ts
const result = await exportToDocx(editor, { projection: 'review' });
```

After:

```ts
const result = await exportDocx(editor, { projection: 'review' });
```

`To` adds no direction that `export` does not already express. DOCX keeps its
verb because the operation creates a package artifact and may preserve native
source, comments, and revisions.

### 7. Versioned persistence codec

Before:

```ts
const codec: EditorValueCodec<PageSettings> = {
  decode,
  encode: (value) => value,
  version: 2,
};
```

After:

```ts
const persistence: EditorValuePersistence<
  PageSettings,
  PageSettingsJson
> = {
  codec: {
    decode,
    encode: (value) => ({ size: value.size }),
  },
  legacyDecoders: { 1: decodeV1 },
  version: 2,
};
```

The encoded generic narrows output and runtime snapshot validation rejects
strict-JSON violations the type system cannot express.

### 8. Custom feature mapping

Before:

```ts
const AlignPlugin = definePlugin('align', {
  codecs: ({ defineCodecs, store }) =>
    defineCodecs({
      'text/html': {
        decode: ({ element }) => readAlign(element, store.get()),
      },
    }),
});
```

After:

```ts
const AlignPlugin = definePlugin('align', {
  formats: ({ defineFormats }) =>
    defineFormats({
      html: {
        decode: ({ element, pluginState }) =>
          readAlign(element, pluginState),
      },
    }),
});
```

No callback parameter annotation is needed; `pluginState` and node/property
types infer from the descriptor.

### 9. Validation failure

Before:

```ts
try {
  editor.read.schema.assertDocument(value);
} catch {
  return null;
}
```

After at a format boundary:

```ts
const result = parseMarkdown(source, { plugins: EditorKit });

if (!result.ok) {
  const schemaIssues = result.diagnostics.filter(
    (item) => item.code === 'markdown-schema-invalid'
  );
  reportImportFailure(schemaIssues);
}
```

Direct model admission continues to use `assertDocument`; no generic safe
validation wrapper is added.

Export follows a stricter path: assert the captured document, project authored
state, assert the projection, then test format representability. It never calls
`fitDocument`. Invalid canonical input is a programmer/boundary failure;
unrepresentable valid input is the format result governed by `lossPolicy`.

## Adoption slices

### Slice 1: typed persistence law

- Add `EditorJsonValue`; split current `EditorValueCodec` from
  `EditorValuePersistence`; type serialized envelopes and every descriptor that
  carries them.
- Migrate value, effect, selection, state-field, authored, collaboration,
  pagination, and package callers.
- Merge/delete `PropertyJsonValue` after declaration/type tests prove parity.
- Add one reusable law harness for live/encoded directions and separate fixed
  fixture tests for legacy decoders; include strict-JSON runtime failures that
  TypeScript cannot express.

Exit: Plite types/tests pass, declaration consumers infer encoded types, JSON
detachment is proved, and no public property-specific JSON type remains unless
one independent semantic difference is documented.

### Slice 2: atomic DataTransfer and feature-format ontology cut

- Rename the Plite owner, fields, callbacks, helper functions, lifecycle error
  source, exports, docs, and Plate facade in one atomic slice.
- Migrate default plain text, HTML, Markdown, Word, CSV, custom MIME, clipboard,
  drag/drop, compiler, and tests.
- Add `formats`/`defineFormats` and semantic keys; migrate all production
  declarations and type tests.
- Replace editor/store closures with frozen `pluginState`, registry, schema,
  immutable encode model view, and narrow report contexts.
- Move every whole-payload MIME declaration to `DataTransferFormat`.
- Rename compilers/types/files and make Markdown implementation helpers
  private.
- Preserve transfer ordering, schema-claim conflict detection, callback failure
  isolation, file snapshotting, contextual `ContentSlice` fitting, diagnosed
  attempt fallback, and post-acceptance report timing.
- Delete `HostCodec`, `codecs`, `defineCodecs`, old helpers, overloads, and
  exports only after all owners move in this same slice; no committed dual
  public state is allowed.

Exit: every production owner compiles without explicit callback annotations;
detached conversion is invariant under unrelated document, selection, field,
and metadata changes; the first throwing transfer format cannot block a later
success; no old host/plugin codec noun remains outside immutable history; and
clipboard/drag behavior plus callback inference pass. Rejected rich formats,
unfit slices, selected warnings, successful fallback, all-formats-fail, writes,
abandoned specs, and a throwing report sink each have one exact report/timing
case; `insertData` remains boolean.

### Slice 3: reported fit, slice admission, and diagnostic ownership

- Inventory every mutating fit branch, add the private semantic report, and
  cover every repair code with one public-boundary conversion case.
- Add operation-scoped HTML/Markdown diagnostic collectors and mapping
  `report` contexts.
- Make parse/serialize success warnings-only and failure diagnostics non-empty
  with an error first; add declaration tests for both impossible states.
- Add private detached-slice admission that validates shape, vocabulary,
  referenced roots, and openness without performing destination-specific fit.
- Remove expected format errors from the editor lifecycle channel.
- Distinguish returned source failures from thrown configuration/programmer
  failures.
- Cover zero/one/many input-output correspondence; unknown reject, lawful
  preserve, and unplaceable preserve; failed speculative fits; projected-root
  second-pass deduplication; deterministic repair order; generator fixed-point
  behavior; unchanged input/metadata; and HTML/Markdown/DOCX loss-policy
  mapping.

Exit: deliberate mutations to each repair/fallback/drop branch make a focused
test fail; each framework mutation produces one deterministic diagnostic; no
mapping can forge parser/schema/limit/safety codes; and no unknown fit repair
can be silently discarded. Fitting an admitted output returns the same document
with an empty report, while a fresh generated-property fit need not repeat the
same generated value.

### Slice 4: Markdown parse and serialize contract

- Implement direct detached document/slice/inline functions and editor
  delegates over one private runtime.
- Return typed success/failure results, positions, fit diagnostics, closed
  rootless direct slices, and rejectable serialize loss.
- Remove `onError`, rules/ruleOverrides, raw inline arrays, and public helper
  exports.
- Restrict plugin inputs to synchronous attachers/transformers and reject
  thenables at runtime.
- Migrate AI Chat, Copilot, streaming examples/tests, imports, docs, and all
  package consumers by semantic job.
- Delete the trailing authored comment and review projection; exact review
  state stays in authored JSON and Word review stays in DOCX.

Exit: CommonMark/GFM/MDX and streaming corpora pass; every filter/unknown/
Plate fallback is diagnosed; unknown visible serialization fails by default;
async plugins throw; representable parse/serialize projections reach a
canonical fixed point; accepted/proposed output contains semantic Markdown
only.

### Slice 5: browser HTML parse and serialize contract

- Create `platejs/html`; implement direct document/slice functions and editor
  delegates.
- Use parse5 for canonical tree construction and materialize its AST node by
  node into a detached template owner document without an HTML injection sink.
- Enforce root selection, resource limits, diagnostics, explicit DOM adapter,
  Trusted Types CSP compatibility, and zero network/script activity.
- Add the canonical safety policy, source/tree correspondence, default serialize
  loss rejection, accepted/proposed projections, and representable-subset law.
- Delete the authored `<script>` envelope and static review projection; exact
  review state stays in authored JSON and Word review stays in DOCX.
- Privatize `HTMLElement` decoding for clipboard/DOCX/table internals.
- Migrate import UI, schema examples, static round trips, docs, and type tests.

Exit: 0/1/2 editor-marker cases, malformed DOM, whitespace, feature mappings,
unsafe input, roots/meta, and semantic projections pass in Chromium; no
ordinary bad source reaches lifecycle error reporting.

### Slice 6: Node HTML entrypoint

- Add the LinkeDOM optional peer declaration and `platejs/html/server`.
- Reuse the shared parse5 tree and add LinkeDOM materialization without global
  mutation.
- Fix style iteration and share the same mapping/diagnostic engine with the
  browser adapter.
- Port the throwaway correctness/benchmark scripts to public packed imports.
- Add counting-tree limits, source correspondence, peak-RSS, poisoned-global,
  missing-peer, ESM, SSR, declaration, and browser graph tests.

Exit: all four frozen cohorts pass their recorded absolute budgets; the ten
malformed and six Plate cases pass; packed server import works with peers and
fails clearly without them; non-HTML bundles exclude parse5, and browser bundles
contain neither LinkeDOM nor Node builtins.

### Slice 7: detached DOCX import

- Change the signature and migrate all callers/tests/docs.
- Capture the private format target before await and thread it through every
  stage.
- Replace repeated DOM conversions only after matched semantic/source/comment
  results prove equality.
- Add pre-DOM OOXML inventory and source locations, the fatality/loss-policy
  matrix, explicit authored trust/correspondence, delayed
  converter/reconfiguration, controllable-boundary cancellation, comments,
  revisions, source leases, and unsupported OOXML coverage.

Exit: delayed import cannot observe later editor/global changes; abort publishes
no model or source even when non-interruptible work finishes; hidden-only
authored mutation fails; exact/source-aware/rebuilt paths and comments/tracked
changes pass package and native-viewer proof. DOCX export determinism is outside
this import slice and receives no unsupported byte-identity claim.

### Slice 8: callers, docs, registry, and release surface

- Audit every bounded ontology row, every production consumer, and a complete
  before/after export-symbol diff for affected entrypoints after the cuts.
- Update English/Chinese HTML, Markdown, DOCX, serialization, Node installation,
  editor API, authored, clipboard, and plugin-authoring docs for the final API.
- Update registry import/export controls, demos, metadata, changelog, and
  generated output. Never hand-edit templates or generated registry files.
- Add major changesets for `plitejs` and `platejs` describing the final public
  contract.
- Run Best API doctrine repair: update source teaching, add the smallest Plate/
  Plite vision law only if the evidence changed durable doctrine, append the
  required Plate Next doctrine version, regenerate mirrors, and prove them.
- Record one immutable implementation outcome against both governing reviews.

Exit: docs show only the final API, registry output is fresh, old symbols are
absent outside immutable history/migration records, changesets are valid, and
the ledger reports adopted/verified only after the full proof below.

## Proof matrix

| Risk | Public oracle | Required evidence |
| --- | --- | --- |
| Persistence law lies | reusable codec/persistence law harness | current live round trip, encoded canonical fixed point, strict runtime JSON rejection and detachment, one fixed fixture per legacy decoder, unknown-version refusal |
| DataTransfer behavior drift | clipboard/drag MIME corpus | registration order, `accept`/`decode` fallback, deterministic conflicts, files, native open slices/roots, one callback throwing before a later format succeeds, rejected/unfit/selected/write attempt reports, post-commit timing, and all-formats-fail reporting |
| Type inference regression | declaration/type tests | `EditorValueFromPlugins<TPlugins>` on document/slice results, self/foreign mappings, frozen plugin state/registry/model view, sync Markdown plugins, and no callback annotations |
| Impossible result state | compile-time assertions plus malformed corpora | success exposes warnings and a carrier; failure exposes a nonempty error-first diagnostic tuple and no carrier; serialization failure exposes no data |
| Silent conversion loss | HTML/Markdown diagnostic corpus | every Plate-controlled fit/filter/fallback/drop/unsafe mutation is reported once; custom mapping loss is tested only against its declared projection law |
| Format law overclaims fidelity | representable-subset property harness | `parseHtml(serializeHtml(project(document)).data).document` and the Markdown equivalent are semantically equal to `project(document)`, canonical roots/metadata survive, diagnostics match expected loss, and reapplying the projection reaches a fixed point |
| Document/slice confusion | complete import, direct slice, native transfer, and insertion cases | complete roots/metadata are preserved or diagnosed; direct slices are closed/rootless; only native transfer retains openness/roots; insertion success is checked rather than assumed |
| Browser/server divergence | shared parse5 tree and source-location corpus | equal canonical model and diagnostic codes across materializers; source code-unit ranges remain distinct from tree paths through explicit parse5-node correspondence |
| Browser parser side effects | strict Trusted Types CSP and network oracle | no injection sink, script execution, subresource request, active iframe, or live-DOM attachment; private adapter owns constructors, constants, traversal, and styles even when ambient DOM globals are poisoned |
| Server performance/memory | frozen four-cohort benchmark in fresh processes | UTF-8 byte admission precedes parse; parse5 counting adapter enforces node/depth limits during construction; p95, retained heap, and peak RSS budgets pass |
| HTML dependency leak | packed consumers + bundler metafiles | server works with LinkeDOM present and fails actionably without it; non-HTML graphs exclude parse5; browser graphs exclude LinkeDOM/Node builtins; parse5 overhead is at most 60 KiB gzip |
| Duplicate native authority | authored JSON and DOCX review corpora plus public export inventory | exact authored JSON round-trips through `parseAuthoredDocument`; DOCX review retains revisions/comments/source correspondence; HTML and Markdown expose only accepted/proposed semantic projections and no hidden authored transport |
| DOCX async capture drift | delayed converter/reconfigure/abort probe | the exact frozen entry target alone controls output; abort publishes no model/source and rejects with the signal reason or `AbortError` |
| DOCX fidelity regression | pre-DOM OOXML inventory, package inspection, import/export/reopen, and LibreOffice open/resave | fatal versus diagnosed unsupported parts follow the matrix; source ranges, comments, revisions, exact/source-aware/rebuilt paths, clean projection, and authored-part correspondence remain intact; LibreOffice readability is claimed without Word parity |
| App regression | managed Chromium routes | import, result/error branches, export, AI block/inline, clipboard/Word paste, and user-visible diagnostics |

Focused iteration resolves actual entrypoints first, then uses repository-owned
runners. Expected commands include:

```bash
node --max-old-space-size=6144 docs/plite/research/2026-09-25-document-codec-architecture/sources/build-public-manifest.mjs
node docs/plite/research/2026-09-25-document-codec-architecture/sources/build-api-ontology.mjs
pnpm --filter plitejs typecheck
pnpm --filter platejs typecheck
pnpm --filter platejs lint:fix
pnpm --filter plitejs test
pnpm --filter platejs test
pnpm check:plite:dev
pnpm brl
pnpm --filter www build:registry
pnpm --filter www build:registry --check
node --expose-gc docs/plite/research/2026-09-25-document-codec-architecture/sources/benchmark-html-server-parse5-linkedom.mjs
bun docs/plite/research/2026-09-25-document-codec-architecture/sources/probe-html-server-correctness.ts
node docs/plite/research/2026-09-25-document-codec-architecture/sources/probe-html-browser-inertness.mjs
node docs/plite/research/2026-09-25-document-codec-architecture/sources/measure-parse5-browser-bundle.mjs
node tooling/scripts/review-ledger.mjs render
node tooling/scripts/review-ledger.mjs check
node .agents/rules/plate-next/scripts/version.mjs validate
```

Focused iteration covers the renamed successors of
`packages/plitejs/test/value-codec.test.ts`,
`packages/plitejs/test/dom/host-codec.test.ts`,
`packages/platejs/src/lib/plugins/html/HtmlPlugin.codec.spec.ts`,
`packages/platejs/src/lib/plugins/html/HtmlPlugin.spec.ts`,
`packages/platejs/src/markdown/lib/MarkdownPlugin.spec.ts`, and
`packages/platejs/src/docx/import/lib/importDocx.spec.ts`; closure runs both
complete package suites above. Closure also adds public import/type smoke,
packed temporary consumers with LinkeDOM absent and present, managed Chromium
import/export/AI/clipboard suites, `pnpm check:plite`, the browser matrix,
DOCX ZIP/XML inspection, and the established macOS LibreOffice open/resave and
public reimport lane. That lane proves LibreOffice readability only; Microsoft
Word parity remains unproved. Do not substitute a stale dev server, raw
Playwright command, or source import for the packed/server claim.

No test merely asserts that an old name is absent. Source/ontology searches
prove deletion; tests prove current behavior and types.

## Rollback and quarantine

- Each slice is atomic and leaves one public owner. If a slice cannot pass its
  exit gate, revert that slice; do not retain dual names or adapters.
- If reported fitting cannot classify every mutation, format parse adoption is
  blocked. Never ship the new result while silently discarding an unknown
  action.
- If the parse5 browser materializer executes content, requests a resource,
  fails under Trusted Types CSP, diverges from the server model, or exceeds the
  bundle budget, quarantine the new parse surface. Do not fall back to
  `DOMParser`, which does not guarantee network isolation.
- If parse5 plus LinkeDOM misses correctness or any frozen server-path budget,
  quarantine `platejs/html/server`. Do not fall back to happy-dom or
  ambient-global mutation.
- If LinkeDOM peer resolution cannot stay out of browser graphs, move only the
  server entrypoint to a dedicated package; keep the public parse contract.
- If DOCX source/comment/revision/native-viewer proof regresses, revert the
  detached DOCX slice while retaining completed independent slices.
- CSV remains unchanged until its own review. A CSV failure cannot be hidden by
  this plan or used to widen the format abstraction.

## Implementation acceptance contract

| Requirement | Required exit evidence |
| --- | --- |
| API inventory | All 405 rows in the bounded name-filtered ontology reconcile to the final surface; regenerated expected/reviewed counts match, and a complete before/after export-symbol diff covers affected entrypoints. |
| Persistence | `EditorValueCodec` owns only the current pair, `EditorValuePersistence` owns version history, the encoded generic is retained, runtime strict-JSON admission passes, and current/legacy laws pass. |
| Ontology hard cut | HostCodec and plugin codec nouns are absent with no aliases; DataTransfer and mapping behavior/inference pass. |
| Parse surface | HTML/Markdown direct functions and editor delegates return the specified document/slice results and diagnostics. |
| Error ownership | No parser exposes raw inline arrays, expected-error callbacks, or lifecycle side-channel failures. |
| Schema boundary | Assertion stays rejection-only; every coercive format repair is reported with zero-to-many correspondence, classified by impact, diagnosed, and fixed-point idempotent. Closed-schema unknown model elements fail instead of becoming paragraphs. |
| Recovery policy | HTML, Markdown, and DOCX reject lossy recovery by default; explicit `allow` carries the exact warning. Export never fits either the captured document or authored projection. |
| Hidden state | HTML and Markdown carry no hidden authored document or review projection. Exact review state round-trips through authored JSON; DOCX alone owns trusted authored package correspondence for Word review. |
| Browser and server HTML | Shared tree correctness, CSP/network/script inertness, limits, package isolation, bundle graph/size, and frozen server performance budgets pass. |
| DOCX | Detached entry capture, cancellation, comments, revisions, source, and native artifacts show no regression. |
| Ecosystem | Callers, AI, clipboard/Word paste, docs, registry output, changesets, barrels, doctrine mirrors, and ledger match. |
| Closure | Focused and broad gates pass; failed or unexecuted browser/native claims stay explicit. |

Phase / pass table:

| Phase | Status | Evidence |
| --- | --- | --- |
| Research setup and history | Complete | README, prompt, prior decision reconciliation, six ledgers |
| Typed codec and validation audit | Complete | shard 002 and fixed-source read log |
| Pipeline/source-retention audit | Complete | shard 003 and fixed-source read log |
| Editor/cross-language audit | Complete | shard 004 and fixed-source read log |
| Local ontology and hard cut | Complete | 405/405 `api-ontology.tsv` rows |
| Browser and Node HTML targets | Complete | browser CSP/network/bundle probes plus four server benchmark cohorts and correctness artifact pass |
| Best API decision | Complete | immutable import/export vocabulary doctrine-closure records |
| Adoption design | Complete | this eight-slice plan and proof matrix |

Research verification evidence:

- Initial public manifest regeneration: 81 entrypoints and 743 raw rows.
- Initial ontology regeneration: 405 reviewed rows; 145 keep, 74 rename, 11
  make private, 3 reshape, 3 defer, and 169 lexical exclusions.
- Ledger schema audit: 31 repositories, 13 queries, 19 leads, 35 reads, 16
  rejections, and 11 promoted packets; every TSV row matches its header width.
- Server candidate: all four frozen benchmark cohorts pass; correctness reports
  10 malformed/conformance and 6 Plate conversion cases plus custom mapping and
  inertness.
- Browser candidate: all seven Chromium CSP/network/execution checks pass; the
  isolated parse5 8.0.1 entry measures 151,560 minified / 42,013 gzip bytes.
- `review-ledger render` and `review-ledger check` pass with the conversion
  vocabulary reviews, design outcome, and generated feature hubs fresh.
- Plate Next doctrine registry validates at v240 with exact generated skill
  parity and unchanged package attestations.
- Final product regeneration: 83 entrypoints and 663 raw rows; 349 reviewed
  rows resolve to 176 keep, 3 defer, and 170 exclude decisions. The complete
  affected-export diff is recorded in `affected-export-symbol-diff.tsv`.

Implementation evidence:

- Persistence, DataTransfer, schema-fit, HTML, Markdown, and DOCX focused tests
  and public declaration contracts pass.
- `pnpm check:plite` passes under the repository Node 22 runtime: 100 typecheck
  partitions, 163 package-test partitions, 256 tooling contracts, 25 benchmark
  contracts, all 55 benchmark targets, public package types, and 748 Chromium
  tests with seven declared skips.
- The exact-source browser matrix passes: Chromium 748/7, Firefox 676/79,
  WebKit 697/58, mobile Chromium 374/381, and mobile WebKit 2/0
  passed/skipped. Firefox exposed one real projected-selection input gap; the
  keyboard strategy repair passes its exact regression plus all 46 strategy
  contracts.
- Packed release proof passes 93 public subpaths and the LinkeDOM missing-peer
  diagnostic; non-HTML and browser graphs retain the required dependency
  boundaries.
- The production HTML correctness, inertness, bundle, and four-cohort server
  probes pass their frozen budgets.
- DOCX revision import passes 199 assertions; retained-source import/export
  passes 506 assertions. Accepted, proposed, and review artifacts open and
  resave in LibreOffice and publicly reimport through the detached API.
- Website typecheck, API reference generation, docs parity, registry and
  changelog generation/freshness, and the managed import/export/AI/clipboard
  Chromium workflows pass.

Closure:

- The immutable implementation outcome
  `2026-09-27-document-conversion-contracts-implementation` binds this plan to
  both review scopes and records the verified proof and explicit limits.
- No commit, push, pull request, release, or deployment was performed.

## Completion

All eight slices and every requirement row are closed. LibreOffice open/resave
proves the generated DOCX artifacts are readable there; Microsoft Word parity
remains unproved, and DOCX memory measurements remain whole-process RSS.
