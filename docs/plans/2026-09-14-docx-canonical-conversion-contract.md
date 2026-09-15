# DOCX canonical conversion contract

Objective:
Replace the competing DOCX import/export surfaces with one canonical document
result, one projection-aware export captured from a single editor snapshot,
structured fidelity diagnostics, a bounded untrusted-package reader, and one
Word-semantics pass whose heavyweight work does not multiply by revision count.
Keep Word clipboard fitting as its own truthfully named plugin and preserve
feature-specific media, table, math, emoji, comment-storage, and layout policy
outside the documents owner.

Flow mode:
agent-led execution

Goal plan:
docs/plans/2026-09-14-docx-canonical-conversion-contract.md

Template:
docs/plans/templates/plate-plan.md

Primary template:
docs/plans/templates/plate-plan.md

Applied packs:

- performance-observability

Mode:

- `deep`: this changes public import, export and paste entrypoints; crosses
  Plate DOCX, Plite authored snapshots, package boundaries, untrusted ZIP/XML
  processing, comments/revisions, registry callers, docs and release proof;
  and replaces a revision-count-dependent runtime architecture.

Completion threshold:

- The public API has one content truth on import, one export operation, one
  shared structured diagnostic contract, explicit expected failure, and no
  compatibility aliases.
- One synchronous capture owns accepted, proposed, review and native-sidecar
  data; export performs no live editor read after its first asynchronous step.
- Native data can supplement only the exact package/projection it accompanied;
  Word-visible conversion runs first and wins on mismatch.
- Untrusted package work is preflighted and bounded before expansion. Abort is
  honest and cooperative; no fake timeout claims preemption of synchronous
  schema conversion.
- Main-body comments and supported review semantics have exact support/loss
  behavior. Named roots and unsupported Word parts are diagnosed rather than
  silently claimed.
- The one-pass revision architecture retains the passing frozen design receipt,
  then passes the same cohorts and budgets on final production source.
- Every caller, entrypoint, type contract, public doc, generated barrel,
  registry artifact, changeset and required doctrine record is migrated, and
  `check-complete` passes.

Verification surface:

- Plite authored snapshot/import owner:
  `packages/plitejs/src/authored/format.ts`,
  `packages/plitejs/test/authored-format-contract.test.ts`, authored partition
  tests/typechecks and package build.
- Plate DOCX import/export/paste owners under `packages/platejs/src/docx/**`,
  all four DOCX partitions, public type contracts, package build and packed
  entrypoint dependency proof.
- Registry import/export/plugin callers under
  `apps/www/src/registry/components/editor/**`, package-integration fixtures,
  one actual file-picker/download browser test, and generated registry output.
- Frozen architecture probe and production benchmark:
  `docs/plans/artifacts/docx-canonical-conversion-contract/**` and
  `benchmarks/editor/benchmarks/plate-docx-revision-import-benchmark.test.ts`.
- LibreOffice headless open/re-save smoke for produced accepted, proposed and
  review documents. This proves LibreOffice interoperability only; Microsoft
  Word fidelity remains a separate manual certification claim.
- Best API doctrine repair, current Plate Next version validation, changesets,
  barrels, source-first package checks, and stale-public-surface searches.

Constraints:

- The user accepted this plan and authorized full Task execution on 2026-09-14.
- Work in the authorized `next` checkout. No compatibility aliases, overloads,
  deprecated exports, runtime shims, commit, push, PR, release, or external
  publication is authorized by this plan.
- Preserve detached file conversion, lazy import/export entrypoints, installed
  Plate schema codecs, app-owned static presentation, remote-image opt-in, and
  the canonical `EditorDocumentValue`/authored runtime.
- Do not add a universal Office/document AST, converter registry, retained
  package model, public ZIP abstraction, plugin-owned file I/O, or a second
  canonical representation.
- Word paste remains transfer-policy work. Its current media and table-geometry
  omissions stay unchanged until their own destination-policy plan proves a
  safe target.
- Math, emoji, media, table, comments storage and custom element semantics stay
  with their feature owners. DOCX consumes their configured serializers or
  reports loss; it does not reimplement them.
- Tests prove current behavior and failure boundaries; no dead-API absence
  tests or migration prose.

Boundaries:

- In scope: DOCX file import/export API and implementation; review/comments
  interchange; native sidecar correspondence; ZIP/XML/resource limits;
  cancellation; public subpaths; all first-party callers/docs/type tests;
  package dependencies; performance and LibreOffice/browser proof.
- Source owners: `packages/platejs/src/docx/import/**`,
  `packages/platejs/src/docx/export/**`, `packages/platejs/src/docx/paste/**`,
  `packages/platejs/src/lib/plugins/html/HtmlPlugin.ts`, package manifests and
  entrypoint generation, registry import/export kits and public docs.
- Direct Plite boundary owners:
  `packages/plitejs/src/authored/format.ts` owns one immutable authored capture
  and imported `DocumentChange` application. `DocumentChange` remains the
  canonical sparse change substrate; DOCX does not write authored persistence
  internals.
- Non-goals: arbitrary package-preserving editing, Word-equivalent layout,
  embedded media ingestion, Word-paste media/table redesign, generic comment
  identity mapping, Office signatures/authenticity, PDF/CSV/Markdown changes,
  and certification in Microsoft Word.

Output budget strategy:

- Keep complete benchmark samples in JSON, semantic support in one matrix, and
  external exact-source evidence in the existing documents research artifact.
  Read only named package/runtime owners during execution.

Blocked condition:

- During execution, stop before public migration only if three distinct
  implementation attempts show that a single package/codec pass cannot
  preserve the frozen review semantics with installed schemas, or the bounded
  reader cannot reject expansion before crossing its configured limit. Keep
  current APIs in that case, preserve the failed receipts, and reopen the
  architecture decision; do not ship aliases or silently reduce fidelity.

Plate Plan state:

- status: complete
- phase: complete
- next: none
- handoff: implementation authorized by `go task full` on 2026-09-14

Start Gates:

| Gate                                               | Applies | Evidence                                                                                                                                                        |
| -------------------------------------------------- | ------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Prompt requirements captured                       | yes     | One canonical result, one snapshot export, explicit fidelity, bounded input, harsh reassessment, and feature-boundary constraints are in Objective/Constraints. |
| Task plan and execution authority verified         | yes     | The user accepted the exact plan with `go task full` on 2026-09-14; product mutation and required proof are authorized.                                         |
| Current owners read                                | yes     | Live import/export/paste, Plite authored, app callers, tests, package exports, comments and Vision owners are cited below.                                      |
| Best API target resolved                           | yes     | One `importDocx`, one `exportToDocx`, `WordPastePlugin`, result unions and exact options are fixed under Target public API.                                     |
| Runtime scale applicability resolved               | yes     | Revision count multiplies ZIP load/generation, XML parse, Mammoth conversion and whole-document diff in current source.                                         |
| Pre-acceptance Benchmark probe selected            | yes     | Frozen four-cohort current-owner versus one-pass prototype contract and receipt are linked under Scale contract.                                                |
| Mode and execution boundary resolved               | yes     | Deep implementation in the current checkout; no publication.                                                                                                    |
| Performance pack selected                          | yes     | `performance-observability`; deterministic work, timings, payloads, cohorts, correctness and final rerun are fixed.                                             |
| User-facing operation and runtime owner identified | yes     | File import/export in registry UI; Plate DOCX owns conversion and Plite authored owns canonical change materialization.                                         |
| Scale variables and cohorts fixed                  | yes     | Paragraphs, revisions, compressed/expanded bytes and four cohorts are frozen in the probe.                                                                      |
| Budget frozen before target measurement            | yes     | The artifact records limits and materiality before target timing.                                                                                               |
| Baseline and target probe selected                 | yes     | Current public importer versus disposable sentinel/package/one-Mammoth prototype on identical bytes.                                                            |
| Correctness guard selected                         | yes     | Accepted/proposed paragraph text and every revision ID/order match for both paths; production adds the full matrix.                                             |
| Production detector decision recorded              | yes     | N/A: this is a local file operation with no current telemetry owner. Final evidence is content-free benchmark/browser/package receipts.                         |

Work Checklist:

- [x] Outcome, scope, non-goals, constraints, and owners are concrete.
- [x] Current API/docs/tests/exports claims cite live source.
- [x] Reusable public call shape has one Best API verdict before target lock.
- [x] The scale-sensitive target has a passing executable current-owner versus
      target Benchmark receipt.
- [x] Every concept-level decision row has owner, adoption, proof, risk, and verdict.
- [x] Canonical state versus presentation is classified: the canonical
      `EditorDocumentValue`/authored changes remain Plite-owned; configured
      Plate serializers own feature presentation; DOCX owns Word encoding.
- [x] Public breaks and private bridges have complete adoption/deletion answers.
- [x] Execution slices and focused proof matrix are concrete.
- [x] Conditional work and final handoff are resolved without generic N/A rows.
- [x] Performance receipt captures comparable current-owner work before target acceptance.
- [x] The complete file-import operation and deterministic heavy-work counters are measured.
- [x] Normal, large, stress and pathological revision cohorts are exercised.
- [x] Cold/warm timings, samples, bytes, work counters and correctness are recorded; no unsupported p99 is claimed.
- [x] The proposed path uses only the disposable code needed to test the scaling law.
- [x] Both paths use matched source, bytes, runtime, dependencies, editor codec and correctness guard.
- [x] ZIP/parse/conversion/diff fan-out was inspected before selecting a new package reader.
- [x] The selected ZIP dependency owns central-directory metadata, strict ambiguity checks and cancellation; no cache/pool/store/scheduler is added.
- [x] Evidence contains no document contents, identities, credentials or protected data.
- [x] A permanent production benchmark and exact rerun contract are assigned to Slice 6.
- [x] No performance budget override exists.

Completion Gates:

| Gate                            | Applies | Required action                                        | Evidence                                                                                                      |
| ------------------------------- | ------- | ------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------- |
| Binary readiness                | pass    | Resolve every target and execution gate                | All eight slices are implemented and every scoped proof exit is closed.                                       |
| Fresh source evidence           | pass    | Recheck decision-changing current claims               | Final checks run against the current checkout; the archived design probe retains its exact commit and hashes. |
| Best API review                 | pass    | Resolve every P0/P1 call-shape finding                 | One canonical result, one snapshot export, three truthful subpaths, and `WordPastePlugin` are live.           |
| Pre-acceptance scale proof      | pass    | Meet frozen cohorts/budgets with correctness           | Four design cohorts passed with 20.9x to 753.0x warm-median improvement.                                      |
| Production scale rerun contract | pass    | Run final source against frozen budgets                | Production benchmark passed 2 tests and 470 assertions across all four cohorts.                               |
| Conditional risk and adoption   | pass    | Complete triggered security/docs/browser/package work  | Bounded parsing, current docs, Chromium workflow, registry generation, and packed packages pass.              |
| Verification recorded           | pass    | Record implementation proof                            | Commands and results are recorded under Verification evidence and in the content-free benchmark receipt.      |
| Handoff prepared                | pass    | Record ownership, breaks, proof, risks and publication | Final handoff reflects the implemented API and current proof.                                                 |
| P1 autoreview                   | pass    | Apply Task's branch rule                               | N/A on `next`; Task forbids Autoreview there.                                                                 |
| Goal plan complete              | pass    | Run `check-complete.mjs`                               | Fresh completion check runs after ledger and formatting closure.                                              |
| Warm latency budget             | pass    | Prove production source against frozen limits          | Medians are 21.83/42.08/116.42/290.99 ms; p95 remains below every cohort limit.                               |
| Large/stress scaling            | pass    | Prove heavy work independent of revision count         | Every production sample uses one ZIP load/XML parse/package generation/Mammoth conversion.                    |
| Cold and failure paths          | pass    | Prove cold operation and owning failure cutoffs        | Benchmark cold samples and import invalid/limit/abort/native-mismatch suites pass.                            |
| Payload and fan-out             | pass    | Record bytes, memory, and repeated work                | Receipt records byte cohorts, exact counters, and maximum RSS deltas of 3.69–28.53 MiB.                       |
| Production-path rerun           | pass    | Run the permanent harness                              | `plate-docx-revision-import-benchmark.test.ts` passed on final production source.                             |
| Correctness guard               | pass    | Match accepted/proposed/revision semantics             | All 470 benchmark assertions and focused sparse-revision suites pass.                                         |
| Before/after receipt            | pass    | Preserve comparable baseline/target evidence           | Archived design receipt and current production receipt remain linked.                                         |
| Detector and privacy            | pass    | Resolve runtime detector and retained data             | No telemetry owner is invented; the retained receipt contains counts, timings, and bytes only.                |
| Performance regression check    | pass    | Keep permanent harness and package checks              | The benchmark, package entrypoint sizes, and packed consumers pass with the updated snapshot.                 |

Phase / pass table:

| Phase   | Status   | Evidence                                                                                  | Next    |
| ------- | -------- | ----------------------------------------------------------------------------------------- | ------- |
| Ground  | complete | Current owners, callers, tests, decisions and external research reconciled                | Decide  |
| Decide  | complete | Hard-cut comparison, exact public API, bounded package owner and support matrix fixed     | Execute |
| Execute | complete | Plite primitives, bounded import, correspondence, export, callers, docs and doctrine live | Prove   |
| Prove   | complete | Focused tests, types, browser, LibreOffice, benchmark, registry and packed packages pass  | Adopt   |
| Adopt   | complete | Decision and documents ledger record the implemented contract as adopted and verified     | Close   |

## Decision brief

- outcome: file import yields one canonical document or an explicit failure;
  file export captures one editor snapshot and yields one explicit projection;
  Word paste remains separate.
- chosen shape: a bounded hybrid pipeline. Direct OOXML/package inspection owns
  ranges, revisions, relationships and limits; one configured Plate HTML-codec
  pass per supported content part owns application schema; sparse
  `DocumentChange` records build native authored state.
- strongest rejected alternative: pure direct OOXML reconstruction. It could
  retain Word facts but would recreate every Plate feature serializer and
  immediately become a second schema engine. Pure Mammoth is also rejected
  because it discards package/review facts before Plate can diagnose them.
- consequence: the implementation keeps Mammoth as a schema projection aid,
  replaces JSZip only at the untrusted import boundary with a strict bounded
  reader, deletes per-revision conversions and the literal review serializer,
  and does not promise arbitrary DOCX fidelity.

## Target public API

Current:

```ts
const imported = await importDocx(editor, bytes, { rtf });
editor.update.fragment.replace(imported.nodes);

const blob = await exportToDocx(editor.read.value().children, {
  editorPlugins,
});
const reviewed = await exportAuthoredToDocx(editor, {
  projection: "review",
});

const plugins = [DocxPlugin];
```

Target:

```ts
const model = useModelEditor();

const imported = await importDocx(model, file, {
  limits: { maxInputBytes: 16 * 1024 * 1024 },
  signal,
});

if (!imported.ok) {
  showDocxDiagnostics(imported.diagnostics);
  return;
}

model.update.value.replace(imported.document);
adoptWordComments(imported.comments);

const exported = await exportToDocx(model, {
  editorPlugins: [...BaseEditorKit, ...DocxExportKit],
  projection: "review",
  stylesheet: DOCX_EXPORT_STYLES,
});

if (!exported.ok) {
  showDocxDiagnostics(exported.diagnostics);
  return;
}

download(exported.blob);

const plugins = [WordPastePlugin];
```

Mounted UI uses `useModelEditor()` for complete-document load, replacement,
persistence, and snapshot conversion. `useEditor()` remains the exact mounted
view for root-scoped commands, DOM access, and selection.

Exact contracts:

```ts
export type DocxImportLimits = Readonly<{
  maxComments: number;
  maxEntries: number;
  maxEntryBytes: number;
  maxExpandedBytes: number;
  maxInputBytes: number;
  maxRelationships: number;
  maxRevisions: number;
  maxXmlDepth: number;
  maxXmlNodes: number;
}>;

export type DocxImportOptions = Readonly<{
  limits?: Partial<DocxImportLimits>;
  signal?: AbortSignal;
}>;

export type DocxComment = Readonly<{
  author: Readonly<{ initials?: string; name: string }> | null;
  body: Value;
  createdAt: string | null;
  durableId: string | null;
  id: string;
  parentId: string | null;
  resolved: boolean | null;
  target: Readonly<{ range: Range }> | null;
}>;

export type DocxDiagnostic =
  | Readonly<{
      actual: number;
      code: "limit-exceeded";
      limit: keyof DocxImportLimits;
      maximum: number;
      message: string;
      severity: "error";
    }>
  | Readonly<{
      code: "native-data-ignored";
      message: string;
      part: "editor/authored.json";
      reason:
        | "digest-mismatch"
        | "invalid"
        | "projection-mismatch"
        | "unsupported-version";
      severity: "warning";
    }>
  | Readonly<{
      code: "invalid-package" | "decode-failed";
      message: string;
      part?: string;
      severity: "error";
    }>
  | Readonly<{
      code:
        | "converter-message"
        | "lossy-content"
        | "resource-omitted"
        | "unsupported-content";
      feature?: string;
      message: string;
      part?: string;
      path?: Path;
      root?: string;
      severity: "warning";
      sourceId?: string;
    }>;

export type DocxImportResult =
  | Readonly<{
      diagnostics: readonly DocxDiagnostic[];
      ok: false;
    }>
  | Readonly<{
      comments: readonly DocxComment[];
      diagnostics: readonly DocxDiagnostic[];
      document: EditorDocumentValue;
      ok: true;
    }>;

export type DocxExportOptions = Readonly<{
  allowRemoteImages?: boolean;
  comments?: readonly DocxComment[];
  editorPlugins?: readonly BasePluginInput[];
  editorStaticComponent?: React.ComponentType<EditorStaticProps>;
  fontFamily?: string;
  margins?: Margins;
  orientation?: "landscape" | "portrait";
  pageSize?: PageSize;
  projection: "accepted" | "proposed" | "review";
  signal?: AbortSignal;
  stylesheet?: string;
  title?: string;
}>;

export type DocxExportResult =
  | Readonly<{
      diagnostics: readonly DocxDiagnostic[];
      ok: false;
    }>
  | Readonly<{
      blob: Blob;
      diagnostics: readonly DocxDiagnostic[];
      ok: true;
    }>;

export function importDocx(
  editor: Editor,
  source: ArrayBuffer | Blob,
  options?: DocxImportOptions
): Promise<DocxImportResult>;

export function exportToDocx(
  editor: Editor,
  options: DocxExportOptions
): Promise<DocxExportResult>;
```

Contract details:

- `projection` is required even when authored changes are not installed. It is
  the caller's visible-document decision, not an inferred editor mode.
- Expected user-file failures return `ok: false` with at least one error
  diagnostic. Unsupported but recoverable content returns `ok: true` with
  warnings. Invalid programmer options and internal invariant violations throw.
- Abort rejects with the standard abort reason. The implementation checks and
  forwards the signal at package/entry/stage boundaries; it does not claim to
  preempt a synchronous callback already running.
- `comments` are format facts. The DOCX package never writes CommentsPlugin
  storage or invents app user IDs. Their ranges use proposed-projection
  coordinates and are synchronously mapped into accepted or review output.
  Apps map the records explicitly.
- `editorPlugins` and `editorStaticComponent` remain because DOCX-specific
  static presentation is an app/feature composition job. Both ordinary and
  review export use that same configured serializer.
- `exportAuthoredToDocx`, `AuthoredDocxResult`,
  `AuthoredDocxExportOptions`, `ImportDocxResult.nodes`, optional
  `ImportDocxResult.document`, `ImportDocxOptions.rtf`, `DocxPlugin`,
  `PLUGINS.docx`, and the package subpath `platejs/docx` are deleted.
- Public subpaths are exactly `platejs/docx/import`, `platejs/docx/export`, and
  `platejs/docx/paste`. Shared diagnostic/comment types may be re-exported from
  import and export; no fourth public common/types entrypoint is added.

## Default import limits

| Limit              | Default | Law                                                                                                 |
| ------------------ | ------: | --------------------------------------------------------------------------------------------------- |
| `maxInputBytes`    |  32 MiB | Check `Blob.size`/buffer length before ZIP parsing.                                                 |
| `maxExpandedBytes` | 128 MiB | Sum declared central-directory sizes before any entry extraction; enforce actual emitted bytes too. |
| `maxEntries`       |   1,024 | Reject before enumerating content work.                                                             |
| `maxEntryBytes`    |  32 MiB | Reject declared oversize, then enforce during extraction.                                           |
| `maxRelationships` |   4,096 | Bound relationship graph traversal and URI resolution.                                              |
| `maxRevisions`     |   2,000 | Bound authored records/change applications; heavyweight conversion remains constant.                |
| `maxComments`      |   5,000 | Bound comment records, replies and targets.                                                         |
| `maxXmlDepth`      |     128 | Streaming semantic parser rejects deeper XML before DOM/schema conversion.                          |
| `maxXmlNodes`      | 500,000 | Bound XML element/event work per imported package.                                                  |

All overrides must be finite positive safe integers. `@zip.js/zip.js` is the
selected private import reader because its current browser/Node API exposes
central uncompressed sizes, ZIP64 metadata, strict ambiguous/local-header
checks, CRC verification, overlap checks, streams and `AbortSignal`. Use
`strictness: 'strict'`, local-directory and CRC checks, reject encrypted and
unsafe/duplicate entries, preflight declared totals, and write each extraction
through a byte-counting sink. Exact inspected source: local
`/Users/zbeyens/git/zip.js` at
`307b756c663ca8855093d4c33b32728b4a3779c8`, BSD-3-Clause, package version
2.15.0. JSZip remains in the trusted export writer; the separate lazy
entrypoints prevent both ZIP engines from entering paste consumers.

Use `saxes` 6.0.0 (ISC) as the private namespace-aware streaming XML parser.
Reject DTD/DOCTYPE input, count open depth and element events while parsing,
and stop before constructing the instrumented XML when either limit is crossed.
Do not build a home-grown XML tokenizer at this security boundary.

No public `timeoutMs` is added. A timer cannot safely cancel Mammoth or an
arbitrary installed synchronous codec. Size/structure limits bound each stage;
`signal` is cooperative. Applications requiring hard wall-clock termination
must run import in a Worker they own and terminate it.

## Native authored envelope

`editor/authored.json` becomes a versioned private envelope:

```ts
type AuthoredDocxEnvelopeV1 = Readonly<{
  document: EditorDocumentValue;
  parts: readonly Readonly<{ name: string; sha256: string }>[];
  projections: Readonly<{
    accepted: string;
    proposed: string;
  }>;
  version: 1;
}>;
```

- Export adds the content-type override and root relationship first, then
  hashes the uncompressed bytes of every non-directory package entry except
  `editor/authored.json`, sorted by exact normalized part name. Compression and
  ZIP entry order do not affect correspondence.
- Projection digests are SHA-256 over the exporter's canonical OOXML semantic
  accepted and proposed views of the generated Word parts. Import computes the
  same views before Plate schema decoding. They bind richer native data to the
  exact Word semantics the package exposes without a second Mammoth pass.
- Import always performs the bounded Word-visible semantic conversion first.
  It validates the envelope and installed editor schema, recomputes part and
  visible projection digests, and uses the native `document` only when every
  check matches. Otherwise the Word-derived document wins and
  `native-data-ignored` explains the exact reason.
- This is an integrity/correspondence checksum, not a signature or authenticity
  claim. Every sidecar field remains untrusted and passes normal size, JSON,
  migration and schema validation.
- Named roots and Plate-only metadata may be restored from a matching native
  envelope. They have no claimed visible Word representation and export emits
  `lossy-content` per native-only root/metadata family.

## Semantic support matrix

| Word / Plate surface                                                       | Target behavior                                                                                                                         | Diagnostic / proof                                           |
| -------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------ |
| Main paragraphs, headings, runs and supported marks/properties             | One instrumented Mammoth-to-installed-HTML-codec pass; schema-valid `document.children`                                                 | Existing fixtures plus exact import assertions               |
| Lists, links, bookmarks and table structure                                | Keep current supported semantic mappings; one relationship graph; preserve data represented by installed codecs                         | Roundtrip fixture tests and unknown relationship diagnostics |
| Tracked insert/delete                                                      | Preserve accepted/proposed text and one authored change per source revision ID                                                          | One-pass benchmark plus independent ins/del fixtures         |
| Move pairs                                                                 | Pair `moveFrom`/`moveTo` by source ID; emit one sparse move change; incomplete/ambiguous pairs flatten visibly with warning             | Forward/backward/nested/overlap tests                        |
| Run/paragraph property revisions                                           | Preserve only properties with exact before/after Plate codec mappings; emit per-property warning otherwise                              | Bold and heading level plus unsupported property fixtures    |
| Revision ordering                                                          | Build explicit nesting/move/property dependencies and use first XML occurrence as stable tiebreaker; dates are metadata only            | Same/invalid dates, nested and dependent revision tests      |
| Missing/invalid revision date                                              | Preserve source order and change identity, store the existing authored `0` unknown-time sentinel, omit Word date on re-export, and warn | No fabricated timestamp; import/export test                  |
| Main-body comments                                                         | Return rich `Value` body, exact range, author/date, IDs, durable ID, parent and resolved state when present                             | Comment range/reply/resolution fixtures                      |
| Missing comment range endpoint/reference                                   | Return `target: null`; keep comment body/metadata; warn with source ID                                                                  | Malformed marker fixtures                                    |
| App comments storage                                                       | Never mutate or infer it; caller maps returned facts and current ranges explicitly                                                      | Public type/app integration test                             |
| Embedded/imported images and other media                                   | Omit until destination upload/media policy exists; preserve surrounding content and emit `resource-omitted`                             | No data/remote/CID/RTF auto-adoption                         |
| Export remote images                                                       | Keep explicit `allowRemoteImages`, default false; failed/blocked resources warn or fail according to existing required-content law      | Converter and abort tests                                    |
| Table geometry                                                             | Preserve semantic rows/cells/spans already represented; omit Word layout debris with `lossy-content`                                    | Table structure fixture; geometry remains feature-owned      |
| Headers, footers, footnotes, endnotes                                      | Scan relationship-reachable parts for limits and diagnostics; do not map them to public named roots in this packet                      | One warning per unsupported part family                      |
| Fields, text boxes, shapes, charts, SmartArt, embedded objects, custom XML | Preserve reachable plain text only where the configured conversion exposes it; otherwise warn/omit                                      | One representative fixture per family, no layout claim       |
| Plate named roots and metadata                                             | Exact only through a matching native envelope; no visible Word claim                                                                    | Native match/mismatch and root diagnostics                   |
| Custom Plate, math, emoji and media nodes                                  | Feature serializers own visible HTML; DOCX wraps their configured output and diagnoses unsupported fallback                             | Custom node/mark proof; no feature implementation here       |
| Unknown but recoverable content                                            | Preserve visible text and return `ok: true` with `unsupported-content`                                                                  | Fixture assertion                                            |
| Invalid package, limit breach or schema-invalid document                   | Return `ok: false`; never return empty successful content                                                                               | Failure-union tests and app no-replacement browser test      |

Revisions are grouped by source ID across the main part. The importer performs
one streaming OOXML semantic walk, rewrites supported review constructs to
collision-resistant private sentinels, invokes Mammoth once, and decodes the
result through the caller's installed HTML codecs once. It derives accepted,
proposed and per-revision sparse sections from the decoded superposition.
Plite's authored helper applies those `DocumentChange` records once each. It
never builds a new DOCX or runs Mammoth for each cumulative revision.

## Decision ledger

| Surface                     | Current                                                     | Target                                                                               | Owner                                         | Reason                                                                   | Adoption                                             | Proof                                             | Risk                                                 | Verdict         |
| --------------------------- | ----------------------------------------------------------- | ------------------------------------------------------------------------------------ | --------------------------------------------- | ------------------------------------------------------------------------ | ---------------------------------------------------- | ------------------------------------------------- | ---------------------------------------------------- | --------------- |
| Import content truth        | `nodes` plus optional `document`                            | One success `document`; failure has no content                                       | Plate DOCX import                             | Whole-document state, roots/meta/authored cannot fit in `nodes`          | All tests, helpers and registry call `value.replace` | Type/runtime/app failure proof                    | Existing fragment callers break intentionally        | cut/rearchitect |
| Import failure              | Empty nodes/string warnings can look successful             | `ok` union and structured diagnostics                                                | Plate DOCX API                                | User-selected malformed files are expected failures                      | App branches before mutation                         | Invalid ZIP/HTML/schema/limit fixtures            | Callers must handle failure                          | rearchitect     |
| File RTF                    | File option feeds clipboard cleaner                         | No file-import RTF                                                                   | Word paste                                    | RTF is a sibling clipboard representation                                | Delete sole unit-test caller                         | Source audit                                      | None                                                 | cut             |
| Export operations           | Value-to-Blob plus separate authored editor export          | One editor-to-result `exportToDocx` with required projection                         | Plate DOCX export                             | One user job and one snapshot authority                                  | Migrate ordinary/review/tests/app                    | Public type and snapshot-race proof               | Passing editor is a hard break                       | merge           |
| Export schema               | Ordinary configured static renderer; review literal tag map | One configured renderer plus private revision wrappers                               | Plate static presentation + DOCX Word encoder | Feature serializers must remain canonical                                | Delete `authoredDocx.ts` literal renderer            | Custom element/mark/review XML proof              | Wrapper/path mapping must handle split segments      | rearchitect     |
| Snapshot                    | Markup captured, native document reread after await         | `AuthoredFormatSnapshot.review`; no post-await read                                  | Plite authored                                | Every output part must share one immutable state                         | Migrate JSON/HTML/DOCX consumers                     | Delayed converter mutation test                   | Additive snapshot field but helper input break below | rearchitect     |
| Imported authored revisions | Cumulative full proposed document per revision              | Sparse `DocumentChange` per revision                                                 | Plite authored format adapter                 | Removes N whole-document diffs and names the canonical change owner      | Migrate sole DOCX caller and Plite/type tests        | Authored contract tests + production benchmark    | Sparse section construction is correctness-sensitive | rearchitect     |
| Revision conversion         | N+1 ZIP/XML/Mammoth passes                                  | One semantic package walk and one codec pass per supported part                      | Plate DOCX import                             | Frozen probe proves the scaling law                                      | Replace tracked importer                             | Same four cohorts and full semantic guards        | Prototype covered insertion only                     | rearchitect     |
| Package reader              | JSZip opens untrusted input without public bounds           | Strict zip.js reader with preflight and counting extraction                          | Private DOCX import boundary                  | It exposes the metadata/checks/cancellation the boundary needs           | Import dependency only                               | Bomb/ambiguity/CRC/abort tests, packed graph      | New dependency; browser worker behavior              | replace         |
| Native sidecar              | Raw document overrides Word body when present               | Word conversion first; version, all-part manifest and visible projections must match | DOCX envelope                                 | Prevent stale native authority while retaining exact unchanged roundtrip | Rewrite envelope and bug probes                      | Edited body, corrupt, repacked, native-only roots | Checksums do not authenticate hostile files          | rearchitect     |
| Comments                    | Text plus point references                                  | Rich format facts with exact range and metadata                                      | DOCX import/export; app maps storage          | Word comments are ranges/threads, not marker points                      | Migrate import result and docs                       | Range/reply/resolution/malformed fixtures         | App identity mapping remains explicit                | rearchitect     |
| Paste plugin                | `DocxPlugin` at `platejs/docx`, key `docx`                  | `WordPastePlugin` at `platejs/docx/paste`, key `wordPaste`                           | Plate transfer adapter                        | The plugin transforms Word HTML/RTF only                                 | All package/demo/registry callers                    | Existing paste suite and package entrypoint check | Public break                                         | rename/move     |
| Named roots                 | Silently omitted from visible export; sidecar can override  | Native-only when matched, otherwise explicit loss                                    | DOCX format boundary                          | No canonical Word↔Plate root mapping is established                      | Diagnostics/docs/tests                               | Native match/mismatch fixture                     | Lower visible fidelity than broad claim              | constrain       |
| Media/table policy          | Paste strips images/geometry                                | Keep current omission in this packet                                                 | Media/table/transfer owners                   | Safe destination policy is unproved                                      | None                                                 | Existing paste tests remain                       | Users may expect more; docs must say so              | keep/defer      |
| Universal document engine   | None                                                        | None                                                                                 | No owner                                      | Separate formats/features do not share one current job                   | None                                                 | Hard-cut comparison                               | Premature abstraction                                | reject          |
| Retained source package     | None                                                        | None                                                                                 | No owner                                      | Arbitrary package-preserving editing is unrequested second state         | None                                                 | Research comparison                               | Unsupported parts are not roundtripped               | defer           |

## Execution slices

| Slice                                  | Owner                                             | Scope                                                                                                                                                                                                                                                                                                        | Entry                | Exit                                                                                                                     | Proof                                                                                                                              |
| -------------------------------------- | ------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------- | ------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------- |
| 1. Plite format primitives             | Plite authored                                    | Make `readAuthoredFormatSnapshot` read one persisted review document and return it as `review`; change imported revisions from cumulative `proposed` documents to sparse `change: DocumentChange`; apply each change once and rewrite source metadata without touching persistence internals                 | User accepts plan    | JSON/HTML/DOCX adapters can consume one immutable capture; no cumulative whole-document diff remains                     | `pnpm --filter plitejs test:partition:authored`, authored typecheck/tests/build                                                    |
| 2. Bounded package boundary            | Plate DOCX import                                 | Add private zip.js reader and saxes XML parser, frozen defaults/override validation, strict central/local checks, CRC/overlap/encryption/name/DOCTYPE rejection, relationship graph, byte-counting extraction, streaming XML depth/node counters and cooperative abort                                       | Slice 1 green        | Every extraction is preflighted and actual-counted; malformed/limit inputs return `ok: false`; abort releases readers    | Focused ZIP64, duplicate, overlap, CRC, encrypted, traversal, DTD, bomb, entry/total/count/depth/node/abort fixtures               |
| 3. One-pass semantic import            | Plate DOCX import + private Plite bridge          | Replace projection/repack loop with one OOXML sentinel walk and one installed-codec decode per part; emit sparse changes; preserve comments/ranges/metadata; apply support matrix and structured diagnostics                                                                                                 | Slice 2 green        | One canonical schema-valid document or failure; heavy work independent of revision count; no timestamp ordering          | Existing 23 fixture families, new ins/del/move/property/comment/custom-schema/failure tests and deterministic counters             |
| 4. Native correspondence               | Plate DOCX import/export                          | Add versioned envelope, all-part and visible-projection digests, schema validation and Word-first fallback; delete raw-sidecar fast path                                                                                                                                                                     | Slice 3 green        | Exact unchanged export restores native roots/meta; any edited/corrupt/mismatched part returns Word document with warning | Former stale-sidecar probe inverted; root/meta/custom node/mismatch/repack tests                                                   |
| 5. Single export                       | Plate DOCX export + Plate static + Plite snapshot | Change `exportToDocx` to editor/result API; require projection; materialize review markup with a private export-only mark/element wrapper over configured static components; add comments and diagnostics; delete `authoredDocx.ts` and every export                                                         | Slices 1 and 4 green | One pre-await capture feeds Word XML, diagnostics and native envelope; no literal schema map or second exporter remains  | Accepted/proposed/review XML, custom node/mark/property, comments, named-root loss, remote image, abort and delayed-mutation tests |
| 6. Production scale and resource proof | Benchmark + DOCX owners                           | Promote the probe to permanent production harness; run frozen cohorts, near-limit valid input, each limit breach, memory/payload/blocking counters and correctness; compare archived baseline receipt                                                                                                        | Slices 3–5 green     | Same heavy-work counts and budgets pass on final source; valid large file completes; failure work stops at owning limit  | Exact command/budgets under Scale contract and JSON receipt                                                                        |
| 7. Public adoption                     | Plate package + registry app                      | Rename/move paste plugin/key/subpath; remove old exports/options/result fields; migrate unit/slow/type/package integration and registry callers; app replaces whole document only on success and surfaces diagnostics/comment count without inventing identities                                             | Slice 6 green        | Zero live old symbols/imports; file failure leaves editor unchanged; success preserves full document                     | Source audit, type contracts, package tests, browser file-picker/download test                                                     |
| 8. Docs, package and delivery proof    | Plate Docs, package, Plate Next, Task             | Rewrite current-only DOCX reference/support matrix/examples; add zip.js import dependency and major changesets; run barrels, registry generation, package graph/build/install, LibreOffice smoke; apply Best API doctrine repair and next monotonic Plate Next record if required by current execution rules | Slice 7 green        | Public teaching matches exact support; paste/import/export bundles are isolated; all checks pass                         | Commands below, generated output, changesets, version validation, packed smoke, LibreOffice artifacts                              |

## Proof matrix

| Claim                                         | Planning evidence                                                                          | Execution proof                                                   | Status   |
| --------------------------------------------- | ------------------------------------------------------------------------------------------ | ----------------------------------------------------------------- | -------- |
| Current import has competing content truths   | `ImportDocxResult` exposed `nodes` and optional `document`; registry consumed only `nodes` | Result union, package tests, and browser failure preservation     | verified |
| Current export can mix snapshots              | Historical delayed-conversion probe recorded Word `ORIGINAL` and sidecar `ORIGINALLATE`    | Delayed mutation test keeps every emitted part on one capture     | verified |
| Raw sidecar can override edited Word content  | Historical ZIP edit probe recorded stale sidecar result                                    | Digest mismatch selects the Word document and warning             | verified |
| Review export duplicates schema serialization | Literal schema rendering bypassed configured static options                                | Review projection composes configured static renderers            | verified |
| Heavy revision work multiplies by N           | Historical loop and frozen counters                                                        | Production cohorts use one package/XML/Mammoth pass               | verified |
| One-pass review extraction is feasible        | Design cohorts matched accepted/proposed text and IDs                                      | Final import and authored suites cover sparse revisions           | verified |
| Package limits precede expansion              | zip.js central metadata and streaming extraction                                           | ZIP64, overlap, CRC, encryption, DTD, byte/count/depth/node tests | verified |
| Comments preserve ranges and metadata         | OOXML range and metadata parts                                                             | Import/export comment fixtures and app mapping contract           | verified |
| Word-visible state wins over native metadata  | Word-first envelope validation                                                             | Changed/corrupt/mismatched package fixtures                       | verified |
| Feature serializers remain authoritative      | Configured static composition                                                              | Custom nodes, marks, properties, math, and tables                 | verified |
| No unsupported fidelity is silent             | Structured result diagnostics and support matrix                                           | Diagnostic tests and current-only docs                            | verified |
| Public package topology is truthful           | Three subpaths map to three jobs                                                           | Packed declaration/runtime consumers and dependency graph         | verified |

## Scale contract

- applicability and source evidence: applied. Current
  `importTrackedDocx` rebuilds a package, parses XML, runs Mammoth and computes a
  whole-document diff for the accepted baseline and every revision.
- user operation, current owner, proposed owner: import one selected DOCX file;
  current owner is `packages/platejs/src/docx/import/lib/importDocx.ts`;
  target owner is one bounded OOXML semantic mapper plus one configured HTML
  codec pass and sparse Plite authored changes.
- independent variables and cohorts: paragraph count, revision count,
  compressed bytes and expanded document XML. Normal 4/4, large 24/16, stress
  96/48 and pathological 256/96 paragraphs/revisions; one cold call, one
  warmup, then 5/5/3/1 samples.
- frozen budget: exact accepted/proposed text and revision order; target exactly
  one ZIP load, XML parse, package generation and Mammoth conversion; target
  warm max <=250/500/1,000/2,000 ms by cohort; target median/sample <=50% of
  baseline at large/stress/pathological. Materiality is at least 2x and 5 ms.
- current baseline and target command:
  `bun test docs/plans/artifacts/docx-canonical-conversion-contract/revision-import-probe.test.ts`.
- source identity: commit
  `5a899edcbea2c31f1bd34dc575c9dd3860c577d0`; importer SHA-256
  `f0985d8e6a17a4cbcf0d812cd98b5a2ba709d056907cde51acf64524f3a4020b`;
  authored format SHA-256
  `a724a5ae681d0afcd63388df4b6be9c9a3f30dede164204ef33d1d6f987ce92e`;
  lockfile SHA-256
  `87c2ccedbae4674e84c7a7f3498db6123240b3a271904d3f1b44fbe3153edee7`;
  Bun 1.3.12, Darwin arm64, Apple M5 Max, 128 GiB.
- result: pass. Baseline/target warm medians were 27.326/1.307 ms,
  139.885/2.245 ms, 777.777/2.674 ms and 3,681.535/4.889 ms. Speedups were
  20.9x, 62.3x, 290.8x and 753.0x. Both paths matched all correctness guards.
- deterministic work: baseline at 96 revisions performs 98 ZIP loads, 98 XML
  parses, 97 package generations, 97 Mammoth conversions and 96 document
  diffs; target performs one of each heavy operation and one semantic walk.
- artifacts:
  `docs/plans/artifacts/docx-canonical-conversion-contract/revision-import-probe.md`
  and `revision-import-probe-receipt.json` beside it.
- claim limit: the prototype proves text insertion semantics and the
  revision-count scaling law. It does not prove deletions, moves, properties,
  comments, custom schemas, resource limits, final authored materialization,
  memory, browser behavior or native Word/LibreOffice output.
- final production command:
  `bun test benchmarks/editor/benchmarks/plate-docx-revision-import-benchmark.test.ts`.
  Final result: 2 tests and 470 assertions passed. Normal, large, stress, and
  pathological medians were 21.83, 42.08, 116.42, and 290.99 ms; p95 was
  22.89, 42.73, 136.74, and 421.85 ms. Maximum measured warm RSS deltas were
  3.69, 8.86, 17.80, and 28.53 MiB. Every sample used one ZIP load, one XML
  parse, one package generation, one Mammoth conversion, and two bounded
  accepted/proposed `DocumentChange.between` calls. All frozen latency,
  relative, memory, correctness, and failure-cutoff budgets passed.
- production receipt:
  `benchmarks/editor/benchmarks/results/plate-docx-revision-import-latest.json`.
- exact correctness reruns after production benchmark:
  `pnpm --filter platejs test:partition:docx-import`,
  `pnpm --filter platejs test:partition:docx-export`,
  `pnpm --filter platejs test:partition:docx`, and
  `pnpm --filter plitejs test:partition:authored`.

### Performance and observability

- repeated unit: one Word revision. Heavy package/XML/codec work is constant;
  sparse change applications may remain linear in revisions and touched nodes.
- cold/failure behavior: the receipt includes cold calls. Production adds
  invalid ZIP, unsupported compression/encryption, each size/count limit,
  aborted extraction, converter rejection and schema rejection.
- payload/fan-out: receipts store only byte counts, paragraph/revision counts,
  heavy-work counters and timings. No document text is retained.
- query/render/subscription/cardinality: N/A for this detached operation; it
  performs no database query, render subscription, cache wake or retained
  listener. Static export render count must remain one per operation.
- production detector: N/A. There is no existing content-safe DOCX telemetry
  owner, and this packet does not invent one. Apps may log operation outcome,
  duration, byte/revision cohort and diagnostic codes, never document content,
  names, comment bodies, URLs or relationship targets.
- degradation: over-limit/invalid input fails before editor mutation; lossy but
  usable conversion succeeds with warnings; no staged background replacement,
  debounce or delayed correctness.

## Conditional evidence

- High-risk scenarios: ZIP bombs and lying central metadata; ambiguous,
  duplicate, overlapping, encrypted or unsafe entries; abort during extraction;
  nested/overlapping revision dependencies; incomplete moves; same/invalid
  timestamps; comment spans crossing runs/paragraphs; missing range markers;
  stale/corrupt/native-only sidecars; source editor mutation during export;
  custom serializers; unsupported roots/parts; and app replacement on failure.
  Slices 2–7 give each a direct exit.
- External research: the existing seven-corpus documents wiki and final
  reassessment remain authoritative. The bounded-reader selection adds local
  zip.js source at exact commit `307b756...`; no third-party code is copied.
- Issue/PR provenance: N/A. No issue or PR backs this request.
- Docs: public latest-state API/reference, support matrix and examples are
  required. No migration section or changelog language.
- Registry/browser: applicable because copied toolbar code currently discards
  the canonical result. Build registry output on `next`; add one Chromium
  file-picker/download behavior test. Browser proof does not certify Word.
- Native application: LibreOffice is locally available through the workspace
  runtime. Headless open/re-save proves package readability only. Microsoft
  Word remains unclaimed unless a later manual receipt exists.
- Security/privacy: this is an untrusted local-file resource boundary, not a
  proven exploit. Strict package parsing and bounded diagnostics must never
  include document/comment text or sensitive URLs.
- Release: public breaks require major changesets for `platejs` and `plitejs`.
  No release is authorized.
- Vision/doctrine: existing first-principles, one-owner, package-boundary and
  proof laws already select this design, so no Vision taste change is planned.
  Best API doctrine repair still rechecks current teaching; append the next
  immutable Plate Next version/migration row if current execution rules require
  it, then regenerate mirrors with `pnpm install`.

## Findings

- `ImportDocxResult` exposes `nodes` and optional `document`; the registry
  toolbar always inserts `nodes`, losing authored metadata, comments and
  warnings. Decode failure can therefore replace content with an empty array.
- The file `rtf` option has no production caller and belongs to clipboard
  source fitting.
- `DocxPlugin` has only clipboard codecs. File import/export already live under
  separate lazy subpaths.
- `exportAuthoredToDocx` owns a second literal element/mark serializer and reads
  the live editor again after awaiting conversion. Existing probes demonstrate
  mismatched Word/native parts and stale native authority.
- Tracked import sorts first-seen revisions by timestamp, scans only the main
  part, and performs one cumulative conversion/diff per revision. The scale
  probe made that cost concrete.
- Plite already exports `DocumentChange`; its authored format helper is the
  correct owner for applying imported sparse changes, but currently accepts
  cumulative full documents.
- Word comment parts can carry ranges, author/date, durable IDs, parent/reply
  and resolution state. Current point references/text cannot substantiate the
  docs claim.
- A pure OOXML Plate decoder would duplicate feature schema. A pure semantic
  HTML path cannot recover facts it never receives. The hybrid has one owner
  for each irreducible job.
- JSZip is still suitable for trusted DOCX generation. Its public surface does
  not provide the strict pre-expansion limit contract required for arbitrary
  imported packages. Keeping it for export and zip.js for the lazy import
  subpath is less costly than a home-grown ZIP security parser.
- The XML depth/node limits require a streaming parser before DOM/Mammoth work;
  saxes already owns namespace-aware XML tokenization and DTD rejection, so a
  second local parser is unjustified.
- A checksum embedded in the same file does not authenticate it. The envelope
  design claims accidental-edit correspondence only and still validates all
  native data as untrusted input.

## Decisions and tradeoffs

- The target deliberately parses Word-visible content even when a sidecar is
  present. Exact native restoration costs one normal conversion, but removes
  the dangerous alternate authority and lets the package verify projections.
- Static serializer options remain public. Removing them would force DOCX to
  own math, column, callout, TOC and custom-node presentation, violating the
  user's feature-boundary constraint.
- Comments are returned and optionally accepted for export, but storage/user
  mapping stays app-owned. A generic comments adapter would hide identity and
  persistence decisions.
- Header/footer/note roots remain diagnosed, not half-mapped. This is a smaller
  truthful API than inventing permanent Plate root names before a user job.
- Cooperative abort plus hard byte/structure limits is honest. A public timeout
  that cannot interrupt installed synchronous code would be theater.
- Two ZIP libraries are acceptable because they sit behind separate lazy
  entrypoints and solve different trust/write jobs. Packed proof must confirm
  paste consumers do not inherit either.

## Review fixes

- The earlier review's provisional “direct OOXML versus repaired HTML” fork is
  resolved to a bounded hybrid after the executable one-pass probe.
- The earlier image/table preservation recommendation remains corrected:
  current paste omission stays until destination media/table policy is proved.
- Sidecar hashing is explicitly described as correspondence, not hostile-file
  authenticity.
- Export failure is now as explicit as import failure; neither operation can
  return a Blob/empty document while hiding fatal conversion loss.
- Missing revision dates no longer determine order or receive fabricated wall
  time; the existing authored unknown-time sentinel is explicit and diagnosed.

Error attempts:

| Error / failed attempt                                                                        | Count | Next different move                                         | Resolution                                                           |
| --------------------------------------------------------------------------------------------- | ----: | ----------------------------------------------------------- | -------------------------------------------------------------------- |
| Probe imported `jszip`/`mammoth` from the repo root, where pnpm exposes no root symlink       |     1 | Resolve through the owning Plate package's dependency path  | Normal cohort and full run passed.                                   |
| Full probe read authored changes with the default 50-item page and appeared to lose IDs 51–96 |     1 | Request `revisionCount + 1` from the existing paginated API | All 96 IDs matched; this was a harness error, not a product finding. |

Verification evidence:

- `bun test docs/plans/artifacts/docx-canonical-conversion-contract/revision-import-probe.test.ts`:
  1 benchmark test passed, 8 correctness assertions, four cohorts, 22.40 s.
- Receipt:
  `docs/plans/artifacts/docx-canonical-conversion-contract/revision-import-probe-receipt.json`.
- Exact source/lock/runtime/machine identities are embedded in the receipt and
  the human-readable probe.
- Existing research receipt: 135 unique DOCX/package/demo tests passed before
  planning, with two historical bug probes preserved as observations. It does
  not replace the final production proof above.
- `pnpm exec prettier --check` passed for the plan, probe, benchmark and
  receipt; the stale-token scan and `git diff --check` passed for the same
  artifacts.
- `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-09-14-docx-canonical-conversion-contract.md`:
  complete.
- Final Plite authored partition: 368 tests passed; the direct format contract
  contains 6 passing snapshot, sparse-change, range, and property assertions.
- Final Plate DOCX partitions: import 16, export 96, paste 19, and HTML 9 tests
  passed. All five DOCX source typecheck and lint partitions passed.
- The package-integration DOCX roundtrip file passed 6 tests. The focused DOCX
  registry demo passed; the aggregate registry test retains one unrelated
  expected-file-list failure for the concurrent untracked
  `rich-text-editor-value.ts` registry source.
- `pnpm --filter www typecheck` passed after regenerating the API reference and
  declaring `sonner` on both copied toolbar registry items.
- Source-mode Chromium passed 2 file-action tests: invalid input preserved the
  editor and surfaced an error; a real DOCX fixture imported and downloaded a
  ZIP-signature `plate.docx`.
- LibreOffice headlessly opened and re-saved accepted, proposed, and review
  exports as Office Open XML Text. Every re-saved package passed `unzip -t`.
- Plate Next doctrine v197 records the complete-model versus mounted-view hook
  boundary; `pnpm install` regenerated mirrors and `version.mjs validate`
  passed.

Implementation verification commands:

```bash
pnpm --filter plitejs test:partition:authored
pnpm --filter plitejs typecheck:partition:authored
pnpm --filter plitejs typecheck:contracts
pnpm --filter plitejs build

pnpm --filter platejs test:partition:docx-import
pnpm --filter platejs test:partition:docx-export
pnpm --filter platejs test:partition:docx-paste
pnpm --filter platejs test:partition:docx-html
pnpm --filter platejs typecheck:contracts
pnpm --filter platejs typecheck:partition:react

bun test benchmarks/editor/benchmarks/plate-docx-revision-import-benchmark.test.ts
PLAYWRIGHT_BASE_URL=http://localhost:3217 pnpm --filter www test:www-browser:chromium docx.spec.ts
pnpm --filter www typecheck
pnpm --filter www build:registry
pnpm brl
pnpm changeset status
node .agents/rules/plate-next/scripts/version.mjs validate
pnpm plite:release:packages
```

LibreOffice proof generated accepted, proposed, and review DOCX files in the
ignored task-artifact directory, then used the workspace `soffice --headless
--convert-to docx --outdir <projection>` path to open and re-save each package.
The content-free result above is the retained receipt; Microsoft Word is not
claimed.

## Final handoff prepared

- Ownership and target API: Plate DOCX owns bounded Word file conversion and
  structured diagnostics; Plite authored owns immutable snapshots and sparse
  imported changes; installed feature serializers own schema; apps own comment
  identity/storage; Word paste is `WordPastePlugin`.
- Public breaks: delete the duplicate authored exporter, value-only export,
  import `nodes`/optional document/string warnings/RTF, `DocxPlugin`,
  `PLUGINS.docx`, and `platejs/docx`; add only the three truthful subpaths and
  result/options/types above.
- Runtime/package/docs/browser decisions: one strict bounded zip.js import
  reader, one semantic/codec pass per part, JSZip trusted writer, configured
  static export, current-only docs, registry whole-document adoption and one
  actual browser file workflow.
- Scale proof: the final production path passes all four frozen cohorts with
  21.83–290.99 ms medians, one heavy conversion pass, bounded memory, semantic
  correctness, and limit-failure cutoffs.
- Main risks: complete review dependency mapping, private static wrapper path
  alignment, sidecar projection normalization, rich comment ranges and package
  limit enforcement. Every risk has an owner and direct exit.
- Execution order: Plite capture/change primitive; bounded package reader;
  one-pass import; native correspondence; single export; production benchmark;
  all public callers; docs/package/delivery closure.
- Publication: no commit, push, PR, release, or external publication occurred.

Timeline:

- 2026-09-14: Created deep Plate Plan from the superseding documents review.
- 2026-09-14: Reconciled live DOCX/Plite/caller/package source and existing OSS
  research; selected a bounded OOXML + configured-codec hybrid.
- 2026-09-14: Froze and ran the embedded architecture probe; corrected two
  harness issues; all four cohorts passed with constant heavy work.
- 2026-09-14: Fixed the exact public contracts, limits, envelope, support
  matrix, adoption slices and production proof handoff.
- 2026-09-15: Implemented all eight slices, repaired complete-model React
  ownership and copied-registry package closure, and passed package, browser,
  LibreOffice, benchmark, docs, type, lint, and doctrine proof.

Reboot status:

| Question             | Answer                                                                                          |
| -------------------- | ----------------------------------------------------------------------------------------------- |
| Where am I?          | Complete implementation, proof, doctrine, package, ledger, and plan closure                     |
| Where am I going?    | No remaining DOCX-owned execution step                                                          |
| What is the goal?    | One canonical, bounded and fidelity-explicit DOCX API                                           |
| What have I learned? | OOXML and configured codecs must share the pipeline; repeated full conversions are indefensible |
| What have I done?    | Implemented the canonical API, bounded runtime, adoption, docs, and executable proof            |

Open risks:

- No implementation decision remains open. Future work must not claim
  Microsoft Word certification, arbitrary package fidelity, imported media,
  visible named-root mapping or hard synchronous timeout cancellation without
  new evidence and a separately accepted scope.
