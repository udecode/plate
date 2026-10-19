# Component Audit

Audit current source against the laws in `plate-ui`; do not treat an existing
export or file split as precedent.

## Family shape

For each React component family, classify it as one of these:

1. **Direct component** — local hooks, state, derived values, and handlers stay
   in `<Family>.tsx`.
2. **Component plus controller** — one `use<Family>.ts[x]` owns a semantic
   controller shared by multiple family members or surfaces.
3. **Independent state owner** — a separate private context/store file exists
   because its lifecycle or consumers extend beyond one family.

For every public package hook, trace and record terminal consumers rather than
stopping at the first package import. Classify it as:

- **public package** — multiple independent terminal owners or a durable
  headless semantic, DOM, accessibility, or integration subsystem;
- **package-private** — implementation of a real package subsystem;
- **registry-local** — every terminal consumer is copied registry UI and the
  behavior is UI/product composition;
- **delete** — the hook duplicates a canonical primitive or has no live owner.

For a mixed row, classify responsibilities separately. Retain only a durable
subscription/DOM/accessibility/integration lifecycle in the package, with
required lifecycle inputs and no renderer prop/state bag. Localize derived
layout, transient rendering state, trivial presentation helpers and presentation
event wiring in the copied family; record every deleted return field and
exported result/helper type. Keep semantic calculations and neutral interaction
lifecycle with their durable owner regardless of current consumer count.

When a registry-local hook depends on a package store, provider, hotkey
controller, or UI-only plugin definition, move that complete state owner in the
same row. Package wrappers, exports, tests, docs, and multiple subcomponents in
one family do not increase the terminal-consumer count.

## Registry wiring

Audit `registry-features.ts`, `registry-editor.ts`, and
`registry-examples.ts` together.
