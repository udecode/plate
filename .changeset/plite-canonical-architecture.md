---
"@platejs/plite": patch
---

- Add immutable `TransactionSpec` and versioned `DocumentChange` APIs for atomic, serializable updates, with explicit primary and named-root changes and no public primary-root sentinel
- Add closed compiled schemas with shared `property.*` value laws, distinct element/text placement, serializable targets, stable identity, and canonical construction
- Expose compiled element and property queries through `state.schema.element(type)` and `state.schema.property(query)`, including explicit `unknown: 'preserve'` policy and `allowsUnknownElements` content grammar
- Report schema validation failures through `EditorSchemaValidationError` with structured root, path, node, property, and contributor provenance; compiler-only primary-root sentinels never enter the public diagnostic
- Add immutable `ContentSlice` values, contextual `state.slice` fitting, closed `fragment.replace`, open `slice.replace`, and detached-parent `fitContent`
- Reconfigure extension slots atomically through `editor.update.extensions.reconfigure`, including optional document migration
- Install dynamic extensions through `editor.extend(extension, { migrate })` when their candidate schema requires an atomic document migration
- Add pure commands and versioned field and effect codecs
- Dispatch command-backed one-shot updates through pure handlers and compose semantic commands with `tx.command`
- Preserve independent property edits, exact-node replacement, block-void deletion, live anchors, and root-scoped selection mapping
- Expose frozen snapshot identity through `entries()`, `idAt()`, and `pathOf()` queries backed by bounded lazy structural mapping
- Store pending insertion marks on collapsed text selections as the single serializable selection state
- Keep composed collapsed-mark commands coherent with earlier writes in the same transaction draft

**Migration:** Read snapshot identities through `snapshot.index.idAt(path)`,
`snapshot.index.pathOf(runtimeId)`, and `snapshot.index.entries()` instead of
the mutable `idToPath` and `pathToId` records.
