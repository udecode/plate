# Shard 003: document pipelines and source retention

## Scope

Compare parse/print pipelines, source-aware transformation, recovery,
diagnostic coordinates, unknown data, and many-format architectures.

## Fixed sources

- unified `ba1af683ba597228b736566752668e7132295d38`
- VFile `5e83917c832881569c52f1118c7beea3f12ac12f`
- mdast from Markdown `9db8c40670f405758d6fff529bdcf4ab122146e4`
- mdast to Markdown `4ce3d2715efd3a6901d6be8ba2d1f576b072940f`
- YAML `528ef30d6ded4bd9f2c3521b670eb2b29d503c5c`
- Recast `a8c182a0c9285daa735ff02637efc0430571d1f6`
- PostCSS `ebffa97faa305f781a7df5a41ec39f57966b7b6c`
- node-jsonc-parser `dba4356548089b594dd12b324d0547e1c2c5ddb8`
- parse5 `574ab9698c9ff0648f322d04f8117c7b4e927f7e`
- Pandoc `bde8c297ee68c07a037f06971aa0f1cce8a876cb`
- protobuf-es `5bff467ec1daa8e2ad9a0eeb6a1133cf0f452307`

## Fidelity levels

The sources require four distinct claims:

1. **Source exact:** original bytes or package units can be reused.
2. **Source aware:** unchanged regions can reuse source through explicit
   correspondence; changed regions are printed canonically.
3. **Semantic:** parsing and printing preserve admitted meaning but may
   normalize syntax.
4. **Native model:** an embedded Plate value reconstructs editor state but does
   not prove correspondence with the visible external representation.

YAML is the clearest owner split: CST/source artifacts and semantic documents
are separate. Recast shows that source-aware printing needs original nodes and
correspondence, not positions alone. VFile and PostCSS keep encoded source
positions separate from transformed-tree identity. node-jsonc-parser shows
that tolerant parsing can return a value and errors. Parse5 distinguishes
standard tree construction from source rewriting. Protobuf keeps unknown data
inside its own schema protocol. Pandoc shows the cost of a universal
interlingua: every reader/writer still owns an expanding loss matrix.

## Plate implications

- A retained artifact remains format-owned and has an explicit invalidation
  law. DOCX keeps `DocxSource`; HTML and Markdown do not gain a generic source
  session.
- Native HTML/Markdown envelopes are model reconstruction. They must bind the
  schema identity, envelope version, and digest of the visible projection.
  Mismatch yields a warning and visible-source parsing.
- A diagnostic may have `source` coordinates, `model` coordinates, both, or
  neither. One flattened `path` type is dishonest.
- Recovery is successful only when the requested schema-valid result exists.
  Successful repair still reports each fit, fallback, unwrap, filter, unknown
  drop, and unsafe-content removal.
- Unresolved error diagnostics block printing when the writer cannot produce a
  truthful result. Configuration and programmer invariants throw.
- Resource capabilities and limits remain format-specific. Schema validity is
  not a security or resource budget.

## Rejected leads

- A universal retained-source sidecar.
- A universal source/model coordinate.
- A universal conversion AST or result extras bag.
- Silent tolerant recovery.
- Calling a native envelope source preservation.

## Duplicate leads

Unified's pipeline, mdast's extension points, and PostCSS's syntax ownership all
support private compilation and format-owned parse/serialize; none proves a
public processor/session for Plate.

## Next query

Compare the exact document, slice, inline, detached, and editor-bound call
shapes in rich-text editors and serialization systems.
