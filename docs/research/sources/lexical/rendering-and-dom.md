# Lexical: rendering and DOM

## React subscriptions

- **`useLexicalSubscription` copies store values into React state.** It builds the subscription in `useMemo`, seeds `useState` from `initialValueFn()`, then subscribes in a layout effect that re-reads the initial value and calls `setValue` on every change (`facebook/lexical@dd5c41b13193efa9ab1574234d8593d2c9e4f988:packages/lexical-react/src/useLexicalSubscription.tsx:30-56`). It does not use `useSyncExternalStore`. The April 2026 Slate v2 package roadmap rejected this shape for its React runtime and kept `useSyncExternalStore` (`c70bacbd4a:docs/plite-draft/archive/package-end-state-roadmap.md:1027-1030`), which current Plite's selector hooks use (`packages/plitejs/src/react/hooks/use-generic-selector.tsx:117`). Limit: read from the local Lexical clone at that commit on 2026-10-08.

## Editor root ownership

- Lexical keeps the mounted root on the editor through `registerRootListener`, `getRootElement` and `setRootElement`; React ContentEditable registers its element through `editor.setRootElement`. The July DOM-scope comparison cites local `facebook/lexical:packages/lexical/src/LexicalEditor.ts:917` and `facebook/lexical:packages/lexical-react/src/shared/LexicalContentEditableElement.tsx:65` as evidence for editor-owned element scope rather than application wrapper ids. Source: `c70bacbd4a:docs/plans/2026-07-04-plite-dom-scope-ownership.md:174-177`. Limit: the local Lexical read has no recorded commit; this supports the ownership principle, not copying its imperative API into Plite.

## DOM slots and decorators

- **Child placement stays inside Lexical's DOM bridge.** ElementNode.getDOMSlot supplies the child-content slot; selection import resolves child indexes through that slot, and selection export accounts for its first-child offset. DecoratorNode separately declares isolation, inline and keyboard-selection behavior, while React renders decorators through portals. Evidence: `facebook/lexical@dd5c41b13193efa9ab1574234d8593d2c9e4f988:packages/lexical/src/nodes/LexicalElementNode.ts:816`, `facebook/lexical:packages/lexical/src/LexicalSelection.ts:2846`, `:3741`, `facebook/lexical:packages/lexical/src/nodes/LexicalDecoratorNode.ts:69-83`, and `facebook/lexical:packages/lexical-react/src/shared/useDecorators.tsx:26-81`, inspected locally. Source: `c70bacbd4a:docs/plans/2026-05-02-plite-hidden-subtree-first-class-ralplan.md:194-225`, whose original checkout was unpinned. Limit: these mechanisms establish explicit placement and decorator ownership; they do not establish arbitrary hidden editable-descendant support.

## Dirty reconciliation

- **Dirty scope enters reconciliation explicitly.** Lexical passes dirty type, dirty elements and dirty leaves into `$reconcileRoot`; its commit path disconnects the DOM observer around reconciliation, resets dirty collections afterward and garbage-collects detached decorators. Evidence: `facebook/lexical@dd5c41b13193efa9ab1574234d8593d2c9e4f988:packages/lexical/src/LexicalReconciler.ts:2060-2085` and `facebook/lexical:packages/lexical/src/LexicalUpdates.ts:605-642`, `:680-701`, reread locally. Source: `docs/plans/2026-05-08-plite-performance-scalability-plite-issues-ralplan.md:667-674`. Limit: the May plan pinned no external revision and its old line numbers have moved; these source mechanisms do not establish a latency result.
