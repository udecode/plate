---
title: Complete immutable document conversion
type: architecture-plan
status: complete
runtime_readiness: ready
date: 2026-09-16
review_scope: persistence
review: ../research/review-records/2026-09-16-persistence-source-closure.json
---

# Complete immutable document conversion

Status: Implemented and verified. The detached converter, authored footprint
codec v6, current-document admission, CLI and application callers, hard cuts,
public teaching and doctrine are adopted. The production benchmark passes every
frozen cohort and the two previously noisy cohorts repeat within the 15% rule.
No publication was requested or performed.

**Make migration an explicit conversion at the storage boundary.** Bind the
configured target once in `defineDocumentMigrations`, return a saveable envelope
from `migrateDocument`, and load that envelope through the ordinary current-value
editor API. Delete automatic editor migration, the generic `prepareDocument`
hook, and hidden selection mapping. Keep the compiler's JSON artifact contract.

The last pass found a concrete v54 defect beyond the earlier review: an inserted
suggestion inside a legacy code line keeps its text but loses pending authored
metadata. This design must repair historical meaning before changing ownership.

Objective:

Turn the [final persistence review](../research/decisions/persistence-ownership.md)
into one source-backed public contract and adoption plan. A successful conversion
must produce a complete current saved envelope, preserve supported document data
and selection, isolate caller input, and need no live editor to finish its work.

Completion threshold:

Met for all four persistence ledger units. Source, target, selection and metadata
contracts have canonical owners; runtime, CLI, demo, docs and generated callers
use them; the complete production operation passes the frozen comparison.

Verification surface:

Existing migration, codec, schema, history and CLI suites; production package
types and exports; generated API, docs and registry artifacts; a managed Chromium
save/reopen interaction; and the frozen full-operation benchmark contract.
Planning probes remain historical design evidence. Current claims use the
production receipts and checks recorded below.

Constraints:

Keep application lineage, feature codec versions and local history independent.
Preserve complete roots, unknown JSON metadata, pending authored review state,
and external comment associations. Keep the existing v54 target. Ordinary editor
setup needs neither migration configuration nor generated application types.
No hidden editor or public persistence manager. No compatibility aliases.
Preserve [direct authored checkpoint authority](../vision/plite.md): current
admission does not reduce operation history, replay pending edits, or hydrate
retained bodies. Historical conversion and diagnostic test oracles have different
cost obligations from opening a current checkpoint.

Boundaries:

This task implements the accepted target across Plite, Plate, the CLI, app,
public docs, generated artifacts, doctrine and changesets. Prior immutable review
records remain intact. Ignored planning artifacts retain benchmark executables
and receipts; the plan records their command, result and digest.

Blocked condition:

None for the persistence scope. Two unrelated missing helpers in the comment
browser test stop the aggregate www TypeScript gate after all generated/docs
checks pass; they do not affect persistence source or its focused browser proof.

Work Checklist:

- [x] Reconcile the final persistence review and all four ledger units.
- [x] Map runtime, CLI, docs, demo and neutral document owners.
- [x] Specify the smallest public API and exact conversion semantics.
- [x] Run bounded current-owner and type-model probes and record their limits.
- [x] Specify adoption, failures, performance budgets and execution acceptance.
- [x] Reconcile both independent findings and record the readiness verdict.
- [x] Implement codec v6 and detached schema, document, selection and field owners.
- [x] Adopt the public converter in runtime callers, CLI, demo and teaching.
- [x] Delete automatic editor migration, generic preparation, hidden mapping,
      duplicate exports and public historical catalogs.
- [x] Pass focused behavior, type, package, browser and production cost proof.
- [x] Reconcile the decision and immutable review ledger with implementation.

## Evidence that changed the design

The [ownership probe](artifacts/2026-09-16-persistence-design/ownership-probe.test.ts)
and [source-hashed receipt](artifacts/2026-09-16-persistence-design/ownership-probe.json)
pass five focused checks:

1. `compileEditor` returns JSON facts, with no executable fitter. Its existing
   [contract test](../../packages/platejs/src/compiler/compileEditor.test.ts)
   additionally checks deep freezing, no symbols, no activation/default
   generation, and cleanup. A hidden capability keyed by artifact identity would
   make a JSON-equivalent copy behave differently. Do not introduce that.
2. Bypassing only ElementId's preparation still generates absent IDs, but accepts
   empty strings, duplicates and generator collisions at initialization. Numeric
   IDs fail. Existing transaction corrections do not close that admission gap.
3. A v53 code-line insertion becomes ordinary text without authored metadata.
   [Code-block shaping](../../packages/platejs/src/migrations/migratePlateV54CodeBlocks.internal.ts)
   flattens nodes through `NodeApi.string`; the subsequent suggestion scan no
   longer sees their markers. Passing existing suggestion tests did not prove
   this combination.
4. Existing `snapshotEditorJsonValue` already detaches and deeply freezes JSON,
   and rejects non-JSON output. Reuse it instead of another cloning protocol.
5. The receipt records the exact inspected implementation hashes. It is not a
   candidate-conversion or performance receipt.

Two independent source reviews covered v54/IDs and caller/codec adoption. Their
findings were reconciled with the probes above. The first also found
[`createAuthoredReviewDocument`](../../packages/plitejs/src/authored/format.ts)
constructs two editors and view transactions internally. Extracting only the
outer runner or fitter cannot establish editor-free conversion.

The final challenge's [authored admission probe](artifacts/2026-09-16-persistence-design/authored-admission-probe.test.ts)
and [receipt](artifacts/2026-09-16-persistence-design/authored-admission-probe.json)
add four passing checks, including receipt generation. They reproduce three
distinct cases: a valid codec round trip with a mismatched document checkpoint,
duplicate IDs admitted only in the proposed projection, and loss of one native
pending revision when v54 processes a stale `suggestion: false` marker. These
cases are included explicitly below; the code-line fixture does not cover them.

## Public contract

Implemented API:

```ts
import { createEditor } from "platejs";
import {
  defineDocumentMigrations,
  migrateDocument,
  migrateV54,
} from "platejs/migrations";

export const EditorMigrations = defineDocumentMigrations({
  plugins: EditorKit,
  schema: EditorSchema, // named application lineage, here version 54
  sourceFingerprints: { 53: KnownV53Fingerprint },
  steps: { 54: migrateV54 },
});

const { output, applied, source } = migrateDocument(saved, {
  migrations: EditorMigrations,
});

const json = JSON.stringify(output);
const editor = createEditor({
  plugins: EditorKit,
  schema: EditorSchema,
  initialValue: output,
});

// Raw historical input requires intent at this particular load boundary.
const imported = migrateDocument(legacyDocument, {
  migrations: EditorMigrations,
  source: 53,
});

// Ordinary current raw editor input still works without migration machinery.
const ordinaryEditor = createEditor({ initialValue: currentChildren });
```

`defineDocumentMigrations` binds the configured plugin tuple, named schema,
historical fingerprints and steps. Its existing definition object earns reuse:
the CLI already has a multi-file job. Compile once per definition; document work
is allocated per call. No public compiler target, manager, provider, global cache
or dispose lifecycle is added. A changed configuration needs a new definition.
Runtime store mutation does not alter an existing definition's conversion policy.

`migrateDocument` returns a frozen `{ output, applied, source }` result:

- `output` contains exactly `{ document, schema, selection? }`, with the actual
  compiled current identity. It is eagerly materialized JSON and can be saved or
  loaded directly. No report fields go inside the exact persisted envelope.
- `applied` lists ascending destination versions that actually ran. Zero steps
  does not mean zero codec/preparation work or byte-identical input.
- `source` is the validated or explicitly asserted numeric application version.
  The target version is already in `output.schema`; cut the duplicate result
  `target` and bare result `document`/`selection` fields.

Use one uniform step result, including identity steps:

```ts
const migrateV2: DocumentMigration<V1Document, V2Document, 1, 2> = ({
  document,
  target,
}) => ({
  document: convertV1(document, target),
  mapSelection: ({ selection, mappedSelection }) =>
    mapV1Selection(selection, mappedSelection),
});
```

`document` is deeply readonly and detached. `from` and `to` remain available.
`target` contains frozen bindings and the narrow schema operations already used
by migrations: identity, element/property queries, whole-document fitting and
assertion. Bindings expose names and persisted identities, never plugin portals,
stores, updates, mounted views or local state. Keep the target type a projection
of existing schema contracts, not an imitation read-only `Editor`.

`mapSelection` is optional and receives the original concrete selection plus
the default structurally mapped selection. It returns a concrete selection or
`null`. The runner owns invocation and final validation; a mapper never enters
the saved envelope. Cloning the returned document cannot remove the separately
typed mapper. A deliberately returned `null` is final, never a fallback request.

Custom v53 numbering policy is explicit at the format helper:

```ts
steps: {
  54: context => migrateV54(context, { list: LegacyListPolicy }),
}
```

Reuse the current narrow sibling traversal types for this option. The default
is the frozen v53 interpretation, never the current List store. The source
interpretation is separate from current persisted schema identities.

### Type guarantees and limits

Keep contextual callback inference. Inline callbacks receive a readonly document,
typed target and mapping arguments without parameter annotations. Exported
`DocumentMigration<FromDocument, ToDocument, From, To>` declarations retain exact
historical document and version types; the existing adjacent-step compatibility
check must inspect `result.document` instead of the bare return type.

The [structural type probe](artifacts/2026-09-16-persistence-design/type-probe.ts)
passes with inferred callbacks, literal lineage/version, typed output continuity,
and negative checks for input mutation, editor access, wrong adjacent input,
wrong source version and bare-document returns. This proves the callback/result
shape is expressible. It does **not** prove integration with Plate's complete
plugin inference, generated contracts or package declarations.

Do not infer a runtime validation guarantee from the final callback's TypeScript
return annotation. The runner returns the target's validated document type;
ordinary callers retain `EditorDocumentValue`, while existing optional generated
contracts may supply their verified target type. Do not add a freely chosen
`migrateDocument<T>()` cast or pretend an unknown persisted source is typed JSON.

The operation accepts `unknown` at the persistence boundary. Raw-source intent
and envelope/source-option conflicts therefore require runtime checks even when
typed convenience signatures can reject obvious mistakes earlier.

## Conversion law

| Stage                      | Required behavior                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Definition                 | Validate the named target, supported versions and step functions; capture executable schema/codec descriptors independently of a live editor. Compilation may evaluate existing trusted configuration callbacks. It does not activate plugins, initialize a document, retain a store, or promise sandboxed purity.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| Input boundary             | Reject getters, symbols, prototypes, cycles and non-JSON data through the existing JSON owner. Accept exact persisted envelopes, complete raw documents and array shorthand. Read source identity before interpreting historical node shapes.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| Source intent              | Persisted input must match lineage and its registered historical fingerprint, or the exact current identity. Reject derived identity for a named chain, wrong lineage, unknown fingerprints, future versions and current fingerprint drift. Raw input requires `source: number` or `source: 'current'`. Remove `unversioned`; no default source survives across unrelated loads. Reject an explicit source alongside an envelope. CLI applies `--from` only to raw files in a mixed batch.                                                                                                                                                                                                                                                                                                                                |
| Preflight                  | Resolve and validate the entire required chain before the first migration, mapping, generator or codec callback. A missing later step invokes zero earlier callbacks. Definition-time trusted configuration callbacks precede per-input preflight and are not covered by that promise.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| Isolation                  | Snapshot caller JSON once; share already owned immutable subtrees where the JSON owner proves ownership. Read each step-result container through exact data-property checks, snapshot `result.document`, and retain a separately validated `mapSelection` function; the callable container itself is not JSON. Complete this before invoking mapping or the next step. No successful or failed conversion mutates its caller's trees, roots or metadata. External effects from application closures cannot be rolled back.                                                                                                                                                                                                                                                                                                |
| Steps                      | Run exactly source+1 through target. Intermediate documents need valid document JSON and roots, but need not already satisfy the target grammar. Every step returns a complete document; absence of a supported source feature is a declared conversion decision or error, never accidental dropping.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| Selection                  | Preserve absence versus explicit null. Validate source/intermediate geometry and JSON without applying the target's mark vocabulary early. Map concrete text/node selections through every step, ID/shaping stage and fit, retaining direction, root, affinity and insertion marks. Historical insertion marks need the same format conversion as text properties, or an explicit unsupported-data failure. Custom mapper output supersedes the default. Resolve `start`/`end` only after final fitting; a sentinel uses its existing main-root meaning. Deleted anchors use the existing canonical mapping fallback; an unmappable or removed root clears to null. Reject malformed selection instead of silently accepting invalid offsets or unknown kinds. Final selection and marks must satisfy the current target. |
| Current document admission | Reuse one Plite schema fitter/validator and codec owner. Allow canonical defaults and existing declared fitting behavior, but require v54 transforms to account for historical meaning before fitting. Do not promise universal lossless fitting of an unsupported historical schema. Unknown JSON metadata remains intact.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| IDs                        | When ElementId is installed, the compiled property generator owns allocation and applicability. Reuse its pure nonempty/unique validator on each materialized accepted/proposed document, with one uniqueness domain across that projection's primary/named roots. Corresponding elements can share IDs between projections; never combine those domains. Share validation between normal admission and conversion completion. Reject duplicate IDs and generator collisions. Ongoing transaction corrections keep their live responsibility.                                                                                                                                                                                                                                                                             |
| Metadata                   | Decode every supplied known persistent field with its own codec version and eagerly re-encode the current version. Reject known nonpersistent keys, unsupported codec versions, decode/encode errors and non-JSON encoded output. Validate document-dependent native authored checkpoints against the final accepted/proposed content too; a valid field-codec round trip is insufficient. Materialize absent persistent defaults through the existing initial-value owner and encode them once. Do not invoke or persist absent local-only defaults during offline conversion. Preserve unknown JSON fields.                                                                                                                                                                                                             |
| Output                     | Assert the final schema, IDs and selection; materialize all serialized field values before success. Snapshot the exact current envelope and report. Current output reprocessing invokes no historical steps and preserves persisted meaning.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| Load                       | Ordinary initial load and replacement accept current input only. They share current admission laws; no historical source guessing or migration context exists inside the editor. A converted output remains stable through JSON serialization and reopen under the same configured target. Local history, local defaults and activation remain editor-owned.                                                                                                                                                                                                                                                                                                                                                                                                                                                              |

Default generators and arbitrary codecs can be effectful application functions.
Immutability describes data and supplied authority, not global determinism.
Byte-identical conversion of the same legacy input requires deterministic supplied
generators/codecs. Stable reopening is conditional on the documented codec laws;
prove those laws for built-in owners. Already present IDs and persistent defaults
must not regenerate. Re-encoding cannot establish idempotence for a deliberately
non-idempotent custom codec. The no-retention guarantee covers framework-owned
references; arbitrary application callbacks can retain their inputs.

## Required owner extractions

### Neutral document and authored owners

Extract the immutable document/schema mechanics from
[`createEditorSchema`](../../packages/plitejs/src/core/editor-schema.ts),
[`fitDocumentInput`](../../packages/plitejs/src/core/slice-fit/compiled-slice-fitter.ts),
and [`constructCanonicalDocumentChange`](../../packages/plitejs/src/core/representation.ts).
The runtime adapter keeps live node keys, transaction publication and mutable
registry lookup. The detached operation receives compiled descriptors and
document-local indexes. It must not return current methods that close over a
scratch editor. Default structural selection mapping uses these same neutral
document/change owners.

Extract persisted-field decode/default/encode from
[`public-state.ts`](../../packages/plitejs/src/core/public-state.ts) with an
explicit immutable field table, retaining `value-codec.ts` and `state-field.ts`
as the codec owners. Do not duplicate state-field semantics in Plate.

Extract the review construction already used by
[`authored/format.ts`](../../packages/plitejs/src/authored/format.ts) into the
authored state/change owner. Preserve revision IDs, authors, timestamps, accepted
and proposed projections, checkpoints and validation. Neither new timestamps nor
random generated review IDs may leak into the imported persisted meaning. The
format helper remains the single public import operation; eliminate its internal
editor/view simulation rather than adding a migration-specific authored codec.

Separate private revision construction from admission. The standalone format
helper constructs then admits; migration construction returns the checkpoint to
the converter's mandatory final admission. Both paths share direct current-
checkpoint admission. Opening current state must not reduce retained operations,
replay pending edits, or materialize cold bodies. Validate shape, roots, positions,
identities and shared live-content consistency through the authored owner.
Historical construction may reconstruct once; diagnostic replay can serve as a
test oracle without becoming load authority. Do not add a public admission-bypass
option or cache validation by object identity.

The codec cut has its own required adoption: codec 5 eagerly decodes non-insert
bodies to obtain live property/deletion/boundary facts. Simply skipping that work
loses property indexes. Persist the existing `AuthoredCompactEdit.content`
footprints needed by `indexPropertyWrites` alongside opaque retained bodies in
the next authored codec version (6 at this source revision). Reuse the existing
compact fact types and index owner; do not persist a second derived index.
Older field versions may decode their bodies once while converting to that
format, independently of the application v54 clock. Current v6 admission validates
the footprint structure, identities, targets, dependencies and origin references
without body decoding. Materialization later checks the retained body against
its saved summary. Preserve its association with the canonical owned operation
object; plain `Object.freeze` does not establish the JSON owner's identity.
The nine-fixture footprint probe proves existing index parity when those facts
are present, not the complete new codec or every future decision. Production
must test version conversion, malformed facts, property/deletion/compensation
indexes and continued editing/decisions before removing eager decoding.
The first complete prototype repeated replay and missed the warm budget for
1,000 blocks with ten revisions despite passing the semantic fixtures. Removing
the duplicate pass was insufficient as a design correction: the remaining
current-load replay itself contradicted the direct-checkpoint law. Its measured
results remain diagnostic evidence, not approval of that owner choice.
Likewise, materialize historical selection-mapping snapshots only when the
runner invokes the mapper. Revision projections need their fitted content, not
copies of every intermediate stage for an unused selection path.

Also extract current native authored restoration validation from
[`restoreProjection`](../../packages/plitejs/src/authored/authored.ts). A field
can decode and encode successfully while its checkpoint does not match the
document. Run its content/root/checkpoint and projection validation after final
fitting, including zero-step current input. Reuse this law during normal load.
The immutable compiled admission contract for document-dependent feature checks
belongs to the existing native authored boundary
(`core/authored-runtime.ts` and the authored plugin/compiler owner). Its candidate
must capture a private pure format capability from the installed native authored
contribution, independently of activated runtime/view state. Both normal load and
offline admission invoke the same authored restore/assert operation. Neither a
parallel Plate codec nor a generic transforming hook satisfies it. If v54 needs
to emit native pending review state but the
configured target lacks the authored contribution, fail with that missing
capability rather than claim the target can consume it. Already unknown JSON
metadata still follows the opaque-preservation rule.

### Plate target and v54

Extend the private compilation owner to retain independently frozen executable
descriptors before projecting public JSON facts. Keep `compileEditor`'s public
result unchanged. Existing temporary compilation context may be reused for
nominal configuration resolution, with its callback behavior stated explicitly.
It must be torn down before conversion and never retained by target closures.
Measure compilation separately and inside the cold complete operation.

The target can live privately in the existing migrations definition, which
already contains functions and is not a JSON artifact. Do not expose a second
runtime or give the CLI raw Plite internals. Plite owns neutral mechanisms; Plate
exposes exact facade leaves for actual shared capabilities. A neutral public
migration package has no independent consumer here and is not added.

Reorder the v54 pipeline around historical meaning:

1. Decode suggestion identities, property snapshots and line-break semantics
   from the untouched historical tree. Detect collisions with existing native
   authored metadata and fail ambiguous imports.
2. Shape the source and its accepted/proposed projections with explicit
   source-occurrence correspondence. Transfer meaning before code-line
   flattening, caption lifting, type/property renames or removed wrappers can
   erase its carrier.
3. Materialize shared target element IDs before independently fitting projections.
   Reuse the validation/target traversal in `migrateElementIdsForTarget`, but do
   not claim that helper already provides correspondence: it invokes a
   zero-argument generator for each missing occurrence. The candidate needs a
   private per-conversion allocation map keyed by source root/occurrence, carried
   through shaping. Preserve explicit authored ID changes; only absent IDs on
   proven corresponding occurrences share allocation. Fitting-created defaults
   need explicit construction provenance before they can share allocation;
   independent defaults are not automatically the same logical element. Proving
   this correspondence is a slice-1 obligation, not a routine function move.
4. Fit each projection using the detached schema owner, construct authored
   changes with the authored owner, and return an explicit selection mapper.
5. Complete target admission, field codecs and serialization once through the
   runner. Treat unsupported historical review meaning as an explicit failure.

This is not solved by calling `fitDocument` on the marked legacy document.
Legacy review properties are not canonical target properties. The reproduced
code-line loss is the minimum regression fixture; also cross suggestion metadata
with captions, list numbering, renamed properties and line-break flattening.

## Concept and adoption ledger

Value order is complete document correctness, historical review preservation,
authority/input isolation, then removal of redundant setup. Dependency order is
given in the execution slices below.

| Concept                            | Current owner and conflict                                                          | Target/owner                                                                             | Adoption and proof                                                                                                       | Verdict                                          |
| ---------------------------------- | ----------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------ |
| Saved document, codecs, history    | Plite complete document plus independent feature codecs and history                 | Preserve clocks and whole-document shape; share existing JSON mechanics                  | Reuse codec, state and history contracts                                                                                 | keep                                             |
| Migration definition and operation | Plate runner needed a live editor and returned partial output                       | Bind immutable target in existing definition; return complete current envelope           | CLI, demo, typed steps and docs; isolation/preflight/codec proof                                                         | implemented                                      |
| Automatic editor migration         | `withPlite` owns another source/completion lifecycle                                | Explicit application boundary; editor handles current documents                          | Remove inherited `migrations` option from headless/React/static types, initialization, replacement and tests             | cut                                              |
| Generic preparation                | Registry/pipe hooks exposed mutable context; ElementId was the sole production hook | Schema generation plus shared narrow ElementId admission validation                      | Move generic-hook tests to actual identity/current-admission behavior; preserve named-root and generator-collision cases | cut                                              |
| Selection behavior                 | WeakMap tied to returned document identity                                          | Typed result mapper + neutral default mapping                                            | Multi-step text/node/named-root/null/save-reopen proof                                                                   | implemented; hidden channel cut                  |
| v54 source policy                  | Plugin store and current list policy interpret history                              | Explicit historical list options and frozen target identities                            | Preserve custom IDs/types/properties, lists, captions, tables, code blocks and suggestions                               | rearchitect; adopt with historical corpus checks |
| Authored import                    | `createAuthoredReviewDocument` simulated two editors/views                          | Existing authored engine constructs/imports immutable review state directly              | Accepted/proposed equivalence and exact metadata; revision-scale receipt                                                 | implemented with codec v6 footprints             |
| Compiler artifact                  | Frozen JSON schema and binding facts                                                | Keep public contract; privately retain executable descriptors for definition compilation | Existing compiler/generator tests must pass unchanged in meaning                                                         | keep public JSON contract                        |
| Export surface                     | Root migration exports and migration subpath; public V53 catalogs                   | `platejs/migrations` owns runner/types/v54/extractor; catalogs become private            | Root/subpath type and package smoke, CLI scaffold, barrel generation                                                     | cut duplicates/catalog API                       |
| Legacy comment associations        | Separate external-thread import job                                                 | Keep extractor and app-owned records                                                     | Existing extractor contracts; no new persistence provider                                                                | keep                                             |

Direct `migrateDocument(input, { plugins, schema, migrations })` avoids a public
target but repeats configuration on every call or needs another batch/cache API.
Binding those inputs in the existing definition solves the demonstrated batch
job without a new noun. A public executable `compileEditor` overload is rejected:
artifact generation and executable conversion have different output contracts.
Deleting all migration machinery is also rejected: identity checks, ascending
dispatch, typed selection mapping and CLI parity are repeated current jobs.

## Exact adoption packet

| Surface              | Files and action                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| -------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Runner               | `packages/platejs/src/lib/editor/documentMigrations.ts` and `migrations/documentMigrations.ts`: move canonical public runner/types under migrations; remove root editor barrel export and editor imports.                                                                                                                                                                                                                                                                                             |
| Runtime              | `lib/editor/withPlite.ts`, `react/editor/withPlate.ts`, `react/editor/useCreateEditor.ts`, `static/editor/withStatic.tsx`: remove migration options/integration; keep current envelope validation and ordinary raw/current defaults. Root-bound views still reject whole envelopes before transforms.                                                                                                                                                                                                 |
| Preparation          | `internal/plugin/pipePrepareDocument.ts`, `documentMigrationSelection.internal.ts`, `plateRuntime.ts`, `resolvePlugins.ts`, `isEditOnlyDisabled.ts`; `lib/plugin/BasePlugin.ts`, `PluginDefinition.ts`, `definePlugin.ts`, `basePluginCompiler.internal.ts`; `react/plugin/PlatePlugin.ts`, `react/core.tsx`, `react/index.tsx`: remove hook registry, authoring/inference/edit-only types, exports, pipe and WeakMap; relocate neutral mapping. Remove `pipePrepareDocument` API after caller sweep. |
| Identity             | `lib/plugins/element-id/ElementIdPlugin.ts`: split reusable pure ID helpers from live indexes/corrections; one compiled generator; current load and offline conversion share admission validation.                                                                                                                                                                                                                                                                                                    |
| Format               | `migrations/migratePlateV54*.ts`, `v53-manifest.ts`: explicit target/list policy/result mapping; decode review meaning before destructive shaping; private provenance catalogs.                                                                                                                                                                                                                                                                                                                       |
| CLI                  | `packages/cli/src/run-migration.ts`, `migrate.ts`, `bin.ts`: consume exported `EditorMigrations`, compile it once per evaluated entry, convert each input and serialize `output`; remove per-file editor construction/load/read. Add explicit raw `--from <version\|current>`. Preserve dry-run/check/stdin, all-or-nothing batch writes, cleanup and unchanged file bytes/mtime. Scaffold subpath imports and the new definition shape.                                                              |
| Demo                 | `apps/www/src/registry/examples/document-migration-demo.tsx`: explicit source-53 conversion before editor construction; show save/reopen and zero repeated steps. Keep `/dev/document-migration` as the proof route. Keep migration lineage out of the ordinary kit.                                                                                                                                                                                                                                  |
| Regression consumers | Comment/suggestion persistence demos retain app-owned external thread data and current snapshot reload. They do not acquire migration definitions.                                                                                                                                                                                                                                                                                                                                                    |
| Types/exports        | `core.tsx`, `lib/editor/index.ts`, `migrations/index.ts`, migrations type tests, package entrypoint inventory: cut root duplication, retain nominal/facade boundaries, run barrels and exact public smoke. No raw Plite imports in ordinary Plate callers/tests.                                                                                                                                                                                                                                      |
| Docs                 | `content/docs/api/core{,.cn}.mdx`, guides `editor{,.cn}.mdx`, `document-model{,.cn}.mdx`, `schema.mdx`: current-only load, explicit conversion, source rules, complete output, codec behavior and CLI. Correct the envelope example's missing `kind: 'named'`. Latest-state prose only.                                                                                                                                                                                                               |
| Generated teaching   | `apps/www/api-reference.config.json` and generated manifest; registry generated output after demo changes on `next`. Generate from sources, never edit outputs by hand.                                                                                                                                                                                                                                                                                                                               |
| Doctrine             | Best API `schema-and-identity.md`, Plate Plan migration teaching, Plate/Plite Vision at the smallest changed owner, Plate Next doctrine version and mirrors. During implementation use Best API repair through Maintain Workflow; preserve immutable history and package attestations.                                                                                                                                                                                                                |
| Release notes        | Applicable package changesets and registry changelog for shipped API/example changes during implementation. No publish/release authority is implied.                                                                                                                                                                                                                                                                                                                                                  |

## Execution slices and proof

All five slices are complete.

| Slice                                          | Entry                            | Owner/work                                                                                                                                     | Exit proof                                                                                                                                                                                                                                         |
| ---------------------------------------------- | -------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1. Complete owner/scale acceptance             | Plan accepted; runtime gate open | Land the canonical authored footprint codec and direct current-checkpoint admission with no replay or lost live indexes                        | Retain passing semantic/retention evidence; validate versioned footprint conversion, malformed facts, property/deletion/compensation indexes and continued editing/decisions, then resolve noisy cohorts with repeatable complete-operation proof. |
| 2. Canonical owners and historical correctness | Slice 1 accepted                 | Land remaining shared document/schema primitives and ID admission; v54 suggestion/projection correspondence; direct historical authored import | Current and historical JSON round trips, exact metadata and IDs, target/selection validity, original reported code-line fixture fixed. Focused existing tests cover unchanged behavior.                                                            |
| 3. Public conversion contract                  | Slice 2                          | Bound definition, isolated input, complete preflight, explicit result mapper, source rules, eager output                                       | Integrated type inference/continuity, no-authority callback shape, current/no-op and failure-atomicity contracts; final production benchmark repeats prototype contract.                                                                           |
| 4. Application and CLI adoption                | Slice 3                          | Demo load/save/reopen; CLI conversion/scaffold; current-only editor path                                                                       | Real generated scaffold compiles/runs; stdin/mixed batch/check/write/no-op-mtime behavior; headless/React/static construction and replacement; browser demo interaction and existing suggestion reload.                                            |
| 5. Hard cut and teaching                       | Accepted callers                 | Remove dead hooks/options/exports/catalogs, update docs/doctrine, generate barrels/API manifest/registry                                       | Source/type sweep, package partitions and applicable packed public imports/declarations, docs/artifact consistency. No compatibility alias or second runner remains.                                                                               |

Use existing proof owners before adding tests. New production cases are justified
for the reproduced code-line data loss, preflight/input isolation failure, and
complete-output/selection contracts where existing tests do not cover them.
Delete tests whose only purpose is to exercise the removed generic hook; retain
their real ID, root, mapping or admission obligations in the owning tests.

Focused commands after implementation:

```sh
bun test ./packages/platejs/src/migrations ./packages/platejs/src/lib/editor/documentMigrations.spec.ts ./packages/cli/test/run-migration.test.ts
bun test ./packages/plitejs/test/value-codec.test.ts ./packages/plitejs/test/document-state-contract.ts ./packages/plitejs/test/state-field-contract.test.ts ./packages/plitejs/test/history/history-persistence-contract.spec.ts
bun test ./packages/plitejs/test/schema-identity-contract.test.ts ./packages/plitejs/test/document-fit-contract.test.ts
pnpm --filter platejs typecheck:partition:migrations
pnpm --filter platejs typecheck:partition:compiler
pnpm --filter plitejs typecheck
pnpm brl
pnpm --filter www build:registry
```

Update moved spec paths in the first command when the runner moves. Add affected
root/React/static type partitions and the actual generated scaffold consumer.
Select managed browser and package smoke commands from Verify Plate's live
entrypoint inventory at execution time; do not substitute plain browser tests
against unverified dist. Browser proof needs the served source identity and the
actual save → JSON → reopen interaction, including pending suggestions. No
physical-device, storage-provider or publication claim follows from this work.

### Semantic acceptance matrix

- Exact current input runs zero historical steps but still rejects bad document
  JSON and bad known codecs. Unknown metadata survives; persistent defaults and
  old supported codecs materialize to the current saved form.
- Raw array/document needs explicit historical or current source at conversion;
  ordinary current editor setup and synthesized defaults remain independent.
- Wrong lineage/fingerprint, future source, incomplete chain and forged target
  fail before per-input callbacks. Callback errors leave input and existing
  editor/document/selection/history untouched.
- Primary/named/projected roots survive; excluded roots fail explicitly. Concrete
  text/node selections, backward ranges, affinity/insertion marks, absent/null/sentinels, deleted anchors,
  root removal and cloned step documents follow the mapping contract.
- Non-JSON metadata, bad field envelopes, decoder/encoder errors, future codec
  versions and known local-only persisted keys fail even with zero AST steps.
- IDs obey exact root/ancestor applicability and nonempty/global uniqueness;
  old numeric IDs require the existing explicit conversion policy. Shared
  authored elements keep one identity across accepted/proposed projections.
- Historical suggestions on text, blocks, code lines, captions, property renames
  and line breaks preserve supported pending meaning or reject unsupported data.
  Existing native authored metadata cannot silently merge with legacy markers.
  A stale `suggestion: false` marker must not strip valid native authored state.
- Known native authored metadata must match the final accepted/proposed document,
  roots and checkpoints even when its codec round trip succeeds. Validate IDs
  separately in each projection; proposed-only insertions cannot duplicate an
  accepted element's ID in their combined proposed document.
  Token-count equality alone is insufficient: a same-length accepted-text
  substitution must not silently retain a contradictory cached projection.
  Authored format snapshots must include roots introduced only in proposals.
- Completed output survives JSON save → convert → initial load and replacement,
  with no repeated migration and no new IDs. Local history stays local and resets
  through the existing replacement owner, never through the converter.
- CLI and application conversion produce equivalent completed envelopes for the
  same configuration/source. Batch failure writes no files; semantic no-op
  preserves existing bytes and mtime.

## Performance gate

The [frozen contract](artifacts/2026-09-16-persistence-design/benchmark-contract.json)
covers cold and reused definitions, current/no-op and one/multiple-step inputs,
100/1,000/10,000 blocks, named roots, 1 KiB/1 MiB metadata, legacy revisions and
100-file batches. Time compilation through eager JSON serialization. Count
compilations, editor constructions, step/generator/codec calls, full-root passes
and revision-projection work. Store source hashes and output/correctness guards.

The baseline is the complete existing CLI-equivalent operation: create target
editor, migrate, load the target envelope, read value/selection and serialize.
The candidate must use the real extracted owners. A paragraph-only substitute,
step loop, hidden editor or structural type model is insufficient.

Run two warmups and nine paired alternating samples. Cold median budget is
baseline × 1.20 + 2 ms; warm median is baseline × 1.10 + 1 ms; batch median is
baseline × 1.10 + 5 ms. Record p95, observed post-operation RSS and process-wide
high-water RSS; the last is not an isolated per-operation peak. Cold p95 must fit
baseline × 1.30 + 3 ms. For stable above-noise samples, 10× document size must fit 15× warm median
at fixed revision count. Compilation occurs once for a reused definition;
conversion constructs zero editors/views and retains zero previous documents
through framework-owned references.
Rerun a noisy cohort once when repeated medians differ by more than 15%; unresolved
noise is inconclusive, never a passing receipt.

The known code-line defect requires an explicit corrected semantic oracle;
byte equality with the broken baseline is not correctness. Preserve both
baseline-defect evidence and corrected candidate proof.

The [final readiness receipt](artifacts/2026-09-16-persistence-design/complete-readiness.json)
records **42 observed budget passes**, including six additional current-authored
cohorts from the existing 100/1,000/10,000-block corpus. The largest has 10,055
pending changes and a 16,470,506-byte input. Its exact current checkpoint survives
conversion and save/reconversion with zero guarded body decoding, reduction or
pending replay.

Representative paired medians in milliseconds (observations, not a universal
speed claim):

| Complete operation                                                | Current baseline | Direct-admission candidate |
| ----------------------------------------------------------------- | ---------------: | -------------------------: |
| Current 10,000 blocks without review, reused definition           |           841.10 |                     338.87 |
| v53 10,000 blocks, reused definition                              |           824.57 |                     378.68 |
| 1,000 blocks with ten imported revisions, reused definition       |           554.71 |                     587.40 |
| Current 10,000 blocks / 10,055 pending changes, reused definition |         1,526.90 |                   1,365.54 |
| Batch of 100 v53 files, 1,000 blocks each                         |         8,509.64 |                   3,729.42 |

**The planning-prototype reproducibility gate was inconclusive.** The
current-review-100 warm and
legacy-review-1000-1 warm cohorts changed by more than 15% on repetition. Further
quiet diagnostic runs are retained, not cherry-picked into acceptance. All
observed pairs fit the original budgets, but that does not discharge the frozen
noise rule. The first replay-based candidate's failure and subsequent rejected
owner choice also remain in their original receipts. No budget was relaxed.

The large current checkpoint and scale fixtures exercise insertion histories.
Code-line, line-break, formatting and stale-marker fixtures carry separate
semantic proof and single-run timings. The cold-codec branch deletion is only an
offline feasibility probe: the live-footprint counterexample below prevents
shipping it unchanged. No timing here proves the complete proposed v6 codec,
property/deletion-heavy scale, distributed histories, browser behavior, I/O or
bundling. RSS receipts report observed post-operation usage and process-wide
high water, not isolated candidate peaks.

### Production acceptance

The final built public `platejs/migrations` implementation was measured against
the frozen editor-bound baseline in one Node process with two warmups and nine
interleaved samples. All **36/36** rows pass the original budgets and JSON reopen
guards. The 100-file v53/1,000-block batch improves from a baseline median of
8,284.41 ms to 3,205.44 ms. The worst candidate/baseline median ratio is 0.929
for the cold `legacy-review-1000-10` cohort.

The two formerly noisy warm cohorts were repeated against production:

- `current-100`: 3.8797 ms to 3.9910 ms, **2.87%** drift.
- `legacy-review-1000-1`: 132.3543 ms to 131.6028 ms, **0.57%** drift.

Both satisfy the frozen 15% reproducibility rule. The production receipt SHA-256
is `676eef93249ccfbf2439c2babae5a4fd13e9b04dc02d48914959e64a628a8d08`.
The executable and JSON receipts remain ignored planning artifacts under
`docs/plans/artifacts/2026-09-16-persistence-design/`; this plan and the immutable
implementation record carry the durable result and digest.

## Failure analysis and rollback

1. **“Immutable” target retains a scratch editor or store.** Conversion behavior
   changes after unrelated state updates, compilation cleanup breaks methods,
   and batches retain documents. Prove closure ownership and zero conversion
   editor/view constructions; repair the existing schema/authored owners.
2. **Migration reports success before persistence is complete.** Lazy codec
   encoding throws during JSON serialization, duplicate IDs pass initialization,
   or prep changes the reopened document. Eagerly encode/validate at the owned
   boundary and exercise real JSON reopen with IDs and metadata.
3. **Shaping destroys historical review meaning or selection.** Code-line marks
   disappear, renamed property snapshots retain old keys, captions move without
   mapping, or separate projections invent different IDs. Decode meaning before
   destructive changes, retain source correspondence, and compare accepted and
   proposed documents plus saved selection.

This is a pre-release hard cut. During development, keep baseline and candidate
in disposable evidence; do not ship dual public runners or compatibility flags.
If the ownership/correctness/scale gate fails, repair or revise the candidate
before caller adoption. Do not revert application data through down-migrations.
CLI all-or-nothing writes remain the file-level failure protection.

Verification evidence:

- Current-owner probe: **5 passed**, one file. The initial probe setup used
  `.extend()` after `.configure()` and failed the existing descriptor guard;
  correcting that probe order produced the reported passing run.
- Authored admission probe: **4 passed**, one file, with the three independent
  document/codec/ID counterexamples and its source-hashed receipt.
- Historical transformation prototype: **3 passed**, proving decode-before-shape
  retains code-line review meaning/shared IDs and native review state under stale
  false markers; an unsupported caption-annotation case rejects before shaping.
  These tests deliberately use existing editor-bound fitting/import adapters,
  so they prove the transformation direction, not detachment.
- Runner protocol prototype: **4 passed** for whole-chain preflight, input
  isolation, explicit mapper/null handling and eager known/unknown metadata
  encoding. Its schema adapter is a stub; it is not full admission proof.
- Detached schema owner: **7 fitting + 6 mapping cases** pass, with real codecs,
  nonempty representation correction, constructor guards and compilation-host
  collection. See the [receipt](artifacts/2026-09-16-persistence-design/schema-prototype/receipt.json).
- Detached authored owner: **9 parity fixtures, 4 schema fixtures, 11 rejection
  checks and 15 current-editor reloads** pass. Same-length contradictory cached
  projections are rejected by direct shared-origin text comparison. Proposed-only
  roots remain in snapshots. Property/boundary/authentication limits are explicit.
  See the [receipt](artifacts/2026-09-16-persistence-design/authored-prototype/receipt.json).
- Complete candidate: all **17** current, v53, multi-step, named-root, metadata
  and legacy-review fixtures, including 10,000 blocks, pass conversion and
  save/reconversion; a separate unmodified current-editor process passes all
  **17** reload and baseline-meaning comparisons. See
  [smoke](artifacts/2026-09-16-persistence-design/complete-smoke.json) and
  [oracle](artifacts/2026-09-16-persistence-design/complete-oracle.json).
- Final integrated historical cases: **6 passed**, including the expected
  checkpoint-mismatch rejection. Code-line insertion, stale-false native review,
  inserted/removed line breaks and formatting preserve their asserted meaning.
  The [receipt](artifacts/2026-09-16-persistence-design/complete-review-proof.json)
  records the corrected initial fixture expectation (`codeBlock` is the compiled
  current type), exact input/output facts and zero conversion constructors.
- Final selection/retention proof: **23 checks passed**. It covers absent/null,
  sentinels, backward and named-root text/node selections, current insertion marks,
  both affinities and invalid selections. All **416** watched document references
  and the compilation host were collected across event/GC turns while the
  definition remained alive and reusable. This is finite V8 evidence, not a
  universal leak guarantee or proof about arbitrary application closures.
  See the [receipt](artifacts/2026-09-16-persistence-design/complete-retention-proof.json).
- Complete-operation counters: **18 fixtures passed**, including a missing-ID
  allocation. Historical step counts match the chain, existing IDs allocate zero
  times, known fields decode/encode eagerly, and final imported review admission
  uses direct admission with no pending replay. Logical document stages/root
  counts are recorded; this does
  not count every internal recursive scan. See the
  [receipt](artifacts/2026-09-16-persistence-design/complete-counter-proof.json).
- Large current checkpoint: **3 exact save/reconversion cases passed**, including
  10,055 pending changes; guards report zero replay, reduction and body decoding.
  See the [receipt](artifacts/2026-09-16-persistence-design/current-review-smoke.json).
- Cold-codec counterexample: removing eager decode alone loses live property
  indexes. The [footprint construction proof](artifacts/2026-09-16-persistence-design/authored-footprint-proof.json)
  restores full index parity for **9 fixtures** using the existing compact facts,
  without decoding bodies. It is not the implemented v6 codec or a hostile-input
  validation proof. An initial unowned frozen copy lost the opaque-body WeakMap
  association; using the existing canonical JSON owner preserves serialization.
- Planning performance: **42 observed budget passes**, two warmups/nine paired
  samples; two reproducibility results remained inconclusive in the prototype.
  Source/bundle hashes and all diagnostic repeats are retained as historical
  design evidence.
- Production performance: **36/36 rows pass** against the built public converter,
  and the two noisy cohorts repeat at 2.87% and 0.57% drift. The production cost
  gate is accepted without relaxing a budget.
- Production behavior: **64 migration tests** with 149 assertions and **169
  Plite persistence/authored tests** pass. The isolated CLI generation suite
  passes **68 tests / 208 assertions**. Plate migration contract types, complete
  Plate and Plite package typechecks, affected lint partitions and package builds
  pass.
- Public/application proof: the packed import smoke passes **27/27**; generated
  editor contracts, API reference, docs parity, registry source and registry
  build pass. Managed Chromium proves v53 conversion, save to JSON, discard of
  unsaved content and reopen through a fresh current editor with zero historical
  steps.
- Final teaching closure removes the deleted editor migration option,
  `migrateElementIds`, the `unversioned` floor and the old `migratePlateV54`
  public name from current source and tracked generated output. The ledger maps
  the new browser proof to persistence. A final source-authority record
  fingerprints every changed caller, bilingual doc, release note, changelog,
  doctrine owner and tracked generated payload used by that claim.
- Structural type model: **passed** with `pnpm exec tsc --ignoreConfig --noEmit
--strict --skipLibCheck --target ES2022 --module ESNext --moduleResolution
Bundler --types node docs/plans/artifacts/2026-09-16-persistence-design/type-probe.ts`.
  Six negative assertions are compiler-checked; this is not package integration
  proof. The first invocation omitted this TypeScript version's `--ignoreConfig`
  requirement and did not typecheck; the listed invocation is the valid receipt.
- Prior final review: **39 codec/state/history + 96 migration/CLI tests passed**.
  Reuse only while their recorded source hashes match; these are baseline proofs,
  not proofs of this proposal.
- The immutable review file retains SHA-256
  `8e68282e4fd7415f5910b1376607ccfb8fb4ec4c5d72e5e683453e5d268f15ad`.
  **55 of its 56** source-file hashes still match. The sole later drift is
  `packages/plitejs/src/core/public-state.ts`, which forwards discarded live
  node keys into authored projection-index inheritance. Rebuilt current-source
  correctness, reopen, historical-review, retention, counter, current-checkpoint
  and footprint receipts pass, along with **138 focused tests** across document
  change and authored-view/retained-edit owners. Those planning timing receipts
  remain historical; the final production receipt measures the canonical built
  implementation and closes the reproducibility gate.
- Planning links, production receipts and recorded source/bundle identities
  validate. The initial completion check correctly rejected an unassessed
  prototype gate; the production implementation closes that gate.
- Persistence's scoped ledger lookup remains `matching` for its ledger inventory;
  that status does not claim all immutable-review evidence-input hashes still
  match. Ledger rendering succeeds; the global check still stops on unrelated
  stale `browser/ai-session` inventory. That global failure is not reported as
  a passing ledger check.
- Production adoption changes canonical Plite, Plate, CLI, app, docs, doctrine,
  generated artifacts, tests and changesets. Disposable benchmark files remain
  ignored and are summarized by digest above.

The accepted architecture is implemented. Codec v6 keeps retained authored
bodies cold while admitting current checkpoints directly; detached conversion
owns schema fitting, persisted fields, ID admission and selection mapping; v54
decodes historical meaning before shaping; and ordinary editors accept current
input without migration machinery.

Remaining limits:

Legacy caption-property review still rejects explicitly. Historical insertion
marks must convert or reject through their migration step. The benchmark does
not establish a universal speed or retention claim, and arbitrary application
closures can retain data or perform external effects. No physical-device,
storage-provider, distributed Yjs cutover or publication claim is made. The
aggregate www TypeScript command currently stops on unrelated comment browser
helpers after its editor, API, docs, registry and route-generation gates pass.

## Completion Gates

- [x] Complete the design and bounded feasibility assessment.
- [x] Implement every execution slice and current caller adoption.
- [x] Close authored codec, correctness, package, browser and production cost
      gates without a compatibility path or second runner.
- [x] Record the implemented decision and immutable persistence review.

Linked plans:

None.

Earlier migration plans are historical evidence, not delegated completion work.
