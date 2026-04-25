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
- public React hooks with domain meaning, not component wiring

**Good examples in this repo:**

- `packages/media/src/react/media/useMediaState.ts`
- `packages/toc/src/react/hooks/useTocElement.ts`
- `packages/footnote/src/lib/transforms/createFootnoteDefinition.ts`

---

## What stays app-local

Keep it in `apps/www/src/registry/ui` when it is mostly:

- popover open state
- hover content
- labels and copy
- one-off styling
- JSX composition
- local recovery affordances

**Bad reason to extract:** "the file feels long"

**Bad reason to extract:** "the types are annoying"

---

## Package extraction smell test

Do **not** extract when most of the return value is:

- labels
- booleans used by one component
- class decisions
- one component's menu items
- one component's event handlers

If the hook name effectively means "the private state for this one renderer",
keep it local.

---

## Good vs bad extraction

**Incorrect:**

```tsx
// Package hook only used by one component and mostly returns UI glue.
const state = useSingleComponentOnlyState();
```

**Correct:**

```tsx
// Package owns stable semantics.
const { activeContentId, headingList } = useTocElementState();

// App owns local composition.
return headingList.map((item) => (
  <Button key={item.id}>{item.title}</Button>
));
```
