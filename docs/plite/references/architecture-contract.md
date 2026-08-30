# Plite architecture contract

This document defines the current runtime ownership and invariants. Production
source is authoritative when an implementation detail changes.

## Core truth

Plite document state is immutable plain JSON:

```ts
type EditorDocumentValue = {
  children: Descendant[];
  roots?: Record<string, Descendant[]>;
  meta?: Record<string, unknown>;
};
```

One committed version owns one coherent snapshot of children, selection,
metadata, and private runtime indexes. A collapsed text selection carries its
pending insertion marks directly. Public reads never observe a transaction
draft.

`DocumentChange` is the only canonical document mutation law. It owns apply,
compose, invert, position mapping, changed ranges, root lifecycle, and
serialization. There is no second operation or intent replay format.

## Editor boundary

The root editor exposes lifecycle primitives only:

- `editor.read` for committed state
- `editor.update` for atomic writes
- `editor.subscribe` and `editor.subscribeCommit`
- `editor.extend` for atomic runtime extension installation and optional schema migration
- `editor.api` for installed host/runtime services

One-shot reads and writes live on the `read` and `update` facades. Product
commands live in typed transaction groups. Host services such as DOM focus,
clipboard ingress, measurements, and overlays live in extension API groups.

Anchors are intrinsic editor-scoped runtime resources. Create them with
`editor.anchor` or `tx.anchor`; plugin-owned capabilities remain in their
installed API groups.

## Transactions

`editor.update(...)` is synchronous, non-nestable, and atomic. A transaction:

1. starts from one committed snapshot;
2. accumulates one canonical change through typed transaction groups;
3. runs deterministic corrections over canonical changed ranges;
4. publishes one immutable snapshot and one compact commit;
5. discards the unpublished candidate if any step throws.

`tx.changes.apply(change)` is the adapter and history boundary for canonical
changes. Ordinary editing uses semantic groups such as `tx.text`, `tx.nodes`,
`tx.fragment`, `tx.selection`, and extension-owned commands.

Transaction policy uses semantic options and tags. One immutable change
builder owns the write; direct `editor.apply`, nested public updates, and
compatibility modes are outside the architecture. Pure typed commands evaluate
state into `false | TransactionSpec`, then execute that spec through the same
canonical publication path.

## Commit

`EditorCommit` carries:

- `changes` and `inverseChanges`
- `effects` and `annotations`
- before/after selections, including pending insertion marks on collapsed text
  selections, plus their selection roots
- version, command, tags, and dirty state-field keys
- `changed`, lazy invalidation queries derived from canonical changes and
  snapshot indexes

Consumers choose the correct truth:

- document replay and mapping use `changes`;
- history applies inverse changes and inverted effects;
- React, DOM, and layout consume `changed` and canonical changed regions;
- analytics and policy consume commands, tags, effects, and annotations.

Flat eager impact flags are not duplicated on the commit root.

## Schema and corrections

Extensions contribute element behavior, property descriptors, content rules,
and selection specs. Plite compiles membership, containment, wrapping, and
default tables for pure reads through `state.schema` and `tx.schema`.

External parse, clipboard, and import boundaries produce a `ContentSlice`.
`tx.slice.replace(...)` fits the slice through the compiled schema before
publishing one canonical replacement. Closed application content uses
`tx.fragment.replace(...)`. Hosts call `state.slice.fit(...)` to preview the
same transaction spec without supplying the document value.

Structural repairs are extension corrections scheduled from changed ranges.
Corrections compose into the active canonical change and run to a deterministic
fixed point with cycle diagnostics. An explicit `editor.update.value.repair()`
performs all-root maintenance for imported raw data or newly installed rules.

There is no per-operation dirty-path normalizer loop.

## Identity and anchors

Node keys are private editor-local identity. Snapshot indexes map node keys
to paths without entering serialized document data.

`editor.anchor` and `tx.anchor` map paths, points, and ranges through committed
`DocumentChange` values. Every anchor declares association and deletion policy.
Anchors are root-aware and transaction-safe. The old path/point/range ref
families and bookmarks are not public alternatives.

## Selections

Selections are discriminated serializable values. Core installs text and node
selections; extensions can register additional kinds such as cell selections.
Each selection spec owns validation, mapping, text-range projection,
replacement range, and optional DOM range behavior.

Generic code uses the selection protocol. Text-only algorithms narrow with
`SelectionApi.isText(selection)` or `selection.kind === "text"`.

## State, effects, annotations, facets, and slots

State fields are typed reducers. `tx.setField` emits the field's typed effect;
the field descriptor defines persistence, history, collaboration, inversion,
and mapping behavior.

Effects represent state and integration events inside the same atomic commit.
Annotations combine transaction metadata without becoming document state.
Facets derive values from installed providers. Named slots make
reconfiguration deterministic and typed.

Extension declarations compile and validate against a detached immutable
candidate. Synchronous activation owns resources and registers cleanup before
publication; `context.afterPublish(...)` schedules publication-dependent work.
Replacing a named slot through `tx.extensions.reconfigure(...)` commits the extension revision
atomically with document and state changes. Dynamic `editor.extend(...)` and
its cleanup use the same lifecycle; installation may publish a candidate-schema
document migration in the same commit.

The public `EditorExtensionDependencyReference` is shallow and non-generic:
`name` plus optional `enabled`. Finite direct capability/provider typing and its
value-sensitive HKT are available only from `plitejs`; the type
graph does not recursively reproduce exact dependency ancestry. Static portal
access proves one literal-name match with an equivalent capability. Runtime
portal access separately verifies the exact installed descriptor identity.

There is no public state-patch replay channel.

## History

History stores inverse `DocumentChange` values, inverted effects, selections,
and roots. Pending insertion marks remain part of collapsed text selections.
Undo and redo apply canonical changes inside a
history-skipped transaction. History never retains mutable operation logs as
document truth.

## DOM and React

Core remains DOM-free. `plitejs/dom` owns DOM codecs and mapping.
`plitejs/react` owns rendering, input import, native selection export,
projection, DOM repair, and one publication per committed transaction.

React renders immutable committed snapshots. Runtime views preserve the base
editor's identity owner while scoping reads and writes to a document root.
Repeated content roots can render the same model without becoming independent
history or identity owners.

## Collaboration, roots, and layout

One `DocumentChange` can atomically mutate the primary document and named roots.
Public base-editor reads default to the primary root; root-bound runtime views
scope local commands without changing canonical ownership.

`platejs/yjs` translates between Yjs and canonical changes, preserves provider,
awareness, offline, root, and history behavior. Yjs events translate into
canonical changes, and local canonical changes translate into Yjs deltas.

`plitejs/page-layout` consumes `commit.changed` range and node-key queries.
Pagination and virtualization do not own a parallel document model.

## Package boundaries

- `plitejs`: model, schema, changes, transactions, selections, anchors,
  effects, extensions, and DOM-free runtime
- `plitejs/dom`: DOM conversion and browser bridge
- `plitejs/react`: React host, input, projection, and rendering
- `plitejs/history`: inverse-change history
- `plitejs/page-layout`: layout and pagination planning
- `platejs/yjs`: Yjs collaboration adapter
- `@platejs/test`: Node-safe fixtures plus React, DOM, Playwright, and proof helpers
- `platejs`: Plate plugin conventions and product-facing composition

The `/internal` subpaths exist only for sibling packages in this repository.
Applications use package root exports.

## Proof contract

Architecture claims require the matching proof:

- algebra and transaction laws: package tests and property vectors
- browser editing, selection, DOM repair, and React timing: `apps/plite`
  Playwright proof
- collaboration: two-client, provider, awareness, offline, and history tests
- locality and scale: transaction, correction, history, selection, render,
  huge-document, pagination, and Yjs benchmarks
- public closure: exact exports, source-first typechecks, docs parsing,
  changesets, deletion audits, and root checks

Green unit tests alone do not prove browser or performance behavior.
