---
'@udecode/react-utils': major
---

Require React and React DOM 19.2 or newer.

- Export direct React 19 `Box` and `Text` components
- Remove `createPrimitiveComponent`, `createPrimitiveElement`, `createSlotComponent`, `withProviders`, `useEffectOnce`, `useMemoizedSelector`, `useStableMemo`, and `withRef`
- Fix portal containers, hidden slot primitives, callback refs, and outside-click listener lifecycles

**Migration:** Write direct components and use React effects, memoization, external-store selectors, provider shorthand, and ref props directly.
