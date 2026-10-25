# Lexical: rendering and DOM

## React subscriptions

- **`useLexicalSubscription` copies store values into React state.** It builds the subscription in `useMemo`, seeds `useState` from `initialValueFn()`, then subscribes in a layout effect that re-reads the initial value and calls `setValue` on every change (`facebook/lexical@dd5c41b13193efa9ab1574234d8593d2c9e4f988:packages/lexical-react/src/useLexicalSubscription.tsx:30-56`). It does not use `useSyncExternalStore`. The April 2026 Slate v2 package roadmap rejected this shape for its React runtime and kept `useSyncExternalStore` (`c70bacbd4a:docs/plite-draft/archive/package-end-state-roadmap.md:1027-1030`), which current Plite's selector hooks use (`packages/plitejs/src/react/hooks/use-generic-selector.tsx:117`). Limit: read from the local Lexical clone at that commit on 2026-10-08.

## Editor root ownership

- Lexical keeps the mounted root on the editor through `registerRootListener`, `getRootElement` and `setRootElement`; React ContentEditable registers its element through `editor.setRootElement`. The July DOM-scope comparison cites local `facebook/lexical:packages/lexical/src/LexicalEditor.ts:917` and `facebook/lexical:packages/lexical-react/src/shared/LexicalContentEditableElement.tsx:65` as evidence for editor-owned element scope rather than application wrapper ids. Source: `c70bacbd4a:docs/plans/2026-07-04-plite-dom-scope-ownership.md:174-177`. Limit: the local Lexical read has no recorded commit; this supports the ownership principle, not copying its imperative API into Plite.
