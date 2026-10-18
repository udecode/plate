# Extensions and schema composition

The ledger asks how plugins compose into one schema and registry. The 2026-10-04 audit stopped. Flat plugin descriptors, one compiled schema, typed contribution points and slot replacement each own a distinct live job, and the two dynamic front doors, `editor.install` and `tx.plugins.reconfigure`, already stage through one rollback-safe candidate publication. `node tooling/scripts/review-ledger.mjs show schema` prints the scope's history.

## Layer and owner

| Responsibility | Decision |
| --- | --- |
| Expansion | Distinguishes dependency edges from slot ownership, validates descriptors and schema against a detached candidate, stages fields and resources, and publishes one registry; failure rolls the candidate back, and a finalized replacement cleans up displaced owners. |
| Registry | Validates identity, freezes publication collections and keeps ordered registrations. |
| Schema | Contributions lower to one compiled schema in `packages/plitejs/src/core/schema-contribution-registry.ts`. |
| Slots | Own replaceable subtrees, as the schema-reconfiguration and Yjs examples use; dependencies express prerequisites, not permission to delete dependents. |
| Contributions | Host codecs and clipboard handlers register ordered typed contributions; they are not persisted state. |
| Plate | Its plugin compiler forwards these declarations and keeps product plugin policy above them. |

Rejected, and why:

| Alternative | Why it lost |
| --- | --- |
| One overloaded configuration factory | Erases the difference between schema vocabulary, resource lifetime and replaceable ownership. |
| Another configuration, profile or container layer | Duplicates descriptor composition and slot ownership. |
| Merging slots into dependencies, or deleting contribution points | Loses owned replacement or neutral producer and consumer registration. |
| Separate cleanup and `install()` calls in place of atomic reconfiguration | Moves the same ownership into another API. |
| A Plate-only replacement coordinator | Raw consumers would rebuild it. |
| A mutable global plugin store or independently published registries | Makes rollback and consistent schema and API snapshots a cross-owner protocol. |

## What other editors do

Not compared in this scope; the [editor comparison](editor-comparison.md) holds the cross-editor reads.

## Main changes

- Fields are installable extensions; facets are gone ([state](state.md)).

## Open work

- Compiler and cache cost was neither accepted nor rejected on timing. owner: Benchmark. stop: a schema change that touches compilation brings its matched probe.
