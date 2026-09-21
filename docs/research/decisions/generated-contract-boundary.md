---
title: Generated contracts belong to the application graph
type: decision
status: assessed
updated: 2026-09-20
review_scope: compiler
current_review: 2026-09-20-registry-plugin-capability-boundary
review_history:
  - ../review-records/2026-09-14-registry-generated-contract-boundary.json
  - ../review-records/2026-09-20-registry-plugin-capability-boundary.json
source_refs:
  - ../../../packages/cli/src/generate.ts
  - ../../../apps/www/src/registry/components/editor/more-toolbar-button.tsx
  - ../../../apps/www/src/registry/components/editor/dnd.tsx
  - ../../../apps/www/src/registry/components/editor/plugins.generated.ts
related:
  - plate-core-ownership.md
  - ../reviews.md#compiler
---

# Generated contracts belong to the application graph

**Stop requiring CLI-generated application types in reusable registry items.**
Keep descriptor-derived feature access and optional application-owned generation.
A copied item is a reusable consumer of Plate, while its host owns the complete
plugin composition. Being consumer-side does not make those owners identical.

The current generated `Editor` names the entire exported `EditorKit`, and its
`Value`, node, schema and mutation declarations describe that graph. A toolbar
that imports this contract inherits assumptions about features unrelated to its
job. Copying, removing or configuring plugins then requires coordinated
generation and import paths. An asserted generated editor type also cannot
establish which editor a React context supplies or which plugins it installed.

The ordinary item imports its owning descriptor and lets the public API infer
the capability. `MoreToolbarButton` already calls `tx.plugin(KbdPlugin).toggle()`
inside an ordinary `useEditor().update` callback; it needs no complete EditorKit
type. Single feature updates use `editor.plugin(Plugin).update`. Node renderers
derive local schema properties from their descriptor. If these contracts fail
to infer a legitimate operation, repair their owning API rather than inserting
an application graph, cast or handwritten union into copied source.

One optional cross-feature boundary does not reverse that rule. The standalone
`DndKit` can place dropped files when the separately installed Files capability
exists, but importing `UploadPlugin` would make DnD pull the Files feature and
its optional SDK peer. That integration uses the explicit erased boundary:
`tx.plugins.has('files')` followed by `tx.plugin('files')` in the same update.
It is runtime guarded and behavior tested, but its method shape is deliberately
not statically checked. Keep name-only dispatch confined to such package-decoupled
integration; ordinary registry items continue to use exact descriptors.

Generated exact contracts retain an independent application job: statically
checking a complete customized document shape and its schema/mutation contract.
The CLI's existing test includes valid and invalid generated `Value` examples
and stale-output checking. Applications may opt into those outputs at explicit
data or editor construction boundaries. Published package declaration files
and public descriptor-derived types are also valid dependencies; they are not
application-specific CLI output.

The alternatives considered were mandatory generation per application,
generation per registry item, a shared mega-editor type, generic editor-type
parameters on every component, removing generation entirely, and recursively
inferring every complete document grammar. None improves the inspected reusable
toolbar job over descriptor access. Per-item generation duplicates contracts;
a mega-editor type hides installation assumptions; component-wide graph
generics introduce work where only one capability is needed. Removing the
generator would discard its distinct exact-data job. Universal recursive
inference is not selected without an exactness/type-cost comparison.

This fresh review reaffirms the September 14 descriptor-transaction correction
in `plate-core-ownership.md` and the earlier application-owned contract policy.
No non-generated registry TS/TSX consumer imports `plugins.generated` in the
bounded scan. The generated artifact remains used by an application integration
type fixture; that does not make it a reusable registry dependency.

Evidence is source inspection of current owners, consumers and type-test
fixtures. No tests, generation, browser replay or performance measurement were
run for this review, and compiler-wide correctness/adoption is not certified.
No product change or downstream implementation plan follows this Stop verdict.
