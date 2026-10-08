---
title: Model document boundary
type: decision
status: accepted
updated: 2026-10-04
source_refs:
  - ../../plans/artifacts/model-api-review/document-boundary-probe.json
  - ../../plans/2026-09-11-model-api-review.md
  - ../../plans/2026-09-11-model-document-boundary-patch.md
  - ../../plans/2026-10-03-model-document-admission.md
  - ../probes/2026-10-03-model-document-boundary/admission-probe-guard-receipt.txt
  - ../probes/2026-10-03-model-document-boundary/unknown-keys.txt
  - ../probes/2026-10-03-model-document-boundary/ingress-census.tsv
  - ../probes/2026-10-03-model-document-boundary/ingress-census-addendum.tsv
  - ../probes/2026-10-03-model-document-boundary/snapshot-and-plate.txt
  - ../probes/2026-10-03-model-document-boundary/identity-trace.tsv
  - ../probes/2026-10-03-model-document-boundary/focused-rerun-receipt.txt
related:
  - ../review-scopes/model.json
  - ../review-scopes/schema.json
  - ../review-scopes/persistence.json
---

# Model document boundary

**Use one shared document-shape validation owner inside Plite.** Construction,
schema assertion, schema fitting, and document replacement establish the same
container contract before applying their entry-specific work. Retain the JSON
tree, one compiled schema, and separate runtime and persisted identities. The
evidence supports this bounded repair; it does not justify replacing the
document architecture.

The September 11 review found an unsound public assertion. Given valid children,
`editor.read.schema.assertDocument({ children, meta: 7 })` succeeded, although
its declared `EditorDocumentValue` result required object metadata. Editor
construction rejected that input. Direct and persisted document replacement
accepted it and dropped the malformed field. The same disagreement occurred for
`meta: []`, `meta: null`, `roots: 7`, `roots: []` and `roots: null`, in both raw
and explicitly closed-schema editors. The public-API probe comparing assertion, construction and direct/persisted replacement
and its recorded results for six malformed metadata/root containers in each editor mode
reproduce all 12 mismatches, with valid-document and invalid-node controls.

## October review: admission by input kind

The [October 3 review](../review-records/2026-10-03-model-document-admission-3.json)
keeps this owner and pursues its last gaps. It supersedes two
[earlier](../review-records/2026-10-03-model-document-admission.json)
[records](../review-records/2026-10-03-model-document-admission-2.json) from
the same day, whose targets and evidence two panel rounds corrected. The September
patch landed in `e0c1500b95`, and its
[execution record](../review-records/2026-10-03-model-document-boundary-execution-3.json)
binds it to a [receipt](../probes/2026-10-03-model-document-boundary/focused-rerun-receipt.txt)
that records the regression run by name and a control whose name matches no
test. A
[static census](../probes/2026-10-03-model-document-boundary/ingress-census.tsv)
and its [addendum](../probes/2026-10-03-model-document-boundary/ingress-census-addendum.tsv)
find that every editor-loading path they list, Plite and Plate, reaches
`assertEditorDocumentShape`; `tx.roots.create` and `replace` reach it only
through the fit fallback. Plate's `migrateDocument` checks the same containers
with its own `assertOwnedDocument` until `completeDocument`. Detached authored
projections and `DocumentChange.apply` take documents outside admission, and
the plan decides whether they stay trusted typed input.

Nothing decides unknown top-level keys. The
[first probe](../probes/2026-10-03-model-document-boundary/unknown-keys.txt)
shows `assertDocument({ children, extra: 1 })` succeeding. Construction,
fitting and direct replacement strip `extra`, and the persisted envelope
rejects it, in raw and closed-schema editors. Direct replacement also strips a
non-JSON value there. The
[second probe](../probes/2026-10-03-model-document-boundary/snapshot-and-plate.txt)
finds the same for Plate construction through `initialValue` and for the
`migrate` callback of `plugins.reconfigure`. Its control passes Plate's
ignored `value` option and loads nothing. Four paths rebuild the object
before the owner runs: direct replacement, Plate construction, the root-bound
view and reconfigure `migrate`. Plate construction also replaces a raw
`selection` with `null`, and the root-bound view passes the snapshot transform
its rebuilt object. Direct replacement accepts `selection`, which
`SnapshotInput` declares.

The target admits fields by input kind, where the caller's raw object is still
visible. A document admits `children`, `meta` and `roots`. A direct snapshot
also admits `selection`, checked on the caller's input before `setEditorSnapshotInputTransform` runs and on its output after. The
root-bound view and reconfigure `migrate` check the caller's input before they
rebuild it, and Plate checks its raw `initialValue` as a document or envelope
before it adds `selection`. The persisted envelope keeps `document`, `schema`
and `selection`. Application data belongs in `meta`.

The [October 4 review](../review-records/2026-10-04-model-document-admission.json)
supersedes the October 3 target on four points, after the
[adoption plan](../../plans/2026-10-03-model-document-admission.md)'s arena and
two panel rounds. Plite owns closure and one record reader,
`readDocumentRecord`, which Plate migrations and construction call through
`plitejs/internal`. Migration steps see only document fields. `FromDocument`
and `ToDocument` are closed, and a legacy top-level field arrives in a typed
`legacy` channel that a step lifts into `meta` or `roots`. An omitted `legacy`
passes on unchanged, and completion refuses a field no step lifted. Because
step documents are closed, the v54 suggestions step
keeps fitting mid-chain. A document-bound view reuses cached validation only
for frozen documents Plite produced and revalidates a caller's document on
every call.

The target changes what these public entry points accept: `assertDocument`,
`fitDocument`, Plite `createEditor({ initialValue })`, direct and root-bound `value.replace`, Plate
`createEditor`, `plugins.reconfigure` and `install` with `migrate`, and
`migrateDocument` with `plate migrate run`. The target overturns the contract
test "does not confuse direct snapshots with application document metadata"
and deletes the `initial-value.ts` loop that drops unknown keys.

The three identities stay separate. No consumer in the
[identity trace](../probes/2026-10-03-model-document-boundary/identity-trace.tsv)
needs a Plite-owned persisted element identity. Authored lineage, Yjs and
prepared transaction keys need text-level or transport-scoped identity that an
element ID cannot give. `ElementIdPlugin`'s read API stays, because
`docs/vision/plate.md` names `read.id` as the conversion at the persistence
boundary.

## Authority and cause

The [document type](../../../packages/plitejs/src/interfaces/editor.ts)
separates `children`, optional object `meta`, and optional named-root maps.
`NodeKey` is an opaque runtime identity; it is not a serialized node field.
The [schema compiler](../../../packages/plitejs/src/core/schema-compiler.ts)
derives one semantic fingerprint and keeps application lineage separate.
[Plate lowering](../../../packages/platejs/src/lib/editor/withPlite.ts)
contributes product defaults and plugin schema to that substrate.

[Document-shape validation](../../../packages/plitejs/src/core/document-shape.ts)
owns the shared object, primary-children, metadata, named-root-map, and root-array
contract. [Initial-value normalization](../../../packages/plitejs/src/core/initial-value.ts)
snapshots input before calling it.
[Schema assertion](../../../packages/plitejs/src/core/editor-schema.ts) checks
strict JSON first, maps shape failures to immutable schema diagnostics, and then
walks compiled content. [Document fitting](../../../packages/plitejs/src/core/slice-fit/compiled-slice-fitter.ts)
checks the same shape before fitting external content. The
[snapshot loader](../../../packages/plitejs/src/core/public-state.ts) preserves
exact envelope and schema-identity checks before delegating to fitting.

Before the repair, schema assertion checked only JSON compatibility and primary
children, while fitting enumerated malformed metadata and root containers.
Numbers, nulls, and empty arrays could disappear rather than fail at admission.
Exact outer-envelope fields and matching schema identity did not establish the
inner document shape.

## Required behavior and strongest target

The current jobs are authoring schema-valid JSON, importing codec output,
loading saved documents, editing multiple roots, and retaining live identity
through immutable changes. Raw Plite, Plate construction, the
[rich-text example](../../../apps/www/src/app/(app)/examples/plite/_examples/richtext.tsx),
[multi-root example](../../../apps/www/src/app/(app)/examples/plite/_examples/multi-root-document.tsx)
and [Markdown conversion](../../../packages/platejs/src/markdown/lib/internal/markdownConversion.ts)
exercise materially different parts of that contract.

Ownership flow, retaining the existing public calls. The October target adds
the per-kind key check:

```text
construction / current-document load / schema assertion
                    ↓
per-kind key check where the caller's raw object is visible (October)
                    ↓
one private Plite document-shape validator
                    ↓
entry-specific fitting or full compiled-schema assertion
                    ↓
canonical document publication, where applicable
```

The shared validator establishes the common container contract without
repairing the input. Construction and import may still fit valid input and
materialize schema defaults; `assertDocument` must validate and narrow the
original value without modifying it. Preserve array shorthand at construction,
valid named roots, metadata codecs, schema-lineage checks, migration ordering,
selection handling and failure atomicity. Plate retains its nonempty-root
product policy and application migration adapter.

No public `Document` wrapper, validation mode or new schema registry is
proposed. The October target adds one private open container check for
historical migration input beside the closed document contract. This direction removes duplicate admission rules;
it does not merge operations with different mutation or migration semantics.

## Material alternatives

| Direction | Decision and reason |
| --- | --- |
| Keep or configure everything | Keep the basic model, but configuration cannot make the existing assertion's narrowing promise true. |
| Change the existing owner | Pursue shared base-shape validation under the existing Plite APIs. It removes contradictory acceptance rules without adding caller coordination. |
| Add a public primitive | Reject a validated-document wrapper or public parser family. Existing JSON and assertion APIs already express the required jobs; wrappers would add conversion and teaching work. |
| Delete or merge identities | Reject one universal persisted node ID. Live keys cover text and elements within one runtime; optional persisted element IDs survive reload; schema fingerprints identify document semantics. These have different lifetimes and consumers. Merge only duplicate document-shape admission. |
| Move responsibility | Keep neutral validation in Plite. Moving it to Plate or codecs would leave raw editors and other imports with the same hole. Plate-specific root defaults and migrations retain their owner. |
| Replace the tree or state architecture | Reject an ID-indexed public store or class-based AST for this finding. Neither solves admission better than a shared boundary check, and neither has a demonstrated current benefit that earns new runtime machinery. |

The largest justified deletion is the duplicated common admission logic.
Deleting schema validation would lose grammar, property and default laws.
Deleting runtime node identity would lose stable live targets. Making persisted
IDs mandatory would impose storage policy on every text node and editor.
Keeping the existing public shape wins because the failing guarantee is
already part of that shape, not because compatibility protects it.

## Evidence and limits

- The original probe executes the real public editor APIs and records the 12
  malformed-container disagreements with valid-document and invalid-node
  controls. It remains the red diagnostic receipt.
- The focused regression covers eight malformed container classes in raw and
  closed schemas across construction, assertion, fitting, direct replacement,
  and persisted replacement. Both replacement paths prove atomic rejection.
- In September, thirty-three adjacent source-first tests passed across schema identity,
  validation diagnostics, document fitting, initial document values, and JSON
  value codecs, with the `plitejs` source-first typecheck and scoped
  formatting and lint. The October execution record replaces that claim with
  its own receipt.
- The September repair changed no public call shape, public teaching, browser
  behavior, packed artifact or performance claim. The October target
  changes public behavior. `assertDocument`, direct replacement, `fitDocument`
  and Plate construction would refuse an unknown top-level key.
- This target introduces no store, cache, index, subscription or new tree
  traversal. No performance improvement is claimed. If implementation changes
  schema traversal, fitting or runtime representation, its target must pass
  the owning scale probe before acceptance.

The July historical review grouped model, reads, updates and extension identity
and has unknown normalized source provenance. This review supersedes it for
the narrower current model question while retaining its history. It does not
claim to resolve every July finding or adopt any code.

The [patch record](../../plans/2026-09-11-model-document-boundary-patch.md)
owns the September implementation and proof, which needed no public API or
doctrine change. The October target changes public admission, so its plan
runs Best API's doctrine repair. Reopen the decision for a contradictory ingress
contract, a failed replacement-atomicity case, or a stronger document model with
independent current user value.
