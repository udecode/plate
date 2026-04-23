# React Performance & Effects

## Contents

- React floor
- Effects are escape hatches
- Derive during render
- Event handlers before effects
- Subscribe narrowly
- No inline component definitions
- Use memo only when it pays rent

---

## React floor

Target React `>=19.2`.

Do **not** add backward-compat code for React 18-era behavior, legacy
workarounds, or older hook patterns unless the user explicitly asks for
compatibility work.

---

## Effects are escape hatches

Use an Effect only when synchronizing with an external system:

- DOM measurement
- subscriptions
- imperative widgets
- analytics/logging because something displayed

Do **not** use Effects to shuffle local render data around.

---

## Derive during render

**Incorrect:**

```tsx
const [isActive, setIsActive] = React.useState(false);

React.useEffect(() => {
  setIsActive(selected && focused);
}, [selected, focused]);
```

**Correct:**

```tsx
const isActive = selected && focused;
```

If the calculation is expensive, use `useMemo`. If it is cheap, just compute it.

---

## Event handlers before effects

If the logic happens because the user clicked, typed, submitted, or pressed a
toolbar button, keep it in the event handler.

**Incorrect:**

```tsx
React.useEffect(() => {
  if (open) {
    focusFirstItem();
  }
}, [open]);
```

when `open` is only changed by a local user action.

**Correct:**

```tsx
const onOpenChange = (nextOpen: boolean) => {
  setOpen(nextOpen);
  if (nextOpen) focusFirstItem();
};
```

---

## Subscribe narrowly

Do not subscribe to broad editor state if the UI only needs one tiny fact.

Bad patterns:

- subscribing to raw selection when you only need a derived boolean
- subscribing to state only used inside a callback
- re-reading large editor data on every cursor move for a tiny visual affordance

Prefer:

- package/controller selectors that return stable booleans or small slices
- `useEditorSelector` with the smallest honest output
- local derived booleans instead of raw state objects

---

## No inline component definitions

Do not define a component inside another component body.

**Incorrect:**

```tsx
function Toolbar() {
  function Item() {
    return <Button>Bold</Button>;
  }

  return <Item />;
}
```

**Correct:**

```tsx
function ToolbarItem() {
  return <Button>Bold</Button>;
}

function Toolbar() {
  return <ToolbarItem />;
}
```

---

## Use memo only when it pays rent

Do not wrap simple expressions or cheap booleans in `useMemo`.

Use `useMemo` when:

- the work is actually expensive
- or it protects a meaningful child render boundary

Do not add memoization just to feel clever.
