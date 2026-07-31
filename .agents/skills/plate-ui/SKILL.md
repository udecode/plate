---
description: Build new shadcn-style components for Plate's registry and editor surfaces. Use when authoring or refactoring registry UI/components, deciding what belongs in packages vs app-local component files, creating base/live kits and registry wiring, or applying React Compiler, Effects, accessibility, polymorphism, data-slot, data-state, and composable-component rules to Plate UI work.
name: plate-ui
metadata:
  skiller:
    source: .agents/rules/plate-ui.mdc
---

# Plate UI

Repo-specific companion to the `shadcn` skill.

Use the `shadcn` skill for CLI, upstream docs, and generic shadcn/ui rules.
Use this skill for Plate-specific component authorship: open-code preservation,
package extraction boundaries, base/live kit split, cross-platform layering,
and registry wiring.

## Repo Surfaces

- `apps/www/src/registry/ui` — live component and node renderers
- `apps/www/src/registry/components/editor/plugins` — base/live kit wiring
- `apps/www/src/registry/registry-*.ts` — registry metadata and dependencies
- `packages/*` — durable transforms, queries, controllers, and public hooks

## Principles

1. **Preserve open code.** A shadcn-derived component should still look like source code a user can own, read, diff, and tweak.
2. **Extract only durable boundaries.** Package code should own semantics, not JSX avoidance.
3. **Design below JSX.** Cross-platform reuse belongs in command/state contracts, controllers, queries, and transforms — not in package-owned shadcn composition.
4. **Keep UI composition local until proven otherwise.** Popovers, labels, and layout belong in the component unless multiple surfaces need the same contract.
5. **Registry wiring is part of authorship.** A component is not done until kits, examples, and style deps are coherent.
6. **React floor is 19.2+.** Do not add backward-compat code for React 18-era limitations or patterns.
7. **Classic registry surfaces are maintenance-only.** Do not invest in
   `*-classic` variants, including `list-classic`, while they await
   deprecation.
8. **Examples teach the install shape.** Do not remove an explicit feature
   plugin, kit, renderer binding, or dependency merely because an aggregate
   EditorKit also includes it. Deliberate repetition can make copied code and
   feature ownership transparent. Terminal configurations of the same authored
   plugin compose in source order, so append the explicit configuration after
   EditorKit and let its defined values win. Unrelated plugins and divergent
   authoring branches cannot share a name.

## Critical Rules

### Cross-Platform Layering → [cross-platform.md](./rules/cross-platform.md)

- `packages/*/src/lib` owns semantic core: transforms, queries, schemas, serialization, controllers, command/state contracts.
- `packages/*/src/react` is a thin adapter layer only.
- Future native layers should consume the same conceptual contracts, not React-specific convenience hooks.
- If a package React hook mainly returns renderer-specific UI props/state, treat it as migration debt, not precedent.

### Ownership & Extraction → [ownership.md](./rules/ownership.md)

- Extract package code for transforms, queries, serialization, stable controllers, and public hooks reused across surfaces.
- Keep one-off shadcn composition, labels, popover state, and local visual treatment in the app component.
- Never create a package hook just to hide JSX, avoid typing work, or move logic used by one component only.
- If extraction makes the component harder to compare with upstream shadcn/open code, keep it local.
- Package cleanup must not paste a package-owned transform, query, navigation
  controller, or other semantic algorithm into registry JSX. Keep or publish
  the durable package owner unless the behavior genuinely becomes UI-specific.
- Keep each independently installable registry item self-contained. Duplicate
  short presentation JSX, labels, or menu rows across items instead of adding a
  shared registry file/dependency. Extract only for an independently useful
  registry item or real behavior owner.
- For sibling live/static registry renderers, duplicate presentation lookup data
  and tiny label helpers in each renderer instead of creating a third shared
  registry file. Extract only when the shared code owns real behavior beyond
  labels, menu data, or copy.

### Component Shape & Editor Access → [component-shape.md](./rules/component-shape.md)

- Use `useElement()` for node-context element access. Treat `usePath()` as a
  reactive path dependency, not the default way to obtain a path.
- In repeated node renderers, do not subscribe with `usePath()` when a path is
  needed only inside an event handler or command. Resolve
  `editor.read.nodes.path(element)` at interaction time. Use the existing
  `PlateElementProps.path` when rendered output genuinely depends on the path.
- Keep `usePath()` only when a descendant must rerender or resynchronize as its
  element moves and no path prop is already available. Account for that
  dependency in the repeated-unit subscription budget.
- Prefer direct `editor.api.<pluginName>` / `editor.update.<group>` in concrete
  host-owned app code with a complete inferred kit. Copied registry UI is
  generic by definition: never import its host editor type or use root plugin
  namespaces there. Use `editor.plugin(plugin)` or `useEditorPlugin(plugin)`.
  For an optional descriptor, check `editor.plugin(plugin).installed` before
  accessing its portal. Do not infer optional availability from root
  `editor.api`, node types, schema properties, or caught access errors. Do not
  add local wrapper helpers around either path.
- If a node renderer forwards to `PlateElement` or `SlateElement`, keep the full incoming `props` object intact. Read from `props`, but do not destructure away `editor`, `element`, or other required fields and then spread only a partial object into the renderer.
- Keep helpers inline when used once.
- Split kits only where the kit itself owns different static/base and live
  renderers or behavior. Share runtime-neutral policy kits across both
  consumers, and compose renderer-specific peer kits in the owning editor
  preset. Do not create a base twin because an unrelated renderer kit was
  bundled into a neutral owner.
- Base and Plate constructors accept root-level `component`; Base `.extend()`
  does not. Static/base kits declare or terminally replace the owning
  server-safe component and never import `platejs/react`, `@platejs/core/react`,
  or any `@platejs/*/react` entrypoint just to bind it.
- Use `toPlatePlugin()` at the owning React adapter to publish a reusable
  Plate-layer descriptor or add genuine Plate-only authoring. A terminal
  consumer never inserts conversion merely to set `component`.

### React Performance & Effects → [react-performance.md](./rules/react-performance.md)

- Target React `>=19.2`. Do not preserve React 18 compatibility patterns unless the user explicitly asks.
- Effects are escape hatches, not state calculators.
- Derive during render unless synchronizing with a real external system.
- Put interaction logic in event handlers, not in effects watching state.
- Do not subscribe to fast-changing editor state unless the rendered output truly depends on it.
- Do not define nested components inside components.

### Registry Wiring → [registry.md](./rules/registry.md)

- Update `registry-kits.ts`, `registry-ui.ts`, and `registry-examples.ts` together.
- Add explicit `registryDependencies` for every shared UI/style dependency.
- If a component depends on shared CSS vars like highlight tokens, add the style registry dep.
- Examples should depend on kits plus any extra styles/components they introduce.
- Treat registry examples as teaching/install surfaces, not optimized host-app
  presets. Preserve explicit feature configuration when the example metadata
  names that feature kit or the source intentionally demonstrates its binding,
  even if EditorKit installs the same descriptor transitively. Append a terminal
  configuration of that authored plugin after EditorKit so earlier fields
  survive and the explicit later configuration wins.
- Do not create, modernize, polish, or parity-sync `*-classic` registry
  variants, including `list-classic`. Touch an existing classic surface only
  for a user-facing regression, security/release blocker, or an explicitly
  authorized deprecation/removal. Planned deprecation is not deletion
  authority; new component work targets the modern surface.

### Registry Changelog

- User-visible registry UI, kit, example, metadata, style dependency, copied-code
  install shape, or generated registry changelog changes need a registry
  changelog entry or a concrete N/A reason.
- Use the `registry-changelog` skill for schema, scaffold, generation, and
  verification. Do not duplicate the entry contract here.

### Shadcn Proofing → [shadcn-proofing.md](./rules/shadcn-proofing.md)

- Keep `asChild`, `data-slot`, `data-state`, variants, and file shape recognizable.
- Prefer one readable file with local subparts over scattering tiny hooks.
- Review custom code like an upstream diff: would this still feel like open source, or like framework sludge?

## Reusable Hook API Gate

Renderer-specific UI state usually stays app-local; cross-platform semantic
contracts are stronger package candidates. This is ownership pressure, not a
frozen public API answer. Use `best-api design/review` before introducing,
moving, or breaking a reusable component/hook surface.

## Extraction Test

Extract to a package only if at least one is true:

1. The code owns document semantics, serialization, transforms, or navigation contracts.
2. Multiple UI surfaces or platforms need the same behavior contract.
3. The code is a stable controller/hook whose output is not tied to one shadcn component's markup.
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
// Good: package owns stable semantics, UI composes locally.
const { align, focused, readOnly, selected } = useMediaState();
return (
  <MediaToolbar plugin={ImagePlugin}>
    <PlateElement {...props}>...</PlateElement>
  </MediaToolbar>
);

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
2. Search Plate for the closest analog in `apps/www/src/registry/ui`, `apps/www/src/registry/components/editor/plugins`, and the relevant `packages/*`.
3. Decide ownership with the extraction test before writing code.
4. Decide the three layers before coding:
   - semantic core
   - platform adapter
   - local open-code UI
5. Apply the React checks before writing state/effects:
   - can this be derived during render?
   - should this stay in an event handler?
   - am I subscribing to more editor state than the UI actually renders?
6. Build the component as open code first.
7. Extract only the boundaries that survive the test.
8. Share runtime-neutral kits; wire base/live renderer kits and registry deps
   only where the renderer ownership actually differs.
9. Apply the registry changelog decision:
   - user-visible registry change: add or update a registry changelog entry,
     run the generator, and run the registry changelog check
   - not user-visible: record `N/A: <reason>`
10. If package exports changed, run `pnpm brl`.
11. Verify the smallest honest surface:

- component spec for UI-only changes
- package build/typecheck when package code changed
- browser verification when the surface is interactive

## Audit References

- [component-audit.md](./references/component-audit.md) — concrete good patterns and anti-patterns from this repo

## Comprehensive References

Load these only when the task needs the detail:

- `.agents/rules/plate-ui/references/components.md` — comprehensive component architecture reference: accessibility, `asChild`, composition, data attributes, artifact taxonomy, polymorphism, controlled/uncontrolled state, and component typing.
- `.agents/rules/plate-ui/references/react.md` — comprehensive React reference: React Compiler, manual memoization escape hatches, Effects, `useEffectEvent`, ref access, derived state, Tailwind v4 syntax, data attributes, and UI constraints.

## Detailed References

- [ownership.md](./rules/ownership.md)
- [component-shape.md](./rules/component-shape.md)
- [cross-platform.md](./rules/cross-platform.md)
- [react-performance.md](./rules/react-performance.md)
- [registry.md](./rules/registry.md)
- [shadcn-proofing.md](./rules/shadcn-proofing.md)
