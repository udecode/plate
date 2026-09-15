# DOCX retained source preservation

Objective:
Add an explicit, bounded DocxSource artifact to the existing DOCX import, edit,
and export workflow. An opted-in import retains one admitted source package and
an immutable semantic baseline; export can return the exact source bytes for a
proven unchanged review document and can preserve only relationship-closed
source package units after edits. Any source unit without safe provenance is
regenerated or omitted with structured diagnostics. Keep semantic conversion
as the default and keep DOCX bytes outside editor state, Plite, comments
storage, and feature packages.

Flow mode:
agent-led plan hardening

Goal plan:
docs/plans/2026-09-15-docx-retained-source-preservation.md

Template:
docs/plans/templates/plate-plan.md

Primary template:
docs/plans/templates/plate-plan.md

Applied packs:

- performance-observability

Mode:

- deep: the target adds a public lifetime-bearing object shared by the DOCX
  import and export entrypoints; changes package ownership, memory retention,
  diagnostics, first-party React state, native package proof, docs, generated
  registry output, and release contracts; and must stay compatible with the
  adopted semantic converter and Plite document model.

Completion threshold:

- The target public API is fully typed: source is present only after a
  successful retainSource true import, dynamic booleans require narrowing,
  callers cannot construct valid sources, and disposal is explicit and
  idempotent.
- Default imports and exports perform the current semantic conversion without
  retaining source bytes.
- Retention reuses the package reader's one admitted immutable Blob; it does
  not copy compressed bytes or keep expanded ZIP entries alive.
- Exact source reuse requires the same complete schema identity, unchanged review
  document, unchanged or unspecified imported comments, review projection, and
  no explicit package metadata or page-layout override.
- Edited export treats word/document.xml as one invalidation unit. It never
  splices paragraph XML or reuses body relationships without proved source
  mapping. It preserves only safe relationship-closed parts and emits one
  structured reason for every requested source unit it rewrites or omits.
- Digital signatures, macros, ActiveX/OLE content, unsafe external
  relationships, conflicting parts, and unreachable parts never enter a
  regenerated package silently.
- App code owns the DocxSource reference and releases it on replacement and
  unmount. No editor plugin, document metadata field, persisted document, or
  generic comment store owns the bytes.
- The frozen four-cohort performance contract passes on final production code,
  and package-entry, semantic reopen, browser, and LibreOffice proof close the
  preservation claims.
- All affected callers, docs, type contracts, barrels, registry artifacts,
  changeset, doctrine record, and verification gates are complete before
  implementation closeout.

Verification surface:

- Public import and source lifetime:
  packages/platejs/src/docx/import/lib/importDocx.ts,
  packages/platejs/src/docx/import/lib/docxPackage.ts, a shared private source
  owner under packages/platejs/src/docx/internal/, import unit/slow tests, and
  packages/platejs/type-tests/authored-format-contracts.ts.
- Export eligibility and package overlay:
  packages/platejs/src/docx/export/lib/exportToDocx.tsx, a private OPC
  relationship/preservation owner under packages/platejs/src/docx/export/lib/,
  export unit tests, authored DOCX tests, and package-integration round trips.
- Canonical comparison remains DocumentChange.between and
  editor.read.schema.identity(); Plite receives no new source state or diff
  primitive.
- First-party ownership:
  apps/www/src/registry/examples/docx-demo.tsx, import/export toolbar controls,
  one app-local source provider, focused registry tests, actual file picker and
  download browser proof, and generated registry output.
- Current reference docs:
  content/docs/(plugins)/(serializing)/docx.mdx plus package export and packed
  consumer checks.
- Frozen design receipt and final benchmark:
  benchmarks/editor/benchmarks/plate-docx-retained-source-benchmark.test.ts,
  benchmarks/editor/benchmarks/results/plate-docx-retained-source-latest.json,
  and the production replacement or promotion of that harness.

Constraints:

- The user accepted the final plan and authorized direct full implementation.
  The pre-acceptance benchmark remains design evidence; the promoted production
  harness and current receipt are the completion evidence.
- Work remains in the authorized next checkout. No commit, push, PR, release,
  tracker mutation, or external publication is authorized.
- Preserve current importDocx, exportToDocx, WordPastePlugin, lazy subpaths,
  explicit projection, installed Plate codecs, structured diagnostic owner,
  package limits, abort behavior, and one synchronous export capture.
- No compatibility alias, second importer/exporter, mode enum, generic document
  source framework, DocxSession, public ZIP API, OOXML canonical model, hidden
  plugin state, source bytes in EditorDocumentValue, or automatic durable
  persistence.
- Math, emoji, body media, tables, generic comments storage, custom elements,
  authored changes, and clipboard transfer policy keep their current owners.
  This packet consumes configured serializers and current comments only; it
  does not redesign those features.
- Exact bytes are a narrow no-op guarantee. Edited export guarantees only the
  named relationship-closed package units and explicit fallbacks, not Word
  layout equivalence or arbitrary inside-part XML preservation.
- Tests prove current behavior and preservation boundaries. Do not add dead-API
  absence tests or migration prose.

Boundaries:

- In scope: typed opt-in import result; opaque disposable source lifetime;
  admitted compressed-byte ownership; immutable baseline, schema, comment, and
  import-limit binding; exact review reuse; edited package graph overlay;
  header/footer and safe root-subgraph retention; source diagnostics; app-local
  source state; docs; type/package/browser/native-office/performance proof.
- Source owners: packages/platejs/src/docx/import/**,
  packages/platejs/src/docx/export/**, packages/platejs/src/docx/internal/\*\*,
  the DOCX public subpath barrels, first-party DOCX demo/toolbars/provider, DOCX
  docs, benchmark, changeset, and smallest affected Plate Next doctrine owner.
- Non-goals: paragraph/run XML patching, OOXML tree editing, multiple-section
  reconstruction, footnote/endnote mapping, main-body imported image mapping,
  arbitrary external relationships, executable Office content, digital
  signature preservation, generic comment identity/range relocation, persisted
  source reattachment, collaboration transport, Microsoft Word certification,
  and changes to Word paste.
- Direct Plite boundary owners: existing DocumentChange.between determines
  whether the semantic baseline changed and existing schema identity binds the
  source to compiled semantics. No Plite mutation is planned because both
  primitives already express the required comparison.

Output budget strategy:

- Keep complete timing samples and source hashes in the JSON receipt; keep the
  public contract, invalidation matrix, package allow/deny rules, adoption, and
  proof commands in this one plan. Reuse the completed eight-repository OSS
  packet rather than restreaming external source.

Blocked condition:

- During implementation, reopen the architecture decision only if three
  distinct focused attempts cannot (a) preserve a single-section header or
  footer subgraph without breaking generated body relationships, (b) classify
  every copied part as reachable and non-active, or (c) meet the frozen
  retention budget while reusing the admitted Blob. In that case ship only the
  exact unchanged lane if it independently passes all gates; do not claim
  edited preservation or add a session/OOXML model as a workaround.

Plate Plan state:

- status: complete
- phase: implementation-verified
- next: none for this retained-source target
- handoff: implemented and proved; publication remains unauthorized

Start Gates:

| Gate                                               | Applies | Evidence                                                                                                                                                          |
| -------------------------------------------------- | ------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Prompt requirements captured                       | yes     | Explicit bounded preservation, deep design, harsh reassessment, fully typed API, and separate feature owners are fixed above.                                     |
| Task plan and execution authority verified         | yes     | The accepted plan was implemented directly under the user’s full Task authorization.                                                                 |
| Current owners read                                | yes     | Live import/export/package/diagnostic/DocumentChange/schema/UI/docs/tests and prior canonical plan are cited in this plan.                                        |
| Best API target resolved                           | yes     | One generic opt-in on importDocx, one opaque DocxSource, and one optional source on exportToDocx; no new operation or mode enum.                                  |
| Runtime scale applicability resolved               | yes     | Retention changes compressed bytes held per open source, baseline clone size, import latency, exact export work, and edited package graph fan-out.                |
| Pre-acceptance Benchmark probe selected            | yes     | Matched current import/semantic export versus retained import/exact prototype across four cohorts; receipt and source hashes are recorded below.                  |
| Mode and execution boundary resolved               | yes     | Deep planning was followed by direct implementation, production proof, and ledger reconciliation.                                                                            |
| Performance pack selected                          | yes     | performance-observability owns bytes, memory, latency, fan-out, cohorts, correctness, and production rerun.                                                       |
| User-facing operation and runtime owner identified | yes     | Browser Word import, edit, and export; Plate DOCX owns package/source lifetime and the app owns the reference.                                                    |
| Scale variables and cohorts fixed                  | yes     | Paragraphs, revisions, compressed opaque bytes, semantic baseline bytes, package entries, relationships, preserved subgraph size, and concurrent open sources.    |
| Budget frozen before target measurement            | yes     | Import p95/cold, retained bytes, RSS noise, and exact-export p95 formulas were encoded in the probe before the passing target run.                                |
| Baseline and target probe selected                 | yes     | Current public import and semantic export are compared to a minimal immutable-Blob/baseline-clone/exact-diff prototype on identical fixtures.                     |
| Correctness guard selected                         | yes     | Accepted/proposed text and every revision ID match; exact output is byte-identical; disposal makes retained bytes zero and rejects exact reuse.                   |
| Production detector decision recorded              | yes     | No telemetry owner exists for local client file conversion. Content-free diagnostics, benchmark counters, and browser/package receipts are the detector boundary. |

Work Checklist:

- [x] Outcome, scope, non-goals, constraints, and owners are concrete.
- [x] Current API/docs/tests/exports claims cite live source.
- [x] Reusable public call shape has one Best API verdict before target lock.
- [x] Every scale-sensitive target has a passing executable current-owner versus target Benchmark receipt before its decision row locks.
- [x] Every concept-level decision row has owner, adoption, proof, risk, and verdict.
- [x] Canonical state versus presentation is classified: Plite owns the semantic document/change; DOCX owns source package facts; apps own the source reference; configured serializers own regenerated feature output.
- [x] Public additions and the private package bridge have complete adoption/deletion answers.
- [x] Execution slices and focused proof matrix are concrete.
- [x] Conditional work and final handoff are resolved without generic N/A matrices.
- [x] Performance receipt captures a comparable current-owner baseline before architecture acceptance.
- [x] Complete import and unchanged export operations are measured with deterministic retained-byte and heavy-work counters.
- [x] Normal, large, stress, and pathological semantic/source-byte cohorts are exercised.
- [x] Cold/warm timings, samples, payload bytes, RSS/heap deltas, event-loop delay, and deterministic work are recorded.
- [x] The target prototype contains only source ownership, frozen baseline, schema check, DocumentChange comparison, exact Blob return, and disposal.
- [x] Baseline and target use matched package bytes, editor schema, dependencies, machine, runtime, action, and correctness assertions.
- [x] ZIP/relationship/render fan-out and retained expanded work were inspected before selecting the owner.
- [x] The design reuses one admitted Blob and adds no cache, pool, index, store, scheduler, or transaction parallelism.
- [x] Evidence contains generated fixture text and byte counts only; no user document, identity, credential, or protected data.
- [x] The final production benchmark and exact rerun contract are assigned to the proof slice.
- [x] No budget override exists; the failed double-copy result caused an architecture correction.

Completion Gates:

| Gate                            | Applies | Required action                                                                   | Evidence                                                                                                                                                         |
| ------------------------------- | ------- | --------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Binary readiness                | pass    | Resolve every plan decision and handoff                                           | Public shape, invalidation matrix, six slices, and proof matrix are complete.                                                                                    |
| Fresh source evidence           | pass    | Recheck decision-changing current claims                                          | Current source, docs, UI, benchmark, and 2026-09-15 review/research records were read in this checkout.                                                          |
| Best API review                 | pass    | Resolve every P0/P1 call-shape finding                                            | Conditional generic inference passed strict TypeScript; lifetime and default behavior are explicit; no second operation or mode.                                 |
| Pre-acceptance scale proof      | pass    | Meet frozen cohorts/budgets with correctness                                      | All four passing rows are in the retained-source prototype receipt; the rejected double-copy attempt is recorded.                                                |
| Production scale rerun          | pass    | Run the frozen harness against public production APIs                              | Four cohorts pass unchanged formulas with exact and edited-overlay counters in the current receipt.                                          |
| Conditional risk and adoption   | pass    | Assign package security, docs, browser, native-office, registry, and release work | Slices 2–6 and the proof matrix name every owner and exit.                                                                                                       |
| Verification recorded           | pass    | Record implementation proof                                                       | Focused, package, registry, Chromium, LibreOffice, production benchmark, and doctrine receipts are listed below.                                                |
| Handoff complete                | pass    | Record ownership, additions, proof, risks, and limits                             | Final handoff records the implemented target and remaining deliberate limits.                                                                                                                               |
| P1 autoreview                   | N/A     | Respect Task branch rule                                                          | Current branch is next; Task forbids Autoreview on next.                                                                                                         |
| Goal plan complete              | pass    | Reconcile every accepted gate and close the native goal                            | Every accepted gate passes; native goal closure follows the final ledger check.                                                                                               |
| Pre-acceptance scale proof      | pass    | Compare current and prototype paths                                               | Matched four-cohort receipt passed with source identities and semantic/byte correctness.                                                                         |
| Warm latency budget             | pass    | Prove design target before acceptance                                             | Retained-import p95 is 1.02x, 0.98x, 0.98x, and 1.00x baseline; exact-export p95 is 0.10–0.29 ms; overlay p95 is 12.23–213.17 ms.                                |
| Large/stress scaling            | pass    | Exercise semantic and source-byte growth                                          | Cohorts reach 256 paragraphs, 96 revisions, 900 root parts/relationships, and 25.45 MiB compressed input without retaining expanded package entries.             |
| Cold and failure paths          | pass    | Measure cold path and disposal failure                                            | Every cold target stays inside budget; disposal is idempotent in the target contract and the prototype proves zero retained bytes plus exact-reuse rejection.    |
| Payload and fan-out             | pass    | Record bytes and deterministic work                                               | Receipt records 29.0 KiB–25.61 MiB retained; import adds one clone/no compressed copy, and overlay preserves 8–900 root edges with two reads and one generation. |
| Production-path rerun           | pass    | Rerun after implementation                                                        | Production harness passed 506 assertions across four cohorts in 56.72 seconds.                                                                                                       |
| Correctness guard               | pass    | Preserve semantic and exact-byte truth                                            | Prototype checks accepted/proposed values, revision IDs, byte equality, schema mismatch, and disposal boundary.                                                  |
| Before/after receipt            | pass    | Retain comparable evidence                                                        | JSON receipt contains baseline/target rows, frozen budgets, environment, and SHA-256 source identities.                                                          |
| Detector and privacy            | N/A     | Avoid inventing telemetry for local files                                         | Final content-free benchmark and structured diagnostics provide local evidence without document contents.                                                        |
| Performance regression check    | pass    | Keep a production harness                                                         | The promoted harness records source identities, timing, memory, graph work, and preserved bytes.                                                                                  |

Phase / pass table:

| Phase     | Status   | Evidence                                                                                                      | Next    |
| --------- | -------- | ------------------------------------------------------------------------------------------------------------- | ------- |
| Ground    | complete | Current package/API/UI/docs/tests plus final OSS reassessment reconciled                                      | Decide  |
| Decide    | complete | Hard-cut comparison, exact type shape, invalidation granularity, package owner, and app lifetime fixed        | Execute |
| Execute   | complete | All six slices implemented across package, first-party UI, docs, doctrine, registry, benchmark, and changeset | Prove   |
| Prove     | complete | Focused, packed-package, Chromium, LibreOffice, benchmark, and ledger gates pass                              | Done    |

## Decision brief

- outcome: a caller can opt into retaining the exact admitted DOCX source and
  later request safe source-aware export without changing Plate's canonical
  document, editor lifecycle, or default converter.
- chosen shape: retainSource true conditionally adds one opaque disposable
  DocxSource to successful import; exportToDocx with source first tries exact
  review reuse, otherwise runs the existing semantic exporter and overlays only
  relationship-closed source units whose ownership and reachability are proved.
- strongest rejected alternative: paragraph-level patching over the original
  word/document.xml. Current import has no stable Word-block-to-Plate mapping,
  and generated replacement XML can introduce relationships, numbering,
  styles, media, comments, and review IDs. Shipping that lane in this packet
  would be a second half-built OOXML exporter with stale-formatting risk.
- consequence: an edit invalidates all original main-body XML in this version.
  Headers, footers, safe root relationship subgraphs, and their resources can
  survive when graph closure passes; unsupported body XML remains an explicit
  loss. The API can adopt finer provenance later without changing its call
  shape.

## Current and target public API

Current:

```ts
const imported = await importDocx(editor, file);

if (imported.ok) {
  editor.update.value.replace(imported.document);
}

const exported = await exportToDocx(editor, {
  editorPlugins,
  projection: "review",
  stylesheet,
});
```

Target:

```ts
const imported = await importDocx(editor, file, {
  retainSource: true,
});

if (!imported.ok) return imported.diagnostics;

editor.update.value.replace(imported.document);

const exported = await exportToDocx(editor, {
  editorPlugins,
  projection: "review",
  source: imported.source,
  stylesheet,
});

// Release after the app no longer needs source-aware exports.
imported.source.dispose();
```

Fully typed contract:

```ts
export class DocxSource {
  private constructor();

  /** Release retained package bytes and semantic correspondence. Idempotent. */
  dispose(): void;
}

export type DocxImportOptions<TRetainSource extends boolean = boolean> =
  Readonly<{
    limits?: Partial<DocxImportLimits>;
    retainSource?: TRetainSource;
    signal?: AbortSignal;
  }>;

type DocxImportFailure = Readonly<{
  diagnostics: readonly DocxDiagnostic[];
  ok: false;
}>;

type DocxImportSuccess = Readonly<{
  comments: readonly DocxComment[];
  diagnostics: readonly DocxDiagnostic[];
  document: EditorDocumentValue;
  ok: true;
}>;

export type DocxImportResult<TRetainSource extends boolean = false> =
  | DocxImportFailure
  | (TRetainSource extends true
      ? DocxImportSuccess & Readonly<{ source: DocxSource }>
      : DocxImportSuccess);

export function importDocx<const TRetainSource extends boolean = false>(
  editor: Editor,
  source: ArrayBuffer | Blob,
  options?: DocxImportOptions<TRetainSource>
): Promise<DocxImportResult<TRetainSource>>;

export type DocxExportOptions = Readonly<{
  // existing fields stay unchanged
  source?: DocxSource;
}>;
```

The conditional distributes for a runtime boolean. A literal true exposes a
required source on success; omitted or literal false exposes no source; a
runtime boolean requires a source-property presence check. DocxImportOptions
defaults its type parameter to boolean so separately typed option objects can
express runtime policy, while DocxImportResult and the function default remain
the current no-source result.

DocxSource is exported from platejs/docx/import, where it is created.
DocxExportOptions consumes that type without re-exporting a second owner. There
is no factory, public constructor, retention mode, DocxSession, sourceId,
serializer callback, or persistence method.

## Source identity and lifetime law

A valid source privately owns:

- the exact immutable Blob admitted by readBoundedDocxPackage, normalized to
  the DOCX MIME type with a Blob slice/view that does not read another
  ArrayBuffer;
- the resolved import limits used to admit and later reopen the package;
- a deep-cloned, deeply frozen imported EditorDocumentValue baseline;
- a deep-cloned, deeply frozen imported DocxComment array baseline;
- the exact EditorSchemaIdentity from the importing editor;
- one private runtime identity used only to reject forged/released objects.

It does not retain expanded ZIP entries, DOM trees, Mammoth HTML, static
renderers, editor/plugin references, transaction subscriptions, comment-store
records, or generated packages. dispose clears every strong reference in its
private state and is safe to call repeatedly. A released or schema-mismatched
source produces a source-unavailable warning and semantic export; it never
silently claims preservation.

exportToDocx acquires an immutable local lease on the source state before its
first asynchronous boundary. Disposing the public source blocks later exports
and releases its own references; an already-started export finishes from its
captured lease. Concurrent exports acquire independent leases and cannot
observe each other's disposal timing.

The artifact is process-local and intentionally nonserializable. An app that
persists or recreates an editor must retain the original File or Blob in its own
storage and run import again. Plate will not put a reattachment token into model
metadata because that would make a format-specific lifetime look like canonical
document state.

The caller's explicit source argument asserts that the current document is an
edit of that import baseline. Plate can prove equality or compute a change from
the baseline; it cannot prove ancestry after arbitrary detached values are
replaced without contaminating the document with source identity. The safe
fallback never reuses original body XML for an unexplained current value.

## Export eligibility and option precedence

Exact original bytes are returned only when all conditions pass:

1. source exists and is not disposed;
2. source schema identity exactly equals the current editor schema identity,
   including kind, lineage fields, version, and fingerprint;
3. the synchronously captured review document has an empty DocumentChange
   between the source baseline and captured review;
4. projection is review;
5. comments is omitted, meaning no override of retained source comments, or is
   structurally equal to the imported comment baseline;
6. title, margins, orientation, and pageSize are omitted because each requests
   a package-level change.

editorPlugins, editorStaticComponent, stylesheet, fontFamily, and
allowRemoteImages configure regenerated content and are not consulted on the
exact path. With source, preservation is authoritative for unchanged source
content; those renderer options apply only when semantic generation runs.
signal is checked before the exact result is returned.

Without source, omitted comments keeps its current meaning: generate no
comments. With source, omitted comments means no override of source comments
only for exact byte reuse. Once regeneration is required, source comments are
omitted unless the caller supplies current comments; if the source contained
comments, the omission is diagnosed. This avoids applying stale imported
ranges after edits and keeps generic comment storage outside DOCX.

## Edited preservation algorithm

Edited, transformed, or explicitly restyled output follows one sequence:

1. capture and generate the complete semantic DOCX exactly as the current
   exporter does;
2. reopen the immutable source Blob through the same bounded package reader and
   read the generated package as trusted output;
3. build source and generated OPC relationship graphs with canonical target
   paths, content types, incoming edges, external-edge flags, and reachability;
4. mark the generated main body, document relationships, comments, authored
   envelope, generated styles/numbering/theme/settings, body media, package
   metadata requested by options, and every generated name collision as owned;
5. invalidate all source word/document.xml content and all relationships whose
   only source reference was in that body;
6. preserve single-section header/footer references by remapping document
   relationship IDs into the generated package, copying each internal
   relationship-closed header/footer subgraph byte-for-byte, and copying only
   the required title-page and even/odd-header flags; source page dimensions
   and margins never overwrite explicit export options;
7. preserve safe relationship-closed root subgraphs that do not intersect an
   owned/generated part, use external relationships, contain active content,
   or introduce a conflicting content-type mapping;
8. merge only required content-type declarations and relationship entries,
   then generate the final ZIP;
9. re-read the final package through the bounded reader and report every source
   part as preserved, rewritten, omitted, or unreachable in the private proof
   inventory; public diagnostics expose every rewrite/omission reason.

A source with multiple section properties does not enter header/footer
preservation because Plate has no section model. Its body and section-dependent
parts regenerate or omit with diagnostics. Footnotes, endnotes, body drawings,
fields, content controls, text boxes, charts, SmartArt, embeddings, body images,
and custom XML referenced only from source body XML are invalidated with that
body. Unreferenced source entries are not copied merely to make ZIP diffs look
better.

Active content and claims are denied on any regenerated output:
\_xmlsignatures paths, signature origin/relationship/content types, VBA
projects, macros, ActiveX, OLE/embeddings, controls, and any candidate subgraph
containing an external relationship. Exact unchanged reuse may return the
admitted source containing those bytes because it makes no new package claim;
diagnostics and docs must state that distinction.

## Diagnostic additions

DocxDiagnostic remains the only public compatibility owner. Add warning arms,
not a second report object:

```ts
type DocxSourceUnavailableDiagnostic = Readonly<{
  code: "source-unavailable";
  message: string;
  reason: "disposed" | "invalid" | "schema-mismatch";
  severity: "warning";
}>;

type DocxSourceRewrittenDiagnostic = Readonly<{
  code: "source-rewritten";
  message: string;
  reason:
    | "comments-changed"
    | "document-changed"
    | "output-options-changed"
    | "projection-changed";
  severity: "warning";
}>;

type DocxSourcePartOmittedDiagnostic = Readonly<{
  code: "source-part-omitted";
  message: string;
  part: string;
  reason:
    | "active-content"
    | "conflict"
    | "external-relationship"
    | "invalidated"
    | "multiple-sections"
    | "unreachable";
  severity: "warning";
}>;
```

Diagnostics identify source paths but never source content. Repeated omissions
with the same reason and feature may be aggregated only when the diagnostic
retains the exact affected part list under the existing bounded 1,024-entry
limit. No info severity or success report is added.

## Invalidation matrix

| Source fact                                     | Exact review                               | Edited/generated path                                                       | Reason                                                                                   |
| ----------------------------------------------- | ------------------------------------------ | --------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| Original ZIP bytes and metadata                 | Return byte-for-byte                       | Repackage                                                                   | Any changed part invalidates archive-level exactness.                                    |
| word/document.xml and its unknown inline XML    | Reuse                                      | Rewrite whole part                                                          | No stable Word-block-to-Plate provenance exists.                                         |
| Main-document relationships                     | Reuse                                      | Regenerate; merge only remapped header/footer edges                         | Old IDs may be stale or unreachable.                                                     |
| Single-section headers/footers                  | Reuse                                      | Preserve closed safe subgraphs                                              | Their source identity is independent of Plate body edits and references can be remapped. |
| Multiple-section headers/footers                | Reuse                                      | Omit                                                                        | Plate cannot map section boundaries or per-section ownership.                            |
| Body images, drawings, fields, controls, notes  | Reuse                                      | Regenerate if modeled; otherwise omit                                       | Their references live in invalidated body XML.                                           |
| Root relationship subgraphs                     | Reuse                                      | Preserve only closed, reachable, nonconflicting, non-active internal graphs | Package-level provenance is complete.                                                    |
| Orphan/unreferenced entries                     | Reuse                                      | Omit                                                                        | Bytes without a reachable owner do not satisfy functional preservation.                  |
| Comments                                        | Reuse when not overridden or exactly equal | Use supplied current comments; otherwise omit source comments               | Imported ranges are stale after arbitrary edits.                                         |
| Authored private envelope                       | Reuse                                      | Regenerate only for review projection                                       | It corresponds to the captured semantic document, not source bytes.                      |
| Digital signatures                              | Reuse only in exact source                 | Omit                                                                        | Any repack invalidates the signature claim.                                              |
| Macros, ActiveX, OLE, controls                  | Reuse only in exact source                 | Omit                                                                        | Regenerated package must not silently carry active content.                              |
| External relationships                          | Reuse only in exact source                 | Omit containing candidate subgraph                                          | Regeneration must not introduce an unreviewed external edge.                             |
| Page size, margins, orientation, title          | Reuse when no override                     | Apply explicit current option and repackage                                 | Caller intent outranks retained source metadata.                                         |
| Renderer descriptors, wrapper, stylesheet, font | Bypassed                                   | Configure regenerated content                                               | They cannot rewrite an exact retained source without semantic generation.                |

## Decision ledger

| Surface                   | Current                                                            | Target                                                                                    | Owner                                          | Reason                                                                               | Adoption                                                                             | Proof                                                                 | Risk                                   | Verdict                      |
| ------------------------- | ------------------------------------------------------------------ | ----------------------------------------------------------------------------------------- | ---------------------------------------------- | ------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------ | --------------------------------------------------------------------- | -------------------------------------- | ---------------------------- |
| Default conversion        | Import discards source; export creates a new semantic package      | Same behavior when retention/source are absent                                            | Plate DOCX import/export                       | Existing API is honest, bounded, and adopted                                         | No caller change                                                                     | Existing focused, integration, browser, and benchmark suites          | Accidental retention on default path   | keep                         |
| Import opt-in             | No retention option                                                | Generic retainSource option                                                               | importDocx                                     | One lifetime decision does not earn another function or enum                         | Add generic option and conditional result                                            | Strict type contract plus runtime result tests                        | Generic inference regression           | add                          |
| Public artifact           | No source object                                                   | Opaque DocxSource with only dispose                                                       | DOCX import subpath and private internal state | Memory lifetime and source identity are real public jobs                             | Export from import barrel; consume in export options                                 | Constructor/type tests, idempotent disposal, forged/released handling | New noun outliving editor              | add                          |
| Compressed bytes          | Package reader creates a Blob then drops it                        | Reuse the same admitted immutable Blob; retain no expanded entries                        | Package reader/private source owner            | Double-copy prototype failed pathological budget                                     | Return private admitted Blob to source creation                                      | Four-cohort bytes/RSS/latency receipt                                 | Expanded map accidentally retained     | constrain                    |
| Semantic baseline         | Import result remains mutable at runtime                           | Private deep clone and freeze                                                             | Private source owner                           | Exactness cannot trust caller mutation                                               | Clone only on opted-in success                                                       | Mutation test and DocumentChange checks                               | Clone cost                             | add                          |
| Schema binding            | Native envelope has correspondence; source has none                | Store and compare complete schema identity                                                | Existing schema identity plus source owner     | Reusing package facts under different codecs is unsafe                               | No new schema primitive                                                              | same/different derived and named-schema tests                         | Derived identity drift                 | add                          |
| Exact reuse               | Every export regenerates                                           | Return admitted Blob on exact eligibility                                                 | exportToDocx source lane                       | Strongest fidelity and cheapest operation                                            | Early source check after synchronous capture                                         | byte equality, no generation/reopen work, blocker matrix              | Renderer precedence misunderstood      | add                          |
| Edited body               | Whole body regenerated and source XML lost                         | Continue whole-body regeneration after any semantic change                                | Existing semantic exporter                     | Paragraph surgery lacks safe mapping and relationship ownership                      | Emit explicit invalidation diagnostics                                               | old body sentinel absent; semantic/review reopen pass                 | Users expect more body fidelity        | constrain                    |
| Package preservation      | No source graph                                                    | Overlay only safe closed source graphs                                                    | Private OPC preservation owner                 | Whole-part fidelity needs reachability, collisions, types, and active-content policy | New private graph helper under export                                                | part inventory oracle and malformed/conflict fixtures                 | Relationship corruption                | add                          |
| Headers/footers           | Inspected but omitted                                              | Preserve one-section header/footer subgraphs with ID remap                                | DOCX package overlay                           | High-value unrelated content has a provable package owner                            | Patch generated final section refs and required flags                                | text/image header/footer edit roundtrip and LibreOffice               | Multiple sections/external links       | add with strict gate         |
| Comments                  | Imported facts returned; export accepts current facts              | Exact source keeps unoverridden baseline; regenerated path requires current comments      | DOCX boundary; app remains storage owner       | Stale external ranges cannot be guessed after edits                                  | No generic comment mapping                                                           | no-op, override, edited omission, supplied-current fixtures           | Conditional omission semantics         | constrain and document       |
| Diagnostics               | Existing shared loss/failure union                                 | Add source unavailable/rewritten/part-omitted warnings                                    | docx/internal/types.ts                         | Fallback must be observable without a second report                                  | All source paths emit bounded reasons                                                | exhaustive type/runtime tests and UI warning behavior                 | Warning flood                          | add with bounded aggregation |
| App lifetime              | Toolbars discard source state                                      | DOCX demo provider owns one source and releases prior/unmounted sources                   | Registry DOCX demo                             | Editor/plugin state must not own file bytes                                          | Provider wraps import/export controls; successful non-DOCX replacement clears source | lifecycle and browser workflow tests                                  | Stale source after outside replacement | explicit app responsibility  |
| Public subpaths           | Separate import/export/paste entrypoints                           | Keep all three; no source entrypoint                                                      | Package exports/barrels                        | Source has no independent job                                                        | Generated barrels only                                                               | packed NodeNext/Bundler/SSR/tree-shake/export parity checks           | Cross-entrypoint runtime identity      | build proof                  |
| Paragraph provenance      | Revision markers exist, no general source mapping                  | No paragraph patching in this packet                                                      | Future DOCX research/Task owner                | Safe splicing also needs generated relation/style/numbering remap                    | None                                                                                 | Reopen after a mapping prototype beats whole-part fallback            | Coarse loss remains                    | cut                          |
| OOXML/session model       | No public native editor                                            | No OOXML tree or DocxSession                                                              | None                                           | Would duplicate Plate model, commands, persistence, and feature owners               | None                                                                                 | Existing OSS comparison and hard-cut review                           | Fidelity ceiling                       | reject                       |
| Persistence/collaboration | No source persistence                                              | Keep source process-local and app-owned                                                   | Application boundary                           | Bytes do not belong in model, Yjs, history, or generic storage                       | Docs explain reimport after reload                                                   | JSON/model/Yjs source-absence tests/searches                          | App loses source after reload          | explicit limit               |
| Performance               | Import retains no source and export generates                      | One baseline clone, zero compressed copies, bounded retention, document-diff exact export | Benchmark and DOCX owners                      | Source can approach 32 MiB per open artifact                                         | Promote probe to production harness                                                  | Frozen four-cohort rerun plus overlay counters                        | Many open sources                      | explicit disposal/docs       |
| Feature packages          | DOCX uses configured serializers and diagnoses unsupported content | Same                                                                                      | Math, emoji, media, table, custom-node owners  | Preservation must not merge independent feature redesigns                            | No feature package mutation                                                          | Existing serializer tests plus DOCX diagnostics                       | Scope creep                            | keep separate                |

## Execution slices

| Slice                                | Owner                                       | Scope                                                                                                                                                                                                                    | Entry                                             | Exit                                                                                                                                  | Proof                                                                                               |
| ------------------------------------ | ------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| 1. Type and lifetime contract        | Plate DOCX import/internal                  | Add generic options/results, DocxSource, admitted Blob handoff, frozen baseline/comments/schema/limits, idempotent disposal, and source diagnostics; default path allocates no source                                    | Accepted public shape and passing prototype       | Literal/dynamic inference, runtime source only on success, no expanded entries retained, disposed/forged sources handled              | Import unit tests, public type contracts, partition typecheck, retained-byte counters               |
| 2. Exact review lane                 | Plate DOCX export                           | Capture once, resolve source synchronously, compare schema/document/comments/options/projection, return exact Blob or structured semantic fallback                                                                       | Slice 1 source reader                             | Byte-identical no-op; every blocker has one reason; no renderer, package generation, or ZIP reopen on exact path                      | Export unit tests with spies, abort tests, semantic/review reopen, exact benchmark                  |
| 3. Edited package overlay            | Private DOCX OPC owner                      | Build relationship graph, owned/denied classifiers, content-type merge, root closed-subgraph copy, one-section header/footer remap, final bounded reread, and omission diagnostics                                       | Current semantic generated Blob plus valid source | Generated body remains authoritative; safe header/footer/root resources survive; active/conflicting/external/unreachable parts do not | Synthetic package matrix, changed-entry allowlist, sentinel tests, malformed/failure tests          |
| 4. First-party adoption              | Registry DOCX demo/toolbars                 | Add app-local provider; request source on Word import; dispose previous source after successful HTML/Markdown/Word replacement and on unmount; pass source and review projection on Word export; surface source warnings | Slices 1–3 public API                             | Import-edit-export preserves safe units in actual UI without editor/plugin source state                                               | React lifecycle tests, registry demo test, Chromium file workflow                                   |
| 5. Public/package/doctrine closure   | Plate docs/package owners                   | Update latest-state reference, support/invalidation tables, comments and renderer precedence, disposal example, JSDoc, barrels/API, changeset, and smallest Plate Next doctrine version                                  | Settled production API                            | No stale blanket-loss claim or false arbitrary fidelity claim; packages stay lazy and direction-safe                                  | Text/link checks, barrels, API/registry generation, changeset, packed packages, doctrine validation |
| 6. Final proof and decision adoption | Verify Plate/Benchmark/DOCX decision owners | Promote prototype to production path; add overlay counters; run focused/package/browser/LibreOffice/performance gates; update decision/review ledger only to verified claims                                             | Slices 1–5 green                                  | Every frozen budget and fidelity oracle passes; failures repair owner or reopen exact-only fallback                                   | Commands below, content-free receipt, source hashes, final completeness check                       |

Slice 3 remains one verifiable unit because graph classification, relationship
ID remap, content-type merge, and final reachability are one atomic package
claim. If its strict exit fails under the blocked condition, remove edited
preservation from the release and keep only Slice 2; do not weaken the graph
rules.

## Proof matrix

| Claim                                 | Planning evidence                                                                 | Execution proof                                                                                                    | Status                     |
| ------------------------------------- | --------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ | -------------------------- |
| Default path retains no bytes         | Current import drops bounded entries/source                                       | Allocation/source-construction spy on default import; current benchmark unchanged                                  | pass (Slice 1)        |
| Typed opt-in is exact                 | Strict isolated TypeScript prototype passed expected errors and dynamic narrowing | Public type contract with literal/default/dynamic/constructor cases                                                | pass (Slice 1)        |
| Retained memory is bounded            | Prototype stores Blob reference plus frozen baseline/comments, not expanded map   | Production byte counters, GC-assisted RSS budget, dispose-to-zero checks                                           | pass (Slices 1 and 6) |
| Exact no-op preserves every byte      | Prototype output equals fixture input for all cohorts                             | Public API byte equality, unchanged package hash, no generation/reopen spies                                       | pass (Slice 2)        |
| Exactness never masks edits           | DocumentChange is the current canonical comparison                                | Text/property/structure/root/authored/comment/projection/layout blocker matrix                                     | pass (Slice 2)        |
| Body edits cannot reuse stale XML     | Whole main document is selected invalidation unit                                 | Unique old XML sentinel absent; semantic/review reopen equals current editor                                       | pass (Slice 3)        |
| Headers/footers remain functional     | OPC design remaps only closed one-section refs                                    | Header/footer text and image parts open after body edit; targets resolve; LibreOffice resave                       | pass (Slices 3 and 6) |
| Opaque root graphs remain reachable   | Root-only closed-subgraph rule                                                    | Every copied part reachable from root rels; every edge resolves; payload bytes unchanged                           | pass (Slice 3)        |
| Unsafe package claims are removed     | Explicit deny/external/conflict matrix                                            | Signature, macro, ActiveX/OLE, external-rel, type-conflict fixtures produce omissions                              | pass (Slice 3)        |
| Comments do not become stale silently | Exact-only baseline default; generated output requires current comments           | no-op baseline, explicit empty override, changed document without comments, changed document with current comments | pass (Slices 2–3)     |
| First-party UI owns lifetime          | Explicit provider design                                                          | previous-source, failed-import, non-DOCX replacement, unmount, and repeated-export lifecycle tests                 | pass (Slice 4)        |
| Lazy package boundaries hold          | No new public source entrypoint or dependency                                     | packed NodeNext/Bundler/Node/SSR/tree-shake/export parity/package-direction checks                                 | pass (Slice 5)        |
| Final runtime stays within budget     | Passing prototype receipt                                                         | Same cohorts/formulas on final API plus edited overlay counters                                                    | pass (Slice 6)        |
| Native package remains readable       | Existing LibreOffice proof method                                                 | Exact and edited accepted/proposed/review outputs open/resave and validate                                         | pass (Slice 6)        |
| Claims remain narrow                  | Final OSS review and invalidation matrix                                          | Current docs/decision ledger state exact, partial, omitted, and uncertified dimensions                             | pass (Slices 5–6)     |

## Scale contract

- applicability and source evidence: applies. DocxSource retains up to the
  admitted 32 MiB compressed input plus a private semantic/comment baseline;
  package overlay visits up to 1,024 entries and 4,096 relationships; exact
  reuse diffs the complete captured document.
- user operation, current owner, proposed owner: Word import and unchanged
  review export. Current public importDocx plus exportToDocx is baseline;
  proposed owner adds private source creation and exact resolution while
  leaving semantic conversion unchanged.
- independent scale variables and cohorts: normal 4 paragraphs/4 revisions/no
  payload with 8 root parts; large 24/16/1 MiB/64 parts; stress
  96/48/8 MiB/256 parts; pathological 256/96/24 MiB/900 parts. Final
  edited-overlay harness additionally records package entries, relationships,
  preserved parts/bytes, rewritten parts, omitted parts, graph edges, and
  maximum candidate-subgraph depth.
- frozen absolute/relative budget and noise rule: retained import warm p95 is at
  most 130% of matched baseline plus 5 ms; cold is at most 150% plus 10 ms;
  deterministic retention is exactly compressed input plus frozen baseline and
  comment JSON bytes; target maximum RSS delta is matched baseline maximum plus
  twice compressed input plus 16 MiB noise; exact export p95 is at most the
  lower of 50 ms and 50% of matched semantic-export p95. Edited overlay p95 is
  at most matched semantic-export p95 plus 75 ms plus 100 ms per MiB of source
  input. Its RSS delta is at most matched semantic-export maximum plus three
  times compressed input plus 64 MiB noise. It performs one source read, one
  generated-package read, one final package generation, and linear graph visits
  in entries plus relationships.
- production command and source identity:
  `bun test benchmarks/editor/benchmarks/plate-docx-retained-source-benchmark.test.ts`;
  the JSON receipt embeds SHA-256 for current import/package/export,
  DocumentChange, source preservation, and benchmark sources on Bun 1.3.12,
  darwin arm64.
- production artifact:
  `benchmarks/editor/benchmarks/results/plate-docx-retained-source-latest.json`;
  it records the frozen budgets, measurements, deterministic work, and source
  identities from the passing run.
- deterministic work indicators plus timing result: retained import adds one
  baseline clone and zero compressed copies, ZIP loads, Mammoth conversions, or
  package generations. Baseline/target import p95 is 23.57/30.23,
  56.44/59.98, 312.84/301.15, and 951.52/943.40 ms.
  Exact/semantic export p95 is 0.47/12.76, 0.54/18.60, 0.96/61.04, and
  1.77/120.07 ms. Overlay p95 is 19.92, 60.55, 320.49, and 982.70 ms while
  preserving 8, 64, 256, and 900 root relationships and 0, 1, 8, and 24 MiB
  payloads. Retained bytes are 29,031; 1,113,300; 8,563,527; and 25,607,055.
- correctness/native guard: accepted/proposed paragraph text and source-ordered
  revision IDs match; exact output bytes match source; disposal is idempotent
  and rejects later exact access. Relationship resolution, source-part denial,
  semantic/review reopen, browser, and LibreOffice guards all pass.
- final production-path rerun:
  `bun test benchmarks/editor/benchmarks/plate-docx-retained-source-benchmark.test.ts`
  runs the public import/export APIs with the frozen cohorts and budgets. The
  final run passed 506 assertions in 56.72 seconds.

## Conditional evidence

- High-risk scenarios: applies. Source packages are untrusted, memory-bearing,
  may contain active/external content, and can become corrupt when
  relationships or content types are copied incorrectly. Slice 3 owns strict
  admission reuse, active-content denial, graph closure, collision failure,
  final reread, and native reopen.
- External research: complete and current for this decision in
  docs/plite/research/2026-09-15-docx-post-implementation-oss/README.md and
  its retained-source shard: 14 repositories screened, 8 pinned repositories
  deep-read, 70 GitHub hits screened, and 8 issue/PR bodies deep-read.
  OpenDoc, Scriptor, Folio, EigenPal, docx-cli, docx-redline-js, Open XML SDK,
  and python-docx establish source identity, invalidation, reachability, and
  OOXML-model tradeoffs.
- Issue/PR provenance: the research packet records EigenPal no-op loss and
  repeated-header growth, Folio opaque-part/formatting/comment-state repairs,
  and OpenDoc signature/orphan warnings. They motivate proof and do not supply
  copied code or implementation authority.
- Docs/registry/browser/release/behavior-law owners: applies. Slice 4 owns
  registry/browser adoption; Slice 5 owns current docs, generated registry/API,
  barrels, changeset, packed packages, and one Plate Next doctrine version;
  Slice 6 adopts only verified claims in the documents decision/review ledger.
- Performance pack, pre-acceptance receipt, and final rerun: pass. The
  production harness exercises retained import, exact export, edited overlay,
  schema mismatch, disposal, graph closure, and semantic reopen.

## Findings

- The current package reader already creates the immutable object retention
  needs. Returning that admitted Blob privately is simpler and materially
  faster than copying input bytes again.
- Import results are readonly in TypeScript but the returned document array is
  not frozen at runtime. A source must own a private deep clone/freeze;
  retaining the public result reference would let caller mutation falsify
  exactness.
- The generic conditional result is better than overloads here. It preserves
  exact literal inference and gives runtime booleans an honest union narrowed
  by source presence.
- Exact unchanged reuse is cheap enough to be first-class: 0.47–1.77 ms p95 in
  production versus 12.76–120.07 ms semantic export.
- Retaining expanded entries is unnecessary. The compressed source can be
  reopened only for edited export, while exact export never opens the ZIP.
- The source relationship graph, not a ZIP entry map, decides whether copied
  parts remain functional. Copying orphan parts would create impressive diffs
  and poor preservation.
- DocumentChange can prove unchanged semantic state, but it cannot prove that
  an arbitrary detached replacement descended from the imported baseline.
  Explicit source pairing is caller intent; safe fallback invalidates body XML
  wholesale.
- Imported comment ranges are external records. They can be kept in an
  unchanged source package, but cannot be guessed after body edits without a
  current app-owned comment set or separate range relocation.
- The first-party DOCX demo makes retention a real product job, but the source
  reference belongs in a small app provider around import/export controls.
  Putting it in a Plate plugin would hide disposal and persistence.

## Decisions and tradeoffs

- Choose a public lifetime object because retained bytes can be tens of
  megabytes and need deterministic release. A branded Blob or optional result
  field would hide validity and disposal.
- Choose retainSource true because import has one binary lifetime decision.
  Export behavior is deterministic from correspondence; a public
  preserve-when-safe mode would duplicate the presence of source.
- Let schema mismatch or disposal fall back to semantic export with warnings.
  Export can still fulfill its primary job; preservation failure stays visible.
- Make source authoritative over renderer configuration on exact no-op. Static
  renderer options configure generated content and cannot restyle an untouched
  source without ending byte exactness. Explicit package metadata/page options
  force regeneration.
- Preserve one-section headers/footers because their relationship closure and
  reference remap can be proved. Reject multi-section preservation until Plate
  owns section semantics or an independent mapping artifact.
- Do not keep orphan bytes. Preservation means reachable behavior and explicit
  package ownership, not merely payload survival.
- Do not add paragraph provenance speculatively. Reopen it only with a matched
  prototype that maps source blocks and remaps generated relationships,
  styles, numbering, comments, revisions, and resources under structural edits.

## Review fixes

- Replaced the research packet's provisional retention mode spelling with one
  typed retainSource opt-in and source-presence-driven export.
- Rejected an optional source on every successful import result because it
  lies to default callers and weakens inference.
- Rejected a second import operation because conversion semantics and failures
  are identical; only artifact lifetime changes.
- Rejected a public DocxSession, create, or map facade because no native
  editing command model is introduced.
- Corrected the first target prototype after the pathological cohort proved
  that a second compressed-byte copy exceeded the frozen import budget.
- Cut paragraph XML surgery and broad unknown-part copying from the target.
  Both need provenance and reachability current source cannot prove.
- Narrowed comment preservation so imported ranges never silently address an
  edited document.
- Made active content, external relationships, signatures, collisions,
  multi-section state, and orphan parts explicit invalidation cases.

Error attempts:

| Error / failed attempt                                                                                 | Count | Next different move                                       | Resolution                                                                                         |
| ------------------------------------------------------------------------------------------------------ | ----: | --------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| Isolated type prototype hit TypeScript TS5112 because a root config exists while a file was passed     |     1 | Add ignoreConfig to isolated strict compile               | Final conditional type contract passed with every expected error consumed.                         |
| Direct Bun script lacked test DOM preload                                                              |     1 | Run probe through bun test                                | Runtime freeze inspection completed; public document array was not frozen.                         |
| Freeze probe assumed tiny generated import had a first node                                            |     1 | Guard inspection and use revision fixture for correctness | Confirmed mutable array; benchmark fixtures prove full document behavior.                          |
| First benchmark correctness read authored content without authored runtime                             |     1 | Match adopted benchmark's authored editor/view setup      | Accepted/proposed text and revision IDs passed.                                                    |
| Exact benchmark editor lacked authored plugin used by review metadata                                  |     1 | Use same schema on import and export                      | Schema-bound exact path and semantic export passed.                                                |
| First prototype copied the compressed 24 MiB source and reached 523.06 ms p95 against 441.60 ms budget |     1 | Reuse package reader's immutable admitted Blob            | Final pathological import p95 is 993.03 ms against its matched budget; no compressed copy remains. |

Verification evidence:

- Isolated strict TypeScript compile with TypeScript ignoreConfig passed.
  Default/false source access and public construction fail as expected; literal
  true and dynamic narrowing pass.
- `bun test benchmarks/editor/benchmarks/plate-docx-retained-source-benchmark.test.ts`:
  1 test, 506 assertions, four cohorts, 56.72 seconds, passed. Production code
  copied and resolved 8–900 root subgraph parts and semantically reimported the
  overlaid packages.
- Receipt:
  benchmarks/editor/benchmarks/results/plate-docx-retained-source-latest.json.
  It contains frozen budgets, cold/warm percentiles, event-loop delay,
  heap/RSS deltas, source bytes, semantic baseline bytes, deterministic work,
  environment, and SHA-256 source identities.
- Current API/package/UI/docs and final OSS review records were read from the
  paths named above. No external implementation was copied.
- Final implementation proof includes 146 focused DOCX package tests, public
  type contracts, all affected entrypoint lints/typechecks, package build, six
  package-integration tests, registry generation/source parity, website
  typecheck, packed release consumers, two Chromium tests, and LibreOffice
  render/re-save/reimport proof. The native receipt is in
  `.tmp/docx-retained-source-proof/receipt.json`.

Implementation verification commands:

```bash
pnpm --filter platejs test:partition:docx-import
pnpm --filter platejs test:partition:docx-export
pnpm --filter platejs test:partition:docx-paste
pnpm --filter platejs test:partition:docx-html
pnpm --filter platejs typecheck:contracts
pnpm --filter platejs typecheck:partition:react
pnpm --filter platejs build

bun test ./apps/www/src/__tests__/package-integration/docx.roundtrip.slow.tsx
bun test apps/www/src/registry/examples/docx-demo.spec.tsx
bun test benchmarks/editor/benchmarks/plate-docx-retained-source-benchmark.test.ts

pnpm --filter www test:www-browser:chromium docx.spec.ts
pnpm --filter www typecheck
pnpm --filter www build:registry
pnpm brl
pnpm changeset status
node .agents/rules/plate-next/scripts/version.mjs validate
pnpm plite:release:packages
```

LibreOffice proof generates exact no-op and edited source-aware review DOCX
artifacts in the ignored task artifact directory, runs the workspace soffice
headless conversion flow, validates every re-saved ZIP, and reimports the files
through public importDocx. This certifies LibreOffice readability only;
Microsoft Word remains unclaimed.

## Final implementation handoff

- Ownership and target API: Plate DOCX import creates one optional DocxSource;
  the app owns its reference/lifetime; export consumes it; Plite keeps canonical
  document, change, and schema identity ownership.
- Public additions: generic DocxImportOptions and DocxImportResult, one opaque
  DocxSource.dispose, optional DocxExportOptions.source, and three source
  warning diagnostics. Existing no-source calls remain unchanged.
- Runtime/package behavior: exact unchanged review returns original bytes;
  edited export regenerates the body and overlays only safe closed source
  graphs, with one-section header/footer support and strict active, external,
  conflict, section, and reachability cuts.
- App/docs behavior: an explicit DOCX demo provider retains/releases the source;
  public docs teach lifetime, exact eligibility, renderer precedence, comments,
  preservation granularity, and unsupported cases without migration prose.
- Scale proof: production code passes all four frozen cohorts with no
  compressed copy, bounded retained bytes, 0.47–1.77 ms exact export p95, and
  explicit graph counters.
- Main risks: relationship/content-type corruption, source/comment pairing,
  multi-section expectations, active-content carryover, cross-entrypoint class
  identity, and concurrent retained memory. Each has a direct exit in Slices
  1–6.
- Execution: type/lifetime owner, exact lane, edited OPC overlay, first-party
  adoption, docs/package/doctrine closure, production proof, and decision-ledger
  adoption are complete.
- User attention: the material limitation is deliberate—any body edit discards
  original body XML. Finer paragraph preservation remains a later independent
  design only after a relationship-aware provenance prototype passes.
- Publication: no commit, push, PR, release, or external publication is part of
  this plan.

Timeline:

- 2026-09-15: Created deep Plate Plan from the final retained-source Best API
  Review and completed OSS research packet.
- 2026-09-15: Reconciled current semantic converter, package reader,
  diagnostics, DocumentChange, schema identity, registry UI, docs, tests, and
  package boundaries.
- 2026-09-15: Selected the generic opt-in, opaque disposable source, exact
  review reuse, and coarse whole-body invalidation target.
- 2026-09-15: Ran strict type proof and four-cohort performance probe; rejected
  compressed-byte copying and corrected the owner to reuse the admitted Blob.
- 2026-09-15: Prepared six implementation slices, complete invalidation and
  proof matrices, final runtime budgets, and handoff.
- 2026-09-15: Implemented all six slices, promoted the benchmark to public
  production APIs, and passed focused, package, registry, browser, native-office,
  performance, and doctrine proof.
- 2026-09-15: Adopted the retained-source target in the documents decision and
  immutable review ledger without widening the separate feature owners.

Reboot status:

| Question             | Answer                                                                                                                           |
| -------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| Where am I?          | Implementation and proof complete; no publication was requested.                                                                  |
| Where am I going?    | No further retained-source work is required for this target.                                                                      |
| What is the goal?    | Explicit bounded DOCX source retention with exact no-op and safe coarse package preservation.                                    |
| What have I learned? | Reuse admitted Blob, clone semantic baseline, invalidate body wholesale, and prove reachability rather than copying ZIP entries. |
| What have I done?    | Implemented all six slices and passed type, package, browser, LibreOffice, performance, doctrine, and ledger gates.              |

Open risks:

- Paragraph/run formatting, body images, fields, notes, and unknown body XML
  still disappear after any body edit. This is the honest cost of refusing an
  unproved surgical exporter.
- Multiple-section header/footer preservation is omitted until section
  semantics have a canonical owner.
- An explicit source argument is caller pairing intent; detached document
  ancestry cannot be authenticated without putting format identity into the
  document, which this design rejects.
- Many simultaneously retained sources can consume roughly 32 MiB each plus
  semantic baselines. Explicit disposal and app lifecycle proof are required;
  no global cache or eviction policy is introduced.
- Native Microsoft Word behavior is not certified. Browser, package,
  semantic/review reimport, and LibreOffice evidence define the shipped claim.
