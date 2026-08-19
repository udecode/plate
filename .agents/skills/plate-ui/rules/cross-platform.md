# Cross-Platform Layering

## Contents

- Three-layer model
- What React packages may own
- What React packages may not own
- 10tap lesson

---

## Three-layer model

Build new component capabilities in three layers:

1. **Semantic core (`packages/*/src/lib`)**
   - transforms
   - queries
   - schema/types
   - serialization
   - controllers
   - command/state contracts

2. **Platform adapter (`packages/*/src/react`, future native adapter)**
   - React effects
   - DOM observers
   - store/context binding
   - one terminal semantic controller when multiple family members or surfaces
     need the same lifecycle
   - headless DOM primitives whose behavior and accessibility are reusable

3. **Open UI (`apps/www/src/registry/components/editor`)**
   - shadcn composition
   - local labels/copy
   - menu/popover/dialog state
   - class decisions
   - one-surface event wiring

---

## What React packages may own

React package hooks are valid when one terminal controller exposes a stable
capability contract reused by independent families/surfaces, or when the hook
owns a durable semantic, DOM, accessibility, or integration lifecycle. A
domain-sounding name does not rescue a prop bag used by one component.

Split mixed hooks. Keep reusable subscription, observer, imperative DOM
projection, and cleanup in a minimal package hook; a side-effect-only adapter
takes the required ref/controller and returns `void`. The open UI derives
renderer state and owns transient overrides, rounding, styles/refs used only as
props, and event handlers. A pure calculation with one family owner stays local.

---

## What React packages may not own

Do **not** put these in package React hooks:

- menu item arrays
- shadcn popover open state
- labels/copy
- one renderer's class decisions
- one component's local recovery buttons
- a bag of props that only one renderer consumes
- `useFooState -> useFoo`, `stateHook -> propsHook`, or one hook per
  subcomponent
- a public provider/store for state private to one component family

If the hook mostly exists to make one TSX file shorter, inline it. If complex
siblings share real lifecycle, use one private family context backed by one
`use<Family>` controller.

---

## 10tap lesson

`10tap-editor` is useful because it keeps a platform-facing capability contract
separate from the UI that consumes it.

Copy:

- stable command/state contracts
- extension-owned capabilities
- UI composition on top

Do not copy:

- a monolithic bridge as the only API
- hiding ordinary UI composition in the shared layer
- forcing web and native to share presentational hooks
