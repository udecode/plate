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

Flag these as migration debt:

- `useFooState -> useFoo` or state-hook/prop-hook pipelines;
- one exported hook per subcomponent;
- public prop-bag hooks used by one renderer;
- component or hook factories for a small fixed family;
- public providers/stores with no independent consumer;
- hooks defined in plugin descriptor files;
- `forwardRef` or React 18 compatibility branches;
- `components/` and `hooks/` directories that only classify one family.

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
layout, transient state, trivial pure helpers, and event handlers in the copied
family; record every deleted return field and exported result/helper type.

When a registry-local hook depends on a package store, provider, hotkey
controller, or UI-only plugin extension, move that complete state owner in the
same row. Package wrappers, exports, tests, docs, and multiple subcomponents in
one family do not increase the terminal-consumer count.

## Package extraction

A package extraction is valid when it owns semantic transforms, queries,
serialization, a controller reused across surfaces, or a headless primitive
whose contract is DOM behavior and accessibility. It is invalid when it only
hides copied registry JSX, labels, classes, menu data, or local popover state.

For a headless primitive such as resizable behavior, verify that the package
owns pointer/touch/keyboard/RTL/focus/ARIA behavior while the registry owns
styles, labels, editor persistence, and composition. Private provider/store
plumbing is not part of the public API.

## Cross-platform direction

The useful lesson from `../10tap-editor` is the stable command/state contract
below the UI. Do not copy a monolithic bridge, package-owned product UI, or a
web prop hook merely because a native adapter might exist later.

## Base/live split

Static and live renderer kits stay explicit when they bind different renderer
owners. Share runtime-neutral policy kits. Do not hide a short component array
behind a factory.

## Editor access

Copied registry UI remains host-agnostic:

- use `useEditorPlugin(plugin)` when a component is plugin-centric;
- use `editor.plugin(plugin).api/update` for required descriptor capabilities;
- check `editor.plugin(plugin).installed` before optional capability access;
- never import a host editor type, authored application definition, or generated
  runtime plugin array into copied UI.

## Registry wiring

Audit `registry-features.ts`, `registry-editor.ts`, and
`registry-examples.ts` together.
Metadata mirrors surviving source imports and style dependencies. Explicit
feature kits in examples remain visible teaching/install declarations even
when the aggregate editor installs the same authored plugin.
