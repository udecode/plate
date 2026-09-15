---
title: Model document boundary
type: decision
status: accepted
updated: 2026-09-11
review_scope: model
current_review: 2026-09-11-model-document-boundary
review_history:
  - ../review-records/2026-07-23-api-model.json
  - ../review-records/2026-09-11-model-document-boundary.json
source_refs:
  - ../../plans/artifacts/model-api-review/document-boundary-probe.json
  - ../../plans/2026-09-11-model-api-review.md
  - ../../plans/2026-09-11-model-document-boundary-patch.md
related:
  - ../reviews.md#model
  - ../reviews.md#schema
  - ../reviews.md#persistence
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
and explicitly closed-schema editors. The [public-API probe](../../plans/artifacts/model-api-review/document-boundary-probe.mjs)
and its [results](../../plans/artifacts/model-api-review/document-boundary-probe.json)
reproduce all 12 mismatches, with valid-document and invalid-node controls.

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

Ownership flow, retaining the existing public calls:

```text
construction / current-document load / schema assertion
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

No public `Document` wrapper, second validator API, validation mode or new
schema registry is proposed. This direction removes duplicate admission rules;
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
- Thirty-three adjacent source-first tests pass across schema identity,
  validation diagnostics, document fitting, initial document values, and JSON
  value codecs. The `plitejs` source-first typecheck and scoped formatting/lint
  pass. The patch plan owns the remaining aggregate verification state.
- No public call shape, product source, public teaching, browser behavior,
  packed artifact, or performance claim changes. Existing JSDoc, schema
  reference, and schema/identity doctrine already state the accepted contract.
- This target introduces no store, cache, index, subscription or new tree
  traversal. No performance improvement is claimed. If implementation changes
  schema traversal, fitting or runtime representation, its target must pass
  the owning scale probe before acceptance.

The July historical review grouped model, reads, updates and extension identity
and has unknown normalized source provenance. This review supersedes it for
the narrower current model question while retaining its history. It does not
claim to resolve every July finding or adopt any code.

The [patch record](../../plans/2026-09-11-model-document-boundary-patch.md)
owns implementation and proof. The public contract, JSDoc, schema reference,
and schema/identity source rule already agree, so this adoption does not require
a public API or doctrine change. Reopen the decision for a contradictory ingress
contract, a failed replacement-atomicity case, or a stronger document model with
independent current user value.
