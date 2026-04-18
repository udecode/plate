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
   - stable view-model hooks that could plausibly have a native sibling

3. **Open UI (`apps/www/src/registry/ui`)**
   - shadcn composition
   - local labels/copy
   - menu/popover/dialog state
   - class decisions
   - one-surface event wiring

---

## What React packages may own

React package hooks are valid when they expose a stable capability contract,
not one component's private renderer glue.

Good:

- `useMediaState`
- `useTocElementState`
- `useEquationElement`

These own state/effects with clear domain meaning.

---

## What React packages may not own

Do **not** put these in package React hooks:

- menu item arrays
- shadcn popover open state
- labels/copy
- one renderer's class decisions
- one component's local recovery buttons
- a bag of props that only one renderer consumes

If the hook mostly exists to make one TSX file shorter, it does not belong in
the package.

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
