# Ultra prompt: document codec, validation, import, and export architecture

Use Ultra reasoning effort. Work in `/Users/zbeyens/git/plate-2` on the current
authorized checkout. Read and follow `AGENTS.md` first.

Apply these skills in sequence as one continuous task:

1. `[$plite-research](/Users/zbeyens/git/plate-2/.agents/skills/plite-research/SKILL.md)`
   for broad OSS discovery, fixed-source evidence, ledgers, and synthesis.
2. `[$best-api](/Users/zbeyens/git/plate-2/.agents/skills/best-api/SKILL.md)`
   in `design` mode for the exact public API and maximum justified deletion
   cone.
3. `[$task](/Users/zbeyens/git/plate-2/.agents/skills/task/SKILL.md)` in design
   plan mode for the final adoption and proof plan.

Do not implement product code. You may create or update research artifacts,
the immutable review ledger when its contract requires a new record, and one
final plan. Do not commit, push, open a PR, publish, or ask whether to continue.

## Mission

Redesign Plate and Plite import/export, validation, schema, diagnostics, and
source-retention from first principles. Determine whether Zod-style codecs are
the right model, a useful narrow precedent, or a misleading abstraction for
lossy document formats. Find the state of the art across typed serialization
libraries and document conversion systems, inspect the strongest repositories
at fixed local commits, choose the smallest truthful public API, and produce a
final executable plan.

Do not optimize for API symmetry. HTML, Markdown, DOCX, JSON persistence, CSV,
plain text, clipboard transfer, comments, assets, and authored changes may have
different laws. A shared abstraction survives only if it owns a current user
job and every included format can truthfully satisfy its contract.

## Starting evidence, not a conclusion

Reconcile this existing work before opening new branches of research:

- `docs/research/decisions/import-fidelity.md`
- `docs/research/decisions/export-fidelity.md`
- `docs/research/decisions/documents-conversion-fidelity.md`
- `docs/research/decisions/persistence-ownership.md`
- `docs/research/review-records/2026-09-25-imports-document-slice-loss-contract.json`
- `docs/analysis/editor-architecture-candidates.md`
- `docs/plite/research/2026-09-25-document-codec-architecture/README.md`
- every TSV and shard in that research directory

The current review says:

- file import must produce a complete `EditorDocumentValue`;
- insertion, clipboard, and generated block content use `ContentSlice`;
- inline content is a third job;
- HTML and Markdown need detached document import;
- conversion loss needs format-owned diagnostics;
- DOCX should capture one conversion target before async work;
- persistence, clipboard, and CSV remain separate;
- no universal importer/exporter/compiler currently earns a public job.

Challenge all of that. Retain it only where current source and stronger prior
art still support it.

## The crucial question

Zod 4.1 codecs join two schemas with typed `decode` and `encode` transforms,
run checks in both directions, support safe and async variants, compose inside
larger schemas, and distinguish bidirectional codecs from unidirectional
transforms. Effect Schema similarly separates `Type` and `Encoded`, permits
fallible/effectful transformations, and states a decode-after-encode law.

Document formats are harder:

- decoding Markdown or HTML can discard syntax, whitespace, unsupported nodes,
  comments, metadata, roots, identities, external records, or source order;
- encoding a canonical document usually selects one normalized representation;
- some documents are only partially representable;
- DOCX may preserve exact opaque source units only when correspondence still
  holds;
- imported comments, assets, annotations, and retained source may live outside
  the canonical document value;
- format operations can be asynchronous, cancellable, environment-specific,
  or resource-dependent.

Decide whether `codec` is truthful under those laws. Explicitly compare:

1. one bidirectional `DocumentCodec<Encoded, Document>`;
2. one `DocumentFormat` with separate `read` and `write` capabilities;
3. independent format-owned reader and writer operations with no shared public
   format object;
4. parser/stringifier or deserialize/serialize functions per format;
5. a private compiled conversion target with only standalone operations and
   editor convenience methods public;
6. reuse or deletion of existing `EditorValueCodec`, `HostCodec`, and plugin
   `codecs` nouns.

Lead with the strongest deletion or rename if Plate's current codec ontology is
misleading. Do not add `DocumentCodec` merely because Zod uses the word.

## Current Plate/Plite ontology to audit exhaustively

Inspect the public types, exports, implementations, docs, and all production
callers for at least:

- `packages/plitejs/src/interfaces/editor.ts`
  - `EditorValueCodec`
  - `SerializedEditorValue`
  - `EditorStateSchemaApi`
  - `ContentSlice`
- `packages/plitejs/src/core/value-codec.ts`
- `packages/plitejs/src/core/schema-validation.ts`
- `packages/plitejs/src/core/editor-schema.ts`
- `packages/plitejs/src/core/persisted-document.ts`
- `packages/plitejs/src/dom/plugin/host-codec.ts`
- `packages/platejs/src/lib/editor/editorApplicationSchema.ts`
- `packages/platejs/src/lib/editor/withPlite.ts`
- `packages/platejs/src/compiler/compileEditor.ts`
- `packages/platejs/src/internal/plugin/compilePlateCodecs.ts`
- `packages/platejs/src/lib/plugin/BasePlugin.ts`
- `packages/platejs/src/lib/plugins/html/HtmlPlugin.ts`
- `packages/platejs/src/markdown/lib/MarkdownPlugin.ts`
- `packages/platejs/src/markdown/lib/internal/markdownConversion.ts`
- Markdown import and export node converters and filters
- `packages/platejs/src/docx/import/lib/importDocx.ts`
- `packages/platejs/src/docx/export/lib/exportToDocx.tsx`
- `packages/platejs/src/csv/lib/CsvPlugin.ts`
- document migrations and their CLI/demo callers
- registry import/export controls and server examples
- package manifests, barrels, subpath exports, public docs, and type tests.

Materialize a bounded manifest of every public or author-facing noun matching
`*Codec`, `serialize*`, `deserialize*`, `import*`, `export*`, `parse*`,
`stringify*`, `decode*`, `encode*`, `assert*`, `validate*`, `fit*`, and
`migrate*` in `platejs` and `plitejs`, plus exact persistence and transfer
`read*`/`write*` entrypoints. Count production owners and callers. Classify
every row as:

- retain as a public independent job;
- rename because its law is misleading;
- merge into an existing owner;
- make private;
- delete;
- defer with an exact missing proof.

Do not call the audit exhaustive until the expected and reviewed row counts
match. Tests, docs, barrels, and hypothetical reuse do not establish an
independent production owner.

## Schema and validation questions

Do not assume Plate needs Zod. The compiled editor schema already owns grammar,
root structure, property lifecycle, element roles, `fitDocument`,
`assertDocument`, `assertFragment`, and immutable path-aware
`EditorSchemaValidationError.diagnostics`.

Answer with source evidence:

1. Is the current throw-based `assertDocument`/`assertFragment` API sufficient
   for invariants while format operations translate schema failures into their
   own result diagnostics?
2. Does a real current caller need a nonthrowing `validateDocument`,
   `safeParse`, or `check` API? If so, what exact result and owner wins? If not,
   reject it.
3. Is `fitDocument` validation, coercion, normalization, migration, or a
   separate admission operation? Make its law explicit and do not hide lossy
   repair under validation terminology.
4. Should canonical document validation implement Standard Schema? Require an
   actual interoperability consumer; familiarity is insufficient.
5. Could application node properties accept external validators such as Zod,
   Standard Schema, or JSON Schema without duplicating the editor schema? Is
   that a present job or speculative generality?
6. Which direction validates external syntax, which validates canonical model
   data, and how are both diagnostic sets composed without erasing provenance?
7. Should format decoders ever silently fit invalid nodes, or must fitting
   report every coercion/drop/wrap/default?
8. Are schema identity and persisted migrations part of a codec, or separate
   durable-state admission laws?

## Research corpus

Start with `repo-registry.tsv`, expand it through current web and GitHub search,
dedupe by semantic lead, and record exact commits. Cover these categories:

### A. Typed bidirectional schemas/codecs

- Zod
- Effect Schema
- io-ts, including its `Codec` and `Type` distinctions
- TypeBox Codec/Transform and compiled validators
- ts-codec
- traversable/schema

### B. Validation and transformation controls

- Standard Schema
- Valibot
- ArkType
- Runtypes
- Ajv
- Typia

These are controls. Do not pretend one-way transforms or validators are codecs.

### C. Document parse/transform/serialize pipelines

- unified and VFile
- mdast-util-from-markdown and mdast-util-to-markdown
- Pandoc readers/writers and source-position diagnostics
- YAML `Document` parsing, errors/warnings, CST/source token retention
- PostCSS parser/stringifier, result messages, source maps
- parse5 source locations and serialization
- node-jsonc-parser tolerant parsing and source edits

### D. Source-preserving transformation

- Recast `.original` correspondence and exact untouched reprint
- YAML source tokens
- PostCSS raw/source preservation
- Protobuf unknown-field and conformance behavior

Ask what transfers to DOCX retained source and what does not.

### E. Rich-text editors

- ProseMirror model and Markdown
- Tiptap HTML/Markdown detached conversion
- Lexical JSON/HTML/Markdown and headless conversion
- Portable Text HTML/Markdown conversion and unknown-node policies
- any additional editor from `editor-architecture-candidates.md` that has a
  materially different import/export or validation law.

Reuse the fixed-commit evidence in the current import review when unchanged.
Do not reread repositories decoratively.

### F. Cross-language controls

Read narrowly from Serde and Circe, and at most one additional high-signal
codec library, for naming and laws: separate serializer/deserializer,
encoder/decoder totality, unknown fields, partial decoding, and law testing.
Do not turn this into a language-tourism shard.

For broad discovery, search code, tests, issues, PRs, discussions, and commit
history. GitHub results are leads only. Follow repository rules: inspect source
from local clones under `/Users/zbeyens/git`; clone missing repositories to
`..`; never base a code claim on GitHub's rendered file browser. Record licenses
and do not copy implementation or fixtures.

Deep-read at least two representatives from every category and every candidate
that could change the final API. Prefer source, tests, and negative cases over
README marketing. Record all reads, rejections, duplicates, and promoted leads
before opening the next shard.

## Comparison matrix

For each serious candidate, record:

- encoded and decoded type parameters;
- whether decoding accepts `unknown` or typed input;
- whether encode/decode are total, partial, sync, async, cancellable, or
  context-dependent;
- validation before and after transformation;
- safe-result and throwing APIs;
- issue structure, paths, source spans, causes, owner/rule identity, severity,
  and multiple-error behavior;
- composition and inference quality;
- inversion support and whether inversion is lawful or mechanical;
- unknown-field/node behavior;
- defaults, coercions, filters, and lossy transforms;
- exact and semantic round-trip laws;
- source retention and correspondence;
- versioning and migration;
- detached/server operation and DOM/environment requirements;
- streaming, progress, cancellation, and resource loading only where a current
  document job exists;
- bundle/runtime cost, dependency graph, and package-entrypoint truth;
- property-based, conformance, corpus, browser, and native artifact proof;
- API mistakes or failure history from issues/PRs.

Separate a library's general schema features from the document-conversion jobs
Plate actually has.

## Laws the final design must settle

State exact laws, including the representable subset and equivalence relation:

1. **Canonical validity:** every successful document import yields a complete
   schema-valid immutable `EditorDocumentValue`.
2. **Shape authority:** document, `ContentSlice`, and inline operations never
   recover one result shape by truncating or wrapping another.
3. **Canonical round trip:** for content representable in a format,
   `decode(encode(document))` is semantically equivalent to the selected
   projection, with all intentional normalization specified.
4. **Source round trip:** `encode(decode(source))` may canonicalize. Exact
   source equality is promised only by a format-owned retained-source artifact
   whose correspondence check succeeds.
5. **No silent loss:** fallback, filtering, coercion, defaulting, wrapping,
   dropping, unsupported content, conflicts, and retained-source fallback are
   distinguishable outcomes.
6. **Diagnostic provenance:** external source positions and canonical
   root/path/property positions remain distinguishable and composable.
7. **Async capture:** one async conversion captures document, projection,
   schema/configuration, extras, and source identity before its first await.
8. **Detached operation:** standalone conversion does not activate plugins,
   publish editor state, construct an editing runtime, or mutate global DOM.
9. **Format extras:** comments, assets, annotations, resources, and retained
   source remain format-owned result fields unless one cross-format caller
   proves a smaller shared carrier.
10. **Failure ownership:** malformed external input is an expected result;
    invalid plugin/schema configuration is an exception; cancellation has one
    explicit law; application file I/O remains outside format semantics.
11. **Security boundary:** HTML/XML/package parsing, URL/resource handling,
    archive limits, and sanitization have explicit owners. Schema validity does
    not imply source safety.
12. **Determinism:** the same captured input and configuration produce the same
    data and diagnostics, excluding explicitly supplied environment effects.

Reject or amend any law that cannot survive actual format behavior.

## API design requirements

After research, run `best-api design`. Ignore migration cost until the target is
chosen. Produce exact normal, customization, and advanced call sites with real
public import paths. Compare at least:

- `parse` / `print`;
- `decode` / `encode`;
- `deserialize` / `serialize`;
- `read` / `write`;
- format-specific verbs such as `importDocx` / `exportToDocx`.

Choose one vocabulary only where the semantic jobs match. It is acceptable and
likely correct for persistence codecs, clipboard transfer, syntax parsers, and
file converters to use different verbs.

The API decision must answer:

- Does any new public `DocumentCodec`, `DocumentFormat`, `ConversionResult`,
  `ConversionContext`, `DocumentArtifact`, compiler, registry, or dispatcher
  survive the hard-cut gate?
- Should `EditorValueCodec` keep `codec`, become a persistence-specific name,
  or disappear behind state/effect descriptors?
- Is `HostCodec` actually a transfer format/handler and should its public name
  change?
- Are Plate plugin `codecs` feature mappings, host-transfer contributions, or
  true bidirectional codecs? Should authoring vocabulary change?
- Are HTML and Markdown standalone imports functions, plugin methods, or both?
- What exact result does each format return? Do not force one union across
  formats unless a caller consumes it polymorphically.
- How do callers receive source and schema diagnostics without a universal
  diagnostic class?
- Does the current `EditorSchemaValidationError` remain the canonical schema
  invariant error?
- Is a nonthrowing schema validation API earned?
- What does the registry own after package conversion is complete?
- Which exports, aliases, helpers, and docs should be deleted on `next`?

Show before/after snippets for:

1. standalone server HTML import;
2. Markdown file import replacing a complete model value;
3. AI or selection Markdown insertion returning a `ContentSlice`;
4. HTML and Markdown export with diagnostics;
5. DOCX import with cancellation and optional retained source;
6. persistence state/effect encoding;
7. custom feature format mapping;
8. validation failure handling.

Normal call sites must read naturally without casts or explicit callback
annotations. Preserve type inference from installed plugins and schema.

## Strong candidates to falsify

Treat these as hypotheses, not instructions:

- A Zod-like public document codec may be false because the transformations are
  lossy, non-invertible, and produce format-specific extras.
- Zod/Effect may still supply the right distinction between encoded and
  canonical types, safe results, validation phases, and law-based tests.
- The compiled editor schema may already provide all canonical validation
  needed; format readers may only need to translate its diagnostics.
- A tiny private conversion target may be enough; a public compiler/context may
  have no independent caller.
- `EditorValueCodec` may be the only existing noun that is truly a codec.
- `HostCodec` and plugin `codecs` may be transfer handlers/mappings whose names
  currently overstate bidirectionality.
- Source position and canonical path probably belong in one diagnostic union
  only as separate location variants, not flattened fields.
- Format-specific readers/writers may be cleaner than a shared format object.

Actively try to disprove each one.

## Plan requirements

Once one public API clearly wins, use Task to write one final design/adoption
plan under `docs/plans/`. Planning only.

The plan must include:

- final public types, imports, signatures, JSDoc, and before/after call sites;
- ownership by Plite core, Plite DOM, Plate core, format packages, registry,
  and application;
- the complete deletion/rename/migration matrix from the bounded manifest;
- handling for document, slice, inline, named roots, metadata, authored state,
  comments, assets/resources, retained source, and cancellation;
- diagnostic taxonomy and exact source/model location types;
- schema validation, fitting, migration, and security boundaries;
- compilation/capture lifecycle and environment split;
- package exports, dependency reachability, SSR/tree-shaking, and type
  inference;
- adoption order with no permanent compatibility aliases on `next`;
- tests only for plausible costly behavior regressions;
- fixture/corpus and property-law strategy;
- exact source typechecks, package tests, declaration/packed-consumer checks,
  browser file-import checks, server detached checks, DOCX native-artifact
  checks, and any justified benchmark;
- rollback or quarantine criteria for uncertain runtime machinery;
- docs, changesets, registry regeneration, ledger outcome, and Best API doctrine
  repair if reusable taste changes.

If the selected target adds a runtime layer, cache, public compiler, retained
mapping, or repeated conversion machinery, run Benchmark's pre-acceptance
architecture probe before accepting it. If the candidates share the same
runtime law and the choice is type/API-only, record source-backed N/A.

## Research and ledger completion

Maintain the existing research directory as the resumable source of truth:

`docs/plite/research/2026-09-25-document-codec-architecture/`

Update every required TSV and add bounded shard summaries. Record exact commit,
file hash or source fingerprint, checked date, evidence grade, duplicates,
rejections, and promotion owner. Keep raw bulk outside the tree.

Before changing the review ledger, run:

```sh
node tooling/scripts/review-ledger.mjs lookup imports
node tooling/scripts/review-ledger.mjs research 'codec serialization validation import export'
```

Do not edit the existing immutable review. If the research changes the worth-it
verdict or materially corrects its architecture, append a new `imports` review
that explicitly supersedes or retains prior rows. If the verdict remains valid,
record the research and plan without manufacturing another reassessment.

Finish with:

```sh
node tooling/scripts/review-ledger.mjs render
node tooling/scripts/review-ledger.mjs check
node .agents/rules/plate-next/scripts/version.mjs validate
git diff --check
```

Run additional prose/research checks required by the files you touch. Do not run
product suites when no product code changed.

## Final response contract

Lead with the maximum justified cut and one verdict. Then report:

1. exact winning public API with import paths and call sites;
2. why Zod codecs do or do not fit this domain;
3. schema/validation decision;
4. surviving and deleted codec/format nouns;
5. source-inspected comparison results and fixed commits;
6. round-trip, loss, diagnostic, security, async, and detached-operation laws;
7. breaking impact and deletion cone;
8. final plan link;
9. research counts: repos searched/deep-read, issues/PRs read, leads kept,
   duplicates merged, rejected leads, and promoted packets;
10. checks run and proof limits;
11. exact next execution owner.

Do not end with a menu or ask for permission to write the plan. Stop only when
the research artifact, Best API decision, and final plan are internally
consistent and checked.
