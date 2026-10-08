# ProseKit: rendering and dom

## Read-only toggling

- **Read-only toggle.** `prosekit/prosekit@3fbfe7906c3448328e80c1c1333647d08e50907e:registry/test/readonly.test.ts` (L9) pins that toggling read-only changes edit authority at once, and that typing cannot change the document while read-only. Plite covers read-only behavior, selection and copy included, in `apps/plite/tests/plite-browser/donor/examples/read-only.test.ts` and `packages/plitejs/test/react/plite-runtime-provider-contract.test.tsx`, and Plate covers runtime read-only changes per mounted view in `packages/platejs/src/react/components/PlateContent.spec.tsx` (`docs/editor-test-harvester/prosekit/report.md:143`).

## Several editors and teardown

- **Teardown.** `prosekit/prosekit@3fbfe7906c3448328e80c1c1333647d08e50907e:registry/test/unmount.test.ts` (L24, L79) pins that removing one of several mounted editors leaves the others intact, and that an editor whose inline menu was shown unmounts cleanly. Plite covers the lifecycle in `packages/plitejs/test/react/editable-dom-runtime-contract.test.tsx` ('destroy releases listeners, anchors, disposables, and scheduler work') and in `dom-integrity-observer-contract.test.ts` beside it ('disconnects old roots, remounts cleanly, and stops after destroy'), and Plate in `packages/platejs/src/react/editor/usePlateViewEditor.spec.tsx` (`docs/editor-test-harvester/prosekit/report.md:145`).

## Framework node views

- **Framework node views.** `prosekit/prosekit@3fbfe7906c3448328e80c1c1333647d08e50907e:registry/test/view-adapter.test.ts` and the node-view specs in ProseKit's React, Preact, Solid, Svelte and Vue packages pin that a framework renderer can own a node's presentation while the editor keeps the node's identity, position and teardown. Plate renders through React only; its packages are `platejs`, `plitejs`, a CLI and test helpers, with no other framework adapter. Non-React adapters have no Plate owner until a product needs one (`docs/editor-test-harvester/prosekit/report.md:146`, 160).
