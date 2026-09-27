# Document conversion architecture research

Status: adopted and verified. The public API decision was promoted through
Best API Review and implemented by the final Task plan. This directory keeps
the fixed-source research, generated API inventory, and implementation
reconciliation; it does not authorize a commit, release, or publication.

## Question

What is the smallest truthful import/export, validation, schema, diagnostic,
and source-retention architecture for Plate and Plite when document formats are
partial and often lossy rather than lawful bidirectional codecs?

## Verdict

Do not add `DocumentCodec`, `DocumentFormat`, a universal conversion result,
format registry, dispatcher, intermediate AST, public compiler, or conversion
session. Direct format-owned parse and serialize operations are the smallest
truthful API.

Reserve `codec` for a current typed persistence pair. Keep
`EditorValueCodec`, make its encoded JSON type explicit, and prove both
direction laws. `EditorValuePersistence` owns the envelope version and
decode-only legacy inputs. Rename browser `HostCodec` to
`DataTransferFormat`.
Rename Plate plugin `codecs` to `formats`, with `*NodeMapping` declarations for
feature syntax. Whole-payload MIME negotiation belongs to the DataTransfer
owner rather than feature node mappings.

HTML exposes detached `parseHtml`, `parseHtmlSlice`, and `serializeHtml`.
Markdown exposes `parseMarkdown`, `parseMarkdownSlice`,
`parseMarkdownInline`, and `serializeMarkdown`. Whole-document success returns
`EditorDocumentValue`; slice and inline success return `ContentSlice`.
Expected malformed input and successful recovery use format-specific result
unions and diagnostics. Parse and serialize success contain warnings and their
carrier; failure contains an error-first nonempty diagnostic tuple and no
carrier. Configuration errors throw. Diagnostics address encoded source and
canonical model coordinates separately.

Plite's `assertDocument` and `assertFragment` remain the canonical throwing
validation boundary. `fitDocument` remains explicit coercion; format owners use
an internal trace so every complete-document repair is diagnosed. Open slices
retain their structure and are fit only after an insertion destination exists;
detached format parsing must not invent that context. Zod, Standard Schema, a
generic `safeParse`, and a universal schema adapter do not earn a current
caller.

DOCX keeps its format-specific comments, source, limits, cancellation, and
diagnostics. Its primary import is detached and captures plugins and schema
before the first await. Source retention remains format-owned. HTML and
Markdown carry visible semantic syntax only; exact authored state uses the
canonical authored JSON document. DOCX review alone may restore its native
authored package part after explicit trust and correspondence checks.

Parse5 owns HTML tree repair in both environments. Browser parsing materializes
that tree node by node in a detached template owner document; the Chromium
candidate passes strict Trusted Types CSP with no script execution or resource
request at a measured 42,013-byte gzip parser cost. Node parsing uses
`platejs/html/server`, where LinkeDOM supplies the element facade consumed by
Plate mappings. The server candidate passed the frozen four-cohort benchmark
and malformed/security/mapping probe. Happy DOM was rejected after the stress
workload retained hundreds of megabytes per isolated parse and exhausted a
4 GB process.

## Scope and evidence

- 31 repositories registered; 28 inspected at fixed commits and three screened
  controls.
- The research baseline contained 81 package entrypoints, 743 raw public rows,
  and 405 unique `(symbol, member, kind, source, line)` rows. The final product
  regeneration contains 83 entrypoints, 663 raw rows, and 349 reviewed rows:
  176 keep, 3 defer, and 170 exclude decisions in `api-ontology.tsv`.
- 35 source-read records, 19 deduplicated leads, 16 explicit rejections, and 11
  promoted adoption packets.
- Typed codecs, document pipelines, source-aware printers, rich-text editors,
  and cross-language serializers were compared at source level.
- Four server HTML benchmark cohorts cover 10 KB/362 elements through
  3.17 MB/96,002 elements. Ten malformed HTML cases and six Plate conversion
  cases check canonical tree, mapping, and inertness behavior.
- A browser probe checks full-document materialization, strict Trusted Types
  CSP, script inertness, and zero image/iframe/stylesheet requests; a separate
  bundle probe fixes the parse5 size baseline.

## Stop rule closure

Every candidate category in `ULTRA-PROMPT.md` has at least two inspected
representatives. Three final bounded challenges produced no new P0/P1 lead:

1. delete/merge/inline every public noun;
2. challenge source retention, recovery, and coordinate ownership;
3. challenge browser/server environment, dependency, security, and resource
   behavior after the parse5, detached-DOM, and LinkeDOM probes.

The surviving API passes the hard-cut counterfactual and every accepted
behavior has an adoption owner and proof route in `promoted-ledger.tsv`.

## Artifacts

- `api-manifest.tsv`: raw bounded public surface.
- `api-ontology.tsv`: bounded name-filtered normalized classification and
  target name.
- `affected-export-symbol-diff.tsv`: complete before/after public-symbol diff
  for the affected entrypoints.
- `repo-registry.tsv`, `query-ledger.tsv`, `lead-ledger.tsv`, `read-log.tsv`,
  `rejected-ledger.tsv`, `promoted-ledger.tsv`: resumable evidence.
- `shards/002-typed-codecs.md`: codec and validation controls.
- `shards/003-document-pipelines-and-source-retention.md`: fidelity and
  diagnostics.
- `shards/004-editors-and-cross-language-controls.md`: editor call shapes and
  serialization controls.
- `shards/005-local-ontology-and-best-api.md`: exact Plate/Plite target.
- `shards/006-saturation-and-final-synthesis.md`: benchmark decision and stop
  rule.
- `sources/benchmark-html-server-parse5-linkedom.mjs` and
  `html-server-parse5-linkedom-benchmark.json`: pre-acceptance performance
  evidence.
- `sources/probe-html-server-correctness.ts` and
  `html-server-parse5-linkedom-correctness.json`: correctness evidence.
- `sources/probe-html-browser-inertness.mjs` and
  `html-browser-inertness.json`: browser CSP/network/execution evidence.
- `sources/measure-parse5-browser-bundle.mjs` and
  `parse5-browser-bundle.json`: isolated browser parser size evidence.

## Implementation outcome

All eight adoption slices in
`docs/plans/2026-09-25-document-conversion-contracts.md` are implemented.
Persistence, DataTransfer, schema fitting, HTML, Markdown, and DOCX keep their
separate lawful owners. First-party callers, documentation, registry source,
generated output, changesets, doctrine, benchmarks, packed consumers, browser
flows, and native DOCX proof use the final hard-cut API with no compatibility
aliases.

The frozen browser and server HTML probes pass against the production public
entrypoints. Strict Plite closure passes 100 type partitions, 163 package-test
partitions, contract/build/public-type gates, and 748 Chromium tests with seven
declared skips. LibreOffice opens, resaves, and publicly reimports accepted,
proposed, and review DOCX artifacts; this establishes package readability, not
Microsoft Word parity.

## Exclusions

- No compatibility layer, release, commit, or PR.
- CSV remains table/plain-text ingress and needs its own format-specific audit.
- Persistence migrations, clipboard policy, authored projection, and DOCX
  source lifetime keep their existing owners.
- Exact source preservation is not promised for HTML or Markdown.

Use `ULTRA-PROMPT.md` for the original acceptance contract and the final Task
plan for execution order.
