---
title: Slate v2 React hooks refs and use-memo lint need real render fixes
date: 2026-05-11
last_updated: 2026-05-23
category: docs/solutions/developer-experience
module: slate-v2 slate-react lint
problem_type: developer_experience
component: tooling
symptoms:
  - "bun lint failed after enabling reactHooks.configs.flat.recommended"
  - "react-hooks/refs reported render-time ref.current reads and writes"
  - "react-hooks/use-memo rejected one-shot constructor useMemo calls"
  - "react-hooks/preserve-manual-memoization stayed clean once dependencies were explicit"
  - "render-prop attributes.ref pass-through looked like ref access to the rule"
  - "react-hooks/set-state-in-effect rejected using an effect to mirror render-needed selector state"
root_cause: wrong_api
resolution_type: code_fix
severity: medium
tags: [slate-v2, slate-react, eslint, react-hooks, refs, compiler]
---

# Slate v2 React hooks refs and use-memo lint need real render fixes

## Problem

`react-hooks/refs` and `react-hooks/use-memo` are not React Compiler-only rules.
Keeping `reactHooks.configs.flat.recommended` means Slate v2 code must stop
reading or writing React refs during render and stop using `useMemo` as a
one-shot constructor escape hatch.

## Symptoms

- `bun lint` failed on `react-hooks/refs` in selector, decoration, annotation,
  widget, and example cleanup code.
- `useRef` was being used as a "latest value" container and updated directly in
  render.
- `EditableText` passed `attributes.ref` through Slate render props, which the
  rule flagged as "Passing a ref to a function may read its value during
  render."
- `useMemo(createThing, [])` failed because `use-memo` expects the first
  argument to be an inline function expression.
- Moving a last-known selector value into `useEffect` failed
  `react-hooks/set-state-in-effect` and added a pointless cascading render.

## What Didn't Work

- Disabling `react-hooks/refs` with the compiler-specific rules was wrong. The
  rule enforces core React ref semantics.
- Disabling `react-hooks/use-memo` and
  `react-hooks/preserve-manual-memoization` was also wrong. Those rules catch
  real manual memoization patterns that should be written as lazy state or
  explicit dependency lists.
- Moving latest-value ref writes into effects is only safe when the value is not
  needed by same-render external-store reads. For selector caches and projection
  sources, preserving the current behavior needs a stable mutable cell.
- Replacing all render-prop ref pass-through with wrapper DOM would change the
  public Slate render API and DOM ownership.

## Solution

Keep the recommended React Hooks preset and disable only the currently noisy
compiler mutation rule in `.tmp/slate-v2/eslint.config.mjs`:

```js
rules: {
  ...reactHooks.configs.flat.recommended.rules,
  'react-hooks/immutability': 'off',
}
```

For actual render-time ref access, replace React refs with stable hook-owned
cells created by lazy state initializers:

```tsx
const [cell] = useState(() => createGenericSelectorCell(equalityFn));

cell.equalityFn = equalityFn;
```

Use that pattern for selector/external-store internals where the current value
must be visible to same-render reads without touching `ref.current`.

Use lazy state for one-shot mutable constructors:

```tsx
const [controllerState] = useState(createEditableInputControllerState);
```

Keep `useMemo` for values that are genuinely derived from dependencies, and use
an inline function expression:

```tsx
const inputController = useMemo(
  () =>
    createEditableInputController({
      preferModelSelectionForInputRef,
      state: controllerState,
    }),
  [controllerState, preferModelSelectionForInputRef],
);
```

For selector-local memory that must affect the selected value itself, keep the
memory inside a stable selector factory instead of using a render-time ref or an
effect mirror:

```tsx
const createHistoryRootSelector = () => {
  let lastRoot = 'main';

  return (state) => {
    const root = selectSelectionRoot(state);

    if (root) {
      lastRoot = root;
    }

    return root ?? lastRoot;
  };
};

const historyRootSelector = useMemo(() => createHistoryRootSelector(), []);
const historyRoot = useSlateRuntimeState(historyRootSelector, {
  deps: [historyRootSelector],
});
```

This shape is valid only when the mutable value belongs to the selector's
external-store projection. Do not use it as a general replacement for React
state.

For stores that read app-owned lists, keep a stable source callback and refresh
after input changes:

```tsx
const [widgetsCell] = useState(() => ({ current: widgets }));

const store = useMemo(
  () =>
    createSlateWidgetStore(editor, () => widgetsCell.current, annotationStore),
  [annotationStore, editor, widgetsCell],
);

useEffect(() => {
  widgetsCell.current = widgets;
  store.refresh();
}, [store, widgets, widgetsCell]);
```

For effect-only cleanup refs, update refs inside an effect instead of render, or
delete unused refs.

The one valid local exemption is the Slate render-prop API. Passing
`attributes.ref` to `renderText` / `renderPlaceholder` is not a `ref.current`
read; it is the public render contract. Keep that exemption narrow and comment
it at the exact call site.

## Why This Works

The React refs rule catches mutable React ref access during render because React
does not track ref writes as render inputs. Stable cells avoid the specific
React ref contract while preserving the existing external-store cache behavior.

The render-prop exemption stays local because the public Slate API really does
hand callback refs to user render functions. Treating that as a global rule
disable would hide real ref bugs elsewhere.

## Prevention

- Do not classify `react-hooks/refs`, `react-hooks/use-memo`, or
  `react-hooks/preserve-manual-memoization` as compiler-specific.
- Prefer lazy `useState` cells over `useRef` when a hook-owned mutable cache must
  be read during render.
- Prefer lazy `useState` over `useMemo(fn, [])` for one-shot constructors.
- For selector-local fallback state, prefer a stable selector factory with an
  inline `useMemo(() => createSelector(), [])` call over ref reads or effect
  mirrors.
- Do not suppress `react-hooks/exhaustive-deps`; use lazy state cells when a
  stable instance is intentional.
- Keep compiler-specific suppressions narrow: `immutability` and rare local
  `incompatible-library` cases.
- Verify with `bun lint`, package typecheck, and hook/render tests after changing
  shared React hooks.

## Related Issues

- [Slate v2 tooling port should stage package build owners separately from repo-wide source lint](./2026-04-16-slate-v2-tooling-port-should-stage-build-owners-and-source-lint-separately.md)
- [Next Turbopack + React Compiler + workspace packages](./2026-03-11-next-turbopack-react-compiler-workspace-aliases.md)
- [Slate v2 React 19.2 cleanup should remove forwardRef not selection layout effects](./2026-04-07-slate-v2-react-19-2-cleanup-should-remove-forwardref-not-selection-layout-effects.md)
