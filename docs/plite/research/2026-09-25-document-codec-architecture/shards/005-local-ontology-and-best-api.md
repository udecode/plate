# Shard 005: local ontology and Best API

## Scope

Classify every bounded Plate/Plite public conversion noun, apply delete/merge/
inline/reuse, and state the exact target before adoption planning.

## Bounded surface

`build-public-manifest.mjs` found 743 raw rows across 81 entrypoints.
Normalization by `(symbol, member, kind, source, line)` produced 405 rows.
`build-api-ontology.mjs` reviewed all 405 rows selected by the bounded
conversion-name inventory:

| Decision | Rows |
| --- | ---: |
| Keep | 145 |
| Rename | 74 |
| Make private | 11 |
| Reshape | 3 |
| Defer | 3 |
| Exclude lexical collision | 169 |

The row-level source, target, and reason are in `api-ontology.tsv`.

## Hard cuts

Delete the proposed `DocumentCodec`, `DocumentFormat`, generic
`ConversionResult`, dispatcher, format registry, universal AST, conversion
session/artifact, and public compiler. None owns a current polymorphic caller,
one lifecycle, or one truthful law across formats.

Do not add Zod, Standard Schema, `validateDocument`, or `safeParseDocument`.
The compiled schema already owns canonical admission. Do not make
`fitDocument` sound like validation.

Make Markdown implementation helpers and per-call rules private. Reusable
syntax behavior belongs to installed feature mappings. Remove compatibility
aliases on `next`.

## Surviving nouns

### Persistence

Keep `EditorValueCodec<TDecoded, TEncoded extends EditorJsonValue =
EditorJsonValue>` for one current pair. `encode` returns `TEncoded`; `decode`
consumes `unknown`. `EditorValuePersistence<TDecoded, TEncoded>` separately
owns the positive envelope version and decode-only `legacyDecoders`.
`SerializedEditorValue<TEncoded>` stores the exact encoded value. Required
laws are semantic `decode(encode(value)) ≈ value`, canonical
`encode(decode(encoded))`, encoded fixed-point idempotence, strict runtime JSON
admission, and one fixed fixture per legacy decoder.

`EditorJsonValue` becomes the shared JSON value type. `PropertyJsonValue` may
alias it during the hard migration, then disappear if no property-specific
meaning remains. This is a type consolidation, not a generic schema system.

### Browser transfer

Hard rename:

- `HostCodec` → `DataTransferFormat`
- `HostDataSource` → `DataTransferSnapshot`
- `HostCodecParseContext` → `DataTransferDecodeContext`
- `HostCodecSerializeContext` → `DataTransferEncodeContext`
- `HostCodecSchemaTarget` → `DataTransferSchemaClaim`
- `HostCodecPhase` → `DataTransferFormatPhase`
- fields `format`/`owns` → `mimeType`/`claims`
- callbacks `parse`/`query`/`serialize` → `decode`/`accept`/`encode`
- `hostCodecs` → `dataTransferFormats`
- host-data transaction/write helpers → DataTransfer names

This owner negotiates MIME payloads and `ContentSlice` for clipboard and drag
and drop. It does not own document file conversion.

### Feature syntax

Hard rename plugin `codecs`/`defineCodecs` to `formats`/`defineFormats`.
Rename `MarkdownNodeCodec`, `PlainTextNodeCodec`, `PluginCodecNode`, and
to `MarkdownNodeMapping`, `PlainTextNodeMapping`, and `PluginFormatNode`.
Delete `HtmlCodecHooks`: `query` and Word/source-aware transforms belong to
`DataTransferFormat`, while the one generic list-normalization job becomes an
inferred `prepareDocument` field on the HTML mapping and operates on the inert
DOM already built by the parser. Whole-payload MIME declarations move to
`DataTransferFormat`; feature mappings describe nodes and marks for HTML,
Markdown, and structural plain text.

### Format conversion

HTML and Markdown use `parse`/`serialize`, because they parse syntax and print
a normalized representation. `decode`/`encode` remain inside node mappings and
typed persistence where the paired-domain language is useful.

Parse result unions are format-specific:

```ts
type HtmlDocumentParseResult =
  | Readonly<{
      diagnostics: readonly HtmlWarningDiagnostic[];
      document: EditorDocumentValue;
      ok: true;
    }>
  | Readonly<{
      diagnostics: readonly [HtmlErrorDiagnostic, ...HtmlDiagnostic[]];
      ok: false;
    }>;
```

Slice and inline results replace `document` with `slice: ContentSlice`.
Markdown defines its own corresponding types. Successful recovery is `ok:
true` with diagnostics; `ok: false` means no schema-valid requested result.
Programmer/configuration failures throw. Serialize uses the same honest shape:
success contains data and warnings; failure contains an error-first nonempty
tuple and no data. Its `lossPolicy` defaults to `reject`.

Diagnostics have format-owned `code` and payload, common `message` and
`severity`, optional encoded `source`, and optional canonical `model`:

```ts
type HtmlSourceLocation =
  | Readonly<{ kind: 'source-range'; end: number; start: number }>
  | Readonly<{ kind: 'tree-path'; path: readonly number[] }>;

type FormatModelLocation = Readonly<{
  path?: readonly number[];
  property?: string;
  root?: RootKey;
}>;
```

HTML retains explicit parse5-node correspondence so a source code-unit range
is never confused with a repaired-tree path. Markdown uses its own source range
shape; DOCX uses OOXML part/range locations. The concrete diagnostic types
remain `HtmlDiagnostic`, `MarkdownDiagnostic`, and `DocxDiagnostic`; there is
no universal public diagnostic union.

## Ownership

- Plite: canonical value, `ContentSlice`, schema assertions/fitting, JSON
  persistence codec, DataTransfer negotiation.
- Plate core: plugin feature format mappings and private frozen compilation.
- HTML/Markdown/DOCX entrypoints: syntax, results, diagnostics, limits, native
  envelope/source behavior.
- Applications: file selection, decoding bytes/text, replacing a complete
  value, feedback, URL/resource policy.

## Deferred

CSV remains table/plain-text ingress. Its three manifest rows stay deferred to
a separate review rather than being forced into the document format design.

## Next query

Accept or reject the Node HTML runtime with a frozen performance and correctness
probe, then run three final challenge passes.
