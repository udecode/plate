# Component Family Law

## Component Family Law

Start with a direct component. Keep `useState`, `useReducer`, subscriptions,
derived values, and handlers in that component while one component owns them.
File length is not a reason to manufacture a hook.

A durable component family has exactly these possible owners:

```text
<Family>.tsx           required component-family owner
use<Family>.ts[x]      optional single semantic controller
<Family>Context.ts[x]  exceptional independent lifecycle/reuse owner
```

- `<Family>.tsx` owns the main component, family-only subcomponents, variants,
  render helpers, component-local constants, and direct React/Plate hook calls
  inside simple subcomponents.
- Create `use<Family>` only when one semantic controller coordinates multiple
  family members or is reused by multiple surfaces. It may own subscriptions,
  effects, commands, and derived domain state. Its return type is the family
  contract; export it only for real cross-surface reuse. Do not expose a raw
  store or prop factory beside it.
- A hook called by one component and returning refs, event handlers, styles,
  or a state-shaped prop bag is not a controller. Inline it into that component.
  When several independent registry items need the same interactive family,
  publish a semantic compound component with private context instead of making
  callers spread controller state into sibling components.
- When that controller coordinates several siblings, publish its result through
  one private family context. Do not spread the complete controller object into
  an intermediate panel component and call that colocation.
- A family gets zero or one custom controller hook. Never build
  `useFooState -> useFoo`, `stateHook -> propsHook`, `useFooProps`, or
  `ReturnType<typeof useFooState>` pipelines.
- Never export one custom hook per subcomponent. Simple subcomponents call
  React and Plate hooks directly. Complex siblings read one private family
  context populated by `use<Family>`.
- Do not define named custom hooks in plugin descriptor files. A reusable
  semantic controller lives in `use<Family>.ts[x]`; component-local logic stays
  in `<Family>.tsx`.
- Keep context, provider, and store private to the family. Give one a separate
  public file only when it has an independent lifecycle or is consumed by
  multiple component families.
- Keep React roots flat. `components/`, `hooks/`, `providers/`, and one-file
  subdirectories are taxonomy, not ownership.
- Keep copied registry roots flat too. Do not create `editor/plugins`,
  `editor/kits`, `editor/nodes`, `editor/hooks`, `components/plate`, or nested
  feature folders. Prefix independently installable siblings (`media-image`,
  `media-video`) and inline family-only subcomponents.

## Registry Feature And Variant Law

- The registry item and installed file use the feature name: `@plate/link`
  installs `components/editor/link.tsx`.
- A standalone renderer or component uses its semantic feature name:
  `blockquote.tsx`, `heading.tsx`, `media-image.tsx`. Never encode the
  implementation role in `*-node`, `*-element`, or another taxonomy suffix.
  Aggregate files such as `basic-blocks.tsx` compose those semantic owners;
  they do not absorb them or justify preserving the old suffix.
- The feature file owns its kit plus every renderer, family-only component,
  helper, and tiny static peer used only by that feature. Reject a shallow
  `feature.tsx` kit shell that imports its renderer from `feature-node.tsx`, or
  any equivalent family-only split. A sibling file survives only for an
  independently installable main component, the one allowed semantic
  controller, a shared component used by multiple feature owners, or another
  durable boundary with its own consumers and proof. Independence earns a
  semantic sibling such as `media-image.tsx`, never
  `media-image-node.tsx`.
- A large icon set, constant table, or output helper with one feature consumer
  stays in that feature owner. File size and generated-looking SVG volume do
  not create an install boundary or justify reverse registry dependencies.
- The exported composition value uses `Kit`: `LinkKit`. Keep this stable even
  at one descriptor because it is the app-owned membership boundary. Package
  roots still cannot export opinionated kit arrays.
- Live/static is a real module boundary: `link.tsx` may export `LinkKit`, while
  `link-static.tsx` may export `BaseLinkKit`. Do not encode static ownership in
  a `base-kit` filename or item. The static feature file also owns static
  renderers used only by that feature; do not recreate `feature-node-static`.
  A registry item that publishes both live and static source is split into
  `foo` and `foo-static`, so client installs never own the server boundary.
- `editor.tsx` / `editor-static.tsx` own presentation;
  `plugins.ts` / `plugins-static.ts` own application composition. A complete
  block may add `plate-editor.tsx`, but that file remains block-owned. Optional
  generated contracts follow the composition owner as `plugins.generated.ts`
  and `plugins.schema.json`.
- Primitive variants live only in registry author source. Radix, Base UI, and
  React Aria implementations install to the same flat path and expose one
  stable editor-facing component contract. Do not leak `asChild`, `render`, or
  another primitive-specific composition prop into shared feature callers when
  a repeated editor component can own the difference.
- Do not leak a primitive library's component type through an exported registry
  component. Define a small Plate-owned prop contract and keep Ariakit, Radix,
  Base UI, or React Aria types inside the implementation.
- Do not create a shipped helper merely to deduplicate mutually exclusive
  variants. Duplicate small variant source or extract a real editor component
  with independent consumers. Typecheck and browser-test every supported base.

```tsx
// Simple family: direct behavior, no custom hook.
export function LinkToolbar() {
  const editor = useEditor();
  const [open, setOpen] = React.useState(false);

  return <Popover open={open} onOpenChange={setOpen}>...</Popover>;
}

// One controller coordinates state consumed by several table siblings.
function useTableResizeController() {
  const [columnOverrides, setColumnOverrides] = React.useState(new Map());

  return { columnOverrides, setColumnOverrides };
}

// The root publishes one private context to rows, cells, and handles.
function TableRoot() {
  const controller = useTableResizeController();

  return (
    <TableResizeContext value={controller}>
      <TableRows />
      <TableResizeHandles />
    </TableResizeContext>
  );
}
```

## Headless Primitive Law

A package may export a React component when reusable DOM behavior and
accessibility are the contract, not merely to hide registry JSX. Examples are
`Resizable` and `ResizeHandle`.

- The package primitive owns pointer, touch, keyboard, RTL, focus, ARIA, and
  transient interaction state.
- The registry owns styling, labels, editor-specific persistence, product
  composition, and copied open-code layout.
- Prefer flat props over an `options={{ ... }}` bag.
- Export the smallest useful primitive set. Do not export its private provider,
  store, state hook, or state-to-props adapter.
- Do not label a mixed renderer bag "headless" because it contains one durable
  DOM effect. Extract the lifecycle as its own minimal hook and localize every
  renderer-facing return value. A pure one-family helper remains private even
  after the public bag is deleted.
- A package component mounted only by its own plugin is implementation, even
  when it needs a separate React file. Keep it out of the public barrel.
  Separate source ownership never grants public API ownership.
- A package hook is public only when it is an independently useful semantic
  controller with independent terminal consumers or a durable headless
  subsystem contract. A package wrapper that feeds only copied registry UI is
  not another consumer. Such a hook is registry implementation and normally
  stays inside the component family.

## Direct Component And Factory Law

Write direct components and ordinary composition. Delete or reject
`createPrimitiveComponent`, `createPrimitiveElement`, `createSlotComponent`,
`withHOC`, `withProps`, `withVariants`, and `withCn` when they merely hide a
small fixed component set. A factory or HOC needs independently authored
consumers, a smaller public contract than direct components, and real runtime
or type proof. Polymorphism (`as`, `asChild`) is public only when production
consumers use it; speculative flexibility is API debt.

Use semantic HTML first. Keyboard behavior, focus, and ARIA belong with the
primitive that owns the interaction. Use stable kebab-case `data-slot` for
component identity and `data-state` for interaction/visual state. Keep Tailwind
v4 syntax canonical: slash opacity, parenthesized CSS variables, suffix `!`,
and canonical utilities.

## Vercel Advisory Boundary

`vercel-react-best-practices` and `vercel-composition-patterns` provide selected
implementation tactics. They do not decide Plate public APIs, extraction,
file ownership, or provider visibility.

- Load exact rule files for the problem; never import the whole catalog as
  doctrine.
- `rerender-split-combined-hooks` may justify splitting internal calculations
  or effects. It never requires multiple public hooks or files.
- Context-interface, lifted-state, compound-component, and provider patterns
  need real independent composition. They do not automatically earn a public
  provider or store.
- Performance advice may optimize an accepted Plate shape; it cannot replace
  the component-family, headless-primitive, or open-code laws above.
