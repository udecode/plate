# View geometry

The ledger asks who measures selection, annotation and cursor rectangles for copied UI. The 2026-10-04 audit stopped because the 2026-09-12 Pursue landed in `e0c1500b95` (2026-09-15). The generic Widget target and store carrier is gone, and selection and keyed Yjs cursor owners feed one private exact-Editable range-geometry owner whose rectangles copied UI positions (`packages/plitejs/src/react/range-geometry.ts`, `packages/plitejs/src/react/hooks/use-selection-geometry.tsx`). The design is the [Plite view design plan](../2026-09-12-plite-view-design.md). `node tooling/scripts/review-ledger.mjs show geometry` prints the scope's history.

## Layer and owner

```text
canonical selection / annotation / node / keyed cursor
                  ↓
private measurement for the exact mounted Editable
                  ↓
immutable rectangles → copied floating or sidebar UI
```

| Responsibility | Decision |
| --- | --- |
| Logical data | Its owner: selection, annotation, node identity or the cursor cache. |
| Coordinates | The exact mounted Editable; measurement keeps exact-ref resolution, SSR and null targets, unmounted targets, multiline and collapsed selection, scrolling, keyed cursor locality, remount cleanup and hiding before first positioning. |
| Placement | Copied UI; Floating UI's popup resize observer and Plite's reference measurement watch different elements. |

Rejected, and why:

| Alternative | Why it lost |
| --- | --- |
| The public `Widget`, `WidgetTarget`, resolved-snapshot and `WidgetStore` protocol | A derived store between semantic data and measurement; selection wrapped a synthetic singleton Widget and Yjs re-labelled keyed cursors as `selection` targets. |
| Another public target registry or ViewManager | No independent job. |
| Replacing DOM measurement, global geometry state or merging all observers | Unjustified; the observers watch different elements. |

## What other editors do

Not compared in this scope; the [editor comparison](editor-comparison.md) holds the cross-editor reads.

## Main changes

- Selection geometry builds a private range-geometry owner with no Widget, and remote cursors read geometry per client.

## Open work

- The August logical-Widget scale result does not cover the direct-domain path; a matched current-versus-candidate count of targets, mounted views, unaffected subscribers and measurement work has not run since adoption. owner: Benchmark. stop: the next change to geometry machinery brings it.
