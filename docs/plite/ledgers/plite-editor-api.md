---
date: 2026-07-20
topic: plite-editor-api-ledger
status: active
---

# Plite Editor API Ledger

- owner: `packages/plite`
- authority: live package source, public Plite docs, and active package proof
- rule: one read/update lifecycle and one canonical document-change truth

## Current Public Shape

Plite exposes one coherent editor lifecycle:

- `editor.read((state) => ...)` reads a committed snapshot.
- `editor.update((tx) => ...)` builds and publishes one atomic transaction.
- direct update groups such as `editor.update.text.insert(...)` are typed
  shortcuts over that same transaction boundary.
- command-backed direct update methods run the installed pure command chain;
  the matching `tx.*` methods are primitives for atomic composition and do not
  redispatch commands.
- `editor.update.command(definition, input)` dispatches one semantic command;
  `tx.command(definition, input)` composes one inside an active update.
- configured update policy owns semantic history behavior and ordered tags.
- public updates are synchronous and cannot nest.

`DocumentChange` is the sole document mutation and mapping truth. A transaction
constructs canonical changes through `DocumentChangeBuilder`; it does not emit
a second operation or intent stream.

## Read And Write Groups

Normal reads use `state` groups:

- `state.nodes`
- `state.text`
- `state.points`
- `state.fragment`
- `state.selection()`
- installed extension read groups

Normal writes use `tx` groups:

- `tx.nodes`
- `tx.text`
- `tx.selection`
- `tx.fragment.delete`
- `tx.fragment.replace`
- `tx.slice.replace`
- `tx.extensions`
- installed extension update groups

External, clipboard, or parsed content enters as a `ContentSlice` and is
replaced through `tx.slice.replace(...)`. Closed application content uses
`tx.fragment.replace(...)`. The active compiled schema fits either form at its
actual target before publication.

## Identity And Live Positions

- structural `Path` values address one immutable snapshot;
- `editor.anchor` creates editor-scoped live handles;
- `tx.anchor` creates handles against transaction-local state;
- node keys belong to React/node key, not public document addressing;
- serialized selections and collaboration-relative positions have separate
  codecs and owners.

## Extensions

Extensions contribute typed `api`, `read`, and `update` groups, commands,
schema, state fields, effects, facets, corrections, and host codecs.

Root dependency references carry only `name` and optional `enabled`. The
finite name-keyed capability/provider carrier and value-sensitive HKT are
internal-only. Static portals prove name and capability equivalence; runtime
portals prove exact installed descriptor identity.

Extension declarations compile into a detached immutable candidate.
`validate(context)` completes before publication. Synchronous activation runs
against the published extension, reports failures through the lifecycle error
sink, and cleans only the failed activation attempt. Publication-dependent work
is registered through `context.afterPublish(...)`.

Pure commands evaluate committed state into `false | TransactionSpec`.
Execution validates the base snapshot and publishes the spec through the same
transaction boundary.

## Proof Owners

- `packages/plitejs/test/accessor-transaction.test.ts`
- `packages/plitejs/test/native-transaction-spec-contract.test.ts`
- `packages/plitejs/test/document-change-laws.test.ts`
- `packages/plitejs/test/command-spec.test.ts`
- `packages/plitejs/test/extension-configuration.test.ts`
- `packages/plitejs/test/architecture-contracts.test.ts`
- `packages/plitejs/test/public-package-import-smoke.test.ts`

## Sources

- [Plite vision](/Users/zbeyens/git/plate-2/docs/vision/plite.md)
- [Absolute architecture claim](/Users/zbeyens/git/plate-2/docs/plite/absolute-architecture-release-claim.md)
- [Public Editor concept](/Users/zbeyens/git/plate-2/content/docs/plite/concepts/07-editor.mdx)
- [Public transforms API](/Users/zbeyens/git/plate-2/content/docs/plite/api/transforms.mdx)
