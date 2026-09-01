---
description: Master Plate React/UI architecture for package primitives, component families, copied registry UI, kit wiring, and browser proof.
name: plate-ui
metadata:
  skiller:
    source: .agents/rules/plate-ui.mdc
---

# Plate UI

This is the sole owner of Plate-specific React and component architecture.
Package and migration skills route here instead of maintaining another hook,
component, or React rulebook.

Use the `shadcn` skill for CLI, upstream docs, and generic shadcn/ui rules.
Use the Vercel React skills for selected implementation tactics. Use this skill
for the final Plate decision: public component shape, component-family
topology, package extraction boundaries, base/live kit split, cross-platform
layering, open-code preservation, and registry wiring.

## Repo Surfaces

- `apps/www/src/registry/components/editor` — provider-neutral copied editor
  features, live/static components, and app-owned kit values
- `apps/www/src/registry/bases/*` — provider-specific source variants that
  install over the same flat editor targets
- `apps/www/src/registry/registry-*.ts` — registry metadata and dependencies
- `packages/*` — upstream semantic owners; package edits route to
  `plate-plugin-creator`

## Routing Gate

| Owner                  | Scope                                                               |
| ---------------------- | ------------------------------------------------------------------- |
| `vision` / `best-api`  | durable doctrine and reusable public call shape                     |
| `plate-plugin-creator` | package plugin mechanics and package proof                          |
| `plate-ui`             | all Plate React/component law, copied UI, wiring, and browser proof |
| `docs-creator`         | current-state public teaching                                       |

Continue here whenever a Plate package or registry task makes a React,
component, hook, provider, store, primitive, or composition decision. Package
implementation and proof still route to `plate-plugin-creator`; plugin builders,
schema law, and application typing remain outside this skill.

## Principles

1. **Preserve open code.** A shadcn-derived component should still look like source code a user can own, read, diff, and tweak.
2. **Extract only durable boundaries.** Package code should own semantics, not JSX avoidance.
3. **Design below JSX.** Cross-platform reuse belongs in command/state contracts, controllers, queries, and transforms — not in package-owned shadcn composition.
4. **Keep UI composition local until proven otherwise.** Popovers, labels, and layout belong in the component unless multiple surfaces need the same contract.
5. **Registry wiring is part of authorship.** A component is not done until kits, examples, and style deps are coherent.
6. **React floor is 19.2+.** Do not add backward-compat code for React 18-era limitations or patterns.
7. **Lists have one UI graph.** Root `ListPlugin` owns list behavior. The
   standard list registry items are the only copied UI family for lists.
8. **Examples teach the install shape.** Do not remove an explicit feature
   plugin, kit, renderer binding, or dependency merely because an aggregate
   application editor installed by the `editor-kit` registry item also includes
   it. Deliberate repetition can make copied code and feature ownership
   transparent. Terminal configurations of the same authored plugin compose in
   source order, so append the explicit configuration after the inherited
   application plugins and let its defined values win. Unrelated plugins and
   divergent authoring branches cannot share a name.
9. **Application typing is not UI architecture.** Registry items consume
   ordinary plugin arrays and editor APIs; copied UI never owns its host's
   application contract.
10. **Direct components are the default.** A component family gets zero or one
    semantic controller hook, never a state-hook/prop-hook pipeline or one hook
    per subcomponent.
11. **Complete blocks name their owner.** Keep the reusable presentation
    component exported by `editor.tsx` as `Editor`. A block-owned
    `plate-editor.tsx` that creates the editor and mounts `Plate` exports
    `PlateEditor`; it never forces consumers to alias the presentation
    component as `EditorSurface` or `EditorContent`.
12. **React APIs are modern by construction.** Use React 19.2 forms directly;
    do not preserve React 18 branches, `forwardRef`, or compatibility wrappers.
13. **One installed editor namespace.** Plate registry source installs under
    `components/editor`; `components/ui` belongs only to shadcn primitives.
14. **Kit is a value, not topology.** Feature files/items use the feature name;
    their app-owned plugin tuple is `FooKit`, including one-descriptor features.
15. **Variants resolve before install.** Plate supports Radix and Base UI.
    Source variants expose one editor-facing contract and write to one target.
    Never branch on the primitive library at runtime.
    A website-only isolated preview may select author-source variants at
    runtime, but that selector must stay outside copied registry output.
    Shadcn's documented install-time `asChild`/`render` transform is valid
    provider resolution for a direct `components/ui` consumer. Do not add a
    Plate adapter merely to replace syntax that shadcn already translates.
    Add an adapter when Plate owns behavior, focus, or props that the transform
    does not normalize; its consumers use the provider-neutral contract.
16. **Preset catalogs are not compatibility proof.** Keep one complete
    Base/Nova canonical registry graph. Add a provider source variant only for
    a named reusable boundary whose complete installed graph passes that
    provider. Materialize supported styles from pinned upstream transforms as
    sparse logical overlays; reject unsupported providers and styles instead of
    widening Plate support from `shadcn/preset`.
17. **Supported providers expose the complete semantic registry.** Base is the
    default provider. Never 404 or filter a public item because its current
    source is coupled to Radix. Remove the coupling or translate it at the
    smallest direct primitive owner; keep assemblies and transitive items
    canonical.
18. **Plate consumes one distribution.** Package and registry source imports
    Plate APIs from their canonical `platejs` root, React root, or feature
    subpath, never directly from `plitejs`. Inside `packages/platejs`, only
    exact facade, proxy, or replacement leaves cross that boundary; React
    components and their specs, type tests, and fixtures dogfood the relative
    Plate React facade. Never exempt test globs from this rule.
19. **View-local paint is not plugin state.** When the exact mounted Editable
    derives canonical-state presentation from its DOM lifecycle, let
    `PlateContent` inherit the behavior without another prop. Copied UI marks
    owned focus targets and styles neutral output hooks; it does not install a
    plugin, kit, store, parallel state payload, or redundant controlled input.

## Critical Rules

### Cross-Platform Layering → [cross-platform.md](./rules/cross-platform.md)

- `packages/*/src/lib` owns semantic core: transforms, queries, schemas, serialization, controllers, command/state contracts.
- `packages/*/src/react` is a thin adapter layer only.
- Future native layers should consume the same conceptual contracts, not React-specific convenience hooks.
- If a package React hook mainly returns renderer-specific UI props/state, treat it as migration debt, not precedent.

### Ownership & Extraction → [ownership.md](./rules/ownership.md)

- Extract package code for transforms, queries, serialization, stable controllers, and public hooks reused across surfaces.
- Trace reuse through wrappers to terminal product consumers. A package import,
  export, docs page, test, or package component that only forwards behavior to
  copied registry UI does not establish independent package ownership.
- Search terminal consumers outside `apps/www/src/registry` before deleting a
  registry hook or helper. Host documentation components and installed target
  imports count as independent owners; registry tests and metadata do not.
- When every terminal consumer is copied registry UI, move its UI-only hook,
  store, provider, hotkey controller, and plugin extension together into that
  registry component family or kit. Do not leave the state owner in npm after
  moving only its renderer adapter.
- Publish a package React hook only for multiple independent terminal owners or
  a durable headless semantic, DOM, accessibility, or integration subsystem.
  Multiple subcomponents or registry files inside one family are one owner.
- If a hook mixes such a durable lifecycle with one renderer's state or props,
  split it. Keep only subscription/observer/imperative DOM/cleanup behavior in
  the package with the smallest required lifecycle input; a side-effect-only
  adapter returns `void`. Derive layout and visual state during render, and keep
  transient overrides, rounding, refs/styles returned only as props, and event
  handlers in the copied component family.
- Keep one-off shadcn composition, labels, popover state, and local visual treatment in the app component.
- Keep application endpoints, visible copy, upload quotas, arbitrary media
  limits, feature-specific accessibility labels, colors, borders, and stacking
  policy in copied registry source. Packages expose neutral mechanics and
  configurable contracts, including positioning and hit-testing required for
  correct behavior, not Plate's example-product defaults.
- Compose independently placed package DOM primitives as siblings in copied
  registry UI. Style each through ordinary DOM props such as `className`; do
  not add a public root, provider, render prop, or `*ClassName` prop merely to
  pass presentation into independent parts.
- Never create a package hook just to hide JSX, avoid typing work, or move logic used by one component only.
- If extraction makes the component harder to compare with upstream shadcn/open code, keep it local.
- Package cleanup must not paste a package-owned transform, query, navigation
  controller, or other semantic algorithm into registry JSX. Keep or publish
  the durable package owner unless the behavior genuinely becomes UI-specific.
- Registry metadata must declare every package and copied-registry dependency
  used by an item. Optional cross-feature dependencies are valid when the
  behavior belongs in that item and remains safe when the plugin is absent.
- Colocate integration behavior with the component or kit it modifies. Do not
  extract a miscellaneous integration file or terminal configuration array
  merely to invert dependencies, make a graph look pure, or keep optional
  package imports out of their real owner.
- Extract only an independently useful registry capability, a durable behavior
  owner, or the smallest descriptor boundary needed to break a real runtime
  cycle. Never trade obvious source ownership for dependency-graph aesthetics.
- For sibling live/static registry renderers, duplicate presentation lookup data
  and tiny label helpers in each renderer instead of creating a third shared
  registry file. Extract only when the shared code owns real behavior beyond
  labels, menu data, or copy.

### Component Shape & Editor Access → [component-shape.md](./rules/component-shape.md)

- Use `useElement()` for node-context element access. Treat `usePath()` as a
  reactive path dependency, not the default way to obtain a path.
- In repeated node renderers, do not subscribe with `usePath()` when a path is
  needed only inside an event handler or command. Resolve
  `editor.read.nodes.path(element)` at interaction time. Element component and
  node-wrapper props never expose `path`: a normal prop cannot be both stable
  for sibling edits and live for later callbacks.
- Keep `usePath()` only when a descendant must rerender or resynchronize as its
  element moves. Account for that
  dependency in the repeated-unit subscription budget.
- Prefer direct `editor.api.<name>` / `editor.update.<group>` when concrete
  host-owned app code infers that surface from its local editor construction.
  Copied registry UI is generic by definition: never import its host editor
  type, authored `editor.ts`, or generated module, and never use root plugin namespaces
  there. Use the core `useEditor()` plus
  `editor.plugin(plugin)`, or use `useEditorPlugin(plugin)`. A registry example
  whose metadata explicitly depends on `editor-kit` may import the host's
  ordinary plugin composition, but copied UI may not. The `editor-kit` name is
  registry packaging, never an application runtime API noun.
  For an optional descriptor, check `editor.plugin(plugin).installed` before
  accessing its portal. Do not infer optional availability from root
  `editor.api`, node types, schema properties, or caught access errors. Do not
  add local wrapper helpers around either path.
- Copied registry structural selectors pass their imported package descriptor
  directly: `type: FooPlugin` or descriptor arrays. Never resolve
  `editor.plugin(FooPlugin).schema.type`, a `PLUGINS.*` portal, or a local
  `schema.type` merely to call a descriptor-aware node, selection, correction,
  or insertion API. Import the stable package descriptor when the registry
  item already depends on that feature. Persisted strings remain correct only
  for AST construction/comparison, serialization or external data, genuinely
  dynamic actions, and optional plugins whose descriptor is intentionally not
  a dependency.
- If a node renderer forwards to `PlateElement` or `SlateElement`, keep the full incoming `props` object intact. Read from `props`, but do not destructure away `editor`, `element`, or other required fields and then spread only a partial object into the renderer.
- Type every plugin-bound renderer from its stable owner descriptor:
  `PlateElementProps<typeof FooPlugin>` / `PlateLeafProps<typeof FooPlugin>`
  for live renderers and the matching `Plite*Props<typeof BaseFooPlugin>` for
  static renderers. Do not feed a derived node alias back into renderer props.
  Keep bare props only for deliberately schema-agnostic shared wrappers. This
  descriptor-derived shape is specific to renderers whose schema or plugin
  context changes their actual props; it is not a generic component-consistency
  pattern.
- Keep helpers inline when used once.
- Inline each locally owned component prop shape at the component signature.
  Same-file reuse does not earn a named `*Props` alias. Keep one only when it
  is exported through a real cross-file or published entrypoint contract; do
  not export it merely to avoid inlining. Honest state and domain types may be
  selected inside an inline shape. Enforce this with
  `node tooling/scripts/check-inline-component-props.mjs`.
- Split kits only where the kit itself owns different static/base and live
  renderers or behavior. Share runtime-neutral policy kits across both
  consumers, and compose renderer-specific peer kits in the owning editor
  preset. Do not create a base twin because an unrelated renderer kit was
  bundled into a neutral owner.
- Base and Plate constructors accept root-level `component`; Base `.extend()`
  does not. Static/base kits declare or terminally replace the owning
  server-safe component and never import `platejs/react` or any
  `platejs/*/react` entrypoint just to bind it.
- Use `toPlatePlugin()` at the owning React adapter to publish a reusable
  Plate-layer descriptor or add genuine Plate-only authoring. A terminal
  consumer never inserts conversion merely to set `component`.

### React Performance & Effects → [react-performance.md](./rules/react-performance.md)

- Target React `>=19.2`. Do not preserve React 18 compatibility patterns unless the user explicitly asks.
- Receive `ref` as a normal prop and use provider shorthand where it improves
  the component. Do not add `forwardRef` or React 18 branches.
- Effects are escape hatches, not state calculators.
- Derive during render unless synchronizing with a real external system.
- Put interaction logic in event handlers, not in effects watching state.
- Do not subscribe to fast-changing editor state unless the rendered output truly depends on it.
- Editable `onKeyDown` handlers run before built-in editor commands. Return
  `true` when copied UI claims the key; `preventDefault()` alone does not mark
  the Plate handler pipeline as handled.
- Do not define nested components inside components.

## Component Family Law → [component-family.md](./rules/component-family.md)

Read this reference for component families, registry feature variants, headless primitives, direct components/factories, and the Vercel advisory boundary.

### Registry Wiring → [registry.md](./rules/registry.md)

- Update `registry-features.ts`, `registry-editor.ts`, and
  `registry-examples.ts` together.
- Add explicit `registryDependencies` for every shared UI/style dependency.
- After source ownership is correct, declare every surviving direct runtime
  package and registry dependency. Metadata mirrors source; it never grants a
  generic host permission to require an optional feature.
- Build docs and primitive-agnostic registry items once. Resolve only named
  provider-boundary items at request/install time, preserve semantic item ids,
  and rewrite Plate self-dependencies to the requested supported style.
- If a component depends on shared CSS vars like highlight tokens, add the style registry dep.
- Examples should depend on kits plus any extra styles/components they introduce.
- Treat registry examples as teaching/install surfaces, not optimized host-app
  presets. Preserve explicit feature configuration when the example metadata
  names that feature kit or the source intentionally demonstrates its binding,
  even if the application editor installed by `editor-kit` contains the same
  descriptor. Append a terminal configuration of that authored plugin after
  the inherited application plugins so earlier fields survive and the explicit
  later configuration wins.
- Do not create a second list registry variant. Extend the standard list item
  family when list UI needs another capability.

### Registry Changelog

- User-visible registry UI, kit, example, metadata, style dependency, copied-code
  install shape, or generated registry changelog changes need a registry
  changelog entry or a concrete N/A reason.
- Use the `registry-changelog` skill for schema, scaffold, generation, and
  verification. Do not duplicate the entry contract here.

### Shadcn Proofing → [shadcn-proofing.md](./rules/shadcn-proofing.md)

- Keep `asChild`, `data-slot`, `data-state`, variants, and file shape recognizable.
- Prefer one readable family file with local subparts over scattering tiny
  hooks, factories, providers, or wrappers.
- Review custom code like an upstream diff: would this still feel like open source, or like framework sludge?

## Reusable Hook API Gate

Renderer-specific UI state usually stays app-local; cross-platform semantic
contracts are stronger package candidates. This is ownership pressure, not a
frozen public API answer. Use `best-api design/review` before introducing,
moving, or breaking a reusable component/hook surface.

If the accepted registry/component work changes a reusable API or canonical
consumer pattern, run `best-api repair` in the same task. Repair this skill only
where it teaches the affected pattern, regenerate its mirror, and audit copied
examples for the rejected call shape. Do not ship a local registry workaround
while package doctrine says something else, and do not wait for a later cleanup
prompt.

For copied UI mounted in a sibling render slot, accept only that slot's exact
ref. If the component is the complete common composition, own its default
children and register the component directly. A callback earns its place only
when the caller supplies real alternative composition; it must not exist merely
to forward the ref. Type the component with `EditableSiblingProps` or
`ContainerSiblingProps`, never a plugin-derived prop extractor. Delete
zero-caller option bags and `React.ComponentProps<typeof Primitive>`
intersections; retain a local optional prop only when an active component
consumer uses that composition.

For selection-, cursor-, or range-positioned UI, consume the domain geometry
hook with the exact Editable ref supplied by the plugin render slot. Keep
Floating UI middleware and virtual-reference adaptation in copied UI, import
the positioning library directly, and never recover geometry from the global
DOM selection or an implicit active editor.

For inactive canonical selection, mark only the owned external focus target or
ancestor with `data-plite-keep-selection-visible`. `Editor`/`PlateContent`
inherits the built-in lifecycle and copied UI styles
`data-plite-inactive-selection` and
`data-plite-inactive-selection-caret`. Do not add a boolean prop, mirror the
Range, write internal projected view selection, or create a registry install
item whose only artifact is that policy.

## Extraction Test

Extract to a package only if at least one is true:

1. The code owns document semantics, serialization, transforms, or navigation contracts.
2. Multiple UI surfaces or platforms need the same behavior contract.
3. The code is a stable semantic controller reused by multiple family members
   or surfaces and its output is not tied to one shadcn component's markup.
4. The same logic would otherwise be duplicated across packages or adapters.
5. A future native consumer could plausibly use the same conceptual contract.

Keep it local if any of these are true:

1. The code only serves one component.
2. The return shape is mostly labels, JSX wiring, class decisions, or popover/menu state.
3. The main reason to extract is "this file feels long" or "types are annoying".
4. The extraction would hide open-code structure from users.
5. The abstraction only makes sense in React/web and has no plausible native sibling.

## Key Patterns

```tsx
// Good: simple component owns its own renderer behavior directly.
function MediaImage(props: PlateElementProps<typeof ImagePlugin>) {
  const selected = useSelected();

  return <PlateElement {...props} data-selected={selected || undefined} />;
}

// Good: one reusable family controller coordinates complex siblings.
const tableResize = useTableResizeController();

// Good: host-owned app code outside copied registry UI uses its inferred editor.
const api = editor.api.comment;
const update = editor.update.comment;

// Good: generic UI code can use an exact descriptor.
const genericApi = editor.plugin(CommentPlugin).api;

// Good: optional generic integration keeps the typed portal and checks it.
const optionalComment = editor.plugin(CommentPlugin);

if (optionalComment.installed) {
  optionalComment.api.open();
}

// Good: package core owns commands/state, platform UI composes locally.
const canToggleBold = bridgeState.canToggleBold;
const onPress = () => editor.toggleBold();
return <Button disabled={!canToggleBold}>Bold</Button>;

// Good: base/live split stays explicit.
export const BaseFootnoteKit = [
  BaseFootnoteReferencePlugin.configure({
    component: FootnoteReferenceElementStatic,
  }),
  BaseFootnoteDefinitionPlugin.configure({
    component: FootnoteDefinitionElementStatic,
  }),
];

export const FootnoteKit = [
  FootnoteInputPlugin.configure({ component: FootnoteInputElement }),
  FootnoteReferencePlugin.configure({ component: FootnoteReferenceElement }),
  FootnoteDefinitionPlugin.configure({ component: FootnoteDefinitionElement }),
];

// Good: runtime-neutral policy is shared by both editor presets.
export const MarkdownKit = [
  MarkdownPlugin.configure({ options: { remarkPlugins: [remarkGfm] } }),
];

// Bad: package hook exists only to feed one shadcn component's local UI.
const state = useSingleComponentOnlyState();
return <Popover open={state.open}>...</Popover>;

// Bad: React-only package hook that mainly returns renderer glue.
const { dialogTitle, menuItems, onOpenChange, popoverOpen } =
  useToolbarMenuState();
```

## Workflow

1. Start with the `shadcn` skill. Run the normal `shadcn` docs/search workflow first.
2. Search Plate for the closest analog in
   `apps/www/src/registry/components/editor`, the applicable
   `apps/www/src/registry/bases/*` variant, and the relevant `packages/*`.
3. Decide ownership with the extraction test before writing code.
4. Decide the three layers before coding:
   - semantic core
   - platform adapter
   - local open-code UI
5. Choose the component-family shape before writing state/effects:
   - direct component by default
   - one terminal `use<Family>` only for a real semantic controller
   - one private context only when sibling coordination needs it
6. Apply the React checks before writing state/effects:
   - can this be derived during render?
   - should this stay in an event handler?
   - am I subscribing to more editor state than the UI actually renders?
7. Build the component as open code first.
8. Extract only the boundaries that survive the test.
9. Share runtime-neutral kits; wire base/live renderer kits and registry deps
   only where the renderer ownership actually differs.
10. Apply the registry changelog decision:

- user-visible registry change: add or update a registry changelog entry,
  run the generator, and run the registry changelog check
- not user-visible: record `N/A: <reason>`

11. If package exports changed, run `pnpm brl`.
12. If the work changed a reusable API or canonical consumer pattern, run the
    automatic `best-api repair` chain before closeout.
13. Verify the smallest honest surface:

- component spec for UI-only changes
- package build/typecheck when package code changed
- browser verification when the surface is interactive

## Audit References

- [component-audit.md](./references/component-audit.md) — concrete good patterns and anti-patterns from this repo

## Detailed References

- [ownership.md](./rules/ownership.md)
- [component-shape.md](./rules/component-shape.md)
- [cross-platform.md](./rules/cross-platform.md)
- [react-performance.md](./rules/react-performance.md)
- [registry.md](./rules/registry.md)
- [shadcn-proofing.md](./rules/shadcn-proofing.md)
