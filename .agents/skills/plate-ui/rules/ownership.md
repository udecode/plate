# Ownership & Extraction

## Contents

- What belongs in packages
- What stays app-local
- Package extraction smell test
- Good vs bad extraction

---

## What belongs in packages

Extract to a package when the code owns a durable contract:

- transforms
- queries
- serialization/deserialization
- stable controllers reused across surfaces
- public semantic controllers with an independent cross-family job
- headless React primitives whose contract is reusable DOM behavior and
  accessibility

If package cleanup would paste one of those bodies into registry JSX, stop.
That is an ownership regression, not colocation. Keep or publish the package
owner unless the behavior genuinely becomes renderer-specific.

An existing exported hook is evidence to audit, not proof that the extraction
is correct. Apply the zero-or-one controller law from the `plate-ui` owner.

## Trace terminal consumers

Follow the consumer graph through package components, adapters, barrels, and
reexports until reaching the product surfaces that actually use the behavior.
Intermediate package wrappers do not create reuse.

A React hook, store, provider, hotkey controller, or plugin extension belongs in
a package only when:

- multiple independent terminal owners reuse its contract; or
- it owns a durable headless semantic, DOM, accessibility, or integration
  subsystem that is useful without Plate's copied UI.

When every terminal consumer is copied registry UI and the behavior is UI or
product policy, move the complete owner into that registry component family or
kit. Move its private state and plugin extension with it; moving only the hook
leaves a dishonest split owner. Multiple subcomponents, live/static siblings,
or registry files inside one family are one terminal owner.

These are not independent terminal consumers:

- the package component that forwards the hook result;
- public barrels and reexports;
- tests and docs;
- app wrappers that exist only to mount the copied registry item.

---

## What stays app-local

Keep it in `apps/www/src/registry/components/editor` when it is mostly:

- popover open state
- hover content
- labels and copy
- presentation lookup tables duplicated across live/static renderer siblings
- one-off styling
- JSX composition
- local recovery affordances

**Bad reason to extract:** "the file feels long"

**Bad reason to extract:** "the types are annoying"

**Bad reason to keep in a package:** "the registry imports a package wrapper"

---

## Package extraction smell test

Do **not** extract when most of the return value is:

- labels
- booleans used by one component
- class decisions
- one component's menu items
- one component's event handlers

If the hook name means "private state/props for this one renderer", keep the
logic in the direct component. Do not rename the prop bag into a controller.

If the same hook also synchronizes reusable DOM state, do not keep the whole
return bag. Split out the smallest lifecycle hook and make side-effect-only
adapters return `void`; keep sizing, layout, transient previews, rounding, and
mouse/keyboard handlers in the renderer. Do not export the remaining pure
calculation unless another independent owner actually consumes it.

For registry siblings like `*-node.tsx` and `*-node-static.tsx`, do not extract
a third registry helper just to share labels, menu items, or display names.
Duplicating that local presentation data keeps each installed registry file
easier to read and copy.

---

## Good vs bad extraction

**Incorrect:**

```tsx
// Package hook only used by one component and mostly returns UI glue.
const state = useSingleComponentOnlyState();
```

**Correct:**

```tsx
// Package owns a stable semantic controller reused by multiple surfaces.
const toc = useToc();

// App owns local composition.
return toc.items.map((item) => (
  <Button key={item.id}>{item.title}</Button>
));
```
