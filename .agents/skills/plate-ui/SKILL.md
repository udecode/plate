---
description: Build new shadcn-style components for Plate's registry and editor surfaces. Use when authoring or refactoring registry UI/components, deciding what belongs in packages vs app-local component files, or creating new base/live kits and registry wiring.
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
2. **Extract only durable seams.** Package code should own semantics, not JSX avoidance.
3. **Design below JSX.** Cross-platform reuse belongs in command/state contracts, controllers, queries, and transforms — not in package-owned shadcn composition.
4. **Keep UI composition local until proven otherwise.** Popovers, labels, and layout belong in the component unless multiple surfaces need the same contract.
5. **Registry wiring is part of authorship.** A component is not done until kits, examples, and style deps are coherent.
6. **React floor is 19.2+.** Do not add backward-compat code for React 18-era limitations or patterns.

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

### Component Shape & Editor Access → [component-shape.md](./rules/component-shape.md)

- Node renderers use node-context hooks like `useElement()` or `usePath()` when they are in element context.
- Prefer direct `editor.getApi(plugin)` / `editor.getTransforms(plugin)` or `useEditorPlugin(plugin)` over local wrapper helpers.
- If a node renderer forwards to `PlateElement` or `SlateElement`, keep the full incoming `props` object intact. Read from `props`, but do not destructure away `editor`, `element`, or other required fields and then spread only a partial object into the renderer.
- Keep helpers inline when used once.
- Split static/base and live kits cleanly.

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

### Shadcn Proofing → [shadcn-proofing.md](./rules/shadcn-proofing.md)

- Keep `asChild`, `data-slot`, `data-state`, variants, and file shape recognizable.
- Prefer one readable file with local subparts over scattering tiny hooks.
- Review custom code like an upstream diff: would this still feel like open source, or like framework sludge?

## Major-Release Law

For the future redesign, use this as the default:

**Package React hooks that mainly return renderer-specific UI props/state
should be deprecated and moved app-local. Package layers keep cross-platform
semantic/view-model contracts only.**

If an existing hook breaks this law, do not copy it into new work just because
it already exists.

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

// Good: direct plugin access, no local wrapper layer.
const api = editor.getApi(CommentPlugin).comment;
const tf = editor.getTransforms(CommentPlugin).comment;

// Good: package core owns commands/state, platform UI composes locally.
const canToggleBold = bridgeState.canToggleBold;
const onPress = () => editor.toggleBold();
return <Button disabled={!canToggleBold}>Bold</Button>;

// Good: base/live split stays explicit.
export const BaseFootnoteKit = [
  BaseFootnoteReferencePlugin.withComponent(FootnoteReferenceElementStatic),
  BaseFootnoteDefinitionPlugin.withComponent(FootnoteDefinitionElementStatic),
];

export const FootnoteKit = [
  FootnoteInputPlugin.withComponent(FootnoteInputElement),
  FootnoteReferencePlugin.withComponent(FootnoteReferenceElement),
  FootnoteDefinitionPlugin.withComponent(FootnoteDefinitionElement),
];

// Bad: package hook exists only to feed one shadcn component's local UI.
const state = useSingleComponentOnlyState();
return <Popover open={state.open}>...</Popover>;

// Bad: React-only package hook that mainly returns renderer glue.
const {
  dialogTitle,
  menuItems,
  onOpenChange,
  popoverOpen,
} = useToolbarMenuState();
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
7. Extract only the seams that survive the test.
8. Wire base/live kits and registry deps.
9. If package exports changed, run `pnpm brl`.
10. Verify the smallest honest surface:
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
